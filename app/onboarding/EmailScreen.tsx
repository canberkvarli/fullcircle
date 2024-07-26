import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { useUserContext } from "../../context/UserContext";

function EmailScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
    saveProgress,
  } = useUserContext();
  const [email, setEmail] = useState(userData.email || "");
  const [marketingRequested, setMarketingRequested] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  GoogleSignin.configure({
    webClientId:
      "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com",
  });

  const handleEmailSubmit = async () => {
    if (email.trim() === "") {
      Alert.alert("Error", "Email cannot be empty");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      await updateUserData({ email, marketingRequested });
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert("Error", "Failed to save email: " + error.message);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleModalOption = async (option: number) => {
    switch (option) {
      case 1:
        Alert.alert("Connect Apple Account", "Feature coming soon!");
        break;
      case 2:
        try {
          await GoogleSignin.hasPlayServices();
          const { idToken } = await GoogleSignin.signIn();
          const googleCredential = auth.GoogleAuthProvider.credential(idToken);
          const { user } = await auth().signInWithCredential(googleCredential);
          console.log("userID from Google Sign-In:", user.uid);

          await updateUserData({
            userId: user.uid,
            GoogleSSOEnabled: true,
          });

          if (!user.emailVerified) {
            await user.sendEmailVerification();
            navigateToNextScreen();
          }
        } catch (error) {
          console.error("Google sign-in error: ", error);
          Alert.alert("Error", "Failed to link Google account: " + error);
        }
        break;
      default:
        navigateToNextScreen();
        break;
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          console.log("navigating to previous screen");
          navigateToPreviousScreen();
        }}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Stay Connected</Text>
      <Text style={styles.subtitle}>Enter your email address</Text>
      <TextInput
        style={styles.input}
        placeholder="email@example.com"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoFocus={true}
      />
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => setMarketingRequested((prev) => !prev)}
        >
          <Ionicons
            name={marketingRequested ? "radio-button-on" : "radio-button-off"}
            size={24}
            color="black"
          />
          <Text style={styles.toggleText}>
            I do not wish to receive marketing communications about Circle
            products and services.
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.affirmation}>
        Open the channels of communication and connection
      </Text>
      <TouchableOpacity style={styles.submitButton} onPress={handleEmailSubmit}>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Connect your account?</Text>
              <Text style={styles.modalSubtitle}>
                Linking your account makes it easier to connect.
              </Text>
              {[
                { option: 1, text: "Connect your Apple account" },
                { option: 2, text: "Connect your Google account" },
                { option: 3, text: "No thanks" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.option}
                  style={styles.modalOption}
                  onPress={() => handleModalOption(item.option)}
                >
                  <Text>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "left",
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  toggleContainer: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "gray",
    marginLeft: 10,
  },
  affirmation: {
    position: "absolute",
    bottom: 85,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
    left: 15,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
});

export default EmailScreen;
