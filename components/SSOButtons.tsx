// components/SSOButtons.tsx
import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

function SSOButtons(): JSX.Element {
  const router = useRouter();

  const handleSignInWithApple = () => {
    // Placeholder for Apple sign-in functionality
    console.log("Sign in with Apple");
  };

  const handleSignInWithGoogle = () => {
    // Placeholder for Google sign-in functionality
    console.log("Sign in with Google");
  };

  const handleSignInWithPhoneNumber = () => {
    router.replace("onboarding/PhoneNumberScreen");
  };

  return (
    <View style={styles.container}>
      <Button title="Sign in with Apple" onPress={handleSignInWithApple} />
      <Button title="Sign in with Google" onPress={handleSignInWithGoogle} />
      <Button
        title="Sign in with Phone Number"
        onPress={handleSignInWithPhoneNumber}
      />
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

export default SSOButtons;
