/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Play, Pause, Newspaper, Share2, Heart, 
  Sparkles, Clock, ShieldCheck, RefreshCw, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SponsoredVideo } from '../types';
import { INITIAL_VIDEOS } from '../data';

// Rich expansion dataset to ensure an immersive storytelling experience
const SPONSOR_VIDEOS_POOL: SponsoredVideo[] = [
  ...INITIAL_VIDEOS,
  {
    id: 'vid-4',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Cognitive Synapse Security Network',
    description: 'Introducing Sifra Shield 4.0: A secure quantum handshake architecture protocol designed to protect edge-computing matrix hubs from neural sniffing. Decrypt real-time diagnostics securely.',
    sponsor: 'SIFRA SHIELD INC',
    date: '2026-06-10'
  },
  {
    id: 'vid-5',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    title: 'The Automated Cloud Pipelines',
    description: 'Configure and register automated multi-tenant server groups with zero runtime latency. Experience next-level compilation speeds utilizing the Rexlify cloud orchestration environment.',
    sponsor: 'REXLIFY CLOUD SYSTEMS',
    date: '2026-06-11'
  }
];

interface VideoCardProps {
  video: SponsoredVideo;
  isMuted: boolean;
  onMuteToggle: () => void;
}

const SponsorVideoCard: React.FC<VideoCardProps> = ({ video, isMuted, onMuteToggle }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Persistent engagements with localStorage caching
  const [likesCount, setLikesCount] = useState<number>(() => {
    const saved = localStorage.getItem(`rexlify_like_${video.id}`);
    return saved ? parseInt(saved) : Math.floor(Math.random() * 400) + 120;
  });
  const [isLiked, setIsLiked] = useState<boolean>(() => {
    return localStorage.getItem(`rexlify_liked_status_${video.id}`) === 'true';
  });
  
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    return localStorage.getItem(`rexlify_saved_${video.id}`) === 'true';
  });

  const [showShareToast, setShowShareToast] = useState(false);

  // IntersectionObserver to auto-play when centered
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsPlaying(true);
                setHasInteracted(true);
              })
              .catch((err) => {
                console.log('Autoplay blocked prior to interaction context:', err);
                setIsPlaying(false);
              });
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      {
        threshold: 0.6 // Element is 60% in view
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    const nextCount = nextLiked ? likesCount + 1 : likesCount - 1;
    setLikesCount(nextCount);
    localStorage.setItem(`rexlify_like_${video.id}`, nextCount.toString());
    localStorage.setItem(`rexlify_liked_status_${video.id}`, nextLiked.toString());
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    localStorage.setItem(`rexlify_saved_${video.id}`, nextSaved.toString());
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareableUrl = `${window.location.origin}/#sponsors?id=${video.id}`;
    navigator.clipboard.writeText(shareableUrl);
    setShowShareToast(true);
    setTimeout(() => {
      setShowShareToast(false);
    }, 2500);
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full snap-start snap-always relative overflow-hidden flex flex-col justify-between bg-black border-b border-white/5"
    >
      {/* Video element and absolute layout handles */}
      <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center bg-[#01000a]">
        <video
          ref={videoRef}
          src={video.url}
          loop
          muted={isMuted}
          playsInline
          onClick={handleVideoClick}
          className="w-full h-full object-cover cursor-pointer max-w-4xl"
        />

        {/* Dynamic Dark overlay at the bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Center Floating Status controls if paused */}
      <AnimatePresence>
        {!isPlaying && hasInteracted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleVideoClick}
            className="absolute inset-0 flex items-center justify-center z-10 bg-black/25 cursor-pointer"
          >
            <div className="p-5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-white shadow-2xl hover:scale-110 hover:border-rose-500/50 transition-all">
              <Play size={28} className="fill-current ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vertical Interactive Overlay Sidebar Right (HUD styled info panel) */}
      <div className="absolute right-4 bottom-72 md:bottom-52 z-20 flex flex-col items-center gap-5 select-none">
        {/* Like trigger */}
        <button
          onClick={handleLike}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border shadow-xl backdrop-blur-md transition-all cursor-pointer ${
            isLiked 
              ? 'bg-rose-500/20 border-rose-500 text-rose-500 hover:bg-rose-500/30 font-bold scale-105' 
              : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          }`}
          title="Like Broadcast"
        >
          <Heart size={18} className={isLiked ? 'fill-current' : ''} />
          <span className="font-mono text-[9px] mt-1 font-bold">{likesCount}</span>
        </button>

        {/* Save to repository bookmark */}
        <button
          onClick={handleSave}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border shadow-xl backdrop-blur-md transition-all cursor-pointer ${
            isSaved 
              ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
              : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
          }`}
          title="Save Report"
        >
          <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
          <span className="font-mono text-[8px] mt-0.5 uppercase tracking-tighter">
            {isSaved ? 'Saved' : 'Keep'}
          </span>
        </button>

        {/* Share copying indicator */}
        <div className="relative">
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 shadow-xl backdrop-blur-md transition-all cursor-pointer"
            title="Copy Report Link"
          >
            <Share2 size={18} />
            <span className="font-mono text-[80%] mt-0.5">Link</span>
          </button>
          
          <AnimatePresence>
            {showShareToast && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute right-14 top-1/2 -translate-y-1/2 bg-neutral-900 border border-[#be123c]/40 text-rose-400 font-mono text-[8px] tracking-wider px-3 py-1.5 rounded shadow-2xl whitespace-nowrap uppercase z-30"
              >
                ◆ Link Decrypted & Copied
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Volume status switch indicator */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMuteToggle();
          }}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-black/40 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 shadow-xl backdrop-blur-md transition-all cursor-pointer"
          title={isMuted ? 'Unmute Broadcast' : 'Mute Broadcast'}
        >
          {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-emerald-400" />}
          <span className="font-mono text-[80%] mt-0.5">{isMuted ? 'Muted' : 'Audio'}</span>
        </button>
      </div>

      {/* Persistent Newspaper-Style Descriptive Overlay on Bottom Grid */}
      <div className="absolute bottom-0 left-0 right-0 z-10 w-full p-4 md:p-6 bg-neutral-950/85 backdrop-blur-md border-t border-white/10 font-sans mx-auto flex flex-col justify-end">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          
          {/* Main double-lined newspaper border layout */}
          <div className="border-t-2 border-b border-neutral-700/60 py-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
            <div className="flex items-center gap-2 font-bold">
              <span className="bg-rose-500 text-white px-1.5 py-0.5 text-[8px] rounded mr-1">SPONSORED</span>
              <span>CLASSIFIED TRANSMISSION // NO. {video.id.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>DIGITAL KEY VERIFIED</span>
            </div>
            <div className="text-neutral-500 font-medium">
              <span>FILED: {video.date}</span>
            </div>
          </div>

          {/* Headline and editorial layout row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Column 1: Headline & Sponsor details */}
            <div className="md:col-span-2 space-y-2">
              <h1 className="font-sora text-lg md:text-xl font-extrabold text-white tracking-tight leading-tight uppercase">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono">
                <span className="text-amber-400 font-bold tracking-widest">
                  PUBLISHER: {video.sponsor}
                </span>
                <span className="text-neutral-600">|</span>
                <span className="text-neutral-500 flex items-center gap-1">
                  <Clock size={11} />
                  LIVE GRAPH MEDIA
                </span>
              </div>
            </div>

            {/* Column 2: Editorial Justified description article excerpt */}
            <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-neutral-800/80 pt-2.5 md:pt-0 md:pl-4">
              <p className="text-neutral-300 text-xs font-light leading-relaxed text-justify hyphens-auto uppercase tracking-wide font-mono text-[9px]">
                {video.description}
              </p>
            </div>

          </div>

          {/* Footer double line separator */}
          <div className="border-t border-b-2 border-neutral-800/80 py-1 text-[8px] font-mono text-neutral-500 text-center uppercase tracking-widest">
            ◆ ALL LOGICAL ENTITIES INDEXED PURSUANT TO REXLIFY NETWORK HARDENING MANDATES. INTEL REPORT DONE. ◆
          </div>

        </div>
      </div>

    </div>
  );
};

export const Sponsors: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // High-craft cyber load simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 border-2 border-dashed border-rose-500 rounded-full animate-spin duration-[4s]" />
          <div className="absolute inset-2 border-2 border-rose-950 rounded-full" />
          <Newspaper size={28} className="text-rose-500 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h2 className="font-sora text-sm font-extrabold text-white uppercase tracking-widest flex items-center justify-center gap-2">
            <RefreshCw size={13} className="animate-spin text-rose-500" />
            SYNCHRONIZING SECURE BROADCAST CHANNELS
          </h2>
          <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
            Decoding digital streams from verified network publishers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-8 px-4 space-y-6 animate-fadeIn">
      {/* Top Header section mirroring standard style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-5 gap-4">
        <div className="space-y-1">
          <span className="font-mono text-xs tracking-[0.25em] text-[#be123c] uppercase font-bold flex items-center gap-1.5">
            <Sparkles size={12} />
            REXLIFY BROADCAST ENGINE
          </span>
          <h1 className="font-sora text-3xl font-extrabold text-white tracking-tight">
            Sponsors Chronicles
          </h1>
          <p className="font-mono text-[9px] text-gray-500 uppercase tracking-wide leading-relaxed">
            INTELLIGENCE DOSSIER // DEPLOYED VIDEO NEWSROOMS SECURED
          </p>
        </div>

        {/* Global Control Widget */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.01] text-left text-xs">
            <span className="font-mono text-[8px] text-gray-500 block uppercase font-bold">CHANNELS DETECTED</span>
            <span className="font-mono text-[10px] text-emerald-400 font-extrabold">
              {SPONSOR_VIDEOS_POOL.length} ACTIVE STREAMS
            </span>
          </div>

          <button
            onClick={() => {
              if (scrollContainerRef.current) {
                const nextSection = scrollContainerRef.current.scrollTop + scrollContainerRef.current.clientHeight;
                scrollContainerRef.current.scrollTo({ top: nextSection, behavior: 'smooth' });
              }
            }}
            className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-rose-400 hover:text-white rounded-xl font-mono text-[10px] uppercase font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Scroll to next stream"
          >
            <span>NEXT</span>
            <span>↓</span>
          </button>
        </div>
      </div>

      {/* Vertical, snap-scrolling layout frame */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-[650px] md:h-[720px] rounded-3xl border border-white/10 bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
        id="sponsors-vertical-snap-feed"
      >
        {SPONSOR_VIDEOS_POOL.map((video) => (
          <SponsorVideoCard 
            key={video.id} 
            video={video} 
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
          />
        ))}

        {/* Floating Indicator showing swipe navigation for desktop clickers */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full font-mono text-[8px] uppercase tracking-widest text-neutral-400 pointer-events-none select-none z-20 flex items-center gap-2 animate-bounce">
          <span>◆ SNAP-SCROLL CHANNELS VERTICALLY ◆</span>
        </div>
      </div>

      {/* Feed footnotes */}
      <div className="text-center font-mono text-[8px] text-neutral-600 uppercase tracking-widest mt-2">
        DISCLAIMER: Content delivered in this chronicle consists of secure sponsored integrations verified by internal Rexlify standards.
      </div>
    </div>
  );
};
