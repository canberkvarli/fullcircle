// Silence modular deprecation warnings
(globalThis as any).RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import functions from "@react-native-firebase/functions";
import { getApp } from "@react-native-firebase/app";

const FIREBASE_APP = getApp();

export const FIREBASE_AUTH = auth();
export const FIRESTORE = firestore();
export const STORAGE = storage();
export const FUNCTIONS = functions();
export { FIREBASE_APP };