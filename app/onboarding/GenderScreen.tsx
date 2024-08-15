import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  TextInput,
} from "react-native";
import styles from "@/styles/Onboarding/GenderScreenStyles";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { Checkbox } from "expo-checkbox";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";

function GenderScreen() {
  const {
    navigateToNextScreen,
    navigateToPreviousScreen,
    updateUserData,
    userData,
  } = useUserContext();

  const [selectedGender, setSelectedGender] = useState<string | null>(
    userData?.gender || null
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    gender: userData?.hiddenFields?.gender || false,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleGender = (gender: string) => {
    setSelectedGender((prev) => (prev === gender ? null : gender));
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleNext = async () => {
    await updateUserData({
      gender: selectedGender || "",
      hiddenFields,
    });
    navigateToNextScreen();
  };

  const handlePrevious = async () => {
    await updateUserData({
      gender: selectedGender || "",
      hiddenFields,
    });
    navigateToPreviousScreen();
  };

  useEffect(() => {
    setHiddenFields((prev) => ({
      ...prev,
      gender: prev.gender !== undefined ? prev.gender : false,
    }));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <OnboardingProgressBar currentScreen="GenderScreen" />
        <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>How do you identify?</Text>

        <TouchableOpacity
          style={[
            styles.option,
            selectedGender === "Man" && styles.optionSelected,
          ]}
          onPress={() => toggleGender("Man")}
        >
          <Text style={styles.optionTitle}>Man</Text>
          <Text style={styles.optionSubtitle}>
            Radiate your masculine energy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            selectedGender === "Woman" && styles.optionSelected,
          ]}
          onPress={() => toggleGender("Woman")}
        >
          <Text style={styles.optionTitle}>Woman</Text>
          <Text style={styles.optionSubtitle}>
            Embrace your feminine essence
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text style={styles.dropdownButtonText}>
            {dropdownOpen ? "Hide" : "More options"}
          </Text>
          <Icon
            name={dropdownOpen ? "chevron-up" : "chevron-down"}
            size={24}
            color="black"
          />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdown}>
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
                  selectedGender === option.title && styles.optionSelected,
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
                    onChangeText={(text) => setSelectedGender(text)}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide from others</Text>
          <Checkbox
            value={hiddenFields.gender || false}
            onValueChange={() => toggleHidden("gender")}
            style={styles.checkbox}
          />
        </View>

        <Text style={styles.affirmation}>
          In the circle of life, every soul shines uniquely
        </Text>
      </ScrollView>
      <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
        <Icon name="chevron-right" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default GenderScreen;
