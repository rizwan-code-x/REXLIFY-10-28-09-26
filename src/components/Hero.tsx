/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { ArrowRight, Cpu, Sparkles, Send, HardDrive, Layers, Compass, Search, GraduationCap, Briefcase, MonitorPlay } from 'lucide-react';
import { ActiveView } from './Navbar';
import { motion } from 'motion/react';
import { NeuraxLogo, SifraLogo, NooraxLogo } from './Logo';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';
import { Language, TRANSLATIONS } from '../translations';
import { QuickAccessSection } from './QuickAccessSection';
import { ComingSoonModal, ComingSoonProduct } from './ComingSoonModal';
import { APP_LINKS } from '../config/appLinks';

interface HeroProps {
  heroTitle: string;
  heroSubtitle: string;
  setView: (view: ActiveView) => void;
  appsCount: number;
  projectsCount: number;
  updatesCount: number;
  language?: Language;
}

export const Hero: React.FC<HeroProps> = ({ 
  heroTitle, 
  heroSubtitle, 
  setView, 
  appsCount, 
  projectsCount, 
  updatesCount,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const [activeComingSoon, setActiveComingSoon] = useState<ComingSoonProduct | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3);
    const y = (((e.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--hmx', x);
        containerRef.current.style.setProperty('--hmy', y);
      }
    });
  }, []);

  // Products coming soon definition
  const neuraxProduct: ComingSoonProduct = {
    id: 'neurax',
    name: 'NeuraX AI Core',
    tagline: 'Offline Neural Processing Unit & Distributed Edge Intelligence',
    description: 'NeuraX Core brings raw NPU hardware acceleration directly to desktop and embedded mobile devices, providing ultra-low latency, 100% private offline AI operations.',
    expectedRelease: 'Q3 2026',
    statusPercentage: 85,
    category: 'NPU Cognitive Hardware Engine',
    iconType: 'neurax',
    highlights: [
      'Zero latency offline model execution on local GPU/NPU',
      'End-to-end encrypted neural memory state',
      'Seamless synchronization with Rexlify Ecosystem'
    ]
  };

  const nooraxProduct: ComingSoonProduct = {
    id: 'noorax',
    name: 'NoraX AI (Noorax Vision)',
    tagline: 'Multi-Modal Cognitive Vision & Document OCR Engine',
    description: 'NoraX AI provides industrial-grade multi-modal visual recognition, extracting structured diagrams, code, handwriting, and layout semantics in real-time.',
    expectedRelease: 'Q4 2026',
    statusPercentage: 78,
    category: 'Computer Vision & Multi-Modal Intelligence',
    iconType: 'noorax',
    highlights: [
      'Instant OCR and structural layout reconstruction',
      'Real-time UI screenshot to React/Tailwind code converter',
      'High-precision multi-language text & table parser'
    ]
  };

  const rodpProduct: ComingSoonProduct = {
    id: 'rodp',
    name: 'RODP (Remote Operations & Display Protocol)',
    tagline: 'Low-Latency High-Performance Remote Infrastructure Protocol',
    description: 'RODP provides next-generation remote desktop streaming, virtual display orchestration, and real-time GPU frame transmission for Rexlify ecosystem devices.',
    expectedRelease: 'Q4 2026',
    statusPercentage: 70,
    category: 'Remote Operations & Streaming Architecture',
    iconType: 'rodp',
    highlights: [
      'Sub-15ms 4K 60FPS remote screen encoding',
      'Distributed GPU frame buffer virtualization',
      'Zero-Trust secure remote control channel'
    ]
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden min-h-screen w-full flex flex-col justify-center items-center py-20 sm:py-28 select-none"
    >
      {/* Video Background with dark luxury obsidian overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-20 opacity-35 gpu-accelerated pointer-events-none"
      >
        <source src="https://cdn.dribbble.com/userupload/14351043/file/original-e8f92507edede186d6fa91bf0aec6760.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080d]/80 via-[#07080d]/60 to-[#07080d] -z-10" />

      {/* Dynamic Cursor Parallax Gradient Orbs */}
      <div 
        className="absolute top-0 left-1/2 -z-10 h-[550px] w-[550px] rounded-full bg-rose-600/15 blur-[120px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate(calc(-50% + calc(var(--hmx, 0) * 35px)), calc(var(--hmy, 0) * 35px))`
        }}
      />
      <div 
        className="absolute top-20 right-10 -z-10 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate(calc(var(--hmx, 0) * -30px), calc(var(--hmy, 0) * -30px))`
        }}
      />
      <div 
        className="absolute bottom-10 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate(calc(var(--hmx, 0) * 25px), calc(var(--hmy, 0) * 25px))`
        }}
      />

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20 text-center flex flex-col items-center relative z-10">
        
        {/* Main Heading: Enforced Clean White Text with Subtle Soft Pink Glow */}
        <motion.h1 
          id="hero-main-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="hero-main-title max-w-6xl font-sora font-extrabold tracking-tight text-white mb-6 leading-[1.1] select-none text-4xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
        >
          <span className="text-white block" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 0 25px rgba(244,114,182,0.4), 0 0 50px rgba(244,114,182,0.18)' }}>
            {heroTitle}
          </span>
        </motion.h1>

        {/* Subtitle: High-Contrast Clean White Text with Subtle Soft Pink Glow */}
        <motion.p 
          id="hero-subheading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="hero-subtitle-text max-w-5xl font-sans text-lg sm:text-2xl md:text-3xl font-medium text-white leading-relaxed mb-10 drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)] [-webkit-text-stroke:_0.3px_rgba(0,0,0,0.7)]"
        >
          <span className="text-white block" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(244,114,182,0.3)' }}>
            {heroSubtitle}
          </span>
        </motion.p>

        {/* Interactive CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-3.5 w-full sm:w-auto mb-14"
        >
          <button
            onClick={() => {
              try { sessionStorage.setItem('rexlify_user_gesture', 'true'); } catch (_) {}
              setView('explore-system');
            }}
            id="hero-cta-explore-system"
            className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-95 hover:scale-105 active:scale-95 shadow-xl shadow-cyan-900/30 hover:shadow-cyan-700/40 transition-all cursor-pointer"
          >
            <Sparkles size={16} className="text-cyan-300 animate-spin" />
            <span>Explore Our System</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              try { sessionStorage.setItem('rexlify_user_gesture', 'true'); } catch (_) {}
              setView('portfolio');
            }}
            id="hero-cta-explore-matrix"
            className="group flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wider text-gray-200 bg-white/10 hover:bg-white/20 hover:text-white hover:scale-105 transition-all cursor-pointer"
          >
            <Layers size={16} />
            <span>{t.explorePortfolio}</span>
          </button>
          
          <button
            onClick={() => setView('applications')}
            id="hero-cta-services"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide text-gray-200 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all hover:scale-[1.03] backdrop-blur-md cursor-pointer"
          >
            <Compass size={16} className="text-purple-400" />
            <span>{t.exploreApp}</span>
          </button>

          <button
            onClick={() => setView('institute')}
            id="hero-cta-institute"
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wide text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 hover:bg-cyan-500/25 hover:border-cyan-300 hover:text-white transition-all hover:scale-[1.03] shadow-[0_0_20px_rgba(6,182,212,0.25)] cursor-pointer"
          >
            <GraduationCap size={17} className="text-cyan-400 animate-pulse" />
            <span>Rexlify Institute</span>
          </button>

          <button
            onClick={() => setView('faculty')}
            id="hero-cta-faculty"
            className="hidden sm:flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl text-xs font-semibold tracking-wide text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Briefcase size={14} />
            <span>Teach at Rexlify</span>
            <span className="bg-amber-400 text-black text-[9px] px-1 rounded font-bold uppercase ml-1">
              Active
            </span>
          </button>

          <button
            onClick={() => setView('contact')}
            id="hero-cta-contact"
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide text-gray-400 hover:text-purple-300 hover:bg-white/5 transition-all cursor-pointer"
          >
            <Send size={14} />
            <span>{t.contact}</span>
          </button>
        </motion.div>

        {/* Interactive 3D Brand Logo Engine Matrix - 4 Application Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
          className="flex flex-col items-center gap-3 mb-12 w-full"
        >
          <span className="font-mono text-[10px] text-purple-400 uppercase tracking-[0.25em] font-bold leading-none">
            ENGINE BLOCK COGNITIVE PRODUCTS
          </span>
          
          <Interactive3DTiltCard
            maxTilt={8}
            scaleOnHover={1.02}
            glowColor="rgba(168, 85, 247, 0.2)"
            className="w-full max-w-5xl"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-[#060614]/80 border border-white/10 p-4 rounded-3xl backdrop-blur-2xl shadow-2xl">
              
              {/* Card 1: SIFRA AI - Official Application Link */}
              <a 
                href={APP_LINKS.sifra}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 transition-all duration-300 cursor-pointer group shadow-lg shadow-purple-950/20 active:scale-95" 
                title="SIFRA AI - Launch Official Assistant Platform"
              >
                <SifraLogo size={32} />
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">Sifra AI</div>
                  <div className="text-[9px] text-purple-400 font-semibold flex items-center gap-1">
                    <span>Open</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </a>

              {/* Card 2: NeuraX AI - Live Official Web App */}
              <a 
                href={APP_LINKS.neurax}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 transition-all duration-300 cursor-pointer group shadow-lg shadow-amber-950/20 active:scale-95" 
                title="NeuraX Core - Launch Official Web Application"
              >
                <NeuraxLogo size={32} />
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">NeuraX AI</div>
                  <div className="text-[9px] text-amber-400 font-semibold flex items-center gap-1">
                    <span>Open</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </a>

              {/* Card 3: NoorAX AI - Live Official Islamic AI Platform */}
              <a 
                href={APP_LINKS.noorax}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/20 transition-all duration-300 cursor-pointer group shadow-lg shadow-emerald-950/20 active:scale-95" 
                title="NoorAX Vision - Launch Official Islamic AI Platform"
              >
                <NooraxLogo size={32} />
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">NoorAX AI</div>
                  <div className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span>Open</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </a>

              {/* Card 4: ROD Platform (Rizwan Online Dreams Platform - RODP) */}
              <div 
                onClick={() => {
                  setView('rodp');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all duration-300 cursor-pointer group shadow-lg shadow-cyan-950/30 active:scale-95" 
                title="ROD Platform - Launch Rizwan Online Dreams Platform Application"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-sora font-extrabold text-[10px] shrink-0 shadow-md">
                  RODP
                </div>
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">ROD Platform</div>
                  <div className="text-[9px] text-cyan-400 font-semibold flex items-center gap-1">
                    <span>Open App</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </div>

              {/* Card 5: REXLIFY AI - Added right next to ROD Platform as requested */}
              <div 
                onClick={() => setView('rexlify-ai')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-pink-500/10 border border-pink-500/30 hover:border-pink-400 hover:bg-pink-500/20 transition-all duration-300 cursor-pointer group shadow-lg shadow-pink-950/30" 
                title="REXLIFY AI SOFTWARE - Open Multimodal AI Workspace"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white font-sora font-extrabold text-[10px] shrink-0 shadow-md shadow-pink-500/30">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-pink-300 truncate">Rexlify AI</div>
                  <div className="text-[9px] text-pink-400 font-semibold flex items-center gap-1">
                    <span>Open AI</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Rizwan Innovation - Official Application Link */}
              <a 
                href={APP_LINKS.rizwanInnovation}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-950/40 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 transition-all duration-300 cursor-pointer group shadow-lg shadow-purple-950/30 active:scale-95" 
                title="Rizwan Innovation - Launch Official Platform"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-400/40 flex items-center justify-center text-white font-sora font-extrabold text-[10px] shrink-0 shadow-md">
                  RI
                </div>
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">Rizwan Innovation</div>
                  <div className="text-[9px] text-purple-400 font-semibold flex items-center gap-1">
                    <span>Open</span>
                    <span>&rarr;</span>
                  </div>
                </div>
              </a>

            </div>
          </Interactive3DTiltCard>
        </motion.div>

        {/* Live Ecosystem Metrics Banner with Cleaned UI (No blinking dot) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="w-full max-w-5xl"
        >
          <Interactive3DTiltCard
            maxTilt={6}
            scaleOnHover={1.01}
            glowColor="rgba(34, 211, 238, 0.15)"
          >
            <div className="grid grid-cols-3 gap-4 sm:gap-6 py-6 px-4 md:px-8 rounded-3xl border border-white/10 bg-[#040410]/80 backdrop-blur-2xl shadow-2xl relative">
              
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="font-sora font-extrabold text-2xl md:text-4xl text-white leading-none">
                    03
                  </span>
                </div>
                <span className="font-mono text-[9px] md:text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5 text-center">
                  <Cpu size={12} className="text-rose-400 shrink-0" />
                  <span>Published Apps (Rexlify, Sifra &amp; RODP)</span>
                </span>
              </div>

              <div className="flex flex-col items-center border-x border-white/10 px-2">
                <span className="font-sora font-extrabold text-2xl md:text-4xl text-white leading-none mb-2">
                  03
                </span>
                <span className="font-mono text-[9px] md:text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5 text-center">
                  <Sparkles size={12} className="text-amber-400 shrink-0" />
                  <span>Ecosystem Logs</span>
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="font-sora font-extrabold text-2xl md:text-4xl text-white leading-none mb-2">
                  05
                </span>
                <span className="font-mono text-[9px] md:text-xs text-gray-400 uppercase tracking-widest flex items-center gap-1.5 text-center">
                  <HardDrive size={12} className="text-cyan-400 shrink-0" />
                  <span>Active Modules</span>
                </span>
              </div>

            </div>
          </Interactive3DTiltCard>
        </motion.div>

        {/* Quick Access Section Row right below Published Apps */}
        <QuickAccessSection setView={setView} />
      </div>

      {/* Render Coming Soon Pop-up modal when active */}
      <ComingSoonModal
        product={activeComingSoon}
        onClose={() => setActiveComingSoon(null)}
      />
    </div>
  );
};
