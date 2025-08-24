import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAW_RZlJOe595z9cZf-Dzao0kAqlNIjiSk",
  authDomain: "lair-of-evil-tools.firebaseapp.com",
  projectId: "lair-of-evil-tools",
  storageBucket: "lair-of-evil-tools.appspot.com",
  messagingSenderId: "484461115908",
  appId: "1:484461115908:web:5c90bfa6d7ef9eb9c15351",
  measurementId: "G-BRT98Q1Z87",
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
