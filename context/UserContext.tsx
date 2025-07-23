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
import { FIREBASE_AUTH, FIRESTORE, STORAGE, FUNCTIONS } from "@/services/FirebaseConfig";
import auth from "@react-native-firebase/auth";

import firestore, { 
  FirebaseFirestoreTypes 
} from "@react-native-firebase/firestore";
import { Alert } from "react-native";

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
  
  subscription?: {
    isActive: boolean; // True when user is receiving premium benefits
    stripeCustomerId?: string;
    subscriptionId?: string;
    status?: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired';
    planType?: 'monthly' | 'yearly';
    currentPeriodStart?: number; // Unix timestamp
    currentPeriodEnd?: number; // Unix timestamp
    cancelAtPeriodEnd?: boolean;
    canceledAt?: number; // Unix timestamp
    createdAt?: any;
    updatedAt?: any;
  };
  
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
    connectionIntent?: "romantic" | "friendship" | "both";
    connectionPreferences?: string[];
    connectionStyles?: string[];
    spiritualCompatibility?: {
      spiritualDraws?: string[];
      practices?: string[];
      healingModalities?: string[];
    };
    datePreferences: string[]; // Keep for backward compatibility
  };
  
  dailyLikesCount?: number;
  lastLikeResetDate?: any;
  DAILY_LIKE_LIMIT?: number;
  settings?: UserSettings;
  activeBoosts?: number;
  boostExpiresAt?: any;
  boostPurchases?: BoostPurchase[];
  reportedUsers?: string[];
  unmatchedUsers?: string[];
};

export interface BoostPurchase {
  boostCount: number;
  totalPrice: number;
  purchaseDate: any;
  transactionId: string;
  stripePaymentIntentId?: string;
  status: 'succeeded' | 'processing' | 'failed'; 
}

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

interface PaymentResult {
  success: boolean;
  boostCount: number;
  totalPrice: number;
  transactionId: string;
}

type SubscriptionStatus = {
  hasSubscription: boolean;
  isActive: boolean; // Currently receiving benefits
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | null;
  planType: 'monthly' | 'yearly' | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  daysRemaining: number;
  cancelAtPeriodEnd: boolean;
  canReactivate: boolean;
  subscriptionId?: string | null;
};

type SubscriptionInfo = {
  hasSubscription: boolean;
  isActive: boolean;
  displayText: string;
  timeRemaining: string | null;
  canUpgrade: boolean;
  canCancel: boolean;
  canReactivate: boolean;
  planType: 'monthly' | 'yearly' | null | undefined;
  daysRemaining: number;
};

interface SubscriptionResponse {
  clientSecret: string;
  subscriptionId: string;
  status: string;
}

interface CancelResponse {
  status: string;
  cancelAt: number;
}

interface ReactivateResponse {
  success: boolean;
  status: string;
  message: string;
}

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
  viaRadiance?: boolean;
  timestamp: any;
}

export interface DislikeRecord {
  matchId: string;
  timestamp: any;
}

export interface ReportRecord {
  reportedUserId: string;
  reason: string;
  details?: string;
  timestamp: any;
}

export interface UnmatchRecord {
  unmatchedUserId: string;
  timestamp: any;
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
  getRemainingDailyLikes: () => number;
  DAILY_LIKE_LIMIT: number;
  getSubscriptionStatus: () => Promise<SubscriptionStatus>;
  createSubscription: (planType: 'monthly' | 'yearly') => Promise<SubscriptionResponse>;
  getSubscriptionInfo: (userData: UserDataType) => SubscriptionInfo;
  cancelSubscription: () => Promise<{ status: string; cancelAt: number }>;
  reactivateSubscription: () => Promise<ReactivateResponse>;
  
  // 🔥 Radiance/Boost Functions
  purchaseRadiance: (boostCount: number) => Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }>;
  confirmRadiancePayment: (paymentIntentId: string) => Promise<{
    success: boolean;
    boostCount: number;
    totalPrice: number;
  }>;
  activateRadiance: () => Promise<void>;
  getRadianceTimeRemaining: () => number;
  hasActiveRadiance: (userData: UserDataType) => boolean;
  getRadianceStatus: () => {
    isActive: boolean;
    timeRemaining: number;
    expiresAt: any;
    formattedTime: string | null;
  };
  formatRadianceTime: (seconds: number) => string;
  isUserBoosted: (userData: UserDataType) => boolean;
  isUserRecentlyActive: (userData: UserDataType) => boolean;
  
  // 🧪 Testing Functions (remove in production)
  createRadiancePaymentIntent: any;
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
  lastOrbAssignedAt: null,
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
  
  // Boosts & Engagement
  activeBoosts: 0,
  boostExpiresAt: null, 
  boostPurchases: [],
  dailyLikesCount: 0,
  lastLikeResetDate: null,
  DAILY_LIKE_LIMIT: 8,
  reportedUsers: [],
  unmatchedUsers: [],
  
  // Match Preferences
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
    datePreferences: [] // Keep for backward compatibility
  },
  
  // Settings
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
  const userDataRef = useRef<UserDataType>(userData);
  const router = useRouter();
  const webClientId =
    "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com";
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });
  const matchingStateRef = useRef<typeof matchingState>({
    potentialMatches: [],
    currentIndex: 0,
    lastFetchedDoc: null,
    loadingBatch: false,
    noMoreMatches: false,
    exclusionSet: new Set<string>(),
    initialized: false,
    preferencesHash: '',
  });
  const DAILY_LIKE_LIMIT = 8;

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
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    matchingStateRef.current = matchingState;
  }, [matchingState]);

  useEffect(() => {
    const subscriber = FIREBASE_AUTH.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const buildExclusionSet = useCallback(async (userId: string): Promise<Set<string>> => {
    if (!userId) return new Set();
    
    console.log('🚫 Building comprehensive exclusion set for user:', userId);
    
    try {
      // 🔄 ENHANCED: Parallel fetch of ALL exclusion data including reports and unmatches
      const [
        likesSnap, 
        dislikesSnap, 
        matchesSnap, 
        receivedLikesSnap,
        reportsSnap,
        unmatchesSnap
      ] = await Promise.all([
        FIRESTORE.collection("users").doc(userId).collection("likesGiven").get(),
        FIRESTORE.collection("users").doc(userId).collection("dislikesGiven").get(),
        FIRESTORE.collection("users").doc(userId).collection("matches").get(),
        FIRESTORE.collection("users").doc(userId).collection("likesReceived").get(),
        // 🆕 NEW: Fetch reported users
        FIRESTORE.collection("users").doc(userId).collection("reportedUsers").get(),
        // 🆕 NEW: Fetch unmatched users
        FIRESTORE.collection("users").doc(userId).collection("unmatchedUsers").get(),
      ]);
      
      const exclusions = new Set<string>([
        userId, // Always exclude self
        ...likesSnap.docs.map(doc => doc.id),
        ...dislikesSnap.docs.map(doc => doc.id),
        ...matchesSnap.docs.map(doc => doc.id),
        ...receivedLikesSnap.docs.map(doc => doc.id),
        // 🆕 NEW: Add reported users to exclusions
        ...reportsSnap.docs.map(doc => doc.data().reportedUserId || doc.id),
        // 🆕 NEW: Add unmatched users to exclusions
        ...unmatchesSnap.docs.map(doc => doc.data().unmatchedUserId || doc.id),
      ]);

      console.log('🚫 Comprehensive exclusion breakdown:', {
        self: 1,
        likesGiven: likesSnap.docs.length,
        dislikesGiven: dislikesSnap.docs.length,
        matches: matchesSnap.docs.length,
        receivedLikes: receivedLikesSnap.docs.length,
        reportedUsers: reportsSnap.docs.length,
        unmatchedUsers: unmatchesSnap.docs.length,
        totalExcluded: exclusions.size
      });
      
      return exclusions;
      
    } catch (error) {
      console.error('❌ Error building exclusion set:', error);
      return new Set([userId]); // Fallback to just excluding self
    }
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

  const buildMatchQuery = useCallback((
    exclusionSet: Set<string>,
    lastDoc: any = null,
    batchSize: number = 20
  ) => {
    console.log('🔍 Building query with comprehensive exclusions:', {
      ageRange: userDataRef.current.matchPreferences?.preferredAgeRange,
      connectionPrefs: userDataRef.current.matchPreferences?.connectionPreferences,
      connectionIntent: userDataRef.current.matchPreferences?.connectionIntent,
      exclusionCount: exclusionSet.size
    });

    const baseCollection = FIRESTORE.collection("users");
    
    // Start with basic requirements
    let query = baseCollection.where("onboardingCompleted", "==", true);

    const prefs = userDataRef.current.matchPreferences;
    
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
  }, []);

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
        } catch (error: any) {
          console.error(
            "Error linking phone number to Google SSO user:",
            error
          );
          setIsLinking(false);
          
          // Throw a specific error for phone linking failures
          throw new Error('PHONE_LINK_FAILED');
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
    } catch (error: any) {
      console.error("Error verifying phone number:", error);
      
      // Throw the error to be handled by the calling component
      if (error.message === 'PHONE_LINK_FAILED') {
        throw new Error('PHONE_LINK_FAILED');
      } else {
        throw new Error('VERIFICATION_FAILED');
      }
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

    // Helper to check if user has active boost
  const isUserBoosted = useCallback((user: UserDataType): boolean => {
      if (!user.boostExpiresAt) return false;
      
      const expiresAt = user.boostExpiresAt.toDate 
        ? user.boostExpiresAt.toDate()
        : new Date(user.boostExpiresAt);
      
      return new Date() < expiresAt;
    }, []);

    // Helper to check if user is recently active (last 24 hours)
  const isUserRecentlyActive = useCallback((user: UserDataType): boolean => {
      if (!user.lastActive) return false;
      
      const lastActive = user.lastActive?.toDate?.() || new Date(user.lastActive);
      const now = new Date();
      const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      
      return diffHours <= 24;
    }, []);

  const applyBoostPrioritySorting = useCallback((users: UserDataType[]): UserDataType[] => {
      if (!users.length) return users;
      
      console.log(`🚀 Applying boost priority sorting to ${users.length} users`);
      
      const sortedUsers = [...users].sort((a, b) => {
        // 1. HIGHEST PRIORITY: Active boost status
        const aHasActiveBoost = isUserBoosted(a);
        const bHasActiveBoost = isUserBoosted(b);
        
        if (aHasActiveBoost && !bHasActiveBoost) {
          console.log(`🚀 ${a.firstName} boosted above ${b.firstName} (active radiance)`);
          return -1;
        }
        if (!aHasActiveBoost && bHasActiveBoost) {
          console.log(`🚀 ${b.firstName} boosted above ${a.firstName} (active radiance)`);
          return 1;
        }
        
        // 2. SECOND PRIORITY: Recent activity
        const aRecentlyActive = isUserRecentlyActive(a);
        const bRecentlyActive = isUserRecentlyActive(b);
        
        if (aRecentlyActive && !bRecentlyActive) return -1;
        if (!aRecentlyActive && bRecentlyActive) return 1;
        
        // 3. THIRD PRIORITY: Likes received (popularity)
        const aLikes = a.likesReceivedCount || 0;
        const bLikes = b.likesReceivedCount || 0;
        
        if (aLikes !== bLikes) {
          return bLikes - aLikes;
        }
        
        // 4. FOURTH PRIORITY: Account newness
        const aCreated = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bCreated = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        
        return bCreated.getTime() - aCreated.getTime();
      });
      
      // Log top 5 for debugging
      console.log('🚀 Top 5 prioritized matches:');
      sortedUsers.slice(0, 5).forEach((user, index) => {
        const hasBoost = isUserBoosted(user);
        const isActive = isUserRecentlyActive(user);
        const likes = user.likesReceivedCount || 0;
        
        console.log(`  ${index + 1}. ${user.firstName} - ${hasBoost ? '🚀 BOOSTED' : '⭐'} ${isActive ? '🟢 ACTIVE' : '⚪'} ${likes} likes`);
      });
      
      return sortedUsers;
    }, [isUserBoosted, isUserRecentlyActive]);

  const applyAllFilters = useCallback((users: UserDataType[]): UserDataType[] => {
    const prefs = userData.matchPreferences;
    
    console.log(`🔍 Starting client-side filtering on ${users.length} users`);
    console.log('🔍 User preferences for filtering:', {
      ageRange: prefs?.preferredAgeRange,
      connectionIntent: prefs?.connectionIntent,
      connectionPreferences: prefs?.connectionPreferences,
      preferredDistance: prefs?.preferredDistance,
      spiritualPrefs: prefs?.spiritualCompatibility
    });
    
    // 🔥 CRITICAL FIX: Add current user ID to exclusion check
    console.log('🚫 Current user ID for exclusion:', userData.userId);
    console.log('🚫 Exclusion set contents:', Array.from(matchingState.exclusionSet));

    const filteredUsers = users.filter(user => {
      // 1. 🚫 EXCLUSION CHECK - THIS MUST BE FIRST AND MOST IMPORTANT
      if (matchingState.exclusionSet.has(user.userId)) {
        console.log(`❌ ${user.firstName} (${user.userId}) - Already excluded from exclusion set`);
        return false;
      }
      // 1. 🚫 EXCLUSION CHECK - IF WE MATCHED
      if (userData?.matches?.includes(user.userId)) {
        console.log(`❌ ${user.firstName} (${user.userId}) - Already matched with this user`);
        return false;
      }
      
      // 🔥 CRITICAL FIX: Also explicitly check if user is viewing themselves
      if (user.userId === userData.userId) {
        console.log(`❌ ${user.firstName} (${user.userId}) - Cannot show user themselves!`);
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

      // 5. 🔮 SPIRITUAL COMPATIBILITY FILTER
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

    const finalSortedUsers = applyBoostPrioritySorting(sortedUsers);
    console.log(`📊 FINAL PRIORITIZED USERS: ${finalSortedUsers.length} out of ${users.length} raw users`);

    // 🔥 FINAL SAFETY CHECK: Remove self if somehow still present
    const safeFinalUsers = finalSortedUsers.filter(user => {
      if (user.userId === userData.userId) {
        console.log(`🚨 FINAL SAFETY: Removing self (${user.firstName}) from final results!`);
        return false;
      }
      return true;
    });

    console.log(`📊 SAFE FINAL USERS: ${safeFinalUsers.length} (after final self-removal check)`);
    
    return safeFinalUsers;

  }, [userData.matchPreferences, userData.latitude, userData.longitude, userData.userId, matchingState.exclusionSet, applySpiritualFilter, applyBoostPrioritySorting]);

  const fetchPotentialMatches = useCallback(async (
    resetBatch: boolean = false,
    overrideExclusions?: Set<string>
  ): Promise<UserDataType[]> => {
    
    if (matchingStateRef.current.loadingBatch) {
      console.log('⏸️ Already loading, skipping fetch');
      return [];
    }
    
    console.log('🔍 === FETCHING POTENTIAL MATCHES ===');
    console.log('🔍 Reset batch:', resetBatch);
    
    setMatchingState(prev => ({ ...prev, loadingBatch: true }));
    
    try {
      const exclusionsToUse = overrideExclusions || matchingStateRef.current.exclusionSet;
      const lastDoc = resetBatch ? null : matchingStateRef.current.lastFetchedDoc;
      
      // 🔧 CRITICAL FIX: Also exclude users already in potentialMatches to prevent duplicates
      const existingUserIds = new Set(matchingStateRef.current.potentialMatches.map(u => u.userId));
      const combinedExclusions = new Set([...exclusionsToUse, ...existingUserIds]);
      
      console.log('🔍 Combined exclusions (including existing):', Array.from(combinedExclusions));
      
      // Build and execute query
      const query = buildMatchQuery(combinedExclusions, lastDoc, 30);
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
      
      // Apply all client-side filters
      const filteredUsers = applyAllFilters(rawUsers);
      
      // 🔧 CRITICAL FIX: Final duplicate check
      const uniqueFilteredUsers = filteredUsers.filter(user => 
        !existingUserIds.has(user.userId) && !exclusionsToUse.has(user.userId)
      );
      
      console.log(`📊 FINAL UNIQUE USERS: ${uniqueFilteredUsers.length} out of ${rawUsers.length} raw users`);
      console.log('📊 Final users:', uniqueFilteredUsers.map(u => `${u.firstName} (${u.userId.slice(-4)})`));
      
      // Update pagination state
      const newLastDoc = snapshot.docs.length > 0 ? 
        snapshot.docs[snapshot.docs.length - 1] : null;
      
      setMatchingState(prev => ({
        ...prev,
        lastFetchedDoc: newLastDoc,
        loadingBatch: false,
        noMoreMatches: uniqueFilteredUsers.length === 0
      }));
      
      return uniqueFilteredUsers;
      
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      setMatchingState(prev => ({ 
        ...prev, 
        loadingBatch: false, 
        noMoreMatches: true 
      }));
      return [];
    }
  }, [buildMatchQuery, applyAllFilters]);

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

  const resetMatching = useCallback(async () => {
    console.log('🔄 Manual reset of matching system');
    
    if (!userData.userId) {
      console.log('🔄 No user ID, cannot reset');
      return;
    }
    
    // 🔧 FIX: Rebuild exclusion set from Firebase instead of starting fresh
    console.log('🔄 Rebuilding exclusion set from Firebase...');
    const freshExclusions = await buildExclusionSet(userData.userId);
    console.log('🚫 Fresh exclusions from Firebase:', Array.from(freshExclusions));
    console.log('🚫 Fresh exclusion set size:', freshExclusions.size);
    
    setMatchingState({
      potentialMatches: [],
      currentIndex: 0,
      lastFetchedDoc: null,
      loadingBatch: false,
      noMoreMatches: false,
      exclusionSet: freshExclusions, // ✅ Use fresh exclusions from Firebase
      initialized: false,
      preferencesHash: '',
    });
  }, [userData.userId, buildExclusionSet]); // Add buildExclusionSet as dependency

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
    const { potentialMatches, currentIndex, exclusionSet } = matchingStateRef.current;
    
    console.log(`➡️ Checking if need to load more matches. Current index: ${currentIndex}, Total: ${potentialMatches.length}`);
    
    // Only fetch new batch if we're running low on matches
    const PREFETCH_THRESHOLD = 2;
    if (potentialMatches.length - currentIndex <= PREFETCH_THRESHOLD) {
      console.log('📦 Running low on matches, fetching new batch...');
      const newBatch = await fetchPotentialMatches(false);
      
      if (newBatch.length > 0) {
        console.log(`📦 Adding ${newBatch.length} new matches to batch`);
        setMatchingState(prev => ({
          ...prev,
          potentialMatches: [...prev.potentialMatches, ...newBatch],
        }));
      } else {
        console.log('📭 No more matches available');
        setMatchingState(prev => ({ ...prev, noMoreMatches: true }));
      }
    }
  }, [fetchPotentialMatches]);

  const shouldResetDailyLikes = (lastResetDate: any): boolean => {
    if (!lastResetDate) return true;
    
    const lastReset = lastResetDate.toDate ? lastResetDate.toDate() : new Date(lastResetDate);
    const today = new Date();
    
    // Reset if it's a new day
    return (
      lastReset.getDate() !== today.getDate() ||
      lastReset.getMonth() !== today.getMonth() ||
      lastReset.getFullYear() !== today.getFullYear()
    );
  };

  const getRemainingDailyLikes = (): number => {
    if (userData.subscription?.isActive || __DEV__) {
      return -1; // Unlimited
    }
    
    if (shouldResetDailyLikes(userData.lastLikeResetDate)) {
      return DAILY_LIKE_LIMIT;
    }
    
    const used = userData.dailyLikesCount || 0;
    return Math.max(0, DAILY_LIKE_LIMIT - used);
  };

  // Get remaining time for active boost
  const getRadianceTimeRemaining = useCallback((): number => {
    const currentUserData = userDataRef.current;
    
    // Silent check - no console.log to reduce noise
    if (!currentUserData.boostExpiresAt) {
      return 0;
    }
    
    const expiresAt = currentUserData.boostExpiresAt.toDate 
      ? currentUserData.boostExpiresAt.toDate()
      : new Date(currentUserData.boostExpiresAt);
    
    const now = new Date();
    const remainingMs = expiresAt.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    
    return remainingSeconds;
  }, []);

  // 🔧 FINAL FIX: Replace your optimizedLikeMatch function with this version
  // This captures the radiance status BEFORE any state changes happen
  // 🔧 FIXED FOR INTERPRETATION 2: Check if the RECIPIENT has radiance
  const optimizedLikeMatch = useCallback(async (matchId: string) => {
    console.log(`❤️ OPTIMIZED LIKING USER: ${matchId}`);
    
    try {
      // Check daily limit for non-FullCircle users in production
      if (!userDataRef.current.subscription?.isActive && !__DEV__) {
        const remaining = getRemainingDailyLikes();
        
        if (remaining <= 0) {
          throw new Error("DAILY_LIMIT_REACHED");
        }
      }

      // 🔧 NEW LOGIC: Check if the TARGET USER (person being liked) has radiance
      console.log(`🔍 Checking if target user ${matchId} has radiance...`);
      
      let targetHasRadiance = false;
      
      try {
        // Fetch the target user's data to check their radiance status
        const targetUserDoc = await FIRESTORE.collection("users").doc(matchId).get();
        
        if (targetUserDoc.exists) {
          const targetUserData = targetUserDoc.data() as UserDataType;
          
          console.log('🎯 Target user data:', {
            userId: matchId,
            boostExpiresAt: targetUserData.boostExpiresAt,
            hasBoostField: !!targetUserData.boostExpiresAt
          });
          
          if (targetUserData.boostExpiresAt) {
            const expiresAt = targetUserData.boostExpiresAt.toDate 
              ? targetUserData.boostExpiresAt.toDate()
              : new Date(targetUserData.boostExpiresAt);
            
            targetHasRadiance = new Date() < expiresAt;
            
            console.log('🔍 Target user radiance check:', {
              expiresAt: expiresAt.toISOString(),
              currentTime: new Date().toISOString(),
              targetHasRadiance
            });
          } else {
            console.log('🔍 Target user has no boostExpiresAt field');
          }
        } else {
          console.log('❌ Target user document not found');
        }
      } catch (error) {
        console.error('❌ Error checking target user radiance:', error);
        // Continue with targetHasRadiance = false
      }
      
      console.log('🚀 FINAL RADIANCE CHECK RESULT:', {
        targetUserId: matchId,
        targetHasRadiance,
        meaning: targetHasRadiance 
          ? 'This like will be marked as viaRadiance because recipient has active boost' 
          : 'Normal like - recipient has no active boost'
      });
      
      // 🔧 CRITICAL FIX: Remove user from current array immediately and move to next
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, matchId]);
        
        // 🔧 CRITICAL: Remove liked user from potentialMatches array entirely
        const filteredMatches = prev.potentialMatches.filter(match => match.userId !== matchId);
        
        // 🔧 CRITICAL: Find next valid user that's not excluded
        let nextIndex = prev.currentIndex;
        while (nextIndex < filteredMatches.length && newExclusionSet.has(filteredMatches[nextIndex]?.userId)) {
          nextIndex++;
        }
        
        // If no valid user at current or next positions, look from beginning
        if (nextIndex >= filteredMatches.length || !filteredMatches[nextIndex]) {
          nextIndex = 0;
          while (nextIndex < filteredMatches.length && newExclusionSet.has(filteredMatches[nextIndex]?.userId)) {
            nextIndex++;
          }
        }
        
        console.log(`🔧 Filtered matches: ${filteredMatches.length}, Moving to index: ${nextIndex}`);
        console.log(`🔧 Next user: ${filteredMatches[nextIndex]?.firstName || 'NONE'}`);
        
        return {
          ...prev,
          exclusionSet: newExclusionSet,
          potentialMatches: filteredMatches,
          currentIndex: nextIndex < filteredMatches.length ? nextIndex : 0,
          noMoreMatches: filteredMatches.length === 0
        };
      });
      
      // 🔧 FIXED: Pass the target's radiance status, not the sender's
      await recordLikeWithBatch(
        userDataRef.current.userId, 
        matchId, 
        false, // viaOrb = false for regular likes
        targetHasRadiance // ✅ TRUE if the RECIPIENT has radiance
      );
      
      console.log(`✅ Optimized like completed for ${matchId}${targetHasRadiance ? ' ✨ (recipient has Sacred Radiance)' : ' (normal like)'}`);
      
    } catch (error: any) {
      console.error('❌ Error in optimized like:', error);
      
      // 🔧 CRITICAL FIX: Only rollback for non-daily-limit errors
      if (error.message !== "DAILY_LIMIT_REACHED") {
        console.log(`🔄 Rolling back exclusion for ${matchId} due to error:`, error.message);
        setMatchingState(prev => {
          const newSet = new Set(prev.exclusionSet);
          newSet.delete(matchId);
          
          // Add user back to potentialMatches if rollback
          const userToRestore = matchingStateRef.current.potentialMatches.find(u => u.userId === matchId);
          const newMatches = userToRestore ? [...prev.potentialMatches, userToRestore] : prev.potentialMatches;
          
          return { 
            ...prev, 
            exclusionSet: newSet,
            potentialMatches: newMatches
          };
        });
      }
      
      throw error;
    }
  }, [getRemainingDailyLikes]);

  // 🔧 ALSO UPDATE: optimizedOrbLike with the same logic
  const optimizedOrbLike = useCallback(async (matchId: string) => {
    console.log(`✨ OPTIMIZED ORB LIKING USER: ${matchId}`);
    
    try {
      // Check orb availability first
      if (!userDataRef.current.numOfOrbs || userDataRef.current.numOfOrbs <= 0) {
        throw new Error("No orbs available");
      }

      // 🔧 NEW LOGIC: Check if the TARGET USER (person being liked) has radiance
      console.log(`🔍 Checking if target user ${matchId} has radiance for orb like...`);
      
      let targetHasRadiance = false;
      
      try {
        // Fetch the target user's data to check their radiance status
        const targetUserDoc = await FIRESTORE.collection("users").doc(matchId).get();
        
        if (targetUserDoc.exists) {
          const targetUserData = targetUserDoc.data() as UserDataType;
          
          if (targetUserData.boostExpiresAt) {
            const expiresAt = targetUserData.boostExpiresAt.toDate 
              ? targetUserData.boostExpiresAt.toDate()
              : new Date(targetUserData.boostExpiresAt);
            
            targetHasRadiance = new Date() < expiresAt;
            
            console.log('🔍 Target user radiance check (orb):', {
              expiresAt: expiresAt.toISOString(),
              currentTime: new Date().toISOString(),
              targetHasRadiance
            });
          }
        }
      } catch (error) {
        console.error('❌ Error checking target user radiance (orb):', error);
      }
      
      console.log('🚀 ORB + RADIANCE CHECK RESULT:', {
        targetUserId: matchId,
        targetHasRadiance,
        meaning: targetHasRadiance 
          ? 'This orb like will be marked as viaRadiance because recipient has active boost' 
          : 'Normal orb like - recipient has no active boost'
      });
      
      // Update user data to reflect orb usage immediately
      setUserData(prev => ({
        ...prev,
        numOfOrbs: (prev.numOfOrbs || 0) - 1
      }));
      
      // 🔧 CRITICAL FIX: Same pattern - remove immediately and move to next
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, matchId]);
        
        // Remove orb-liked user from potentialMatches array entirely
        const filteredMatches = prev.potentialMatches.filter(match => match.userId !== matchId);
        
        // Find next valid user that's not excluded
        let nextIndex = prev.currentIndex;
        while (nextIndex < filteredMatches.length && newExclusionSet.has(filteredMatches[nextIndex]?.userId)) {
          nextIndex++;
        }
        
        // If no valid user at current or next positions, look from beginning
        if (nextIndex >= filteredMatches.length || !filteredMatches[nextIndex]) {
          nextIndex = 0;
          while (nextIndex < filteredMatches.length && newExclusionSet.has(filteredMatches[nextIndex]?.userId)) {
            nextIndex++;
          }
        }
        
        console.log(`🔧 After orb like - Filtered matches: ${filteredMatches.length}, Moving to index: ${nextIndex}`);
        console.log(`🔧 Next user: ${filteredMatches[nextIndex]?.firstName || 'NONE'}`);
        
        return {
          ...prev,
          exclusionSet: newExclusionSet,
          potentialMatches: filteredMatches,
          currentIndex: nextIndex < filteredMatches.length ? nextIndex : 0,
          noMoreMatches: filteredMatches.length === 0
        };
      });
      
      // 🔧 FIXED: Pass the target's radiance status
      await recordLikeWithBatch(
        userDataRef.current.userId, 
        matchId, 
        true, // viaOrb = true for orb likes
        targetHasRadiance // ✅ TRUE if the RECIPIENT has radiance
      );

      console.log(`✅ Optimized orb like completed for ${matchId}${targetHasRadiance ? ' ✨ (recipient has Sacred Radiance)' : ' (normal orb like)'}`);
      
    } catch (error: any) {
      console.error('❌ Error orb liking match:', error);
      
      // Rollback exclusion and orb count on error
      setMatchingState(prev => {
        const newSet = new Set(prev.exclusionSet);
        newSet.delete(matchId);
        
        const userToRestore = matchingStateRef.current.potentialMatches.find(u => u.userId === matchId);
        const newMatches = userToRestore ? [...prev.potentialMatches, userToRestore] : prev.potentialMatches;
        
        return { 
          ...prev, 
          exclusionSet: newSet,
          potentialMatches: newMatches
        };
      });
      
      // Rollback orb count if it was decremented
      if (error.message !== "No orbs available") {
        setUserData(prev => ({
          ...prev,
          numOfOrbs: (prev.numOfOrbs || 0) + 1
        }));
        console.log(`🔄 Rolled back orb count`);
      }
      
      throw error;
    }
  }, []);

  // 🔧 CRITICAL FIX: Completely rewritten dislike function
  const optimizedDislikeMatch = useCallback(async (matchId: string) => {
    console.log(`👎 OPTIMIZED DISLIKING USER: ${matchId}`);
    
    try {
      // 🔧 CRITICAL FIX: Same pattern as like - remove immediately and move to next
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, matchId]);
        
        // Remove disliked user from potentialMatches array entirely
        const filteredMatches = prev.potentialMatches.filter(match => match.userId !== matchId);
        
        // Find next valid user that's not excluded
        let nextIndex = prev.currentIndex;
        while (nextIndex < filteredMatches.length && newExclusionSet.has(filteredMatches[nextIndex]?.userId)) {
          nextIndex++;
        }
        
        // If no valid user at current or next positions, look from beginning
        if (nextIndex >= filteredMatches.length || !filteredMatches[nextIndex]) {
          nextIndex = 0;
          while (nextIndex < filteredMatches.length && newExclusionSet.has(filteredMatches[nextIndex]?.userId)) {
            nextIndex++;
          }
        }
        
        console.log(`🔧 After dislike - Filtered matches: ${filteredMatches.length}, Moving to index: ${nextIndex}`);
        console.log(`🔧 Next user: ${filteredMatches[nextIndex]?.firstName || 'NONE'}`);
        
        return {
          ...prev,
          exclusionSet: newExclusionSet,
          potentialMatches: filteredMatches,
          currentIndex: nextIndex < filteredMatches.length ? nextIndex : 0,
          noMoreMatches: filteredMatches.length === 0
        };
      });
      
      // Perform dislike action in background
      await recordDislikeWithBatch(userDataRef.current.userId, matchId);
      
      console.log(`✅ Optimized dislike completed for ${matchId}`);
      
    } catch (error) {
      console.error('❌ Error disliking match:', error);
      
      // Rollback on error
      setMatchingState(prev => {
        const newSet = new Set(prev.exclusionSet);
        newSet.delete(matchId);
        
        const userToRestore = matchingStateRef.current.potentialMatches.find(u => u.userId === matchId);
        const newMatches = userToRestore ? [...prev.potentialMatches, userToRestore] : prev.potentialMatches;
        
        return { 
          ...prev, 
          exclusionSet: newSet,
          potentialMatches: newMatches
        };
      });
      
      throw error;
    }
  }, []);

  const recordLikeWithBatch = async (
    fromUserId: string,
    toUserId: string,
    viaOrb: boolean = false,
    viaRadiance: boolean = false
  ): Promise<void> => {
    console.log('🔥 Using batch approach for like...', { viaOrb, viaRadiance });
    
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
      
      const fromData: any = fromSnap.data()!;
      const toData = toSnap.data()!;
      const hadLikedUs = incomingSnap.exists;
      
      console.log('🔥 Data loaded:', { 
        fromExists: fromSnap.exists, 
        toExists: toSnap.exists, 
        hadLikedUs,
        fromLikesGiven: fromData.likesGivenCount,
        hasActiveRadiance: hasActiveRadiance(fromData) // Check if user has active boost
      });
      
      // Check orb allowance
      if (viaOrb && (fromData.numOfOrbs ?? 0) < 1) {
        throw new Error("No orbs left this week");
      }
      
      // Prepare batch
      const batch = FIRESTORE.batch();
      
      // Always set the likesGiven record with connection method tracking
      const likeData = {
        matchId: toUserId,
        viaOrb,
        viaRadiance, // NEW: Track radiance connections
        timestamp: firestore.FieldValue.serverTimestamp(),
      };
      
      batch.set(givenRef, likeData);
      
      const fromUpdates: any = {
        likesGivenCount: (fromData.likesGivenCount ?? 0) + 1,
      };

      // Handle daily likes for non-subscribers
      if (!fromData.subscription.isActive && !__DEV__) {
        const needsReset = shouldResetDailyLikes(fromData.lastLikeResetDate);
        if (needsReset) {
          fromUpdates.dailyLikesCount = 1;
          fromUpdates.lastLikeResetDate = firestore.FieldValue.serverTimestamp();
        } else {
          fromUpdates.dailyLikesCount = (fromData.dailyLikesCount ?? 0) + 1;
        }
      }
      
      // Handle orb consumption
      if (viaOrb && !fromData.subscription.isActive) {
        fromUpdates.numOfOrbs = Math.max(0, (fromData.numOfOrbs ?? 0) - 1);
      }
      
      // Handle mutual match creation
      if (hadLikedUs) {
        console.log('🔥 MUTUAL LIKE DETECTED - Creating match...');
        
        // Get the original like data to preserve connection method
        const incomingLikeData = incomingSnap.data();
        const originalViaOrb = incomingLikeData?.viaOrb || false;
        const originalViaRadiance = incomingLikeData?.viaRadiance || false;
        
        // Remove the incoming like since we're creating a match
        batch.delete(incomingRef);
        fromUpdates.likesReceivedCount = Math.max(0, (fromData.likesReceivedCount ?? 1) - 1);
        
        const myMatchRef = fromRef.collection("matches").doc(toUserId);
        const theirMatchRef = toRef.collection("matches").doc(fromUserId);
        
        // Store match data with connection methods from both sides
        const matchData = {
          timestamp: firestore.FieldValue.serverTimestamp(),
          // Track how the match was formed (from current user's perspective)
          myConnectionMethod: {
            viaOrb,
            viaRadiance
          },
          // Track how they originally liked us
          theirConnectionMethod: {
            viaOrb: originalViaOrb,
            viaRadiance: originalViaRadiance
          }
        };
        
        const theirMatchData = {
          timestamp: firestore.FieldValue.serverTimestamp(),
          // From their perspective (reversed)
          myConnectionMethod: {
            viaOrb: originalViaOrb,
            viaRadiance: originalViaRadiance
          },
          theirConnectionMethod: {
            viaOrb,
            viaRadiance
          }
        };
        
        batch.set(myMatchRef, matchData);
        batch.set(theirMatchRef, theirMatchData);
        
        fromUpdates.matches = firestore.FieldValue.arrayUnion(toUserId);
        
        // Create chat with connection method metadata
        const chatId = [fromUserId, toUserId].sort().join("_");
        const chatRef = FIRESTORE.collection("chats").doc(chatId);
        
        batch.set(chatRef, {
          participants: [fromUserId, toUserId],
          messages: [],
          lastMessage: "",
          lastMessageSender: "",
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastUpdated: firestore.FieldValue.serverTimestamp(),
          // NEW: Store connection metadata for chat UI
          connectionMethods: {
            [fromUserId]: { viaOrb, viaRadiance },
            [toUserId]: { viaOrb: originalViaOrb, viaRadiance: originalViaRadiance }
          }
        });
        
        // Update the other user for the match
        batch.update(toRef, {
          matches: firestore.FieldValue.arrayUnion(fromUserId),
          // DON'T increment likesReceivedCount for mutual matches - they become matches immediately
          // likesReceivedCount: (toData.likesReceivedCount ?? 0) + 1, // REMOVED
          likesGivenCount: Math.max(0, (toData.likesGivenCount ?? 1) - 1), // They liked us first
        });
        
        console.log('🔥 Match and chat will be created with connection methods:', {
          current: { viaOrb, viaRadiance },
          original: { viaOrb: originalViaOrb, viaRadiance: originalViaRadiance }
        });
      } else {
        // Only for NON-MUTUAL likes: create received like record and increment counter
        console.log('🔥 Creating received like record (not mutual)');
        
        // For received likes, we need to track how the sender connected
        const receivedLikeData = {
          matchId: fromUserId,
          viaOrb,
          viaRadiance, // NEW: Track how this person liked us
          timestamp: firestore.FieldValue.serverTimestamp(),
        };
        
        batch.set(receivedRef, receivedLikeData);
        
        // Increment the receiver's likesReceivedCount
        batch.update(toRef, {
          likesReceivedCount: (toData.likesReceivedCount ?? 0) + 1,
        });
      }
      
      // Always update the sender (fromUser)
      batch.update(fromRef, fromUpdates);
      
      console.log('🔥 Committing batch...');
      await batch.commit();
      console.log('✅ Batch committed successfully');
      
      // Update local state
      if (viaOrb && !userData.subscription?.isActive) {
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
        console.log('🎉 MUTUAL MATCH CREATED WITH CONNECTION TRACKING!');
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
          viaOrb: doc.data().viaOrb || false,
          viaRadiance: doc.data().viaRadiance || false, // NEW
          timestamp: doc.data().timestamp,
        }));

        // Fetch user data for each like
        const usersWithData = await Promise.all(
          likeRecords.map(async (record) => {
            try {
              const userSnap = await FIRESTORE.collection("users")
                .doc(record.userId)
                .get();
              
              if (userSnap.exists) {
                return {
                  ...userSnap.data(),
                  userId: record.userId,
                  viaOrb: record.viaOrb,
                  viaRadiance: record.viaRadiance, // NEW
                  timestamp: record.timestamp,
                };
              }
              return null;
            } catch (error) {
              console.error("Error fetching user data:", error);
              return null;
            }
          })
        );

        const validUsers = usersWithData.filter(user => user !== null);
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
    if (!userDataRef.current.userId) return false;

    try {
      const currentUserId = userDataRef.current.userId;
      const chatId = [currentUserId, otherUserId].sort().join("_");

      console.log(`🔄 Unmatching user: ${otherUserId}`);

      // 1. Check for existing likes BEFORE deleting them
      const [likeGivenDoc, likeReceivedDoc] = await Promise.all([
        FIRESTORE.collection("users")
          .doc(currentUserId)
          .collection("likesGiven")
          .doc(otherUserId)
          .get(),
        FIRESTORE.collection("users")
          .doc(currentUserId)
          .collection("likesReceived")
          .doc(otherUserId)
          .get()
      ]);

      const hadGivenLike = likeGivenDoc.exists;
      const hadReceivedLike = likeReceivedDoc.exists;

      // 2. Start batch operation
      const batch = FIRESTORE.batch();

      const currentUserRef = FIRESTORE.collection("users").doc(currentUserId);
      const otherUserRef = FIRESTORE.collection("users").doc(otherUserId);

      // 3. Delete the chat document
      const chatRef = FIRESTORE.collection("chats").doc(chatId);
      batch.delete(chatRef);

      // 4. Remove from both users' matches arrays
      batch.update(currentUserRef, {
        matches: firestore.FieldValue.arrayRemove(otherUserId),
      });

      batch.update(otherUserRef, {
        matches: firestore.FieldValue.arrayRemove(currentUserId),
      });

      // 5. Remove from matches subcollections
      batch.delete(
        FIRESTORE.collection("users")
          .doc(currentUserId)
          .collection("matches")
          .doc(otherUserId)
      );

      batch.delete(
        FIRESTORE.collection("users")
          .doc(otherUserId)
          .collection("matches")
          .doc(currentUserId)
      );

      // 6. Delete all like records
      batch.delete(
        FIRESTORE.collection("users")
          .doc(currentUserId)
          .collection("likesGiven")
          .doc(otherUserId)
      );

      batch.delete(
        FIRESTORE.collection("users")
          .doc(currentUserId)
          .collection("likesReceived")
          .doc(otherUserId)
      );

      batch.delete(
        FIRESTORE.collection("users")
          .doc(otherUserId)
          .collection("likesGiven")
          .doc(currentUserId)
      );

      batch.delete(
        FIRESTORE.collection("users")
          .doc(otherUserId)
          .collection("likesReceived")
          .doc(currentUserId)
      );

      // 7. 🆕 NEW: Track unmatch in subcollection for exclusion
      const unmatchRecord: UnmatchRecord = {
        unmatchedUserId: otherUserId,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      batch.set(
        FIRESTORE.collection("users")
          .doc(currentUserId)
          .collection("unmatchedUsers")
          .doc(otherUserId),
        unmatchRecord
      );

      // Also track for the other user (they unmatched us too)
      const reverseUnmatchRecord: UnmatchRecord = {
        unmatchedUserId: currentUserId,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      batch.set(
        FIRESTORE.collection("users")
          .doc(otherUserId)
          .collection("unmatchedUsers")
          .doc(currentUserId),
        reverseUnmatchRecord
      );

      // 8. Update like counts based on what existed before deletion
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

      // 9. 🆕 NEW: Update local user data to include unmatched user
      batch.update(currentUserRef, {
        unmatchedUsers: firestore.FieldValue.arrayUnion(otherUserId),
      });

      // Commit all changes at once
      await batch.commit();

      // 10. 🆕 NEW: Update local exclusion set immediately
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, otherUserId]);
        console.log(`🚫 Added ${otherUserId} to exclusion set after unmatch`);
        return { ...prev, exclusionSet: newExclusionSet };
      });

      // 11. Update local user data
      setUserData(prev => ({
        ...prev,
        unmatchedUsers: [...(prev.unmatchedUsers || []), otherUserId],
        matches: (prev.matches || []).filter(id => id !== otherUserId),
      }));

      console.log(`✅ Successfully unmatched user: ${otherUserId}`);
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
    if (!userDataRef.current.userId) return false;

    try {
      const currentUserId = userDataRef.current.userId;
      
      console.log(`🚨 Reporting user: ${reportedUserId} for: ${reason}`);

      // 1. Create report in reports collection
      await FIRESTORE.collection("reports").add({
        reportedBy: currentUserId,
        reportedUser: reportedUserId,
        reason,
        details: details || "",
        status: "pending",
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // 2. 🆕 NEW: Track report in user's subcollection for exclusion
      const reportRecord: ReportRecord = {
        reportedUserId,
        reason,
        details,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      await FIRESTORE.collection("users")
        .doc(currentUserId)
        .collection("reportedUsers")
        .doc(reportedUserId)
        .set(reportRecord);

      // 3. 🆕 NEW: Update user document to include reported user
      await FIRESTORE.collection("users")
        .doc(currentUserId)
        .update({
          reportedUsers: firestore.FieldValue.arrayUnion(reportedUserId),
        });

      // 4. 🆕 NEW: Update local exclusion set immediately
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, reportedUserId]);
        console.log(`🚫 Added ${reportedUserId} to exclusion set after report`);
        return { ...prev, exclusionSet: newExclusionSet };
      });

      // 5. Update local user data
      setUserData(prev => ({
        ...prev,
        reportedUsers: [...(prev.reportedUsers || []), reportedUserId],
      }));

      // 6. Unmatch if they were matched
      await unmatchUser(reportedUserId);

      console.log(`✅ Successfully reported user: ${reportedUserId}`);
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
      
      // Step 1: Check if recent authentication is required and handle it
      try {
        // Try a test operation that requires recent auth
        await currentUser.updatePassword(currentUser.uid); // This will fail if recent auth needed
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          // Prompt user to re-authenticate
          throw new Error("For security, please log out and log back in within the last few minutes, then try deleting your account again.");
        }
      }
      
      // Step 2: Delete user subcollections (client SDK doesn't have listCollections)
      const deleteUserSubcollections = async (userId: string) => {
        const subcollections = [
          "matches", 
          "likesGiven", 
          "likesReceived", 
          "reports",
          "unmatchedUsers",
          "dislikesGiven"
        ];
        
        for (const subcollectionName of subcollections) {
          try {
            const subcollectionRef = FIRESTORE.collection("users")
              .doc(userId)
              .collection(subcollectionName);
            
            const snapshot = await subcollectionRef.get();
            
            // Delete documents in batches of 500 (Firestore limit)
            const batchSize = 500;
            let batch = FIRESTORE.batch();
            let batchCount = 0;
            
            for (const doc of snapshot.docs) {
              batch.delete(doc.ref);
              batchCount++;
              
              if (batchCount === batchSize) {
                await batch.commit();
                batch = FIRESTORE.batch();
                batchCount = 0;
              }
            }
            
            // Commit remaining documents
            if (batchCount > 0) {
              await batch.commit();
            }
            
            console.log(`Deleted ${subcollectionName} subcollection`);
          } catch (error) {
            console.warn(`Error deleting ${subcollectionName}:`, error);
          }
        }
      };

      // Step 3: Create a batch for atomic operations where possible
      const batch = FIRESTORE.batch();
      
      // Step 4: Log the deletion reason if provided
      if (reason) {
        const deletionLogRef = FIRESTORE.collection("deletionLogs").doc();
        
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
      
      // Step 5: Clean up matches and conversations
      const userMatches = userData.matches || [];
      
      for (const matchId of userMatches) {
        try {
          // Remove from other user's matches array
          const otherUserRef = FIRESTORE.collection("users").doc(matchId);
          batch.update(otherUserRef, {
            matches: firestore.FieldValue.arrayRemove(userId),
          });
          
          // Delete chat if exists
          const chatId = [userId, matchId].sort().join("_");
          const chatRef = FIRESTORE.collection("chats").doc(chatId);
          batch.delete(chatRef);
        } catch (matchError) {
          console.warn(`Error cleaning up match ${matchId}:`, matchError);
        }
      }
      
      // Step 6: Commit the batch operations first
      try {
        await batch.commit();
        console.log("Batch operations completed successfully");
      } catch (batchError) {
        console.warn("Some batch operations failed:", batchError);
        // Continue with deletion even if some batch operations failed
      }
      
      // Step 7: Delete user's photos from storage
      if (userData.photos && userData.photos.length > 0) {
        for (const photoUrl of userData.photos) {
          try {
            if (photoUrl && photoUrl.includes("firebasestorage.googleapis.com")) {
              const photoRef = STORAGE.refFromURL(photoUrl);
              await photoRef.delete();
              console.log(`Deleted photo: ${photoUrl}`);
            }
          } catch (storageError: any) {
            if (storageError.code === 'storage/object-not-found') {
              console.warn(`Photo already deleted or not found: ${photoUrl}`);
            } else {
              console.warn(`Error deleting photo ${photoUrl}:`, storageError);
            }
          }
        }
      }
      
      // Step 8: Delete user subcollections first
      await deleteUserSubcollections(userId);
      
      // Step 9: Delete the main user document
      const userDocRef = FIRESTORE.collection("users").doc(userId);
      await userDocRef.delete();
      console.log("User document and all subcollections deleted successfully");
      
      // Step 10: Delete Firebase Auth account (this should work now with recent auth)
      await currentUser.delete();
      console.log("Firebase Auth account deleted successfully");
      
      // Step 11: Clear local state
      setUserData(initialUserData);
      setCurrentUser(null);
      
      // Step 12: Sign out from Google if connected
      if (userData.GoogleSSOEnabled) {
        try {
          await GoogleSignin.signOut();
        } catch (googleError) {
          console.warn("Error signing out from Google:", googleError);
        }
      }
      
      console.log("Account successfully deleted");
      
      // Step 13: Navigate to login screen
      router.navigate("onboarding/LoginSignupScreen" as any);
      
    } catch (error: any) {
      console.error("Error deleting account:", error);
      
      // Provide specific error messages
      if (error.code === 'auth/requires-recent-login') {
        throw new Error("For security, please log out and log back in within the last few minutes, then try deleting your account again.");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to delete account. Please try again later.");
      }
    }
  };

  // 💳 Create Subscription (FullCircle)
  const createSubscription = async (planType: 'monthly' | 'yearly') => {
    try {
      if (!userData.userId) {
        throw new Error("User must be logged in");
      }

      console.log(`Creating ${planType} subscription...`);
      
      const createSubscriptionFunction = FUNCTIONS.httpsCallable('createSubscription');
      const result = await createSubscriptionFunction({ planType });
      
      if (!result.data) {
        throw new Error('No data returned from Cloud Function');
      }
      
      const { clientSecret, subscriptionId, status } = result.data as SubscriptionResponse;
      
      if (!clientSecret || !subscriptionId) {
        throw new Error('Invalid response from subscription creation');
      }
      
      console.log(`✅ Subscription created successfully: ${subscriptionId}`);
      
      return { clientSecret, subscriptionId, status };
    } catch (error: any) {
      console.error('❌ Error creating subscription:', error);
      throw new Error(`Subscription creation failed: ${error.message}`);
    }
  };

  // Fixed getSubscriptionStatus function
  const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
    try {
      if (!userData.userId) {
        throw new Error("User must be logged in");
      }

      console.log('📡 Fetching subscription status...');
      const getStatusFunction = FUNCTIONS.httpsCallable('getSubscriptionStatus');
      const result = await getStatusFunction();
      
      console.log('✅ Subscription status fetched:', result.data);
      
      const subscriptionData = result.data as any;
      
      // Calculate days remaining for display
      const now = Date.now();
      const periodEnd = subscriptionData.currentPeriodEnd ? subscriptionData.currentPeriodEnd * 1000 : null;
      const daysRemaining = periodEnd ? Math.max(0, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))) : 0;
      
      // 🔧 FIX: Use the Cloud Function's isActive value directly - DON'T override it!
      const isActive = subscriptionData.isActive; // Trust the Cloud Function
      
      const canReactivate = subscriptionData.hasSubscription && 
                          subscriptionData.status === 'active' && 
                          subscriptionData.cancelAtPeriodEnd;

      // Only update if we have subscription data
      if (subscriptionData.hasSubscription && subscriptionData.subscriptionId) {
        const subscriptionUpdate: any = {
          isActive: subscriptionData.isActive,
          subscriptionId: subscriptionData.subscriptionId,
          status: subscriptionData.status,
          planType: subscriptionData.planType,
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
          updatedAt: new Date()
        };

        // Only add fields that have values
        if (subscriptionData.stripeCustomerId) {
          subscriptionUpdate.stripeCustomerId = subscriptionData.stripeCustomerId;
        }
        if (subscriptionData.currentPeriodStart) {
          subscriptionUpdate.currentPeriodStart = subscriptionData.currentPeriodStart;
        }
        if (subscriptionData.currentPeriodEnd) {
          subscriptionUpdate.currentPeriodEnd = subscriptionData.currentPeriodEnd;
        }
        if (subscriptionData.canceledAt) {
          subscriptionUpdate.canceledAt = subscriptionData.canceledAt;
        }

        // Preserve existing createdAt
        const currentSubscription = userData.subscription;
        if (currentSubscription?.createdAt) {
          subscriptionUpdate.createdAt = currentSubscription.createdAt;
        }

        console.log('🔧 Updating subscription with isActive:', subscriptionUpdate.isActive);

        // Update the subscription object
        await updateUserData({
          subscription: subscriptionUpdate
        });
      }
      
      return {
        hasSubscription: subscriptionData.hasSubscription,
        isActive: subscriptionData.isActive, // Use Cloud Function's value
        status: subscriptionData.status,
        planType: subscriptionData.planType,
        currentPeriodStart: subscriptionData.currentPeriodStart,
        currentPeriodEnd: subscriptionData.currentPeriodEnd,
        daysRemaining: daysRemaining,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
        canReactivate: canReactivate,
        subscriptionId: subscriptionData.subscriptionId
      };
      
    } catch (error: any) {
      console.error('❌ Error getting subscription status:', error);
      
      // Return fallback based on current user data
      const subscription = userData.subscription;
      const now = Date.now();
      const periodEnd = subscription?.currentPeriodEnd ? subscription.currentPeriodEnd * 1000 : null;
      const daysRemaining = periodEnd ? Math.max(0, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))) : 0;
      
      return {
        hasSubscription: !!subscription?.subscriptionId,
        isActive: subscription?.isActive || false,
        status: subscription?.status || null,
        planType: subscription?.planType || null,
        currentPeriodStart: subscription?.currentPeriodStart || null,
        currentPeriodEnd: subscription?.currentPeriodEnd || null,
        daysRemaining: daysRemaining,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
        canReactivate: subscription?.cancelAtPeriodEnd || false,
        subscriptionId: subscription?.subscriptionId
      };
    }
  };

// 5. UPDATED: Simplified reactivateSubscription  
  const reactivateSubscription = async (): Promise<ReactivateResponse> => {
    try {
      if (!userData.userId) {
        throw new Error("User must be logged in");
      }

      const subscriptionId = userData.subscription?.subscriptionId;
      if (!subscriptionId) {
        throw new Error("No subscription found to reactivate");
      }

      console.log('🔄 Reactivating subscription...', subscriptionId);
      
      const reactivateFunction = FUNCTIONS.httpsCallable('reactivateSubscription');
      const result: any = await reactivateFunction();
      
      console.log('✅ Reactivation result:', result.data);
      
      if (result.data?.success) {
        // Update ONLY the subscription object
        await updateUserData({
          subscription: {
            ...userData.subscription,
            isActive: true,
            cancelAtPeriodEnd: false,
            canceledAt: undefined,
            updatedAt: new Date()
          }
        });

        return {
          success: true,
          status: result.data.status || 'active',
          message: 'Subscription reactivated successfully'
        };
      } else {
        return {
          success: false,
          status: 'error',
          message: result.data?.message || 'Reactivation failed'
        };
      }
    } catch (error: any) {
      console.error('❌ Error reactivating subscription:', error);
      
      return {
        success: false,
        status: 'error',
        message: error.message || 'Reactivation failed'
      };
    }
  };

  // 6. UPDATED: Simplified cancelSubscription
  const cancelSubscription = async () => {
    try {
      if (!userData.userId) {
        throw new Error("User must be logged in");
      }

      console.log('Canceling subscription...');
      
      const cancelSubscriptionFunction = FUNCTIONS.httpsCallable('cancelSubscription');
      const result = await cancelSubscriptionFunction();
      
      const { status, cancelAt } = result.data as CancelResponse;
      
      // Update ONLY the subscription object
      if (userData.subscription?.subscriptionId) {
        await updateUserData({
          subscription: {
            ...userData.subscription,
            cancelAtPeriodEnd: true,
            canceledAt: cancelAt,
            status: status as any,
            updatedAt: new Date()
          }
        });
      }
      
      console.log(`Subscription will be canceled at: ${new Date(cancelAt * 1000)}`);
      return { status, cancelAt };
      
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      throw new Error(`Subscription cancellation failed: ${error.message}`);
    }
  };

  const getSubscriptionInfo = (userData: UserDataType) => {
    const subscription = userData.subscription;
    
    if (!subscription?.subscriptionId) {
      return {
        hasSubscription: false,
        isActive: false,
        displayText: "No active subscription",
        timeRemaining: null,
        canUpgrade: true,
        canCancel: false,
        canReactivate: false,
        planType: null,
        daysRemaining: 0
      };
    }

    const now = Date.now();
    const periodEnd = subscription.currentPeriodEnd ? subscription.currentPeriodEnd * 1000 : null;
    const daysRemaining = periodEnd ? Math.max(0, Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24))) : 0;
    
    const isActive = subscription.isActive && 
                    subscription.status === 'active' && 
                    periodEnd && 
                    periodEnd > now;
    
    const isCanceled = subscription.cancelAtPeriodEnd;
    const isProcessing = subscription.status === 'incomplete';
    
    let displayText = "";
    let timeRemaining: any = "";
    
    if (isProcessing) {
      displayText = "Subscription Processing";
      timeRemaining = "Payment is being processed";
    } else if (isActive && !isCanceled) {
      displayText = `FullCircle ${subscription.planType === 'yearly' ? 'Yearly' : 'Monthly'} Active`;
      timeRemaining = daysRemaining > 0 
        ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
        : "Expires today";
    } else if (isActive && isCanceled) {
      displayText = "Subscription Ending Soon";
      timeRemaining = daysRemaining > 0 
        ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`
        : "Expires today";
    } else if (subscription.status === 'canceled') {
      displayText = "Subscription Canceled";
      timeRemaining = null;
    } else {
      displayText = `Subscription ${subscription.status || 'Inactive'}`;
      timeRemaining = null;
    }

    return {
      hasSubscription: true,
      isActive: isActive || isProcessing,
      displayText,
      timeRemaining,
      canUpgrade: !isActive && !isProcessing,
      canCancel: Boolean(isActive && !isCanceled),
      canReactivate: Boolean(isCanceled && isActive),
      planType: subscription.planType,
      daysRemaining: daysRemaining
    };
  };

  // 💳 Purchase Radiance Boosts
  const purchaseRadiance = async (boostCount: number) => {
    try {
      if (!userData.userId) {
        throw new Error("User ID is required");
      }

      console.log(`Creating payment for ${boostCount} boosts...`);
      
      const createPaymentFunction = FUNCTIONS.httpsCallable('createRadiancePayment');
      const result = await createPaymentFunction({ boostCount });
      
      const { clientSecret, paymentIntentId, amount } = result.data as PaymentIntent;
      
      console.log(`Payment intent created: ${paymentIntentId} for $${amount / 100}`);
      
      return { clientSecret, paymentIntentId };
    } catch (error: any) {
      console.error("Failed to create radiance payment:", error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  };

  // 💳 Confirm Radiance Payment (after Stripe payment succeeds)
  const confirmRadiancePayment = async (paymentIntentId: string) => {
    try {
      if (!userData.userId) {
        throw new Error("User ID is required");
      }

      console.log(`🔄 Confirming payment: ${paymentIntentId}`);
      console.log(`👤 User ID: ${userData.userId}`);
      
      const confirmPaymentFunction = FUNCTIONS.httpsCallable('confirmRadiancePayment');
      
      console.log('📞 Calling confirmRadiancePayment function...');
      const result = await confirmPaymentFunction({ paymentIntentId });
      
      console.log('✅ Function call successful:', result);
      
      const { success, boostCount, totalPrice, transactionId } = result.data as PaymentResult;
      
      if (success) {
        // Update local state with new boost count
        const purchase: BoostPurchase = {
          boostCount,
          totalPrice,
          purchaseDate: new Date(),
          transactionId,
          stripePaymentIntentId: paymentIntentId,
          status: 'succeeded'
        };
        
        setUserData(prevData => ({
          ...prevData,
          activeBoosts: (prevData.activeBoosts || 0) + boostCount,
          boostPurchases: [
            ...(prevData.boostPurchases || []),
            purchase
          ]
        }));
        
        console.log(`✅ Successfully confirmed purchase of ${boostCount} boosts`);
        return { success: true, boostCount, totalPrice };
      } else {
        throw new Error('Payment confirmation failed');
      }
    } catch (error: any) {
      console.error("❌ Failed to confirm radiance payment:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error details:", error.details);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  };

  const createRadiancePaymentIntent = async (boostCount: number) => {
    try {
      console.log(`🚀 Creating payment intent for ${boostCount} boosts...`);
      
      const createPayment = FUNCTIONS.httpsCallable('createRadiancePayment');
      const result = await createPayment({ boostCount });
      
      console.log('✅ Payment intent created:', result.data);
      
      return result.data;
    } catch (error: any) {
      console.error('❌ Payment intent creation failed:', error);
      throw error;
    }
  };
  
  const activateRadiance = async () => {
    try {
      if (!userData.userId || !userData.activeBoosts || userData.activeBoosts <= 0) {
        throw new Error("No boosts available to activate");
      }

      // Calculate expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Update Firestore
      await FIRESTORE.collection('users').doc(userData.userId).update({
        boostExpiresAt: firestore.FieldValue.serverTimestamp(),
        activeBoosts: userData.activeBoosts - 1,
      });

      // Update local state
      setUserData(prevData => ({
        ...prevData,
        boostExpiresAt: expiresAt, // Set local expiration
        activeBoosts: (prevData.activeBoosts || 1) - 1,
      }));

      console.log('✨ Radiance activated successfully!');
    } catch (error: any) {
      console.error("Failed to activate radiance:", error);
      throw error;
    }
  };

  const hasActiveRadiance = (userData: UserDataType): boolean => {
    // Silent check - no console.log
    if (!userData.boostExpiresAt) {
      return false;
    }
    
    const expiresAt = userData.boostExpiresAt.toDate 
      ? userData.boostExpiresAt.toDate()
      : new Date(userData.boostExpiresAt);
    
    return new Date() < expiresAt;
  };

  const getRadianceStatus = useCallback(() => {
    const timeRemaining = getRadianceTimeRemaining ? getRadianceTimeRemaining() : 0;
    const isActive = timeRemaining > 0;
    
    return {
      isActive,
      timeRemaining,
      expiresAt: userData.boostExpiresAt,
      formattedTime: isActive ? formatRadianceTime(timeRemaining) : null
    };
  }, [userData.boostExpiresAt, getRadianceTimeRemaining]);

  // Helper function to format radiance time
  const formatRadianceTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    getRemainingDailyLikes,
    DAILY_LIKE_LIMIT,
    createSubscription,
    reactivateSubscription,
    cancelSubscription,
    getSubscriptionStatus,
    getSubscriptionInfo,
    purchaseRadiance,
    confirmRadiancePayment,
    activateRadiance,
    getRadianceTimeRemaining,
    hasActiveRadiance,
    getRadianceStatus,
    formatRadianceTime,
    isUserBoosted,
    isUserRecentlyActive,
    createRadiancePaymentIntent,
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
