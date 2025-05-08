import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  View,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import styles from "@/styles/Onboarding/EmailScreenStyles";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import RadioIcon from "react-native-vector-icons/Fontisto";
import NavigationIcon from "react-native-vector-icons/FontAwesome";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { useUserContext } from "../../context/UserContext";
import { FIREBASE_AUTH } from "@/services/FirebaseConfig";

function EmailScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
    googleCredential,
  } = useUserContext();
  const [email, setEmail] = useState("");
  const [marketingRequested, setMarketingRequested] = useState(
    userData?.marketingRequested ?? true
  );
  const [modalVisible, setModalVisible] = useState(false);

  GoogleSignin.configure({
    webClientId:
      "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com",
  });

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user?.email) {
        setEmail(user.email);
      }
    });
    return unsubscribe;
  }, []);

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
      await updateUserData({
        email,
        marketingRequested: marketingRequested ? false : true,
      });
      setModalVisible(true);
    } catch (error: any) {
      Alert.alert("Error", "Failed to save email: " + error.message);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const { user } =
        await FIREBASE_AUTH.signInWithCredential(googleCredential);
      const userId = await user.getIdToken();
      console.log("userID from Google Sign-In:", userId);

      await updateUserData({
        userId,
        GoogleSSOEnabled: true,
      });

      //Link google account to this user.

      if (!user.emailVerified) {
        await user.sendEmailVerification();
        navigateToNextScreen();
      }
    } catch (error) {
      console.error("Google sign-in error: ", error);
      Alert.alert("Error", "Failed to link Google account: " + error);
    }
  };

  const handleModalOption = (option: number) => {
    switch (option) {
      case 1:
        Alert.alert("Connect Apple Account", "Feature coming soon!");
        break;
      case 2:
        if (googleCredential) {
          Alert.alert(
            "Switch Google Account",
            "Would you like to switch your Google account?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Switch",
                onPress: () => {
                  GoogleSignin.signOut().then(() => handleGoogleSignIn());
                },
              },
            ]
          );
        } else {
          handleGoogleSignIn();
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
      <OnboardingProgressBar currentScreen="EmailScreen" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigateToPreviousScreen}
      >
        <NavigationIcon name="chevron-left" size={24} color="black" />
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
          <RadioIcon
            name={marketingRequested ? "radio-btn-passive" : "radio-btn-active"}
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
        <NavigationIcon name="chevron-right" size={24} />
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
                  style={[
                    styles.modalOption,
                    item.option === 2 && googleCredential
                      ? styles.connectedOption
                      : null,
                  ]}
                  onPress={() => handleModalOption(item.option)}
                >
                  <Text
                    style={
                      item.option === 2 && googleCredential
                        ? styles.connectedText
                        : null
                    }
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

export default EmailScreen;
