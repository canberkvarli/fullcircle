import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import Slider from "@react-native-community/slider";

function DistancePreferenceScreen() {
  const [distance, setDistance] = useState(50);
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    userId,
    phoneNumber,
    email,
    birthdate,
    firstName,
    lastName,
    gender,
    sexualOrientation,
    interestedIn,
  } = params;

  const handleSaveDistance = async () => {
    if (!userId || typeof userId !== "string") {
      Alert.alert("Error", "Invalid user ID");
      return;
    }

    try {
      const docRef = doc(FIRESTORE, "users", userId);
      await setDoc(docRef, { distancePreference: distance }, { merge: true });
      Alert.alert("Success", "Distance preference saved successfully!", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "onboarding/DesiredRelationshipScreen",
              params: {
                userId,
                phoneNumber,
                email,
                birthdate,
                firstName,
                lastName,
                gender,
                sexualOrientation,
                interestedIn,
                distancePreference: distance,
              },
            }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Failed to save distance preference: " + error.message
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What's your distance preference?</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={{ width: "90%", height: 40 }}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={distance}
          onValueChange={(value) => setDistance(value)}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#000000"
          thumbTintColor="#007AFF"
        />
        <Text style={styles.sliderText}>{`${distance} miles`}</Text>
      </View>
      <Button title="Next" onPress={handleSaveDistance} />
      <Button
        title="Back"
        onPress={() =>
          router.replace({
            pathname: "onboarding/InterestScreen",
            params: {
              userId,
              phoneNumber,
              email,
              birthdate,
              firstName,
              lastName,
              gender,
              sexualOrientation,
              interestedIn,
            },
          })
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  sliderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  sliderText: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default DistancePreferenceScreen;
