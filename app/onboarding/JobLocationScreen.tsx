import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import styles from "@/styles/Onboarding/JobLocationScreenStyles";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import Icon from "react-native-vector-icons/FontAwesome";
import Checkbox from "expo-checkbox";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";

function JobLocationScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [jobLocation, setJobLocation] = useState<string>(
    userData?.jobLocation || ""
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );

  const handleJobLocationSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      await updateUserData({
        jobLocation: jobLocation,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save job location: " + error.message);
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
        <OnboardingProgressBar currentScreen="JobLocationScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Your calling</Text>
        <Text style={styles.subtitle}>Where do you work?</Text>
        <View style={styles.jobInputContainer}>
          <TextInput
            style={styles.jobInput}
            placeholder="Enter your workplace"
            value={jobLocation}
            onChangeText={setJobLocation}
          />
        </View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields["jobLocation"] || false}
            onValueChange={() => toggleHidden("jobLocation")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Your work is a reflection of your inner purpose.
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleJobLocationSubmit}
        >
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default JobLocationScreen;
