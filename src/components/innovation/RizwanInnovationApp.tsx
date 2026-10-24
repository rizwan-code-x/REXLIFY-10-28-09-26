/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, ShieldCheck, Lock, Award, Cpu, Sparkles, 
  Send, ExternalLink, Rocket, Globe, ChevronRight, ChevronLeft, CheckCircle2,
  BarChart2, TrendingUp, Layers, Maximize2, Minimize2, Play, Pause,
  Activity, FileText, Check, CpuIcon, Eye
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
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

interface ArchitecturalDiagram {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  specifications: { label: string; value: string }[];
  description: string;
  svgType: 'kernel' | 'tensor' | 'interrupt' | 'riscv';
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

// Architectural Diagrams for Sovereign Neural Microkernel (SNM-1)
const SNM_DIAGRAMS: ArchitecturalDiagram[] = [
  {
    id: 'snm-diag-1',
    title: 'Microkernel Layer Topology (SNM-1 Core)',
    subtitle: 'Zero-Overhead Bare-Metal Execution Vector',
    tag: 'Layer 0 Topology',
    specifications: [
      { label: 'Footprint', value: '1.18 MB ROM' },
      { label: 'Latency', value: '< 0.18ms Sub-kernel' },
      { label: 'Context Switch', value: '85 Nanoseconds' },
      { label: 'Quantization', value: 'INT4 / INT8 Native' }
    ],
    description: 'Direct silicon access abstraction bypassing traditional POSIX system calls. Neural inference routines are mapped straight to hardware register matrices with deterministic zero-page swapping.',
    svgType: 'kernel'
  },
  {
    id: 'snm-diag-2',
    title: 'Quantized Tensor DMA & Ring Buffer Pipeline',
    subtitle: 'Zero-Copy Asynchronous Weight Memory Stream',
    tag: 'Memory Subsystem',
    specifications: [
      { label: 'DMA Bandwidth', value: '64.8 GB/s Edge' },
      { label: 'Tensor Precision', value: 'FP16 / INT4 Hybrid' },
      { label: 'Memory Bus', value: '512-bit Interleaved' },
      { label: 'Power Efficiency', value: '142 TOPS/Watt' }
    ],
    description: 'Hardware Ring Buffer pipeline executing non-blocking weights stream from onboard flash directly into SIMD vector units, eliminating host OS cache pollution.',
    svgType: 'tensor'
  },
  {
    id: 'snm-diag-3',
    title: 'Deterministic Interrupt Dispatcher & Real-Time Preemption',
    subtitle: 'Sub-Microsecond Hard Real-Time AI Task Switching',
    tag: 'Interrupt Subsystem',
    specifications: [
      { label: 'Jitter Vector', value: '±2.4 Nanoseconds' },
      { label: 'Priority Levels', value: '256 Hardware Lanes' },
      { label: 'Realtime Target', value: 'Hard RTOS Certified' },
      { label: 'Isolation', value: 'Hardware MPU Rings' }
    ],
    description: 'Supervisor-mode interrupt vectors prioritizing sensory telemetry and safety-critical inference tasks over secondary background neural updates.',
    svgType: 'interrupt'
  },
  {
    id: 'snm-diag-4',
    title: 'Custom RISC-V Neural Vector Extensions (VLEN-512)',
    subtitle: 'Silicon-Level Matrix Multiplication Accelerators',
    tag: 'Instruction Set Architecture',
    specifications: [
      { label: 'Register Size', value: '512-bit Vectors' },
      { label: 'OP-Code Set', value: '32 Custom Matrix Instructions' },
      { label: 'Target Silicon', value: 'RISC-V 64-bit Core' },
      { label: 'Pipeline Stages', value: '8-stage Dual-Issue' }
    ],
    description: 'Proprietary vector assembly extension instructions tailored for fused-multiply-add (FMA) Operations and non-linear activation functions in hardware registers.',
    svgType: 'riscv'
  }
];

// 5-Year Innovation Success Rate & Patent Approval Trends Data
const PATENT_TREND_DATA = [
  { year: '2022', successRate: 78, patentGrants: 4, RDPipelines: 8, avgFilingDays: 45 },
  { year: '2023', successRate: 84, patentGrants: 7, RDPipelines: 12, avgFilingDays: 38 },
  { year: '2024', successRate: 89, patentGrants: 11, RDPipelines: 15, avgFilingDays: 29 },
  { year: '2025', successRate: 94, patentGrants: 16, RDPipelines: 21, avgFilingDays: 22 },
  { year: '2026', successRate: 98, patentGrants: 22, RDPipelines: 28, avgFilingDays: 14 }
];

export const RizwanInnovationApp: React.FC<RizwanInnovationAppProps> = ({ onBack, userName = 'Rizwan' }) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');

  // Carousel State for Sovereign Neural Microkernel
  const [activeDiagramIdx, setActiveDiagramIdx] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreenDiagram, setIsFullscreenDiagram] = useState(false);

  // Auto-play timer for architectural diagrams
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveDiagramIdx((prev) => (prev + 1) % SNM_DIAGRAMS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const handleNextDiagram = () => {
    setActiveDiagramIdx((prev) => (prev + 1) % SNM_DIAGRAMS.length);
  };

  const handlePrevDiagram = () => {
    setActiveDiagramIdx((prev) => (prev - 1 + SNM_DIAGRAMS.length) % SNM_DIAGRAMS.length);
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMsg.trim()) return;
    setContactSubmitted(true);
  };

  const currentDiagram = SNM_DIAGRAMS[activeDiagramIdx];

  // Helper to render high-tech SVG architectural diagrams
  const renderDiagramGraphic = (type: ArchitecturalDiagram['svgType']) => {
    switch (type) {
      case 'kernel':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#04030a] relative overflow-hidden font-mono text-[10px]">
            {/* Grid Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            
            {/* Flow Layers */}
            <div className="w-full max-w-md space-y-2.5 relative z-10">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <div className="flex items-center gap-2">
                  <Cpu className="text-amber-400" size={14} />
                  <span className="font-bold uppercase tracking-wider">HARDWARE SILICON (RISC-V / ARM64)</span>
                </div>
                <span className="text-[9px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">Layer 0</span>
              </div>

              <div className="flex justify-center my-0.5">
                <span className="text-amber-400/80 animate-pulse">↓ Vector Bus (512-bit Direct MMIO) ↓</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/40 text-purple-300 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <div className="flex items-center gap-2">
                  <Layers className="text-purple-400" size={14} />
                  <span className="font-bold uppercase tracking-wider">SNM-1 MICROKERNEL (Zero-POSIX Core)</span>
                </div>
                <span className="text-[9px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-200">1.18 MB ROM</span>
              </div>

              <div className="flex justify-center my-0.5">
                <span className="text-purple-400/80 animate-pulse">↓ Deterministic Ring-0 Scheduler ↓</span>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-cyan-400" size={14} />
                  <span className="font-bold uppercase tracking-wider">QUANTIZED NEURAL CONTEXT (INT4/INT8)</span>
                </div>
                <span className="text-[9px] bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-200">Zero Copy</span>
              </div>
            </div>
          </div>
        );
      case 'tensor':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#04030a] relative overflow-hidden font-mono text-[10px]">
            <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            <div className="w-full max-w-md space-y-3 relative z-10">
              <div className="flex justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-2">
                <span>DMA Memory Address</span>
                <span className="text-purple-400">Ring Buffer Pipeline (64.8 GB/s)</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['0x00FF80', '0x00FF90', '0x00FFA0', '0x00FFB0'].map((addr, i) => (
                  <div key={addr} className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-center">
                    <span className="block text-[8px] text-slate-400">Block {i+1}</span>
                    <span className="text-purple-300 font-bold">{addr}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-center flex items-center justify-between">
                <span>SIMD Tensor Weights Dispatch:</span>
                <span className="text-amber-400 font-bold">142 TOPS/W Uncluttered Stream</span>
              </div>
            </div>
          </div>
        );
      case 'interrupt':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#04030a] relative overflow-hidden font-mono text-[10px]">
            <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            <div className="w-full max-w-md space-y-3 relative z-10">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 flex justify-between items-center">
                <span className="font-bold uppercase">Hard Realtime Interrupt (NMI Vector 0x02)</span>
                <span className="text-[9px] bg-rose-500/20 px-2 py-0.5 rounded">Priority 0</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 flex justify-between items-center">
                <span className="font-bold uppercase">Preemption Save State (Context: 85ns)</span>
                <span className="text-[9px] bg-cyan-500/20 px-2 py-0.5 rounded">Active Lane</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex justify-between items-center">
                <span className="uppercase">Background Neural Sync (Priority 255)</span>
                <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Yielded</span>
              </div>
            </div>
          </div>
        );
      case 'riscv':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#04030a] relative overflow-hidden font-mono text-[10px]">
            <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            <div className="w-full max-w-md space-y-3 relative z-10">
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-center font-bold">
                RISC-V Custom OP-Code: <code className="text-amber-200">vmatmul.fma.v512</code>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="block text-[8px] text-slate-400">Vector Reg V0..V31</span>
                  <span className="text-amber-400 font-bold">512-bit FMA</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="block text-[8px] text-slate-400">Pipeline Stages</span>
                  <span className="text-emerald-400 font-bold">8-Stage Dual Issue</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
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
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-8">
        
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

        {/* ========================================================================= */}
        {/* FEATURED PROJECT ARCHITECTURAL DIAGRAM CAROUSEL (SNM-1)                   */}
        {/* ========================================================================= */}
        <div className="bg-[#100d23]/90 border border-amber-500/30 rounded-3xl p-5 md:p-7 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Cpu size={12} className="text-amber-400" />
                  FLAGSHIP SYSTEM ARCHITECTURE
                </span>
                <span className="text-[10px] font-mono text-slate-400">Diagram {activeDiagramIdx + 1} of {SNM_DIAGRAMS.length}</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2">
                <span>Sovereign Neural Microkernel (SNM-1) Schematics</span>
              </h3>
            </div>

            {/* Carousel Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAutoPlay 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Toggle Auto-Cycle Architectural Slides"
              >
                {isAutoPlay ? <Pause size={12} /> : <Play size={12} />}
                <span>{isAutoPlay ? 'Auto-Cycle ON' : 'Auto-Cycle'}</span>
              </button>

              <button
                onClick={handlePrevDiagram}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
                title="Previous Architectural Diagram"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={handleNextDiagram}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
                title="Next Architectural Diagram"
              >
                <ChevronRight size={16} />
              </button>

              <button
                onClick={() => setIsFullscreenDiagram(true)}
                className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer active:scale-95 ml-1"
                title="Expand Fullscreen Diagram View"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>

          {/* Carousel Slide Area: Interactive Graphic & Technical Specifications */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Dynamic Interactive Diagram Graphic Container (7 Cols) */}
            <div className="lg:col-span-7 aspect-[16/10] w-full rounded-2xl border border-slate-800 bg-[#04030a] relative overflow-hidden shadow-inner flex flex-col group">
              
              {/* Diagram Graphic Header Strip */}
              <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 flex justify-between items-center text-[10px] font-mono">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Activity size={12} />
                  {currentDiagram.tag}
                </span>
                <span className="text-slate-500">SCHEMATIC ID: {currentDiagram.id}</span>
              </div>

              {/* Render Diagram Graphic */}
              <div className="flex-1 relative">
                {renderDiagramGraphic(currentDiagram.svgType)}
              </div>

              {/* Diagram Title Footer Overlay */}
              <div className="p-3.5 bg-slate-950/95 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">{currentDiagram.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{currentDiagram.subtitle}</p>
                </div>
                <button
                  onClick={() => setIsFullscreenDiagram(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Eye size={12} />
                  <span>Inspect</span>
                </button>
              </div>
            </div>

            {/* Right: Technical Specifications & Annotation Notes (5 Cols) */}
            <div className="lg:col-span-5 space-y-4 font-sans">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block tracking-widest">
                  TECHNICAL ANNOTATIONS & BENCHMARKS
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {currentDiagram.description}
                </p>
              </div>

              {/* Key Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {currentDiagram.specifications.map((spec) => (
                  <div key={spec.label} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-400 uppercase block">{spec.label}</span>
                    <span className="text-xs font-bold text-amber-300 font-mono">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Diagram Selectors / Thumbnails Indicator */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Select Schematic View:</span>
                <div className="flex gap-1.5">
                  {SNM_DIAGRAMS.map((diag, idx) => (
                    <button
                      key={diag.id}
                      onClick={() => setActiveDiagramIdx(idx)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        idx === activeDiagramIdx 
                          ? 'w-7 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]' 
                          : 'w-2.5 bg-slate-800 hover:bg-slate-700'
                      }`}
                      title={`Jump to ${diag.title}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5-YEAR INVENTION SUCCESS RATE & PATENT APPROVAL TRENDS (RECHARTS BAR CHART) */}
        {/* ========================================================================= */}
        <div className="bg-[#100d23]/80 border border-slate-800 rounded-3xl p-6 md:p-7 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold mb-2">
                <BarChart2 size={14} className="text-purple-400" />
                <span>R&D PERFORMANCE ANALYTICS</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>Invention Success Rate & Patent Approval Trends</span>
              </h3>
              <p className="text-xs text-slate-400">
                5-Year Intellectual Property Velocity & R&D Success Performance Metrics (2022 – 2026)
              </p>
            </div>

            {/* Metric Summary Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3.5 py-2 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-right">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">2026 Success Rate</span>
                <span className="text-sm font-black text-amber-400 font-mono">98% Peak</span>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-right">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Total Granted Patents</span>
                <span className="text-sm font-black text-purple-400 font-mono">22 Grants</span>
              </div>
            </div>
          </div>

          {/* Recharts Bar Chart Container */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PATENT_TREND_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1b38" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                
                {/* Left Y-Axis: Success Rate (%) */}
                <YAxis yAxisId="left" stroke="#f59e0b" fontSize={11} domain={[0, 100]} unit="%" tickLine={false} />
                
                {/* Right Y-Axis: Granted Patents */}
                <YAxis yAxisId="right" orientation="right" stroke="#a855f7" fontSize={11} tickLine={false} />
                
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c0a1d', 
                    borderColor: 'rgba(245, 158, 11, 0.3)', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                
                {/* Bar 1: Invention Success Rate (%) */}
                <Bar 
                  yAxisId="left" 
                  dataKey="successRate" 
                  name="Invention Success Rate (%)" 
                  fill="#f59e0b" 
                  radius={[6, 6, 0, 0]} 
                  barSize={24}
                />
                
                {/* Bar 2: Patent Approval Grants (Count) */}
                <Bar 
                  yAxisId="right" 
                  dataKey="patentGrants" 
                  name="Granted Patents (Count)" 
                  fill="#a855f7" 
                  radius={[6, 6, 0, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Additional Analytics Breakdown Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#15122c] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Peak Invention Rate</span>
              <span className="text-base font-black text-amber-400 font-mono">98% (2026)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#15122c] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Avg Filing Velocity</span>
              <span className="text-base font-black text-cyan-400 font-mono">14 Days</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#15122c] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Active R&D Pipelines</span>
              <span className="text-base font-black text-purple-400 font-mono">28 Initiatives</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#15122c] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Cumulative Growth</span>
              <span className="text-base font-black text-emerald-400 font-mono">+450% YoY</span>
            </div>
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

      {/* Fullscreen Architectural Diagram Lightbox Modal */}
      {isFullscreenDiagram && (
        <div className="fixed inset-0 z-50 bg-[#04030a]/95 backdrop-blur-xl flex flex-col p-4 md:p-8">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                {currentDiagram.tag} • FULLSCREEN SCHEMATIC
              </span>
              <h3 className="text-lg font-black text-white uppercase">{currentDiagram.title}</h3>
            </div>
            <button
              onClick={() => setIsFullscreenDiagram(false)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          <div className="flex-1 rounded-2xl bg-black border border-slate-800 p-6 flex items-center justify-center relative overflow-hidden">
            {renderDiagramGraphic(currentDiagram.svgType)}
          </div>

          <div className="pt-4 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">{currentDiagram.subtitle}</span>
            <button
              onClick={() => setIsFullscreenDiagram(false)}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl uppercase text-xs"
            >
              Close Fullscreen View
            </button>
          </div>
        </div>
      )}

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
