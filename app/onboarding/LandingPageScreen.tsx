// app/LandingPageScreen.tsx
import React from "react";
import LottieView from "lottie-react-native";
import { StyleSheet, View } from "react-native";
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
        source={require("../../assets/animations/circle.json")}
        style={styles.animation}
        autoPlay
        loop={false}
        onAnimationFinish={handleAnimationFinish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: "100%",
    height: "100%",
  },
});

export default LandingPageScreen;
