import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import PhoneInput from "react-native-phone-number-input";
import Icon from "react-native-vector-icons/FontAwesome"; // Import FontAwesome from react-native-vector-icons

function PhoneNumberScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [confirm, setConfirm] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhoneNumber)) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }

    try {
      const confirmation = await auth().signInWithPhoneNumber(
        formattedPhoneNumber
      );
      setConfirm(confirmation);

      router.replace({
        pathname: "onboarding/PhoneVerificationScreen",
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber: formattedPhoneNumber,
        },
      });
      console.log("phoneNumber", formattedPhoneNumber);
    } catch (error) {
      console.error("Failed to sign in with phone number: ", error);
      Alert.alert("Error", "Failed to send verification code.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("onboarding/LoginSignupScreen")}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Your Journey Begins Here</Text>
        <Text style={styles.subtitle}>Enter your phone number to start.</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.countryInputContainer}>
            <PhoneInput
              defaultValue={phoneNumber}
              defaultCode="US"
              layout="first"
              onChangeText={(text) => {
                setPhoneNumber(text);
              }}
              onChangeFormattedText={(text) => {
                setFormattedPhoneNumber(text);
              }}
              containerStyle={styles.phoneInput}
              textContainerStyle={styles.textContainer}
              codeTextStyle={styles.codeText}
            />
          </View>
          <TextInput
            style={styles.phoneNumberInput}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoFocus={true}
          />
        </View>
        <Text style={styles.notificationText}>
          We’ll text you a code to verify you’re really you. Message and data
          rates may apply.
        </Text>
        <Text style={styles.affirmation}>
          Step into a community of kindred spirits.
        </Text>
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Icon name="chevron-right" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 16,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "80%",
  },
  countryInputContainer: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginRight: 10,
  },
  phoneInput: {
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    backgroundColor: "transparent",
  },
  textContainer: {
    backgroundColor: "transparent",
  },
  codeText: {
    color: "black",
  },
  phoneNumberInput: {
    flex: 1,
    height: 40,
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  notificationText: {
    fontSize: 12,
    marginBottom: 16,
    textAlign: "center",
    color: "gray",
  },
  affirmation: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  nextButton: {
    padding: 12,
    borderRadius: 30,
  },
  backButton: {
    marginTop: 20,
    marginLeft: 16,
  },
});

export default PhoneNumberScreen;
