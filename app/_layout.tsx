import React from "react";
import { Stack } from "expo-router";
import { UserProvider } from "@/context/UserContext";
import { NativeBaseProvider, Text, Box } from "native-base";

export default function RootLayout() {
  return (
    <NativeBaseProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
        </Stack>
      </UserProvider>
    </NativeBaseProvider>
  );
}
