const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { stripe, SUBSCRIPTION_PRICES } = require('./config');

const db = admin.firestore();

/**
 * Create a new subscription for FullCircle
 */
const createSubscription = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { planType } = data; // 'monthly' or 'yearly'
    const userId = context.auth.uid;

    console.log(`🚀 Creating ${planType} subscription for user: ${userId}`);

    // Validate plan type
    if (!SUBSCRIPTION_PRICES[planType]) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid plan type');
    }

    const priceId = SUBSCRIPTION_PRICES[planType].priceId;
    console.log(`💰 Using price ID: ${priceId}`);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    let customerId = userData.subscription?.stripeCustomerId || userData.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      console.log('👤 Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
        metadata: {
          firebaseUID: userId,
          fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`
        }
      });
      customerId = customer.id;
      console.log(`✅ Customer created: ${customerId}`);

      // Save customer ID to subscription object
      await db.collection('users').doc(userId).update({
        subscription: {
          ...(userData.subscription || {}),
          stripeCustomerId: customerId
        }
      });
    }

    // Create subscription
    console.log('📝 Creating subscription...');
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: priceId
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        firebaseUID: userId,
        planType: planType
      }
    });

    console.log(`✅ Subscription created: ${subscription.id}`);

    // Get client secret from payment intent
    let clientSecret = subscription.latest_invoice.payment_intent?.client_secret;

    // If no client secret, try to finalize the invoice
    if (!clientSecret) {
      console.log('🔄 Trying to finalize invoice...');
      try {
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(subscription.latest_invoice.id);
        console.log(`✅ Invoice finalized: ${finalizedInvoice.status}`);
        
        if (finalizedInvoice.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(finalizedInvoice.payment_intent);
          clientSecret = paymentIntent.client_secret;
        }
      } catch (finalizeError) {
        console.log(`⚠️ Could not finalize invoice: ${finalizeError.message}`);
        
        // Create a separate payment intent for the subscription amount
        console.log('🔄 Creating manual payment intent...');
        const paymentIntent = await stripe.paymentIntents.create({
          amount: SUBSCRIPTION_PRICES[planType].amount,
          currency: 'usd',
          customer: customerId,
          description: `FullCircle ${planType} subscription`,
          metadata: {
            firebaseUID: userId,
            subscriptionId: subscription.id,
            planType: planType,
            type: 'subscription_payment'
          },
          automatic_payment_methods: {
            enabled: true
          }
        });
        
        clientSecret = paymentIntent.client_secret;
        console.log('✅ Manual payment intent created');
      }
    }

    if (!clientSecret) {
      throw new Error('Could not obtain payment intent client secret');
    }

    console.log('✅ Valid payment intent client secret obtained');

    // Save subscription info to Firestore - ONLY use subscription object
    console.log('💾 Saving subscription to Firestore...');
    
    const currentSubscription = userData.subscription || {};
    
    await db.collection('users').doc(userId).update({
      subscription: {
        ...currentSubscription,
        subscriptionId: subscription.id,
        status: subscription.status,
        planType: planType,
        stripeCustomerId: customerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });
    console.log('✅ Subscription saved to Firestore');

    console.log('🎉 Subscription creation successful');

    return {
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
      status: subscription.status
    };

  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', `Subscription failed: ${error.message}`);
  }
});

/**
 * Get subscription status from Stripe and update Firestore
 */
const getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    console.log(`📊 Getting subscription status for user: ${userId}`);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    
    // 🔧 DEBUG: Log the actual userData structure
    console.log('🔍 Full user data structure:', JSON.stringify(userData, null, 2));
    console.log('🔍 userData.subscription:', userData.subscription);
    console.log('🔍 userData.subscription?.subscriptionId:', userData.subscription?.subscriptionId);
    
    const subscriptionId = userData.subscription?.subscriptionId;

    if (!subscriptionId) {
      console.log('❌ No subscription ID found');
      console.log('🔍 Available keys in userData:', Object.keys(userData));
      if (userData.subscription) {
        console.log('🔍 Available keys in subscription:', Object.keys(userData.subscription));
      }
      return {
        hasSubscription: false,
        isActive: false,
        status: 'none',
        planType: 'none',
        cancelAtPeriodEnd: false,
        daysRemaining: 0
      };
    }

    console.log(`🔍 Found subscription ID: ${subscriptionId}`);

    // Get latest subscription data from Stripe
    console.log(`🔍 Retrieving subscription from Stripe: ${subscriptionId}`);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'latest_invoice.payment_intent']
    });

    console.log(`📋 Stripe subscription status: ${subscription.status}`);

    // Handle period dates safely
    const currentPeriodEnd = subscription.current_period_end;
    const currentPeriodStart = subscription.current_period_start;
    
    if (currentPeriodEnd) {
      console.log(`📅 Current period end: ${new Date(currentPeriodEnd * 1000)}`);
    } else {
      console.log('📅 Current period end: Not set (subscription incomplete)');
    }

    // Safely determine if subscription is active
    const now = Math.floor(Date.now() / 1000);
    const isActive = subscription.status === 'active' && 
                    currentPeriodEnd && 
                    currentPeriodEnd > now;

    // 🔧 UPDATED: For incomplete subscriptions, check payment intent status
    let shouldShowAsActive = isActive;
    if (subscription.status === 'incomplete') {
      console.log('🔄 Subscription is incomplete, checking payment intent...');
      
      if (subscription.latest_invoice?.payment_intent) {
        const paymentIntentStatus = subscription.latest_invoice.payment_intent.status;
        console.log(`💳 Payment intent status: ${paymentIntentStatus}`);
        
        // If payment succeeded, treat as active even if subscription is still "incomplete"
        if (paymentIntentStatus === 'succeeded') {
          shouldShowAsActive = true;
          console.log('✅ Payment succeeded, treating as active');
        } else if (paymentIntentStatus === 'processing') {
          shouldShowAsActive = true; // Treat processing as active for UI
          console.log('⏳ Payment processing, treating as active for UI');
        } else {
          console.log(`⚠️ Payment status: ${paymentIntentStatus}, not treating as active`);
        }
      } else {
        // If no payment intent, treat incomplete as active (maybe payment method succeeded)
        shouldShowAsActive = true;
        console.log('✅ No payment intent found, treating incomplete as active');
      }
    }

    // Safely calculate days remaining
    let daysRemaining = 0;
    if (currentPeriodEnd && currentPeriodEnd > now) {
      daysRemaining = Math.max(0, Math.ceil((currentPeriodEnd - now) / (60 * 60 * 24)));
    }

    // Get plan type from subscription
    let planType = 'monthly'; // default
    if (subscription.items && subscription.items.data.length > 0) {
      const price = subscription.items.data[0].price;
      if (price.recurring) {
        planType = price.recurring.interval === 'year' ? 'yearly' : 'monthly';
      }
    }
    // Fallback to user data
    if (!planType && userData.subscription?.planType) {
      planType = userData.subscription.planType;
    }

    // Update Firestore with latest subscription data
    const subscriptionUpdate = {
      isActive: shouldShowAsActive, // 🔧 Use updated logic
      subscriptionId: subscription.id,
      status: subscription.status,
      planType: planType,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Only add periods if they exist and are valid
    if (currentPeriodStart && !isNaN(currentPeriodStart)) {
      subscriptionUpdate.currentPeriodStart = currentPeriodStart;
    }
    if (currentPeriodEnd && !isNaN(currentPeriodEnd)) {
      subscriptionUpdate.currentPeriodEnd = currentPeriodEnd;
    }

    // Preserve existing fields
    const currentSubscription = userData.subscription || {};
    if (currentSubscription.stripeCustomerId) {
      subscriptionUpdate.stripeCustomerId = currentSubscription.stripeCustomerId;
    }
    if (currentSubscription.createdAt) {
      subscriptionUpdate.createdAt = currentSubscription.createdAt;
    }
    if (currentSubscription.canceledAt) {
      subscriptionUpdate.canceledAt = currentSubscription.canceledAt;
    }

    await db.collection('users').doc(userId).update({
      subscription: subscriptionUpdate
    });
    console.log('✅ Firestore updated with subscription object');

    // Build response object
    const result = {
      hasSubscription: true,
      isActive: shouldShowAsActive, // 🔧 Use updated logic
      status: subscription.status,
      planType: planType,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      daysRemaining: daysRemaining,
      subscriptionId: subscriptionId
    };

    // Only include period fields if they have valid values
    if (currentPeriodEnd && !isNaN(currentPeriodEnd)) {
      result.currentPeriodEnd = currentPeriodEnd;
    }
    if (currentPeriodStart && !isNaN(currentPeriodStart)) {
      result.currentPeriodStart = currentPeriodStart;
    }
    if (currentSubscription.stripeCustomerId) {
      result.stripeCustomerId = currentSubscription.stripeCustomerId;
    }

    console.log('✅ Subscription status retrieved successfully:', result);
    return result;

  } catch (error) {
    console.error('❌ Error getting subscription status:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to get subscription status');
  }
});

/**
 * Cancel user's subscription
 */
const cancelSubscription = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    console.log(`🚫 Canceling subscription for user: ${userId}`);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const subscriptionId = userData.subscription?.subscriptionId;

    if (!subscriptionId) {
      throw new functions.https.HttpsError('not-found', 'No active subscription found');
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    console.log(`✅ Subscription will cancel at: ${new Date(subscription.cancel_at * 1000)}`);

    // Update Firestore - ONLY subscription object
    const currentSubscription = userData.subscription || {};
    
    await db.collection('users').doc(userId).update({
      subscription: {
        ...currentSubscription,
        status: subscription.status,
        cancelAtPeriodEnd: true,
        canceledAt: subscription.cancel_at,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    return {
      status: subscription.status,
      cancelAt: subscription.cancel_at
    };

  } catch (error) {
    console.error('❌ Error canceling subscription:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to cancel subscription');
  }
});

/**
 * Reactivate a canceled subscription
 */
const reactivateSubscription = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    console.log(`🔄 Reactivating subscription for user: ${userId}`);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const subscriptionId = userData.subscription?.subscriptionId;

    if (!subscriptionId) {
      throw new functions.https.HttpsError('not-found', 'No subscription found to reactivate');
    }

    console.log(`🔍 Reactivating subscription: ${subscriptionId}`);

    try {
      // Remove the cancellation from the subscription
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      console.log(`✅ Subscription reactivated: ${subscription.status}`);

      // Update Firestore - ONLY subscription object
      const currentSubscription = userData.subscription || {};
      
      const updateData = {
        subscription: {
          ...currentSubscription,
          status: subscription.status,
          cancelAtPeriodEnd: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      };

      // Remove canceledAt if it was set
      if (currentSubscription.canceledAt) {
        delete updateData.subscription.canceledAt;
      }

      await db.collection('users').doc(userId).update(updateData);

      return {
        success: true,
        status: subscription.status,
        message: 'Subscription reactivated successfully'
      };

    } catch (stripeError) {
      console.error('❌ Stripe error during reactivation:', stripeError);
      
      if (stripeError.code === 'resource_missing') {
        return {
          success: false,
          error: 'subscription_not_found',
          message: 'The subscription could not be found in Stripe'
        };
      }
      
      throw new functions.https.HttpsError('internal', `Failed to reactivate subscription: ${stripeError.message}`);
    }

  } catch (error) {
    console.error('❌ Error reactivating subscription:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to reactivate subscription');
  }
});

module.exports = {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  reactivateSubscription
};