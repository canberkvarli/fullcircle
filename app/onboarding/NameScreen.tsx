import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  View,
} from "react-native";
import styles from "@/styles/Onboarding/NameScreenStyles";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import { useUserContext } from "@/context/UserContext";
import NavigationIcon from "react-native-vector-icons/FontAwesome";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";

function NameScreen() {
  const { userData, navigateToNextScreen, updateUserData, signOut } =
    useUserContext();
  const router = useRouter();
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user?.displayName) {
        const [first, last] = user.displayName.split(" ");
        setFirstName(first);
        setLastName(last || "");
      }
    });
    return unsubscribe;
  }, []);

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
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
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
        autoFocus
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name (optional)"
        placeholderTextColor="gray"
        value={lastName}
        onChangeText={(text) => handleInputChange(text, "lastName")}
      />
      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
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

      <Modal
        transparent
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Why We Ask for Your Name</Text>
            <Text style={styles.modalText}>
              Sharing your name creates a warm and authentic connection. Your
              last name is optional and will only be shared with people you
              match with, ensuring your privacy while allowing for a more
              personal connection.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default NameScreen;
