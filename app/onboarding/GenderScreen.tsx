import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

function GenderScreen() {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, phoneNumber, email, birthdate, firstName, lastName } = params;

  const handleGenderSubmit = async () => {
    if (!selectedGender) {
      Alert.alert("Error", "Please select a gender");
      return;
    }

    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(docRef, { gender: selectedGender }, { merge: true });
      Alert.alert("Success", "Gender saved successfully!", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "onboarding/OrientationScreen",
              params: {
                userId,
                phoneNumber,
                email,
                birthdate,
                firstName,
                lastName,
                gender: selectedGender,
              },
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", "Failed to save gender: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What is your gender?</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedGender === "Man" && styles.selectedOption,
          ]}
          onPress={() => setSelectedGender("Man")}
        >
          <Text style={styles.optionText}>Man</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedGender === "Woman" && styles.selectedOption,
          ]}
          onPress={() => setSelectedGender("Woman")}
        >
          <Text style={styles.optionText}>Woman</Text>
        </TouchableOpacity>
      </View>
      <Button title="Next" onPress={handleGenderSubmit} />
      <Button
        title="Back"
        onPress={() =>
          router.replace({
            pathname: "onboarding/BirthdayScreen",
            params: {
              userId,
              phoneNumber,
              email,
              birthdate,
              firstName,
              lastName,
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  optionButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: "lightblue",
  },
  optionText: {
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
});

export default GenderScreen;
