import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import NavigationIcon from "react-native-vector-icons/FontAwesome";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";

function NameScreen() {
  const { userData, navigateToNextScreen, updateUserData, signOut } =
    useUserContext();
  const router = useRouter();
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");

  const handleInputChange = (text: string, type: string) => {
    if (/^[a-zA-Z\s]*$/.test(text)) {
      type === "firstName" ? setFirstName(text) : setLastName(text);
    }
  };

  const handleNameSubmit = async () => {
    if (firstName.trim() === "") {
      Alert.alert("Error", "First name cannot be empty");
      return;
    }

    if (!userData.userId || typeof userData.userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const fullName = trimmedLastName
      ? `${trimmedFirstName} ${trimmedLastName}`
      : trimmedFirstName;

    try {
      await updateUserData({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName,
      });
      navigateToNextScreen();
    } catch (error) {
      console.error("Error submitting name:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgressBar currentScreen="NameScreen" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          router.replace("onboarding/LoginSignupScreen" as any);
          signOut();
        }}
      >
        <NavigationIcon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>What's your name?</Text>
      <TextInput
        style={styles.input}
        placeholder="First name"
        placeholderTextColor="gray"
        value={firstName}
        onChangeText={(text) => handleInputChange(text, "firstName")}
        autoFocus={true}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name (optional)"
        placeholderTextColor="gray"
        value={lastName}
        onChangeText={(text) => handleInputChange(text, "lastName")}
      />
      <TouchableOpacity onPress={() => console.log("Why? clicked")}>
        <Text style={styles.optionalText}>
          Last name is optional and only shared with matches.{" "}
          <Text style={styles.linkText}>Why?</Text>
        </Text>
      </TouchableOpacity>
      <Text style={styles.affirmation}>
        Every name carries a unique vibration
      </Text>
      <Icon
        style={styles.submitButton}
        name="chevron-right"
        size={24}
        onPress={handleNameSubmit}
      />
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
    bottom: 20,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 65,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  optionalText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "gray",
    marginHorizontal: 16,
    marginBottom: 30,
  },
  linkText: {
    fontStyle: "normal",
    textDecorationLine: "underline",
    color: "blue",
  },
  affirmation: {
    top: 240,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
  submitButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NameScreen;
