const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { stripe } = require('./config');

const db = admin.firestore();

// Webhook endpoint secret - Set this in your Firebase Functions config
const endpointSecret = functions.config().stripe?.webhook_secret;

/**
 * Handle Stripe webhooks
 */
const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
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
        await handleSubscriptionPayment(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
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
  
  if (!userId) {
    console.error('No Firebase UID found in payment intent metadata');
    return;
  }

  console.log(`Payment succeeded for user ${userId}: ${paymentIntent.id}`);
}

/**
 * Handle successful subscription payment - ONLY use subscription object
 */
async function handleSubscriptionPayment(invoice) {
  const customerId = invoice.customer;
  
  try {
    // Get customer to find Firebase user
    const customer = await stripe.customers.retrieve(customerId);
    const userId = customer.metadata.firebaseUID;
    
    if (!userId) {
      console.error('No Firebase UID found in customer metadata');
      return;
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    await updateUserSubscriptionData(userId, subscription);

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

    // If subscription is active, update user data
    if (subscription.status === 'active') {
      await updateUserSubscriptionData(userId, subscription);
    }
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
 * HELPER: Update user subscription data consistently - ONLY use subscription object
 */
async function updateUserSubscriptionData(userId, subscription) {
  try {
    // Determine if subscription is active
    const now = Math.floor(Date.now() / 1000);
    const isActive = subscription.status === 'active' && 
                    subscription.current_period_end && 
                    subscription.current_period_end > now;

    // Get plan type
    let planType = 'yearly'; // default
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
      isActive: isActive,
      subscriptionId: subscription.id,
      status: subscription.status,
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

    // Update ONLY the subscription object
    const updateData = {
      subscription: subscriptionUpdate
    };

    await db.collection('users').doc(userId).update(updateData);
    
    console.log(`✅ User ${userId} subscription updated: ${subscription.status} (active: ${isActive})`);
  } catch (error) {
    console.error('Error updating user subscription data:', error);
    throw error;
  }
}

module.exports = {
  handleStripeWebhook
};