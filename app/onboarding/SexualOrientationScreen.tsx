import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { Checkbox } from "expo-checkbox";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";

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
  const {
    userData,
    updateUserData,
    navigateToPreviousScreen,
    navigateToNextScreen,
  } = useUserContext();

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    sexualOrientation: userData?.hiddenFields?.sexualOrientation || false,
  });

  useEffect(() => {
    setHiddenFields((prev) => ({
      ...prev,
      sexualOrientation:
        prev.sexualOrientation !== undefined ? prev.sexualOrientation : false,
    }));
    if (userData.sexualOrientation) {
      setSelectedOptions(userData.sexualOrientation);
    }
  }, [userData]);

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

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
        hiddenFields,
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
      <OnboardingProgressBar currentScreen="SexualOrientationScreen" />
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
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide from others</Text>
          <Checkbox
            value={hiddenFields.sexualOrientation || false}
            onValueChange={() => toggleHidden("sexualOrientation")}
            style={styles.checkbox}
          />
        </View>
      </ScrollView>
      <Text style={styles.affirmation}>
        Embrace love in all its beautiful forms
      </Text>
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
    bottom: 20,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 40,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "left",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  minititle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
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
  hiddenContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  hiddenText: {
    fontSize: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  affirmation: {
    bottom: 40,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
  submitButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SexualOrientationScreen;
