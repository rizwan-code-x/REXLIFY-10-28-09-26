/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../../firebase';
import { doc, setDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';

export interface VoiceChatLogItem {
  speaker: 'user' | 'rex_assistant';
  text: string;
  emotion_detected: string;
  timestamp: string;
  audio_url?: string;
}

export interface VoiceSessionRecord {
  session_id: string;
  user_id: string;
  timestamp: string;
  date_str?: string;
  chat_logs: VoiceChatLogItem[];
}

const LOCAL_STORAGE_KEY = 'rexlify_voice_session_history_v2';

export const VoiceSessionStore = {
  // Save voice session to Firestore, Server Endpoint, and Local Storage
  async saveSession(session: VoiceSessionRecord): Promise<void> {
    // 1. Local Storage fallback (instant)
    try {
      const existing = this.loadLocalSessions();
      const updated = [session, ...existing.filter(s => s.session_id !== session.session_id)].slice(0, 30);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local storage voice session save error:', e);
    }

    // 2. Server API Route
    try {
      await fetch('/api/rexlify-ai/voice-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
    } catch (e) {
      console.warn('Backend voice session log failed:', e);
    }

    // 3. Firestore sync
    try {
      if (db) {
        const docRef = doc(db, 'rexlify_voice_sessions', session.session_id);
        await setDoc(docRef, {
          ...session,
          updated_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn('Firestore voice session sync failed (using local store):', e);
    }
  },

  loadLocalSessions(): VoiceSessionRecord[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return [];
  },

  async loadSessions(): Promise<VoiceSessionRecord[]> {
    const local = this.loadLocalSessions();

    try {
      // Try backend first
      const res = await fetch('/api/rexlify-ai/voice-sessions');
      if (res.ok) {
        const data = await res.json();
        if (data.sessions && data.sessions.length > 0) {
          // Merge with local
          const merged = [...data.sessions];
          for (const item of local) {
            if (!merged.find(m => m.session_id === item.session_id)) {
              merged.push(item);
            }
          }
          return merged;
        }
      }
    } catch {}

    // Fallback to Firestore if accessible
    try {
      if (db) {
        const q = query(collection(db, 'rexlify_voice_sessions'), orderBy('timestamp', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const docs: VoiceSessionRecord[] = [];
        snapshot.forEach(d => {
          docs.push(d.data() as VoiceSessionRecord);
        });
        if (docs.length > 0) return docs;
      }
    } catch {}

    return local;
  },

  downloadSessionJSON(session: VoiceSessionRecord) {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.session_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
