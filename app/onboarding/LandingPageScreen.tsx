import React from "react";
import { View, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";
import { StyleSheet } from "react-native";
import { Colors } from '@/constants/Colors';

function LandingPageScreen(): JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  const handleAnimationFinish = () => {
    router.replace("onboarding/LoginSignupScreen" as any);
  };

  return (
    <View style={styles.container}>
      <OuroborosLoader
        size={200}
        duration={3000}
        onComplete={handleAnimationFinish}
        fillColor="#F5E6D3"
        strokeColor="#B8860B"
        // strokeColor="#7B6B5C"
        strokeWidth={1.5}
      />
    </View>
  );
}

const createStyles = (colorScheme: 'light' | 'dark') => {
  const colors = Colors[colorScheme];
  
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    animation: {
      width: "80%",
      height: "80%",
      opacity: 0.9,
    },
  });
};

export default LandingPageScreen;