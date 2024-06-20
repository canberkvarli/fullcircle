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

function BirthdayScreen() {
  const [birthdate, setBirthdate] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, phoneNumber, email, firstName, lastName } = params;

  const handleBirthdateSubmit = async () => {
    if (birthdate.trim() === "") {
      Alert.alert("Error", "Birthdate cannot be empty");
      return;
    }

    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(docRef, { birthdate: birthdate }, { merge: true });
      router.replace({
        pathname: "onboarding/GenderScreen",
        params: {
          userId,
          phoneNumber,
          email,
          firstName,
          lastName,
          birthdate,
        },
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to save birthdate: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What is your birthdate?</Text>
      <TextInput
        style={styles.input}
        placeholder="Your birthdate"
        value={birthdate}
        onChangeText={setBirthdate}
      />
      <Text style={styles.subtitle}>
        This is how it'll appear in your profile.
      </Text>
      <Text style={styles.warning}>Can't change it later.</Text>
      <Button title="Submit" onPress={handleBirthdateSubmit} />
      <Button
        title="Back"
        onPress={() =>
          router.replace({
            pathname: "onboarding/FirstNameScreen",
            params: { userId, phoneNumber, email, firstName, lastName },
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
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  warning: {
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default BirthdayScreen;
