import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import styles from "@/styles/Onboarding/PhoneNumberScreenStyles";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import PhoneInput from "react-native-phone-number-input";
import Icon from "react-native-vector-icons/FontAwesome";

function PhoneNumberScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhoneNumber)) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      const confirmation = await auth().verifyPhoneNumber(formattedPhoneNumber);

      router.replace({
        pathname: "onboarding/PhoneVerificationScreen" as any,
        params: {
          verificationId: confirmation.verificationId,
          phoneNumber: formattedPhoneNumber,
        },
      });
    } catch (error) {
      console.error("Failed to sign in with phone number: ", error);
      Alert.alert("Error", "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust as needed
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("onboarding/LoginSignupScreen" as any)}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Your Journey Begins Here</Text>
        <View style={styles.mainContent}>
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
                autoFocus={true}
                disabled={loading ? true : false}
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
        </View>
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmation}>
            Step into a community of kindred spirits.
          </Text>
        </View>
        <View style={styles.bottomBar}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
              <Icon name="chevron-right" size={24} color="black" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default PhoneNumberScreen;
