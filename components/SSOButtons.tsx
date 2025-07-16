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

function SSOButtons(): JSX.Element {
  const router = useRouter();
  const { handleGoogleSignIn, signOut } = useUserContext();
  const [isInProgress, setIsInProgress] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colorScheme);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;

  const onGoogleSignIn = async () => {
    setIsInProgress(true);
    setLoadingStep("Connecting to Google...");
    
    // Start animations
    Animated.parallel([
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(progressAnim, {
        toValue: 0.3,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();

    try {
      // Simulate different loading steps
      setTimeout(() => setLoadingStep("Authenticating..."), 1000);
      setTimeout(() => {
        Animated.timing(progressAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: false,
        }).start();
        setLoadingStep("Setting up your account...");
      }, 2000);

      setTimeout(() => {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }).start();
        setLoadingStep("Almost done...");
      }, 2800);

      await handleGoogleSignIn();
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      setLoadingStep("Error occurred. Please try again.");
      
      // Reset animations on error
      setTimeout(() => {
        resetAnimations();
      }, 2000);
    } finally {
      setTimeout(() => {
        setIsInProgress(false);
        setLoadingStep("");
        resetAnimations();
      }, 3200);
    }
  };

  const resetAnimations = () => {
    Animated.parallel([
      Animated.timing(loadingOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleSignInWithApple = () => console.log("Sign in with Apple");
  const handleSignInWithPhoneNumber = () =>
    router.replace("onboarding/PhoneNumberScreen" as any);

  return (
    <View style={styles.container}>
      {/* Enhanced Loading Overlay */}
      {isInProgress && (
        <Animated.View 
          style={[
            styles.loadingOverlay,
            { opacity: loadingOpacity }
          ]}
        >
          <View style={styles.loadingContainer}>
            {/* Animated Progress Ring */}
            <View style={styles.progressRingContainer}>
              <Animated.View 
                style={[
                  styles.progressRing,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <ActivityIndicator 
                  size="large" 
                  color={colors.primary}
                  style={styles.spinner}
                />
              </Animated.View>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    }
                  ]}
                />
              </View>
            </View>
            
            {/* Loading Text */}
            <Text style={styles.loadingText}>{loadingStep}</Text>
            
            {/* Google Logo with Animation */}
            <Animated.View style={[styles.googleLogoContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="logo-google" size={32} color={colors.primary} />
            </Animated.View>
          </View>
        </Animated.View>
      )}
      
      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[
              styles.ssoButton, 
              styles.googleButton,
              isInProgress && styles.buttonDisabled
            ]}
            onPress={onGoogleSignIn}
            disabled={isInProgress}
          >
            {!isInProgress ? (
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
        
        {/* <TouchableOpacity
          style={[
            styles.ssoButton, 
            styles.appleButton,
            isInProgress && styles.buttonDisabled
          ]}
          onPress={handleSignInWithApple}
          disabled={isInProgress}
        >
          <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity> */}
        
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
      gap: Spacing.sm,
      alignItems: 'center',
    },
    
    // Enhanced Loading Styles
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      borderRadius: BorderRadius.lg,
      backdropFilter: 'blur(10px)',
    },
    loadingContainer: {
      alignItems: 'center',
      padding: Spacing.xl,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
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
    progressRingContainer: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    progressRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      marginBottom: Spacing.md,
    },
    spinner: {
      transform: [{ scale: 1.2 }],
    },
    progressBarContainer: {
      width: 200,
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    loadingText: {
      ...buttonFont,
      color: '#FFFFFF',
      fontSize: 16,
      marginTop: Spacing.md,
      textAlign: 'center',
      fontWeight: '500',
    },
    googleLogoContainer: {
      marginTop: Spacing.sm,
      padding: Spacing.sm,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: BorderRadius.full,
    },
    
    // Button Styles
    ssoButton: {
      width: '100%',
      maxWidth: 280,
      paddingVertical: Spacing.md,
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
      paddingHorizontal: Spacing["2xl"],
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