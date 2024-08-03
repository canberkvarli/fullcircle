import React, { useState } from "react";
import { View, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { useUserContext } from "@/context/UserContext";
import auth from "@react-native-firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { FIRESTORE } from "@/services/FirebaseConfig";

function SSOButtons(): JSX.Element {
  const router = useRouter();
  const {
    setGoogleCredential,
    setGoogleUserData,
    setCurrentUser,
    signOut,
    fetchUserData,
    updateUserData,
  } = useUserContext();
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

      setGoogleCredential(googleCredential);

      if (user) {
        // Check if the user already exists in Firestore
        const userEmail = user.email || "";
        const userId = user.uid;

        const docRef = doc(FIRESTORE, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // User exists, update user data
          console.log(
            "User from google sso EXISTS! updating user doc...",
            docSnap.data()
          );
          const existingUserData = docSnap.data();

          const updatedUserData = {
            ...existingUserData,
            GoogleSSOEnabled: true,
            lastSignInTime: new Date().toISOString(),
          };

          await updateUserData(updatedUserData);
          // navigateToScreen(existingUserData.currentOnboardingScreen);
        } else {
          console.log(
            "User from google sso DOES NOT exist! Creating new doc..."
          );
          // User does not exist, create a new user document
          const googleUserData = {
            userId: userId,
            email: userEmail,
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ")[1] || "",
            GoogleSSOEnabled: true,
            marketingRequested: false,
            countryCode: "",
            areaCode: "",
            number: "",
            phoneNumber: "",
            currentOnboardingScreen: "",
            hiddenFields: {},
          };

          // Save the new user data to Firestore
          await setDoc(docRef, googleUserData);
          console.log("New user created:", googleUserData);
          setGoogleUserData(googleUserData);
        }

        setCurrentUser(user);
        fetchUserData(user.uid); // Optionally fetch user data from Firestore
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
      {isInProgress && <ActivityIndicator size="large" color="#0000ff" />}
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleSignInWithGoogle}
        disabled={isInProgress}
      />
      <Button
        title="Sign in with Apple"
        onPress={handleSignInWithApple}
        disabled={isInProgress}
      />
      <Button
        title="Sign in with Phone Number"
        onPress={handleSignInWithPhoneNumber}
        disabled={isInProgress}
      />
      <View>
        <Button onPress={signOut} title="LogOut" color="red"></Button>
      </View>
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
