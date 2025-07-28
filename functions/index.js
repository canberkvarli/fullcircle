// functions/index.js - Production Ready
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import Stripe functions
const { 
  createSubscription, 
  cancelSubscription,
  getSubscriptionStatus,
  reactivateSubscription
} = require('./stripe/subscriptions');

const { 
  createRadiancePayment,
  confirmRadiancePayment,
  createLotusPayment,
  confirmLotusPayment  
} = require('./stripe/purchases');

const { stripeWebhook } = require('./stripe/webhooks');

// Export all functions
exports.createSubscription = createSubscription;
exports.cancelSubscription = cancelSubscription;
exports.getSubscriptionStatus = getSubscriptionStatus;
exports.reactivateSubscription = reactivateSubscription;
exports.createRadiancePayment = createRadiancePayment;
exports.confirmRadiancePayment = confirmRadiancePayment;
exports.createLotusPayment = createLotusPayment;
exports.confirmLotusPayment = confirmLotusPayment; 
exports.stripeWebhook = stripeWebhook;