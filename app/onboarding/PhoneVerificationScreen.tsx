import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
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
  const inputs = useRef<TextInput[]>([]);

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

  const handleResendCode = () => {
    // Implement resend code functionality here
    Alert.alert("Resend Code", "Code has been resent to your phone number.");
    // You may want to implement actual resend logic using Firebase
  };

  const focusInput = (index: number) => {
    if (inputs.current[index]) {
      inputs.current[index].focus();
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    let updatedCode = verificationCode;
    updatedCode =
      updatedCode.substr(0, index) + text + updatedCode.substr(index + 1);
    setVerificationCode(updatedCode);
    if (text && index < 5) {
      focusInput(index + 1);
    } else if (!text && index > 0) {
      focusInput(index - 1);
    } else if (index === 5 && updatedCode.length === 6) {
      handleVerifyCode();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify your connection</Text>
      <Text style={styles.subtitle}>Sent to {phoneNumber}</Text>
      <View style={styles.codeContainer}>
        {[...Array(6)].map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref as TextInput)}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            onChangeText={(text) => handleCodeChange(text, index)}
          />
        ))}
      </View>
      <TouchableOpacity onPress={handleResendCode}>
        <Text style={styles.resendLink}>Didn't get a code? Resend</Text>
      </TouchableOpacity>
      <Text style={styles.affirmation}>
        Secure your place in the circle of trust
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    bottom: 200,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 40,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    marginLeft: 40,
    textAlign: "left",
  },
  codeContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  codeInput: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginHorizontal: 4,
    width: 40,
    height: 40,
    fontSize: 24,
    textAlign: "center",
  },
  resendLink: {
    textDecorationLine: "underline",
    marginTop: 16,
    marginLeft: 40,
    color: "blue",
  },
  affirmation: {
    position: "absolute",
    bottom: 16,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
});

export default PhoneVerificationScreen;
