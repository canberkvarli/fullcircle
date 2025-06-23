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

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => (1930 + i).toString());

function BirthdayScreen() {
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

  const [birthdate, setBirthdate] = useState({
    month: userData?.birthmonth || months[0],
    day: userData?.birthday || days[0],
    year: userData?.birthyear || years[0],
  });
  const [age, setAge] = useState(userData?.age || 0);

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

  const handleBirthdateSubmit = async () => {
    const { month, day, year } = birthdate;

    if (!month || !day || !year || age <= 0) {
      Alert.alert("Sacred Timeline", "Please honor us with your true birthdate so we can celebrate your cosmic journey");
      return;
    }

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

      await updateUserData({
        birthmonth: month,
        birthday: day,
        birthyear: year,
        birthdate: `${month} ${day}, ${year}`,
        age: age,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Cosmic Interference", "The universe had trouble saving your sacred timeline: " + error.message);
    }
  };

  // Simple increment/decrement functions
  const changeMonth = (direction: 'up' | 'down') => {
    const currentIndex = months.indexOf(birthdate.month);
    let newIndex;
    
    if (direction === 'up') {
      newIndex = currentIndex === months.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? months.length - 1 : currentIndex - 1;
    }
    
    setBirthdate(prev => ({ ...prev, month: months[newIndex] }));
  };

  const changeDay = (direction: 'up' | 'down') => {
    const currentIndex = days.indexOf(birthdate.day);
    let newIndex;
    
    if (direction === 'up') {
      newIndex = currentIndex === days.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? days.length - 1 : currentIndex - 1;
    }
    
    setBirthdate(prev => ({ ...prev, day: days[newIndex] }));
  };

  const changeYear = (direction: 'up' | 'down') => {
    const currentIndex = years.indexOf(birthdate.year);
    let newIndex;
    
    if (direction === 'up') {
      newIndex = currentIndex === years.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? years.length - 1 : currentIndex - 1;
    }
    
    setBirthdate(prev => ({ ...prev, year: years[newIndex] }));
  };

  const DateSelector = ({ type, value, onUp, onDown }: { type: string, value: string | number, onUp: () => void, onDown: () => void }) => (
    <View style={styles.selectorContainer}>
      <TouchableOpacity style={styles.arrowButton} onPress={onUp}>
        <Ionicons name="chevron-up" size={20} color={colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
      
      <TouchableOpacity style={styles.arrowButton} onPress={onDown}>
        <Ionicons name="chevron-down" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
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
        
        {/* Date Selectors - Side by side like your original */}
        <View style={styles.dateInputs}>
          <DateSelector 
            type="month" 
            value={birthdate.month} 
            onUp={() => changeMonth('up')} 
            onDown={() => changeMonth('down')} 
          />
          <DateSelector 
            type="day" 
            value={birthdate.day} 
            onUp={() => changeDay('up')} 
            onDown={() => changeDay('down')} 
          />
          <DateSelector 
            type="year" 
            value={birthdate.year} 
            onUp={() => changeYear('up')} 
            onDown={() => changeYear('down')} 
          />
        </View>
        
        {/* Age Display */}
        <Text style={styles.ageText}>Your age: {age}</Text>
        
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
            (!birthdate.month || !birthdate.day || !birthdate.year || age < 18 || age > 100) && styles.submitButtonDisabled
          ]}
          onPress={handleBirthdateSubmit}
          disabled={!birthdate.month || !birthdate.day || !birthdate.year || age < 18 || age > 100}
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
    dateInputs: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    selectorContainer: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 80,
    },
    arrowButton: {
      padding: Spacing.sm,
    },
    valueContainer: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      marginVertical: Spacing.xs,
    },
    valueText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      color: colors.textDark,
      textAlign: 'center',
      fontWeight: Typography.weights.medium,
    },
    ageText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      textAlign: "center",
      marginBottom: Spacing.lg,
      fontStyle: "italic",
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.medium,
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
};export default BirthdayScreen;