/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, Star, ArrowLeft, ExternalLink, Cpu, Brain, Layers, 
  GraduationCap, Film, Compass, Search, CheckCircle2, Shield, 
  Terminal, Globe, Zap, ArrowRight, X, Play, Download, ChevronDown, 
  ChevronUp, Check, FileSpreadsheet, Server, Laptop, Activity, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActiveView } from './Navbar';
import { RexlifyLogo, SifraLogo, NeuraxLogo } from './Logo';

interface AdditionalSystemsPageProps {
  setView: (view: ActiveView) => void;
}

interface AppStoreItem {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: string;
  description: string;
  version: string;
  badge?: string;
  iconType: 'sifra' | 'neurax' | 'noorax' | 'hub' | 'institute' | 'social';
  actionView: ActiveView;
  isExternalOrModal?: boolean;
  architecture: string;
  platforms: string[];
  latency: string;
  throughput: string;
  capabilities: string[];
  securityTier: string;
}

const APPS_CATALOG: AppStoreItem[] = [
  {
    id: 'app-sifra-ai',
    name: 'Sifra AI',
    category: 'Autonomous AI Co-pilot',
    rating: 4.9,
    reviewsCount: '12.4k reviews',
    description: 'Autonomous multi-modal developer companion optimizing client-side computation, smart code diagnostics, and instant context generation.',
    version: 'v4.2.0',
    badge: 'TOP CO-PILOT',
    iconType: 'sifra',
    actionView: 'sifra',
    architecture: 'Autonomous Multi-modal Neural AST Engine',
    platforms: ['Web Platform', 'Desktop Electron', 'CLI Terminal'],
    latency: '14ms Edge Inference',
    throughput: '120 Tokens/sec',
    capabilities: [
      'Autonomous syntax tree diagnostics & code generation',
      'Multi-modal context distillation & memory mesh',
      'Client-side token compression & offline fallback',
      'Zero-telemetry privacy guard with local execution'
    ],
    securityTier: 'Enterprise Encrypted (Plan T.C)'
  },
  {
    id: 'app-neurax-ai',
    name: 'NeuraX AI',
    category: 'Next-Gen Intelligence',
    rating: 4.9,
    reviewsCount: '18.2k reviews',
    description: 'Next-generation neural reasoning matrix featuring decentralized vector indexing, semantic embeddings, and high-throughput inference.',
    version: 'v3.8.5',
    badge: 'EDGE AI ENGINE',
    iconType: 'neurax',
    actionView: 'neurax',
    architecture: 'Distributed Neural Reasoning Matrix & Vector Core',
    platforms: ['Cloud Mesh', 'WebGPU Edge', 'REST / gRPC API'],
    latency: '8ms Embedding Lookup',
    throughput: '1.2M Queries/min',
    capabilities: [
      '1536-dimensional semantic clustering & indexing',
      'Dynamic cognitive memory retrieval & vector graphs',
      'Autonomous agent tool execution & multi-hop reasoning',
      'Dynamic quantization matrix calibration'
    ],
    securityTier: 'Zero-Knowledge Cryptographic Tier'
  },
  {
    id: 'app-noorax-ai',
    name: 'NooraX AI',
    category: 'Cognitive Workspace',
    rating: 4.8,
    reviewsCount: '8.7k reviews',
    description: 'Unified cognitive workspace designed for mental flow, real-time knowledge clustering, smart contextual notes, and multi-source distillation.',
    version: 'v2.1.0',
    badge: 'PRODUCTIVITY',
    iconType: 'noorax',
    actionView: 'additional-systems',
    isExternalOrModal: true,
    architecture: 'Cognitive Associative Graph & Vector Memory',
    platforms: ['Web Workspace', 'Tablet / Stylus Canvas', 'Desktop Hub'],
    latency: '12ms Graph Traverse',
    throughput: 'Real-time Vector Sync',
    capabilities: [
      'Dynamic thought clustering & bi-directional notes',
      'Automated research paper synthesis & citation parsing',
      'Visual conceptual mapping with associative links',
      'Instant markdown, TeX & formatted PDF distillation'
    ],
    securityTier: 'Isolated Sandbox Memory'
  },
  {
    id: 'app-rexlify-hub',
    name: 'Rexlify Hub',
    category: 'Central Developer & Project Management Hub',
    rating: 5.0,
    reviewsCount: '24.1k reviews',
    description: 'Central command repository for end-to-end agile management, CI/CD telemetry pipelines, task boards, and collaborative project tracking.',
    version: 'v5.0.1',
    badge: 'DEV ESSENTIAL',
    iconType: 'hub',
    actionView: 'projects',
    architecture: 'Distributed Microservices & Reactive GitOps Pipeline',
    platforms: ['Multi-Cloud Web', 'GitHub / GitLab Hooks', 'DevOps CLI'],
    latency: 'Sub-second Webhooks',
    throughput: '100k+ Telemetry Events/sec',
    capabilities: [
      'Unified Kanban & agile sprint matrix orchestration',
      'Automated CI/CD build telemetry & deployment webhooks',
      'Granular role-based access matrix (RBAC)',
      'Hardware secrets vault & cryptographic key rotation'
    ],
    securityTier: 'DoD 5220-grade Hardware Vault'
  },
  {
    id: 'app-rexlify-institute',
    name: 'Rexlify Institute',
    category: 'Technical Courses & Certification',
    rating: 4.9,
    reviewsCount: '9.8k reviews',
    description: 'Premier technology academy offering career-aligned curriculum in full-stack engineering, neural networks, cloud architecture, and verified diplomas.',
    version: 'v2026.1',
    badge: 'ACCREDITED',
    iconType: 'institute',
    actionView: 'institute',
    architecture: 'Interactive Cloud Sandbox & Virtual Code Labs',
    platforms: ['Web Academy Portal', 'Student IDE', 'Verified Ledger'],
    latency: 'Live WebSocket IDE',
    throughput: '50+ Accredited Modules',
    capabilities: [
      'Browser-embedded Linux terminal & containerized labs',
      'Cryptographically signed verifiable digital diplomas',
      'Faculty 1-on-1 sprint reviews & live code mentorship',
      'Industry capstone portfolio validator'
    ],
    securityTier: 'Academic Identity Certification'
  },
  {
    id: 'app-rexlify-social',
    name: 'Rexlify Social Media',
    category: 'Reel-based Media Hub',
    rating: 4.9,
    reviewsCount: '31.5k reviews',
    description: 'Vertical reel feed showcasing original campus love stories, cinematic Kalyani University productions, shorts, and behind-the-scenes filmmaking.',
    version: 'v3.0.0',
    badge: 'HOT TRENDING',
    iconType: 'social',
    actionView: 'rexlify-social',
    architecture: 'Ultra Low-Latency HLS & 9:16 Video Streaming Mesh',
    platforms: ['Mobile Web PWA', 'Cinema Player', 'YouTube Channel Mesh'],
    latency: 'Zero-buffer Instant Play',
    throughput: '60 FPS 1080p Cinema Quality',
    capabilities: [
      'Campus love stories & original university cinema series',
      'Live simulated reactions, comments & heart toggles',
      'High-definition 9:16 vertical short reel viewer',
      'Direct Rexlify Prime YouTube synchronization'
    ],
    securityTier: 'Public Streaming Infrastructure'
  }
];

export const AdditionalSystemsPage: React.FC<AdditionalSystemsPageProps> = ({ setView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'productivity' | 'media'>('all');
  const [nooraxModalOpen, setNooraxModalOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [exportFeedback, setExportFeedback] = useState(false);

  const toggleExpand = (appId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const handleExportCSV = () => {
    const dataToExport = filteredApps.length > 0 ? filteredApps : APPS_CATALOG;
    
    const headers = [
      'App ID',
      'Application Name',
      'Category',
      'Star Rating',
      'Reviews Count',
      'Version',
      'Badge / Status',
      'Description',
      'Architecture Core',
      'Supported Platforms',
      'Latency Benchmark',
      'Throughput Capacity',
      'Key Capabilities',
      'Security Tier',
      'Action Target'
    ];

    const escapeCSV = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = dataToExport.map(app => [
      escapeCSV(app.id),
      escapeCSV(app.name),
      escapeCSV(app.category),
      escapeCSV(app.rating),
      escapeCSV(app.reviewsCount),
      escapeCSV(app.version),
      escapeCSV(app.badge || 'Verified'),
      escapeCSV(app.description),
      escapeCSV(app.architecture),
      escapeCSV(app.platforms.join('; ')),
      escapeCSV(app.latency),
      escapeCSV(app.throughput),
      escapeCSV(app.capabilities.join('; ')),
      escapeCSV(app.securityTier),
      escapeCSV(app.actionView)
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rexlify-systems-catalog-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportFeedback(true);
    setTimeout(() => {
      setExportFeedback(false);
    }, 2800);
  };

  const filteredApps = APPS_CATALOG.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.architecture.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'ai') return app.iconType === 'sifra' || app.iconType === 'neurax' || app.iconType === 'noorax';
    if (selectedCategory === 'productivity') return app.iconType === 'hub' || app.iconType === 'institute';
    if (selectedCategory === 'media') return app.iconType === 'social';

    return true;
  });

  const handleOpenApp = (app: AppStoreItem) => {
    if (app.iconType === 'noorax') {
      setNooraxModalOpen(true);
      return;
    }
    setView(app.actionView);
  };

  const renderIcon = (type: AppStoreItem['iconType']) => {
    switch (type) {
      case 'sifra':
        return (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-2.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0">
            <SifraLogo size={42} />
          </div>
        );
      case 'neurax':
        return (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-2.5 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white shrink-0">
            <NeuraxLogo size={42} />
          </div>
        );
      case 'noorax':
        return (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 p-2.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white shrink-0">
            <Brain size={36} className="text-white animate-pulse" />
          </div>
        );
      case 'hub':
        return (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-2.5 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white shrink-0">
            <RexlifyLogo size={42} />
          </div>
        );
      case 'institute':
        return (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-2.5 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
            <GraduationCap size={36} className="text-white" />
          </div>
        );
      case 'social':
        return (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-red-600 p-2.5 flex items-center justify-center shadow-lg shadow-rose-500/25 text-white shrink-0">
            <Film size={36} className="text-white" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#07051a] dark:bg-[#07051a] text-white selection:bg-rose-500 selection:text-white pb-24 text-left transition-colors duration-300">
      
      {/* ----------------- SUB-NAVBAR HEADER ----------------- */}
      <div className="sticky top-0 z-40 bg-[#07051a]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Main Home</span>
          </button>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-pink-600 text-white shadow-sm">
              <Layers size={16} />
            </span>
            <span className="font-sora font-extrabold text-sm sm:text-base text-white tracking-tight">
              Explore Our Additional Systems
            </span>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-[9px] font-mono text-pink-300 font-bold uppercase tracking-wider hidden md:inline">
              APP STORE CATALOG
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Data Button in Header */}
          <button
            onClick={handleExportCSV}
            id="export-data-header-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/20 text-xs font-mono text-pink-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95 group"
            title="Download application catalog list as a CSV file"
          >
            {exportFeedback ? (
              <>
                <Check size={14} className="text-emerald-400 animate-bounce" />
                <span className="text-emerald-300 font-bold">Exported!</span>
              </>
            ) : (
              <>
                <Download size={14} className="text-pink-400 group-hover:translate-y-0.5 transition-transform" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </>
            )}
          </button>

          <button
            onClick={() => setView('rexlify-social')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-mono text-rose-300 transition-all cursor-pointer"
          >
            <Film size={14} />
            <span className="hidden sm:inline">Rexlify Social Media</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* ----------------- CATALOG HERO BANNER ----------------- */}
        <div className="relative rounded-3xl overflow-hidden border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-[#07051a] to-purple-950/30 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono text-[10px] font-bold uppercase tracking-widest">
              <Sparkles size={14} className="text-pink-400" />
              <span>OFFICIAL PLAY STORE-STYLE ECOSYSTEM REPOSITORY</span>
            </div>
            <h1 className="font-sora font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              Rexlify Systems & Applications Catalog
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm font-sans leading-relaxed">
              Explore verified proprietary platforms, neural inference engines, academic academies, and reel-based social media developed under the Rexlify umbrella.
            </p>

            {/* Quick Stats & Export Banner Action */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportCSV}
                id="export-data-banner-btn"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-pink-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {exportFeedback ? (
                  <>
                    <Check size={14} className="text-white" />
                    <span>Catalog CSV Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Export Catalog Data (CSV)</span>
                  </>
                )}
              </button>

              <span className="text-xs font-mono text-gray-400 hidden sm:inline">
                • {filteredApps.length} Verified Application Modules Ready for Inspection
              </span>
            </div>
          </div>
        </div>

        {/* ----------------- SEARCH & CATEGORY FILTERS ----------------- */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-900/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              All Systems ({APPS_CATALOG.length})
            </button>
            <button
              onClick={() => setSelectedCategory('ai')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'ai'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-900/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              AI Engines & Co-pilots
            </button>
            <button
              onClick={() => setSelectedCategory('productivity')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'productivity'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-900/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              Hub & Academy
            </button>
            <button
              onClick={() => setSelectedCategory('media')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'media'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-900/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
              }`}
            >
              Media & Reels
            </button>
          </div>

          {/* Quick Search & Export Trigger */}
          <div className="flex items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog apps..."
                className="w-full text-xs font-mono pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition-all"
              />
            </div>
            
            <button
              onClick={handleExportCSV}
              id="export-catalog-csv-btn"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer shrink-0"
              title="Download CSV"
            >
              <FileSpreadsheet size={14} className="text-pink-400" />
              <span className="hidden md:inline">CSV</span>
            </button>
          </div>

        </div>

        {/* ----------------- PLAY STORE-STYLE CARD GRID WITH SMOOTH EXPANSION ----------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredApps.map((app) => {
            const isExpanded = !!expandedCards[app.id];

            return (
              <div
                key={app.id}
                className={`rounded-3xl border transition-all duration-300 backdrop-blur-xl p-6 flex flex-col justify-between ${
                  isExpanded
                    ? 'border-pink-500/60 bg-white/[0.06] shadow-[0_10px_35px_rgba(244,63,94,0.22)]'
                    : 'border-white/10 bg-white/[0.03] hover:border-pink-500/40 hover:bg-white/[0.05] hover:shadow-[0_10px_35px_rgba(244,63,94,0.15)]'
                } group`}
              >
                <div>
                  {/* Top Row: App Icon, Metadata, Badge */}
                  <div className="flex items-start gap-4">
                    {renderIcon(app.iconType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-sora font-extrabold text-lg text-white tracking-tight truncate group-hover:text-pink-300 transition-colors">
                          {app.name}
                        </h3>
                        {app.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-[8px] font-mono text-pink-300 font-bold uppercase tracking-wider shrink-0">
                            {app.badge}
                          </span>
                        )}
                      </div>
                      
                      <span className="text-xs font-sans text-gray-400 block truncate mt-0.5">
                        {app.category}
                      </span>

                      {/* Star Rating & Reviews */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center text-amber-400">
                          <Star size={12} className="fill-amber-400" />
                          <span className="font-mono text-xs font-bold text-white ml-1">
                            {app.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          ({app.reviewsCount})
                        </span>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {app.version}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Brief Description */}
                  <p className="text-xs text-gray-300 font-sans mt-4 leading-relaxed">
                    {app.description}
                  </p>

                  {/* ----------------- FRAMER MOTION SMOOTH HEIGHT EXPANSION ----------------- */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`expanded-${app.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: 'auto', 
                          opacity: 1,
                          transition: {
                            height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.25, delay: 0.05 }
                          }
                        }}
                        exit={{ 
                          height: 0, 
                          opacity: 0,
                          transition: {
                            height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.15 }
                          }
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-4 text-left">
                          
                          {/* Architecture & Security Specs */}
                          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-gray-400 flex items-center gap-1.5">
                                <Cpu size={12} className="text-pink-400" />
                                <span>Architecture:</span>
                              </span>
                              <span className="text-cyan-400 font-bold truncate max-w-[200px]" title={app.architecture}>
                                {app.architecture}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-gray-400 flex items-center gap-1.5">
                                <Shield size={12} className="text-emerald-400" />
                                <span>Security Tier:</span>
                              </span>
                              <span className="text-emerald-400 font-bold">{app.securityTier}</span>
                            </div>
                          </div>

                          {/* Benchmark Metrics Grid */}
                          <div className="grid grid-cols-2 gap-2 text-center font-mono">
                            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                              <span className="block text-[9px] text-pink-300 uppercase font-bold tracking-wider">Latency</span>
                              <span className="block text-xs font-extrabold text-white mt-0.5">{app.latency}</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                              <span className="block text-[9px] text-cyan-300 uppercase font-bold tracking-wider">Throughput</span>
                              <span className="block text-xs font-extrabold text-white mt-0.5">{app.throughput}</span>
                            </div>
                          </div>

                          {/* Supported Target Platforms */}
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5">
                              Supported Platforms
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {app.platforms.map((platform, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300"
                                >
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Key System Capabilities */}
                          <div>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5">
                              Core Capabilities
                            </span>
                            <ul className="space-y-1.5 text-[11px] text-gray-300 font-sans">
                              {app.capabilities.map((capability, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <CheckCircle2 size={12} className="text-pink-400 shrink-0 mt-0.5" />
                                  <span>{capability}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Bottom Action Row: Toggle Details & "Open" Button */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(app.id)}
                    id={`toggle-details-${app.id}`}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-pink-300 hover:text-pink-200 transition-colors cursor-pointer group/btn"
                  >
                    <span>{isExpanded ? 'Hide Specs' : 'Detailed View'}</span>
                    <ChevronDown 
                      size={14} 
                      className={`transform transition-transform duration-300 ${
                        isExpanded ? 'rotate-180 text-pink-400' : 'text-gray-400 group-hover/btn:text-pink-300'
                      }`} 
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenApp(app)}
                    id={`open-app-${app.id}`}
                    className="px-6 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md shadow-pink-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ----------------- NOORAX AI INTERACTIVE COGNITIVE WORKSPACE MODAL ----------------- */}
      {nooraxModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setNooraxModalOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-[#07051a] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Brain size={24} />
                </div>
                <div>
                  <h3 className="font-sora font-extrabold text-xl text-white">NooraX AI</h3>
                  <span className="font-mono text-xs text-emerald-400">Cognitive Workspace & Vector Notes</span>
                </div>
              </div>

              <button
                onClick={() => setNooraxModalOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 text-xs text-gray-300 leading-relaxed space-y-2">
                <p className="font-bold text-white flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Cognitive Distillation Engine Online</span>
                </p>
                <p>
                  NooraX AI connects to your active workspace session, auto-clustering conceptual thoughts, linking research references, and building dynamic vector knowledge trees.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-[10px]">Context Latency</span>
                  <span className="text-emerald-400 font-bold">12ms (Edge)</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-gray-400 block text-[10px]">Knowledge Embeddings</span>
                  <span className="text-cyan-400 font-bold">Multi-Vector 1536</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setNooraxModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-gray-400 hover:text-white cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setNooraxModalOpen(false);
                  setView('neurax');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Launch with NeuraX Core →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
