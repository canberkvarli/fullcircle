import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FIRESTORE } from "@/services/FirebaseConfig";
import { useRouter } from "expo-router";

type UserData = {
  userId: string;
  currentOnboardingScreen: string;
  phoneNumber: string;
  verificationId?: string | null;
  countryCode: string;
  areaCode: string;
  number: string;
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
  currentOnboardingScreen: string;
  setcurrentOnboardingScreen: React.Dispatch<React.SetStateAction<string>>;
  screens: string[];
  setScreens: React.Dispatch<React.SetStateAction<string[]>>;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  updateUserData: (data: Partial<UserData>) => void;
  navigateToNextScreen: () => void;
  navigateToPreviousScreen: () => void;
  navigateToScreen: (screen: string) => void;
  saveProgress: (screen?: string) => void;
};

// Define the list of onboarding screens
const initialScreens = [
  "LandingPageScreen",
  "LoginSignupScreen",
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

const initialUserData: UserData = {
  userId: "",
  phoneNumber: "",
  verificationId: "",
  email: "",
  firstName: "",
  lastName: "",
  MFAEnabled: false,
  marketingRequested: false,
  countryCode: "",
  areaCode: "",
  number: "",
  currentOnboardingScreen: initialScreens[0],
};

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
  const [currentOnboardingScreen, setcurrentOnboardingScreen] =
    useState<string>(initialScreens[0]);
  const [screens, setScreens] = useState<string[]>(initialScreens);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = ""; // Retrieve the userId from your auth logic
        if (userId) {
          const docRef = doc(FIRESTORE, "users", userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data as UserData);
            if (data.currentOnboardingScreen) {
              setcurrentOnboardingScreen(data.currentOnboardingScreen);
              router.replace(`onboarding/${data.currentOnboardingScreen}`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data: ", error);
      }
    };

    fetchUserData();
  }, []);

  const saveProgress = async (screen?: string) => {
    console.log("Saving progress...");
    try {
      const screenToSave = screen || userData.currentOnboardingScreen;
      console.log("Saving progress for screen: ", screenToSave);

      if (userData.userId) {
        const docRef = doc(FIRESTORE, "users", userData.userId);
        await setDoc(
          docRef,
          { currentOnboardingScreen: screenToSave },
          { merge: true }
        );
        console.log("Progress saved successfully");
      } else {
        console.log("User ID is not set");
      }
    } catch (error) {
      console.error("Failed to save progress: ", error);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    console.log("Updating user data: ", data);
    setUserData((prevData) => ({ ...prevData, ...data }));

    // Only try to update Firestore if userId is available
    if (data.userId || userData.userId) {
      try {
        const docRef = doc(FIRESTORE, "users", data.userId || userData.userId);
        await setDoc(docRef, data, { merge: true });
        console.log("User data updated successfully");
      } catch (error) {
        console.error("Failed to update user data: ", error);
      }
    } else {
      console.log("User ID is not set, skipping Firestore update");
    }
  };

  const navigateToNextScreen = () => {
    const { currentOnboardingScreen } = userData;
    const currentIndex = screens.indexOf(currentOnboardingScreen);
    if (currentIndex !== -1 && currentIndex < screens.length - 1) {
      const nextScreen = screens[currentIndex + 1];
      setcurrentOnboardingScreen(nextScreen);
      if (userData.userId) {
        saveProgress(nextScreen);
      }
      router.replace(`onboarding/${nextScreen}`);
    }
  };

  const navigateToPreviousScreen = () => {
    const currentIndex = screens.indexOf(currentOnboardingScreen);
    if (currentIndex > 0) {
      const previousScreen = screens[currentIndex - 1];
      setcurrentOnboardingScreen(previousScreen);
      if (userData.userId) {
        saveProgress(previousScreen);
      }
      router.replace(`onboarding/${previousScreen}`);
    }
  };

  const navigateToScreen = (screen: string) => {
    setcurrentOnboardingScreen(screen);
    if (userData.userId) {
      saveProgress(screen);
    }
    router.replace(`onboarding/${screen}`);
  };

  const contextValue: UserContextType = {
    currentOnboardingScreen,
    setcurrentOnboardingScreen,
    screens,
    setScreens,
    userData,
    setUserData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
    navigateToScreen,
    saveProgress,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
