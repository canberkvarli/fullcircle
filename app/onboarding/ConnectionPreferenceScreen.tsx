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

// Connection Intent Options
const connectionIntents = [
  { 
    id: "romantic", 
    label: "Dating", 
    subtitle: "Seeking romantic & intimate connections",
    icon: "heart"
  },
  { 
    id: "friendship", 
    label: "Friendship", 
    subtitle: "Building meaningful platonic bonds",
    icon: "people"
  },
];

// Romantic dating preferences (for when "romantic" is selected)
const romanticOptions = [
  { id: "Men", label: "Masculine Energy", subtitle: "Drawn to masculine souls" },
  { id: "Women", label: "Feminine Energy", subtitle: "Attracted to feminine essence" },
  { id: "Non-Binary", label: "Non-Binary Souls", subtitle: "Connected to fluid expressions" },
  { id: "Everyone", label: "All Energies", subtitle: "Open to every beautiful soul" },
];

// Romantic connection styles (pills for romantic)
const romanticStyles = [
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

// Friendship connection styles (pills for friendship)
const friendshipStyles = [
  "Practice Partners",
  "Meditation Buddies",
  "Adventure Seekers",
  "Study Circles",
  "Healing Circles",
  "Creative Collaborators",
  "Retreat Companions",
  "Wisdom Sharers",
  "Community Builders",
  "Soul Supporters",
];

const ConnectionPreferenceScreen = () => {
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

  // Connection intent state
  const [connectionIntent, setConnectionIntent] = useState<string>(
    userData?.matchPreferences?.connectionIntent || ""
  );

  // Preferences based on connection intent
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    userData?.matchPreferences?.connectionPreferences || []
  );

  // Connection styles
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    userData?.matchPreferences?.connectionStyles || []
  );

  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    connectionPreferences: userData?.hiddenFields?.connectionPreferences || false,
  });

  useEffect(() => {
    setHiddenFields((prev) => ({
      ...prev,
      connectionPreferences:
        prev.connectionPreferences !== undefined ? prev.connectionPreferences : false,
    }));
    setConnectionIntent(userData?.matchPreferences?.connectionIntent || "");
    setSelectedPreferences(userData?.matchPreferences?.connectionPreferences || []);
    setSelectedStyles(userData?.matchPreferences?.connectionStyles || []);
  }, [userData]);

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  // Helper function to get orb color based on option and intent
  const getOrbColor = (optionId: string, intent: string = connectionIntent) => {
    if (intent === "romantic") {
      switch (optionId) {
        case "Men":
          return '#3B82F6'; // Classic blue for masculine energy
        case "Women":
          return '#F59E0B'; // Warm amber for feminine energy
        case "Non-Binary":
          return '#8B5CF6'; // Purple for non-binary
        case "Everyone":
          return '#DC2626'; // Rich red for all energies
        default:
          return '#EF4444'; // Bright red for romantic styles
      }
    } else if (intent === "friendship") {
      return '#059669'; // Consistent emerald for friendship
    }
    return '#06B6D4'; // Cyan default
  };

  // Helper function to get selection color
  const getSelectionColor = (optionId: string, intent: string = connectionIntent) => {
    const orbColor = getOrbColor(optionId, intent);
    return orbColor + '20'; // Add transparency
  };

  // Get intent-specific colors
  const getIntentColors = (intent: string) => {
    if (intent === "romantic") {
      return {
        primary: '#B91C1C', // Deep sophisticated red
        secondary: '#FEF2F2', // Very light red background
        accent: '#7F1D1D', // Darker red accent
        gradient: ['#B91C1C', '#DC2626'],
      };
    } else {
      return {
        primary: '#059669', // Rich emerald green
        secondary: '#ECFDF5', // Very light green background
        accent: '#047857', // Deeper green accent
        gradient: ['#059669', '#10B981'],
      };
    }
  };

  const toggleConnectionIntent = (intent: string) => {
    setConnectionIntent(intent);
    // Reset preferences when switching intent
    setSelectedPreferences([]);
    setSelectedStyles([]);
  };

  const togglePreference = (preference: string) => {
    setSelectedPreferences((prev: any) => {
      if (preference === "Everyone") {
        if (prev.includes("Everyone")) {
          return [];
        } else {
          const allOtherOptions = romanticOptions.slice(0, -1).map(opt => opt.id);
          return ["Everyone", ...allOtherOptions];
        }
      }

      const updated = prev.includes(preference)
        ? prev.filter((item: any) => item !== preference)
        : [...prev, preference];

      if (prev.includes("Everyone") && updated.length < prev.length) {
        return updated.filter((item: any) => item !== "Everyone");
      }

      const allOtherOptions = romanticOptions.slice(0, -1).map(opt => opt.id);
      const hasAllOthers = allOtherOptions.every(option => updated.includes(option));
      
      if (hasAllOthers && !updated.includes("Everyone")) {
        return [...updated, "Everyone"];
      }

      return updated;
    });
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev: any) => {
      return prev.includes(style)
        ? prev.filter((item: any) => item !== style)
        : [...prev, style];
    });
  };

  const handleSubmit = async () => {
    if (!connectionIntent) {
      Alert.alert("Connection Choice", "Please select your connection intent");
      return;
    }

    // For friendship, we don't need specific preferences - just the intent
    if (connectionIntent === "romantic" && selectedPreferences.length === 0) {
      Alert.alert("Dating Preferences", "Please select at least one preference");
      return;
    }

    try {
      await updateUserData({
        matchPreferences: {
          ...userData.matchPreferences,
          connectionIntent: connectionIntent as "romantic" | "friendship",
          connectionPreferences: connectionIntent === "romantic" ? selectedPreferences : ["Everyone"],
          connectionStyles: selectedStyles,
          // Maintain backward compatibility
          datePreferences: connectionIntent === "romantic" ? selectedPreferences : [],
          preferredDistance: userData.matchPreferences?.preferredDistance || 0,
          preferredAgeRange: userData.matchPreferences?.preferredAgeRange || { min: 18, max: 99 },
          preferredHeightRange: userData.matchPreferences?.preferredHeightRange || { min: 0, max: 300 },
        },
        hiddenFields: {
          ...(userData.hiddenFields || {}),
          connectionPreferences: hiddenFields.connectionPreferences,
        },
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Unable to save your preferences: " + error.message);
    }
  };

  const currentStyles = connectionIntent === "romantic" ? romanticStyles : friendshipStyles;
  const intentColors = getIntentColors(connectionIntent);

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
          <OnboardingProgressBar currentScreen="ConnectionPreferenceScreen" />

          {/* Title */}
          <Text style={styles.title}>Connection Preferences</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            What type of meaningful connections are you seeking?
          </Text>
          
          {/* Connection Intent Selection */}
          <View style={styles.intentContainer}>
            {connectionIntents.map((intent) => (
              <TouchableOpacity
                key={intent.id}
                style={[
                  styles.intentOption,
                  connectionIntent === intent.id && {
                    ...styles.intentSelected,
                    backgroundColor: getIntentColors(intent.id).secondary,
                    borderColor: getIntentColors(intent.id).primary,
                  },
                ]}
                onPress={() => toggleConnectionIntent(intent.id)}
              >
                <View style={styles.intentContent}>
                  <View style={[
                    styles.iconContainer,
                    connectionIntent === intent.id && { 
                      backgroundColor: getIntentColors(intent.id).primary + '20',
                      borderColor: getIntentColors(intent.id).primary 
                    }
                  ]}>
                    <Ionicons 
                      name={intent.icon as any} 
                      size={20} 
                      color={connectionIntent === intent.id ? getIntentColors(intent.id).primary : colors.textMuted} 
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[
                      styles.intentTitle,
                      connectionIntent === intent.id && { color: getIntentColors(intent.id).primary }
                    ]}>
                      {intent.label}
                    </Text>
                    <Text style={[
                      styles.intentSubtitle,
                      connectionIntent === intent.id && { color: getIntentColors(intent.id).accent }
                    ]}>
                      {intent.subtitle}
                    </Text>
                  </View>
                  {connectionIntent === intent.id && (
                    <View style={styles.orbSpace}>
                      <View style={[styles.selectedOrb, { backgroundColor: getIntentColors(intent.id).primary }]} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Connection Preferences - Show only if romantic intent is selected */}
          {connectionIntent === "romantic" && (
            <>
              <Text style={[styles.sectionTitle, { color: intentColors.primary }]}>
                Who are you interested in?
              </Text>

              <View style={styles.preferencesContainer}>
                {romanticOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.preferenceOption,
                      selectedPreferences.includes(option.id) && {
                        backgroundColor: getSelectionColor(option.id),
                        borderColor: getOrbColor(option.id),
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => togglePreference(option.id)}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionTextContainer}>
                        <Text style={[
                          styles.preferenceTitle,
                          selectedPreferences.includes(option.id) && styles.selectedText
                        ]}>
                          {option.label}
                        </Text>
                        <Text style={[
                          styles.preferenceSubtitle,
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
            </>
          )}

          {/* Connection Styles - Show for both romantic and friendship */}
          {connectionIntent && (
            <>
              <Text style={[styles.sectionTitle, { color: intentColors.primary }]}>
                {connectionIntent === "romantic" ? "Connection Style" : "How do you want to connect?"}
              </Text>

              <View style={styles.pillsContainer}>
                {currentStyles.map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.pillButton,
                      selectedStyles.includes(style) && {
                        backgroundColor: getSelectionColor(style),
                        borderColor: getOrbColor(style),
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => toggleStyle(style)}
                  >
                    <Text style={[
                      styles.pillText,
                      selectedStyles.includes(style) && styles.pillSelectedText,
                    ]}>
                      {style}
                    </Text>
                    <View style={styles.pillOrbSpace}>
                      {selectedStyles.includes(style) && (
                        <View style={[styles.pillSelectedOrb, { backgroundColor: getOrbColor(style) }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Hidden Field Toggle */}
              <View style={styles.hiddenContainer}>
                <Text style={styles.hiddenText}>Keep this private</Text>
                <TouchableOpacity 
                  style={[
                    styles.checkboxContainer,
                    hiddenFields.connectionPreferences && styles.checkboxSelected
                  ]}
                  onPress={() => toggleHidden("connectionPreferences")}
                >
                  {hiddenFields.connectionPreferences && (
                    <Ionicons name="checkmark" size={16} color={colors.background} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Affirmation */}
              <Text style={styles.affirmation}>
                {connectionIntent === "romantic" 
                  ? <>Open your <Text style={styles.highlightedWord}>heart</Text> to the dance of love and connection</>
                  : "Nurture the bonds that support your spiritual journey"
                }
              </Text>
            </>
          )}
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            !connectionIntent && styles.submitButtonDisabled,
            (connectionIntent === "romantic" && selectedPreferences.length === 0) && styles.submitButtonDisabled,
          ]} 
          onPress={handleSubmit}
          disabled={!connectionIntent || (connectionIntent === "romantic" && selectedPreferences.length === 0)}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={connectionIntent && !(connectionIntent === "romantic" && selectedPreferences.length === 0) ? colors.background : colors.textMuted} 
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
    intentContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
      gap: Spacing.md,
    },
    intentOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      position: "relative",
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    intentSelected: {
      borderWidth: 2,
      backgroundColor: colors.background,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    intentContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.border + '20',
      borderWidth: 1,
      borderColor: colors.border + '60',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.lg,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    textContainer: {
      flex: 1,
    },
    intentTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      color: colors.textDark,
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.semibold,
    },
    intentSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textLight,
      fontStyle: "italic",
      lineHeight: Typography.sizes.sm * 1.3,
    },
    sectionTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.lg,
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      fontWeight: Typography.weights.semibold,
    },
    preferencesContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
      gap: Spacing.md,
    },
    preferenceOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
      position: "relative",
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    preferenceTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      color: colors.textDark,
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.medium,
    },
    preferenceSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      fontStyle: "italic",
      lineHeight: Typography.sizes.base * 1.3,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionTextContainer: {
      flex: 1,
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
      gap: Spacing.sm,
    },
    pillButton: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "flex-start",
      position: "relative",
      flexDirection: 'row',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
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
    hiddenContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      marginHorizontal: Spacing.lg,
      backgroundColor: colors.card,
      padding: Spacing.lg,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        android: {
          elevation: 2,
        },
      }),
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
    checkboxContainer: {
      width: 24,
      height: 24,
      borderRadius: BorderRadius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    highlightedWord: {
      color: colors.textDark, // Keep text dark
      textShadowColor: '#FFD700', // Divine yellow glow
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium, // Slightly bolder
      letterSpacing: 0.5, // More letter spacing for emphasis
    },
    submitButton: {
      position: "absolute",
      bottom: Platform.select({ ios: 50, android: 30 }),
      right: Spacing.xl,
      backgroundColor: '#8B5A2B', // Brown color like NameScreen
      borderRadius: BorderRadius.full,
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: '#8B5A2B',
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

export default ConnectionPreferenceScreen;