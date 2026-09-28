import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, onValue } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDATj8_GldGciQ33guPCQrAj3IxtTwYlaQ",
  authDomain: "rexlify.firebaseapp.com",
  databaseURL: "https://rexlify-default-rtdb.firebaseio.com",
  projectId: "rexlify",
  storageBucket: "rexlify.firebasestorage.app",
  messagingSenderId: "534760684113",
  appId: "1:534760684113:web:e44169db00403da57f1670",
  measurementId: "G-R76EFXWSG0"
};

const app = initializeApp(firebaseConfig, "rexlify-custom");
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
