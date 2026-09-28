/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';

export interface SavedAnalysis {
  id: string;
  userId: string;
  userEmail: string;
  prompt: string;
  mode: string;
  analysisResult: string;
  summary: string;
  modelUsed: string;
  createdAt: string;
  imageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  savedAnalyses: SavedAnalysis[];
  saveAnalysisToFirestore: (analysis: Omit<SavedAnalysis, 'id' | 'userId' | 'userEmail' | 'createdAt'>) => Promise<string | null>;
  loadUserAnalyses: () => Promise<void>;
  userFavorites: string[];
  toggleFavorite: (itemId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => null,
  logout: async () => {},
  savedAnalyses: [],
  saveAnalysisToFirestore: async () => null,
  loadUserAnalyses: async () => {},
  userFavorites: [],
  toggleFavorite: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  // Sync user profile to Firestore
  const syncUserProfile = async (currentUser: User) => {
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Rexlify User',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          favorites: [],
          bio: 'Rexlify Ecosystem Member'
        });
      } else {
        await updateDoc(userRef, {
          lastLogin: new Date().toISOString(),
          displayName: currentUser.displayName || snap.data().displayName,
          photoURL: currentUser.photoURL || snap.data().photoURL,
        });
        if (snap.data().favorites) {
          setUserFavorites(snap.data().favorites);
        }
      }
    } catch (error) {
      console.warn('Sync profile error:', error);
    }
  };

  // Load user image analyses
  const loadUserAnalyses = async () => {
    if (!user) {
      setSavedAnalyses([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'image_analyses'),
        where('userId', '==', user.uid)
      );
      const querySnap = await getDocs(q);
      const list: SavedAnalysis[] = [];
      querySnap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as SavedAnalysis);
      });
      // Sort in memory by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSavedAnalyses(list);
    } catch (error) {
      console.error('Failed to load user image analyses:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserFavorites([]);
        setSavedAnalyses([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserAnalyses();
    }
  }, [user]);

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
      return result.user;
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSavedAnalyses([]);
      setUserFavorites([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const saveAnalysisToFirestore = async (
    analysis: Omit<SavedAnalysis, 'id' | 'userId' | 'userEmail' | 'createdAt'>
  ): Promise<string | null> => {
    if (!user) return null;

    const path = 'image_analyses';
    try {
      const newDoc = {
        ...analysis,
        userId: user.uid,
        userEmail: user.email || 'anonymous',
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, path), newDoc);
      const createdItem: SavedAnalysis = {
        id: docRef.id,
        ...newDoc
      };
      setSavedAnalyses((prev) => [createdItem, ...prev]);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      return null;
    }
  };

  const toggleFavorite = async (itemId: string) => {
    if (!user) return;
    const isFav = userFavorites.includes(itemId);
    const updated = isFav 
      ? userFavorites.filter(i => i !== itemId)
      : [...userFavorites, itemId];

    setUserFavorites(updated);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { favorites: updated });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
        savedAnalyses,
        saveAnalysisToFirestore,
        loadUserAnalyses,
        userFavorites,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
