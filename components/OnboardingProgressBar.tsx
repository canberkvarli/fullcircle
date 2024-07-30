import React from "react";
import { View, StyleSheet } from "react-native";
import * as FontAwesome from "react-native-vector-icons/FontAwesome";
import * as MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import onboardingProgressBarIcons from "../assets/icons/onboardingProgressBarIcons.json";

const iconLibraries = {
  FontAwesome,
  MaterialCommunityIcons,
};

interface IconConfig {
  type: keyof typeof iconLibraries;
  name: string;
}

const OnboardingProgressBar = ({
  currentScreen,
}: {
  currentScreen: string;
}) => {
  const onboardingScreens = [
    "NameScreen",
    "EmailScreen",
    "BirthdateScreen",
    "LocationScreen",
    "GenderScreen",
    "SexualOrientationScreen",
    "DatePreferenceScreen",
    "HeightScreen",
    "EthnicityScreen",
    "FamilyVisionScreen",
    "JobLocationScreen",
    "JobTitleScreen",
    "EducationScreen",
    "SpiritualScreen",
    "PhotosScreen",
  ];

  const currentIndex = onboardingScreens.indexOf(currentScreen);

  return (
    <View style={styles.container}>
      {onboardingScreens.map((screen, index) => {
        const iconConfig = onboardingProgressBarIcons[
          screen as keyof typeof onboardingProgressBarIcons
        ] as unknown as IconConfig;

        if (!iconConfig) return <View key={screen} style={styles.dot} />;

        const { type, name } = iconConfig;
        const IconComponent = iconLibraries[type]?.default;

        return (
          <View key={screen} style={styles.stepContainer}>
            {index === currentIndex ? (
              <IconComponent name={name} size={24} color="blue" />
            ) : (
              <View style={styles.dot} />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    top: 65,
    justifyContent: "space-between",
  },
  stepContainer: {
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "gray",
  },
});

export default OnboardingProgressBar;
