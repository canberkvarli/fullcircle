import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserContext } from "@/context/UserContext";

function NameScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const {
    userData,
    navigateToNextScreen,
    navigateToPreviousScreen,
    updateUserData,
    saveProgress,
  } = useUserContext();

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

    try {
      saveProgress("NameScreen");
      updateUserData({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save name: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigateToPreviousScreen()}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity> */}
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
        Every name carries a unique vibration.
      </Text>
      <TouchableOpacity style={styles.submitButton} onPress={handleNameSubmit}>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </TouchableOpacity>
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
    position: "absolute",
    bottom: 70,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
  submitButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NameScreen;
