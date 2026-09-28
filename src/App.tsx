/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { 
  ActiveView,
  Navbar 
} from './components/Navbar';
import { useSystemStatus } from './useSystemStatus';
import { Footer } from './components/Footer';
import { FrontendPages } from './components/FrontendPages';
import { AdminLogin } from './components/AdminLogin';
import { RexlifyAiLogin } from './components/RexlifyAiLogin';
import { AdminPanel } from './components/AdminPanel';
import { AmbientBackground } from './components/AmbientBackground';
import { UniversalBackButton } from './components/UniversalBackButton';
import RODPApp from './rodp/App';
import { RexlifyAiApp } from './components/rexlify-ai/RexlifyAiApp';
import { SifraAiApp } from './components/sifra/SifraAiApp';
import { NeuraxAiApp } from './components/neurax/NeuraxAiApp';
import { RizwanInnovationApp } from './components/innovation/RizwanInnovationApp';
import { RexlifyInstituteIntro } from './components/institute/RexlifyInstituteIntro';
import { StudentPortalPage } from './components/institute/StudentPortalPage';
import { TeacherDashboard } from './components/TeacherDashboard';

import { 
  Application, Update, Project, DocArticle, UserMessage, SEOSettings, WebsiteContent,
  ServiceItem, ProductItem, BlogItem, VideoCenterItem, AdvertisementItem, UserAccount, SocialMediaLink, FAQItem
} from './types';

import {
  INITIAL_APPLICATIONS, INITIAL_UPDATES, INITIAL_PROJECTS, 
  INITIAL_DOCUMENTS, INITIAL_MESSAGES, INITIAL_SEO, INITIAL_CONTENT,
  INITIAL_SERVICES, INITIAL_PRODUCTS, INITIAL_BLOG, INITIAL_VIDEO_CENTER_ITEMS, INITIAL_ADS,
  INITIAL_SOCIAL_MEDIA_LINKS, INITIAL_FAQS
} from './data';
import { ToastProvider } from './context/ToastContext';

const DEFAULT_USER: UserAccount = {
  username: 'RizwanDeveloper',
  email: 'rizwandeveloper@rexlify.com',
  bio: 'Futuristic digital engineer shaping next-generation tools.',
  avatar: '🚀',
  role: 'Ecosystem Explorer & Developer',
  joinedDate: 'May 2026',
  favorites: ['app-sifra-core', 'app-neurax', 'app-cyberguard'],
  watchLater: ['vid-rexlify-presentation'],
  savedDocs: ['doc-sifra-quickstart', 'doc-neurax-arch', 'doc-ecosystem-guide'],
  activityHistory: [
    {
      id: 'act-1',
      type: 'login',
      title: 'Authenticated Session Initiated',
      description: 'Logged into Rexlify Secure Cloud Gateway via authenticated token.',
      timestamp: 'Today at 09:24 AM'
    },
    {
      id: 'act-2',
      type: 'download',
      title: 'Downloaded Sifra AI Core APK',
      description: 'Completed Android binary package download with checksum hash verification.',
      timestamp: 'Yesterday at 04:15 PM'
    },
    {
      id: 'act-3',
      type: 'favorite',
      title: 'Bookmarked NeuraX Edge Model',
      description: 'Added NeuraX Edge Translation Engine to your favorites locker.',
      timestamp: 'May 28, 2026'
    },
    {
      id: 'act-4',
      type: 'view_doc',
      title: 'Saved Architecture Guide',
      description: 'Bookmarked "NeuraX Decentralized Vector Indexing & Edge Diagnostics".',
      timestamp: 'May 26, 2026'
    },
    {
      id: 'act-5',
      type: 'upload',
      title: 'Encrypted Blueprint Saved',
      description: 'Uploaded diagnostic configuration manifest to secure locker repository.',
      timestamp: 'May 24, 2026'
    }
  ],
  uploadedFiles: []
};

import { Language, TRANSLATIONS } from './translations';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthProvider } from './context/AuthContext';



const OfflineBanner = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-rose-500 text-white py-2 px-4 text-center text-xs font-mono font-bold tracking-widest uppercase shadow-[0_-5px_20px_rgba(244,63,94,0.4)] flex items-center justify-center gap-3 animate-slideUp">
      <AlertTriangle size={14} className="animate-pulse" />
      <span>অনুগ্রহ করে ইন্টারনেট কানেক্ট করুন (Offline Mode Active)</span>
    </div>
  );
};

function AppContent() {
  // Routing View state
  const [view, setView] = useState<ActiveView>('home');

  // Translation & Subscribers states
  const [language, setLanguage] = useState<Language>('en');
  const [subscribers, setSubscribers] = useState<string[]>([]);

  // Extended Custom States
  const [themeMode, setThemeMode] = useState<'deep-space' | 'neon-cyber'>('deep-space');
  const [is3DMode, setIs3DMode] = useState<boolean>(true);

  const { status, loading } = useSystemStatus();

  // Helper to render disabled block
  const renderDisabledBlock = (appName: string) => (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-pink-500/20 p-8 rounded-[2rem] text-center space-y-6 shadow-[0_0_50px_rgba(236,72,153,0.1)]">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <AlertTriangle size={32} className="text-rose-500" />
        </div>
        <div>
          <h2 className="font-sora text-xl font-bold text-white mb-2 uppercase tracking-widest">{appName} Offline</h2>
          <p className="text-gray-400 text-sm font-mono leading-relaxed">
            This module has been temporarily stopped by the REXLIFY Central Administration due to routine maintenance or system calibration. 
            <br/><br/>
            Please check back later. System cryptographic codes remain secured.
          </p>
        </div>
        <button onClick={() => setView('home')} className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-purple-500/30 text-white rounded-xl font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-lg shadow-purple-500/20">
          Return to Hub
        </button>
      </div>
    </div>
  );

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Persistence States - Initialized synchronously to prevent reload delay
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_apps');
      return s ? JSON.parse(s) : INITIAL_APPLICATIONS;
    } catch { return INITIAL_APPLICATIONS; }
  });
  const [updates, setUpdates] = useState<Update[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_updates');
      return s ? JSON.parse(s) : INITIAL_UPDATES;
    } catch { return INITIAL_UPDATES; }
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_projects');
      return s ? JSON.parse(s) : INITIAL_PROJECTS;
    } catch { return INITIAL_PROJECTS; }
  });
  const [documents, setDocuments] = useState<DocArticle[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_docs');
      return s ? JSON.parse(s) : INITIAL_DOCUMENTS;
    } catch { return INITIAL_DOCUMENTS; }
  });
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_faqs');
      return s ? JSON.parse(s) : INITIAL_FAQS;
    } catch { return INITIAL_FAQS; }
  });
  const [messages, setMessages] = useState<UserMessage[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_msgs');
      return s ? JSON.parse(s) : INITIAL_MESSAGES;
    } catch { return INITIAL_MESSAGES; }
  });
  const [seo, setSeo] = useState<SEOSettings>(() => {
    try {
      const s = localStorage.getItem('rexlify_seo');
      return s ? JSON.parse(s) : INITIAL_SEO;
    } catch { return INITIAL_SEO; }
  });
  const [content, setContent] = useState<WebsiteContent>(() => {
    try {
      const s = localStorage.getItem('rexlify_content');
      return s ? JSON.parse(s) : INITIAL_CONTENT;
    } catch { return INITIAL_CONTENT; }
  });

  // New modules states
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_services');
      return s ? JSON.parse(s) : INITIAL_SERVICES;
    } catch { return INITIAL_SERVICES; }
  });
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_products');
      return s ? JSON.parse(s) : INITIAL_PRODUCTS;
    } catch { return INITIAL_PRODUCTS; }
  });
  const [blogPosts, setBlogPosts] = useState<BlogItem[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_blog');
      return s ? JSON.parse(s) : INITIAL_BLOG;
    } catch { return INITIAL_BLOG; }
  });
  const [videos, setVideos] = useState<VideoCenterItem[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_video_center');
      return s ? JSON.parse(s) : INITIAL_VIDEO_CENTER_ITEMS;
    } catch { return INITIAL_VIDEO_CENTER_ITEMS; }
  });
  const [ads, setAds] = useState<AdvertisementItem[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_ads');
      return s ? JSON.parse(s) : INITIAL_ADS;
    } catch { return INITIAL_ADS; }
  });
  const [activeUser, setActiveUser] = useState<UserAccount>(() => {
    try {
      const s = localStorage.getItem('rexlify_active_user');
      return s ? JSON.parse(s) : DEFAULT_USER;
    } catch { return DEFAULT_USER; }
  });
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>(() => {
    try {
      const s = localStorage.getItem('rexlify_social_media_links');
      return s ? JSON.parse(s) : INITIAL_SOCIAL_MEDIA_LINKS;
    } catch { return INITIAL_SOCIAL_MEDIA_LINKS; }
  });

  // Core Platform Customization States
  const [showcaseScreenshots, setShowcaseScreenshots] = useState<any[]>([]);
  const [platformFeatures, setPlatformFeatures] = useState<any[]>([]);
  const [apkDownloadLink, setApkDownloadLink] = useState<string>('');
  const [maintenanceMode, setMaintenanceMode] = useState<{ enabled: boolean; message: string }>({ enabled: false, message: 'This application is currently undergoing system calibration.' });

  // Authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin' | null>(null);

  // Dynamic custom UI components
  const [customUiComponents, setCustomUiComponents] = useState<any[]>([]);

  // 1. Initial State Loading with Google Cloud Firestore dynamic sync & localStorage fallback
  useEffect(() => {
    // Check auth
    if (localStorage.getItem('rexlify_auth_status') === 'true') {
      setIsAdminLoggedIn(true);
      const role = localStorage.getItem('rexlify_admin_role') as 'ceo' | 'teacher';
      if (role) {
        setAdminRole(role);
      }
    }

    const loadState = async () => {
      // Setup local default arrays
      let initialApps = INITIAL_APPLICATIONS;
      let initialUpdates = INITIAL_UPDATES;
      let initialProjects = INITIAL_PROJECTS;
      let initialDocs = INITIAL_DOCUMENTS;
      let initialMsgs = INITIAL_MESSAGES;
      let initialSEO = INITIAL_SEO;
      let initialContent = INITIAL_CONTENT;
      let initialServices = INITIAL_SERVICES;
      let initialProducts = INITIAL_PRODUCTS;
      let initialBlog = INITIAL_BLOG;
      let initialVideos = INITIAL_VIDEO_CENTER_ITEMS;
      let initialAds = INITIAL_ADS;
      let initialUser = DEFAULT_USER;
      let initialSocialMediaLinks = INITIAL_SOCIAL_MEDIA_LINKS;
      
      let initialCustomUiComponents = [
        {
          id: 'comp-1',
          title: 'Decentralized Edge Node Networks',
          subtitle: 'Distributed Sovereign Technology Protocols',
          content: 'By leveraging local device resources on NeuraX and Sifra platforms, our software operates entirely on the edge. This eliminates central server latency, decreases power consumption, and ensures absolute data security.',
          layout: 'bento',
          accentColor: 'emerald',
          visible: true,
          order: 1
        }
      ];

      let initialScreenshots = [
        {
          appId: 'sifra',
          appName: 'Sifra AI',
          src: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=600',
          description: 'Sifra Conversational Matrix - Direct agentic dialogue scheduler with integrated semantic query response loops.',
          label: 'Sifra Workspace'
        },
        {
          appId: 'sifra',
          appName: 'Sifra AI',
          src: 'https://images.unsplash.com/photo-1618005198143-d3667564d96a?auto=format&fit=crop&q=80&w=600',
          description: 'Sifra Glassmorphic Portal - Custom, dark, visual interface dashboard with low-latency calendar synchronization blocks.',
          label: 'Sifra Controls'
        },
        {
          appId: 'neurax',
          appName: 'NeuraX',
          src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
          description: 'NeuraX Core Diagnostics - Live parameters monitoring stream with cognitive context compression logs on client NPUs.',
          label: 'NeuraX Deep Engine'
        },
        {
          appId: 'neurax',
          appName: 'NeuraX',
          src: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600',
          description: 'NeuraX Security Federated Sync - Local zero-knowledge indexing interface securing private indexes and task blocks.',
          label: 'NeuraX Cryptographic Sync'
        },
        {
          appId: 'neurax',
          appName: 'NeuraX',
          src: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
          description: 'NeuraX Memory Matrix - High performance vector retrieval layers mapping conversational parameters.',
          label: 'NeuraX Semantic Router'
        }
      ];
      let initialFeats = [
        { id: '1', title: 'Global Reach', desc: 'Instant binary distributions worldwide via edge caching protocols.', icon: 'Globe' },
        { id: '2', title: 'Secure Vaults', desc: 'Military-grade encryption for all neural weights and user assets.', icon: 'ShieldAlert' },
        { id: '3', title: 'Real-Time Sync', desc: 'Dynamic synchronization of CBDC and tech logs across devices.', icon: 'RefreshCw' }
      ];
      let initialApkUrl = 'https://github.com/rexlify/core/releases/download/v1.0.2/rexlify-app-sifra-v1.0.2.apk';
      let initialMaintenance = { enabled: false, message: 'This application is currently undergoing system calibration.' };

      // Load client-specific preferences synchronously
      const storedLang = localStorage.getItem('rexlify_lang');
      if (storedLang && storedLang in TRANSLATIONS) {
        setLanguage(storedLang as Language);
      }
      const storedTheme = localStorage.getItem('rexlify_theme_mode');
      if (storedTheme === 'deep-space' || storedTheme === 'neon-cyber') {
        setThemeMode(storedTheme as 'deep-space' | 'neon-cyber');
      }
      const storedAuth = localStorage.getItem('rexlify_auth_status');
      if (storedAuth === 'true') {
        setIsAdminLoggedIn(true);
      }

      // Load client-specific preferences & cached states synchronously for instant UI
      const storedApps = localStorage.getItem('rexlify_apps');
      const storedUpdates = localStorage.getItem('rexlify_updates');
      const storedProjects = localStorage.getItem('rexlify_projects');
      const storedDocs = localStorage.getItem('rexlify_docs');
      const storedMsgs = localStorage.getItem('rexlify_msgs');
      const storedSEO = localStorage.getItem('rexlify_seo');
      const storedContent = localStorage.getItem('rexlify_content');
      const storedServices = localStorage.getItem('rexlify_services');
      const storedProducts = localStorage.getItem('rexlify_products');
      const storedBlog = localStorage.getItem('rexlify_blog');
      const storedVideos = localStorage.getItem('rexlify_video_center');
      const storedAds = localStorage.getItem('rexlify_ads');
      const storedUser = localStorage.getItem('rexlify_active_user');
      const storedSocial = localStorage.getItem('rexlify_social_media_links');
      const storedScreenshots = localStorage.getItem('rexlify_showcase_screenshots');
      const storedFeats = localStorage.getItem('rexlify_platform_features');
      const storedApkUrl = localStorage.getItem('rexlify_apk_url');
      const storedMaintenance = localStorage.getItem('rexlify_maintenance');
      const storedCustomUi = localStorage.getItem('rexlify_custom_ui_components');

      setApplications(storedApps ? JSON.parse(storedApps) : initialApps);
      setUpdates(storedUpdates ? JSON.parse(storedUpdates) : initialUpdates);
      setProjects(storedProjects ? JSON.parse(storedProjects) : initialProjects);
      setDocuments(storedDocs ? JSON.parse(storedDocs) : initialDocs);
      setMessages(storedMsgs ? JSON.parse(storedMsgs) : initialMsgs);
      setSeo(storedSEO ? JSON.parse(storedSEO) : initialSEO);
      setContent(storedContent ? JSON.parse(storedContent) : initialContent);
      setServices(storedServices ? JSON.parse(storedServices) : initialServices);
      setProducts(storedProducts ? JSON.parse(storedProducts) : initialProducts);
      setBlogPosts(storedBlog ? JSON.parse(storedBlog) : initialBlog);
      setVideos(storedVideos ? JSON.parse(storedVideos) : initialVideos);
      setAds(storedAds ? JSON.parse(storedAds) : initialAds);
      setActiveUser(storedUser ? JSON.parse(storedUser) : initialUser);
      setSocialMediaLinks(storedSocial ? JSON.parse(storedSocial) : initialSocialMediaLinks);
      setShowcaseScreenshots(storedScreenshots ? JSON.parse(storedScreenshots) : initialScreenshots);
      setPlatformFeatures(storedFeats ? JSON.parse(storedFeats) : initialFeats);
      setApkDownloadLink(storedApkUrl || initialApkUrl);
      setMaintenanceMode(storedMaintenance ? JSON.parse(storedMaintenance) : initialMaintenance);
      setCustomUiComponents(storedCustomUi ? JSON.parse(storedCustomUi) : initialCustomUiComponents);

      // Graceful async background sync with Firestore config
      const syncRemoteConfig = async () => {
        try {
          const fetchDoc = async (id: string) => {
            try {
              const snap = await getDoc(doc(db, 'config', id));
              return snap.exists() ? snap.data() : null;
            } catch {
              return null;
            }
          };

          const appsData = await fetchDoc('applications');
          if (appsData?.list) setApplications(appsData.list);

          const updatesData = await fetchDoc('updates');
          if (updatesData?.list) setUpdates(updatesData.list);

          const projectsData = await fetchDoc('projects');
          if (projectsData?.list) setProjects(projectsData.list);

          const docsData = await fetchDoc('documents');
          if (docsData?.list) setDocuments(docsData.list);

          const seoData = await fetchDoc('seo');
          if (seoData?.data) setSeo(seoData.data);

          const contentData = await fetchDoc('content');
          if (contentData?.data) setContent(contentData.data);

          const servicesData = await fetchDoc('services');
          if (servicesData?.list) setServices(servicesData.list);

          const productsData = await fetchDoc('products');
          if (productsData?.list) setProducts(productsData.list);

          const blogData = await fetchDoc('blogPosts');
          if (blogData?.list) setBlogPosts(blogData.list);

          const videosData = await fetchDoc('videos');
          if (videosData?.list) setVideos(videosData.list);

          const adsData = await fetchDoc('ads');
          if (adsData?.list) setAds(adsData.list);

          const socialData = await fetchDoc('socialMediaLinks');
          if (socialData?.list) setSocialMediaLinks(socialData.list);

          const screenshotsData = await fetchDoc('showcaseScreenshots');
          if (screenshotsData?.list) setShowcaseScreenshots(screenshotsData.list);

          const featsData = await fetchDoc('platformFeatures');
          if (featsData?.list) setPlatformFeatures(featsData.list);

          const apkData = await fetchDoc('apkDownloadLink');
          if (apkData?.url) setApkDownloadLink(apkData.url);

          const maintenanceData = await fetchDoc('maintenanceMode');
          if (maintenanceData && maintenanceData.message !== undefined) setMaintenanceMode(maintenanceData as any);

          const customUiData = await fetchDoc('customUiComponents');
          if (customUiData?.list) setCustomUiComponents(customUiData.list);
        } catch {
          // Gracefully continue in offline mode
        }
      };

      syncRemoteConfig();
    };

    loadState();
  }, []);

  // Firebase auth state monitoring and profile synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Logged in with Firebase!
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserAccount;
            setActiveUser(data);
          } else {
            // Create a brand new profile in Firestore matching UserAccount shape
            const newUser: UserAccount = {
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer',
              email: firebaseUser.email || '',
              bio: 'Authenticated REXLIFY explorer.',
              avatar: '🚀',
              favorites: [],
              watchLater: [],
              uploadedFiles: []
            };
            await setDoc(userRef, newUser);
            setActiveUser(newUser);
          }
        } catch (err) {
          console.error("Firestore user fetch failed, fallback to local state: ", err);
          setActiveUser({
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer',
            email: firebaseUser.email || '',
            bio: 'Explorer node (database offline).',
            avatar: '🚀',
            favorites: [],
            watchLater: [],
            uploadedFiles: []
          });
        }
      } else {
        // Logged out: fallback to the default guest account
        setActiveUser(DEFAULT_USER);
      }
    });
    return () => unsubscribe();
  }, []);

  // 1.5 SEO Dynamic Page Title and Meta Injection Header Sync
  useEffect(() => {
    if (seo) {
      document.title = seo.metaTitle;
      
      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.setAttribute('name', 'description');
        document.head.appendChild(descTag);
      }
      descTag.setAttribute('content', seo.metaDescription);
      
      let keywordsTag = document.querySelector('meta[name="keywords"]');
      if (!keywordsTag) {
        keywordsTag = document.createElement('meta');
        keywordsTag.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsTag);
      }
      keywordsTag.setAttribute('content', seo.keywords);
    }
  }, [seo]);

  // 2. State Sync Triggers
  const handleUpdateLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('rexlify_lang', lang);
  };

  const handleUpdateSubscribers = (newSubs: string[]) => {
    const cleaned = Array.from(new Set(newSubs.map(s => s.trim().toLowerCase()).filter(Boolean)));
    setSubscribers(cleaned);
    localStorage.setItem('rexlify_subscribers', JSON.stringify(cleaned));
  };

  const handleAddSubscriber = (email: string) => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes('@') || subscribers.includes(normalized)) {
      return false;
    }
    const nextSubs = [...subscribers, normalized];
    handleUpdateSubscribers(nextSubs);

    // Async push to Firebase Firestore
    const docId = 'sub_' + normalized.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const subRef = doc(db, 'subscribers', docId);
    setDoc(subRef, { email: normalized }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `subscribers/${docId}`);
    });

    return true;
  };

  const handleUpdateApps = (newApps: Application[]) => {
    setApplications(newApps);
    localStorage.setItem('rexlify_apps', JSON.stringify(newApps));
    setDoc(doc(db, 'config', 'applications'), { list: newApps }).catch((err) => console.warn(err));
  };

  const handleUpdateUpdates = (newUpdates: Update[]) => {
    setUpdates(newUpdates);
    localStorage.setItem('rexlify_updates', JSON.stringify(newUpdates));
    setDoc(doc(db, 'config', 'updates'), { list: newUpdates }).catch((err) => console.warn(err));
  };

  const handleUpdateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem('rexlify_projects', JSON.stringify(newProjects));
    setDoc(doc(db, 'config', 'projects'), { list: newProjects }).catch((err) => console.warn(err));
  };

  const handleUpdateDocs = (newDocs: DocArticle[]) => {
    setDocuments(newDocs);
    localStorage.setItem('rexlify_docs', JSON.stringify(newDocs));
    setDoc(doc(db, 'config', 'documents'), { list: newDocs }).catch((err) => console.warn(err));
  };

  const handleUpdateFaqs = (newFaqs: FAQItem[]) => {
    setFaqs(newFaqs);
    localStorage.setItem('rexlify_faqs', JSON.stringify(newFaqs));
    setDoc(doc(db, 'config', 'faqs'), { list: newFaqs }).catch((err) => console.warn(err));
  };

  const handleVoteHelpfulFAQ = (faqId: string) => {
    const updated = faqs.map(f => f.id === faqId ? { ...f, helpfulVotes: (f.helpfulVotes || 0) + 1 } : f);
    setFaqs(updated);
    localStorage.setItem('rexlify_faqs', JSON.stringify(updated));
    setDoc(doc(db, 'config', 'faqs'), { list: updated }).catch((err) => console.warn(err));
  };

  const handleUpdateMessages = (newMsgs: UserMessage[]) => {
    setMessages(newMsgs);
    localStorage.setItem('rexlify_msgs', JSON.stringify(newMsgs));
  };

  const handleUpdateSEO = (newSEO: SEOSettings) => {
    setSeo(newSEO);
    localStorage.setItem('rexlify_seo', JSON.stringify(newSEO));
    setDoc(doc(db, 'config', 'seo'), { data: newSEO }).catch((err) => console.warn(err));
    
    // Dynamically write keywords/description tags inside standard static document references for realistic crawlers simulation
    document.title = newSEO.metaTitle;
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', newSEO.metaDescription);
  };

  const handleUpdateContent = (newContent: WebsiteContent) => {
    setContent(newContent);
    localStorage.setItem('rexlify_content', JSON.stringify(newContent));
    setDoc(doc(db, 'config', 'content'), { data: newContent }).catch((err) => console.warn(err));
  };

  const handleUpdateServices = (newServices: ServiceItem[]) => {
    setServices(newServices);
    localStorage.setItem('rexlify_services', JSON.stringify(newServices));
    setDoc(doc(db, 'config', 'services'), { list: newServices }).catch((err) => console.warn(err));
  };

  const handleUpdateProducts = (newProducts: ProductItem[]) => {
    setProducts(newProducts);
    localStorage.setItem('rexlify_products', JSON.stringify(newProducts));
    setDoc(doc(db, 'config', 'products'), { list: newProducts }).catch((err) => console.warn(err));
  };

  const handleUpdateBlogPosts = (newBlog: BlogItem[]) => {
    setBlogPosts(newBlog);
    localStorage.setItem('rexlify_blog', JSON.stringify(newBlog));
    setDoc(doc(db, 'config', 'blogPosts'), { list: newBlog }).catch((err) => console.warn(err));
  };

  const handleUpdateVideos = (newVideos: VideoCenterItem[]) => {
    setVideos(newVideos);
    localStorage.setItem('rexlify_video_center', JSON.stringify(newVideos));
    setDoc(doc(db, 'config', 'videos'), { list: newVideos }).catch((err) => console.warn(err));
  };

  const handleUpdateAds = (newAds: AdvertisementItem[]) => {
    setAds(newAds);
    localStorage.setItem('rexlify_ads', JSON.stringify(newAds));
    setDoc(doc(db, 'config', 'ads'), { list: newAds }).catch((err) => console.warn(err));
  };

  const handleUpdateSocialMediaLinks = (newLinks: SocialMediaLink[]) => {
    setSocialMediaLinks(newLinks);
    localStorage.setItem('rexlify_social_media_links', JSON.stringify(newLinks));
    setDoc(doc(db, 'config', 'socialMediaLinks'), { list: newLinks }).catch((err) => console.warn(err));
  };

  const handleUpdateShowcaseScreenshots = (newScreenshots: any[]) => {
    setShowcaseScreenshots(newScreenshots);
    localStorage.setItem('rexlify_showcase_screenshots', JSON.stringify(newScreenshots));
    setDoc(doc(db, 'config', 'showcaseScreenshots'), { list: newScreenshots }).catch((err) => console.warn(err));
  };

  const handleUpdatePlatformFeatures = (newFeats: any[]) => {
    setPlatformFeatures(newFeats);
    localStorage.setItem('rexlify_platform_features', JSON.stringify(newFeats));
    setDoc(doc(db, 'config', 'platformFeatures'), { list: newFeats }).catch((err) => console.warn(err));
  };

  const handleUpdateApkDownloadLink = (newLink: string) => {
    setApkDownloadLink(newLink);
    localStorage.setItem('rexlify_apk_url', newLink);
    setDoc(doc(db, 'config', 'apkDownloadLink'), { url: newLink }).catch((err) => console.warn(err));
  };

  const handleUpdateMaintenanceMode = (newMode: { enabled: boolean; message: string }) => {
    setMaintenanceMode(newMode);
    localStorage.setItem('rexlify_maintenance', JSON.stringify(newMode));
    setDoc(doc(db, 'config', 'maintenanceMode'), newMode).catch((err) => console.warn(err));
  };

  const handleUpdateCustomUiComponents = (newComps: any[]) => {
    setCustomUiComponents(newComps);
    localStorage.setItem('rexlify_custom_ui_components', JSON.stringify(newComps));
    setDoc(doc(db, 'config', 'customUiComponents'), { list: newComps }).catch((err) => console.warn(err));
  };

  const handleUpdateActiveUser = (newUser: UserAccount) => {
    setActiveUser(newUser);
    localStorage.setItem('rexlify_active_user', JSON.stringify(newUser));

    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, newUser).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
      });
    }
  };

  // 3. User Experience operations
  const handleAddNewMessage = (msg: Omit<UserMessage, 'id' | 'date' | 'isImportant' | 'isRead'>) => {
    const formattedDate = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newMsg: UserMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      date: formattedDate,
      isImportant: false,
      isRead: false
    };
    const nextMsgs = [newMsg, ...messages];
    handleUpdateMessages(nextMsgs);

    const msgRef = doc(db, 'messages', newMsg.id);
    setDoc(msgRef, newMsg).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `messages/${newMsg.id}`);
    });
  };

  const handleIncrementDownload = (appId: string) => {
    const nextApps = applications.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          apkInfo: {
            ...app.apkInfo,
            downloadCount: app.apkInfo.downloadCount + 1
          }
        };
      }
      return app;
    });
    handleUpdateApps(nextApps);

    // Also increment download in products
    const nextProds = products.map(p => {
      if (p.id === appId) {
        const nextCount = (parseInt(p.downloads.replace(/,/g, '')) || 0) + 1;
        return {
          ...p,
          downloads: nextCount.toLocaleString()
        };
      }
      return p;
    });
    handleUpdateProducts(nextProds);
  };

  // Auth controls
  const handleLoginSuccess = (role: 'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin') => {
    setIsAdminLoggedIn(true);
    setAdminRole(role);
    localStorage.setItem('rexlify_auth_status', 'true');
    localStorage.setItem('rexlify_admin_role', role);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('rexlify_auth_status');
    setView('home');
  };

  // Toggle theme mode
  const handleToggleThemeMode = () => {
    const nextMode = themeMode === 'deep-space' ? 'neon-cyber' : 'deep-space';
    setThemeMode(nextMode);
    localStorage.setItem('rexlify_theme_mode', nextMode);
  };

  useEffect(() => {
    if (themeMode === 'neon-cyber') {
      document.body.classList.add('light-mode-active');
    } else {
      document.body.classList.remove('light-mode-active');
    }
  }, [themeMode]);

  // Scroll Progress dynamic tracker hook
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Home View 30-sec Non-intrusive Newsletter toast check (Disabled to avoid cluttering the landing page experience)
  useEffect(() => {
    setShowNewsletterModal(false);
  }, [view]);

  const handleDismissNewsletter = () => {
    setShowNewsletterModal(false);
    localStorage.setItem('rexlify_newsletter_dismissed', 'true');
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    const success = handleAddSubscriber(newsletterEmail);
    if (success) {
      setNewsletterSubscribed(true);
      localStorage.setItem('rexlify_is_subscribed', 'true');
      setTimeout(() => {
        setShowNewsletterModal(false);
      }, 2500);
    } else {
      setNewsletterSubscribed(true);
      setTimeout(() => {
        setShowNewsletterModal(false);
      }, 2000);
    }
  };

  // Determine active view render path
  const renderViewContent = () => {
    if (maintenanceMode.enabled && view !== 'admin-login' && view !== 'admin-dashboard') {
      return (
        <div className="min-h-screen bg-[#07080d] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] -z-10 animate-pulse" />
          
          <div className="max-w-md w-full text-center space-y-8 bg-white/[0.01] border border-white/5 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 animate-spin">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-mono tracking-widest uppercase inline-block">
                SYSTEM CALIBRATION
              </span>
              <h1 className="font-sora font-extrabold text-3xl text-white tracking-tight leading-none">
                REXLIFY UNDER CALIBRATION
              </h1>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                {maintenanceMode.message || "The platform is currently undergoing standard core updates and cognitive network realignment."}
              </p>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-2">
              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">
                Expected resolution: Automated Sync
              </span>
              <button 
                onClick={() => setView('admin-login')}
                className="text-[10px] font-mono text-gray-400 hover:text-white transition-colors underline cursor-pointer"
              >
                Access Control Center
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (view === 'admin-login') {
      return (
        <AdminLogin 
          setView={setView} 
          onLoginSuccess={handleLoginSuccess} 
        />
      );
    }

    if (view === 'teacher-dashboard') {
      if (!isAdminLoggedIn || adminRole !== 'teacher') {
        setView('admin-login');
        return null;
      }
      return (
        <TeacherDashboard 
          setView={setView}
          onLogout={handleLogout}
        />
      );
    }

    if (view === 'admin-dashboard') {
      if (!isAdminLoggedIn || adminRole !== 'ceo') {
        // Safe security redirect if attempting bypass
        setView('admin-login');
        return null;
      }
      return (
        <AdminPanel
          applications={applications}
          updates={updates}
          projects={projects}
          documents={documents}
          faqs={faqs}
          messages={messages}
          seo={seo}
          content={content}
          services={services}
          products={products}
          blogPosts={blogPosts}
          videos={videos}
          ads={ads}
          subscribers={subscribers}
          maintenanceMode={maintenanceMode}
          showcaseScreenshots={showcaseScreenshots}
          platformFeatures={platformFeatures}
          apkDownloadLink={apkDownloadLink}
          onUpdateSubscribers={handleUpdateSubscribers}
          onUpdateApps={handleUpdateApps}
          onUpdateUpdates={handleUpdateUpdates}
          onUpdateProjects={handleUpdateProjects}
          onUpdateDocs={handleUpdateDocs}
          onUpdateFaqs={handleUpdateFaqs}
          onUpdateMessages={handleUpdateMessages}
          onUpdateSEO={handleUpdateSEO}
          onUpdateContent={handleUpdateContent}
          onUpdateServices={handleUpdateServices}
          onUpdateProducts={handleUpdateProducts}
          onUpdateBlogPosts={handleUpdateBlogPosts}
          onUpdateVideos={handleUpdateVideos}
          onUpdateAds={handleUpdateAds}
          onUpdateMaintenanceMode={handleUpdateMaintenanceMode}
          onUpdateShowcaseScreenshots={handleUpdateShowcaseScreenshots}
          onUpdatePlatformFeatures={handleUpdatePlatformFeatures}
          onUpdateApkDownloadLink={handleUpdateApkDownloadLink}
          customUiComponents={customUiComponents}
          onUpdateCustomUiComponents={handleUpdateCustomUiComponents}
          socialMediaLinks={socialMediaLinks}
          onUpdateSocialMediaLinks={handleUpdateSocialMediaLinks}
          onLogout={handleLogout}
        />
      );
    }

    if (view === 'rodp') {
      if (!loading && !status.rodp) return renderDisabledBlock('RODP Platform');
      return (
        <div className="min-h-screen bg-[#070709] text-slate-100">
          <RODPApp 
            onBack={() => {
              setView('applications');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      );
    }


    if (view === 'rexlify-ai-login') {
      return (
        <RexlifyAiLogin 
          setView={setView}
          onSuccess={() => {
            setIsAdminLoggedIn(true);
            setAdminRole('rexlify-ai');
          }}
        />
      );
    }

    if (view === 'rexlify-ai') {
      if (!loading && !status.rexlify_ai) return renderDisabledBlock('Rexlify AI');
      if (!isAdminLoggedIn || (adminRole !== 'ceo' && adminRole !== 'rexlify-ai')) {
        setView('rexlify-ai-login');
        return null;
      }
      return (
        <RexlifyAiApp 
          onBack={() => {
            setView('applications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          userName={activeUser?.username || 'Rizwan'}
        />
      );
    }

    if (view === 'sifra') {
      return (
        <SifraAiApp 
          onBack={() => {
            setView('applications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          userName={activeUser?.username || 'Rizwan'}
        />
      );
    }

    if (view === 'neurax') {
      return (
        <NeuraxAiApp 
          onBack={() => {
            setView('applications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          userName={activeUser?.username || 'Rizwan'}
        />
      );
    }

    if (view === 'rizwan-innovation') {
      return (
        <RizwanInnovationApp 
          onBack={() => {
            setView('applications');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          userName={activeUser?.username || 'Rizwan'}
        />
      );
    }

    if (view === 'institute-intro') {
      return (
        <RexlifyInstituteIntro 
          setView={setView}
        />
      );
    }

    if (view === 'institute-portal') {
      return (
        <StudentPortalPage 
          setView={setView}
          userName={activeUser?.username || 'Rizwan'}
        />
      );
    }

    // Default: Public Facing Portal sections
    return (
      <FrontendPages
        language={language}
        currentView={view}
        is3DMode={is3DMode}
        setView={setView}
        applications={applications}
        updates={updates}
        projects={projects}
        documents={documents}
        faqs={faqs}
        onVoteHelpfulFAQ={handleVoteHelpfulFAQ}
        content={content}
        services={services}
        products={products}
        blogPosts={blogPosts}
        videos={videos}
        ads={ads}
        activeUser={activeUser}
        showcaseScreenshots={showcaseScreenshots}
        platformFeatures={platformFeatures}
        apkDownloadLink={apkDownloadLink}
        customUiComponents={customUiComponents}
        socialMediaLinks={socialMediaLinks}
        onUpdateActiveUser={handleUpdateActiveUser}
        onUpdateProducts={handleUpdateProducts}
        onUpdateBlogPosts={handleUpdateBlogPosts}
        onUpdateVideos={handleUpdateVideos}
        onUpdateAds={handleUpdateAds}
        onAddMessage={handleAddNewMessage}
        onIncrementDownload={handleIncrementDownload}
      />
    );
  };

  const isNeonTheme = themeMode === 'neon-cyber';
  const primaryColor = isNeonTheme ? '#ff007f' : (content.themePrimaryColor || '#be123c');
  const secondaryColor = isNeonTheme ? '#00e1d9' : (content.themeSecondaryColor || '#22d3ee');
  const accentColor = isNeonTheme ? '#ffdf00' : (content.themeAccentColor || '#f59e0b');
  const bgColor = isNeonTheme ? '#010008' : (content.themeBgColor || '#07080d');
  const glowShadow = content.themeGlowStrength === 'high' || isNeonTheme
    ? `0 0 25px ${secondaryColor}55, 0 0 50px ${primaryColor}44` 
    : content.themeGlowStrength === 'medium'
    ? `0 0 10px ${secondaryColor}22`
    : 'none';

  return (
    <div className={`relative min-h-screen w-full overflow-x-hidden pb-12 ${isNeonTheme ? 'light-mode' : ''}`} style={{ fontFamily: content.themeFontFamily === 'Space Grotesk' ? '"Space Grotesk", sans-serif' : 'inherit' }}>
      
      {/* Dyn Theme Overrides Style Block */}
      <style>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
          --accent-color: ${accentColor};
          --bg-color: ${bgColor};
          --glow-shadow: ${glowShadow};
        }
        body {
          background: ${isNeonTheme
            ? `linear-gradient(135deg, #ffffff 0%, #fdf2f8 35%, #f5f3ff 70%, #ffffff 100%)`
            : `#0a0a0f`} !important;
          color: ${isNeonTheme ? '#0f172a' : '#f3f4f6'} !important;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
          transition: background 0.3s ease-in-out, color 0.3s ease-in-out;
        }
        .theme-primary-text { color: ${primaryColor}; }
        .theme-secondary-text { color: ${secondaryColor}; }
        .theme-accent-text { color: ${accentColor}; }
        .theme-border { border-color: ${primaryColor}22; }
        .theme-border-glow:hover { border-color: ${secondaryColor}55; box-shadow: ${glowShadow}; }
        .glassmorphic-card {
          background: ${isNeonTheme ? 'rgba(255, 255, 255, 0.92)' : 'rgba(18, 18, 26, 0.85)'};
          backdrop-filter: blur(14px);
          border: 1px solid ${isNeonTheme ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.08)'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glassmorphic-card:hover {
          border-color: ${isNeonTheme ? 'rgba(236, 72, 153, 0.4)' : 'rgba(168, 85, 247, 0.4)'};
          box-shadow: ${isNeonTheme ? '0 12px 32px -10px rgba(168, 85, 247, 0.18)' : '0 0 30px rgba(168, 85, 247, 0.15)'};
          background: ${isNeonTheme ? '#ffffff' : 'rgba(22, 22, 34, 0.95)'};
        }
        .golden-transparent-button {
          background: ${isNeonTheme ? 'rgba(217, 119, 6, 0.08)' : 'rgba(0, 0, 0, 0.55)'};
          backdrop-filter: blur(8px);
          border: 1px solid #d97706; /* amber-600 */
          color: #fbbf24; /* amber-400 */
          box-shadow: 0 4px 14px rgba(217, 119, 6, 0.12);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .golden-transparent-button:hover {
          background: ${isNeonTheme ? '#d97706' : 'rgba(217, 119, 6, 0.18)'};
          border-color: #fbbf24; /* amber-400 */
          color: #ffffff;
          box-shadow: ${isNeonTheme ? '0 4px 14px rgba(217, 119, 6, 0.3)' : '0 0 20px rgba(251, 191, 36, 0.4)'};
          transform: translateY(-1px);
        }

        /* LIGHT MODE COMPREHENSIVE OVERRIDES */
        body.light-mode-active {
          background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 35%, #f5f3ff 70%, #ffffff 100%) !important;
          color: #0f172a !important;
        }

        .light-mode h1, 
        .light-mode h2, 
        .light-mode h3, 
        .light-mode h4, 
        .light-mode h5, 
        .light-mode h6,
        .light-mode .text-white,
        .light-mode .font-sora,
        .light-mode .font-bold {
          color: #0f172a !important;
        }

        .light-mode p,
        .light-mode span:not(.font-mono),
        .light-mode .text-gray-300,
        .light-mode .text-gray-400,
        .light-mode .text-gray-500,
        .light-mode .text-stone-200 {
          color: #334155 !important;
        }

        .light-mode .text-rose-500,
        .light-mode .text-rose-400,
        .light-mode .text-pink-400,
        .light-mode .text-emerald-400,
        .light-mode .text-emerald-500,
        .light-mode .text-cyan-400 {
          color: #be123c !important;
        }
        
        .light-mode .text-amber-400,
        .light-mode .text-amber-500 {
          color: #d97706 !important;
        }

        .light-mode .border-white\/10,
        .light-mode .border-white\/5,
        .light-mode .border-pink-500\/20,
        .light-mode .border-emerald-500\/20 {
          border-color: rgba(168, 85, 247, 0.2) !important;
        }

        .light-mode svg:not(.text-amber-500):not(.text-rose-500) {
          color: #7c3aed !important;
        }
        .light-mode svg.text-pink-400 {
          color: #db2777 !important;
        }

        .light-mode .glassmorphic-card,
        .light-mode .bg-\[\#050505\],
        .light-mode .bg-black\/40,
        .light-mode .bg-white\/5 {
          background: rgba(255, 255, 255, 0.88) !important;
          backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(168, 85, 247, 0.18) !important;
          box-shadow: 0 10px 30px -10px rgba(168, 85, 247, 0.12) !important;
        }

        .light-mode .glassmorphic-card:hover,
        .light-mode .bg-\[\#050505\]:hover {
          background: #ffffff !important;
          border-color: rgba(236, 72, 153, 0.45) !important;
          box-shadow: 0 15px 35px -5px rgba(236, 72, 153, 0.18), 0 0 15px rgba(168, 85, 247, 0.1) !important;
        }

        .light-mode .nav-item-active {
          background: rgba(168, 85, 247, 0.12) !important;
          color: #7c3aed !important;
        }
        
        .light-mode .bg-emerald-500\/10,
        .light-mode .bg-emerald-500\/5 {
          background-color: rgba(168, 85, 247, 0.08) !important;
        }

        .light-mode label, 
        .light-mode input, 
        .light-mode textarea, 
        .light-mode select {
          color: #0f172a !important;
        }
        .light-mode input::placeholder, 
        .light-mode textarea::placeholder {
          color: #64748b !important;
        }
        .light-mode .bg-[#111] {
          background-color: #f1f5f9 !important;
        }
        .light-mode .bg-[#151515] {
          background-color: #f8fafc !important;
        }
        .light-mode .bg-[#1a1a1a] {
          background-color: #f1f5f9 !important;
        }
        .light-mode .border-gray-800 {
          border-color: rgba(168, 85, 247, 0.18) !important;
        }
        .light-mode .bg-emerald-500\/20 {
          background-color: rgba(168, 85, 247, 0.1) !important;
        }
        .light-mode .text-emerald-400 {
          color: #7c3aed !important;
        }
        .light-mode .text-gray-400 {
          color: #475569 !important;
        }
        }
        .light-mode .bg-emerald-500\/20 {
          background-color: rgba(124, 58, 237, 0.1) !important;
        }
        .light-mode .text-emerald-400 {
          color: #7c3aed !important;
        }
        .light-mode .text-gray-400 {
          color: #475569 !important;
        }
        .golden-transparent-button:active {
          transform: translateY(1px);
        }
      `}</style>
      
      {/* Global Ambient Light & Tactile Noise Background */}
      {content.themeBgEffect !== 'none' && <AmbientBackground isNeonTheme={isNeonTheme} />}

      {/* Scroll-based Progress Bar at Viewport Top */}
      {(view === 'documentation' || view === 'blog') && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-white/[0.03] z-[100] pointer-events-none">
          <div 
            className="h-full bg-gradient-to-r from-[--primary-color] to-[--secondary-color] shadow-[0_0_10px_var(--secondary-color)] transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Conditionally omit standard header/footer layout when inside Control Center, REXLIFY AI Suite, or RODP Platform */}
      {view !== 'admin-dashboard' && view !== 'rexlify-ai' && view !== 'rodp' && (
        <Navbar 
          currentView={view}
         
          setView={setView} 
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
          language={language}
          setLanguage={handleUpdateLanguage}
          applications={applications}
          projects={projects}
          blogPosts={blogPosts}
          themeMode={themeMode}
          
          is3DMode={is3DMode}
          toggle3DMode={() => setIs3DMode(!is3DMode)}
          toggleThemeMode={handleToggleThemeMode}
        />
      )}

      <OfflineBanner />
      {/* Main Viewport Content Transition blocks */}
      <main className="relative z-10 transition-all duration-300">
        <UniversalBackButton currentView={view} setView={setView} />
        {renderViewContent()}
      </main>

      {view !== 'admin-dashboard' && view !== 'rexlify-ai' && view !== 'rodp' && (
        <Footer 
          setView={setView} 
          isAdminLoggedIn={isAdminLoggedIn}
          language={language}
          onAddSubscriber={handleAddSubscriber}
          socialMediaLinks={socialMediaLinks}
          is3DMode={is3DMode}
          toggle3DMode={() => setIs3DMode(!is3DMode)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
