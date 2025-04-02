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
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";

const PhoneVerificationScreen = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(
    new Array(6).fill("")
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verificationId, phoneNumber } = params;
  const inputs = useRef<TextInput[]>([]);
  const { verifyPhoneAndSetUser } = useUserContext();

  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.trim() === "") {
      Alert.alert("Error", "Verification code cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneAndSetUser(
        verificationId as string,
        code,
        phoneNumber as string
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
      setVerificationCode(new Array(6).fill(""));
    } finally {
      setLoading(false);
    }
  };

  const focusInput = (index: number) => {
    if (inputs.current[index]) {
      inputs.current[index].focus();
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

  useEffect(() => {
    const emptyIndex = verificationCode.findIndex((code) => code === "");
    if (emptyIndex !== -1 && inputs.current[emptyIndex]) {
      inputs.current[emptyIndex].focus();
    }

    if (verificationCode.every((digit) => digit !== "")) {
      handleVerifyCode();
    }
  }, [verificationCode]);

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
        <Text style={styles.subtitle}>Sent to {phoneNumber}</Text>
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
