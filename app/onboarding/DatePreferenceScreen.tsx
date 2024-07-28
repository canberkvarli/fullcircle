import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Checkbox from "expo-checkbox";
import { useUserContext } from "@/context/UserContext";

const options = ["Men", "Women", "Everyone"];

const DatePreferenceScreen = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);
  const {
    userData,
    updateUserData,
    navigateToPreviousScreen,
    navigateToNextScreen,
  } = useUserContext();

  useEffect(() => {
    if (userData.datePreferences) {
      setSelectedOptions(userData.datePreferences);
    }
    if (userData.hiddenFields?.datePreferences) {
      setHidden(true);
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
      const hiddenFields = { ...userData.hiddenFields };
      if (hidden) {
        hiddenFields.datePreferences = true;
      } else {
        delete hiddenFields.datePreferences;
      }

      await updateUserData({
        datePreferences: selectedOptions,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save date preferences: " + error.message);
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
        <Text style={styles.title}>Who Do You Want to Date?</Text>
        <Text style={styles.subtitle}>Choose up to 3</Text>
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
            value={hidden}
            onValueChange={setHidden}
            style={styles.checkbox}
          />
        </View>
      </ScrollView>
      <Text style={styles.affirmation}>
        Seek connections that nourish your soul.
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
    fontSize: 45,
    textAlign: "left",
    marginTop: 50,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  subtitle: {
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
  hiddenContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 16,
  },
  hiddenText: {
    fontSize: 18,
    marginRight: 8, // Add margin between the text and checkbox
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  affirmation: {
    bottom: 50,
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

export default DatePreferenceScreen;
