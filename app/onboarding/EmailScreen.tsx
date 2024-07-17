import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

function EmailScreen() {
  const [email, setEmail] = useState("");
  const [marketingRequested, setMarketingRequested] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId, phoneNumber, firstName, lastName } = params;

  const handleEmailSubmit = async () => {
    if (email.trim() === "") {
      Alert.alert("Error", "Email cannot be empty");
      return;
    }

    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(
        docRef,
        { email: email, phoneNumber: phoneNumber, marketingRequested },
        { merge: true }
      );
      router.replace({
        pathname: "onboarding/BirthdateScreen",
        params: { userId, phoneNumber, firstName, email },
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to save email: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          router.replace({
            pathname: "onboarding/NameScreen",
            params: { userId, phoneNumber, email, firstName, lastName },
          })
        }
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
      />
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.toggle}
          onPress={() => setMarketingRequested(!marketingRequested)}
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

export default EmailScreen;
