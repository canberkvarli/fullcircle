import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const options = ["Women", "Men", "Everyone"];

function InterestScreen() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    userId,
    phoneNumber,
    email,
    birthdate,
    firstName,
    lastName,
    gender,
    sexualOrientation,
  } = params;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      Alert.alert("Error", "Please select an option");
      return;
    }

    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(docRef, { interestedIn: selectedOption }, { merge: true });
      router.replace({
        pathname: "onboarding/DistancePreferenceScreen",
        params: {
          userId,
          phoneNumber,
          email,
          birthdate,
          firstName,
          lastName,
          gender,
          sexualOrientation,
          interestedIn: selectedOption,
        },
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to save interest: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Who are you interested in seeing?</Text>
      <Text style={styles.subtitle}>Select one option</Text>
      <Button
        title="Women"
        onPress={() => handleOptionSelect("Women")}
        color={selectedOption === "Women" ? "blue" : undefined}
      />
      <Button
        title="Men"
        onPress={() => handleOptionSelect("Men")}
        color={selectedOption === "Men" ? "blue" : undefined}
      />
      <Button
        title="Everyone"
        onPress={() => handleOptionSelect("Everyone")}
        color={selectedOption === "Everyone" ? "blue" : undefined}
      />
      <Button title="Submit" onPress={handleSubmit} />
      <Button
        title="Back"
        onPress={() =>
          router.replace({
            pathname: "onboarding/SexualOrientationScreen",
            params: {
              userId,
              phoneNumber,
              email,
              birthdate,
              firstName,
              lastName,
              gender,
              sexualOrientation,
            },
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
});

export default InterestScreen;
