import React from "react";
import { Stack } from "expo-router";
import { UserProvider } from "@/context/UserContext";
import { NativeBaseProvider } from "native-base";

export default function RootLayout() {
  return (
    <NativeBaseProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="main" />
        </Stack>
      </UserProvider>
    </NativeBaseProvider>
  );
}
