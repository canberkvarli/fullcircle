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

const options = ["Straight", "Gay", "Lesbian", "Bisexual", "Asexual", "Other"];

function SexualOrientationScreen() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, phoneNumber, email, birthdate, firstName, lastName, gender } =
    params;

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      if (selectedOptions.length < 3) {
        setSelectedOptions([...selectedOptions, option]);
      } else {
        Alert.alert("Error", "You can only select up to 3 options");
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      Alert.alert("Error", "Please select at least one option");
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
        { sexualOrientation: selectedOptions },
        { merge: true }
      );
      Alert.alert("Success", "Sexual orientation saved successfully!", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "onboarding/InterestScreen",
              params: {
                userId,
                phoneNumber,
                email,
                birthdate,
                firstName,
                lastName,
                gender,
                sexualOrientation: selectedOptions,
              },
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Failed to save sexual orientation: " + error.message
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What is your sexual orientation?</Text>
      <Text style={styles.subtitle}>Select up to 3 options</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedOptions.includes(option) && styles.selectedOption,
            ]}
            onPress={() => toggleOption(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Submit" onPress={handleSubmit} />
      <Button
        title="Back"
        onPress={() =>
          router.replace({
            pathname: "onboarding/GenderScreen",
            params: {
              userId,
              phoneNumber,
              email,
              birthdate,
              firstName,
              lastName,
              gender,
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
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  optionButton: {
    flexBasis: "45%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    margin: 5,
  },
  selectedOption: {
    backgroundColor: "lightblue",
  },
  optionText: {
    fontSize: 16,
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

export default SexualOrientationScreen;
