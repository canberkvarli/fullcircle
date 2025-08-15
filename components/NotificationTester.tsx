import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';
import { FUNCTIONS } from "@/services/FirebaseConfig"

export default function NotificationTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [statusResults, setStatusResults] = useState<any>(null);
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

  const clearResults = () => {
    setTestResults(null);
    setStatusResults(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flask" size={24} color="#8B4513" />
        <Text style={[styles.title, fonts.spiritualLargeTitleFont]}>Notification Tester</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, fonts.captionFont]}>🧪 TEST NOTIFICATIONS</Text>
        
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testNotification}
          disabled={isLoading}
        >
          <Ionicons name="notifications" size={20} color="white" />
          <Text style={[styles.buttonText, fonts.spiritualBodyFont]}>
            {isLoading ? 'Sending...' : 'Send Test Notification'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary, isLoading && styles.buttonDisabled]}
          onPress={checkStatus}
          disabled={isLoading}
        >
          <Ionicons name="information-circle" size={20} color="#8B4513" />
          <Text style={[styles.buttonTextSecondary, fonts.spiritualBodyFont]}>
            {isLoading ? 'Checking...' : 'Check Notification Status'}
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
          <View style={[styles.resultCard, testResults.success ? styles.successCard : styles.errorCard]}>
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
          <View style={[styles.resultCard, statusResults.success ? styles.successCard : styles.errorCard]}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: '#8B4513',
    marginLeft: Spacing.sm,
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
    backgroundColor: '#8B4513',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B4513',
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
