import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { AppState, AppStateStatus } from "react-native";
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
} from "@react-native-firebase/firestore";

import { getDownloadURL, ref } from "@react-native-firebase/storage";

export type UserDataType = {
  userId: string;
  lastActive?: any;
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
  likedMatches?: string[];
  dislikedMatches?: string[];
  likesReceived?: string[];
  detailedLikesReceived?: any[];
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
  loadingNextBatch: boolean;
  createOrFetchChat: (
    userId: string,
    otherUserId: string
  ) => Promise<string | null>;
  fetchRadiantSouls: () => Promise<any[]>;
  fetchDetailedLikes: () => void;
  fetchPotentialMatches: () => void;
  resetPotentialMatches: () => void;
  getImageUrl: (imagePath: string) => Promise<string | null>;
  noMoreMatches: boolean;
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
  lastActive: null,
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
  likesReceived: [],
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
  const [isSSOLogin, setIsSSOLogin] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const userDataRef = useRef(userData);
  const router = useRouter();
  const imageCache: Record<string, string> = {};
  const webClientId =
    "856286042200-nv9vv4js8j3mqhu07acdbnf0hbp8feft.apps.googleusercontent.com";
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });

  useEffect(() => {
    const subscriber = FIREBASE_AUTH.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    if (userData?.likesReceived) {
      fetchDetailedLikes();
    }
  }, [userData.likesReceived]);

  // Use AppState to track changes in the app state (background/foreground)
  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          updateLastActive();
        } else if (nextAppState === "background") {
          updateLastActive();
        }
      }
    );
    // Store the userData in a ref to avoid stale closures
    userDataRef.current = userData;
    return () => {
      appStateListener.remove(); // Clean up listener on unmount
    };
  }, [userData]);

  useEffect(() => {
    console.log(
      "Match preferences changed, resetting matches",
      userData.matchPreferences
    );
    resetPotentialMatches();
    loadNextPotentialMatch();
  }, [userData.matchPreferences]);

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
        setIsSSOLogin(true);
        await fetchUserData(user.uid);
      } else {
        console.log("onAuthStateChanged(): User signed in via phone");
        setIsSSOLogin(false);
        // to persist with the signed in user's flow we need to fetch the user data
        // and redirect to the appropriate onboarding screen or dashboard.
        await fetchUserData(user.uid);
      }

      updateLastActive();
    } else {
      setUserData(initialUserData); // Reset if user signs out
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSSOLogin(true);

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
    } finally {
      setIsSSOLogin(false);
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

  const fetchUserData = async (userId: string) => {
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
      // if no user in firestore and they are phone sso, navgiate to namescreen
      else if (!isSSOLogin && !userDataFromFirestore) {
        console.log(
          "fetchUserData(): No user in firestore, navigating to NameScreen"
        );
        router.replace({
          pathname: `onboarding/NameScreen` as any,
        });
      } else if (
        // For first-time users from Google SSO
        currentUser?.providerData.some(
          (provider) => provider.providerId === "google.com"
        )
      ) {
        console.log("providerData", currentUser?.providerData);
        console.log(
          "fetchUserData(): For first-time users from Google SSO, navigate to PhoneNumberScreen"
        );
        router.replace({
          pathname: `onboarding/PhoneNumberScreen` as any,
        });
      } else {
        console.log(
          "fetchUserData(): For first-time users from Google SSO, after linking phone number, navigate to NameScreen"
        );
        router.replace({
          pathname: `onboarding/NameScreen` as any,
        });
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

  const fetchPotentialMatches = async () => {
    // Ensure our ref is up-to-date
    userDataRef.current = userData;
    console.log("fetching...");
    let fetchedMatches: any[] = [];
    let hasMoreMatches = true;

    // Build the exclusion set.
    const excludedUserIds = new Set([
      userDataRef.current?.userId,
      ...(userDataRef.current?.likedMatches || []),
      ...(userDataRef.current?.dislikedMatches || []),
      ...(userDataRef.current?.matches || []),
    ]);
    console.log("fetchPotentialMatches(): Excluded user IDs:", excludedUserIds);

    // ----- Build Base Query Constraints -----
    // order by the number of likesReceived.
    const numOfLikes = userDataRef.current?.likesReceived?.length || 0;
    let constraints = [orderBy("userId"), limit(10)];

    // ----- Gender Filtering -----
    const datePreferences =
      userDataRef.current.matchPreferences?.datePreferences &&
      userDataRef.current.matchPreferences.datePreferences.length > 0
        ? userDataRef.current.matchPreferences.datePreferences
        : ["Everyone"];
    console.log("Current datePreferences:", datePreferences);

    const genderMap: Record<string, string> = {
      Men: "Man",
      Women: "Woman",
      "Non-Binary": "Non-binary",
    };

    if (!datePreferences.includes("Everyone")) {
      const mappedGenders = datePreferences.map(
        (pref) => genderMap[pref] || pref
      );
      console.log("Preferred genders to filter:", mappedGenders);
      if (mappedGenders.length === 1) {
        constraints.push(where("gender", "==", mappedGenders[0]));
      } else {
        constraints.push(where("gender", "in", mappedGenders));
      }
    }

    // ----- Age Range Filtering -----
    const ageRange = userDataRef.current.matchPreferences?.preferredAgeRange;
    if (ageRange && ageRange.min != null && ageRange.max != null) {
      console.log("Applying age filtering:", ageRange);
      constraints.push(where("age", ">=", ageRange.min));
      constraints.push(where("age", "<=", ageRange.max));
    }

    // ----- Height Range Filtering -----
    const heightRange =
      userDataRef.current.matchPreferences?.preferredHeightRange;
    if (heightRange && heightRange.min != null && heightRange.max != null) {
      console.log("Applying height filtering:", heightRange);
      constraints.push(where("height", ">=", heightRange.min));
      constraints.push(where("height", "<=", heightRange.max));
    }

    // ----- Ethnicity Filtering -----
    const ethnicities =
      userDataRef.current.matchPreferences?.preferredEthnicities;
    if (
      ethnicities &&
      ethnicities.length > 0 &&
      !ethnicities.includes("Open to All")
    ) {
      console.log("Applying ethnicity filtering:", ethnicities);
      constraints.push(where("ethnicities", "array-contains-any", ethnicities));
    }

    // ----- Distance Filtering (Bounding Box) -----
    const currentLat = userData.latitude;
    const currentLon = userData.longitude;
    const maxDistance = userData.matchPreferences?.preferredDistance;
    if (
      currentLat != null &&
      currentLon != null &&
      maxDistance != null &&
      !isNaN(currentLat) &&
      !isNaN(currentLon) &&
      !isNaN(maxDistance)
    ) {
      // Approximate: 1 degree latitude ~ 69 miles.
      const latDelta = maxDistance / 69;
      // For longitude, 1 degree ~ 69 * cos(latitude) miles.
      const lonDelta =
        maxDistance / (69 * Math.cos(currentLat * (Math.PI / 180)));
      const minLat = currentLat - latDelta;
      const maxLat = currentLat + latDelta;
      const minLon = currentLon - lonDelta;
      const maxLon = currentLon + lonDelta;
      console.log("Applying distance filtering with bounding box:", {
        minLat,
        maxLat,
        minLon,
        maxLon,
      });
      constraints.push(where("latitude", ">=", minLat));
      constraints.push(where("latitude", "<=", maxLat));
      constraints.push(where("longitude", ">=", minLon));
      constraints.push(where("longitude", "<=", maxLon));
    }

    // ----- Pagination Loop -----
    while (fetchedMatches.length < 10 && hasMoreMatches) {
      console.log("fetchPotentialMatches(): Fetching potential matches...");
      let usersQuery;
      if (lastVisibleMatch) {
        usersQuery = query(
          collection(FIRESTORE, "users"),
          ...constraints,
          startAfter(lastVisibleMatch)
        );
      } else {
        usersQuery = query(collection(FIRESTORE, "users"), ...constraints);
      }

      const querySnapshot = await getDocs(usersQuery);
      if (querySnapshot.empty) {
        console.log("fetchPotentialMatches(): No more matches available.");
        hasMoreMatches = false;
        setNoMoreMatches(true);
        break;
      }

      const newMatches = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((user) => !excludedUserIds.has(user.userId));

      if (newMatches.length > 0) {
        fetchedMatches = [...fetchedMatches, ...newMatches];
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisibleMatch(lastDoc.data().userId);
      } else {
        console.log(
          "fetchPotentialMatches(): No new matches found in this batch."
        );
        hasMoreMatches = false;
        setNoMoreMatches(true);
        break;
      }
    }

    if (fetchedMatches.length > 0) {
      console.log(
        `fetchPotentialMatches(): Fetched a batch of ${fetchedMatches.length} matches.`
      );
      setPotentialMatches((prev) => [...prev, ...fetchedMatches]);
    } else {
      console.log("fetchPotentialMatches(): No matches fetched.");
    }

    setLoadingNextBatch(false);
    return fetchedMatches;
  };

  const resetPotentialMatches = () => {
    console.log("resetPotentialMatches(): Resetting potential matches...");
    setLoadingNextBatch(false);
    setPotentialMatches([]);
    setLastVisibleMatch(null);
    setNoMoreMatches(false);
    setCurrentPotentialMatch(null);
  };

  const loadNextPotentialMatch = async () => {
    // Recalculate the current excluded set from userData.
    const excludedSet = new Set([
      userData?.userId,
      ...(userData?.likedMatches || []),
      ...(userData?.dislikedMatches || []),
      ...(userData?.matches || []),
    ]);

    // Filter potentialMatches to only those not in the excluded set.
    const validMatches = potentialMatches.filter(
      (match) => !excludedSet.has(match.userId)
    );

    // If we have valid matches, get the next one.
    if (validMatches.length > 0) {
      console.log("loadNextPotentialMatch(): Loading next potential match...");
      // Determine the index of the current match within validMatches.
      const currentValidIndex = currentPotentialMatch
        ? validMatches.findIndex(
            (match) => match.userId === currentPotentialMatch.userId
          )
        : -1;

      // Get the next valid match.
      const nextValidMatch =
        validMatches[currentValidIndex + 1] || validMatches[0];

      // Find its index in the full potentialMatches array (for consistency).
      const fullIndex = potentialMatches.findIndex(
        (match) => match.userId === nextValidMatch.userId
      );

      setCurrentPotentialMatch(nextValidMatch);
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
          (match) => !excludedSet.has(match.userId)
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

  const fetchDetailedLikes = async () => {
    if (!userData?.likesReceived) return;

    try {
      const detailedUsers = await Promise.all(
        userData.likesReceived.map(async (userId) => {
          const userDoc = await getDoc(doc(FIRESTORE, "users", userId));
          return userDoc.exists ? { userId, ...userDoc.data() } : null;
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

  const getImageUrl = async (imagePath: string) => {
    if (imageCache[imagePath]) {
      return imageCache[imagePath];
    }

    const storageRef = ref(STORAGE, imagePath);
    try {
      const url = await getDownloadURL(storageRef);
      imageCache[imagePath] = url;
      return url;
    } catch (error) {
      console.error("Error fetching image URL:", error);
      return null;
    }
  };

  const likeMatch = async (matchId: string) => {
    // Build an exclusion set from userData
    const excludedSet = new Set([
      userData?.userId,
      ...(userData?.likedMatches || []),
      ...(userData?.dislikedMatches || []),
      ...(userData?.matches || []),
    ]);

    // If the match is already excluded, do nothing.
    if (excludedSet.has(matchId)) {
      console.log("likeMatch(): This match is already excluded.");
      return;
    }

    try {
      const updatedLikedMatches = new Set([
        ...(userData.likedMatches || []),
        matchId,
      ]);

      await updateUserData({
        likedMatches: Array.from(updatedLikedMatches),
      });

      console.log(`Liked match: ${matchId}`);

      // Remove the liked match from the potentialMatches array.
      setPotentialMatches((prevMatches) =>
        prevMatches.filter((match) => match.userId !== matchId)
      );

      // Load the next potential match.
      loadNextPotentialMatch();
    } catch (error) {
      console.error("Failed to like match: ", error);
    }
  };

  const dislikeMatch = async (matchId: string) => {
    // Optionally, prevent processing if match is already excluded.
    const excludedSet = new Set([
      userData?.userId,
      ...(userData?.likedMatches || []),
      ...(userData?.dislikedMatches || []),
      ...(userData?.matches || []),
    ]);
    if (excludedSet.has(matchId)) {
      console.log("handleDislike(): This match is already excluded.");
      return;
    }

    try {
      await dislikeMatch(matchId);
      // Remove the match from potentialMatches.
      setPotentialMatches((prevMatches) =>
        prevMatches.filter((match) => match.userId !== matchId)
      );
      // Then load the next potential match.
      loadNextPotentialMatch();
    } catch (error) {
      console.error("handleDislike(): Error disliking match:", matchId, error);
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
        if (!chatDoc.exists) {
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
    loadingNextBatch,
    createOrFetchChat,
    fetchRadiantSouls,
    fetchDetailedLikes,
    fetchPotentialMatches,
    resetPotentialMatches,
    getImageUrl,
    noMoreMatches,
    verifyPhoneAndSetUser,
    handleGoogleSignIn,
  };

  if (initializing) {
    return null;
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
