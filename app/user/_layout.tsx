import React from "react";
import { Stack } from "expo-router";

const UserLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="EditUserProfile" options={{ headerShown: false }} />
      <Stack.Screen name="UserSettings" options={{ headerShown: false }} />
      <Stack.Screen name="EditFieldScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]/chat/[chatId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
};

export default UserLayout;
