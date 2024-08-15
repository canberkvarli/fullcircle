import React from "react";
import { Text, View, ImageBackground, TouchableOpacity } from "react-native";
import styles from "@/styles/Onboarding/WelcomeScreenStyles";
import { useUserContext } from "@/context/UserContext";

function WelcomeScreen() {
  const { navigateToNextScreen } = useUserContext();

  return (
    <ImageBackground
      source={require("../../assets/images/welcome.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to Circle</Text>
        <View style={styles.bottomContainer}>
          <Text style={styles.affirmation}>
            Your presence here is a blessing
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigateToNextScreen()}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

export default WelcomeScreen;
