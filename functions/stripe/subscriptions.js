// functions/stripe/subscriptions.js - Enhanced Version
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
    let customerId = userData.stripeCustomerId;

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

      // Save customer ID to user document
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId
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
    console.log(`📄 Latest invoice status: ${subscription.latest_invoice.status}`);
    console.log(`💳 Payment intent status: ${subscription.latest_invoice.payment_intent?.status}`);

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

    // Save subscription info to Firestore
    console.log('💾 Saving subscription to Firestore...');
    await db.collection('users').doc(userId).update({
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlanType: planType,
      subscriptionCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
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
   * Get subscription status - Fixed version to handle incomplete subscriptions and NaN values
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
      const subscriptionId = userData.subscriptionId || userData.subscription?.subscriptionId;

      if (!subscriptionId) {
        console.log('❌ No subscription ID found');
        return {
          hasSubscription: false,
          status: null,
          planType: null,
          currentPeriodEnd: null,
          currentPeriodStart: null,
          cancelAtPeriodEnd: false,
          periodStartDate: null,
          periodEndDate: null,
          canceledAt: null,
          daysRemaining: 0
        };
      }

      // Get latest subscription data from Stripe
      console.log(`🔍 Retrieving subscription from Stripe: ${subscriptionId}`);
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'latest_invoice.payment_intent']
      });

      console.log(`📋 Stripe subscription status: ${subscription.status}`);
      
      // 🔧 FIX: Handle dates safely to avoid NaN
      const currentPeriodEnd = subscription.current_period_end || null;
      const currentPeriodStart = subscription.current_period_start || null;
      const canceledAt = subscription.canceled_at || null;
      
      // Log dates safely
      if (currentPeriodEnd) {
        console.log(`📅 Current period end: ${new Date(currentPeriodEnd * 1000)}`);
      } else {
        console.log(`📅 Current period end: Not set (incomplete subscription)`);
      }

      // 🔧 FIX: Handle incomplete subscriptions properly
      let isActiveSubscription = false;
      let daysRemaining = 0;
      
      if (subscription.status === 'active' && currentPeriodEnd) {
        const now = Math.floor(Date.now() / 1000);
        isActiveSubscription = currentPeriodEnd > now;
        daysRemaining = Math.max(0, Math.ceil((currentPeriodEnd - now) / (60 * 60 * 24)));
      }

      // 🔧 FIX: Get plan type from subscription metadata or items
      let planType = userData.subscriptionPlanType || userData.subscription?.planType;
      
      if (!planType && subscription.items?.data?.[0]?.price?.recurring?.interval) {
        const interval = subscription.items.data[0].price.recurring.interval;
        planType = interval === 'year' ? 'yearly' : 'monthly';
      }

      // Check if we need to update the Firestore data
      const needsUpdate = 
        subscription.status !== userData.subscriptionStatus ||
        currentPeriodEnd !== userData.subscriptionPeriodEnd;

      if (needsUpdate) {
        console.log('🔄 Updating Firestore with latest subscription data');
        
        // 🔧 FIX: Build update object safely
        const updateData = {
          subscriptionStatus: subscription.status,
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Only add period end if it exists (not null/undefined)
        if (currentPeriodEnd) {
          updateData.subscriptionPeriodEnd = currentPeriodEnd;
        }
        
        // Add plan type if we determined it
        if (planType) {
          updateData.subscriptionPlanType = planType;
        }
        
        // Update subscription object if it exists
        if (userData.subscription) {
          updateData.subscription = {
            ...userData.subscription,
            isActive: isActiveSubscription,
            status: subscription.status,
            currentPeriodEnd: currentPeriodEnd,
            currentPeriodStart: currentPeriodStart,
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            canceledAt: canceledAt,
            planType: planType,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
        }
        
        await db.collection('users').doc(userId).update(updateData);
        console.log('✅ Firestore updated');
      }

      // 🔧 FIX: Return clean data with no NaN values
      const result = {
        hasSubscription: true,
        status: subscription.status,
        planType: planType,
        currentPeriodEnd: currentPeriodEnd, // Unix timestamp or null
        currentPeriodStart: currentPeriodStart, // Unix timestamp or null
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        // Additional helpful data
        daysRemaining: daysRemaining,
        periodStartDate: currentPeriodStart, // Keep for backward compatibility
        periodEndDate: currentPeriodEnd, // Keep for backward compatibility
        canceledAt: canceledAt,
        isActive: isActiveSubscription,
        subscriptionId: subscriptionId
      };

      console.log('✅ Subscription status retrieved successfully');
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
    const subscriptionId = userData.subscriptionId;

    if (!subscriptionId) {
      throw new functions.https.HttpsError('not-found', 'No active subscription found');
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    console.log(`✅ Subscription will cancel at: ${new Date(subscription.cancel_at * 1000)}`);

    // Update Firestore
    await db.collection('users').doc(userId).update({
      subscriptionStatus: subscription.status,
      subscriptionCancelAt: subscription.cancel_at,
      subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
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
      const subscriptionId = userData.subscriptionId;

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

        // Update Firestore
        const updateData = {
          subscriptionStatus: subscription.status,
          fullCircleSubscription: subscription.status === 'active',
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Remove cancel_at if it was set
        if (userData.subscriptionCancelAt) {
          updateData.subscriptionCancelAt = admin.firestore.FieldValue.delete();
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