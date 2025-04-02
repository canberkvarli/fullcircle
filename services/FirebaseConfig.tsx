import { Platform } from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { initializeApp, getApp } from "@react-native-firebase/app";

let FIREBASE_APP;

if (Platform.OS === "web") {
  const firebaseConfig = {
    apiKey: "AIzaSyDRdfAy9h9u7jvgkoY-7ip2Azo8x2MC3cA",
    authDomain: "fullcircle-3d01a.firebaseapp.com",
    projectId: "fullcircle-3d01a",
    storageBucket: "fullcircle-3d01a.appspot.com",
    messagingSenderId: "856286042200",
    appId: "1:856286042200:web:47e12ebc6f37be0787522d",
    measurementId: "G-ZRLEPSRCBL",
  };
  FIREBASE_APP = initializeApp(firebaseConfig);
} else {
  // Use default app for native
  FIREBASE_APP = getApp();
}
export const FIREBASE_AUTH = auth();
export const FIRESTORE = firestore();
export const STORAGE = storage();
export { FIREBASE_APP }
