import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

export const firebaseConfig = {
  apiKey: "AIzaSyBZdP1OCLY6-NmERN_ORGppIWaWyzYMeyY",
  authDomain: "rexlify-508511.firebaseapp.com",
  databaseURL: "https://rexlify-508511-default-rtdb.firebaseio.com",
  projectId: "rexlify-508511",
  storageBucket: "rexlify-508511.firebasestorage.app",
  messagingSenderId: "216051445770",
  appId: "1:216051445770:web:8e4f4450f8d68920e6aff3",
  measurementId: "G-VDZRLGXW7N"
};

// Initialize Firebase safely with named instance to avoid conflict with root firebase app
const existingApps = getApps();
const app = existingApps.find(a => a.name === "rexlify-rtdb") || initializeApp(firebaseConfig, "rexlify-rtdb");

export const analytics = typeof window !== 'undefined' ? (() => {
  try {
    return getAnalytics(app);
  } catch {
    return null;
  }
})() : null;

export const rtdb = getDatabase(app);
export default app;
