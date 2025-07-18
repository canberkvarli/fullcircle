const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import Stripe functions
const { 
  createSubscription, 
  cancelSubscription,
  getSubscriptionStatus 
} = require('./stripe/subscriptions');

const { 
  createRadiancePayment,
  confirmRadiancePayment 
} = require('./stripe/purchases');

const { handleStripeWebhook } = require('./stripe/webhooks');

// Export all functions
exports.createSubscription = createSubscription;
exports.cancelSubscription = cancelSubscription;
exports.getSubscriptionStatus = getSubscriptionStatus;
exports.createRadiancePayment = createRadiancePayment;
exports.confirmRadiancePayment = confirmRadiancePayment;
exports.stripeWebhook = handleStripeWebhook;