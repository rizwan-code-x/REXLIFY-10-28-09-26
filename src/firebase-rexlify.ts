import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, onValue, set, update, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZdP1OCLY6-NmERN_ORGppIWaWyzYMeyY",
  authDomain: "rexlify-508511.firebaseapp.com",
  databaseURL: "https://rexlify-508511-default-rtdb.firebaseio.com",
  projectId: "rexlify-508511",
  storageBucket: "rexlify-508511.firebasestorage.app",
  messagingSenderId: "216051445770",
  appId: "1:216051445770:web:8e4f4450f8d68920e6aff3",
  measurementId: "G-VDZRLGXW7N"
};

const existingApps = getApps();
const app = existingApps.find(a => a.name === "rexlify-custom") || initializeApp(firebaseConfig, "rexlify-custom");
let analyticsInstance: any = null;
if (typeof window !== 'undefined') {
  try {
    analyticsInstance = getAnalytics(app);
  } catch (err) {
    console.warn('Analytics initialization bypassed in restricted iframe environment:', err);
  }
}
export const analytics = analyticsInstance;
export const rtdb = getDatabase(app);
export const storage = getStorage(app);

// Total storage allowed per user in bytes (10MB)
export const MAX_USER_STORAGE = 10 * 1024 * 1024;
// Max file size (100KB)
export const MAX_FILE_SIZE = 100 * 1024;

export const uploadFileWithLimit = async (userId: string, file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 100KB limit.');
  }

  const path = "users/" + userId + "/uploads/" + Date.now() + "_" + file.name;
  const fileRef = storageRef(storage, path);
  
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};
