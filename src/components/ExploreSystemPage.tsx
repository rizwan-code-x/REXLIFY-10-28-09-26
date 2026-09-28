/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Cpu, Radio, Shield, Layers, Code, Play, ExternalLink, 
  ArrowRight, Compass, UserCheck, Terminal, CheckCircle2, Award, Globe, ArrowLeft
} from 'lucide-react';
import { ActiveView } from './Navbar';
import { motion } from 'motion/react';
import { RexlifyLogo } from './Logo';
import { VideoBackground } from './VideoBackground';

interface ExploreSystemPageProps {
  setView: (view: ActiveView) => void;
}

export const ExploreSystemPage: React.FC<ExploreSystemPageProps> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'neurax' | 'rodp'>('all');

  // Requirement 4: Intersection Observer Auto-Play / Auto-Pause on Scroll
  useEffect(() => {
    const videoContainers = document.querySelectorAll('.smart-video-frame');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const iframe = entry.target.querySelector('iframe');
        if (!iframe || !iframe.contentWindow) return;
        
        try {
          if (entry.isIntersecting) {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } else {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          }
        } catch (_) {}
      });
    }, { threshold: 0.5 });

    videoContainers.forEach(el => observer.observe(el));

    return () => {
      videoContainers.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060411] text-white selection:bg-cyan-500 selection:text-black w-full overflow-x-hidden relative">
      
      {/* -------------------- 1. FLOATING UNIVERSAL BACK BUTTON -------------------- */}
      <div className="fixed top-5 left-5 z-[9999]">
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              setView('home');
            }
          }}
          className="flex items-center gap-2 bg-[#0f172a]/80 backdrop-blur-md border border-cyan-400/40 text-cyan-400 px-4 py-2 rounded-full font-mono text-xs font-bold hover:bg-cyan-500/20 hover:border-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,210,255,0.3)]"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* -------------------- HERO SECTION (100% EDGE-TO-EDGE FULLSCREEN VIDEO) -------------------- */}
      <section className="relative w-full min-h-[95vh] flex flex-col justify-between overflow-hidden border-b border-cyan-500/20">
        
        {/* Reusable Video Background with Glassmorphic Cyber Overlay */}
        <VideoBackground 
          src="https://www.youtube-nocookie.com/embed/BkR-RwmqLPY"
          overlayTheme="cyber"
          opacity={0.4}
          scale={1.38}
          saturation={150}
          contrast={125}
          showTechGrid={true}
          showAudioToggle={true}
          className="absolute inset-0 w-full h-full"
        />

        {/* Top Floating Badge Bar */}
        <div className="pt-8 px-6 sm:px-12 flex flex-wrap justify-between items-center gap-4 z-10 max-w-7xl mx-auto w-full pl-16 sm:pl-12">
          <div className="flex items-center gap-4">
            <RexlifyLogo size={36} />
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2.5 bg-black/70 border border-cyan-500/30 px-3.5 py-1.5 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Radio className="text-cyan-400 animate-pulse" size={18} />
              <span className="font-mono text-xs font-extrabold tracking-widest text-cyan-300 uppercase">
                REXLIFY ECOSYSTEM CORE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('institute')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold font-mono transition-all cursor-pointer shadow-md"
            >
              🎓 Rexlify Institute
            </button>
            <button
              onClick={() => setView('faculty')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-bold font-mono transition-all cursor-pointer shadow-md"
            >
              <span>Teach</span>
              <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                Hiring Active
              </span>
            </button>
          </div>
        </div>

        {/* Center Headline & Subtitle */}
        <div className="max-w-5xl mx-auto px-6 py-16 text-center my-auto z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 font-mono text-xs font-semibold uppercase tracking-wider shadow-inner"
          >
            <Sparkles size={14} className="text-cyan-400 animate-spin" />
            <span>INTEGRATED SYSTEM ARCHITECTURE</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-sora text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            THE REXLIFY ECOSYSTEM — <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-rose-400">
              ENGINEERED FOR THE FUTURE
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-200 text-sm sm:text-lg max-w-3xl mx-auto font-light leading-relaxed drop-shadow"
          >
            An integrated universe of intelligent applications, developer tools, and cutting-edge software solutions designed to transform enterprise workflows and personal computing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => {
                const el = document.getElementById('system-showcase');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-sora font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <Play size={16} />
              <span>WATCH SYSTEM DEMO</span>
            </button>

            <button
              onClick={() => setView('applications')}
              className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass size={16} />
              <span>EXPLORE ALL APPS</span>
            </button>
          </motion.div>
        </div>

        {/* Bottom Metric Strip */}
        <div className="pb-8 px-6 max-w-6xl mx-auto w-full z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md text-center">
            <div>
              <span className="block font-sora font-extrabold text-xl text-cyan-400">02</span>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Published Apps</span>
            </div>
            <div>
              <span className="block font-sora font-extrabold text-xl text-purple-400">03</span>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Ecosystem Logs</span>
            </div>
            <div>
              <span className="block font-sora font-extrabold text-xl text-amber-400">05</span>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Active Modules</span>
            </div>
            <div>
              <span className="block font-sora font-extrabold text-xl text-emerald-400">99.9%</span>
              <span className="text-[10px] text-gray-400 font-mono uppercase">Uptime Reliability</span>
            </div>
          </div>
        </div>

      </section>

      {/* -------------------- 2. SYSTEM OVERVIEW & MISSION STATEMENT -------------------- */}
      <section className="py-20 px-6 max-w-5xl mx-auto space-y-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold uppercase tracking-widest">
          <Terminal size={14} />
          <span>ARCHITECTURAL PHILOSOPHY</span>
        </div>

        <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white">
          Next-Generation Digital Infrastructure
        </h2>

        <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto font-light leading-relaxed">
          Rexlify operates as a unified master ecosystem designed to break barriers across productivity, artificial intelligence, and real-time computing. Every architecture we build is optimized for performance, scalability, and seamless user interaction.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h3 className="font-sora font-bold text-sm text-white">Neural Intelligence</h3>
            <p className="text-gray-400 text-xs leading-relaxed">Integrated multi-modal LLM reasoning pipelines driving NeuraX, Noorax, and Sifra AI.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <h3 className="font-sora font-bold text-sm text-white">Zero-Trust Protocol</h3>
            <p className="text-gray-400 text-xs leading-relaxed">Encrypted data channels, low-latency streaming, and robust remote operation protocols.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/30 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h3 className="font-sora font-bold text-sm text-white">Hybrid Education</h3>
            <p className="text-gray-400 text-xs leading-relaxed">Practical tech mastery through Rexlify Institute and 24/7 AI-driven mentorship.</p>
          </div>
        </div>
      </section>

      {/* -------------------- 3. ECOSYSTEM SHOWCASE (ALL APPLICATIONS INTRO VIDEO) -------------------- */}
      <section id="system-showcase" className="py-16 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-extrabold">
            SYSTEM-WIDE OVERVIEW
          </span>
          <h2 className="font-sora text-3xl font-bold text-white">
            Ecosystem Showcase: All Applications in Action
          </h2>
          <p className="text-gray-400 text-xs max-w-xl mx-auto">
            Experience how our neural applications, remote display protocols, and developer interfaces operate together.
          </p>
        </div>

        {/* Smart Video Frame with Auto-play on Scroll */}
        <div className="smart-video-frame relative rounded-3xl overflow-hidden border border-purple-500/30 bg-[#09061a] shadow-[0_0_50px_rgba(168,85,247,0.2)]">
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/80 border border-purple-500/40 backdrop-blur-md pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-xs font-extrabold text-purple-300 tracking-wider">
              FULL APPLICATIONS CINEMATIC DEMO
            </span>
          </div>

          <div className="aspect-video w-full relative">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/-ij4m7IcdDM?enablejsapi=1&autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1" 
              title="Rexlify All Applications Intro Video" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </section>

      {/* -------------------- 4. PRODUCT SHOWCASE GRID (NEURAX & RODP) -------------------- */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-extrabold">
            FEATURED SYSTEM MODULES
          </span>
          <h2 className="font-sora text-3xl font-bold text-white">
            Deep-Dive Application Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* App 1: NeuraX AI Assistant */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e0a26] to-[#070417] border border-cyan-500/30 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  NEURAL AI ASSISTANT
                </span>
                <span className="text-gray-400 font-mono text-xs">v2.4 Core</span>
              </div>

              <h3 className="font-sora text-2xl font-bold text-white">
                NeuraX AI Assistant
              </h3>

              <p className="text-gray-300 text-xs leading-relaxed font-light">
                An advanced multi-modal AI personal assistant powered by next-gen neural models. Capable of real-time reasoning, voice execution, automated workflow management, and context-aware intelligence.
              </p>

              {/* Video Embed Smart Frame */}
              <div className="smart-video-frame aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                <iframe 
                  src="https://www.youtube-nocookie.com/embed/7zJpNpUh94Q?enablejsapi=1&autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1" 
                  title="NeuraX AI Assistant Demo Video" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full border-none"
                />
              </div>
            </div>

            <button
              onClick={() => setView('neurax-detail' as any)}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>EXPLORE NEURAX PROGRESS & MILESTONES</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* App 2: RODP */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#180924] to-[#0d041a] border border-purple-500/30 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                  REMOTE PROTOCOL
                </span>
                <span className="text-gray-400 font-mono text-xs">RODP v1.0</span>
              </div>

              <h3 className="font-sora text-2xl font-bold text-white">
                RODP (Remote Operations / Display Protocol)
              </h3>

              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Ultra-low-latency remote protocol built for secure enterprise remote operations, cloud-to-device streaming, and cross-platform machine management.
              </p>

              {/* Video Embed Smart Frame */}
              <div className="smart-video-frame aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                <iframe 
                  src="https://www.youtube-nocookie.com/embed/7z_MsofcKH4?enablejsapi=1&autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1" 
                  title="RODP Remote Operations Demo Video" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full border-none"
                />
              </div>
            </div>

            <button
              onClick={() => setView('applications')}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>VIEW ECOSYSTEM CATALOG</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* -------------------- 5. LEAD DEVELOPER PROFILE & ARCHITECTURAL VISION -------------------- */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0c0926] via-[#10082b] to-[#081023] border border-white/10 space-y-8 shadow-2xl">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-extrabold">
              CREATOR & LEAD ARCHITECT DOSSIER
            </span>
            <h2 className="font-sora text-3xl font-bold text-white">
              Lead Developer Profile & Vision
            </h2>
            <p className="text-gray-300 text-xs max-w-2xl mx-auto font-light leading-relaxed">
              Behind the Rexlify ecosystem is a dedicated focus on full-stack software development, AI model orchestration, low-latency streaming protocols, and accessible technical education.
            </p>
          </div>

          {/* Developer Video Smart Frame */}
          <div className="smart-video-frame aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-amber-500/30 bg-black relative shadow-xl">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/qbPxlLqwsFI?enablejsapi=1&autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1" 
              title="Lead Developer Profile & Architectural Vision Video" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center sm:text-left">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="font-mono text-xs font-bold text-amber-400">CORE FOCUS</span>
              <h4 className="font-sora font-bold text-white text-sm">Full-Stack & Neural Systems</h4>
              <p className="text-gray-400 text-xs">TypeScript, React, Node.js, Python, and Gemini LLM integrations.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="font-mono text-xs font-bold text-amber-400">PHILOSOPHY</span>
              <h4 className="font-sora font-bold text-white text-sm">Building Production Value</h4>
              <p className="text-gray-400 text-xs">Prioritizing practical, zero-fluff software over theoretical demos.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
              <span className="font-mono text-xs font-bold text-amber-400">MISSION</span>
              <h4 className="font-sora font-bold text-white text-sm">Rexlify Institute Mentorship</h4>
              <p className="text-gray-400 text-xs">Empowering new engineers through hands-on hybrid workshops.</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 6. BRAND VISION & OUTRO ADVERTISEMENT -------------------- */}
      <section className="py-20 px-6 max-w-5xl mx-auto space-y-10 text-center">
        <div className="space-y-3">
          <span className="font-mono text-xs text-pink-400 uppercase tracking-widest font-extrabold">
            THE NEXT HORIZON
          </span>
          <h2 className="font-sora text-3xl sm:text-4xl font-extrabold text-white">
            Brand Vision & Future Ecosystem Roadmap
          </h2>
        </div>

        {/* Brand Finale Video Smart Frame */}
        <div className="smart-video-frame aspect-video w-full rounded-3xl overflow-hidden border border-pink-500/30 bg-black relative shadow-[0_0_50px_rgba(236,72,153,0.2)]">
          <iframe 
            src="https://www.youtube-nocookie.com/embed/WRfeoZPZP_A?enablejsapi=1&autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1" 
            title="Brand Vision & Outro Advertisement Video" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-full border-none"
          />
        </div>

        <div className="pt-6">
          <button
            onClick={() => setView('home')}
            className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-400 hover:to-pink-500 text-white font-sora font-extrabold text-sm uppercase tracking-wider shadow-2xl hover:scale-105 transition-all cursor-pointer"
          >
            EXPERIENCE THE POWER OF REXLIFY
          </button>
        </div>
      </section>

    </div>
  );
};
