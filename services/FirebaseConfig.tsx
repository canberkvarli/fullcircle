// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRdfAy9h9u7jvgkoY-7ip2Azo8x2MC3cA",
  authDomain: "fullcircle-3d01a.firebaseapp.com",
  projectId: "fullcircle-3d01a",
  storageBucket: "fullcircle-3d01a.appspot.com",
  messagingSenderId: "856286042200",
  appId: "1:856286042200:web:47e12ebc6f37be0787522d",
  measurementId: "G-ZRLEPSRCBL"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);

// Initialize Auth
const FIREBASE_AUTH = getAuth(FIREBASE_APP);

// Initialize Firestore
const FIRESTORE = getFirestore(FIREBASE_APP);

// Initialize Storage
const STORAGE = getStorage(FIREBASE_APP, "gs://circle-f39c5.appspot.com");

export { FIREBASE_APP, FIREBASE_AUTH, FIRESTORE, STORAGE };
