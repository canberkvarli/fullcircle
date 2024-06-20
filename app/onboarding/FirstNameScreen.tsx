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

function FirstNameScreen() {
  const [firstName, setFirstName] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, phoneNumber, email, birthdate } = params;

  const handleFirstNameSubmit = async () => {
    if (firstName.trim() === "") {
      Alert.alert("Error", "First name cannot be empty");
      return;
    }

    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(docRef, { firstName: firstName }, { merge: true });
      router.replace({
        pathname: "onboarding/BirthdateScreen",
        params: { userId, phoneNumber, email, birthdate, firstName },
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to save first name: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What's your first name?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your first name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <Button title="Submit" onPress={handleFirstNameSubmit} />
      <Button
        title="Back"
        onPress={() =>
          router.replace({
            pathname: "onboarding/EmailScreen",
            params: { userId, phoneNumber, email, birthdate },
          })
        }
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

export default FirstNameScreen;
