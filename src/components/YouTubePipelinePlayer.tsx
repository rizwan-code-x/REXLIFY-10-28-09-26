import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, ChevronRight, ChevronLeft, 
  Sparkles, CheckCircle2, ArrowDown, ExternalLink, ShieldCheck, 
  Layers, Terminal, Award, MonitorPlay, FastForward, ArrowUp, X, Maximize2
} from 'lucide-react';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface VideoPart {
  id: number;
  videoId: string;
  partLabel: string;
  title: string;
  subtitle: string;
  description: string;
  transcript: string;
  keyTopics: string[];
}

export const VIDEO_PARTS: VideoPart[] = [
  {
    id: 1,
    videoId: 'Y4kjn4t2DQs',
    partLabel: 'Part 1 of 4',
    title: 'Keynote Entrance & Identity Reveal',
    subtitle: 'Official Introduction & Personal Vision by Rizwan RR',
    description: 'Cinematic keynote entrance unveiling the developer identity, engineering philosophy, and foundational principles behind Plan T.C.',
    transcript: "Welcome! I am Rizwan RR—Software Developer, AI Systems Creator, and Founder. Here begins our journey into next-generation intelligent applications, scalable systems, and universal digital access.",
    keyTopics: ['Identity Reveal', 'Engineering Philosophy', 'Plan T.C Genesis', 'Core Motivation']
  },
  {
    id: 2,
    videoId: 'UnSEf_6yIy0',
    partLabel: 'Part 2 of 4',
    title: 'Tech Stack & Scalable AI Systems',
    subtitle: 'Neural Computing, SLM Runtimes & Full-Stack Architectures',
    description: 'Deep-dive into client-side SLM models (NeuraX), multimodal agents (NOORAX, Sifra AI), TypeScript microservices, and zero-telemetry architectures.',
    transcript: "Mastering high-performance modern tech: Python neural backends, React 18, Vite, TypeScript, Gemini 2.5 Flash, ONNX Edge runtimes, and distributed Cloud databases.",
    keyTopics: ['NeuraX SLM', 'Multimodal Vision', 'TypeScript & Python', 'Edge Optimization']
  },
  {
    id: 3,
    videoId: 'WsxlJS8X2uE',
    partLabel: 'Part 3 of 4',
    title: 'The Mission & Universal Accessibility',
    subtitle: 'Plan T.C: Universal AI Access for Every Human',
    description: 'The philosophical commitment to making advanced technology, AI ecosystems, and digital tools universally accessible without commercial paywalls or barriers.',
    transcript: "Plan T.C stands for our personal responsibility and mission: ensuring cutting-edge AI and software tools belong to everyone, empowering creators globally.",
    keyTopics: ['Universal Accessibility', 'Zero-Barrier AI', 'Plan T.C Mission', 'Global Impact']
  },
  {
    id: 4,
    videoId: 'rIyNqzI1MUw',
    partLabel: 'Part 4 of 4',
    title: 'Welcome & Founder Overview',
    subtitle: 'Ecosystem Roadmap & Interactive Portfolio Gateway',
    description: 'Closing remarks inviting global collaboration, open-source adoption, and hands-on exploration of the live software architectures.',
    transcript: "Thank you for watching the keynote sequence. Explore the verified architectures, technical skill matrices, and live prototypes below. Let us build the future together!",
    keyTopics: ['Architecture Gateway', 'Global Collaboration', 'Live Matrix', 'Connect & Build']
  }
];

interface YouTubePipelinePlayerProps {
  onSkipToOverview: () => void;
}

export const YouTubePipelinePlayer: React.FC<YouTubePipelinePlayerProps> = ({
  onSkipToOverview
}) => {
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isScrolledPast, setIsScrolledPast] = useState<boolean>(false);
  const [isPiPClosed, setIsPiPClosed] = useState<boolean>(false);
  const [allFinished, setAllFinished] = useState<boolean>(false);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);

  const playerARef = useRef<any>(null);
  const playerBRef = useRef<any>(null);
  const currentPartIndexRef = useRef<number>(0);
  const activeSlotRef = useRef<'A' | 'B'>('A');
  const isMutedRef = useRef<boolean>(false);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  currentPartIndexRef.current = currentPartIndex;
  activeSlotRef.current = activeSlot;
  isMutedRef.current = isMuted;

  const currentPart = VIDEO_PARTS[currentPartIndex];

  // Helper to safely get active player instance
  const getActivePlayer = useCallback(() => {
    return activeSlotRef.current === 'A' ? playerARef.current : playerBRef.current;
  }, []);

  // Helper to safely get standby background player instance
  const getStandbyPlayer = useCallback(() => {
    return activeSlotRef.current === 'A' ? playerBRef.current : playerARef.current;
  }, []);

  // Unmute audio across both players
  const unlockAudio = useCallback(() => {
    setAudioUnlocked(true);
    setIsMuted(false);
    isMutedRef.current = false;
    try {
      if (playerARef.current && typeof playerARef.current.unMute === 'function') {
        playerARef.current.unMute();
        playerARef.current.setVolume(100);
      }
      if (playerBRef.current && typeof playerBRef.current.unMute === 'function') {
        playerBRef.current.unMute();
        playerBRef.current.setVolume(100);
      }
      sessionStorage.setItem('rexlify_user_gesture', 'true');
    } catch (e) {
      console.warn('Audio unlock catch:', e);
    }
  }, []);

  // Switch to specific video part with zero-latency pre-buffering
  const goToPart = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= VIDEO_PARTS.length) return;
    
    setCurrentPartIndex(targetIndex);
    setAllFinished(false);

    const nextSlot = activeSlotRef.current === 'A' ? 'B' : 'A';
    const targetPlayer = nextSlot === 'A' ? playerARef.current : playerBRef.current;
    const previousPlayer = activeSlotRef.current === 'A' ? playerARef.current : playerBRef.current;

    if (targetPlayer && typeof targetPlayer.loadVideoById === 'function') {
      targetPlayer.loadVideoById({
        videoId: VIDEO_PARTS[targetIndex].videoId,
        startSeconds: 0
      });
      if (!isMutedRef.current) {
        targetPlayer.unMute();
        targetPlayer.setVolume(100);
      }
      targetPlayer.playVideo();
    }

    if (previousPlayer && typeof previousPlayer.pauseVideo === 'function') {
      previousPlayer.pauseVideo();
    }

    setActiveSlot(nextSlot);
    setIsPlaying(true);

    // Pre-buffer the subsequent part into the now-standby player
    const subsequentIndex = targetIndex + 1;
    if (subsequentIndex < VIDEO_PARTS.length && previousPlayer && typeof previousPlayer.cueVideoById === 'function') {
      try {
        previousPlayer.cueVideoById({
          videoId: VIDEO_PARTS[subsequentIndex].videoId,
          startSeconds: 0
        });
      } catch (e) {
        console.warn('Background pre-buffer cue error:', e);
      }
    }
  }, []);

  // Handle seamless video end transition
  const handleVideoEnded = useCallback(() => {
    const nextIndex = currentPartIndexRef.current + 1;
    if (nextIndex < VIDEO_PARTS.length) {
      goToPart(nextIndex);
    } else {
      setAllFinished(true);
      setIsPlaying(false);
      // Auto smooth-scroll down to the bio & architectures overview
      setTimeout(() => {
        onSkipToOverview();
      }, 1000);
    }
  }, [goToPart, onSkipToOverview]);

  // Global click / interaction listener to unlock unmuted audio
  useEffect(() => {
    const handleGlobalInteraction = () => {
      if (!audioUnlocked) {
        unlockAudio();
      }
    };

    window.addEventListener('click', handleGlobalInteraction, { once: false });
    window.addEventListener('touchstart', handleGlobalInteraction, { once: false });
    window.addEventListener('keydown', handleGlobalInteraction, { once: false });

    // Check if user already interacted previously in this session
    if (sessionStorage.getItem('rexlify_user_gesture') === 'true') {
      unlockAudio();
    }

    return () => {
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
      window.removeEventListener('keydown', handleGlobalInteraction);
    };
  }, [audioUnlocked, unlockAudio]);

  // Scroll listener for Picture-in-Picture Mini-Dock
  useEffect(() => {
    const handleScroll = () => {
      if (!stageContainerRef.current) return;
      const rect = stageContainerRef.current.getBoundingClientRect();
      // If the top stage has scrolled 300px above the viewport top
      if (rect.bottom < 150) {
        setIsScrolledPast(true);
      } else {
        setIsScrolledPast(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dual YouTube IFrame API Initialization
  useEffect(() => {
    const initDualPlayers = () => {
      if (!window.YT || !window.YT.Player) return;

      // 1. Initialize Player A (Active Part 1)
      if (!playerARef.current) {
        playerARef.current = new window.YT.Player('yt-player-slot-a', {
          videoId: VIDEO_PARTS[0].videoId,
          playerVars: {
            autoplay: 1,
            mute: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              try {
                if (sessionStorage.getItem('rexlify_user_gesture') === 'true') {
                  event.target.unMute();
                  event.target.setVolume(100);
                } else {
                  // If browser strict policy blocks unmuted, mute temporarily then unlock on first touch
                  event.target.unMute();
                }
                event.target.playVideo();
                setIsPlaying(true);
              } catch (err) {
                console.warn('Player A autoplay note:', err);
              }
            },
            onStateChange: (event: any) => {
              if (activeSlotRef.current === 'A') {
                if (event.data === 0) {
                  handleVideoEnded();
                } else if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                }
              }
            }
          }
        });
      }

      // 2. Initialize Player B (Pre-buffers Part 2 in background)
      if (!playerBRef.current) {
        playerBRef.current = new window.YT.Player('yt-player-slot-b', {
          videoId: VIDEO_PARTS[1].videoId,
          playerVars: {
            autoplay: 0,
            mute: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              try {
                event.target.cueVideoById({
                  videoId: VIDEO_PARTS[1].videoId,
                  startSeconds: 0
                });
              } catch (err) {
                console.warn('Player B cue note:', err);
              }
            },
            onStateChange: (event: any) => {
              if (activeSlotRef.current === 'B') {
                if (event.data === 0) {
                  handleVideoEnded();
                } else if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                }
              }
            }
          }
        });
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = 'yt-iframe-api-script';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initDualPlayers();
      };
    } else {
      initDualPlayers();
    }

    return () => {
      // Cleanup
    };
  }, [handleVideoEnded]);

  // Toggle Play / Pause on active player
  const handleTogglePlay = () => {
    const activeP = getActivePlayer();
    if (!activeP) return;
    try {
      if (isPlaying) {
        activeP.pauseVideo();
        setIsPlaying(false);
      } else {
        activeP.playVideo();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('Toggle play error:', err);
    }
  };

  // Toggle Mute / Unmute
  const handleToggleMute = () => {
    const activeP = getActivePlayer();
    if (!activeP) return;
    try {
      if (isMuted) {
        unlockAudio();
      } else {
        activeP.mute();
        if (playerARef.current?.mute) playerARef.current.mute();
        if (playerBRef.current?.mute) playerBRef.current.mute();
        setIsMuted(true);
        isMutedRef.current = true;
      }
    } catch (err) {
      console.warn('Toggle mute error:', err);
    }
  };

  // Replay active part
  const handleReplayCurrent = () => {
    const activeP = getActivePlayer();
    if (!activeP) return;
    try {
      activeP.seekTo(0, true);
      activeP.playVideo();
      setIsPlaying(true);
      setAllFinished(false);
    } catch (err) {
      console.warn('Replay error:', err);
    }
  };

  // Scroll smoothly back to top stage
  const scrollToStage = () => {
    if (stageContainerRef.current) {
      stageContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={stageContainerRef}
      id="youtube-stage-container"
      className="relative w-full bg-white border-y border-pink-200/60 shadow-[0_10px_40px_rgba(236,72,153,0.06)] py-12 px-4 md:px-10 lg:px-16 transition-colors duration-300"
    >
      {/* Luminous Soft Ambient Radial Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-purple-200/40 rounded-full blur-[100px] pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-pink-200/40 rounded-full blur-[100px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-200/30 rounded-full blur-[90px] pointer-events-none -z-0" />

      <div className="w-full max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* ==================== 1. TOP HEADER & AUDIO STATUS BADGES ==================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2 text-left max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 border border-pink-300/70 text-purple-900 text-xs font-mono font-bold tracking-wider uppercase shadow-sm">
                <Sparkles size={13} className="text-pink-600" />
                <span>Zero-Latency Pre-Buffered Pipeline</span>
                <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              </div>

              {/* Audio State Badge */}
              <button 
                onClick={unlockAudio}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                  !isMuted 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-amber-50 text-amber-700 border border-amber-300 animate-bounce'
                }`}
              >
                {!isMuted ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span>{!isMuted ? 'UNMUTED AUDIO ACTIVE (100%)' : 'TAP TO UNMUTE AUDIO'}</span>
              </button>
            </div>
            
            <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Sequential Video Stream: <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">Rizwan RR Keynote</span>
            </h2>
            
            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
              Continuous background pre-buffering delivers zero-gap playback across Keynote Entrance, Neural Tech Stack, Plan T.C Mission, and Ecosystem Overview.
            </p>
          </div>

          {/* Quick Action: Skip Directly to Portfolio Grid */}
          <button
            onClick={onSkipToOverview}
            id="skip-to-overview-top-btn"
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-300 text-pink-700 hover:text-pink-800 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <span>Skip To Overview</span>
            <ArrowDown size={14} className="text-pink-600" />
          </button>
        </div>

        {/* ==================== 2. SEQUENTIAL PART SELECTOR TABS ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VIDEO_PARTS.map((part, index) => {
            const isActive = currentPartIndex === index;
            const isCompleted = currentPartIndex > index;

            return (
              <button
                key={part.id}
                onClick={() => goToPart(index)}
                id={`video-part-tab-${index + 1}`}
                className={`relative p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between gap-2 overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 border-pink-500 text-white shadow-lg shadow-pink-500/25 scale-[1.02]'
                    : 'bg-white hover:bg-pink-50/50 border-pink-100 hover:border-pink-300 text-slate-800 shadow-sm'
                }`}
              >
                {/* Active Glow Accent */}
                {isActive && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full blur-xl pointer-events-none" />
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
                  }`}>
                    {part.partLabel}
                  </span>

                  {isCompleted ? (
                    <CheckCircle2 size={15} className={isActive ? 'text-white' : 'text-emerald-500'} />
                  ) : isActive ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                  ) : null}
                </div>

                <div className="space-y-0.5">
                  <h4 className={`text-xs font-bold font-sora line-clamp-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                    {part.title}
                  </h4>
                  <p className={`text-[11px] font-light line-clamp-1 ${isActive ? 'text-pink-100' : 'text-slate-500'}`}>
                    {part.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ==================== 3. DUAL-PLAYER ZERO-LATENCY PRE-BUFFER STAGE ==================== */}
        <div className="relative rounded-3xl bg-slate-900 p-2 sm:p-3 border-2 border-pink-400/50 shadow-[0_20px_60px_rgba(236,72,153,0.2)] overflow-hidden">
          
          {/* Neon Pink & Purple Edge Backlight */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 blur-md opacity-40 -z-10" />

          {/* Responsive 16:9 Widescreen Frame with Dual Slot Switching */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
            
            {/* Slot A Player */}
            <div 
              className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                activeSlot === 'A' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div id="yt-player-slot-a" className="w-full h-full" />
            </div>

            {/* Slot B Player (Pre-buffers next clip) */}
            <div 
              className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                activeSlot === 'B' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div id="yt-player-slot-b" className="w-full h-full" />
            </div>

            {/* Unmute Floating Action Banner if muted */}
            {isMuted && (
              <div 
                onClick={unlockAudio}
                className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600/95 hover:bg-pink-500 text-white text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-xl border border-white/30 cursor-pointer transition-all hover:scale-105 active:scale-95 animate-pulse"
              >
                <VolumeX size={16} />
                <span>Tap to Unmute Audio</span>
              </div>
            )}

            {/* All Sequences Completed Celebration Overlay */}
            <AnimatePresence>
              {allFinished && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-40"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-pink-500/40">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-1 max-w-lg">
                    <h3 className="text-2xl font-bold font-sora text-white">
                      Keynote Pipeline Completed
                    </h3>
                    <p className="text-sm text-pink-200 font-light">
                      You have experienced the complete 4-part introduction. Proceeding to explore the developer architectures and skill matrix.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => goToPart(0)}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider border border-white/20 cursor-pointer transition-all"
                    >
                      Restart Keynote
                    </button>
                    <button
                      onClick={onSkipToOverview}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-pink-600/40 cursor-pointer transition-all hover:scale-105"
                    >
                      Explore Portfolio Grid ↓
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ==================== 4. INTEGRATED CONTROLS & STREAM STATUS BAR ==================== */}
          <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-white border border-pink-200/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Current Part Info & Badge */}
            <div className="flex items-center gap-3 text-left w-full md:w-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-pink-500/20">
                <MonitorPlay size={20} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-pink-600 uppercase tracking-widest">
                    {currentPart.partLabel}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">
                    Dual-Player Sync Active
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold font-sora text-slate-900 leading-tight">
                  {currentPart.title}
                </h3>
              </div>
            </div>

            {/* Playback Control Actions */}
            <div className="flex items-center flex-wrap justify-center gap-2.5 shrink-0 w-full md:w-auto">
              
              {/* Previous Part Button */}
              <button
                onClick={() => goToPart(currentPartIndex - 1)}
                disabled={currentPartIndex === 0}
                id="btn-video-prev-part"
                className="px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/60 hover:bg-pink-100 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 text-xs font-mono font-semibold cursor-pointer shadow-sm"
                title="Go to previous video part"
              >
                <ChevronLeft size={15} />
                <span className="hidden sm:inline">Prev Part</span>
              </button>

              {/* Play / Pause Toggle */}
              <button
                onClick={handleTogglePlay}
                id="btn-video-play-pause"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs font-mono tracking-wider shadow-md shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              {/* Next Part Button */}
              <button
                onClick={() => {
                  if (currentPartIndex < VIDEO_PARTS.length - 1) {
                    goToPart(currentPartIndex + 1);
                  } else {
                    onSkipToOverview();
                  }
                }}
                id="btn-video-next-part"
                className="px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/60 hover:bg-pink-100 text-slate-700 transition-all flex items-center gap-1.5 text-xs font-mono font-semibold cursor-pointer shadow-sm"
                title="Go to next video part"
              >
                <span className="hidden sm:inline">Next Part</span>
                <ChevronRight size={15} />
              </button>

              {/* Replay Current Part */}
              <button
                onClick={handleReplayCurrent}
                id="btn-video-replay"
                className="p-2.5 rounded-xl border border-pink-200 bg-pink-50/60 hover:bg-pink-100 text-slate-700 hover:text-pink-600 transition-all cursor-pointer shadow-sm"
                title="Replay Current Part"
              >
                <RotateCcw size={15} />
              </button>

              {/* Audio Mute / Unmute */}
              <button
                onClick={handleToggleMute}
                id="btn-video-mute-toggle"
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                  isMuted 
                    ? 'border-rose-300 bg-rose-50 text-rose-600' 
                    : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                }`}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 5. LIVE TRANSCRIPT & TOPIC EXTRACTION CARD ==================== */}
        <div className="rounded-2xl bg-white border border-pink-200/80 p-6 shadow-sm text-left space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-pink-600 uppercase tracking-widest">
                [Dialogue Transcript & Context]
              </span>
              <h4 className="text-sm font-bold font-sora text-slate-900">
                {currentPart.title} — Executive Narrative
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-medium text-slate-500">Live Captions Synced</span>
            </div>
          </div>

          <p className="text-slate-800 text-sm sm:text-base font-normal leading-relaxed italic bg-pink-50/40 p-4 rounded-xl border border-pink-100">
            &ldquo;{currentPart.transcript}&rdquo;
          </p>

          {/* Key Topics Explored */}
          <div className="flex items-center flex-wrap gap-2 pt-1">
            <span className="text-xs font-mono font-semibold text-slate-500 mr-1">
              Key Themes:
            </span>
            {currentPart.keyTopics.map((topic, i) => (
              <span 
                key={i}
                className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-mono font-medium"
              >
                #{topic}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ==================== 6. FLOATING SCROLL PICTURE-IN-PICTURE (PiP) MINI-DOCK ==================== */}
      <AnimatePresence>
        {isScrolledPast && !isPiPClosed && !allFinished && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-72 sm:w-84 rounded-2xl bg-slate-950/95 border-2 border-pink-500/50 shadow-2xl p-3 backdrop-blur-xl text-white space-y-2.5"
          >
            {/* Header with Title and Minimize */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-left">
                <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider">
                  Keynote PiP • {currentPart.partLabel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={scrollToStage}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Scroll to main video player"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  onClick={() => setIsPiPClosed(true)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Dismiss Mini Player"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Title & Playing Status */}
            <div className="text-left space-y-0.5">
              <h5 className="text-xs font-bold font-sora text-white line-clamp-1">
                {currentPart.title}
              </h5>
              <p className="text-[10px] text-gray-400 font-mono">
                {isPlaying ? 'Playing Audio in Background' : 'Paused'}
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTogglePlay}
                  className="p-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
                <button
                  onClick={() => {
                    if (currentPartIndex < VIDEO_PARTS.length - 1) {
                      goToPart(currentPartIndex + 1);
                    }
                  }}
                  disabled={currentPartIndex >= VIDEO_PARTS.length - 1}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                  title="Next Part"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              <button
                onClick={scrollToStage}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Stage</span>
                <Maximize2 size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
