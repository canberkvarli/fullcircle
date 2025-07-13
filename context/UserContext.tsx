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
    connectionIntent?: "romantic" | "friendship" | "both"; // Main connection type - now supports "both"
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
  connectionIntent?: "romantic" | "friendship" | "both";
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
  loadingNextBatch: boolean;
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
  getImageUrl: (imagePath: string) => Promise<string | null>;
  getReceivedLikesDetailed: () => Promise<any[]>;
  likesGivenCount?: number;
  reportUser: (
    userId: string,
    reason: string,
    details: string | undefined
  ) => any;
  unmatchUser: (userId: string) => any;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  deleteAccount: (reason?: string) => Promise<void>;
  loadNextMatch: () => Promise<void>;
  matchingState: {
    potentialMatches: UserDataType[];
    currentIndex: number;
    lastFetchedDoc: any;
    loadingBatch: boolean;
    noMoreMatches: boolean;
    exclusionSet: Set<string>;
    initialized: boolean;
    preferencesHash: string;
  };
  resetMatching: () => void;
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
    connectionIntent: "both",
    connectionPreferences: [],
    connectionStyles: [],
    spiritualCompatibility: {
      spiritualDraws: [],
      practices: [],
      healingModalities: [],
    },
    datePreferences: []
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
  const [chatMatches, setChatMatches] = useState<MatchType[]>([]);
  const [unreadMatchesCount, setUnreadMatchesCount] = useState(0);
  const [isLinking, setIsLinking] = useState(false);
  const userDataRef = useRef(userData);
  const router = useRouter();
  const webClientId =
    "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com";
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
  const [matchingState, setMatchingState] = useState({
    potentialMatches: [] as UserDataType[],
    currentIndex: 0,
    lastFetchedDoc: null as any,
    loadingBatch: false,
    noMoreMatches: false,
    exclusionSet: new Set<string>(),
    initialized: false,
    preferencesHash: '',
  });

  useEffect(() => {
    const subscriber = FIREBASE_AUTH.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const generatePreferencesHash = useCallback((prefs: typeof userData.matchPreferences) => {
    if (!prefs) return '';
    
    const hashData = {
      ageMin: prefs.preferredAgeRange?.min || 18,
      ageMax: prefs.preferredAgeRange?.max || 70,
      heightMin: prefs.preferredHeightRange?.min || 3,
      heightMax: prefs.preferredHeightRange?.max || 8,
      distance: prefs.preferredDistance || 100,
      connectionPreferences: [...(prefs.connectionPreferences || ["Everyone"])].sort(),
      connectionIntent: prefs.connectionIntent || 'both',
      spiritualDraws: [...(prefs.spiritualCompatibility?.spiritualDraws || [])].sort(),
      spiritualPractices: [...(prefs.spiritualCompatibility?.practices || [])].sort(),
      healingModalities: [...(prefs.spiritualCompatibility?.healingModalities || [])].sort(),
    };
    
    const hash = JSON.stringify(hashData);
    console.log('🔍 Generated preferences hash:', hash);
    return hash;
  }, []);

  const buildExclusionSet = useCallback(async (userId: string): Promise<Set<string>> => {
    if (!userId) return new Set();
    
    console.log('🚫 Building exclusion set for user:', userId);
    
    try {
      // Parallel fetch of all exclusion data
      const [likesSnap, dislikesSnap, matchesSnap, receivedLikesSnap] = await Promise.all([
        FIRESTORE.collection("users").doc(userId).collection("likesGiven").get(),
        FIRESTORE.collection("users").doc(userId).collection("dislikesGiven").get(),
        FIRESTORE.collection("users").doc(userId).collection("matches").get(),
        FIRESTORE.collection("users").doc(userId).collection("likesReceived").get(),
      ]);
      
      const exclusions = new Set<string>([
        userId,
        ...likesSnap.docs.map(doc => doc.id),
        ...dislikesSnap.docs.map(doc => doc.id),
        ...matchesSnap.docs.map(doc => doc.id),
        ...receivedLikesSnap.docs.map(doc => doc.id),
      ]);

      console.log('🚫 Exclusion set includes self?', exclusions.has(userId));
      console.log('🚫 Excluded user IDs:', Array.from(exclusions));

          
      console.log(`🚫 Built exclusion set: ${exclusions.size} users excluded`);
      return exclusions;
      
    } catch (error) {
      console.error('❌ Error building exclusion set:', error);
      return new Set([userId]); // Fallback to just excluding self
    }
  }, []);

  const buildMatchQuery = useCallback((
    exclusionSet: Set<string>,
    lastDoc: any = null,
    batchSize: number = 20
  ) => {
    console.log('🔍 Building simple query with user preferences:', {
      ageRange: userData.matchPreferences?.preferredAgeRange,
      connectionPrefs: userData.matchPreferences?.connectionPreferences,
      connectionIntent: userData.matchPreferences?.connectionIntent,
      exclusionCount: exclusionSet.size
    });

    const baseCollection = FIRESTORE.collection("users");
    
    // Start with basic requirements
    let query = baseCollection.where("onboardingCompleted", "==", true);

    const prefs = userData.matchPreferences;
    
    // 🎯 ONLY apply age filter in Firestore if it's specific (not default range)
    if (prefs?.preferredAgeRange?.min && prefs?.preferredAgeRange?.max && 
        !(prefs.preferredAgeRange.min === 18 && prefs.preferredAgeRange.max === 70)) {
      
      console.log(`🔍 Applying Firestore age filter: ${prefs.preferredAgeRange.min}-${prefs.preferredAgeRange.max}`);
      
      query = query
        .where("age", ">=", prefs.preferredAgeRange.min)
        .where("age", "<=", prefs.preferredAgeRange.max)
        .orderBy("age", "asc")
        .limit(batchSize);
    } else {
      // No specific age filter, use creation date ordering
      console.log('🔍 No specific age filter, showing all ages');
      query = query.orderBy("createdAt", "desc").limit(batchSize);
    }

    // Add pagination
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    return query;
  }, [userData.matchPreferences]);

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

  const currentPotentialMatch = useMemo(() => {
    const match = matchingState.potentialMatches[matchingState.currentIndex] || null;
    console.log('🎯 currentPotentialMatch computed:', {
      totalMatches: matchingState.potentialMatches.length,
      currentIndex: matchingState.currentIndex,
      matchId: match?.userId,
      matchName: match?.firstName,
      match: match ? 'Found' : 'NULL'
    });
    return match;
  }, [matchingState.potentialMatches, matchingState.currentIndex]);

  console.log('🔍 useMemo debug:', {
    matchingStatePotentialMatches: matchingState.potentialMatches?.length || 0,
    matchingStateCurrentIndex: matchingState.currentIndex,
    calculatedMatch: matchingState.potentialMatches?.[matchingState.currentIndex]?.userId || 'NONE',
    useMemoResult: currentPotentialMatch?.userId || 'NONE'
  });

  const applySpiritualFilter = useCallback((user: UserDataType): { passes: boolean; score: number; reason?: string } => {
    const userSpiritualPrefs = userData.matchPreferences?.spiritualCompatibility;
    const candidateProfile = user.spiritualProfile;
    
    // 🎯 DEFAULT BEHAVIOR: If user has NO spiritual preferences, show everyone
    if (!userSpiritualPrefs || 
        (!userSpiritualPrefs.spiritualDraws?.length && 
        !userSpiritualPrefs.practices?.length && 
        !userSpiritualPrefs.healingModalities?.length)) {
      console.log(`✅ ${user.firstName} - User has no spiritual preferences (showing everyone)`);
      return { passes: true, score: 0 };
    }
    
    // 🎯 NEW: If user has "Open to All" in any category, show everyone for that category
    const hasOpenToAllPractices = userSpiritualPrefs.practices?.includes("Open to All");
    const hasOpenToAllDraws = userSpiritualPrefs.spiritualDraws?.includes("Open to All");
    const hasOpenToAllHealing = userSpiritualPrefs.healingModalities?.includes("Open to All");
    
    // If ALL categories are "Open to All", show everyone
    if (hasOpenToAllPractices && hasOpenToAllDraws && hasOpenToAllHealing) {
      console.log(`✅ ${user.firstName} - User is open to all spiritual preferences (showing everyone)`);
      return { passes: true, score: 0 };
    }
    
    // If user has only "Open to All" selections (no specific preferences), show everyone
    const hasSpecificPractices = userSpiritualPrefs.practices?.length && !hasOpenToAllPractices;
    const hasSpecificDraws = userSpiritualPrefs.spiritualDraws?.length && !hasOpenToAllDraws;
    const hasSpecificHealing = userSpiritualPrefs.healingModalities?.length && !hasOpenToAllHealing;
    
    if (!hasSpecificPractices && !hasSpecificDraws && !hasSpecificHealing) {
      console.log(`✅ ${user.firstName} - User has only 'Open to All' preferences (showing everyone)`);
      return { passes: true, score: 0 };
    }
    
    // 🎯 If candidate has NO spiritual profile, they pass (open to all)
    if (!candidateProfile || 
        (!candidateProfile.draws?.length && 
        !candidateProfile.practices?.length && 
        !candidateProfile.healingModalities?.length)) {
      console.log(`✅ ${user.firstName} - No spiritual profile (open to all)`);
      return { passes: true, score: 0 };
    }
    
    // 🔮 DETAILED COMPATIBILITY SCORING (only for specific preferences)
    let score = 0;
    let totalCategories = 0;
    const matchDetails: string[] = [];
    
    // Check spiritual draws compatibility (only if user has specific draws preferences)
    if (hasSpecificDraws && candidateProfile.draws?.length) {
      const commonDraws = userSpiritualPrefs.spiritualDraws!.filter(draw => 
        draw !== "Open to All" && candidateProfile?.draws?.includes(draw)
      );
      
      if (commonDraws.length > 0) {
        score += 1;
        matchDetails.push(`Draws: ${commonDraws.join(', ')}`);
      }
      totalCategories += 1;
      
      console.log(`🔮 ${user.firstName} - Draws check: ${commonDraws.length > 0 ? '✅' : '❌'} (${commonDraws.join(', ')})`);
    }
    
    // Check practices compatibility (only if user has specific practices preferences)
    if (hasSpecificPractices && candidateProfile.practices?.length) {
      const commonPractices = userSpiritualPrefs.practices!.filter(practice =>
        practice !== "Open to All" && candidateProfile?.practices?.includes(practice)
      );
      
      if (commonPractices.length > 0) {
        score += 1;
        matchDetails.push(`Practices: ${commonPractices.join(', ')}`);
      }
      totalCategories += 1;
      
      console.log(`🔮 ${user.firstName} - Practices check: ${commonPractices.length > 0 ? '✅' : '❌'} (${commonPractices.join(', ')})`);
    }
    
    // Check healing modalities compatibility (only if user has specific healing preferences)
    if (hasSpecificHealing && candidateProfile.healingModalities?.length) {
      const commonModalities = userSpiritualPrefs.healingModalities!.filter(modality =>
        modality !== "Open to All" && candidateProfile?.healingModalities?.includes(modality)
      );
      
      if (commonModalities.length > 0) {
        score += 1;
        matchDetails.push(`Healing: ${commonModalities.join(', ')}`);
      }
      totalCategories += 1;
      
      console.log(`🔮 ${user.firstName} - Healing modalities check: ${commonModalities.length > 0 ? '✅' : '❌'} (${commonModalities.join(', ')})`);
    }
    
    const compatibilityScore = totalCategories > 0 ? score / totalCategories : 0;
    
    // 🎯 COMPATIBILITY LOGIC
    if (totalCategories === 0) {
      // User has spiritual preferences but candidate has no matching categories
      console.log(`✅ ${user.firstName} - No overlapping spiritual categories (showing anyway)`);
      return { passes: true, score: 0 };
    }
    
    // Must have at least ONE shared spiritual interest (or be open to all)
    const passes = score > 0;
    
    if (passes) {
      console.log(`✅ ${user.firstName} - Spiritual match! Score: ${(compatibilityScore * 100).toFixed(0)}% (${matchDetails.join('; ')})`);
    } else {
      console.log(`❌ ${user.firstName} - No spiritual compatibility`);
    }
    
    return { 
      passes, 
      score: compatibilityScore,
      reason: passes ? matchDetails.join('; ') : 'No shared spiritual interests'
    };
  }, [userData.matchPreferences]);

  const applyAllFilters = useCallback((users: UserDataType[]): UserDataType[] => {
    const prefs = userData.matchPreferences;
    
    console.log(`🔍 Starting client-side filtering on ${users.length} users`);
    console.log('🔍 User preferences for filtering:', {
      ageRange: prefs?.preferredAgeRange,
      connectionIntent: prefs?.connectionIntent,
      connectionPreferences: prefs?.connectionPreferences,
      preferredDistance: prefs?.preferredDistance,
      spiritualPrefs: prefs?.spiritualCompatibility // 🔮 NEW
    });

    const filteredUsers = users.filter(user => {
      // 1. 🚫 EXCLUSION CHECK
      if (matchingState.exclusionSet.has(user.userId)) {
        console.log(`❌ ${user.firstName} - Already excluded`);
        return false;
      }

      // 2. 🎯 AGE FILTER (Most Important - Apply Strictly)
      if (prefs?.preferredAgeRange?.min && prefs?.preferredAgeRange?.max) {
        const userAge = user.age;
        
        if (!userAge || userAge < prefs.preferredAgeRange.min || userAge > prefs.preferredAgeRange.max) {
          console.log(`❌ ${user.firstName} (age ${userAge}) - Outside age range ${prefs.preferredAgeRange.min}-${prefs.preferredAgeRange.max}`);
          return false;
        }
        
        console.log(`✅ ${user.firstName} (age ${userAge}) - Within age range ${prefs.preferredAgeRange.min}-${prefs.preferredAgeRange.max}`);
      }

      // 3. 🎯 GENDER/CONNECTION PREFERENCES
      if (prefs?.connectionPreferences?.length && !prefs.connectionPreferences.includes("Everyone")) {
        const userGender = Array.isArray(user.gender) ? user.gender[0] : user.gender;
        
        const genderMap: Record<string, string> = {
          "Man": "Men",
          "Woman": "Women", 
          "Non-binary": "Non-Binary"
        };
        
        const expectedPreference = genderMap[userGender as string];
        
        if (!prefs.connectionPreferences.includes(expectedPreference)) {
          console.log(`❌ ${user.firstName} (${userGender}) - Not in connection preferences [${prefs.connectionPreferences.join(', ')}]`);
          return false;
        }
        
        console.log(`✅ ${user.firstName} (${userGender}) - Matches connection preferences`);
      }

      // 4. 🎯 CONNECTION INTENT COMPATIBILITY
      if (prefs?.connectionIntent && prefs.connectionIntent !== "both") {
        const userIntent = user.matchPreferences?.connectionIntent || "both";
        
        let compatible = false;
        
        if (prefs.connectionIntent === "romantic") {
          compatible = userIntent === "romantic" || userIntent === "both";
        } else if (prefs.connectionIntent === "friendship") {
          compatible = userIntent === "friendship" || userIntent === "both";
        }
        
        if (!compatible) {
          console.log(`❌ ${user.firstName} - Intent mismatch: User wants "${prefs.connectionIntent}", they want "${userIntent}"`);
          return false;
        }
        
        console.log(`✅ ${user.firstName} - Intent compatible: User wants "${prefs.connectionIntent}", they want "${userIntent}"`);
      }

      // 5. 🔮 NEW: SPIRITUAL COMPATIBILITY FILTER
      const spiritualResult = applySpiritualFilter(user);
      if (!spiritualResult.passes) {
        return false;
      }
      
      // Store spiritual score for sorting
      (user as any)._spiritualScore = spiritualResult.score;
      (user as any)._spiritualReason = spiritualResult.reason;

      // 6. 🎯 DISTANCE FILTER
      if (prefs?.preferredDistance && userData.latitude && userData.longitude && user.latitude && user.longitude) {
        const distance = calculateHaversineDistance(
          userData.latitude,
          userData.longitude,
          user.latitude,
          user.longitude
        );
        
        if (distance > prefs.preferredDistance) {
          console.log(`❌ ${user.firstName} - Too far: ${distance.toFixed(1)} miles > ${prefs.preferredDistance} miles`);
          return false;
        }
        
        console.log(`✅ ${user.firstName} - Within distance: ${distance.toFixed(1)} miles <= ${prefs.preferredDistance} miles`);
      }

      // 7. 🎯 HEIGHT FILTER (if specified)
      if (prefs?.preferredHeightRange?.min && prefs?.preferredHeightRange?.max && user.height) {
        if (user.height < prefs.preferredHeightRange.min || user.height > prefs.preferredHeightRange.max) {
          console.log(`❌ ${user.firstName} - Height ${user.height} outside range ${prefs.preferredHeightRange.min}-${prefs.preferredHeightRange.max}`);
          return false;
        }
      }

      console.log(`✅ ${user.firstName} (age ${user.age}) - PASSED ALL FILTERS`);
      return true;
    });

    // 🔮 SORT BY SPIRITUAL COMPATIBILITY SCORE (highest first)
    const sortedUsers = filteredUsers.sort((a, b) => {
      const scoreA = (a as any)._spiritualScore || 0;
      const scoreB = (b as any)._spiritualScore || 0;
      return scoreB - scoreA; // Higher spiritual compatibility first
    });

    console.log(`📊 FINAL FILTERED USERS: ${sortedUsers.length} out of ${users.length} raw users`);
    
    // 🔮 Log top spiritual matches
    if (sortedUsers.length > 0) {
      console.log('🔮 Top spiritual matches:');
      sortedUsers.slice(0, 3).forEach((user, index) => {
        const score = (user as any)._spiritualScore || 0;
        const reason = (user as any)._spiritualReason || 'No spiritual data';
        console.log(`  ${index + 1}. ${user.firstName} (${(score * 100).toFixed(0)}% spiritual match: ${reason})`);
      });
    }

    return sortedUsers;
  }, [userData.matchPreferences, userData.latitude, userData.longitude, matchingState.exclusionSet, applySpiritualFilter]);


  const fetchPotentialMatches = useCallback(async (
    resetBatch: boolean = false,
    overrideExclusions?: Set<string>
  ): Promise<UserDataType[]> => {
    
    if (matchingState.loadingBatch) {
      console.log('⏸️ Already loading, skipping fetch');
      return [];
    }
    
    console.log('🔍 === FETCHING POTENTIAL MATCHES ===');
    console.log('🔍 Reset batch:', resetBatch);
    console.log('🔍 Current user preferences:', userData.matchPreferences);
    
    setMatchingState(prev => ({ ...prev, loadingBatch: true }));
    
    try {
      const exclusionsToUse = overrideExclusions || matchingState.exclusionSet;
      const lastDoc = resetBatch ? null : matchingState.lastFetchedDoc;
      
      console.log('🔍 Exclusions:', Array.from(exclusionsToUse));
      
      // Build and execute query
      const query = buildMatchQuery(exclusionsToUse, lastDoc, 30); // Fetch more for filtering
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        console.log('📭 No more users found in Firestore');
        setMatchingState(prev => ({ 
          ...prev, 
          loadingBatch: false, 
          noMoreMatches: true 
        }));
        return [];
      }
      
      // Convert Firestore docs to user objects
      const rawUsers = snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      } as UserDataType));
      
      console.log(`📊 Raw users from Firestore: ${rawUsers.length}`);
      console.log('📊 Sample raw users:', rawUsers.slice(0, 3).map(u => `${u.firstName} (age: ${u.age})`));
      
      // Apply all client-side filters
      const filteredUsers = applyAllFilters(rawUsers);
      
      console.log(`📊 FINAL FILTERED USERS: ${filteredUsers.length} out of ${rawUsers.length} raw users`);
      console.log('📊 Final users:', filteredUsers.map(u => `${u.firstName} (age: ${u.age})`));
      
      // Update pagination state
      const newLastDoc = snapshot.docs.length > 0 ? 
        snapshot.docs[snapshot.docs.length - 1] : null;
      
      setMatchingState(prev => ({
        ...prev,
        lastFetchedDoc: newLastDoc,
        loadingBatch: false,
        noMoreMatches: filteredUsers.length === 0
      }));
      
      return filteredUsers;
      
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      setMatchingState(prev => ({ 
        ...prev, 
        loadingBatch: false, 
        noMoreMatches: true 
      }));
      return [];
    }
  }, [matchingState.exclusionSet, matchingState.lastFetchedDoc, matchingState.loadingBatch, buildMatchQuery, applyAllFilters]);


  useEffect(() => {
    const initializeMatching = async () => {
      if (!userData.userId || 
          !userData.onboardingCompleted || 
          matchingState.initialized) {
        return;
      }
      
      console.log('🚀 Initializing matching system...');
      
      try {
        // Build exclusion set
        const exclusions = await buildExclusionSet(userData.userId);
        console.log('🚫 Final exclusion set:', Array.from(exclusions));
        
        // Generate preferences hash
        const preferencesHash = generatePreferencesHash(userData.matchPreferences);
        
        // 🔥 CRITICAL FIX: Fetch initial batch BEFORE updating state
        console.log('🔄 Fetching initial batch with exclusion set...');
        const initialBatch = await fetchPotentialMatches(true, exclusions); // ✅ Now this works!
        
        // Update state with everything at once
        setMatchingState(prev => ({
          ...prev,
          exclusionSet: exclusions,
          preferencesHash,
          initialized: true,
          potentialMatches: initialBatch,  // Set the fetched matches
          currentIndex: 0,
          lastFetchedDoc: null,
          noMoreMatches: initialBatch.length === 0
        }));
        
        console.log(`🎉 Initialization complete with ${initialBatch.length} matches`);
        
      } catch (error) {
        console.error('❌ Error initializing matching:', error);
      }
    };
    
    initializeMatching();
  }, [userData.userId, userData.onboardingCompleted, fetchPotentialMatches]); // ✅ Add fetchPotentialMatches to deps


  const debouncedPreferencesUpdate = useCallback(
    debounce(async (newPreferences: typeof userData.matchPreferences) => {
      if (!userData.userId || !matchingState.initialized) return;
      
      const newHash = generatePreferencesHash(newPreferences);
      
      if (newHash !== matchingState.preferencesHash) {
        console.log('🔄 === PREFERENCES CHANGED - COMPLETE RESET ===');
        console.log('🔄 Old hash:', matchingState.preferencesHash);
        console.log('🔄 New hash:', newHash);
        console.log('🔄 New preferences:', newPreferences);
        
        // COMPLETE RESET - Clear everything
        setMatchingState(prev => ({
          ...prev,
          preferencesHash: newHash,
          potentialMatches: [],      // Clear all matches
          currentIndex: 0,           // Reset to first
          lastFetchedDoc: null,      // Reset pagination
          noMoreMatches: false       // Reset no-more flag
        }));
        
        // Wait a moment for state to update, then fetch fresh
        setTimeout(async () => {
          console.log('🔄 Fetching fresh matches with new preferences...');
          const newBatch = await fetchPotentialMatches(true); // Force reset
          
          setMatchingState(prev => ({
            ...prev,
            potentialMatches: newBatch
          }));
          
          console.log(`🔄 Loaded ${newBatch.length} new matches with updated preferences`);
        }, 100);
      }
    }, 1000), // 1 second debounce to ensure preferences are fully saved
    [userData.userId, matchingState.initialized, matchingState.preferencesHash, fetchPotentialMatches]
  );

  useEffect(() => {
    if (userData.matchPreferences && matchingState.initialized) {
      debouncedPreferencesUpdate(userData.matchPreferences);
    }
  }, [userData.matchPreferences, debouncedPreferencesUpdate]);

  const resetMatching = useCallback(() => {
    console.log('🔄 Manual reset of matching system');
    
    // 🔧 FIX: Always keep your own userId in exclusionSet during reset
    const baseExclusionSet = new Set<string>();
    if (userData.userId) {
      baseExclusionSet.add(userData.userId);
      console.log('🚫 Preserving self-exclusion during reset:', userData.userId);
    }
    
    setMatchingState({
      potentialMatches: [],
      currentIndex: 0,
      lastFetchedDoc: null,
      loadingBatch: false,
      noMoreMatches: false,
      exclusionSet: baseExclusionSet, // ✅ Start with self excluded instead of empty Set()
      initialized: false,
      preferencesHash: '',
    });
  }, [userData.userId]); // Add userData.userId as dependency

  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const loadNextMatch = useCallback(async () => {
    const { potentialMatches, currentIndex, exclusionSet } = matchingState;
    
    console.log(`➡️ Loading next match. Current index: ${currentIndex}, Total: ${potentialMatches.length}`);
    
    // 🔧 FIX: Filter out any newly excluded users from current batch
    const validMatches = potentialMatches.filter(match => !exclusionSet.has(match.userId));
    
    console.log(`🔍 Valid remaining matches: ${validMatches.length} (filtered from ${potentialMatches.length})`);
    
    // Find next valid match from current position
    let nextValidIndex = -1;
    for (let i = currentIndex + 1; i < validMatches.length; i++) {
      if (!exclusionSet.has(validMatches[i].userId)) {
        nextValidIndex = i;
        break;
      }
    }
    
    if (nextValidIndex !== -1) {
      console.log(`📋 Moving to next valid match at index ${nextValidIndex}`);
      setMatchingState(prev => ({
        ...prev,
        currentIndex: nextValidIndex,
        potentialMatches: validMatches  // Update with filtered list
      }));
      return;
    }
    
    // 🔧 FIX: Need to fetch more matches with current exclusions
    console.log('🔄 Need to fetch more matches with updated exclusions');
    
    const PREFETCH_THRESHOLD = 3;
    if (validMatches.length - currentIndex <= PREFETCH_THRESHOLD) {
      const newBatch = await fetchPotentialMatches(false);
      
      if (newBatch.length > 0) {
        console.log(`📦 Adding ${newBatch.length} new matches to batch`);
        setMatchingState(prev => ({
          ...prev,
          potentialMatches: [...validMatches, ...newBatch],
          currentIndex: currentIndex + 1
        }));
      } else {
        console.log('📭 No more matches available');
        setMatchingState(prev => ({ ...prev, noMoreMatches: true }));
      }
    } else {
      setMatchingState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        potentialMatches: validMatches
      }));
    }
  }, [matchingState, fetchPotentialMatches]);


  const optimizedLikeMatch = useCallback(async (matchId: string) => {
    console.log(`❤️ OPTIMIZED LIKING USER: ${matchId}`);
    
    try {
      console.log(`🚫 Adding ${matchId} to exclusion set BEFORE like action`);
      
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, matchId]);
        console.log(`🚫 New exclusion set size: ${newExclusionSet.size}`);
        console.log(`🚫 New exclusions include:`, Array.from(newExclusionSet));
        
        return {
          ...prev,
          exclusionSet: newExclusionSet
        };
      });
      
      // Perform like action
      await recordLikeWithBatch(userData.userId, matchId, false);
      
      // Move to next match
      await loadNextMatch();
      
      console.log(`✅ Optimized like completed for ${matchId}`);
      
    } catch (error) {
      console.error('❌ Error in optimized like:', error);
      
      setMatchingState(prev => {
        const newSet = new Set(prev.exclusionSet);
        newSet.delete(matchId);
        console.log(`🔄 Rolled back exclusion for ${matchId}`);
        return { ...prev, exclusionSet: newSet };
      });
      
      throw error;
    }
  }, [userData.userId, loadNextMatch]);


  const optimizedDislikeMatch = useCallback(async (matchId: string) => {
    console.log(`👎 OPTIMIZED DISLIKING USER: ${matchId}`); // 🔧 Added "OPTIMIZED"
    
    try {
      // 🔧 FIX: Add detailed logging like likeMatch
      console.log(`🚫 Adding ${matchId} to exclusion set BEFORE dislike action`);
      
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, matchId]);
        console.log(`🚫 New exclusion set size: ${newExclusionSet.size}`);
        console.log(`🚫 New exclusions include:`, Array.from(newExclusionSet));
        
        return {
          ...prev,
          exclusionSet: newExclusionSet
        };
      });
      
      // Perform dislike action
      await recordDislikeWithBatch(userData.userId, matchId);
      
      // Move to next match
      await loadNextMatch();
      
      console.log(`✅ Optimized dislike completed for ${matchId}`); // 🔧 Added completion log
      
    } catch (error) {
      console.error('❌ Error disliking match:', error);
      
      // 🔧 FIX: Add detailed rollback logging
      setMatchingState(prev => {
        const newSet = new Set(prev.exclusionSet);
        newSet.delete(matchId);
        console.log(`🔄 Rolled back exclusion for ${matchId}`);
        return { ...prev, exclusionSet: newSet };
      });
      
      throw error;
    }
  }, [userData.userId, loadNextMatch]);


  const optimizedOrbLike = useCallback(async (matchId: string) => {
    console.log(`✨ OPTIMIZED ORB LIKING USER: ${matchId}`); // 🔧 Added "OPTIMIZED"
    
    try {
      // Check orb availability first
      if (!userData.numOfOrbs || userData.numOfOrbs <= 0) {
        throw new Error("No orbs available");
      }
      
      // 🔧 FIX: Add detailed logging like other functions
      console.log(`🚫 Adding ${matchId} to exclusion set BEFORE orb like action`);
      
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, matchId]);
        console.log(`🚫 New exclusion set size: ${newExclusionSet.size}`);
        console.log(`🚫 New exclusions include:`, Array.from(newExclusionSet));
        
        return {
          ...prev,
          exclusionSet: newExclusionSet
        };
      });
      
      // Perform orb like action
      await recordLikeWithBatch(userData.userId, matchId, true);
      
      // Update user data to reflect orb usage
      setUserData(prev => ({
        ...prev,
        numOfOrbs: (prev.numOfOrbs || 0) - 1
      }));
      
      // Move to next match
      await loadNextMatch();
      
      console.log(`✅ Optimized orb like completed for ${matchId}`); // 🔧 Added completion log
      
    } catch (error: any) {
      console.error('❌ Error orb liking match:', error);
      
      // 🔧 FIX: Add detailed rollback logging
      setMatchingState(prev => {
        const newSet = new Set(prev.exclusionSet);
        newSet.delete(matchId);
        console.log(`🔄 Rolled back exclusion for ${matchId}`);
        return { ...prev, exclusionSet: newSet };
      });
      
      // Rollback orb count if it was decremented
      if (error.message !== "No orbs available") {
        setUserData(prev => ({
          ...prev,
          numOfOrbs: (prev.numOfOrbs || 0) + 1
        }));
        console.log(`🔄 Rolled back orb count`); // 🔧 Added rollback log
      }
      
      throw error;
    }
  }, [userData.userId, userData.numOfOrbs, loadNextMatch]);


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

  // In your getImageUrl function, add better error handling:
  const getImageUrl = useCallback(
    async (imagePath: string): Promise<string | null> => {
      if (!imagePath) return null;
      
      // 1) http URLs: just forward & resolve via STORAGE.refFromURL
      if (imagePath.startsWith("http")) {
        return STORAGE.refFromURL(imagePath)
          .getDownloadURL()
          .catch((err) => {
            console.warn("Image not found:", imagePath);
            return null; // Return null instead of throwing
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
          console.warn("Image not found:", imagePath);
          imageCache[imagePath] = Promise.resolve(null); // Cache the failure
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


  const deleteAccount = async (reason?: string) => {
    if (!userData.userId || !currentUser) {
      throw new Error("No user logged in");
    }

    try {
      const userId = userData.userId;
      
      // 1. Create a batch for atomic operations
      const batch = FIRESTORE.batch();
      
      // 2. Log the deletion reason if provided
      if (reason) {
        const deletionLogRef = FIRESTORE.collection("deletionLogs").doc();
        
        // Calculate account age safely
        let accountAge = null;
        if (userData.createdAt && userData.createdAt.toDate) {
          try {
            accountAge = new Date().getTime() - userData.createdAt.toDate().getTime();
          } catch (dateError) {
            console.warn("Error calculating account age:", dateError);
          }
        }
        
        batch.set(deletionLogRef, {
          userId: userId,
          reason: reason,
          deletedAt: firestore.FieldValue.serverTimestamp(),
          userEmail: userData.email,
          accountAge: accountAge,
        });
      }
      
      // 3. Get user's matches to clean up related data
      const userMatches = userData.matches || [];
      
      // 4. Clean up matches and conversations
      for (const matchId of userMatches) {
        try {
          // Remove from other user's matches array
          const otherUserRef = FIRESTORE.collection("users").doc(matchId);
          batch.update(otherUserRef, {
            matches: firestore.FieldValue.arrayRemove(userId),
          });
          
          // Delete match records
          const matchDocRef = FIRESTORE.collection("users").doc(matchId).collection("matches").doc(userId);
          batch.delete(matchDocRef);
          
          const myMatchDocRef = FIRESTORE.collection("users").doc(userId).collection("matches").doc(matchId);
          batch.delete(myMatchDocRef);
          
          // Delete chat if exists
          const chatId = [userId, matchId].sort().join("_");
          const chatRef = FIRESTORE.collection("chats").doc(chatId);
          batch.delete(chatRef);
        } catch (matchError) {
          console.warn(`Error cleaning up match ${matchId}:`, matchError);
          // Continue with other matches
        }
      }
      
      // 5. Delete user's subcollections
      const subcollections = [
        "matches", 
        "likesGiven", 
        "likesReceived", 
        "reports"
      ];
      
      for (const subcollection of subcollections) {
        try {
          const subcollectionSnapshot = await FIRESTORE.collection("users")
            .doc(userId)
            .collection(subcollection)
            .get();
          
          subcollectionSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
          });
        } catch (subcollectionError) {
          console.warn(`Error deleting ${subcollection}:`, subcollectionError);
          // Continue with other subcollections
        }
      }
      
      // 6. Delete user's photos from storage (with better error handling)
      if (userData.photos && userData.photos.length > 0) {
        for (const photoUrl of userData.photos) {
          try {
            // Only try to delete if it's actually a Firebase storage URL
            if (photoUrl && photoUrl.includes("firebasestorage.googleapis.com")) {
              const photoRef = STORAGE.refFromURL(photoUrl);
              await photoRef.delete();
              console.log(`Deleted photo: ${photoUrl}`);
            }
          } catch (storageError: any) {
            // Log but don't fail the entire deletion for missing photos
            if (storageError.code === 'storage/object-not-found') {
              console.warn(`Photo already deleted or not found: ${photoUrl}`);
            } else {
              console.warn(`Error deleting photo ${photoUrl}:`, storageError);
            }
          }
        }
      }
      
      // 7. Delete the main user document
      const userDocRef = FIRESTORE.collection("users").doc(userId);
      batch.delete(userDocRef);
      
      // 8. Commit all Firestore deletions
      await batch.commit();
      console.log("Firestore data deleted successfully");
      
      // 9. Delete Firebase Auth account
      await currentUser.delete();
      console.log("Firebase Auth account deleted successfully");
      
      // 10. Clear local state
      setUserData(initialUserData);
      setCurrentUser(null);
      
      // 11. Sign out from Google if connected
      if (userData.GoogleSSOEnabled) {
        try {
          await GoogleSignin.signOut();
        } catch (googleError) {
          console.warn("Error signing out from Google:", googleError);
        }
      }
      
      console.log("Account successfully deleted");
      
      // 12. Navigate to login screen
      router.navigate("onboarding/LoginSignupScreen" as any);
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      
      // Provide specific error messages based on the error type
      if (error.code === 'auth/requires-recent-login') {
        throw new Error("For security, please log out and log back in within the last few minutes, then try deleting your account again.");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to delete account. Please try again later.");
      }
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
    fetchUserById,
    getIdToken,
    currentUser,
    setCurrentUser,
    signOut,
    completeOnboarding,
    likeMatch: optimizedLikeMatch,
    dislikeMatch: optimizedDislikeMatch,
    orbLike: optimizedOrbLike,
    loadNextMatch,
    getReceivedLikesDetailed,
    createOrFetchChat,
    subscribeToChatMessages,
    subscribeToChatMatches,
    subscribeToReceivedLikes,
    sendMessage,
    markChatAsRead,
    fetchChatMatches,
    chatMatches,
    markMatchAsRead,
    unreadMatchesCount,
    reportUser,
    unmatchUser,
    updateUserSettings,
    deleteAccount,
    getImageUrl,
    verifyPhoneAndSetUser,
    handleGoogleSignIn,
    matchingState,
    resetMatching,
    currentPotentialMatch,
    likesGivenCount: userData.likesGivenCount,
    loadingNextBatch: matchingState.loadingBatch,
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
