import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  Platform,
  StyleSheet
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const PhoneVerificationScreen = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(
    new Array(6).fill("")
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verificationId, phoneNumber } = params;
  const inputs = useRef<TextInput[]>([]);
  const { verifyPhoneAndSetUser } = useUserContext();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.trim() === "") {
      Alert.alert("Almost there!", "Please enter the code we sent you");
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneAndSetUser(
        verificationId as string,
        code,
        phoneNumber as string
      );
    } catch (error: any) {
      Alert.alert("Verification Issue", "That code doesn't match. Please try again.");
      setVerificationCode(new Array(6).fill(""));
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
    const emptyIndex = verificationCode.findIndex((code) => code === "");
    if (emptyIndex !== -1 && inputs.current[emptyIndex]) {
      inputs.current[emptyIndex].focus();
    }

    if (verificationCode.every((digit) => digit !== "")) {
      handleVerifyCode();
    }
  }, [verificationCode]);

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Verification Code Input */}
      <View style={styles.codeContainer}>
        {verificationCode.map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref as TextInput)}
            style={[
              styles.codeInput,
              verificationCode[index] ? styles.codeInputFilled : null
            ]}
            maxLength={1}
            keyboardType="numeric"
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            value={verificationCode[index]}
            inputMode="numeric"
            placeholderTextColor={colors.textMuted}
          />
        ))}
      </View>

      {/* Loading or Resend */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Verifying your code...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={() => router.replace("onboarding/PhoneNumberScreen" as any)}
        >
          <Text style={styles.changeNumberLink}>Didn't get the code?</Text>
        </TouchableOpacity>
      )}

      {/* Affirmation */}
      <Text style={styles.affirmation}>
        Great{' '}
        <Text style={styles.highlightedWord}>connections</Text>
        {' are worth the extra moment it takes to get them right'}
      </Text>
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
      ...fonts.spiritualTitleFont, // Keeping font for consistency
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
      ...fonts.spiritualSubtitleFont, // Keeping font but removing italics
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      textAlign: "left",
      fontStyle: "normal", // Changed from italic
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
      // Add subtle glow effect when filled
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
    loadingContainer: {
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    loadingText: {
      ...fonts.spiritualBodyFont, // Keeping font but removing italics
      color: colors.primary,
      marginTop: Spacing.sm,
      fontStyle: "normal", // Changed from italic
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
      fontStyle: "normal", // Changed from italic
    },
    affirmation: {
      ...fonts.elegantItalicFont, // Using Raleway italic for elegant feel
      position: "absolute",
      bottom: Platform.select({ ios: 100, android: 80 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      color: colors.textDark, // Darker color for better visibility
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      opacity: 0.8, // Slightly transparent for elegance
    },
    highlightedWord: {
      color: colors.textDark, // Keep text dark
      textShadowColor: '#FFD700', // Divine yellow glow
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium, // Slightly bolder
      letterSpacing: 0.5, // More letter spacing for emphasis
    },
  });
};

export default PhoneVerificationScreen;