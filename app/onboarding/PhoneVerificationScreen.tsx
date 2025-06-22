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
      Alert.alert("Error", "Verification code cannot be empty");
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
      Alert.alert("Error", error.message);
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
      <Text style={styles.title}>Verify your connection</Text>
      
      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Sent to {phoneNumber}</Text>
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
          <Text style={styles.loadingText}>Verifying...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={() => router.replace("onboarding/PhoneNumberScreen" as any)}
        >
          <Text style={styles.changeNumberLink}>Didn't get a code?</Text>
        </TouchableOpacity>
      )}

      {/* Affirmation */}
      <Text style={styles.affirmation}>
        Secure your place in the circle of trust
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
      fontSize: Typography.sizes['4xl'],
      fontWeight: Typography.weights.bold,
      fontFamily: Typography.fonts.bold,
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
      fontSize: Typography.sizes.lg,
      fontFamily: Typography.fonts.light,
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      textAlign: "left",
      fontWeight: Typography.weights.light,
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
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    codeInputFilled: {
      borderColor: colors.primary,
      backgroundColor: colors.tertiary,
    },
    loadingContainer: {
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    loadingText: {
      fontSize: Typography.sizes.base,
      fontFamily: Typography.fonts.medium,
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      marginTop: Spacing.sm,
      fontWeight: Typography.weights.medium,
    },
    resendContainer: {
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    changeNumberLink: {
      fontSize: Typography.sizes.base,
      fontFamily: Typography.fonts.medium,
      color: colors.primary,
      fontWeight: Typography.weights.medium,
      textDecorationLine: "underline",
      textAlign: "center",
    },
    affirmation: {
      position: "absolute",
      bottom: Platform.select({ ios: 100, android: 80 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      fontSize: Typography.sizes.lg,
      fontFamily: Typography.fonts.spiritualLight,
      fontStyle: "italic",
      fontWeight: Typography.weights.light,
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      lineHeight: Typography.sizes.lg * 1.4,
    },
  });
};

export default PhoneVerificationScreen;