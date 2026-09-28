import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Sparkles, 
  Check, 
  Play, 
  Pause, 
  Sliders, 
  User, 
  Heart, 
  Zap, 
  Smile, 
  GraduationCap,
  Globe
} from 'lucide-react';
import { VoiceModeSettings, VoicePersona, VoicePersonaId, VoiceSpeed } from './types';

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: 'ayesha',
    name: 'Ayesha',
    age: '19-20',
    role: 'Warm & Empathetic Companion',
    traits: ['Sweet Tone', 'Empathetic', 'Natural Bangla & English', 'Youthful Warmth'],
    emotionDescription: 'Speaks with genuine warmth, gentle laughter, empathy, and conversational pauses like a real 19-20 year old friend.',
    pitch: 1.25,
    rateMultiplier: 1.02,
    sampleGreeting: {
      en: "Hi Rizwan! It's Ayesha. I'm right here with you—what shall we work on today?",
      bn: "হ্যালো রিজওয়ান ভাইয়া! আমি আয়েশা। কেমন আছেন? চলুন একসাথে নতুন কিছু তৈরি করি!"
    }
  },
  {
    id: 'priya',
    name: 'Priya',
    age: '20',
    role: 'Energetic & Confident Partner',
    traits: ['Dynamic', 'Upbeat', 'Quick-witted', 'Enthusiastic'],
    emotionDescription: 'Lively, positive, energetic cadence with encouraging smiles and high motivational drive.',
    pitch: 1.22,
    rateMultiplier: 1.10,
    sampleGreeting: {
      en: "Hey there! Ready to crush today's goals with maximum momentum? Let's do this!",
      bn: "হ্যালো! চমৎকার দিন আজ, চলুন আজকের সব কাজ দ্রুত আর নিখুঁতভাবে শেষ করি!"
    }
  },
  {
    id: 'zoya',
    name: 'Zoya',
    age: '19',
    role: 'Friendly & Expressive',
    traits: ['Cheerful', 'Curious', 'Relatable', 'Casual Rhythm'],
    emotionDescription: 'Playful and deeply expressive, using natural interjections and relatable, caring feedback.',
    pitch: 1.30,
    rateMultiplier: 1.00,
    sampleGreeting: {
      en: "Oh, hi! Zoya here. Tell me what's on your mind—I'm listening closely!",
      bn: "আরে হ্যালো! আমি জোয়া। আপনার মনের সব কথা বলুন, আমি মন দিয়ে শুনছি!"
    }
  },
  {
    id: 'sophia',
    name: 'Sophia',
    age: '20',
    role: 'Intelligent & Poised',
    traits: ['Articulate', 'Clear Cadence', 'Structured', 'Executive Partner'],
    emotionDescription: 'Sharp, poised, articulate with a bright, friendly, modern executive assistant demeanor.',
    pitch: 1.18,
    rateMultiplier: 1.05,
    sampleGreeting: {
      en: "Good to see you, Rizwan. All cognitive pipelines are aligned and ready for execution.",
      bn: "স্বাগতম রিজওয়ান। আপনার প্রতিটি নির্দেশ ও প্রজেক্ট বিশ্লেষণের জন্য আমি প্রস্তুত।"
    }
  }
];

export const DEFAULT_VOICE_SETTINGS: VoiceModeSettings = {
  autoSpeak: true,
  speed: 'normal',
  personaId: 'ayesha',
  language: 'en-US'
};

const SETTINGS_STORAGE_KEY = 'rexlify_voice_settings_v3';

export const loadVoiceSettings = (): VoiceModeSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_VOICE_SETTINGS;
};

export const saveVoiceSettings = (settings: VoiceModeSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
};

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: VoiceModeSettings;
  onUpdateSettings: (newSettings: VoiceModeSettings) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onUpdateSettings
}) => {
  const [settings, setSettings] = useState<VoiceModeSettings>(currentSettings);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  if (!isOpen) return null;

  const activePersona = VOICE_PERSONAS.find(p => p.id === settings.personaId) || VOICE_PERSONAS[0];

  const handleToggleAutoSpeak = () => {
    const updated = { ...settings, autoSpeak: !settings.autoSpeak };
    setSettings(updated);
    onUpdateSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleSelectSpeed = (speed: VoiceSpeed) => {
    const updated = { ...settings, speed };
    setSettings(updated);
    onUpdateSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleSelectPersona = (id: VoicePersonaId) => {
    const updated = { ...settings, personaId: id };
    setSettings(updated);
    onUpdateSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleToggleLanguage = (lang: 'bn-BD' | 'en-US') => {
    const updated = { ...settings, language: lang };
    setSettings(updated);
    onUpdateSettings(updated);
    saveVoiceSettings(updated);
  };

  // Preview voice persona with Web Speech API
  const handlePlayPreview = (persona: VoicePersona) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (isPlayingPreview) {
      setIsPlayingPreview(false);
      return;
    }

    setIsPlayingPreview(true);

    const isBengali = settings.language === 'bn-BD';
    const textToSpeak = isBengali ? persona.sampleGreeting.bn : persona.sampleGreeting.en;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Calculate rate
    const baseRate = settings.speed === 'slow' ? 0.82 : settings.speed === 'fast' ? 1.25 : 1.02;
    utterance.rate = baseRate * persona.rateMultiplier;
    utterance.pitch = persona.pitch;
    utterance.lang = settings.language;

    // Pick a natural youthful female voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(v => {
        if (isBengali) {
          return v.lang.includes('bn') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali');
        }
        const name = v.name.toLowerCase();
        return (
          (name.includes('female') || name.includes('samantha') || name.includes('victoria') || name.includes('jenny') || name.includes('aria') || name.includes('zira') || name.includes('google us english') || name.includes('natural')) &&
          v.lang.includes('en')
        );
      });
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onend = () => setIsPlayingPreview(false);
    utterance.onerror = () => setIsPlayingPreview(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-pink-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/70 via-white to-purple-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-pink-500/25">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sora">Voice Mode Settings</h3>
              <p className="text-xs text-slate-500">Customize live speech, personas & audio delivery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-pink-100/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {/* Section 1: Auto-Speak AI Responses */}
          <div className="p-4.5 rounded-2xl bg-pink-50/40 border border-pink-200/80 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-pink-600" />
                <span className="text-sm font-bold text-slate-900 font-sora">Auto-Speak AI Responses</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically synthesize and read out AI answers in real-time as they arrive.
              </p>
            </div>

            {/* iOS style toggle switch */}
            <button
              type="button"
              onClick={handleToggleAutoSpeak}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.autoSpeak ? 'bg-pink-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={settings.autoSpeak}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 2: Preferred Voice Speed (Slow, Normal, Fast) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 font-sora uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-amber-500" />
                <span>Voice Speed</span>
              </label>
              <span className="text-xs font-semibold text-pink-700 bg-pink-100/70 px-2 py-0.5 rounded-md">
                {settings.speed === 'slow' ? 'Slow (0.8x)' : settings.speed === 'fast' ? 'Fast (1.25x)' : 'Normal (1.0x)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'normal', 'fast'] as VoiceSpeed[]).map((spd) => {
                const isSelected = settings.speed === spd;
                return (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSelectSpeed(spd)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-xs shadow-pink-500/20'
                        : 'bg-white hover:bg-pink-50/50 border-pink-200 text-slate-700'
                    }`}
                  >
                    <span>{spd}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? 'text-pink-100' : 'text-slate-400'}`}>
                      {spd === 'slow' ? 'Relaxed pace' : spd === 'fast' ? 'Rapid speech' : 'Natural pace'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Language & Accent Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 font-sora uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={14} className="text-purple-600" />
              <span>Language & Accent</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleLanguage('en-US')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  settings.language === 'en-US'
                    ? 'bg-pink-50 border-pink-400 text-pink-900 font-semibold'
                    : 'bg-white border-pink-100 text-slate-700 hover:bg-pink-50/30'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">English (US)</div>
                  <div className="text-[10px] text-slate-500">Natural conversational tone</div>
                </div>
                {settings.language === 'en-US' && <Check size={16} className="text-pink-600" />}
              </button>

              <button
                type="button"
                onClick={() => handleToggleLanguage('bn-BD')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  settings.language === 'bn-BD'
                    ? 'bg-pink-50 border-pink-400 text-pink-900 font-semibold'
                    : 'bg-white border-pink-100 text-slate-700 hover:bg-pink-50/30'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">বাংলা (Bengali)</div>
                  <div className="text-[10px] text-slate-500">সহজ ও মিষ্টি উচ্চারণ</div>
                </div>
                {settings.language === 'bn-BD' && <Check size={16} className="text-pink-600" />}
              </button>
            </div>
          </div>

          {/* Section 4: AI Voice Personas (Age 19-20 Female with Human Emotions) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 font-sora uppercase tracking-wider flex items-center gap-1.5">
                <Heart size={14} className="text-rose-500" />
                <span>AI Voice Personas (Female, Age 19–20)</span>
              </label>
              <span className="text-[11px] text-purple-700 font-medium">Human Emotions Active</span>
            </div>

            <div className="space-y-2.5">
              {VOICE_PERSONAS.map((persona) => {
                const isSelected = settings.personaId === persona.id;
                return (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-50/90 to-purple-50/80 border-pink-400 ring-1 ring-pink-400/40 shadow-xs'
                        : 'bg-white hover:bg-pink-50/30 border-pink-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 font-sora">{persona.name}</span>
                          <span className="px-2 py-0.2 rounded-md bg-pink-100 text-pink-800 text-[10px] font-semibold">
                            Female, {persona.age} yrs
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {persona.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {persona.emotionDescription}
                        </p>
                        
                        {/* Persona Traits */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {persona.traits.map((trait, tIdx) => (
                            <span key={tIdx} className="text-[10px] bg-white border border-pink-200/70 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Action: Preview Voice Audio */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(persona);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pink-600 hover:bg-pink-700 text-white border-transparent shadow-xs'
                            : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200'
                        }`}
                        title="Listen to sample audio"
                      >
                        {isPlayingPreview && isSelected ? (
                          <Pause size={15} className="animate-pulse" />
                        ) : (
                          <Play size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-pink-50/50 border-t border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Voice settings auto-saved</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
