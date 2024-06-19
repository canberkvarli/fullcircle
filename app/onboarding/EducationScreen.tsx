import React, { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const API_ENDPOINT = "https://api.schools.org/search"; // Replace with your real API endpoint

function EducationScreen() {
  const [schoolName, setSchoolName] = useState("");
  const [schoolsList, setSchoolsList] = useState<string[]>([]);
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

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        if (schoolName.trim() !== "") {
          const response = await fetch(`${API_ENDPOINT}?name=${schoolName}`);
          if (!response.ok) {
            throw new Error("Failed to fetch schools");
          }
          const data = await response.json();
          setSchoolsList(data.schools); // Adjust based on your API response structure
        } else {
          setSchoolsList([]);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        Alert.alert(
          "Error",
          "Failed to fetch schools. Please try again later."
        );
      }
    };

    fetchSchools();
  }, [schoolName]);

  const handleSkip = () => {
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
      },
    });
  };

  const handleSchoolSelect = async (selectedSchool: string) => {
    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(docRef, { school: selectedSchool }, { merge: true });
      Alert.alert("Success", "School saved successfully!", [
        {
          text: "OK",
          onPress: () =>
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
                school: selectedSchool,
              },
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", "Failed to save school: " + error.message);
    }
  };

  const handleBack = () => {
    router.replace({
      pathname: "onboarding/DesiredRelationshipScreen",
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
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Enter a school name, past or current</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter school name"
        value={schoolName}
        onChangeText={setSchoolName}
      />
      <FlatList
        style={styles.list}
        data={schoolsList}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.schoolItem}
            onPress={() => handleSchoolSelect(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyList}>No schools found</Text>
        }
      />
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text>Skip</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleBack}>
        <Text>Back</Text>
      </TouchableOpacity>
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
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: "80%",
  },
  list: {
    width: "80%",
    marginBottom: 20,
    maxHeight: 200,
  },
  schoolItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  emptyList: {
    textAlign: "center",
    marginTop: 10,
  },
  skipButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
});

export default EducationScreen;
