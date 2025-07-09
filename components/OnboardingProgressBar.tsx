import React from "react";
import { View, StyleSheet, useColorScheme, Platform } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing } from "@/constants/Colors";

const iconLibraries = {
  FontAwesome,
  MaterialCommunityIcons,
};

interface IconConfig {
  type: keyof typeof iconLibraries;
  name: string;
}

// Spiritual icons - you can replace these with custom Flaticon SVGs
const spiritualProgressBarIcons = {
  "NameScreen": { "type": "MaterialCommunityIcons", "name": "account-heart" },
  "EmailScreen": { "type": "MaterialCommunityIcons", "name": "email" },
  "BirthdateScreen": { "type": "MaterialCommunityIcons", "name": "calendar-star" },
  "HeightScreen": { "type": "MaterialCommunityIcons", "name": "human-handsup" },
  "LocationScreen": { "type": "MaterialCommunityIcons", "name": "map-marker-radius" },
  "GenderScreen": { "type": "MaterialCommunityIcons", "name": "human-male-female" },
  "ConnectionPreferenceScreen": { "type": "MaterialCommunityIcons", "name": "heart-circle" },
  "SpiritualDrawsScreen": { "type": "MaterialCommunityIcons", "name": "human" },
  "SpiritualPracticesScreen": { "type": "MaterialCommunityIcons", "name": "human" },
  "HealingModalitiesScreen": { "type": "MaterialCommunityIcons", "name": "human" },
  "PhotosScreen": { "type": "MaterialCommunityIcons", "name": "camera-iris" }
};

const OnboardingProgressBar = ({
  currentScreen,
}: {
  currentScreen: string;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colorScheme);
  
  const onboardingScreens = [
    "NameScreen",
    "EmailScreen",
    "BirthdateScreen",
    "HeightScreen",
    "LocationScreen",
    "GenderScreen",
    "ConnectionPreferenceScreen",
    "SpiritualDrawsScreen",
    "SpiritualPracticesScreen",
    "HealingModalitiesScreen",
    "PhotosScreen",
  ];

  const currentIndex = onboardingScreens.indexOf(currentScreen);

  return (
    <View style={styles.container}>
      {onboardingScreens.map((screen, index) => {
        const iconConfig = spiritualProgressBarIcons[
          screen as keyof typeof spiritualProgressBarIcons
        ] as IconConfig;

        if (!iconConfig) return <View key={screen} style={styles.dot} />;

        const { type, name } = iconConfig;
        const IconComponent = iconLibraries[type];
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <View key={screen} style={styles.stepContainer}>
            {isActive ? (
              <View style={styles.activeIconContainer}>
                <IconComponent 
                  name={name as any} 
                    size={16} 
                  color={colors.primary} 
                />
              </View>
            ) : isCompleted ? (
              <View style={styles.completedIconContainer}>
                <MaterialCommunityIcons 
                  name="check" 
                  size={10} 
                  color={colors.background} 
                />
              </View>
            ) : (
              <View style={styles.dot} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.xl,
      marginBottom: Spacing.sm,
      justifyContent: "space-between",
      paddingVertical: Spacing.xs,
    },
    stepContainer: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 12, // Smaller for more compact layout
    },
    activeIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.tertiary,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    completedIconContainer: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
  });
};

export default OnboardingProgressBar;