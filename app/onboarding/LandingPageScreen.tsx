// LandingPageScreen.tsx
import React, { useEffect } from "react";
import LottieView from "lottie-react-native";
import { StyleSheet, View } from "react-native";
import { useUserContext } from "@/context/UserContext";

function LandingPageScreen(): JSX.Element {
  const { navigateToNextScreen } = useUserContext();

  const handleAnimationFinish = () => {
    navigateToNextScreen();
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
