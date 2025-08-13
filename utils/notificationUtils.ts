import { FUNCTIONS } from '@/services/FirebaseConfig';

// Utility functions to send notifications from your app
export const sendLikeNotification = async (likedUserId: string, likerName: string, likerId: string) => {
  try {
    const result = await FUNCTIONS.httpsCallable('sendLikeNotification')({
      likedUserId,
      likerName,
      likerId,
    });
    console.log('✅ Like notification sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Error sending like notification:', error);
    throw error;
  }
};

export const sendMatchNotification = async (matchedUserId: string, matchedName: string) => {
  try {
    const result = await FUNCTIONS.httpsCallable('sendMatchNotification')({
      matchedUserId,
      matchedName,
    });
    console.log('✅ Match notification sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Error sending match notification:', error);
    throw error;
  }
};

export const sendMessageNotification = async (recipientUserId: string, senderName: string, messagePreview: string) => {
  try {
    const result = await FUNCTIONS.httpsCallable('sendMessageNotification')({
      recipientUserId,
      senderName,
      messagePreview: messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
    });
    console.log('✅ Message notification sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Error sending message notification:', error);
    throw error;
  }
};

// Generic notification sender
export const sendCustomNotification = async (
  userId: string, 
  title: string, 
  body: string, 
  type: 'newLikes' | 'newMatches' | 'newMessages' | 'promotions' | 'announcements',
  data?: any
) => {
  try {
    const result = await FUNCTIONS.httpsCallable('sendPushNotification')({
      userId,
      title,
      body,
      type,
      data,
    });
    console.log('✅ Custom notification sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Error sending custom notification:', error);
    throw error;
  }
};
