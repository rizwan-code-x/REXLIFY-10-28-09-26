/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export const MainPresentationVideo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const isIntersectingRef = useRef(false);

  useEffect(() => {
    let hasLoadedApi = false;

    const initYT = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('presentation-yt-player', {
          videoId: 'rIyNqzI1MUw',
          playerVars: {
            autoplay: 0,
            mute: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            iv_load_policy: 3,
            showinfo: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (e: any) => {
              setIsPlayerReady(true);
              // Pre-buffer silently in background with zero early-autoplay
              try {
                e.target.mute();
                setIsMuted(true);
                // If container is already in viewport when player becomes ready, trigger play
                if (isIntersectingRef.current) {
                  if (sessionStorage.getItem('rexlify_user_gesture') === 'true') {
                    e.target.unMute();
                    setIsMuted(false);
                  }
                  e.target.playVideo();
                  setIsPlaying(true);
                }
              } catch (err) {
                console.warn('Presentation preload setup:', err);
              }
            },
            onStateChange: (e: any) => {
              if (e.data === 1) setIsPlaying(true);
              if (e.data === 2 || e.data === 0) setIsPlaying(false);
            }
          }
        });
      }
    };

    const loadApi = () => {
      if (hasLoadedApi) return;
      hasLoadedApi = true;
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = initYT;
      } else {
        initYT();
      }
    };

    // Lazy load the API when nearing viewport (300px threshold)
    const element = containerRef.current;
    if (element && 'IntersectionObserver' in window) {
      const loadObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadApi();
          loadObserver.disconnect();
        }
      }, { rootMargin: '300px' });
      loadObserver.observe(element);
      return () => {
        loadObserver.disconnect();
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      };
    } else {
      loadApi();
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Viewport IntersectionObserver to trigger playback ONLY when scrolled into view (e.g. 50% visibility)
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            isIntersectingRef.current = true;
            if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
              try {
                if (sessionStorage.getItem('rexlify_user_gesture') === 'true') {
                  playerRef.current.unMute();
                  playerRef.current.setVolume(100);
                  setIsMuted(false);
                } else {
                  playerRef.current.mute();
                  setIsMuted(true);
                }
                playerRef.current.playVideo();
                setIsPlaying(true);
              } catch (err) {
                console.warn('Playback play on view:', err);
              }
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            isIntersectingRef.current = false;
            if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
              try {
                playerRef.current.pauseVideo();
                setIsPlaying(false);
              } catch (err) {
                console.warn('Playback pause on scroll away:', err);
              }
            }
          }
        });
      },
      {
        threshold: [0, 0.2, 0.45, 0.7, 1.0],
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isPlayerReady]);

  const handleTogglePlay = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        if (sessionStorage.getItem('rexlify_user_gesture') === 'true') {
          playerRef.current.unMute();
          setIsMuted(false);
        }
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleToggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => console.warn(err));
      } else {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-5xl mx-auto my-6 relative group"
    >
      {/* Luxury Ambient Glow Ring */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 opacity-30 blur-xl group-hover:opacity-50 transition-all duration-700 pointer-events-none" />
      
      {/* Outer Cyber Glass Box */}
      <div className="relative rounded-3xl border border-white/15 bg-[#07080d]/95 overflow-hidden shadow-2xl backdrop-blur-xl">
        
        {/* Sleek Header Status Bar */}
        <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="font-mono text-xs font-bold tracking-widest text-rose-400 uppercase">
              OFFICIAL SYSTEM PRESENTATION & FOUNDER OVERVIEW
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={handleToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                !isMuted 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              {!isMuted ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{!isMuted ? 'Audio Active' : 'Tap to Unmute'}</span>
            </button>

            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* YouTube 16:9 Presentation Video Stage */}
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          <div id="presentation-yt-player" className="w-full h-full" />
        </div>

        {/* Bottom Details Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <h4 className="font-sora font-semibold text-white">
              Founder & CEO Overview: Rizwan Roushan Rownaq
            </h4>
            <p className="text-gray-400 font-mono text-[11px]">
              Part 4 Keynote Presentation &bull; Plan T.C Ecosystem Architecture & Universal AI Systems
            </p>
          </div>

          <a
            href="https://www.youtube.com/watch?v=rIyNqzI1MUw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-mono text-xs font-semibold transition-all cursor-pointer shrink-0"
          >
            <span>Watch on YouTube</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </motion.div>
  );
};
