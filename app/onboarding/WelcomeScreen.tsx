import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUserContext } from "@/context/UserContext";

function WelcomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, phoneNumber } = params;
  const { navigateToNextScreen, updateUserData } = useUserContext();

  const handleStart = async () => {
    if (typeof userId === "string" && typeof phoneNumber === "string") {
      try {
        await updateUserData({ currentOnboardingScreen: "NameScreen" });
        navigateToNextScreen();
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }
  };

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
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adding a dark overlay for better text visibility
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 48,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    marginLeft: 5,
    fontWeight: "bold",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  affirmation: {
    color: "white",
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.39,
    shadowRadius: 8.3,
    elevation: 13,
  },
  startButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
