/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, Sparkles, Sliders, ChevronRight, Download, BookOpen, 
  User, Globe, Compass, Star, Calendar, Mail, CheckCircle2, AlertTriangle, ShieldAlert, 
  RefreshCw, Layers, ArrowLeft, Send, Check, Hash, QrCode,
  Search, X, Plus, Heart, UploadCloud, FileText, Lock, Eye, AlignLeft,
  MessageSquare, Scan, ExternalLink
} from 'lucide-react';
import { 
  Application, Update, Project, DocArticle, UserMessage, WebsiteContent,
  ServiceItem, ProductItem, BlogItem, VideoCenterItem, AdvertisementItem, UserAccount, FAQItem
} from '../types';
import { Hero } from './Hero';
import { MainPresentationVideo } from './MainPresentationVideo';
import { QuantexaReplication } from './QuantexaReplication';
import { NeuraxLogo, SifraLogo, RexlifyLogo } from './Logo';
import { Rexlify404Modal } from './Rexlify404Modal';
import { Roadmap } from './Roadmap';
import { motion } from 'motion/react';
import { ShowcaseFeed } from './ShowcaseFeed';
import { FAQSection } from './FAQSection';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useToast } from '../context/ToastContext';
import { Language } from '../translations';
import { INITIAL_VIDEOS } from '../data';
import { ServiceDetailModal } from './ServiceDetailModal';
import { DownloadButton } from './DownloadButton';
import { ProductReviewsModal } from './ProductReviewsModal';
import { BlogPageContent } from './BlogPageContent';
import { UserDashboardPortal } from './UserDashboardPortal';
import { Sponsors } from './Sponsors';
import { ServicesPage } from './pages/ServicesPage';
import { ProductsPage } from './pages/ProductsPage';
import { BlogPage } from './pages/BlogPage';
import { DashboardPage } from './pages/DashboardPage';
import { ImageAnalyzer } from './ImageAnalyzer';
import { PortfolioShowcase } from './PortfolioShowcase';
import { ModernPortfolioPage } from './ModernPortfolioPage';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';
import { ReadingProgressBar } from './ReadingProgressBar';
import { ExploreAppsHub } from './ExploreAppsHub';
import { RexlifyInstitute } from './RexlifyInstitute';
import { FacultyRecruitment } from './FacultyRecruitment';
import { ExploreSystemPage } from './ExploreSystemPage';
import { SaraAIPage } from './SaraAIPage';

const fadeInUpVariants: any = {
  hidden: { opacity: 0, y: 35 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

export const LoopingVideoBackground: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      // Pause for 2 seconds, then reset and play again
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch((err) => console.warn("Video playback was interrupted:", err));
        }
      }, 2000);
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 rounded-[2.5rem]">
      {/* Deep black/dark glass tint overlay to keep high visual contrast */}
      <div className="absolute inset-0 bg-black/75 z-10" />
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover opacity-40 transform scale-[1.02] filter saturate-[0.85]"
      />
    </div>
  );
};

interface FrontendPagesProps {
  is3DMode: boolean;
  language: Language;
  currentView: string;
  setView: (view: any) => void;
  applications: Application[];
  updates: Update[];
  projects: Project[];
  documents: DocArticle[];
  faqs?: FAQItem[];
  onVoteHelpfulFAQ?: (faqId: string) => void;
  content: WebsiteContent;
  services: ServiceItem[];
  products: ProductItem[];
  blogPosts: BlogItem[];
  videos: VideoCenterItem[];
  ads: AdvertisementItem[];
  activeUser: UserAccount;
  showcaseScreenshots?: any[];
  platformFeatures?: any[];
  apkDownloadLink?: string;
  customUiComponents?: any[];
  socialMediaLinks?: any;
  onUpdateActiveUser: (user: UserAccount) => void;
  onUpdateProducts: (products: ProductItem[]) => void;
  onUpdateBlogPosts: (blog: BlogItem[]) => void;
  onUpdateVideos: (videos: VideoCenterItem[]) => void;
  onUpdateAds: (ads: AdvertisementItem[]) => void;
  onAddMessage: (msg: Omit<UserMessage, 'id' | 'date' | 'isImportant' | 'isRead'>) => void;
  onIncrementDownload: (appId: string) => void;
}

export const FrontendPages: React.FC<FrontendPagesProps> = ({
  is3DMode,
  language,
  currentView,
  setView,
  applications,
  updates,
  projects,
  documents,
  faqs = [],
  onVoteHelpfulFAQ,
  content,
  services,
  products,
  blogPosts,
  videos,
  ads,
  activeUser,
  showcaseScreenshots = [],
  platformFeatures = [],
  apkDownloadLink = '',
  customUiComponents = [],
  onUpdateActiveUser,
  onUpdateProducts,
  onUpdateBlogPosts,
  onUpdateVideos,
  onUpdateAds,
  onAddMessage,
  onIncrementDownload,
}) => {
  // Application details view
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // APK Download simulation and installation guide states
  const [downloadingAppId, setDownloadingAppId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState<{ appName: string, filename: string } | null>(null);
  const [showGitHub404, setShowGitHub404] = useState(false);

  // Periodic progress simulator for downloading apps
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (downloadingAppId) {
      interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Complete APK download action
            const app = applications.find(a => a.id === downloadingAppId);
            const appName = app ? app.name : 'Sifra AI';
            const filename = downloadingAppId === 'sifra' ? 'sifra-core-v1.0.2-beta.apk' : `${downloadingAppId}-core-v2.4.0.apk`;
            
            // Increment the download metric
            onIncrementDownload(downloadingAppId);

            if (apkDownloadLink && apkDownloadLink.startsWith('http')) {
              const a = document.createElement('a');
              a.href = apkDownloadLink;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } else {
              // Construct and download a mock/stub APK file blob
              const dummyApkContent = new Uint8Array([80, 75, 3, 4, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // ZIP/APK Magic Header
              const blob = new Blob([dummyApkContent], { type: 'application/vnd.android.package-archive' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }

            // Trigger show installation guide modal
            setShowInstallGuideModal({ appName, filename });
            setDownloadingAppId(null);
            return 0;
          }
          return prev + Math.floor(Math.random() * 20) + 12;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [downloadingAppId, applications, onIncrementDownload]);

  const handleTriggerAndSimulateDownload = (appId: string, appName: string, filename: string) => {
    if (downloadingAppId) return;
    setDownloadProgress(0);
    setDownloadingAppId(appId);
  };

  const { success: toastSuccess, info: toastInfo } = useToast();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedApp(null);
        setShowInstallGuideModal(null);
      }
    };
    const handleSelectApp = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.appId) {
        const found = applications.find(a => a.id === customEvent.detail.appId);
        if (found) {
          setSelectedApp(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };
    const handleSelectProject = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.projectName) {
        setTimeout(() => {
          setSearchQuery(customEvent.detail.projectName);
        }, 100);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    const handleSelectDoc = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.docId) {
        const found = documents.find(d => d.id === customEvent.detail.docId);
        if (found) {
          setActiveDoc(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('rexlify-select-app', handleSelectApp);
    window.addEventListener('rexlify-select-project', handleSelectProject);
    window.addEventListener('rexlify-select-doc', handleSelectDoc);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('rexlify-select-app', handleSelectApp);
      window.removeEventListener('rexlify-select-project', handleSelectProject);
      window.removeEventListener('rexlify-select-doc', handleSelectDoc);
    };
  }, [applications, documents]);

  
  // Selected documentation article
  const [activeDoc, setActiveDoc] = useState<DocArticle>(documents[0] || null);
  const activeDocRef = React.useRef<HTMLDivElement>(null);

  // Filter conditions
  const [appFilter, setAppFilter] = useState<string>('All');
  const [updateFilter, setUpdateFilter] = useState<string>('All');

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reset search query when currentView changes
  React.useEffect(() => {
    setSearchQuery('');
  }, [currentView]);

  // Reusable search bar component block styled premium cyber-glass high contrast
  const renderSearchBar = (placeholder: string) => {
    return (
      <div className="relative w-full sm:max-w-xs md:max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search size={13} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          id="system-realtime-search-input"
          className="w-full text-xs font-mono px-4 py-2.5 pl-9 pr-9 rounded-xl border border-white/5 bg-white/[0.02] text-white placeholder-gray-500 focus:outline-none focus:border-[#be123c]/60 focus:bg-white/[0.04] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>
    );
  };

  // Contact form submission state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formCategory, setFormCategory] = useState<any>('Contact');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Handle message post
  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formMessage) return;
    

    // Transmit to Supabase (via API)
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName,
        email: formEmail,
        subject: formSubject || 'Ecosystem Query',
        message: formMessage,
      })
    }).catch(err => console.error('Feedback submit error:', err));

    onAddMessage({
      senderName: formName,
      senderEmail: formEmail,
      subject: formSubject || 'Ecosystem Query',
      category: formCategory,
      message: formMessage,
    });

    toastSuccess('Message Transmitted', 'Your inquiry has been sent to Rizwan RR and the Rexlify support team!');
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
    }, 4000);
  };

  // Render Application Logo based on metadata key
  const renderLogo = (logoKey?: string, size = 48) => {
    const key = (logoKey || '').toLowerCase();
    if (key === 'neurax') return <NeuraxLogo size={size} />;
    if (key === 'sifra') return <SifraLogo size={size} />;
    if (key === 'rexlify-ai' || key.includes('rexlify-ai')) {
      return (
        <div 
          className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white font-sora font-extrabold shadow-lg shadow-pink-500/30"
          style={{ width: size, height: size }}
        >
          <Sparkles size={size * 0.42} className="text-white" />
          <span className="text-[9px] font-mono tracking-tighter uppercase font-bold">AI</span>
        </div>
      );
    }
    if (key === 'rodp') {
      return (
        <div 
          className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-sora font-extrabold text-xs shadow-lg shadow-cyan-500/20"
          style={{ width: size, height: size }}
        >
          RODP
        </div>
      );
    }
    return <RexlifyLogo size={size} showText={false} />;
  };

  // Helper for Status badges
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Beta': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Coming Soon': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'Archived': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded-full border ${colors[status] || 'bg-gray-500/10 text-gray-400 border-white/5'}`}>
        {status}
      </span>
    );
  };

  // Dedicated Full-Width Portfolio View
  if (currentView === 'portfolio') {
    return (
      <div className="w-full">
        <ModernPortfolioPage
          applications={applications}
          projects={projects}
          documents={documents}
          setView={setView}
          onAddMessage={onAddMessage}
        />
      </div>
    );
  }

  // Render Section Components based on exact tabs
  const isFullWidthView = ['home', 'institute', 'faculty', 'explore-system'].includes(currentView);

  return (
    <div className={`w-full ${isFullWidthView ? '' : 'px-4 md:px-10 lg:px-16 py-6'}`}>
      
      {/* -------------------- GEMINI AI VISION ANALYZER -------------------- */}
      {currentView === 'image-analyzer' && <ImageAnalyzer />}

      {/* -------------------- EXPLORE OUR SYSTEM PAGE -------------------- */}
      {currentView === 'explore-system' && <ExploreSystemPage setView={setView} />}

      {/* -------------------- REXLIFY INSTITUTE PAGE -------------------- */}
      {currentView === 'institute' && <RexlifyInstitute setView={setView} />}

      {/* -------------------- FACULTY RECRUITMENT PAGE -------------------- */}
      {currentView === 'faculty' && <FacultyRecruitment setView={setView} />}

      {/* -------------------- SARA AI SUITE (CUSTOMER CARE, HELP CENTRE, CHAT, VOICE) -------------------- */}
      {['customer-care', 'help-centre', 'sara-chat', 'sara-voice'].includes(currentView) && (
        <SaraAIPage
          initialMode={
            currentView === 'customer-care' ? 'customer-care' :
            currentView === 'help-centre' ? 'help' :
            currentView === 'sara-voice' ? 'voice' : 'chat'
          }
          setView={setView}
          onAddMessage={onAddMessage}
        />
      )}

      {/* -------------------- HOME PAGE -------------------- */}
      {currentView === 'home' && (
        <div className="space-y-24">
          <Hero 
            heroTitle={content.heroTitle} 
            heroSubtitle={content.heroSubtitle} 
            setView={setView}
            appsCount={applications.length}
            projectsCount={projects.length}
            updatesCount={updates.length}
            language={language}
          />

          <div className="px-4 md:px-10 lg:px-16 space-y-24">
            {/* Master Portfolio & Innovation Matrix */}
            <PortfolioShowcase
              applications={applications}
              products={products}
              projects={projects}
              documents={documents}
              setView={setView}
              onIncrementDownload={onIncrementDownload}
              onSimulateDownload={handleTriggerAndSimulateDownload}
            />

          {/* Why REXLIFY Section - Architectural Core Concepts */}
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainerVariants}
            className="space-y-10"
          >
            <motion.div variants={fadeInUpVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/5">
              <div className="space-y-3 max-w-2xl text-left">
                <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-widest uppercase inline-block font-semibold">
                  Core Architecture
                </span>
                <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  Architectural Core Concepts
                </h2>
              </div>
              <p className="font-sans text-gray-400 text-sm max-w-md pb-1 text-left md:text-right font-light leading-relaxed">
                Foundational engineering principles designed by Rizwan RR for client-first performance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            </div>
          </motion.section>

          
          {/* Core Features 3D Mode */}
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            variants={staggerContainerVariants}
            className="space-y-12 pt-16 border-t border-white/10"
          >
            <motion.div variants={fadeInUpVariants} className="text-center space-y-4 max-w-2xl mx-auto">
              <span className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-mono tracking-widest uppercase inline-block">
                Digital Core
              </span>
              <h2 className="font-sora text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
                Platform Features
              </h2>
              <p className="text-gray-400 text-sm font-light">
                Experience next-generation digital architecture with 3D spatial integration and extreme performance metrics.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {platformFeatures.map((feat, i) => (
                <motion.div key={i} variants={fadeInUpVariants} className={`bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-500 ${is3DMode ? "hover:-translate-y-2 shadow-2xl transform perspective-1000" : ""}`}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-amber-500/15 transition-colors duration-700" />
                  
                  <div className="space-y-6 relative z-10 text-center flex flex-col items-center">
                    <div className={`w-20 h-20 bg-[#080703] border border-amber-500/30 rounded-3xl flex items-center justify-center text-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.2),0_10px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[inset_0_0_30px_rgba(245,158,11,0.35),0_15px_30px_rgba(245,158,11,0.2)] group-hover:text-amber-300 group-hover:border-amber-400/60 transition-all duration-500 ${is3DMode ? "transform perspective-1000 group-hover:rotate-x-12" : ""}`}>
                      {(() => {
                        const IconComponent = 
                          feat.icon === 'Globe2' || feat.icon === 'Globe' ? Globe :
                          feat.icon === 'ShieldCheck' || feat.icon === 'Shield' || feat.icon === 'ShieldAlert' ? ShieldAlert :
                          feat.icon === 'Cpu' ? Cpu :
                          feat.icon === 'Sparkles' ? Sparkles :
                          feat.icon === 'Sliders' ? Sliders :
                          RefreshCw;
                        return <IconComponent size={36} className="drop-shadow-[0_0_15px_rgba(245,158,11,0.7)]" />;
                      })()}
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-sora text-xl font-semibold text-white group-hover:text-amber-400 transition-colors">{feat.title}</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Quick Roadmaps Concept Overview */}
          <section />

          {/* Collapsible FAQ Component */}
          <FAQSection faqs={faqs} onVoteHelpful={onVoteHelpfulFAQ} onOpenContact={() => setView('contact')} />

          {/* SYSTEM PRESENTATION PORTFOLIO VIDEO SECTION */}
          <motion.section 
            id="presentation-portfolio-showcase"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUpVariants}
            className="pt-16 space-y-12"
          >
            <div className="text-center space-y-6">
              <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono tracking-widest uppercase inline-flex items-center gap-2 mx-auto">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OFFICIAL SYSTEM PITCH
              </span>
              <h2 className="font-sora text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
                Presentation & Portfolio Showcase
              </h2>
              <p className="font-sans text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed">
                আমাদের অফিশিয়াল প্রেজেন্টেশন এবং পোর্টফোলিও ভিডিওটি নিচে দেখতে পারেন। এটিতে আমাদের ক্লাইন্ট-পারস্পেক্টিভ মডেল হ্যান্ডশেক, ডাইনামিক ড্যাশবোর্ড এবং এআই সমাধানগুলোর কার্যকরী ডেমো বিস্তারিতভাবে তুলে ধরা হয়েছে।
              </p>
            </div>

            <div className="relative z-10 bg-[#050505] p-2 sm:p-4 rounded-[2.5rem] border border-white/10">
              <div className="overflow-hidden rounded-[2rem] bg-black">
                <MainPresentationVideo />
              </div>
            </div>
          </motion.section>

          {/* DYNAMIC CUSTOM UI COMPONENTS COMPILED SECTIONS */}
          {customUiComponents && customUiComponents.filter((c: any) => c.visible).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((comp: any) => (
            <motion.section
              key={comp.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainerVariants}
              className="space-y-8 pt-8"
            >
              <motion.div variants={fadeInUpVariants} className="text-left space-y-3">
                <span className={`px-3 py-1 rounded-full border text-[10px] font-mono tracking-widest uppercase inline-block ${
                  comp.accentColor === 'rose' ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' :
                  comp.accentColor === 'amber' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                  comp.accentColor === 'cyan' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' :
                  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                }`}>
                  {comp.subtitle || 'System Integration Extension'}
                </span>
                <h2 className="font-sora text-4xl font-semibold text-white tracking-tight leading-tight">
                  {comp.title}
                </h2>
              </motion.div>

              {comp.layout === 'single' && (
                <motion.div
                  variants={fadeInUpVariants}
                  className={`bg-[#050505] p-8 md:p-12 rounded-[2.5rem] border relative overflow-hidden group transition-all duration-500 ${
                    comp.accentColor === 'rose' ? 'border-rose-500/10 hover:border-rose-500/30' :
                    comp.accentColor === 'amber' ? 'border-amber-500/10 hover:border-amber-500/30' :
                    comp.accentColor === 'cyan' ? 'border-cyan-500/10 hover:border-cyan-500/30' :
                    'border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-colors duration-700 ${
                    comp.accentColor === 'rose' ? 'bg-rose-500/5 group-hover:bg-rose-500/10' :
                    comp.accentColor === 'amber' ? 'bg-amber-500/5 group-hover:bg-amber-500/10' :
                    comp.accentColor === 'cyan' ? 'bg-cyan-500/5 group-hover:bg-cyan-500/10' :
                    'bg-emerald-500/5 group-hover:bg-emerald-500/10'
                  }`} />
                  
                  <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
                    <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed whitespace-pre-wrap">
                      {comp.content}
                    </p>
                  </div>
                </motion.div>
              )}

              {comp.layout === 'bento' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div
                    variants={fadeInUpVariants}
                    className={`bg-[#050505] p-8 rounded-[2.5rem] border md:col-span-2 relative overflow-hidden group transition-all duration-500 ${
                      comp.accentColor === 'rose' ? 'border-rose-500/10 hover:border-rose-500/30' :
                      comp.accentColor === 'amber' ? 'border-amber-500/10 hover:border-amber-500/30' :
                      comp.accentColor === 'cyan' ? 'border-cyan-500/10 hover:border-cyan-500/30' :
                      'border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="relative z-10 space-y-4">
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{comp.content}</p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeInUpVariants}
                    className={`bg-[#050505] p-8 rounded-[2.5rem] border relative overflow-hidden group flex flex-col justify-between min-h-[220px] transition-all duration-500 ${
                      comp.accentColor === 'rose' ? 'border-rose-500/10 hover:border-rose-500/30' :
                      comp.accentColor === 'amber' ? 'border-amber-500/10 hover:border-amber-500/30' :
                      comp.accentColor === 'cyan' ? 'border-cyan-500/10 hover:border-cyan-500/30' :
                      'border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest font-bold">Node telemetry</span>
                      <h4 className="font-sora text-lg font-semibold text-white">Active Extension</h4>
                    </div>
                    <div className="font-mono text-xs text-gray-400 space-y-1">
                      <div>Status: <span className="text-emerald-400">Synced</span></div>
                      <div>Weight: <span className="text-amber-400">{comp.order}</span></div>
                    </div>
                  </motion.div>
                </div>
              )}

              {comp.layout === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    variants={fadeInUpVariants}
                    className={`bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border relative overflow-hidden group flex flex-col justify-center transition-all duration-500 ${
                      comp.accentColor === 'rose' ? 'border-rose-500/10 hover:border-rose-500/30' :
                      comp.accentColor === 'amber' ? 'border-amber-500/10 hover:border-amber-500/30' :
                      comp.accentColor === 'cyan' ? 'border-cyan-500/10 hover:border-cyan-500/30' :
                      'border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="space-y-4">
                      <h3 className="font-sora text-2xl font-semibold text-white">{comp.title} Core</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">This dynamically constructed viewport displays compiled microservices configured by the security lead.</p>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={fadeInUpVariants}
                    className={`bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border relative overflow-hidden group transition-all duration-500 ${
                      comp.accentColor === 'rose' ? 'border-rose-500/10 hover:border-rose-500/30' :
                      comp.accentColor === 'amber' ? 'border-amber-500/10 hover:border-amber-500/30' :
                      comp.accentColor === 'cyan' ? 'border-cyan-500/10 hover:border-cyan-500/30' :
                      'border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{comp.content}</p>
                  </motion.div>
                </div>
              )}
            </motion.section>
          ))}
          </div>
        </div>
      )}



      {/* -------------------- SHOWCASE PAGE -------------------- */}
      {currentView === 'showcase' && (
        <ShowcaseFeed 
          videos={videos} 
          activeUser={activeUser} 
          onUpdateActiveUser={onUpdateActiveUser} 
          onUpdateVideos={onUpdateVideos} 
        />
      )}

      {/* -------------------- ABOUT PAGE -------------------- */}
      {currentView === 'about' && (
        <div className="space-y-16 py-12">
          
          <div className="max-w-3xl space-y-6">
            <span className="font-mono text-xs tracking-[0.25em] text-rose-500 uppercase font-semibold">
              DEVELOPER COGNITIVE CHRONICLES
            </span>
            <h1 className="font-sora text-4xl font-extrabold text-white tracking-tight">
              About REXLIFY & Rizwan RR
            </h1>
            <p className="text-gray-400 text-base font-light leading-loose">
              Exploring the core story, visions, and technologies powering Rizwan Roushan Rownaq's digital architecture platform.
            </p>
          </div>

          {/* Grid Core Story */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-[#050505] border border-white/10 p-8 rounded-[2.5rem] space-y-4 hover:border-emerald-500/30 transition-colors duration-500">
                <h3 className="font-sora text-xl font-semibold text-white border-b border-white/10 pb-4">
                  The REXLIFY Project Story
                </h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed whitespace-pre-line">
                  {content.aboutStory}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Mission Statement: Redesigned with transparent pink background and golden/white typography */}
                <div className="bg-pink-500/[0.08] border border-pink-500/30 p-8 rounded-[2rem] space-y-4 backdrop-blur-md hover:border-pink-500/50 transition-colors duration-500">
                  <h4 className="font-sora font-extrabold text-lg flex items-center gap-3 bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
                    <Star size={18} className="text-pink-400" />
                    Mission Statement
                  </h4>
                  <p className="text-stone-100 text-sm font-light leading-relaxed">
                    {content.aboutMission}
                  </p>
                </div>

                <div className="bg-[#050505] border border-white/10 p-8 rounded-[2rem] space-y-4 hover:border-emerald-500/30 transition-colors duration-500">
                  <h4 className="font-sora font-semibold text-lg text-white flex items-center gap-3">
                    <Compass size={18} className="text-emerald-500" />
                    Ecosystem Vision
                  </h4>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">
                    {content.aboutVision}
                  </p>
                </div>
              </div>

              {/* PRINCIPAL ECOSYSTEM RUNTIMES WITH HIGH RESOLUTION BRAND LOGOS */}
              <div className="bg-[#050505] border border-white/10 p-8 md:p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
                
                <h3 className="font-sora text-xl font-semibold text-white border-b border-white/10 pb-4">
                  Principal Ecosystem Runtimes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {/* NeuraX integration card */}
                  <div className="space-y-4 text-left p-6 rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex justify-between items-start">
                      <NeuraxLogo size={48} />
                      <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 tracking-widest">
                        ACTIVE CORE
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs font-light leading-relaxed pt-2">
                      NeuraX serves as the principal intelligent parameter compiler within the REXLIFY environment. Designed for maximum speed and security, it runs fully local workflows with zero network dependency.
                    </p>
                  </div>

                  {/* Sifra AI integration card */}
                  <div className="space-y-4 text-left p-6 rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex justify-between items-start">
                      <SifraLogo size={48} />
                      <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 tracking-widest">
                        ACTIVE BETA
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs font-light leading-relaxed pt-2">
                      Sifra AI acts as your customized agentic assistant. Built with sleek glastic dashboards, it syncs with user schedules, database backends, and context queues to automate daily schedules safely.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Profile: Redesigned with transparent pink background, golden-white text, and golden name */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-pink-500/[0.12] border-2 border-pink-500/30 hover:border-pink-500/50 p-8 rounded-[2.5rem] space-y-8 relative overflow-hidden group transition-all duration-500 shadow-xl shadow-pink-500/[0.05] backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[40px] rounded-full -z-10 group-hover:bg-pink-500/20 transition-colors duration-700" />
                
                <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-pink-500/50 group-hover:border-amber-400/80 transition-all duration-500 shadow-lg shadow-pink-500/20">
                    <img 
                      src="/IMG-20260912-WA0005.jpg" 
                      onError={(e) => {
                        e.currentTarget.src = "/rizwan_profile.jpg";
                      }}
                      alt="Rizwan Roushan Rownaq Profile" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sora font-extrabold text-3xl tracking-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                      Rizwan RR
                    </h3>
                    <span className="font-mono text-[9px] text-pink-300 tracking-[0.2em] uppercase font-bold block">
                      FOUNDER & PRINCIPAL ARCHITECT
                    </span>
                  </div>
                </div>

                <p className="text-yellow-50/90 text-sm font-light leading-relaxed text-center md:text-left whitespace-pre-line drop-shadow-xs">
                  {content.founderBio}
                </p>

                <div className="h-px bg-pink-500/20 my-6" />

                <div className="space-y-5">
                  <span className="font-mono text-[10px] text-amber-300 uppercase tracking-widest block text-center md:text-left font-bold">
                    Official Links
                  </span>
                  <div className="flex flex-col gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowGitHub404(true)} 
                      className="flex items-center gap-3 text-sm text-yellow-100 hover:text-amber-300 transition-colors cursor-pointer text-left"
                    >
                      <Hash size={16} className="text-pink-400" />
                      Github Workspace (404 Archive)
                    </button>
                    <a 
                      href={content.telegramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-sm text-yellow-100 hover:text-amber-300 transition-colors"
                    >
                      <Send size={16} className="text-pink-400" />
                      Telegram Broadcast
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PRIVACY POLICY PAGE -------------------- */}
      {currentView === 'privacy' && (
        <div className="space-y-12 py-12 text-left max-w-4xl mx-auto">
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-[0.25em] text-[#d97706] uppercase font-bold">
              LEGAL DOCUMENTATION
            </span>
            <h1 className="font-sora text-4xl font-extrabold text-white tracking-tight">
              Privacy Policy – REXLIFY
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Effective Date: July 22, 2026
            </p>
          </div>

          <div className="bg-[#050505] border border-white/10 p-8 md:p-10 rounded-[2.5rem] space-y-8 leading-relaxed font-sans text-gray-300">
            <section className="space-y-3">
              <p className="text-sm font-light text-gray-400">
                Welcome to REXLIFY. Your privacy is important to us. This Privacy Policy explains how we collect, use, protect, and manage your information when you visit our website or use any REXLIFY products and services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">1. Information We Collect</h2>
              <p className="text-sm font-light text-gray-400">We may collect:</p>
              <ul className="list-disc list-inside text-sm font-light text-gray-400 space-y-2">
                <li>Your name (if you provide it)</li>
                <li>Email address</li>
                <li>Contact information</li>
                <li>Device and browser information</li>
                <li>IP address</li>
                <li>Cookies and usage analytics</li>
                <li>Information you submit through forms, feedback, or support requests</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">2. How We Use Your Information</h2>
              <p className="text-sm font-light text-gray-400">We use your information to:</p>
              <ul className="list-disc list-inside text-sm font-light text-gray-400 space-y-2">
                <li>Provide and improve our services</li>
                <li>Respond to support requests</li>
                <li>Send important updates</li>
                <li>Improve website performance</li>
                <li>Enhance security and prevent misuse</li>
                <li>Develop new features and products</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">3. Cookies</h2>
              <p className="text-sm font-light text-gray-400">
                REXLIFY may use cookies and similar technologies to improve user experience, remember preferences, and analyze website traffic.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">4. Data Security</h2>
              <p className="text-sm font-light text-gray-400">
                We implement reasonable security measures to protect your personal information. However, no online system can guarantee 100% security.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">5. Third-Party Services</h2>
              <p className="text-sm font-light text-gray-400">
                Some services may integrate with trusted third-party providers such as authentication, analytics, cloud storage, AI services, or payment providers. Their own privacy policies also apply.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">6. User Responsibilities</h2>
              <p className="text-sm font-light text-gray-400">
                Users should provide accurate information and must not misuse the website or any REXLIFY services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">7. Children's Privacy</h2>
              <p className="text-sm font-light text-gray-400">
                Our services are not intentionally designed for children under the age required by applicable law without parental permission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">8. Changes to This Policy</h2>
              <p className="text-sm font-light text-gray-400">
                We may update this Privacy Policy at any time. Changes become effective immediately after publication on this website.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">9. Contact</h2>
              <p className="text-sm font-light text-gray-400">
                For questions regarding this Privacy Policy, please contact us through the official REXLIFY website or official support channels.
              </p>
              <p className="text-sm font-light text-gray-400 mt-4">
                By using REXLIFY, you agree to this Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* -------------------- TERMS & CONDITIONS PAGE -------------------- */}
      {currentView === 'terms' && (
        <div className="space-y-12 py-12 text-left max-w-4xl mx-auto">
          <div className="space-y-4">
            <span className="font-mono text-xs tracking-[0.25em] text-[#d97706] uppercase font-bold">
              LEGAL AGREEMENT
            </span>
            <h1 className="font-sora text-4xl font-extrabold text-white tracking-tight">
              Terms & Conditions – REXLIFY
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Effective Date: July 22, 2026
            </p>
          </div>

          <div className="bg-[#050505] border border-white/10 p-8 md:p-10 rounded-[2.5rem] space-y-8 leading-relaxed font-sans text-gray-300">
            <section className="space-y-3">
              <p className="text-sm font-light text-gray-400">
                Welcome to REXLIFY. By accessing or using our website, applications, or services, you agree to the following Terms & Conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">1. Acceptance of Terms</h2>
              <p className="text-sm font-light text-gray-400">
                Using any REXLIFY product or service means you accept these Terms & Conditions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">2. Services</h2>
              <p className="text-sm font-light text-gray-400">
                REXLIFY provides websites, web applications, AI tools, software, digital products, downloads, updates, educational resources, and other technology-related services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">3. User Conduct</h2>
              <p className="text-sm font-light text-gray-400">Users agree not to:</p>
              <ul className="list-disc list-inside text-sm font-light text-gray-400 space-y-2">
                <li>Violate any applicable laws</li>
                <li>Attempt unauthorized access to our systems</li>
                <li>Upload harmful or malicious content</li>
                <li>Interfere with the security or operation of our services</li>
                <li>Copy, redistribute, or misuse REXLIFY content without permission</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">4. Intellectual Property</h2>
              <p className="text-sm font-light text-gray-400">
                All logos, branding, software, website content, graphics, designs, code, trademarks, and other intellectual property belong to REXLIFY unless otherwise stated. Unauthorized use is prohibited.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">5. User Accounts</h2>
              <p className="text-sm font-light text-gray-400">
                If account registration is available, users are responsible for maintaining the confidentiality of their login credentials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">6. Downloads & Software</h2>
              <p className="text-sm font-light text-gray-400">
                Software and downloadable files are provided "as available." Users are responsible for using them appropriately and keeping their own devices secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">7. Limitation of Liability</h2>
              <p className="text-sm font-light text-gray-400">
                REXLIFY shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our services, except where required by applicable law.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">8. Service Availability</h2>
              <p className="text-sm font-light text-gray-400">
                We may modify, suspend, update, or discontinue any service at any time without prior notice.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">9. Privacy</h2>
              <p className="text-sm font-light text-gray-400">
                Your use of REXLIFY is also governed by our Privacy Policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">10. Changes to Terms</h2>
              <p className="text-sm font-light text-gray-400">
                These Terms & Conditions may be updated from time to time. Continued use of our services indicates acceptance of the latest version.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">11. Governing Law</h2>
              <p className="text-sm font-light text-gray-400">
                These Terms shall be governed by the applicable laws of India. Any disputes shall be subject to the jurisdiction of the competent courts in India.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white font-sora">12. Contact</h2>
              <p className="text-sm font-light text-gray-400">
                For support or legal inquiries, please contact us through the official REXLIFY website.
              </p>
              <p className="text-sm font-light text-gray-400 mt-4 font-semibold">
                Thank you for using REXLIFY.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* -------------------- APPLICATIONS PAGE (EXPLORE APPS HUB & ROADMAP) -------------------- */}
      {currentView === 'applications' && (
        <ExploreAppsHub
          applications={applications}
          setView={setView}
          onSimulateDownload={handleTriggerAndSimulateDownload}
          onIncrementDownload={onIncrementDownload}
        />
      )}

      {/* -------------------- EXPLORE OUR SYSTEM PLACEHOLDER PAGE -------------------- */}
      {currentView === ('explore-system' as any) && (
        <div className="max-w-4xl mx-auto py-16 px-6 text-center space-y-8 rounded-[2.5rem] bg-[#07080d] border border-purple-500/30 shadow-2xl my-10">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <Compass size={40} />
          </div>
          <div className="space-y-3">
            <span className="font-mono text-xs text-purple-400 uppercase tracking-widest font-bold">
              REXLIFY SYSTEM ARCHITECTURE TELEMETRY
            </span>
            <h1 className="font-sora text-3xl md:text-4xl font-bold text-white">
              Explore Our System Portal
            </h1>
            <p className="text-gray-300 text-sm max-w-xl mx-auto font-light leading-relaxed">
              This dedicated system overview channel provides live kernel diagnostics, node distribution channels, and edge synchronization statistics across the REXLIFY digital ecosystem.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => setView('applications')}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              View Ecosystem Apps
            </button>
            <button
              onClick={() => setView('home')}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      )}

      {/* -------------------- PROJECTS PAGE (ROADMAP TIMELINE) -------------------- */}
      {currentView === 'projects' && (
        <Roadmap 
          projects={projects}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          renderSearchBar={renderSearchBar}
        />
      )}

      {/* -------------------- UPDATES PAGE -------------------- */}
      {currentView === 'updates' && (
        <div className="relative min-h-[80vh] py-12 px-6 md:px-12 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <LoopingVideoBackground src="https://cdn.pixabay.com/video/2021/04/12/70881-536968361_large.mp4" />
          
          <div className="relative z-10 space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-8">
              <div className="text-left space-y-2">
                <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-semibold block">Ecosystem Feed</span>
                <h1 className="font-sora text-3xl md:text-4xl font-semibold text-white tracking-tight">
                  Updates Center
                </h1>
                <p className="text-gray-400 text-sm font-light">
                  Discover news briefings, system releases, and technical documentation releases.
                </p>
              </div>

              {/* Updates sorting filter */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Announcements', 'Release Notes', 'Feature Updates', 'Platform Updates'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setUpdateFilter(f)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      updateFilter === f 
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                        : 'bg-black/45 backdrop-blur-sm text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    {f === 'Announcements' ? 'News' : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative border-l border-emerald-500/20 ml-4 sm:ml-8 pl-8 sm:pl-12 space-y-12 max-w-4xl mx-auto py-4">
              
              {updates
                .filter(u => updateFilter === 'All' || u.category === updateFilter)
                .map((up, idx) => {
                  // Determine layout logo branding consistently
                  const norm = (up.category + " " + up.title).toLowerCase();
                  const renderLogoElement = () => {
                    if (norm.includes('sifra')) {
                      return <SifraLogo size={36} />;
                    } else if (norm.includes('neurax')) {
                      return <NeuraxLogo size={36} />;
                    } else {
                      return <RexlifyLogo size={36} />;
                    }
                  };

                  return (
                    <motion.div 
                      key={up.id} 
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.55, delay: Math.min(idx * 0.05, 0.3) }}
                      className={`bg-black/35 backdrop-blur-md p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col md:flex-row gap-8 items-start border ${is3DMode ? "hover:-translate-y-2 hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] transition-all duration-500 shadow-2xl transform perspective-1000" : "hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"} ${
                        up.pinned ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-white/10 hover:border-emerald-500/30'
                      }`}
                    >
                      
                      {/* Point-to-point timeline animated dot bead */}
                      <div className="absolute -left-[39px] md:-left-[55.5px] top-12 z-10 flex items-center justify-center">
                        <span className="relative flex h-4 w-4">
                          {up.pinned ? (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border border-[#050505]"></span>
                            </>
                          ) : (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500/40 opacity-60"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-[#050505]"></span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Logo Branding column alongside update */}
                      <div className="flex-shrink-0 bg-white/5 border border-white/10 p-4 rounded-[1.5rem] flex items-center justify-center shadow-inner md:mt-1">
                        {renderLogoElement()}
                      </div>

                      {/* Main content column with pinned label and values */}
                      <div className="flex-grow space-y-4 text-left">
                        {up.pinned && (
                          <span className="inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-md font-mono text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 items-center gap-2">
                            <Star size={12} className="fill-emerald-400 text-emerald-400" />
                            Pinned Briefing
                          </span>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-xs font-mono leading-none">
                            <span className="text-gray-400 font-semibold">{up.date}</span>
                            <span className="text-gray-600">&bull;</span>
                            <span className="text-emerald-500 font-bold uppercase tracking-widest">{up.category}</span>
                          </div>
                          <h2 className="font-sora text-xl md:text-2xl font-semibold text-white leading-snug tracking-tight">
                            {up.title}
                          </h2>
                        </div>

                        <p className="text-gray-400 text-sm font-light leading-relaxed whitespace-pre-line">
                          {up.content}
                        </p>
                      </div>

                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- FAQ KNOWLEDGE BASE PAGE -------------------- */}
      {currentView === 'faq' && (
        <div className="py-8">
          <FAQSection faqs={faqs} onVoteHelpful={onVoteHelpfulFAQ} onOpenContact={() => setView('contact')} />
        </div>
      )}

      {/* -------------------- DOCUMENTATION PAGE -------------------- */}

      {currentView === 'documentation' && (
        <div className="py-12 space-y-8">
          <div className="text-left space-y-2 border-b border-white/10 pb-8">
            <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-semibold">
              DOCUMENTATION INDEX MATRIX
            </span>
            <h1 className="font-sora text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Ecosystem Guides & Documentation
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar catalog */}
            <div className="lg:col-span-1 space-y-6">
              <span className="font-mono text-xs text-gray-500 uppercase tracking-widest block font-bold">
                Knowledge Nodes
              </span>

              {/* Real-time search for guides */}
              {renderSearchBar("Search guides...")}

              <div className="flex flex-col gap-2">
                {documents
                  .filter(doc => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      doc.title.toLowerCase().includes(query) ||
                      doc.category.toLowerCase().includes(query) ||
                      doc.content.toLowerCase().includes(query)
                    );
                  }).length === 0 ? (
                    <div className="p-6 rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 text-center">
                      <span className="font-mono text-xs text-gray-500 uppercase tracking-wider block">
                        No guides found
                      </span>
                    </div>
                  ) : (
                    documents
                      .filter(doc => {
                        if (!searchQuery) return true;
                        const query = searchQuery.toLowerCase();
                        return (
                          doc.title.toLowerCase().includes(query) ||
                          doc.category.toLowerCase().includes(query) ||
                          doc.content.toLowerCase().includes(query)
                        );
                      })
                      .map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => setActiveDoc(doc)}
                          className={`w-full text-left px-5 py-4 rounded-[1.5rem] text-sm font-semibold transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                            activeDoc && activeDoc.id === doc.id
                              ? 'bg-[#050505] border border-emerald-500/30 text-white shadow-lg'
                              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <span className="line-clamp-1">{doc.title}</span>
                          <span className="font-mono text-[9px] text-gray-500 uppercase shrink-0 bg-white/5 px-2 py-1 rounded-md group-hover:text-emerald-400">
                            {doc.category}
                          </span>
                        </button>
                      ))
                  )
                }
              </div>
            </div>

            {/* Main content reader */}
            <div className="lg:col-span-3">
              {activeDoc ? (
                <div ref={activeDocRef} className="bg-[#050505] border border-white/10 p-10 md:p-12 rounded-[2.5rem] space-y-8 hover:border-emerald-500/20 transition-colors relative">
                  <ReadingProgressBar
                    targetRef={activeDocRef}
                    title={activeDoc.title}
                    category={activeDoc.category}
                    estimatedTime="4 min read"
                    showFloatingControls={true}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="space-y-2">
                      <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-bold">
                        Department: {activeDoc.category}
                      </span>
                      <h2 className="font-sora text-3xl font-semibold text-white">
                        {activeDoc.title}
                      </h2>
                    </div>
                    <span className="font-mono text-[10px] text-gray-500 tracking-widest">
                      LAST RECALIBRATION: {activeDoc.lastUpdated}
                    </span>
                  </div>

                  {/* Header visual banner for active library node */}
                  {activeDoc.image && (
                    <div className="aspect-[21/9] w-full rounded-[2rem] overflow-hidden relative border border-white/10 shadow-xl">
                      {/* Pulsing point indicating live diagnostic status */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-[#050505] border border-emerald-500/30 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest text-emerald-400 z-10">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        SYS_CONNECT_LIVE
                      </div>
                      <img 
                        src={activeDoc.image} 
                        alt={activeDoc.title}
                        className="object-cover w-full h-full opacity-80 hover:scale-[1.02] transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  {/* Rendering simple markdown structures natively inside the glass system */}
                  <div className="space-y-6 text-gray-400 text-sm font-light leading-relaxed font-sans prose prose-invert max-w-none pt-4">
                    {activeDoc.content.split('\n\n').map((paragraph, index) => {
                      if (paragraph.startsWith('## ')) {
                        return <h2 key={index} className="font-sora text-2xl font-semibold text-white pt-6 mt-8 border-b border-white/10 pb-3">{paragraph.replace('## ', '')}</h2>;
                      }
                      if (paragraph.startsWith('### ')) {
                        return <h3 key={index} className="font-sora text-lg font-semibold text-gray-200 pt-4">{paragraph.replace('### ', '')}</h3>;
                      }
                      if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                        return (
                          <ul key={index} className="list-inside list-disc pl-6 space-y-3 text-gray-400 font-light bg-[#030303] p-6 rounded-2xl border border-white/5">
                            {paragraph.split('\n').map((li, lIndex) => {
                              const cleanedLi = li.replace(/^\d+\.\s+/, '').replace(/^-\s+/, '');
                              return <li key={lIndex} className="leading-relaxed">{cleanedLi}</li>;
                            })}
                          </ul>
                        );
                      }
                      return <p key={index} className="whitespace-pre-line leading-loose">{paragraph}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-[#050505] border border-white/10 p-12 rounded-[2.5rem] text-center text-gray-400 font-mono text-sm uppercase tracking-widest">
                  NO ACTIVE DOCUMENTATION NODE FOUND
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- SERVICES PAGE -------------------- */}
      {currentView === 'services' && (
        <div className="relative min-h-[80vh] py-12 px-6 md:px-12 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <LoopingVideoBackground src="https://cdn.pixabay.com/video/2021/04/12/70881-536968361_large.mp4" />
          
          <div className="relative z-10 space-y-12">
            <div className="max-w-3xl space-y-4 border-b border-white/10 pb-8">
              <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-bold">REXLIFY PROTOCOLS DECK</span>
              <h1 className="font-sora text-3xl md:text-4xl font-semibold text-white tracking-tight">Enterprise Core & Neural Services</h1>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Unlock modular AI orchestration interfaces, custom website builds, micro-apps engineering, network hardening protocols, and secure operations setups.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const IconComp = service.icon === 'Cpu' ? Cpu 
                  : service.icon === 'Globe' ? Compass
                  : service.icon === 'Smartphone' ? Layers
                  : service.icon === 'Shield' ? AlertTriangle
                  : service.icon === 'GraduationCap' ? BookOpen
                  : service.icon === 'Cloud' ? RefreshCw
                  : service.icon === 'TrendingUp' ? Sparkles
                  : service.icon === 'Codepen' ? Sliders : Sparkles;

                return (
                  <div 
                    key={service.id}
                    onClick={() => {
                      const rootEl = document.getElementById('service-detail-modal-root');
                      if (rootEl) {
                        rootEl.dispatchEvent(new CustomEvent('open-service', { detail: service }));
                      }
                    }}
                    className={`bg-black/35 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between gap-6 relative group overflow-hidden cursor-pointer ${is3DMode ? "hover:border-emerald-500/50 hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-500 shadow-2xl transform perspective-1000" : "hover:border-emerald-500/30 transition-all duration-500"}`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
                    
                    <div className="space-y-4 relative z-10">
                      <div className="w-12 h-12 rounded-[1rem] bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300 shadow-inner">
                        <IconComp size={24} />
                      </div>
                      <h3 className="font-sora text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">{service.name}</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed line-clamp-3">{service.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-5 relative z-10">
                      <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">{service.category}</span>
                      <span className="text-gray-400 hover:text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-widest group-hover:text-emerald-400 transition-all flex items-center gap-1">
                        SPECIFICATION
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <ServiceDetailModal services={services} onAddMessage={onAddMessage} />
          </div>
        </div>
      )}

      {/* -------------------- PRODUCTS PAGE -------------------- */}
      {currentView === 'products' && (
        <div className="relative min-h-[80vh] py-12 px-6 md:px-12 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <LoopingVideoBackground src="https://cdn.pixabay.com/video/2021/04/12/70881-536968361_large.mp4" />
          
          <div className="relative z-10 space-y-12">
            <div className="max-w-3xl space-y-4 border-b border-white/10 pb-8">
              <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-bold">REXLIFY COMPILE ENGINES</span>
              <h1 className="font-sora text-3xl md:text-4xl font-semibold text-white tracking-tight">Active Software Distributions</h1>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Explore dynamic trial applications, APK builds, and systems releases. Register ratings and submit operational reviews instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {products.map((product) => (
                <div key={product.id} className={`bg-black/35 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-white/10 space-y-8 flex flex-col justify-between relative overflow-hidden group ${is3DMode ? "hover:border-emerald-500/50 hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-500 shadow-2xl transform perspective-1000" : "hover:border-emerald-500/30 transition-colors duration-500"}`}>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-1 bg-white/5 rounded-[1rem] select-none border border-white/10 shadow-lg shrink-0">
                          {renderLogo(product.logo, 40)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-sora text-lg md:text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">{product.name}</h3>
                          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">v{product.version} // {product.fileSize}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 justify-end">
                          <Star size={14} className="fill-emerald-400" />
                          <span className="font-mono text-sm font-bold">{product.rating}</span>
                        </div>
                        <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest block">{product.downloads} downloads</span>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm font-light leading-relaxed">{product.description}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {product.features.map((feat, i) => (
                        <span key={i} className="font-mono text-[10px] text-gray-300 bg-black/45 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg font-semibold tracking-wider shadow-[inset_0_0_10px_rgba(255,255,255,0.05)] hover:border-emerald-500/30 hover:text-emerald-400 transition-colors cursor-default">
                          ◆ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 border-t border-white/10 pt-8 mt-8 relative z-10">
                    <DownloadButton 
                      product={product} 
                      onIncrementDownload={onIncrementDownload} 
                    />

                    <button 
                      onClick={() => {
                        const rootEl = document.getElementById('product-reviews-modal-root');
                        if (rootEl) {
                          rootEl.dispatchEvent(new CustomEvent('open-reviews', { detail: product }));
                        }
                      }}
                      className="flex-1 py-3 px-4 bg-black/45 backdrop-blur-sm border border-white/10 text-gray-400 rounded-xl font-mono text-xs font-semibold uppercase tracking-widest hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <MessageSquare size={16} />
                      Reviews ({product.reviews.length})
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <ProductReviewsModal products={products} onUpdateProducts={onUpdateProducts} />
          </div>
        </div>
      )}

      {/* -------------------- BLOG PAGE -------------------- */}
      {currentView === 'blog' && (
        <BlogPageContent is3DMode={is3DMode} 
          blogPosts={blogPosts} 
          onUpdateBlogPosts={onUpdateBlogPosts} 
          renderSearchBar={renderSearchBar}
          searchQuery={searchQuery}
        />
      )}

      {/* -------------------- DASHBOARD PAGE -------------------- */}
      {currentView === 'dashboard' && (
        <UserDashboardPortal 
          activeUser={activeUser}
          onUpdateActiveUser={onUpdateActiveUser}
          applications={applications}
          documents={documents}
        />
      )}

      {/* -------------------- SPONSORS PAGE -------------------- */}
      {currentView === 'sponsors' && <Sponsors />}

      {/* -------------------- CONTACT PAGE -------------------- */}
      {currentView === 'contact' && (
        <div className="py-12 space-y-12">
          
          <div className="max-w-3xl space-y-4 border-b border-white/10 pb-8">
            <span className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-bold">
              TRANSMISSION TERMINAL
            </span>
            <h1 className="font-sora text-3xl md:text-4xl font-semibold text-white tracking-tight">
              Contact & Official Transmission
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Submit feedback, feature logs, bugs, or business requests. Direct transmissions are routed immediately into Rizwan’s secure Admin message terminal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8">
            
            {/* Transmission details */}
            <div className="md:col-span-1 space-y-6">
              
              <div className="bg-[#050505] p-8 rounded-[2.5rem] border border-white/10 space-y-6 hover:border-emerald-500/30 transition-colors duration-500 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full -z-10 group-hover:bg-emerald-500/10 transition-colors duration-700" />
                <h4 className="font-sora font-semibold text-sm text-white uppercase tracking-widest border-b border-white/10 pb-4">
                  Official Channels
                </h4>
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-start text-sm">
                    <Mail size={20} className="text-emerald-500 shrink-0" />
                    <div className="space-y-2 text-left">
                      <span className="text-gray-400 block font-light">Neural Assistance Hub</span>
                      <a href="mailto:neurax.help.assistant@gmail.com" className="font-mono text-emerald-400 hover:text-emerald-300 transition-colors text-xs">
                        neurax.help.assistant@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start text-sm">
                    <Mail size={20} className="text-emerald-500 shrink-0" />
                    <div className="space-y-2 text-left">
                      <span className="text-gray-400 block font-light">Ecosystem Official Support</span>
                      <a href="mailto:rexlifyofficialsupportteam@gmail.com" className="font-mono text-emerald-400 hover:text-emerald-300 transition-colors text-xs break-all">
                        rexlifyofficialsupportteam@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#050505] p-8 rounded-[2.5rem] border border-white/10 text-center space-y-4 relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />
                <h4 className="font-sora font-semibold text-xs text-white uppercase tracking-widest relative z-10">
                  Secure Logging
                </h4>
                <p className="text-gray-400 text-xs font-light leading-relaxed relative z-10">
                  Every submitted request is structured with standard user hashing. We do not index personal telemetry or track device diagnostics outside of manual bug submissions.
                </p>
              </div>
            </div>

            {/* Immersive form UI */}
            <div className="md:col-span-2">
              <div className="bg-[#050505] p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative shadow-2xl">
                
                {formSubmitted ? (
                  <div className="py-12 flex flex-col items-center gap-6 text-center">
                    <div className="p-4 rounded-[1.5rem] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg">
                      <Check size={48} className="animate-bounce" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-sora font-semibold text-emerald-400 text-2xl tracking-tight">
                        TRANSMISSION LOGGED SUCCESSFULLY
                      </h3>
                      <p className="text-gray-400 text-sm font-light max-w-sm mx-auto leading-relaxed">
                        Your message hash has been generated. Rizwan and the support team will verify this under the REXLIFY dashboard.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-8">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 text-left">
                          <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                            Name
                          </label>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Your Name"
                            id="form-name-input"
                            className="w-full text-sm font-sans px-5 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all shadow-inner"
                          />
                        </div>

                        <div className="space-y-2 text-left">
                          <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            placeholder="your.email@domain.com"
                            id="form-email-input"
                            className="w-full text-sm font-sans px-5 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                          Subject
                        </label>
                        <input
                          type="text"
                          required
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          placeholder="Transmission Subject"
                          id="form-subj-input"
                          className="w-full text-sm font-sans px-5 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all shadow-inner"
                        />
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                          Message
                        </label>
                        <textarea
                          required
                          rows={6}
                          maxLength={2000}
                          value={formMessage}
                          onChange={(e) => setFormMessage(e.target.value)}
                          placeholder="Write your transmission message here..."
                          id="form-message-text"
                          className="w-full text-sm font-sans px-5 py-4 rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all resize-none shadow-inner custom-scrollbar"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="form-send-btn"
                      className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-500 text-black font-mono uppercase tracking-widest text-sm font-bold hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Send size={18} />
                      Publish Transmission
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- QUANTEXA REPLICATION STUDIO PAGE -------------------- */}
      {currentView === 'quantexa' && (
        <QuantexaReplication />
      )}

      {/* BENGLAI SUCCESSFUL INSTALLATION GUIDE MODAL POPUP */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050505] p-8 md:p-10 rounded-[2.5rem] max-w-lg w-full text-center space-y-8 border border-white/10 relative shadow-2xl">
            {/* Glowing effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

            <div className="flex flex-col items-center space-y-4 relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-sora text-2xl font-semibold text-white tracking-tight uppercase">
                ডাউনলোড সফল হয়েছে!
              </h3>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20 tracking-widest font-bold">
                {showInstallGuideModal.filename} Ready
              </span>
            </div>

            <div className="text-left space-y-5 bg-[#030303] p-6 rounded-2xl border border-white/5 font-sans relative z-10 shadow-inner">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block font-bold border-b border-white/10 pb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                আপনার মোবাইলে ইনস্টল করার নিয়মাবলী:
              </span>
              <div className="space-y-4 text-sm text-gray-400 leading-relaxed font-light">
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center border border-emerald-500/20">১</span>
                  <p>আপনার মোবাইল ব্রাউজারের <strong className="text-white font-medium">Downloads</strong> ফোল্ডার থেকে ফাইলটি খুলুন।</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center border border-emerald-500/20">২</span>
                  <p>নিরাপত্তা সতর্কতার জন্য ইনস্টলেশন ব্লক হলে, <strong className="text-white font-medium">Settings &gt; Allow Installation from Unknown Sources</strong> অপশনটি চালু করে দিন।</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center border border-emerald-500/20">৩</span>
                  <p><strong className="text-white font-medium">Install</strong> বাটনে ক্লিক করুন। ইনস্টলেশন সম্পন্ন হলে <strong className="text-emerald-400 font-medium">Open</strong> এ ক্লিক করে অ্যাপ উপভোগ করুন!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button
                onClick={() => {
                  // Re-trigger actual download link if needed
                  const dummyApkContent = new Uint8Array([80, 75, 3, 4, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                  const blob = new Blob([dummyApkContent], { type: 'application/vnd.android.package-archive' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = showInstallGuideModal.filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 py-4 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white text-xs font-mono font-semibold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Download Again
              </button>

              <button
                onClick={() => setShowInstallGuideModal(null)}
                className="flex-1 py-4 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-transform duration-200 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                বুঝেছি ও সম্পন্ন করেছি
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rexlify GitHub 404 Modal */}
      <Rexlify404Modal
        isOpen={showGitHub404}
        onClose={() => setShowGitHub404(false)}
        onNavigateHome={() => setView('home')}
        onNavigateCatalog={() => setView('applications')}
        onNavigatePortfolio={() => setView('portfolio')}
      />
    </div>
  );
};
