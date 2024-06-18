// screens/onboarding/LoginSignupScreen.tsx
import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import WelcomeTitle from "../../components/WelcomeTitle";
import { useRouter } from "expo-router";
import SSOButtons from "../../components/SSOButtons";

function LoginSignupScreen(): JSX.Element {
  const [showSSOButtons, setShowSSOButtons] = useState(false);
  const router = useRouter();

  const handleSignIn = () => {
    setShowSSOButtons(true);
  };

  const handleGoBack = () => {
    setShowSSOButtons(false);
  };

  return (
    <View style={styles.container}>
      <WelcomeTitle />
      {showSSOButtons ? (
        <SSOButtons />
      ) : (
        <View>
          <Button
            title="Create account"
            onPress={() => router.replace("onboarding/PhoneNumberScreen")}
          />
          <Button title="Sign In" onPress={handleSignIn} />
        </View>
      )}
      {showSSOButtons && <Button title="Back" onPress={handleGoBack} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default LoginSignupScreen;
