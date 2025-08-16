import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';
import { FUNCTIONS } from '@/services/FirebaseConfig';
import NotificationService from '@/services/NotificationService';

export default function NotificationTester() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [statusResults, setStatusResults] = useState<any>(null);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();

  const testNotification = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing notification...');
      
      const result = await FUNCTIONS.httpsCallable('sendTestNotification')({
        message: 'This is a test notification from FullCircle! 🧪✨'
      });
      
      const data = result.data as any;
      console.log('✅ Test result:', data);
      setTestResults(data);
      
      if (data.success) {
        Alert.alert(
          '✅ Test Successful!',
          'Test notification sent successfully! Check your device for the notification.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Test Failed',
          `Failed to send notification: ${data.reason}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Test notification error:', error);
      setTestResults({
        success: false,
        reason: error.message || 'Unknown error occurred',
        error: error
      });
      
      Alert.alert(
        '❌ Error',
        `Failed to test notification: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking notification status...');
      
      const result = await FUNCTIONS.httpsCallable('checkNotificationStatus')({});
      
      const data = result.data as any;
      console.log('✅ Status result:', data);
      setStatusResults(data);
      
      Alert.alert(
        '📊 Status Check Complete',
        `User ID: ${data.userId}\nHas Push Token: ${!!data.pushToken}\nToken Length: ${data.pushTokenLength}`,
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('❌ Status check error:', error);
      setStatusResults({
        success: false,
        reason: error.message || 'Unknown error occurred',
        error: error
      });
      
      Alert.alert(
        '❌ Error',
        `Failed to check status: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const registerForNotifications = async () => {
    setIsLoading(true);
    try {
      console.log('🔔 Manually registering for notifications...');
      
      const permissionStatus = await NotificationService.requestPermissions();
      console.log('🔔 Permission status:', permissionStatus);
      
      if (permissionStatus === 'granted') {
        const token = await NotificationService.getPushToken();
        console.log('🔔 Push token received:', token ? 'YES' : 'NO');
        
        if (token) {
          console.log('🔔 Token length:', token.length);
          console.log('🔔 Token preview:', token.substring(0, 20) + '...');
          
          // Update the status results to show the token
          setStatusResults({
            success: true,
            userId: 'Manual Registration',
            hasSettings: true,
            hasPushNotifications: true,
            pushToken: `${token.substring(0, 20)}...`,
            pushTokenLength: token.length,
            pushSettings: 'Manual registration successful',
            userDataKeys: ['manual'],
            settingsKeys: ['pushToken']
          });
          
          Alert.alert(
            '✅ Registration Successful',
            `Push token generated successfully!\nToken length: ${token.length}\nToken preview: ${token.substring(0, 20)}...`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            '❌ No Token Generated',
            'Failed to generate push token. Check console for details.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          '❌ Permission Denied',
          `Notification permission not granted: ${permissionStatus}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Manual registration error:', error);
      Alert.alert(
        '❌ Error',
        `Failed to register for notifications: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults(null);
    setStatusResults(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Floating Back Button */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={[styles.floatingBackButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="chevron-back" size={20} color={colors.textDark} />
      </TouchableOpacity>

              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Minimal Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.pageTitle, fonts.spiritualLargeTitleFont]}>🧪 Notification Tester</Text>
            <Text style={[styles.pageSubtitle, fonts.captionFont]}>Debug and test your push notification system</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.captionFont]}>🧪 TEST NOTIFICATIONS</Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#8B4513' }, isLoading && styles.buttonDisabled]}
            onPress={testNotification}
            disabled={isLoading}
          >
            <Ionicons name="notifications" size={20} color="white" />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont]}>
              {isLoading ? 'Sending...' : 'Send Test Notification'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, { borderColor: '#8B4513' }, isLoading && styles.buttonDisabled]}
            onPress={checkStatus}
            disabled={isLoading}
          >
            <Ionicons name="information-circle" size={20} color="#8B4513" />
            <Text style={[styles.buttonTextSecondary, fonts.spiritualBodyFont]}>
              {isLoading ? 'Checking...' : 'Check Notification Status'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#28a745' }, isLoading && styles.buttonDisabled]}
            onPress={registerForNotifications}
            disabled={isLoading}
          >
            <Ionicons name="notifications-outline" size={20} color="white" />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont]}>
              {isLoading ? 'Registering...' : 'Register for Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonClear]}
            onPress={clearResults}
          >
            <Ionicons name="trash" size={20} color="#666" />
            <Text style={[styles.buttonTextClear, fonts.spiritualBodyFont]}>
              Clear Results
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        {testResults && (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, fonts.spiritualBodyFont]}>
              🧪 Test Results
            </Text>
            <View style={[styles.resultCard, { borderColor: colors.border }, testResults.success ? styles.successCard : styles.errorCard]}>
              <Text style={[styles.resultText, fonts.captionFont]}>
                {JSON.stringify(testResults, null, 2)}
              </Text>
            </View>
          </View>
        )}

        {/* Status Results */}
        {statusResults && (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, fonts.spiritualBodyFont]}>
              📊 Status Results
            </Text>
            <View style={[styles.resultCard, { borderColor: colors.border }, statusResults.success ? styles.successCard : styles.errorCard]}>
              <Text style={[styles.resultText, fonts.captionFont]}>
                {JSON.stringify(statusResults, null, 2)}
              </Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={[styles.instructionsTitle, fonts.spiritualBodyFont]}>
            📋 How to Use
          </Text>
          <Text style={[styles.instructionsText, fonts.captionFont]}>
            1. Make sure you have granted notification permissions in your device settings{'\n'}
            2. Tap "Send Test Notification" to send yourself a test notification{'\n'}
            3. Use "Check Notification Status" to verify your setup{'\n'}
            4. Check the results below for any issues
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    zIndex: 1000,
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: 100, // Add top padding to account for floating button
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  pageTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: '#8B4513',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: Typography.sizes.sm,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    color: '#666',
    marginBottom: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: Typography.weights.medium,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  buttonClear: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },
  buttonTextSecondary: {
    color: '#8B4513',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },
  buttonTextClear: {
    color: '#666',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginLeft: Spacing.sm,
  },
  resultsSection: {
    marginBottom: Spacing.xl,
  },
  resultsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: '#333',
    marginBottom: Spacing.md,
  },
  resultCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  successCard: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  errorCard: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  resultText: {
    fontSize: Typography.sizes.sm,
    color: '#333',
    fontFamily: 'monospace',
  },
  instructionsSection: {
    backgroundColor: '#e8f4fd',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#bee5eb',
    marginBottom: Spacing.xl,
  },
  instructionsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: '#0c5460',
    marginBottom: Spacing.md,
  },
  instructionsText: {
    fontSize: Typography.sizes.sm,
    color: '#0c5460',
    lineHeight: 20,
  },
});
