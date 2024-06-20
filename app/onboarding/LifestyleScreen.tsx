import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

function LifestyleScreen() {
  const [drinkingHabit, setDrinkingHabit] = useState<string | null>(null);
  const [smokingHabit, setSmokingHabit] = useState<string | null>(null);
  const [workoutHabit, setWorkoutHabit] = useState<string | null>(null);
  const [petHabit, setPetHabit] = useState<string | null>(null);
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
    desiredRelationship,
  } = params;

  const handleSaveLifestyle = async () => {
    if (!userId || typeof userId !== "string") {
      alert("Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(
        docRef,
        {
          lifestyle: {
            drinkingHabit,
            smokingHabit,
            workoutHabit,
            petHabit,
          },
        },
        { merge: true }
      );
      router.replace({
        pathname: "onboarding/AuthenticityScreen",
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
          desiredRelationship,
          drinkingHabit,
          smokingHabit,
          workoutHabit,
          petHabit,
        },
      });
    } catch (error: any) {
      alert("Failed to save lifestyle choices: " + error.message);
    }
  };

  const handleBack = () => {
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
        desiredRelationship,
      },
    });
  };

  const handleSkip = () => {
    router.replace({
      pathname: "onboarding/AuthenticityScreen",
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
        desiredRelationship,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>How often do you drink?</Text>
        {[
          "Not from",
          "Sober",
          "Sometimes",
          "Sober curious",
          "On special occasions",
          "Socially on weekends",
          "Never",
        ].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              drinkingHabit === option && styles.selectedOption,
            ]}
            onPress={() => setDrinkingHabit(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.title}>How often do you smoke?</Text>
        {[
          "Social smoker",
          "Smoker when drinking",
          "Non-smoker",
          "Smoker",
          "Trying to quit",
        ].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              smokingHabit === option && styles.selectedOption,
            ]}
            onPress={() => setSmokingHabit(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.title}>Do you workout?</Text>
        {["Everyday", "Often", "Sometimes", "Never"].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              workoutHabit === option && styles.selectedOption,
            ]}
            onPress={() => setWorkoutHabit(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.title}>Do you have any pets?</Text>
        {[
          "Dog",
          "Cat",
          "Bird",
          "Fish",
          "Rabbit",
          "Hamster",
          "Turtle",
          "Allergic to pets",
          "Want a pet",
          "Pet-free",
        ].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              petHabit === option && styles.selectedOption,
            ]}
            onPress={() => setPetHabit(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Button title="Save" onPress={handleSaveLifestyle} />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text>Skip</Text>
        </TouchableOpacity>
        <Button title="Back" onPress={handleBack} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginVertical: 16,
    textAlign: "center",
  },
  optionButton: {
    width: "80%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  skipButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
  selectedOption: {
    backgroundColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default LifestyleScreen;
