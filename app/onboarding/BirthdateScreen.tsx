import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import styles from "@/styles/Onboarding/BirthdateScreenStyles";
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
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) =>
  (1930 + i).toString()
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

      if (birthDate > today) {
        setAge(0);
        return;
      }

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

    if (!month || !day || !year || age <= 0) {
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

  const handleSwipeChange = (type: keyof typeof birthdate, value: string) => {
    if (type === "month" && !months.includes(value)) return;
    if (type === "day" && !days.includes(value)) return;
    if (type === "year" && !years.includes(value)) return;

    setBirthdate((prev) => ({ ...prev, [type]: value }));
  };

  const renderDatePicker = (type: keyof typeof birthdate, data: string[]) => {
    const currentIndex = Math.max(
      0,
      Math.min(data.indexOf(birthdate[type]), data.length - 1)
    );

    return (
      <Animated.FlatList
        data={data}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => {
          const isCurrent = index === currentIndex;
          const isNearby = Math.abs(index - currentIndex) <= 1;
          const color = isCurrent
            ? "#007AFF"
            : isNearby
            ? "#7E7972"
            : "#D3C6BA";
          const fontSize = isCurrent ? 24 : isNearby ? 20 : 16;

          return (
            <View>
              <Text
                style={[
                  styles.dateValue,
                  { color, fontSize, fontWeight: isCurrent ? "600" : "400" },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        }}
        getItemLayout={(data, index) => ({
          length: 50,
          offset: 50 * index,
          index,
        })}
        initialScrollIndex={currentIndex}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / 50);
          const boundedIndex = Math.max(0, Math.min(index, data.length - 1));
          handleSwipeChange(type, data[boundedIndex]);
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={50}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: 100 }}
        style={{ height: 200 }}
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

export default BirthdayScreen;
