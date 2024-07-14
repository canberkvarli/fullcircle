import React, { useState } from "react";
import {
  Button,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIREBASE_AUTH, FIRESTORE } from "../../services/FirebaseConfig";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

function PhoneVerificationScreen() {
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verificationId, phoneNumber } = params;

  const handleVerifyCode = async () => {
    if (verificationCode.trim() === "") {
      Alert.alert("Error", "Verification code cannot be empty");
      return;
    }

    try {
      const credential = PhoneAuthProvider.credential(
        verificationId as string,
        verificationCode
      );
      const userCredential = await signInWithCredential(
        FIREBASE_AUTH,
        credential
      );
      const { user } = userCredential;
      const docRef = doc(FIRESTORE, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // User exists in the database, directly navigate to HomeScreen
        Alert.alert("Success", "Phone number verified and logged in!", [
          {
            text: "OK",
            onPress: () => router.replace("onboarding/HomeScreen"),
          },
        ]);
      } else {
        const phoneRegex = /^\+?(\d{1,3})(\d{3})(\d{7,10})$/;
        const match = phoneRegex.exec(phoneNumber as string);
        if (!match) {
          Alert.alert("Error", "Invalid phone number format");
          return;
        }
        const [, countryCode, areaCode, phone] = match;

        // User doesn't exist, create a new user and navigate to EmailScreen
        await setDoc(docRef, {
          country: countryCode,
          area: areaCode,
          number: phone,
          phoneNumber: user.phoneNumber,
        });
        router.replace({
          pathname: "onboarding/EmailScreen",
          params: { userId: user.uid, phoneNumber: user.phoneNumber },
        });
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to verify code: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Enter the verification code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="number-pad"
        autoFocus={true}
      />
      <Button title="Verify" onPress={handleVerifyCode} />
      <Button
        title="Back"
        onPress={() => router.replace("onboarding/PhoneNumberScreen")}
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

export default PhoneVerificationScreen;
