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
import Icon from "react-native-vector-icons/FontAwesome";
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";

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
  { length: new Date().getFullYear() - 1930 + 1 },
  (_, i) => (1930 + i).toString()
);

function BirthdayScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const [birthdate, setBirthdate] = useState<{
    month: string;
    day: string;
    year: string;
  }>({
    month: userData?.birthmonth || months[0],
    day: userData?.birthday || days[0],
    year: userData?.birthyear || years[0],
  });
  const [age, setAge] = useState<number>(userData?.age || 0);
  // Calculate age whenever birthdate changes
  useEffect(() => {
    const calculateAge = () => {
      if (!birthdate.day || !birthdate.month || !birthdate.year) return;

      const today = new Date();
      const birthDate = new Date(
        +birthdate.year,
        months.indexOf(birthdate.month),
        +birthdate.day
      );

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    };

    calculateAge();
  }, [birthdate]);

  // Function to handle birthdate submission
  const handleBirthdateSubmit = async () => {
    const { month, day, year } = birthdate;
    if (!month || !day || !year) {
      Alert.alert("Error", "Please enter a valid birthdate");
      return;
    }

    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Error", "Invalid user ID");
        return;
      }

      await updateUserData({
        birthmonth: month,
        birthday: day,
        birthyear: year,
        birthdate: `${month} ${day}, ${year}`,
        age: age,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save birthdate: " + error.message);
    }
  };

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

    const currentIndex = data.indexOf(birthdate[type]);
    const validIndex = currentIndex !== -1 ? currentIndex : 0; // Ensure a valid index

    return (
      <Animated.FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => {
          const isCurrent = index === validIndex;
          const isNearby = index >= validIndex - 2 && index <= validIndex + 2;
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
        initialScrollIndex={validIndex}
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
        <OnboardingProgressBar currentScreen="BirthdateScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
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
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  backButton: {
    bottom: 20,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 40,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "left",
    paddingHorizontal: 16,
    marginBottom: 30,
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
    bottom: 85,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
    left: 15,
  },
  nextButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BirthdayScreen;
