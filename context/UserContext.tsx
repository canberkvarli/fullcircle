import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FIRESTORE } from "@/services/FirebaseConfig";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";

type UserData = {
  userId: string;
  currentOnboardingScreen: string;
  phoneNumber: string;
  verificationId?: string | null;
  countryCode: string;
  areaCode: string;
  number: string;
  email?: string;
  GoogleSSOEnabled?: boolean;
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
  fetchUserData: (userId: string) => Promise<void>;
};

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
];

const initialUserData: UserData = {
  userId: "",
  phoneNumber: "",
  verificationId: "",
  email: "",
  firstName: "",
  lastName: "",
  GoogleSSOEnabled: false,
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
  const [initializing, setInitializing] = useState(true);
  const [currentOnboardingScreen, setcurrentOnboardingScreen] =
    useState<string>(initialScreens[0]);
  const [screens, setScreens] = useState<string[]>(initialScreens);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const router = useRouter();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log("user from listener", user);
        console.log("userID from listener!", user.uid);
        await fetchUserData(user.uid);
        await updateUserData({ userId: user.uid });
      } else {
        setUserData(initialUserData);
      }

      if (initializing) setInitializing(false);
    });

    return () => subscriber(); // Unsubscribe on unmount
  }, [initializing]);

  const fetchUserData = async (userId: string) => {
    console.log("Fetching user data for:", userId);
    const docRef = doc(FIRESTORE, "users", userId);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        console.log("Fetched user data:", data);
        setUserData(data);

        if (data.currentOnboardingScreen) {
          setcurrentOnboardingScreen(data.currentOnboardingScreen);
          if (data.currentOnboardingScreen !== "WelcomeScreen") {
            setScreens((prevScreens) =>
              prevScreens.filter((screen) => screen !== "WelcomeScreen")
            );
          }
          router.replace(`onboarding/${data.currentOnboardingScreen}`);
        }
      } else {
        console.log("Document does not exist. Initializing new user data.");
        await setDoc(
          docRef,
          { currentOnboardingScreen: "PhoneNumberScreen", userId },
          { merge: true }
        );
        setUserData((prevData) => ({
          ...prevData,
          userId,
          currentOnboardingScreen: "PhoneNumberScreen",
        }));
        router.replace("onboarding/PhoneNumberScreen");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const saveProgress = async (screen?: string) => {
    try {
      const screenToSave = screen || userData.currentOnboardingScreen;
      if (userData.userId) {
        setcurrentOnboardingScreen(screenToSave);
        const docRef = doc(FIRESTORE, "users", userData.userId);
        await setDoc(
          docRef,
          { currentOnboardingScreen: screenToSave },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Failed to save progress: ", error);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    try {
      setUserData((prevData) => ({ ...prevData, ...data }));
      if (data.userId || userData.userId) {
        const userIdToUpdate = data.userId || userData.userId;
        const docRef = doc(FIRESTORE, "users", userIdToUpdate);
        await setDoc(docRef, data, { merge: true });
      }
    } catch (error) {
      console.error("Failed to update user data: ", error);
    }
  };

  const navigateToNextScreen = async () => {
    const { currentOnboardingScreen } = userData;
    const currentIndex = screens.indexOf(currentOnboardingScreen);
    if (currentIndex !== -1 && currentIndex < screens.length - 1) {
      const nextScreen = screens[currentIndex + 1];
      // Directly set userData's currentOnboardingScreen to ensure it updates
      const updatedUserData = {
        ...userData,
        currentOnboardingScreen: nextScreen,
      };
      setUserData(updatedUserData);
      await saveProgress(nextScreen); // Save progress before navigating
      setcurrentOnboardingScreen(nextScreen);
      router.replace(`onboarding/${nextScreen}`);
    }
  };

  const navigateToPreviousScreen = async () => {
    const { currentOnboardingScreen } = userData;
    const currentIndex = screens.indexOf(currentOnboardingScreen);
    if (currentIndex > 0) {
      const previousScreen = screens[currentIndex - 1];
      const updatedUserData = {
        ...userData,
        currentOnboardingScreen: previousScreen,
      };
      setUserData(updatedUserData);
      await saveProgress(previousScreen); // Save progress before navigating
      setcurrentOnboardingScreen(previousScreen);
      router.replace(`onboarding/${previousScreen}`);
    }
  };

  const navigateToScreen = async (screen: string) => {
    await saveProgress(screen); // Save progress before navigating
    setcurrentOnboardingScreen(screen);
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
    fetchUserData,
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
