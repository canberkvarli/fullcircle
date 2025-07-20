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

  // For radiance boosts, the confirmation is handled in the client app
  // This webhook can be used for additional processing like analytics
  console.log(`Payment succeeded for user ${userId}: ${paymentIntent.id}`);
}

/**
 * Handle successful subscription payment
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

    // Update user's subscription status
    await db.collection('users').doc(userId).update({
      subscriptionStatus: 'active',
      fullCircleSubscription: true,
      lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
      subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Subscription payment succeeded for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription payment:', error);
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

    // Update user's subscription status
    await db.collection('users').doc(userId).update({
      subscriptionStatus: subscription.status,
      subscriptionPeriodEnd: subscription.current_period_end,
      fullCircleSubscription: subscription.status === 'active',
      subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
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

    // Update user's subscription status
    await db.collection('users').doc(userId).update({
      subscriptionStatus: 'canceled',
      fullCircleSubscription: false,
      subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Subscription canceled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

module.exports = {
  handleStripeWebhook
};