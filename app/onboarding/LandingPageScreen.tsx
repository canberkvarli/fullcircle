import React from "react";
import LottieView from "lottie-react-native";
import { View } from "react-native";
import styles from "@/styles/LandingPageStyles";
import { useRouter } from "expo-router";

function LandingPageScreen(): JSX.Element {
  const router = useRouter();

  // TODO-TESTING: Revert back to LoginSignupScreen.
  const handleAnimationFinish = () => {
    router.replace("onboarding/LoginSignupScreen" as any);
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../../assets/animations/black-circle.json")}
        style={styles.animation}
        autoPlay
        loop={false}
        onAnimationFinish={handleAnimationFinish}
      />
    </View>
  );
}

export default LandingPageScreen;
