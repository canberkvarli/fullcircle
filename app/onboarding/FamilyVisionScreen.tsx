import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import styles from "@/styles/Onboarding/FamilyVisionScreenStyles";
import Icon from "react-native-vector-icons/FontAwesome";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import Checkbox from "expo-checkbox";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";

const options = [
  "Don’t have children",
  "Have children",
  "Open to children",
  "Want Children",
];

function FamilyVisionScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedOption, setSelectedOption] = useState<string>(
    userData?.childrenPreference || options[0]
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );

  const handleOptionSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      await updateUserData({
        childrenPreference: selectedOption,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save preference: " + error.message);
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <OnboardingProgressBar currentScreen="FamilyVisionScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Family Visions</Text>
        <Text style={styles.subtitle}>Do you have or want children?</Text>
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedOption === option && styles.selectedOptionButton,
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields["childrenPreference"] || false}
            onValueChange={() => toggleHidden("childrenPreference")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Your vision of family is sacred and unique
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleOptionSubmit}
        >
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default FamilyVisionScreen;
