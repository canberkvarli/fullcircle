import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserContext } from "@/context/UserContext";
import { Checkbox } from "expo-checkbox";

function GenderScreen() {
  const {
    navigateToNextScreen,
    navigateToPreviousScreen,
    updateUserData,
    userData,
  } = useUserContext();

  const [selectedGenders, setSelectedGenders] = useState<string[]>(
    userData.genders || []
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleGender = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender)
        ? prev.filter((item) => item !== gender)
        : [...prev, gender]
    );
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleNext = async () => {
    await updateUserData({ genders: selectedGenders, hiddenFields });
    navigateToNextScreen();
  };

  const handlePrevious = async () => {
    await updateUserData({ genders: selectedGenders, hiddenFields });
    navigateToPreviousScreen();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>How do you identify?</Text>

      <TouchableOpacity
        style={[
          styles.option,
          selectedGenders.includes("Man") && styles.optionSelected,
        ]}
        onPress={() => toggleGender("Man")}
      >
        <Text style={styles.optionTitle}>Man</Text>
        <Text style={styles.optionSubtitle}>Radiate your masculine energy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          selectedGenders.includes("Woman") && styles.optionSelected,
        ]}
        onPress={() => toggleGender("Woman")}
      >
        <Text style={styles.optionTitle}>Woman</Text>
        <Text style={styles.optionSubtitle}>Embrace your feminine essence</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text style={styles.dropdownButtonText}>
          {dropdownOpen ? "Hide" : "More options"}
        </Text>
        <Ionicons
          name={dropdownOpen ? "chevron-up" : "chevron-down"}
          size={24}
          color="black"
        />
      </TouchableOpacity>

      {dropdownOpen && (
        <ScrollView style={styles.dropdown}>
          {[
            { title: "Non-binary" },
            { title: "Genderqueer" },
            { title: "Agender" },
            { title: "Two-Spirit", subtitle: "Honor your sacred duality" },
            {
              title: "Other",
              subtitle: "Describe your unique path",
              input: true,
            },
          ].map((option) => (
            <TouchableOpacity
              key={option.title}
              style={[
                styles.option,
                selectedGenders.includes(option.title) && styles.optionSelected,
              ]}
              onPress={() => toggleGender(option.title)}
            >
              <Text style={styles.optionTitle}>{option.title}</Text>
              {option.subtitle && (
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              )}
              {option.input && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter here"
                  onChangeText={(text) =>
                    setSelectedGenders((prev) =>
                      prev.filter((item) => item !== "Other").concat(text)
                    )
                  }
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.hiddenContainer}>
        <Text style={styles.hiddenText}>Hide Gender Field</Text>
        <Checkbox
          value={hiddenFields["genders"] || false}
          onValueChange={() => toggleHidden("genders")}
          style={styles.checkbox}
        />
      </View>

      <Text style={styles.affirmation}>
        In the circle of life, every soul shines uniquely.
      </Text>
      <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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
  title: {
    fontSize: 30,
    textAlign: "left",
    marginTop: 100,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  option: {
    padding: 20,
    margin: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "black",
  },
  optionSelected: {
    backgroundColor: "#d3d3d3",
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  optionSubtitle: {
    fontSize: 16,
    fontStyle: "italic",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  dropdownButtonText: {
    fontSize: 18,
    marginRight: 10,
  },
  dropdown: {
    marginTop: 10,
    maxHeight: 200,
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
  },
  checkbox: {
    width: 20,
    height: 20,
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
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
  },
});

export default GenderScreen;
