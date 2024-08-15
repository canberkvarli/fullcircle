import React from "react";
import { Text, View, ImageBackground, TouchableOpacity } from "react-native";
import { useUserContext } from "@/context/UserContext";
import styles from "@/styles/Onboarding/AddBasicInfoScreenStyles";

function AddBasicInfoScreen() {
  const { navigateToNextScreen } = useUserContext();

  return (
    <ImageBackground
      source={require("../../assets/images/labyrinth.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Share Your Light</Text>
        <Text style={styles.subtitle}>
          Complete these steps to enhance your connections
        </Text>
        <View style={styles.bottomContainer}>
          <Text style={styles.affirmation}>
            Your light is a beacon for others
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigateToNextScreen()}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

export default AddBasicInfoScreen;
