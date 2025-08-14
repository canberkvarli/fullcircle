import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Platform,
  StyleSheet,
  Keyboard,
  Animated
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";
import { AuthDebug } from '@/utils/AuthDebug';
import auth from "@react-native-firebase/auth";
import { FIREBASE_AUTH } from "@/services/FirebaseConfig";

const PhoneVerificationScreen = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(
    new Array(6).fill("")
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showError, setShowError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [errorType, setErrorType] = useState<"invalid_code" | "phone_in_use" | "expired" | "general" | null>(null);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verificationId, phoneNumber } = params;
  const inputs = useRef<TextInput[]>([]);
  const { verifyPhoneAndSetUser } = useUserContext();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);
  
  // Animation for keyboard adjustment
  const bottomElementsPosition = useRef(new Animated.Value(0)).current;

  // Configure Firebase Auth settings
  useEffect(() => {
    // For development/testing
    if (__DEV__) {
      auth().settings.appVerificationDisabledForTesting = true;
    }
    
    // Force web reCAPTCHA flow to prevent deep link issues
    auth().settings.forceRecaptchaFlowForTesting = true;
  }, []);

  // Track screen mount for debugging
  useEffect(() => {
    AuthDebug.trackFlowStep('PhoneVerificationScreen', 'Screen mounted', { 
      phoneNumber: phoneNumber as string,
      hasVerificationId: !!verificationId
    });
    
    return () => {
      AuthDebug.trackFlowStep('PhoneVerificationScreen', 'Screen unmounted');
    };
  }, []);

  // Add keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        
        // Get keyboard height
        const keyboardHeight = event.endCoordinates.height;
        
        // Animate the bottom elements up by keyboard height plus some padding
        Animated.timing(bottomElementsPosition, {
          toValue: keyboardHeight + (Platform.OS === 'ios' ? 10 : 20),
          duration: Platform.OS === 'ios' ? 300 : 200,
          useNativeDriver: true,
        }).start();
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        
        // Animate the bottom elements back to original position
        Animated.timing(bottomElementsPosition, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 300 : 200,
          useNativeDriver: true,
        }).start();
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  // Safety check for phone number
  useEffect(() => {
    if (!phoneNumber) {
      console.log("No phone number provided, redirecting to phone number screen");
      router.replace("onboarding/PhoneNumberScreen" as any);
    }
  }, [phoneNumber, router]);

  // Clear verification code fields
  const clearVerificationFields = () => {
    setVerificationCode(new Array(6).fill(""));
    
    // Focus on the first input after a short delay to ensure UI has updated
    setTimeout(() => {
      if (inputs.current[0]) {
        inputs.current[0].focus();
      }
    }, 100);
  };

  // Show error with appropriate styling and duration
  const showErrorMessage = (message: string, type: "invalid_code" | "phone_in_use" | "expired" | "general", duration: number = 5000) => {
    setErrorMessage(message);
    setErrorType(type);
    setShowError(true);
    
    // Clear the error after the specified duration
    if (duration > 0) {
      setTimeout(() => {
        setShowError(false);
        setErrorType(null);
      }, duration);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.trim() === "") {
      showErrorMessage("Please enter the code we sent you", "general");
      return;
    }
  
    setLoading(true);
    setShowError(false);
    setErrorMessage("");
    setErrorType(null);
    
    AuthDebug.trackFlowStep('PhoneVerificationScreen', 'Verifying code', { 
      phoneNumber: phoneNumber as string
    });
    
    try {
      // Log auth state before verification
      console.log("Auth state before verification:", 
        FIREBASE_AUTH.currentUser ? `User ${FIREBASE_AUTH.currentUser.uid}` : 'No user');
      
      await verifyPhoneAndSetUser(
        verificationId as string,
        code,
        phoneNumber as string
      );
      
      // Set a session flag to indicate we're coming from verification
      // This will help ensure navigation happens correctly
      console.log("Verification successful, setting completed flag");
      AuthDebug.trackFlowStep('PhoneVerificationScreen', 'Verification successful');
      
    } catch (error: any) {
      console.error("Verification error:", error);
      AuthDebug.error('PhoneVerificationScreen', 'Verification error', error);
      
      // Clear the verification code fields
      clearVerificationFields();
      
      // Handle different error types with appropriate messages
      if (error.message === 'PHONE_ALREADY_IN_USE') {
        showErrorMessage(
          "This phone number is already linked to another account", 
          "phone_in_use",
          5000
        );
        
        // Navigate back to phone entry after delay
        setTimeout(() => {
          router.replace({
            pathname: "onboarding/PhoneNumberScreen" as any,
          });
        }, 3000);
      } 
      else if (error.message === 'PHONE_LINK_FAILED') {
        showErrorMessage(
          "There was a problem linking this phone to your account", 
          "phone_in_use",
          5000
        );
      } 
      else if (error.code === 'auth/invalid-verification-code' || 
               error.message === 'VERIFICATION_FAILED') {
        showErrorMessage(
          "The code you entered is incorrect", 
          "invalid_code",
          5000
        );
      }
      else if (error.code === 'auth/code-expired') {
        showErrorMessage(
          "The verification code has expired. Please request a new one", 
          "expired",
          5000
        );
      }
      else if (error.code === 'auth/session-expired') {
        showErrorMessage(
          "Your verification session has expired. Please request a new code", 
          "expired",
          5000
        );
      }
      else {
        showErrorMessage(
          "Verification failed. Please try again", 
          "general",
          5000
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      AuthDebug.trackFlowStep('PhoneVerificationScreen', 'Resending code', { 
        phoneNumber: phoneNumber as string 
      });
      
      // Request a new verification code
      const confirmation = await auth().signInWithPhoneNumber(
        phoneNumber as string,
        true
      );
      
      // Clear any existing code and errors
      clearVerificationFields();
      setShowError(false);
      setErrorMessage("");
      setErrorType(null);
      
      // Update the verification ID
      router.replace({
        pathname: "onboarding/PhoneVerificationScreen" as any,
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber,
        },
      });
      
      // Show success message
      Alert.alert("Code Sent", "A new verification code has been sent to your phone.");
      
      // Start cooldown
      setResendCooldown(60); // 60 seconds cooldown
      
    } catch (error: any) {
      console.error("Error resending code:", error);
      AuthDebug.error('PhoneVerificationScreen', 'Error resending code', error);
      
      if (error.code === 'auth/quota-exceeded') {
        Alert.alert("Too many attempts", "Please try again in a few minutes.");
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert("Account temporarily blocked", "Too many failed attempts. Please try again later.");
      } else {
        Alert.alert("Error", "Failed to send verification code. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const focusInput = (index: number) => {
    if (inputs.current[index]) {
      inputs.current[index].focus();
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    // Hide error when user starts typing again
    if (showError) {
      setShowError(false);
      setErrorType(null);
    }
    
    const digit = text.replace(/[^0-9]/g, "");
    if (digit.length === 0) return;

    let updatedCode = [...verificationCode];
    updatedCode[index] = digit;
    setVerificationCode(updatedCode);

    if (index < 5 && digit) {
      focusInput(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      verificationCode[index] === "" &&
      index > 0
    ) {
      let updatedCode = [...verificationCode];
      updatedCode[index - 1] = "";
      setVerificationCode(updatedCode);
      focusInput(index - 1);
    }
  };

  useEffect(() => {
    // Focus on first empty input
    const emptyIndex = verificationCode.findIndex((code) => code === "");
    if (emptyIndex !== -1 && inputs.current[emptyIndex]) {
      inputs.current[emptyIndex].focus();
    }

    // Auto-submit when all digits entered
    const allDigitsEntered = verificationCode.every((digit) => digit !== "");
    if (allDigitsEntered) {
      AuthDebug.trackFlowStep('PhoneVerificationScreen', 'Auto-submitting complete code');
      handleVerifyCode();
    }
  }, [verificationCode]);

  // Handle back button press to ensure consistent navigation
  const handleBackPress = () => {
    // Clear any potential session data to prevent mixing
    // This is a safety measure
    router.replace({
      pathname: "onboarding/PhoneNumberScreen" as any,
      params: { phoneNumber },
    });  
  };

  // Get the appropriate error style based on the error type
  const getErrorStyle = () => {
    switch (errorType) {
      case "invalid_code":
        return {
          backgroundColor: '#FFEBEE',
          borderColor: colors.error || '#FF6B6B',
          iconColor: colors.error || '#FF6B6B',
          textColor: colors.error || '#FF6B6B'
        };
      case "phone_in_use":
        return {
          backgroundColor: '#FFF8E1',
          borderColor: '#FFA000',
          iconColor: '#FFA000',
          textColor: '#FFA000'
        };
      case "expired":
        return {
          backgroundColor: '#E0F7FA',
          borderColor: '#0097A7',
          iconColor: '#0097A7',
          textColor: '#0097A7'
        };
      default:
        return {
          backgroundColor: '#FFEBEE',
          borderColor: colors.error || '#FF6B6B',
          iconColor: colors.error || '#FF6B6B',
          textColor: colors.error || '#FF6B6B'
        };
    }
  };

  const errorStyle = getErrorStyle();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Almost there</Text>
        
        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>We sent a code to {phoneNumber}</Text>
        </View>

        {/* Error Message */}
        {showError && (
          <View style={[
            styles.errorContainer,
            { backgroundColor: errorStyle.backgroundColor, borderColor: errorStyle.borderColor }
          ]}>
            <Ionicons 
              name={errorType === "expired" ? "time-outline" : "alert-circle"} 
              size={20} 
              color={errorStyle.iconColor} 
            />
            <Text style={[styles.errorText, { color: errorStyle.textColor }]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Verification Code Input */}
        <View style={styles.codeContainer}>
          {verificationCode.map((_, index) => (
            <View key={index} style={styles.codeInputWrapper}>
              <TextInput
                ref={(ref) => (inputs.current[index] = ref as TextInput)}
                style={[
                  styles.codeInput,
                  verificationCode[index] ? styles.codeInputFilled : null,
                  showError ? (
                    errorType === "invalid_code" ? styles.codeInputError : 
                    errorType === "phone_in_use" ? styles.codeInputWarning :
                    errorType === "expired" ? styles.codeInputExpired : 
                    styles.codeInputError
                  ) : null
                ]}
                maxLength={1}
                keyboardType="numeric"
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                value={verificationCode[index]}
                inputMode="numeric"
                placeholderTextColor={colors.textMuted}
                editable={!loading}
              />
              <View style={[
                styles.codeInputUnderline,
                verificationCode[index] ? styles.codeInputUnderlineFilled : null,
                showError ? (
                  errorType === "invalid_code" ? styles.codeInputUnderlineError :
                  errorType === "phone_in_use" ? styles.codeInputUnderlineWarning :
                  errorType === "expired" ? styles.codeInputUnderlineExpired :
                  styles.codeInputUnderlineError
                ) : null
              ]} />
            </View>
          ))}
        </View>

        {/* Loading or Resend */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <OuroborosLoader 
              size={50}
              duration={3000}
              fillColor="#F5E6D3"
              strokeColor="#7B6B5C"
              strokeWidth={1.5}
              loop={true}
            />          
            <Text style={styles.loadingText}>Verifying your code...</Text>
          </View>
        ) : !showError ? (
          <TouchableOpacity
            style={styles.resendContainer}
            onPress={resendCode}
            disabled={resendCooldown > 0}
          >
            <Text style={[
              styles.changeNumberLink,
              resendCooldown > 0 && styles.disabledText
            ]}>
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : "Didn't get the code?"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Animated Bottom Elements Container */}
      <Animated.View 
        style={[
          styles.bottomElementsContainer,
          { 
            transform: [{ translateY: bottomElementsPosition.interpolate({
              inputRange: [0, 1000],
              outputRange: [0, -1000],
              extrapolate: 'clamp'
            }) }] 
          }
        ]}
      >
        <Text style={styles.affirmation}>
          Great{' '}
          <Text style={styles.highlightedWord}>connections</Text>
          {' are worth the extra moment it takes to get them right'}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const createStyles = (colorScheme: 'light' | 'dark', fonts: ReturnType<typeof useFont>) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    mainContent: {
      flex: 1,
    },
    backButton: {
      backgroundColor: colors.card,
      padding: Spacing.sm,
      left: Spacing.lg,
      borderRadius: BorderRadius.full,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.xl,
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    subtitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: Spacing.xl,
      marginBottom: Spacing['2xl'],
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      textAlign: "left",
      fontStyle: "normal",
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: '#FFEBEE',
      borderColor: colors.error || '#FF6B6B',
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      gap: Spacing.sm,
    },
    errorText: {
      ...fonts.spiritualBodyFont,
      color: colors.error || '#FF6B6B',
      fontStyle: "normal",
      flex: 1,
      fontSize: Typography.sizes.sm,
    },
    codeContainer: {
      flexDirection: "row",
      marginBottom: Spacing.xl,
      justifyContent: "center",
      alignItems: "center",
      gap: Spacing.md,
    },
    codeInputWrapper: {
      position: 'relative',
      width: 48,
      height: 56,
    },
    codeInput: {
      width: '100%',
      height: '100%',
      backgroundColor: 'transparent',
      borderWidth: 0,
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.medium,
      fontFamily: Typography.fonts.medium,
      textAlign: "center",
      color: colors.textDark,
      paddingBottom: 5,
    },
    codeInputUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.border,
      borderRadius: 1,
    },
    codeInputFilled: {
      color: colors.primary,
    },
    codeInputUnderlineFilled: {
      backgroundColor: colors.primary,
      height: 3,
    },
    codeInputError: {
      color: colors.error || '#FF6B6B',
    },
    codeInputUnderlineError: {
      backgroundColor: colors.error || '#FF6B6B',
      height: 3,
    },
    codeInputWarning: {
      color: '#FFA000',
    },
    codeInputUnderlineWarning: {
      backgroundColor: '#FFA000',
      height: 3,
    },
    codeInputExpired: {
      color: '#0097A7',
    },
    codeInputUnderlineExpired: {
      backgroundColor: '#0097A7',
      height: 3,
    },
    loadingContainer: {
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    loadingText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      marginTop: Spacing.sm,
      fontStyle: "normal",
      textAlign: "center",
      paddingHorizontal: Spacing.md,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    changeNumberLink: {
      ...fonts.buttonFont,
      color: colors.primary,
      textDecorationLine: "underline",
      textAlign: "center",
      fontStyle: "normal",
    },
    bottomElementsContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: Platform.select({ ios: 50, android: 30 }),
      paddingHorizontal: Spacing.lg,
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "center",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      opacity: 0.8,
      paddingHorizontal: Spacing.lg,
    },
    highlightedWord: {
      color: colors.textDark,
      textShadowColor: '#FFD700',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
    },
    disabledText: {
      color: colors.textMuted,
      textDecorationLine: "none",
    }
  });
};

export default PhoneVerificationScreen;