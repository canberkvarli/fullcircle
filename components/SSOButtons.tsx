import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useUserContext } from "@/context/UserContext";
import auth from "@react-native-firebase/auth";
import { doc, setDoc, getDoc, collection } from "firebase/firestore";
import { FIRESTORE } from "@/services/FirebaseConfig";

function SSOButtons(): JSX.Element {
  const router = useRouter();
  const { updateUserData, saveProgress, userData, fetchUserData } =
    useUserContext();

  GoogleSignin.configure({
    webClientId:
      "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com",
  });

  const handleSignInWithApple = () => {
    // Placeholder for Apple sign-in functionality
    console.log("Sign in with Apple");
  };

  async function handleSignInWithGoogle() {
    try {
      // Configure Google Sign-In
      GoogleSignin.configure({
        webClientId:
          "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com",
      });

      // Sign in with Google
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential
      );
      const user = userCredential.user;

      // Fetch or create user data
      const userData = await fetchUserData(user.uid);
      console.log("userData from fetch", userData);

      // if (userData ) {
      //   // Use user data as needed, e.g., update context, navigate to onboarding screen
      //   updateUserData(userData);
      //   router.replace(`onboarding/${userData.currentOnboardingScreen}`);
      //   saveProgress(userData.currentOnboardingScreen);
      // }
    } catch (error) {
      console.error("Error during Google sign-in", error);
    }
  }

  const handleSignInWithPhoneNumber = () => {
    router.replace("onboarding/PhoneNumberScreen");
  };

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={handleSignInWithGoogle} />
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
