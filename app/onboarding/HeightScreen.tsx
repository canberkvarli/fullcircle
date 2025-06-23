import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import Checkbox from "expo-checkbox";
import { RulerPicker } from "react-native-ruler-picker";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

// Helper to format a height (in feet as a float) into a feet/inches string.
function formatHeight(height: number): string {
  const feet = Math.floor(height);
  const inches = Math.round((height - feet) * 12);
  return `${feet}'${inches}"`;
}

function HeightScreen() {
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

  // Initialize selectedHeight as a number (default to 6 if no value exists)
  const [selectedHeight, setSelectedHeight] = useState<number>(
    typeof userData?.height === "number" ? userData.height : 6
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    height: userData?.hiddenFields?.height || false,
  });

  // Clamp the height between 3 ft and 8 ft.
  useEffect(() => {
    if (selectedHeight < 3) {
      setSelectedHeight(3);
    } else if (selectedHeight > 8) {
      setSelectedHeight(8);
    }
  }, [selectedHeight]);

  const handleHeightSubmit = async () => {
    try {
      const userId = userData.userId;
      if (!userId || typeof userId !== "string") {
        Alert.alert("Sacred Dimensions", "Something mystical went wrong. Please try again.");
        return;
      }
      await updateUserData({
        hiddenFields: {
          ...userData.hiddenFields,
          height: hiddenFields.height,
        },
        height: selectedHeight,
      });
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Cosmic Interference", "The universe had trouble saving your height: " + error.message);
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

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
        <OnboardingProgressBar currentScreen="HeightScreen" />

        {/* Title */}
        <Text style={styles.title}>Stand tall</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>What's your sacred stature?</Text>

        {/* Height Input Container */}
        <View style={styles.heightInputs}>
          {/* Current Height Display */}
          <View style={styles.heightDisplay}>
            <Text style={styles.heightValue}>{formatHeight(selectedHeight)}</Text>
            <Text style={styles.heightLabel}>Your height</Text>
          </View>

          {/* Ruler Picker */}
          <View style={styles.rulerContainer}>
            <RulerPicker
              min={3}
              max={8}
              step={0.1}
              initialValue={selectedHeight}
              onValueChange={(number) => setSelectedHeight(Number(number))}
              unit="ft"
              width={320}
              height={280}
              indicatorHeight={80}
              indicatorColor={colors.primary}
              valueTextStyle={{
                fontSize: 0, // Hide the built-in text since we're showing it above
                color: 'transparent',
              }}
            />
          </View>
        </View>

        {/* Hidden Field Toggle */}
        <View style={styles.hiddenContainer}>
          <Text style={styles.hiddenText}>Keep this private</Text>
          <Checkbox
            value={hiddenFields["height"] || false}
            onValueChange={() => toggleHidden("height")}
            style={styles.checkbox}
            color={hiddenFields.height ? colors.primary : undefined}
          />
        </View>

        {/* Affirmation */}
        <Text style={styles.affirmation}>
          Every dimension of your being is perfectly designed by the universe
        </Text>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleHeightSubmit}
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
    heightInputs: {
      alignItems: 'center',
      marginBottom: Spacing['2xl'], // More space to prevent overlap
      paddingHorizontal: Spacing.lg,
    },
    heightDisplay: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      minWidth: 180,
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
    heightValue: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes['4xl'],
      color: colors.primary,
      fontWeight: Typography.weights.bold,
      marginBottom: Spacing.xs,
    },
    heightLabel: {
      ...fonts.spiritualBodyFont,
      color: colors.textLight,
      fontSize: Typography.sizes.base,
      fontStyle: "italic",
    },
    rulerContainer: {
      // Clean container with no borders or styling
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xl,
    },
    hiddenContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing['2xl'],
      marginHorizontal: Spacing.lg,
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
      position: 'absolute',
      bottom: Platform.select({ ios: 140, android: 120 }), // Moved higher to avoid overlap
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

export default HeightScreen;