import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

export interface VideoBackgroundProps {
  /** Video source: can be an HTML5 video URL (.mp4/.webm), YouTube ID, or full YouTube URL */
  src: string;
  /** Optional fallback poster image URL */
  poster?: string;
  /** Opacity of the video layer (0 to 1), defaults to 0.38 */
  opacity?: number;
  /** Scale factor to trim borders/letterboxing, defaults to 1.35 */
  scale?: number;
  /** Pre-tuned gradient overlay theme or custom gradient class */
  overlayTheme?: 'institute' | 'cyber' | 'dark' | 'subtle' | 'none' | 'custom';
  /** Custom overlay class if overlayTheme is 'custom' */
  customOverlayClass?: string;
  /** Blur filter applied to video */
  blur?: 'none' | 'sm' | 'md' | 'lg';
  /** Saturation multiplier percentage (e.g. 150 for 150%) */
  saturation?: number;
  /** Contrast multiplier percentage (e.g. 125 for 125%) */
  contrast?: number;
  /** Whether to show a floating glassmorphic audio mute/unmute control */
  showAudioToggle?: boolean;
  /** Whether to show a subtle ambient tech grid on top of the video */
  showTechGrid?: boolean;
  /** Optional custom CSS classes for the container */
  className?: string;
  /** Optional foreground children to render inside with guaranteed z-index hierarchy */
  children?: React.ReactNode;
}

/**
 * Extracts a YouTube Video ID from various URL formats or returns the raw ID
 */
function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  // If it's already an 11-character alphanumeric/hyphen ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }
  const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Checks if the source is a direct video file (.mp4, .webm, .ogg)
 */
function isDirectVideo(src: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  poster,
  opacity = 0.38,
  scale = 1.35,
  overlayTheme = 'dark',
  customOverlayClass = '',
  blur = 'none',
  saturation = 140,
  contrast = 120,
  showAudioToggle = false,
  showTechGrid = false,
  className = '',
  children
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const youtubeId = extractYouTubeId(src);
  const isHtml5 = isDirectVideo(src);

  // Blur class mapping
  const blurClasses = {
    none: '',
    sm: 'blur-[2px]',
    md: 'blur-[4px]',
    lg: 'blur-[8px]',
  };

  // Gradient overlay themes designed specifically for Rexlify UI contrast
  const overlayThemeClasses = {
    institute: 'bg-gradient-to-t from-[#060411] via-[#060411]/80 to-purple-950/45',
    cyber: 'bg-gradient-to-t from-[#060411] via-[#060411]/75 to-cyan-950/40',
    dark: 'bg-gradient-to-t from-[#060411] via-[#060411]/85 to-[#060411]/50',
    subtle: 'bg-gradient-to-b from-black/40 via-black/60 to-[#060411]',
    none: '',
    custom: customOverlayClass
  };

  const selectedOverlay = overlayThemeClasses[overlayTheme] || overlayThemeClasses.dark;

  // Toggle Mute for HTML5 or YouTube
  const handleToggleAudio = () => {
    if (isHtml5 && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    } else if (youtubeId && iframeRef.current && iframeRef.current.contentWindow) {
      const command = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
      setIsMuted(!isMuted);
    }
  };

  // Toggle Play/Pause for HTML5
  const handleTogglePlay = () => {
    if (isHtml5 && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else if (youtubeId && iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, [src]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* -------------------- 1. VIDEO LAYER (PINNED IN BACKGROUND) -------------------- */}
      <div 
        className="absolute inset-0 w-full h-full -z-20 overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
      >
        {isHtml5 ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            style={{
              transform: `scale(${scale})`,
              filter: `saturate(${saturation}%) contrast(${contrast}%)`,
              opacity: opacity
            }}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${blurClasses[blur]} ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : youtubeId ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${youtubeId}&modestbranding=1&iv_load_policy=3&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
            title="Background Video Stream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{
              transform: `scale(${scale})`,
              filter: `saturate(${saturation}%) contrast(${contrast}%)`,
              opacity: opacity
            }}
            className={`w-full h-full object-cover pointer-events-none transition-opacity duration-1000 ${blurClasses[blur]}`}
            onLoad={() => setVideoLoaded(true)}
          />
        ) : (
          /* Static Image / Poster Fallback */
          poster && (
            <img
              src={poster}
              alt="Video Poster Background"
              style={{
                transform: `scale(${scale})`,
                filter: `saturate(${saturation}%) contrast(${contrast}%)`,
                opacity: opacity
              }}
              className={`w-full h-full object-cover ${blurClasses[blur]}`}
            />
          )
        )}

        {/* -------------------- 2. GLASSMORPHISM & GRADIENT OVERLAY -------------------- */}
        <div className={`absolute inset-0 ${selectedOverlay}`} />

        {/* Optional Ambient Tech Grid Overlay */}
        {showTechGrid && (
          <div 
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        )}
      </div>

      {/* -------------------- 3. OPTIONAL SOUND / PLAY CONTROLS (GLASSMORPHIC) -------------------- */}
      {showAudioToggle && (
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            aria-label={isPlaying ? "Pause background video" : "Play background video"}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={handleToggleAudio}
            aria-label={isMuted ? "Unmute background audio" : "Mute background audio"}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 active:scale-95"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-cyan-400" />}
          </button>
        </div>
      )}

      {/* -------------------- 4. FOREGROUND CHILDREN CONTENT LAYER -------------------- */}
      {children && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {children}
        </div>
      )}
    </div>
  );
};
