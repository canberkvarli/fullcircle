import { Link, Stack, useRouter } from "expo-router";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, SafeAreaView } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function NotFoundScreen() {
  console.log("🚨 NOT FOUND SCREEN SHOWN - This shouldn't happen during normal flow");
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 NotFoundScreen mounted');
    console.log('🔍 Current router state:', router);
    console.log('🔍 Available routes:', ['/', '/onboarding', '/onboarding/LoginSignupScreen']);
  }, [router]);

  const handleGoToLogin = () => {
    try {
      console.log('🔄 Attempting to navigate to LoginSignupScreen...');
      // Add a small delay to ensure router is ready
      setTimeout(() => {
        try {
          router.push('/onboarding/LoginSignupScreen');
        } catch (delayedError) {
          console.error('❌ Delayed navigation also failed:', delayedError);
        }
      }, 100);
    } catch (error) {
      console.error('❌ Navigation error to LoginSignupScreen:', error);
      // Fallback to the main route
      try {
        console.log('🔄 Fallback: navigating to root...');
        router.push('/');
      } catch (fallbackError) {
        console.error('❌ Fallback navigation also failed:', fallbackError);
      }
    }
  };

  const handleGoHome = () => {
    try {
      router.push('/');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: "Page Not Found",
        headerShown: false,
        contentStyle: { backgroundColor: colors.background }
      }} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header with back button */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleGoHome}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Main content */}
            <View style={[styles.content, { backgroundColor: colors.background }]}>
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons 
                  name="compass-outline" 
                  size={80} 
                  color={colors.primary} 
                />
              </View>

              {/* Title */}
              <Text style={[styles.title, { color: colors.text }]}>
                Oops! Page Not Found
              </Text>

              {/* Subtitle */}
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                It looks like you've wandered off the beaten path. Don't worry, we'll help you find your way back to your spiritual journey.
              </Text>

              {/* Action buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={handleGoToLogin}
                >
                  <Ionicons name="log-in-outline" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>Continue Your Journey</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  onPress={handleGoHome}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                    Go Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.reloadButton, { borderColor: colors.secondary }]}
                  onPress={() => {
                    console.log('🔄 Reload button pressed');
                    // Try to refresh the current route
                    try {
                      router.push('/');
                    } catch (error) {
                      console.error('❌ Reload navigation failed:', error);
                    }
                  }}
                >
                  <Ionicons name="refresh-outline" size={20} color={colors.secondary} />
                  <Text style={[styles.reloadButtonText, { color: colors.secondary }]}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Help text */}
              <Text style={[styles.helpText, { color: colors.textMuted }]}>
                If this keeps happening, please contact support
              </Text>

              {/* Additional help section */}
              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: colors.text }]}>
                  What might have happened?
                </Text>
                <Text style={[styles.helpSectionText, { color: colors.textMuted }]}>
                  • You may have clicked an expired link{'\n'}
                  • The app might need to be restarted{'\n'}
                  • There could be a temporary navigation issue
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // This will be overridden by inline style
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20, // Reduced from 60 since we're using SafeAreaView
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent', // This will be overridden by inline style
    width: '100%',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40, // Reduced from 60
    backgroundColor: 'transparent', // This will be overridden by inline style
    width: '100%',
    minHeight: '100%', // Ensure it takes full height
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Nunito-Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: 'Nunito-Regular',
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    width: '100%',
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Nunito-SemiBold',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 2,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Nunito-SemiBold',
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 2,
    width: '100%',
    maxWidth: 280,
    marginTop: 0,
  },
  reloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Nunito-SemiBold',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Nunito-Regular',
  },
  helpSection: {
    marginTop: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Nunito-Bold',
  },
  helpSectionText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left',
    fontFamily: 'Nunito-Regular',
  },
});