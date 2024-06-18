// screens/onboarding/PhoneNumberScreen.tsx
import React, { useState } from "react";
import { Button, TextInput, StyleSheet, Alert, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH, FIRESTORE } from "../../services/FirebaseConfig";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { signInWithPhoneNumber } from "firebase/auth";

function PhoneNumberScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const router = useRouter();
  const usersRef = collection(FIRESTORE, "users");

  const handleSubmit = async () => {
    if (phoneNumber.trim() === "") {
      Alert.alert("Error", "Phone number cannot be empty");
      return;
    }

    try {
      FIREBASE_AUTH.useDeviceLanguage();
      console.log("trying to sign in with phone number");
      const docRef = doc(usersRef, phoneNumber);
      console.log("docRef", docRef);
      const docSnap = await getDoc(docRef);
      console.log("docSnap", docSnap);

      if (docSnap.exists()) {
        console.log("Logged in");
        Alert.alert("Success", "Logged in!");
      } else {
        const confirmation = await signInWithPhoneNumber(
          FIREBASE_AUTH,
          phoneNumber
        );
        setVerificationId(confirmation.verificationId);
        console.log("Verification code sent!");
        router.replace({
          pathname: "onboarding/PhoneVerificationScreen",
          params: { verificationId: confirmation.verificationId },
        });
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to process phone number: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Can we get your number?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <Button title="Submit" onPress={handleSubmit} />
      <Button
        title="Back"
        onPress={() => router.replace("onboarding/LoginSignupScreen")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: "80%",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default PhoneNumberScreen;
