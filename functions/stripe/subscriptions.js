const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { stripe, SUBSCRIPTION_PRICES } = require('./config');

const db = admin.firestore();

/**
 * Test Stripe connection
 */
const testStripeConnection = functions.https.onCall(async (data, context) => {
  try {
    console.log('=== TESTING STRIPE CONNECTION ===');
    
    // Test 1: List customers (simple API call)
    console.log('Testing basic Stripe API call...');
    const customers = await stripe.customers.list({ limit: 1 });
    console.log('SUCCESS: Stripe API call worked');
    console.log('Customers count:', customers.data.length);
    
    // Test 2: Check if price exists
    const priceId = SUBSCRIPTION_PRICES.yearly.priceId;
    console.log('Testing price retrieval for:', priceId);
    
    const price = await stripe.prices.retrieve(priceId);
    console.log('SUCCESS: Price found');
    console.log('Price details:', {
      id: price.id,
      amount: price.unit_amount,
      currency: price.currency,
      active: price.active
    });
    
    return {
      success: true,
      message: 'Stripe connection working',
      priceExists: true
    };
    
  } catch (error) {
    console.log('=== STRIPE CONNECTION FAILED ===');
    console.log('Error type:', error.type);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Status code:', error.statusCode);
    
    return {
      success: false,
      error: error.message,
      type: error.type,
      statusCode: error.statusCode
    };
  }
});

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

    console.log('=== SUBSCRIPTION CREATION START ===');
    console.log('User ID:', userId);
    console.log('Plan Type:', planType);

    // Validate plan type
    if (!SUBSCRIPTION_PRICES[planType]) {
      console.log('ERROR: Invalid plan type:', planType);
      throw new functions.https.HttpsError('invalid-argument', 'Invalid plan type');
    }

    const priceId = SUBSCRIPTION_PRICES[planType].priceId;
    console.log('Price ID to use:', priceId);

    // Get user data
    console.log('Fetching user data...');
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('ERROR: User not found:', userId);
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    console.log('User email:', userData.email);
    console.log('User name:', userData.fullName);

    let customerId = userData.stripeCustomerId;
    console.log('Existing customer ID:', customerId);

    // Create customer if doesn't exist
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      try {
        const customer = await stripe.customers.create({
          email: userData.email,
          metadata: {
            firebaseUID: userId,
            fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`
          }
        });
        customerId = customer.id;
        console.log('SUCCESS: Created customer:', customerId);

        // Save customer ID to user document
        await db.collection('users').doc(userId).update({
          stripeCustomerId: customerId
        });
        console.log('Saved customer ID to Firestore');
      } catch (customerError) {
        console.log('ERROR creating customer:', JSON.stringify(customerError, null, 2));
        throw customerError;
      }
    }

    // Create subscription
    console.log('Creating subscription...');
    console.log('Customer ID:', customerId);
    console.log('Price ID:', priceId);
    
    try {
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

      console.log('SUCCESS: Subscription created:', subscription.id);

      // Save subscription info to Firestore
      await db.collection('users').doc(userId).update({
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlanType: planType,
        subscriptionCreatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('=== SUBSCRIPTION CREATION SUCCESS ===');

      const response = {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      };
      
      console.log('Returning response:', response);
      
      return response;

    } catch (subscriptionError) {
      console.log('ERROR creating subscription:');
      console.log('Error type:', subscriptionError.type);
      console.log('Error message:', subscriptionError.message);
      console.log('Error code:', subscriptionError.code);
      console.log('Error param:', subscriptionError.param);
      console.log('Full error object:', JSON.stringify(subscriptionError, null, 2));
      throw subscriptionError;
    }

  } catch (error) {
    console.log('=== SUBSCRIPTION CREATION FAILED ===');
    console.log('Final error type:', typeof error);
    console.log('Final error message:', error.message);
    
    if (error.type) {
      console.log('Stripe error details:');
      console.log('- Type:', error.type);
      console.log('- Message:', error.message);
      console.log('- Code:', error.code);
      console.log('- Param:', error.param);
    }
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', `Subscription failed: ${error.message}`);
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
    console.error('Error canceling subscription:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to cancel subscription');
  }
});

/**
 * Get subscription status
 */
const getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const subscriptionId = userData.subscriptionId;

    if (!subscriptionId) {
      return {
        hasSubscription: false,
        status: null
      };
    }

    // Get latest subscription data from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update local data if status changed
    if (subscription.status !== userData.subscriptionStatus) {
      await db.collection('users').doc(userId).update({
        subscriptionStatus: subscription.status,
        subscriptionPeriodEnd: subscription.current_period_end,
        fullCircleSubscription: subscription.status === 'active',
        subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    return {
      hasSubscription: true,
      status: subscription.status,
      planType: userData.subscriptionPlanType,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    };

  } catch (error) {
    console.error('Error getting subscription status:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to get subscription status');
  }
});

module.exports = {
  createSubscription,
  cancelSubscription,
  getSubscriptionStatus,
  testStripeConnection
};