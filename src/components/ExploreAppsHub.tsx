/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, ExternalLink, Sparkles, Cpu, Layers, ShieldCheck, 
  ArrowUpRight, CheckCircle2, Clock, Terminal, ChevronRight, 
  Send, ThumbsUp, MessageSquare, Filter, Zap, Globe, Smartphone,
  Lock, Check, AlertCircle, Bookmark, Compass, RefreshCw, BarChart2, Star
} from 'lucide-react';
import { Application } from '../types';
import { NeuraxLogo, SifraLogo, NooraxLogo, RexlifyLogo, RodpLogo } from './Logo';
import { useToast } from '../context/ToastContext';

interface ExploreAppsHubProps {
  applications: Application[];
  setView: (view: any) => void;
  onSimulateDownload?: (appId: string, name: string, filename: string) => void;
  onIncrementDownload?: (appId: string) => void;
}

export const SIFRA_AI_LIVE_URL = 'https://remix-sifra-professional-ai-assistant-465420538053.asia-east1.run.app';

interface CommunityRequest {
  id: string;
  name: string;
  email: string;
  targetApp: string;
  category: string;
  proposal: string;
  votes: number;
  date: string;
  status: 'Under Review' | 'Architecting' | 'Scheduled';
}

const INITIAL_COMMUNITY_REQUESTS: CommunityRequest[] = [
  {
    id: 'req-1',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.m@example.com',
    targetApp: 'Noorax Vision',
    category: 'Ethical Knowledge',
    proposal: 'Add offline audio Quranic recitation alignment alongside semantic tafsir cross-references.',
    votes: 48,
    date: '2026-06-18',
    status: 'Architecting'
  },
  {
    id: 'req-2',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    targetApp: 'NeuraX',
    category: 'AI Reasoning / Logic',
    proposal: 'Support zero-latency continuous voice streaming on low-RAM edge Android devices without cloud pinging.',
    votes: 73,
    date: '2026-06-15',
    status: 'Scheduled'
  },
  {
    id: 'req-3',
    name: 'Zaid Hossain',
    email: 'zaid.h@example.com',
    targetApp: 'Sifra AI',
    category: 'UI/UX Experience',
    proposal: 'Interactive canvas widgets for visual milestone plotting inside personal scheduling queues.',
    votes: 39,
    date: '2026-06-12',
    status: 'Under Review'
  }
];

export const ExploreAppsHub: React.FC<ExploreAppsHubProps> = ({
  applications,
  setView,
  onSimulateDownload,
  onIncrementDownload
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'upcoming' | 'ai' | 'infra' | 'islamic'>('all');
  const [selectedAppModal, setSelectedAppModal] = useState<Application | null>(null);
  const [activeTabInModal, setActiveTabInModal] = useState<'overview' | 'roadmap' | 'specs' | 'changelog'>('overview');
  
  // Community Feature Proposal Form
  const [proposerName, setProposerName] = useState('');
  const [proposerEmail, setProposerEmail] = useState('');
  const [targetApp, setTargetApp] = useState('NeuraX');
  const [proposalCategory, setProposalCategory] = useState('AI Reasoning / Logic');
  const [proposalText, setProposalText] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [communityRequests, setCommunityRequests] = useState<CommunityRequest[]>(INITIAL_COMMUNITY_REQUESTS);
  const [votedIds, setVotedIds] = useState<string[]>([]);

  const { success: toastSuccess, error: toastError } = useToast();

  // Logo resolver
  const renderAppLogo = (app: Application, size = 48) => {
    const key = app.id.toLowerCase();
    if (key.includes('neurax')) return <NeuraxLogo size={size} />;
    if (key.includes('sifra')) return <SifraLogo size={size} />;
    if (key.includes('noorax')) return <NooraxLogo size={size} />;
    if (key.includes('rexlify-ai')) {
      return (
        <div 
          className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white font-sora font-extrabold shadow-md shadow-pink-500/30"
          style={{ width: size, height: size }}
        >
          <Sparkles size={size * 0.42} className="text-white" />
          <span className="text-[9px] font-mono tracking-tighter uppercase font-bold">AI</span>
        </div>
      );
    }
    if (key.includes('rexlify')) return <RexlifyLogo size={size} showText={false} />;
    if (key.includes('rodp')) {
      return <RodpLogo size={size} showText={false} />;
    }
    if (key.includes('rizwan-innovation') || key.includes('rizwan-enovation')) {
      return (
        <div 
          className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-950 text-purple-200 font-sora font-extrabold text-xs shadow-md border border-purple-500/30"
          style={{ width: size, height: size }}
        >
          RI
        </div>
      );
    }
    
    return (
      <div 
        className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white font-sora font-extrabold uppercase shadow-md"
        style={{ width: size, height: size }}
      >
        {app.name.slice(0, 2)}
      </div>
    );
  };

  // Filter application cards
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // Category filter
      if (selectedFilter === 'live' && app.status !== 'Active') return false;
      if (selectedFilter === 'upcoming' && app.status === 'Active') return false;
      if (selectedFilter === 'ai' && !app.category.toLowerCase().includes('ai') && !app.category.toLowerCase().includes('neural') && !app.category.toLowerCase().includes('intelligence')) return false;
      if (selectedFilter === 'infra' && !app.category.toLowerCase().includes('infra') && !app.category.toLowerCase().includes('portal') && !app.category.toLowerCase().includes('cloud')) return false;
      if (selectedFilter === 'islamic' && !app.category.toLowerCase().includes('islamic')) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.shortDescription.toLowerCase().includes(q) ||
        app.fullDescription.toLowerCase().includes(q) ||
        app.tags?.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [applications, selectedFilter, searchQuery]);

  // Handle open live app or modal
  const handleAppPrimaryAction = (app: Application, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (app.id === 'sifra') {
      setView('sifra');
      toastSuccess('Launching Sifra AI', 'Entering secure autonomous co-pilot workspace.');
      return;
    }

    if (app.id === 'neurax' || app.id.toLowerCase().includes('neurax')) {
      setView('neurax');
      toastSuccess('Launching NeuraX AI', 'Entering high-velocity neural core workspace.');
      return;
    }

    if (app.id === 'rexlify-ai') {
      setView('rexlify-ai');
      toastSuccess('Launching REXLIFY AI SOFTWARE', 'Opening intelligent multimodal workspace.');
      return;
    }

    if (app.id === 'rexlify') {
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (app.id === 'rodp') {
      setView('rodp');
      toastSuccess('Launching ROD Platform', 'Opening Rizwan Online Dreams Platform application.');
      return;
    }

    if (app.id === 'rizwan-innovation' || app.id.includes('rizwan-innovation') || app.id.includes('rizwan-enovation')) {
      setView('rizwan-innovation');
      toastSuccess('Launching Rizwan Innovation', 'Entering deep tech R&D incubator.');
      return;
    }

    // Upcoming apps (NeuraX, Noorax Vision, Rizwan P.A) open dedicated roadmap deep-dive
    setSelectedAppModal(app);
    setActiveTabInModal('roadmap');
  };

  // Handle proposal submission
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposerName.trim() || !proposerEmail.trim() || !proposalText.trim()) {
      toastError('Missing Fields', 'Please complete your name, email, and proposal details.');
      return;
    }

    setIsSubmittingProposal(true);
    setTimeout(() => {
      const newReq: CommunityRequest = {
        id: `req-${Date.now()}`,
        name: proposerName.trim(),
        email: proposerEmail.trim(),
        targetApp,
        category: proposalCategory,
        proposal: proposalText.trim(),
        votes: 1,
        date: 'Just now',
        status: 'Under Review'
      };

      setCommunityRequests(prev => [newReq, ...prev]);
      setVotedIds(prev => [...prev, newReq.id]);
      setIsSubmittingProposal(false);
      setProposalText('');
      toastSuccess('Proposal Transmitted', 'Your feature proposal has been registered with the REXLIFY engineering team!');
    }, 600);
  };

  const handleVote = (reqId: string) => {
    if (votedIds.includes(reqId)) {
      toastError('Already Endorsed', 'You have already upvoted this community feature request.');
      return;
    }

    setCommunityRequests(prev => prev.map(r => r.id === reqId ? { ...r, votes: r.votes + 1 } : r));
    setVotedIds(prev => [...prev, reqId]);
    toastSuccess('Vote Recorded', 'Thank you for prioritizing this ecosystem feature!');
  };

  return (
    <div className="w-full space-y-16 py-4 animate-fadeIn select-none text-left">
      
      {/* -------------------- HERO / HUB HEADER -------------------- */}
      <section className="relative rounded-[2.5rem] p-8 md:p-12 border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/60 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Glow ambient orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-600/15 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 font-mono text-[11px] uppercase tracking-widest font-bold">
              <Compass size={13} className="text-amber-400" />
              REXLIFY APPS ECOSYSTEM & BULL; DIRECTORY & ROADMAP
            </div>

            <h1 className="font-sora text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Explore Applications &amp; Cognitive Engines
            </h1>

            <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed">
              Launch published live applications, inspect architectural blueprints, and track developmental milestones across the REXLIFY neural matrix designed by Rizwan Roushan Rownaq (Rizwan RR).
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 rounded-2xl bg-black/40 border border-white/10 shrink-0 font-mono text-center">
            <div className="px-3 py-2">
              <span className="block text-2xl md:text-3xl font-extrabold text-white font-sora">
                {applications.length}
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-1">
                Ecosystem Cores
              </span>
            </div>
            <div className="px-3 py-2 border-x border-white/10">
              <span className="block text-2xl md:text-3xl font-extrabold text-emerald-400 font-sora flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                2
              </span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mt-1 font-bold">
                Live Online
              </span>
            </div>
            <div className="px-3 py-2">
              <span className="block text-2xl md:text-3xl font-extrabold text-amber-400 font-sora">
                4
              </span>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block mt-1">
                In Pipeline
              </span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={15} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by app, capability, neural tag..."
              id="explore-apps-search-input"
              className="w-full text-xs font-mono px-4 py-3 pl-10 pr-9 rounded-2xl border border-white/10 bg-black/60 text-white placeholder-gray-400 focus:outline-none focus:border-rose-500/60 focus:bg-black/80 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Architectures' },
              { id: 'live', label: '🟢 Live Apps' },
              { id: 'upcoming', label: '⏳ In Pipeline' },
              { id: 'ai', label: '🧠 Neural & AI' },
              { id: 'islamic', label: '🌙 Islamic AI' },
              { id: 'infra', label: '⚡ Cloud & Infra' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium tracking-wide transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-gradient-to-r from-[#881337] to-[#be123c] text-white shadow-md shadow-rose-950/40 border border-rose-400/30'
                    : 'bg-white/5 text-gray-300 hover:text-white border border-white/5 hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------- APPLICATIONS GRID -------------------- */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-sora text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ecosystem Applications Matrix
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono text-xs">
              {filteredApps.length}
            </span>
          </div>

          <span className="text-xs font-mono text-gray-400 hidden sm:inline-block">
            Click any card for deep specifications &amp; roadmap
          </span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <Search className="text-gray-500 mx-auto" size={36} />
            <div className="space-y-1">
              <p className="font-sora font-semibold text-white text-lg">No applications match your criteria</p>
              <p className="font-mono text-xs text-gray-400">Try resetting filters or searching with another keyword.</p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 text-white font-mono text-xs hover:bg-white/20 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => {
              const isLive = app.status === 'Active';
              const isSifra = app.id === 'sifra';
              const isNeuraX = app.id === 'neurax';
              const isNoorax = app.id === 'noorax';

              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    setSelectedAppModal(app);
                    setActiveTabInModal('overview');
                  }}
                  className="group relative bg-[#090a12] rounded-[2.2rem] p-7 border border-white/10 hover:border-rose-500/40 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-[0_0_35px_rgba(225,29,72,0.15)]"
                >
                  {/* Subtle hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 via-amber-500/0 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Top Header & Status Badges */}
                  <div className="space-y-5 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:scale-105 transition-transform">
                        {renderAppLogo(app, 44)}
                      </div>

                      {/* Ecosystem Status Badges */}
                      {isLive ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                          <span>LIVE ONLINE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                          <Clock size={11} className="text-amber-400" />
                          <span>{app.progress ? `${app.progress}% IN DEV` : 'COMING SOON'}</span>
                        </div>
                      )}
                    </div>

                    {/* App Title & Category */}
                    <div className="space-y-1">
                      <span className="font-mono text-[10px] font-bold text-rose-400 uppercase tracking-widest block">
                        {app.category}
                      </span>
                      <h3 className="font-sora text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                        {app.name}
                      </h3>
                    </div>

                    {/* Short Description */}
                    <p className="text-gray-300 text-xs font-light leading-relaxed line-clamp-3">
                      {app.shortDescription}
                    </p>

                    {/* Milestone Progress Bar for Upcoming Apps */}
                    {!isLive && app.progress !== undefined && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-[10px] font-mono text-gray-400">
                          <span>Milestone Readiness</span>
                          <span className="text-amber-300 font-bold">{app.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-1000"
                            style={{ width: `${app.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
                    {isSifra ? (
                      <a
                        href={SIFRA_AI_LIVE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#881337] to-[#be123c] hover:from-[#9f1239] hover:to-[#e11d48] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                      >
                        <ExternalLink size={13} />
                        <span>Launch Sifra AI</span>
                      </a>
                    ) : isLive ? (
                      <button
                        type="button"
                        onClick={(e) => handleAppPrimaryAction(app, e)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                      >
                        <ArrowUpRight size={14} />
                        <span>Open Platform</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppModal(app);
                          setActiveTabInModal('roadmap');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 hover:text-amber-200 font-mono text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
                      >
                        <Clock size={13} />
                        <span>View Roadmap</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppModal(app);
                        setActiveTabInModal('specs');
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title="View System Specifications"
                    >
                      <Terminal size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* -------------------- ECOSYSTEM PIPELINE & ROADMAP MATRIX -------------------- */}
      <section className="rounded-[2.5rem] p-8 md:p-12 border border-white/10 bg-[#07080d] shadow-2xl relative overflow-hidden space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3 max-w-2xl text-left">
            <span className="px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-mono tracking-widest uppercase inline-block font-bold">
              Engineering Pipeline
            </span>
            <h2 className="font-sora text-3xl md:text-4xl font-bold text-white tracking-tight">
              Ecosystem Roadmap &amp; Milestones
            </h2>
            <p className="text-gray-300 text-sm font-light leading-relaxed">
              Transparent development trajectory of next-generation cognitive engines, distributed infrastructure, and ethical knowledge frameworks.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Pipeline Updated: Q3/Q4 2026</span>
          </div>
        </div>

        {/* Milestone Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* NeuraX Milestone Visualizer */}
          <div className="bg-black/60 rounded-[2rem] p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <NeuraxLogo size={36} />
                <div>
                  <h3 className="font-sora text-xl font-bold text-white">NeuraX Cognitive AI</h3>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Flagship Neural Model</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                65% Complete
              </span>
            </div>

            {/* Overall Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-gray-300">
                <span>Overall Development Readiness</span>
                <span className="text-amber-400 font-bold">65% Target Q4 2026</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 w-[65%]" />
              </div>
            </div>

            {/* Completed Architecture Items */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                ✓ Completed Architecture (100%)
              </span>
              <div className="space-y-2">
                {[
                  'Core Engine Architecture (100%)',
                  'UI/UX Interface Design System (100%)',
                  'Core Adaptive Intelligence Modules (100%)'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Progress Workstreams */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                ⚡ Active In-Progress Workstreams
              </span>
              <div className="space-y-2">
                {[
                  { name: 'Final Backend Integration', prog: 45 },
                  { name: 'API Fine-Tuning & Parameter Streaming', prog: 35 },
                  { name: 'Edge Mobile Deployment & NPU Bounds', prog: 20 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>{item.name}</span>
                      <span className="text-amber-300 font-mono text-[11px]">{item.prog}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.prog}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Noorax Vision Milestone Visualizer */}
          <div className="bg-black/60 rounded-[2rem] p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <NooraxLogo size={36} />
                <div>
                  <h3 className="font-sora text-xl font-bold text-white">Noorax Vision</h3>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Islamic AI Knowledge Engine</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                38% Complete
              </span>
            </div>

            {/* Overall Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-gray-300">
                <span>Project Readiness</span>
                <span className="text-amber-400 font-bold">38% Target Q1 2027</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 w-[38%]" />
              </div>
            </div>

            {/* Completed Architecture Items */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                ✓ Completed Architecture
              </span>
              <div className="space-y-2">
                {[
                  'Conceptualization & UI/UX Design System (95%)',
                  'Ontological Knowledge Mapping & Schema (90%)'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Progress Workstreams */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold block">
                ⚡ Active In-Progress Workstreams
              </span>
              <div className="space-y-2">
                {[
                  { name: 'Backend Core & Vector Pipeline', prog: 35 },
                  { name: 'Authentic Knowledge Database Structuring', prog: 30 },
                  { name: 'Knowledge Verification & Sanad Cross-Check', prog: 25 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>{item.name}</span>
                      <span className="text-amber-300 font-mono text-[11px]">{item.prog}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.prog}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Notice */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-light leading-relaxed">
              *In active engineering pipeline — scheduled release following core infrastructure rollouts.*
            </div>
          </div>

        </div>
      </section>

      {/* -------------------- COMMUNITY FEATURE REQUEST & FEEDBACK MATRIX -------------------- */}
      <section className="rounded-[2.5rem] p-8 md:p-12 border border-white/10 bg-gradient-to-b from-black/80 to-black/95 shadow-2xl space-y-10">
        
        <div className="text-left space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-mono tracking-widest uppercase font-bold">
            <MessageSquare size={12} />
            COMMUNITY ARCHITECTURE MATRIX
          </div>

          <h2 className="font-sora text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Architect the Future with REXLIFY
          </h2>

          <p className="text-gray-300 text-sm font-light leading-relaxed">
            Have a feature you want in <strong className="text-white font-semibold">NeuraX</strong>, <strong className="text-white font-semibold">Sifra AI</strong>, <strong className="text-white font-semibold">Noorax Vision</strong>, or the general REXLIFY Ecosystem? Submit your idea, and our engineering team will architect it into future builds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Submission Form */}
          <form onSubmit={handleSubmitProposal} className="lg:col-span-6 bg-white/[0.02] border border-white/10 p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl">
            <h3 className="font-sora text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              Propose an Ecosystem Feature
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Your Name</label>
                <input
                  type="text"
                  required
                  value={proposerName}
                  onChange={(e) => setProposerName(e.target.value)}
                  placeholder="e.g. Tariq Al-Mansoor"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Your Email</label>
                <input
                  type="email"
                  required
                  value={proposerEmail}
                  onChange={(e) => setProposerEmail(e.target.value)}
                  placeholder="e.g. developer@rexlify.io"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Target Architecture</label>
                <select
                  value={targetApp}
                  onChange={(e) => setTargetApp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="NeuraX">NeuraX (Cognitive AI)</option>
                  <option value="Sifra AI">Sifra AI (Autonomous Assistant)</option>
                  <option value="Noorax Vision">Noorax Vision (Islamic AI)</option>
                  <option value="RODP">RODP (Cloud Infrastructure)</option>
                  <option value="Rizwan P.A">Rizwan P.A (Personal Core)</option>
                  <option value="REXLIFY Core">REXLIFY Platform Core</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Category</label>
                <select
                  value={proposalCategory}
                  onChange={(e) => setProposalCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="AI Reasoning / Logic">AI Reasoning / Logic</option>
                  <option value="UI/UX Experience">UI/UX Experience</option>
                  <option value="Mobile Performance">Mobile Performance</option>
                  <option value="API & Cloud Integration">API &amp; Cloud Integration</option>
                  <option value="Security & Privacy">Security &amp; Privacy</option>
                  <option value="Ethical Knowledge">Ethical Knowledge</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">Detailed Feature Proposal</label>
              <textarea
                required
                rows={4}
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                placeholder="Describe your requested feature, technical edge case, or user workflow enhancement..."
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500 transition-colors leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingProposal}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#881337] to-[#be123c] hover:from-[#9f1239] hover:to-[#e11d48] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Send size={14} className={isSubmittingProposal ? 'animate-bounce' : ''} />
              <span>{isSubmittingProposal ? 'Transmitting Idea...' : 'Submit Feature Proposal'}</span>
            </button>
          </form>

          {/* Upvoted Community Ideas List */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sora text-lg font-bold text-white flex items-center gap-2">
                <ThumbsUp size={16} className="text-emerald-400" />
                Trending Community Feature Requests
              </h3>
              <span className="text-[11px] font-mono text-gray-400">
                {communityRequests.length} active ideas
              </span>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {communityRequests.map((req) => (
                <div 
                  key={req.id}
                  className="bg-white/[0.02] border border-white/10 hover:border-white/20 p-5 rounded-2xl space-y-3 transition-colors text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-mono text-[10px] font-bold">
                          {req.targetApp}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 font-mono text-[10px]">
                          {req.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono block">
                        Proposed by {req.name} &bull; {req.date}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVote(req.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                        votedIds.includes(req.id)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                      }`}
                    >
                      <ThumbsUp size={12} className={votedIds.includes(req.id) ? 'text-emerald-400' : ''} />
                      <span>{req.votes}</span>
                    </button>
                  </div>

                  <p className="text-gray-200 text-xs font-light leading-relaxed">
                    {req.proposal}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1 border-t border-white/5">
                    <span className="text-amber-400 font-medium">Status: {req.status}</span>
                    <span>Reviewed by REXLIFY Team</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* -------------------- DEDICATED APP SPECIFICATION & ROADMAP MODAL -------------------- */}
      <AnimatePresence>
        {selectedAppModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppModal(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-[#090a12] border border-rose-500/30 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_60px_rgba(225,29,72,0.2)] text-white overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                    {renderAppLogo(selectedAppModal, 48)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-sora text-2xl font-bold text-white">
                        {selectedAppModal.name}
                      </h2>
                      {selectedAppModal.status === 'Active' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                          LIVE ONLINE
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
                          {selectedAppModal.progress ? `${selectedAppModal.progress}% IN DEV` : 'IN PIPELINE'}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-rose-400 uppercase tracking-widest block mt-0.5">
                      {selectedAppModal.category} &bull; v{selectedAppModal.version}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAppModal(null)}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs in Modal */}
              <div className="flex border-b border-white/10 gap-2 mb-6 overflow-x-auto pb-1">
                {[
                  { id: 'overview', label: 'Architecture Overview' },
                  { id: 'roadmap', label: 'Milestone Roadmap' },
                  { id: 'specs', label: 'Telemetry & Specs' },
                  { id: 'changelog', label: 'Changelog History' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTabInModal(t.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                      activeTabInModal === t.id
                        ? 'bg-gradient-to-r from-[#881337] to-[#be123c] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Modal Body Content (Scrollable) */}
              <div className="overflow-y-auto pr-2 space-y-6 max-h-[48vh] text-left">
                
                {/* OVERVIEW TAB */}
                {activeTabInModal === 'overview' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h4 className="font-sora font-semibold text-sm text-gray-300 uppercase tracking-wider">
                        Core System Narrative
                      </h4>
                      <p className="text-gray-300 text-sm font-light leading-relaxed">
                        {selectedAppModal.fullDescription}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-sora font-semibold text-sm text-amber-300 uppercase tracking-wider">
                        Key Architectural Features
                      </h4>
                      <div className="space-y-2">
                        {selectedAppModal.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300">
                            <CheckCircle2 size={15} className="text-rose-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedAppModal.developerNotes && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-light text-amber-200 leading-relaxed italic">
                        &ldquo;{selectedAppModal.developerNotes}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* ROADMAP TAB */}
                {activeTabInModal === 'roadmap' && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-gray-400">Total Development Readiness</span>
                        <span className="text-amber-300 font-bold text-sm">
                          {selectedAppModal.progress !== undefined ? `${selectedAppModal.progress}%` : '100%'}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500" 
                          style={{ width: `${selectedAppModal.progress !== undefined ? selectedAppModal.progress : 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Completed Milestones */}
                    {selectedAppModal.completedMilestones && selectedAppModal.completedMilestones.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                          ✓ Completed Milestones (100%)
                        </span>
                        <div className="space-y-2">
                          {selectedAppModal.completedMilestones.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300">
                              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* In-Progress Milestones */}
                    {selectedAppModal.inProgressMilestones && selectedAppModal.inProgressMilestones.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold block">
                          ⚡ In-Progress Workstreams
                        </span>
                        <div className="space-y-2">
                          {selectedAppModal.inProgressMilestones.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300">
                              <Clock size={14} className="text-amber-400 shrink-0" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Milestones */}
                    {selectedAppModal.upcomingMilestones && selectedAppModal.upcomingMilestones.length > 0 && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold block">
                          🎯 Upcoming Release Horizons
                        </span>
                        <div className="space-y-2">
                          {selectedAppModal.upcomingMilestones.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400">
                              <ChevronRight size={14} className="text-gray-500 shrink-0" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SPECS TAB */}
                {activeTabInModal === 'specs' && (
                  <div className="space-y-4">
                    <div className="bg-black/60 rounded-2xl border border-white/10 p-5 space-y-3 font-mono text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Version Build</span>
                        <span className="text-white font-bold">{selectedAppModal.version}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Release Target / Status</span>
                        <span className="text-emerald-400 font-bold">{selectedAppModal.releaseDate}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Bundle Footprint</span>
                        <span className="text-white">{selectedAppModal.apkInfo.size}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-gray-400">Platform Compatibility</span>
                        <span className="text-white">{selectedAppModal.apkInfo.compatibility}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Runtime Security Protocol</span>
                        <span className="text-rose-400 font-bold">SOVEREIGN_ENCRYPTED</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CHANGELOG TAB */}
                {activeTabInModal === 'changelog' && (
                  <div className="space-y-4">
                    {selectedAppModal.apkInfo.changelog.map((log, idx) => (
                      <div key={idx} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm font-bold text-amber-400">v{log.version}</span>
                          <span className="font-mono text-[10px] text-gray-500">{log.date}</span>
                        </div>
                        <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
                          {log.changes.map((c, ci) => (
                            <li key={ci}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Modal Footer Actions */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <span className="text-[11px] font-mono text-gray-400">
                  REXLIFY Architecture Catalog &bull; Rizwan RR
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {selectedAppModal.id === 'sifra' ? (
                    <button
                      onClick={() => {
                        setSelectedAppModal(null);
                        setView('sifra');
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <ArrowUpRight size={14} />
                      Launch Sifra AI
                    </button>
                  ) : selectedAppModal.id === 'neurax' ? (
                    <button
                      onClick={() => {
                        setSelectedAppModal(null);
                        setView('neurax');
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <ArrowUpRight size={14} />
                      Launch NeuraX AI
                    </button>
                  ) : selectedAppModal.id.includes('rizwan-innovation') || selectedAppModal.id.includes('rizwan-enovation') ? (
                    <button
                      onClick={() => {
                        setSelectedAppModal(null);
                        setView('rizwan-innovation');
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <ArrowUpRight size={14} />
                      Launch Innovation Lab
                    </button>
                  ) : selectedAppModal.id === 'rodp' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setSelectedAppModal(null);
                          setView('rodp');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer active:scale-95"
                      >
                        <ArrowUpRight size={14} />
                        Launch RODP Application
                      </button>
                    </div>
                  ) : selectedAppModal.id === 'rexlify-ai' ? (
                    <button
                      onClick={() => {
                        setSelectedAppModal(null);
                        setView('rexlify-ai');
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95"
                    >
                      <Sparkles size={14} />
                      Launch REXLIFY AI Software
                    </button>
                  ) : selectedAppModal.status === 'Active' ? (
                    <button
                      onClick={() => {
                        setSelectedAppModal(null);
                        setView('home');
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                    >
                      <ArrowUpRight size={14} />
                      Open Portal
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedAppModal(null);
                        toastSuccess('Milestone Logged', `You are tracking ${selectedAppModal.name} in the ecosystem roadmap.`);
                      }}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Clock size={14} />
                      Coming Soon (Tracking)
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAppModal(null)}
                    className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
