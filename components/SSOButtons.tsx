import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useUserContext } from "@/context/UserContext";
import { useFont } from "@/hooks/useFont";

function SSOButtons(): JSX.Element {
  const router = useRouter();
  const { handleGoogleSignIn, signOut } = useUserContext();
  const [isInProgress, setIsInProgress] = useState(false);
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colorScheme);

  const onGoogleSignIn = async () => {
    setIsInProgress(true);
    try {
      await handleGoogleSignIn();
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    } finally {
      setIsInProgress(false);
    }
  };

  const handleSignInWithApple = () => console.log("Sign in with Apple");
  const handleSignInWithPhoneNumber = () =>
    router.replace("onboarding/PhoneNumberScreen" as any);

  return (
    <View style={styles.container}>
      {isInProgress && (
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.loadingIndicator}
        />
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.ssoButton, styles.googleButton]}
          onPress={onGoogleSignIn}
          disabled={isInProgress}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.ssoButton, styles.appleButton]}
          onPress={handleSignInWithApple}
          disabled={isInProgress}
        >
          <Text style={styles.buttonText}>Continue with Apple</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.ssoButton, styles.phoneButton]}
          onPress={handleSignInWithPhoneNumber}
          disabled={isInProgress}
        >
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
    },
    loadingIndicator: {
      position: 'absolute',
      zIndex: 1,
    },
    buttonContainer: {
      width: '100%',
      paddingHorizontal: Spacing.xl,
      gap: Spacing.sm,
      alignItems: 'center',
      paddingTop: Spacing["4xl"],
    },
    ssoButton: {
      width: '100%',
      maxWidth: 280,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.full,
      alignItems: "center",
      justifyContent: "center",
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
    googleButton: {
      backgroundColor: colors.primary,
    },
    appleButton: {
      backgroundColor: '#000000',
    },
    phoneButton: {
      backgroundColor: 'transparent',
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
    googleButtonText: {
      ...buttonFont,
      color: colors.text,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    phoneButtonText: {
      ...buttonFont,
      color: colors.text,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    logoutButton: {
      marginTop: Spacing.md,
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.sm,
    },
    logoutText: {
      ...captionFont,
      color: colors.textMuted,
      textDecorationLine: 'underline',
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
  });
};

export default SSOButtons;