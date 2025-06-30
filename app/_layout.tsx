import * as React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/context/UserContext";
import { NativeBaseProvider } from "native-base";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Nunito (main UI font)
    'Nunito-Light': require('../assets/fonts/nunito/Nunito-Light.ttf'),
    'Nunito-Regular': require('../assets/fonts/nunito/Nunito-Regular.ttf'),
    'Nunito-Medium': require('../assets/fonts/nunito/Nunito-Medium.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/nunito/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../assets/fonts/nunito/Nunito-Bold.ttf'),
    
    // Quicksand (spiritual, light feel)
    'Quicksand-Light': require('../assets/fonts/quicksand/Quicksand-Light.ttf'),
    'Quicksand-Regular': require('../assets/fonts/quicksand/Quicksand-Regular.ttf'),
    'Quicksand-Medium': require('../assets/fonts/quicksand/Quicksand-Medium.ttf'),
    'Quicksand-SemiBold': require('../assets/fonts/quicksand/Quicksand-SemiBold.ttf'),
    'Quicksand-Bold': require('../assets/fonts/quicksand/Quicksand-Bold.ttf'),
    
    // Raleway (elegant, ethereal)
    'Raleway-Light': require('../assets/fonts/raleway/Raleway-Light.ttf'),
    'Raleway-Regular': require('../assets/fonts/raleway/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/raleway/Raleway-Medium.ttf'),
    'Raleway-SemiBold': require('../assets/fonts/raleway/Raleway-SemiBold.ttf'),
    'Raleway-Bold': require('../assets/fonts/raleway/Raleway-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider>
        <UserProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="user" />
          </Stack>
        </UserProvider>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}