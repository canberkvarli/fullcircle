import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Alert,
  TouchableOpacity,
  useColorScheme,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import DateTimePicker from "@react-native-community/datetimepicker";

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

  // Set a reasonable default date (25 years ago)
  const getDefaultDate = () => {
    const today = new Date();
    const defaultAge = 25;
    return new Date(today.getFullYear() - defaultAge, today.getMonth(), today.getDate());
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    if (userData?.birthmonth && userData?.birthday && userData?.birthyear) {
      const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        .indexOf(userData.birthmonth);
      return new Date(parseInt(userData.birthyear), monthIndex, parseInt(userData.birthday));
    }
    return getDefaultDate();
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState(0);

  // Calculate age whenever date changes
  useEffect(() => {
    const calculateAge = () => {
      const today = new Date();
      const birthDate = selectedDate;

      if (birthDate > today) {
        setAge(0);
        return;
      }

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    };

    calculateAge();
  }, [selectedDate]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleBirthdateSubmit = async () => {
    if (age < 18) {
      Alert.alert("Sacred Circle", "Our cosmic community welcomes souls 18 and older on their spiritual dating journey");
      return;
    }

    if (age > 100) {
      Alert.alert("Timeless Soul", "Please verify your birthdate - we want to ensure accurate cosmic alignment");
      return;
    }

    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Energy Disruption", "Something mystical went wrong. Please try again.");
        return;
      }

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[selectedDate.getMonth()];
      const day = selectedDate.getDate();
      const year = selectedDate.getFullYear();

      await updateUserData({
        birthmonth: month,
        birthday: day.toString(),
        birthyear: year.toString(),
        birthdate: `${month} ${day}, ${year}`,
        age: age,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Cosmic Interference", "The universe had trouble saving your sacred timeline: " + error.message);
    }
  };

  const formatDisplayDate = (date: Date) => {
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <OnboardingProgressBar currentScreen="BirthdateScreen" />
        
        {/* Title */}
        <Text style={styles.title}>Celebrate your cosmic arrival</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>When did your soul choose to enter this realm?</Text>
        
        {/* Date Display and Picker */}
        <View style={styles.dateContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={24} color={colors.primary} style={styles.calendarIcon} />
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
              <Text style={styles.tapToChangeText}>Tap to change</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Expo Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1930, 0, 1)}
            accentColor={colors.primary}
            textColor={colors.textDark}
            style={styles.datePicker}
          />
        )}
        
        {/* Age Display */}
        <View style={styles.ageContainer}>
          <Text style={styles.ageText}>Your cosmic age: {age}</Text>
          {age < 18 && (
            <Text style={styles.ageWarning}>You must be 18 or older to join our sacred circle</Text>
          )}
          {age > 100 && (
            <Text style={styles.ageWarning}>Please verify your birthdate for cosmic accuracy</Text>
          )}
        </View>
        
        {/* Warning */}
        <Text style={styles.warning}>This sacred information becomes permanent once set</Text>
        
        {/* Affirmation */}
        <Text style={styles.affirmation}>
          Every soul chooses the perfect moment to begin their earthly journey
        </Text>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (age < 18 || age > 100) && styles.submitButtonDisabled
          ]}
          onPress={handleBirthdateSubmit}
          disabled={age < 18 || age > 100}
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
      padding: Spacing.lg,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
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
      marginLeft: Spacing.md,
      marginTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
      marginBottom: 0,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight,
      textAlign: "left",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    dateContainer: {
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 70,
    },
    calendarIcon: {
      marginRight: Spacing.md,
    },
    dateTextContainer: {
      flex: 1,
    },
    dateText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
    },
    tapToChangeText: {
      ...fonts.captionFont,
      color: colors.textMuted,
      fontSize: Typography.sizes.xs,
      marginTop: Spacing.xs,
      fontStyle: 'italic',
    },
    datePicker: {
      alignSelf: 'center',
      marginBottom: Spacing.lg,
    },
    ageContainer: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    ageText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      fontSize: Typography.sizes.xl,
      fontWeight: Typography.weights.medium,
      marginBottom: Spacing.sm,
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
      paddingHorizontal: Spacing.lg,
    },
    affirmation: {
      ...fonts.affirmationFont,
      position: 'absolute',
      bottom: Platform.select({ ios: 130, android: 110 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
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
  });
};

export default BirthdateScreen;