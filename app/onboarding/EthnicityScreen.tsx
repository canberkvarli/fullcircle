import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Checkbox } from "expo-checkbox";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";

const EthnicityScreen = () => {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>(
    userData?.ethnicities?.filter((ethnicity) =>
      ethnicities.includes(ethnicity)
    ) || []
  );
  const [otherEthnicity, setOtherEthnicity] = useState<string>(
    userData?.ethnicities?.find(
      (ethnicity) => !ethnicities.includes(ethnicity)
    ) || ""
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );

  const ethnicities = [
    "American Indian",
    "East Asian",
    "Black/African Descent",
    "Middle Eastern",
    "Hispanic Latino",
    "South Asian",
    "Pacific Islander",
    "White/Caucasian",
  ];

  const handleEthnicitySelect = (ethnicity: string) => {
    setSelectedEthnicities((prev) =>
      prev.includes(ethnicity)
        ? prev.filter((item) => item !== ethnicity)
        : [...prev, ethnicity]
    );
  };

  const handleEthnicitySubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      // Include 'otherEthnicity' if it is not empty
      const allEthnicities = otherEthnicity
        ? [...selectedEthnicities, otherEthnicity]
        : selectedEthnicities;

      await updateUserData({
        ethnicities: allEthnicities,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save ethnicities: " + error.message);
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Celebrate your heritage</Text>
        <ScrollView style={styles.ethnicityInputs}>
          {ethnicities.map((ethnicity) => (
            <TouchableOpacity
              key={ethnicity}
              style={[
                styles.ethnicityOption,
                selectedEthnicities.includes(ethnicity) &&
                  styles.selectedEthnicity,
              ]}
              onPress={() => handleEthnicitySelect(ethnicity)}
            >
              <Text style={styles.ethnicityText}>{ethnicity}</Text>
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.otherInput}
            placeholder="Other"
            value={otherEthnicity}
            onChangeText={setOtherEthnicity}
          />
        </ScrollView>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields["ethnicity"] || false}
            onValueChange={() => toggleHidden("ethnicity")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Your heritage is a rich tapestry of your identity.
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleEthnicitySubmit}
        >
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
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
  ethnicityInputs: {
    marginTop: 20,
    marginBottom: 20,
  },
  ethnicityOption: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
  },
  selectedEthnicity: {
    backgroundColor: "lightblue",
  },
  ethnicityText: {
    fontSize: 18,
  },
  otherInput: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
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

export default EthnicityScreen;
