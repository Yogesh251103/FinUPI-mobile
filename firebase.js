import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import * as dummyAuth from "./utils/dummyAuth";
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if we should use dummy auth
const isDevelopment = process.env.NODE_ENV === "development";
// For React Native, we'll read from AsyncStorage instead of localStorage
const useDummyAuth = true; // Set to false in production

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3dkgGMS5Je4Z5kavYl03VzKFnTrA_6YE",
  authDomain: "finupi-8fb02.firebaseapp.com",
  projectId: "finupi-8fb02",
  storageBucket: "finupi-8fb02.appspot.com",
  messagingSenderId: "455479413495",
  appId: "1:455479413495:web:80f99a19b8dfd02aca4a48",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Always initialize the real Firebase Auth
// (We still provide dummy auth via the service layer)
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Export
export { app, auth, db, useDummyAuth }; 