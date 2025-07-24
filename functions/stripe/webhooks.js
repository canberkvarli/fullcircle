const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { stripe } = require('./config');

const db = admin.firestore();

// Webhook endpoint secret - Set this in your Firebase Functions config
const endpointSecret = functions.config().stripe?.webhook_secret;

/**
 * Handle Stripe webhooks
 */
const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        console.log('🎉 Invoice payment succeeded - updating subscription status');
        await handleSubscriptionPayment(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        console.log('🔄 Subscription updated via webhook');
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        console.log('❌ Subscription deleted via webhook');
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        console.log('🆕 Subscription created via webhook');
        await handleSubscriptionCreated(event.data.object);
        break;

      // ✅ NEW: Handle invoice.payment_failed for failed renewals
      case 'invoice.payment_failed':
        console.log('💥 Invoice payment failed');
        await handleSubscriptionPaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
});

/**
 * Handle successful payment intent (for one-time payments like radiance boosts)
 */

async function handlePaymentSucceeded(paymentIntent) {
  const userId = paymentIntent.metadata.firebaseUID;
  
  console.log('🔍 WEBHOOK DEBUG - Payment succeeded:', {
    paymentIntentId: paymentIntent.id,
    userId: userId,
    metadata: paymentIntent.metadata,
    amount: paymentIntent.amount,
    status: paymentIntent.status
  });
  
  if (!userId) {
    console.error('No Firebase UID found in payment intent metadata');
    return;
  }

  console.log(`Payment succeeded for user ${userId}: ${paymentIntent.id}`);
  
  // Handle radiance boost purchases
  if (paymentIntent.metadata.type === 'radiance_boost') {
    console.log('🔮 Processing radiance boost purchase');
    const boostCount = parseInt(paymentIntent.metadata.boostCount || '0');
    if (boostCount > 0) {
      await handleRadiancePurchase(userId, boostCount, paymentIntent);
    }
  }
  
  // Handle subscription payments (manual payment intents)
  if (paymentIntent.metadata.type === 'subscription_payment' && paymentIntent.metadata.subscriptionId) {
    console.log('🎉 WEBHOOK DEBUG - Processing manual subscription payment!');
    console.log('🔍 Subscription ID from metadata:', paymentIntent.metadata.subscriptionId);
    
    try {
      const subscriptionId = paymentIntent.metadata.subscriptionId;
      console.log('🔍 Retrieving subscription from Stripe...');
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      console.log(`📊 WEBHOOK DEBUG - Subscription status before update: ${subscription.status}`);
      console.log('🔍 Subscription details:', JSON.stringify({
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end
      }, null, 2));
      
      // Force update to active since payment succeeded
      console.log('🚀 WEBHOOK DEBUG - Calling updateUserSubscriptionData with forceActive=true');
      await updateUserSubscriptionData(userId, subscription, true);
      
      console.log(`✅ WEBHOOK DEBUG - Manual subscription payment processed successfully for user ${userId}`);
      
      // ✅ ADD THIS DEBUG CODE HERE:
      console.log('🔍 WEBHOOK DEBUG - Verifying update worked...');
      const userDoc = await db.collection('users').doc(userId).get();
      const updatedUserData = userDoc.data();
      console.log('🔍 WEBHOOK DEBUG - Updated subscription in Firestore:', JSON.stringify(updatedUserData.subscription, null, 2));
      
    } catch (error) {
      console.error('❌ WEBHOOK DEBUG - Error handling manual subscription payment:', error);
      console.error('❌ WEBHOOK DEBUG - Full error stack:', error.stack);
    }
  } else {
    console.log('🔍 WEBHOOK DEBUG - Not a subscription payment, metadata:', paymentIntent.metadata);
  }
}

/**
 * ✅ FIXED: Handle successful subscription payment - ONLY use subscription object
 */
async function handleSubscriptionPayment(invoice) {
  const customerId = invoice.customer;
  
  try {
    console.log(`📋 Processing subscription payment for customer: ${customerId}`);
    
    // Get customer to find Firebase user
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata.firebaseUID;
    
    if (!userId) {
      console.error('No Firebase UID found in customer metadata');
      return;
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    console.log(`📊 Subscription status from Stripe: ${subscription.status}`);
    
    // ✅ KEY FIX: Force update to active when payment succeeds
    await updateUserSubscriptionData(userId, subscription, true); // Force active

    console.log(`✅ Subscription payment succeeded for user ${userId} - Status: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription payment:', error);
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;
  
  try {
    // Get customer to find Firebase user
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata.firebaseUID;
    
    if (!userId) {
      console.error('No Firebase UID found in customer metadata');
      return;
    }

    console.log(`🆕 Subscription created for user ${userId}: ${subscription.id} (status: ${subscription.status})`);

    // Update user data regardless of status
    await updateUserSubscriptionData(userId, subscription);
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;
  
  try {
    // Get customer to find Firebase user
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata.firebaseUID;
    
    if (!userId) {
      console.error('No Firebase UID found in customer metadata');
      return;
    }

    console.log(`🔄 Subscription updated for user ${userId}: ${subscription.status}`);
    
    await updateUserSubscriptionData(userId, subscription);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;
  
  try {
    // Get customer to find Firebase user
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata.firebaseUID;
    
    if (!userId) {
      console.error('No Firebase UID found in customer metadata');
      return;
    }

    // Get current user data to preserve existing subscription info
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const currentSubscription = userData.subscription || {};

    // Update ONLY the subscription object with canceled status
    const updateData = {
      subscription: {
        ...currentSubscription,
        isActive: false,
        status: 'canceled',
        cancelAtPeriodEnd: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    await db.collection('users').doc(userId).update(updateData);

    console.log(`❌ Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

/**
 * ✅ NEW: Handle failed subscription payments
 */
async function handleSubscriptionPaymentFailed(invoice) {
  const customerId = invoice.customer;
  
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata.firebaseUID;
    
    if (!userId) {
      console.error('No Firebase UID found in customer metadata');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    console.log(`💥 Payment failed for user ${userId} - subscription status: ${subscription.status}`);
    
    // Update subscription status to reflect payment failure
    await updateUserSubscriptionData(userId, subscription);
  } catch (error) {
    console.error('Error handling subscription payment failure:', error);
  }
}

/**
 * ✅ FIXED: Update user subscription data consistently - ONLY use subscription object
 */
async function updateUserSubscriptionData(userId, subscription, forceActive = false) {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // ✅ KEY FIX: Determine if subscription should be active
    let isActive = false;
    
    if (forceActive) {
      // When called from invoice.payment_succeeded, force active regardless of Stripe status
      isActive = true;
      console.log('🔥 Forcing subscription to active due to successful payment');
    } else {
      // Normal logic: active if status is active and period hasn't ended
      isActive = subscription.status === 'active' && 
                subscription.current_period_end && 
                subscription.current_period_end > now;
    }

    // ✅ SPECIAL CASE: If status is incomplete but we have a successful payment, treat as active
    if (subscription.status === 'incomplete' && forceActive) {
      console.log('🎯 Converting incomplete subscription to active due to successful payment');
      isActive = true;
    }

    // Get plan type
    let planType = 'monthly'; // default
    if (subscription.items && subscription.items.data.length > 0) {
      const price = subscription.items.data[0].price;
      if (price.recurring) {
        planType = price.recurring.interval === 'year' ? 'yearly' : 'monthly';
      }
    }

    // Get current user data to preserve other subscription fields
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const currentSubscription = userData.subscription || {};

    // Build the subscription object update
    const subscriptionUpdate = {
      isActive: isActive, // ✅ Use our improved logic
      subscriptionId: subscription.id,
      status: forceActive && subscription.status === 'incomplete' ? 'active' : subscription.status, // ✅ Override incomplete status
      planType: planType,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add periods if they exist
    if (subscription.current_period_start) {
      subscriptionUpdate.currentPeriodStart = subscription.current_period_start;
    }
    if (subscription.current_period_end) {
      subscriptionUpdate.currentPeriodEnd = subscription.current_period_end;
    }

    // Preserve stripeCustomerId if it exists
    if (currentSubscription.stripeCustomerId) {
      subscriptionUpdate.stripeCustomerId = currentSubscription.stripeCustomerId;
    }

    // Preserve createdAt if it exists, otherwise set it
    if (currentSubscription.createdAt) {
      subscriptionUpdate.createdAt = currentSubscription.createdAt;
    } else {
      subscriptionUpdate.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // ✅ FIXED: Handle canceledAt properly - don't use FieldValue.delete() in nested object
    if (subscription.cancel_at_period_end && subscription.cancel_at) {
      subscriptionUpdate.canceledAt = subscription.cancel_at;
    }
    // Don't add canceledAt field if subscription is not being canceled

    // ✅ CRITICAL FIX: Handle deletion of canceledAt separately if needed
    const updateData = {
      subscription: subscriptionUpdate
    };

    // If we need to remove canceledAt, do it at the top level
    if (!subscription.cancel_at_period_end && currentSubscription.canceledAt) {
      updateData['subscription.canceledAt'] = admin.firestore.FieldValue.delete();
    }

    await db.collection('users').doc(userId).update(updateData);
    
    console.log(`✅ User ${userId} subscription updated: ${subscriptionUpdate.status} (active: ${isActive})`);
    console.log(`📊 Subscription data:`, JSON.stringify(subscriptionUpdate, null, 2));
  } catch (error) {
    console.error('Error updating user subscription data:', error);
    throw error;
  }
}

/**
 * ✅ NEW: Handle radiance boost purchases
 */
async function handleRadiancePurchase(userId, boostCount, paymentIntent) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    const purchase = {
      boostCount: boostCount,
      totalPrice: paymentIntent.amount / 100, // Convert from cents
      purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
      transactionId: paymentIntent.id,
      stripePaymentIntentId: paymentIntent.id,
      status: 'succeeded'
    };

    const updateData = {
      activeBoosts: (userData.activeBoosts || 0) + boostCount,
      boostPurchases: admin.firestore.FieldValue.arrayUnion(purchase)
    };

    await db.collection('users').doc(userId).update(updateData);
    
    console.log(`✅ Added ${boostCount} radiance boosts to user ${userId}`);
  } catch (error) {
    console.error('Error handling radiance purchase:', error);
  }
}

module.exports = {
  stripeWebhook
};