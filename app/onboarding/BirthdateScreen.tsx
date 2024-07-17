import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FIRESTORE } from "../../services/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { GestureHandlerRootView, FlatList } from "react-native-gesture-handler";

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

const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const years = Array.from(
  { length: new Date().getFullYear() - 1900 + 1 },
  (_, i) => (1900 + i).toString()
);

function BirthdayScreen() {
  const [birthdate, setBirthdate] = useState<{
    month: string;
    day: string;
    year: string;
  }>({
    month: months[0],
    day: days[0],
    year: years[0],
  });
  const [age, setAge] = useState<string>(""); // State to hold calculated age
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

  // Function to handle swipe changes
  const handleSwipeChange = (type: keyof typeof birthdate, index: string) => {
    setBirthdate((prev) => ({ ...prev, [type]: index }));
  };

  const renderDatePicker = (type: keyof typeof birthdate, data: string[]) => {
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 200, // Increase the duration for smoother transition
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200, // Increase the duration for smoother transition
          useNativeDriver: true,
        }).start();
      });
    }, [birthdate[type]]);

    return (
      <Animated.FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => {
          const currentIndex = data.indexOf(birthdate[type]);
          const isCurrent = index === currentIndex;
          const isNearby =
            index >= currentIndex - 2 && index <= currentIndex + 2;
          const color = isCurrent ? "black" : "gray";
          const opacityValue = isNearby ? 1 : 0.3;

          return (
            <Animated.View style={{ opacity }}>
              <Text
                style={[styles.dateValue, { color, opacity: opacityValue }]}
              >
                {item}
              </Text>
            </Animated.View>
          );
        }}
        getItemLayout={(data, index) => ({
          length: 40,
          offset: 40 * index,
          index,
        })}
        initialScrollIndex={data.indexOf(birthdate[type])}
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(event.nativeEvent.contentOffset.y / 40);
          handleSwipeChange(type, data[index]);
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={40}
        decelerationRate="fast"
        style={{ height: 200, paddingVertical: 80 }} // Ensure FlatList height fits the desired number of items and adds padding
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Celebrate Your Journey</Text>
        <Text style={styles.subtitle}>When is your birthdate?</Text>
        <View style={styles.dateInputs}>
          {renderDatePicker("month", months)}
          {renderDatePicker("day", days)}
          {renderDatePicker("year", years)}
        </View>
        <Text style={styles.ageText}>Age: {age}</Text>
        <Text style={styles.warning}>This can't be changed later.</Text>
        <Text style={styles.affirmation}>
          Honor the day your soul chose to shine in this world.
        </Text>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleBirthdateSubmit}
        >
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
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
  dateInputs: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  dateValue: {
    fontSize: 24,
    height: 40,
    textAlign: "center",
    lineHeight: 40,
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
  affirmation: {
    position: "absolute",
    bottom: 70,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
  nextButton: {
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

export default BirthdayScreen;
