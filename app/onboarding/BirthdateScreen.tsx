import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  useColorScheme,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import OnboardingProgressBar from "../../components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const months = [
  { short: "Jan", full: "January", number: 1 },
  { short: "Feb", full: "February", number: 2 },
  { short: "Mar", full: "March", number: 3 },
  { short: "Apr", full: "April", number: 4 },
  { short: "May", full: "May", number: 5 },
  { short: "Jun", full: "June", number: 6 },
  { short: "Jul", full: "July", number: 7 },
  { short: "Aug", full: "August", number: 8 },
  { short: "Sep", full: "September", number: 9 },
  { short: "Oct", full: "October", number: 10 },
  { short: "Nov", full: "November", number: 11 },
  { short: "Dec", full: "December", number: 12 },
];

const generateDays = (month: number, year: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
};

export default BirthdateScreen;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i).reverse();

const getSmartDefaults = () => {
  const today = new Date();
  const defaultAge = 25;
  const defaultYear = today.getFullYear() - defaultAge;
  const defaultMonth = today.getMonth() + 1;
  const defaultDay = Math.min(today.getDate(), 15);
  
  return {
    month: months.find(m => m.number === defaultMonth) || months[0],
    day: defaultDay,
    year: defaultYear,
  };
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

  const smartDefaults = getSmartDefaults();

  const [birthdate, setBirthdate] = useState({
    month: userData?.birthmonth ? months.find(m => m.short === userData.birthmonth) || smartDefaults.month : smartDefaults.month,
    day: userData?.birthday ? parseInt(userData.birthday) : smartDefaults.day,
    year: userData?.birthyear ? parseInt(userData.birthyear) : smartDefaults.year,
  });

  const [age, setAge] = useState(userData?.age || 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSelector, setActiveSelector] = useState<'month' | 'day' | 'year'>('month');

  useEffect(() => {
    const calculateAge = () => {
      const today = new Date();
      const birthDate = new Date(birthdate.year, birthdate.month.number - 1, birthdate.day);

      if (birthDate > today) {
        setAge(0);
        return;
      }

      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - (birthdate.month.number - 1);

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    };

    calculateAge();
  }, [birthdate]);

  const handleBirthdateSubmit = async () => {
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

      await updateUserData({
        birthmonth: birthdate.month.short,
        birthday: birthdate.day.toString(),
        birthyear: birthdate.year.toString(),
        birthdate: `${birthdate.month.short} ${birthdate.day}, ${birthdate.year}`,
        age: age,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Connection Issue", "We had trouble saving your information: " + error.message);
    }
  };

  const openSelector = (type: 'month' | 'day' | 'year') => {
    setActiveSelector(type);
    setModalVisible(true);
  };

  const renderSelectorModal = () => {
    let data: any[] = [];
    let currentValue: any = null;

    if (activeSelector === 'month') {
      data = months;
      currentValue = birthdate.month;
    } else if (activeSelector === 'day') {
      data = generateDays(birthdate.month.number, birthdate.year).map(d => ({ value: d, label: d.toString() }));
      currentValue = { value: birthdate.day, label: birthdate.day.toString() };
    } else if (activeSelector === 'year') {
      data = years.map(y => ({ value: y, label: y.toString() }));
      currentValue = { value: birthdate.year, label: birthdate.year.toString() };
    }

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                Select {activeSelector === 'month' ? 'Month' : activeSelector === 'day' ? 'Day' : 'Year'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={data}
              keyExtractor={(item) => (activeSelector === 'month' ? item.short : item.value.toString())}
              renderItem={({ item }) => {
                const isSelected = activeSelector === 'month' 
                  ? item.short === currentValue?.short
                  : item.value === currentValue?.value;
                
                return (
                  <TouchableOpacity
                    style={[styles.selectorItem, isSelected && styles.selectorItemSelected]}
                    onPress={() => {
                      if (activeSelector === 'month') {
                        setBirthdate(prev => ({ ...prev, month: item }));
                      } else if (activeSelector === 'day') {
                        setBirthdate(prev => ({ ...prev, day: item.value }));
                      } else if (activeSelector === 'year') {
                        setBirthdate(prev => ({ ...prev, year: item.value }));
                      }
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[styles.selectorItemText, isSelected && styles.selectorItemTextSelected]}>
                      {activeSelector === 'month' ? item.full : item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
              style={styles.selectorList}
              getItemLayout={(data, index) => ({
                length: 60,
                offset: 60 * index,
                index,
              })}
              initialScrollIndex={activeSelector === 'month' 
                ? months.findIndex(m => m.short === currentValue?.short)
                : activeSelector === 'year' 
                ? Math.max(0, years.findIndex(y => y === currentValue?.value))
                : Math.max(0, birthdate.day - 1)
              }
            />
          </View>
        </View>
      </Modal>
    );
  };

  const QuickAgeSelector = () => {
    const quickAges = [21, 25, 30, 35, 40];
    
    return (
      <View style={styles.quickAgeContainer}>
        <Text style={styles.quickAgeLabel}>Quick select age:</Text>
        <View style={styles.quickAgeButtons}>
          {quickAges.map(quickAge => (
            <TouchableOpacity
              key={quickAge}
              style={[styles.quickAgeButton, age === quickAge && styles.quickAgeButtonSelected]}
              onPress={() => {
                const today = new Date();
                const targetYear = today.getFullYear() - quickAge;
                setBirthdate(prev => ({
                  ...prev,
                  year: targetYear,
                }));
              }}
            >
              <Text style={[styles.quickAgeButtonText, age === quickAge && styles.quickAgeButtonTextSelected]}>
                {quickAge}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
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
          
          <QuickAgeSelector />
          
          <View style={styles.dateInputs}>
            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={() => openSelector('month')}
            >
              <Text style={styles.dateSelectorLabel}>Month</Text>
              <Text style={styles.dateSelectorValue}>{birthdate.month.full}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={() => openSelector('day')}
            >
              <Text style={styles.dateSelectorLabel}>Day</Text>
              <Text style={styles.dateSelectorValue}>{birthdate.day}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateSelector}
              onPress={() => openSelector('year')}
            >
              <Text style={styles.dateSelectorLabel}>Year</Text>
              <Text style={styles.dateSelectorValue}>{birthdate.year}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.ageContainer}>
            <Text style={styles.ageText}>Your age: {age}</Text>
            {age < 18 && (
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

        {renderSelectorModal()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: any) => {
  const colors = Colors[colorScheme];
  const { width } = Dimensions.get('window');
  
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
    quickAgeContainer: {
      marginBottom: Spacing.xl,
    },
    quickAgeLabel: {
      ...fonts.captionFont,
      color: colors.textMuted,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    quickAgeButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginHorizontal: Spacing.lg,
    },
    quickAgeButton: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    quickAgeButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    quickAgeButtonText: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.sm,
    },
    quickAgeButtonTextSelected: {
      color: colors.primary,
      fontWeight: Typography.weights.medium,
    },
    dateInputs: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: Spacing.xl,
      gap: Spacing.sm,
    },
    dateSelector: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      minHeight: 80,
      justifyContent: 'space-between',
    },
    dateSelectorLabel: {
      ...fonts.captionFont,
      color: colors.textMuted,
      fontSize: Typography.sizes.xs,
      marginBottom: Spacing.xs,
    },
    dateSelectorValue: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
      textAlign: 'center',
    },
    ageContainer: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
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