import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { AppState } from "react-native";
import { useRouter } from "expo-router";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { FIREBASE_AUTH, FIRESTORE, STORAGE } from "@/services/FirebaseConfig";
import auth from "@react-native-firebase/auth";

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
} from "@react-native-firebase/firestore";

export type UserDataType = {
  userId: string;
  createdAt: any;
  lastActive?: any;
  isSeedUser: boolean;
  isRadiantSoul?: boolean;
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
  sexualOrientation?: string[];
  ethnicities?: string[];
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
  likesGivenCount?: number;
  likesReceivedCount?: number;
  matches?: string[];
  onboardingCompleted?: boolean;
  matchPreferences?: {
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
  markChatAsRead: (chatId: string, userId: string) => Promise<void>;
  fetchChatMatches: (userId: string) => Promise<any[]>;
  fetchRadiantSouls: () => Promise<any[]>;
  fetchPotentialMatches: () => void;
  resetPotentialMatches: () => void;
  getImageUrl: (imagePath: string) => Promise<string | null>;
  getReceivedLikesDetailed: () => Promise<any[]>;
  noMoreMatches: boolean;
  likesGivenCount?: number;
  likesReceivedCount?: number;
  dislikesGivenCount?: number;
  dislikesReceivedCount?: number;
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
    preferredEthnicities: [],
    preferredDistance: 100,
    datePreferences: [],
    desiredRelationship: "",
    preferredSpiritualPractices: [],
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
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null);
  const [noMoreMatches, setNoMoreMatches] = useState<boolean>(false);
  const [isLinking, setIsLinking] = useState(false);
  const userDataRef = useRef(userData);
  const router = useRouter();
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
  const WEEKLY_ORB_ALLOWANCE = 1;

  useEffect(() => {
    const subscriber = FIREBASE_AUTH.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    // don’t kick off until we actually have preferences from Firestore
    if (!userData.matchPreferences) return;

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
  }, [userData.matchPreferences]);

  useEffect(() => {
    // don’t prefetch until we have at least one batch
    if (potentialMatches.length === 0) return;

    const buffer = potentialMatches.length - currentPotentialMatchIndex - 1;
    if (buffer < 3 && !loadingNextBatch && !noMoreMatches) {
      console.log("Buffer is low, fetching more potential matches...");
      fetchPotentialMatches();
    }
  }, [potentialMatches, currentPotentialMatchIndex]);

  useEffect(() => {
    if (!userData.userId) return;

    const loadExclusions = async () => {
      const likesSnap = await getDocs(
        collection(doc(FIRESTORE, "users", userData.userId), "likesGiven")
      );
      const dislikesSnap = await getDocs(
        collection(doc(FIRESTORE, "users", userData.userId), "dislikesGiven")
      );

      setExcludedLikes(new Set(likesSnap.docs.map((d) => d.id)));
      setExcludedDislikes(new Set(dislikesSnap.docs.map((d) => d.id)));
    };

    loadExclusions();
  }, [userData.userId]);

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

  const assignWeeklyOrb = useCallback(async () => {
    if (!userData.userId) return;

    const userRef = doc(FIRESTORE, "users", userData.userId);

    // If they already have >=1 orb, or we assigned within the last week, bail out.
    const last = userData.lastOrbAssignedAt?.toMillis?.() ?? 0;
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    if ((userData.numOfOrbs ?? 0) >= 1 && now - last < oneWeekMs) {
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
          console.log(
            "handleGoogleSignIn(): Existing user found",
            existingUser
          );

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
        //     ? "/main/Connect"
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
          // If onboarding is completed, navigate to the main app screen
          updateUserData({
            ...userDataFromFirestore,
            currentOnboardingScreen: "Connect",
          });
          router.replace({
            pathname: `/main/Connect` as any,
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

    // --- Ethnicity ---
    const ethnicities = matchPreferences?.preferredEthnicities;
    if (ethnicities?.length && !ethnicities.includes("Open to All")) {
      constraints.push(where("ethnicities", "array-contains-any", ethnicities));
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
    setLoadingNextBatch(true);
    userDataRef.current = userData;
    console.log("fetching potential matches...");
    const excluded = new Set<string>([
      userData.userId,
      ...excludedLikes,
      ...excludedDislikes,
      ...(userData.matches ?? []),
    ]);

    const baseConstraints = [
      orderBy("likesReceivedCount", "desc"),
      limit(10),
      where("isRadiantSoul", "==", false),
      ...buildQueryConstraints({
        matchPreferences: userData.matchPreferences,
        currentLat: userData.latitude,
        currentLon: userData.longitude,
      }),
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
        .filter((u) => !excluded.has(u.userId) && !u.isRadiantSoul);
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

  const fetchRadiantSouls = async (): Promise<UserDataType[]> => {
    if (!userData.userId) return [];
    console.log("fetching radiant souls...");
    // 1) grab the top‑10 radiant souls
    const soulsQuery = query(
      collection(FIRESTORE, "users"),
      where("isRadiantSoul", "==", true),
      orderBy("likesReceivedCount", "desc"),
      limit(10),
      ...buildQueryConstraints({
        // matchPreferences: userData.matchPreferences,
        currentLat: userData.latitude,
        currentLon: userData.longitude,
      })
    );
    const soulsSnap = await getDocs(soulsQuery);
    const souls = soulsSnap.docs.map((d) => ({
      userId: d.id,
      ...(d.data() as Omit<UserDataType, "userId">),
    }));

    // 2) load your likes‑given and dislikes‑given subcollections
    const likesGivenSnap = await getDocs(
      collection(FIRESTORE, "users", userData.userId, "likesGiven")
    );
    const dislikesGivenSnap = await getDocs(
      collection(FIRESTORE, "users", userData.userId, "dislikesGiven")
    );

    // 3) build an exclusion set
    const excluded = new Set<string>();
    excluded.add(userData.userId);
    likesGivenSnap.docs.forEach((doc) => excluded.add(doc.id));
    dislikesGivenSnap.docs.forEach((doc) => excluded.add(doc.id));

    // 4) filter out anyone you’ve liked or disliked (or yourself)
    const filtered = souls.filter((u) => !excluded.has(u.userId));

    return filtered;
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
    const fromRef = doc(FIRESTORE, "users", fromUserId);
    const toRef = doc(FIRESTORE, "users", toUserId);

    const givenRef = doc(collection(fromRef, "likesGiven"), toUserId);
    const receivedRef = doc(collection(toRef, "likesReceived"), fromUserId);

    await runTransaction(FIRESTORE, async (tx) => {
      const fromSnap = await tx.get(fromRef);
      const fromData = fromSnap.data()!;

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
      tx.update(fromRef, updates);

      // bump receiver’s counter
      const toSnap = await tx.get(toRef);
      const toData = toSnap.data()!;
      tx.update(toRef, {
        likesReceivedCount: (toData.likesReceivedCount ?? 0) + 1,
      });

      // write the actual sub‑collection records
      tx.set(givenRef, {
        matchId: toUserId,
        viaOrb,
        timestamp: serverTimestamp(),
      });
      tx.set(receivedRef, {
        matchId: fromUserId,
        viaOrb,
        timestamp: serverTimestamp(),
      });
    });
    refreshRadiantSouls();
  };

  const recordDislike = async (
    fromUserId: string,
    toUserId: string
  ): Promise<void> => {
    const fromRef = doc(FIRESTORE, "users", fromUserId);
    const toRef = doc(FIRESTORE, "users", toUserId);
    const givenRef = doc(collection(fromRef, "dislikesGiven"), toUserId);
    const receivedRef = doc(collection(toRef, "dislikesReceived"), fromUserId);

    await runTransaction(FIRESTORE, async (tx) => {
      // 1) bump the “given” counter
      const fromSnap = await tx.get(fromRef);
      const fromData = fromSnap.data()!;
      tx.update(fromRef, {
        dislikesGivenCount: (fromData.dislikesGivenCount ?? 0) + 1,
      });

      // 2) bump the “received” counter
      const toSnap = await tx.get(toRef);
      const toData = toSnap.data()!;
      tx.update(toRef, {
        dislikesReceivedCount: (toData.dislikesReceivedCount ?? 0) + 1,
      });

      // 3) write the records
      tx.set(givenRef, { matchId: toUserId, timestamp: serverTimestamp() });
      tx.set(receivedRef, {
        matchId: fromUserId,
        timestamp: serverTimestamp(),
      });
    });
  };

  const refreshRadiantSouls = useCallback(async () => {
    console.log("Refreshing Radiant Souls...");
    const db = FIRESTORE;
    const usersCol = collection(db, "users");
    const TOP_N = 10;

    // a) grab current flagged radiant souls
    const prevSnap = await query(
      usersCol,
      where("isRadiantSoul", "==", true)
    ).get();

    // b) grab the new top N by likesReceivedCount
    const topSnap = await query(
      usersCol,
      orderBy("likesReceivedCount", "desc"),
      limit(TOP_N)
    ).get();

    const batch = writeBatch(db);
    const newTopIds = new Set(topSnap.docs.map((d) => d.id));

    // c) clear anyone who’s no longer top N
    prevSnap.docs.forEach((docSnap) => {
      if (!newTopIds.has(docSnap.id)) {
        batch.update(docSnap.ref, { isRadiantSoul: false });
      }
    });

    // d) flag the new top N
    topSnap.docs.forEach((docSnap) => {
      if (!docSnap.data().isRadiantSoul) {
        batch.update(docSnap.ref, { isRadiantSoul: true });
      }
    });

    await batch.commit();
    console.log("Radiant Souls refreshed");
  }, []);

  useEffect(() => {
    // run once at mount
    refreshRadiantSouls();

    // on foreground
    const foregroundSub = AppState.addEventListener("change", (state) => {
      if (userData.onboardingCompleted && state === "active") {
        refreshRadiantSouls();
      }
    });

    // every 24 hours
    const every24h = setInterval(refreshRadiantSouls, 1000 * 60 * 60 * 24);

    return () => {
      foregroundSub.remove();
      clearInterval(every24h);
    };
  }, [refreshRadiantSouls]);

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
      await updateUserData({ onboardingCompleted: true });
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
      await fetchPotentialMatches();
      router.replace("/main/Connect" as any);
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
      const chatRef = doc(FIRESTORE, "chats", chatId);
      await runTransaction(FIRESTORE, async (tx) => {
        const snap = await tx.get(chatRef);
        if (!snap.exists) {
          tx.set(chatRef, {
            participants: [userId, matchedUserId],
            messages: [],
            lastMessage: "",
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp(),
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
      const detailed = await Promise.all(
        snap.docs.map(async (chatSnap) => {
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

  const subscribeToReceivedLikes = useCallback(
    (onUpdate: (users: UserDataType[]) => void) => {
      if (!userData.userId) return () => {};

      const likesRef = collection(
        doc(FIRESTORE, "users", userData.userId),
        "likesReceived"
      );

      const unsub = onSnapshot(likesRef, async (snap) => {
        // build sorted list of incoming like records
        const records = snap.docs
          .map((d) => ({ matchId: d.id, ...(d.data() as any) }))
          .sort(
            (a, b) =>
              b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
          );

        // fetch full user data + resolved photos for each liker
        const detailed = await Promise.all(
          records.map(async (rec) => {
            const uSnap = await getDoc(doc(FIRESTORE, "users", rec.matchId));
            const uData = uSnap.exists ? (uSnap.data() as any) : {};
            let photos: string[] = [];

            if (Array.isArray(uData.photos) && uData.photos.length) {
              photos = (
                await Promise.all(
                  uData.photos.map((p: string) => getImageUrl(p))
                )
              ).filter((url): url is string => !!url);
            }

            return {
              userId: rec.matchId,
              ...(uData as Omit<UserDataType, "userId">),
              photos,
            } as UserDataType;
          })
        );

        onUpdate(detailed);
      });

      return unsub;
    },
    [userData.userId, getImageUrl]
  );

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

  useEffect(() => {
    const onChange = (state: string) => {
      if (state === "active") {
        updateLastActive();
        assignWeeklyOrb();
        refreshRadiantSouls();
      }
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [updateLastActive, assignWeeklyOrb, refreshRadiantSouls]);

  useEffect(() => {
    const id = setInterval(
      () => {
        assignWeeklyOrb();
        refreshRadiantSouls();
      },
      1000 * 60 * 60 * 24
    );
    return () => clearInterval(id);
  }, [assignWeeklyOrb, refreshRadiantSouls]);

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
    fetchRadiantSouls,
    fetchPotentialMatches,
    resetPotentialMatches,
    getImageUrl,
    noMoreMatches,
    verifyPhoneAndSetUser,
    handleGoogleSignIn,
    fetchChatMatches,
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
