// Silence modular deprecation warnings
(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

// React Native Firebase imports (not Firebase JS SDK)
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Initialize Firebase services
export const FIREBASE_AUTH = auth();
export const FIRESTORE = firestore();
export const STORAGE = storage();

// For backwards compatibility and cleaner imports
export { auth, firestore, storage };

// Default export for convenience
export default {
  auth: FIREBASE_AUTH,
  firestore: FIRESTORE,
  storage: STORAGE,
};