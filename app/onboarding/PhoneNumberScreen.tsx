import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

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
      Alert.alert("Almost there!", "Please share a valid number so we can connect you.");
      return;
    }

    setLoading(true);

    try {
      const confirmation = await FIREBASE_AUTH.verifyPhoneNumber(
        formattedPhoneNumber
      );
      console.log("Phone number verification initiated:", confirmation);
      router.replace({
        pathname: "onboarding/PhoneVerificationScreen" as any,
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber: formattedPhoneNumber,
        },
      });
    } catch (error) {
      console.error("Failed to sign in with phone number: ", error);
      Alert.alert("Connection Issue", "We're having trouble connecting right now. Please try again.");
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
        
        <Text style={styles.title}>Let's get you connected</Text>
        
        <View style={styles.mainContent}>
          <Text style={styles.subtitle}>
            Share your number to join the circle of kindred souls
          </Text>
          
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
            We'll text you a verification code to confirm your number. 
            Message and data rates may apply.
          </Text>
        </View>
        
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmation}>
            The right{' '}
            <Text style={styles.highlightedWord}>connections</Text>
            {" find their way to you when you're ready"}
          </Text>
        </View>
        
        <View style={styles.bottomBar}>
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
              <Text style={styles.loadingText}>Making the connection...</Text>
            </View>
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
  const fonts = useFont();
  
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
      borderWidth: 2,
      borderColor: colors.primary + '20', // Subtle primary color border
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
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
      ...fonts.inputFont,
      color: colors.textDark,
    },
    codeText: {
      ...fonts.inputFont,
      color: colors.textDark,
    },
    countryPicker: {
      backgroundColor: 'transparent',
    },
    title: {
      ...fonts.spiritualTitleFont, // Keeping the font for consistency
      color: colors.textDark,
      marginTop: Spacing.lg,
      marginLeft: Spacing.xl,
      textAlign: "left",
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont, // Keeping font but removing italics
      color: colors.textLight === '#F5F5F5' ? '#6B6560' : colors.textLight,
      textAlign: "center",
      marginTop: Spacing.xl,
      marginBottom: Spacing.xl,
      fontStyle: "normal", // Changed from italic
    },
    notificationText: {
      ...fonts.captionFont,
      color: colors.textLight === '#F5F5F5' ? '#8B8580' : colors.textMuted,
      textAlign: "center",
      marginTop: Spacing.lg,
      lineHeight: Typography.sizes.sm * 1.5,
      paddingHorizontal: Spacing.md,
    },
    affirmationContainer: {
      position: "absolute",
      bottom: 120,
      left: 0,
      right: 0,
      paddingHorizontal: Spacing.lg,
    },
    affirmation: {
      ...fonts.elegantItalicFont, // Using Raleway italic for elegant feel
      color: colors.textDark, // Darker color for better visibility
      textAlign: "center",
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.5,
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
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginRight: Spacing.lg,
    },
    loadingText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      marginLeft: Spacing.sm,
      fontStyle: "normal", // Changed from italic
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
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
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
  });
};

export default PhoneNumberScreen;