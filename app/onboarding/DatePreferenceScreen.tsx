import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
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

// Main dating preferences (bigger cards)
const mainOptions = [
  { id: "Men", label: "Masculine Energy", subtitle: "Drawn to masculine souls" },
  { id: "Women", label: "Feminine Energy", subtitle: "Attracted to feminine essence" },
];

// Other dating preferences (pills)
const otherOptions = [
  { id: "Non-Binary", label: "Non-Binary Souls", subtitle: "Connected to fluid expressions" },
  "Twin Flame Seeker",
  "Soul Mate Guided",
  "Tantric Connection",
  "Heart-Centered",
  "Consciousness Explorer",
  "Polyamorous Soul",
  "Monogamous Journey",
  "Spiritual Partnership",
  "Sacred Union",
  "Love Without Labels",
];

const allEnergyOption = { id: "Everyone", label: "All Energies", subtitle: "Open to every beautiful soul" };

const DatePreferenceScreen = () => {
  const {
    userData,
    updateUserData,
    navigateToPreviousScreen,
    navigateToNextScreen,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  // All dating preferences in one array
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    userData?.matchPreferences?.datePreferences || []
  );

  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    datePreferences: userData?.hiddenFields?.datePreferences || false,
  });

  useEffect(() => {
    setHiddenFields((prev) => ({
      ...prev,
      datePreferences:
        prev.datePreferences !== undefined ? prev.datePreferences : false,
    }));
    setSelectedPreferences(userData?.matchPreferences?.datePreferences || []);
  }, [userData]);

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // Helper function to get orb color based on option and state
  const getOrbColor = (optionId: string) => {
    if (selectedPreferences.includes("Everyone")) {
      return '#FFD700'; // Divine yellow when "All Energies" is selected
    }
    
    switch (optionId) {
      case "Men":
        return '#4A90E2'; // Blue for masculine energy
      case "Women":
        return '#E91E63'; // Pink for feminine energy
      case "Non-Binary":
        return '#9C27B0'; // Purple for non-binary
      case "Everyone":
        return '#FFD700'; // Golden for all energies
      default:
        return '#00BCD4'; // Teal for other options
    }
  };

  // Helper function to get selection color based on option and state
  const getSelectionColor = (optionId: string) => {
    const orbColor = getOrbColor(optionId);
    return orbColor + '15'; // Add transparency
  };

  const togglePreference = (preference: string) => {
    setSelectedPreferences((prev: any) => {
      if (preference === "Everyone") {
        if (prev.includes("Everyone")) {
          // If "Everyone" is currently selected, deselect everything
          return [];
        } else {
          // If "Everyone" is not selected, select everything
          const allOtherOptions = ["Men", "Women", "Non-Binary", ...otherOptions.slice(1)];
          return ["Everyone", ...allOtherOptions];
        }
      }

      // For any other preference
      const updated = prev.includes(preference)
        ? prev.filter((item: any) => item !== preference)
        : [...prev, preference];

      // If we deselect any option (other than "Everyone") and "Everyone" is selected, remove "Everyone"
      if (prev.includes("Everyone") && updated.length < prev.length) {
        return updated.filter((item: any) => item !== "Everyone");
      }

      // Check if ALL other options are now selected (except "Everyone")
      const allOtherOptions = ["Men", "Women", "Non-Binary", ...otherOptions.slice(1)];
      const hasAllOthers = allOtherOptions.every(option => typeof option === 'string' && updated.includes(option));      
      // If we now have all other options selected, auto-add "Everyone"
      if (hasAllOthers && !updated.includes("Everyone")) {
        return [...updated, "Everyone"];
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    // Must have at least one preference selected
    if (selectedPreferences.length === 0) {
      Alert.alert("Sacred Connection", "Please select at least one dating preference");
      return;
    }

    try {
      await updateUserData({
        matchPreferences: {
          datePreferences: selectedPreferences, // All preferences go here
          preferredDistance: userData.matchPreferences?.preferredDistance || 0,
          preferredAgeRange: userData.matchPreferences?.preferredAgeRange || { min: 18, max: 99 },
          preferredHeightRange: userData.matchPreferences?.preferredHeightRange || { min: 0, max: 300 },
        },
        hiddenFields: {
          ...(userData.hiddenFields || {}),
          datePreferences: hiddenFields.datePreferences,
        },
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert(
        "Cosmic Interference",
        "The universe had trouble saving your preferences: " + error.message
      );
    }
  };

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
            onPress={navigateToPreviousScreen}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textDark} />
          </TouchableOpacity>

          {/* Progress Bar */}
          <OnboardingProgressBar currentScreen="DatePreferenceScreen" />

          {/* Title */}
          <Text style={styles.title}>Sacred Dating Preferences</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Share how you approach love and connection
          </Text>
          
          {/* Main Options - Bigger Cards */}
          <View style={styles.mainOptionsContainer}>
            {mainOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.mainOption,
                  selectedPreferences.includes(option.id) && {
                    ...styles.optionSelected,
                    backgroundColor: getSelectionColor(option.id),
                    borderColor: getOrbColor(option.id),
                  },
                ]}
                onPress={() => togglePreference(option.id)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.mainTitle,
                      selectedPreferences.includes(option.id) && styles.selectedText
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.mainSubtitle,
                      selectedPreferences.includes(option.id) && styles.selectedSubtext
                    ]}>
                      {option.subtitle}
                    </Text>
                  </View>
                  <View style={styles.orbSpace}>
                    {selectedPreferences.includes(option.id) && (
                      <View style={[styles.selectedOrb, { backgroundColor: getOrbColor(option.id) }]} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* All Energies Card */}
          <View style={styles.coreOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.coreOption,
                selectedPreferences.includes(allEnergyOption.id) && {
                  ...styles.optionSelected,
                  backgroundColor: getSelectionColor(allEnergyOption.id),
                  borderColor: getOrbColor(allEnergyOption.id),
                },
              ]}
              onPress={() => togglePreference(allEnergyOption.id)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.coreTitle,
                    selectedPreferences.includes(allEnergyOption.id) && styles.selectedText
                  ]}>
                    {allEnergyOption.label}
                  </Text>
                  <Text style={[
                    styles.coreSubtitle,
                    selectedPreferences.includes(allEnergyOption.id) && styles.selectedSubtext
                  ]}>
                    {allEnergyOption.subtitle}
                  </Text>
                </View>
                <View style={styles.orbSpace}>
                  {selectedPreferences.includes(allEnergyOption.id) && (
                    <View style={[styles.selectedOrb, { backgroundColor: getOrbColor(allEnergyOption.id) }]} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Other Options - Pills */}
          <View style={styles.pillsContainer}>
            {otherOptions.map((option) => {
              const isObject = typeof option === 'object';
              const optionId = isObject ? option.id : option;
              const optionLabel = isObject ? option.label : option;
              
              return (
                <TouchableOpacity
                  key={optionId}
                  style={[
                    styles.pillButton,
                    selectedPreferences.includes(optionId) && {
                      ...styles.pillSelected,
                      backgroundColor: getSelectionColor(optionId),
                      borderColor: getOrbColor(optionId),
                    },
                  ]}
                  onPress={() => togglePreference(optionId)}
                >
                  <Text style={[
                    styles.pillText,
                    selectedPreferences.includes(optionId) && styles.pillSelectedText,
                  ]}>
                    {optionLabel}
                  </Text>
                  <View style={styles.pillOrbSpace}>
                    {selectedPreferences.includes(optionId) && (
                      <View style={[styles.pillSelectedOrb, { backgroundColor: getOrbColor(optionId) }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Hidden Field Toggle */}
          <View style={styles.hiddenContainer}>
            <Text style={styles.hiddenText}>Keep this private</Text>
            <View style={styles.orbCheckboxContainer}>
              <TouchableOpacity 
                style={styles.orbCheckbox}
                onPress={() => toggleHidden("datePreferences")}
              >
                {hiddenFields.datePreferences && (
                  <View style={[styles.selectedOrb, { backgroundColor: '#FFD700' }]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Follow your heart toward the connections that nourish your soul
          </Text>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            selectedPreferences.length === 0 && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={selectedPreferences.length === 0}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={selectedPreferences.length > 0 ? colors.background : colors.textMuted} 
          />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const createStyles = (colorScheme: 'light' | 'dark', fonts: Record<string, any>) => {
  const colors = Colors[colorScheme];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollViewContent: {
      padding: Spacing.lg,
      paddingBottom: 120,
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
    coreOptionsContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    coreOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
      position: "relative",
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
      // borderColor and backgroundColor will be set dynamically
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionTextContainer: {
      flex: 1,
    },
    coreTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.medium,
    },
    coreSubtitle: {
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
      // backgroundColor will be set dynamically
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
    pillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: Spacing.xs,
      marginBottom: Spacing.xl,
    },
    pillButton: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      marginRight: Spacing.sm,
      marginBottom: Spacing.sm,
      borderWidth: 2,
      borderColor: colors.border,
      alignSelf: "flex-start",
      position: "relative",
      flexDirection: 'row',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    pillSelected: {
      // borderColor and backgroundColor will be set dynamically
    },
    pillText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textDark,
      textAlign: "center",
    },
    pillSelectedText: {
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
    },
    pillOrbSpace: {
      width: 12,
      height: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: Spacing.xs,
    },
    pillSelectedOrb: {
      width: 8,
      height: 8,
      borderRadius: 4,
      // backgroundColor will be set dynamically
      ...Platform.select({
        ios: {
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
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
    mainOptionsContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    mainOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
      borderWidth: 3,
      borderColor: colors.border,
      position: "relative",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    mainTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      marginBottom: Spacing.sm,
      fontWeight: Typography.weights.bold,
      textAlign: "center",
    },
    mainSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      color: colors.textLight,
      fontStyle: "italic",
      textAlign: "center",
    }
  });
};

export default DatePreferenceScreen;