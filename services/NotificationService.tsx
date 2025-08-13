import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      return finalStatus;
    }
    
    return null;
  }

  static async getPushToken() {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '5e864641-186b-4d06-99f9-b7ad85439ff4', // Your EAS project ID
      });
      return token.data;
    } catch (error) {
      console.log('Error getting push token:', error);
      return null;
    }
  }

  static async scheduleLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  }

  static async addNotificationReceivedListener(callback: (notification: any) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  static async addNotificationResponseReceivedListener(callback: (response: any) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default NotificationService;
