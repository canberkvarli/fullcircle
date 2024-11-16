import React, { useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
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
        const userEmail = user.email || "";
        const userId = user.uid;

        const docRef = doc(FIRESTORE, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const existingUserData = docSnap.data();
          const updatedUserData = {
            ...existingUserData,
            GoogleSSOEnabled: true,
            lastSignInTime: new Date().toISOString(),
          };
          await updateUserData(updatedUserData);
          router.replace(
            existingUserData.onboardingCompleted
              ? "main/Connect"
              : (`onboarding/${existingUserData.currentOnboardingScreen}` as any)
          );
        } else {
          const googleUserData = {
            userId,
            email: userEmail,
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ")[1] || "",
            GoogleSSOEnabled: true,
            marketingRequested: false,
            countryCode: "",
            areaCode: "",
            number: "",
            phoneNumber: "",
            preferredEthnicities: [],
            currentOnboardingScreen: "",
            hiddenFields: {},
            onboardingCompleted: false,
            fullCircleSubscription: false,
          };
          await setDoc(docRef, googleUserData);
          setGoogleUserData(googleUserData);
          router.replace(
            `onboarding/${googleUserData.currentOnboardingScreen}` as any
          );
        }

        setCurrentUser(user);
        fetchUserData(user.uid);
      } else {
        console.log("User is not authenticated");
      }
    } catch (error) {
      console.error("Google sign-in error: ", error);
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
        onPress={handleSignInWithGoogle}
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
      {/* <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity> */}
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
  // logoutButton: {
  //   marginBottom: 50,
  //   width: 100,
  //   height: 50,
  //   paddingVertical: 10,
  //   borderRadius: 8,
  //   backgroundColor: "red",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // logoutText: {
  //   fontSize: 16,
  //   color: "#FFFFFF",
  //   fontWeight: "600",
  // },
});

export default SSOButtons;
