import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import onboardingProgressBarIcons from "../assets/icons/onboardingProgressBarIcons.json";

function OnboardingProgressBar({ currentScreen }: { currentScreen: string }) {
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
      {onboardingScreens.map((screen, index) => (
        <View key={screen} style={styles.stepContainer}>
          {index === currentIndex ? (
            <Icon
              name={
                onboardingProgressBarIcons[
                  screen as keyof typeof onboardingProgressBarIcons
                ]
              }
              size={24}
              color="blue" // Icon color for the current screen
            />
          ) : (
            <View style={styles.dot} />
          )}
        </View>
      ))}
    </View>
  );
}

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
    backgroundColor: "gray", // Dot color
  },
  completedLine: {
    backgroundColor: "blue",
  },
});

export default OnboardingProgressBar;
