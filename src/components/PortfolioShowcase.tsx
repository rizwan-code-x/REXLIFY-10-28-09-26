/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, X, Sparkles, Cpu, Layers, ExternalLink, Download, 
  Github, BookOpen, Star, ShieldCheck, Terminal, Filter, 
  ArrowUpRight, Smartphone, Globe, CheckCircle2, ChevronRight,
  Eye, Zap, RefreshCw, Hash, SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';
import { Application, ProductItem, Project, DocArticle } from '../types';
import { NeuraxLogo, SifraLogo, NooraxLogo, RexlifyLogo } from './Logo';
import { Rexlify404Modal } from './Rexlify404Modal';

export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'ai-neural' | 'web-cloud' | 'mobile-apk' | 'security-runtime' | 'developer-tools';
  categoryLabel: string;
  status: 'Active' | 'Beta' | 'Production' | 'Upcoming';
  rating: number;
  downloadsOrUsers: string;
  metricsLabel: string;
  image: string;
  logoType?: 'neurax' | 'sifra' | 'noorax' | 'rexlify' | 'custom';
  tags: string[];
  techStack: string[];
  description: string;
  longDescription: string;
  features: string[];
  liveUrl?: string;
  apkDownloadUrl?: string;
  apkSize?: string;
  githubUrl?: string;
  docsUrl?: string;
  featured?: boolean;
}

interface PortfolioShowcaseProps {
  applications: Application[];
  products: ProductItem[];
  projects: Project[];
  documents: DocArticle[];
  setView: (view: any) => void;
  onIncrementDownload?: (appId: string) => void;
  onSimulateDownload?: (appId: string, name: string, filename: string) => void;
  initialCategory?: string;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  applications,
  products,
  projects,
  documents,
  setView,
  onIncrementDownload,
  onSimulateDownload,
  initialCategory = 'all'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'rating' | 'downloads' | 'name'>('featured');
  const [selectedItemForModal, setSelectedItemForModal] = useState<PortfolioItem | null>(null);
  const [showGitHub404, setShowGitHub404] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for focusing search with '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' && 
        document.activeElement !== searchInputRef.current &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (selectedItemForModal) {
          setSelectedItemForModal(null);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemForModal, searchQuery]);

  // Combine and synthesize all applications, products, and advanced portfolio projects into a unified matrix
  const allPortfolioItems: PortfolioItem[] = useMemo(() => {
    const items: PortfolioItem[] = [];

    // 1. NeuraX Core AI
    const neuraxApp = applications.find(a => a.id === 'neurax');
    items.push({
      id: 'neurax',
      title: 'NeuraX Core Neural Engine',
      subtitle: 'Edge AI & Adaptive Context Compaction Matrix',
      category: 'ai-neural',
      categoryLabel: 'AI & Neural Systems',
      status: (neuraxApp?.status as any) || 'Active',
      rating: 4.9,
      downloadsOrUsers: 'Standalone Edge',
      metricsLabel: 'Deployment',
      image: neuraxApp?.screenshots?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
      logoType: 'neurax',
      tags: ['Neural Model', 'Offline Intelligence', 'NPU Acceleration', 'Privacy First'],
      techStack: ['TypeScript', 'C++ / WASM', 'TensorFlow Edge', 'React Native', 'Android NDK'],
      description: neuraxApp?.shortDescription || 'State-of-the-art offline neuro-cognitive engine for low-latency task processing on edge devices.',
      longDescription: neuraxApp?.fullDescription || 'NeuraX represents REXLIFY\'s core technological breakthrough in client-side intelligence. The runtime executes high-throughput neural parsing directly within device silicon, eliminating monolithic server dependencies.',
      features: neuraxApp?.features || [
        'Universal Semantic Parsing: Parses complex user directives with context awareness.',
        'Zero Cloud Leakage: 100% on-device memory indexing with cryptographic isolation.',
        'Multi-Core CPU/NPU Scheduling: Dynamic thread calibration for zero battery drain.'
      ],
      githubUrl: 'https://github.com/rizwan/neurax-core',
      docsUrl: 'doc-2',
      featured: true
    });

    // 2. Sifra AI
    const sifraApp = applications.find(a => a.id === 'sifra');
    items.push({
      id: 'sifra',
      title: 'Sifra AI Autonomous Assistant',
      subtitle: 'Proactive Workflow Executor & Glassmorphic Workspace',
      category: 'mobile-apk',
      categoryLabel: 'Mobile AI & Agentic APKs',
      status: (sifraApp?.status as any) || 'Beta',
      rating: 4.8,
      downloadsOrUsers: 'Verified Active',
      metricsLabel: 'Deployment Mode',
      image: sifraApp?.screenshots?.[0] || 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800',
      logoType: 'sifra',
      tags: ['Agentic Flow', 'Autonomous Assistant', 'Schedules', 'Glassmorphism'],
      techStack: ['React', 'TailwindCSS', 'Firebase Firestore', 'Vector Embeddings', 'Motion Engine'],
      description: sifraApp?.shortDescription || 'Autonomous personal co-pilot with proactive context triggers and multi-source document digestion.',
      longDescription: sifraApp?.fullDescription || 'Sifra AI orchestrates daily schedules, document synthesis, and contextual task alerts with seamless Firebase persistence and high-contrast glassmorphism UI.',
      features: sifraApp?.features || [
        'Conversational Agentic Workflows: Intelligently schedules, summarizes, and indexes tasks.',
        'Client-Side Vector Engine: Ingests documents into localized semantic embeddings.',
        'Sovereign Sync Protocol: Encrypted cloud backup ready for cross-device ecosystem continuity.'
      ],
      liveUrl: 'https://remix-sifra-professional-ai-assistant-465420538053.asia-east1.run.app',
      githubUrl: 'https://github.com/rizwan/sifra-core',
      docsUrl: 'doc-3',
      featured: true
    });

    // 3. CyberGuard VPN & Traffic Shield
    items.push({
      id: 'cyberguard',
      title: 'CyberGuard Quantum Shield',
      subtitle: 'Decentralized Traffic Intercept & Cryptographic Tunnel',
      category: 'security-runtime',
      categoryLabel: 'Security & Runtimes',
      status: 'Production',
      rating: 4.8,
      downloadsOrUsers: 'Cryptographic Core',
      metricsLabel: 'Security Tier',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
      logoType: 'custom',
      tags: ['Military Grade AES', 'Zero Logs', 'Mesh Proxy', 'DNS Shield'],
      techStack: ['Rust Core', 'WireGuard Protocol', 'WebAssembly', 'AES-256 GCM'],
      description: 'Ultra-fast decentralized proxy and traffic protection tunnel with sub-millisecond DNS validation.',
      longDescription: 'Engineered for high-security environments, CyberGuard guarantees zero-trace cryptographic tunnels, automated port scrubbing, and sandbox isolation against memory interception attacks.',
      features: [
        'Sub-Millisecond DNS Resolution: Eliminates external ISP packet sniffing.',
        'Zero Data Logging Tracers: RAM-only execution guarantees total privacy.',
        'Decentralized Peer Hop: Dynamic node switching prevents traffic profiling.'
      ],
      githubUrl: 'https://github.com/rizwan/cyberguard-proxy',
      featured: true
    });

    // 4. Quantexa Enterprise Replication Architecture
    items.push({
      id: 'quantexa-arch',
      title: 'Quantexa Enterprise Intelligence Framework',
      subtitle: 'Multi-Entity Graph Resolution & Financial Risk Engine',
      category: 'web-cloud',
      categoryLabel: 'Web & Cloud Architecture',
      status: 'Active',
      rating: 4.9,
      downloadsOrUsers: 'Enterprise Verified',
      metricsLabel: 'Architecture Tier',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
      logoType: 'custom',
      tags: ['Entity Resolution', 'Graph Networks', 'Enterprise Analytics', 'AML Shield'],
      techStack: ['React 18', 'TypeScript', 'Tailwind CSS', 'D3.js Graph Engine', 'Express Server'],
      description: 'High-performance contextual decision intelligence and contextual graph topology platform.',
      longDescription: 'Comprehensive recreation and architectural showcase of Quantexa decision intelligence paradigms: entity resolution, transaction fraud scoring, link analysis networks, and enterprise risk discovery.',
      features: [
        'Dynamic Force-Directed Entity Graphs: Interactive visual network exploration.',
        'Multi-Dimensional Fraud Scoring: Real-time risk heuristics analysis.',
        'Automated Alert Classification: High-precision anomaly triaging system.'
      ],
      liveUrl: '#quantexa',
      featured: true
    });

    // 5. CodeVibe Cloud Studio IDE
    items.push({
      id: 'codevibe-studio',
      title: 'CodeVibe Cloud Studio IDE',
      subtitle: 'In-Browser Collaborative IDE with Embedded AI Assistant',
      category: 'developer-tools',
      categoryLabel: 'Developer Tools',
      status: 'Active',
      rating: 4.7,
      downloadsOrUsers: 'Production Ready',
      metricsLabel: 'IDE Core',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
      logoType: 'custom',
      tags: ['Monaco Editor', 'Live AST Parsing', 'AI Autocomplete', 'Multi-Terminal'],
      techStack: ['Monaco Editor', 'WebContainers', 'TypeScript', 'Node.js', 'WebSocket'],
      description: 'Next-generation browser code editor featuring sub-millisecond AST feedback, inline AI diagnostics, and live execution.',
      longDescription: 'CodeVibe Studio provides developers with a full cloud development environment that boots in under 2 seconds, with integrated syntax linters, terminal emulators, and local hot reloading.',
      features: [
        'Instant Container Sandbox: Run Node.js and Python directly in browser memory.',
        'Contextual Code Completion: Integrated with NeuraX developer models.',
        'Split-Screen Live Preview: Instant synchronous DOM updates.'
      ],
      githubUrl: 'https://github.com/rizwan/codevibe-studio'
    });

    // 6. Noorax Cognitive Vision System
    items.push({
      id: 'noorax-vision',
      title: 'Noorax Cognitive Vision System',
      subtitle: 'High-Precision Visual Ingestion & Neural Object Classification',
      category: 'ai-neural',
      categoryLabel: 'AI & Neural Systems',
      status: 'Beta',
      rating: 4.9,
      downloadsOrUsers: 'Vision Core V2',
      metricsLabel: 'Neural Model',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
      logoType: 'noorax',
      tags: ['Computer Vision', 'OCR Engine', 'Bounding Box Detection', 'Edge Model'],
      techStack: ['Gemini 2.5 Pro Vision', 'OpenCV WASM', 'Canvas 2D', 'React 18'],
      description: 'Intelligent visual analyzer detecting objects, extracting structured OCR data, and executing multi-modal queries.',
      longDescription: 'Noorax processes camera captures and graphic files in real time, breaking down complex visual components into structured JSON metadata with sub-second latency.',
      features: [
        'Multi-Modal Semantic Ingestion: Understands sketches, diagrams, and code screenshots.',
        'Real-Time Bounding Box Overlays: Precise spatial object location indicators.',
        'Direct OCR to Markdown: Extracts code, formulas, and tabular data instantly.'
      ],
      liveUrl: '#image-analyzer',
      featured: true
    });

    // 7. REXLIFY Cloud Sync & Federated Hub
    items.push({
      id: 'rexlify-cloud-sync',
      title: 'REXLIFY Federated Cloud Hub',
      subtitle: 'Zero-Knowledge Multi-Device State Synchronization Bridge',
      category: 'web-cloud',
      categoryLabel: 'Web & Cloud Architecture',
      status: 'Production',
      rating: 4.9,
      downloadsOrUsers: '100% Uptime SLA',
      metricsLabel: 'Network SLA',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      logoType: 'rexlify',
      tags: ['Firebase Firestore', 'Cloud Run', 'Microservices', 'Zero-Knowledge'],
      techStack: ['Google Cloud Run', 'Firestore', 'Firebase Auth', 'Express', 'Vite'],
      description: 'Distributed synchronization architecture ensuring real-time configuration sync and cross-device consistency.',
      longDescription: 'Powering the entire REXLIFY digital ecosystem, this federated hub coordinates data replication, encrypted user backups, real-time message terminals, and telemetry metrics securely.',
      features: [
        'Real-Time Bidirectional Firestore Bindings: Sub-10ms state synchronization.',
        'Automated Schema Enforcement: Mathematical type validation on all transmissions.',
        'Zero Cold-Start Scalability: Engineered for instant container response.'
      ],
      docsUrl: 'doc-1'
    });

    // Add any remaining user products if they are unique
    products.forEach((prod) => {
      if (!items.find(it => it.id === prod.id)) {
        items.push({
          id: prod.id,
          title: prod.name,
          subtitle: prod.category || 'Digital Innovation',
          category: prod.category === 'AI Tool' ? 'ai-neural' : prod.category === 'Mobile App' ? 'mobile-apk' : 'web-cloud',
          categoryLabel: prod.category,
          status: 'Active',
          rating: prod.rating || 4.8,
          downloadsOrUsers: 'Verified Core',
          metricsLabel: 'Release Tier',
          image: prod.image,
          tags: ['REXLIFY', prod.category],
          techStack: ['TypeScript', 'React', 'TailwindCSS'],
          description: prod.description,
          longDescription: prod.fullDetails || prod.description,
          features: prod.features || ['High-speed execution', 'Pristine modern UI', 'Secure architecture'],
          githubUrl: prod.githubUrl,
          docsUrl: prod.docsUrl
        });
      }
    });

    return items;
  }, [applications, products]);

  // Categories list
  const categories = [
    { id: 'all', label: 'All Showcase Matrix', icon: Layers, count: allPortfolioItems.length },
    { id: 'ai-neural', label: 'AI & Neural Cores', icon: Cpu, count: allPortfolioItems.filter(i => i.category === 'ai-neural').length },
    { id: 'mobile-apk', label: 'Mobile AI APKs', icon: Smartphone, count: allPortfolioItems.filter(i => i.category === 'mobile-apk').length },
    { id: 'web-cloud', label: 'Web & Cloud Architecture', icon: Globe, count: allPortfolioItems.filter(i => i.category === 'web-cloud').length },
    { id: 'security-runtime', label: 'Security & Runtimes', icon: ShieldCheck, count: allPortfolioItems.filter(i => i.category === 'security-runtime').length },
    { id: 'developer-tools', label: 'Developer Tools', icon: Terminal, count: allPortfolioItems.filter(i => i.category === 'developer-tools').length },
  ];

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let list = allPortfolioItems;

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter(item => item.category === selectedCategory);
    }

    // Filter by Status
    if (selectedStatus !== 'all') {
      list = list.filter(item => item.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q)) ||
        item.techStack.some(ts => ts.toLowerCase().includes(q)) ||
        item.features.some(f => f.toLowerCase().includes(q))
      );
    }

    // Sort items
    return [...list].sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [allPortfolioItems, selectedCategory, selectedStatus, searchQuery, sortBy]);

  // Handle item actions
  const handleLaunch = (item: PortfolioItem) => {
    if (item.liveUrl) {
      if (item.liveUrl.startsWith('#')) {
        const viewTarget = item.liveUrl.replace('#', '');
        setView(viewTarget);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.open(item.liveUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      setSelectedItemForModal(item);
    }
  };

  const handleDownloadApk = (item: PortfolioItem) => {
    if (onSimulateDownload) {
      const filename = `${item.id}-core-release.apk`;
      onSimulateDownload(item.id, item.title, filename);
    } else if (onIncrementDownload) {
      onIncrementDownload(item.id);
    }
  };

  return (
    <section id="portfolio-matrix" className="space-y-12 py-8 relative">
      
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[450px] h-[450px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* -------------------- SECTION HEADER -------------------- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
        <div className="space-y-3 text-left max-w-3xl">
          <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Crafted Softwares & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-200">Neural Systems</span>
          </h2>
          <p className="font-sans text-gray-400 text-sm sm:text-base font-light leading-relaxed">
            Explore cutting-edge client-side AI architectures, full-stack digital platforms, mobile APKs, and security runtimes created by Rizwan RR.
          </p>
        </div>
      </div>

      {/* -------------------- SEARCH BAR & LIVE CONTROLS -------------------- */}
      <div className="space-y-4">
        
        {/* Modern Search Input with Shortcut and Clear Button */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-400 transition-colors">
            <Search size={18} />
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, AI models, tech stack (e.g. 'NeuraX', 'TypeScript', 'VPN', 'Graph')..."
            id="portfolio-interactive-search-bar"
            className="w-full text-sm font-sans px-5 py-4 pl-12 pr-28 rounded-2xl border border-white/10 bg-[#050510]/80 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/60 focus:bg-[#070718] focus:shadow-[0_0_30px_rgba(244,63,94,0.18)] transition-all duration-300 backdrop-blur-xl"
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
            
            <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">
              Press <kbd className="text-white font-bold mx-1">/</kbd>
            </span>
          </div>
        </div>

        {/* -------------------- INTUITIVE CATEGORY TABS -------------------- */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar pt-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`portfolio-cat-tab-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-amber-500/20 text-white border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.25)] scale-[1.02]'
                    : 'bg-[#060612]/70 text-gray-400 hover:text-gray-200 border border-white/5 hover:border-white/15 hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-rose-400' : 'text-gray-500'} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                  isSelected ? 'bg-rose-500 text-white font-bold' : 'bg-white/10 text-gray-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & Sort Sub-Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-2">
            <span>SHOWING:</span>
            <span className="text-white font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10">
              {filteredItems.length} of {allPortfolioItems.length} Products
            </span>
            {searchQuery && (
              <span className="text-rose-400">
                matching "{searchQuery}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter size={12} className="text-gray-500" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#080815] text-gray-300 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono focus:outline-none focus:border-rose-500/50 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="beta">Beta</option>
                <option value="production">Production</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#080815] text-gray-300 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-mono focus:outline-none focus:border-rose-500/50 cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="rating">Sort: Highest Rating</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- PORTFOLIO 3D TILT CARDS GRID -------------------- */}
      {filteredItems.length === 0 ? (
        <div className="p-16 rounded-[2.5rem] bg-[#050512]/60 border border-white/5 text-center space-y-4 backdrop-blur-xl">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
            <Search size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="font-sora text-lg font-bold text-white">No Matching Matrix Items Found</h3>
            <p className="text-sm text-gray-400 font-light max-w-md mx-auto">
              We couldn't find any projects matching your search term. Try checking for different keywords or resetting filters.
            </p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedStatus('all'); }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs tracking-wider uppercase transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => {
            return (
              <Interactive3DTiltCard
                key={item.id}
                id={`portfolio-card-${item.id}`}
                maxTilt={12}
                scaleOnHover={1.03}
                glowColor={
                  item.category === 'ai-neural' ? 'rgba(244, 63, 94, 0.22)' :
                  item.category === 'mobile-apk' ? 'rgba(245, 158, 11, 0.22)' :
                  item.category === 'security-runtime' ? 'rgba(16, 185, 129, 0.22)' :
                  'rgba(34, 211, 238, 0.22)'
                }
                className="h-full"
              >
                <div className="h-full bg-gradient-to-b from-[#090918]/90 via-[#060612]/95 to-[#04040c] rounded-[2rem] border border-white/10 hover:border-rose-500/40 p-6 flex flex-col justify-between space-y-6 shadow-2xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(244,63,94,0.15)] transition-all duration-300 backdrop-blur-xl group relative overflow-hidden">
                  
                  {/* Top Header Row with Status & Category Pill */}
                  <div className="flex items-center justify-between gap-2 z-10 translate-z-10">
                    <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 group-hover:text-white group-hover:border-white/20 transition-colors">
                      {item.categoryLabel}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${
                        item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        item.status === 'Beta' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        item.status === 'Production' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                        'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Image Banner with 3D Depth */}
                  <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden relative border border-white/10 group-hover:border-rose-500/30 transition-all duration-500 bg-[#020208] translate-z-20">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-108 transition-all duration-700 filter saturate-[0.95]"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060612] via-transparent to-black/30 pointer-events-none" />

                    {/* Dynamic floating logo badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 p-1.5 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md">
                      {item.logoType === 'neurax' && <NeuraxLogo size={22} />}
                      {item.logoType === 'sifra' && <SifraLogo size={22} />}
                      {item.logoType === 'noorax' && <NooraxLogo size={22} />}
                      {(!item.logoType || item.logoType === 'rexlify' || item.logoType === 'custom') && (
                        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white">
                          R
                        </div>
                      )}
                      <span className="text-[10px] font-sora font-semibold text-white pr-1">
                        {item.title.split(' ')[0]}
                      </span>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 border border-amber-500/30 backdrop-blur-md">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-mono font-bold text-amber-300">{item.rating}</span>
                    </div>
                  </div>

                  {/* Content Area with 3D Depth */}
                  <div className="space-y-3 flex-1 translate-z-10">
                    <h3 className="font-sora text-xl font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-rose-400/90 font-mono tracking-wide">
                      {item.subtitle}
                    </p>

                    <p className="text-gray-400 text-xs font-light leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Tech Stack Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.techStack.slice(0, 3).map((tech, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-[9px] font-mono text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {item.techStack.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-white/[0.02] text-[9px] font-mono text-gray-500">
                          +{item.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer with 3D Pop Out */}
                  <div className="pt-4 border-t border-white/5 space-y-3 translate-z-20">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>{item.metricsLabel.toUpperCase()}:</span>
                      <span className="text-white font-bold">{item.downloadsOrUsers}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {/* View Details Button Only */}
                      <button
                        onClick={() => setSelectedItemForModal(item)}
                        id={`portfolio-btn-details-${item.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>

                      {/* Quick Details Trigger */}
                      <button
                        onClick={() => setSelectedItemForModal(item)}
                        id={`portfolio-btn-modal-${item.id}`}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                        title="View Architecture Specification"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                </div>
              </Interactive3DTiltCard>
            );
          })}
        </div>
      )}

      {/* -------------------- DEEP DETAIL MODAL -------------------- */}
      <AnimatePresence>
        {selectedItemForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-2xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl bg-[#080816] border border-white/15 rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl space-y-8 overflow-hidden my-auto"
            >
              {/* Top ambient glow inside modal */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/15 rounded-full blur-[100px] pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer z-10"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300">
                    {selectedItemForModal.categoryLabel}
                  </span>
                  <span className="font-mono text-[10px] text-gray-400">
                    STATUS: <strong className="text-white">{selectedItemForModal.status}</strong>
                  </span>
                </div>

                <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-white">
                  {selectedItemForModal.title}
                </h2>
                <p className="text-sm font-mono text-rose-400">
                  {selectedItemForModal.subtitle}
                </p>
              </div>

              {/* Image & Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black relative">
                  <img 
                    src={selectedItemForModal.image} 
                    alt={selectedItemForModal.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="bg-[#050510] border border-white/10 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">RATING</div>
                    <div className="flex items-center gap-1.5 text-amber-400 font-sora text-2xl font-bold">
                      <Star size={18} className="fill-amber-400" />
                      <span>{selectedItemForModal.rating}</span>
                      <span className="text-xs text-gray-500 font-normal">/ 5.0</span>
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-white/5 pt-3">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{selectedItemForModal.metricsLabel}</div>
                    <div className="font-sora text-xl font-bold text-white">{selectedItemForModal.downloadsOrUsers}</div>
                  </div>

                  <div className="space-y-1 border-t border-white/5 pt-3">
                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">DEVELOPER</div>
                    <div className="font-mono text-xs text-emerald-400 font-semibold">Rizwan Roushan Rownaq</div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <h4 className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Architecture Specification
                  </h4>
                  <p className="text-sm text-gray-300 font-light leading-relaxed">
                    {selectedItemForModal.longDescription}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <h4 className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Key Features & Innovations
                  </h4>
                  <div className="space-y-2">
                    {selectedItemForModal.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 size={15} className="text-rose-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Chips */}
                <div className="space-y-2">
                  <h4 className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Technology Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItemForModal.techStack.map((tech, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cyan-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-white/10">
                {selectedItemForModal.liveUrl && (
                  <a
                    href={selectedItemForModal.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-sora font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <ExternalLink size={14} />
                    <span>Launch Live Application</span>
                  </a>
                )}

                {selectedItemForModal.id === 'neurax' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItemForModal(null);
                      setView('applications');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-sora font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
                  >
                    <Zap size={14} />
                    <span>Explore NeuraX Roadmap (65%)</span>
                  </button>
                )}

                {selectedItemForModal.githubUrl && (
                  <button
                    type="button"
                    onClick={() => setShowGitHub404(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-mono text-xs tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    <Github size={14} />
                    GitHub Source (404 Archive)
                  </button>
                )}

                <button
                  onClick={() => setSelectedItemForModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  Close Specification
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REXLIFY GitHub 404 Modal */}
      <Rexlify404Modal
        isOpen={showGitHub404}
        onClose={() => setShowGitHub404(false)}
        onNavigateHome={() => {
          setSelectedItemForModal(null);
          setView('home');
        }}
        onNavigateCatalog={() => {
          setSelectedItemForModal(null);
          setView('applications');
        }}
        onNavigatePortfolio={() => {
          setSelectedItemForModal(null);
          setView('portfolio');
        }}
      />
    </section>
  );
};
