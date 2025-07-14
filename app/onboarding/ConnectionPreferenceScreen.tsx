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
import RoundedCheckbox from "@/components/RoundedCheckbox";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

// Combined connection styles (pills for "both" option)
const combinedStyles = [
  // Romantic styles
  "Twin Flame Seeker",
  "Soul Mate Guided", 
  "Tantric Connection",
  "Heart-Centered",
  "Polyamorous Soul",
  "Monogamous Journey",
  "Love Without Labels",
  // Friendship styles
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
  { 
    id: "both", 
    label: "Both", 
    subtitle: "Open to all types of meaningful connections",
    icon: "infinite"
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
          return '#6366F1'; // Indigo for masculine energy
        case "Women":
          return '#EC4899'; // Pink for feminine energy
        case "Non-Binary":
          return '#8B5CF6'; // Purple for non-binary
        case "Everyone":
          return '#F59E0B'; // Amber for all energies
        default:
          return '#F97316'; // Orange for romantic styles
      }
    } else if (intent === "friendship") {
      return '#10B981'; // Emerald for friendship
    } else if (intent === "both") {
      // Use purple/violet theme for "both"
      switch (optionId) {
        case "Men":
          return '#6366F1'; // Indigo for masculine energy
        case "Women":
          return '#EC4899'; // Pink for feminine energy
        case "Non-Binary":
          return '#8B5CF6'; // Purple for non-binary
        case "Everyone":
          return '#F59E0B'; // Amber for all energies
        default:
          return '#8B5CF6'; // Purple for combined styles
      }
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
        primary: '#EC4899',
        secondary: '#FDF2F8',
        accent: '#BE185D',
        gradient: ['#EC4899', '#F97316'],
      };
    } else if (intent === "friendship") {
      return {
        primary: '#10B981',
        secondary: '#F0FDF4',
        accent: '#047857',
        gradient: ['#10B981', '#06B6D4'],
      };
    } else if (intent === "both") {
      return {
        primary: '#8B5CF6',
        secondary: '#F5F3FF',
        accent: '#7C3AED',
        gradient: ['#8B5CF6', '#EC4899'],
      };
    } else {
      return {
        primary: '#06B6D4',
        secondary: '#F0F9FF',
        accent: '#0891B2',
        gradient: ['#06B6D4', '#8B5CF6'],
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

    // For romantic and both, we need specific preferences
    if ((connectionIntent === "romantic" || connectionIntent === "both") && selectedPreferences.length === 0) {
      Alert.alert("Dating Preferences", "Please select at least one preference");
      return;
    }

    try {
      await updateUserData({
        matchPreferences: {
          ...userData.matchPreferences,
          connectionIntent: connectionIntent as "romantic" | "friendship" | "both",
          connectionPreferences: (connectionIntent === "romantic" || connectionIntent === "both") ? selectedPreferences : ["Everyone"],
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
      Alert.alert(
        "Cosmic Interference",
        "The universe had trouble saving your preferences: " + error.message
      );
    }
  };

  const currentStyles = connectionIntent === "romantic" ? romanticStyles 
                     : connectionIntent === "friendship" ? friendshipStyles 
                     : connectionIntent === "both" ? combinedStyles 
                     : [];
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
                  <Ionicons 
                    name={intent.icon as any} 
                    size={24} 
                    color={connectionIntent === intent.id ? getIntentColors(intent.id).primary : colors.textMuted} 
                  />
                  <View style={{ flex: 1 }}>
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
                    <View style={[styles.selectedOrb, { backgroundColor: getIntentColors(intent.id).primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Connection Preferences - Show only if romantic or both intent is selected */}
          {(connectionIntent === "romantic" || connectionIntent === "both") && (
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
                {connectionIntent === "romantic" 
                  ? "Connection Style" 
                  : connectionIntent === "friendship" 
                    ? "How do you want to connect?" 
                    : "How do you want to connect?"}
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

              {/* Hidden Field Toggle - Using standard checkbox */}
              <View style={styles.privacyContainer}>
                <Text style={styles.privacyText}>Keep this private</Text>
                <RoundedCheckbox
                  value={hiddenFields["connectionPreferences"] || false}
                  onValueChange={() => toggleHidden("connectionPreferences")}
                />
              </View>

              <Text style={styles.affirmation}>
                Open your heart to the 
                <Text style={styles.highlightedWord}> dance </Text> 
                of love and connection
              </Text>
            </>
          )}
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            !connectionIntent && styles.submitButtonDisabled,
            ((connectionIntent === "romantic" || connectionIntent === "both") && selectedPreferences.length === 0) && styles.submitButtonDisabled,
            connectionIntent && { backgroundColor: intentColors.primary }
          ]} 
          onPress={handleSubmit}
          disabled={!connectionIntent || ((connectionIntent === "romantic" || connectionIntent === "both") && selectedPreferences.length === 0)}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={connectionIntent && !((connectionIntent === "romantic" || connectionIntent === "both") && selectedPreferences.length === 0) ? colors.background : colors.textMuted} 
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
    },
    intentOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      position: "relative",
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    intentSelected: {
      borderWidth: 2,
      transform: [{ scale: 1.02 }],
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    intentContent: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    intentTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      marginLeft: Spacing.md,
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.bold,
    },
    intentSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight,
      fontStyle: "italic",
      marginLeft: Spacing.md,
    },
    sectionTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.lg,
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      fontWeight: Typography.weights.bold,
    },
    preferencesContainer: {
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    preferenceOption: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      position: "relative",
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
    },
    pillButton: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.full,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginRight: Spacing.xs,
      marginBottom: Spacing.sm,
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
          shadowOpacity: 0.06,
          shadowRadius: 6,
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
      fontWeight: Typography.weights.medium,
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "center",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      paddingHorizontal: Spacing.lg,
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

export default ConnectionPreferenceScreen;