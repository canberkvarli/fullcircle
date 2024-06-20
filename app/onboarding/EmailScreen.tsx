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
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

function EmailScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, phoneNumber } = params;

  const handleEmailSubmit = async () => {
    if (email.trim() === "") {
      Alert.alert("Error", "Email cannot be empty");
      return;
    }

    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(
        docRef,
        { email: email, phoneNumber: phoneNumber },
        { merge: true }
      );
      router.replace({
        pathname: "onboarding/FirstNameScreen",
        params: { userId, phoneNumber, email },
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to save email: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Can we get your email?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Button title="Submit" onPress={handleEmailSubmit} />
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

export default EmailScreen;
