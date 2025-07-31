import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useColorScheme,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import SSOButtons from "@/components/SSOButtons";
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform } from "react-native";
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useFont } from '@/hooks/useFont';
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";
import OuroborosSVG from "@/components/ouroboros/OuroborosSVG";

const videoSource = require("../../assets/videos/danielle.mp4");

function LoginSignupScreen(): JSX.Element {
  const router = useRouter();
  const video = useRef(null) as any;
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);
  const colors = Colors[colorScheme];
  
  const [status, setStatus] = useState({});
  const [showSSOButtons, setShowSSOButtons] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const initialButtonsFade = useRef(new Animated.Value(1)).current;
  const ssoButtonsFade = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [videoDuration, setVideoDuration] = useState(10000);

  useEffect(() => {
    if (video.current) {
      (video.current as Video).playAsync();
    }
    
    // Start the ouroboros rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
  if (video.current) {
    const interval = setInterval(() => {
      video.current?.setPositionAsync(0);
    }, videoDuration);
    
    return () => clearInterval(interval);
  }
}, [videoDuration]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handleSignIn = () => {
    // Animate out initial buttons and animate in SSO buttons simultaneously
    setShowSSOButtons(true);
    
    Animated.parallel([
      Animated.timing(initialButtonsFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(ssoButtonsFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGoBack = () => {
    // Animate out SSO buttons and animate in initial buttons simultaneously
    Animated.parallel([
      Animated.timing(initialButtonsFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(ssoButtonsFade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSSOButtons(false);
    });
  };

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.backgroundVideo}
        source={videoSource}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        onLoad={handleVideoLoad}
      />
      {/* {!videoLoaded && (
        <OuroborosLoader
          size={100}
          duration={3000}
          fillColor="#F5E6D3"
          strokeColor="#7B6B5C"
          strokeWidth={1.5}
        />
      )} */}
      {videoLoaded && (
        <View style={styles.overlay}>
          {showSSOButtons && (
            <Animated.View 
              style={[
                styles.backIcon, 
                { 
                  opacity: ssoButtonsFade,
                  transform: [{
                    scale: ssoButtonsFade.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }],
                }
              ]}
            >
              <TouchableOpacity onPress={handleGoBack}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Logo and Title Section */}
          <View style={styles.titleSection}>
            {/* Ouroboros Logo */}
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }
              ]}
            >
              <View style={styles.logoGlow}>
                <OuroborosSVG
                  size={120}
                  fillColor="#F5E6D3"
                  strokeColor="#B8860B"
                  // strokeColor="#7B6B5C"
                  strokeWidth={2}
                />
              </View>
            </Animated.View>
            
            <Text style={styles.title}>Circle</Text>
            <Text style={styles.subTitle}>Where intention meets connection</Text>
          </View>
          
          {/* Buttons Section - Fixed positioning */}
          <View style={styles.buttonSection}>
            {/* Initial Buttons */}
            <Animated.View 
              style={[
                styles.absoluteButtonContainer,
                {
                  opacity: initialButtonsFade,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  }],
                }
              ]}
              pointerEvents={showSSOButtons ? 'none' : 'auto'}
            >
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() =>
                  router.push("onboarding/PhoneNumberScreen" as any)
                }
              >
                <Text style={styles.buttonText}>Create account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSignIn}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* SSO Buttons */}
            {showSSOButtons && (
              <Animated.View 
                style={[
                  styles.absoluteButtonContainer,
                  {
                    opacity: ssoButtonsFade,
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    }],
                  }
                ]}
                pointerEvents={showSSOButtons ? 'auto' : 'none'}
              >
                <SSOButtons />
              </Animated.View>
            )}
          </View>
          
          {/* Terms and Conditions - Enhanced visibility */}
          <View style={[styles.termsContainer, styles.enhancedTermsContainer]}>
            <Text style={[styles.infoText, styles.enhancedInfoText]}>
              By signing up for Circle, you agree to our{" "}
              <Text style={[styles.link, styles.enhancedLink]} onPress={() => console.log("pressed")}>
                Terms of Service
              </Text>
              . Learn how we process your data in our{" "}
              <Text style={[styles.link, styles.enhancedLink]} onPress={() => console.log("pressed")}>
                Privacy Policy
              </Text>
              {" "}and{" "}
              <Text style={[styles.link, styles.enhancedLink]} onPress={() => console.log("pressed")}>
                Cookies Policy
              </Text>
              .
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  const { affirmationFont, buttonFont, captionFont, logoFont, spiritualSubtitleFont } = useFont();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    backgroundVideo: {
      ...StyleSheet.absoluteFillObject,
      resizeMode: "cover",
    },
    overlay: {
      flex: 1,
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: Platform.select({ ios: 60, android: 40 }),
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.overlay,
      ...StyleSheet.absoluteFillObject,
    },
    loadingIndicator: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -25 }, { translateY: -25 }],
    },
    titleSection: {
      alignItems: 'center',
      marginTop: Spacing["4xl"],
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoGlow: {
      shadowColor: '#B8860B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      shadowOpacity: 0.6,
      elevation: 10,
    },
    title: {
      ...logoFont,
      color: colors.background,
      letterSpacing: 1,
      marginBottom: Spacing.xs,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 1,
    },
    subTitle: {
      ...spiritualSubtitleFont,
      color: colors.text,
      fontStyle: "italic",
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    buttonSection: {
      width: '100%',
      height: 200, // Fixed height to prevent layout shifts
      position: 'relative',
      justifyContent: 'center',
    },
    absoluteButtonContainer: {
      position: 'absolute',
      width: '100%',
      paddingHorizontal: Spacing.xl,
      gap: Spacing.sm,
      alignItems: 'center',
    },
    button: {
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      alignItems: 'center',
      minWidth: 200,
      width: '100%',
      maxWidth: 280,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    buttonText: {
      ...buttonFont,
      color: colors.text,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    secondaryButtonText: {
      color: colors.text,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    termsContainer: {
      paddingHorizontal: Spacing.md,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
    },
    infoText: {
      ...captionFont,
      color: colors.textLight,
      textAlign: "center",
      lineHeight: Typography.sizes.xs * 1.6,
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    link: {
      ...buttonFont,
      color: '#87CEEB',
      textDecorationLine: "underline",
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    backIcon: {
      position: 'absolute',
      top: Platform.select({ ios: 50, android: 30 }),
      left: Spacing.lg,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: BorderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    // Enhanced styles for better terms visibility
    enhancedTermsContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginHorizontal: Spacing.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    enhancedInfoText: {
      color: '#FFFFFF',
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    enhancedLink: {
      color: '#87CEEB',
      textDecorationLine: 'underline',
      fontWeight: '600',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
  });
};

export default LoginSignupScreen;