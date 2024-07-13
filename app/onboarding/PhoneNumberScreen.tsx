import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import PhoneInput from "react-native-phone-number-input";

function PhoneNumberScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhoneNumber)) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }

    try {
      const confirmation = await auth().signInWithPhoneNumber(
        formattedPhoneNumber
      );
      setConfirm(confirmation);

      router.replace({
        pathname: "onboarding/PhoneVerificationScreen",
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber: formattedPhoneNumber,
        },
      });
    } catch (error) {
      console.error("Failed to sign in with phone number: ", error);
      Alert.alert("Error", "Failed to send verification code.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Can we get your number?</Text>
      <View style={styles.phoneContainer}>
        <PhoneInput
          defaultValue={phoneNumber}
          defaultCode="US"
          layout="first"
          onChangeText={(text) => {
            setPhoneNumber(text);
          }}
          onChangeFormattedText={(text) => {
            setFormattedPhoneNumber(text);
          }}
          withDarkTheme
          withShadow
          autoFocus
        />
      </View>
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
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "80%",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default PhoneNumberScreen;
