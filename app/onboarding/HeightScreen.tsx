import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import styles from "@/styles/Onboarding/HeightScreenStyles";
import Icon from "react-native-vector-icons/FontAwesome";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import Checkbox from "expo-checkbox";
import { RulerPicker } from "react-native-ruler-picker";

function HeightScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [selectedHeight, setSelectedHeight] = useState<number>(
    parseInt(userData?.height ?? "130")
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    height: userData?.hiddenFields?.height || false,
  });
  const [unit, setUnit] = useState<"cm" | "ft">("cm");

  useEffect(() => {
    if (unit === "cm" && selectedHeight > 240) {
      setSelectedHeight(240); // Limit max height
    } else if (unit === "ft" && selectedHeight > 8) {
      setSelectedHeight(8); // Limit max height for feet
    }
  }, [unit]);

  const handleHeightSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      await updateUserData({
        hiddenFields: {
          ...userData.hiddenFields,
          height: hiddenFields.height,
        },
        height: selectedHeight.toString() + (unit === "cm" ? " cm" : " ft"),
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save height: " + error.message);
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
        <OnboardingProgressBar currentScreen="HeightScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Stand Tall</Text>
        <View style={styles.unitToggleContainer}>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "cm" && styles.selectedUnitButton,
            ]}
            onPress={() => setUnit("cm")}
          >
            <Text style={styles.unitButtonText}>CM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.unitButton,
              unit === "ft" && styles.selectedUnitButton,
            ]}
            onPress={() => setUnit("ft")}
          >
            <Text style={styles.unitButtonText}>FT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heightInputs}>
          <Text style={styles.subtitle}>What's your height?</Text>
          <RulerPicker
            min={unit === "cm" ? 130 : 2} // Set minimum based on unit
            max={unit === "cm" ? 240 : 8} // Set maximum based on unit
            step={unit === "cm" ? 1 : 0.1}
            initialValue={selectedHeight}
            onValueChange={(number) => setSelectedHeight(Number(number))}
            unit={unit}
            width={300}
            height={300}
            indicatorHeight={80}
            indicatorColor="black"
            valueTextStyle={styles.heightValue}
          />
        </View>
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Hide From Others</Text>
          <Checkbox
            value={hiddenFields["height"] || false}
            onValueChange={() => toggleHidden("height")}
            style={styles.checkbox}
          />
        </View>
        <Text style={styles.affirmation}>
          Every inch of you is perfectly designed
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleHeightSubmit}
        >
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default HeightScreen;
