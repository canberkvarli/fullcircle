import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useUserContext } from "@/context/UserContext";
import auth from "@react-native-firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FIRESTORE } from "@/services/FirebaseConfig";

function SSOButtons(): JSX.Element {
  const router = useRouter();
  const { updateUserData, fetchUserData } = useUserContext();

  GoogleSignin.configure({
    webClientId:
      "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com",
  });

  const handleSignInWithApple = () => {
    // Placeholder for Apple sign-in functionality
    console.log("Sign in with Apple");
  };

  const handleSignInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const { user } = await auth().signInWithCredential(googleCredential);

      if (auth().currentUser) {
        const googleUserData = {
          userId: user.uid,
          email: user.email || "",
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          GoogleSSOEnabled: true,
          // Add other fields as needed
        };

        console.log("googleUserData", googleUserData);

        // Attempt to write to Firestore
        try {
          await setDoc(
            doc(FIRESTORE, "users", googleUserData.userId),
            googleUserData
          );
          console.log("User data successfully written to Firestore");
        } catch (firestoreError) {
          console.error("Error writing document to Firestore:", firestoreError);
        }

        if (!user.emailVerified) {
          await user.sendEmailVerification();
          router.replace("/onboarding/WelcomeScreen");
        }
        return auth().signInWithCredential(googleCredential);
      } else {
        console.log("User is not authenticated");
      }
    } catch (error) {
      console.error("Google sign-in error: ", error);
    }
  };

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
