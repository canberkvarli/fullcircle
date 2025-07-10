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

// Sacred Partnership Types (main cards)
const sacredPartnershipTypes = [
  { 
    id: "Soul Mate", 
    label: "Soul Mate Connection", 
    subtitle: "Deep karmic bond across lifetimes",
    color: "#E91E63"
  },
  { 
    id: "Twin Flame", 
    label: "Twin Flame Union", 
    subtitle: "Mirror soul divine reunion",
    color: "#FF5722"
  },
  { 
    id: "Tantric Partnership", 
    label: "Tantric Sacred Union", 
    subtitle: "Sacred sexuality and divine intimacy",
    color: "#9C27B0"
  },
];

// Spiritual Partnership Values (pills)
const partnershipValues = [
  "Conscious Communication",
  "Sacred Sexuality",
  "Spiritual Growth Together",
  "Meditation Partnership",
  "Healing Each Other",
  "Divine Service",
  "Ceremonial Connection",
  "Energy Exchange",
  "Chakra Alignment",
  "Manifestation Together",
  "Past Life Healing",
  "Kundalini Awakening",
  "Sacred Plant Journeys",
  "Astral Travel Together",
  "Psychic Connection",
];

// All-encompassing option
const openToAllOption = { 
  id: "Open to All Sacred Unions", 
  label: "All Sacred Unions", 
  subtitle: "Open to any divine partnership form",
  color: "#FFD700"
};

const SpiritualPartnershipScreen = () => {
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

  const [selectedPartnerships, setSelectedPartnerships] = useState<string[]>(
    userData?.spiritualProfile?.partnershipTypes || []
  );
  const [selectedValues, setSelectedValues] = useState<string[]>(
    userData?.spiritualProfile?.partnershipValues || []
  );

  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    spiritualPartnership: userData?.hiddenFields?.spiritualPartnership || false,
  });

  useEffect(() => {
    setHiddenFields((prev) => ({
      ...prev,
      spiritualPartnership:
        prev.spiritualPartnership !== undefined ? prev.spiritualPartnership : false,
    }));
  }, []);

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // Helper function to get orb color based on selection state
  const getOrbColor = (itemId: string, itemColor?: string) => {
    const allSelected = selectedPartnerships.includes("Open to All Sacred Unions");
    if (allSelected) {
      return '#FFD700'; // Divine yellow when "All Sacred Unions" is selected
    }
    return itemColor || '#00BCD4'; // Default teal for values
  };

  // Helper function to get selection color
  const getSelectionColor = (itemId: string, itemColor?: string) => {
    const orbColor = getOrbColor(itemId, itemColor);
    return orbColor + '15'; // Add transparency
  };

  const togglePartnership = (partnershipId: string) => {
    setSelectedPartnerships((prev) => {
      if (partnershipId === "Open to All Sacred Unions") {
        if (prev.includes("Open to All Sacred Unions")) {
          // If "Open to All" is selected, deselect everything
          return [];
        } else {
          // Select all partnership types
          const allTypes = sacredPartnershipTypes.map(type => type.id);
          return ["Open to All Sacred Unions", ...allTypes];
        }
      }

      // For any other partnership
      const updated = prev.includes(partnershipId)
        ? prev.filter((item) => item !== partnershipId)
        : [...prev, partnershipId];

      // If we deselect any option and "Open to All" is selected, remove "Open to All"
      if (prev.includes("Open to All Sacred Unions") && updated.length < prev.length) {
        return updated.filter((item) => item !== "Open to All Sacred Unions");
      }

      // Check if ALL partnership types are now selected
      const allTypes = sacredPartnershipTypes.map(type => type.id);
      const hasAllTypes = allTypes.every(type => updated.includes(type));
      
      // If we now have all types selected, auto-add "Open to All"
      if (hasAllTypes && !updated.includes("Open to All Sacred Unions")) {
        return [...updated, "Open to All Sacred Unions"];
      }

      return updated;
    });
  };

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (selectedPartnerships.length === 0 && selectedValues.length === 0) {
      Alert.alert("Sacred Partnership", "Please select at least one partnership type or value that resonates with you");
      return;
    }

    try {
      await updateUserData({
        spiritualProfile: {
          ...userData.spiritualProfile,
          partnershipTypes: selectedPartnerships,
          partnershipValues: selectedValues,
        },
        hiddenFields: {
          ...(userData.hiddenFields || {}),
          spiritualPartnership: hiddenFields.spiritualPartnership,
        },
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert(
        "Cosmic Interference",
        "The universe had trouble saving your partnership preferences: " + error.message
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
          <OnboardingProgressBar currentScreen="SpiritualPartnershipScreen" />

          {/* Title */}
          <Text style={styles.title}>Sacred Partnership</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Explore the divine forms of spiritual connection you seek
          </Text>

          {/* Sacred Partnership Types */}
          <Text style={styles.sectionTitle}>Sacred Union Types</Text>
          <Text style={styles.sectionSubtitle}>
            What type of spiritual partnership calls to your soul?
          </Text>
          
          {/* Main Partnership Types */}
          <View style={styles.mainOptionsContainer}>
            {sacredPartnershipTypes.map((partnership) => (
              <TouchableOpacity
                key={partnership.id}
                style={[
                  styles.mainOption,
                  selectedPartnerships.includes(partnership.id) && {
                    ...styles.optionSelected,
                    backgroundColor: getSelectionColor(partnership.id, partnership.color),
                    borderColor: getOrbColor(partnership.id, partnership.color),
                  },
                ]}
                onPress={() => togglePartnership(partnership.id)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.mainTitle,
                      selectedPartnerships.includes(partnership.id) && styles.selectedText
                    ]}>
                      {partnership.label}
                    </Text>
                    <Text style={[
                      styles.mainSubtitle,
                      selectedPartnerships.includes(partnership.id) && styles.selectedSubtext
                    ]}>
                      {partnership.subtitle}
                    </Text>
                  </View>
                  <View style={styles.orbSpace}>
                    {selectedPartnerships.includes(partnership.id) && (
                      <View style={[styles.selectedOrb, { backgroundColor: getOrbColor(partnership.id, partnership.color) }]} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Open to All Option */}
          <View style={styles.coreOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.coreOption,
                selectedPartnerships.includes(openToAllOption.id) && {
                  ...styles.optionSelected,
                  backgroundColor: getSelectionColor(openToAllOption.id, openToAllOption.color),
                  borderColor: getOrbColor(openToAllOption.id, openToAllOption.color),
                },
              ]}
              onPress={() => togglePartnership(openToAllOption.id)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.coreTitle,
                    selectedPartnerships.includes(openToAllOption.id) && styles.selectedText
                  ]}>
                    {openToAllOption.label}
                  </Text>
                  <Text style={[
                    styles.coreSubtitle,
                    selectedPartnerships.includes(openToAllOption.id) && styles.selectedSubtext
                  ]}>
                    {openToAllOption.subtitle}
                  </Text>
                </View>
                <View style={styles.orbSpace}>
                  {selectedPartnerships.includes(openToAllOption.id) && (
                    <View style={[styles.selectedOrb, { backgroundColor: getOrbColor(openToAllOption.id, openToAllOption.color) }]} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Partnership Values */}
          <Text style={styles.sectionTitle}>Partnership Values</Text>
          <Text style={styles.sectionSubtitle}>
            What spiritual practices and values matter most in partnership?
          </Text>

          <View style={styles.pillsContainer}>
            {partnershipValues.map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.pillButton,
                  selectedValues.includes(value) && {
                    ...styles.pillSelected,
                    backgroundColor: getSelectionColor(value),
                    borderColor: getOrbColor(value),
                  },
                ]}
                onPress={() => toggleValue(value)}
              >
                <Text style={[
                  styles.pillText,
                  selectedValues.includes(value) && styles.pillSelectedText,
                ]}>
                  {value}
                </Text>
                <View style={styles.pillOrbSpace}>
                  {selectedValues.includes(value) && (
                    <View style={[styles.pillSelectedOrb, { backgroundColor: getOrbColor(value) }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hidden Field Toggle */}
          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>Keep my partnership preferences private</Text>
            <View style={styles.orbCheckboxContainer}>
              <TouchableOpacity 
                style={styles.orbCheckbox}
                onPress={() => toggleHidden("spiritualPartnership")}
              >
                {hiddenFields.spiritualPartnership && (
                  <View style={[styles.selectedOrb, { backgroundColor: '#FFD700' }]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Sacred partnership is a path of mutual awakening, where two souls support each other's highest evolution
          </Text>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (selectedPartnerships.length === 0 && selectedValues.length === 0) && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={selectedPartnerships.length === 0 && selectedValues.length === 0}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={(selectedPartnerships.length > 0 || selectedValues.length > 0) ? colors.background : colors.textMuted} 
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
    sectionTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      color: colors.textDark,
      fontWeight: Typography.weights.medium,
      marginBottom: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    sectionSubtitle: {
      ...fonts.captionFont,
      color: colors.primary,
      textAlign: "left",
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    mainOptionsContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    mainOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
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
    coreOptionsContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
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
    mainTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.lg,
      color: colors.textDark,
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.bold,
      textAlign: "center",
    },
    mainSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      fontStyle: "italic",
      textAlign: "center",
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
      paddingHorizontal: Spacing.lg,
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
    privacyContainer: {
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
    privacyText: {
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
  });
};

export default SpiritualPartnershipScreen;