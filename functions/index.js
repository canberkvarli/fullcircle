// functions/index.js - Production Ready
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// 🔧 Load configuration early to ensure environment variables are available
const configLoader = require('./configLoader');

// Initialize Firebase Admin - in Cloud Functions, use the default service account
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

// Import Weekly Lotus functions
const { 
  assignWeeklyLotus,
  manualAssignWeeklyLotus,
  testWeeklyLotus,
  resetLotusForTesting
} = require('./weeklyLotus');

// Import notification functions
const { 
  sendPushNotification,
  sendLikeNotification,
  sendMatchNotification,
  sendMessageNotification
} = require('./notifications');

// Import test functions
const { 
  sendTestNotification,
  checkNotificationStatus
} = require('./testNotifications');

// Import selfie verification functions
const { 
  verifySelfie,
  getVerificationHistory
} = require('./selfieVerification');

// Import admin functions
const { 
  checkAdminAccess,
  getAdminUsers
} = require('./adminAccess');

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

// Export Weekly Lotus functions
exports.assignWeeklyLotus = assignWeeklyLotus;
exports.manualAssignWeeklyLotus = manualAssignWeeklyLotus;
exports.testWeeklyLotus = testWeeklyLotus;
exports.resetLotusForTesting = resetLotusForTesting;

// Export notification functions
exports.sendPushNotification = sendPushNotification;
exports.sendLikeNotification = sendLikeNotification;
exports.sendMatchNotification = sendMatchNotification;
exports.sendMessageNotification = sendMessageNotification;

// Export test functions
exports.sendTestNotification = sendTestNotification;
exports.checkNotificationStatus = checkNotificationStatus;

// Export selfie verification functions
exports.verifySelfie = verifySelfie;
exports.getVerificationHistory = getVerificationHistory;

// Export admin functions
exports.checkAdminAccess = checkAdminAccess;
exports.getAdminUsers = getAdminUsers;