const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Test function to send a push notification to yourself
 * This is useful for testing if notifications are working
 */
exports.sendTestNotification = functions.https.onCall({
  enforceAppCheck: false
}, async (data, context) => {
  // Debug logging
  console.log('🔍 Function called with context:', {
    hasAuth: !!context.auth,
    authUid: context.auth?.uid,
    contextKeys: Object.keys(context),
    data: data
  });
  
  // Verify user is authenticated
  if (!context.auth) {
    console.log('❌ No auth context found');
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { message = 'Test notification from FullCircle! 🧪' } = data;
  
  try {
    console.log(`🧪 Sending test notification to user: ${userId}`);
    
    // Get user's document from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    // Get user's push token
    const pushToken = userData?.settings?.pushToken;
    if (!pushToken) {
      return { 
        success: false, 
        reason: 'No push token found. Make sure you have granted notification permissions in the app.',
        userId,
        hasSettings: !!userData.settings,
        hasPushNotifications: !!userData.settings?.pushNotifications
      };
    }
    
    // Check if user has push notifications enabled
    const pushSettings = userData?.settings?.pushNotifications;
    if (!pushSettings || pushSettings.muteAll || !pushSettings.enableAll) {
      return { 
        success: false, 
        reason: 'Push notifications are disabled in your settings',
        userId,
        pushSettings
      };
    }
    
    // Send test notification via Expo's push service
    const notificationMessage = {
      to: pushToken,
      sound: 'default',
      title: '🧪 Test Notification',
      body: message,
      data: {
        type: 'test',
        timestamp: Date.now(),
        userId: userId
      },
    };
    
    console.log('📤 Sending test notification via Expo:', {
      to: pushToken,
      title: notificationMessage.title,
      body: notificationMessage.body
    });
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationMessage),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test notification sent successfully:', result);
      
      return { 
        success: true, 
        message: 'Test notification sent successfully!',
        expoResponse: result,
        userId,
        pushToken: pushToken.substring(0, 20) + '...', // Only show first 20 chars for security
        timestamp: new Date().toISOString()
      };
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to send test notification: ${response.status} - ${errorText}`);
      
      return { 
        success: false, 
        reason: `Failed to send notification: ${response.status}`,
        error: errorText,
        userId,
        status: response.status
      };
    }
    
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    
    return { 
      success: false, 
      reason: 'Internal error occurred',
      error: error.message,
      userId,
      timestamp: new Date().toISOString()
    };
  }
});

/**
 * Test function to check user's notification settings and push token
 * This helps debug notification issues
 */
exports.checkNotificationStatus = functions.https.onCall({
  enforceAppCheck: false
}, async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    const pushSettings = userData?.settings?.pushNotifications;
    const pushToken = userData?.settings?.pushToken;
    
    return {
      success: true,
      userId,
      hasSettings: !!userData.settings,
      hasPushNotifications: !!pushSettings,
      pushToken: pushToken ? `${pushToken.substring(0, 20)}...` : null,
      pushTokenLength: pushToken ? pushToken.length : 0,
      pushSettings: pushSettings || 'No push notification settings found',
      userDataKeys: Object.keys(userData),
      settingsKeys: userData.settings ? Object.keys(userData.settings) : []
    };
    
  } catch (error) {
    console.error('❌ Error checking notification status:', error);
    throw new functions.https.HttpsError('internal', 'Failed to check notification status', error);
  }
});
