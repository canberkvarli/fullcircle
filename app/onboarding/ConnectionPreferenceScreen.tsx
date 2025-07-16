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

  // 🎨 SIMPLIFIED: Just get subtle selection colors - no text color changes
  const getSelectionColor = (optionId: string, intent: string = connectionIntent) => {
    if (intent === "romantic") {
      switch (optionId) {
        case "Men":
          return '#6366F1' + '15'; // Very subtle indigo
        case "Women":
          return '#EC4899' + '15'; // Very subtle pink
        case "Non-Binary":
          return '#8B5CF6' + '15'; // Very subtle purple
        case "Everyone":
          return '#F59E0B' + '15'; // Very subtle amber
        default:
          return '#D4AF37' + '15'; // Subtle gold for styles
      }
    } else if (intent === "friendship") {
      return '#10B981' + '15'; // Very subtle emerald
    } else if (intent === "both") {
      return '#8B5CF6' + '15'; // Very subtle purple
    }
    return '#D4AF37' + '15'; // Default subtle gold
  };

  // 🎨 SIMPLIFIED: Get border colors (slightly stronger than background)
  const getBorderColor = (optionId: string, intent: string = connectionIntent) => {
    if (intent === "romantic") {
      switch (optionId) {
        case "Men":
          return '#6366F1' + '40';
        case "Women":
          return '#EC4899' + '40';
        case "Non-Binary":
          return '#8B5CF6' + '40';
        case "Everyone":
          return '#F59E0B' + '40';
        default:
          return '#D4AF37' + '40';
      }
    } else if (intent === "friendship") {
      return '#10B981' + '40';
    } else if (intent === "both") {
      return '#8B5CF6' + '40';
    }
    return '#D4AF37' + '40';
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

  const isFormValid = connectionIntent && 
    (!((connectionIntent === "romantic" || connectionIntent === "both") && selectedPreferences.length === 0));

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
                    backgroundColor: getSelectionColor('', intent.id),
                    borderColor: getBorderColor('', intent.id),
                  },
                ]}
                onPress={() => toggleConnectionIntent(intent.id)}
              >
                <View style={styles.intentContent}>
                  <Ionicons 
                    name={intent.icon as any} 
                    size={24} 
                    color={connectionIntent === intent.id ? '#D4AF37' : colors.textMuted} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.intentTitle}>
                      {intent.label}
                    </Text>
                    <Text style={styles.intentSubtitle}>
                      {intent.subtitle}
                    </Text>
                  </View>
                  {connectionIntent === intent.id && (
                    <View style={styles.selectedOrb} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Connection Preferences - Show only if romantic or both intent is selected */}
          {(connectionIntent === "romantic" || connectionIntent === "both") && (
            <>
              <Text style={styles.sectionTitle}>
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
                        borderColor: getBorderColor(option.id),
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => togglePreference(option.id)}
                  >
                    <View style={styles.optionContent}>
                      <View style={styles.optionTextContainer}>
                        <Text style={styles.preferenceTitle}>
                          {option.label}
                        </Text>
                        <Text style={styles.preferenceSubtitle}>
                          {option.subtitle}
                        </Text>
                      </View>
                      <View style={styles.orbSpace}>
                        {selectedPreferences.includes(option.id) && (
                          <View style={styles.selectedOrb} />
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
              <Text style={styles.sectionTitle}>
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
                        borderColor: getBorderColor(style),
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
                        <View style={styles.pillSelectedOrb} />
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

        <TouchableOpacity 
          style={[
            styles.submitButton,
            !isFormValid && styles.submitButtonDisabled,
          ]} 
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={isFormValid ? colors.background : colors.textMuted} 
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
      marginTop: Platform.select({ ios: 0, android: Spacing.sm }),
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
    // 🎨 FIXED: Consistent text colors
    intentTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark, // Always same color
      marginLeft: Spacing.md,
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.bold,
    },
    intentSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight, // Always same color
      fontStyle: "italic",
      marginLeft: Spacing.md,
    },
    sectionTitle: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes.xl,
      color: colors.textDark, // 🎨 FIXED: Always consistent
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
    // 🎨 FIXED: Consistent text colors
    preferenceTitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.lg,
      color: colors.textDark, // Always same color
      marginBottom: Spacing.xs,
      fontWeight: Typography.weights.medium,
    },
    preferenceSubtitle: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.base,
      color: colors.textLight, // Always same color
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
      backgroundColor: '#D4AF37', // 🎨 FIXED: Consistent golden color
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
    // 🎨 FIXED: Consistent text colors
    pillText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textDark, // Always same color
      textAlign: "center",
    },
    pillSelectedText: {
      color: colors.textDark, // Always same color
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
      backgroundColor: '#D4AF37', // 🎨 FIXED: Consistent golden color
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
    // 🎨 FIXED: Submit button - exactly like GenderScreen
    submitButton: {
      position: "absolute",
      bottom: Platform.select({ ios: 50, android: 30 }),
      right: Spacing.xl,
      backgroundColor: colors.primary, // Use colors.primary like GenderScreen
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