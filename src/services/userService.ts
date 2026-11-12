/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { rtdb } from '../config/firebase';
import { ref, set, onValue, serverTimestamp } from 'firebase/database';

export interface UserFeatureLog {
  featureName: string;
  usedAt: string;
  route?: string;
}

export interface RegisteredUser {
  id: string;
  firebaseId?: string;
  name: string;
  registeredAt: string;
  registeredTimestamp: number;
  lastActive: string;
  lastActiveTimestamp: number;
  leftAt?: string | null;
  leftTimestamp?: number | null;
  status: 'active' | 'left';
  purpose: string;
  featuresUsed: UserFeatureLog[];
}

const LOCAL_STORAGE_KEY = 'rexlify_registered_user';
const LOCAL_STORAGE_USERS_LIST = 'rexlify_registered_users_cache';

// Helper to format human-readable date & time
export function formatDateTime(date: Date = new Date()): string {
  try {
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return date.toISOString();
  }
}

// Compute dynamic user purpose based on features used
export function computeUserPurpose(features: UserFeatureLog[]): string {
  if (!features || features.length === 0) {
    return 'General Browsing / Website Visit';
  }
  
  const uniqueFeatures = Array.from(new Set(features.map(f => f.featureName.trim()))).filter(Boolean);
  
  if (uniqueFeatures.length > 1) {
    return `Multi-Features Explorer (${uniqueFeatures.slice(0, 3).join(', ')}${uniqueFeatures.length > 3 ? '...' : ''})`;
  }
  
  return `Used ${uniqueFeatures[0]} Application`;
}

// Get currently logged-in user from localStorage
export function getCurrentUser(): RegisteredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegisteredUser;
  } catch (e) {
    console.error('Error reading current user session:', e);
    return null;
  }
}

// Register a new user session
export async function registerUser(name: string): Promise<RegisteredUser> {
  const cleanName = name.trim();
  const now = new Date();
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const newUser: RegisteredUser = {
    id,
    name: cleanName,
    registeredAt: formatDateTime(now),
    registeredTimestamp: now.getTime(),
    lastActive: formatDateTime(now),
    lastActiveTimestamp: now.getTime(),
    leftAt: null,
    leftTimestamp: null,
    status: 'active',
    purpose: 'General Browsing / Website Visit',
    featuresUsed: []
  };

  // 1. Save to local storage for immediate persistence
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    
    // Also save to cached list of users
    const cachedListRaw = localStorage.getItem(LOCAL_STORAGE_USERS_LIST);
    const cachedList: RegisteredUser[] = cachedListRaw ? JSON.parse(cachedListRaw) : [];
    const updatedCache = [newUser, ...cachedList.filter(u => u.id !== id)];
    localStorage.setItem(LOCAL_STORAGE_USERS_LIST, JSON.stringify(updatedCache.slice(0, 100)));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. Sync to Firebase Realtime Database
  try {
    const userRef = ref(rtdb, `rexlify_registered_users/${id}`);
    await set(userRef, {
      ...newUser,
      serverRegisteredAt: serverTimestamp()
    });
  } catch (error) {
    console.warn('Firebase RTDB user registration error (offline fallback in use):', error);
  }

  return newUser;
}

// Track when a user interacts with or launches a feature
export async function trackFeatureUsage(featureName: string, route?: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;

  const now = new Date();
  const newLog: UserFeatureLog = {
    featureName,
    usedAt: formatDateTime(now),
    route
  };

  const updatedFeatures = [...(user.featuresUsed || []), newLog];
  const updatedPurpose = computeUserPurpose(updatedFeatures);

  const updatedUser: RegisteredUser = {
    ...user,
    lastActive: formatDateTime(now),
    lastActiveTimestamp: now.getTime(),
    status: 'active',
    purpose: updatedPurpose,
    featuresUsed: updatedFeatures
  };

  // 1. Update LocalStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
    
    const cachedListRaw = localStorage.getItem(LOCAL_STORAGE_USERS_LIST);
    const cachedList: RegisteredUser[] = cachedListRaw ? JSON.parse(cachedListRaw) : [];
    const updatedCache = cachedList.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem(LOCAL_STORAGE_USERS_LIST, JSON.stringify(updatedCache));
  } catch (e) {
    console.warn('LocalStorage update error:', e);
  }

  // 2. Update Firebase RTDB
  try {
    const userRef = ref(rtdb, `rexlify_registered_users/${user.id}`);
    await set(userRef, {
      ...updatedUser,
      serverLastActive: serverTimestamp()
    });
  } catch (error) {
    console.warn('Firebase RTDB feature tracking error (offline fallback in use):', error);
  }
}

// Mark user as left when page is unloaded or tab is closed
export async function markUserLeft(): Promise<void> {
  const user = getCurrentUser();
  if (!user || user.status === 'left') return;

  const now = new Date();
  const updatedUser: RegisteredUser = {
    ...user,
    status: 'left',
    leftAt: formatDateTime(now),
    leftTimestamp: now.getTime()
  };

  // Update LocalStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
    const cachedListRaw = localStorage.getItem(LOCAL_STORAGE_USERS_LIST);
    const cachedList: RegisteredUser[] = cachedListRaw ? JSON.parse(cachedListRaw) : [];
    const updatedCache = cachedList.map(u => u.id === user.id ? updatedUser : u);
    localStorage.setItem(LOCAL_STORAGE_USERS_LIST, JSON.stringify(updatedCache));
  } catch (e) {
    console.warn('LocalStorage left error:', e);
  }

  // Update Firebase RTDB (best effort)
  try {
    const userRef = ref(rtdb, `rexlify_registered_users/${user.id}`);
    await set(userRef, {
      ...updatedUser,
      serverLeftAt: serverTimestamp()
    });
  } catch (error) {
    console.warn('Firebase RTDB mark user left error:', error);
  }
}

// User logout / clear session
export function logoutUser(): void {
  markUserLeft();
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error('Logout error:', e);
  }
}

// Real-time listener for Registered Users (for CEO / Admin Panel)
export function subscribeRegisteredUsers(callback: (users: RegisteredUser[]) => void): () => void {
  // Initial fallback to local storage cache
  try {
    const cachedListRaw = localStorage.getItem(LOCAL_STORAGE_USERS_LIST);
    if (cachedListRaw) {
      const cachedList: RegisteredUser[] = JSON.parse(cachedListRaw);
      callback(cachedList);
    }
  } catch (e) {
    console.warn('Error reading cached registered users:', e);
  }

  try {
    const usersRef = ref(rtdb, 'rexlify_registered_users');
    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          // If no RTDB data yet, keep local cache if any
          const cachedListRaw = localStorage.getItem(LOCAL_STORAGE_USERS_LIST);
          if (cachedListRaw) {
            try {
              callback(JSON.parse(cachedListRaw));
            } catch {
              callback([]);
            }
          } else {
            callback([]);
          }
          return;
        }

        const list: RegisteredUser[] = Object.keys(data).map((key) => ({
          ...data[key],
          firebaseId: key,
        }));

        // Sort by registration timestamp descending (newest first)
        list.sort((a, b) => {
          const timeA = a.registeredTimestamp || 0;
          const timeB = b.registeredTimestamp || 0;
          return timeB - timeA;
        });

        // Update local cache
        try {
          localStorage.setItem(LOCAL_STORAGE_USERS_LIST, JSON.stringify(list.slice(0, 100)));
        } catch (_) {}

        callback(list);
      },
      (error) => {
        console.warn('Firebase RTDB subscribe users error (falling back to cached data):', error);
        try {
          const cachedListRaw = localStorage.getItem(LOCAL_STORAGE_USERS_LIST);
          if (cachedListRaw) callback(JSON.parse(cachedListRaw));
        } catch (_) {}
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  } catch (err) {
    console.warn('RTDB subscribe error:', err);
    return () => {};
  }
}
