import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";

import { useUserContext } from "@/context/UserContext";

function SSOButtons(): JSX.Element {
  const router = useRouter();
  const { handleGoogleSignIn,signOut } = useUserContext();
  const [isInProgress, setIsInProgress] = useState(false);

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
      {isInProgress && <ActivityIndicator size="large" color="#3A3A3A" />}
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={onGoogleSignIn}
        disabled={isInProgress}
      />
      <TouchableOpacity
        style={styles.ssoButton}
        onPress={handleSignInWithApple}
        disabled={isInProgress}
      >
        <Text style={styles.buttonText}>Sign in with Apple</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.ssoButton}
        onPress={handleSignInWithPhoneNumber}
        disabled={isInProgress}
      >
        <Text style={styles.buttonText}>Sign in with Phone Number</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={signOut}>
        <Text>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ssoButton: {
    marginBottom: 5,
    paddingVertical: 12,
    width: 300,
    backgroundColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default SSOButtons;
