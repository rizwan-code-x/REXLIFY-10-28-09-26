/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Shield, Sparkles, Database, Code, Layout, Paintbrush, 
  Workflow, ArrowRight, CheckCircle2, RefreshCw, Cpu, Layers, 
  ChevronRight, ChevronLeft, BarChart3, Search, Play, Minimize2, ExternalLink
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
  type: 'entity' | 'risk' | 'normal';
}

interface Connection {
  from: number;
  to: number;
  active: boolean;
}

const CASE_STUDIES = [
  {
    id: 1,
    title: "Global Tier-1 Banking Anti-Money Laundering",
    metric: "98% Detection Accuracy",
    description: "Replaced legacy rules-based systems with contextual Entity Resolution and Graph Analytics to identify hidden money-mules across 12M+ accounts.",
    impact: "+$42M Saved in Regulatory Compliance costs yearly",
    color: "from-[#00E5A3] to-[#00b3cf]",
    accent: "#00E5A3"
  },
  {
    id: 2,
    title: "Telecom Subscriber Network Fraud Prevention",
    metric: "12ms Real-time Latency",
    description: "Mapped millions of real-time incoming call nodes to instantly flag social-engineering network rings and spoofed corporate identities.",
    impact: "-85% reduction in successful telecom scam attempts",
    color: "from-amber-400 to-rose-500",
    accent: "#f59e0b"
  },
  {
    id: 3,
    title: "Global Logistics & Cross-Border Supply Chain Trust",
    metric: "1.2B Entities Resolved",
    description: "Unified disparate shipping records, shell company registrations, and customs declarations to expose illicit high-risk logistics channels.",
    impact: "Uncovered 14 hidden state-controlled shipping rings",
    color: "from-[#a855f7] to-[#ec4899]",
    accent: "#a855f7"
  }
];

export const QuantexaReplication: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'demo' | 'blueprints'>('demo');
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<'html' | 'css' | 'js' | 'custom'>('html');
  const [activeCaseStudyIndex, setActiveCaseStudyIndex] = useState(0);
  
  // Interactive Network Simulation State
  const [searchQuery, setSearchQuery] = useState('Acme Corp');
  const [resolvedEntities, setResolvedEntities] = useState<Node[]>([]);
  const [resolvedConnections, setResolvedConnections] = useState<Connection[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [activePulseNode, setActivePulseNode] = useState<number | null>(null);

  // Re-run the network setup on component load
  useEffect(() => {
    handleResolve();
  }, []);

  const handleResolve = () => {
    setIsResolving(true);
    setTimeout(() => {
      // Setup mock resolved nodes based on search text
      const name = searchQuery || 'General Corp';
      const nodes: Node[] = [
        { id: 1, x: 150, y: 120, label: `${name} Ltd`, type: 'entity' },
        { id: 2, x: 50, y: 50, label: 'John Doe (Shareholder)', type: 'normal' },
        { id: 3, x: 260, y: 70, label: 'Shell Co offshore', type: 'risk' },
        { id: 4, x: 100, y: 220, label: 'Tax Haven Bank AC', type: 'risk' },
        { id: 5, x: 250, y: 200, label: 'Logistics Subsidiary', type: 'normal' },
      ];
      const connections: Connection[] = [
        { from: 1, to: 2, active: true },
        { from: 1, to: 3, active: true },
        { from: 1, to: 4, active: true },
        { from: 1, to: 5, active: true },
        { from: 3, to: 4, active: false }
      ];
      setResolvedEntities(nodes);
      setResolvedConnections(connections);
      setIsResolving(false);
    }, 900);
  };

  const handleNextCaseStudy = () => {
    setActiveCaseStudyIndex((prev) => (prev + 1) % CASE_STUDIES.length);
  };

  const handlePrevCaseStudy = () => {
    setActiveCaseStudyIndex((prev) => (prev - 1 + CASE_STUDIES.length) % CASE_STUDIES.length);
  };

  return (
    <div className="w-full text-left space-y-12 pb-16">
      
      {/* -------------------- MAIN NAVIGATION HUB HEADER -------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090816]/75 border border-white/5 p-4 rounded-2xl backdrop-blur-xl relative z-20">
        <div className="space-y-1">
          <span className="font-mono text-[9px] font-bold text-[#00E5A3] uppercase tracking-[0.3em] bg-[#00E5A3]/10 px-2.5 py-1 rounded border border-[#00E5A3]/20 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E5A3] animate-pulse" />
            Quantexa Case Study Replication Studio
          </span>
          <h2 className="font-sora text-xl font-extrabold text-white">Replication & Code Assets</h2>
        </div>

        {/* Studio Tabs */}
        <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 self-stretch md:self-auto">
          <button
            onClick={() => setActiveMode('demo')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'demo'
                ? 'bg-[#00E5A3]/10 text-[#00E5A3] border border-[#00E5A3]/20 shadow-lg'
                : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <Play size={13} />
            LIVE REPLICA DEMO
          </button>
          <button
            onClick={() => setActiveMode('blueprints')}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'blueprints'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg'
                : 'text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <Code size={13} />
            CODE BLUEPRINTS
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* -------------------- MODE 1: LIVE INTERACTIVE REPLICA -------------------- */}
        {activeMode === 'demo' && (
          <motion.div
            key="demo-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-16"
          >
            {/* Elegant Tech Grid Background Intro Hero */}
            <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#080710] to-[#04030a] p-8 md:p-12 overflow-hidden shadow-2xl">
              
              {/* Neon Grid Overlay pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none" />
              
              {/* Soft Radial Ambient Glow */}
              <div className="absolute top-0 right-1/4 w-[350px] h-[350px] rounded-full bg-[#00E5A3]/5 blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />

              <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00E5A3]/10 bg-[#00E5A3]/5 text-xxs font-mono tracking-widest text-[#00E5A3] uppercase">
                  <Sparkles size={11} className="animate-pulse text-[#00E5A3]" />
                  Decision Intelligence Portal
                </div>

                <h1 className="font-sora text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                  Unify Data.<br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00E5A3] via-[#00ffcc] to-indigo-400">
                    Unleash Context.
                  </span>
                </h1>

                <p className="font-sans text-gray-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
                  An elegant replication of the Quantexa enterprise design system. Discover how we connect billions of data nodes in milliseconds to resolve real-time threat, trust, and risk vectors.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button className="px-6 py-3 rounded-xl font-mono text-xs font-bold text-black bg-[#00E5A3] hover:bg-[#00ffd2] transition-all shadow-[0_0_20px_rgba(0,229,163,0.3)] hover:shadow-[0_0_30px_rgba(0,229,163,0.5)] flex items-center gap-2 cursor-pointer">
                    DEPLOY DECISION MATRIX
                    <ArrowRight size={13} />
                  </button>
                  <button 
                    onClick={() => setActiveMode('blueprints')}
                    className="px-6 py-3 rounded-xl font-mono text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    EXPLORE CODE ASSETS
                  </button>
                </div>
              </div>
            </div>

            {/* INTERACTIVE BENTO GRID SECTION */}
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                  LIVE INTERACTIVE DASHBOARD PANELS
                </span>
                <h3 className="font-sora text-2xl font-extrabold text-white tracking-tight">
                  Replicated Bento Component Suite
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Panel 1: Contextual Entity Resolver (6 cols) */}
                <div className="md:col-span-6 rounded-2xl border border-white/5 bg-[#070612]/95 p-6 flex flex-col justify-between gap-6 hover:border-white/10 transition-all duration-300 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-[#00E5A3]/10 text-[#00E5A3] rounded-lg border border-[#00E5A3]/20">
                          <Network size={16} />
                        </span>
                        <div>
                          <h4 className="font-sora text-sm font-bold text-white">Entity Resolver Engine</h4>
                          <span className="text-[9px] font-mono text-gray-500">REAL-TIME GRAPH EXTRACTION</span>
                        </div>
                      </div>
                      
                      {/* Active green ping */}
                      <span className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A3] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00E5A3]"></span>
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs font-light leading-relaxed">
                      Unify fragmented corporate entities, addresses, and transaction accounts into unified real-time nodes. Type an entity to test the resolution matrix.
                    </p>

                    {/* Interactive Input Resolver */}
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
                      <div className="relative flex-1">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search e.g. Acme Corp..."
                          className="w-full bg-transparent text-[11px] font-mono pl-8 pr-2 py-1.5 text-white placeholder-gray-600 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleResolve}
                        disabled={isResolving}
                        className="px-3 py-1 bg-[#00E5A3] hover:bg-[#00ffcc] text-black text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isResolving ? <RefreshCw size={10} className="animate-spin" /> : 'RESOLVE'}
                      </button>
                    </div>
                  </div>

                  {/* Render simulated node network */}
                  <div className="h-44 w-full bg-black/40 rounded-xl border border-white/5 p-2 relative overflow-hidden flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {resolvedConnections.map((conn, idx) => {
                        const fromNode = resolvedEntities.find(n => n.id === conn.from);
                        const toNode = resolvedEntities.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;
                        return (
                          <line
                            key={idx}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke={conn.active ? '#00E5A3' : 'rgba(255,255,255,0.06)'}
                            strokeWidth={conn.active ? 1.5 : 1}
                            strokeDasharray={conn.active ? undefined : "3 3"}
                            className="transition-all duration-500"
                          />
                        );
                      })}
                    </svg>

                    {/* Nodes mapping */}
                    {resolvedEntities.map((node) => (
                      <motion.div
                        key={node.id}
                        className="absolute cursor-pointer p-1.5 rounded-lg border flex items-center gap-1.5 select-none"
                        style={{ left: node.x - 40, top: node.y - 12 }}
                        onHoverStart={() => setActivePulseNode(node.id)}
                        onHoverEnd={() => setActivePulseNode(null)}
                        animate={{
                          scale: activePulseNode === node.id ? 1.08 : 1,
                          borderColor: node.type === 'risk' ? 'rgba(239, 68, 68, 0.4)' : node.type === 'entity' ? 'rgba(0, 229, 163, 0.4)' : 'rgba(255,255,255,0.08)',
                          backgroundColor: node.type === 'risk' ? 'rgba(239, 68, 68, 0.1)' : node.type === 'entity' ? 'rgba(0, 229, 163, 0.1)' : 'rgba(3, 0, 20, 0.95)'
                        }}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${node.type === 'risk' ? 'bg-rose-500' : node.type === 'entity' ? 'bg-[#00E5A3]' : 'bg-gray-400'}`} />
                        <span className="text-[8px] font-mono font-medium text-white max-w-[80px] truncate">{node.label}</span>
                      </motion.div>
                    ))}

                    {isResolving && (
                      <div className="absolute inset-0 bg-[#070612]/80 flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={16} className="text-[#00E5A3] animate-spin" />
                        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">Resolving Link Context...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel 2: Live Threat & Compliance Metrics Chart (6 cols) */}
                <div className="md:col-span-6 rounded-2xl border border-white/5 bg-[#070612]/95 p-6 flex flex-col justify-between gap-6 hover:border-white/10 transition-all duration-300 shadow-xl relative">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                          <BarChart3 size={16} />
                        </span>
                        <div>
                          <h4 className="font-sora text-sm font-bold text-white">Interactive Volumetric Analytics</h4>
                          <span className="text-[9px] font-mono text-gray-500">LIVE SYSTEM CONTEXT telemetry</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                        99.98% RESOLUTION
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs font-light leading-relaxed">
                      Real-time analysis of dynamic risk score thresholds, identifying non-compliant patterns across continuous operational workloads.
                    </p>
                  </div>

                  {/* Recharts Area Chart */}
                  <div className="h-44 w-full bg-black/40 rounded-xl border border-white/5 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          { time: '10:00', risk: 14, resolution: 88 },
                          { time: '11:00', risk: 38, resolution: 92 },
                          { time: '12:00', risk: 18, resolution: 95 },
                          { time: '13:00', risk: 42, resolution: 91 },
                          { time: '14:00', risk: 25, resolution: 97 },
                          { time: '15:00', risk: 65, resolution: 99 },
                        ]}
                        margin={{ top: 5, right: 5, left: -32, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="quantexaGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E5A3" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#00E5A3" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="quantexaIndigo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#070612', 
                            borderColor: 'rgba(255,255,255,0.08)',
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            color: '#fff',
                            borderRadius: '8px'
                          }} 
                        />
                        <Area type="monotone" name="Resolution rate %" dataKey="resolution" stroke="#00E5A3" fillOpacity={1} fill="url(#quantexaGreen)" strokeWidth={1.5} />
                        <Area type="monotone" name="Detected risk indexes" dataKey="risk" stroke="#6366f1" fillOpacity={1} fill="url(#quantexaIndigo)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Panel 3: Graph Analytics Capability Card (4 cols) */}
                <div className="md:col-span-4 rounded-2xl border border-white/5 bg-[#070612]/95 p-6 space-y-4 hover:border-white/10 transition-all duration-300 shadow-xl relative group">
                  <span className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 w-fit block">
                    <Shield size={18} />
                  </span>
                  <div className="space-y-1">
                    <h5 className="font-sora text-sm font-bold text-white group-hover:text-[#00E5A3] transition-colors">Advanced Graph Analytics</h5>
                    <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block">FRAUD DETECTION MECHANICS</span>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed">
                    Map multi-layered network graphs with speed and precision. Instantly spotlight compliance-sniffing and cross-border security discrepancies.
                  </p>
                </div>

                {/* Panel 4: System Telemetry Card (4 cols) */}
                <div className="md:col-span-4 rounded-2xl border border-white/5 bg-[#070612]/95 p-6 space-y-4 hover:border-white/10 transition-all duration-300 shadow-xl relative group">
                  <span className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 w-fit block">
                    <Cpu size={18} />
                  </span>
                  <div className="space-y-1">
                    <h5 className="font-sora text-sm font-bold text-white group-hover:text-[#00E5A3] transition-colors">Billion-Node Performance</h5>
                    <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block">PIPELINE THROUGHPUT RATE</span>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed">
                    Processes structured and unstructured corporate registries in batch and streaming paradigms with sub-second execution thresholds.
                  </p>
                </div>

                {/* Panel 5: AI-Driven Insights (4 cols) */}
                <div className="md:col-span-4 rounded-2xl border border-white/5 bg-[#070612]/95 p-6 space-y-4 hover:border-white/10 transition-all duration-300 shadow-xl relative group">
                  <span className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 w-fit block">
                    <Layers size={18} />
                  </span>
                  <div className="space-y-1">
                    <h5 className="font-sora text-sm font-bold text-white group-hover:text-[#00E5A3] transition-colors">Cognitive AI Co-Piloting</h5>
                    <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block">INTELLIGENT DECISION SUPPORT</span>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed">
                    Uses enterprise large language and tabular neural models to synthesize security narratives and legal summaries of resolved entities.
                  </p>
                </div>

              </div>
            </div>

            {/* SMOOTH TRANSITION CLIENT CASE STUDIES SLIDER */}
            <div className="space-y-8 border-t border-white/5 pt-12">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-[#00E5A3] uppercase tracking-widest bg-[#00E5A3]/10 px-2 py-0.5 rounded border border-[#00E5A3]/20 w-fit block">
                    PROVEN ENTERPRISE OUTCOMES
                  </span>
                  <h3 className="font-sora text-2xl font-extrabold text-white tracking-tight">
                    Contextual Impact Case Studies
                  </h3>
                </div>

                {/* Slider Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevCaseStudy}
                    className="p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextCaseStudy}
                    className="p-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Showcase Container */}
              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#05040b]/80 p-6 md:p-10 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCaseStudyIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                  >
                    {/* Visual Card Mockup (5 cols) */}
                    <div className="md:col-span-5 relative aspect-video sm:aspect-square md:aspect-auto md:h-64 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
                      {/* Gradient border glowing overlay */}
                      <span className={`absolute inset-0 bg-gradient-to-br ${CASE_STUDIES[activeCaseStudyIndex].color} opacity-10`} />
                      
                      <div className="text-center space-y-4 relative z-10">
                        <span className="text-2xl block animate-bounce">📊</span>
                        <h4 className="font-mono text-xl md:text-3xl font-extrabold text-white tracking-tight">
                          {CASE_STUDIES[activeCaseStudyIndex].metric}
                        </h4>
                        <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest block border border-white/10 px-3 py-1 rounded bg-black/60">
                          PERFORMANCE METRIC RECORDED
                        </span>
                      </div>
                    </div>

                    {/* Text Details (7 cols) */}
                    <div className="md:col-span-7 text-left space-y-6">
                      <div className="space-y-2">
                        <span className="font-mono text-[9px] font-bold text-gray-400 block tracking-widest uppercase">
                          CASE STUDY _0{CASE_STUDIES[activeCaseStudyIndex].id}
                        </span>
                        <h4 className="font-sora text-xl md:text-2xl font-extrabold text-white leading-tight">
                          {CASE_STUDIES[activeCaseStudyIndex].title}
                        </h4>
                      </div>

                      <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed">
                        {CASE_STUDIES[activeCaseStudyIndex].description}
                      </p>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#00E5A3] shrink-0" />
                        <span className="font-mono text-[10px] md:text-xs text-white font-medium">
                          {CASE_STUDIES[activeCaseStudyIndex].impact}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        )}

        {/* -------------------- MODE 2: CODE BLUEPRINTS & DESIGN ASSETS -------------------- */}
        {activeMode === 'blueprints' && (
          <motion.div
            key="blueprint-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Introductory text */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#070612]/90 space-y-3">
              <h3 className="font-sora text-lg font-bold text-white">Replication Blueprint Guide</h3>
              <p className="text-gray-400 text-xs leading-relaxed font-light">
                Below are the production-ready code assets and technical design tokens mapped directly from the Quantexa Enterprise Website's visual hierarchy, typography, and fluid entry animations. Use these modular blocks in your layouts to achieve matching fidelity.
              </p>
            </div>

            {/* Tab selector */}
            <div className="flex border-b border-white/5">
              {(['html', 'css', 'js', 'custom'] as const).map((tab) => {
                const labels = {
                  html: '1. HTML5 STRUCTURE',
                  css: '2. TAILWIND DESIGN TOKENS',
                  js: '3. ANIMATION CONFIGS',
                  custom: '4. CUSTOMIZATION MANUAL'
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveBlueprintTab(tab)}
                    className={`pb-3 px-4 font-mono text-[10px] md:text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      activeBlueprintTab === tab
                        ? 'border-[#00E5A3] text-white font-black'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Tab content renderer */}
            <div className="bg-[#030010]/95 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
              
              {/* Copy action header banner */}
              <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-500">
                <span>FILE VIEW: {activeBlueprintTab.toUpperCase()}_BLUEPRINT.md</span>
                <span className="text-[#00E5A3] uppercase font-bold">Verified Production Ready</span>
              </div>

              <div className="p-6 overflow-x-auto font-mono text-[11px] leading-relaxed text-gray-300 bg-black/45 max-h-[500px] overflow-y-auto scrollbar-thin">
                
                {activeBlueprintTab === 'html' && (
                  <pre className="text-left whitespace-pre-wrap select-all">
{`<!-- ==========================================
     QUANTEXA ENTERPRISE HOME HERO TEMPLATE
     Semantic, high-contrast, bento structured.
     ========================================== -->
<section class="relative w-full overflow-hidden bg-[#05040e] text-white py-20 px-6">
  <!-- Core Radial Glow & SVG Line Background Grid -->
  <div class="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,163,0.06),transparent_70%)] pointer-events-none"></div>

  <div class="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 space-y-8">
    
    <!-- Premium Badge Component -->
    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00E5A3]/10 bg-[#00E5A3]/5 text-xs text-[#00E5A3] uppercase tracking-wider font-mono">
      <span class="h-1.5 w-1.5 rounded-full bg-[#00E5A3] animate-pulse"></span>
      Decision Intelligence Ecosystem
    </div>

    <!-- Giant Responsive Display Heading -->
    <h1 class="font-sans text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
      Unify Data.<br>
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#00E5A3] to-indigo-400">
        Unleash Context.
      </span>
    </h1>

    <!-- Core Lead Copy -->
    <p class="max-w-2xl text-gray-400 text-sm sm:text-base font-light leading-relaxed">
      Empower decision-making across global operational models. Resolve high-risk shell vectors with millisecond resolution times.
    </p>

    <!-- Call to Actions -->
    <div class="flex flex-wrap justify-center gap-4">
      <button class="px-6 py-3 rounded-xl font-bold bg-[#00E5A3] text-black shadow-lg hover:shadow-[0_0_20px_rgba(0,229,163,0.4)] transition-all">
        Deploy Core Matrix
      </button>
      <button class="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white">
        Request Intelligence Brief
      </button>
    </div>

  </div>
</section>`}
                  </pre>
                )}

                {activeBlueprintTab === 'css' && (
                  <pre className="text-left whitespace-pre-wrap select-all">
{`/* =========================================================
   QUANTEXA REPLICATION TAILWIND STYLESHEET & VARIABLES
   Define deep dark backgrounds, neon borders & glowing highlights.
   ========================================================= */

@theme {
  /* Hex Color Palettes mapped to variables */
  --color-quantexa-dark: #05040e;
  --color-quantexa-glow: #00E5A3;
  --color-quantexa-indigo: #6366f1;
  --color-quantexa-surface: #070612;

  /* Custom typography pairings */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "Fira Code", monospace;
}

/* Glassmorphic Glow Card styles */
.glassmorphic-card-quantexa {
  background: rgba(7, 6, 18, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.7);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glassmorphic-card-quantexa:hover {
  border-color: rgba(0, 229, 163, 0.2);
  box-shadow: 0 15px 40px -12px rgba(0, 229, 163, 0.08);
}

/* Custom radial line pattern */
.line-grid-pattern {
  background-size: 4rem 4rem;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
}`}
                  </pre>
                )}

                {activeBlueprintTab === 'js' && (
                  <pre className="text-left whitespace-pre-wrap select-all">
{`// ==========================================
// FRAMER MOTION OR GSAP FLUID ENTRY ANIMATIONS
// ==========================================

import { motion } from 'framer-motion';

// Stagger child elements smoothly as they scroll into viewport
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Smooth visual delay
      delayChildren: 0.1
    }
  }
};

// Subtle slide-up with fade-in mapping for section content
export const slideUpVariants = {
  hidden: { 
    opacity: 0, 
    y: 40 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] // Custom cubic-bezier matching original scroll fluidity
    }
  }
};

// Custom Hover Pull Action (similar to magnets)
export const cardHoverScale = {
  hover: {
    scale: 1.025,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  tap: {
    scale: 0.98
  }
};`}
                  </pre>
                )}

                {activeBlueprintTab === 'custom' && (
                  <pre className="text-left whitespace-pre-wrap select-all">
{`# CUSTOMIZATION & INTEGRATION MANUAL

To adapt this high-end Quantexa design replica with your own custom assets and copy:

1. TEXT AND LABELS CUSTOMIZATION:
   - Navigate to \`src/components/QuantexaReplication.tsx\`.
   - Update the constant arrays such as \`CASE_STUDIES\` to reflect your product stories.
   - Edit header values, buttons text, and descriptions to match your corporate domain.

2. LOGOS AND VECTOR ASSETS:
   - Replace local placeholder icons inside bento panels with your SVG graphics.
   - Use Lucide React icons matching your categories.

3. DYNAMIC DATA INTEGRATION:
   - Bind the Resolver Engine to an actual server-side REST API (e.g. your database) in \`handleResolve\`.
   - Connect the Recharts diagram dataset to actual live telemetry logs fetched from your platform's tracking API.`}
                  </pre>
                )}

              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
