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
      <Stack.Screen name="WelcomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="NameScreen" options={{ headerShown: false }} />
      <Stack.Screen name="EmailScreen" options={{ headerShown: false }} />
      <Stack.Screen name="BirthdateScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="AddBasicInfoScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="LocationScreen" options={{ headerShown: false }} />
      <Stack.Screen name="GenderScreen" options={{ headerShown: false }} />
      <Stack.Screen name="OrientationScreen" options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
    </Stack>
  );
}
