import React from "react";
import { View, StyleSheet, useColorScheme, Platform } from "react-native";
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { CustomIcon } from "@/components/CustomIcon"; // Import your CustomIcon component
import { Colors, Spacing } from "@/constants/Colors";

const iconLibraries = {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5
};

interface VectorIconConfig {
  type: keyof typeof iconLibraries;
  name: string;
  iconType: 'vector';
}

interface CustomIconConfig {
  name: string; // Use name instead of source for CustomIcon
  iconType: 'custom';
}

type IconConfig = VectorIconConfig | CustomIconConfig;

// Mixed icons - vector icons and custom icons using CustomIcon component
const spiritualProgressBarIcons: Record<string, IconConfig> = {
  "NameScreen": { 
    type: "MaterialCommunityIcons", 
    name: "account-heart",
    iconType: 'vector'
  },
  "FamilyNameScreen": { 
    type: "MaterialCommunityIcons", 
    name: "account-group",
    iconType: 'vector'
  },
  "EmailScreen": { 
    type: "MaterialCommunityIcons", 
    name: "email",
    iconType: 'vector'
  },
  "BirthdateScreen": { 
    type: "MaterialCommunityIcons", 
    name: "cake",
    iconType: 'vector'
  },
  "HeightScreen": { 
    type: "FontAwesome", 
    name: "tree",
    iconType: 'vector'
  },
  "LocationScreen": { 
    name: "temple", // Matches your CustomIcon iconMap
    iconType: 'custom'
  },
  "GenderScreen": { 
    type: "MaterialCommunityIcons", 
    name: "human-male-female",
    iconType: 'vector'
  },
  "ConnectionPreferenceScreen": { 
    type: "FontAwesome5", 
    name: "hand-holding-heart",
    iconType: 'vector'
  },
  "SpiritualDrawsScreen": { 
    name: "ohm", // Matches your CustomIcon iconMap
    iconType: 'custom'
  },
  "SpiritualPracticesScreen": { 
    name: "meditation", // Matches your CustomIcon iconMap
    iconType: 'custom'
  },
  "HealingModalitiesScreen": { 
    name: "yinyang", // Matches your CustomIcon iconMap
    iconType: 'custom'
  },
  "PhotosScreen": { 
    type: "MaterialCommunityIcons", 
    name: "camera-iris",
    iconType: 'vector'
  }
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
    "FamilyNameScreen",
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

  const renderIcon = (iconConfig: IconConfig, isActive: boolean, isCompleted: boolean) => {
    const iconSize = isActive ? 26 : 20; // Bigger icons to match larger containers: 22→26, 18→20
    const iconColor = isActive ? colors.primary : colors.text;

    if (iconConfig.iconType === 'custom') {
      // Use CustomIcon component
      return (
        <CustomIcon 
          name={iconConfig.name}
          size={iconSize}
          color={iconColor}
        />
      );
    } else {
      // Vector icon
      const { type, name } = iconConfig;
      const IconComponent = iconLibraries[type];
      
      return (
        <IconComponent 
          name={name as any} 
          size={iconSize} 
          color={iconColor} 
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {onboardingScreens.map((screen, index) => {
        const iconConfig = spiritualProgressBarIcons[screen];

        if (!iconConfig) return <View key={screen} style={styles.dot} />;

        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <View key={screen} style={styles.stepContainer}>
            {isActive ? (
              <View style={styles.activeIconContainer}>
                {renderIcon(iconConfig, true, false)}
              </View>
            ) : isCompleted ? (
              <View style={styles.completedIconContainer}>
                <MaterialCommunityIcons 
                  name="check" 
                  size={12} // Back to original size
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
      minWidth: 16, // Slightly bigger: 14→16
    },
    activeIconContainer: {
      width: 50, // Your bigger container size
      height: 50,
      borderRadius: 25,
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
      width: 18, // Back to original size
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    dot: {
      width: 8, // Back to original size
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
  });
};

export default OnboardingProgressBar;