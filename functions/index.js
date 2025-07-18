const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

// Initialize Firebase Admin
admin.initializeApp();

// Use environment variable - NO hardcoded secrets
const stripeSecretKey = functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment');
  throw new Error('Stripe secret key not configured');
}

console.log('🔑 Stripe key configured, length:', stripeSecretKey.length);
console.log('🔑 Key starts with:', stripeSecretKey.substring(0, 15));

// Initialize Stripe
const stripe = Stripe(stripeSecretKey);
console.log('✅ Stripe initialized');

// Subscription pricing
const SUBSCRIPTION_PRICES = {
  monthly: {
    priceId: 'price_1Rm1lLKGi7kY2GqSj70bU0aY',
    amount: 2999, // $29.99
    interval: 'month'
  },
  yearly: {
    priceId: 'price_1Rm1m7KGi7kY2GqSGkuW9y96',
    amount: 19999, // $199.99
    interval: 'year'
  }
};

// Radiance boost pricing
const RADIANCE_PRICING = {
  1: { price: 999, description: '1 Sacred Radiance Boost' },
  3: { price: 2697, description: '3 Sacred Radiance Boosts (Save 10%)' },
  5: { price: 3995, description: '5 Sacred Radiance Boosts (Save 20%)' }
};

// Test Stripe connection
exports.testStripe = functions.https.onCall(async (data, context) => {
  try {
    console.log('🧪 Testing Stripe connection...');
    const customer = await stripe.customers.create({
      description: 'Test customer from Firebase Functions',
      metadata: { test: 'true' }
    });
    
    console.log('✅ Stripe test successful:', customer.id);
    return {
      success: true,
      message: 'Stripe connection working!',
      customerId: customer.id
    };
  } catch (error) {
    console.error('❌ Stripe test failed:', error);
    return {
      success: false,
      error: error.message,
      type: error.type
    };
  }
});

// Test subscription creation
exports.testSubscriptionCreation = functions.https.onCall(async (data, context) => {
  try {
    console.log('🧪 Testing subscription creation...');
    
    // Test 1: Create a customer
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: { test: 'true' }
    });
    console.log('✅ Customer created:', customer.id);

    // Test 2: Try to create a subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: SUBSCRIPTION_PRICES.monthly.priceId
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    console.log('✅ Subscription created:', subscription.id);

    // Test 3: Clean up
    await stripe.subscriptions.del(subscription.id);
    await stripe.customers.del(customer.id);

    return {
      success: true,
      message: 'Subscription creation test passed!',
      customerId: customer.id,
      subscriptionId: subscription.id
    };

  } catch (error) {
    console.error('❌ Subscription test failed:', error);
    return {
      success: false,
      error: error.message,
      type: error.type,
      code: error.code
    };
  }
});

// Create radiance payment intent
exports.createRadiancePayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { boostCount } = data;
    
    if (!RADIANCE_PRICING[boostCount]) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid boost count');
    }

    const pricing = RADIANCE_PRICING[boostCount];

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pricing.price,
      currency: 'usd',
      description: pricing.description,
      metadata: {
        firebaseUID: context.auth.uid,
        boostCount: boostCount.toString(),
        type: 'radiance_boost'
      },
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: pricing.price,
      boostCount: boostCount
    };

  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to create payment');
  }
});

// Confirm radiance payment
exports.confirmRadiancePayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { paymentIntentId } = data;

    if (!paymentIntentId) {
      throw new functions.https.HttpsError('invalid-argument', 'Payment intent ID required');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new functions.https.HttpsError('failed-precondition', 'Payment not completed');
    }

    if (paymentIntent.metadata.firebaseUID !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Payment does not belong to user');
    }

    const boostCount = parseInt(paymentIntent.metadata.boostCount);
    const amount = paymentIntent.amount;

    const purchase = {
      boostCount,
      totalPrice: amount / 100,
      purchaseDate: new Date(),
      transactionId: `radiance_${Date.now()}_${context.auth.uid}`,
      stripePaymentIntentId: paymentIntentId,
      status: 'succeeded'
    };

    const userRef = admin.firestore().collection('users').doc(context.auth.uid);
    
    await admin.firestore().runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const currentData = userDoc.data();
      const currentBoosts = currentData.activeBoosts || 0;

      transaction.update(userRef, {
        activeBoosts: currentBoosts + boostCount,
        boostPurchases: admin.firestore.FieldValue.arrayUnion(purchase)
      });
    });

    return {
      success: true,
      boostCount,
      totalPrice: amount / 100,
      transactionId: purchase.transactionId
    };

  } catch (error) {
    console.error('❌ Payment confirmation failed:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to confirm payment');
  }
});

// CREATE SUBSCRIPTION
exports.createSubscription = functions.https.onCall(async (data, context) => {
  try {
    console.log('🚀 Creating subscription...');
    
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { planType } = data;
    const userId = context.auth.uid;

    if (!SUBSCRIPTION_PRICES[planType]) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid plan type');
    }

    const priceId = SUBSCRIPTION_PRICES[planType].priceId;

    // Get user data
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    let customerId = userData.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      console.log('Creating new customer...');
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          firebaseUID: userId,
          fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`
        }
      });
      customerId = customer.id;

      // Save customer ID
      await admin.firestore().collection('users').doc(userId).update({
        stripeCustomerId: customerId
      });
    }

    // Create subscription
    console.log('Creating subscription...');
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

    // Save subscription info
    await admin.firestore().collection('users').doc(userId).update({
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlanType: planType,
      subscriptionCreatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      status: subscription.status
    };

  } catch (error) {
    console.error('❌ Subscription creation failed:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', `Failed to create subscription: ${error.message}`);
  }
});