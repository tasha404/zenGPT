import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAy0yMAIIJR-j0mXAeXg7VPgEL6jIwhqB8",
  authDomain: "zenai-e0d70.firebaseapp.com",
  projectId: "zenai-e0d70",
  storageBucket: "zenai-e0d70.firebasestorage.app",
  messagingSenderId: "54715044004",
  appId: "1:54715044004:web:e7fc4d968751d0267dd631",
  measurementId: "G-7Z2TF1Z1SW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);