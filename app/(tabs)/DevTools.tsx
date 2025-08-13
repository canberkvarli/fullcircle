import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';
import { FUNCTIONS } from "@/services/FirebaseConfig";

export default function DevTools() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [lotusResults, setLotusResults] = useState<any>(null);
  const fonts = useFont();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  // Only show dev tools in development mode
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  const isDevelopment = env === 'development';

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

  const checkNotificationStatus = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Checking notification status...');
      
      const result = await FUNCTIONS.httpsCallable('checkNotificationStatus')({});
      
      const data = result.data as any;
      console.log('✅ Status result:', data);
      
      Alert.alert(
        '📊 Status Check Complete',
        `User ID: ${data.userId}\nHas Push Token: ${!!data.pushToken}\nToken Length: ${data.pushTokenLength}`,
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('❌ Status check error:', error);
      Alert.alert(
        '❌ Error',
        `Failed to check status: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testWeeklyLotus = async () => {
    setIsLoading(true);
    try {
      console.log('🪷 Testing weekly lotus...');
      
      const result = await FUNCTIONS.httpsCallable('testWeeklyLotus')({});
      
      const data = result.data as any;
      console.log('✅ Lotus test result:', data);
      setLotusResults(data);
      
      if (data.success) {
        Alert.alert(
          '✅ Lotus Test Successful!',
          `Successfully assigned weekly lotus to ${data.processedCount} users`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Lotus Test Failed',
          `Failed to test weekly lotus: ${data.reason}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('❌ Lotus test error:', error);
      setLotusResults({
        success: false,
        reason: error.message || 'Unknown error occurred',
        error: error
      });
      
      Alert.alert(
        '❌ Error',
        `Failed to test weekly lotus: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetLotus = async () => {
    Alert.alert(
      '🔄 Reset Lotus',
      'This will reset lotus for testing purposes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('🔄 Resetting lotus...');
              
              const result = await FUNCTIONS.httpsCallable('resetLotusForTesting')({});
              
              const data = result.data as any;
              console.log('✅ Lotus reset result:', data);
              setLotusResults(data);
              
              if (data.success) {
                Alert.alert(
                  '✅ Lotus Reset Successful!',
                  `Successfully reset lotus for ${data.resetCount} users`,
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert(
                  '❌ Lotus Reset Failed',
                  `Failed to reset lotus: ${data.reason}`,
                  [{ text: 'OK' }]
                );
              }
              
            } catch (error: any) {
              console.error('❌ Lotus reset error:', error);
              setLotusResults({
                success: false,
                reason: error.message || 'Unknown error occurred',
                error: error
              });
              
              Alert.alert(
                '❌ Error',
                `Failed to reset lotus: ${error.message}`,
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const DevToolButton = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    color = '#8B4513',
    isLoading = false 
  }: {
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    color?: string;
    isLoading?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.devToolButton, { backgroundColor: colors.card }]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.buttonTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            {title}
          </Text>
          <Text style={[styles.buttonSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass" size={20} color={colors.textMuted} />
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  // If not in development mode, show restricted access message
  if (!isDevelopment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            🛠️ Dev Tools
          </Text>
          <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            Development and testing utilities
          </Text>
        </View>
        
        <View style={styles.restrictedContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.textMuted} />
          <Text style={[styles.restrictedTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            Access Restricted
          </Text>
          <Text style={[styles.restrictedText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            Dev tools are only available in development mode.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
          🛠️ Dev Tools
        </Text>
        <Text style={[styles.headerSubtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
          Development and testing utilities
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            🧪 Testing Tools
          </Text>
          
          <DevToolButton
            title="Test Notifications"
            subtitle="Send a test push notification to your device"
            icon="notifications"
            onPress={testNotification}
            color="#FF6B6B"
            isLoading={isLoading}
          />

          <DevToolButton
            title="Check Notification Status"
            subtitle="Verify your notification settings and push token"
            icon="checkmark-circle"
            onPress={checkNotificationStatus}
            color="#4ECDC4"
            isLoading={isLoading}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
            🪷 Lotus Management
          </Text>
          
          <DevToolButton
            title="Test Weekly Lotus"
            subtitle="Simulate weekly lotus assignment for testing"
            icon="flower"
            onPress={testWeeklyLotus}
            color="#8E44AD"
            isLoading={isLoading}
          />

          <DevToolButton
            title="Reset Lotus"
            subtitle="Reset lotus for testing purposes (use with caution)"
            icon="refresh"
            onPress={resetLotus}
            color="#E74C3C"
            isLoading={isLoading}
          />
        </View>

        {testResults && (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              📊 Test Results
            </Text>
            <View style={[styles.resultsContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.resultsText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                {JSON.stringify(testResults, null, 2)}
              </Text>
            </View>
          </View>
        )}

        {lotusResults && (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              🪷 Lotus Results
            </Text>
            <View style={[styles.resultsContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.resultsText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
                {JSON.stringify(lotusResults, null, 2)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.1)',
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  devToolButton: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  buttonSubtitle: {
    fontSize: Typography.sizes.sm,
    opacity: 0.8,
  },
  loadingContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsSection: {
    marginTop: Spacing.xl,
  },
  resultsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  resultsContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
  },
  resultsText: {
    fontSize: Typography.sizes.sm,
    fontFamily: 'monospace',
  },
  bottomSpacing: {
    height: Spacing['3xl'],
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  restrictedTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  restrictedText: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: Typography.sizes.base * 1.4,
  },
});
