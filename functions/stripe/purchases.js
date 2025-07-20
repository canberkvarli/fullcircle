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
      // Create new Stripe customer
      const customerEmail = userData.email || `user_${userId}@fullcircle.app`;
      const customerName = userData.fullName || 
                          (userData.firstName && userData.lastName) ? 
                          `${userData.firstName} ${userData.lastName}` :
                          `User ${userId}`;

      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          firebaseUID: userId,
          fullName: customerName
        }
      });
      
      customerId = customer.id;

      // Save customer ID to user document
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
      console.log('🔄 confirmRadiancePayment called with data:', data);
      
      if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
      }

      const { paymentIntentId } = data;
      const userId = context.auth.uid;

      console.log(`👤 User ID: ${userId}`);
      console.log(`💳 Payment Intent ID: ${paymentIntentId}`);

      if (!paymentIntentId) {
        throw new functions.https.HttpsError('invalid-argument', 'Payment intent ID required');
      }

      // Retrieve payment intent from Stripe
      console.log('🔍 Retrieving payment intent from Stripe...');
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log(`✅ Payment intent retrieved. Status: ${paymentIntent.status}`);

      // Verify payment succeeded
      if (paymentIntent.status !== 'succeeded') {
        console.error(`❌ Payment not completed. Status: ${paymentIntent.status}`);
        throw new functions.https.HttpsError('failed-precondition', `Payment not completed. Status: ${paymentIntent.status}`);
      }

      // Verify this payment belongs to the authenticated user
      if (paymentIntent.metadata.firebaseUID !== userId) {
        console.error(`❌ Payment belongs to different user`);
        throw new functions.https.HttpsError('permission-denied', 'Payment does not belong to user');
      }

      const boostCount = parseInt(paymentIntent.metadata.boostCount);
      const amount = paymentIntent.amount;

      console.log(`🎁 Processing ${boostCount} boosts for $${amount / 100}`);

      // 🔥 FIX: Create purchase record with regular Date instead of serverTimestamp
      const purchase = {
        boostCount,
        totalPrice: amount / 100, // Convert cents to dollars
        purchaseDate: new Date(), // ✅ Use regular Date instead of serverTimestamp()
        transactionId: `radiance_${Date.now()}_${userId}`,
        stripePaymentIntentId: paymentIntentId,
        status: 'succeeded'
      };

      console.log('📝 Purchase record:', purchase);

      // Update user document with new boosts
      const userRef = db.collection('users').doc(userId);
      
      console.log('🔄 Starting Firestore transaction...');
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          console.error('❌ User document not found');
          throw new Error('User not found');
        }

        const currentData = userDoc.data();
        const currentBoosts = currentData.activeBoosts || 0;

        console.log(`📊 Current boosts: ${currentBoosts}, Adding: ${boostCount}`);

        transaction.update(userRef, {
          activeBoosts: currentBoosts + boostCount,
          boostPurchases: admin.firestore.FieldValue.arrayUnion(purchase)
        });

        console.log('✅ Transaction prepared successfully');
      });

      console.log('✅ Firestore transaction completed');

      const response = {
        success: true,
        boostCount,
        totalPrice: amount / 100,
        transactionId: purchase.transactionId
      };

      console.log('🎉 Payment confirmation successful:', response);
      return response;

    } catch (error) {
      console.error('💥 Error confirming radiance payment:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError('internal', `Failed to confirm payment: ${error.message}`);
    }
  });

module.exports = {
  createRadiancePayment,
  confirmRadiancePayment
};