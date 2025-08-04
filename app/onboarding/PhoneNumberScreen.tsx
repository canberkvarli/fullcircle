import React, { useState, useEffect } from "react";
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
import auth from "@react-native-firebase/auth";
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

  // This is the key change - configure Firebase Auth settings before verification
  useEffect(() => {
    // Disable app verification for testing if in development
    if (__DEV__) {
      // This prevents the deep link prompt by disabling the reCAPTCHA verification
      auth().settings.appVerificationDisabledForTesting = true;
    }
    
    // Enable web reCAPTCHA for better experience (prevents deep links)
    // This forces the web reCAPTCHA flow instead of the deep link flow
    auth().settings.forceRecaptchaFlowForTesting = true;
  }, []);

  const handleSubmit = async () => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhoneNumber)) {
      Alert.alert("Almost there!", "Please share a valid number so we can connect you.");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending verification to:", formattedPhoneNumber);
      
      // The true parameter here enables invisible reCAPTCHA handling
      // This works with the settings we configured above
      const confirmation = await FIREBASE_AUTH.signInWithPhoneNumber(
        formattedPhoneNumber,
        true
      );
      
      console.log("Phone verification initiated successfully");
      
      router.replace({
        pathname: "onboarding/PhoneVerificationScreen" as any,
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber: formattedPhoneNumber,
        },
      });
    } catch (error: any) {
      console.error("Failed to sign in with phone number: ", error);
      
      // Better error handling with specific messages
      if (error.code === 'auth/invalid-phone-number') {
        Alert.alert("Invalid Phone Number", "Please check the phone number format and try again.");
      } else if (error.code === 'auth/quota-exceeded') {
        Alert.alert("Too Many Attempts", "We've detected too many verification attempts. Please try again later.");
      } else if (error.code === 'auth/captcha-check-failed') {
        Alert.alert("Verification Failed", "CAPTCHA verification failed. Please try again.");
      } else {
        Alert.alert("Connection Issue", "We're having trouble connecting right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Just use KeyboardAvoidingView with the right settings */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
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
        </View>
        
        {/* This is the only part that moved - flexible spacer */}
        <View style={{ flex: 1, minHeight: 10 }} />
        
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmation}>
            The right{' '}
            <Text style={styles.highlightedWord}>connections</Text>
            {" find their way to you when you're ready"}
          </Text>
        </View>
        
        <View style={styles.bottomBar}>
          {loading ? (
            <OuroborosLoader 
              size={80}
              duration={3000}
              fillColor="#F5E6D3"
              strokeColor="#7B6B5C"
              strokeWidth={1.5}
              loop={true}
            />
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
    affirmationContainer: {
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