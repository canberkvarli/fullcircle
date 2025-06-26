import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { AppState, Alert } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { FIREBASE_AUTH, FIRESTORE, STORAGE } from "@/services/FirebaseConfig";
import auth from "@react-native-firebase/auth";
import * as Location from "expo-location";
import { v4 as uuidv4 } from "uuid";

import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  updateDoc,
  arrayUnion,
  Unsubscribe,
  writeBatch,
  addDoc,
} from "@react-native-firebase/firestore";

import firestore from "@react-native-firebase/firestore";

export type UserDataType = {
  userId: string;
  createdAt: any;
  lastActive?: any;
  isSeedUser: boolean;
  numOfOrbs?: number;
  lastOrbAssignedAt?: any;
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
  height?: number;
  regionName?: string;
  longitude?: number;
  latitude?: number;
  gender?: string[];
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
  
  // 🔮 Spiritual Profile Section
  spiritualProfile?: {
    draws?: string[];                  // From SpiritualDrawsScreen
    practices?: string[];              // From SpiritualPracticesScreen
    healingModalities?: string[];      // From HealingModalitiesScreen
  };
  
  fullCircleSubscription: boolean;
  likesGivenCount?: number;
  likesReceivedCount?: number;
  matches?: string[];
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: any;
  
  matchPreferences?: {
    preferredAgeRange?: {
      min: number;
      max: number;
    };
    preferredHeightRange?: {
      min: number;
      max: number;
    };
    preferredDistance: number;
    datePreferences: string[];
    
    // 🔮 Spiritual Matching Preferences (for later)
    spiritualCompatibility?: {
      spiritualDraws?: string[];
      practices?: string[];
      healingModalities?: string[];
    };
  };
  
  settings?: UserSettings;
};

export type UserSettings = {
  isPaused?: boolean;
  showLastActiveStatus?: boolean;
  isSelfieVerified?: boolean;
  selfieVerificationDate?: Date;
  pushNotifications?: PushNotificationSettings;
  connectedAccounts?: {
    google?: boolean;
    apple?: boolean;
  };
};

export type PushNotificationSettings = {
  enableAll?: boolean;
  muteAll?: boolean;
  newLikes?: boolean;
  newMatches?: boolean;
  newMessages?: boolean;
  promotions?: boolean;
  announcements?: boolean;
};

export type NotificationPreferences = {
  messageNotifications?: boolean;
  matchNotifications?: boolean;
  likeNotifications?: boolean;
};

export type MatchPreferencesType = {
  preferredAgeRange?: {
    min: number;
    max: number;
  };
  preferredHeightRange?: {
    min: number;
    max: number;
  };
  childrenPreference?: string;
  preferredEthnicities?: string[];
  preferredDistance: number;
  datePreferences: string[];
  desiredRelationship?: string;
  preferredSpiritualPractices?: string[];
};

export interface MatchType {
  userId: string;
  firstName?: string;
  photos?: string[];
  lastMessage: string;
  lastMessageSender: string;
  lastUpdated: Date;
}

export interface LikeRecord {
  matchId: string;
  viaOrb: boolean;
  timestamp: FirebaseFirestore.Timestamp;
}

export interface DislikeRecord {
  matchId: string;
  timestamp: FirebaseFirestore.Timestamp;
}

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
  handleGoogleSignIn: () => Promise<void>;
  verifyPhoneAndSetUser: (
    verificationId: string,
    code: string,
    phoneNumber: string
  ) => Promise<void>;
  updateUserData: (data: Partial<UserDataType>) => void;
  navigateToNextScreen: () => void;
  navigateToPreviousScreen: () => void;
  navigateToScreen: (screen: string) => void;
  saveProgress: (screen?: string) => void;
  fetchUserData: (userId: string, isSSO: boolean) => Promise<void>;
  fetchUserById: (userId: string) => void;
  getIdToken: () => Promise<string | null>;
  currentUser: FirebaseAuthTypes.User | null;
  setCurrentUser: React.Dispatch<
    React.SetStateAction<FirebaseAuthTypes.User | null>
  >;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
  likeMatch: (matchId: string) => any;
  orbLike: (matchId: string) => Promise<void>;
  dislikeMatch: (matchId: string) => any;
  currentPotentialMatch: UserDataType | null;
  setCurrentPotentialMatch: React.Dispatch<React.SetStateAction<any>>;
  loadNextPotentialMatch: () => void;
  loadingNextBatch: boolean;
  createOrFetchChat: (
    userId: string,
    matchedUserId: string
  ) => Promise<string | null>;
  subscribeToChatMessages: (
    chatId: string,
    onMessageReceived: (messages: any[]) => void
  ) => Unsubscribe;
  subscribeToChatMatches: (
    userId: string,
    onMatchReceived: (matches: any[]) => void
  ) => Unsubscribe;
  subscribeToReceivedLikes: (
    onUpdate: (users: UserDataType[]) => void
  ) => Unsubscribe;
  sendMessage: (
    chatId: string,
    messageText: string,
    senderId: string,
    receiverId: string
  ) => void;
  chatMatches: MatchType[];
  markMatchAsRead: (matchId: string, userId: string) => Promise<void>;
  markChatAsRead: (chatId: string, userId: string) => Promise<void>;
  unreadMatchesCount: number;
  fetchChatMatches: (userId: string) => Promise<any[]>;
  fetchPotentialMatches: () => void;
  resetPotentialMatches: () => void;
  getImageUrl: (imagePath: string) => Promise<string | null>;
  getReceivedLikesDetailed: () => Promise<any[]>;
  noMoreMatches: boolean;
  likesGivenCount?: number;
  likesReceivedCount?: number;
  dislikesGivenCount?: number;
  dislikesReceivedCount?: number;
  reportUser: (
    userId: string,
    reason: string,
    details: string | undefined
  ) => any;
  unmatchUser: (userId: string) => any;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  deleteAccount: () => Promise<void>;
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
  "DatePreferenceScreen",
  "HeightScreen",
  "SpiritualDrawsScreen",
  "SpiritualPracticesScreen",
  "HealingModalitiesScreen",
  // "SpiritualPartnershipScreen",  // ??
  "PhotosScreen",
];

const initialUserData: UserDataType = {
  userId: "",
  createdAt: serverTimestamp(),
  lastActive: null,
  isSeedUser: false,
  numOfOrbs: 1,
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
  matchPreferences: {
    preferredAgeRange: {
      min: 18,
      max: 35,
    },
    preferredHeightRange: {
      min: 3,
      max: 8,
    },
    preferredDistance: 100,
    datePreferences: [],
  },
  settings: {
    isPaused: false,
    showLastActiveStatus: true,
    isSelfieVerified: false,
    pushNotifications: {
      enableAll: true,
      muteAll: false,
      newLikes: true,
      newMatches: true,
      newMessages: true,
      promotions: true,
      announcements: true,
    },
    connectedAccounts: {
      google: false,
      apple: false,
    },
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
const imageCache: Record<string, string | Promise<string | null>> = {};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentOnboardingScreen, setcurrentOnboardingScreen] =
    useState<string>(initialScreens[0]);
  const [screens, setScreens] = useState<string[]>(initialScreens);
  const [userData, setUserData] = useState<UserDataType>({} as UserDataType);
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
  const [potentialMatches, setPotentialMatches] = useState<UserDataType[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [loadingNextBatch, setLoadingNextBatch] = useState(false);
  const [lastVisibleMatch, setLastVisibleMatch] = useState<"" | null>(null);
  const [noMoreMatches, setNoMoreMatches] = useState<boolean>(false);
  const [chatMatches, setChatMatches] = useState<MatchType[]>([]);
  const [unreadMatchesCount, setUnreadMatchesCount] = useState(0);
  const [isLinking, setIsLinking] = useState(false);
  const userDataRef = useRef(userData);
  const router = useRouter();
  const segments = useSegments();
  const getScreenPath = (screen: string) => `onboarding/${screen}` as any;
  const webClientId =
    "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com";
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
  const [excludedLikes, setExcludedLikes] = useState<Set<string>>(new Set());
  const [excludedDislikes, setExcludedDislikes] = useState<Set<string>>(
    new Set()
  );
  const [receivedLikes, setReceivedLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const subscriber = FIREBASE_AUTH.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    // Early return if onboarding is not completed
    if (!userData.onboardingCompleted) {
      console.log("Skipping match fetch - onboarding not completed");
      return;
    }

    // Also check if we have a valid user
    if (!userData.userId || !currentUser) {
      console.log("Skipping match fetch - no user ID or current user");
      return;
    }

    // Check if match preferences are properly initialized
    if (!userData.matchPreferences?.datePreferences?.length) {
      console.log("Skipping match fetch - match preferences not initialized");
      return;
    }

    console.log(
      "Match preferences changed, resetting matches",
      userData.matchPreferences
    );
    resetPotentialMatches();

    const initFetch = async () => {
      const initialBatch = await fetchPotentialMatches();
      if (initialBatch.length > 0) {
        setCurrentPotentialMatch(initialBatch[0]);
        setCurrentPotentialMatchIndex(0);
      }
    };

    initFetch();
  }, [
    userData.matchPreferences,
    userData.onboardingCompleted,
    userData.userId,
    currentUser,
  ]);

  useEffect(() => {
    // Don't prefetch during onboarding
    if (!userData.onboardingCompleted) return;

    // Don't prefetch until we have at least one batch
    if (potentialMatches.length === 0) return;

    const buffer = potentialMatches.length - currentPotentialMatchIndex - 1;
    if (buffer < 3 && !loadingNextBatch && !noMoreMatches) {
      console.log("Buffer is low, fetching more potential matches...");
      fetchPotentialMatches();
    }
  }, [
    potentialMatches,
    currentPotentialMatchIndex,
    userData.onboardingCompleted,
  ]);

  useEffect(() => {
    if (!userData.userId || !userData.onboardingCompleted) return;

    const loadExclusions = async () => {
      const likesSnap = await FIRESTORE.collection("users")
        .doc(userData.userId)
        .collection("likesGiven")
        .get();
      const dislikesSnap = await FIRESTORE.collection("users")
        .doc(userData.userId)
        .collection("dislikesGiven")
        .get();

      setExcludedLikes(new Set(likesSnap.docs.map((d) => d.id)));
      setExcludedDislikes(new Set(dislikesSnap.docs.map((d) => d.id)));
    };

    loadExclusions();
  }, [userData.userId, userData.onboardingCompleted]);

  useEffect(() => {
    if (!currentUser) return;
    const userDocRef = doc(FIRESTORE, "users", currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, (snap) => {
      if (!snap.exists) return;

      // grab only likesReceivedCount
      const newLikes: number = snap.get("likesReceivedCount") ?? 0;

      setUserData((prev) => ({
        ...prev,
        likesReceivedCount: newLikes,
      }));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Received likes from other users
  useEffect(() => {
    if (!currentUser) return;
    const likesRef = collection(
      doc(FIRESTORE, "users", currentUser.uid),
      "likesReceived"
    );

    const unsubscribe = onSnapshot(likesRef, (snap) => {
      const ids = new Set<string>(snap.docs.map((d) => d.id));
      setReceivedLikes(ids);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const assignWeeklyOrb = useCallback(async () => {
    if (!userData.userId) return;

    const userRef = doc(FIRESTORE, "users", userData.userId);

    // If they already have >=1 orb, or we assigned within the last week, bail out.
    const last = userData.lastOrbAssignedAt?.toMillis?.() ?? 0;
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    if ((userData.numOfOrbs ?? 0) >= 1 || now - last < oneWeekMs) {
      return;
    }

    // Give them one orb and update the timestamp.
    await updateDoc(userRef, {
      numOfOrbs: 1,
      lastOrbAssignedAt: serverTimestamp(),
    });

    // Optimistically update local state:
    setUserData((prev) => ({
      ...prev,
      numOfOrbs: 1,
      lastOrbAssignedAt: { toMillis: () => now }, // mirror the TS Timestamp shape
    }));
  }, [userData.userId, userData.numOfOrbs, userData.lastOrbAssignedAt]);

  useEffect(() => {
    assignWeeklyOrb();
    // Also as a safety, every 24h in case the app never backgrounds:
    const id = setInterval(assignWeeklyOrb, 1000 * 60 * 60 * 24);

    return () => {
      clearInterval(id);
    };
  }, [assignWeeklyOrb]);

  useEffect(() => {
    if (!userData.userId || !userData.onboardingCompleted) return;

    const q = query(
      collection(FIRESTORE, "chats"),
      where("participants", "array-contains", userData.userId)
    );
    const unsub = onSnapshot(q, async (snap) => {
      const detailed: MatchType[] = await Promise.all(
        snap.docs.map(async (chatSnap) => {
          const data = chatSnap.data();
          const otherId = data.participants.find(
            (id: string) => id !== userData.userId
          )!;
          const userSnap = await getDoc(doc(FIRESTORE, "users", otherId));
          const profile = userSnap.exists ? userSnap.data()! : {};

          const lastUpdated = data.lastUpdated?.toDate
            ? data.lastUpdated.toDate()
            : new Date(data.createdAt);

          return {
            userId: otherId,
            firstName: profile.firstName,
            photos: profile.photos,
            lastMessage: data.lastMessage || "",
            lastMessageSender: data.lastMessageSender || "",
            lastUpdated,
          };
        })
      );
      // sort newest first
      detailed.sort(
        (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
      );
      setChatMatches(detailed);
      // count those where the *other* user was the last sender
      setUnreadMatchesCount(
        detailed.filter((m) => m.lastMessageSender !== userData.userId).length
      );
    });
    return () => unsub();
  }, [userData.userId, userData.onboardingCompleted]);

  const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
    // Ignore auth state changes if linking is in progress
    if (isLinking) {
      console.log("Linking in progress, ignoring onAuthStateChanged update");
      return;
    }
    setCurrentUser(user);

    console.log("onAuthStateChanged() => currentUser:", user);
    if (initializing) setInitializing(false);

    if (user) {
      const isGoogleLogin = user.providerData.some(
        (provider) => provider.providerId === "google.com"
      );

      if (isGoogleLogin) {
        console.log("onAuthStateChanged(): User signed in via Google");
        console.log("isGoogleLogin from onAuthStateChanged()", isGoogleLogin);
        await fetchUserData(user.uid, isGoogleLogin);
      } else {
        console.log("onAuthStateChanged(): User signed in via phone");
        // to persist with the signed in user's flow we need to fetch the user data
        // and redirect to the appropriate onboarding screen or dashboard.
        await fetchUserData(user.uid, isGoogleLogin);
      }

      updateLastActive();
    } else {
      setUserData(initialUserData); // Reset if user signs out
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const { user } =
        await FIREBASE_AUTH.signInWithCredential(googleCredential);

      setGoogleCredential(googleCredential);
      setCurrentUser(user);

      if (user) {
        const userDocRef = doc(FIRESTORE, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        const userFirstName = user.displayName?.split(" ")[0] || "";
        const userLastName = user.displayName?.split(" ")[1] || "";
        const userFullName = user.displayName || "";

        // Default data for a new SSO user
        let userDataToUpdate: Partial<UserDataType> = {
          ...initialUserData,
          userId: user.uid,
          createdAt: serverTimestamp(),
          email: user.email || "",
          firstName: userFirstName,
          lastName: userLastName,
          fullName: userFullName,
          GoogleSSOEnabled: true,
          currentOnboardingScreen: "PhoneNumberScreen",
        };

        if (docSnap.exists) {
          // User already exists; use their current onboarding screen if defined
          const existingUser = docSnap.data() as UserDataType;
          console.log("handleGoogleSignIn(): Existing user found");

          userDataToUpdate = {
            ...existingUser,
            ...{
              userId: user.uid,
              email: user.email || "",
              firstName: userFirstName,
              lastName: userLastName,
              fullName: userFullName,
              GoogleSSOEnabled: true,
              currentOnboardingScreen:
                existingUser.currentOnboardingScreen || "NameScreen",
            },
            settings: {
              ...existingUser?.settings,
              connectedAccounts: {
                ...existingUser?.settings?.connectedAccounts,
                google: true,
              },
            },
          };
          userDataToUpdate.currentOnboardingScreen =
            existingUser.currentOnboardingScreen || "NameScreen";
          await updateUserData(userDataToUpdate);
        } else {
          // New user: create user document with default onboarding screen
          await setDoc(userDocRef, userDataToUpdate);
        }
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const verifyPhoneAndSetUser = async (
    verificationId: string,
    code: string,
    phoneNumber: string
  ) => {
    try {
      const { countryCode, areaCode, number } =
        destructurePhoneNumber(phoneNumber);
      const phoneCredential = auth.PhoneAuthProvider.credential(
        verificationId,
        code
      );

      if (googleCredential && FIREBASE_AUTH.currentUser) {
        // For Google SSO users, link the phone credential directly
        setIsLinking(true);
        try {
          console.log(
            "verifyPhoneAndSetUser(): Linking phone number to Google SSO user"
          );
          await FIREBASE_AUTH.currentUser.linkWithCredential(phoneCredential);
        } catch (error) {
          console.error(
            "Error linking phone number to Google SSO user:",
            error
          );
          setIsLinking(false);
          // Optionally handle specific error codes here (e.g., already-linked)
          return;
        }

        // After successful linking, update the user data
        await updateUserData({
          ...initialUserData,
          userId: FIREBASE_AUTH.currentUser.uid,
          GoogleSSOEnabled: true,
          phoneNumber,
          countryCode,
          areaCode,
          number,
          currentOnboardingScreen: "NameScreen",
        });
        router.replace(`onboarding/NameScreen` as any);
        setIsLinking(false);
      } else {
        console.log(
          "verifyPhoneAndSetUser(): Signing in with phone credential"
        );
        // For phone-only sign in, sign in with the phone credential to create a new user session
        const userCredential =
          await FIREBASE_AUTH.signInWithCredential(phoneCredential);
        const { user } = userCredential;
        const userDocRef = doc(FIRESTORE, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists) {
          console.log("New user, creating new user document");
          const newUser = {
            ...initialUserData,
            userId: user.uid,
            phoneNumber,
            countryCode,
            areaCode,
            number,
            currentOnboardingScreen: "NameScreen",
          };
          await updateUserData(newUser);
        }
        // else {
        //   console.log(
        //     "verifyPhoneAndSetUser(): User already exists, fetching user data..."
        //   );
        //   const existingUser = docSnap.data() as UserDataType;
        //   const nextScreen = existingUser.onboardingCompleted
        //     ? "/(tabs)/Connect"
        //     : `onboarding/${
        //         existingUser.currentOnboardingScreen || "NameScreen"
        //       }`;

        //   // await fetchUserData(user.uid);
        //   // router.replace(nextScreen as any);
        // }
      }
    } catch (error) {
      console.error("Error verifying phone number:", error);
    }
  };

  const updateUserData = async (data: Partial<UserDataType>) => {
    console.log("updateUserData(): Updating user data");
    try {
      const userIdToUpdate = data.userId || userData.userId;
      if (!userIdToUpdate) {
        throw new Error("User ID is required to update data");
      }

      const docRef = doc(FIRESTORE, "users", userIdToUpdate);
      const docSnapshot = await getDoc(docRef);
      let existingData: any;
      if (docSnapshot.exists) {
        existingData = docSnapshot.data();
      }

      // Merge hiddenFields
      let updatedHiddenFields = existingData?.hiddenFields || {};
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
      // userDataRef.current = {
      //   ...userDataRef.current,
      //   ...data,
      //   hiddenFields: updatedHiddenFields,
      // };
    } catch (error) {
      console.error("Failed to update user data: ", error);
    }
  };

  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    try {
      const updatedSettings = {
        ...(userData.settings || {}), // Add null check with default empty object
        ...settings,
      };

      await updateUserData({
        settings: updatedSettings,
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  };

  const fetchUserData = async (userId: string, isSSO: boolean) => {
    try {
      if (!userId) {
        // If no userId is present, navigate to LandingPage
        console.log(
          "fetchUserData(): No user ID provided, returning EARLY landing page"
        );
        router.replace({
          pathname: `onboarding/LandingPageScreen` as any,
        });
        return;
      }
      console.log("fetchUserData(): Fetching user data for:", userId);

      // Fetching the user document from Firestore
      const docRef = doc(FIRESTORE, "users", userId);
      const docSnap = await getDoc(docRef);
      const userDataFromFirestore = docSnap.data() as UserDataType;
      if (docSnap.exists) {
        setUserData(userDataFromFirestore);
        userDataRef.current = userDataFromFirestore;
        if (userDataFromFirestore.onboardingCompleted) {
          console.log("fetchUserData(): onboarding completed");
          // If onboarding is completed, navigate to the (tabs) app screen
          updateUserData({
            ...userDataFromFirestore,
            currentOnboardingScreen: "Connect",
          });
          router.replace({
            pathname: `/(tabs)/Connect` as any,
          });
        } else {
          console.log("fetchUserData(): onboarding not completed yet");
          // Otherwise, navigate based on the current onboarding screen
          const userCurrentOnboardingScreen =
            userDataFromFirestore.currentOnboardingScreen ||
            "PhoneNumberScreen";
          router.replace({
            pathname: `onboarding/${userCurrentOnboardingScreen}` as any,
          });
        }
      }
      // if no user in firestore and they are phone sso, navgiate to namescreen, make sure they are not google/apple sso
      else if (!isSSO && !userDataFromFirestore) {
        console.log(
          "fetchUserData(): No user in firestore, navigating to NameScreen"
        );
        router.replace({
          pathname: `onboarding/NameScreen` as any,
        });
      } else if (isSSO) {
        console.log("First-time Google SSO ➔ PhoneNumberScreen");
        router.replace({ pathname: `onboarding/PhoneNumberScreen` as any });
      } else {
        console.log("First-time phone login ➔ NameScreen");
        router.replace({ pathname: `onboarding/NameScreen` as any });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserById = async (userId: string) => {
    try {
      const userDocRef = doc(FIRESTORE, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists) {
        return { userId: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  // Update the last active timestamp
  const updateLastActive = async () => {
    if (!userData.onboardingCompleted) {
      return;
    }
    try {
      const userId = userData.userId;
      if (!userId) return;
      await updateUserData({ lastActive: serverTimestamp() });
      console.log("Last active updated successfully");
    } catch (error) {
      console.error("Error updating last active:", error);
    }
  };

  const buildQueryConstraints = ({
    matchPreferences,
    currentLat,
    currentLon,
  }: {
    matchPreferences?: typeof userData.matchPreferences;
    currentLat?: number;
    currentLon?: number;
  }) => {
    const constraints: any[] = [];

    // --- Gender / datePreferences ---
    const prefs = matchPreferences?.datePreferences ?? [];

    // If they picked “Everyone”, skip the gender filter completely
    if (!prefs.includes("Everyone")) {
      // Drop any stray “Everyone” if it ever appears alongside others
      const filtered = prefs.filter((p) => p !== "Everyone");

      const genderMap: Record<string, string> = {
        Men: "Man",
        Women: "Woman",
        "Non-Binary": "Non-binary",
      };
      const mapped = filtered.map((p) => genderMap[p] || p);

      if (mapped.length === 1) {
        constraints.push(where("gender", "==", mapped[0]));
      } else if (mapped.length > 1) {
        constraints.push(where("gender", "in", mapped));
      }
    }

    // --- Age Range ---
    const age = matchPreferences?.preferredAgeRange;
    if (age?.min != null && age?.max != null) {
      constraints.push(where("age", ">=", age.min));
      constraints.push(where("age", "<=", age.max));
    }

    // --- Height Range ---
    const height = matchPreferences?.preferredHeightRange;
    if (height?.min != null && height?.max != null) {
      constraints.push(where("height", ">=", height.min));
      constraints.push(where("height", "<=", height.max));
    }

    // --- Distance Bounding Box ---
    if (
      currentLat != null &&
      currentLon != null &&
      matchPreferences?.preferredDistance != null
    ) {
      const maxDist = matchPreferences.preferredDistance;
      const latDelta = maxDist / 69;
      const lonDelta = maxDist / (69 * Math.cos((currentLat * Math.PI) / 180));
      constraints.push(where("latitude", ">=", currentLat - latDelta));
      constraints.push(where("latitude", "<=", currentLat + latDelta));
      constraints.push(where("longitude", ">=", currentLon - lonDelta));
      constraints.push(where("longitude", "<=", currentLon + lonDelta));
    }

    return constraints;
  };

  const fetchPotentialMatches = async () => {
    // Early return if onboarding not completed
    if (!userData.onboardingCompleted) {
      console.log(
        "Skipping potential matches fetch - onboarding not completed"
      );
      return [];
    }

    if (!userData.userId) {
      console.log("Skipping potential matches fetch - no user ID");
      return [];
    }

    setLoadingNextBatch(true);
    userDataRef.current = userData;
    console.log("fetching potential matches...");

    const excluded = new Set<string>([
      userData.userId,
      ...excludedLikes,
      ...excludedDislikes,
      ...(receivedLikes ?? []),
      ...(userData.matches ?? []),
    ]);

    const baseConstraints = [
      orderBy("likesReceivedCount", "desc"),
      limit(10),
      // where("settings.isPaused", "!=", true),
      // ...buildQueryConstraints({
      //   matchPreferences: userData.matchPreferences,
      //   currentLat: userData.latitude,
      //   currentLon: userData.longitude,
      // }),
    ];

    let fetched: any[] = [];
    let hasMore = true;

    while (fetched.length < 10 && hasMore) {
      console.log("fetching batch...");
      const usersQ = lastVisibleMatch
        ? query(
            collection(FIRESTORE, "users"),
            ...baseConstraints,
            startAfter(lastVisibleMatch)
          )
        : query(collection(FIRESTORE, "users"), ...baseConstraints);
      const snap = await getDocs(usersQ);
      if (snap.empty) {
        console.log("no more matches");
        setNoMoreMatches(true);
        setLoadingNextBatch(false);
        break;
      }
      const newBatch = snap.docs
        .map((d) => d.data())
        .filter((u) => !excluded.has(u.userId));
      if (!newBatch.length) {
        setNoMoreMatches(true);
        setLoadingNextBatch(false);
        break;
      }

      fetched.push(...newBatch);
      const lastDoc = snap.docs[snap.docs.length - 1];
      setLastVisibleMatch(lastDoc.data().userId);
      console.log("fetched batch", fetched.length);
    }

    if (fetched.length) {
      setPotentialMatches((p) => [...p, ...fetched]);
    }
    setLoadingNextBatch(false);
    return fetched;
  };

  const resetPotentialMatches = () => {
    console.log("resetPotentialMatches(): Resetting potential matches...");
    setLoadingNextBatch(false);
    setPotentialMatches([]);
    setLastVisibleMatch(null);
    setNoMoreMatches(false);
    setCurrentPotentialMatch(null);
  };

  const loadNextPotentialMatch: () => Promise<void> = async () => {
    console.log("loadNextPotentialMatch(): Loading next potential match...");
    // Recalculate the current excluded set from userData.
    const excluded = new Set<string>([
      userData.userId,
      ...excludedLikes,
      ...excludedDislikes,
      ...(userData.matches ?? []),
    ]);

    // Filter potentialMatches to only those not in the excluded set.
    const valid = potentialMatches.filter((m) => !excluded.has(m.userId));
    const currentIdx = valid.findIndex(
      (m) => m.userId === currentPotentialMatch?.userId
    );

    // If we have valid matches, get the next one.
    if (valid.length > currentIdx + 1) {
      const next = valid[currentIdx + 1];
      const fullIndex = potentialMatches.findIndex(
        (m) => m.userId === next.userId
      );
      setCurrentPotentialMatch(next);
      setCurrentPotentialMatchIndex(fullIndex);
    } else if (!noMoreMatches || !loadingNextBatch) {
      // If no valid matches exist, fetch a new batch.
      console.log(
        "loadNextPotentialMatch(): No valid matches found, loading new batch..."
      );
      const newMatches = await fetchPotentialMatches();
      // If new matches were fetched, try to set the first valid one.
      if (newMatches.length > 0) {
        const validNewMatches = newMatches.filter(
          (match) => !excluded.has(match.userId)
        );
        if (validNewMatches.length > 0) {
          setCurrentPotentialMatch(validNewMatches[0]);
          // The new match's index will be at the end of the existing array.
          setCurrentPotentialMatchIndex(potentialMatches.length);
        }
      }
    } else {
      console.log("loadNextPotentialMatch(): No more matches to load.");
    }
  };

  const likeMatch = async (matchId: string) => {
    setPotentialMatches((prev) => prev.filter((m) => m.userId !== matchId));
    await recordLike(userData.userId, matchId, false);
    setExcludedLikes((prev) => new Set(prev).add(matchId));
  };

  const dislikeMatch = async (matchId: string) => {
    setPotentialMatches((prev) => prev.filter((m) => m.userId !== matchId));
    await recordDislike(userData.userId, matchId);
    setExcludedDislikes((prev) => new Set(prev).add(matchId));
  };

  const orbLike = async (matchId: string) => {
    setPotentialMatches((prev) => prev.filter((m) => m.userId !== matchId));
    await recordLike(userData.userId, matchId, true);
    setExcludedLikes((prev) => new Set(prev).add(matchId));
  };

  const recordLike = async (
    fromUserId: string,
    toUserId: string,
    viaOrb: boolean = false
  ): Promise<void> => {
    const fromRef = FIRESTORE.collection("users").doc(fromUserId);
    const toRef = FIRESTORE.collection("users").doc(toUserId);

    const givenRef = fromRef.collection("likesGiven").doc(toUserId);
    const receivedRef = toRef.collection("likesReceived").doc(fromUserId);

    // incoming like record to us
    const incomingRef = fromRef.collection("likesReceived").doc(toUserId);

    await FIRESTORE.runTransaction(async (tx) => {
      const fromSnap = await tx.get(fromRef);
      const fromData = fromSnap.data()!;

      // check if they already liked us
      const incomingSnap = await tx.get(incomingRef);
      const hadLikedUs = incomingSnap.exists;

      // check orb allowance
      if (viaOrb && (fromData.numOfOrbs ?? 0) < 1) {
        throw new Error("No orbs left this week");
      }

      // decrement orb & bump your given counter
      const updates: any = {
        likesGivenCount: (fromData.likesGivenCount ?? 0) + 1,
      };
      if (viaOrb && !fromData.fullCircleSubscription) {
        updates.numOfOrbs = (fromData.numOfOrbs ?? 0) - 1;
      }
      // if they'd already liked us, remove that incoming like & decrement our counter
      if (hadLikedUs) {
        tx.delete(incomingRef);
        updates.likesReceivedCount = (fromData.likesReceivedCount ?? 1) - 1;
      }
      tx.update(fromRef, updates);

      // bump receiver's counter
      const toSnap = await tx.get(toRef);
      const toData = toSnap.data()!;
      tx.update(toRef, {
        likesReceivedCount: (toData.likesReceivedCount ?? 0) + 1,
      });

      // write the actual sub‑collection records with viaOrb flag
      tx.set(givenRef, {
        matchId: toUserId,
        viaOrb,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      tx.set(receivedRef, {
        matchId: fromUserId,
        viaOrb,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      // if it was mutual, also write your matches subcollections
      if (hadLikedUs) {
        console.log("mutual like");
        const myMatchRef = fromRef.collection("matches").doc(toUserId);
        const theirMatchRef = toRef.collection("matches").doc(fromUserId);
        tx.set(myMatchRef, {
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        tx.set(theirMatchRef, {
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

        // Update matches arrays
        tx.update(fromRef, {
          matches: firestore.FieldValue.arrayUnion(toUserId),
        });
        tx.update(toRef, {
          matches: firestore.FieldValue.arrayUnion(fromUserId),
        });

        const chatId = [fromUserId, toUserId].sort().join("_");
        const chatRef = FIRESTORE.collection("chats").doc(chatId);
        tx.set(chatRef, {
          participants: [fromUserId, toUserId],
          messages: [],
          lastMessage: "",
          lastMessageSender: "",
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    // Update local state after successful transaction
    if (viaOrb && !userData.fullCircleSubscription) {
      setUserData((prev) => ({
        ...prev,
        numOfOrbs: Math.max(0, (prev.numOfOrbs ?? 1) - 1),
        likesGivenCount: (prev.likesGivenCount ?? 0) + 1,
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        likesGivenCount: (prev.likesGivenCount ?? 0) + 1,
      }));
    }
  };

  const recordDislike = async (
  fromUserId: string,
  toUserId: string
  ): Promise<void> => {
  const fromRef = doc(FIRESTORE, "users", fromUserId);
  const toRef = doc(FIRESTORE, "users", toUserId);
  const givenRef = doc(collection(fromRef, "dislikesGiven"), toUserId);
  const receivedRef = doc(collection(toRef, "dislikesReceived"), fromUserId);

  // Check if the target user had liked us - if so, we need to remove that like
  const incomingLikeRef = doc(collection(fromRef, "likesReceived"), toUserId);

  await runTransaction(FIRESTORE, async (tx) => {
    // Check if they had liked us
    const incomingLikeSnap = await tx.get(incomingLikeRef);
    const hadLikedUs = incomingLikeSnap.exists;

    // 1) bump the "given" counter
    const fromSnap = await tx.get(fromRef);
    const fromData = fromSnap.data()!;
    
    const fromUpdates: any = {
      dislikesGivenCount: (fromData.dislikesGivenCount ?? 0) + 1,
    };

    // If they had liked us, remove that incoming like record and decrement our received counter
    if (hadLikedUs) {
      tx.delete(incomingLikeRef);
      fromUpdates.likesReceivedCount = Math.max(0, (fromData.likesReceivedCount ?? 1) - 1);
    }

    tx.update(fromRef, fromUpdates);

    // 2) bump the "received" counter on the target user
    const toSnap = await tx.get(toRef);
    const toData = toSnap.data()!;
    tx.update(toRef, {
      dislikesReceivedCount: (toData.dislikesReceivedCount ?? 0) + 1,
    });

    // 3) write the dislike records
    tx.set(givenRef, { matchId: toUserId, timestamp: serverTimestamp() });
    tx.set(receivedRef, {
      matchId: fromUserId,
      timestamp: serverTimestamp(),
    });

    // 4) If they had liked us, also remove our like record from their likesGiven collection
    if (hadLikedUs) {
      const theirLikeGivenRef = doc(collection(toRef, "likesGiven"), fromUserId);
      tx.delete(theirLikeGivenRef);
      
      // Update their likesGivenCount
      tx.update(toRef, {
        likesGivenCount: Math.max(0, (toData.likesGivenCount ?? 1) - 1),
      });
    }
  });
  };

  const getReceivedLikesDetailed = async (): Promise<
    Array<any & { viaOrb: boolean; likedAt: Date }>
  > => {
    const uid = userData.userId!;
    const recSnap = await getDocs(
      collection(doc(FIRESTORE, "users", uid), "likesReceived")
    );
    const records = recSnap.docs.map((d) => d.data() as LikeRecord);

    // join each record with its user profile
    const detailed = await Promise.all(
      records.map(async (rec) => {
        const uSnap = await getDoc(doc(FIRESTORE, "users", rec.matchId));
        if (!uSnap.exists) return null;
        const profile = uSnap.data() as any;
        return {
          ...profile,
          userId: uSnap.id,
          viaOrb: rec.viaOrb,
          likedAt: rec.timestamp.toDate(),
        };
      })
    );

    return detailed.filter(Boolean) as any[];
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

  const destructurePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^\+?(\d{1,3})(\d{3})(\d{7,10})$/;
    const match = phoneRegex.exec(phoneNumber);
    if (!match) throw new Error("Invalid phone number format");
    const [, countryCode, areaCode, number] = match;
    return { countryCode, areaCode, number };
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

  const milesToKm = (miles: number) => miles * 1.60934;

  // Haversine formula for distance calculation
  const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const toRad = (value: any) => (value * Math.PI) / 180;
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const signOut = async () => {
    try {
      // Check if there's a signed-in user
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        // await GoogleSignin.revokeAccess(); // Revoke Google OAuth token
        await GoogleSignin.signOut(); // Sign out from Google
        console.log("Google account signed out!");
        setGoogleCredential(null);
      }

      // Sign out from Firebase Authentication
      await FIREBASE_AUTH.signOut();
      console.log("Firebase user signed out!");

      // Clear any app-level user data
      setCurrentUser(null);
      setUserData(initialUserData);

      // Navigate to Login/Signup screen
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
    router.navigate("onboarding/LoginSignupScreen" as any);
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
      await updateUserData({
        onboardingCompleted: true,
        onboardingCompletedAt: serverTimestamp(),
      });
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
        onboardingCompletedAt: serverTimestamp(),
        currentOnboardingScreen: "Connect",
      });
      await fetchPotentialMatches();
      router.replace("/(tabs)/Connect" as any);
    } catch (error) {
      console.error("Failed to complete onboarding: ", error);
    }
  };

  const getImageUrl = useCallback(
    async (imagePath: string): Promise<string | null> => {
      // 1) http URLs: just forward & resolve via STORAGE.refFromURL
      if (imagePath.startsWith("http")) {
        return STORAGE.refFromURL(imagePath)
          .getDownloadURL()
          .catch((err) => {
            console.error("Error fetching image URL:", err);
            return null;
          });
      }

      // 2) cached?
      const cached = imageCache[imagePath];
      if (cached) {
        return typeof cached === "string" ? Promise.resolve(cached) : cached;
      }

      // 3) kick off download & cache the promise
      const loader = STORAGE.ref(imagePath)
        .getDownloadURL()
        .then((url) => {
          imageCache[imagePath] = url;
          return url;
        })
        .catch((err) => {
          console.error("Error fetching image URL:", err);
          return null;
        });

      imageCache[imagePath] = loader;
      return loader;
    },
    []
  );

  const createOrFetchChat = async (
    userId: string,
    matchedUserId: string
  ): Promise<string | null> => {
    const chatId = [userId, matchedUserId].sort().join("_");
    try {
      // Check if they're matched by looking in the matches subcollection
      const matchDoc = await FIRESTORE.collection("users")
        .doc(userId)
        .collection("matches")
        .doc(matchedUserId)
        .get();

      if (!matchDoc.exists) {
        console.log("Users are not matched, cannot create chat");
        return null;
      }

      const chatRef = FIRESTORE.collection("chats").doc(chatId);

      await FIRESTORE.runTransaction(async (transaction) => {
        const snap = await transaction.get(chatRef);
        if (!snap.exists) {
          transaction.set(chatRef, {
            participants: [userId, matchedUserId],
            messages: [],
            lastMessage: "",
            lastUpdated: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      return chatId;
    } catch (err) {
      console.error("createOrFetchChat error:", err);
      return null;
    }
  };

  // Subscribe to real-time chat messages using onSnapshot.
  const subscribeToChatMessages = (
    chatId: string,
    callback: (msgs: any[]) => void
  ): Unsubscribe => {
    const chatRef = doc(FIRESTORE, "chats", chatId);
    return onSnapshot(chatRef, (snap) => {
      const msgs = snap.data()?.messages ?? [];
      callback(
        msgs.map((m: any) => ({
          ...m,
          timestamp: m.timestamp,
        }))
      );
    });
  };

  const subscribeToChatMatches = (
    userId: string,
    callback: (
      matches: Array<{
        userId: string;
        firstName?: string;
        photos?: string[];
        lastMessage: string;
        lastMessageSender: string;
        lastUpdated: Date;
      }>
    ) => void
  ): Unsubscribe => {
    const q = query(
      collection(FIRESTORE, "chats"),
      where("participants", "array-contains", userId)
    );

    return onSnapshot(q, async (snap) => {
      // Only process chats that actually exist
      const existingChats = snap.docs.filter((doc) => doc.exists);

      const detailed = await Promise.all(
        existingChats.map(async (chatSnap) => {
          const data = chatSnap.data();
          const participants: string[] = data.participants;
          const otherId = participants.find((id) => id !== userId)!;

          const userSnap = await getDoc(doc(FIRESTORE, "users", otherId));
          const profile = userSnap.exists ? userSnap.data()! : {};

          let updated = data.lastUpdated?.toDate
            ? data.lastUpdated.toDate()
            : data.lastUpdated
              ? new Date(data.lastUpdated)
              : new Date(data.createdAt);

          return {
            userId: otherId,
            firstName: profile.firstName,
            photos: profile.photos,
            lastMessage: data.lastMessage || "",
            lastMessageSender: data.lastMessageSender || "",
            lastUpdated: updated,
          };
        })
      );

      // sort newest-first
      detailed.sort(
        (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
      );
      callback(detailed);
    });
  };

  const subscribeToReceivedLikes = (
    callback: (users: any[]) => void
  ): (() => void) => {
    if (!userData.userId) {
      return () => {};
    }

    const unsubscribe = FIRESTORE.collection("users")
      .doc(userData.userId)
      .collection("likesReceived")
      .onSnapshot(async (snapshot) => {
        const likeRecords = snapshot.docs.map((doc) => ({
          userId: doc.id,
          ...doc.data(),
        }));

        // Fetch user data for each like
        const usersWithData = await Promise.all(
          likeRecords.map(
            async (record: {
              userId: string;
              viaOrb?: boolean;
              timestamp?: any;
            }) => {
              const userDoc = await FIRESTORE.collection("users")
                .doc(record.userId)
                .get();

              if (userDoc.exists) {
                const userData = userDoc.data();

                // Resolve photo URLs
                let resolvedPhotos: string[] = [];
                if (userData?.photos && Array.isArray(userData.photos)) {
                  resolvedPhotos = (
                    await Promise.all(
                      userData.photos.map((photoPath: string) =>
                        getImageUrl(photoPath)
                      )
                    )
                  ).filter((url): url is string => !!url);
                }

                return {
                  ...userData,
                  userId: record.userId,
                  photos: resolvedPhotos, // Use resolved photos
                  viaOrb: record.viaOrb || false, // Include viaOrb flag
                  likeTimestamp: record.timestamp, // Include timestamp for sorting
                };
              }
              return null;
            }
          )
        );

        // Filter out nulls and sort: orb likes first (newest to oldest), then regular likes
        const validUsers = usersWithData
          .filter((user): user is any => user !== null)
          .sort((a, b) => {
            // First sort by orb status
            if (a.viaOrb && !b.viaOrb) return -1;
            if (!a.viaOrb && b.viaOrb) return 1;

            // Then sort by timestamp (newest first)
            const timeA = a.likeTimestamp?.toMillis() || 0;
            const timeB = b.likeTimestamp?.toMillis() || 0;
            return timeB - timeA;
          });

        callback(validUsers);
      });

    return unsubscribe;
  };

  const sendMessage = async (
    chatId: string,
    messageText: string,
    senderId: string,
    receiverId: string
  ): Promise<void> => {
    const chatRef = doc(FIRESTORE, "chats", chatId);
    try {
      await updateDoc(chatRef, {
        messages: arrayUnion({
          text: messageText,
          sender: senderId,
          receiver: receiverId,
          timestamp: new Date().toISOString(),
        }),
        lastMessage: messageText,
        lastMessageSender: senderId,
        lastUpdated: serverTimestamp(),
      });
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  };

  const fetchChatMatches = async (
    userId: string
  ): Promise<
    Array<{
      userId: string;
      lastMessage: string;
      lastUpdated: Date;
      firstName?: string;
      photos?: string[];
      [key: string]: any;
    }>
  > => {
    console.log("fetchChatMatches called with userId:", userId);
    try {
      const chatsSnap = await getDocs(
        query(
          collection(FIRESTORE, "chats"),
          where("participants", "array-contains", userId)
        )
      );

      const results = await Promise.all(
        chatsSnap.docs.map(async (chatSnap) => {
          const data = chatSnap.data();
          const participants: string[] = data.participants;
          const otherId = participants.find((id) => id !== userId)!;

          const userSnap = await getDoc(doc(FIRESTORE, "users", otherId));
          const profile = userSnap.exists ? userSnap.data() : {};

          let updated: Date;
          if (data.lastUpdated && data.lastUpdated.toDate) {
            updated = data.lastUpdated.toDate();
          } else if (data.lastUpdated) {
            updated = new Date(data.lastUpdated);
          } else if (data.createdAt) {
            updated = new Date(data.createdAt);
          } else {
            updated = new Date();
          }

          return {
            userId: otherId,
            lastMessage: data.lastMessage || "",
            lastUpdated: updated,
            firstName: profile?.firstName,
            photos: profile?.photos,
            ...profile,
          };
        })
      );

      results.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

      return results;
    } catch (err) {
      console.error("fetchChatMatches error:", err);
      return [];
    }
  };

  const markChatAsRead = async (
    chatId: string,
    userId: string
  ): Promise<void> => {
    const chatRef = doc(FIRESTORE, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessageSender: userId,
    });
  };

  const unmatchUser = async (otherUserId: string) => {
    if (!userData.userId) return false;

    try {
      const chatId = [userData.userId, otherUserId].sort().join("_");

      // 1. Check for existing likes BEFORE deleting them
      const likeGivenDoc = await FIRESTORE.collection("users")
        .doc(userData.userId)
        .collection("likesGiven")
        .doc(otherUserId)
        .get();

      const likeReceivedDoc = await FIRESTORE.collection("users")
        .doc(userData.userId)
        .collection("likesReceived")
        .doc(otherUserId)
        .get();

      const hadGivenLike = likeGivenDoc.exists;
      const hadReceivedLike = likeReceivedDoc.exists;

      // 2. Delete the chat document
      await FIRESTORE.collection("chats").doc(chatId).delete();

      // 3. Remove from both users' matches arrays
      const batch = FIRESTORE.batch();

      const currentUserRef = FIRESTORE.collection("users").doc(userData.userId);
      const otherUserRef = FIRESTORE.collection("users").doc(otherUserId);

      batch.update(currentUserRef, {
        matches: firestore.FieldValue.arrayRemove(otherUserId),
      });

      batch.update(otherUserRef, {
        matches: firestore.FieldValue.arrayRemove(userData.userId),
      });

      // 4. Remove from matches subcollections
      batch.delete(
        FIRESTORE.collection("users")
          .doc(userData.userId)
          .collection("matches")
          .doc(otherUserId)
      );

      batch.delete(
        FIRESTORE.collection("users")
          .doc(otherUserId)
          .collection("matches")
          .doc(userData.userId)
      );

      // 5. Delete all like records
      batch.delete(
        FIRESTORE.collection("users")
          .doc(userData.userId)
          .collection("likesGiven")
          .doc(otherUserId)
      );

      batch.delete(
        FIRESTORE.collection("users")
          .doc(userData.userId)
          .collection("likesReceived")
          .doc(otherUserId)
      );

      batch.delete(
        FIRESTORE.collection("users")
          .doc(otherUserId)
          .collection("likesGiven")
          .doc(userData.userId)
      );

      batch.delete(
        FIRESTORE.collection("users")
          .doc(otherUserId)
          .collection("likesReceived")
          .doc(userData.userId)
      );

      // 6. Update like counts based on what existed before deletion
      if (hadGivenLike) {
        batch.update(currentUserRef, {
          likesGivenCount: firestore.FieldValue.increment(-1),
        });
        batch.update(otherUserRef, {
          likesReceivedCount: firestore.FieldValue.increment(-1),
        });
        console.log("like given count decremented");
      }

      if (hadReceivedLike) {
        batch.update(currentUserRef, {
          likesReceivedCount: firestore.FieldValue.increment(-1),
        });
        batch.update(otherUserRef, {
          likesGivenCount: firestore.FieldValue.increment(-1),
        });
        console.log("like received count decremented");
      }

      // Commit all changes at once
      await batch.commit();

      // 7. Update local exclusion sets
      setExcludedLikes((prev) => {
        const newSet = new Set(prev);
        console.log("excluded likes set", newSet);
        newSet.delete(otherUserId);
        console.log("new set after deleting.", newSet);
        return newSet;
      });

      return true;
    } catch (error) {
      console.error("Error unmatching user:", error);
      return false;
    }
  };

  const reportUser = async (
    reportedUserId: string,
    reason: string,
    details?: string
  ) => {
    if (!userData.userId) return false;

    try {
      await addDoc(collection(FIRESTORE, "reports"), {
        reportedBy: userData.userId,
        reportedUser: reportedUserId,
        reason,
        details: details || "",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      await unmatchUser(reportedUserId);

      return true;
    } catch (error) {
      console.error("Error reporting user:", error);
      return false;
    }
  };

  const markMatchAsRead = useCallback(
    async (otherUserId: string) => {
      const chatId = [userData.userId, otherUserId].sort().join("_");
      const chatRef = doc(FIRESTORE, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessageSender: userData.userId,
      });
      // optimistic local decrement:
      setUnreadMatchesCount((c) => Math.max(0, c - 1));
    },
    [userData.userId]
  );

  const deleteAccount = () => {
    console.log("deleteAccount");
  }

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
    fetchUserById,
    getIdToken,
    currentUser,
    setCurrentUser,
    signOut,
    completeOnboarding,
    likeMatch,
    getReceivedLikesDetailed,
    orbLike,
    dislikeMatch,
    currentPotentialMatch,
    setCurrentPotentialMatch,
    loadNextPotentialMatch,
    loadingNextBatch,
    createOrFetchChat,
    subscribeToChatMessages,
    subscribeToChatMatches,
    subscribeToReceivedLikes,
    sendMessage,
    markChatAsRead,
    fetchPotentialMatches,
    resetPotentialMatches,
    getImageUrl,
    noMoreMatches,
    verifyPhoneAndSetUser,
    handleGoogleSignIn,
    fetchChatMatches,
    chatMatches,
    markMatchAsRead,
    unreadMatchesCount,
    reportUser,
    unmatchUser,
    updateUserSettings,
    deleteAccount
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
