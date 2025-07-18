// Silence modular deprecation warnings
(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

// React Native Firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';

// Initialize Firebase services
export const FIREBASE_AUTH = auth();
export const FIRESTORE = firestore();
export const STORAGE = storage();
export const FUNCTIONS = functions();

// // Environment configuration
// if (__DEV__) {
//   // Connect to local emulator in development
//   FUNCTIONS.useEmulator('127.0.0.1', 5001);
//   console.log('🔧 Connected to Firebase Functions emulator');
// } else {
//   // Production environment
//   console.log('🚀 Using production Firebase Functions');
// }

// For backwards compatibility and cleaner imports
export { auth, firestore, storage, functions };

// Default export for convenience
export default {
  auth: FIREBASE_AUTH,
  firestore: FIRESTORE,
  storage: STORAGE,
  functions: FUNCTIONS,
};