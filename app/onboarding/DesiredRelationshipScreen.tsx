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

const options = [
  { label: "Long term partner 👼", value: "Long term partner" },
  { label: "Long term, open to short 👀❤️", value: "Long term, open to short" },
  { label: "Short term option to long 🥂", value: "Short term option to long" },
  { label: "Short term fun 🎉", value: "Short term fun" },
  { label: "New friends 👋", value: "New friends" },
  { label: "Still figuring it out 🤔", value: "Still figuring it out" },
];

function DesireScreen() {
  const [selectedOption, setSelectedOption] = useState("");
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
    interestedIn,
    distancePreference,
  } = params;

  const handleOptionSelect = async (option: string) => {
    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(docRef, { desiredRelationship: option }, { merge: true });
      Alert.alert("Success", "Desired relationship saved successfully!", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "onboarding/EducationScreen",
              params: {
                userId,
                phoneNumber,
                email,
                birthdate,
                firstName,
                lastName,
                gender,
                sexualOrientation,
                interestedIn,
                distancePreference,
                desiredRelationship: option,
              },
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Failed to save desired relationship: " + error.message
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What are you looking for?</Text>
      <Text style={styles.subtitle}>Select one option:</Text>
      <SafeAreaView style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOption === option.value && styles.selectedOptionButton,
            ]}
            onPress={() => setSelectedOption(option.value)}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
      <Button
        title="Next"
        disabled={!selectedOption}
        onPress={() => handleOptionSelect(selectedOption)}
      />
      <Button
        title="Back"
        onPress={() =>
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
              interestedIn,
              distancePreference,
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
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  optionButton: {
    width: "80%",
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#007AFF",
    alignItems: "center",
  },
  selectedOptionButton: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default DesireScreen;
