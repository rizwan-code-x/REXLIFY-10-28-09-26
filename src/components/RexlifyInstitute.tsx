/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GraduationCap, Award, BookOpen, Users, MessageSquare, CheckCircle2, 
  Sparkles, Code, FileText, Calendar, ChevronRight, Briefcase, 
  Bot, Clock, Layers, ShieldCheck, Check, X, AlertCircle, Mail, Upload, ArrowLeft, Heart, Globe2
} from 'lucide-react';
import { ActiveView } from './Navbar';
import { motion, AnimatePresence } from 'motion/react';
import { RexlifyLogo } from './Logo';
import { VideoBackground } from './VideoBackground';

interface RexlifyInstituteProps {
  setView: (view: ActiveView) => void;
}

export const RexlifyInstitute: React.FC<RexlifyInstituteProps> = ({ setView }) => {
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');

  const handleCourseClick = (courseTitle: string) => {
    setSelectedCourseTitle(courseTitle);
    setShowNoticeModal(true);
  };

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

      {/* -------------------- 100% FULLSCREEN INTRO VIDEO HERO -------------------- */}
      <section className="relative min-h-[95vh] w-full flex flex-col justify-between overflow-hidden border-b border-purple-500/20">
        
        {/* Reusable Video Background with Glassmorphic Gradient Overlay */}
        <VideoBackground
          src="https://www.youtube-nocookie.com/embed/Ap-QD717rjE"
          overlayTheme="institute"
          opacity={0.38}
          scale={1.38}
          saturation={150}
          contrast={125}
          showTechGrid={true}
          showAudioToggle={true}
          className="absolute inset-0 w-full h-full"
        />

        {/* Top Header with Hiring Active Badge */}
        <div className="pt-8 px-6 sm:px-12 flex flex-wrap justify-between items-center gap-4 z-10 max-w-7xl mx-auto w-full pl-16 sm:pl-12">
          <div className="flex items-center gap-4">
            <RexlifyLogo size={36} />
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2 bg-black/70 border border-cyan-500/30 px-3.5 py-1.5 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <GraduationCap className="text-cyan-400 animate-pulse" size={18} />
              <span className="font-mono text-xs font-extrabold tracking-widest text-cyan-300 uppercase">
                REXLIFY INSTITUTE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('institute-intro')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold font-mono transition-all cursor-pointer shadow-lg active:scale-95"
              title="View Official Institute Intro Page"
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span>OFFICIAL INTRO</span>
            </button>

            <button
              onClick={() => setView('faculty')}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-bold font-mono transition-all cursor-pointer shadow-lg"
            >
              <Briefcase size={14} />
              <span className="hidden sm:inline">JOIN FACULTY TEAM</span>
              <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ml-1 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse">
                HIRING ACTIVE
              </span>
            </button>
          </div>
        </div>

        {/* Center Hero Overlay Content */}
        <div className="max-w-5xl mx-auto px-6 py-12 text-center my-auto z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 font-mono text-xs font-semibold uppercase tracking-wider shadow-inner"
          >
            <Sparkles size={14} className="text-cyan-400 animate-spin" />
            <span>PRACTICAL ENGINEERING EDUCATION</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sora text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
          >
            WELCOME TO REXLIFY INSTITUTE: <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
              ELEVATE YOUR TECH CAREER
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-200 text-sm sm:text-lg max-w-3xl mx-auto font-light leading-relaxed drop-shadow"
          >
            <strong className="text-cyan-300 font-semibold">LEARN BY DOING.</strong> Our mission is to provide industry-relevant technical education through immersive, practical, and hybrid learning experiences, empowering you to build the technology of tomorrow.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => setView('institute-portal')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-sora font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-300/50 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={20} />
              <span>Join Our Rexlify Institute</span>
            </button>
            <button
              onClick={() => {      
                const el = document.getElementById('core-programs');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 font-sora font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <BookOpen size={18} />
              <span>EXPLORE ALL PROGRAMS</span>
            </button>
            <button
              onClick={() => setView('faculty')}
              className="px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Users size={16} />
              <span>TEACH AT REXLIFY</span>
              <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                Active
              </span>
            </button>
          </motion.div>
        </div>

        {/* Lower Third Floating Info Bar */}
        <div className="pb-8 px-6 max-w-6xl mx-auto w-full z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md text-center sm:text-left">
            <div className="flex items-center gap-3 px-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold font-sora text-white">1-Month Hybrid Rhythm</span>
                <span className="text-[11px] text-gray-400">5 Days Online + Offline Workshops</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 sm:border-x border-white/10">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold font-sora text-white">24/7 AI Agent NeuraX</span>
                <span className="text-[11px] text-gray-400">Continuous Code & Project Guidance</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Award size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold font-sora text-white">Official Certification</span>
                <span className="text-[11px] text-gray-400">Mastery & Participation Credentials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 2. FREE TECH EDUCATION MISSION (FOUNDER & CEO DREAM PROJECT) -------------------- */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black border-2 border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.2)] space-y-8 overflow-hidden">
          
          <div className="flex items-center gap-3 border-b border-cyan-500/30 pb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
              <Heart size={26} />
            </div>
            <div>
              <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-extrabold block">
                FOUNDER & CEO SOCIAL EMPOWERMENT INITIATIVE
              </span>
              <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-white">
                Democratizing Tech Education — Free Empowerment for Underprivileged Youth
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Core Vision */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-sora font-bold text-base">
                <Globe2 size={18} />
                <span>The Core Vision</span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Education is not a privilege—it is a fundamental right. Rexlify Institute is deeply pledged to providing <strong className="text-cyan-300 font-semibold">100% free high-quality technical education</strong> for underprivileged, talented youth across India who cannot afford modern tech and coding courses due to financial constraints.
              </p>
            </div>

            {/* Founding Principle */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-sora font-bold text-base">
                <Sparkles size={18} />
                <span>Founding Principle</span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Envisioned directly by our <strong className="text-purple-300 font-semibold">Founder & CEO</strong>, this initiative aims to ignite technological literacy in every underprivileged region so that no brilliant mind or raw talent is lost simply due to lack of financial resources.
              </p>
            </div>

            {/* Curriculum Highlights */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-sora font-bold text-base">
                <CheckCircle2 size={18} />
                <span>Curriculum Highlights</span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Comprehensive practical training in <strong className="text-emerald-300 font-semibold">coding, Artificial Intelligence, and computer literacy</strong>—delivered with zero tuition fees, free online mentorship, and community guidance.
              </p>
            </div>

          </div>

          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono">
              🤝 Want to sponsor or collaborate with our Free Tech Education Mission?
            </span>
            <a 
              href="mailto:rexlifyofficialsupportteam@gmail.com?subject=Free%20Tech%20Education%20Initiative%20Inquiry"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Contact Founding Desk
            </a>
          </div>

        </div>
      </section>

      {/* -------------------- 3. PROGRAM OVERVIEW & CORE FEATURES -------------------- */}
      <section id="core-programs" className="py-16 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest font-extrabold flex items-center justify-center gap-2">
            <Layers size={14} />
            <span>PRACTICAL CURRICULUM ARCHITECTURE</span>
          </span>
          <h2 className="font-sora text-3xl sm:text-4xl font-bold text-white">
            OUR CORE PROGRAMS
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Designed for rapid skill acquisition, real-world deployment, and immediate professional applicability.
          </p>
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Course Card 1 */}
          <div className="relative group rounded-3xl p-8 bg-gradient-to-b from-[#0c0924] to-[#070518] border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Code size={28} />
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                1-MONTH HYBRID
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-sora text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                SOFTWARE DEVELOPMENT MASTERY
              </h3>
              <p className="font-mono text-xs text-cyan-400 font-semibold">
                A 1-Month Hybrid Course
              </p>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed font-light">
              From fundamentals to production-ready applications. 5 days online, remainder hybrid with offline support, hands-on repository commits, and practical deployment drills.
            </p>

            <ul className="space-y-2.5 pt-2">
              {[
                'Days 1-5: Online Fundamentals & Architecture',
                'Days 6-19: Hybrid Collaborative Workshops & Code Sprints',
                'Day 20: Mid-Way Practical Skill Assessment',
                'Days 21-30: Advanced Portfolio App Build',
                'Days 30-31: Final Comprehensive Evaluation'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <span className="font-mono text-xs text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle size={14} /> Admissions Opening Soon
              </span>
              <button
                onClick={() => handleCourseClick('Software Development Mastery')}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-sora font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                <span>JOIN NOW</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Course Card 2 */}
          <div className="relative group rounded-3xl p-8 bg-gradient-to-b from-[#180924] to-[#0f051a] border border-purple-500/30 hover:border-purple-400/60 transition-all shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Bot size={28} />
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                1-MONTH HYBRID
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-sora text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                AI ASSISTANT DEVELOPMENT
              </h3>
              <p className="font-mono text-xs text-purple-400 font-semibold">
                A 1-Month Hybrid Course
              </p>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed font-light">
              Build real-world AI applications using cutting-edge technologies and APIs like Google Gemini, multi-modal vision models, vector retrieval, and autonomous agent loops.
            </p>

            <ul className="space-y-2.5 pt-2">
              {[
                'Days 1-5: LLM Foundations & Gemini API Mastery',
                'Days 6-19: Building Custom Agentic Workflows & NeuraX',
                'Day 20: Mid-Way AI Prototype Evaluation',
                'Days 21-30: Full-Stack AI Product Deployment',
                'Days 30-31: Practical Jury Examination'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <span className="font-mono text-xs text-amber-400 font-semibold flex items-center gap-1">
                <AlertCircle size={14} /> Admissions Opening Soon
              </span>
              <button
                onClick={() => handleCourseClick('AI Assistant Development')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sora font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                <span>JOIN NOW</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>

        {/* WHAT MAKES US DIFFERENT Section */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-purple-950/30 via-black to-cyan-950/30 border border-white/10 space-y-10">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-extrabold">
              EDUCATIONAL ADVANTAGE
            </span>
            <h3 className="font-sora text-2xl sm:text-3xl font-bold text-white">
              WHAT MAKES US DIFFERENT
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Code size={22} />
              </div>
              <h4 className="font-sora font-bold text-sm text-white">PRACTICAL CURRICULUM</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-light">Hands-on projects, production repository commits, and real-world software architecture.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Users size={22} />
              </div>
              <h4 className="font-sora font-bold text-sm text-white">HYBRID FLEXIBILITY</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-light">A combination of online learning and collaborative offline support for optimal pacing.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Bot size={22} />
              </div>
              <h4 className="font-sora font-bold text-sm text-white">AI-POWERED ASSISTANCE</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-light">Dedicated AI agent NeuraX for continuous, 24/7 learning and instant code guidance.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award size={22} />
              </div>
              <h4 className="font-sora font-bold text-sm text-white">INDUSTRY CERTIFICATION</h4>
              <p className="text-gray-400 text-xs leading-relaxed font-light">Validate your skills with project-verified mastery and participation credentials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- 4. DETAILED LEARNING JOURNEY -------------------- */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-extrabold">
            THE 30-DAY MILESTONE ROADMAP
          </span>
          <h2 className="font-sora text-3xl sm:text-4xl font-bold text-white">
            YOUR LEARNING JOURNEY
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            A structured, step-by-step progression designed to transform beginners and intermediate learners into confident tech practitioners.
          </p>
        </div>

        {/* Timeline Steps Graphic */}
        <div className="relative space-y-8 before:absolute before:inset-0 before:left-6 sm:before:left-1/2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-emerald-500">
          {[
            {
              step: 'Step 1',
              title: 'ONLINE FOUNDATION (Days 1-5)',
              desc: 'Live virtual classes to establish core concepts, environment setup, syntax, and foundational engineering theory.',
              color: 'cyan'
            },
            {
              step: 'Step 2',
              title: 'HYBRID & PRACTICAL WORK (Days 6-19)',
              desc: 'Transition to WhatsApp collaboration groups, daily coding assignments, peer reviews, and offline workshop support.',
              color: 'purple'
            },
            {
              step: 'Step 3',
              title: 'MID-WAY ASSESSMENT (Day 20)',
              desc: 'A practical skills test and peer-review of ongoing projects to measure progress, identify gaps, and recalibrate.',
              color: 'amber'
            },
            {
              step: 'Step 4',
              title: 'ADVANCED LEARNING & PORTFOLIO DEVELOPMENT (Days 21-30)',
              desc: 'Deep dive into complex topics, full-stack API integration, and constructing a production-grade portfolio application.',
              color: 'pink'
            },
            {
              step: 'Step 5',
              title: 'FINAL EXAMINATION (Days 30-31)',
              desc: 'Comprehensive written and practical evaluation to validate your entire learning experience and issue official certificates.',
              color: 'emerald'
            }
          ].map((item, idx) => (
            <div key={idx} className={`relative flex flex-col sm:flex-row items-center gap-6 ${idx % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
              <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#060411] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] z-10">
                {idx + 1}
              </div>

              <div className="w-full sm:w-1/2 pl-14 sm:pl-0 sm:px-8">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all space-y-2">
                  <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                    {item.step}
                  </span>
                  <h4 className="font-sora text-lg font-bold text-white">
                    {item.title}
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-1/2" />
            </div>
          ))}
        </div>
      </section>

      {/* -------------------- 5. WHATSAPP INTEGRATION & SUPPORT -------------------- */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-extrabold">
            HYBRID ECOSYSTEM ASSISTANCE
          </span>
          <h2 className="font-sora text-3xl font-bold text-white">
            SEAMLESS SUPPORT & COMMUNITY
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-950/20 to-black border border-emerald-500/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 w-fit">
                <MessageSquare size={28} />
              </div>
              <h3 className="font-sora text-2xl font-bold text-white">
                WHATSAPP COLLABORATION GROUP
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Join a dedicated community of peers and instructors. Receive daily updates, share code, ask questions, and collaborate on assignments. Get instant notifications about class schedules and deadlines.
              </p>
            </div>

            <button
              onClick={() => setShowWhatsappModal(true)}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              <span>STUDENT GROUP INFO</span>
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-cyan-950/20 to-black border border-cyan-500/30 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
                <Bot size={28} />
              </div>
              <h3 className="font-sora text-2xl font-bold text-white">
                AI ASSISTANT: NeuraX (Optional)
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                Unlock continuous learning with our advanced AI agent, NeuraX. Get instant help with coding, research, project ideas, and practical guidance. Accessible anytime, directly within your course environment and WhatsApp.
              </p>
            </div>

            <button
              onClick={() => setShowAiModal(true)}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Bot size={16} />
              <span>LEARN MORE ABOUT AI SUPPORT</span>
            </button>
          </div>

        </div>
      </section>

      {/* -------------------- 6. CERTIFICATION DETAILS & FINAL CTA -------------------- */}
      <section className="py-16 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="font-mono text-xs text-amber-400 uppercase tracking-widest font-extrabold">
            CREDENTIAL VALIDATION
          </span>
          <h2 className="font-sora text-3xl sm:text-4xl font-bold text-white">
            GET CERTIFIED. ADVANCE YOUR CAREER.
          </h2>
          <p className="text-gray-400 text-sm">
            Our dual-tier certification framework ensures both dedicated participation and practical project mastery are formally recognized.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          <div className="p-8 rounded-3xl bg-gradient-to-b from-amber-950/20 to-black border border-amber-500/30 space-y-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 w-fit">
              <Award size={24} />
            </div>
            <h3 className="font-sora text-xl font-bold text-amber-300">
              CERTIFICATE OF COMPLETION / MASTERY
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed font-light">
              Awarded upon successfully passing the Final Examination and completing all course requirements. It validates your proficiency and project-based knowledge, including practical assessment results.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-950/20 to-black border border-purple-500/30 space-y-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-sora text-xl font-bold text-purple-300">
              CERTIFICATE OF PARTICIPATION
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed font-light">
              Awarded to students who maintain at least 80% attendance in all classes and workshops, recognizing their dedication to learning.
            </p>
          </div>

        </div>

        {/* Final CTA Banner */}
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 text-center space-y-6 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
          <h2 className="font-sora text-2xl sm:text-4xl font-extrabold text-white">
            READY TO BUILD THE TECHNOLOGY OF TOMORROW?
          </h2>
          <p className="text-purple-100 text-sm max-w-2xl mx-auto font-light">
            Our experienced engineering faculty is preparing the updated 2026 hands-on curriculum. Admissions will open shortly!
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleCourseClick('Rexlify Master Tech Cohort')}
              className="px-10 py-5 rounded-2xl bg-white text-black hover:bg-gray-100 font-sora font-extrabold text-sm uppercase tracking-wider shadow-2xl hover:scale-105 transition-all cursor-pointer"
            >
              CHECK ADMISSION STATUS
            </button>
          </div>
        </div>
      </section>

      {/* -------------------- MODALS -------------------- */}

      {/* Official Course Access Notice Modal */}
      <AnimatePresence>
        {showNoticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0c091f] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowNoticeModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <span className="font-mono text-[11px] text-cyan-400 font-bold uppercase tracking-widest block">
                    REXLIFY INSTITUTE ADMISSION NOTICE
                  </span>
                  <h3 className="font-sora text-xl font-bold text-white">
                    {selectedCourseTitle || 'Course Admissions'}
                  </h3>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex justify-end gap-2 border-b border-white/10 pb-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    language === 'en' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('bn')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    language === 'bn' ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  বাংলা
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                {language === 'en' ? (
                  <p className="text-gray-200 text-sm leading-relaxed font-light">
                    "This curriculum is currently being crafted by our experienced engineering faculty. Admissions will open shortly."
                  </p>
                ) : (
                  <p className="text-gray-200 text-sm leading-relaxed font-light">
                    "এই কোর্সটি বর্তমানে আমাদের অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে প্রস্তুত করা হচ্ছে। খুব শীঘ্রই ভর্তি প্রক্রিয়া শুরু হবে।"
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    setShowNoticeModal(false);
                    setView('faculty');
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-black font-sora font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <Briefcase size={16} />
                  <span>TEACH THIS COURSE (HIRING ACTIVE)</span>
                </button>
                <button
                  onClick={() => setShowNoticeModal(false)}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  GOT IT, CLOSE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Modal */}
      <AnimatePresence>
        {showWhatsappModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#091a13] border border-emerald-500/30 rounded-3xl p-6 space-y-4 text-center shadow-2xl relative"
            >
              <button
                onClick={() => setShowWhatsappModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <MessageSquare size={28} />
              </div>

              <h3 className="font-sora text-xl font-bold text-white">Student WhatsApp Group</h3>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                WhatsApp student group access codes will be provided to registered students upon cohort launch.
              </p>

              <button
                onClick={() => setShowWhatsappModal(false)}
                className="w-full py-3 rounded-xl bg-emerald-500 text-black font-sora font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                CLOSE INFO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Assistant NeuraX Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#09141d] border border-cyan-500/30 rounded-3xl p-6 space-y-4 text-center shadow-2xl relative"
            >
              <button
                onClick={() => setShowAiModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
                <Bot size={28} />
              </div>

              <h3 className="font-sora text-xl font-bold text-white">NeuraX AI Mentorship</h3>
              <p className="text-gray-300 text-xs leading-relaxed font-light">
                NeuraX will be integrated into your student dashboard to assist with code debugging, concept explanations, and practical guidance 24/7.
              </p>

              <button
                onClick={() => setShowAiModal(false)}
                className="w-full py-3 rounded-xl bg-cyan-500 text-black font-sora font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                CLOSE INFO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
