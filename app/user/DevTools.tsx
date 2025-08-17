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
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  
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

  const resetMatchmakingData = async () => {
    Alert.alert(
      '⚠️ Reset Matchmaking Data',
      'This will reset all likes, matches, and chat data. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('🗑️ Resetting matchmaking data...');
              
              // Show instructions for running the script manually
              Alert.alert(
                '🗑️ Reset Matchmaking Data',
                'To reset matchmaking data, run this command in your terminal:\n\nnpx ts-node scripts/resetMatchmakingData.ts\n\n⚠️ This will permanently delete all likes, matches, and chats!',
                [{ text: 'OK' }]
              );
              
              setTestResults({
                success: true,
                output: 'Instructions shown - run npx ts-node scripts/resetMatchmakingData.ts in terminal'
              });
              
            } catch (error: any) {
              console.error('❌ Reset error:', error);
              Alert.alert(
                '❌ Error',
                `Failed to reset data: ${error.message}`,
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

  const seedFirestore = async () => {
    Alert.alert(
      '🌱 Seed Firestore',
      'This will seed the database with test users and data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('🌱 Seeding Firestore...');
              
              // Show instructions for running the script manually
              Alert.alert(
                '🌱 Seed Firestore',
                'To seed the database, run this command in your terminal:\n\nnpm run seed:dev\n\nOr:\nnpx ts-node scripts/seedFirestore.ts',
                [{ text: 'OK' }]
              );
              
              setTestResults({
                success: true,
                output: 'Instructions shown - run npm run seed:dev in terminal'
              });
              
            } catch (error: any) {
              console.error('❌ Seed error:', error);
              Alert.alert(
                '❌ Error',
                `Failed to seed database: ${error.message}`,
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

  const cleanSeedUsers = async () => {
    Alert.alert(
      '🧹 Clean Seed Users',
      'This will remove all seed users from the database. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clean',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('🧹 Cleaning seed users...');
              
              // Show instructions for running the script manually
              Alert.alert(
                '🧹 Clean Seed Users',
                'To clean seed users, run this command in your terminal:\n\nnpx ts-node scripts/cleanSeedUsers.ts',
                [{ text: 'OK' }]
              );
              
              setTestResults({
                success: true,
                output: 'Instructions shown - run npx ts-node scripts/cleanSeedUsers.ts in terminal'
              });
              
            } catch (error: any) {
              console.error('❌ Clean error:', error);
              Alert.alert(
                '❌ Error',
                `Failed to clean seed users: ${error.message}`,
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

  const createLikesAndChats = async () => {
    Alert.alert(
      '💕 Create Likes & Chats',
      'This will create test likes and chat data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('💕 Creating likes and chats...');
              
              // Show instructions for running the script manually
              Alert.alert(
                '💕 Create Likes & Chats',
                'To create likes and chats, run this command in your terminal:\n\nnpx ts-node scripts/createLikesAndChats.ts',
                [{ text: 'OK' }]
              );
              
              setTestResults({
                success: true,
                output: 'Instructions shown - run npx ts-node scripts/createLikesAndChats.ts in terminal'
              });
              
            } catch (error: any) {
              console.error('❌ Create error:', error);
              Alert.alert(
                '❌ Error',
                `Failed to create data: ${error.message}`,
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

  if (!isDevelopment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={[styles.title, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
            Dev Tools
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.message, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
            Dev tools are only available in development mode.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.title, fonts.spiritualLargeTitleFont, { color: colors.textDark }]}>
          🛠️ Dev Tools
        </Text>
        <Text style={[styles.subtitle, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
          Development and testing utilities
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            🔔 Notifications
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={testNotification}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications" size={20} color={colors.textDark} />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Test Notification
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={checkNotificationStatus}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle" size={20} color={colors.textDark} />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Check Status
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            🌸 Weekly Lotus
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={testWeeklyLotus}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="flower" size={20} color={colors.textDark} />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Test Weekly Lotus
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={resetLotus}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color={colors.textDark} />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Reset Lotus
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
            🗄️ Database
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={seedFirestore}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color={colors.textDark} />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Seed Database
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={createLikesAndChats}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={20} color={colors.textDark} />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Create Likes & Chats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={cleanSeedUsers}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={20} color={colors.textDark} />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
              Clean Seed Users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }]}
            onPress={resetMatchmakingData}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="warning" size={20} color="#FFFFFF" />
            <Text style={[styles.buttonText, fonts.spiritualBodyFont, { color: '#FFFFFF' }]}>
              Reset Matchmaking Data
            </Text>
          </TouchableOpacity>
        </View>

        {testResults && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              📊 Test Results
            </Text>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.resultText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                {JSON.stringify(testResults, null, 2)}
              </Text>
            </View>
          </View>
        )}

        {lotusResults && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, fonts.spiritualTitleFont, { color: colors.textDark }]}>
              🌸 Lotus Results
            </Text>
            <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.resultText, fonts.spiritualBodyFont, { color: colors.textDark }]}>
                {JSON.stringify(lotusResults, null, 2)}
              </Text>
            </View>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={[styles.loadingText, fonts.spiritualBodyFont, { color: colors.textMuted }]}>
              Loading...
            </Text>
          </View>
        )}
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 69, 19, 0.1)',
  },
  backButton: {
    position: 'absolute',
    top: Spacing.xl,
    left: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
    borderRadius: 20,
  },
  title: {
    fontSize: Typography.sizes["2xl"],
    marginBottom: Spacing.xs,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    opacity: 0.8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['4xl'], // Maximum bottom padding to ensure all content is visible
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    marginBottom: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: Typography.sizes.base,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  resultCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  resultText: {
    fontSize: Typography.sizes.sm,
    fontFamily: 'monospace',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    zIndex: 1000,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  message: {
    fontSize: Typography.sizes.lg,
    textAlign: 'center',
    opacity: 0.8,
  },
});
