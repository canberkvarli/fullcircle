import React, { useState } from "react";
import {
  Button,
  TextInput,
  StyleSheet,
  Alert,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler"; // Import gesture handler for swipe functionality
import { useRouter, useLocalSearchParams } from "expo-router";
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function BirthdayScreen() {
  const [birthdate, setBirthdate] = useState({
    month: "",
    day: "",
    year: "",
  });
  const [age, setAge] = useState(""); // State to hold calculated age
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    userId,
    phoneNumber,
    email,
    firstName,
    lastName,
    marketingRequested,
  } = params;

  // Function to handle birthdate submission
  const handleBirthdateSubmit = async () => {
    const { month, day, year } = birthdate;
    if (!month || !day || !year) {
      Alert.alert("Error", "Please enter a valid birthdate");
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
        { birthdate: `${month} ${day}, ${year}` },
        { merge: true }
      );
      router.replace({
        pathname: "onboarding/AddBasicInfoScreen",
        params: {
          userId,
          phoneNumber,
          email,
          firstName,
          lastName,
          birthdate: `${month} ${day}, ${year}`,
        },
      });
    } catch (error: any) {
      Alert.alert("Error", "Failed to save birthdate: " + error.message);
    }
  };

  // Function to handle navigation back to previous screen
  const handleBack = () => {
    router.replace({
      pathname: "onboarding/EmailScreen",
      params: {
        userId,
        phoneNumber,
        email,
        firstName,
        lastName,
        marketingRequested,
      },
    });
  };

  // Function to render swipeable date picker for month, day, or year
  const renderDatePicker = (type: "month" | "day" | "year") => {
    let currentValue = birthdate[type];
    if (!currentValue) currentValue = "";

    return (
      <View style={styles.datePicker}>
        <Text style={styles.dateValue}>{currentValue}</Text>
        <View style={styles.dateUpDown}>
          <Text style={styles.dateChange}>{getPreviousValue(type)}</Text>
          <Text style={styles.dateChange}>{currentValue}</Text>
          <Text style={styles.dateChange}>{getNextValue(type)}</Text>
        </View>
      </View>
    );
  };

  // Function to calculate previous value for month, day, or year
  const getPreviousValue = (
    type: "month" | "day" | "year"
  ): string | number => {
    switch (type) {
      case "month":
        return months[(months.indexOf(birthdate.month) - 1 + 12) % 12];
      case "day":
        return birthdate.day > 1 ? +birthdate.day - 1 : 31; // Adjust for months with fewer days
      case "year":
        return birthdate.year > 1900 ? +birthdate.year - 1 : +birthdate.year;
      default:
        return "";
    }
  };

  // Function to calculate next value for month, day, or year
  const getNextValue = (type: "month" | "day" | "year"): string | number => {
    switch (type) {
      case "month":
        return months[(months.indexOf(birthdate.month) + 1) % 12];
      case "day":
        return birthdate.day < 31 ? +birthdate.day + 1 : 1; // Adjust for months with fewer days
      case "year":
        return birthdate.year < new Date().getFullYear()
          ? +birthdate.year + 1
          : +birthdate.year;
      default:
        return "";
    }
  };

  // Function to calculate age based on birthdate
  const calculateAge = () => {
    if (!birthdate.day || !birthdate.month || !birthdate.year) return;

    const today = new Date();
    const birthDate = new Date(
      +birthdate.year,
      months.indexOf(birthdate.month),
      +birthdate.day
    );

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    setAge(age.toString());
  };

  // Calculate age whenever birthdate changes
  React.useEffect(() => {
    calculateAge();
  }, [birthdate]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Celebrate Your Journey</Text>
      <Text style={styles.subtitle}>When is your birthdate?</Text>
      <View style={styles.dateInputs}>
        {renderDatePicker("month")}
        {renderDatePicker("day")}
        {renderDatePicker("year")}
      </View>
      <Text style={styles.ageText}>Age: {age}</Text>
      <Text style={styles.warning}>This can't be changed later.</Text>
      <Button title="Submit" onPress={handleBirthdateSubmit} />
      <Button title="Back" onPress={handleBack} />
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
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  ageText: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  warning: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  datePicker: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  dateValue: {
    fontSize: 24,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    paddingBottom: 10,
    width: 80,
    textAlign: "center",
  },
  dateUpDown: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 80,
    marginTop: 5,
  },
  dateChange: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  dateInputs: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
});

export default BirthdayScreen;
