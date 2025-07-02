import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const getDefaultDate = () => {
  const today = new Date();
  const defaultAge = 25;
  return new Date(today.getFullYear() - defaultAge, today.getMonth(), Math.min(today.getDate(), 15));
};

function BirthdateScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  const getInitialDate = () => {
    if (userData?.birthyear && userData?.birthmonth && userData?.birthday) {
      try {
        const year = parseInt(userData.birthyear);
        const day = parseInt(userData.birthday);
        
        // Convert month abbreviation to month number
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = monthNames.findIndex(month => month === userData.birthmonth?.toLowerCase());
        
        if (monthIndex !== -1 && !isNaN(year) && !isNaN(day)) {
          const date = new Date(year, monthIndex, day);
          // Validate the date
          if (date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day) {
            return date;
          }
        }
      } catch (error) {
        console.log("Error parsing existing birthdate:", error);
      }
    }
    return getDefaultDate();
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState(0);

  useEffect(() => {
    const calculateAge = () => {
      const today = new Date();
      const birthDate = new Date(selectedDate);

      // Validate the birth date
      if (isNaN(birthDate.getTime()) || birthDate > today) {
        setAge(0);
        return;
      }

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      setAge(Math.max(0, calculatedAge));
    };

    calculateAge();
  }, [selectedDate]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date && !isNaN(date.getTime())) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date: Date) => {
    if (isNaN(date.getTime())) {
      return "Select your birthday";
    }
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMaxDate = () => {
    const today = new Date();
    return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  };

  const getMinDate = () => {
    return new Date(1924, 0, 1);
  };

  const handleBirthdateSubmit = async () => {
    if (isNaN(selectedDate.getTime())) {
      Alert.alert("Select Date", "Please select your birthdate");
      return;
    }

    if (age < 18) {
      Alert.alert("Almost there!", "Circle welcomes members 18 and older");
      return;
    }

    if (age > 100) {
      Alert.alert("Let's double-check", "Please verify your birthdate to ensure accuracy");
      return;
    }

    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Connection Issue", "Something went wrong. Please try again.");
        return;
      }

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const birthMonth = monthNames[selectedDate.getMonth()];
      const birthDay = selectedDate.getDate();
      const birthYear = selectedDate.getFullYear();

      await updateUserData({
        birthmonth: birthMonth,
        birthday: birthDay.toString(),
        birthyear: birthYear.toString(),
        birthdate: `${birthMonth} ${birthDay}, ${birthYear}`,
        age: age,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Connection Issue", "We had trouble saving your information: " + error.message);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <OnboardingProgressBar currentScreen="BirthdateScreen" />
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>When's your birthday?</Text>
          
          <Text style={styles.subtitle}>Help us celebrate you properly</Text>
          
          <View style={styles.datePickerContainer}>
            <TouchableOpacity 
              style={styles.datePicker}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerLabel}>Your Birthday</Text>
              <View style={styles.datePickerValueContainer}>
                <Text style={styles.datePickerValue}>{formatDate(selectedDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={getMaxDate()}
              minimumDate={getMinDate()}
              textColor={colors.textDark}
            />
          )}
          
          <View style={styles.ageContainer}>
            <Text style={styles.ageText}>Your age: {isNaN(age) ? '--' : age}</Text>
            {age < 18 && age > 0 && (
              <Text style={styles.ageWarning}>You must be 18 or older to join Circle</Text>
            )}
            {age > 100 && (
              <Text style={styles.ageWarning}>Please verify your birthdate for accuracy</Text>
            )}
          </View>
          
          <Text style={styles.warning}>This information becomes permanent once set</Text>
          
          <Text style={styles.affirmation}>
            Every{' '}
            <Text style={styles.highlightedWord}>birthday</Text>
            {' marks another year of stories worth sharing'}
          </Text>
        </ScrollView>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (age < 18 || age > 100 || isNaN(age)) && styles.submitButtonDisabled
          ]}
          onPress={handleBirthdateSubmit}
          disabled={age < 18 || age > 100 || isNaN(age)}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={colors.background} 
          />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: any) => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: Spacing.lg,
      paddingBottom: 100,
    },
    backButton: {
      backgroundColor: colors.card,
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginLeft: Spacing.lg,
      marginTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight,
      textAlign: "left",
      marginBottom: Spacing.xl,
      fontStyle: "normal",
    },
    datePickerContainer: {
      marginBottom: Spacing.sm,
    },
    datePicker: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 2,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    datePickerLabel: {
      ...fonts.captionFont,
      color: colors.textMuted,
      fontSize: Typography.sizes.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    datePickerValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    datePickerValue: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.medium,
      flex: 1,
    },
    ageContainer: {
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    ageText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.medium,
    },
    ageWarning: {
      ...fonts.captionFont,
      color: '#CD5C5C',
      textAlign: 'center',
      fontStyle: 'italic',
    },
    warning: {
      ...fonts.captionFont,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: Spacing.xl,
      fontStyle: "italic",
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "center",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      marginBottom: Spacing.xl,
      opacity: 0.8,
    },
    highlightedWord: {
      color: colors.textDark,
      textShadowColor: '#FFD700',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
    },
    submitButton: {
      position: "absolute",
      bottom: Platform.select({ ios: 50, android: 30 }),
      right: Spacing.xl,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
    },
    submitButtonDisabled: {
      backgroundColor: colors.textMuted,
      opacity: 0.6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.medium,
      color: colors.textDark,
    },
    modalCancelText: {
      ...fonts.buttonFont,
      color: colors.textMuted,
    },
    modalDoneText: {
      ...fonts.buttonFont,
      color: colors.primary,
      fontWeight: Typography.weights.medium,
    },
    selectorList: {
      flex: 1,
    },
    selectorItem: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      height: 60,
      justifyContent: 'center',
    },
    selectorItemSelected: {
      backgroundColor: colors.primary + '10',
    },
    selectorItemText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      textAlign: 'center',
    },
    selectorItemTextSelected: {
      color: colors.primary,
      fontWeight: Typography.weights.medium,
    },
  });
};

export default BirthdateScreen