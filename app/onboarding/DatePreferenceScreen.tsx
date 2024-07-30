import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Checkbox from "expo-checkbox";
import { useUserContext } from "../../context/UserContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const DatePreferenceScreen: React.FC = () => {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    userData?.datePreferences || []
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
    setSelectedPreferences(userData?.datePreferences || []);
  }, [userData]);

  const handlePreferenceChange = (preference: string) => {
    setSelectedPreferences((prevPreferences) =>
      prevPreferences.includes(preference)
        ? prevPreferences.filter((item) => item !== preference)
        : [...prevPreferences, preference]
    );
  };

  const handleSubmit = async () => {
    try {
      await updateUserData({
        datePreferences: selectedPreferences,
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
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Date Preferences</Text>
        <Text style={styles.subtitle}>
          Seek connections that nourish your soul.
        </Text>
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
        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 50,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 20,
    textAlign: "left",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  preferenceContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  preferenceButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: "lightblue",
  },
  preferenceText: {
    fontSize: 18,
  },
  selectedText: {
    color: "white",
  },
  hiddenContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  hiddenText: {
    fontSize: 16,
    marginRight: 10,
  },
  checkbox: {
    alignSelf: "center",
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    width: 20,
    height: 20,
  },
  nextButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    zIndex: 1,
  },
});

export default DatePreferenceScreen;
