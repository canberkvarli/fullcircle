import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
  useColorScheme,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useUserContext } from "@/context/UserContext";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

function GenderScreen() {
  const {
    navigateToNextScreen,
    navigateToPreviousScreen,
    updateUserData,
    userData,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  const [selectedGender, setSelectedGender] = useState<string[]>(
    userData?.gender || []
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    gender: userData?.hiddenFields?.gender || false,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleGender = (gender: string) => {
    if (selectedGender.includes(gender)) {
      setSelectedGender(selectedGender.filter((g) => g !== gender));
    } else {
      setSelectedGender([...selectedGender, gender]);
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleNext = async () => {
    await updateUserData({
      gender: selectedGender,
      hiddenFields,
    });
    navigateToNextScreen();
  };

  const handlePrevious = async () => {
    await updateUserData({
      gender: selectedGender,
      hiddenFields,
    });
    navigateToPreviousScreen();
  };

  useEffect(() => {
    // Ensure hiddenFields.gender is set to a boolean.
    setHiddenFields((prev) => ({
      ...prev,
      gender: prev.gender !== undefined ? prev.gender : false,
    }));
  }, []);

  const genderOptions = [
    { title: "Non-binary", subtitle: "Be your true self" },
    { title: "Genderqueer", subtitle: "Embrace your uniqueness" },
    { title: "Agender", subtitle: "Express your uniqueness" },
    { title: "Genderfluid", subtitle: "Embrace fluidity" },
    { title: "Trans Woman", subtitle: "Celebrate your identity" },
    { title: "Trans Man", subtitle: "Express your identity" },
    { title: "Two-Spirit", subtitle: "Honor your sacred duality" },
    { title: "Bigender", subtitle: "Celebrate your duality" },
    { title: "Intersex", subtitle: "Embrace your uniqueness" },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handlePrevious}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>

          {/* Progress Bar */}
          <OnboardingProgressBar currentScreen="GenderScreen" />

          {/* Title */}
          <Text style={styles.title}>How do you identify?</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Share your authentic self with our cosmic community
          </Text>

          {/* Main Gender Options */}
          <View style={styles.mainOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.mainOption,
                selectedGender.includes("Man") && styles.optionSelected,
              ]}
              onPress={() => toggleGender("Man")}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.mainOptionTitle,
                    selectedGender.includes("Man") && styles.selectedText
                  ]}>
                    Man
                  </Text>
                  <Text style={[
                    styles.mainOptionSubtitle,
                    selectedGender.includes("Man") && styles.selectedSubtext
                  ]}>
                    Radiate your masculine energy
                  </Text>
                </View>
                <View style={styles.orbSpace}>
                  {selectedGender.includes("Man") && <View style={styles.selectedOrb} />}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mainOption,
                selectedGender.includes("Woman") && styles.optionSelected,
              ]}
              onPress={() => toggleGender("Woman")}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.mainOptionTitle,
                    selectedGender.includes("Woman") && styles.selectedText
                  ]}>
                    Woman
                  </Text>
                  <Text style={[
                    styles.mainOptionSubtitle,
                    selectedGender.includes("Woman") && styles.selectedSubtext
                  ]}>
                    Embrace your feminine essence
                  </Text>
                </View>
                <View style={styles.orbSpace}>
                  {selectedGender.includes("Woman") && <View style={styles.selectedOrb} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* More Options Dropdown */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={styles.dropdownButtonText}>
              {dropdownOpen ? "Hide more options" : "More options"}
            </Text>
            <Ionicons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* Dropdown Options */}
          {dropdownOpen && (
            <View style={styles.dropdown}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.title}
                  style={[
                    styles.dropdownOption,
                    selectedGender.includes(option.title) && styles.optionSelected,
                  ]}
                  onPress={() => toggleGender(option.title)}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.dropdownOptionTitle,
                        selectedGender.includes(option.title) && styles.selectedText
                      ]}>
                        {option.title}
                      </Text>
                      {option.subtitle && (
                        <Text style={[
                          styles.dropdownOptionSubtitle,
                          selectedGender.includes(option.title) && styles.selectedSubtext
                        ]}>
                          {option.subtitle}
                        </Text>
                      )}
                    </View>
                    <View style={styles.orbSpace}>
                      {selectedGender.includes(option.title) && <View style={styles.selectedOrb} />}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Hidden Field Toggle */}
          <View style={styles.hiddenContainer}>
            <Text style={styles.hiddenText}>Keep this private</Text>
            <View style={styles.orbCheckboxContainer}>
              <TouchableOpacity 
                style={styles.orbCheckbox}
                onPress={() => toggleHidden("gender")}
              >
                {hiddenFields.gender && <View style={styles.selectedOrb} />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            In the circle of life, every soul shines with their unique light
          </Text>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
          <Ionicons name="chevron-forward" size={24} color={colors.background} />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const createStyles = (colorScheme: 'light' | 'dark', fonts: Record<string, any>) => {
  const colors = Colors[colorScheme];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollViewContent: {
      padding: Spacing.lg,
      paddingBottom: 100, // Space for submit button
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
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
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
    mainOptionsContainer: {
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    mainOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    optionSelected: {
      borderColor: '#FFD700',
      backgroundColor: '#FFD700' + '15',
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionTextContainer: {
      flex: 1,
    },
    mainOptionTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.medium,
    },
    mainOptionSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      fontStyle: "italic",
    },
    selectedText: {
      color: colors.textDark,
    },
    selectedSubtext: {
      color: colors.textLight,
    },
    orbSpace: {
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: Spacing.md,
    },
    selectedOrb: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#FFD700',
      ...Platform.select({
        ios: {
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    dropdownButton: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
      marginHorizontal: Spacing.lg,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropdownButtonText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      fontSize: Typography.sizes.base,
      fontStyle: "italic",
    },
    dropdown: {
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    dropdownOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.lg,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropdownOptionTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textDark,
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.medium,
    },
    dropdownOptionSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      fontStyle: "italic",
    },
    hiddenContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      backgroundColor: colors.card,
      padding: Spacing.lg,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    hiddenText: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.base,
      fontStyle: "italic",
    },
    orbCheckboxContainer: {
      marginLeft: Spacing.md,
    },
    orbCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    affirmation: {
      ...fonts.affirmationFont,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
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
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  });
};

export default GenderScreen;