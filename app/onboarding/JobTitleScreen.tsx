import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import styles from "@/styles/Onboarding/JobTitleScreenStyles";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import Icon from "react-native-vector-icons/FontAwesome";
import Checkbox from "expo-checkbox";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";

function JobTitleScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [jobTitle, setJobTitle] = useState<string>(userData?.jobTitle || "");
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );

  const handleJobTitleSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      await updateUserData({
        jobTitle: jobTitle,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save job title: " + error.message);
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
        <OnboardingProgressBar currentScreen="JobTitleScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Role</Text>
        <Text style={styles.subtitle}>What is your job title?</Text>
        <View style={styles.jobInputContainer}>
          <TextInput
            style={styles.jobInput}
            placeholder="Enter your job title (e.g., Yoga Instructor)"
            value={jobTitle}
            onChangeText={setJobTitle}
          />
        </View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields["jobTitle"] || false}
            onValueChange={() => toggleHidden("jobTitle")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Every role you play is meaningful and valued.
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleJobTitleSubmit}
        >
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default JobTitleScreen;
