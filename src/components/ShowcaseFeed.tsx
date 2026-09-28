import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Volume2, VolumeX, Folder, Calendar, Share2, 
  MessageSquare, ThumbsUp, Bookmark, Star, Send, X, Globe, User, Circle,
  Tv, Film, SkipForward, SkipBack, RotateCw, RotateCcw, Sparkles, Maximize2, Minimize2
} from 'lucide-react';
import { VideoCenterItem, UserAccount } from '../types';

interface ShowcaseFeedProps {
  videos: VideoCenterItem[];
  activeUser: UserAccount;
  onUpdateActiveUser: (user: UserAccount) => void;
  onUpdateVideos: (videos: VideoCenterItem[]) => void;
}

// Extract Video ID helper for platforms with robust regex validation and normalization
const parseVideoUrl = (url: string) => {
  if (!url) return { type: 'unknown', embedUrl: '' };

  const trimmed = url.trim();

  // 1. YouTube Robust Matcher (supports watch?v=, embed/, v/, shorts/, live/, youtu.be/, watch?v= with extra query parameters)
  const ytRegex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      id: ytMatch[1],
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0&rel=0&modestbranding=1&enablejsapi=1`
    };
  }

  // 2. Facebook Robust Matcher
  // Supports facebook.com videos, reels, share links, m.facebook, fb.watch, fb.com
  const isFacebook = /facebook\.com|fb\.watch|fb\.com/i.test(trimmed);
  if (isFacebook) {
    let targetUrl = trimmed;
    // Extract numeric ID from paths like /videos/123, /reel/123, /reels/123, or ?v=123
    const idMatch = trimmed.match(/(?:\?v=|&v=|\/videos\/|\/reel\/|\/reels\/|\/watch\/)(\d+)/i);
    const shareMatch = trimmed.match(/facebook\.com\/share\/[vr]\/([a-zA-Z0-9_-]+)/i);
    const watchMatch = trimmed.match(/fb\.watch\/([a-zA-Z0-9_-]+)/i);

    if (idMatch && idMatch[1]) {
      targetUrl = `https://www.facebook.com/watch/?v=${idMatch[1]}`;
    } else if (shareMatch && shareMatch[1]) {
      targetUrl = trimmed;
    } else if (watchMatch && watchMatch[1]) {
      targetUrl = trimmed;
    }

    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(targetUrl)}&show_text=0&autoplay=1`
    };
  }

  // 3. Instagram Robust Matcher (matches /p/, /reel/, /reels/, /tv/ with or without username in path)
  const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:[^\/\n\s]+\/)?(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/i;
  const igMatch = trimmed.match(igRegex);
  if (igMatch && igMatch[1]) {
    return {
      type: 'instagram',
      id: igMatch[1],
      embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed/captioned/`
    };
  }

  // Direct MP4 / Video streams
  if (trimmed.match(/\.(mp4|webm|ogg|mov)$/i) || trimmed.includes('gtv-videos-bucket') || trimmed.includes('sample/ForBigger')) {
    return {
      type: 'direct',
      embedUrl: trimmed
    };
  }

  // General fallback - load in secure iframe so it doesn't fail
  return {
    type: 'website',
    embedUrl: trimmed
  };
};

const VideoCard: React.FC<{ 
  video: VideoCenterItem; 
  isActive: boolean;
  activeUser: UserAccount;
  videos: VideoCenterItem[];
  onUpdateVideos: (videos: VideoCenterItem[]) => void;
  onUpdateActiveUser: (user: UserAccount) => void;
  isReelFormat: boolean;
  onNextVideo?: () => void;
  onPrevVideo?: () => void;
}> = ({ video, isActive, activeUser, videos, onUpdateVideos, onUpdateActiveUser, isReelFormat, onNextVideo, onPrevVideo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerDivRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!containerDivRef.current) return;

    if (!document.fullscreenElement) {
      containerDivRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error("Error attempting to exit fullscreen:", err);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  
  // Sidebar expanded drawer states
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [likesSplash, setLikesSplash] = useState(false);

  const { type: videoType, embedUrl } = parseVideoUrl(video.url);

  // Setup simulated auto-duration for YouTube/Facebook/Iframe videos
  useEffect(() => {
    let dur = 300; // default 5 mins
    if (video.duration && video.duration !== 'Auto' && video.duration !== 'auto') {
      const parts = video.duration.split(':');
      if (parts.length === 2) {
        dur = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      } else if (parts.length === 3) {
        dur = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
      }
    }
    setTotalDuration(dur);
    setCurrentTime(0);
    setProgress(0);
  }, [video]);

  // Handle Play/Pause logic based on activation
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true);
      if (videoType === 'direct' && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      setIsPlaying(false);
      if (videoType === 'direct' && videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isActive, videoType]);

  // Simulated Time & Progress updater for iframe embeds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && isPlaying && videoType !== 'direct') {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            return 0; // loop
          }
          const next = prev + 1;
          setProgress((next / totalDuration) * 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, isPlaying, videoType, totalDuration]);

  // HTML5 Video direct duration and time tracker
  const handleTimeUpdate = () => {
    if (videoType === 'direct' && videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setCurrentTime(current);
      setTotalDuration(duration);
      setProgress((current / duration) * 100);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (videoType === 'direct' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Skip 10 seconds function
  const skipTime = (seconds: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (videoType === 'direct' && videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
    } else {
      setCurrentTime((prev) => {
        const next = Math.max(0, Math.min(totalDuration, prev + seconds));
        setProgress((next / totalDuration) * 100);
        return next;
      });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikesSplash(true);
    setTimeout(() => setLikesSplash(false), 800);

    const nextVideos = videos.map(v => {
      if (v.id === video.id) {
        return { ...v, likes: v.likes + 1 };
      }
      return v;
    });
    onUpdateVideos(nextVideos);
  };

  const handleWatchLaterToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isSaved = activeUser.watchLater.includes(video.id);
    const nextSaved = isSaved 
      ? activeUser.watchLater.filter(id => id !== video.id)
      : [...activeUser.watchLater, video.id];

    onUpdateActiveUser({
      ...activeUser,
      watchLater: nextSaved
    });
  };

  const handleShareSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`https://rexlify.com/showcase/${video.id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const formattedComment = {
      id: `comment-${Date.now()}`,
      author: activeUser.username || 'System Admin',
      content: newComment,
      date: new Date().toISOString().split('T')[0]
    };

    const nextVideos = videos.map(v => {
      if (v.id === video.id) {
        return {
          ...v,
          comments: [formattedComment, ...v.comments]
        };
      }
      return v;
    });

    onUpdateVideos(nextVideos);
    setNewComment('');
  };

  const formatTimestamp = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isSavedWatchLater = activeUser.watchLater.includes(video.id);

  return (
    <div ref={containerDivRef} className={`relative w-full h-[85vh] snap-start flex flex-col md:flex-row bg-[#02010c] overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl group shrink-0 transition-all ${isReelFormat ? 'max-w-md mx-auto border-purple-500/10' : ''}`}>
      
      {/* Video Content Workspace Screen */}
      <div 
        className="relative flex-grow h-full bg-gradient-to-b from-[#0a0515] to-[#010005] flex items-center justify-center overflow-hidden" 
        onClick={() => togglePlay()}
      >
        {/* Branding Floating Badge */}
        <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-[#07080d]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 animate-pulse" />
          <span className="font-mono text-[9px] text-purple-300 font-extrabold uppercase tracking-wider">REXLIFY STREAM</span>
        </div>

        {/* Dynamic Video Render engine */}
        {videoType === 'direct' ? (
          <video
            ref={videoRef}
            src={embedUrl}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
            loop
            muted={isMuted}
            playsInline
            crossOrigin="anonymous"
            onTimeUpdate={handleTimeUpdate}
            onClick={() => togglePlay()}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={video.title}
            className={`w-full h-full border-none pointer-events-auto transition-opacity duration-500 ${isReelFormat ? 'aspect-[9/16]' : 'aspect-video'}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )}

        {/* Play/Pause Overlay Splash */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#be123c] to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/20 pointer-events-auto cursor-pointer" onClick={() => togglePlay()}>
                <Play size={20} className="text-white ml-1 fill-current" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Premium Control Overlays (Skip, Next, Prev, Brand) - Visible on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-32 pb-6 px-6 md:px-10 z-20 flex flex-col justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          
          {/* Metadata Block */}
          <div className="max-w-2xl pl-4 border-l-2 border-purple-500 pointer-events-auto">
            <div className="flex flex-wrap items-center gap-3 mb-2 text-[10px]">
              <span className="font-mono text-white bg-gradient-to-r from-purple-600 to-pink-500 px-2 py-0.5 rounded uppercase tracking-wider font-extrabold shadow-lg">
                {video.category}
              </span>
              {video.sponsor && (
                <span className="font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded font-bold uppercase">
                  {video.sponsor}
                </span>
              )}
              <span className="font-mono text-gray-400">{video.date}</span>
            </div>

            <h2 className="font-sora text-base md:text-lg font-extrabold text-white leading-tight mb-1">
              {video.title}
            </h2>
            <p className="font-sans text-[11px] text-gray-300 font-light leading-relaxed line-clamp-2">
              {video.description}
            </p>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center justify-between pointer-events-auto mt-2 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="p-2 bg-white/5 hover:bg-purple-500/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              {/* Skip 10s Backward */}
              <button 
                onClick={(e) => skipTime(-10, e)}
                className="p-2 bg-white/5 hover:bg-purple-500/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer flex items-center gap-1 font-mono text-[9px] font-bold"
                title="Rewind 10 seconds"
              >
                <RotateCcw size={12} /> 10s
              </button>

              {/* Skip 10s Forward */}
              <button 
                onClick={(e) => skipTime(10, e)}
                className="p-2 bg-white/5 hover:bg-purple-500/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer flex items-center gap-1 font-mono text-[9px] font-bold"
                title="Fast forward 10 seconds"
              >
                <RotateCw size={12} /> 10s
              </button>
            </div>

            {/* Next & Previous Navigation controls */}
            <div className="flex items-center gap-2">
              {onPrevVideo && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onPrevVideo(); }}
                  className="p-2 bg-white/5 hover:bg-purple-500/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
                  title="Previous Transmission"
                >
                  <SkipBack size={12} />
                </button>
              )}
              {onNextVideo && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onNextVideo(); }}
                  className="p-2 bg-white/5 hover:bg-purple-500/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
                  title="Next Transmission"
                >
                  <SkipForward size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Timestamps */}
              <div className="font-mono text-[10px] text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                {formatTimestamp(currentTime)} / {formatTimestamp(totalDuration)}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/5 hover:bg-purple-500/20 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Heart Splash on like click */}
        <AnimatePresence>
          {likesSplash && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.3, y: 10 }}
              animate={{ opacity: 1, scale: 1.8, y: -80 }}
              exit={{ opacity: 0, y: -150 }}
              transition={{ duration: 0.8 }}
              className="absolute pointer-events-none text-rose-500 text-6xl drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] z-30"
            >
              ❤️
            </motion.div>
          )}
        </AnimatePresence>

        {/* Purple to Pink Aesthetic Progress bar at the bottom */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 z-30">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Video Engagement sidebar rail */}
      <div className="bg-[#03020d] border-t md:border-t-0 md:border-l border-white/5 flex md:flex-col justify-around items-center p-4 md:py-8 gap-4 w-full md:w-20 shrink-0 z-30">
        <button 
          onClick={handleLike}
          className="group flex flex-col items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-rose-500/10 group-active:scale-90 transition-all">
            <ThumbsUp size={16} className="text-gray-300 group-hover:text-rose-400 fill-transparent" />
          </div>
          <span className="font-mono text-[10px] font-bold text-gray-500 group-hover:text-rose-300">{video.likes}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className="group flex flex-col items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-cyan-500/10 transition-all">
            <MessageSquare size={16} className="text-gray-300 group-hover:text-cyan-400" />
          </div>
          <span className="font-mono text-[10px] font-bold text-gray-500 group-hover:text-cyan-300">{video.comments.length}</span>
        </button>

        <button 
          onClick={handleWatchLaterToggle}
          className="group flex flex-col items-center gap-1 text-gray-400 hover:text-amber-400 transition-colors cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-all">
            <Bookmark size={16} className={`group-hover:text-amber-400 ${isSavedWatchLater ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
          </div>
          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">{isSavedWatchLater ? 'SAVED' : 'SAVE'}</span>
        </button>

        <button 
          onClick={handleShareSubmit}
          className="group flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-all">
            <Share2 size={16} className="text-gray-300 group-hover:text-emerald-400" />
          </div>
          <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">SHARE</span>
        </button>
      </div>

      {/* Share Modal Dialog overlay */}
      {showShareModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={(e) => { e.stopPropagation(); setShowShareModal(false); }}>
          <div className="glassmorphic-card p-6 rounded-2xl w-full max-w-sm border border-white/10 bg-[#08051a] space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="font-sora font-extrabold text-[#be123c] text-sm uppercase tracking-wide">Secure Video Transmission</h4>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-white cursor-pointer"><X size={15} /></button>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-[#be123c]/20 bg-rose-500/5 gap-3">
              <span className="text-2xl">🔗</span>
              <p className="text-gray-300 text-xs">Share this direct link with assistants or diagnostic validators.</p>
              
              <div className="w-full flex items-center gap-2 border border-white/5 bg-white/[0.02] px-3 py-2 rounded-lg">
                <span className="font-mono text-[10px] text-gray-400 line-clamp-1 w-full bg-transparent border-none select-all select-none">
                  https://rexlify.com/showcase/{video.id}
                </span>
                <button 
                  onClick={copyShareLink}
                  className="px-3 py-1 rounded bg-[#be123c] text-white font-mono text-[10px] hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                >
                  {isCopied ? 'COPIED!' : 'COPY'}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowShareModal(false)}
              className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono uppercase text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Verify Close
            </button>
          </div>
        </div>
      )}

      {/* Comments Drawer sidebar */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, x: 250 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 250 }}
            className="absolute md:relative inset-y-0 right-0 w-full md:w-80 bg-[#050312] border-l border-white/5 p-6 flex flex-col justify-between z-40"
          >
            <div className="space-y-4 flex-grow overflow-hidden flex flex-col">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="space-y-0.5">
                  <h3 className="font-sora text-sm font-extrabold text-white">Comments</h3>
                  <p className="font-mono text-[9px] text-gray-500">{video.comments.length} transmissions logged</p>
                </div>
                <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white cursor-pointer hover:rotate-90 transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Feed Comments List scroll box */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin hide-scrollbar">
                {video.comments.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-center gap-2">
                    <span className="text-lg text-gray-600">💬</span>
                    <p className="font-mono text-[9px] text-gray-500 uppercase">No encryption notes left. Be the first to catalog!</p>
                  </div>
                ) : (
                  video.comments.map((comment) => (
                    <div key={comment.id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-1.5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-sora font-semibold text-purple-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          {comment.author}
                        </span>
                        <span className="font-mono text-gray-500 text-[8px]">{comment.date}</span>
                      </div>
                      <p className="text-gray-300 text-xs font-light leading-relaxed break-words">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Post Form footer */}
            <form onSubmit={handlePostComment} className="border-t border-white/5 pt-4 mt-4 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Record comment entry..."
                  id={`video-comment-input-${video.id}`}
                  className="w-full text-xs font-sans pl-3 pr-10 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.04] transition-all pr-12"
                />
                <button
                  type="submit"
                  className="absolute right-1 text-purple-500 hover:text-pink-500 top-1/2 -translate-y-1/2 p-2 rounded-lg cursor-pointer hover:bg-white/5 active:scale-95 transition-all"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export const ShowcaseFeed: React.FC<ShowcaseFeedProps> = ({ 
  videos, activeUser, onUpdateActiveUser, onUpdateVideos 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Tutorials' | 'Demos' | 'Promos' | 'Sponsored Content'>('All');
  const [videoLayoutMode, setVideoLayoutMode] = useState<'reels' | 'long'>('long'); // Split layout
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter video list based on format & category
  const filteredVideos = videos.filter(v => {
    // Categories
    if (activeCategory !== 'All' && v.category !== activeCategory) return false;

    // Reels format detection: Let's assume tutorials & promos can be reels, or URLs ending with shorts, or reels, or users can toggle!
    // But even better, we let the user split them by Reels (vertical/Shorts/TikTok/FB Reels links) vs regular landscape videos.
    const isReelUrl = v.url.includes('shorts') || v.url.includes('reel') || v.url.includes('instagram.com/p') || v.duration === '00:30' || v.duration === '00:15';
    if (videoLayoutMode === 'reels') {
      return isReelUrl || v.category === 'Promos'; // include short promos or reels URLs
    } else {
      return !isReelUrl && v.category !== 'Promos'; // keep cinematic longer videos
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollPosition = containerRef.current.scrollTop;
        const windowHeight = window.innerHeight * 0.85; // Roughly the snap size
        const index = Math.round(scrollPosition / windowHeight);
        setActiveIndex(index);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleCategorySwitch = (cat: typeof activeCategory) => {
    setActiveCategory(cat);
    setActiveIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const handleNext = () => {
    if (activeIndex < filteredVideos.length - 1) {
      const nextIdx = activeIndex + 1;
      setActiveIndex(nextIdx);
      if (containerRef.current) {
        containerRef.current.scrollTop = nextIdx * window.innerHeight * 0.85;
      }
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      const prevIdx = activeIndex - 1;
      setActiveIndex(prevIdx);
      if (containerRef.current) {
        containerRef.current.scrollTop = prevIdx * window.innerHeight * 0.85;
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
      
      {/* Category controls and top heading details */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <span className="font-mono text-xs tracking-[0.25em] text-purple-400 uppercase font-bold flex items-center gap-1.5">
            <Tv size={13} /> REXLIFY BROADCAST STATION
          </span>
          <h1 className="font-sora text-3xl font-extrabold text-white tracking-tight">Ecosystem Video Center</h1>
        </div>

        {/* Video Type Split Tab Selection (রিলস পার্ট ও ভিডিও পার্ট) */}
        <div className="flex items-center gap-2 bg-[#02010c] border border-white/10 p-1 rounded-2xl">
          <button
            onClick={() => { setVideoLayoutMode('reels'); setActiveIndex(0); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              videoLayoutMode === 'reels'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film size={12} />
            Reels (রিলস)
          </button>
          <button
            onClick={() => { setVideoLayoutMode('long'); setActiveIndex(0); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              videoLayoutMode === 'long'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Tv size={12} />
            Videos (ভিডিওস)
          </button>
        </div>

        {/* Categories selectors */}
        <div className="flex flex-wrap gap-1.5 border border-white/5 bg-white/[0.01] p-1 rounded-xl">
          {(['All', 'Tutorials', 'Demos', 'Promos', 'Sponsored Content'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySwitch(cat)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'Sponsored Content' ? 'Sponsor' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Video feeds scroll viewport */}
      <div 
        ref={containerRef}
        className="h-[85vh] overflow-y-auto snap-y snap-mandatory rounded-[2.5rem] hide-scrollbar bg-[#02010c]/40 backdrop-blur-md border border-white/5 relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />

        {filteredVideos.map((video, index) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isActive={index === activeIndex} 
            activeUser={activeUser}
            videos={videos}
            onUpdateVideos={onUpdateVideos}
            onUpdateActiveUser={onUpdateActiveUser}
            isReelFormat={videoLayoutMode === 'reels'}
            onNextVideo={index < filteredVideos.length - 1 ? handleNext : undefined}
            onPrevVideo={index > 0 ? handlePrev : undefined}
          />
        ))}

        {filteredVideos.length === 0 && (
          <div className="h-full flex items-center justify-center flex-col gap-3 text-gray-500">
            <span className="text-3xl">📭</span>
            <p className="font-mono text-[10px] uppercase tracking-widest">No matching broadcasts live in this format</p>
          </div>
        )}
      </div>

      {/* Slider indicators */}
      {filteredVideos.length > 1 && (
        <div className="flex justify-center gap-2">
          {filteredVideos.map((_, i) => (
            <button 
              key={i} 
              onClick={() => {
                setActiveIndex(i);
                if (containerRef.current) {
                  containerRef.current.scrollTop = i * window.innerHeight * 0.85;
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === activeIndex ? 'w-8 bg-purple-500' : 'w-2 bg-white/15'}`}
            />
          ))}
        </div>
      )}

    </div>
  );
};
