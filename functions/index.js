const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

// Initialize Firebase Admin
admin.initializeApp();

// IMPORTANT! Only hardcoded secret keys are working right now.

const STRIPE_SECRET_KEY = 'sk_test_51RlfjBKGi7kY2GqSYfSds6HOaydp3TwlM5Kvfa09ylq5g1e7Qu3R9pxySEW4ivEWOubR6UdlPvMD07PESGoyivqf00kEp6uAF2';
// Initialize Stripe
const stripe = Stripe(
  STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY ||
  'sk_test_51RlfjBKGi7kY2GqSYfSds6HOaydp3TwlM5Kvfa09ylq5g1e7Qu3R9pxsSEW4ivEWOubR6UdlPvMD07PESGoyivqf00kEp6uAF2'
);



// Radiance boost pricing
const RADIANCE_PRICING = {
  1: { price: 999, description: '1 Sacred Radiance Boost' },
  3: { price: 2697, description: '3 Sacred Radiance Boosts (Save 10%)' },
  5: { price: 3995, description: '5 Sacred Radiance Boosts (Save 20%)' }
};

// Test Stripe connection
exports.testStripe = functions.https.onCall(async (data, context) => {
  try {
    const customer = await stripe.customers.create({
      description: 'Test customer from Firebase Functions',
      metadata: { test: 'true' }
    });
    
    return {
      success: true,
      message: 'Stripe connection working!',
      customerId: customer.id
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
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

    // Create payment intent
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
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to create payment');
  }
});

// Confirm radiance payment and add boosts - FIXED VERSION
exports.confirmRadiancePayment = functions.https.onCall(async (data, context) => {
  try {
    console.log('🔍 Starting payment confirmation...', data);
    
    if (!context.auth) {
      console.log('❌ No authentication context');
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    console.log('✅ User authenticated:', context.auth.uid);
    const { paymentIntentId } = data;
    console.log('💳 Payment Intent ID:', paymentIntentId);

    if (!paymentIntentId) {
      console.log('❌ No payment intent ID provided');
      throw new functions.https.HttpsError('invalid-argument', 'Payment intent ID required');
    }

    console.log('🔍 Retrieving payment intent from Stripe...');
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('✅ Payment intent retrieved. Status:', paymentIntent.status);

    // Verify payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      console.log('❌ Payment not completed. Status:', paymentIntent.status);
      throw new functions.https.HttpsError('failed-precondition', 'Payment not completed');
    }

    // Verify this payment belongs to the authenticated user
    console.log('🔍 Verifying payment ownership...');
    console.log('Payment UID:', paymentIntent.metadata.firebaseUID);
    console.log('Current UID:', context.auth.uid);
    
    if (paymentIntent.metadata.firebaseUID !== context.auth.uid) {
      console.log('❌ UID mismatch');
      throw new functions.https.HttpsError('permission-denied', 'Payment does not belong to user');
    }

    const boostCount = parseInt(paymentIntent.metadata.boostCount);
    const amount = paymentIntent.amount;
    console.log('💰 Processing:', boostCount, 'boosts for $', amount / 100);

    // Create purchase record - FIXED: Use regular Date instead of serverTimestamp in array
    const purchase = {
      boostCount,
      totalPrice: amount / 100, // Convert cents to dollars
      purchaseDate: new Date(), // FIXED: Use regular Date object
      transactionId: `radiance_${Date.now()}_${context.auth.uid}`,
      stripePaymentIntentId: paymentIntentId,
      status: 'succeeded'
    };

    console.log('🔍 Updating user document in Firestore...');
    // Update user document with new boosts
    const userRef = admin.firestore().collection('users').doc(context.auth.uid);
    
    await admin.firestore().runTransaction(async (transaction) => {
      console.log('🔍 Getting user document...');
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        console.log('❌ User document not found for UID:', context.auth.uid);
        throw new Error('User not found');
      }

      console.log('✅ User document found');
      const currentData = userDoc.data();
      const currentBoosts = currentData.activeBoosts || 0;
      console.log('📊 Current boosts:', currentBoosts, '→ Adding:', boostCount);

      transaction.update(userRef, {
        activeBoosts: currentBoosts + boostCount,
        boostPurchases: admin.firestore.FieldValue.arrayUnion(purchase) // This will work now
      });
      
      console.log('✅ Firestore transaction completed');
    });

    console.log('🎉 Payment confirmation successful!');
    return {
      success: true,
      boostCount,
      totalPrice: amount / 100,
      transactionId: purchase.transactionId
    };

  } catch (error) {
    console.error('💥 Payment confirmation error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', `Failed to confirm payment: ${error.message}`);
  }
});

// Create subscription (placeholder for when you add subscription products)
exports.createSubscription = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    // This will work once you create products in Stripe Dashboard
    throw new functions.https.HttpsError('unimplemented', 'Subscriptions coming soon');

  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to create subscription');
  }
});

// Cancel subscription (placeholder)
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  throw new functions.https.HttpsError('unimplemented', 'Subscriptions coming soon');
});

// Get subscription status (placeholder)
exports.getSubscriptionStatus = functions.https.onCall(async (data, context) => {
  return { hasSubscription: false, status: null };
});