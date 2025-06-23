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
import Checkbox from "expo-checkbox";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const options = [
  "Straight",
  "Gay", 
  "Lesbian",
  "Bisexual",
  "Asexual",
  "Demisexual",
  "Pansexual",
  "Queer",
  "Questioning",
  "Heterosexual",
  "Polysexual",
  "Sapiosexual",
];

const SexualOrientationScreen = () => {
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

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    sexualOrientation: userData?.hiddenFields?.sexualOrientation || false,
  });

  useEffect(() => {
    setHiddenFields((prev) => ({
      ...prev,
      sexualOrientation:
        prev.sexualOrientation !== undefined ? prev.sexualOrientation : false,
    }));
    if (userData.sexualOrientation) {
      setSelectedOptions(userData.sexualOrientation);
    }
  }, [userData]);

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const toggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      Alert.alert("Sacred Expression", "Please select at least one orientation that resonates with your heart");
      return;
    }

    try {
      await updateUserData({
        sexualOrientation: selectedOptions,
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert(
        "Cosmic Interference",
        "The universe had trouble saving your orientation: " + error.message
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
          <OnboardingProgressBar currentScreen="SexualOrientationScreen" />

          {/* Title */}
          <Text style={styles.title}>Love is Love</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Share how your heart connects with others
          </Text>

          {/* Selection Info */}
          <Text style={styles.selectionInfo}>
            Select all orientations that resonate with your heart
          </Text>

          {/* Options Container */}
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedOptions.includes(option) && styles.selectedOption,
                ]}
                onPress={() => toggleOption(option)}
              >
                <Text style={[
                  styles.optionText,
                  selectedOptions.includes(option) && styles.selectedText,
                ]}>
                  {option}
                </Text>
                {selectedOptions.includes(option) && (
                  <View style={styles.checkmarkOverlay}>
                    <Ionicons name="checkmark" size={12} color={colors.background} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Hidden Field Toggle */}
          <View style={styles.hiddenContainer}>
            <Text style={styles.hiddenText}>Keep this private</Text>
            <Checkbox
              value={hiddenFields.sexualOrientation || false}
              onValueChange={() => toggleHidden("sexualOrientation")}
              style={styles.checkbox}
              color={hiddenFields.sexualOrientation ? colors.primary : undefined}
            />
          </View>

          {/* Affirmation */}
          <Text style={styles.affirmation}>
            Embrace love in all its beautiful, sacred forms
          </Text>
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            selectedOptions.length === 0 && styles.submitButtonDisabled
          ]} 
          onPress={handleSubmit}
          disabled={selectedOptions.length === 0}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={selectedOptions.length > 0 ? colors.background : colors.textMuted} 
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
      paddingBottom: 120, // Space for submit button
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
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    selectionInfo: {
      ...fonts.captionFont,
      color: colors.primary,
      textAlign: "center",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    optionButton: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      marginRight: Spacing.sm,
      marginBottom: Spacing.sm,
      borderWidth: 2,
      borderColor: colors.border,
      alignSelf: "flex-start",
      position: "relative", // For checkmark overlay
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
    selectedOption: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    optionText: {
      ...fonts.spiritualBodyFont,
      fontSize: Typography.sizes.sm,
      color: colors.textDark,
      textAlign: "center",
    },
    selectedText: {
      color: colors.background,
      fontWeight: Typography.weights.medium,
    },
    checkmarkOverlay: {
      position: "absolute",
      top: -4,
      right: -4,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      width: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    hiddenContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
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
      marginRight: Spacing.md,
    },
    checkbox: {
      width: 20,
      height: 20,
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

export default SexualOrientationScreen;