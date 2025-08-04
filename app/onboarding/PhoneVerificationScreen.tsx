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
  KeyboardAvoidingView,
  ScrollView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";
import { AuthDebug } from '@/utils/AuthDebug';
import auth from "@react-native-firebase/auth";

const PhoneVerificationScreen = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(
    new Array(6).fill("")
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showError, setShowError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verificationId, phoneNumber } = params;
  const inputs = useRef<TextInput[]>([]);
  const { verifyPhoneAndSetUser } = useUserContext();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

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

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.trim() === "") {
      setErrorMessage("Please enter the code we sent you");
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setLoading(true);
    setShowError(false);
    setErrorMessage("");
    
    AuthDebug.trackFlowStep('PhoneVerificationScreen', 'Verifying code', { 
      phoneNumber: phoneNumber as string
    });
    
    try {
      await verifyPhoneAndSetUser(
        verificationId as string,
        code,
        phoneNumber as string
      );
      
      AuthDebug.trackFlowStep('PhoneVerificationScreen', 'Verification successful');
    } catch (error: any) {
      console.error("Verification error:", error);
      AuthDebug.error('PhoneVerificationScreen', 'Verification error', error);
      
      // Handle different error types with appropriate messages
      if (error.message === 'PHONE_ALREADY_IN_USE') {
        setErrorMessage("This phone number is already linked to another account. Please try a different number.");
        setShowError(true);
        
        // Navigate back to phone entry after delay
        setTimeout(() => {
          router.replace({
            pathname: "onboarding/PhoneNumberScreen" as any,
          });
        }, 2000);
      } 
      else if (error.message === 'PHONE_LINK_FAILED') {
        setErrorMessage("There was a problem linking this phone to your account. Please try again.");
        setShowError(true);
      } 
      else if (error.code === 'auth/invalid-verification-code') {
        setErrorMessage("The code you entered is incorrect. Please try again.");
        setShowError(true);
        setVerificationCode(new Array(6).fill(""));
      }
      else if (error.code === 'auth/code-expired') {
        setErrorMessage("The verification code has expired. Please request a new one.");
        setShowError(true);
        setVerificationCode(new Array(6).fill(""));
      }
      else {
        setErrorMessage("That code doesn't match. Please try again.");
        setShowError(true);
        setVerificationCode(new Array(6).fill(""));
      }
      
      setTimeout(() => setShowError(false), 3000);
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
        Alert.alert("Too many attempts", "Please try again later.");
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              router.replace({
                pathname: "onboarding/PhoneNumberScreen" as any,
                params: { phoneNumber },
              })
            }
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
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.error || '#FF6B6B'} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Verification Code Input */}
          <View style={styles.codeContainer}>
            {verificationCode.map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref as TextInput)}
                style={[
                  styles.codeInput,
                  verificationCode[index] ? styles.codeInputFilled : null,
                  showError ? styles.codeInputError : null
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
          ) : (
            <TouchableOpacity
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
          )}
          
          {/* Flexible spacer to push affirmation to bottom */}
          <View style={{ flex: 1, minHeight: 30 }} />
          
          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Great{' '}
            <Text style={styles.highlightedWord}>connections</Text>
            {' are worth the extra moment it takes to get them right'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: Spacing.xl,
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
      gap: Spacing.sm,
    },
    codeInput: {
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      width: 48,
      height: 56,
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.medium,
      fontFamily: Typography.fonts.medium,
      textAlign: "center",
      color: colors.textDark,
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
    codeInputFilled: {
      borderColor: colors.primary,
      backgroundColor: colors.tertiary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    codeInputError: {
      borderColor: colors.error || '#FF6B6B',
      backgroundColor: '#FFEBEE',
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
    changeNumberLink: {
      ...fonts.buttonFont,
      color: colors.primary,
      textDecorationLine: "underline",
      textAlign: "center",
      fontStyle: "normal",
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