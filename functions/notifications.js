const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

exports.sendPushNotification = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, title, body, data: notificationData, type } = request.data;
  
  try {
    // Get user's document from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      throw new HttpsError('not-found', 'User not found');
    }
    
    // Check if user has push notifications enabled for this type
    const pushSettings = userData?.settings?.pushNotifications;
    
    if (!pushSettings || pushSettings.muteAll || !pushSettings.enableAll) {
      return { success: false, reason: 'Notifications disabled' };
    }
    
    // Check specific notification type
    let shouldSend = false;
    switch (type) {
      case 'newLikes':
        shouldSend = pushSettings.newLikes;
        break;
      case 'newMatches':
        shouldSend = pushSettings.newMatches;
        break;
      case 'newMessages':
        shouldSend = pushSettings.newMessages;
        break;
      case 'promotions':
        shouldSend = pushSettings.promotions;
        break;
      case 'announcements':
        shouldSend = pushSettings.announcements;
        break;
      default:
        shouldSend = true;
    }
    
    if (!shouldSend) {
      return { success: false, reason: 'Notification type disabled' };
    }
    
    // Get user's push token
    const pushToken = userData?.settings?.pushToken;
    if (!pushToken) {
      return { success: false, reason: 'No push token' };
    }
    
    // Send notification via Expo's push service
    const message = {
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: notificationData || {},
    };
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (response.ok) {
      console.log(`✅ Push notification sent successfully to user ${userId}: ${title}`);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to send push notification: ${response.status} - ${errorText}`);
      throw new Error(`Failed to send notification: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new HttpsError('internal', 'Failed to send notification');
  }
});

// Helper function to send notifications for common events
exports.sendLikeNotification = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { likedUserId, likerName, likerId } = request.data;
  
  try {
    // Create a mock request context for sendPushNotification
    const mockRequest = {
      auth: request.auth,
      data: {
        userId: likedUserId,
        title: 'New Heart of Appreciation 💖',
        body: `${likerName} appreciated your divine energy`,
        type: 'newLikes',
        data: {
          type: 'newLike',
          likerId: likerId,
          timestamp: Date.now(),
        }
      }
    };
    
    // Call sendPushNotification with the mock request
    const result = await exports.sendPushNotification(mockRequest);
    
    return result;
  } catch (error) {
    console.error('Error sending like notification:', error);
    throw error;
  }
});

exports.sendMatchNotification = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { matchedUserId, matchedName } = request.data;
  
  try {
    // Create a mock request context for sendPushNotification
    const mockRequest = {
      auth: request.auth,
      data: {
        userId: matchedUserId,
        title: 'Sacred Soul Connection ✨',
        body: `You and ${matchedName} are now connected!`,
        type: 'newMatches',
        data: {
          type: 'newMatch',
          matchedUserId: matchedUserId,
          timestamp: Date.now(),
        }
      }
    };
    
    // Call sendPushNotification with the mock request
    const result = await exports.sendPushNotification(mockRequest);
    
    return result;
  } catch (error) {
    console.error('Error sending match notification:', error);
    throw error;
  }
});

exports.sendMessageNotification = onCall({
  enforceAppCheck: false,
  region: 'us-central1'
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { recipientUserId, senderName, messagePreview } = request.data;
  
  try {
    // Create a mock request context for sendPushNotification
    const mockRequest = {
      auth: request.auth,
      data: {
        userId: recipientUserId,
        title: 'Divine Conversation 💫',
        body: `New message from ${senderName}: ${messagePreview}`,
        type: 'newMessages',
        data: {
          type: 'newMessage',
          senderName: senderName,
          messagePreview: messagePreview,
          timestamp: Date.now(),
        }
      }
    };
    
    // Call sendPushNotification with the mock request
    const result = await exports.sendPushNotification(mockRequest);
    
    return result;
  } catch (error) {
    console.error('Error sending message notification:', error);
    throw error;
  }
});
