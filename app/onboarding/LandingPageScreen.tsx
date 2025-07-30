import React from "react";
import { View, useColorScheme } from "react-native";
import createStyles from "@/styles/LandingPageStyles";
import { useRouter } from "expo-router";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

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

export default LandingPageScreen;