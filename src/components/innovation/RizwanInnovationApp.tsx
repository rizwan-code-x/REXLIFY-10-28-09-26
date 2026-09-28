/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lightbulb, ShieldCheck, Lock, Award, Cpu, Sparkles, 
  Send, ExternalLink, Rocket, Globe, ChevronRight, CheckCircle2
} from 'lucide-react';
import { SecureExitModal } from '../SecureExitModal';

interface RizwanInnovationAppProps {
  onBack: () => void;
  userName?: string;
}

interface InnovationProject {
  id: string;
  title: string;
  category: string;
  status: 'Patented' | 'Active R&D' | 'Alpha Testing';
  description: string;
  techStack: string[];
}

const INNOVATION_PROJECTS: InnovationProject[] = [
  {
    id: 'inv-1',
    title: 'Sovereign Neural Microkernel (SNM-1)',
    category: 'Operating Systems & AI',
    status: 'Patented',
    description: 'A bare-metal microkernel engineered to execute quantized LLMs on edge semiconductors without underlying host operating systems.',
    techStack: ['Rust', 'RISC-V ASM', 'Hardware Vector Intrinsics']
  },
  {
    id: 'inv-2',
    title: 'Zero-Knowledge Biometric Identity Gateway',
    category: 'Applied Cryptography',
    status: 'Active R&D',
    description: 'Cryptographic attestation protocol allowing users to verify identity and rights across government/financial portals without exposing personal data.',
    techStack: ['ZK-SNARKs', 'WASM', 'WebAuthn Level 3']
  },
  {
    id: 'inv-3',
    title: 'Autonomous Agro-Drone Spatial Vision',
    category: 'Robotics & Precision Agriculture',
    status: 'Alpha Testing',
    description: 'Ultra-lightweight edge camera module with realtime plant pathology diagnostics and precision irrigation signaling.',
    techStack: ['NeuraX Core', 'Edge TPU', 'Optical Flow Sensors']
  }
];

export const RizwanInnovationApp: React.FC<RizwanInnovationAppProps> = ({ onBack, userName = 'Rizwan' }) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryTopic, setInquiryTopic] = useState('Deep Tech Collaboration');
  const [inquiryMsg, setInquiryMsg] = useState('');

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMsg.trim()) return;
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#070510] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Header with Innovation Emblem & Exit Lock */}
      <header className="sticky top-0 z-40 bg-[#0e0a1f]/95 backdrop-blur-md border-b border-amber-500/20 px-4 md:px-8 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3.5">
          {/* Custom Rizwan Innovation Emblem */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <div className="w-full h-full bg-[#0d091e] rounded-[14px] flex items-center justify-center">
              <Lightbulb size={20} className="text-amber-400" />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 uppercase">
                RIZWAN INNOVATION
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/30 text-[10px] font-mono text-amber-300">
                <Rocket size={10} className="text-amber-400" />
                DEEP TECH & R&D LABS
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Pioneering Patents & Next-Generation Computational Systems
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
            <Lock size={12} className="text-amber-400" />
            <span>LAB SESSION LOCKED</span>
          </div>

          {/* EXIT BUTTON TRIGGERING CAPTCHA */}
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            title="Exit Rizwan Innovation Lab (Requires Captcha Code Verification)"
          >
            <Lock size={13} className="text-rose-400" />
            <span>EXIT INNOVATION LAB</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Banner Section */}
        <div className="rounded-3xl bg-gradient-to-r from-purple-950/50 via-indigo-950/30 to-amber-950/20 border border-amber-500/20 p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold mb-3">
              <Award size={14} />
              <span>Proprietary Research Ecosystem</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Engineering the Technological Horizon
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Rizwan Innovation serves as the private intellectual incubator for Rexlify and RODP, architecting foundational algorithms, autonomous agents, and hardware integrations.
            </p>
          </div>
        </div>

        {/* Active Projects Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white uppercase font-mono flex items-center gap-2">
              <Cpu size={16} className="text-amber-400" />
              <span>Active R&D Pipelines & Patents</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">3 Core Initiatives</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INNOVATION_PROJECTS.map((proj) => (
              <div 
                key={proj.id}
                className="bg-[#100d23]/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                      {proj.category}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      proj.status === 'Patented' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2">{proj.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{proj.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-850">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className="text-[9px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Collaboration & Inquiries */}
        <div className="bg-[#100d23]/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase font-mono mb-4 flex items-center gap-2">
            <Send size={15} className="text-amber-400" />
            <span>Confidential R&D Inquiries & Strategic Partnerships</span>
          </h3>

          {contactSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Inquiry dispatched securely. Rizwan Innovation executive staff will review within 24 hours.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitInquiry} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                className="bg-[#15122c] border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="email"
                placeholder="Work Email"
                value={inquiryEmail}
                onChange={(e) => setInquiryEmail(e.target.value)}
                className="bg-[#15122c] border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Inquiry or Project Concept"
                value={inquiryMsg}
                onChange={(e) => setInquiryMsg(e.target.value)}
                className="bg-[#15122c] border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security Captcha Exit Modal */}
      <SecureExitModal
        isOpen={isExitModalOpen}
        appName="Rizwan Innovation Lab"
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          onBack();
        }}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
};
