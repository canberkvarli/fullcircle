import React, { useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Platform,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useUserContext } from "@/context/UserContext";
import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "./ouroboros/OuroborosLoader";
import { appleAuth } from '@invertase/react-native-apple-authentication';

function SSOButtons(): JSX.Element {
  const router = useRouter();
  const { handleGoogleSignIn, handleAppleSignIn, signOut } = useUserContext();
  const [isInProgress, setIsInProgress] = useState(false);
  const [signingMethod, setSigningMethod] = useState<'google' | 'apple' | 'phone' | null>(null);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colorScheme);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onGoogleSignIn = async () => {
    setIsInProgress(true);
    setSigningMethod('google');
    
    // Start button animation
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      await handleGoogleSignIn();
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    } finally {
      setTimeout(() => {
        setIsInProgress(false);
        setSigningMethod(null);
        resetAnimations();
      }, 1000);
    }
  };

  const onAppleSignIn = async () => {
    setIsInProgress(true);
    setSigningMethod('apple');
    
    // Start button animation
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true,
    }).start();

    try {
      await handleAppleSignIn();
    } catch (error) {
      console.error("Error during Apple Sign-In:", error);
    } finally {
      setTimeout(() => {
        setIsInProgress(false);
        setSigningMethod(null);
        resetAnimations();
      }, 1000);
    }
  };

  const resetAnimations = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Check if Apple Sign-In is available (iOS only)
  const isAppleSignInAvailable = Platform.OS === 'ios' && appleAuth.isSupported;
  
  const handleSignInWithPhoneNumber = () => {
    router.replace("onboarding/PhoneNumberScreen" as any);
  };

  return (
    <View style={styles.container}>
      {/* Ouroboros Loading Overlay */}
      {isInProgress && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <OuroborosLoader
              size={120}
              variant="spinner"
              loop={true}
              duration={2000}
              fillColor="#F5E6D3"
              strokeColor="#B8860B"
              strokeWidth={2}
            />
          </View>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        {/* Google Sign-In Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
          <TouchableOpacity
            style={[
              styles.ssoButton, 
              styles.googleButton,
              isInProgress && styles.buttonDisabled
            ]}
            onPress={onGoogleSignIn}
            disabled={isInProgress}
          >
            {!(isInProgress && signingMethod === 'google') ? (
              <>
                <Ionicons name="logo-google" size={20} color={colors.text} style={styles.buttonIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            ) : (
              <View style={styles.loadingButtonContent}>
                <ActivityIndicator size="small" color={colors.text} style={styles.miniSpinner} />
                <Text style={[styles.googleButtonText, styles.loadingButtonText]}>
                  Connecting...
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
        
        {/* Apple Sign-In Button - Only show on iOS where supported */}
        {isAppleSignInAvailable && (
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
            <TouchableOpacity
              style={[
                styles.ssoButton, 
                styles.appleButton,
                isInProgress && styles.buttonDisabled
              ]}
              onPress={onAppleSignIn}
              disabled={isInProgress}
            >
              {!(isInProgress && signingMethod === 'apple') ? (
                <>
                  <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              ) : (
                <View style={styles.loadingButtonContent}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={styles.miniSpinner} />
                  <Text style={[styles.appleButtonText, styles.loadingButtonText]}>
                    Connecting...
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Phone Sign-In Button */}
        <TouchableOpacity
          style={[
            styles.ssoButton, 
            styles.phoneButton,
            isInProgress && styles.buttonDisabled
          ]}
          onPress={handleSignInWithPhoneNumber}
          disabled={isInProgress}
        >
          <Ionicons name="call-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.phoneButtonText}>Continue with Phone</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  const { buttonFont, captionFont } = useFont();
  
  return StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      position: 'relative',
    },
    buttonContainer: {
      width: '100%',
      gap: Spacing.md, // Increased from sm to md for better spacing
      alignItems: 'center',
      justifyContent: 'center', // Added to center buttons vertically
    },
    
    // Simplified Loading Styles
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      borderRadius: BorderRadius.lg,
      backdropFilter: 'blur(10px)',
    },
    loadingContainer: {
      alignItems: 'center',
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    loadingText: {
      ...buttonFont,
      color: '#FFFFFF',
      fontSize: 16,
      marginTop: Spacing.lg,
      textAlign: 'center',
      fontWeight: '500',
    },
    
    // Button Styles
    ssoButton: {
      width: '100%',
      maxWidth: 280,
      minHeight: 56, // Added minimum height for consistency
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl, // Added horizontal padding for consistency
      borderRadius: BorderRadius.full,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    buttonDisabled: {
      opacity: 0.6,
      transform: [{ scale: 0.98 }],
    },
    buttonIcon: {
      marginRight: Spacing.sm,
    },
    loadingButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    miniSpinner: {
      marginRight: Spacing.sm,
    },
    loadingButtonText: {
      opacity: 0.8,
    },
    googleButton: {
      backgroundColor: colors.primary,
    },
    appleButton: {
      backgroundColor: '#000000',
    },
    phoneButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    googleButtonText: {
      ...buttonFont,
      color: colors.text,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    appleButtonText: {
      ...buttonFont,
      color: '#FFFFFF',
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    phoneButtonText: {
      ...buttonFont,
      color: '#FFFFFF',
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
      fontWeight: '600',
    },
  });
};

export default SSOButtons;