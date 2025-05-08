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

// Helper to format a height (in feet as a float) into a feet/inches string.
function formatHeight(height: number): string {
  const feet = Math.floor(height);
  const inches = Math.round((height - feet) * 12);
  return `${feet}'${inches}"`;
}

function HeightScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  // Initialize selectedHeight as a number (default to 6 if no value exists)
  const [selectedHeight, setSelectedHeight] = useState<number>(
    typeof userData?.height === "number" ? userData.height : 6
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    height: userData?.hiddenFields?.height || false,
  });

  // Clamp the height between 3 ft and 8 ft.
  useEffect(() => {
    if (selectedHeight < 3) {
      setSelectedHeight(3);
    } else if (selectedHeight > 8) {
      setSelectedHeight(8);
    }
  }, [selectedHeight]);

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
        height: selectedHeight,
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

        <View style={styles.heightInputs}>
          <Text style={styles.subtitle}>What's your height?</Text>
          <RulerPicker
            min={3}
            max={8}
            step={0.1}
            initialValue={selectedHeight}
            onValueChange={(number) => setSelectedHeight(Number(number))}
            unit="ft"
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
