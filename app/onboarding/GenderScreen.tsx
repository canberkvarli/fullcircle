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
import RoundedCheckbox from "@/components/RoundedCheckbox";

// Spiritual color palette
const spiritualColors = {
  masculine: '#4A90E2',    // Calming blue - represents depth, stability, wisdom
  feminine: '#E94B7C',     // Warm pink/rose - represents nurturing, compassion, love
  divine: '#FFD700',       // Golden yellow - represents enlightenment, universal energy
  masculineGlow: '#4A90E2' + '20',
  feminineGlow: '#E94B7C' + '20',
  divineGlow: '#FFD700' + '20',
};

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
  const [warningVisible, setWarningVisible] = useState(false);

  const toggleGender = (gender: string) => {
    if (selectedGender.includes(gender)) {
      setSelectedGender(selectedGender.filter((g) => g !== gender));
      setWarningVisible(false);
    } else {
      // Prevent Man + Woman combination
      if (gender === "Man" && selectedGender.includes("Woman")) {
        setSelectedGender(["Man"]); // Replace Woman with Man
        setWarningVisible(false);
      } else if (gender === "Woman" && selectedGender.includes("Man")) {
        setSelectedGender(["Woman"]); // Replace Man with Woman
        setWarningVisible(false);
      } else {
        // If at limit, replace the oldest selection with the new one
        if (selectedGender.length >= 2) {
          const newSelection = [selectedGender[1], gender]; // Keep most recent, add new
          setSelectedGender(newSelection);
          setWarningVisible(false);
        } else {
          // Normal addition when under limit
          setSelectedGender([...selectedGender, gender]);
          setWarningVisible(false);
        }
      }
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleNext = async () => {
    if (selectedGender.length === 0) {
      return; // Don't proceed without selection
    }
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
    { title: "Questioning", subtitle: "Honor your journey of discovery" },
  ];

  // Helper function to get colors for each option
  const getOptionColors = (title: string) => {
    if (title === "Man") {
      return {
        borderColor: spiritualColors.masculine,
        backgroundColor: spiritualColors.masculineGlow,
        orbColor: spiritualColors.masculine,
      };
    } else if (title === "Woman") {
      return {
        borderColor: spiritualColors.feminine,
        backgroundColor: spiritualColors.feminineGlow,
        orbColor: spiritualColors.feminine,
      };
    } else {
      return {
        borderColor: spiritualColors.divine,
        backgroundColor: spiritualColors.divineGlow,
        orbColor: spiritualColors.divine,
      };
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={handlePrevious}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>

          <OnboardingProgressBar currentScreen="GenderScreen" />

          <Text style={styles.title}>How do you identify?</Text>

          <Text style={styles.subtitle}>
            Select up to 2 that best describe you
          </Text>

          {/* Gentle Warning Message */}
          {warningVisible && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                Please choose up to 2 identities that best represent you
              </Text>
            </View>
          )}

          <View style={styles.mainOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.mainOption,
                selectedGender.includes("Man") && {
                  ...styles.optionSelected,
                  borderColor: spiritualColors.masculine,
                  backgroundColor: spiritualColors.masculineGlow,
                }
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
                    Express your authentic strength
                  </Text>
                </View>
                <View style={styles.orbSpace}>
                  {selectedGender.includes("Man") && (
                    <View style={[
                      styles.selectedOrb,
                      { backgroundColor: spiritualColors.masculine }
                    ]} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mainOption,
                selectedGender.includes("Woman") && {
                  ...styles.optionSelected,
                  borderColor: spiritualColors.feminine,
                  backgroundColor: spiritualColors.feminineGlow,
                }
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
                    Embrace your radiant energy
                  </Text>
                </View>
                <View style={styles.orbSpace}>
                  {selectedGender.includes("Woman") && (
                    <View style={[
                      styles.selectedOrb,
                      { backgroundColor: spiritualColors.feminine }
                    ]} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

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

          {dropdownOpen && (
            <View style={styles.dropdown}>
              {genderOptions.map((option) => {
                const optionColors = getOptionColors(option.title);
                return (
                  <TouchableOpacity
                    key={option.title}
                    style={[
                      styles.dropdownOption,
                      selectedGender.includes(option.title) && {
                        borderColor: optionColors.borderColor,
                        backgroundColor: optionColors.backgroundColor,
                      }
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
                        {selectedGender.includes(option.title) && (
                          <View style={[
                            styles.selectedOrb,
                            { backgroundColor: optionColors.orbColor }
                          ]} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>Keep this private</Text>
            <RoundedCheckbox
              value={hiddenFields["gender"] || false}
              onValueChange={() => toggleHidden("gender")}
            />
          </View>

          <Text style={styles.affirmation}>
            Every{' '}
            <Text style={styles.highlightedWord}>identity</Text>
            {' deserves to be seen, celebrated, and honored'}
          </Text>
        </ScrollView>

        <TouchableOpacity 
          style={[
            styles.submitButton,
            selectedGender.length === 0 && styles.submitButtonDisabled
          ]} 
          onPress={handleNext}
          disabled={selectedGender.length === 0}
        >
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
      paddingBottom: 100,
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
      fontStyle: "normal",
    },
    warningContainer: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary + '30',
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
    warningText: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      textAlign: "center",
      fontSize: Typography.sizes.sm,
      fontStyle: "italic",
    },
    mainOptionsContainer: {
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    mainOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
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
      // Dynamic colors applied inline
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
      fontStyle: "normal",
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
      // Dynamic backgroundColor applied inline
      ...Platform.select({
        ios: {
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
      borderRadius: BorderRadius.xl,
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
      fontStyle: "normal",
    },
    dropdown: {
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    dropdownOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
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
      fontStyle: "normal",
    },
    privacyContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Spacing.xl,
      marginHorizontal: Spacing.lg,
      backgroundColor: colors.card,
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    privacyText: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.base,
      fontStyle: "normal",
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "center",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      paddingHorizontal: Spacing.lg,
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
    submitButtonDisabled: {
      backgroundColor: colors.textMuted,
      opacity: 0.6,
      ...Platform.select({
        ios: {
          shadowColor: colors.textMuted,
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
    },
  });
};

export default GenderScreen;