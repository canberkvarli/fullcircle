import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import styles from "@/styles/Onboarding/DatePreferenceScreenStyles";
import Icon from "react-native-vector-icons/FontAwesome";
import Checkbox from "expo-checkbox";
import { useUserContext } from "../../context/UserContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { SafeAreaView } from "react-native-safe-area-context";

const DatePreferenceScreen: React.FC = () => {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    userData?.matchPreferences?.datePreferences || []
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    datePreferences: userData?.hiddenFields?.datePreferences || false,
  });

  useEffect(() => {
    setHiddenFields((prev) => ({
      ...prev,
      datePreferences:
        prev.datePreferences !== undefined ? prev.datePreferences : false,
    }));
    setSelectedPreferences(userData?.matchPreferences?.datePreferences || []);
  }, [userData]);

  const handlePreferenceChange = (preference: string) => {
    setSelectedPreferences((prevPreferences) => {
      if (preference === "Everyone") {
        // If "Everyone" is selected, clear other preferences
        return ["Everyone"];
      }

      // If "Men" or "Women" is toggled, remove "Everyone" if it's selected
      const updatedPreferences = prevPreferences.includes(preference)
        ? prevPreferences.filter((item) => item !== preference)
        : [...prevPreferences, preference];

      // Remove "Everyone" if "Men" or "Women" is selected
      if (
        updatedPreferences.includes("Men") ||
        updatedPreferences.includes("Women")
      ) {
        return updatedPreferences.filter((item) => item !== "Everyone");
      }

      return updatedPreferences;
    });
  };

  const handleSubmit = async () => {
    // DRY
    try {
      await updateUserData({
        matchPreferences: {
          datePreferences: selectedPreferences,
          preferredEthnicities:
            userData.matchPreferences?.preferredEthnicities || [],
          preferredDistance: userData.matchPreferences?.preferredDistance || 0,
          desiredRelationship:
            userData.matchPreferences?.desiredRelationship || "",
          preferredAgeRange: userData.matchPreferences?.preferredAgeRange || {
            min: 18,
            max: 99,
          },
          preferredHeightRange: userData.matchPreferences
            ?.preferredHeightRange || { min: 0, max: 300 },
        },
        hiddenFields: {
          ...(userData.hiddenFields || {}),
          datePreferences: hiddenFields.datePreferences,
        },
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save date preferences: " + error.message);
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
        <OnboardingProgressBar currentScreen="DatePreferenceScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Date Preferences</Text>
        <View style={styles.preferenceContainer}>
          <TouchableOpacity
            style={[
              styles.preferenceButton,
              selectedPreferences.includes("Men") && styles.selectedButton,
            ]}
            onPress={() => handlePreferenceChange("Men")}
          >
            <Text
              style={[
                styles.preferenceText,
                selectedPreferences.includes("Men") && styles.selectedText,
              ]}
            >
              Men
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.preferenceButton,
              selectedPreferences.includes("Women") && styles.selectedButton,
            ]}
            onPress={() => handlePreferenceChange("Women")}
          >
            <Text
              style={[
                styles.preferenceText,
                selectedPreferences.includes("Women") && styles.selectedText,
              ]}
            >
              Women
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.preferenceButton,
              selectedPreferences.includes("Everyone") && styles.selectedButton,
            ]}
            onPress={() => handlePreferenceChange("Everyone")}
          >
            <Text
              style={[
                styles.preferenceText,
                selectedPreferences.includes("Everyone") && styles.selectedText,
              ]}
            >
              Everyone
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields.datePreferences || false}
            onValueChange={() => toggleHidden("datePreferences")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Seek connections that nourish your soul.
        </Text>
        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default DatePreferenceScreen;
