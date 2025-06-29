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
import { Ionicons } from "@expo/vector-icons";
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
          <Ionicons name="logo-google" size={20} color={colors.text} style={styles.buttonIcon} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.ssoButton, styles.appleButton]}
          onPress={handleSignInWithApple}
          disabled={isInProgress}
        >
          <Ionicons name="logo-apple" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.ssoButton, styles.phoneButton]}
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
    },
    loadingIndicator: {
      position: 'absolute',
      zIndex: 1,
    },
    buttonContainer: {
      width: '100%',
      gap: Spacing.sm,
      alignItems: 'center',
      // Removed the paddingTop that was causing spacing issues
    },
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
    buttonIcon: {
      marginRight: Spacing.sm,
    },
    googleButton: {
      backgroundColor: colors.primary,
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