import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Cpu, 
  Code2, Terminal, Layers, Send, CheckCircle2, ChevronRight, 
  Github, ExternalLink, ArrowDown, Shield, Database, Flame, 
  Zap, Brain, Award, Star, Compass, Clock, Check, MessageSquare
} from 'lucide-react';
import { Application, Project, DocArticle, UserMessage } from '../types';
import { NeuraxLogo, SifraLogo, NooraxLogo, RexlifyLogo } from './Logo';
import { YouTubePipelinePlayer } from './YouTubePipelinePlayer';

interface ModernPortfolioPageProps {
  applications: Application[];
  projects: Project[];
  documents?: DocArticle[];
  setView: (view: any) => void;
  onAddMessage?: (msg: Omit<UserMessage, 'id' | 'date' | 'isImportant' | 'isRead'>) => void;
}

export const ModernPortfolioPage: React.FC<ModernPortfolioPageProps> = ({
  applications,
  projects,
  documents = [],
  setView,
  onAddMessage
}) => {
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>('all');
  const [selectedArch, setSelectedArch] = useState<string>('neurax');

  // Contact Form State
  const [contactIdentifier, setContactIdentifier] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<string>('');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleSkipToOverview = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Contact Submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactIdentifier || !contactEmail || !contactMessage) return;

    if (onAddMessage) {
      onAddMessage({
        sender: contactIdentifier,
        email: contactEmail,
        subject: contactSubject || 'Direct Portfolio Transmission',
        content: contactMessage
      });
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactIdentifier('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 4000);
  };

  // Technical Skills Data
  const technicalSkills = [
    { name: 'Python', category: 'languages', level: 'Advanced / Core', icon: '🐍', desc: 'Neural architectures, backend AI runtimes, SLM optimization, FastAPI & Python automation.' },
    { name: 'JavaScript / TypeScript', category: 'languages', level: 'Advanced', icon: '⚡', desc: 'Modern React, Vite, Node.js, high-performance state engines, full-stack microservices.' },
    { name: 'HTML5 & Modern CSS', category: 'languages', level: 'Expert', icon: '🎨', desc: 'Tailwind CSS, responsive layouts, motion physics, glassmorphic UI, accessible design systems.' },
    { name: 'OpenAI API', category: 'ai-apis', level: 'Production Core', icon: '🤖', desc: 'Autonomous agentic copilots, structured function calling, embeddings & vector search.' },
    { name: 'Gemini API', category: 'ai-apis', level: 'Production Core', icon: '✨', desc: 'Multimodal vision, spatial OCR analysis, low-latency live streaming & reasoning.' },
    { name: 'Google AI Studio', category: 'ai-apis', level: 'Mastery', icon: '🧠', desc: 'Prompt orchestration, model tuning, multimodal evaluation & production deployments.' },
    { name: 'Firebase & Firestore', category: 'cloud-db', level: 'Full-Stack', icon: '🔥', desc: 'Realtime database synchronization, security rules, Cloud Functions, and Firebase Auth.' },
    { name: 'Supabase', category: 'cloud-db', level: 'Full-Stack', icon: '⚡', desc: 'PostgreSQL relational schemas, row-level security (RLS), realtime subscriptions & vector storage.' },
    { name: 'GitHub & CI/CD', category: 'devops', level: 'Proficient', icon: '🐙', desc: 'Automated release matrices, git workflow, version branching, Docker containerization.' }
  ];

  // Core Software Architectures
  const architectures = [
    {
      id: 'neurax',
      title: 'NeuraX Core Engine',
      category: 'Autonomous NPU Cognitive Engine',
      logo: 'neurax',
      status: 'Active Production',
      specs: {
        latency: '< 12ms Edge Response',
        runtime: 'Python + ONNX Runtime',
        architecture: 'Local Small Language Model (SLM)'
      },
      summary: 'Autonomous client-first intelligence runtime designed to process natural language, code diagnostics, and device actions entirely offline without remote server dependencies.'
    },
    {
      id: 'sifra',
      title: 'Sifra AI Enterprise',
      category: 'Agentic Co-Pilot & Automation Suite',
      logo: 'sifra',
      status: 'Verified Deployment',
      specs: {
        latency: 'Real-time Streaming',
        runtime: 'TypeScript + Gemini API + OpenAI',
        architecture: 'Multi-Role Autonomous Agent'
      },
      summary: 'Proactive developer co-pilot engineered for secure coding, real-time documentation generation, cloud debugging, and automated task execution.'
    },
    {
      id: 'noorax',
      title: 'NOORAX Vision Matrix',
      category: 'Multimodal Visual Processing & Vision',
      logo: 'noorax',
      status: 'Active Beta v1.4',
      specs: {
        latency: '< 45ms Image Inference',
        runtime: 'Gemini 2.5 Flash + WebGL',
        architecture: 'Neural OCR & Spatial Analysis'
      },
      summary: 'Advanced visual comprehension neural node capable of diagram decomposition, UI screenshot code generation, and multi-layered spatial object tracking.'
    },
    {
      id: 'rodp',
      title: 'RODP (Rizwan Online Dreams Platform)',
      category: 'Unified Web Ecosystem Platform',
      logo: 'rexlify',
      status: 'Production Architecture',
      specs: {
        latency: '< 30ms Edge Routing',
        runtime: 'TypeScript + React + Cloudflare/GCP',
        architecture: 'Decentralized Micro-Frontend Matrix'
      },
      summary: 'Comprehensive web gateway uniting digital tools, community developer nodes, and interactive AI experiences into a unified, high-performance ecosystem.'
    },
    {
      id: 'rizwan-pa',
      title: 'RIZWAN P.A (Personal Assistant)',
      category: 'Task-Oriented Voice & Text AI Companion',
      logo: 'sifra',
      status: 'Active Deployment',
      specs: {
        latency: '< 50ms Speech-to-Action',
        runtime: 'Python + OpenAI + Web Speech API',
        architecture: 'Context-Aware Agent Workflow'
      },
      summary: 'Intelligent multimodal assistant tailored for calendar orchestration, automated code synthesis, developer context management, and voice-driven tool activation.'
    }
  ];

  return (
    <div className="min-h-screen w-full selection:bg-purple-500 selection:text-white transition-colors duration-300">
      
      {/* ==================== SECTION 1: SEQUENTIAL YOUTUBE PIPELINE VIDEO STREAM ==================== */}
      <YouTubePipelinePlayer onSkipToOverview={handleSkipToOverview} />

      {/* ==================== SECTION 2: DEVELOPER PORTFOLIO CONTENT ==================== */}
      <main ref={mainContentRef} className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-16 py-16 space-y-24">
        
        {/* ==================== SECTION 2.1: DEVELOPER OVERVIEW & PROFILE ==================== */}
        <section id="overview" className="space-y-10">
          <div className="text-center sm:text-left space-y-3 border-b border-purple-500/20 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono font-bold tracking-widest uppercase border border-purple-500/30">
              <Sparkles size={12} />
              <span>Architect Profile & Manifesto</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sora tracking-tight">
              Developer Bio & Mission Description
            </h2>
            <p className="text-zinc-300 text-sm max-w-2xl font-light">
              Architecting state-of-the-art AI applications, real-time agentic copilots, and production-grade full-stack ecosystems driven by the conviction of Plan T.C.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Primary Bio Card */}
            <div className="glassmorphic-card p-8 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-sora text-white">Rizwan RR</h3>
                    <p className="text-xs font-mono text-purple-400 font-medium">Software Developer & AI Systems Creator</p>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed font-light">
                  Rizwan RR is a dedicated full-stack software engineer and artificial intelligence creator specializing in autonomous neural runtimes, multi-agent frameworks, and high-performance web platforms. Driven by the philosophy of <strong className="text-white">Plan T.C</strong>, his work bridges cutting-edge foundational models with sovereign, edge-native user experiences that remain accessible, fast, and secure for everyone.
                </p>
                <p className="text-zinc-400 text-xs leading-relaxed font-light">
                  From training on-device small language models (NeuraX) to deploying enterprise multimodal vision nodes (NOORAX) and agentic co-pilots (Sifra AI), Rizwan builds resilient software architectures that scale effortlessly from developer desktops to global cloud environments.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">Full-Stack Runtimes</span>
                <span className="px-3 py-1 rounded-xl bg-pink-500/10 text-pink-300 border border-pink-500/20 font-bold">Generative AI Systems</span>
                <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">Autonomous Agents</span>
              </div>
            </div>

            {/* Core Specializations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glassmorphic-card p-6 rounded-[2rem] border border-white/10 hover:border-purple-500/40 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Code2 size={20} />
                </div>
                <h4 className="text-base font-bold text-white font-sora">Full-Stack Engineering</h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  End-to-end architectures utilizing React, TypeScript, Python, Tailwind CSS, Node.js, Firebase, and relational Supabase schemas.
                </p>
              </div>

              <div className="glassmorphic-card p-6 rounded-[2rem] border border-white/10 hover:border-pink-500/40 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <Cpu size={20} />
                </div>
                <h4 className="text-base font-bold text-white font-sora">Generative AI Systems</h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Deep integration with Gemini API, OpenAI APIs, Google AI Studio, multimodal spatial vision pipelines, and prompt orchestration.
                </p>
              </div>

              <div className="glassmorphic-card p-6 rounded-[2rem] border border-white/10 hover:border-indigo-500/40 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Terminal size={20} />
                </div>
                <h4 className="text-base font-bold text-white font-sora">Automated Agent Workflows</h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Context-aware autonomous agent swarms, automated code diagnosis, multi-role copilots, and real-time streaming tools.
                </p>
              </div>

              <div className="glassmorphic-card p-6 rounded-[2rem] border border-white/10 hover:border-amber-500/40 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <h4 className="text-base font-bold text-white font-sora">Edge Sovereign Runtimes</h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Zero-telemetry edge computing, local small language model execution, and strict client privacy guarantees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2.2: TECHNICAL SKILL STACK ==================== */}
        <section id="skills" className="space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-purple-500/20 pb-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-mono font-bold tracking-widest uppercase border border-pink-500/30">
                <Code2 size={12} />
                <span>Proficiencies & Toolchain</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sora tracking-tight">
                Technical Skill Stack (Verified Competencies)
              </h2>
              <p className="text-zinc-300 text-sm max-w-xl font-light">
                Hands-on expertise across modern languages, generative AI APIs, scalable cloud backends, and deployment tooling.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Stack' },
                { id: 'languages', label: 'Languages' },
                { id: 'ai-apis', label: 'AI & APIs' },
                { id: 'cloud-db', label: 'Cloud & DB' },
                { id: 'devops', label: 'DevOps' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveSkillCategory(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeSkillCategory === f.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 border border-purple-400/40'
                      : 'bg-white/5 text-zinc-300 hover:text-white border border-white/10 hover:border-purple-400/30'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalSkills
              .filter(s => activeSkillCategory === 'all' || s.category === activeSkillCategory)
              .map((skill, idx) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="glassmorphic-card p-6 rounded-[2rem] border border-white/10 hover:border-purple-500/40 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                          {skill.icon}
                        </span>
                        <div>
                          <h3 className="text-base font-bold text-white font-sora group-hover:text-purple-400 transition-colors">
                            {skill.name}
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest">
                            {skill.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-light text-zinc-300 leading-relaxed">
                      {skill.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="uppercase text-zinc-400">{skill.category}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold">
                      Verified Competency / Production Ready
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>
        </section>

        {/* ==================== SECTION 2.3: CORE DEVELOPED SOFTWARE ARCHITECTURES ==================== */}
        <section id="architectures" className="space-y-10">
          <div className="text-center sm:text-left space-y-3 border-b border-purple-500/20 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono font-bold tracking-widest uppercase border border-purple-500/30">
              <Layers size={12} />
              <span>Core Application Dashboard</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sora tracking-tight">
              Developed Software Architectures
            </h2>
            <p className="text-zinc-300 text-sm max-w-2xl font-light">
              View-only showcase of flagship AI applications, small language neural engines, and multimodal intelligence systems designed by Rizwan RR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {architectures.map((arch) => (
              <motion.div
                key={arch.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glassmorphic-card p-8 rounded-[2.5rem] border border-white/10 hover:border-purple-500/40 transition-all duration-500 flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                {/* Top Header */}
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:scale-105 transition-transform">
                      {arch.logo === 'neurax' && <NeuraxLogo size={36} />}
                      {arch.logo === 'sifra' && <SifraLogo size={36} />}
                      {arch.logo === 'noorax' && <NooraxLogo size={36} />}
                      {arch.logo === 'rexlify' && <RexlifyLogo size={36} />}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {arch.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest block">
                      {arch.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white font-sora mt-1">
                      {arch.title}
                    </h3>
                  </div>

                  <p className="text-zinc-300 text-xs font-light leading-relaxed">
                    {arch.summary}
                  </p>
                </div>

                {/* Specs Box */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Latency:</span>
                    <span className="font-bold text-purple-400">{arch.specs.latency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Stack:</span>
                    <span className="text-white truncate max-w-[170px]">{arch.specs.runtime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Arch:</span>
                    <span className="text-white">{arch.specs.architecture}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ==================== SECTION 2.4: DEDICATED "PLAN T.C" SECTION ==================== */}
        <section id="plan-tc" className="relative p-8 sm:p-12 md:p-16 rounded-[3rem] bg-gradient-to-br from-purple-950/80 via-indigo-950/80 to-[#070614] border border-purple-500/30 text-white overflow-hidden shadow-2xl">
          
          {/* Background lights */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-pink-300 text-xs font-mono font-bold tracking-widest uppercase">
              <Award size={14} className="text-pink-400" />
              <span>Foundational Manifesto</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold font-sora tracking-tight leading-tight">
              Mission: <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">Plan T.C</span>
            </h2>

            <blockquote className="text-lg sm:text-2xl font-serif italic text-purple-100/95 leading-relaxed font-light px-4">
              &ldquo;Plan T.C: Making advanced technology, AI ecosystems, and digital tools universally accessible to everyone as a personal responsibility and vision.&rdquo;
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-mono text-pink-400 font-bold uppercase">01 // Accessibility</span>
                <h4 className="text-sm font-bold text-white">Universal Availability</h4>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  Eliminating socioeconomic barriers to cutting-edge AI utilities and developer tooling.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase">02 // Sovereign Privacy</span>
                <h4 className="text-sm font-bold text-white">Zero Telemetry</h4>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  Local-first AI computation ensuring private data never leaves user control.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase">03 // Empowerment</span>
                <h4 className="text-sm font-bold text-white">Open Innovation</h4>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  Fostering next-generation builders through transparent, well-architected platforms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 2.5: DIRECT CONTACT FORM MODULE ==================== */}
        <section id="contact-transmission" className="space-y-8 w-full max-w-4xl mx-auto">
          <div className="text-center space-y-3 border-b border-purple-500/20 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono font-bold tracking-widest uppercase border border-purple-500/30">
              <Send size={12} />
              <span>Direct Inquiries</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sora tracking-tight">
              Publish Transmission to Rizwan RR
            </h2>
            <p className="text-zinc-300 text-sm font-light">
              Connect directly for technical collaborations, architectural consultations, or software inquiries.
            </p>
          </div>

          <div className="glassmorphic-card p-8 sm:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
            {formSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold font-sora text-white">
                  Transmission Published Successfully
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto">
                  Your message has been encrypted and delivered into Rizwan’s transmission terminal. Expect a response shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-mono uppercase font-bold text-zinc-300">
                      Identifier / Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactIdentifier}
                      onChange={(e) => setContactIdentifier(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      id="portfolio-contact-name"
                      className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-xs font-mono uppercase font-bold text-zinc-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="your.email@domain.com"
                      id="portfolio-contact-email"
                      className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-mono uppercase font-bold text-zinc-300">
                    Subject / Discussion Scope
                  </label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="e.g. AI Engine Partnership or Full-Stack Consultation"
                    id="portfolio-contact-subject"
                    className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-mono uppercase font-bold text-zinc-300">
                    Transmission Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Outline your proposal, bug report, or collaborative vision..."
                    id="portfolio-contact-message"
                    className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner resize-none"
                  />
                </div>

                <button
                  type="submit"
                  id="portfolio-contact-submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:opacity-95 text-white font-mono font-bold text-sm uppercase tracking-widest shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  <span>Publish Transmission</span>
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

    </div>
  );
};
