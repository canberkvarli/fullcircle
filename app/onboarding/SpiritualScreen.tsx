import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Checkbox from "expo-checkbox";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";

const spiritualPractices = [
  "Yoga",
  "Meditation",
  "Cacao Ceremony",
  "Sound Healing",
  "Breathwork",
  "Reiki",
  "Crystal Healing",
  "Mindfulness",
  "Tarot Reading",
  "Astrology",
  "Energy Healing",
  "Shamanic Journeys",
  "Chakra Balancing",
  "Qigong",
  "Ayurveda",
  "Plant Medicine",
  "Sacred Sexuality",
  "Nature Retreats",
];

function SpiritualScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedPractices, setSelectedPractices] = useState<string[]>(
    userData?.spiritualPractices || []
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );
  const [otherPractice, setOtherPractice] = useState<string>(
    userData?.spiritualPractices?.find(
      (practice) => !spiritualPractices.includes(practice)
    ) || ""
  );

  const handlePracticeSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      const allPractices = [...selectedPractices];
      if (otherPractice) {
        allPractices.push(otherPractice);
      }

      await updateUserData({
        spiritualPractices: allPractices,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Failed to save spiritual practices: " + error.message
      );
    }
  };

  const togglePractice = (practice: string) => {
    setSelectedPractices((prev) =>
      prev.includes(practice)
        ? prev.filter((p) => p !== practice)
        : [...prev, practice]
    );
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Spiritual Path</Text>
        <Text style={styles.subtitle}>
          Which spiritual practices resonate with you?
        </Text>
        <View style={styles.spiritualInputs}>
          <FlatList
            data={spiritualPractices}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = selectedPractices.includes(item);
              return (
                <TouchableOpacity
                  style={[
                    styles.optionContainer,
                    isSelected && styles.selectedOptionContainer,
                  ]}
                  onPress={() => togglePractice(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingVertical: 20 }}
          />
          <View style={styles.otherInputContainer}>
            <TextInput
              style={styles.otherInput}
              placeholder="Other"
              value={otherPractice}
              onChangeText={setOtherPractice}
            />
          </View>
        </View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields["spiritualPractices"] || false}
            onValueChange={() => toggleHidden("spiritualPractices")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Walk your spiritual path with grace and intention.
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handlePracticeSubmit}
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
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 35,
    textAlign: "left",
    marginTop: 50,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  spiritualInputs: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 20,
  },
  optionContainer: {
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
  },
  selectedOptionContainer: {
    backgroundColor: "lightblue",
  },
  optionText: {
    fontSize: 18,
    textAlign: "center",
  },
  selectedOptionText: {
    color: "black",
  },
  otherInputContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  otherInput: {
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
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
    marginTop: 20,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
    position: "absolute",
    bottom: 70,
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

export default SpiritualScreen;
