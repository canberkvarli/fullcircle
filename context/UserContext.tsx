import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FIRESTORE } from "@/services/FirebaseConfig";
import { useRouter } from "expo-router";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

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
  birthmonth?: string;
  birthday?: string;
  birthyear?: string;
  height?: string;
  regionName?: string;
  longitude?: number;
  latitude?: number;
  gender?: string;
  sexualOrientation?: string[];
  datePreferences?: string[];
  ethnicities?: string[];
  childrenPreference?: string;
  jobLocation?: string;
  jobTitle?: string;
  educationDegree?: string;
  spiritualPractices?: string[];
  photos?: string[];
  hiddenFields?: { [key: string]: boolean };
  location?: {
    city?: string;
    country?: string;
    formattedAddress?: string;
    isoCountryCode?: string;
    name?: string;
    postalCode?: string;
    region?: string;
    street?: string;
    streetNumber?: string;
    subregion?: string;
    // timezone?: string; // Optionally include timezone if needed
    // Add other optional fields as needed
  };
};

type UserContextType = {
  currentOnboardingScreen: string;
  setcurrentOnboardingScreen: React.Dispatch<React.SetStateAction<string>>;
  screens: string[];
  setScreens: React.Dispatch<React.SetStateAction<string[]>>;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  googleCredential: FirebaseAuthTypes.AuthCredential | null;
  setGoogleCredential: React.Dispatch<
    React.SetStateAction<FirebaseAuthTypes.AuthCredential | null>
  >;
  googleUserData: UserData;
  setGoogleUserData: React.Dispatch<React.SetStateAction<UserData>>;
  updateUserData: (data: Partial<UserData>) => void;
  navigateToNextScreen: () => void;
  navigateToPreviousScreen: () => void;
  navigateToScreen: (screen: string) => void;
  saveProgress: (screen?: string) => void;
  fetchUserData: (userId: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
};
// TODO-TESTING: Uncomment later.
const initialScreens = [
  "LandingPageScreen",
  "LoginSignupScreen",
  "PhoneNumberScreen",
  "PhoneVerificationScreen",
  // "WelcomeScreen",
  "NameScreen",
  "EmailScreen",
  "BirthdateScreen",
  // "AddBasicInfoScreen",
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
  hiddenFields: {},
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
  const [googleUserData, setGoogleUserData] =
    useState<UserData>(initialUserData);
  const [googleCredential, setGoogleCredential] =
    useState<FirebaseAuthTypes.AuthCredential | null>(null);
  const router = useRouter();

  const fetchUserData = async (userId: string) => {
    console.log("Fetching user data for:", userId);
    const docRef = doc(FIRESTORE, "users", userId);
    try {
      const docSnap = await getDoc(docRef);
      console.log("Getting the docSnap...");
      if (docSnap.exists()) {
        const userDataFromFirestore = docSnap.data() as UserData;
        const userCurrentOnboardingScreen =
          userDataFromFirestore.currentOnboardingScreen || "PhoneNumberScreen";
        console.log("userDataFromFirestore:", userDataFromFirestore);
        setUserData(userDataFromFirestore);
        updateUserData({
          userId: userId,
          currentOnboardingScreen: userCurrentOnboardingScreen,
        });
        router.replace({
          pathname: `onboarding/${userCurrentOnboardingScreen}`,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getIdToken = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        return idToken;
      }
    } catch (error) {
      console.error("Failed to get ID token:", error);
      return null;
    }
    return null;
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        console.log("User ID from listener:", user.uid);
        await fetchUserData(user.uid);
      } else {
        setUserData(initialUserData);
      }

      if (initializing) {
        console.log("UserContext initialized");
        setInitializing(false);
      }
    });

    return () => subscriber(); // Unsubscribe on unmount
  }, [initializing]);

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
      const userIdToUpdate = data.userId || userData.userId;
      if (!userIdToUpdate) {
        throw new Error("User ID is required to update data");
      }

      const docRef = doc(FIRESTORE, "users", userIdToUpdate);
      const docSnapshot = await getDoc(docRef);
      let existingData: Record<string, any> = {};
      if (docSnapshot.exists()) {
        existingData = docSnapshot.data();
      }
      // Merge hiddenFields
      let updatedHiddenFields = existingData.hiddenFields || {};
      if (data.hiddenFields) {
        updatedHiddenFields = {
          ...updatedHiddenFields,
          ...data.hiddenFields,
        };
      }

      const updatedData = {
        ...existingData,
        ...data,
        hiddenFields: updatedHiddenFields,
      };

      await setDoc(docRef, updatedData, { merge: true });

      // Update local state
      setUserData((prevData) => {
        const newData = { ...prevData, ...data };
        newData.hiddenFields = updatedHiddenFields;
        return newData;
      });
    } catch (error) {
      console.error("Failed to update user data: ", error);
    }
  };

  const navigateToNextScreen = async () => {
    const { currentOnboardingScreen } = userData;
    const currentIndex = screens.indexOf(currentOnboardingScreen);
    if (currentIndex !== -1 && currentIndex < screens.length - 1) {
      const nextScreen = screens[currentIndex + 1];
      const updatedUserData = {
        ...userData,
        currentOnboardingScreen: nextScreen,
      };
      setUserData(updatedUserData);
      await saveProgress(nextScreen); // Save progress before navigating
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
      router.replace(`onboarding/${previousScreen}`);
    }
  };

  const navigateToScreen = async (screen: string) => {
    if (screen === "NameScreen") {
      router.replace("onboarding/LoginSignupScreen");
    } else {
      await saveProgress(screen);
      router.replace(`onboarding/${screen}`);
    }
  };

  const contextValue: UserContextType = {
    currentOnboardingScreen,
    setcurrentOnboardingScreen,
    screens,
    setScreens,
    userData,
    setUserData,
    googleUserData,
    setGoogleUserData,
    googleCredential,
    setGoogleCredential,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
    navigateToScreen,
    saveProgress,
    fetchUserData,
    getIdToken,
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
