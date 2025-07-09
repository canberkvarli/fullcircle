import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter, useSegments } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { FIREBASE_AUTH, FIRESTORE, STORAGE } from "@/services/FirebaseConfig";
import auth from "@react-native-firebase/auth";

import firestore, { 
  FirebaseFirestoreTypes 
} from "@react-native-firebase/firestore";

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
    draws?: string[];
    practices?: string[];
    healingModalities?: string[];
  };
  
  fullCircleSubscription: boolean;
  likesGivenCount?: number;
  likesReceivedCount?: number;
  dislikesGivenCount?: number;
  dislikesReceivedCount?: number;
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
    
    // 🌟 NEW: Connection Intent & Preferences
    connectionIntent?: "romantic" | "friendship"; // Main connection type
    connectionPreferences?: string[]; // Who they want to connect with (Men, Women, Non-Binary, Everyone)
    connectionStyles?: string[]; // How they want to connect (Twin Flame, Practice Partners, etc.)
    
    // 🔄 DEPRECATED: Keeping for backward compatibility
    datePreferences: string[]; // Will map to connectionPreferences when connectionIntent is "romantic"
    
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
  preferredDistance: number;
  
  // 🌟 NEW: Connection Intent & Preferences
  connectionIntent?: "romantic" | "friendship";
  connectionPreferences?: string[];
  connectionStyles?: string[];
  
  // 🔄 DEPRECATED: Keeping for backward compatibility
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
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

export interface DislikeRecord {
  matchId: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
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
  loadNextPotentialMatch: () => void;
  loadingNextBatch: boolean;
  currentMatchIndex: number;
  createOrFetchChat: (
    userId: string,
    matchedUserId: string
  ) => Promise<string | null>;
  subscribeToChatMessages: (
    chatId: string,
    onMessageReceived: (messages: any[]) => void
  ) => void;
  subscribeToChatMatches: (
    userId: string,
    onMatchReceived: (matches: any[]) => void
  ) => void;
  subscribeToReceivedLikes: (
    onUpdate: (users: UserDataType[]) => void
  ) => void;
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
  exclusionsLoaded?: boolean;
  reportUser: (
    userId: string,
    reason: string,
    details: string | undefined
  ) => any;
  unmatchUser: (userId: string) => any;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

// Initial screens and initial user data
const initialScreens = [
  "LandingPageScreen",
  "LoginSignupScreen",
  "PhoneNumberScreen",
  "PhoneVerificationScreen",
  "NameScreen",
  "EmailScreen",
  "BirthdateScreen",
  "HeightScreen",
  "LocationScreen",
  "GenderScreen",
  "ConnectionPreferenceScreen",
  "SpiritualDrawsScreen",
  "SpiritualPracticesScreen",
  "HealingModalitiesScreen",
  "PhotosScreen",
];

const initialUserData: UserDataType = {
  userId: "",
  createdAt: firestore.FieldValue.serverTimestamp(),
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
  const [initializing, setInitializing] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [loadingNextBatch, setLoadingNextBatch] = useState(false);
  const [lastFetchedDoc, setLastFetchedDoc] = useState<any>(null);
  const [potentialMatches, setPotentialMatches] = useState<UserDataType[]>([]);
  const [matchingInitialized, setMatchingInitialized] = useState(false);
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
  const [excludedUserIds, setExcludedUserIds] = useState<Set<string>>(new Set());
  const [receivedLikes, setReceivedLikes] = useState<Set<string>>(new Set());
  const [exclusionsLoaded, setExclusionsLoaded] = useState(false);
  const PREFETCH_THRESHOLD = 3;

  useEffect(() => {
    const subscriber = FIREBASE_AUTH.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const currentPotentialMatch = useMemo(() => {
    const match = potentialMatches[currentMatchIndex] || null;
    console.log('🎯 Current match computed:', {
      index: currentMatchIndex,
      totalMatches: potentialMatches.length,
      matchId: match?.userId,
      matchName: match?.firstName
    });
    return match;
  }, [potentialMatches, currentMatchIndex]);


useEffect(() => {
  if (!userData.userId || !userData.onboardingCompleted) {
    setExclusionsLoaded(false);
    return;
  }

  const loadExclusions = async () => {
    console.log('📥 Loading exclusions for user:', userData.userId);
    
    try {
      // Load likes given
      const likesSnap = await FIRESTORE.collection("users")
        .doc(userData.userId)
        .collection("likesGiven")
        .get();
      
      const likedIds = new Set(likesSnap.docs.map((d) => d.id));
      console.log(`📥 Loaded ${likedIds.size} liked users:`, Array.from(likedIds));
      setExcludedLikes(likedIds);
      
      const dislikesSnap = await FIRESTORE.collection("users")
        .doc(userData.userId)
        .collection("dislikesGiven")
        .get();
      
      const dislikedIds = new Set(dislikesSnap.docs.map((d) => d.id));
      console.log(`📥 Loaded ${dislikedIds.size} disliked users:`, Array.from(dislikedIds));
      setExcludedDislikes(dislikedIds);
      
      setExclusionsLoaded(true);
      console.log('✅ Exclusions loading complete - FLAG SET TO TRUE');
      
    } catch (error) {
      console.error('❌ Error loading exclusions:', error);
      setExclusionsLoaded(true);
    }
  };

  loadExclusions();
}, [userData.userId, userData.onboardingCompleted]);

  useEffect(() => {
    if (!currentUser) return;
    
    const userDocRef = FIRESTORE.collection("users").doc(currentUser.uid);
    
    const unsubscribe = userDocRef.onSnapshot((snap) => {
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
    const likesRef = FIRESTORE
      .collection("users")
      .doc(currentUser.uid)
      .collection("likesReceived");

    const unsubscribe = likesRef.onSnapshot((snap) => {
      const ids = new Set<string>(snap.docs.map((d) => d.id));
      setReceivedLikes(ids);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const assignWeeklyOrb = useCallback(async () => {
    if (!userData.userId) return;

    const userRef = FIRESTORE.collection("users").doc(userData.userId);

    // If they already have >=1 orb, or we assigned within the last week, bail out.
    const last = userData.lastOrbAssignedAt?.toMillis?.() ?? 0;
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    if ((userData.numOfOrbs ?? 0) >= 1 || now - last < oneWeekMs) {
      return;
    }

    // Give them one orb and update the timestamp.
    await userRef.update({
      numOfOrbs: 1,
      lastOrbAssignedAt: firestore.FieldValue.serverTimestamp()
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

    const q = FIRESTORE
      .collection("chats")
      .where("participants", "array-contains", userData.userId);
    const unsub = q.onSnapshot(async (snap) => {
      const detailed: MatchType[] = await Promise.all(
        snap.docs.map(async (chatSnap) => {
          const data = chatSnap.data();
          const otherId = data.participants.find(
            (id: string) => id !== userData.userId
          )!;
          const userSnap = await FIRESTORE.collection("users").doc(otherId).get();
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
        const userDocRef = FIRESTORE.collection("users").doc(user.uid);
        const docSnap = await userDocRef.get();

        const userFirstName = user.displayName?.split(" ")[0] || "";
        const userLastName = user.displayName?.split(" ")[1] || "";
        const userFullName = user.displayName || "";

        let userDataToUpdate: Partial<UserDataType> = {
          ...initialUserData,
          userId: user.uid,
          createdAt: firestore.FieldValue.serverTimestamp(),
          email: user.email || "",
          firstName: userFirstName,
          lastName: userLastName,
          fullName: userFullName,
          GoogleSSOEnabled: true,
          currentOnboardingScreen: "PhoneNumberScreen",
        };

        if (docSnap.exists) {
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
          await userDocRef.set(userDataToUpdate);
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
          return;
        }

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
        const userCredential =
          await FIREBASE_AUTH.signInWithCredential(phoneCredential);
        const { user } = userCredential;
        const userDocRef = FIRESTORE.collection("users").doc(user.uid);
        const docSnap = await userDocRef.get();

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

      const docRef = FIRESTORE.collection("users").doc(userIdToUpdate);
      
      await docRef.set(data, { merge: true });

      if (data.hiddenFields) {
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
          const existingData = docSnapshot.data();
          const mergedHiddenFields = {
            ...(existingData?.hiddenFields || {}),
            ...data.hiddenFields,
          };
          
          await docRef.set({ hiddenFields: mergedHiddenFields }, { merge: true });
          
          setUserData((prevData) => ({
            ...prevData,
            ...data,
            hiddenFields: mergedHiddenFields,
          }));
          return;
        }
      }

      setUserData((prevData) => ({
        ...prevData,
        ...data,
      }));

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
        console.log(
          "fetchUserData(): No user ID provided, returning EARLY landing page"
        );
        router.replace({
          pathname: `onboarding/LandingPageScreen` as any,
        });
        return;
      }
      console.log("fetchUserData(): Fetching user data for:", userId);

      const docRef = FIRESTORE.collection("users").doc(userId);
      const docSnap = await docRef.get();
      const userDataFromFirestore = docSnap.data() as UserDataType;
      
      if (docSnap.exists) {
        setUserData(userDataFromFirestore);
        userDataRef.current = userDataFromFirestore;
        if (userDataFromFirestore.onboardingCompleted) {
          console.log("fetchUserData(): onboarding completed");
          updateUserData({
            ...userDataFromFirestore,
            currentOnboardingScreen: "Connect",
          });
          router.replace({
            pathname: `/(tabs)/Connect` as any,
          });
        } else {
          console.log("fetchUserData(): onboarding not completed yet");
          const userCurrentOnboardingScreen =
            userDataFromFirestore.currentOnboardingScreen ||
            "PhoneNumberScreen";
          router.replace({
            pathname: `onboarding/${userCurrentOnboardingScreen}` as any,
          });
        }
      }
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
      const userDocRef = FIRESTORE.collection("users").doc(userId);
      const userDoc = await userDocRef.get();
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
      await updateUserData({ lastActive: firestore.FieldValue.serverTimestamp() });
      console.log("Last active updated successfully");
    } catch (error) {
      console.error("Error updating last active:", error);
    }
  };

  // const buildQueryWithFilters = (
  //   baseQuery: FirebaseFirestoreTypes.Query,
  //   {
  //     matchPreferences,
  //     currentLat,
  //     currentLon,
  //   }: {
  //     matchPreferences?: typeof userData.matchPreferences;
  //     currentLat?: number;
  //     currentLon?: number;
  //   }
  // ): FirebaseFirestoreTypes.Query => {
  //   let query = baseQuery;

  //   // --- Gender / ConnectionPreferences ---
  //   const prefs = matchPreferences?.ConnectionPreferences ?? [];

  //   // If they picked "Everyone", skip the gender filter completely
  //   if (!prefs.includes("Everyone")) {
  //     // Drop any stray "Everyone" if it ever appears alongside others
  //     const filtered = prefs.filter((p) => p !== "Everyone");

  //     const genderMap: Record<string, string> = {
  //       Men: "Man",
  //       Women: "Woman",
  //       "Non-Binary": "Non-binary",
  //     };
  //     const mapped = filtered.map((p) => genderMap[p] || p);

  //     if (mapped.length === 1) {
  //       query = query.where("gender", "==", mapped[0]);
  //     } else if (mapped.length > 1) {
  //       query = query.where("gender", "in", mapped);
  //     }
  //   }

  //   // --- Age Range ---
  //   const age = matchPreferences?.preferredAgeRange;
  //   if (age?.min != null && age?.max != null) {
  //     query = query.where("age", ">=", age.min).where("age", "<=", age.max);
  //   }

  //   // --- Height Range ---
  //   const height = matchPreferences?.preferredHeightRange;
  //   if (height?.min != null && height?.max != null) {
  //     query = query.where("height", ">=", height.min).where("height", "<=", height.max);
  //   }

  //   // --- Distance Bounding Box ---
  //   if (
  //     currentLat != null &&
  //     currentLon != null &&
  //     matchPreferences?.preferredDistance != null
  //   ) {
  //     const maxDist = matchPreferences.preferredDistance;
  //     const latDelta = maxDist / 69;
  //     const lonDelta = maxDist / (69 * Math.cos((currentLat * Math.PI) / 180));
      
  //     query = query
  //       .where("latitude", ">=", currentLat - latDelta)
  //       .where("latitude", "<=", currentLat + latDelta)
  //       .where("longitude", ">=", currentLon - lonDelta)
  //       .where("longitude", "<=", currentLon + lonDelta);
  //   }

  //   return query;
  // };

const fetchPotentialMatches = useCallback(async (): Promise<UserDataType[]> => {
  if (loadingNextBatch) {
    console.log('⏸️ Already loading, skipping fetch');
    return [];
  }

  console.log('🔍 Starting fetch potential matches...');
  setLoadingNextBatch(true);
  
  try {
    // Build query
    let query = FIRESTORE.collection("users")
      .where("onboardingCompleted", "==", true)
      .orderBy("createdAt", "desc")
      .limit(10);
    
    if (lastFetchedDoc) {
      console.log('📄 Using pagination with lastDoc');
      query = query.startAfter(lastFetchedDoc);
    }
    
    const snapshot = await query.get();
    console.log(`📊 Query returned ${snapshot.docs.length} raw users`);
    
    if (snapshot.empty) {
      console.log('📭 No more users in database');
      setNoMoreMatches(true);
      setLoadingNextBatch(false);
      return [];
    }
    

    const excluded = new Set<string>();
    
    if (userData.userId) {
      excluded.add(userData.userId);
      console.log(`🚫 Excluding current user: ${userData.userId}`);
    }
    
    if (userData.matches?.length) {
      userData.matches.forEach(id => excluded.add(id));
      console.log(`🚫 Excluding ${userData.matches.length} matches`);
    }
    
    excludedLikes.forEach(id => excluded.add(id));
    console.log(`🚫 Excluding ${excludedLikes.size} liked users`);
    
    excludedDislikes.forEach(id => excluded.add(id));
    console.log(`🚫 Excluding ${excludedDislikes.size} disliked users`);
    
    excludedUserIds.forEach(id => excluded.add(id));
    console.log(`🚫 Excluding ${excludedUserIds.size} session users`);
    
    receivedLikes.forEach(id => excluded.add(id));
    console.log(`🚫 Excluding ${receivedLikes.size} received likes`);
    
    console.log(`🚫 Total excluded users: ${excluded.size}`);
    console.log(`🚫 Excluded IDs:`, Array.from(excluded));
    
    const allUsers = snapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    } as UserDataType));
    
    console.log(`📋 All fetched users:`, allUsers.map(u => `${u.userId} (${u.firstName})`));
    
    const validUsers = allUsers.filter(user => {
      const isExcluded = excluded.has(user.userId);
      if (isExcluded) {
        console.log(`❌ Excluding user ${user.userId} (${user.firstName})`);
      } else {
        console.log(`✅ Including user ${user.userId} (${user.firstName})`);
      }
      return !isExcluded;
    });
    
    console.log(`✅ Filtered to ${validUsers.length} valid users out of ${allUsers.length}`);
    
    if (snapshot.docs.length > 0) {
      setLastFetchedDoc(snapshot.docs[snapshot.docs.length - 1]);
    }
    
    // Take first 10 for batch
    const batch = validUsers.slice(0, 10);
    console.log(`📦 Returning batch of ${batch.length} users:`, batch.map(u => `${u.userId} (${u.firstName})`));
    
    setLoadingNextBatch(false);
    
    if (batch.length === 0) {
      setNoMoreMatches(true);
    }
    
    return batch;
    
  } catch (error) {
    console.error('❌ Error fetching matches:', error);
    setLoadingNextBatch(false);
    setNoMoreMatches(true);
    return [];
  }
}, [
  lastFetchedDoc,
  userData.userId,
  userData.matches,
  excludedLikes,
  excludedDislikes,
  excludedUserIds,
  receivedLikes
]);


const initializeMatches = useCallback(async () => {
  if (matchingInitialized || loadingNextBatch) {
    console.log('✅ Already initialized or loading');
    return;
  }
  
  if (!userData.userId || !userData.onboardingCompleted) {
    console.log('⏸️ Not ready - missing userId or onboarding incomplete');
    return;
  }
  
  if (!exclusionsLoaded) {
    console.log('⏸️ Waiting for exclusions to load...');
    return;
  }
  
  console.log('🚀 INITIALIZING MATCHES (with exclusions loaded)...');
  setMatchingInitialized(true);
  
  try {
    const firstBatch = await fetchPotentialMatches();
    
    if (firstBatch.length > 0) {
      console.log(`🎉 Successfully initialized with ${firstBatch.length} matches`);
      setPotentialMatches(firstBatch);
      setCurrentMatchIndex(0);
    } else {
      console.log('📭 No matches found during initialization');
      setNoMoreMatches(true);
    }
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    setNoMoreMatches(true);
  }
}, [userData.userId, userData.onboardingCompleted, exclusionsLoaded]); // ✅ Add e

  useEffect(() => {
    if (userData.onboardingCompleted && potentialMatches.length > 0 && !loadingNextBatch && !noMoreMatches) {
      const remainingMatches = potentialMatches.length - currentMatchIndex - 1;
      
      if (remainingMatches <= PREFETCH_THRESHOLD) {
        console.log(`📊 Running low on matches (${remainingMatches} left), prefetching...`);
        
        fetchPotentialMatches().then(newBatch => {
          if (newBatch.length > 0) {
            console.log(`✅ Prefetched ${newBatch.length} more matches`);
            setPotentialMatches(prev => [...prev, ...newBatch]);
          }
        }).catch(error => {
          console.error("❌ Error prefetching matches:", error);
        });
      }
    }
  }, [currentMatchIndex, potentialMatches.length]);

  const resetPotentialMatches = useCallback(() => {
    console.log('🔄 RESETTING POTENTIAL MATCHES');
    setPotentialMatches([]);
    setCurrentMatchIndex(0);
    setLoadingNextBatch(false);
    setNoMoreMatches(false);
    setLastFetchedDoc(null);
    setExcludedUserIds(new Set());
    setMatchingInitialized(false);
  }, []);

  const loadNextPotentialMatch = useCallback(async () => {
    console.log('➡️ Loading next match...');
    console.log('📊 Current state:', {
      currentIndex: currentMatchIndex,
      totalMatches: potentialMatches.length,
      nextIndex: currentMatchIndex + 1
    });
    
    if (currentMatchIndex + 1 < potentialMatches.length) {
      console.log('📋 Moving to next match in batch');
      setCurrentMatchIndex(prev => prev + 1);
      return;
    }
    
    console.log('🔄 Need to fetch more matches');
    try {
      const newBatch = await fetchPotentialMatches();
      
      if (newBatch.length > 0) {
        console.log(`📦 Adding ${newBatch.length} new matches to batch`);
        setPotentialMatches(prev => [...prev, ...newBatch]);
        setCurrentMatchIndex(prev => prev + 1);
      } else {
        console.log('📭 No more matches available');
        setNoMoreMatches(true);
      }
    } catch (error) {
      console.error('❌ Error loading next match:', error);
      setNoMoreMatches(true);
    }
  }, [currentMatchIndex, potentialMatches.length, fetchPotentialMatches]);


const dislikeMatch = useCallback(async (matchId: string) => {
  console.log(`👎 DISLIKING USER: ${matchId}`);
  
  try {
    setExcludedUserIds(prev => new Set(prev).add(matchId));
    await recordDislikeWithBatch(userData.userId, matchId);
    setExcludedDislikes(prev => new Set(prev).add(matchId));
    await loadNextPotentialMatch();
    console.log('✅ Dislike completed successfully');
  } catch (error) {
    console.error('❌ Error disliking match:', error);
    setExcludedUserIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(matchId);
      return newSet;
    });
    setExcludedDislikes(prev => {
      const newSet = new Set(prev);
      newSet.delete(matchId);
      return newSet;
    });
  }
}, [userData.userId, loadNextPotentialMatch]);

const likeMatch = useCallback(async (matchId: string) => {
  console.log(`❤️ LIKING USER: ${matchId}`);
  console.log('📊 Current state before like:', {
    currentIndex: currentMatchIndex,
    totalMatches: potentialMatches.length,
    matchingInitialized,
  });
  
  try {
    setExcludedUserIds(prev => new Set(prev).add(matchId));
    console.log('✅ Added to excluded user IDs');
    
    console.log('🔄 Starting recordLike with batch...');
    await recordLikeWithBatch(userData.userId, matchId, false);
    console.log('✅ recordLike batch completed successfully');
    
    setExcludedLikes(prev => new Set(prev).add(matchId));
    console.log('✅ Added to excluded likes set');
    
    console.log('🔄 About to call loadNextPotentialMatch...');
    await loadNextPotentialMatch();
    console.log('✅ loadNextPotentialMatch completed');
    
    console.log('✅ Like completed successfully');
  } catch (error) {
    console.error('❌ Error liking match:', error);
    
    setExcludedUserIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(matchId);
      return newSet;
    });
    setExcludedLikes(prev => {
      const newSet = new Set(prev);
      newSet.delete(matchId);
      return newSet;
    });
    
    console.log('🔄 Cleaned up exclusion sets after error');
    throw error;
  }
}, [userData.userId, loadNextPotentialMatch, currentMatchIndex, potentialMatches.length, matchingInitialized]);

const orbLike = useCallback(async (matchId: string) => {
  console.log(`✨ ORB LIKING USER: ${matchId}`);
  
  try {
    if (!userData.numOfOrbs || userData.numOfOrbs <= 0) {
      throw new Error("No orbs available");
    }
    
    setExcludedUserIds(prev => new Set(prev).add(matchId));
    
    await recordLikeWithBatch(userData.userId, matchId, true);
    
    setExcludedLikes(prev => new Set(prev).add(matchId));
    
    setUserData(prev => ({
      ...prev,
      numOfOrbs: (prev.numOfOrbs || 0) - 1
    }));
    
    await loadNextPotentialMatch();
    console.log('✅ Orb like completed successfully');
  } catch (error) {
    console.error('❌ Error orb liking match:', error);
    setExcludedUserIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(matchId);
      return newSet;
    });
    setExcludedLikes(prev => {
      const newSet = new Set(prev);
      newSet.delete(matchId);
      return newSet;
    });
  }
}, [userData.userId, userData.numOfOrbs, loadNextPotentialMatch]);

const recordLikeWithBatch = async (
  fromUserId: string,
  toUserId: string,
  viaOrb: boolean = false
): Promise<void> => {
  console.log('🔥 Using batch approach for like...');
  
  try {
    const fromRef = FIRESTORE.collection("users").doc(fromUserId);
    const toRef = FIRESTORE.collection("users").doc(toUserId);
    const givenRef = fromRef.collection("likesGiven").doc(toUserId);
    const receivedRef = toRef.collection("likesReceived").doc(fromUserId);
    const incomingRef = fromRef.collection("likesReceived").doc(toUserId);
    
    console.log('🔥 Reading current user data...');
    const [fromSnap, toSnap, incomingSnap] = await Promise.all([
      fromRef.get(),
      toRef.get(),
      incomingRef.get()
    ]);
    
    if (!fromSnap.exists || !toSnap.exists) {
      throw new Error('User documents do not exist');
    }
    
    const fromData = fromSnap.data()!;
    const toData = toSnap.data()!;
    const hadLikedUs = incomingSnap.exists;
    
    console.log('🔥 Data loaded:', { 
      fromExists: fromSnap.exists, 
      toExists: toSnap.exists, 
      hadLikedUs,
      fromLikesGiven: fromData.likesGivenCount 
    });
    
    // Check orb allowance
    if (viaOrb && (fromData.numOfOrbs ?? 0) < 1) {
      throw new Error("No orbs left this week");
    }
    
    // Prepare batch
    const batch = FIRESTORE.batch();
    
    // Set like records
    batch.set(givenRef, {
      matchId: toUserId,
      viaOrb,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    
    batch.set(receivedRef, {
      matchId: fromUserId,
      viaOrb,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    
    const fromUpdates: any = {
      likesGivenCount: (fromData.likesGivenCount ?? 0) + 1,
    };
    
    if (viaOrb && !fromData.fullCircleSubscription) {
      fromUpdates.numOfOrbs = Math.max(0, (fromData.numOfOrbs ?? 0) - 1);
    }
    
    if (hadLikedUs) {
      console.log('🔥 MUTUAL LIKE DETECTED - Creating match...');
      
      batch.delete(incomingRef);
      fromUpdates.likesReceivedCount = Math.max(0, (fromData.likesReceivedCount ?? 1) - 1);
      
      const myMatchRef = fromRef.collection("matches").doc(toUserId);
      const theirMatchRef = toRef.collection("matches").doc(fromUserId);
      
      batch.set(myMatchRef, {
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      batch.set(theirMatchRef, {
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      
      fromUpdates.matches = firestore.FieldValue.arrayUnion(toUserId);
      
      const chatId = [fromUserId, toUserId].sort().join("_");
      const chatRef = FIRESTORE.collection("chats").doc(chatId);
      batch.set(chatRef, {
        participants: [fromUserId, toUserId],
        messages: [],
        lastMessage: "",
        lastMessageSender: "",
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastUpdated: firestore.FieldValue.serverTimestamp(),
      });
      
      batch.update(toRef, {
        matches: firestore.FieldValue.arrayUnion(fromUserId),
        likesReceivedCount: (toData.likesReceivedCount ?? 0) + 1,
        likesGivenCount: Math.max(0, (toData.likesGivenCount ?? 1) - 1), // They liked us first
      });
      
      console.log('🔥 Match and chat will be created');
    } else {
      batch.update(toRef, {
        likesReceivedCount: (toData.likesReceivedCount ?? 0) + 1,
      });
    }
    
    batch.update(fromRef, fromUpdates);
    
    console.log('🔥 Committing batch...');
    await batch.commit();
    console.log('✅ Batch committed successfully');
    
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
    
    if (hadLikedUs) {
      console.log('🎉 MUTUAL MATCH CREATED!');
    }
    
    console.log('🔥 Local state updated');
    
  } catch (error) {
    console.error('❌ Batch approach failed:', error);
    throw error;
  }
};

const recordDislikeWithBatch = async (
  fromUserId: string,
  toUserId: string
): Promise<void> => {
  console.log('🔥 Using batch approach for dislike...');
  
  try {
    const fromRef = FIRESTORE.collection("users").doc(fromUserId);
    const toRef = FIRESTORE.collection("users").doc(toUserId);
    const givenRef = fromRef.collection("dislikesGiven").doc(toUserId);
    const receivedRef = toRef.collection("dislikesReceived").doc(fromUserId);
    const incomingLikeRef = fromRef.collection("likesReceived").doc(toUserId);
    
    console.log('🔥 Reading current user data for dislike...');
    const [fromSnap, toSnap, incomingLikeSnap] = await Promise.all([
      fromRef.get(),
      toRef.get(),
      incomingLikeRef.get()
    ]);
    
    if (!fromSnap.exists || !toSnap.exists) {
      throw new Error('User documents do not exist');
    }
    
    const fromData = fromSnap.data()!;
    const toData = toSnap.data()!;
    const hadLikedUs = incomingLikeSnap.exists;
    
    console.log('🔥 Dislike data loaded:', { 
      fromExists: fromSnap.exists, 
      toExists: toSnap.exists, 
      hadLikedUs,
      fromDislikesGiven: fromData.dislikesGivenCount 
    });
    
    const batch = FIRESTORE.batch();
    
    batch.set(givenRef, {
      matchId: toUserId,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    
    batch.set(receivedRef, {
      matchId: fromUserId,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    
    const fromUpdates: any = {
      dislikesGivenCount: (fromData.dislikesGivenCount ?? 0) + 1,
    };
    
    const toUpdates: any = {
      dislikesReceivedCount: (toData.dislikesReceivedCount ?? 0) + 1,
    };
    
    // Handle case where they had liked us
    if (hadLikedUs) {
      console.log('🔥 Target user had liked us - removing their like...');
      
      batch.delete(incomingLikeRef);
      
      fromUpdates.likesReceivedCount = Math.max(0, (fromData.likesReceivedCount ?? 1) - 1);
      
      const theirLikeGivenRef = toRef.collection("likesGiven").doc(fromUserId);
      batch.delete(theirLikeGivenRef);
      toUpdates.likesGivenCount = Math.max(0, (toData.likesGivenCount ?? 1) - 1);
      
      console.log('🔥 Mutual like records will be removed');
    }
    
    batch.update(fromRef, fromUpdates);
    batch.update(toRef, toUpdates);
    
    console.log('🔥 Committing dislike batch...');
    await batch.commit();
    console.log('✅ Dislike batch committed successfully');
    
    setUserData((prev) => ({
      ...prev,
      dislikesGivenCount: (prev.dislikesGivenCount ?? 0) + 1,
      ...(hadLikedUs && {
        likesReceivedCount: Math.max(0, (prev.likesReceivedCount ?? 1) - 1)
      })
    }));
    
    console.log('🔥 Local dislike state updated');
    
  } catch (error) {
    console.error('❌ Dislike batch approach failed:', error);
    throw error;
  }
};

const getReceivedLikesDetailed = async (): Promise<
  Array<any & { viaOrb: boolean; likedAt: Date }>
> => {
  const uid = userData.userId!;
  const recSnap = await FIRESTORE
    .collection("users")
    .doc(uid)
    .collection("likesReceived")
    .get();
  
  const records = recSnap.docs.map((d) => d.data() as LikeRecord);

  // join each record with its user profile
  const detailed = await Promise.all(
    records.map(async (rec) => {
      const uSnap = await FIRESTORE.collection("users").doc(rec.matchId).get();
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
        const docRef = FIRESTORE.collection("users").doc(userData.userId);
        await docRef.set(
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
    const currentScreenIndex = screens.indexOf(userData.currentOnboardingScreen);
    const nextScreenIndex = currentScreenIndex + 1;
    
    if (nextScreenIndex < screens.length) {
      const nextScreen = screens[nextScreenIndex];
      await saveProgress(nextScreen);
      updateUserData({ currentOnboardingScreen: nextScreen });
      
      router.push(`onboarding/${nextScreen}` as any);
    } else {
      await updateUserData({
        onboardingCompleted: true,
        onboardingCompletedAt: firestore.FieldValue.serverTimestamp(),
      });
      router.replace("/(tabs)/Connect" as any); // or wherever you want to go after onboarding
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
      
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(`onboarding/${previousScreen}` as any);
      }
    }
  };

  const navigateToScreen = async (screen: string) => {
    if (screen === "NameScreen") {
      router.replace("onboarding/LoginSignupScreen" as any);
    } else {
      await saveProgress(screen);
      router.push(`onboarding/${screen}` as any);
    }
  };
  
  const completeOnboarding = async () => {
    try {
      await updateUserData({
        onboardingCompleted: true,
        onboardingCompletedAt: firestore.FieldValue.serverTimestamp(),
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
  ) => {
    const chatRef = FIRESTORE.collection("chats").doc(chatId);
    return chatRef.onSnapshot((snap) => {
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
  ) => {
    const q = FIRESTORE
      .collection("chats")
      .where("participants", "array-contains", userId);

    return q.onSnapshot(async (snap) => {
      // Only process chats that actually exist
      const existingChats = snap.docs.filter((doc) => doc.exists);

      const detailed = await Promise.all(
        existingChats.map(async (chatSnap) => {
          const data = chatSnap.data();
          const participants: string[] = data.participants;
          const otherId = participants.find((id) => id !== userId)!;

          const userSnap = await FIRESTORE.collection("users").doc(otherId).get();
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
    const chatRef = FIRESTORE.collection("chats").doc(chatId);
    try {
      await chatRef.update({
        messages: firestore.FieldValue.arrayUnion({
          text: messageText,
          sender: senderId,
          receiver: receiverId,
          timestamp: new Date().toISOString(),
        }),
        lastMessage: messageText,
        lastMessageSender: senderId,
        lastUpdated: firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("sendMessage error:", err);
    }
};

const fetchChatMatches = async (
  userId: string
): Promise<Array<{
    userId: string;
    lastMessage: string;
    lastUpdated: Date;
    firstName?: string;
    photos?: string[];
    [key: string]: any;
  }>> => {
  console.log("fetchChatMatches called with userId:", userId);
  try {
    const chatsSnap = await FIRESTORE
      .collection("chats")
      .where("participants", "array-contains", userId)
      .get();

    const results = await Promise.all(
      chatsSnap.docs.map(async (chatSnap) => {
        const data = chatSnap.data();
        const participants: string[] = data.participants;
        const otherId = participants.find((id) => id !== userId)!;

        const userSnap = await FIRESTORE.collection("users").doc(otherId).get();
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
    const chatRef = FIRESTORE.collection("chats").doc(chatId);
    await chatRef.update({
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
      await FIRESTORE.collection("reports").add({
        reportedBy: userData.userId,
        reportedUser: reportedUserId,
        reason,
        details: details || "",
        status: "pending",
        createdAt: firestore.FieldValue.serverTimestamp(),
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
      const chatRef = FIRESTORE.collection("chats").doc(chatId);
      await chatRef.update({
        lastMessageSender: userData.userId,
      });
      // optimistic local decrement:
      setUnreadMatchesCount((c) => Math.max(0, c - 1));
    },
    [userData.userId]
  );

  // 1. Initialize matches when onboarding is completed
  useEffect(() => {
    console.log('🔄 useEffect: User state changed', {
      userId: userData.userId,
      onboardingCompleted: userData.onboardingCompleted,
      matchingInitialized
    });
    
    if (userData.userId && userData.onboardingCompleted && !matchingInitialized) {
      console.log('🚀 Triggering match initialization...');
      initializeMatches();
    }
  }, [userData.userId, userData.onboardingCompleted, matchingInitialized, initializeMatches]);

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
    loadNextPotentialMatch,
    currentMatchIndex,
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
    exclusionsLoaded
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
