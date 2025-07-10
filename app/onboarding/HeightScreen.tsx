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
  Dimensions,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "@/context/UserContext";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { RulerPicker } from "react-native-ruler-picker";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

  const [selectedHeight, setSelectedHeight] = useState<number>(
    typeof userData?.height === "number" ? userData.height : 6
  );
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>({
    height: userData?.hiddenFields?.height || false,
  });

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
        Alert.alert("Connection Issue", "Something went wrong. Please try again.");
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
      Alert.alert("Connection Issue", "We had trouble saving your height: " + error.message);
    }
  };

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const RoundedCheckbox = ({ value, onValueChange }: { value: boolean; onValueChange: () => void }) => (
    <TouchableOpacity
      style={[styles.customCheckbox, value && styles.customCheckboxChecked]}
      onPress={onValueChange}
      activeOpacity={0.7}
    >
      {value && (
        <Ionicons 
          name="checkmark" 
          size={16} 
          color={colors.background} 
        />
      )}
    </TouchableOpacity>
  );

  // Calculate compact ruler dimensions
  const rulerWidth = Math.min(screenWidth - 60, 280); // Smaller, more reasonable size
  const rulerHeight = 180; // Much smaller height

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <OnboardingProgressBar currentScreen="HeightScreen" />

        <View style={styles.content}>
          <Text style={styles.title}>Stand tall</Text>
          <Text style={styles.subtitle}>Help us show you compatible matches</Text>

          <View style={styles.heightDisplay}>
            <Text style={styles.heightValue}>{formatHeight(selectedHeight)}</Text>
            <Text style={styles.heightLabel}>Your height</Text>
          </View>

          <View style={styles.rulerContainer}>
            <RulerPicker
              min={3}
              max={8}
              step={0.1}
              initialValue={selectedHeight}
              onValueChange={(number) => setSelectedHeight(Number(number))}
              unit="ft"
              width={rulerWidth}
              height={rulerHeight}
              indicatorHeight={60} // Smaller indicator
              indicatorColor={colors.primary}
              valueTextStyle={{
                fontSize: 0,
                color: 'transparent',
              }}
            />
          </View>

          <View style={styles.privacyContainer}>
            <Text style={styles.privacyText}>Keep this private</Text>
            <RoundedCheckbox
              value={hiddenFields["height"] || false}
              onValueChange={() => toggleHidden("height")}
            />
          </View>

          <Text style={styles.affirmation}>
            Every{' '}
            <Text style={styles.highlightedWord}>person</Text>
            {' brings their own unique presence to the world'}
          </Text>
        </View>

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
  const { height } = Dimensions.get('window');

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 100, // Space for submit button
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
      alignSelf: 'flex-start',
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight,
      textAlign: "left",
      alignSelf: 'flex-start',
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      fontStyle: "normal",
    },
    heightDisplay: {
      backgroundColor: colors.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      minWidth: 160,
      marginBottom: Spacing.lg,
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
      fontStyle: "normal",
    },
    rulerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    privacyContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      padding: Spacing.md,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.md,
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
    privacyText: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.base,
      fontStyle: "normal",
      marginRight: Spacing.md,
    },
    customCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    customCheckboxChecked: {
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
          elevation: 2,
        },
      }),
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "center",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      opacity: 0.8,
      paddingHorizontal: Spacing.lg,
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
  });
};

export default HeightScreen;