const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { stripe, RADIANCE_PRICING } = require('./config');

const db = admin.firestore();

/**
 * Create payment intent for Radiance boost purchase
 */
const createRadiancePayment = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { boostCount } = data;
    const userId = context.auth.uid;

    // Validate boost count
    if (!RADIANCE_PRICING[boostCount]) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid boost count');
    }

    // Get user data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const pricing = RADIANCE_PRICING[boostCount];

    // Create or get customer
    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          firebaseUID: userId,
          fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`
        }
      });
      customerId = customer.id;

      // Save customer ID
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: pricing.price,
      currency: 'usd',
      customer: customerId,
      description: pricing.description,
      metadata: {
        firebaseUID: userId,
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
    console.error('Error creating radiance payment:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to create payment');
  }
});

/**
 * Confirm radiance payment and add boosts to user account
 */
const confirmRadiancePayment = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { paymentIntentId } = data;
    const userId = context.auth.uid;

    if (!paymentIntentId) {
      throw new functions.https.HttpsError('invalid-argument', 'Payment intent ID required');
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      throw new functions.https.HttpsError('failed-precondition', 'Payment not completed');
    }

    // Verify this payment belongs to the authenticated user
    if (paymentIntent.metadata.firebaseUID !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'Payment does not belong to user');
    }

    const boostCount = parseInt(paymentIntent.metadata.boostCount);
    const amount = paymentIntent.amount;

    // Create purchase record
    const purchase = {
      boostCount,
      totalPrice: amount / 100, // Convert cents to dollars
      purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
      transactionId: `radiance_${Date.now()}_${userId}`,
      stripePaymentIntentId: paymentIntentId,
      status: 'succeeded'
    };

    // Update user document with new boosts
    const userRef = db.collection('users').doc(userId);
    
    await db.runTransaction(async (transaction) => {
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
    console.error('Error confirming radiance payment:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to confirm payment');
  }
});

module.exports = {
  createRadiancePayment,
  confirmRadiancePayment
};