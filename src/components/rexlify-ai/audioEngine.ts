/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Rexlify AI High-Performance Expressive Audio & Voice Engine
// 19-20 Year Old Female Voice Persona, Acoustic Emotion Analyzer, and Full-Duplex VAD

export type DetectedEmotion = 'laughing' | 'strict' | 'confused' | 'calling' | 'conversational';

export interface EmotionProfile {
  emotion: DetectedEmotion;
  label: string;
  badgeColor: string;
  icon: string;
  pitchMultiplier: number;
  rateMultiplier: number;
  gigglePrefix?: string;
  fillers?: string[];
}

export const EMOTION_PROFILES: Record<DetectedEmotion, EmotionProfile> = {
  calling: {
    emotion: 'calling',
    label: 'Calling / Listening',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '👋',
    pitchMultiplier: 1.12,
    rateMultiplier: 1.05,
    fillers: ['হুম...', 'হুম, বলুন, শুনছি...']
  },
  laughing: {
    emotion: 'laughing',
    label: 'Joyful / Laughing',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    icon: '😄',
    pitchMultiplier: 1.15,
    rateMultiplier: 1.08,
    gigglePrefix: 'হিহি! ',
    fillers: ['হাহা', 'হিহি!', 'দারুণ তো!']
  },
  strict: {
    emotion: 'strict',
    label: 'Strict / Urgent',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '⚡',
    pitchMultiplier: 0.98,
    rateMultiplier: 1.0,
    fillers: ['শান্ত হোন', 'অবশ্যই']
  },
  confused: {
    emotion: 'confused',
    label: 'Confused / Repeating',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    icon: '🧐',
    pitchMultiplier: 1.02,
    rateMultiplier: 0.96,
    fillers: ['আচ্ছা, বুঝিয়ে বলছি', 'শুনুন']
  },
  conversational: {
    emotion: 'conversational',
    label: 'Conversational',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: '💬',
    pitchMultiplier: 1.05,
    rateMultiplier: 1.02,
    fillers: ['হুম...', 'আচ্ছা']
  }
};

/**
 * Acoustic Emotion & Sentiment Analyzer
 * Detects tone: Laughing / Strict / Confused / Calling / Conversational
 */
export function analyzeAcousticEmotion(text: string): DetectedEmotion {
  const clean = text.trim().toLowerCase();
  
  // 1. Instant Calling / Acknowledgement
  if (/^(শুনছো\??|এই যে\??|শুনছেন\??|হ্যালো\??|hello\??|hey\??|hi\??|are you listening\??|rexlify\??|রেসলীফাই\??|আয়েশা\??|ayesha\??)$/i.test(clean)) {
    return 'calling';
  }

  // 2. Laughing / Humor Matching
  if (/\b(haha|hehe|lol|happy|awesome|great|love|amazing|good|smile|cool|fun|yay|party|congrats|valobashi|darun|chomoktar|bhalo|ধন্যবাদ|হাসি|হিহি|হাহা|মজা|দারুণ|সুন্দর|ভাল)\b/i.test(clean) || clean.includes('😂') || clean.includes('😄')) {
    return 'laughing';
  }

  // 3. Strict / Urgent / Irritated
  if (/\b(urgent|wrong|stop|shut up|bad|hurry|irritated|fast|angry|strict|কেন|ভুল|তাড়াতাড়ি|এখনই|জলদি|রাখ|দেরি|চুপ)\b/i.test(clean) || clean.endsWith('!') || clean.endsWith('!!')) {
    return 'strict';
  }

  // 4. Confused / Repeating
  if (/\b(confused|what|repeat|again|understand|mean|না বুঝে|বুঝিনি|আবার বল|কী বলছ|মানে কী|কি বললেন|আবার বলুন)\b/i.test(clean) || clean.endsWith('???')) {
    return 'confused';
  }

  return 'conversational';
}

/**
 * High-Precision Web Audio Chime Generator
 * Provides instant acoustic feedback for listening, acknowledging, and answering
 */
class RexlifyAcousticChimes {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Sweet youthful notification ping
  playListenChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Soft "Hmm..." acknowledgment acoustic tone
  playAckChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.18);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Stop / Disconnect chime
  playEndChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.18);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }
}

export const AcousticChimes = new RexlifyAcousticChimes();

/**
 * Enhanced Neural Female Voice Engine (19-20y Human Female Voice - Ayesha)
 * Integrates high-fidelity neural audio streaming via Web Audio API + AnalyserNode
 * with resilient, natural-pitch browser Web Speech fallback.
 */
class RexlifyTTSPlayer {
  private isSpeaking = false;
  private heartbeatInterval: any = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private currentAbortController: AbortController | null = null;
  private sharedAudioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  public getOrCreateAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.sharedAudioContext || this.sharedAudioContext.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.sharedAudioContext = new AudioCtx();
      }
      if (this.sharedAudioContext.state === 'suspended') {
        this.sharedAudioContext.resume().catch(() => {});
      }
      return this.sharedAudioContext;
    } catch {
      return null;
    }
  }

  public unlockAudioContext(): void {
    const ctx = this.getOrCreateAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  public stop() {
    this.isSpeaking = false;
    
    if (this.currentAbortController) {
      try { this.currentAbortController.abort(); } catch {}
      this.currentAbortController = null;
    }

    if (this.currentSourceNode) {
      try { this.currentSourceNode.stop(); } catch {}
      try { this.currentSourceNode.disconnect(); } catch {}
      this.currentSourceNode = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = '';
      } catch {}
      this.currentAudioElement = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  public async speak(
    text: string, 
    emotion: DetectedEmotion = 'conversational', 
    language: 'bn' | 'en' = 'bn',
    onEnd?: () => void,
    analyserNode?: AnalyserNode | null,
    personaId: 'ira' | 'sara' | 'isa' = 'sara'
  ) {
    // Clean text of non-spoken characters
    const cleanText = text
      .replace(/[*#`_~[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\|.*\|/g, '')
      .replace(/[•→←►]/g, '')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();
    this.isSpeaking = true;

    // Soft acknowledgment acoustic tone
    AcousticChimes.playAckChime();

    const abortController = new AbortController();
    this.currentAbortController = abortController;

    // Tier 1: Try High-Fidelity Server Neural Voice Streaming
    try {
      const targetLang = language.startsWith('bn') ? 'bn' : 'en';
      const ttsUrl = `/api/rexlify-ai/tts?text=${encodeURIComponent(cleanText)}&lang=${targetLang}`;
      
      const response = await fetch(ttsUrl, { signal: abortController.signal });
      if (!response.ok) throw new Error(`Server TTS HTTP ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      if (!this.isSpeaking || abortController.signal.aborted) return;

      const audioCtx = this.getOrCreateAudioContext();
      if (audioCtx && audioCtx.state !== 'closed') {
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        if (!this.isSpeaking || abortController.signal.aborted) return;

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        
        // Speed up audio playback for snappiness based on persona
        source.playbackRate.value = personaId === 'ira' ? 1.15 : personaId === 'isa' ? 1.05 : 1.1; 

        this.currentSourceNode = source;

        // Route to Analyser for dynamic soundwave visualization + destination
        if (analyserNode) {
          try {
            source.connect(analyserNode);
          } catch {}
        }
        source.connect(audioCtx.destination);

        source.onended = () => {
          if (this.currentSourceNode === source) {
            this.currentSourceNode = null;
            this.isSpeaking = false;
            if (onEnd) onEnd();
          }
        };

        source.start(0);
        return; // Successfully played high-fidelity audio!
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('High-fidelity neural TTS fallback to Web Speech:', err?.message);
    }

    // Tier 2: Resilient Web Speech API with tuned natural female prosody
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const profile = EMOTION_PROFILES[emotion] || EMOTION_PROFILES.conversational;

      // Adjust pitch based on persona
      let basePitch = 1.0;
      if (personaId === 'ira') basePitch = 1.15; // 18-20 yrs, normal female pitch
      else if (personaId === 'sara') basePitch = 0.90; // 20-25 yrs, premium balanced, slightly heavier/mature
      else if (personaId === 'isa') basePitch = 0.75; // 25-30 yrs, mature, intimate, whispering weight

      // Snappy pace: minimum 1.1x to avoid dragging
      let baseRate = 1.15; 
      if (personaId === 'ira') baseRate = 1.15;
      else if (personaId === 'sara') baseRate = 1.10;
      else if (personaId === 'isa') baseRate = 1.05;

      utterance.pitch = Math.min(1.4, basePitch * profile.pitchMultiplier);
      utterance.rate = Math.min(1.5, baseRate * profile.rateMultiplier);

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        let bestVoice: SpeechSynthesisVoice | undefined;

        if (language === 'bn') {
          // Prioritize authentic Bengali voices
          bestVoice = voices.find(v => 
            v.lang.toLowerCase().startsWith('bn') || 
            v.name.toLowerCase().includes('bangla') ||
            v.name.toLowerCase().includes('bengali')
          );
        }

        // Secondary search for high quality natural female voices
        if (!bestVoice) {
          const preferredKeywords = ['natural', 'online', 'female', 'samantha', 'victoria', 'jenny', 'kavya', 'google'];
          bestVoice = voices.find(v => {
            const n = v.name.toLowerCase();
            return preferredKeywords.some(k => n.includes(k));
          });
        }

        if (bestVoice) {
          utterance.voice = bestVoice;
          if (bestVoice.lang) utterance.lang = bestVoice.lang;
        } else {
          utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        }
      }

      this.isSpeaking = true;

      this.heartbeatInterval = setInterval(() => {
        if (!this.isSpeaking) {
          clearInterval(this.heartbeatInterval);
          return;
        }
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 3000);

      utterance.onend = () => {
        this.isSpeaking = false;
        clearInterval(this.heartbeatInterval);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('TTS utterance fallback error:', e);
        this.isSpeaking = false;
        clearInterval(this.heartbeatInterval);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Web Speech API error:', err);
      this.isSpeaking = false;
      if (onEnd) onEnd();
    }
  }
}

export const NeuralTTS = new RexlifyTTSPlayer();
