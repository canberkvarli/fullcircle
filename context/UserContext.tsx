import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH, FIRESTORE, STORAGE, FUNCTIONS } from "@/services/FirebaseConfig";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { appleAuth } from '@invertase/react-native-apple-authentication';
import auth from "@react-native-firebase/auth";
import { AuthDebug } from "@/utils/AuthDebug";
import firestore from "@react-native-firebase/firestore";

import { AppState } from "react-native";
import NotificationService from "@/services/NotificationService";
import { Colors } from '@/constants/Colors';

export type UserDataType = {
  userId: string;
  createdAt: any;
  lastActive?: any;
  isSeedUser: boolean;
  numOfLotus?: number;
  lotusPurchases?: LotusPurchase[];
  lastLotusAssignedAt?: any;
  currentOnboardingScreen: string;
  phoneNumber: string;
  verificationId?: string | null;
  countryCode: string;
  areaCode: string;
  number: string;
  email: string; // Required email address
  GoogleSSOEnabled?: boolean;
  AppleSSOEnabled?: boolean;
  marketingRequested?: boolean;
  firstName?: string;
  familyName?: string;
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
    canceledAt?: any; // Unix timestamp
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

export interface LotusPurchase {
  lotusCount: number;
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
  lotusCount: number;
  totalPrice: number;
  transactionId: string;
}

export type UserSettings = {
  isPaused?: boolean;
  showLastActiveStatus?: boolean;
  selfieVerification?: {
    isVerified: boolean;
    verifiedAt: Date | null;
    status: 'verified' | 'failed' | 'not_verified';
    reason: string | null;
    lastAttemptAt: Date | null;
    lastVerifiedAt: Date | null;
  };
  pushNotifications?: PushNotificationSettings;
  pushToken?: string;
  notificationPermissionStatus?: 'granted' | 'denied' | 'not-requested';
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
  viaLotus: boolean;
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
  appleCredential: FirebaseAuthTypes.AuthCredential | null;
  setAppleCredential: React.Dispatch<
    React.SetStateAction<FirebaseAuthTypes.AuthCredential | null>
  >;
  handleGoogleSignIn: () => Promise<void>;
  handleAppleSignIn: () => Promise<void>;
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
  fetchUserData: (userId: string, isSSO: boolean) => Promise<UserDataType | null>;
  fetchUserById: (userId: string) => void;
  getIdToken: () => Promise<string | null>;
  currentUser: FirebaseAuthTypes.User | null;
  setCurrentUser: React.Dispatch<
    React.SetStateAction<FirebaseAuthTypes.User | null>
  >;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
  likeMatch: (matchId: string) => any;
  lotusLike: (matchId: string) => Promise<void>;
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
  markNewMatchAsRead: (chatId: string, userId: string) => Promise<void>;
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
  createLotusPaymentIntent: (lotusCount: number) => Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }>;
  confirmLotusPayment: (paymentIntentId: string) => Promise<{
    success: boolean;
    lotusCount: number;
    totalPrice: number;
  }>;
  isUserBoosted: (userData: UserDataType) => boolean;
  isUserRecentlyActive: (userData: UserDataType) => boolean;
  
  // 🧪 Testing Functions (remove in production)
  createRadiancePaymentIntent: any;
  
  // 🪷 Cloud Function Testing (remove in production)
  testWeeklyLotusFunction: () => Promise<any>;
  
  // 🎯 Utility Functions
  getUserCompatibilityScore: (otherUser: UserDataType) => number;
  calculateUserDistance: (otherUser: UserDataType) => number | null;
  refreshPreferencesHash: () => string;
  getUserStats: () => {
    totalLikes: number;
    totalMatches: number;
    totalDislikes: number;
    lotusCount: number;
    activeBoosts: number;
    isBoosted: boolean;
    isRecentlyActive: boolean;
    onboardingCompleted: boolean;
    hasSpiritualProfile: boolean;
    subscriptionStatus: string;
    lastActive: any;
    createdAt: any;
  };
  validateUserData: () => {
    isValid: boolean;
    issues: string[];
    score: number;
  };
  checkAndRefetchIfNeeded: () => void;
  forceRefetchOnReturn: () => Promise<void>;
  // 🔑 Add initializing state to track auth initialization
  initializing: boolean;
  // 🔒 Add cancellation flag to track sign out state
  isSigningOut: boolean;
  // 🔔 Add notification permission request function
  requestNotificationPermissions: () => Promise<{ success: boolean; message: string } | undefined>;

};

// Initial screens and initial user data
const initialScreens = [
  "LandingPageScreen",
  "LoginSignupScreen",
  "PhoneNumberScreen",
  "PhoneVerificationScreen",
  "NameScreen",
  "FamilyNameScreen",
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
  // 🔒 INITIAL USER DATA: Default state for new users
  const initialUserData: UserDataType = {
    userId: '',
    createdAt: null,
    lastActive: null,
    isSeedUser: false,
    currentOnboardingScreen: 'NameScreen',
    phoneNumber: '',
    verificationId: null,
    countryCode: '',
    areaCode: '',
    number: '',
    email: '', // Required email field
    onboardingCompleted: false,
    dailyLikesCount: 0,
    lastLikeResetDate: null,
    DAILY_LIKE_LIMIT: 8,
    likesGivenCount: 0,
    likesReceivedCount: 0,
    dislikesGivenCount: 0,
    dislikesReceivedCount: 0,
    matches: [],
    reportedUsers: [],
    unmatchedUsers: [],
    activeBoosts: 0,
    boostExpiresAt: null,
    boostPurchases: [],
    lotusPurchases: [],
    numOfLotus: 0,
    lastLotusAssignedAt: null,
    matchPreferences: {
      preferredAgeRange: { min: 18, max: 100 },
      preferredHeightRange: { min: 3, max: 8 },
      preferredDistance: 50,
      connectionIntent: 'both',
      connectionPreferences: [],
      connectionStyles: [],
      spiritualCompatibility: {
        spiritualDraws: [],
        practices: [],
        healingModalities: []
      },
      datePreferences: []
    },
    spiritualProfile: {
      draws: [],
      practices: [],
      healingModalities: []
    },
    subscription: {
      isActive: false
    },
    settings: {
      isPaused: false,
      showLastActiveStatus: true,
      selfieVerification: {
        isVerified: false,
        verifiedAt: null,
        status: 'not_verified',
        reason: null,
        lastAttemptAt: null,
        lastVerifiedAt: null
      },
      pushNotifications: {
        enableAll: true,
        muteAll: false,
        newLikes: true,
        newMatches: true,
        newMessages: true,
        promotions: true,
        announcements: true,
      },
      notificationPermissionStatus: 'not-requested',
      connectedAccounts: {
        google: false,
        apple: false,
      },
    }
  };

  const [currentOnboardingScreen, setcurrentOnboardingScreen] =
    useState<string>(initialScreens[0]);
  const [screens, setScreens] = useState<string[]>(initialScreens);
  const [userData, setUserData] = useState<UserDataType>({} as UserDataType);
  const [googleUserData, setGoogleUserData] =
    useState<UserDataType>(initialUserData);
  const [googleCredential, setGoogleCredential] =
    useState<FirebaseAuthTypes.AuthCredential | null>(null);
  const [appleCredential, setAppleCredential] =
    useState<FirebaseAuthTypes.AuthCredential | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User | null>(
    null
  );
  const [initializing, setInitializing] = useState(true);
  const [chatMatches, setChatMatches] = useState<MatchType[]>([]);
  const [unreadMatchesCount, setUnreadMatchesCount] = useState(0);
  const [isLinking, setIsLinking] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  // 🔒 CANCELLATION FLAG: Use ref for reliable access in async functions
  const isSigningOutRef = useRef(false);

  const [authStateVersion, setAuthStateVersion] = useState(0); // Track auth state changes
  const userDataRef = useRef<UserDataType>(userData);
  const router = useRouter();
  
  // 🔒 Prevent rapid auth state changes
  const lastAuthStateChangeRef = useRef<{
    userId: string | null;
    timestamp: number;
  } | null>(null);

  // 🔒 SINGLE SOURCE OF TRUTH: Get the authoritative user ID
  const getAuthoritativeUserId = useCallback((): string | null => {
    // Priority 1: Firebase Auth current user (most authoritative)
    if (FIREBASE_AUTH.currentUser?.uid) {
      return FIREBASE_AUTH.currentUser.uid;
    }
    // Priority 2: Context current user
    if (currentUser?.uid) {
      return currentUser.uid;
    }
    // Priority 3: User data (may be stale)
    if (userData?.userId) {
      return userData.userId;
    }
    return null;
  }, [currentUser?.uid, userData?.userId]);

  // 🔄 SMART STATE SYNC: Keeps all user references in sync
  const syncUserState = useCallback((user: FirebaseAuthTypes.User | null) => {
    // Always update currentUser state to ensure metadata is current
    setCurrentUser(user);
    
    // Increment auth state version to trigger re-renders
    setAuthStateVersion(prev => prev + 1);
    
    console.log("🔄 Syncing user state:", {
      firebaseUid: user?.uid,
      contextUid: currentUser?.uid,
      userDataUid: userData?.userId,
      authStateVersion: authStateVersion + 1
    });
  }, [currentUser?.uid, userData?.userId, authStateVersion]);



  const getWebClientId = () => {
    const env = process.env.EXPO_PUBLIC_ENV || 'development';
    
    switch (env) {
      case 'production':
        return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      case 'staging':
        return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      default:
        return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    }
  };

  const webClientId = getWebClientId();
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

  // Register for push notifications when user data is available AND onboarding is completed
  useEffect(() => {
    if (userData?.userId && userData?.onboardingCompleted && !userData?.settings?.pushToken) {
      registerForPushNotifications();
    }
  }, [userData?.userId, userData?.onboardingCompleted, userData?.settings?.pushToken]);

  useEffect(() => {
    console.log("Setting up Firebase auth state change listener and app state monitor");
    
    // Set up the auth state listener - ONLY ONE LISTENER
    const subscriber = FIREBASE_AUTH.onAuthStateChanged((user) => {
      console.log("🔑 Auth state change detected:", user ? `User ${user.uid}` : "No user");
      onAuthStateChanged(user);
    });
    
    // 🔑 CRITICAL FIX: Add timeout fallback to ensure initializing is set to false
    // This prevents the app from being stuck in loading state if auth listener is slow
    const initializationTimeout = setTimeout(() => {
      setInitializing((prevInitializing) => {
        if (prevInitializing) {
          console.log("⚠️ Auth initialization timeout reached, forcing initializing to false");
          return false;
        }
        return prevInitializing;
      });
    }, 3000); // 3 second timeout
    
    // 🔑 ADDITIONAL FIX: Check if user is already authenticated immediately
    // This handles the case where the user is already signed in when the app starts
    const checkExistingAuth = async () => {
      const existingUser = FIREBASE_AUTH.currentUser;
      setInitializing((prevInitializing) => {
        if (existingUser && prevInitializing) {
          console.log("🔑 User already authenticated on app start, processing immediately");
          // Process the existing auth state asynchronously
          onAuthStateChanged(existingUser).catch(error => {
            console.error("Error processing existing auth state:", error);
            setInitializing(false);
          });
          return prevInitializing; // Keep initializing true until onAuthStateChanged completes
        }
        return prevInitializing;
      });
    };
    
    // Check existing auth state after a short delay to allow Firebase to initialize
    const existingAuthCheck = setTimeout(checkExistingAuth, 500);
    
    // Add AppState listener to detect when app goes to background/foreground
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log(`App state changed to: ${nextAppState}`);
      
      // When app comes back to foreground, check auth state and update if needed
      if (nextAppState === 'active') {
        console.log('App is now active, checking authentication state');
        const currentUser = FIREBASE_AUTH.currentUser;
        
        if (currentUser) {
          console.log(`Current user detected on app resume: ${currentUser.uid}`);
          // Update last active timestamp
          updateLastActive();
          
          // If we have a user but no userData, refetch
          if (currentUser.uid && (!userData.userId || userData.userId !== currentUser.uid)) {
            console.log('User data mismatch on resume, refetching user data');
            fetchUserData(currentUser.uid, 
              currentUser.providerData.some(provider => provider.providerId === "google.com")
            ).catch(err => console.error('Error refetching user data:', err));
          }
          
          // 🔑 CRITICAL: Force sync of currentUser state with Firebase Auth
          setCurrentUser((prevCurrentUser) => {
            if (!prevCurrentUser || 
                prevCurrentUser.uid !== currentUser.uid || 
                prevCurrentUser.metadata?.lastSignInTime !== currentUser.metadata?.lastSignInTime) {
              console.log('🔄 Forcing currentUser state sync on app resume');
              return currentUser;
            }
            return prevCurrentUser;
          });
        } else if (userData.userId) {
          console.log('No current user but userData exists, clearing userData');
          setUserData(initialUserData);
        }
      }
    });
    
    // 🔑 ADDITIONAL: Set up periodic auth state check to ensure synchronization
    const authSyncInterval = setInterval(() => {
      const firebaseUser = FIREBASE_AUTH.currentUser;
      if (firebaseUser && currentUser && 
          (firebaseUser.uid !== currentUser.uid || 
           firebaseUser.metadata?.lastSignInTime !== currentUser.metadata?.lastSignInTime)) {
        console.log('🔄 Periodic auth sync: updating currentUser state');
        setCurrentUser(firebaseUser);
      }
    }, 5000); // Check every 5 seconds
    
    // Return cleanup function
    return () => {
      console.log("Cleaning up Firebase auth state change listener and app state monitor");
      subscriber();
      appStateSubscription.remove();
      clearInterval(authSyncInterval);
      clearTimeout(initializationTimeout);
      clearTimeout(existingAuthCheck);
    };
  }, [userData.userId, currentUser?.uid, currentUser?.metadata?.lastSignInTime]);

  const buildExclusionSet = useCallback(async (userId: string): Promise<Set<string>> => {
    if (!userId) return new Set();
    
    
    
    try {
      // 🔄 ENHANCED: Parallel fetch of ALL exclusion data
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
        FIRESTORE.collection("users").doc(userId).collection("reportedUsers").get(),
        FIRESTORE.collection("users").doc(userId).collection("unmatchedUsers").get(),
      ]);
      
      // �� PRIORITIZED EXCLUSIONS: Order matters for Firestore's 10-user limit
      const criticalExclusions = [
        userId, // 1. Always exclude self (MOST CRITICAL)
        ...matchesSnap.docs.map(doc => doc.id), // 2. Current matches (CRITICAL)
        ...reportsSnap.docs.map(doc => doc.data().reportedUserId || doc.id), // 3. Reported users (CRITICAL)
        ...unmatchesSnap.docs.map(doc => doc.data().unmatchedUserId || doc.id), // 4. Unmatched users (CRITICAL)
        ...dislikesSnap.docs.map(doc => doc.id), // 5. Dislikes (CRITICAL)
        ...likesSnap.docs.map(doc => doc.id), // 6. Likes given (CRITICAL)
      ];
      
      // 🧠 SMART: Add received likes only if we have room (REDUCED TO PREVENT TOO MANY EXCLUSIONS)
      const maxExclusionSize = __DEV__ ? 15 : 15; // Reduced from 25/50 to 15
      if (criticalExclusions.length < maxExclusionSize) {
        receivedLikesSnap.docs.forEach(doc => {
          if (criticalExclusions.length < maxExclusionSize) {
            criticalExclusions.push(doc.id);
          }
        });
      }
      
      console.log(`🔍 Built exclusion set: ${criticalExclusions.length} total exclusions`);
      console.log(`🔍 Critical exclusions: ${criticalExclusions.slice(0, 10).length} (Firestore will handle)`);
      console.log(`🔍 Additional exclusions: ${Math.max(0, criticalExclusions.length - 10)} (client-side will handle)`);
      
      // 🎯 RETURN AS ARRAY: Maintain priority order for Firestore query
      return new Set(criticalExclusions);
      
    } catch (error) {
      console.error('❌ Error building exclusion set:', error);
      return new Set([userId]); // Fallback to just excluding self
    }
  }, []);

  const generatePreferencesHash = useCallback((prefs: typeof userData.matchPreferences) => {
    if (!prefs) {
      console.log('🔍 generatePreferencesHash: No preferences provided');
      return '';
    }
    
    // 🔧 ENHANCED DEBUGGING: Log the raw preferences data
    console.log('🔍 generatePreferencesHash - Raw preferences:', {
      preferredAgeRange: prefs.preferredAgeRange,
      preferredHeightRange: prefs.preferredHeightRange,
      preferredDistance: prefs.preferredDistance,
      connectionIntent: prefs.connectionIntent,
      spiritualCompatibility: prefs.spiritualCompatibility
    });
    
    // 🔧 FOCUSED: Only hash the fields that actually affect filtering
    const hashData = {
      ageMin: prefs.preferredAgeRange?.min || 18,
      ageMax: prefs.preferredAgeRange?.max || 70,
      heightMin: prefs.preferredHeightRange?.min || 3,
      heightMax: prefs.preferredHeightRange?.max || 8,
      distance: prefs.preferredDistance || 100,
      connectionIntent: prefs.connectionIntent || 'both',
      // Include connection preferences and styles that affect filtering
      connectionPreferences: (prefs.connectionPreferences && prefs.connectionPreferences.length > 0) ? 
        [...prefs.connectionPreferences].sort() : [],
      connectionStyles: (prefs.connectionStyles && prefs.connectionStyles.length > 0) ? 
        [...prefs.connectionStyles].sort() : [],
      // Only include spiritual fields if they're not empty arrays
      spiritualDraws: (prefs.spiritualCompatibility?.spiritualDraws && prefs.spiritualCompatibility.spiritualDraws.length > 0) ? 
        [...prefs.spiritualCompatibility.spiritualDraws].sort() : [],
      spiritualPractices: (prefs.spiritualCompatibility?.practices && prefs.spiritualCompatibility.practices.length > 0) ? 
        [...prefs.spiritualCompatibility.practices].sort() : [],
      healingModalities: (prefs.spiritualCompatibility?.healingModalities && prefs.spiritualCompatibility.healingModalities.length > 0) ? 
        [...prefs.spiritualCompatibility.healingModalities].sort() : [],
    };
    
    const hash = JSON.stringify(hashData);
    console.log('🔍 Generated preferences hash:', {
      connectionIntent: hashData.connectionIntent,
      connectionPreferences: hashData.connectionPreferences,
      connectionStyles: hashData.connectionStyles,
      ageRange: `${hashData.ageMin}-${hashData.ageMax}`,
      heightRange: `${hashData.heightMin}-${hashData.heightMax}`,
      distance: hashData.distance,
      hashLength: hash.length,
      rawData: hashData, // 🔧 ADDED: Show raw data for debugging
      // 🔧 ENHANCED: Show the actual hash string
      hashString: hash.substring(0, 100) + '...'
    });
    return hash;
  }, []);

  const buildMatchQuery = useCallback((
    exclusionSet: Set<string>,
    lastDoc: any = null,
    batchSize: number = 5
  ) => {
    const baseCollection = FIRESTORE.collection("users");
    
    // 🔧 SIMPLE & SAFE: Basic query without complex exclusions
    let query = baseCollection
      .where("onboardingCompleted", "==", true);
    
    // 🔧 COMPLETELY NEW APPROACH: No more not-in queries - fetch more users and filter client-side
    // This avoids all Firestore not-in limitations and errors
    // 🔧 STRATEGY: Fetch 2x the batch size to account for exclusions
    const fetchSize = Math.max(batchSize * 2, 10); // At least 10 users to ensure we have enough after filtering
    
    // Add ordering and pagination
    query = query.orderBy("createdAt", "desc").limit(fetchSize);
    
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    
    console.log(`🔧 NEW STRATEGY: Fetching ${fetchSize} users (2x batch size) to filter client-side, exclusions: ${exclusionSet.size}`);
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



  // 🪷 Real-time listener for lotus updates from cloud function
  useEffect(() => {
    if (!userData.userId) return;

    const userRef = FIRESTORE.collection("users").doc(userData.userId);
    const unsubscribe = userRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          // Update lotus-related fields in real-time
          setUserData((prev) => ({
            ...prev,
            numOfLotus: data.numOfLotus ?? prev.numOfLotus,
            lastLotusAssignedAt: data.lastLotusAssignedAt ?? prev.lastLotusAssignedAt,
          }));
        }
      }
    }, (error) => {
      console.error('Error listening to lotus updates:', error);
    });

    return () => unsubscribe();
  }, [userData.userId]);

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
      // count those where the *other* user was the last sender OR it's a new match (no messages yet)
      // This encourages users to start conversations with new matches
      const unreadCount = detailed.filter((m) => {
        // If it's a new match (no last message), it's unread
        if (!m.lastMessage || !m.lastMessageSender) return true;
        
        // If the current user sent the last message, it's not unread
        if (m.lastMessageSender === userData.userId) return false;
        
        // If someone else sent the last message, it's unread
        return true;
      }).length;
      
      // If we have no matches but still have an unread count, reset it
      if (detailed.length === 0 && unreadCount > 0) {
        setUnreadMatchesCount(0);
      } else {
        setUnreadMatchesCount(unreadCount);
      }
    });
    return () => unsub();
  }, [userData.userId, userData.onboardingCompleted]);

  // 🚀 MODERN AUTH STATE MANAGEMENT - Eliminates Race Conditions
  const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
    // Ignore auth state changes if linking is in progress
    if (isLinking) {
      AuthDebug.info("UserContext", "Linking in progress, ignoring onAuthStateChanged update");
      return;
    }
    
    // 🔒 Prevent rapid successive auth state changes from the same user
    const now = Date.now();
    if (user && lastAuthStateChangeRef.current && 
        lastAuthStateChangeRef.current.userId === user.uid && 
        (now - lastAuthStateChangeRef.current.timestamp) < 1000) { // Increased to 1 second
      console.log("🧭 Ignoring rapid auth state change for same user", {
        userId: user.uid,
        timeSinceLastChange: now - lastAuthStateChangeRef.current.timestamp
      });
      return;
    }
    
    // 🔒 ADDITIONAL: Prevent multiple rapid calls to handleUserNavigation for the same user
    if (user && lastAuthStateChangeRef.current && 
        lastAuthStateChangeRef.current.userId === user.uid && 
        (now - lastAuthStateChangeRef.current.timestamp) < 2000) { // 2 second window
      console.log("🧭 Skipping handleUserNavigation call - too recent for same user", {
        userId: user.uid,
        timeSinceLastChange: now - lastAuthStateChangeRef.current.timestamp
      });
      // Still update the timestamp but don't proceed with navigation
      lastAuthStateChangeRef.current = { userId: user.uid, timestamp: now };
      return;
    }
    
    // 🔒 SIGN-OUT PROTECTION: Prevent multiple rapid "No user" auth state changes
    if (!user && lastAuthStateChangeRef.current && 
        lastAuthStateChangeRef.current.userId === null && 
        (now - lastAuthStateChangeRef.current.timestamp) < 1500) { // 1.5 second window
      console.log("🧭 Ignoring rapid sign-out auth state change", {
        timeSinceLastChange: now - lastAuthStateChangeRef.current.timestamp
      });
      return;
    }
    
    // Update last auth state change tracking
    if (user) {
      lastAuthStateChangeRef.current = { userId: user.uid, timestamp: now };
    } else {
      lastAuthStateChangeRef.current = { userId: null, timestamp: now };
    }
    
    AuthDebug.trackFlowStep('AuthStateChange', 'Started', { 
      userId: user?.uid,
      hasProviders: user?.providerData?.length,
      providers: user?.providerData?.map(p => p.providerId)
    });
    
    // 🔄 SMART STATE SYNC: Only sync when there's a user (not on sign out)
    if (user) {
      syncUserState(user);
    }
    
    // Check if this is actually a new auth state or just a duplicate event
    const hasUserChanged = 
      (!currentUser && user) || 
      (currentUser && !user) || 
      (currentUser?.uid !== user?.uid) ||
      (currentUser?.metadata?.lastSignInTime !== user?.metadata?.lastSignInTime);
        
    console.log("🔑 Auth state changed:", 
      user ? `User ${user.uid} signed in` : "No user", 
      hasUserChanged ? "(NEW)" : "(DUPLICATE)",
      user ? `lastSignIn: ${user.metadata?.lastSignInTime}` : "");
    
    if (initializing) setInitializing(false);
  
    if (user) {

      
      const isGoogleLogin = user.providerData.some(
        (provider) => provider.providerId === "google.com"
      );

      const isAppleLogin = user.providerData.some(
        (provider) => provider.providerId === "apple.com"
      );

      const isSSOLogin = isGoogleLogin || isAppleLogin;
  
      AuthDebug.trackFlowStep('AuthStateChange', 'User Authenticated', { 
        userId: user.uid,
        isSSO: isSSOLogin,
        providers: user.providerData.map(p => p.providerId)
      });
      

      
      try {
        // 🔒 SINGLE SOURCE OF TRUTH: Use authoritative user ID
        const authoritativeUserId = getAuthoritativeUserId();
        
        if (!authoritativeUserId || authoritativeUserId !== user.uid) {
          console.error("🚨 CRITICAL: User ID mismatch detected!");
          AuthDebug.error('AuthStateChange', 'User ID mismatch', { 
            firebaseUid: user.uid, 
            authoritativeUid: authoritativeUserId 
          });
          return;
        }
        
        // IMPROVED: More reliable detection of user state
        const hasPhoneProvider = user.providerData.some(
          (provider) => provider.providerId === "phone"
        );
        
        // Check if we need to fetch user data
        const needsFetch = 
          hasUserChanged || 
          !userData.userId || 
          userData.userId !== user.uid ||
          (hasPhoneProvider && (!userData.phoneNumber || userData.currentOnboardingScreen === "PhoneVerificationScreen"));
        
        console.log("Auth fetch check:", { 
          hasUserChanged,
          userDataLoaded: !!userData.userId,
          userDataMatches: userData.userId === user.uid,
          hasPhoneProvider, 
          userPhoneNumber: userData.phoneNumber,
          currentScreen: userData.currentOnboardingScreen,
          needsFetch,
          authStateVersion
        });
        
        // 🔒 SAFETY CHECK: Only fetch if we have a valid user
        if (needsFetch && user && user.uid) {
          console.log(`⚠️ Calling fetchUserData from onAuthStateChanged for ${isSSOLogin ? 'SSO' : 'Phone'} user: ${user.uid}`);
          const fetchedUserData = await fetchUserData(user.uid, isSSOLogin);
          
          if (fetchedUserData) {
            // NAVIGATION LOGIC - This is the single source of truth for where to go
            console.log(`🧭 onAuthStateChanged calling handleUserNavigation for user ${user.uid}`);
            await handleUserNavigation(fetchedUserData, isSSOLogin);
          }
        } else {
          console.log("User data already loaded, skipping fetchUserData");
          // FIX: Even if we don't need to fetch, still update last active status
          if (user && user.uid) {
            updateLastActive();
          }
        }
        
        // State sync already happened at the beginning of the function
      } catch (error) {
        console.error("Error in onAuthStateChanged:", error);
        if (user && user.uid) {
          AuthDebug.error('AuthStateChange', 'Error processing authenticated user', { error, userId: user.uid });
        }
      }
    } else {
      AuthDebug.trackFlowStep('AuthStateChange', 'User Signed Out');
      console.log("User signed out, resetting user data");
      
      // Always reset user data on sign out
      setUserData(initialUserData);
      
      // State sync already happened at the beginning of the function
      
      // Navigate to login screen on sign out (always)
      router.replace("onboarding/LoginSignupScreen" as any);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      AuthDebug.trackFlowStep('GoogleSignIn', 'Started');
      
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      AuthDebug.trackFlowStep('GoogleSignIn', 'Google credential obtained');
      
      const { user } = await FIREBASE_AUTH.signInWithCredential(googleCredential);
      if (!user) {
        throw new Error('Failed to get user from credential');
      }
      setGoogleCredential(googleCredential);
      setCurrentUser(user);
      
      // 🔄 MODERN STATE SYNC: Keep user references in sync
      syncUserState(user);
      
      AuthDebug.trackFlowStep('GoogleSignIn', 'Firebase auth successful', { userId: user.uid });
      
      if (user) {
        const userDocRef = FIRESTORE.collection("users").doc(user.uid);
        const docSnap = await userDocRef.get();
        const userFirstName = user.displayName?.split(" ")[0] || "";
        const userFamilyName = user.displayName?.split(" ")[1] || "";
        const userFullName = user.displayName || "";
        if (docSnap.exists) {
          // Existing user - update their data
          const existingUser = docSnap.data() as UserDataType;
          
          const userDataToUpdate: Partial<UserDataType> = {
            ...existingUser,
            userId: user.uid,
            email: user.email || "",
            firstName: userFirstName || existingUser.firstName,
            familyName: userFamilyName || existingUser.familyName,
            fullName: userFullName || existingUser.fullName,
            GoogleSSOEnabled: true,
            settings: {
              ...existingUser?.settings,
              connectedAccounts: {
                ...existingUser?.settings?.connectedAccounts,
                google: true,
              },
            },
          };
          
          // Update user data but DON'T navigate - let onAuthStateChanged handle it
          await updateUserData(userDataToUpdate);
          
          AuthDebug.trackFlowStep('GoogleSignIn', 'Updated existing user data');
          
          // Let onAuthStateChanged handle navigation automatically
        } else {
          // New user - create document
          AuthDebug.trackFlowStep('GoogleSignIn', 'Creating new user document');
          
          const userDataToUpdate: Partial<UserDataType> = {
            ...initialUserData,
            userId: user.uid,
            createdAt: firestore.FieldValue.serverTimestamp(),
            email: user.email || "",
            firstName: userFirstName,
            familyName: userFamilyName,
            fullName: userFullName,
            GoogleSSOEnabled: true,
            currentOnboardingScreen: "PhoneNumberScreen",
          };
          
          await userDocRef.set(userDataToUpdate);
          
          AuthDebug.trackFlowStep('GoogleSignIn', 'New user created');
        }
      }
    } catch (error: any) {
      AuthDebug.error('GoogleSignIn', 'Google sign-in error', error);
      console.error("Google sign-in error:", error);
    }
  };

  const handleAppleSignIn = async (): Promise<void> => {
    try {
      console.log('🍎 Apple Sign-In: Starting...');
      AuthDebug.trackFlowStep('AppleSignIn', 'Started');
      
      // Check if Apple Sign-In is supported
      const isSupported = await appleAuth.isSupported;
      console.log('🍎 Apple Sign-In supported:', isSupported);
      
      if (!isSupported) {
        throw new Error('Apple Sign-In is not supported on this device');
      }
      
      // Perform the Apple sign-in request
      console.log('🍎 Apple Sign-In: Performing request...');
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        // Note: FULL_NAME first is important for correct data retrieval
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      
      console.log('🍎 Apple Sign-In response received:', {
        hasIdentityToken: !!appleAuthRequestResponse.identityToken,
        hasNonce: !!appleAuthRequestResponse.nonce,
        hasFullName: !!appleAuthRequestResponse.fullName,
        hasEmail: !!appleAuthRequestResponse.email
      });
      
      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }
      
      AuthDebug.trackFlowStep('AppleSignIn', 'Apple auth response received');
      
      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      
      AuthDebug.trackFlowStep('AppleSignIn', 'Apple credential obtained');
      
      let user: FirebaseAuthTypes.User;
      
      // Check if there's already an authenticated user to link to
      if (FIREBASE_AUTH.currentUser) {
        // Link Apple credential to existing user
        console.log('🔗 Linking Apple credential to existing user:', FIREBASE_AUTH.currentUser.uid);
        const userCredential = await FIREBASE_AUTH.currentUser.linkWithCredential(appleCredential);
        user = userCredential.user;
        AuthDebug.trackFlowStep('AppleSignIn', 'Linked Apple credential to existing user', { userId: user.uid });
      } else {
        // Sign in with Apple credential (new user)
        console.log('🍎 Signing in with Apple credential (new user)');
        const userCredential = await FIREBASE_AUTH.signInWithCredential(appleCredential);
        user = userCredential.user;
        AuthDebug.trackFlowStep('AppleSignIn', 'Firebase auth successful', { userId: user.uid });
      }
      
      if (!user) {
        throw new Error('Failed to get user from credential');
      }
      
      // Store credential and user
      setAppleCredential(appleCredential);
      setCurrentUser(user);
      
      // Sync user state
      syncUserState(user);
      
      // Get name data from Apple response
      // Apple only provides name details on the first sign-in
      const userFirstName = appleAuthRequestResponse.fullName?.givenName || "";
      const userFamilyName = appleAuthRequestResponse.fullName?.familyName || "";
      const userFullName = userFirstName && userFamilyName 
        ? `${userFirstName} ${userFamilyName}` 
        : user.displayName || "";
      
      if (user) {
        const userDocRef = FIRESTORE.collection("users").doc(user.uid);
        const docSnap = await userDocRef.get();
        
        if (docSnap.exists) {
          // Existing user - update their data
          const existingUser = docSnap.data() as UserDataType;
          
          const userDataToUpdate: Partial<UserDataType> = {
            ...existingUser,
            userId: user.uid,
            // Use Apple email as primary email when linking accounts
            email: user.email || existingUser.email || "",
            // Only update name fields if we got them from Apple (first login)
            // or if they don't exist in the user document yet
            firstName: userFirstName || existingUser.firstName,
            familyName: userFamilyName || existingUser.familyName,
            fullName: userFullName || existingUser.fullName,
            AppleSSOEnabled: true,
            settings: {
              ...existingUser?.settings,
              connectedAccounts: {
                ...existingUser?.settings?.connectedAccounts,
                apple: true,
              },
            },
          };
          
          // Update user data but don't navigate
          await updateUserData(userDataToUpdate);
          
          AuthDebug.trackFlowStep('AppleSignIn', 'Updated existing user data');
          
          // Let onAuthStateChanged handle navigation
        } else {
          // New user - create document
          AuthDebug.trackFlowStep('AppleSignIn', 'Creating new user document');
          
          const userDataToUpdate: Partial<UserDataType> = {
            ...initialUserData,
            userId: user.uid,
            createdAt: firestore.FieldValue.serverTimestamp(),
            email: user.email || "",
            firstName: userFirstName,
            familyName: userFamilyName,
            fullName: userFullName,
            AppleSSOEnabled: true,
            currentOnboardingScreen: "PhoneNumberScreen",
          };
          
          await userDocRef.set(userDataToUpdate);
          
          AuthDebug.trackFlowStep('AppleSignIn', 'New user created');
        }
      }
    } catch (error: any) {
      AuthDebug.error('AppleSignIn', 'Apple sign-in error', error);
      console.error("Apple sign-in error:", error);
    }
  };

const verifyPhoneAndSetUser = async (
  verificationId: string,
  code: string,
  phoneNumber: string
) => {
  try {
    AuthDebug.trackFlowStep('PhoneVerification', 'Started', { phoneNumber });
    
    const { countryCode, areaCode, number } = destructurePhoneNumber(phoneNumber);
    const phoneCredential = auth.PhoneAuthProvider.credential(verificationId, code);

    console.log("Auth state before verification:", FIREBASE_AUTH.currentUser ? 
      `User ${FIREBASE_AUTH.currentUser.uid}` : "No user");

    if ((googleCredential || appleCredential) && FIREBASE_AUTH.currentUser) {
      // SSO user linking phone number
      const ssoType = googleCredential ? 'Google' : 'Apple';
      AuthDebug.trackFlowStep('PhoneVerification', `Linking phone to ${ssoType} SSO user`, { 
        userId: FIREBASE_AUTH.currentUser.uid 
      });
      
      setIsLinking(true);
      
      try {
        await FIREBASE_AUTH.currentUser.linkWithCredential(phoneCredential);
        AuthDebug.trackFlowStep('PhoneVerification', `Phone successfully linked to ${ssoType} account`);
      } catch (error: any) {
        AuthDebug.error('PhoneVerification', `Error linking phone number to ${ssoType} SSO user`, error);
        setIsLinking(false);
        
        if (error.code === 'auth/credential-already-in-use' || 
            error.code === 'auth/phone-number-already-exists') {
          throw new Error('PHONE_ALREADY_IN_USE');
        } else {
          throw new Error('PHONE_LINK_FAILED');
        }
      }

      // Update user data after successful linking
      await updateUserData({
        ...userDataRef.current,
        userId: FIREBASE_AUTH.currentUser.uid,
        phoneNumber,
        countryCode,
        areaCode,
        number,
        currentOnboardingScreen: "NameScreen",
        // Set the appropriate SSO flag based on the credential type
        ...(googleCredential && { GoogleSSOEnabled: true }),
        ...(appleCredential && { AppleSSOEnabled: true }),
      });
      
      AuthDebug.trackFlowStep('PhoneVerification', 'User data updated, calling fetchUserData for navigation');
      setIsLinking(false);

      console.log(`📱 Phone verification successful for ${ssoType} SSO user, fetching updated user data...`);
      const updatedUserData = await fetchUserData(FIREBASE_AUTH.currentUser.uid, true);
      
      // 🔧 FIX: Explicitly handle navigation after phone verification for SSO users
      if (updatedUserData) {
        console.log("✅ User data fetched, handling navigation to next onboarding screen...");
        AuthDebug.trackFlowStep('PhoneVerification', `Handling navigation for ${ssoType} SSO user after phone verification`);
        await handleUserNavigation(updatedUserData, true);
      } else {
        console.error("❌ Failed to fetch user data after phone verification");
      }
      
    } else {
      // Standard phone sign-in (not linking)
      AuthDebug.trackFlowStep('PhoneVerification', 'Signing in with phone credential');
      
      const userCredential = await FIREBASE_AUTH.signInWithCredential(phoneCredential);
      const { user } = userCredential;
      
      if (!user) {
        throw new Error('USER_CREATION_FAILED');
      }
      
      AuthDebug.trackFlowStep('PhoneVerification', 'Phone sign-in successful', { userId: user.uid });
      
      const userDocRef = FIRESTORE.collection("users").doc(user.uid);
      const docSnap = await userDocRef.get();

      if (!docSnap.exists) {
        AuthDebug.trackFlowStep('PhoneVerification', 'New phone user - creating document', { userId: user.uid });
        
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
        
        // 🔄 MODERN STATE SYNC: Keep user references in sync
        syncUserState(user);
        
        // Let onAuthStateChanged handle navigation automatically
        AuthDebug.trackFlowStep('PhoneVerification', 'New user created, letting auth state change handle navigation');
        console.log("🆕 New phone user created, auth state change will handle navigation automatically");
      } else {
        // Let onAuthStateChanged handle navigation automatically
        AuthDebug.trackFlowStep('PhoneVerification', 'Existing phone user authenticated', { userId: user.uid });
        console.log("📱 Phone verification successful for existing user, auth state change will handle navigation automatically");
        
        // 🔄 MODERN STATE SYNC: Keep user references in sync
        syncUserState(user);
      }
    }
  } catch (error: any) {
    AuthDebug.error('PhoneVerification', 'Error verifying phone number', error);
    console.error("Error verifying phone number:", error);
    
    // Rethrow specific errors for handling in the component
    if (error.message === 'PHONE_ALREADY_IN_USE') {
      throw new Error('PHONE_ALREADY_IN_USE');
    } else if (error.message === 'PHONE_LINK_FAILED') {
      throw new Error('PHONE_LINK_FAILED');
    } else {
      throw new Error('VERIFICATION_FAILED');
    }
  }
};

  // 🔒 MODERN USER DATA UPDATE - Uses Single Source of Truth
  const updateUserData = async (data: Partial<UserDataType>) => {
    console.log("updateUserData(): Updating user data");
    try {
      // 🔒 SINGLE SOURCE OF TRUTH: Use the authoritative user ID
      const authoritativeUserId = getAuthoritativeUserId();
      
      if (!authoritativeUserId) {
        throw new Error("User ID is required to update data - no authenticated user found");
      }

      // Validate that we're updating the correct user
      if (data.userId && data.userId !== authoritativeUserId) {
        console.warn(`⚠️ User ID mismatch: updating ${data.userId} but authenticated as ${authoritativeUserId}`);
      }

      const docRef = FIRESTORE.collection("users").doc(authoritativeUserId);
      
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
          
          setUserData((prevData) => {
            const newData = {
              ...prevData,
              ...data,
              hiddenFields: mergedHiddenFields,
            };
            
            // 🔄 Update ref to keep everything in sync
            userDataRef.current = newData;
            return newData;
          });
          return;
        }
      }

      setUserData((prevData) => {
        const newData = {
          ...prevData,
          ...data,
        };
        
        // 🔄 Update ref to keep everything in sync
        userDataRef.current = newData;
        
        // 🔧 FIXED: Don't update hash here - let the useEffect handle it
        // This prevents the race condition where hash is updated before useEffect runs
        if (data.matchPreferences) {
          console.log('🔄 updateUserData - Match preferences updated:', {
            connectionIntent: data.matchPreferences.connectionIntent,
            oldConnectionIntent: prevData.matchPreferences?.connectionIntent,
            willTriggerRefetch: true,
            // 🔧 ADDED: More detailed debugging
            newPreferences: data.matchPreferences,
            oldPreferences: prevData.matchPreferences,
            fullUpdate: data
          });
          
          // Don't update hash here - let the useEffect detect the change
          // and handle the refetch properly
        }
        
        return newData;
      });

      // 🔄 Increment auth state version to trigger re-renders
      setAuthStateVersion(prev => prev + 1);

    } catch (error) {
      console.error("Failed to update user data: ", error);
      AuthDebug.error('UpdateUserData', 'Failed to update user data', { error, data });
      throw error;
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

  // Register for push notifications
  const registerForPushNotifications = async () => {
    try {
      const permissionStatus = await NotificationService.requestPermissions();
      
      // Update the permission status in user settings
      await updateUserSettings({
        notificationPermissionStatus: permissionStatus || 'denied'
      });
      
      if (permissionStatus === 'granted') {
        const token = await NotificationService.getPushToken();
        if (token) {
          // Update user's push token in Firestore
          await updateUserSettings({
            pushToken: token,
          });
        }
      }
    } catch (error) {
      console.log('Error registering for push notifications:', error);
      // Mark as denied if there's an error
      await updateUserSettings({
        notificationPermissionStatus: 'denied'
      });
    }
  };

  const fetchUserData = async (userId: string, isSSO: boolean): Promise<UserDataType | null> => {
    try {
      if (!userId) {
        AuthDebug.warn('FetchUserData', 'No user ID provided');
        return null;
      }
      

      
      // 🔒 SAFETY CHECK: Ensure user is still authenticated before making Firestore calls
      if (!FIREBASE_AUTH.currentUser) {
        AuthDebug.warn('FetchUserData', 'User not authenticated, skipping fetch');
        console.log('⚠️ fetchUserData called but user is not authenticated, skipping');
        return null;
      }
      
      AuthDebug.trackFlowStep('FetchUserData', 'Started', { userId, isSSO });
  
  
      const docRef = FIRESTORE.collection("users").doc(userId);
      
      // 🔒 ADDITIONAL SAFETY CHECK: Verify user is still authenticated before Firestore call
      if (!FIREBASE_AUTH.currentUser) {
        AuthDebug.warn('FetchUserData', 'User lost authentication during fetch, aborting');
        console.log('⚠️ User lost authentication during fetchUserData, aborting');
        return null;
      }
      
      const docSnap = await docRef.get();
      
      // 🔒 FINAL SAFETY CHECK: Ensure user is still authenticated after Firestore call
      if (!FIREBASE_AUTH.currentUser) {
        AuthDebug.warn('FetchUserData', 'User lost authentication after Firestore call, aborting');
        console.log('⚠️ User lost authentication after Firestore call, aborting');
        return null;
      }
      
      if (docSnap.exists) {
        const userDataFromFirestore = docSnap.data() as UserDataType;
        AuthDebug.trackFlowStep('FetchUserData', 'User document found', { 
          userId,
          onboardingCompleted: userDataFromFirestore.onboardingCompleted,
          currentOnboardingScreen: userDataFromFirestore.currentOnboardingScreen,
          hasPhone: !!userDataFromFirestore.phoneNumber
        });
        
        console.log(`✅ User data found for ${userId}:`, {
          onboardingCompleted: userDataFromFirestore.onboardingCompleted,
          currentScreen: userDataFromFirestore.currentOnboardingScreen
        });
        
        // 🔄 MODERN STATE UPDATE: Use the new sync function
        syncUserState(FIREBASE_AUTH.currentUser);
        
        // Update local state with user data
        setUserData(userDataFromFirestore);
        userDataRef.current = userDataFromFirestore;
        
        // Return the user data for the caller to handle navigation
        return userDataFromFirestore;
      }
      
      // User document doesn't exist (brand new user)
      if (!isSSO) {
        // New phone user - start at NameScreen
        AuthDebug.trackFlowStep('FetchUserData', 'New phone user, creating document');
        console.log(`🆕 New phone user ${userId}, creating document`);
        
        // 🔒 SAFETY CHECK: Ensure user is still authenticated before creating document
        if (!FIREBASE_AUTH.currentUser) {
          AuthDebug.warn('FetchUserData', 'User lost authentication before document creation, aborting');
          console.log('⚠️ User lost authentication before document creation, aborting');
          return null;
        }
        
        const newUserData = {
          ...initialUserData,
          userId,
          currentOnboardingScreen: "NameScreen",
        };
        
        await docRef.set(newUserData);
        setUserData(newUserData);
        userDataRef.current = newUserData;
        
        return newUserData;
      } else {
        // New SSO user (Google or Apple) - need phone verification first
        AuthDebug.trackFlowStep('FetchUserData', 'New SSO user, creating document');
        console.log(`🆕 New SSO user ${userId}, creating document`);
        
        // 🔒 SAFETY CHECK: Ensure user is still authenticated before creating document
        if (!FIREBASE_AUTH.currentUser) {
          AuthDebug.warn('FetchUserData', 'User lost authentication before document creation, aborting');
          console.log('⚠️ User lost authentication before document creation, aborting');
          return null;
        }
        
        const newUserData = {
          ...initialUserData,
          userId,
          currentOnboardingScreen: "PhoneNumberScreen",
        };
        
        await docRef.set(newUserData);
        setUserData(newUserData);
        userDataRef.current = newUserData;
        
        return newUserData;
      }
    } catch (error) {
      AuthDebug.error('FetchUserData', 'Error fetching user data', error);
      console.error("Error fetching user data:", error);
      return null;
    }
  };

      // 🧭 NAVIGATION HANDLER - Centralized navigation logic
    let isNavigationInProgress = false;
    let lastNavigationTime = 0;
    let lastNavigationUserId = '';
    const handleUserNavigation = async (userData: UserDataType, isSSO: boolean) => {
      // 🔒 Prevent multiple simultaneous navigation calls
      const now = Date.now();
      if (isNavigationInProgress || (now - lastNavigationTime) < 1000) {
        console.log("🧭 Navigation already in progress or too recent, skipping duplicate call", {
          isNavigationInProgress,
          timeSinceLastNavigation: now - lastNavigationTime
        });
        return;
      }
      
      // 🔒 ADDITIONAL: Prevent multiple navigation calls for the same user within a short time
      if (userData.userId === lastNavigationUserId && (now - lastNavigationTime) < 3000) {
        console.log("🧭 Navigation for same user too recent, skipping duplicate call", {
          userId: userData.userId,
          timeSinceLastNavigation: now - lastNavigationTime
        });
        return;
      }
      
      // 🔒 SIGN-OUT NAVIGATION PROTECTION: Prevent multiple sign-out navigations
      if (!userData.userId && lastNavigationUserId === '' && (now - lastNavigationTime) < 2000) {
        console.log("🧭 Sign-out navigation too recent, skipping duplicate call", {
          timeSinceLastNavigation: now - lastNavigationTime
        });
        return;
      }
      
      isNavigationInProgress = true;
      lastNavigationTime = now;
      lastNavigationUserId = userData.userId;
    
    try {
      console.log(`🧭 handleUserNavigation called for user ${userData.userId} (isSSO: ${isSSO})`, {
        onboardingCompleted: userData.onboardingCompleted,
        currentOnboardingScreen: userData.currentOnboardingScreen,
        hasPhone: !!userData.phoneNumber
      });
      
      AuthDebug.trackFlowStep('UserNavigation', 'Started', { 
        userId: userData.userId,
        onboardingCompleted: userData.onboardingCompleted,
        currentOnboardingScreen: userData.currentOnboardingScreen,
        hasPhone: !!userData.phoneNumber
      });
      
      // Case 1: Onboarding completed - go to Connect tab
      if (userData.onboardingCompleted) {
        AuthDebug.trackFlowStep('UserNavigation', 'Onboarding completed, navigating to Connect');
        console.log(`🚀 User ${userData.userId} has completed onboarding, navigating to Connect tab`);
        
        await updateUserData({
          ...userData,
          currentOnboardingScreen: "Connect",
        });
        
        console.log("🧭 About to navigate to Connect tab");
        // Add a small delay to ensure the component is fully mounted and router is ready
        setTimeout(() => {
          try {
            // 🔧 FIXED: Use router.replace for final destination (no animation needed)
            router.replace({ pathname: `/(tabs)/Connect` as any });
            console.log("🧭 Navigation to Connect tab completed");
            isNavigationInProgress = false;
          } catch (error) {
            console.error("🧭 Navigation error:", error);
            // Fallback: try again after a longer delay
            setTimeout(() => {
              try {
                // 🔧 FIXED: Use router.replace for final destination (no animation needed)
                router.replace({ pathname: `/(tabs)/Connect` as any });
                console.log("🧭 Fallback navigation to Connect tab completed");
                isNavigationInProgress = false;
              } catch (fallbackError) {
                console.error("🧭 Fallback navigation also failed:", fallbackError);
                isNavigationInProgress = false;
              }
            }, 500);
          }
        }, 100);
        return;
      }
      
      // Case 2: SSO user (Google or Apple) without phone number - must complete phone verification
      if (isSSO && !userData.phoneNumber) {
        AuthDebug.trackFlowStep('UserNavigation', 'SSO user needs phone verification');
        console.log(`📱 SSO user ${userData.userId} needs to verify phone, navigating to PhoneNumberScreen`);
        console.log("🧭 About to navigate to PhoneNumberScreen");
        // Add a small delay to ensure the component is fully mounted and router is ready
        setTimeout(() => {
          try {
            // 🔧 FIXED: Use router.replace for auth flow navigation (no animation needed)
            router.replace("onboarding/PhoneNumberScreen" as any);
            console.log("🧭 Navigation to PhoneNumberScreen completed");
            isNavigationInProgress = false;
          } catch (error) {
            console.error("🧭 Navigation error:", error);
            // Fallback: try again after a longer delay
            setTimeout(() => {
              try {
                // 🔧 FIXED: Use router.replace for auth flow navigation (no animation needed)
                router.replace("onboarding/PhoneNumberScreen" as any);
                console.log("🧭 Fallback navigation to PhoneNumberScreen completed");
                isNavigationInProgress = false;
              } catch (fallbackError) {
                console.error("🧭 Fallback navigation also failed:", fallbackError);
                isNavigationInProgress = false;
              }
            }, 500);
          }
        }, 100);
        return;
      }
      
      // Case 3: User in the middle of onboarding - continue where they left off
      const screenToNavigateTo = userData.currentOnboardingScreen || 
                              (isSSO ? "PhoneNumberScreen" : "NameScreen");
      
      AuthDebug.trackFlowStep('UserNavigation', 'Continuing onboarding', {
        screen: screenToNavigateTo
      });
      
        console.log(`⏩ Continuing onboarding for ${userData.userId} at screen: ${screenToNavigateTo}`);
        console.log(`🧭 About to navigate to ${screenToNavigateTo}`);
        // Add a small delay to ensure the component is fully mounted and router is ready
        setTimeout(() => {
          try {
            router.replace({ pathname: `onboarding/${screenToNavigateTo}` as any });
            console.log(`🧭 Navigation to ${screenToNavigateTo} completed`);
            isNavigationInProgress = false;
          } catch (error) {
            console.error("🧭 Navigation error:", error);
            // Fallback: try again after a longer delay
            setTimeout(() => {
              try {
                router.replace({ pathname: `onboarding/${screenToNavigateTo}` as any });
                console.log(`🧭 Fallback navigation to ${screenToNavigateTo} completed`);
                isNavigationInProgress = false;
              } catch (fallbackError) {
                console.error("🧭 Fallback navigation also failed:", fallbackError);
                isNavigationInProgress = false;
              }
            }, 500);
          }
        }, 100);
        return;
    } catch (error) {
      AuthDebug.error('UserNavigation', 'Error handling user navigation', error);
      console.error("Error handling user navigation:", error);
      // Fallback to safe screen
      router.replace({ pathname: `onboarding/LoginSignupScreen` as any });
      isNavigationInProgress = false;
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
    if (!userDataRef.current.onboardingCompleted) {
      return;
    }
    try {
      const userId = userDataRef.current.userId;
      if (!userId) return;
      await updateUserData({ lastActive: firestore.FieldValue.serverTimestamp() });
    } catch (error) {
      console.error("Error updating last active:", error);
    }
  };

  const currentPotentialMatch = useMemo(() => {
    // 🔧 FIXED: Always return the first match (index 0) since we clear matches when preferences change
    const match = matchingState.potentialMatches?.[0];
    
    console.log('🔍 currentPotentialMatch check:', {
      hasMatches: matchingState.potentialMatches.length > 0,
      currentIndex: matchingState.currentIndex,
      firstMatch: match ? `${match.firstName} (${match.userId})` : 'none',
      totalMatches: matchingState.potentialMatches.length
    });
    
    return match;
  }, [matchingState.potentialMatches]);



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
        return { passes: true, score: 0 };
      }
      
      // If user has only "Open to All" selections (no specific preferences), show everyone
      const hasSpecificPractices = userSpiritualPrefs.practices?.length && !hasOpenToAllPractices;
      const hasSpecificDraws = userSpiritualPrefs.spiritualDraws?.length && !hasOpenToAllDraws;
      const hasSpecificHealing = userSpiritualPrefs.healingModalities?.length && !hasOpenToAllHealing;
      
      if (!hasSpecificPractices && !hasSpecificDraws && !hasSpecificHealing) {
        return { passes: true, score: 0 };
      }
      
      // 🎯 If candidate has NO spiritual profile, they pass (open to all)
      if (!candidateProfile || 
          (!candidateProfile.draws?.length && 
          !candidateProfile.practices?.length && 
          !candidateProfile.healingModalities?.length)) {
        return { passes: true, score: 0 };
      }
      
      // 🔮 ENHANCED COMPATIBILITY SCORING (gentle but nuanced)
      let score = 0;
      let totalCategories = 0;
      let totalPossibleMatches = 0;
      const matchDetails: string[] = [];
      
      // Check spiritual draws compatibility (only if user has specific draws preferences)
      if (hasSpecificDraws && candidateProfile.draws?.length) {
        const userDraws = userSpiritualPrefs.spiritualDraws!.filter(draw => draw !== "Open to All");
        const commonDraws = userDraws.filter(draw => candidateProfile?.draws?.includes(draw));
        
        if (commonDraws.length > 0) {
          // Gentle scoring: partial credit for partial matches
          const drawScore = commonDraws.length / userDraws.length;
          score += drawScore;
          matchDetails.push(`Draws: ${commonDraws.join(', ')} (${Math.round(drawScore * 100)}% match)`);
        }
        totalCategories += 1;
        totalPossibleMatches += userDraws.length;
      }
      
      // Check practices compatibility (only if user has specific practices preferences)
      if (hasSpecificPractices && candidateProfile.practices?.length) {
        const userPractices = userSpiritualPrefs.practices!.filter(practice => practice !== "Open to All");
        const commonPractices = userPractices.filter(practice => candidateProfile?.practices?.includes(practice));
        
        if (commonPractices.length > 0) {
          // Gentle scoring: partial credit for partial matches
          const practiceScore = commonPractices.length / userPractices.length;
          score += practiceScore;
          matchDetails.push(`Practices: ${commonPractices.join(', ')} (${Math.round(practiceScore * 100)}% match)`);
        }
        totalCategories += 1;
        totalPossibleMatches += userPractices.length;
      }
      
      // Check healing modalities compatibility (only if user has specific healing preferences)
      if (hasSpecificHealing && candidateProfile.healingModalities?.length) {
        const userModalities = userSpiritualPrefs.healingModalities!.filter(modality => modality !== "Open to All");
        const commonModalities = userModalities.filter(modality => candidateProfile?.healingModalities?.includes(modality));
        
        if (commonModalities.length > 0) {
          // Gentle scoring: partial credit for partial matches
          const modalityScore = commonModalities.length / userModalities.length;
          score += modalityScore;
          matchDetails.push(`Healing: ${commonModalities.join(', ')} (${Math.round(modalityScore * 100)}% match)`);
        }
        totalCategories += 1;
        totalPossibleMatches += userModalities.length;
      }
      
      // Enhanced scoring: weighted by category importance and partial matches
      const compatibilityScore = totalCategories > 0 ? score / totalCategories : 0;
      
      // 🌟 GENTLE BONUS: Reward people who are very open-minded (have many spiritual interests)
      let finalScore = compatibilityScore;
      if (candidateProfile.practices?.length && candidateProfile.practices.length > 3) {
        finalScore += 0.1; // Small bonus for spiritual diversity
        matchDetails.push("Spiritually diverse (+10%)");
      }
      
      // 🌟 GENTLE BONUS: Reward people who are open to learning (have "Open to All" in their profile)
      const candidateHasOpenToAll = candidateProfile.practices?.includes("Open to All") || 
                                   candidateProfile.draws?.includes("Open to All") || 
                                   candidateProfile.healingModalities?.includes("Open to All");
      if (candidateHasOpenToAll) {
        finalScore += 0.05; // Small bonus for being open-minded
        matchDetails.push("Open to learning (+5%)");
      }
      
      // Cap the final score at 1.0
      finalScore = Math.min(finalScore, 1.0);
      
      // 🎯 COMPATIBILITY LOGIC
      if (totalCategories === 0) {
        // User has spiritual preferences but candidate has no matching categories
        return { passes: true, score: 0 };
      }
      
      // Must have at least ONE shared spiritual interest (or be open to all)
      const passes = score > 0;
      
      return { 
        passes, 
        score: finalScore,
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
      

      
      const sortedUsers = [...users].sort((a, b) => {
        // 1. HIGHEST PRIORITY: Active boost status
        const aHasActiveBoost = isUserBoosted(a);
        const bHasActiveBoost = isUserBoosted(b);
        
        if (aHasActiveBoost && !bHasActiveBoost) {
          return -1;
        }
        if (!aHasActiveBoost && bHasActiveBoost) {
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
      

      
      return sortedUsers;
    }, [isUserBoosted, isUserRecentlyActive]);

  // 🆕 NEW: Enhanced filtering function that applies all user preferences + client-side exclusions
  const applyUserPreferences = useCallback((users: UserDataType[], exclusionSet?: Set<string>): UserDataType[] => {
    if (!userData.matchPreferences) return users;
    
    const prefs = userData.matchPreferences;
    
    return users.filter(user => {
      // Skip if user is the current user
      if (user.userId === userData.userId) return false;
      
      // 🚫 CLIENT-SIDE EXCLUSION FILTERING: Handle exclusions beyond Firestore's 10-user limit
      if (exclusionSet && exclusionSet.has(user.userId)) {
        console.log(`🚫 ${user.firstName} - Excluded via client-side filtering (userId: ${user.userId})`);
        return false;
      }
      
      // 🔗 Connection Intent Filtering
      if (prefs.connectionIntent && prefs.connectionIntent !== 'both') {
        const userIntent = user.matchPreferences?.connectionIntent;
        console.log(`🔗 Connection intent check for ${user.firstName}:`, {
          yourIntent: prefs.connectionIntent,
          theirIntent: userIntent,
          shouldShow: (prefs.connectionIntent === 'romantic' && (userIntent === 'romantic' || userIntent === 'both')) ||
                     (prefs.connectionIntent === 'friendship' && (userIntent === 'friendship' || userIntent === 'both'))
        });
        
        // If user wants only romantic, only show romantic or both
        if (prefs.connectionIntent === 'romantic') {
          if (userIntent !== 'romantic' && userIntent !== 'both') {
            console.log(`❌ ${user.firstName} - Connection intent mismatch: ${userIntent} vs ${prefs.connectionIntent}`);
            return false;
          }
          console.log(`✅ ${user.firstName} - Connection intent compatible: ${userIntent} with ${prefs.connectionIntent}`);
        }
        
        // If user wants only friendship, only show friendship or both
        if (prefs.connectionIntent === 'friendship') {
          if (userIntent !== 'friendship' && userIntent !== 'both') {
            console.log(`❌ ${user.firstName} - Connection intent mismatch: ${userIntent} vs ${prefs.connectionIntent}`);
            return false;
          }
          console.log(`✅ ${user.firstName} - Connection intent compatible: ${userIntent} with ${prefs.connectionIntent}`);
        }
      } else {
        console.log(`🔗 Connection intent check for ${user.firstName}: No specific intent preference (showing everyone)`);
      }
      
      // 👥 Gender Filtering (Connection Preferences)
      if (prefs.connectionPreferences && prefs.connectionPreferences.length > 0) {
        // Skip filtering if "Everyone" is selected
        if (!prefs.connectionPreferences.includes("Everyone")) {
          const userGender = user.gender;
          if (!userGender || userGender.length === 0) {
            console.log(`❌ ${user.firstName} - No gender data available`);
            return false;
          }
          
          // 🔧 FIXED: Handle mapping between plural preferences and singular user data
          const genderMapping: { [key: string]: string[] } = {
            "Women": ["Woman"],
            "Men": ["Man"],
            "Trans Woman": ["Trans Woman"],
            "Trans Man": ["Trans Man"],
            "Non-binary": ["Non-binary"],
            "Genderqueer": ["Genderqueer"],
            "Agender": ["Agender"],
            "Genderfluid": ["Genderfluid"],
            "Two-Spirit": ["Two-Spirit"],
            "Bigender": ["Bigender"],
            "Intersex": ["Intersex"],
            "Questioning": ["Questioning"],
            "Other": ["Other"]
          };
          
          // Check if any of the user's genders match the user's preferences
          const hasMatchingGender = userGender.some(gender => {
            // Check direct matches first
            if (prefs.connectionPreferences!.includes(gender)) {
              return true;
            }
            
            // Check mapped matches (e.g., "Women" preference matches "Woman" user)
            return prefs.connectionPreferences!.some(pref => {
              const mappedGenders = genderMapping[pref] || [];
              return mappedGenders.includes(gender);
            });
          });
          
          if (!hasMatchingGender) {
            console.log(`❌ ${user.firstName} - Gender mismatch: user has ${userGender.join(', ')}, you prefer ${prefs.connectionPreferences.join(', ')}`);
            return false;
          }
          console.log(`✅ ${user.firstName} - Gender match: ${userGender.join(', ')} matches your preferences ${prefs.connectionPreferences.join(', ')}`);
        } else {
          console.log(`✅ ${user.firstName} - "Everyone" selected, showing all genders`);
        }
      } else {
        console.log(`👥 No gender preferences set, showing everyone`);
      }
      
      // 🎂 Age Range Filtering
      if (prefs.preferredAgeRange && user.age) {
        const { min, max } = prefs.preferredAgeRange;
        console.log(`🎂 Age check for ${user.firstName}: ${user.age} (range: ${min}-${max})`);
        if (user.age < min || user.age > max) {
          console.log(`❌ ${user.firstName} - Age out of range: ${user.age} (${min}-${max})`);
          return false;
        }
        console.log(`✅ ${user.firstName} - Age in range: ${user.age}`);
      } else {
        console.log(`🎂 Age check for ${user.firstName}: No age data or preferences`);
      }
      
      // 📏 Height Range Filtering
      if (prefs.preferredHeightRange && user.height) {
        const { min, max } = prefs.preferredHeightRange;
        if (user.height < min || user.height > max) {
          return false;
        }
      }
      
              // 🌍 Distance Filtering
        if (prefs.preferredDistance && user.latitude && user.longitude && 
            userData.latitude && userData.longitude) {
          const distance = calculateHaversineDistance(
            userData.latitude, userData.longitude,
            user.latitude, user.longitude
          );
          if (distance > prefs.preferredDistance) {
            return false;
          }
        }
      
      // 🔮 Spiritual Compatibility Filtering
      const spiritualCheck = applySpiritualFilter(user);
      if (!spiritualCheck.passes) {
        console.log(`❌ ${user.firstName} - Spiritual filter failed: ${spiritualCheck.reason}`);
        return false;
      }
      console.log(`✅ ${user.firstName} - Spiritual filter passed`);
      
      return true;
    });
    
  }, [userData.matchPreferences, userData.userId, userData.latitude, userData.longitude, applySpiritualFilter]);

  // Simple filtering - removed complex logic that was causing issues
  const applyAllFilters = useCallback((users: UserDataType[]): UserDataType[] => {
    // Just return users as-is for now to fix the matching issue
    return users.filter(user => 
      user.userId !== userData.userId && 
      user.onboardingCompleted === true &&
      user.firstName && 
      user.photos && 
      user.photos.length > 0
    );
  }, [userData.userId]);

    const fetchPotentialMatches = useCallback(async (
    resetBatch: boolean = false,
    overrideExclusions?: Set<string>
  ): Promise<UserDataType[]> => {
    
    if (matchingStateRef.current.loadingBatch) {
      return [];
    }
    
    setMatchingState(prev => ({ ...prev, loadingBatch: true }));
    
    try {
      const exclusionsToUse = overrideExclusions || matchingStateRef.current.exclusionSet;
      const lastDoc = resetBatch ? null : matchingStateRef.current.lastFetchedDoc;
      
      // 🔧 NEW STRATEGY: Fetch more users to account for exclusions, filter client-side
      const query = buildMatchQuery(exclusionsToUse, lastDoc, 5);
      const snapshot = await query.get();
      console.log(`🔧 Firestore returned ${snapshot.docs.length} users (fetching more to filter client-side)`);
      
      if (snapshot.empty) {
        console.log(`🔍 Firestore query returned 0 users - truly no more data`);
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
      
      // 🔧 FIXED: Use exclusion set to filter out already liked/disliked users
      let filteredUsers = rawUsers.filter(user => {
        // Basic requirements
        if (!user.onboardingCompleted || !user.firstName || !user.photos || user.photos.length === 0) {
          return false;
        }
        
        // Exclude current user
        if (user.userId === userDataRef.current.userId) {
          return false;
        }
        
        // 🔧 CRITICAL FIX: Exclude users that are already in the exclusion set (liked/disliked)
        if (exclusionsToUse.has(user.userId)) {
          console.log(`🔧 Filtering out excluded user (already liked/disliked): ${user.firstName}`);
          return false;
        }
        
        // 🔧 SAFE: Also exclude users we've already seen in current session
        const currentSessionUsers = new Set(matchingStateRef.current.potentialMatches.map(u => u.userId));
        if (currentSessionUsers.has(user.userId)) {
          console.log(`🔧 Filtering out already seen user: ${user.firstName}`);
          return false;
        }
        
        return true;
      });
      
      console.log(`🔧 DEBUG: Raw users from Firestore: ${rawUsers.length}`);
      console.log(`🔧 DEBUG: After filtering: ${filteredUsers.length}`);
      
      // Apply user preferences filtering
      if (userData.matchPreferences) {
        filteredUsers = applyUserPreferences(filteredUsers, new Set()); // Empty set for preferences only
      }
      
      // 🔧 NEW STRATEGY: Limit to requested batch size after all filtering
      const batchSize = 5;
      const finalUsers = filteredUsers.slice(0, batchSize);
      console.log(`🔧 Filtered ${filteredUsers.length} users down to ${finalUsers.length} for batch (requested: ${batchSize})`);
      
      // 🔧 FIXED: Always advance pagination cursor, even if no users pass filtering
      const newLastDoc = snapshot.docs.length > 0 ? 
        snapshot.docs[snapshot.docs.length - 1] : null;
      
      // 🔧 CRITICAL: Always advance cursor for proper pagination
      setMatchingState(prev => ({
        ...prev,
        lastFetchedDoc: newLastDoc,
        loadingBatch: false,
        noMoreMatches: finalUsers.length === 0
      }));
      
      console.log(`🔧 Cursor advanced to: ${newLastDoc ? 'new position' : 'end of data'}`);
      
      // 🔧 NEW: If no users passed filtering, we need to fetch the next batch
      if (finalUsers.length === 0 && newLastDoc) {
        console.log(`🔧 No users passed filtering, but cursor advanced for next batch`);
        // Don't set noMoreMatches to true yet - let the next fetch try
        setMatchingState(prev => ({
          ...prev,
          noMoreMatches: false
        }));
      }
      
      // 🔧 CRITICAL: Log cursor advancement for debugging
      console.log(`🔧 Pagination state: lastDoc=${lastDoc ? 'exists' : 'null'} -> newLastDoc=${newLastDoc ? 'exists' : 'null'}`);
      
      // 🔧 CRITICAL FIX: Log cursor advancement for debugging
      console.log(`🔧 Cursor advancement: ${lastDoc ? 'from existing' : 'from beginning'} -> ${newLastDoc ? 'to new position' : 'no more data'}`);
      
      console.log(`🔧 Fetch completed, returning ${finalUsers.length} users`);
      return finalUsers;
      
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      
      setMatchingState(prev => ({ 
        ...prev, 
        loadingBatch: false, 
        noMoreMatches: false,
        initialized: true
      }));
      
      return [];
    }
  }, [buildMatchQuery, applyUserPreferences]);

  useEffect(() => {
    const initializeMatching = async () => {
      if (!userData.userId || 
          !userData.onboardingCompleted || 
          matchingState.initialized) {
        return;
      }
      
      // 🆕 SIMPLE FIX: Wait for user's actual preferences to load before fetching
      if (!userData.matchPreferences) {
        console.log('⏳ Waiting for user preferences to load before initializing matching...');
        return;
      }
      
      try {
        // 🔧 SIMPLE & SAFE: Start with empty exclusions, let system build naturally
        const preferencesHash = generatePreferencesHash(userData.matchPreferences);
        
        console.log('🔍 Initialization - Setting preferences hash:', {
          preferencesHash: preferencesHash.substring(0, 50) + '...',
          connectionIntent: userData.matchPreferences.connectionIntent,
          willInitialize: true
        });
        
        // 🔧 FIXED: Build exclusion set first to prevent showing already liked/disliked users
        console.log('🔍 Building exclusion set for initialization...');
        const exclusionSet = await buildExclusionSet(userData.userId);
        console.log(`🔍 Built exclusion set with ${exclusionSet.size} users to exclude`);
        
        // Fetch initial batch with proper exclusions
        const initialBatch = await fetchPotentialMatches(true, exclusionSet);
        
        // Update state
        setMatchingState(prev => ({
          ...prev,
          exclusionSet, // 🔧 FIXED: Use built exclusion set
          preferencesHash,
          initialized: true,
          potentialMatches: initialBatch,
          currentIndex: 0,
          lastFetchedDoc: null,
          noMoreMatches: initialBatch.length === 0
        }));
        
      } catch (error) {
        console.error('❌ Error initializing matching:', error);
        setMatchingState(prev => ({ ...prev, initialized: true, noMoreMatches: false }));
      }
    };
    
    initializeMatching();
  }, [userData.userId, userData.onboardingCompleted, userData.matchPreferences, fetchPotentialMatches, generatePreferencesHash]); // ✅ Add matchPreferences to deps


  // 🔧 ADDED: Debug preferences changes in userData
  useEffect(() => {
    console.log('🔍 userData.matchPreferences changed:', {
      hasPreferences: !!userData.matchPreferences,
      ageRange: userData.matchPreferences?.preferredAgeRange,
      connectionIntent: userData.matchPreferences?.connectionIntent,
      timestamp: new Date().toISOString()
    });
  }, [userData.matchPreferences]);


  // 🔧 REMOVED: No more debounced preferences update - the useEffect handles everything cleanly

  // 🔧 FIXED: Stable preferences change detection with proper hash management
  useEffect(() => {
    console.log('🔍 Preferences change detection useEffect triggered:', {
      hasPreferences: !!userData.matchPreferences,
      isInitialized: matchingState.initialized,
      connectionIntent: userData.matchPreferences?.connectionIntent,
      preferencesHash: matchingState.preferencesHash.substring(0, 50) + '...',
      isLoading: matchingState.loadingBatch,
      // 🔧 ADDED: More debugging info
      currentAgeRange: userData.matchPreferences?.preferredAgeRange,
      storedAgeRange: matchingState.preferencesHash.includes('"ageMin"') ? 'has age data' : 'no age data'
    });
    
    // Only run when we have preferences and are initialized
    if (!userData.matchPreferences || !matchingState.initialized) return;
    

    
    // 🔧 ADDED: Log the exact data being hashed
    console.log('🔍 Preferences change detection - Raw data:', {
      matchPreferences: userData.matchPreferences,
      connectionIntent: userData.matchPreferences.connectionIntent,
      ageRange: userData.matchPreferences.preferredAgeRange,
      heightRange: userData.matchPreferences.preferredHeightRange,
      distance: userData.matchPreferences.preferredDistance,
      spiritualCompatibility: userData.matchPreferences.spiritualCompatibility
    });
    
    const currentHash = generatePreferencesHash(userData.matchPreferences);
    const hashChanged = currentHash !== matchingState.preferencesHash;
    
    console.log('🔍 Preferences change detection:', {
      currentHash: currentHash.substring(0, 50) + '...',
      storedHash: matchingState.preferencesHash.substring(0, 50) + '...',
      hashChanged,
      currentConnectionIntent: userData.matchPreferences.connectionIntent,
      storedConnectionIntent: matchingState.preferencesHash.includes('"connectionIntent":"romantic"') ? 'romantic' : 
                              matchingState.preferencesHash.includes('"connectionIntent":"friendship"') ? 'friendship' : 'unknown',
      // 🔧 ADDED: More detailed debugging
      currentPreferences: userData.matchPreferences,
      storedHashFull: matchingState.preferencesHash,
      // 🔧 ENHANCED: Show exact hash comparison
      currentHashFull: currentHash,
      hashComparison: {
        current: currentHash,
        stored: matchingState.preferencesHash,
        areEqual: currentHash === matchingState.preferencesHash,
        currentLength: currentHash.length,
        storedLength: matchingState.preferencesHash.length
      }
    });
    
    // 🔧 FIXED: Check both hash change and actual age range change
    const currentAgeRange = userData.matchPreferences?.preferredAgeRange;
    
    console.log('🔍 Age range comparison:', {
      current: currentAgeRange ? `${currentAgeRange.min}-${currentAgeRange.max}` : 'none',
      stored: matchingState.preferencesHash.includes('"ageMin"') ? 'has age data' : 'no age data',
      hashChanged,
      shouldRefetch: hashChanged
    });
    
    // 🔧 FIXED: Refetch if hash changed
    if (hashChanged) {
      console.log('🔄 Preferences hash changed, triggering immediate refetch');
      
      // 🔧 FIXED: Single state update to clear everything and start fresh
      setMatchingState(prev => ({
        ...prev,
        preferencesHash: currentHash, // Update hash immediately
        exclusionSet: new Set(), // 🔧 FIXED: Clear exclusions to start fresh
        potentialMatches: [],
        currentIndex: 0,
        lastFetchedDoc: null, // 🔧 FIXED: Reset cursor to start from beginning
        noMoreMatches: false,
        loadingBatch: true // Show loading state
      }));
      
      // 🔧 FIXED: Immediate refetch with new preferences
      const fetchAndUpdate = async () => {
        try {
          console.log('🔄 Fetching new matches with updated preferences...');
          const newUsers = await fetchPotentialMatches(true, new Set()); // true = reset batch, no exclusions to see all users
          console.log('🔄 Fetched new users:', newUsers.length);
          
          // Update state with the new users and complete loading
          setMatchingState(prev => ({
            ...prev,
            potentialMatches: newUsers,
            currentIndex: 0,
            noMoreMatches: newUsers.length === 0,
            loadingBatch: false
          }));
          
          console.log('✅ Preferences refetch completed successfully');
        } catch (error) {
          console.error('❌ Error fetching new users:', error);
          // Reset loading state on error
          setMatchingState(prev => ({
            ...prev,
            loadingBatch: false
          }));
        }
      };
      
      fetchAndUpdate();
    } else {
      console.log('✅ Hash unchanged, no refetch needed');
    }
  }, [userData.matchPreferences, matchingState.initialized, fetchPotentialMatches, generatePreferencesHash]);

  // 🔧 STABLE: Smart refetch when returning to Connect screen
  const forceRefetchOnReturn = useCallback(async () => {
    if (!userData.matchPreferences || !matchingState.initialized) return;
    
    // Generate current hash from fresh userData (most reliable source)
    const currentHash = generatePreferencesHash(userData.matchPreferences);
    
    // Compare with stored hash, but be patient about state updates
    const hashChanged = currentHash !== matchingState.preferencesHash;
    
    console.log('🔍 forceRefetchOnReturn:', {
      hashChanged,
      connectionIntent: userData.matchPreferences.connectionIntent,
      hasMatches: matchingState.potentialMatches.length > 0,
      currentHash: currentHash.substring(0, 50) + '...',
      storedHash: matchingState.preferencesHash.substring(0, 50) + '...',
      // 🔧 ENHANCED: Show exact hash comparison
      hashComparison: {
        current: currentHash,
        stored: matchingState.preferencesHash,
        areEqual: currentHash === matchingState.preferencesHash,
        currentLength: currentHash.length,
        storedLength: matchingState.preferencesHash.length
      }
    });
    
    // 🔧 FIXED: Handle preference changes and no matches differently
    if (hashChanged) {
      console.log('🔄 Preferences changed, triggering complete refetch with new criteria');
      
      // 🔧 FIXED: Start completely fresh with new preferences
      setMatchingState(prev => ({
        ...prev,
        preferencesHash: currentHash, // Update hash immediately
        exclusionSet: new Set(), // 🔧 FIXED: Clear exclusions to start fresh
        potentialMatches: [],
        currentIndex: 0,
        lastFetchedDoc: null, // 🔧 FIXED: Reset cursor to start from beginning
        noMoreMatches: false,
        loadingBatch: true // Show loading state
      }));
      
      // 🔧 FIXED: Fetch new users with new preferences
      try {
        const newUsers = await fetchPotentialMatches(true, new Set()); // true = reset batch, no exclusions
        console.log(`🔄 Fetched ${newUsers.length} new users with updated preferences`);
        
        setMatchingState(prev => ({
          ...prev,
          potentialMatches: newUsers,
          currentIndex: 0,
          noMoreMatches: newUsers.length === 0,
          loadingBatch: false
        }));
      } catch (error) {
        console.error('❌ Error fetching new users with updated preferences:', error);
        setMatchingState(prev => ({
          ...prev,
          loadingBatch: false
        }));
      }
      
    } else if (matchingState.potentialMatches.length === 0) {
      console.log('🔄 No matches available, fetching fresh batch');
      
      try {
        // Show loading state
        setMatchingState(prev => ({
          ...prev,
          loadingBatch: true
        }));
        
        // 🔧 FIXED: Use current exclusion set to prevent showing already liked/disliked users
        const newUsers = await fetchPotentialMatches(false, matchingStateRef.current.exclusionSet);
        
        // 🔧 SIMPLIFIED: No retry logic to prevent loops
        let allUsers = newUsers;
        
        // 🔧 NEW: If no users returned, try one more batch to see if we can advance
        if (allUsers.length === 0) {
          console.log(`🔍 No users returned from pagination, trying one more batch...`);
          const nextBatch = await fetchPotentialMatches(false, matchingStateRef.current.exclusionSet);
          if (nextBatch.length > 0) {
            allUsers = nextBatch;
            console.log(`🔍 Success! Got ${nextBatch.length} users from next batch`);
          } else {
            console.log(`🔍 Still no users - user can refresh manually`);
          }
        }
        
        // 🔧 FIXED: Keep existing exclusion set to maintain exclusions
        setMatchingState(prev => ({
          ...prev,
          lastFetchedDoc: prev.lastFetchedDoc, // Keep existing cursor for pagination
          exclusionSet: prev.exclusionSet, // 🔧 FIXED: Keep exclusions to prevent showing same users
          potentialMatches: allUsers,
          currentIndex: 0,
          noMoreMatches: allUsers.length === 0,
          preferencesHash: currentHash,
          loadingBatch: false
        }));
      } catch (error) {
        console.error('❌ Error in refetch:', error);
        // Reset loading state on error
        setMatchingState(prev => ({
          ...prev,
          loadingBatch: false
        }));
      }
    } else {
      console.log('✅ Preferences unchanged, using existing matches');
    }
  }, [userData.matchPreferences, matchingState.initialized, matchingState.potentialMatches.length, matchingState.preferencesHash, fetchPotentialMatches, generatePreferencesHash]);

  // 🔧 SIMPLIFIED: Just check if preferences changed, no refetch needed
  const checkAndRefetchIfNeeded = useCallback(() => {
    if (!userData.matchPreferences || !matchingState.initialized) return;
    
    const currentHash = generatePreferencesHash(userData.matchPreferences);
    const hashChanged = currentHash !== matchingState.preferencesHash;
    
    console.log('🔍 checkAndRefetchIfNeeded:', {
      hashChanged,
      connectionIntent: userData.matchPreferences.connectionIntent,
      hasMatches: matchingState.potentialMatches.length > 0
    });
    
    // No need to refetch here - the useEffect above handles it automatically
    if (hashChanged) {
      console.log('✅ Preferences changed, useEffect will handle refetch');
    } else {
      console.log('✅ Preferences unchanged, no action needed');
    }
  }, [userData.matchPreferences, matchingState.preferencesHash, matchingState.potentialMatches.length, generatePreferencesHash]);



  const resetMatching = useCallback(async () => {
    console.log('🔄 Manual reset of matching system');
    
    if (!userData.userId) {
      console.log('🔄 No user ID, cannot reset');
      return;
    }
    
    // 🔧 FIXED: Reset state and rebuild exclusion set for fresh start
    try {
      console.log('🔄 Rebuilding exclusion set after reset...');
      const exclusionSet = await buildExclusionSet(userData.userId);
      console.log(`🔄 Built exclusion set with ${exclusionSet.size} users to exclude`);
      
      setMatchingState({
        potentialMatches: [],
        currentIndex: 0,
        lastFetchedDoc: null,
        loadingBatch: false,
        noMoreMatches: false,
        exclusionSet, // 🔧 FIXED: Use rebuilt exclusion set
        initialized: false,
        preferencesHash: matchingState.preferencesHash,
      });
      
      console.log('🔄 Reset completed with rebuilt exclusion set');
    } catch (error) {
      console.error('❌ Error rebuilding exclusion set during reset:', error);
      // Fallback to empty exclusion set
      setMatchingState({
        potentialMatches: [],
        currentIndex: 0,
        lastFetchedDoc: null,
        loadingBatch: false,
        noMoreMatches: false,
        exclusionSet: new Set(),
        initialized: false,
        preferencesHash: matchingState.preferencesHash,
      });
    }
  }, [userData.userId]);

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
    console.log('🔄 loadNextMatch called');
    
    // Use the current state directly instead of the ref
    const currentState = matchingState;
    const { potentialMatches, currentIndex } = currentState;
    
    console.log('🔄 Current state in loadNextMatch:', {
      currentIndex,
      totalMatches: potentialMatches.length,
      hasMoreMatches: currentIndex < potentialMatches.length - 1
    });
    
    // First, advance to the next match
    if (currentIndex < potentialMatches.length - 1) {
      console.log(`🔄 Advancing to next match: ${currentIndex + 1}`);
      setMatchingState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      return;
    }
    
    // If we're at the last match, fetch more
    console.log('📦 At last match, fetching new batch...');
    const newBatch = await fetchPotentialMatches(false, matchingState.exclusionSet);
    
    if (newBatch.length > 0) {
      console.log(`📦 Adding ${newBatch.length} new matches to batch`);
      setMatchingState(prev => ({
        ...prev,
        potentialMatches: [...prev.potentialMatches, ...newBatch],
        currentIndex: prev.currentIndex + 1, // Move to the first new match
      }));
    } else {
      console.log('📭 No more matches available');
      setMatchingState(prev => ({ ...prev, noMoreMatches: true }));
    }
  }, [fetchPotentialMatches, matchingState]);

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
      
      // Log current context for debugging
      console.log(`🔍 Like context - Current matchingState:`, {
        hasPotentialMatches: matchingStateRef.current.potentialMatches?.length > 0,
        potentialMatchesCount: matchingStateRef.current.potentialMatches?.length || 0,
        exclusionSetSize: matchingStateRef.current.exclusionSet?.size || 0
      });

      // Check if the TARGET USER (person being liked) has radiance
      let targetHasRadiance = false;
      
      try {
        const targetUserDoc = await FIRESTORE.collection("users").doc(matchId).get();
        
        if (targetUserDoc.exists) {
          const targetUserData = targetUserDoc.data() as UserDataType;
          
          if (targetUserData.boostExpiresAt) {
            const expiresAt = targetUserData.boostExpiresAt.toDate 
              ? targetUserData.boostExpiresAt.toDate()
              : new Date(targetUserData.boostExpiresAt);
            
            targetHasRadiance = new Date() < expiresAt;
          }
        }
      } catch (error) {
        console.error('❌ Error checking target user radiance:', error);
      }
      
      // 🔧 CRITICAL FIX: Update exclusion set AND remove from UI immediately
      setMatchingState(prev => {
        const newExclusionSet = new Set([...prev.exclusionSet, matchId]);
        
        // Remove liked user from potentialMatches array entirely
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
        

        
        return {
          ...prev,
          exclusionSet: newExclusionSet,
          potentialMatches: filteredMatches,
          currentIndex: nextIndex < filteredMatches.length ? nextIndex : 0,
          noMoreMatches: filteredMatches.length === 0
        };
      });
      
      // ✅ IMPROVED: Record like with proper error handling for already matched users
      try {
        await recordLikeWithBatch(
          userDataRef.current.userId, 
          matchId, 
          false, // viaLotus = false for regular likes
          targetHasRadiance
        );
        

      } catch (likeError: any) {
        // ✅ NEW: Handle case where users are already matched
        if (likeError.message?.includes('already matched') || likeError.message?.includes('User documents do not exist')) {

          // Don't rollback the exclusion since we still want them removed from the list
        } else {
          throw likeError; // Re-throw other errors for normal error handling
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error in optimized like:', error);
      
      // Only rollback exclusion for certain errors
      if (error.message !== "DAILY_LIMIT_REACHED" && !error.message?.includes('already matched')) {
        console.log(`🔄 Rolling back exclusion for ${matchId} due to error:`, error.message);
        
        // Safely rollback the exclusion
        setMatchingState(prev => {
          const newSet = new Set(prev.exclusionSet);
          newSet.delete(matchId);
          
          // Only try to restore user if we have potentialMatches (Connect screen context)
          if (prev.potentialMatches && prev.potentialMatches.length > 0) {
            const userToRestore = prev.potentialMatches.find(u => u.userId === matchId);
            if (userToRestore) {
              const newMatches = [...prev.potentialMatches, userToRestore];
              return { 
                ...prev, 
                exclusionSet: newSet,
                potentialMatches: newMatches
              };
            }
          }
          
          // If no potentialMatches or user not found, just update exclusion set
          return { 
            ...prev, 
            exclusionSet: newSet
          };
        });
      }
      
      throw error;
    }
  }, [getRemainingDailyLikes]);

  // 🔧 ALSO UPDATE: optimizedlotusLike with the same logic
  const optimizedlotusLike = useCallback(async (matchId: string) => {
    console.log(`✨ OPTIMIZED LOTUS LIKING USER: ${matchId}`);
    
    try {
      // Check lotus availability first
      if (!userDataRef.current.numOfLotus || userDataRef.current.numOfLotus <= 0) {
        throw new Error("No lotus available");
      }

      // Check if the TARGET USER (person being liked) has radiance
      console.log(`🔍 Checking if target user ${matchId} has radiance for lotus like...`);
      
      let targetHasRadiance = false;
      
      try {
        const targetUserDoc = await FIRESTORE.collection("users").doc(matchId).get();
        
        if (targetUserDoc.exists) {
          const targetUserData = targetUserDoc.data() as UserDataType;
          
          if (targetUserData.boostExpiresAt) {
            const expiresAt = targetUserData.boostExpiresAt.toDate 
              ? targetUserData.boostExpiresAt.toDate()
              : new Date(targetUserData.boostExpiresAt);
            
            targetHasRadiance = new Date() < expiresAt;
            
            console.log('🔍 Target user radiance check (lotus):', {
              expiresAt: expiresAt.toISOString(),
              currentTime: new Date().toISOString(),
              targetHasRadiance
            });
          }
        }
      } catch (error) {
        console.error('❌ Error checking target user radiance (lotus):', error);
      }
      

      
      // Update user data to reflect lotus usage immediately
      setUserData(prev => ({
            ...prev,
            numOfLotus: (prev.numOfLotus || 0) - 1
          }));
          
          // ✅ CRITICAL FIX: Same pattern - update exclusion set
          setMatchingState(prev => {
            const newExclusionSet = new Set([...prev.exclusionSet, matchId]);
            
            // Remove lotus-liked user from potentialMatches array entirely
            const filteredMatches = prev.potentialMatches.filter(match => match.userId !== matchId);
            
            // Find next valid user that's not excluded
            let nextIndex = prev.currentIndex;
            while (nextIndex < filteredMatches.length && newExclusionSet.has(filteredMatches[nextIndex]?.userId)) {
              nextIndex++;
            }
            
            if (nextIndex >= filteredMatches.length || !filteredMatches[nextIndex]) {
              nextIndex = 0;
              while (nextIndex < filteredMatches.length && newExclusionSet.has(filteredMatches[nextIndex]?.userId)) {
                nextIndex++;
              }
            }
            

            
            return {
              ...prev,
              exclusionSet: newExclusionSet,
              potentialMatches: filteredMatches,
              currentIndex: nextIndex < filteredMatches.length ? nextIndex : 0,
              noMoreMatches: filteredMatches.length === 0
            };
          });
      
      // ✅ IMPROVED: Record lotus like with proper error handling
      try {
        await recordLikeWithBatch(
          userDataRef.current.userId, 
          matchId, 
          true, // viaLotus = true for lotus likes
          targetHasRadiance
        );


      } catch (likeError: any) {
        // Handle case where users are already matched
        if (likeError.message?.includes('already matched') || likeError.message?.includes('User documents do not exist')) {
          // Don't rollback the exclusion since we still want them removed from the list
        } else {
          throw likeError;
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error lotus liking match:', error);
      
      // Rollback exclusion and lotus count on error (except for already matched)
      if (error.message !== "No lotuss available" && !error.message?.includes('already matched')) {
        setMatchingState(prev => {
          const newSet = new Set(prev.exclusionSet);
          newSet.delete(matchId);
          
          // Only try to restore user if we have potentialMatches (Connect screen context)
          if (prev.potentialMatches && prev.potentialMatches.length > 0) {
            const userToRestore = prev.potentialMatches.find(u => u.userId === matchId);
            if (userToRestore) {
              const newMatches = [...prev.potentialMatches, userToRestore];
              return { 
                ...prev, 
                exclusionSet: newSet,
                potentialMatches: newMatches
              };
            }
          }
          
          // If no potentialMatches or user not found, just update exclusion set
          return { 
            ...prev, 
            exclusionSet: newSet
          };
        });
        
        // Rollback lotus count if it was decremented
        setUserData(prev => ({
          ...prev,
          numOfLotus: (prev.numOfLotus || 0) + 1
        }));

      }
      
      throw error;
    }
  }, []);

  // 🔧 CRITICAL FIX: Completely rewritten dislike function
  const optimizedDislikeMatch = useCallback(async (matchId: string) => {
    console.log(`👎 OPTIMIZED DISLIKING USER: ${matchId}`);
    
    try {
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
          exclusionSet: newExclusionSet, // ✅ KEY FIX HERE TOO
          potentialMatches: filteredMatches,
          currentIndex: nextIndex < filteredMatches.length ? nextIndex : 0,
          noMoreMatches: filteredMatches.length === 0
        };
      });
      
      // Perform dislike action in background with error handling
      try {
        await recordDislikeWithBatch(userDataRef.current.userId, matchId);
        console.log(`✅ Optimized dislike completed for ${matchId}`);
      } catch (dislikeError: any) {
        // Handle case where user doesn't exist
        if (dislikeError.message?.includes('User documents do not exist')) {
          console.log(`⚠️ User ${matchId} doesn't exist, skipping dislike recording`);
          // Don't rollback the exclusion since we still want them removed from the list
        } else {
          throw dislikeError;
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error disliking match:', error);
      
      // Rollback on error (except for non-existent users)
      if (!error.message?.includes('User documents do not exist')) {
        setMatchingState(prev => {
          const newSet = new Set(prev.exclusionSet);
          newSet.delete(matchId);
          
          // Only try to restore user if we have potentialMatches (Connect screen context)
          if (prev.potentialMatches && prev.potentialMatches.length > 0) {
            const userToRestore = prev.potentialMatches.find(u => u.userId === matchId);
            if (userToRestore) {
              const newMatches = [...prev.potentialMatches, userToRestore];
              return { 
                ...prev, 
                exclusionSet: newSet,
                potentialMatches: newMatches
              };
            }
          }
          
          // If no potentialMatches or user not found, just update exclusion set
          return { 
            ...prev, 
            exclusionSet: newSet
          };
        });
      }
      
      throw error;
    }
  }, []);

  const recordLikeWithBatch = async (
    fromUserId: string,
    toUserId: string,
    viaLotus: boolean = false,
    viaRadiance: boolean = false
  ): Promise<void> => {
          try {
        // 🔒 SECURITY FIX: Only write to our own documents to avoid permission issues
        const fromRef = FIRESTORE.collection("users").doc(fromUserId);
        const toRef = FIRESTORE.collection("users").doc(toUserId);
        const givenRef = fromRef.collection("likesGiven").doc(toUserId);
        const incomingRef = fromRef.collection("likesReceived").doc(toUserId);
      
              const [fromSnap, incomingSnap] = await Promise.all([
          fromRef.get(),
          incomingRef.get()
        ]);
        
        if (!fromSnap.exists) {
          throw new Error('User document does not exist');
        }
        
        // Check if we already have this user in our likesGiven
        const alreadyLikedSnap = await givenRef.get();
        if (alreadyLikedSnap.exists) {
          // Check if they're already matched
          const matchRef = fromRef.collection("matches").doc(toUserId);
          const matchSnap = await matchRef.get();
          if (matchSnap.exists) {
            throw new Error('Users are already matched');
          }
        }
        
        const fromData: any = fromSnap.data()!;
        const hadLikedUs = incomingSnap.exists;
      
      // Check lotus allowance
      if (viaLotus && (fromData.numOfLotus ?? 0) < 1) {
        throw new Error("No lotus left this week");
      }
      
      // Prepare batch
      const batch = FIRESTORE.batch();
      
      // Always set the likesGiven record with connection method tracking
      const likeData = {
        matchId: toUserId,
        viaLotus,
        viaRadiance,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };
      
      batch.set(givenRef, likeData);
      
      const fromUpdates: any = {
        likesGivenCount: (fromData.likesGivenCount ?? 0) + 1,
      };

      // Handle daily likes for non-subscribers
      if (!fromData?.subscription?.isActive && !__DEV__) {
        const needsReset = shouldResetDailyLikes(fromData.lastLikeResetDate);
        if (needsReset) {
          fromUpdates.dailyLikesCount = 1;
          fromUpdates.lastLikeResetDate = firestore.FieldValue.serverTimestamp();
        } else {
          fromUpdates.dailyLikesCount = (fromData.dailyLikesCount ?? 0) + 1;
        }
      }
      
      // Handle lotus consumption
      if (viaLotus && !fromData?.subscription?.isActive) {
        fromUpdates.numOfLotus = Math.max(0, (fromData.numOfLotus ?? 0) - 1);
      }
      
              // Handle mutual match creation
        if (hadLikedUs) {
          // Get the original like data to preserve connection method
          const incomingLikeData = incomingSnap.data();
          const originalviaLotus = incomingLikeData?.viaLotus || false;
          const originalViaRadiance = incomingLikeData?.viaRadiance || false;
          
          // Remove the incoming like since we're creating a match
          batch.delete(incomingRef);
          fromUpdates.likesReceivedCount = Math.max(0, (fromData.likesReceivedCount ?? 1) - 1);
          
          const myMatchRef = fromRef.collection("matches").doc(toUserId);
          
          // Store match data with connection methods from both sides
          const matchData = {
            timestamp: firestore.FieldValue.serverTimestamp(),
            myConnectionMethod: {
              viaLotus,
              viaRadiance
            },
            theirConnectionMethod: {
              viaLotus: originalviaLotus,
              viaRadiance: originalViaRadiance
            }
          };
          
          batch.set(myMatchRef, matchData);
          
          // Also create the match document for the other user
          const theirMatchRef = toRef.collection("matches").doc(fromUserId);
          const theirMatchData = {
            timestamp: firestore.FieldValue.serverTimestamp(),
            myConnectionMethod: {
              viaLotus: originalviaLotus,
              viaRadiance: originalViaRadiance
            },
            theirConnectionMethod: {
              viaLotus,
              viaRadiance
            }
          };
          
          batch.set(theirMatchRef, theirMatchData);
          
          fromUpdates.matches = firestore.FieldValue.arrayUnion(toUserId);
          
          // Update the other user's matches array as well
          batch.update(toRef, {
            matches: firestore.FieldValue.arrayUnion(fromUserId)
          });
          
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
            connectionMethods: {
              [fromUserId]: { viaLotus, viaRadiance },
              [toUserId]: { viaLotus: originalviaLotus, viaRadiance: originalViaRadiance }
            }
          });
        } else {
          // Only for NON-MUTUAL likes: create received like record
        }
      
      // Always update the sender (fromUser)
      batch.update(fromRef, fromUpdates);
      
      try {
        await batch.commit();
      } catch (commitError: any) {
        // Check if it's a permission error
        if (commitError.code === 'permission-denied') {
          throw new Error('Permission denied: Unable to create like due to security restrictions. This may require a Cloud Function to handle cross-user operations.');
        }
        throw commitError;
      }
      
      // Update local state
      if (viaLotus && !userData.subscription?.isActive) {
        setUserData((prev) => ({
          ...prev,
          numOfLotus: Math.max(0, (prev.numOfLotus ?? 1) - 1),
          likesGivenCount: (prev.likesGivenCount ?? 0) + 1,
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          likesGivenCount: (prev.likesGivenCount ?? 0) + 1,
        }));
      }
      
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
    Array<any & { viaLotus: boolean; viaRadiance: boolean; likedAt: Date }>
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
          viaLotus: rec.viaLotus,
          viaRadiance: rec.viaRadiance || false,
          likedAt: rec.timestamp?.toDate?.() || new Date(rec.timestamp),
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
    console.log("📤 SIGN OUT CALLED!");
    
    // 🔒 SET CANCELLATION FLAG: Signal that sign out is in progress
    isSigningOutRef.current = true;
    
    try {
      // 1. First clear local state (this won't trigger navigation)
      setUserData(initialUserData);
      setCurrentUser(null);
      
      // 🔄 MODERN STATE SYNC: Clear all user references
      syncUserState(null);
      
      // 2. Update user data to ensure currentOnboardingScreen is saved (non-blocking)
      if (FIREBASE_AUTH.currentUser?.uid) {
        const screenToSave = userData.currentOnboardingScreen || "LoginSignupScreen";
        // Use non-blocking update to prevent sign out from hanging
        FIRESTORE.collection("users").doc(FIREBASE_AUTH.currentUser.uid).update({
          currentOnboardingScreen: screenToSave
        }).then(() => {
          console.log("✅ Updated user data before sign out");
        }).catch(() => {
          // Silently ignore errors during sign-out - this is expected behavior
          // console.error("Error updating user data before sign out:", updateError);
        });
      }
  
      // 3. Sign out from Google if signed in
      try {
        const googleUser = await GoogleSignin.getCurrentUser();
        if (googleUser) {
          await GoogleSignin.signOut();
          console.log("✅ Google account signed out!");
          setGoogleCredential(null);
        }
      } catch (googleError) {
        console.warn("Google sign out error:", googleError);
      }

      // 4. Sign out from Apple if signed in
      try {
        if (appleCredential) {
          // Apple doesn't have a direct signOut method like Google
          // But we can clear the credential and let Firebase handle the rest
          console.log("✅ Apple credential cleared!");
          setAppleCredential(null);
        }
      } catch (appleError) {
        console.warn("Apple sign out error:", appleError);
      }
  
      // 5. Sign out from Firebase (if there's a current user)
      if (FIREBASE_AUTH.currentUser) {
        await FIREBASE_AUTH.signOut();
        console.log("✅ Firebase user signed out!");
      } else {
        // 🔧 FIXED: Use router.replace for sign out navigation (no animation needed)
        router.replace("onboarding/LoginSignupScreen" as any);
        console.log("⚠️ No Firebase current user to sign out");
      }
  
    } catch (error) {
      console.error("❌ Error during sign-out:", error);
      // Let auth state change handle navigation even on error
    }
  };

  const navigateToNextScreen = async () => {
    const currentScreenIndex = screens.indexOf(userData.currentOnboardingScreen);
    const nextScreenIndex = currentScreenIndex + 1;
    
    if (nextScreenIndex < screens.length) {
      const nextScreen = screens[nextScreenIndex];
      await saveProgress(nextScreen);
      updateUserData({ currentOnboardingScreen: nextScreen });
      
      // 🔄 MODERN STATE SYNC: Keep user references in sync after navigation
      if (FIREBASE_AUTH.currentUser) {
        syncUserState(FIREBASE_AUTH.currentUser);
      }
      
      // 🔧 FIXED: Use router.push for forward navigation (this is correct)
      router.push(`onboarding/${nextScreen}` as any);
    } else {
      await updateUserData({
        onboardingCompleted: true,
        onboardingCompletedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      // 🔄 MODERN STATE SYNC: Keep user references in sync after onboarding completion
      if (FIREBASE_AUTH.currentUser) {
        syncUserState(FIREBASE_AUTH.currentUser);
      }
      
      // 🔧 FIXED: Use router.replace for final destination (no animation needed)
      router.replace("/(tabs)/Connect" as any);
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
      
      // 🔄 MODERN STATE SYNC: Keep user references in sync after navigation
      if (FIREBASE_AUTH.currentUser) {
        syncUserState(FIREBASE_AUTH.currentUser);
      }
      
      // 🔧 FIXED: Use router.back() for proper back animation, or replace for login screen
      if (previousScreen === "LoginSignupScreen") {
        router.replace("onboarding/LoginSignupScreen" as any);
      } else {
        // Use router.back() to get proper left-to-right back animation
        router.back();
      }
    } else {
      // If we're at the first screen, go back to login
      router.replace("onboarding/LoginSignupScreen" as any);
    }
  };

  const navigateToScreen = async (screen: string) => {
    if (screen === "NameScreen") {
      router.replace("onboarding/LoginSignupScreen" as any);
    } else {
      await saveProgress(screen);
      // 🔧 FIXED: Use router.push for forward navigation (this is correct)
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
      
      // 🔄 MODERN STATE SYNC: Keep user references in sync after onboarding completion
      if (FIREBASE_AUTH.currentUser) {
        syncUserState(FIREBASE_AUTH.currentUser);
      }
      
      // Request notification permissions after onboarding completion
      setTimeout(() => {
        requestNotificationPermissionsAfterOnboarding();
      }, 1000); // Small delay to ensure user data is synced
      
      // 🔧 FIXED: Use router.replace for final destination (no animation needed)
      router.replace("/(tabs)/Connect" as any);
    } catch (error) {
      console.error("Failed to complete onboarding: ", error);
    }
  };

  // Request notification permissions after onboarding completion
  const requestNotificationPermissionsAfterOnboarding = async () => {
    try {
      // Only request if we haven't asked before or if permission was denied
      const currentPermissionStatus = userData?.settings?.notificationPermissionStatus;
      
      if (currentPermissionStatus === 'not-requested' || currentPermissionStatus === 'denied') {
        const permissionStatus = await NotificationService.requestPermissions();
        
        // Update the permission status in user settings
        await updateUserSettings({
          notificationPermissionStatus: permissionStatus || 'denied'
        });
        
        if (permissionStatus === 'granted') {
          const token = await NotificationService.getPushToken();
          if (token) {
            // Update user's push token in Firestore
            await updateUserSettings({
              pushToken: token,
            });
          }
        }
      }
    } catch (error) {
      console.log('Error requesting notification permissions after onboarding:', error);
      // Mark as denied if there's an error
      await updateUserSettings({
        notificationPermissionStatus: 'denied'
      });
    }
  };

  // Manual function to request notification permissions (can be called from UI)
  const requestNotificationPermissions = async () => {
    try {
      const permissionStatus = await NotificationService.requestPermissions();
      
      // Update the permission status in user settings
      await updateUserSettings({
        notificationPermissionStatus: permissionStatus || 'denied'
      });
      
      if (permissionStatus === 'granted') {
        const token = await NotificationService.getPushToken();
        if (token) {
          // Update user's push token in Firestore
          await updateUserSettings({
            pushToken: token,
          });
          return { success: true, message: 'Notifications enabled successfully!' };
        }
      } else {
        return { success: false, message: 'Permission denied. You can enable notifications in Settings.' };
      }
    } catch (error) {
      console.log('Error requesting notification permissions:', error);
      // Mark as denied if there's an error
      await updateUserSettings({
        notificationPermissionStatus: 'denied'
      });
      return { success: false, message: 'Failed to request permissions. Please try again.' };
    }
  };


  const getImageUrl = useCallback(
    async (imagePath: string): Promise<string | null> => {
      if (!imagePath) return null;
      
      // 1) HTTP URLs: already download URLs, return directly
      if (imagePath.startsWith("http")) {
        return imagePath;
      }

      // 2) Check cache first
      const cached = imageCache[imagePath];
      if (cached) {
        return typeof cached === "string" ? Promise.resolve(cached) : cached;
      }

      // 3) Firebase Storage paths: convert to download URL
      try {
        console.log(`🔍 Converting storage path to download URL: ${imagePath}`);
        
        const loader = STORAGE.ref(imagePath)
          .getDownloadURL()
          .then((url) => {
            console.log(`✅ Got download URL for ${imagePath}: ${url.substring(0, 50)}...`);
            imageCache[imagePath] = url;
            return url;
          })
          .catch((err) => {
            console.warn(`❌ Failed to get download URL for ${imagePath}:`, err.code);
            
            // Cache the failure to avoid repeated attempts
            imageCache[imagePath] = Promise.resolve(null);
            return null;
          });

        imageCache[imagePath] = loader;
        return loader;
      } catch (error) {
        console.warn(`❌ Error processing image path ${imagePath}:`, error);
        return null;
      }
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
        theirConnectionMethod?: { viaLotus: boolean; viaRadiance: boolean };
        myConnectionMethod?: { viaLotus: boolean; viaRadiance: boolean };
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

          // Fetch connection method information from the matches subcollection
          const matchSnap = await FIRESTORE.collection("users")
            .doc(userId)
            .collection("matches")
            .doc(otherId)
            .get();
          
          const matchData = matchSnap.exists ? matchSnap.data() : {};
          const theirConnectionMethod = matchData?.theirConnectionMethod || { viaLotus: false, viaRadiance: false };
          const myConnectionMethod = matchData?.myConnectionMethod || { viaLotus: false, viaRadiance: false };

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
            theirConnectionMethod,
            myConnectionMethod,
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
          viaLotus: doc.data().viaLotus || false,
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
                  viaLotus: record.viaLotus,
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
    firstName?: string;
    photos?: string[];
    lastMessage: string;
    lastUpdated: Date;
    theirConnectionMethod?: { viaLotus: boolean; viaRadiance: boolean };
    myConnectionMethod?: { viaLotus: boolean; viaRadiance: boolean };
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

          // Fetch connection method information from the matches subcollection
          const matchSnap = await FIRESTORE.collection("users")
            .doc(userId)
            .collection("matches")
            .doc(otherId)
            .get();
          
          const matchData = matchSnap.exists ? matchSnap.data() : {};
          const theirConnectionMethod = matchData?.theirConnectionMethod || { viaLotus: false, viaRadiance: false };
          const myConnectionMethod = matchData?.myConnectionMethod || { viaLotus: false, viaRadiance: false };

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
            theirConnectionMethod,
            myConnectionMethod,
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
    try {
      const chatRef = FIRESTORE.collection("chats").doc(chatId);
      await chatRef.update({
        lastMessageSender: userId,
      });
      
      // Optimistically update local unread count
      setUnreadMatchesCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking chat as read:', error);
      throw error;
    }
  };

  // Function to mark a new match as "read" when user sends first message
  const markNewMatchAsRead = async (
    chatId: string,
    userId: string
  ): Promise<void> => {
    try {
      const chatRef = FIRESTORE.collection("chats").doc(chatId);
      await chatRef.update({
        lastMessageSender: userId,
      });
      
      // Optimistically update local unread count
      setUnreadMatchesCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking new match as read:', error);
      throw error;
    }
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
    async (matchId: string, userId: string) => {
      try {
        if (!matchId || !userId) {
          console.warn('⚠️ Missing matchId or userId for markMatchAsRead');
          return;
        }

        console.log(`📱 Marking match ${matchId} as read for user ${userId}`);
        
        // Update the match document to mark it as read
        const matchRef = FIRESTORE.collection("users").doc(userId).collection("matches").doc(matchId);
        await matchRef.update({
          lastReadAt: firestore.FieldValue.serverTimestamp(),
          isRead: true
        });

        // Also update the chat if it exists
        const chatId = [userId, matchId].sort().join("_");
        const chatRef = FIRESTORE.collection("chats").doc(chatId);
        const chatSnap = await chatRef.get();
        
        if (chatSnap.exists) {
          await chatRef.update({
            [`readBy.${userId}`]: firestore.FieldValue.serverTimestamp()
          });
        }

        // Optimistic local decrement if this is the current user
        if (userId === userData.userId) {
          setUnreadMatchesCount((c) => Math.max(0, c - 1));
        }

        console.log(`✅ Match ${matchId} marked as read`);
      } catch (error) {
        console.error('❌ Error marking match as read:', error);
        throw error;
      }
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
          "dislikesGiven",
          "reportedUsers",
          "dislikesReceived",
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
      
      // Step 13: Sign out from Apple if connected
      if (userData.AppleSSOEnabled) {
        try {
          // Apple doesn't have a direct signOut method like Google
          // But we can clear the credential
          setAppleCredential(null);
          console.log("Apple credential cleared during account deletion");
        } catch (appleError) {
          console.warn("Error clearing Apple credential:", appleError);
        }
      }
      
      console.log("Account successfully deleted");
      
      // Step 14: Navigate to login screen
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

  // 🪷 Test function for weekly lotus cloud function (remove in production)
  const testWeeklyLotusFunction = async () => {
    try {
      console.log('🧪 Testing weekly lotus cloud function...');
      const response = await FUNCTIONS.httpsCallable("manualAssignWeeklyLotus");
      const result = await response({});
      console.log('✅ Weekly lotus test result:', result.data);
      return result.data;
    } catch (error) {
      console.error("❌ Error testing weekly lotus function:", error);
      throw error;
    }
  };

  const activateRadiance = async () => {
    try {
      if (!userData.userId || !userData.activeBoosts || userData.activeBoosts <= 0) {
        throw new Error("No boosts available to activate");
      }

      // Check if radiance is already active
      if (hasActiveRadiance(userData)) {
        throw new Error("Radiance is already active");
      }

      console.log(`🚀 Activating 1 radiance boost. Current boosts: ${userData.activeBoosts}`);

      // Calculate expiration time (1 HOUR from now, not 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Changed from +24 to +1

      // Update Firestore - use the calculated expiration time
      await FIRESTORE.collection('users').doc(userData.userId).update({
        boostExpiresAt: firestore.Timestamp.fromDate(expiresAt), // Use the calculated time
        activeBoosts: userData.activeBoosts - 1, // Reduce by exactly 1
      });

      // Update local state
      setUserData(prevData => ({
        ...prevData,
        boostExpiresAt: expiresAt, // Set local expiration to 1 hour from now
        activeBoosts: (prevData.activeBoosts || 1) - 1, // Reduce by exactly 1
      }));

      console.log(`✨ Radiance activated successfully! Expires at: ${expiresAt.toLocaleTimeString()}`);
      console.log(`📊 Remaining boosts: ${userData.activeBoosts - 1}`);
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

  // 🎯 Get user's match compatibility score
  const getUserCompatibilityScore = useCallback((otherUser: UserDataType): number => {
    if (!userData.matchPreferences || !otherUser.spiritualProfile) {
      return 0;
    }

    let score = 0;
    const prefs = userData.matchPreferences;
    const otherProfile = otherUser.spiritualProfile;

    // Spiritual draws compatibility
    if (prefs.spiritualCompatibility?.spiritualDraws && otherProfile.draws) {
      const commonDraws = prefs.spiritualCompatibility.spiritualDraws.filter(
        draw => otherProfile.draws!.includes(draw)
      );
      score += commonDraws.length * 10;
    }

    // Spiritual practices compatibility
    if (prefs.spiritualCompatibility?.practices && otherProfile.practices) {
      const commonPractices = prefs.spiritualCompatibility.practices.filter(
        practice => otherProfile.practices!.includes(practice)
      );
      score += commonPractices.length * 8;
    }

    // Healing modalities compatibility
    if (prefs.spiritualCompatibility?.healingModalities && otherProfile.healingModalities) {
      const commonModalities = prefs.spiritualCompatibility.healingModalities.filter(
        modality => otherProfile.healingModalities!.includes(modality)
      );
      score += commonModalities.length * 6;
    }

    return Math.min(score, 100); // Cap at 100
  }, [userData.matchPreferences]);

  // 📍 Calculate distance between two users
  const calculateUserDistance = useCallback((otherUser: UserDataType): number | null => {
    if (!userData.latitude || !userData.longitude || 
        !otherUser.latitude || !otherUser.longitude) {
      return null;
    }

    return calculateHaversineDistance(
      userData.latitude,
      userData.longitude,
      otherUser.latitude,
      otherUser.longitude
    );
  }, [userData.latitude, userData.longitude]);

  // 🔄 Refresh user's match preferences hash
  const refreshPreferencesHash = useCallback(() => {
    if (!userData.matchPreferences) return '';
    
    const prefs = userData.matchPreferences;
    const hashData = {
      ageRange: prefs.preferredAgeRange,
      heightRange: prefs.preferredHeightRange,
      distance: prefs.preferredDistance,
      connectionIntent: prefs.connectionIntent,
      connectionPreferences: prefs.connectionPreferences?.sort(),
      connectionStyles: prefs.connectionStyles?.sort(),
      spiritualCompatibility: prefs.spiritualCompatibility
    };
    
    return JSON.stringify(hashData);
  }, [userData.matchPreferences]);

  // 📊 Get user statistics and insights
  const getUserStats = useCallback(() => {
    const stats = {
      totalLikes: (userData.likesGivenCount || 0) + (userData.likesReceivedCount || 0),
      totalMatches: userData.matches?.length || 0,
      totalDislikes: (userData.dislikesGivenCount || 0) + (userData.dislikesReceivedCount || 0),
      lotusCount: userData.numOfLotus || 0,
      activeBoosts: userData.activeBoosts || 0,
      isBoosted: isUserBoosted(userData),
      isRecentlyActive: isUserRecentlyActive(userData),
      onboardingCompleted: userData.onboardingCompleted || false,
      hasSpiritualProfile: !!(userData.spiritualProfile?.draws?.length || 
                             userData.spiritualProfile?.practices?.length || 
                             userData.spiritualProfile?.healingModalities?.length),
      subscriptionStatus: userData.subscription?.status || 'none',
      lastActive: userData.lastActive,
      createdAt: userData.createdAt
    };
    
    return stats;
  }, [userData, isUserBoosted, isUserRecentlyActive]);

  // ✅ Validate user data integrity
  const validateUserData = useCallback(() => {
    const issues: string[] = [];
    
    // Check required fields
    if (!userData.userId) issues.push('Missing userId');
    if (!userData.phoneNumber) issues.push('Missing phoneNumber');
    if (!userData.currentOnboardingScreen) issues.push('Missing currentOnboardingScreen');
    
    // Check data consistency
    if (userData.age && (userData.age < 18 || userData.age > 120)) {
      issues.push('Invalid age value');
    }
    
    if (userData.height && (userData.height < 100 || userData.height > 250)) {
      issues.push('Invalid height value (should be in cm)');
    }
    
    if (userData.latitude && (userData.latitude < -90 || userData.latitude > 90)) {
      issues.push('Invalid latitude value');
    }
    
    if (userData.longitude && (userData.longitude < -180 || userData.longitude > 180)) {
      issues.push('Invalid longitude value');
    }
    
    // Check spiritual profile completeness
    if (userData.spiritualProfile) {
      const profile = userData.spiritualProfile;
      if (!profile.draws?.length && !profile.practices?.length && !profile.healingModalities?.length) {
        issues.push('Spiritual profile is incomplete');
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 10))
    };
  }, [userData]);

  // 💎 Create Lotus Payment Intent
  const createLotusPaymentIntent = async (lotusCount: number) => {
    try {
      if (!userData.userId) {
        throw new Error("User ID is required");
      }

      console.log(`Creating payment for ${lotusCount} lotus flowers...`);
      
      const createPaymentFunction = FUNCTIONS.httpsCallable('createLotusPayment');
      const result = await createPaymentFunction({ lotusCount });
      
      const { clientSecret, paymentIntentId, amount } = result.data as PaymentIntent;
      
      console.log(`Lotus payment intent created: ${paymentIntentId} for $${amount / 100}`);
      
      return { clientSecret, paymentIntentId };
    } catch (error: any) {
      console.error("Failed to create lotus payment:", error);
      throw new Error(`Lotus payment creation failed: ${error.message}`);
    }
  };

  // 💎 Confirm Lotus Payment (after Stripe payment succeeds)
  const confirmLotusPayment = async (paymentIntentId: string) => {
    try {
      if (!userData.userId) {
        throw new Error("User ID is required");
      }

      console.log(`🔄 Confirming lotus payment: ${paymentIntentId}`);
      console.log(`👤 User ID: ${userData.userId}`);
      
      const confirmPaymentFunction = FUNCTIONS.httpsCallable('confirmLotusPayment');
      
      console.log('📞 Calling confirmLotusPayment function...');
      const result = await confirmPaymentFunction({ paymentIntentId });
      
      console.log('✅ Lotus payment confirmation successful:', result);
      
      const { success, lotusCount, totalPrice, transactionId } = result.data as PaymentResult;
      
      if (success) {
        // Update local state with new lotus count
        const purchase: LotusPurchase = {
          lotusCount,
          totalPrice,
          purchaseDate: new Date(),
          transactionId,
          stripePaymentIntentId: paymentIntentId,
          status: 'succeeded'
        };
        
        setUserData(prevData => ({
          ...prevData,
          numOfLotus: (prevData.numOfLotus || 0) + lotusCount,
          lotusPurchases: [
            ...(prevData.lotusPurchases || []),
            purchase
          ]
        }));
        
        console.log(`✅ Successfully confirmed purchase of ${lotusCount} lotus flowers`);
        return { success: true, lotusCount, totalPrice };
      } else {
        throw new Error('Lotus payment confirmation failed');
      }
    } catch (error: any) {
      console.error("❌ Failed to confirm lotus payment:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error details:", error.details);
      throw new Error(`Lotus payment confirmation failed: ${error.message}`);
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
    appleCredential,
    setAppleCredential,
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
    lotusLike: optimizedlotusLike,
    loadNextMatch,
    getReceivedLikesDetailed,
    createOrFetchChat,
    subscribeToChatMessages,
    subscribeToChatMatches,
    subscribeToReceivedLikes,
    sendMessage,
    markChatAsRead,
    markNewMatchAsRead,
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
    handleAppleSignIn,
    matchingState,
    resetMatching,
    currentPotentialMatch,
    likesGivenCount: userData.likesGivenCount,
    loadingNextBatch: matchingState.loadingBatch,
    getRemainingDailyLikes,
    DAILY_LIKE_LIMIT,
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
    createLotusPaymentIntent,
    confirmLotusPayment,
    getUserCompatibilityScore,
    calculateUserDistance,
    refreshPreferencesHash,
    getUserStats,
    validateUserData,
    testWeeklyLotusFunction,
    checkAndRefetchIfNeeded,
    forceRefetchOnReturn,
    initializing,
    isSigningOut: isSigningOutRef.current,
    requestNotificationPermissions,
    
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
