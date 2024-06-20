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

function AuthenticityScreen() {
  const [communicationStyle, setCommunicationStyle] = useState<string | null>(
    null
  );
  const [loveLanguage, setLoveLanguage] = useState<string | null>(null);
  const [educationLevel, setEducationLevel] = useState<string | null>(null);
  const [zodiacSign, setZodiacSign] = useState<string | null>(null);
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
    drinkingHabit,
    smokingHabit,
    workoutHabit,
    petHabit,
  } = params;

  const handleSaveAuthenticity = async () => {
    if (!userId || typeof userId !== "string") {
      alert("Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(
        docRef,
        {
          authenticity: {
            communicationStyle,
            loveLanguage,
            educationLevel,
            zodiacSign,
          },
        },
        { merge: true }
      );
      router.replace({
        pathname: "onboarding/AnythingYouLikeScreen",
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
          communicationStyle,
          loveLanguage,
          educationLevel,
          zodiacSign,
        },
      });
    } catch (error: any) {
      alert("Failed to save authenticity choices: " + error.message);
    }
  };

  const handleSkip = () => {
    router.replace({
      pathname: "onboarding/AnythingYouLikeScreen",
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
  };

  const handleBack = () => {
    router.replace({
      pathname: "onboarding/LifestyleScreen",
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>What is your communication style?</Text>
        {[
          "Big time texter",
          "Phone caller",
          "Video chatter",
          "Bad texter",
          "Better in person",
        ].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              communicationStyle === option && styles.selectedOption,
            ]}
            onPress={() => setCommunicationStyle(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.title}>How do you receive love?</Text>
        {[
          "Thoughtful gestures",
          "Presents",
          "Touch",
          "Compliments",
          "Time together",
        ].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              loveLanguage === option && styles.selectedOption,
            ]}
            onPress={() => setLoveLanguage(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.title}>What is your education level?</Text>
        {[
          "Bachelors",
          "In college",
          "High school",
          "PhD",
          "In grad school",
          "Masters",
          "Trade school",
        ].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              educationLevel === option && styles.selectedOption,
            ]}
            onPress={() => setEducationLevel(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.title}>What is your zodiac sign?</Text>
        {[
          "Aries",
          "Taurus",
          "Gemini",
          "Cancer",
          "Leo",
          "Virgo",
          "Libra",
          "Scorpio",
          "Sagittarius",
          "Capricorn",
          "Aquarius",
          "Pisces",
        ].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              zodiacSign === option && styles.selectedOption,
            ]}
            onPress={() => setZodiacSign(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        <Button title="Save" onPress={handleSaveAuthenticity} />
        <Button title="Skip" onPress={handleSkip} />
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
  selectedOption: {
    backgroundColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default AuthenticityScreen;
