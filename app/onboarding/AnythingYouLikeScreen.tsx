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

const options = [
  "Harry Potter",
  "Movies",
  "90's Kid",
  "Hippies",
  "Nintendo",
  "Marvel",
  "DC Comics",
  "Anime",
  "Manga",
  "K-Pop",
  "Classic Rock",
  "Jazz",
  "Hip Hop",
  "R&B",
  "Country Music",
  "Gaming",
  "Board Games",
  "Fitness",
  "Yoga",
  "Meditation",
  "Traveling",
  "Cooking",
  "Baking",
  "Art",
  "Photography",
  "Blogging",
  "Vlogging",
  "Podcasts",
  "Reading",
  "Writing",
  "Hiking",
  "Camping",
  "Fishing",
  "Cycling",
  "Running",
  "Swimming",
  "Surfing",
  "Skiing",
  "Snowboarding",
  "Skateboarding",
  "Fashion",
  "DIY Projects",
  "Gardening",
  "Astronomy",
  "Technology",
  "Science",
  "History",
  "Politics",
  "Spirituality",
  "Mindfulness",
  "Volunteering",
  "Animals",
  "Cars",
  "Motorcycles",
  "Coffee",
  "Tea",
  "Craft Beer",
  "Wine Tasting",
  "Collecting",
  "Antiques",
  "Interior Design",
  "Dancing",
  "Music Festivals",
  "Concerts",
  "Theater",
  "Musicals",
  "Opera",
  "Stand-up Comedy",
  "Magic Tricks",
  "Puzzles",
  "Escape Rooms",
  "Paintball",
  "Laser Tag",
  "Archery",
  "Martial Arts",
  "Bird Watching",
  "Nature Walks",
  "Scuba Diving",
  "Snorkeling",
  "Sailing",
  "Kayaking",
  "Rock Climbing",
  "Mountaineering",
];

function AnythingYouLikeScreen() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
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
    communicationStyle,
    loveLanguage,
    educationLevel,
    zodiacSign,
  } = params;

  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prevSelectedOptions) =>
      prevSelectedOptions.includes(option)
        ? prevSelectedOptions.filter((item) => item !== option)
        : [...prevSelectedOptions, option]
    );
  };

  const handleSavePreferences = async () => {
    if (!userId || typeof userId !== "string") {
      alert("Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(
        docRef,
        {
          preferences: selectedOptions,
        },
        { merge: true }
      );
      router.replace({
        pathname: "onboarding/HomeScreen",
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
          preferences: selectedOptions,
        },
      });
    } catch (error: any) {
      alert("Failed to save preferences: " + error.message);
    }
  };

  const handleBack = () => {
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
        communicationStyle,
        loveLanguage,
        educationLevel,
        zodiacSign,
      },
    });
  };

  const handleSkip = () => {
    router.replace({
      pathname: "onboarding/HomeScreen",
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>
          You like what you like. Let everyone know.
        </Text>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedOptions.includes(option) && styles.selectedOption,
            ]}
            onPress={() => handleOptionToggle(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
        <Button title="Save" onPress={handleSavePreferences} />
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

export default AnythingYouLikeScreen;
