import React from "react";
import { Stack } from "expo-router";

export default function OnboardingStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="LoginSignupScreen" options={{ headerShown: false }} />
      <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="PhoneNumberScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="PhoneVerificationScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="EmailScreen" options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
