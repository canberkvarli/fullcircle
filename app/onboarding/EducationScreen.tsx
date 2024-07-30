import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import Icon from "react-native-vector-icons/FontAwesome";
import Checkbox from "expo-checkbox";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";

const educationLevels = [
  "High School",
  "Undergrad",
  "Postgrad",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Certification",
];

function EducationScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedEducation, setSelectedEducation] = useState<string>(
    userData?.educationDegree || educationLevels[0]
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );

  const handleEducationSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      await updateUserData({
        educationDegree: selectedEducation,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save education level: " + error.message);
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const renderEducationOptions = (data: string[]) => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isSelected = item === selectedEducation;
          const color = isSelected ? "black" : "gray";
          const backgroundColor = isSelected ? "lightblue" : "transparent";

          return (
            <TouchableOpacity
              style={[styles.optionContainer, { backgroundColor }]}
              onPress={() => setSelectedEducation(item)}
            >
              <Text style={[styles.optionText, { color }]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <OnboardingProgressBar currentScreen="EducationScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Path of Learning</Text>
        <Text style={styles.subtitle}>
          What is your highest education level?
        </Text>
        <View style={styles.educationInputs}>
          {renderEducationOptions(educationLevels)}
        </View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields["educationDegree"] || false}
            onValueChange={() => toggleHidden("educationDegree")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Your journey of learning is a path to wisdom
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleEducationSubmit}
        >
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  backButton: {
    bottom: 20,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 50,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "left",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  educationInputs: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 20,
    bottom: 10,
  },
  optionContainer: {
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
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
    left: 10,
  },
  affirmation: {
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
    paddingBottom: 50,
    marginTop: 10,
  },
  nextButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EducationScreen;
