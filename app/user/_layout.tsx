import React from "react";
import { Stack } from "expo-router";

const UserLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="EditUserProfile" options={{ headerShown: false }} />
      <Stack.Screen name="UserSettings" options={{ headerShown: false }} />
      <Stack.Screen name="PushNotifications" options={{ headerShown: false }} />
      <Stack.Screen name="NotificationTester" options={{ headerShown: false }} />
      <Stack.Screen name="SelfieVerificationScreen" options={{ headerShown: false }} />
      <Stack.Screen name="EditFieldScreen" options={{ headerShown: false }} />
      <Stack.Screen name="ConnectingPreferences" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit/EditPreferenceField"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="[id]/chats/[chatId]"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FullCircleSubscription"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsOfService"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DevTools"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default UserLayout;
