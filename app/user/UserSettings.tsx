import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserContext } from "@/context/UserContext";
import { Button } from "native-base";

export default function UserSettings() {
  const { signOut, navigateToScreen } = useUserContext();

  const handleSignOut = () => {
    signOut();
    navigateToScreen("/LandingPage" as any);
  };
  return (
    <SafeAreaView>
      <Text>UserSettings</Text>
      <Button onPress={handleSignOut}>Sign out</Button>
    </SafeAreaView>
  );
}
