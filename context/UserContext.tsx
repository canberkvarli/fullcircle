import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE } from "@/services/FirebaseConfig";
import { useRouter } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import potentialMatchesData from "@/data/potentialMatches";

export type UserDataType = {
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
  fullName?: string;
  birthdate?: string;
  birthmonth?: string;
  birthday?: string;
  birthyear?: string;
  age?: number;
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
  onboardingCompleted?: boolean;
  likedMatches?: string[];
  dislikedMatches?: string[];
  likesReceived?: string[]; // Users who liked the current user
  matches?: string[]; // Mutual likes
  fullCircleSubscription: boolean;
};

type UserContextType = {
  currentOnboardingScreen: string;
  setcurrentOnboardingScreen: React.Dispatch<React.SetStateAction<string>>;
  screens: string[];
  setScreens: React.Dispatch<React.SetStateAction<string[]>>;
  userData: UserDataType;
  setUserData: React.Dispatch<React.SetStateAction<UserDataType>>;
  googleCredential: FirebaseAuthTypes.AuthCredential | null;
  setGoogleCredential: React.Dispatch<
    React.SetStateAction<FirebaseAuthTypes.AuthCredential | null>
  >;
  googleUserData: UserDataType;
  setGoogleUserData: React.Dispatch<React.SetStateAction<UserDataType>>;
  updateUserData: (data: Partial<UserDataType>) => void;
  navigateToNextScreen: () => void;
  navigateToPreviousScreen: () => void;
  navigateToScreen: (screen: string) => void;
  saveProgress: (screen?: string) => void;
  fetchUserData: (userId: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  currentUser: FirebaseAuthTypes.User | null;
  setCurrentUser: React.Dispatch<
    React.SetStateAction<FirebaseAuthTypes.User | null>
  >;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
  likeMatch: (matchId: string) => Promise<void>;
  dislikeMatch: (matchId: string) => Promise<void>;
  currentPotentialMatch: any;
  setCurrentPotentialMatch: React.Dispatch<React.SetStateAction<any>>;
  loadNextPotentialMatch: () => void;
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

const initialUserData: UserDataType = {
  userId: "",
  phoneNumber: "",
  email: "",
  firstName: "",
  lastName: "",
  fullName: "",
  GoogleSSOEnabled: false,
  marketingRequested: true,
  countryCode: "",
  areaCode: "",
  number: "",
  currentOnboardingScreen: initialScreens[0],
  hiddenFields: {},
  fullCircleSubscription: false,
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
  const [userData, setUserData] = useState<UserDataType>(initialUserData);
  const [googleUserData, setGoogleUserData] =
    useState<UserDataType>(initialUserData);
  const [googleCredential, setGoogleCredential] =
    useState<FirebaseAuthTypes.AuthCredential | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    null
  );
  const [currentPotentialMatchIndex, setCurrentPotentialMatchIndex] =
    useState(0);
  const [currentPotentialMatch, setCurrentPotentialMatch] =
    useState<UserDataType | null>(null);
  const [potentialMatches, setPotentialMatches] =
    useState<UserDataType[]>(potentialMatchesData);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();

  const fetchUserData = async (userId: string) => {
    console.log("Fetching user data for:", userId);
    try {
      if (userId === "") {
        return;
      }
      const docRef = doc(FIRESTORE, "users", userId);
      const docSnap = await getDoc(docRef);
      const userDataFromFirestore = docSnap.data() as UserDataType;
      const userCurrentOnboardingScreen =
        userDataFromFirestore?.currentOnboardingScreen || "PhoneNumberScreen";
      if (docSnap.exists()) {
        console.log("userDataFromFirestore:", userDataFromFirestore);
        setUserData(userDataFromFirestore);
        if (userDataFromFirestore.onboardingCompleted) {
          router.replace({
            pathname: `/main/Connect` as any,
          });
          setPotentialMatches(potentialMatches); //load potential matches from faker
        } else {
          router.replace({
            pathname: `onboarding/${userCurrentOnboardingScreen}` as any,
          });
        }
      } else {
        router.replace({
          pathname: `onboarding/NameScreen` as any,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
    setCurrentUser(user);
    console.log("currentUser:", user);
    if (initializing) setInitializing(false);
    if (user) {
      await fetchUserData(user.uid);
    } else {
      setUserData(initialUserData); // Reset user data if user is null
    }
  };

  useEffect(() => {
    const subscriber = FIREBASE_AUTH.onAuthStateChanged((user) => {
      onAuthStateChanged(user as FirebaseAuthTypes.User | null);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  const getIdToken = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
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

  const updateUserData = async (data: Partial<UserDataType>) => {
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

  const signOut = async () => {
    try {
      if (googleCredential) {
        await GoogleSignin.signOut()
          .then(() => {
            console.log("google user signed out!");
          })
          .then(() => {
            setGoogleCredential(null);
          });
      }
      await FIREBASE_AUTH.signOut()
        .then(() => {
          setCurrentUser(null);
        })
        .then(() => console.log("User signed out! currentUser:", currentUser));

      // router.replace("/onboarding/LoginSignupScreen");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navigateToNextScreen = async () => {
    const currentScreenIndex = screens.indexOf(
      userData.currentOnboardingScreen
    );
    const nextScreenIndex = currentScreenIndex + 1;
    if (nextScreenIndex < screens.length) {
      const nextScreen = screens[nextScreenIndex];
      await saveProgress(nextScreen);
      updateUserData({ currentOnboardingScreen: nextScreen });
      router.replace(`onboarding/${nextScreen}` as any);
    } else {
      await updateUserData({ onboardingCompleted: true });
      await setPotentialMatches(potentialMatches); //load potential matches from faker
      router.replace("/");
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
      await saveProgress(previousScreen);
      router.replace(`onboarding/${previousScreen}` as any);
    }
  };

  const navigateToScreen = async (screen: string) => {
    if (screen === "NameScreen") {
      router.replace("onboarding/LoginSignupScreen" as any);
    } else {
      await saveProgress(screen);
      router.replace(`onboarding/${screen}` as any);
    }
  };

  const completeOnboarding = async () => {
    try {
      await updateUserData({
        onboardingCompleted: true,
        currentOnboardingScreen: "Connect",
      });
      await setPotentialMatches(potentialMatches); //load potential matches from faker
      router.replace("/main/Connect" as any);
    } catch (error) {
      console.error("Failed to complete onboarding: ", error);
    }
  };

  const loadNextPotentialMatch = () => {
    if (potentialMatches.length === 0) return;

    const nextIndex = currentPotentialMatchIndex + 1;

    if (nextIndex < potentialMatches.length) {
      setCurrentPotentialMatch(potentialMatches[nextIndex]);
      setCurrentPotentialMatchIndex(nextIndex);
    } else {
      // Optionally handle what happens when there are no more potential matches
      console.log("No more matches available.");
    }
  };

  const likeMatch = async (matchId: string) => {
    if (!currentUser) return;
    try {
      updateUserData({
        likedMatches: [...(userData.likedMatches || []), matchId],
      });
      console.log(`Liked match: ${matchId}`);
    } catch (error) {
      console.error("Failed to like match: ", error);
    }
  };

  const dislikeMatch = async (matchId: string) => {
    if (!currentUser) return;
    try {
      updateUserData({
        dislikedMatches: [...(userData.likedMatches || []), matchId],
      });
      console.log(`Disliked match: ${matchId}`);
    } catch (error) {
      console.error("Failed to dislike match: ", error);
    }
  };

  const contextValue: UserContextType = {
    currentOnboardingScreen,
    setcurrentOnboardingScreen,
    screens,
    setScreens,
    userData,
    setUserData,
    googleCredential,
    setGoogleCredential,
    googleUserData,
    setGoogleUserData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
    navigateToScreen,
    saveProgress,
    fetchUserData,
    getIdToken,
    currentUser,
    setCurrentUser,
    signOut,
    completeOnboarding,
    likeMatch,
    dislikeMatch,
    currentPotentialMatch,
    setCurrentPotentialMatch,
    loadNextPotentialMatch,
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
