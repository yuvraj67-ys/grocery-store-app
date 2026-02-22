import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB7w39TxtRpE2lD-aWTd_BzZE1dNYzaUIo",
  authDomain: "grosry-dad49.firebaseapp.com",
  databaseURL: "https://grosry-dad49-default-rtdb.firebaseio.com",
  projectId: "grosry-dad49",
  storageBucket: "grosry-dad49.firebasestorage.app",
  messagingSenderId: "549983437279",
  appId: "1:549983437279:web:2b3ce1d671ec71db91c46a",
  measurementId: "G-ZD2012RKDW"
};

// Initialize Firebase securely for Next.js (prevents duplicate app instances)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);
