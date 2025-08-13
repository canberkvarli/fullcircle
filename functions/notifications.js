const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.sendPushNotification = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, title, body, data: notificationData, type } = data;
  
  try {
    // Get user's document from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'User not found');
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
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});

// Helper function to send notifications for common events
exports.sendLikeNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { likedUserId, likerName, likerId } = data;
  
  try {
    const result = await exports.sendPushNotification({
      userId: likedUserId,
      title: 'New Heart of Appreciation 💖',
      body: `${likerName} appreciated your divine energy`,
      type: 'newLikes',
      data: {
        type: 'newLike',
        likerId: likerId,
        timestamp: Date.now(),
      }
    }, context);
    
    return result;
  } catch (error) {
    console.error('Error sending like notification:', error);
    throw error;
  }
});

exports.sendMatchNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { matchedUserId, matchedName } = data;
  
  try {
    const result = await exports.sendPushNotification({
      userId: matchedUserId,
      title: 'Sacred Soul Connection ✨',
      body: `You and ${matchedName} are now connected!`,
      type: 'newMatches',
      data: {
        type: 'newMatch',
        matchedUserId: matchedUserId,
        timestamp: Date.now(),
      }
    }, context);
    
    return result;
  } catch (error) {
    console.error('Error sending match notification:', error);
    throw error;
  }
});

exports.sendMessageNotification = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { recipientUserId, senderName, messagePreview } = data;
  
  try {
    const result = await exports.sendPushNotification({
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
    }, context);
    
    return result;
  } catch (error) {
    console.error('Error sending message notification:', error);
    throw error;
  }
});
