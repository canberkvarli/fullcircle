import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "@/services/FirebaseConfig";
import { useUserContext } from "@/context/UserContext";
import PhoneInput from "react-native-phone-number-input";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

function PhoneNumberScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { signOut } = useUserContext();
  const router = useRouter();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colorScheme);

  const handleSubmit = async () => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhoneNumber)) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      const confirmation = await FIREBASE_AUTH.verifyPhoneNumber(
        formattedPhoneNumber
      );

      router.replace({
        pathname: "onboarding/PhoneVerificationScreen" as any,
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber: formattedPhoneNumber,
        },
      });
    } catch (error) {
      console.error("Failed to sign in with phone number: ", error);
      Alert.alert("Error", "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableOpacity style={styles.backButton} onPress={signOut}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Your Journey Begins Here</Text>
        
        <View style={styles.mainContent}>
          <Text style={styles.subtitle}>Enter your phone number to start.</Text>
          
          <View style={styles.phoneContainer}>
            <PhoneInput
              defaultValue={phoneNumber}
              defaultCode="US"
              layout="first"
              onChangeText={(text) => {
                setPhoneNumber(text);
              }}
              onChangeFormattedText={(text) => {
                setFormattedPhoneNumber(text);
              }}
              containerStyle={styles.phoneInput}
              textContainerStyle={styles.textContainer}
              textInputStyle={styles.phoneInputText}
              codeTextStyle={styles.codeText}
              countryPickerButtonStyle={styles.countryPicker}
              autoFocus={true}
              disabled={loading}
            />
          </View>
          
          <Text style={styles.notificationText}>
            We'll text you a code to verify you're really you. Message and data
            rates may apply.
          </Text>
        </View>
        
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmation}>
            Step into a community of kindred spirits.
          </Text>
        </View>
        
        <View style={styles.bottomBar}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <TouchableOpacity 
              style={[
                styles.nextButton,
                !formattedPhoneNumber && styles.nextButtonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={!formattedPhoneNumber}
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={formattedPhoneNumber ? colors.background : colors.background} 
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  const { titleFont, subtitleFont, inputFont, captionFont, affirmationFont } = useFont();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    mainContent: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
    },
    bottomBar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: Spacing.lg,
      position: "absolute",
      bottom: 0,
      right: 0,
    },
    phoneContainer: {
      width: "100%",
      marginBottom: Spacing.xl,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
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
    phoneInput: {
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.xs,
    },
    textContainer: {
      backgroundColor: "transparent",
      paddingVertical: Spacing.sm,
    },
    phoneInputText: {
      ...inputFont,
      color: colors.textDark,
    },
    codeText: {
      ...inputFont,
      color: colors.textDark,
    },
    countryPicker: {
      backgroundColor: 'transparent',
    },
    title: {
      ...titleFont,
      color: colors.textDark,
      marginTop: Spacing.lg,
      marginLeft: Spacing.xl,
      textAlign: "left",
    },
    subtitle: {
      ...subtitleFont,
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      textAlign: "center",
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
    },
    notificationText: {
      ...captionFont,
      color: colors.textLight === '#F5F5F5' ? '#8B8580' : colors.textMuted,
      textAlign: "center",
      marginTop: Spacing.lg,
      lineHeight: Typography.sizes.sm * 1.5,
      paddingHorizontal: Spacing.md,
    },
    affirmationContainer: {
      position: "absolute",
      bottom: 100,
      left: 0,
      right: 0,
      paddingHorizontal: Spacing.lg,
    },
    affirmation: {
      ...affirmationFont,
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      textAlign: "center",
      fontStyle: "italic",
      lineHeight: Typography.sizes.lg * 1.4,
    },
    nextButton: {
      backgroundColor: colors.primary,
      padding: Spacing.md,
      borderRadius: BorderRadius.full,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    nextButtonDisabled: {
      backgroundColor: colors.textMuted,
      opacity: 0.6,
      ...Platform.select({
        ios: {
          shadowColor: colors.textMuted,
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    backButton: {
      backgroundColor: colors.card,
      padding: Spacing.sm,
      borderRadius: BorderRadius.full,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.xl,
      marginLeft: Spacing.lg,
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
  });
};

export default PhoneNumberScreen;