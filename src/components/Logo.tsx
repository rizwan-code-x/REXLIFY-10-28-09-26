/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export interface RexlifyLogoProps {
  className?: string; 
  size?: number | string;
  showText?: boolean;
  layout?: 'horizontal' | 'vertical' | 'full';
  monochrome?: boolean;
  animated?: boolean;
}

export const RexlifyLogo: React.FC<RexlifyLogoProps> = ({ 
  className = '', 
  size = 40, 
  showText = true,
  layout = 'horizontal',
  monochrome = false,
  animated = true
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 40;
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const badgeSize = layout === 'vertical' ? numericSize * 1.5 : numericSize;
  const isVertical = layout === 'vertical';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none transition-transform duration-200 hover:scale-[1.02] group ${
      isVertical ? 'flex-col text-center' : 'flex-row'
    } ${className}`}>
      {/* Official Animated "R" Video Emblem Badge */}
      <div 
        className="relative overflow-hidden rounded-2xl border border-pink-500/50 group-hover:border-pink-400 shadow-md shadow-pink-500/25 bg-black shrink-0 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.55)] group-hover:scale-105"
        style={{
          width: `${badgeSize}px`,
          height: `${badgeSize}px`,
        }}
      >
        {!hasError ? (
          <video
            ref={videoRef}
            src="/1000158504_gwr_video_mvp.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover pointer-events-none select-none scale-[1.08]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-600 via-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-lg">
            R
          </div>
        )}

        {/* Ambient Ring & Glass Highlight */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none z-10" />
      </div>

      {showText && (
        <div className={`flex flex-col leading-none ${isVertical ? 'items-center mt-1' : 'items-start'}`}>
          <div className="flex items-center gap-1">
            <span 
              className={`font-sora font-extrabold tracking-wider bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 bg-clip-text text-transparent drop-shadow-sm ${
                monochrome ? 'text-white bg-none' : ''
              }`}
              style={{ fontSize: `${Math.max(13, numericSize * 0.46)}px` }}
            >
              REXLIFY
            </span>
            <span 
              className="font-mono text-pink-500 font-bold"
              style={{ fontSize: `${Math.max(11, numericSize * 0.40)}px` }}
            >
              &gt;
            </span>
          </div>
          {(layout === 'full' || layout === 'vertical') && (
            <span className="text-[9px] font-mono text-pink-400 uppercase tracking-widest mt-0.5">
              Cognitive Core
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const NeuraxLogo: React.FC<{ size?: number; className?: string; layout?: 'horizontal' | 'vertical'; showText?: boolean }> = ({ 
  size = 48, 
  className = '',
  layout = 'horizontal',
  showText = true
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 48;
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const badgeSize = layout === 'vertical' ? numericSize * 1.8 : numericSize;

  return (
    <div className={`inline-flex items-center gap-3 select-none transition-transform duration-200 hover:scale-[1.02] ${
      layout === 'vertical' ? 'flex-col text-center' : 'flex-row'
    } ${className}`}>
      {/* NeuraX Video Emblem Badge */}
      <div 
        className="relative flex items-center justify-center rounded-2xl bg-black border border-blue-500/50 shadow-md shadow-blue-600/30 shrink-0 overflow-hidden group"
        style={{ width: badgeSize, height: badgeSize }}
      >
        {!hasError ? (
          <video
            ref={videoRef}
            src="/1000162691_gwr_video_mvp.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        ) : (
          <div className="w-full h-full bg-[#3852ff] flex items-center justify-center text-white font-black text-lg">
            NX
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      </div>

      {showText && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center mt-1' : 'text-left'}`}>
          <span className="font-sora font-extrabold text-white text-base tracking-tight leading-none">
            NeuraX
          </span>
          <span className="font-mono text-[9px] text-[#38bdf8] mt-1 tracking-wider leading-none font-bold uppercase">
            Neural Core
          </span>
        </div>
      )}
    </div>
  );
};

export const SifraLogo: React.FC<{ size?: number; className?: string; layout?: 'horizontal' | 'vertical'; showText?: boolean }> = ({ 
  size = 48, 
  className = '',
  layout = 'horizontal',
  showText = true
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 48;
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.volume = 0; // Strictly ensure audio is completely silenced
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const badgeSize = layout === 'vertical' ? numericSize * 1.8 : numericSize;

  return (
    <div className={`inline-flex items-center gap-3 select-none transition-transform duration-200 hover:scale-[1.02] ${
      layout === 'vertical' ? 'flex-col text-center' : 'flex-row'
    } ${className}`}>
      {/* Sifra AI Video Emblem Badge (Sound Completely Muted) */}
      <div 
        className="relative flex items-center justify-center rounded-2xl bg-black border border-pink-500/50 shadow-md shadow-pink-600/30 shrink-0 overflow-hidden group"
        style={{ width: badgeSize, height: badgeSize }}
      >
        {!hasError ? (
          <video
            ref={videoRef}
            src="/1778152415017.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-600 to-purple-800 flex items-center justify-center text-white font-black text-lg">
            S
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      </div>

      {showText && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center mt-1' : 'text-left'}`}>
          <span className="font-sora font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff5085] to-[#ffa07a] text-base leading-none">
            SIFRA AI
          </span>
          <span className="font-sans text-[8px] font-bold text-gray-300 tracking-[0.2em] uppercase mt-1 leading-none">
            Autonomous Co-Pilot
          </span>
        </div>
      )}
    </div>
  );
};

export const RodpLogo: React.FC<{ size?: number; className?: string; layout?: 'horizontal' | 'vertical'; showText?: boolean }> = ({
  size = 48,
  className = '',
  layout = 'horizontal',
  showText = true
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 48;
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const badgeSize = layout === 'vertical' ? numericSize * 1.8 : numericSize;

  return (
    <div className={`inline-flex items-center gap-3 select-none transition-transform duration-200 hover:scale-[1.02] ${
      layout === 'vertical' ? 'flex-col text-center' : 'flex-row'
    } ${className}`}>
      {/* RODP Video Emblem Badge */}
      <div 
        className="relative flex items-center justify-center rounded-2xl bg-black border border-amber-500/50 shadow-md shadow-amber-600/30 shrink-0 overflow-hidden group"
        style={{ width: badgeSize, height: badgeSize }}
      >
        {!hasError ? (
          <video
            ref={videoRef}
            src="/1000162695_gwr_video_mvp.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-lg">
            R
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      </div>

      {showText && (
        <div className={`flex flex-col ${layout === 'vertical' ? 'items-center mt-1' : 'text-left'}`}>
          <span className="font-sora font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 text-base leading-none uppercase">
            RODP
          </span>
          <span className="font-mono text-[8px] font-bold text-[#dfac5d] tracking-wider uppercase mt-1 leading-none">
            Rizwan Online Dreams
          </span>
        </div>
      )}
    </div>
  );
};

export const NooraxLogo: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="absolute inset-0 bg-emerald-500/10 blur-md rounded-full" />
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative transition-all duration-300 hover:scale-110"
        >
          {/* Cybernetic chip icon */}
          <rect x="25" y="25" width="50" height="50" rx="10" stroke="url(#noorax-grad)" strokeWidth="6" fill="none" />
          <line x1="15" y1="40" x2="25" y2="40" stroke="#10b981" strokeWidth="4" />
          <line x1="15" y1="60" x2="25" y2="60" stroke="#10b981" strokeWidth="4" />
          <line x1="75" y1="40" x2="85" y2="40" stroke="#10b981" strokeWidth="4" />
          <line x1="75" y1="60" x2="85" y2="60" stroke="#10b981" strokeWidth="4" />
          <line x1="40" y1="15" x2="40" y2="25" stroke="#10b981" strokeWidth="4" />
          <line x1="60" y1="15" x2="60" y2="25" stroke="#10b981" strokeWidth="4" />
          <line x1="40" y1="75" x2="40" y2="85" stroke="#10b981" strokeWidth="4" />
          <line x1="60" y1="75" x2="60" y2="85" stroke="#10b981" strokeWidth="4" />
          <circle cx="50" cy="50" r="10" fill="#10b981" />
          <defs>
            <linearGradient id="noorax-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="font-sora font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 text-base leading-none">
          NOORAX AI
        </span>
        <span className="font-sans text-[8px] font-semibold text-gray-400 tracking-[0.16em] uppercase mt-1 leading-none">
          Cognitive System
        </span>
      </div>
    </div>
  );
};

