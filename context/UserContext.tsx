import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE, STORAGE } from "@/services/FirebaseConfig";
import { useRouter } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  query,
  collection,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

import potentialMatchesData from "@/data/potentialMatches";
import { getDownloadURL, ref } from "firebase/storage";

export type UserDataType = {
  userId: string;
  isSeedUser: boolean;
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
  };
  fullCircleSubscription: boolean;
  likedMatches?: string[];
  dislikedMatches?: string[];
  likesReceived?: string[];
  detailedLikesReceived?: any[];
  matches?: string[];
  onboardingCompleted?: boolean;

  // Consolidated match preferences
  matchPreferences?: {
    preferredAgeRange?: {
      min: number;
      max: number;
    };
    preferredHeightRange?: {
      min: number;
      max: number;
    };
    preferredEthnicities: string[];
    preferredDistance: number;
    datePreferences: string[];
    desiredRelationship: string;
  };
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
  createOrFetchChat: (
    userId: string,
    otherUserId: string
  ) => Promise<string | null>;
  fetchRadiantSouls: () => Promise<any[]>;
  fetchDetailedLikes: () => void;
  getImageUrl: (imagePath: string) => Promise<string | null>;
};

// Initial screens and initial user data
const initialScreens = [
  "LandingPageScreen",
  "LoginSignupScreen",
  "PhoneNumberScreen",
  "PhoneVerificationScreen",
  "NameScreen",
  "EmailScreen",
  "BirthdateScreen",
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
  isSeedUser: false,
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
  likesReceived: potentialMatchesData.slice(0, 10).map((user) => user.userId),
  matchPreferences: {
    preferredAgeRange: {
      min: 18,
      max: 35,
    },
    preferredHeightRange: {
      min: 5,
      max: 8,
    },
    preferredEthnicities: [],
    preferredDistance: 100,
    datePreferences: [],
    desiredRelationship: "",
  },
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

  useEffect(() => {
    const subscriber = FIREBASE_AUTH.onAuthStateChanged((user) => {
      onAuthStateChanged(user as FirebaseAuthTypes.User | null);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (userData?.likesReceived) {
      fetchDetailedLikes();
    }
  }, [userData.likesReceived]);

  const fetchUserData = async (userId: string) => {
    console.log("Fetching user data for:", userId);
    try {
      if (!userId) {
        // If no userId is present, navigate to LandingPage
        router.replace({
          pathname: `onboarding/LandingPageScreen` as any,
        });
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
          console.log(
            "onboardingCompleted:",
            userDataFromFirestore.onboardingCompleted
          );
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
        // If user opens up the app for the first time, they MIGHT be taken to NameScreen instead of the landingpage.
        // Probably there is a currentUser with an id but not in the firestore. Weird.
        router.replace({
          pathname: `onboarding/NameScreen` as any,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchDetailedLikes = async () => {
    if (!userData?.likesReceived) return;

    try {
      const detailedUsers = await Promise.all(
        userData.likesReceived.map(async (userId) => {
          const userDoc = await getDoc(doc(FIRESTORE, "users", userId));
          return userDoc.exists() ? { userId, ...userDoc.data() } : null;
        })
      );
      setUserData((prev) => ({
        ...prev,
        detailedLikesReceived: detailedUsers.filter(Boolean),
      }));
    } catch (error) {
      console.error("Failed to fetch detailed likes:", error);
    }
  };

  const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
    setCurrentUser(user);
    console.log("currentUser:", user);
    if (initializing) setInitializing(false);

    if (user) {
      await fetchUserData(user.uid);
      console.log("OnAuthStateChanged: User is signed in");
    } else {
      setUserData(initialUserData);
    }
  };

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

  const milesToKm = (miles: number) => miles * 1.60934;

  const fetchRadiantSouls = async () => {
    try {
      const userId = userData.userId;
      if (!userId) {
        console.error("No userId found in userData.");
        return [];
      }

      const userLatitude = userData.latitude;
      const userLongitude = userData.longitude;
      const {
        preferredAgeRange,
        preferredHeightRange,
        preferredEthnicities,
        preferredDistance = 100,
      } = userData.matchPreferences || {};

      const preferredDistanceKm = milesToKm(preferredDistance);

      console.log("User Preferences:", userData.matchPreferences);

      // Base query: Exclude current user
      let userQuery = query(
        collection(FIRESTORE, "users"),
        // orderBy("likesReceived", "desc"),
        limit(50)
      );

      // Add optional filters
      // if (preferredAgeRange?.min && preferredAgeRange?.max) {
      //   userQuery = query(
      //     userQuery,
      //     where("age", ">=", preferredAgeRange.min),
      //     where("age", "<=", preferredAgeRange.max)
      //   );
      // }

      // if (preferredHeightRange?.min && preferredHeightRange?.max) {
      //   userQuery = query(
      //     userQuery,
      //     where("height", ">=", preferredHeightRange.min),
      //     where("height", "<=", preferredHeightRange.max)
      //   );
      // }

      // if (preferredEthnicities && preferredEthnicities.length > 0) {
      //   userQuery = query(
      //     userQuery,
      //     where("ethnicities", "array-contains-any", preferredEthnicities)
      //   );
      // }

      // Execute query
      const querySnapshot = await getDocs(userQuery);
      let radiantSouls = querySnapshot.docs.map((doc) => doc.data());

      // Filter by distance
      // if (userLatitude !== undefined && userLongitude !== undefined) {
      //   radiantSouls = radiantSouls.filter((soul) => {
      //     const { latitude, longitude } = soul;
      //     if (!latitude || !longitude) return false;

      //     const distance = calculateHaversineDistance(
      //       userLatitude,
      //       userLongitude,
      //       latitude,
      //       longitude
      //     );
      //     return distance <= preferredDistanceKm;
      //   });
      // }

      console.log("Filtered Radiant Souls:", radiantSouls);
      return radiantSouls.slice(0, 10); // Limit to 10 for UI display
    } catch (error) {
      console.error("Error fetching Radiant Souls:", error);
      return [];
    }
  };

  // Haversine formula for distance calculation
  const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
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

      router.replace("/onboarding/LoginSignupScreen");
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

  const getImageUrl = async (imagePath: string) => {
    const storageRef = ref(STORAGE, imagePath);
    try {
      const url = await getDownloadURL(storageRef);
      console.log("Fetched image URL:", url);
      return url;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  };

  const loadNextPotentialMatch = () => {
    if (!potentialMatches || potentialMatches.length === 0) {
      console.log("No potential matches available.");
      return;
    }

    const nextIndex = currentPotentialMatchIndex + 1;

    if (nextIndex < potentialMatches.length) {
      setCurrentPotentialMatch(potentialMatches[nextIndex]);
      setCurrentPotentialMatchIndex(nextIndex);
    } else {
      console.log("End of potential matches.");
      setCurrentPotentialMatch(null);
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

  const createOrFetchChat = async (
    userId: string,
    otherUserId: string
  ): Promise<string | null> => {
    // Generate a consistent chat ID by sorting user IDs alphabetically
    const chatId = [userId, otherUserId].sort().join("_");

    try {
      const chatRef = doc(FIRESTORE, `chats/${chatId}`);

      // Use a transaction to handle potential concurrency issues
      await runTransaction(FIRESTORE, async (transaction) => {
        const chatDoc = await transaction.get(chatRef);

        // If chat does not exist, create it
        if (!chatDoc.exists()) {
          console.log("Chat not found. Creating a new chat...");
          transaction.set(chatRef, {
            participants: [userId, otherUserId],
            messages: [],
            createdAt: new Date().toISOString(),
          });
          console.log("New chat created, returning chatId:", chatId);
        } else {
          console.log("Chat already exists, returning chatId:", chatId);
        }
      });

      return chatId;
    } catch (error) {
      console.error("Error creating or fetching chat:", error);
      return null;
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
    createOrFetchChat,
    fetchRadiantSouls,
    fetchDetailedLikes,
    getImageUrl,
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
