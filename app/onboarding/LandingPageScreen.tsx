import React from "react";
import LottieView from "lottie-react-native";
import { View, useColorScheme } from "react-native";
import createStyles from "@/styles/LandingPageStyles";
import { useRouter } from "expo-router";

function LandingPageScreen(): JSX.Element {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  const handleAnimationFinish = () => {
    router.replace("onboarding/LoginSignupScreen" as any);
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/animations/loading_mandala.json")}
        style={styles.animation}
        autoPlay
        loop={false}
        onAnimationFinish={handleAnimationFinish}
      />
    </View>
  );
}

export default LandingPageScreen;