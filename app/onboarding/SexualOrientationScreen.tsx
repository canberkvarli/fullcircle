import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";

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
  const {
    userData,
    updateUserData,
    navigateToPreviousScreen,
    navigateToNextScreen,
  } = useUserContext();

  useEffect(() => {
    if (userData.sexualOrientation) {
      setSelectedOptions(userData.sexualOrientation);
    }
    if (
      userData.hiddenFields &&
      userData.hiddenFields.sexualOrientation !== undefined
    ) {
      setShowOrientation(!userData.hiddenFields.sexualOrientation);
    }
  }, [userData]);

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
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigateToPreviousScreen}
      >
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
      </ScrollView>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Icon name="chevron-right" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Ensure enough space for the content to scroll
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
    position: "absolute",
    bottom: 70,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
  submitButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SexualOrientationScreen;
