import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import styles from "@/styles/Onboarding/PhoneVerificationScreenStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { FIREBASE_AUTH, FIRESTORE } from "../../services/FirebaseConfig";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUserContext } from "@/context/UserContext";

// const RESEND_INTERVAL = 60; // seconds

const PhoneVerificationScreen = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(
    new Array(6).fill("")
  );
  // const [countdown, setCountdown] = useState(RESEND_INTERVAL);
  const [loading, setLoading] = useState(false);
  const {
    updateUserData,
    googleCredential,
    googleUserData,
    fetchUserData,
    currentUser,
  } = useUserContext();
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

  // useEffect(() => {
  //   if (countdown > 0) {
  //     const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
  //     return () => clearInterval(timer);
  //   }
  // }, [countdown]);

  const destructurePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^\+?(\d{1,3})(\d{3})(\d{7,10})$/;
    const match = phoneRegex.exec(phoneNumber);
    if (!match) throw new Error("Invalid phone number format");
    const [, countryCode, areaCode, number] = match;
    return { countryCode, areaCode, number };
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.trim() === "") {
      Alert.alert("Error", "Verification code cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const phoneCredential = PhoneAuthProvider.credential(
        verificationId as string,
        code
      );
      const userCredential = await signInWithCredential(
        FIREBASE_AUTH,
        phoneCredential as any
      );
      const { user } = userCredential;
      const userId = googleCredential ? googleUserData.userId : user.uid;
      const docRef = doc(FIRESTORE, "users", userId);
      const docSnap = await getDoc(docRef);
      const { countryCode, areaCode, number } = destructurePhoneNumber(
        phoneNumber as string
      );

      if (googleCredential) {
        console.log(
          "User signed in with Google SSO (from phoneverificationscreen)"
        );
        await setDoc(docRef, { ...googleUserData }, { merge: true });
        await updateUserData({
          userId: googleUserData.userId,
          phoneNumber: phoneNumber as string,
          countryCode,
          areaCode,
          number,
          currentOnboardingScreen:
            googleUserData.currentOnboardingScreen || "NameScreen",
          // You may want to include other necessary fields from googleUserData here
        });
        await fetchUserData(userId);
      } else {
        // User signed in with phone only
        console.log(
          "google credential not found, continuing with phonenubmer sso"
        );
        if (docSnap.exists()) {
          console.log("User exist in the firestore");
          const userDataFromFirestore = docSnap.data();
          if (userDataFromFirestore.onboardingCompleted) {
            console.log("User has completed onboarding");
            router.replace({
              pathname: "/main/Connect" as any,
            });
            return;
          }
          await fetchUserData(userId);
          const userCurrentOnboardingScreen =
            userDataFromFirestore.currentOnboardingScreen ||
            "PhoneNumberScreen";

          updateUserData({
            userId,
            currentOnboardingScreen: userCurrentOnboardingScreen,
          });
          router.replace({
            pathname: `onboarding/${userCurrentOnboardingScreen}` as any,
          });
        } else {
          console.log("user DOES NOT exist in the firestore");
          // New user case for phone sign-in
          await updateUserData({
            userId: user.uid,
            phoneNumber: user.phoneNumber || "",
            countryCode,
            areaCode,
            number,
            currentOnboardingScreen: "NameScreen",
          });
        }
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

  // const handleResendCode = () => {
  //   if (countdown > 0) return; // Prevent resending if timer hasn't expired
  //   Alert.alert("Resend Code", "Code has been resent to your phone number.");
  //   setCountdown(RESEND_INTERVAL);
  //   // Implement the actual resend code logic here using Firebase
  // };

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
        onPress={() =>
          router.replace({
            pathname: "onboarding/PhoneNumberScreen" as any,
            params: { phoneNumber },
          })
        }
      >
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Verify your connection</Text>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Sent to {phoneNumber} </Text>
        {/* <TouchableOpacity onPress={handleResendCode} disabled={countdown > 0}>
          <Text
            style={
              countdown > 0 ? styles.resendTextDisabled : styles.resendText
            }
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
          </Text>
        </TouchableOpacity> */}
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
            inputMode="numeric"
          />
        ))}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity
          onPress={() => router.replace("onboarding/PhoneNumberScreen" as any)}
        >
          <Text style={styles.changeNumberLink}>Didn't get a code?</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.affirmation}>
        Secure your place in the circle of trust
      </Text>
    </SafeAreaView>
  );
};

export default PhoneVerificationScreen;
