import '@/services/FirebaseConfig';
import React from "react";
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
  return <LandingPageScreen />;
}
