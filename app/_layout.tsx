// app/_layout.tsx - Get Stripe key from Constants
import * as React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/context/UserContext";
import { NativeBaseProvider } from "native-base";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Nunito-Light': require('../assets/fonts/nunito/Nunito-Light.ttf'),
    'Nunito-Regular': require('../assets/fonts/nunito/Nunito-Regular.ttf'),
    'Nunito-Medium': require('../assets/fonts/nunito/Nunito-Medium.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/nunito/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../assets/fonts/nunito/Nunito-Bold.ttf'),
    "Nunito-Italic": require('../assets/fonts/nunito/Nunito-Italic.ttf'),
    'Quicksand-Light': require('../assets/fonts/quicksand/Quicksand-Light.ttf'),
    'Quicksand-Regular': require('../assets/fonts/quicksand/Quicksand-Regular.ttf'),
    'Quicksand-Medium': require('../assets/fonts/quicksand/Quicksand-Medium.ttf'),
    'Quicksand-SemiBold': require('../assets/fonts/quicksand/Quicksand-SemiBold.ttf'),
    'Quicksand-Bold': require('../assets/fonts/quicksand/Quicksand-Bold.ttf'),
    'Raleway-Light': require('../assets/fonts/raleway/Raleway-Light.ttf'),
    'Raleway-Regular': require('../assets/fonts/raleway/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/raleway/Raleway-Medium.ttf'),
    'Raleway-SemiBold': require('../assets/fonts/raleway/Raleway-SemiBold.ttf'),
    'Raleway-Bold': require('../assets/fonts/raleway/Raleway-Bold.ttf'),
    'Raleway-Italic': require('../assets/fonts/raleway/Raleway-Italic.ttf'),
    'Spirituality': require('../assets/fonts/custom/Spirituality.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // 🔑 Get the publishable key from multiple sources
  const getPublishableKey = () => {
    // Method 1: Environment variable
    const envKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    // Method 2: From app.json extra section
    const extraKey = Constants.expoConfig?.extra?.stripePublishableKey;
    
    // Method 3: From the Stripe plugin configuration in app.json
    const plugins = Constants.expoConfig?.plugins || [];
    let pluginKey = null;
    
    // Find the Stripe plugin and extract the publishableKey
    for (const plugin of plugins) {
      if (Array.isArray(plugin) && plugin[0] === '@stripe/stripe-react-native') {
        pluginKey = plugin[1]?.publishableKey;
        break;
      }
    }
    
    const publishableKey = envKey || extraKey || pluginKey;
    
    console.log('🔑 Environment key:', !!envKey ? 'Found' : 'Not found');
    console.log('🔑 Extra key:', !!extraKey ? 'Found' : 'Not found');
    console.log('🔑 Plugin key:', !!pluginKey ? 'Found' : 'Not found');
    console.log('🔑 Final key exists:', !!publishableKey);
    console.log('🔑 Key preview:', publishableKey?.substring(0, 20) + '...');
    
    return publishableKey;
  };

  const publishableKey = getPublishableKey();

  if (!fontsLoaded) {
    return null;
  }

  if (!publishableKey) {
    console.error('❌ No Stripe publishable key found');
    return null;
  }

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.fullcircle.app"
      urlScheme="fullcircle"
    >
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
    </StripeProvider>
  );
}