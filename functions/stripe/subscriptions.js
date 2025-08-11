const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { stripe, SUBSCRIPTION_PRICES } = require('./config');

const db = admin.firestore();

/**
 * Create a new subscription for FullCircle
 */
const createSubscription = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  try {
    // Verify user is authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { planType } = request.data; // Now supports: 'monthly', 'yearly', '1month', '3months', '6months'
    const userId = request.auth.uid;

    console.log(`Creating ${planType} subscription for user: ${userId}`);

    // Validate plan type
    if (!SUBSCRIPTION_PRICES[planType]) {
      throw new HttpsError('invalid-argument', 'Invalid plan type');
    }

    const priceId = SUBSCRIPTION_PRICES[planType].priceId;
    console.log(`💰 Using price ID: ${priceId}`);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    let customerId = userData.subscription?.stripeCustomerId || userData.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      console.log('👤 Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.fullName || `${userData.firstName} ${userData.familyName}`,
        metadata: {
          firebaseUID: userId,
          fullName: userData.fullName || `${userData.firstName} ${userData.familyName}`
        }
      });
      customerId = customer.id;
      console.log(`Customer created: ${customerId}`);

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
    
    // Build subscription create params
    const subscriptionParams = {
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
    };

    // Add billing cycle anchor for multi-month subscriptions
    const priceConfig = SUBSCRIPTION_PRICES[planType];
    if (priceConfig.interval_count && priceConfig.interval_count > 1) {
      // For 3-month and 6-month plans, set billing cycle
      subscriptionParams.billing_cycle_anchor = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // Start in 30 days
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    console.log(`Subscription created: ${subscription.id}`);

    // ✅ EXTRACT PERIOD DATA - This is what was missing!
    let currentPeriodStart = subscription.current_period_start;
    let currentPeriodEnd = subscription.current_period_end;

    // If subscription doesn't have period data (incomplete), get it from invoice
    if (!currentPeriodStart || !currentPeriodEnd) {
      console.log('Extracting period data from invoice...');
      try {
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice.id, {
          expand: ['lines.data']
        });
        
        if (invoice.lines && invoice.lines.data.length > 0) {
          const lineItem = invoice.lines.data[0];
          if (lineItem.period) {
            currentPeriodStart = lineItem.period.start;
            currentPeriodEnd = lineItem.period.end;
            console.log(`Found period data in invoice: start=${currentPeriodStart}, end=${currentPeriodEnd}`);
          }
        }
      } catch (invoiceError) {
        console.log(`⚠️ Could not extract period from invoice: ${invoiceError.message}`);
      }
    }

    // Get client secret from payment intent
    let clientSecret = subscription.latest_invoice.payment_intent?.client_secret;

    // If no client secret, try to finalize the invoice
    if (!clientSecret) {
      console.log('Trying to finalize invoice...');
      try {
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(subscription.latest_invoice.id);
        console.log(`Invoice finalized: ${finalizedInvoice.status}`);
        
        if (finalizedInvoice.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(finalizedInvoice.payment_intent);
          clientSecret = paymentIntent.client_secret;
        }
      } catch (finalizeError) {
        console.log(`⚠️ Could not finalize invoice: ${finalizeError.message}`);
        
        // Create a separate payment intent for the subscription amount
        console.log('Creating manual payment intent...');
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
        console.log('Manual payment intent created');
      }
    }

    if (!clientSecret) {
      throw new Error('Could not obtain payment intent client secret');
    }

    console.log('Valid payment intent client secret obtained');

    // ✅ SAVE SUBSCRIPTION WITH PERIOD DATA
    console.log('💾 Saving subscription to Firestore...');
    
    const currentSubscription = userData.subscription || {};
    
    const subscriptionData = {
      ...currentSubscription,
      subscriptionId: subscription.id,
      status: subscription.status,
      planType: planType,
      stripeCustomerId: customerId,
      isActive: false, // Will be set to true by webhook when payment succeeds
      cancelAtPeriodEnd: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // ✅ ADD PERIOD DATA IF AVAILABLE
    if (currentPeriodStart && !isNaN(currentPeriodStart)) {
      subscriptionData.currentPeriodStart = currentPeriodStart;
      console.log(`📅 Added period start: ${new Date(currentPeriodStart * 1000)}`);
    }
    if (currentPeriodEnd && !isNaN(currentPeriodEnd)) {
      subscriptionData.currentPeriodEnd = currentPeriodEnd;
      console.log(`📅 Added period end: ${new Date(currentPeriodEnd * 1000)}`);
    }

    await db.collection('users').doc(userId).update({
      subscription: subscriptionData
    });
    
    console.log('Subscription saved to Firestore with period data');
    console.log('🎉 Subscription creation successful');

    return {
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
      status: subscription.status
    };

  } catch (error) {
    console.error('❌ Error creating subscription:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', `Subscription failed: ${error.message}`);
  }
});

/**
 * Get subscription status from Stripe and update Firestore
 */
const getSubscriptionStatus = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;
    console.log(`📊 Getting subscription status for user: ${userId}`);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const subscriptionId = userData.subscription?.subscriptionId;

    if (!subscriptionId) {
      console.log('❌ No subscription ID found');
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
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice', 'latest_invoice.payment_intent']
    });

    console.log(`📋 Stripe subscription status: ${subscription.status}`);

    // ✅ KEY FIX: Check if we recently processed a successful payment
    const currentSubscription = userData.subscription || {};
    const lastUpdated = currentSubscription.updatedAt;
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    // If webhook recently updated to "active" within last 5 minutes, trust it
    let shouldUseWebhookStatus = false;
    if (lastUpdated && currentSubscription.status === 'active') {
      const lastUpdatedDate = lastUpdated.toDate ? lastUpdated.toDate() : new Date(lastUpdated);
      if (lastUpdatedDate > fiveMinutesAgo) {
        shouldUseWebhookStatus = true;
        console.log('🎯 Recent webhook update detected, trusting webhook status over Stripe');
      }
    }

    // Determine active status
    const currentPeriodEnd = subscription.current_period_end;
    const currentPeriodStart = subscription.current_period_start;
    const nowUnix = Math.floor(Date.now() / 1000);
    
    let isActive = false;
    let finalStatus = subscription.status;
    
    if (shouldUseWebhookStatus) {
      // Trust the webhook's determination
      isActive = currentSubscription.isActive;
      finalStatus = currentSubscription.status;
      console.log('✅ Using webhook status: active =', isActive, 'status =', finalStatus);
    } else {
      // Use normal logic
      isActive = subscription.status === 'active' && 
                currentPeriodEnd && 
                currentPeriodEnd > nowUnix;
      
      // Check for incomplete with successful payment
      if (subscription.status === 'incomplete' && subscription.latest_invoice?.payment_intent) {
        const paymentIntentStatus = subscription.latest_invoice.payment_intent.status;
        if (paymentIntentStatus === 'succeeded') {
          isActive = true;
          finalStatus = 'active';
          console.log('✅ Payment succeeded for incomplete subscription, treating as active');
        }
      }
    }

    // Calculate days remaining
    let daysRemaining = 0;
    if (currentPeriodEnd && currentPeriodEnd > nowUnix) {
      daysRemaining = Math.max(0, Math.ceil((currentPeriodEnd - nowUnix) / (60 * 60 * 24)));
    }

    // Get plan type
    let planType = 'monthly';
    if (subscription.items && subscription.items.data.length > 0) {
      const price = subscription.items.data[0].price;
      if (price.recurring) {
        planType = price.recurring.interval === 'year' ? 'yearly' : 'monthly';
      }
    }

    // Only update Firestore if we're not using recent webhook data
    if (!shouldUseWebhookStatus) {
      const subscriptionUpdate = {
        isActive: isActive,
        subscriptionId: subscription.id,
        status: finalStatus,
        planType: planType,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Add periods if they exist
      if (currentPeriodStart && !isNaN(currentPeriodStart)) {
        subscriptionUpdate.currentPeriodStart = currentPeriodStart;
      }
      if (currentPeriodEnd && !isNaN(currentPeriodEnd)) {
        subscriptionUpdate.currentPeriodEnd = currentPeriodEnd;
      }

      // Preserve existing fields
      if (currentSubscription.stripeCustomerId) {
        subscriptionUpdate.stripeCustomerId = currentSubscription.stripeCustomerId;
      }
      if (currentSubscription.createdAt) {
        subscriptionUpdate.createdAt = currentSubscription.createdAt;
      }

      await db.collection('users').doc(userId).update({
        subscription: subscriptionUpdate
      });
      console.log('✅ Firestore updated with fresh Stripe data');
    } else {
      console.log('⏭️ Skipping Firestore update, using recent webhook data');
    }

    // Build response
    const result = {
      hasSubscription: true,
      isActive: isActive,
      status: finalStatus,
      planType: planType,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      daysRemaining: daysRemaining,
      subscriptionId: subscriptionId
    };

    // Add period fields if they exist
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
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to get subscription status');
  }
});

/**
 * Cancel user's subscription
 */
  const cancelSubscription = onCall({
    enforceAppCheck: false,
    region: 'us-central1'
  }, async (request) => {
    try {
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'User must be authenticated');
      }

      const userId = request.auth.uid;
      console.log(`🚫 Canceling subscription for user: ${userId}`);

      // Get user data
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User not found');
      }

      const userData = userDoc.data();
      const subscriptionId = userData.subscription?.subscriptionId;

      if (!subscriptionId) {
        throw new HttpsError('not-found', 'No active subscription found');
      }

      // Cancel subscription at period end
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      console.log(`✅ Subscription will cancel at: ${new Date(subscription.cancel_at * 1000)}`);

      // ✅ FIXED: Preserve all existing data, only update cancellation fields
      const currentSubscription = userData.subscription || {};
      
      await db.collection('users').doc(userId).update({
        subscription: {
          ...currentSubscription, // ✅ Preserve ALL existing fields including status and isActive
          cancelAtPeriodEnd: true,
          canceledAt: subscription.cancel_at,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
          // ✅ DON'T override status or isActive - keep them as they were
        }
      });
      
      console.log('✅ Subscription canceled - preserved existing status and isActive');

      return {
        success: true,
        status: currentSubscription.status, // Return the preserved status
        cancelAt: subscription.cancel_at
      };

    } catch (error) {
      console.error('❌ Error canceling subscription:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Failed to cancel subscription');
    }
  });

/**
 * Reactivate a canceled subscription
 */
const reactivateSubscription = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  try {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = request.auth.uid;
    console.log(`🔄 Reactivating subscription for user: ${userId}`);

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const currentSubscription = userData.subscription || {};
    const subscriptionId = currentSubscription.subscriptionId;

    if (!subscriptionId) {
      throw new HttpsError('not-found', 'No subscription found to reactivate');
    }

    console.log(`🔍 Current subscription state:`, {
      status: currentSubscription.status,
      isActive: currentSubscription.isActive,
      cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd
    });

    try {
      // Get current subscription status from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'latest_invoice.payment_intent']
      });

      console.log(`📊 Stripe subscription status: ${subscription.status}`);
      console.log(`📊 Cancel at period end: ${subscription.cancel_at_period_end}`);

      // ✅ UNIVERSAL APPROACH: Handle any state by checking what needs to be done
      
      let needsPayment = false;
      let clientSecret = null;
      
      // Check if payment is needed regardless of status
      if (subscription.latest_invoice && subscription.latest_invoice.payment_intent) {
        const paymentIntent = subscription.latest_invoice.payment_intent;
        console.log(`💳 Payment intent status: ${paymentIntent.status}`);
        
        if (paymentIntent.status === 'requires_payment_method' || 
            paymentIntent.status === 'requires_confirmation' ||
            paymentIntent.status === 'requires_action') {
          needsPayment = true;
          clientSecret = paymentIntent.client_secret;
        }
      }

      // ✅ If payment is needed, return payment info
      if (needsPayment && clientSecret) {
        // First, remove the cancellation
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false
        });
        
        console.log('🔄 Removed cancellation, payment required for activation');
        
        return {
          success: false,
          needsPayment: true,
          clientSecret: clientSecret,
          message: 'Payment required to complete subscription activation',
          subscriptionId: subscription.id
        };
      }

      // ✅ No payment needed - just remove cancellation and activate
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      console.log(`✅ Removed cancellation from subscription`);

      // ✅ Update Firestore - restore to active state
      const updateData = {
        ...currentSubscription,
        cancelAtPeriodEnd: false,
        isActive: true, // ✅ Always set to active when reactivating
        status: 'active', // ✅ Set status to active
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Remove canceledAt if it was set
      if (updateData.canceledAt) {
        delete updateData.canceledAt;
      }

      await db.collection('users').doc(userId).update({
        subscription: updateData
      });

      console.log('✅ Subscription reactivated successfully');

      return {
        success: true,
        status: 'active',
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
      
      throw new HttpsError('internal', `Failed to reactivate subscription: ${stripeError.message}`);
    }

  } catch (error) {
    console.error('❌ Error reactivating subscription:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to reactivate subscription');
  }
});

module.exports = {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  reactivateSubscription
};