import { useRouter } from "expo-router";
import React, { createContext, useContext, useState } from "react";

// Define the UserData type with all necessary fields
type UserData = {
  userId: string;
  phoneNumber: string;
  email: string;
  MFAEnabled: boolean;
  firstName?: string;
  lastName?: string;
  birthdate?: string;
  height?: string;
  location?: string;
  jobTitle?: string;
  // Add other optional fields as needed
};

// Define the context type
type UserContextType = {
  currentScreen: string;
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
  screens: string[];
  setScreens: React.Dispatch<React.SetStateAction<string[]>>;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  navigateToNextScreen: () => void;
  navigateToPreviousScreen: () => void;
};

// Initial values for user data and screens
const initialUserData: UserData = {
  userId: "",
  phoneNumber: "",
  email: "",
  MFAEnabled: false,
};

// Define the list of onboarding screens
const initialScreens = [
  "LandingPageScreen",
  "PhoneNumberScreen",
  "PhoneVerificationScreen",
  "WelcomeScreen",
  "NameScreen",
  "EmailScreen",
  "BirthdateScreen",
  "AddBasicInfoScreen",
  "LocationScreen",
  "GenderScreen",
  "SexualOrientationScreen",
  "DatePreferenceScreen",
  "HeightScreen",
  "EthnicityScreen",
  "FamilyVisionScreen",
  "JobLocationScreen",
  "JobTitleScreen",
  "EducationScreen",
  "SpiritualScreen",
  "PhotosScreen",
  // Add other screen identifiers in order
];

// Initial context with default values
const initialContext: UserContextType = {
  currentScreen: "",
  setCurrentScreen: () => {},
  screens: initialScreens,
  setScreens: () => {},
  userData: initialUserData,
  setUserData: () => {},
  navigateToNextScreen: () => {},
  navigateToPreviousScreen: () => {},
};

// Create the context
const UserContext = createContext<UserContextType>(initialContext);

// Custom hook to use the context
export const useUserContext = () => useContext(UserContext);

// Provider component to wrap the app
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentScreen, setCurrentScreen] = useState<string>(initialScreens[0]);
  const [screens, setScreens] = useState<string[]>(initialScreens);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const router = useRouter();

  // Navigate to the next screen
  const navigateToNextScreen = () => {
    const currentIndex = screens.indexOf(currentScreen);
    if (currentIndex !== -1 && currentIndex < screens.length - 1) {
      const nextScreen = screens[currentIndex + 1];
      setCurrentScreen(nextScreen);
      router.replace(`onboarding/${nextScreen}`);
    }
  };

  // Navigate to the previous screen
  const navigateToPreviousScreen = () => {
    const currentIndex = screens.indexOf(currentScreen);
    if (currentIndex > 0) {
      const previousScreen = screens[currentIndex - 1];
      setCurrentScreen(previousScreen);
      router.replace(`onboarding/${previousScreen}`);
    }
  };

  // Context value
  const contextValue: UserContextType = {
    currentScreen,
    setCurrentScreen,
    screens,
    setScreens,
    userData,
    setUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
