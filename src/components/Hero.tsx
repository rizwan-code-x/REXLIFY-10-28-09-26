/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { ArrowRight, Cpu, Sparkles, Send, HardDrive, Layers, Compass, Search, GraduationCap, Briefcase, BookOpen, MonitorPlay } from 'lucide-react';
import { ActiveView } from './Navbar';
import { motion } from 'motion/react';
import { NeuraxLogo, SifraLogo, NooraxLogo } from './Logo';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';
import { Language, TRANSLATIONS } from '../translations';
import { QuickAccessSection } from './QuickAccessSection';
import { ComingSoonModal, ComingSoonProduct } from './ComingSoonModal';

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
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [activeComingSoon, setActiveComingSoon] = useState<ComingSoonProduct | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMouseOffset({ x, y });
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
        className="absolute inset-0 w-full h-full object-cover -z-20 opacity-40 filter saturate-125"
      >
        <source src="https://cdn.dribbble.com/userupload/14351043/file/original-e8f92507edede186d6fa91bf0aec6760.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080d]/80 via-[#07080d]/60 to-[#07080d] -z-10" />

      {/* Dynamic Cursor Parallax Gradient Orbs */}
      <div 
        className="absolute top-0 left-1/2 -z-10 h-[550px] w-[550px] rounded-full bg-rose-600/15 blur-[140px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(calc(-50% + ${mouseOffset.x * 40}px), ${mouseOffset.y * 40}px)`
        }}
      />
      <div 
        className="absolute top-20 right-10 -z-10 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mouseOffset.x * -35}px, ${mouseOffset.y * -35}px)`
        }}
      />
      <div 
        className="absolute bottom-10 left-10 -z-10 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mouseOffset.x * 30}px, ${mouseOffset.y * 30}px)`
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
            onClick={() => setView('services')}
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
              
              {/* Card 1: Shipra AI / Sifra AI - Links to Live Page */}
              <div 
                onClick={() => {
                  window.open('https://remix-sifra-professional-ai-assistant-465420538053.asia-east1.run.app', '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 transition-all duration-300 cursor-pointer group" 
                title="Shipra AI / Sifra AI - Open Live Assistant"
              >
                <SifraLogo size={32} />
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">Shipra AI</div>
                  <div className="text-[9px] text-purple-400 font-semibold">Live Co-Pilot &rarr;</div>
                </div>
              </div>

              {/* Card 2: NeuraX AI - Triggers Coming Soon Modal */}
              <div 
                onClick={() => setActiveComingSoon(neuraxProduct)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all duration-300 cursor-pointer group" 
                title="NeuraX Core - Coming Soon"
              >
                <NeuraxLogo size={32} />
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-rose-300 truncate">NeuraX AI</div>
                  <div className="text-[9px] text-amber-400 font-semibold">Coming Soon</div>
                </div>
              </div>

              {/* Card 3: NoraX AI / Noorax Vision - Triggers Coming Soon Modal */}
              <div 
                onClick={() => setActiveComingSoon(nooraxProduct)}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-pink-500/5 border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/15 transition-all duration-300 cursor-pointer group" 
                title="Noorax Vision / NoraX AI - Coming Soon"
              >
                <NooraxLogo size={32} />
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-white group-hover:text-pink-300 truncate">NoraX AI</div>
                  <div className="text-[9px] text-amber-400 font-semibold">Coming Soon</div>
                </div>
              </div>

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

              {/* Card 6: Rizwan Innovation (Rizwan Enovation) - Clicking does nothing (no-op) */}
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  // No-op as requested by the user: "ওপেন এ ক্লিক করলে কিছু হবে না"
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300 cursor-default group" 
                title="Rizwan Innovation"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-800 to-indigo-950 border border-purple-500/30 flex items-center justify-center text-purple-300 font-sora font-extrabold text-[10px] shrink-0 shadow-md">
                  RI
                </div>
                <div className="text-left font-mono truncate">
                  <div className="text-xs font-bold text-gray-200 truncate">Rizwan Innovation</div>
                  <div className="text-[9px] text-gray-400 font-semibold flex items-center gap-1">
                    <span>Innovation Lab</span>
                  </div>
                </div>
              </div>

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

        {/* New Quick Access Section Row right below Published Apps */}
        <QuickAccessSection setView={setView} />

        {/* Rexlify Institute Featured Card Section on Homepage - Cleaned Title Badge (No rotating icon) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
          className="w-full max-w-5xl mt-6"
        >
          <div className="relative rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-r from-[#07051a] via-[#0b0826] to-[#061021] shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <GraduationCap size={160} className="text-cyan-400" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">
                  <span>MASTER PRACTICAL TECH SKILLS</span>
                </div>
                <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-white">
                  Rexlify Institute
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed">
                  Join our comprehensive, flexible certificate programs. Gain hands-on experience and real-world expertise through our 1-Month Hybrid Development &amp; AI Assistant tracks.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setView('institute')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-sora font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <BookOpen size={16} />
                  <span>LEARN MORE</span>
                </button>
                <button
                  onClick={() => {
                    setView('institute');
                    setTimeout(() => {
                      const el = document.getElementById('core-programs');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>VIEW COURSES</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Faculty Recruitment Callout Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: "easeOut" }}
          className="w-full max-w-5xl mt-6"
        >
          <div className="rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-r from-[#180e05] via-[#0e0a1b] to-[#120a1c] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="font-sora font-bold text-xs sm:text-sm text-white block">
                  Empower the Next Generation of Tech Leaders — Join the Rexlify Faculty Team
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  Looking for mentors &amp; instructors for our 1-Month Hybrid Development Programs.
                </span>
              </div>
            </div>

            <button
              onClick={() => setView('faculty')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-sora font-bold text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>APPLY AS INSTRUCTOR</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

      </div>

      {/* Render Coming Soon Pop-up modal when active */}
      <ComingSoonModal
        product={activeComingSoon}
        onClose={() => setActiveComingSoon(null)}
      />
    </div>
  );
};
