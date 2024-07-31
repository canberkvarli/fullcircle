import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { useUserContext } from "@/context/UserContext";
import auth from "@react-native-firebase/auth";

function SSOButtons(): JSX.Element {
  const router = useRouter();
  const { fetchUserData } = useUserContext();
  const [isInProgress, setIsInProgress] = useState(false);

  const webClientId =
    "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com";

  GoogleSignin.configure({ webClientId });

  const handleSignInWithGoogle = async () => {
    setIsInProgress(true);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const { user } = await auth().signInWithCredential(googleCredential);

      if (user) {
        const googleUserData = {
          userId: user.uid,
          email: user.email || "",
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          GoogleSSOEnabled: true,
        };
        console.log("Google user data", googleUserData);

        await fetchUserData(user.uid); // Fetch user data if it exists
        router.replace("onboarding/PhoneNumberScreen"); // Navigate to PhoneNumberScreen
      } else {
        console.log("User is not authenticated");
      }
    } catch (error) {
      console.error("Google sign-in error: ", error);
    } finally {
      setIsInProgress(false);
    }
  };

  const handleSignInWithApple = () => {
    console.log("Sign in with Apple");
  };

  const handleSignInWithPhoneNumber = () => {
    router.replace("onboarding/PhoneNumberScreen");
  };

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleSignInWithGoogle}
        disabled={isInProgress}
      />
      <Button title="Sign in with Apple" onPress={handleSignInWithApple} />
      <Button
        title="Sign in with Phone Number"
        onPress={handleSignInWithPhoneNumber}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default SSOButtons;
