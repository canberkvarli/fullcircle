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
import Checkbox from "expo-checkbox";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";

function GenderScreen() {
  const {
    navigateToNextScreen,
    navigateToPreviousScreen,
    updateUserData,
    userData,
  } = useUserContext();

  const [selectedGender, setSelectedGender] = useState<string[]>(
    userData?.gender || []
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    gender: userData?.hiddenFields?.gender || false,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customOther, setCustomOther] = useState<string>("");

  const toggleGender = (gender: string) => {
    if (gender === "Other") {
      if (selectedGender.includes("Other")) {
        setSelectedGender(selectedGender.filter((g) => g !== "Other"));
        setCustomOther("");
      } else {
        setSelectedGender([...selectedGender, "Other"]);
      }
    } else {
      if (selectedGender.includes(gender)) {
        setSelectedGender(selectedGender.filter((g) => g !== gender));
      } else {
        setSelectedGender([...selectedGender, gender]);
      }
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleNext = async () => {
    // Replace "Other" with the custom input if provided.
    const finalGender = selectedGender.map((g) =>
      g === "Other" ? (customOther ? customOther : "Other") : g
    );
    await updateUserData({
      gender: finalGender,
      hiddenFields,
    });
    navigateToNextScreen();
  };

  const handlePrevious = async () => {
    const finalGender = selectedGender.map((g) =>
      g === "Other" ? (customOther ? customOther : "Other") : g
    );
    await updateUserData({
      gender: finalGender,
      hiddenFields,
    });
    navigateToPreviousScreen();
  };

  useEffect(() => {
    // Ensure hiddenFields.gender is set to a boolean.
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

        {/* Main options */}
        <TouchableOpacity
          style={[
            styles.option,
            selectedGender.includes("Man") && styles.optionSelected,
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
            selectedGender.includes("Woman") && styles.optionSelected,
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
              { title: "Non-binary", subtitle: "Be your true self" },
              { title: "Genderqueer", subtitle: "Embrace your uniqueness" },
              { title: "Agender", subtitle: "Express your uniqueness" },
              { title: "Genderfluid", subtitle: "Embrace fluidity" },
              { title: "Trans Woman", subtitle: "Celebrate your identity" },
              { title: "Trans Man", subtitle: "Express your identity" },
              { title: "Two-Spirit", subtitle: "Honor your sacred duality" },
              { title: "Bigender", subtitle: "Celebrate your duality" },
              { title: "Intersex", subtitle: "Embrace your uniqueness" },
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
                  selectedGender.includes(option.title) &&
                    styles.optionSelected,
                ]}
                onPress={() => toggleGender(option.title)}
              >
                <Text style={styles.optionTitle}>{option.title}</Text>
                {option.subtitle && (
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                )}
                {option.input && selectedGender.includes("Other") && (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter here"
                    value={customOther}
                    onChangeText={setCustomOther}
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
