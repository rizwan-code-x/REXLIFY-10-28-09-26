/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, Award, BookOpen, Users, Sparkles, 
  ArrowLeft, CheckCircle2, Play, ChevronRight, ShieldCheck, 
  Globe, Briefcase, Rocket, ExternalLink
} from 'lucide-react';
import { RexlifyLogo } from '../Logo';
import { VideoBackground } from '../VideoBackground';
import { ActiveView } from '../Navbar';
import { GoogleWorkspaceDashboard } from './GoogleWorkspaceDashboard';

interface RexlifyInstituteIntroProps {
  setView: (view: ActiveView) => void;
}

export const RexlifyInstituteIntro: React.FC<RexlifyInstituteIntroProps> = ({ setView }) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);

  return (
    <div className="min-h-screen bg-[#05040e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative">
      
      {/* Universal Floating Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setView('institute')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer active:scale-95"
          title="Return to Institute Campus"
        >
          <ArrowLeft size={15} />
          <span>Campus Portal</span>
        </button>
      </div>

      {/* Hero Section with Official Intro Branding */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-8 overflow-hidden border-b border-purple-500/20 pt-16">
        
        {/* Dynamic Video Showcase */}
        <VideoBackground
          src="https://www.youtube-nocookie.com/embed/Ap-QD717rjE"
          overlayTheme="institute"
          opacity={0.35}
          scale={1.35}
          saturation={140}
          contrast={120}
          showTechGrid={true}
          showAudioToggle={true}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-4 shadow-md backdrop-blur-md">
            <Sparkles size={14} className="text-cyan-400 animate-spin" />
            <span>OFFICIAL INTRO & ADMISSION ARCHITECTURE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-indigo-300 uppercase tracking-tight leading-tight">
            Welcome to Rexlify Institute
          </h1>
          
          <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed font-light">
            Empowering the next generation of engineers, autonomous AI architects, and full-stack innovators through masterclasses, hands-on production deployments, and global certification.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setView('institute-portal')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider font-mono shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-300/50 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles size={20} />
              <span>Join Our Rexlify Institute</span>
            </button>

            <button
              onClick={() => setView('institute')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider font-mono shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <GraduationCap size={18} />
              <span>Enter Full Campus</span>
            </button>

            <button
              onClick={() => setView('faculty')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-750 text-xs sm:text-sm font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:scale-95 backdrop-blur-md"
            >
              <Users size={16} />
              <span>Meet Elite Faculty</span>
            </button>
          </div>
        </div>
      </section>

      {/* Google Workspace & Classroom Ecosystem Integration Hub */}
      <GoogleWorkspaceDashboard />

      {/* Core Highlights Grid */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-black uppercase text-white font-mono">
            Why Rexlify Institute
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Structured curriculum blending theoretical rigor with direct industrial software architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0b0c1b]/80 border border-slate-800/80 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-4">
              <Award size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Global Industry Accreditation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every course completion delivers verifiable cryptographic credentials recognized by digital enterprises worldwide.
            </p>
          </div>

          <div className="bg-[#0b0c1b]/80 border border-slate-800/80 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Production-Grade Projects</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students build and deploy real full-stack systems with Firestore, Cloud Run, and high-performance neural vectors.
            </p>
          </div>

          <div className="bg-[#0b0c1b]/80 border border-slate-800/80 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-4">
              <Briefcase size={24} />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Direct Career Placement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Top alumni are fast-tracked into engineering roles across Rexlify Ecosystem and partner tech laboratories.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
