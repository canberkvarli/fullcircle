import '@/services/FirebaseConfig';
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useUserContext } from "@/context/UserContext";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import LandingPageScreen from "./onboarding/LandingPageScreen";

// Add this to your App.tsx or index.js file:
import { LogBox } from "react-native";

// Suppress React Native Firebase deprecation warnings
LogBox.ignoreLogs([
  "This method is deprecated (as well as all React Native Firebase namespaced API)",
]);

// Or if you want to be more specific:
LogBox.ignoreLogs([
  /This method is deprecated.*React Native Firebase.*collection/,
  /This method is deprecated.*React Native Firebase.*doc/,
  /This method is deprecated.*React Native Firebase.*FieldValue/,
]);

// This will hide the warnings in development but won't affect production

export default function Index() {
  const { userData, currentUser, initializing } = useUserContext();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Wait for the UserContext to finish initializing
    if (!initializing) {
      // Add a small delay to ensure auth state is fully processed
      const timer = setTimeout(() => {
        setIsCheckingAuth(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initializing]);

  // Show loading spinner while checking auth state
  if (initializing || isCheckingAuth) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: colors.background 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If user is authenticated, don't show anything - let UserContext handle navigation
  if (currentUser) {
    return null;
  }

  // If no user is authenticated, show landing page
  return <LandingPageScreen />;
}
