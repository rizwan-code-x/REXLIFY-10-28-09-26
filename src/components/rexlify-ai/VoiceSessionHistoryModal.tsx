/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, History, Download, Trash2, Calendar, Clock, MessageSquare, Volume2, Sparkles } from 'lucide-react';
import { VoiceSessionStore, VoiceSessionRecord } from './voiceSessionStore';
import { EMOTION_PROFILES, DetectedEmotion } from './audioEngine';

interface VoiceSessionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaySentence?: (text: string, emotion: string) => void;
}

export const VoiceSessionHistoryModal: React.FC<VoiceSessionHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlaySentence
}) => {
  const [sessions, setSessions] = useState<VoiceSessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<VoiceSessionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const records = await VoiceSessionStore.loadSessions();
      setSessions(records);
      if (records.length > 0) {
        setSelectedSession(records[0]);
      }
    } catch (e) {
      console.warn('Failed to load session history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all stored voice session history?')) {
      localStorage.removeItem('rexlify_voice_session_history_v2');
      setSessions([]);
      setSelectedSession(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white border border-pink-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-gradient-to-r from-pink-50/70 to-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500 text-white shadow-sm shadow-pink-500/20">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sora">
                Voice Session Logs & Emotion Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Persistent hands-free session history with acoustic sentiment tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                title="Clear Logs"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sessions List */}
          <div className="w-full md:w-72 border-r border-pink-100 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Recent Calls ({sessions.length})
            </div>

            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading call history...</div>
            ) : sessions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No voice sessions recorded yet. Start a voice call to view logs.
              </div>
            ) : (
              sessions.map((sess) => {
                const isSelected = selectedSession?.session_id === sess.session_id;
                const date = new Date(sess.timestamp);
                const timeStr = isNaN(date.getTime()) ? sess.timestamp : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = isNaN(date.getTime()) ? '' : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

                return (
                  <button
                    key={sess.session_id}
                    type="button"
                    onClick={() => setSelectedSession(sess)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                        : 'bg-white hover:bg-pink-50/60 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-pink-100' : 'text-slate-500'}`}>
                        {sess.session_id.slice(-8)}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-pink-100' : 'text-slate-400'}`}>
                        {dateStr} {timeStr}
                      </span>
                    </div>
                    <div className={`text-xs truncate font-medium ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {sess.chat_logs[0]?.text || 'Voice interaction'}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {sess.chat_logs.length} turns
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Session Detail & Chat Logs */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
            {selectedSession ? (
              <div className="space-y-4">
                {/* Session Header Info */}
                <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Session: {selectedSession.session_id}</span>
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(selectedSession.timestamp).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>User: {selectedSession.user_id}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => VoiceSessionStore.downloadSessionJSON(selectedSession)}
                    className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Download size={13} />
                    <span>Download JSON</span>
                  </button>
                </div>

                {/* Chat Log Bubbles */}
                <div className="space-y-3">
                  {selectedSession.chat_logs.map((log, idx) => {
                    const isUser = log.speaker === 'user';
                    const emotion = (log.emotion_detected as DetectedEmotion) || 'conversational';
                    const emotionInfo = EMOTION_PROFILES[emotion] || EMOTION_PROFILES.conversational;

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {isUser ? 'User Voice' : 'Rexlify Assistant (19y Female)'}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${emotionInfo.badgeColor}`}>
                            <span>{emotionInfo.icon}</span>
                            <span>{emotionInfo.label}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[85%] shadow-2xs leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-tr-xs'
                              : 'bg-pink-50/90 text-slate-800 border border-pink-200 rounded-tl-xs'
                          }`}
                        >
                          <p>{log.text}</p>
                          
                          {/* Playback speech button */}
                          {!isUser && onPlaySentence && (
                            <button
                              type="button"
                              onClick={() => onPlaySentence(log.text, log.emotion_detected)}
                              className="mt-2 text-[11px] font-semibold text-pink-700 hover:text-pink-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Volume2 size={12} />
                              <span>Replay Voice</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Select a session from the list to view its chat logs and emotion analytics.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
