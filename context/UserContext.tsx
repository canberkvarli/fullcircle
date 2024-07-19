import React, { createContext, useContext, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { FIRESTORE } from "@/services/FirebaseConfig";
import { useRouter } from "expo-router";

type UserData = {
  userId: string;
  phoneNumber: string;
  email?: string;
  MFAEnabled?: boolean;
  marketingRequested?: boolean;
  firstName?: string;
  lastName?: string;
  birthdate?: string;
  height?: string;
  location?: string;
  jobTitle?: string;
  // Add other optional fields as needed
};

type UserContextType = {
  currentScreen: string;
  setCurrentScreen: React.Dispatch<React.SetStateAction<string>>;
  screens: string[];
  setScreens: React.Dispatch<React.SetStateAction<string[]>>;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  updateUserData: (data: Partial<UserData>) => void;
  navigateToNextScreen: () => void;
  navigateToPreviousScreen: () => void;
  saveProgress: () => void;
};

const initialUserData: UserData = {
  userId: "",
  phoneNumber: "",
  email: "",
  MFAEnabled: false,
  marketingRequested: false,
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

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentScreen, setCurrentScreen] = useState<string>(initialScreens[0]);
  const [screens, setScreens] = useState<string[]>(initialScreens);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const router = useRouter();

  // Save progress in Firestore
  const saveProgress = async () => {
    try {
      if (userData.userId) {
        const docRef = doc(FIRESTORE, "users", userData.userId);
        await setDoc(docRef, { currentScreen }, { merge: true });
      }
    } catch (error) {
      console.error("Failed to save progress: ", error);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    setUserData((prevData) => ({ ...prevData, ...data }));
    try {
      if (userData.userId) {
        const docRef = doc(FIRESTORE, "users", userData.userId);
        await setDoc(docRef, data, { merge: true });
      }
    } catch (error) {
      console.error("Failed to update user data: ", error);
    }
    saveProgress();
  };

  const navigateToNextScreen = () => {
    const currentIndex = screens.indexOf(currentScreen);
    if (currentIndex !== -1 && currentIndex < screens.length - 1) {
      const nextScreen = screens[currentIndex + 1];
      setCurrentScreen(nextScreen);
      saveProgress();
      router.replace(`onboarding/${nextScreen}`);
    }
  };

  const navigateToPreviousScreen = () => {
    const currentIndex = screens.indexOf(currentScreen);
    if (currentIndex > 0) {
      const previousScreen = screens[currentIndex - 1];
      setCurrentScreen(previousScreen);
      saveProgress();
      router.replace(`onboarding/${previousScreen}`);
    }
  };

  const contextValue: UserContextType = {
    currentScreen,
    setCurrentScreen,
    screens,
    setScreens,
    userData,
    setUserData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
    saveProgress,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
