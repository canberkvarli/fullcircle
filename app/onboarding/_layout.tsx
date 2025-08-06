// Enhanced onboarding layout with proper navigation animations

import React from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function OnboardingStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Configure animations for better UX
        animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade_from_bottom',
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        // Customize transition timing
        animationDuration: 300,
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen 
        name="LoginSignupScreen" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="PhoneNumberScreen" 
        options={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen
        name="PhoneVerificationScreen"
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="NameScreen" options={{ headerShown: false }} />
      <Stack.Screen name="FamilyNameScreen" options={{ headerShown: false }} />
      <Stack.Screen name="EmailScreen" options={{ headerShown: false }} />
      <Stack.Screen name="BirthdateScreen" options={{ headerShown: false }} />
      <Stack.Screen name="HeightScreen" options={{ headerShown: false }} />
      <Stack.Screen name="LocationScreen" options={{ headerShown: false }} />
      <Stack.Screen name="GenderScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="ConnectionPreferenceScreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="SpiritualDrawsScreen" options={{ headerShown: false }} />
      <Stack.Screen name="SpiritualPracticesScreen" options={{ headerShown: false }} />
      <Stack.Screen name="HealingModalitiesScreen" options={{ headerShown: false }} />
      <Stack.Screen 
        name="PhotosScreen" 
        options={{ 
          headerShown: false,
          gestureEnabled: true,
        }} 
      />
    </Stack>
  );
}