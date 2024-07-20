// components/SSOButtons.tsx
import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

function SSOButtons(): JSX.Element {
  const router = useRouter();
  GoogleSignin.configure({
    webClientId:
      "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com",
  });

  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  const handleSignInWithApple = () => {
    // Placeholder for Apple sign-in functionality
    console.log("Sign in with Apple");
  };

  const handleSignInWithGoogle = () => {
    onGoogleButtonPress().then(() => console.log("Signed in with Google!"));
  };

  const handleSignInWithPhoneNumber = () => {
    router.replace("onboarding/PhoneNumberScreen");
  };

  return (
    <View style={styles.container}>
      <Button title="Sign in with Apple" onPress={handleSignInWithApple} />
      <Button title="Sign in with Google" onPress={handleSignInWithGoogle} />
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
