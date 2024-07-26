import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserContext } from "../../context/UserContext"; // Adjust import based on your file structure

const options = [
  "Straight",
  "Gay",
  "Lesbian",
  "Bisexual",
  "Asexual",
  "Demisexual",
  "Pansexual",
  "Queer",
  "Questioning",
];

const SexualOrientationScreen = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showOrientation, setShowOrientation] = useState<boolean>(false);
  const router = useRouter();
  const {
    userData,
    updateUserData,
    navigateToPreviousScreen,
    navigateToNextScreen,
  } = useUserContext();

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

    try {
      await updateUserData({
        sexualOrientation: selectedOptions,
        hiddenFields: {
          ...(userData.hiddenFields || {}),
          sexualOrientation: !showOrientation,
        },
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Failed to save sexual orientation: " + error.message
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Love is Love</Text>
      <Text style={styles.subtitle}>Share your sexual orientation</Text>
      <Text style={styles.minititle}>Select up to 3</Text>
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
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          Show my orientation on my profile
        </Text>
        <Switch
          value={showOrientation}
          onValueChange={setShowOrientation}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={showOrientation ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>
      <Text style={styles.affirmation}>
        Embrace love in all its beautiful forms.
      </Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={navigateToPreviousScreen}
          style={styles.chevronButton}
        >
          <Text style={styles.chevronText}>{"<"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={styles.chevronButton}>
          <Text style={styles.chevronText}>{">"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  minititle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
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
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  toggleLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  affirmation: {
    fontSize: 16,
    marginVertical: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  chevronButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
  },
  chevronText: {
    fontSize: 24,
  },
});

export default SexualOrientationScreen;
