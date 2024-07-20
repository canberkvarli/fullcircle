import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FIREBASE_AUTH, FIRESTORE } from "../../services/FirebaseConfig";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useUserContext } from "@/context/UserContext";

function PhoneVerificationScreen() {
  const [verificationCode, setVerificationCode] = useState(
    new Array(6).fill("")
  );
  const { updateUserData } = useUserContext();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verificationId, phoneNumber } = params;
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    focusNextEmptyInput();
    if (verificationCode.every((digit) => digit !== "")) {
      handleVerifyCode();
    }
  }, [verificationCode]);

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.trim() === "") {
      Alert.alert("Error", "Verification code cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(
        verificationId as string,
        code
      );
      const userCredential = await signInWithCredential(
        FIREBASE_AUTH,
        credential
      );
      const { user } = userCredential;
      const docRef = doc(FIRESTORE, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userDataFromFirestore = docSnap.data();
        const userCurrentOnboardingScreen =
          userDataFromFirestore.currentOnboardingScreen || "PhoneNumberScreen";
        updateUserData({
          userId: user.uid,
          currentOnboardingScreen: userCurrentOnboardingScreen,
        });
        router.replace({
          pathname: `onboarding/${userCurrentOnboardingScreen}`,
        });
      } else {
        const phoneRegex = /^\+?(\d{1,3})(\d{3})(\d{7,10})$/;
        const match = phoneRegex.exec(phoneNumber as string);
        if (!match) {
          setLoading(false);
          Alert.alert("Error", "Invalid phone number format");
          return;
        }
        const [, countryCode, areaCode, phone] = match;

        updateUserData({
          userId: user.uid,
          phoneNumber: user.phoneNumber || "",
          countryCode: countryCode,
          areaCode: areaCode,
          number: phone,
          currentOnboardingScreen: "WelcomeScreen",
        });
        router.replace({
          pathname: "onboarding/WelcomeScreen",
          params: { userId: user.uid, phoneNumber: user.phoneNumber },
        });
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setVerificationCode(new Array(6).fill(""));
      Alert.alert("Error", "Failed to verify code: " + error.message);
    }
  };

  const focusInput = (index: number) => {
    if (inputs.current[index]) {
      inputs.current[index].focus();
    }
  };

  const handleResendCode = () => {
    // Implement resend code functionality here
    Alert.alert("Resend Code", "Code has been resent to your phone number.");
    // You may want to implement actual resend logic using Firebase
  };

  const focusNextEmptyInput = () => {
    const emptyIndex = verificationCode.findIndex((code) => code === "");
    if (emptyIndex !== -1 && inputs.current[emptyIndex]) {
      inputs.current[emptyIndex].focus();
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "");
    if (digit.length === 0) return;

    let updatedCode = [...verificationCode];
    updatedCode[index] = digit;
    setVerificationCode(updatedCode);

    if (index < 5 && digit) {
      focusInput(index + 1);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      verificationCode[index] === "" &&
      index > 0
    ) {
      let updatedCode = [...verificationCode];
      updatedCode[index - 1] = "";
      setVerificationCode(updatedCode);
      focusInput(index - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          router.replace({
            pathname: "onboarding/PhoneNumberScreen",
            params: { phoneNumber },
          })
        }
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Verify your connection</Text>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Sent to {phoneNumber} </Text>
        <TouchableOpacity onPress={handleResendCode}>
          <Text style={styles.resendText}>Resend</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.codeContainer}>
        {verificationCode.map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref as TextInput)}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            value={verificationCode[index]}
            inputMode="numeric" // Ensures only numeric input is allowed
          />
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity
          onPress={() => router.replace("onboarding/PhoneNumberScreen")}
        >
          <Text style={styles.changeNumberLink}>Didn't get a code?</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.affirmation}>
        Secure your place in the circle of trust
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 25,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 40,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 40,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "left",
  },
  resendText: {
    color: "blue",
    marginLeft: 10,
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
  changeNumberLink: {
    textDecorationLine: "underline",
    marginTop: 16,
    textAlign: "center",
    color: "blue",
  },
  affirmation: {
    position: "absolute",
    bottom: 70,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
});

export default PhoneVerificationScreen;
