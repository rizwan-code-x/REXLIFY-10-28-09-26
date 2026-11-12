/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, ExternalLink, ArrowUpRight, Sparkles, 
  BrainCircuit, LayoutDashboard, UserCheck, Moon, Share2, 
  Globe, Shield, Cpu, Sliders, Layers, RefreshCw
} from 'lucide-react';
import { Application } from '../types';
import { NeuraxLogo, SifraLogo, NooraxLogo, RodpLogo } from './Logo';
import { APP_LINKS } from '../config/appLinks';
import { RexlifyAuthModal } from './RexlifyAuthModal';
import { getCurrentUser, trackFeatureUsage, logoutUser, RegisteredUser } from '../services/userService';

export const SIFRA_AI_LIVE_URL = APP_LINKS.sifra;

interface ExploreAppsHubProps {
  applications: Application[];
  setView: (view: any) => void;
  onSimulateDownload?: (appId: string, name: string, filename: string) => void;
  onIncrementDownload?: (appId: string) => void;
}

// Preset color shade pairings for the two-tone right vertical accent strip
// Top block (number) is a deeper, richer shade; lower block is the vibrant accent tone
const COLOR_SHADE_MAP: Record<string, { base: string; dark: string }> = {
  // Application 01: Sifra AI (Golden yellow / amber)
  '#F5A623': { base: '#f5a623', dark: '#d98218' },
  'amber': { base: '#f5a623', dark: '#d98218' },
  'yellow': { base: '#f5a623', dark: '#d98218' },

  // Application 02: NeuraX (Coral orange / red-orange)
  '#F06449': { base: '#f06449', dark: '#cf4b32' },
  'orange': { base: '#f06449', dark: '#cf4b32' },
  'coral': { base: '#f06449', dark: '#cf4b32' },

  // Application 03: RODP (Warm grey / bronze)
  '#8A7D71': { base: '#8a7d71', dark: '#655b51' },
  'bronze': { base: '#8a7d71', dark: '#655b51' },
  'grey': { base: '#8a7d71', dark: '#655b51' },

  // Application 04: Rizwan R.R. (Emerald green)
  '#48A860': { base: '#48a860', dark: '#327c44' },
  'emerald': { base: '#48a860', dark: '#327c44' },
  'green': { base: '#48a860', dark: '#327c44' },

  // Application 05: NooraX (Teal / turquoise)
  '#3CA0B6': { base: '#3ca0b6', dark: '#2c7b8c' },
  'teal': { base: '#3ca0b6', dark: '#2c7b8c' },
  'turquoise': { base: '#3ca0b6', dark: '#2c7b8c' },

  // Application 06: Maya Connect (Premium blue)
  '#2E72BC': { base: '#2e72bc', dark: '#1e528a' },
  'blue': { base: '#2e72bc', dark: '#1e528a' },

  // Fallbacks
  'violet': { base: '#8b5cf6', dark: '#6d28d9' },
  'purple': { base: '#8b5cf6', dark: '#6d28d9' },
  'pink': { base: '#ec4899', dark: '#be185d' },
};

function getStripShades(accentColor?: string, index: number = 0): { base: string; dark: string } {
  if (accentColor && COLOR_SHADE_MAP[accentColor]) {
    return COLOR_SHADE_MAP[accentColor];
  }
  if (accentColor && accentColor.startsWith('#')) {
    // Generate a slightly darker variant for the top block
    return {
      base: accentColor,
      dark: adjustBrightness(accentColor, -25)
    };
  }
  // Default cycling fallback matching the reference 6 colors
  const defaultPairs = [
    { base: '#f5a623', dark: '#d98218' }, // 1 Amber
    { base: '#f06449', dark: '#cf4b32' }, // 2 Orange
    { base: '#8a7d71', dark: '#655b51' }, // 3 Bronze
    { base: '#48a860', dark: '#327c44' }, // 4 Green
    { base: '#3ca0b6', dark: '#2c7b8c' }, // 5 Teal
    { base: '#2e72bc', dark: '#1e528a' }, // 6 Blue
  ];
  return defaultPairs[index % defaultPairs.length];
}

// Utility to darken hex color for the upper number block
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export const ExploreAppsHub: React.FC<ExploreAppsHubProps> = ({
  applications,
  setView,
  onIncrementDownload
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Registration & Login Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAppToLaunch, setPendingAppToLaunch] = useState<Application | null>(null);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() => getCurrentUser());

  // Mouse move handler for gentle 3D parallax on abstract background shapes
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePos({ x, y });
  };

  // Filter & sort applications
  const visibleApplications = useMemo(() => {
    // Only published applications
    const published = applications.filter(app => app.isPublished !== false);
    
    // Sort by displayOrder
    const sorted = [...published].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

    if (!searchQuery.trim()) {
      return sorted;
    }

    const q = searchQuery.toLowerCase().trim();
    return sorted.filter(app => {
      const nameMatch = app.name.toLowerCase().includes(q);
      const descMatch = (app.shortDescription || app.fullDescription || '').toLowerCase().includes(q);
      const catMatch = (app.category || '').toLowerCase().includes(q);
      const tagMatch = app.tags && app.tags.some(t => t.toLowerCase().includes(q));
      return nameMatch || descMatch || catMatch || tagMatch;
    });
  }, [applications, searchQuery]);

  // Execute application launch after authentication verification
  const executeLaunch = (app: Application) => {
    // Track feature usage in real-time
    trackFeatureUsage(app.name, app.url);

    if (onIncrementDownload) {
      onIncrementDownload(app.id);
    }

    // Direct routing for internal views
    if (app.id === 'rodp' || app.url === '#rodp') {
      setView('rodp');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (app.id === 'rizwan-rr' || app.url === '#rizwan-innovation') {
      setView('rizwan-innovation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (app.id === 'rexlify-ai' || app.url === '#rexlify-ai') {
      setView('rexlify-ai');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (app.id === 'rexlify-social' || app.url === '#rexlify-social') {
      setView('rexlify-social');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (app.id === 'rexlify-institute' || app.url === '#institute') {
      setView('institute');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (app.id === 'rexlify-hub' || app.url === '#projects') {
      setView('projects');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Official external web application URLs
    let targetUrl = app.url || app.downloadUrl || app.liveUrl || '';

    if (app.id === 'sifra' && (!targetUrl || targetUrl === '#')) {
      targetUrl = APP_LINKS.sifra;
    } else if (app.id === 'neurax' && (!targetUrl || targetUrl === '#')) {
      targetUrl = APP_LINKS.neurax;
    } else if (app.id === 'noorax' && (!targetUrl || targetUrl === '#')) {
      targetUrl = APP_LINKS.noorax;
    } else if (app.id === 'maya-connect' && (!targetUrl || targetUrl === '#')) {
      targetUrl = 'https://maya.rexlify.com';
    }

    if (targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (targetUrl.startsWith('#')) {
      const viewName = targetUrl.replace(/^#/, '');
      setView(viewName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Default fallback
    if (app.id === 'sifra') {
      window.open(APP_LINKS.sifra, '_blank', 'noopener,noreferrer');
    } else if (app.id === 'neurax') {
      window.open(APP_LINKS.neurax, '_blank', 'noopener,noreferrer');
    } else {
      setView('home');
    }
  };

  // Handle application launch with authentication gating
  const handleLaunchApp = (app: Application) => {
    const user = getCurrentUser();
    if (!user) {
      // User is not logged in: prompt registration/login modal
      setPendingAppToLaunch(app);
      setAuthModalOpen(true);
      return;
    }

    // User is already logged in: proceed directly!
    executeLaunch(app);
  };

  // Render appropriate clean line-icon or official logo
  const renderCardIcon = (app: Application) => {
    const key = (app.icon || app.logo || app.id || '').toLowerCase();

    if (key.includes('sifra')) {
      return <SifraLogo size={28} showText={false} />;
    }
    if (key.includes('neurax')) {
      return <NeuraxLogo size={28} />;
    }
    if (key.includes('rodp')) {
      return <RodpLogo size={28} showText={false} />;
    }
    if (key.includes('social')) {
      return (
        <div className="text-rose-600 flex items-center justify-center">
          <Layers size={22} className="stroke-[1.8]" />
        </div>
      );
    }
    if (key.includes('institute')) {
      return (
        <div className="text-sky-600 flex items-center justify-center">
          <Globe size={22} className="stroke-[1.8]" />
        </div>
      );
    }
    if (key.includes('hub')) {
      return (
        <div className="text-purple-600 flex items-center justify-center">
          <BrainCircuit size={22} className="stroke-[1.8]" />
        </div>
      );
    }
    if (key.includes('noorax')) {
      return (
        <div className="text-teal-600 flex items-center justify-center">
          <Moon size={22} className="stroke-[1.8]" />
        </div>
      );
    }
    if (key.includes('profile') || key.includes('rizwan')) {
      return (
        <div className="text-emerald-600 flex items-center justify-center">
          <UserCheck size={22} className="stroke-[1.8]" />
        </div>
      );
    }
    if (key.includes('maya') || key.includes('connect')) {
      return (
        <div className="text-blue-600 flex items-center justify-center">
          <Share2 size={22} className="stroke-[1.8]" />
        </div>
      );
    }
    if (key.includes('rexlify-ai')) {
      return (
        <div className="text-pink-600 flex items-center justify-center">
          <Sparkles size={22} className="stroke-[1.8]" />
        </div>
      );
    }

    // Default clean line icon
    return (
      <div className="text-slate-700 flex items-center justify-center">
        <Cpu size={22} className="stroke-[1.8]" />
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#f8fafd] via-[#edf3f9] to-[#f4f7fb] text-slate-800 select-none py-12 px-4 sm:px-6 lg:px-8"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* -------------------- 50% OPACITY BACKGROUND VIDEO -------------------- */}
      {/* 1000172565_gwr_video_mvp.mp4 playing with 50% visibility as strictly specified */}
      <div className="absolute inset-0 -z-30 overflow-hidden pointer-events-none">
        <video
          src="/1000172565_gwr_video_mvp.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50 filter saturate-[1.05]"
        />
        {/* Soft light diffusion layer over video to match reference image tone */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70 backdrop-blur-[2px]" />
      </div>

      {/* -------------------- ABSTRACT 3D LUMINOUS SHAPES & LIGHT CURVES (MATCHING REFERENCE) -------------------- */}
      <div className="absolute inset-0 -z-20 pointer-events-none overflow-hidden">
        {/* Soft warm light streak curve in center-left */}
        <div 
          className="absolute top-1/4 left-1/3 w-[550px] h-[550px] rounded-full bg-amber-300/18 blur-[110px] transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`
          }}
        />

        {/* Soft pale blue 3D curve on right */}
        <div 
          className="absolute top-10 right-0 w-[620px] h-[620px] rounded-full bg-blue-300/22 blur-[130px] transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${-mousePos.x * 0.7}px, ${-mousePos.y * 0.7}px)`
          }}
        />

        {/* Soft pale violet light reflection */}
        <div 
          className="absolute bottom-1/4 left-10 w-[500px] h-[500px] rounded-full bg-indigo-200/25 blur-[120px] transition-transform duration-700 ease-out"
          style={{
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
          }}
        />

        {/* Pure white highlight ribbons */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-white/70 blur-[90px] rounded-full" />
      </div>

      {/* -------------------- MAIN CONTENT WRAPPER -------------------- */}
      <div className="max-w-6xl mx-auto relative z-10 space-y-10 sm:space-y-12">
        
        {/* Top bar with Navigation & User Session Indicator */}
        <div className="flex items-center justify-between pt-2 px-2">
          <button
            onClick={() => setView('home')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-slate-700 text-xs font-mono font-bold tracking-wider uppercase border border-white/80 shadow-sm transition-all cursor-pointer backdrop-blur-md"
          >
            &larr; Back to Home
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-mono font-medium flex items-center gap-1.5 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>{currentUser.name}</span>
              </span>
              <button
                onClick={() => {
                  logoutUser();
                  setCurrentUser(null);
                }}
                className="text-[11px] font-mono text-slate-500 hover:text-rose-600 underline cursor-pointer"
                title="Switch User / Log Out"
              >
                Switch
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setPendingAppToLaunch(null);
                setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-mono font-bold tracking-wider uppercase border border-white shadow-sm transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
            >
              <Sparkles size={13} className="text-pink-500" />
              <span>Register / Login</span>
            </button>
          )}
        </div>

        {/* -------------------- TOP HEADING (EXACT REFERENCE TYPOGRAPHY) -------------------- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center pt-2 sm:pt-4 space-y-3"
        >
          <h1 className="font-sora font-semibold text-3xl sm:text-5xl md:text-6xl text-[#2b2d38] tracking-tight leading-none">
            Rexlifys All Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans font-normal max-w-xl mx-auto leading-relaxed">
            Autonomous AI co-pilots, distributed platforms, and connected digital experiences engineered by Rexlify.
          </p>
        </motion.div>

        {/* -------------------- SEARCH BAR (ROUNDED PILL GLASS DESIGN) -------------------- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="max-w-xl mx-auto px-4"
        >
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for applications..."
              id="rexlify-all-apps-search-input"
              aria-label="Search for applications"
              className="w-full h-12 sm:h-14 pl-6 pr-14 rounded-full bg-white/75 backdrop-blur-xl border border-white/90 shadow-[0_4px_24px_rgba(30,40,60,0.06),0_1px_3px_rgba(0,0,0,0.02)] text-slate-800 placeholder:text-slate-400 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-slate-300/70 focus:bg-white/90 transition-all duration-200"
            />
            
            {/* Search Icon & Clear Button */}
            <div className="absolute right-4 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search query"
                >
                  <X size={16} />
                </button>
              )}
              <div className="p-1.5 text-slate-400 pointer-events-none">
                <Search size={18} className="stroke-[2]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* -------------------- 3-COLUMN APPLICATION CARDS GRID (EXACT REFERENCE COMPOSITION) -------------------- */}
        <div className="pt-2">
          {visibleApplications.length === 0 ? (
            /* Clean Empty State */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto py-16 px-6 text-center rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white/80 shadow-lg space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search size={24} />
              </div>
              <h2 className="font-sora text-lg font-bold text-slate-700">No applications found</h2>
              <p className="text-xs text-slate-500 font-sans">
                No published ecosystem applications matched "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold font-sans tracking-wide transition-colors cursor-pointer"
              >
                Clear Search Filter
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8"
            >
              {visibleApplications.map((app, index) => {
                const shades = getStripShades(app.accentColor, index);
                const displayNum = app.displayOrder || (index + 1);

                return (
                  <motion.div
                    key={app.id}
                    variants={{
                      hidden: { opacity: 0, y: 25 },
                      visible: { 
                        opacity: 1, 
                        y: 0,
                        transition: { duration: 0.45, ease: "easeOut" }
                      }
                    }}
                    whileHover={{ 
                      y: -6, 
                      transition: { duration: 0.22, ease: "easeOut" } 
                    }}
                    onClick={() => handleLaunchApp(app)}
                    className="group relative flex flex-row rounded-[2rem] bg-white/75 hover:bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_12px_36px_rgba(30,40,60,0.06),0_2px_8px_rgba(30,40,60,0.02)] hover:shadow-[0_22px_48px_rgba(30,40,60,0.12),0_4px_14px_rgba(30,40,60,0.04)] transition-all duration-300 cursor-pointer overflow-hidden min-h-[220px]"
                    title={`Click to open ${app.name}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleLaunchApp(app);
                      }
                    }}
                  >
                    {/* LEFT CONTENT AREA */}
                    <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between text-left">
                      <div>
                        {/* Upper Icon Container (Circular outline matching reference) */}
                        <div className="w-12 h-12 rounded-full border border-slate-300/80 bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-slate-400 transition-transform duration-300">
                          {renderCardIcon(app)}
                        </div>

                        {/* Application Name (Dark charcoal uppercase typography) */}
                        <h2 className="font-sora font-bold text-sm sm:text-base text-slate-800 uppercase tracking-wide mt-4 truncate">
                          {app.name}
                        </h2>

                        {/* Subtle Divider Line (Thin line under the name matching reference) */}
                        <div className="border-b border-slate-200/80 my-2.5 w-full" />

                        {/* Short Description */}
                        <p className="text-xs leading-relaxed text-slate-600 font-sans font-normal line-clamp-4 min-h-[4rem]">
                          {app.shortDescription || app.fullDescription}
                        </p>
                      </div>

                      {/* Launch Indicator Action */}
                      <div className="pt-3 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-slate-800 transition-colors">
                        <span className="flex items-center gap-1">
                          <span>Launch Application</span>
                        </span>
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          style={{ color: shades.base }}
                        >
                          <ArrowUpRight size={14} className="stroke-[2.5]" />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT VERTICAL ACCENT STRIP (EXACT REFERENCE 2-TONE COLOR BLOCK WITH NUMBER) */}
                    <div 
                      className="w-14 sm:w-16 flex flex-col shrink-0 rounded-r-[2rem] overflow-hidden"
                      style={{ backgroundColor: shades.base }}
                    >
                      {/* Upper Section: Number block with slightly deeper shade */}
                      <div 
                        className="h-14 flex items-center justify-center text-white font-sans font-bold text-lg select-none shadow-sm"
                        style={{ backgroundColor: shades.dark }}
                      >
                        {displayNum}
                      </div>

                      {/* Lower Section: Solid vibrant accent tone with subtle glass shine */}
                      <div className="flex-1 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* -------------------- BOTTOM SUMMARY / ARCHITECTURE FOOTNOTE -------------------- */}
        <div className="pt-6 pb-12 text-center space-y-2 border-t border-slate-200/60">
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Rexlify Sovereign Technology Ecosystem &bull; Real-Time Connected Hub
          </p>
          <p className="text-xs text-slate-500 font-sans font-light">
            Dynamic application manifests securely managed and synchronized via Central Admin Control.
          </p>
        </div>

      </div>

      {/* -------------------- REXLIFY REGISTRATION & LOGIN MODAL (REFERENCE-MATCHED) -------------------- */}
      <RexlifyAuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAppToLaunch(null);
        }}
        targetFeatureName={pendingAppToLaunch?.name}
        onSuccess={(user) => {
          setCurrentUser(user);
          if (pendingAppToLaunch) {
            executeLaunch(pendingAppToLaunch);
            setPendingAppToLaunch(null);
          }
        }}
      />
    </div>
  );
};
