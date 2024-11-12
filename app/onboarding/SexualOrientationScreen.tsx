import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  View,
} from "react-native";
import styles from "@/styles/Onboarding/SexualOrientationScreenStyles";
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
      setSelectedOptions([...selectedOptions, option]);
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

export default SexualOrientationScreen;
