/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X,
  History
} from 'lucide-react';
import { VoiceEngineState, ChatMessage } from './types';
import { ConversationStore } from './conversationStore';
import { AudioWaveVisualizer } from './AudioWaveVisualizer';
import { 
  analyzeAcousticEmotion, 
  DetectedEmotion, 
  EMOTION_PROFILES, 
  AcousticChimes, 
  NeuralTTS 
} from './audioEngine';
import { 
  VoiceSessionStore, 
  VoiceSessionRecord, 
  VoiceChatLogItem 
} from './voiceSessionStore';
import { VoiceSessionHistoryModal } from './VoiceSessionHistoryModal';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToChat?: (lastTranscript?: string) => void;
  ceoMode?: boolean;
  activeConversationId?: string;
  onNewMessageSynced?: (msg: ChatMessage) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  ceoMode = true,
  activeConversationId,
  onNewMessageSynced
}) => {
  const [state, setState] = useState<VoiceEngineState>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('কানেক্ট হচ্ছে...');
  const [currentEmotion, setCurrentEmotion] = useState<DetectedEmotion>('conversational');
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<'sara' | 'ira' | 'isa'>('sara');

  // Session Tracking & Chat Logs
  const sessionIdRef = useRef<string>(`rex_sess_${Date.now()}`);
  const sessionLogsRef = useRef<VoiceChatLogItem[]>([]);

  // Audio & Speech references
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isHandsFreeRef = useRef<boolean>(false);
  const stateRef = useRef<VoiceEngineState>('idle');
  const streamAbortControllerRef = useRef<AbortController | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Stop hardware microphone tracks
  const stopMicrophoneHardware = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close().catch(() => {}); } catch {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Save active voice session to store
  const persistCurrentSession = useCallback(() => {
    if (sessionLogsRef.current.length === 0) return;
    const sessionRecord: VoiceSessionRecord = {
      session_id: sessionIdRef.current,
      user_id: 'rizwan_ceo@rexlify.ai',
      timestamp: new Date().toISOString(),
      chat_logs: [...sessionLogsRef.current]
    };
    VoiceSessionStore.saveSession(sessionRecord);
  }, []);

  // Cleanup all audio resources
  const releaseAudioResources = useCallback(() => {
    isHandsFreeRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    stopMicrophoneHardware();
    NeuralTTS.stop();
    isSpeakingRef.current = false;
    persistCurrentSession();
  }, [persistCurrentSession, stopMicrophoneHardware]);

  // Barge-In: instantly halts TTS and in-flight stream if user speaks or taps
  const executeBargeIn = useCallback((interruptedText?: string) => {
    if (isSpeakingRef.current || stateRef.current === 'speaking' || stateRef.current === 'processing') {
      if (streamAbortControllerRef.current) {
        try { streamAbortControllerRef.current.abort(); } catch {}
        streamAbortControllerRef.current = null;
      }
      NeuralTTS.stop();
      isSpeakingRef.current = false;
      setState('interrupted');

      setTimeout(() => {
        if (stateRef.current === 'interrupted') {
          setState('listening');
          if (interruptedText) {
            const wordCount = interruptedText.trim().split(/\s+/).length;
            if (wordCount > 0 && wordCount <= 5 && !isMuted) {
              NeuralTTS.speak('স্যার আপনি কি কিছু বলছেন?', 'conversational', 'bn', () => {}, analyserRef.current, activePersona);
            }
          }
          setUserTranscript('');
          setInterimTranscript('');
          startSpeechRecognitionEngine();
        }
      }, 150);
    }
  }, [isMuted, activePersona]);

  // Initialize Microphone & Analyser for Soundwave Visualizer
  const initMicrophoneVisualizer = useCallback(async () => {
    if (mediaStreamRef.current && analyserRef.current) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(avg);

        // Acoustic Barge-in threshold: User voice volume while assistant is speaking
        if (avg > 32 && (isSpeakingRef.current || stateRef.current === 'speaking')) {
          executeBargeIn();
        }

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
      return true;
    } catch (err) {
      console.warn('Microphone access warning:', err);
      return false;
    }
  }, [executeBargeIn]);

  // Turn-Taking AI Processing with Neural TTS
  const processVoiceTurn = useCallback(async (spokenQuery: string) => {
    if (!spokenQuery || !spokenQuery.trim()) {
      setState('listening');
      return;
    }

    // Step 1: Acoustic Emotion & Sentiment Analysis
    const emotion = analyzeAcousticEmotion(spokenQuery);
    setCurrentEmotion(emotion);

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const userLog: VoiceChatLogItem = {
      speaker: 'user',
      text: spokenQuery,
      emotion_detected: emotion,
      timestamp: timeNow
    };
    sessionLogsRef.current.push(userLog);

    // Save to active conversation
    const userMsg: ChatMessage = {
      id: `voice-u-${Date.now()}`,
      role: 'user',
      content: spokenQuery,
      timestamp: timeNow
    };
    const allConvs = ConversationStore.loadConversations();
    const targetConv = allConvs.find(c => c.id === activeConversationId) || allConvs[0];
    if (targetConv) {
      targetConv.messages.push(userMsg);
      ConversationStore.saveConversations(allConvs);
    }
    if (onNewMessageSynced) onNewMessageSynced(userMsg);

    // Instant Acknowledgement Rule ("শুনছো?", "এই যে", "Hello")
    if (emotion === 'calling') {
      AcousticChimes.playAckChime();
      const ackReply = 'হুম... বলুন, আমি শুনছি।';
      setAiResponseText(ackReply);
      setState('speaking');
      isSpeakingRef.current = true;

      const assistantLog: VoiceChatLogItem = {
        speaker: 'rex_assistant',
        text: ackReply,
        emotion_detected: 'calling',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      sessionLogsRef.current.push(assistantLog);
      persistCurrentSession();

      if (!isMuted) {
        NeuralTTS.speak(ackReply, 'calling', 'bn', () => {
          isSpeakingRef.current = false;
          setState('listening');
          setUserTranscript('');
          setInterimTranscript('');
          startSpeechRecognitionEngine();
        }, analyserRef.current);
      } else {
        setTimeout(() => {
          isSpeakingRef.current = false;
          setState('listening');
          startSpeechRecognitionEngine();
        }, 1200);
      }
      return;
    }

    // Process with Backend Voice Stream
    setState('processing');
    setAiResponseText('...');

    if (streamAbortControllerRef.current) {
      try { streamAbortControllerRef.current.abort(); } catch {}
    }
    const abortController = new AbortController();
    streamAbortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/rexlify-ai/voice-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          prompt: spokenQuery,
          ceoMode,
          language: 'bn',
          history: targetConv?.messages.slice(-4).map(m => ({ role: m.role, text: m.content })),
          detectedEmotion: emotion,
          personaId: activePersona
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulatedText += data.chunk;
                setAiResponseText(accumulatedText);
              }
            } catch {}
          }
        }
      }

      const fullReply = accumulatedText.trim() || 'হুম... আমি আপনার কথা শুনেছি, বলুন কী করতে হবে!';
      setAiResponseText(fullReply);

      // Record Assistant Turn
      const assistantLog: VoiceChatLogItem = {
        speaker: 'rex_assistant',
        text: fullReply,
        emotion_detected: emotion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      sessionLogsRef.current.push(assistantLog);
      persistCurrentSession();

      // Neural Speech Output
      setState('speaking');
      isSpeakingRef.current = true;

      if (!isMuted) {
        NeuralTTS.speak(fullReply, emotion, 'bn', () => {
          isSpeakingRef.current = false;
          setState('listening');
          setUserTranscript('');
          setInterimTranscript('');
          startSpeechRecognitionEngine();
        }, analyserRef.current, activePersona);
      } else {
        setTimeout(() => {
          isSpeakingRef.current = false;
          setState('listening');
          startSpeechRecognitionEngine();
        }, 1500);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') return;

      const emergencyReply = 'হুম... আমি শুনতে পেয়েছি ভাইয়া। দয়া করে নির্দেশটি বলুন।';
      setAiResponseText(emergencyReply);
      setState('speaking');
      isSpeakingRef.current = true;

      if (!isMuted) {
        NeuralTTS.speak(emergencyReply, 'conversational', 'bn', () => {
          isSpeakingRef.current = false;
          setState('listening');
          startSpeechRecognitionEngine();
        }, analyserRef.current, activePersona);
      } else {
        setState('listening');
        startSpeechRecognitionEngine();
      }
    }
  }, [activeConversationId, ceoMode, executeBargeIn, isMuted, onNewMessageSynced, persistCurrentSession]);

  // Continuous Hands-Free Speech Recognition Engine
  const startSpeechRecognitionEngine = useCallback(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setState('idle');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'bn-BD';

    recognition.onstart = () => {
      setState('listening');
    };

    recognition.onresult = (event: any) => {
      let finalResult = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalResult += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      // Barge-in check: If user speaks while AI is speaking, interrupt AI!
      if (isSpeakingRef.current || stateRef.current === 'speaking') {
        executeBargeIn(finalResult || currentInterim);
      }

      if (finalResult) {
        setUserTranscript(prev => prev ? `${prev} ${finalResult}` : finalResult);
        setInterimTranscript('');

        // Snappy turn-taking silence detection (300ms)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          const fullQuery = (userTranscript ? `${userTranscript} ${finalResult}` : finalResult).trim();
          if (fullQuery) {
            try { recognition.stop(); } catch {}
            processVoiceTurn(fullQuery);
          }
        }, 300);
      } else if (currentInterim) {
        setInterimTranscript(currentInterim);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      console.warn('Speech recognition status:', event.error);
    };

    recognition.onend = () => {
      // Auto-restart recognition without requiring user touch
      if (isHandsFreeRef.current && stateRef.current !== 'speaking' && stateRef.current !== 'processing') {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => {
          if (isHandsFreeRef.current && stateRef.current !== 'speaking' && stateRef.current !== 'processing') {
            try {
              recognition.start();
            } catch {}
          }
        }, 150);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {}
  }, [executeBargeIn, processVoiceTurn, userTranscript]);

  // AUTO-INITIALIZE ON OPEN: No touch or hold required!
  useEffect(() => {
    if (!isOpen) {
      releaseAudioResources();
      hasInitializedRef.current = false;
      return;
    }

    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // 1. Instantly unlock audio pipeline
    NeuralTTS.unlockAudioContext();
    isHandsFreeRef.current = true;

    const startupVoiceFlow = async () => {
      // 2. Initialize microphone and visualizer
      await initMicrophoneVisualizer();

      // 3. Spoken introduction: Rexlify AI introduces itself
      const introGreeting = 'হ্যালো স্যার! আমি রেক্সলিফাই এআই, আপনার পার্সোনাল কম্প্যানিয়ন। আজ আপনাকে কীভাবে সাহায্য করতে পারি?';
      
      setAiResponseText(introGreeting);
      setState('speaking');
      isSpeakingRef.current = true;

      // Spoken introduction via high-fidelity neural voice
      NeuralTTS.speak(
        introGreeting, 
        'laughing', 
        'bn', 
        () => {
          isSpeakingRef.current = false;
          setState('listening');
          setUserTranscript('');
          setInterimTranscript('');
          startSpeechRecognitionEngine();
        },
        analyserRef.current,
        activePersona
      );
    };

    startupVoiceFlow();

    return () => {
      releaseAudioResources();
    };
  }, [initMicrophoneVisualizer, isOpen, releaseAudioResources, startSpeechRecognitionEngine]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none animate-fadeIn">
      
      {/* Dynamic Ambient Background Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-pink-600/15 via-purple-600/15 to-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-gradient-to-br from-rose-500/10 via-pink-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Clean Minimalist Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/30">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <Sparkles size={18} className="text-pink-400" />
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide font-sora">
                {activePersona === 'ira' ? 'Ira (ইরা)' : activePersona === 'sara' ? 'Sara (সারা)' : 'Isa (ইসা)'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Rexlify AI {activePersona === 'sara' && '✨ Premium'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activePersona === 'ira' ? '১৮-২০ বছর' : activePersona === 'sara' ? '২০-২৫ বছর' : '২৫-৩০ বছর'} • হাই-কোয়ালিটি প্রোফেশনাল কণ্ঠ
            </p>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="flex items-center gap-2">
          {/* Persona Selector */}
          <select 
            className="bg-white/5 border border-white/10 text-xs text-white rounded-full px-3 py-1.5 outline-none focus:ring-1 focus:ring-pink-500/50 cursor-pointer"
            value={activePersona}
            onChange={(e) => setActivePersona(e.target.value as 'sara' | 'ira' | 'isa')}
          >
            <option value="ira" className="bg-slate-900">Ira (18-20)</option>
            <option value="sara" className="bg-slate-900">Sara (20-25) ✨</option>
            <option value="isa" className="bg-slate-900">Isa (25-30)</option>
          </select>

          {/* History Button */}
          <button
            type="button"
            onClick={() => setHistoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
            title="কথোপকথনের হিস্ট্রি"
          >
            <History size={15} className="text-pink-400" />
            <span className="hidden sm:inline">হিস্ট্রি</span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              if (!isMuted) {
                NeuralTTS.stop();
              }
              setIsMuted(!isMuted);
            }}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isMuted ? "আনমিউট করুন" : "মিউট করুন"}
          >
            {isMuted ? <VolumeX size={16} className="text-rose-400" /> : <Volume2 size={16} className="text-pink-400" />}
          </button>

          {/* Exit / Close Fullscreen Voice Assistant */}
          <button
            type="button"
            onClick={() => {
              releaseAudioResources();
              onClose();
            }}
            className="p-2.5 rounded-full bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 border border-white/10 text-slate-400 transition-all cursor-pointer ml-1"
            title="বন্ধ করুন"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Center Canvas: Visualizer + Real-time Conversation Display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 max-w-3xl mx-auto w-full my-auto space-y-6 sm:space-y-8">
        
        {/* Dynamic Reactive Sound Center */}
        <div className="relative flex items-center justify-center">
          {/* Outer Ambient Glow */}
          <div 
            className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
              state === 'listening' 
                ? 'bg-gradient-to-tr from-pink-500/30 via-rose-400/20 to-purple-500/30 animate-ping'
                : state === 'speaking'
                ? 'bg-gradient-to-tr from-purple-500/30 via-pink-500/30 to-rose-400/20 animate-pulse'
                : 'bg-pink-500/10'
            }`}
            style={{
              width: `${180 + (audioLevel * 1.6)}px`,
              height: `${180 + (audioLevel * 1.6)}px`
            }}
          />

          {/* Central Interactive Orb */}
          <div 
            onClick={() => {
              if (state === 'speaking') {
                executeBargeIn();
              }
            }}
            className={`relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer ${
              state === 'listening'
                ? 'bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 shadow-pink-500/40 scale-105 ring-4 ring-pink-400/30'
                : state === 'speaking'
                ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 shadow-purple-500/40 ring-4 ring-purple-400/30'
                : state === 'processing'
                ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 shadow-amber-500/30 animate-pulse'
                : 'bg-gradient-to-tr from-pink-600 to-purple-700 shadow-pink-500/20'
            }`}
          >
            {state === 'listening' ? (
              <Mic size={44} className="text-white animate-bounce" />
            ) : state === 'speaking' ? (
              <Volume2 size={44} className="text-white animate-pulse" />
            ) : state === 'processing' ? (
              <Sparkles size={44} className="text-white animate-spin" />
            ) : (
              <Mic size={44} className="text-white" />
            )}
          </div>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="w-full max-w-lg flex flex-col items-center">
          <AudioWaveVisualizer
            state={state}
            audioLevel={audioLevel}
            analyser={analyserRef.current}
            isPositiveEmotion={currentEmotion === 'laughing'}
            width={480}
            height={70}
          />
        </div>

        {/* Conversation Display Screen (Directly Under the Sound Effect) */}
        <div className="w-full max-w-2xl text-center space-y-4 px-2">
          
          {/* Live Status Pill */}
          <div className="flex items-center justify-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
              state === 'listening'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                : state === 'speaking'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : state === 'processing'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/10 text-slate-300 border border-white/10'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                state === 'listening' ? 'bg-pink-400 animate-ping' :
                state === 'speaking' ? 'bg-purple-400 animate-pulse' :
                state === 'processing' ? 'bg-amber-400 animate-spin' : 'bg-slate-400'
              }`} />
              <span>
                {state === 'listening' ? 'শুনছি... কথা বলুন' :
                 state === 'speaking' ? 'Rexlify AI কথা বলছে...' :
                 state === 'processing' ? 'চিন্তা করছি...' :
                 'সংযুক্ত'}
              </span>
            </span>
          </div>

          {/* User's Spoken Words (Live Transcript) */}
          {(userTranscript || interimTranscript) && (
            <div className="inline-block px-4 py-2 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md max-w-xl text-center animate-fadeIn">
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                "{userTranscript} <span className="text-pink-300 italic">{interimTranscript}</span>"
              </p>
            </div>
          )}

          {/* Ayesha's Sweet Caring Answer */}
          <div className="min-h-[70px] flex items-center justify-center">
            <p className="text-lg sm:text-2xl text-pink-100 font-medium leading-relaxed tracking-wide drop-shadow-md">
              {aiResponseText}
            </p>
          </div>
        </div>
      </div>

      {/* Clean Minimalist Bottom Bar */}
      <div className="relative z-10 flex items-center justify-center pb-8 pt-4 px-6 border-t border-white/5 backdrop-blur-sm">
        {state === 'speaking' ? (
          <button
            type="button"
            onClick={() => executeBargeIn()}
            className="px-6 py-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/30 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <span>⏹ কথা থামান (Interrupt)</span>
          </button>
        ) : (
          <p className="text-xs text-slate-400 text-center">
            হাত মুক্ত কথোপকথন • কোনো বাটন চাপার দরকার নেই, সরাসরি কথা বলুন
          </p>
        )}
      </div>

      {/* Voice Session History Modal */}
      <VoiceSessionHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        onPlaySentence={(text, emotion) => {
          NeuralTTS.speak(text, (emotion as DetectedEmotion) || 'conversational', 'bn', undefined, analyserRef.current);
        }}
      />
    </div>
  );
};
