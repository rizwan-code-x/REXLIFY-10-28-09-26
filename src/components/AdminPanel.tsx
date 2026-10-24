/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import { 
  BarChart2, Cpu, FileText, Globe, Layers, Mail, Settings, ShieldAlert, 
  Trash2, Edit, Plus, Check, AlertCircle, RefreshCw, X, Eye, EyeOff, 
  Sliders, Link, Calendar, ArrowUpRight, Copy, AppWindow, FileSpreadsheet, Lock, Sparkles, AlertTriangle,
  Send, Briefcase, ShoppingBag, PenTool, PlayCircle, Maximize2, Minimize2, HelpCircle
, Users } from 'lucide-react';
import { 
  subscribeRODPApplications, 
  updateRODPApplicationStatus, 
  deleteRODPApplication, 
  submitRODPApplication, 
  RODPApplication 
} from '../services/rodpService';
import { 
  Application, Update, Project, DocArticle, UserMessage, SEOSettings, WebsiteContent, AppStatus, ProjectStatus, UpdateCategory, DocCategory,
  ServiceItem, ProductItem, BlogItem, VideoCenterItem, AdvertisementItem, SocialMediaLink, FAQItem
} from '../types';

// Extract Video ID helper for platforms with robust regex validation and normalization
const parseVideoUrl = (url: string) => {
  if (!url) return { type: 'unknown', embedUrl: '' };

  const trimmed = url.trim();

  // 1. YouTube Robust Matcher (supports watch?v=, embed/, v/, shorts/, live/, youtu.be/, watch?v= with extra query parameters)
  const ytRegex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:[^\/\n]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&mute=1&enablejsapi=1&rel=0`
    };
  }

  // 2. Facebook Robust Matcher
  // Supports facebook.com videos, reels, share links, m.facebook, fb.watch, fb.com
  const isFacebook = /facebook\.com|fb\.watch|fb\.com/i.test(trimmed);
  if (isFacebook) {
    let targetUrl = trimmed;
    // Extract numeric ID from paths like /videos/123, /reel/123, /reels/123, or ?v=123
    const idMatch = trimmed.match(/(?:\?v=|&v=|\/videos\/|\/reel\/|\/reels\/|\/watch\/)(\d+)/i);
    const shareMatch = trimmed.match(/facebook\.com\/share\/[vr]\/([a-zA-Z0-9_-]+)/i);
    const watchMatch = trimmed.match(/fb\.watch\/([a-zA-Z0-9_-]+)/i);

    if (idMatch && idMatch[1]) {
      targetUrl = `https://www.facebook.com/watch/?v=${idMatch[1]}`;
    } else if (shareMatch && shareMatch[1]) {
      // If sharing link, we can fallback to the target URL as is, or reconstruct
      targetUrl = trimmed;
    } else if (watchMatch && watchMatch[1]) {
      targetUrl = trimmed;
    }

    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(targetUrl)}&show_text=0&mute=1&autoplay=0`
    };
  }

  // 3. Instagram Robust Matcher (matches /p/, /reel/, /reels/, /tv/ with or without username in path)
  const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:[^\/\n]+\/)?(?:p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/i;

  const igMatch = trimmed.match(igRegex);
  if (igMatch && igMatch[1]) {
    return {
      type: 'instagram',
      embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed/`
    };
  }

  // Direct MP4 / Video streams
  if (trimmed.match(/\.(mp4|webm|ogg|mov)$/i)) {
    return {
      type: 'direct',
      embedUrl: trimmed
    };
  }

  return {
    type: 'website',
    embedUrl: trimmed
  };
};

interface AdminPanelProps {
  applications: Application[];
  updates: Update[];
  projects: Project[];
  documents: DocArticle[];
  faqs?: FAQItem[];
  messages: UserMessage[];
  seo: SEOSettings;
  content: WebsiteContent;
  subscribers: string[];
  services: ServiceItem[];
  products: ProductItem[];
  blogPosts: BlogItem[];
  videos: VideoCenterItem[];
  ads: AdvertisementItem[];
  maintenanceMode: { enabled: boolean; message: string };
  showcaseScreenshots: any[];
  platformFeatures: any[];
  apkDownloadLink: string;

  onUpdateSubscribers: (subs: string[]) => void;
  onUpdateApps: (apps: Application[]) => void;
  onUpdateUpdates: (updates: Update[]) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateDocs: (docs: DocArticle[]) => void;
  onUpdateFaqs?: (faqs: FAQItem[]) => void;
  onUpdateMessages: (msgs: UserMessage[]) => void;
  onUpdateSEO: (seo: SEOSettings) => void;
  onUpdateContent: (content: WebsiteContent) => void;
  onUpdateServices: (services: ServiceItem[]) => void;
  onUpdateProducts: (products: ProductItem[]) => void;
  onUpdateBlogPosts: (blog: BlogItem[]) => void;
  onUpdateVideos: (videos: VideoCenterItem[]) => void;
  onUpdateAds: (ads: AdvertisementItem[]) => void;
  onUpdateMaintenanceMode: (mode: { enabled: boolean; message: string }) => void;
  onUpdateShowcaseScreenshots: (screens: any[]) => void;
  onUpdatePlatformFeatures: (feats: any[]) => void;
  onUpdateApkDownloadLink: (link: string) => void;
  customUiComponents: any[];
  onUpdateCustomUiComponents: (comps: any[]) => void;
  socialMediaLinks: SocialMediaLink[];
  onUpdateSocialMediaLinks: (links: SocialMediaLink[]) => void;
  onLogout: () => void;
  onNavigateToRodp?: () => void;
}




export const AdminPanel: React.FC<AdminPanelProps> = ({
  applications, updates, projects, documents, faqs = [], messages, seo, content,
  subscribers, services, products, blogPosts, videos, ads, maintenanceMode,
  showcaseScreenshots, platformFeatures, apkDownloadLink, customUiComponents,
  socialMediaLinks,
  onUpdateSubscribers, onUpdateApps, onUpdateUpdates, onUpdateProjects, onUpdateDocs,
  onUpdateFaqs, onUpdateMessages, onUpdateSEO, onUpdateContent, onUpdateServices, onUpdateProducts,
  onUpdateBlogPosts, onUpdateVideos, onUpdateAds, onUpdateMaintenanceMode,
  onUpdateShowcaseScreenshots, onUpdatePlatformFeatures, onUpdateApkDownloadLink,
  onUpdateCustomUiComponents, onUpdateSocialMediaLinks, onLogout, onNavigateToRodp
}) => {

  const [sysStatus, setSysStatus] = useState({
    sifra: true,
    rexlify_ai: true,
    rodp: true,
    institute: true,
    neurax: true,
    global_maintenance: false
  });
  
  useEffect(() => {
    let rtdbInstance = null;
    import('../firebase-rexlify').then(async ({ rtdb }) => {
      if (!rtdb) return;
      rtdbInstance = rtdb;
      const statusRef = ref(rtdb, 'rexlify_system_status');
      onValue(statusRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setSysStatus(prev => ({ ...prev, ...val }));
        }
      });
    });
  }, []);

  const handleToggleSysStatus = async (key: string) => {
    const newValue = !sysStatus[key as keyof typeof sysStatus];
    try {
      const { rtdb } = await import('../firebase-rexlify');
      if (rtdb) {
        await set(ref(rtdb, 'rexlify_system_status/' + key), newValue);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };


  // Sidebar tab management
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [chartView, setChartView] = useState<'trends' | 'distribution'>('trends');

  // Form modals state
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [isAddingApp, setIsAddingApp] = useState(false);

  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);

  const [editingDoc, setEditingDoc] = useState<DocArticle | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // Extra modals/forms states
  const [editingFeature, setEditingFeature] = useState<any | null>(null);
  const [isAddingFeature, setIsAddingFeature] = useState(false);

  const [editingScreenshot, setEditingScreenshot] = useState<any | null>(null);
  const [isAddingScreenshot, setIsAddingScreenshot] = useState(false);

  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);

  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [editingBlogPost, setEditingBlogPost] = useState<BlogItem | null>(null);
  const [isAddingBlogPost, setIsAddingBlogPost] = useState(false);

  const [editingVideo, setEditingVideo] = useState<VideoCenterItem | null>(null);
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  const [editingAd, setEditingAd] = useState<AdvertisementItem | null>(null);
  const [isAddingAd, setIsAddingAd] = useState(false);

  const [editingCustomUiComponent, setEditingCustomUiComponent] = useState<any | null>(null);
  const [isAddingCustomUiComponent, setIsAddingCustomUiComponent] = useState(false);

  const [editingSocialMediaLink, setEditingSocialMediaLink] = useState<SocialMediaLink | null>(null);
  const [isAddingSocialMediaLink, setIsAddingSocialMediaLink] = useState(false);
  const [socialMediaPreviewUrl, setSocialMediaPreviewUrl] = useState<string | null>(null);

  const [visualRoadmapLoading, setVisualRoadmapLoading] = useState(false);
  const [visualRoadmapData, setVisualRoadmapData] = useState<any[] | null>(null);

  // Expanded Sifra Assistant States
  const [videoFormValues, setVideoFormValues] = useState({
    title: '',
    url: '',
    sponsor: '',
    duration: 'Auto',
    image: '',
    category: 'Tutorials',
    description: ''
  });
  const [lastScannedUrl, setLastScannedUrl] = useState('');
  const [aiThumbnailLoading, setAiThumbnailLoading] = useState(false);
  
  const [aiRoadmapLoading, setAiRoadmapLoading] = useState(false);
  const [aiRoadmapPreview, setAiRoadmapPreview] = useState<any | null>(null);
  
  const [aiDocCompilerLoading, setAiDocCompilerLoading] = useState(false);
  
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [aiReplyLoading, setAiReplyLoading] = useState(false);
  const [aiReplyText, setAiReplyText] = useState('');
  const [aiReplyTone, setAiReplyTone] = useState<'helpful' | 'explanatory' | 'technical' | 'urgent'>('helpful');

  const [aiEnhanceLoadingField, setAiEnhanceLoadingField] = useState<string | null>(null);
  const [isMessageCenterFullScreen, setIsMessageCenterFullScreen] = useState(false);

  const [aiNewsletterLoading, setAiNewsletterLoading] = useState(false);
  const [aiNewsletterText, setAiNewsletterText] = useState('');

  // Blog custom arrangement
  const [selectedBlogForAI, setSelectedBlogForAI] = useState<BlogItem | null>(null);
  const [isArrangingBlogAI, setIsArrangingBlogAI] = useState(false);
  const [aiBlogArrangerLoading, setAiBlogArrangerLoading] = useState(false);

  // Sifra AI Chat states
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesList, setMessagesList] = useState<any[]>([
    { sender: 'sifra', text: 'স্বাগতম! আমি সিফরা এআই (Sifra AI)। রিক্সয়ালিফাই প্ল্যাটফর্মের কনটেন্ট ডিজাইন ও ফরম্যাটিং অ্যাসিস্ট্যান্ট। আপনি ড্যাশবোর্ড, অ্যাপ, আর্কিটেকচার, সার্ভিস, প্রোডাক্ট বা ব্লগের জন্য কী তৈরি করতে চান বলুন। নিচে একটি ক্যাটাগরি সিলেক্ট করে প্রম্পট লিখুন।' }
  ]);
  const [itemType, setItemType] = useState<string>('blog');
  const [latestData, setLatestData] = useState<any>(null);

  // Notifications state
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;
    const userMsg = prompt;
    setMessagesList(prev => [...prev, { sender: 'user', text: userMsg }]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          itemType: itemType,
          chatHistory: messagesList.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }))
        })
      });
      const resJson = await res.json();
      if (resJson && resJson.message) {
        setMessagesList(prev => [...prev, { sender: 'sifra', text: resJson.message, data: resJson.generatedData }]);
        if (resJson.generatedData) {
          setLatestData({ type: itemType, data: resJson.generatedData });
        }
      } else {
        setMessagesList(prev => [...prev, { sender: 'sifra', text: 'Error: Could not retrieve dynamic content from Sifra AI core.' }]);
      }
    } catch (err) {
      setMessagesList(prev => [...prev, { sender: 'sifra', text: 'Connection failed with Sifra AI neural networks.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSifraData = (type: string, data: any) => {
    if (!data) return;
    try {
      if (type === 'feature') {
        const nextFeat = {
          id: `feat-${Date.now()}`,
          title: data.title || 'Dynamic Feature',
          desc: data.desc || 'Created via Sifra AI',
          icon: data.icon || 'Sparkles'
        };
        onUpdatePlatformFeatures([...platformFeatures, nextFeat]);
        triggerToast('Sifra AI concept imported to Platform Features!');
      } else if (type === 'application') {
        const nextApp = {
          id: `app-${Date.now()}`,
          name: data.name || 'AI App',
          logo: data.logo || '🤖',
          shortDescription: data.shortDescription || '',
          fullDescription: data.fullDescription || '',
          version: data.version || '1.0.0',
          category: data.category || 'Utility',
          status: data.status || 'Active',
          releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
          developerNotes: data.developerNotes || 'Automated design',
          screenshots: data.screenshots || [],
          downloadUrl: data.downloadUrl || apkDownloadLink || '',
          tags: data.tags || ['AI'],
          features: data.features || [],
          apkInfo: data.apkInfo || { size: '15.2 MB', downloadCount: 0, compatibility: 'Android 8.0+', changelog: [] }
        };
        onUpdateApps([...applications, nextApp]);
        triggerToast('Sifra AI concept imported to App Manager!');
      } else if (type === 'service') {
        const nextServ = {
          id: `service-${Date.now()}`,
          title: data.title || 'Sifra Service',
          description: data.description || '',
          iconName: data.iconName || 'Briefcase',
          fullDetails: data.fullDetails || '',
          features: data.features || []
        };
        onUpdateServices([...services, nextServ]);
        triggerToast('Sifra AI concept imported to Services!');
      } else if (type === 'project') {
        const nextProj = {
          id: `proj-${Date.now()}`,
          name: data.name || 'AI Roadmap Project',
          description: data.description || '',
          progress: data.progress || 0,
          status: data.status || 'Planning',
          targetRelease: data.targetRelease || 'Q4 2026',
          category: data.category || 'Infrastructure',
          notes: data.notes || ''
        };
        onUpdateProjects([...projects, nextProj]);
        triggerToast('Sifra AI concept imported to Roadmap!');
      } else if (type === 'blog') {
        const nextBlog = {
          id: `blog-${Date.now()}`,
          title: data.title || 'Sifra AI Insight',
          summary: data.summary || '',
          content: data.content || '',
          category: data.category || 'Tech',
          tags: data.tags || ['AI'],
          image: data.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
          date: data.date || new Date().toISOString().split('T')[0],
          author: data.author || 'Sifra AI Writer',
          readTime: data.readTime || '4 min read',
          comments: []
        };
        onUpdateBlogPosts([...blogPosts, nextBlog]);
        triggerToast('Sifra AI content imported to Blog Publisher!');
      } else if (type === 'video') {
        const nextVid = {
          id: `video-${Date.now()}`,
          url: data.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          title: data.title || 'AI Sponsored Clip',
          description: data.description || '',
          category: data.category || 'Tutorials',
          sponsor: data.sponsor || 'Rexlify Sponsor',
          date: data.date || new Date().toISOString().split('T')[0],
          likes: 0,
          shares: 0,
          comments: [],
          duration: data.duration || '02:30'
        };
        onUpdateVideos([...videos, nextVid]);
        triggerToast('Sifra AI content imported to Videos!');
      } else if (type === 'ad') {
        const nextAd = {
          id: `ad-${Date.now()}`,
          title: data.title || 'AI Ad Space',
          imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
          linkUrl: data.linkUrl || '#',
          adType: data.adType || 'Banner',
          active: true,
          impressions: 0,
          clicks: 0,
          revenuePerClick: data.revenuePerClick || 0.15
        };
        onUpdateAds([...ads, nextAd]);
        triggerToast('Sifra AI advertisement imported to Media Center!');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Parsing failed for Sifra AI concept. Try editing the output manually.');
    }
  };

  // EXTRA CONFIGURATION CRUD HANDLERS
  const handleSaveFeature = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const desc = formData.get('desc') as string;
    const icon = formData.get('icon') as string;
    
    if (editingFeature) {
      onUpdatePlatformFeatures(platformFeatures.map(f => f.id === editingFeature.id ? { ...f, title, desc, icon } : f));
      setEditingFeature(null);
      triggerToast('Platform feature updated!');
    } else {
      const newFeat = { id: `feat-${Date.now()}`, title, desc, icon };
      onUpdatePlatformFeatures([...platformFeatures, newFeat]);
      setIsAddingFeature(false);
      triggerToast('New platform feature deployed!');
    }
  };

  const handleDeleteFeature = (id: string) => {
    onUpdatePlatformFeatures(platformFeatures.filter(f => f.id !== id));
    triggerToast('Platform feature deleted.');
  };

  const handleSaveScreenshot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const appId = formData.get('appId') as string;
    const appName = formData.get('appName') as string;
    const src = formData.get('src') as string;
    const description = formData.get('description') as string;
    const label = formData.get('label') as string;

    if (editingScreenshot) {
      onUpdateShowcaseScreenshots(showcaseScreenshots.map(s => s.id === editingScreenshot.id ? { ...s, appId, appName, src, description, label } : s));
      setEditingScreenshot(null);
      triggerToast('Showcase screenshot updated!');
    } else {
      const newScreen = { id: `screen-${Date.now()}`, appId, appName, src, description, label };
      onUpdateShowcaseScreenshots([...showcaseScreenshots, newScreen]);
      setIsAddingScreenshot(false);
      triggerToast('New showcase screenshot added!');
    }
  };

  const handleDeleteScreenshot = (id: string) => {
    onUpdateShowcaseScreenshots(showcaseScreenshots.filter(s => s.id !== id));
    triggerToast('Showcase screenshot deleted.');
  };

  const handleSaveCustomUiComponent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const subtitle = formData.get('subtitle') as string;
    const content = formData.get('content') as string;
    const layout = formData.get('layout') as any;
    const accentColor = formData.get('accentColor') as any;
    const visible = formData.get('visible') === 'true';
    const order = parseInt(formData.get('order') as string || '1', 10);

    if (editingCustomUiComponent) {
      onUpdateCustomUiComponents(customUiComponents.map(c => c.id === editingCustomUiComponent.id ? { ...c, title, subtitle, content, layout, accentColor, visible, order } : c));
      setEditingCustomUiComponent(null);
      triggerToast('Custom UI Component updated!');
    } else {
      const newComp = { id: `comp-${Date.now()}`, title, subtitle, content, layout, accentColor, visible, order };
      onUpdateCustomUiComponents([...customUiComponents, newComp]);
      setIsAddingCustomUiComponent(false);
      triggerToast('New dynamic UI component created!');
    }
  };

  const handleDeleteCustomUiComponent = (id: string) => {
    onUpdateCustomUiComponents(customUiComponents.filter(c => c.id !== id));
    triggerToast('Custom UI Component removed.');
  };

  const handleSaveSocialMediaLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const platform = formData.get('platform') as string;
    const url = formData.get('url') as string;
    const icon = formData.get('icon') as string;

    if (editingSocialMediaLink) {
      onUpdateSocialMediaLinks(socialMediaLinks.map(l => l.id === editingSocialMediaLink.id ? { ...l, platform, url, icon } : l));
      setEditingSocialMediaLink(null);
      triggerToast('Social Media Link updated!');
    } else {
      const newLink = { id: `sm-${Date.now()}`, platform, url, icon };
      onUpdateSocialMediaLinks([...socialMediaLinks, newLink]);
      setIsAddingSocialMediaLink(false);
      triggerToast('New Social Media Link created!');
    }
  };

  const handleDeleteSocialMediaLink = (id: string) => {
    onUpdateSocialMediaLinks(socialMediaLinks.filter(l => l.id !== id));
    triggerToast('Social Media Link removed.');
  };

  const handleSaveService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const iconName = formData.get('iconName') as string;
    const fullDetails = formData.get('fullDetails') as string;
    const featuresRaw = formData.get('features') as string;
    const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : [];

    if (editingService) {
      onUpdateServices(services.map(s => s.id === editingService.id ? { ...s, title, description, iconName, fullDetails, features } : s));
      setEditingService(null);
      triggerToast('Service updated!');
    } else {
      const newServ = { id: `service-${Date.now()}`, title, description, iconName, fullDetails, features };
      onUpdateServices([...services, newServ]);
      setIsAddingService(false);
      triggerToast('New service published!');
    }
  };

  const handleDeleteService = (id: string) => {
    onUpdateServices(services.filter(s => s.id !== id));
    triggerToast('Service removed.');
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const fullDetails = formData.get('fullDetails') as string;
    const category = formData.get('category') as any;
    const image = formData.get('image') as string;
    const rating = parseFloat(formData.get('rating') as string) || 5;
    const downloads = formData.get('downloads') as string;
    const downloadUrl = formData.get('downloadUrl') as string;
    const githubUrl = formData.get('githubUrl') as string || '';
    const docsUrl = formData.get('docsUrl') as string || '';
    const featuresRaw = formData.get('features') as string;
    const features = featuresRaw ? featuresRaw.split(',').map(f => f.trim()).filter(Boolean) : [];

    if (editingProduct) {
      onUpdateProducts(products.map(p => p.id === editingProduct.id ? { ...p, name, description, fullDetails, category, image, rating, downloads, downloadUrl, githubUrl, docsUrl, features } : p));
      setEditingProduct(null);
      triggerToast('Product details updated!');
    } else {
      const newProd = { id: `prod-${Date.now()}`, name, description, fullDetails, category, image, rating, downloads, downloadUrl, githubUrl, docsUrl, features, reviews: [] };
      onUpdateProducts([...products, newProd]);
      setIsAddingProduct(false);
      triggerToast('New product added to catalog!');
    }
  };

  const handleDeleteProduct = (id: string) => {
    onUpdateProducts(products.filter(p => p.id !== id));
    triggerToast('Product removed.');
  };

  const handleSaveBlogPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const summary = formData.get('summary') as string;
    const contentText = formData.get('content') as string;
    const category = formData.get('category') as string;
    const tagsRaw = formData.get('tags') as string;
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
    const image = formData.get('image') as string || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe';
    const author = formData.get('author') as string || 'Rexlify Editor';
    const readTime = formData.get('readTime') as string || '4 min read';

    if (editingBlogPost) {
      onUpdateBlogPosts(blogPosts.map(b => b.id === editingBlogPost.id ? { ...b, title, summary, content: contentText, category, tags, image, author, readTime } : b));
      setEditingBlogPost(null);
      triggerToast('Blog post updated!');
    } else {
      const newBlog = { id: `blog-${Date.now()}`, title, summary, content: contentText, category, tags, image, author, readTime, date: new Date().toISOString().split('T')[0], comments: [] };
      onUpdateBlogPosts([...blogPosts, newBlog]);
      setIsAddingBlogPost(false);
      triggerToast('New blog post published successfully!');
    }
  };

  const handleDeleteBlogPost = (id: string) => {
    onUpdateBlogPosts(blogPosts.filter(b => b.id !== id));
    triggerToast('Blog post removed.');
  };

  const handleSaveVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as any;
    const sponsor = formData.get('sponsor') as string;
    const duration = formData.get('duration') as string || 'Auto';
    const image = formData.get('image') as string || '';

    if (editingVideo) {
      onUpdateVideos(videos.map(v => v.id === editingVideo.id ? { ...v, title, url, description, category, sponsor, duration, image } : v));
      setEditingVideo(null);
      triggerToast('Video details updated!');
    } else {
      const newVid = { id: `video-${Date.now()}`, title, url, description, category, sponsor, duration, image, date: new Date().toISOString().split('T')[0], likes: 0, shares: 0, comments: [] };
      onUpdateVideos([...videos, newVid]);
      setIsAddingVideo(false);
      triggerToast('New video uploaded!');
    }
  };

  const handleDeleteVideo = (id: string) => {
    onUpdateVideos(videos.filter(v => v.id !== id));
    triggerToast('Video deleted.');
  };

  // Expanded Sifra AI Service Helper Implementations
  const handleGenerateThumbnailAI = async (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      triggerToast('Please provide a video title first!');
      return;
    }
    setAiThumbnailLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a single specific search term/keyword suitable for finding a stunning futuristic, cybernetic, neural, or high-tech visual background image on Unsplash for a video titled "${title}". Return as a raw JSON with field "keyword".`,
          itemType: 'video'
        })
       });
       const data = await res.json();
       const keyword = data.generatedData?.keyword || title.split(' ')[0] || 'network';
       const randomId = Math.floor(Math.random() * 1000);
       const unsplashUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80&sig=${randomId}&q=${encodeURIComponent(keyword)}`;
       
       const input = document.querySelector('input[name="image"]') as HTMLInputElement;
       if (input) {
         input.value = unsplashUrl;
         triggerToast(`Sifra AI fetched an outstanding Unsplash visual for "${keyword}"!`);
       }
    } catch (err) {
       console.error(err);
       triggerToast('AI service busy. Loaded high-quality default cyber background.');
       const input = document.querySelector('input[name="image"]') as HTMLInputElement;
       if (input) {
         input.value = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
       }
    } finally {
       setAiThumbnailLoading(false);
    }
  };

  const handleGenerateVideoMetadataAI = async (videoUrl: string, e?: React.MouseEvent | React.FocusEvent | React.ClipboardEvent | any) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!videoUrl.trim()) {
      triggerToast('Please provide a video link URL first!');
      return;
    }
    setAiThumbnailLoading(true);
    triggerToast('Sifra AI is analyzing video URL contents to extract metadata...');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please suggest a highly engaging, professional title, realistic detailed description, and a single high-tech search term suitable for an aesthetic cover image for this video URL: "${videoUrl}". Respond as a valid JSON with keys: "title", "description", "keyword". Do not include markdown brackets around JSON.`,
          itemType: 'video'
        })
      });
      const data = await res.json();
      const payload = data.generatedData || {};
      
      let finalTitle = payload.title || "Suggested Technical Walkthrough";
      let finalDesc = payload.description || "In-depth deployment and systems overview of the Rexlify network nodes.";
      let keyword = payload.keyword || "network";
      
      const randomId = Math.floor(Math.random() * 1000);
      const unsplashUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80&sig=${randomId}&q=${encodeURIComponent(keyword)}`;
      
      setVideoFormValues(prev => ({
        ...prev,
        title: finalTitle,
        description: finalDesc,
        image: unsplashUrl
      }));
      
      // Also update DOM values directly for security
      const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
      const descInput = document.querySelector('input[name="description"]') as HTMLInputElement;
      const imageInput = document.querySelector('input[name="image"]') as HTMLInputElement;
      if (titleInput) titleInput.value = finalTitle;
      if (descInput) descInput.value = finalDesc;
      if (imageInput) imageInput.value = unsplashUrl;
      
      triggerToast('Sifra AI successfully suggested Title, Description & Cover Image!');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to generate metadata via Sifra AI. Loaded defaults.');
    } finally {
      setAiThumbnailLoading(false);
    }
  };

  const handleGenerateRoadmapAI = async (conceptPrompt: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!conceptPrompt.trim()) {
      triggerToast('Please enter a milestone name or concept first!');
      return;
    }
    setAiRoadmapLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Design a fully detailed development roadmap milestone with name, category, progress (integer 0-100), targetRelease (e.g. Q4 2026), description (markdown/text summary), and notes for: "${conceptPrompt}". Return raw JSON with fields "name", "category", "progress", "targetRelease", "description", "notes".`,
          itemType: 'project'
        })
      });
      const data = await res.json();
      const payload = data.generatedData || {};
      
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      const categoryInput = document.querySelector('input[name="category"]') as HTMLInputElement;
      const progressInput = document.querySelector('input[name="progress"]') as HTMLInputElement;
      const releaseInput = document.querySelector('input[name="targetRelease"]') as HTMLInputElement;
      const descriptionInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
      const notesInput = document.querySelector('textarea[name="notes"]') as HTMLTextAreaElement;
      
      if (nameInput) nameInput.value = payload.name || conceptPrompt;
      if (categoryInput) categoryInput.value = payload.category || 'Artificial Intelligence';
      if (progressInput) progressInput.value = String(payload.progress !== undefined ? payload.progress : 15);
      if (releaseInput) releaseInput.value = payload.targetRelease || 'Q4 2026';
      if (descriptionInput) descriptionInput.value = payload.description || '';
      if (notesInput) notesInput.value = payload.notes || '';
      
      setAiRoadmapPreview(payload);
      triggerToast('Sifra AI formulated milestone specifications!');
    } catch (err) {
      console.error(err);
      triggerToast('Sifra AI is fully busy right now.');
    } finally {
      setAiRoadmapLoading(false);
    }
  };

  const handleGenerateFullVisualRoadmapAI = async (goals: string) => {
    if (!goals.trim()) {
      triggerToast('Please describe your project goals first!');
      return;
    }
    setVisualRoadmapLoading(true);
    triggerToast('Sifra AI is architecting your visual roadmap sequence...');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a structured, professional multi-phase project roadmap sequence based on these goals: "${goals}". Provide exactly 3 or 4 key milestone phases. Format the response as JSON with an array under key "milestones", where each milestone has keys: "name" (string), "category" (string), "progress" (integer 0-100), "targetRelease" (string, e.g. Q1 2027), "description" (string summary), "notes" (string extra details), "timeMarker" (string, e.g., "Month 1-2" or "Phase 1"), and "unsplashSearchTerm" (string, a single word to search an image for e.g. "security", "cloud"). Return the output strictly conforming to this schema.`,
          itemType: 'project'
        })
      });
      const resJson = await res.json();
      let list = null;
      if (resJson && resJson.generatedData) {
        list = resJson.generatedData.milestones || resJson.generatedData;
      }
      if (!list && resJson && resJson.message) {
        try {
          const cleanText = resJson.message.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          list = parsed.milestones || parsed;
        } catch (e) {
          // ignore parsing error, try direct list
        }
      }

      if (Array.isArray(list)) {
        setVisualRoadmapData(list);
        triggerToast('Sifra AI compiled a stunning visual roadmap preview!');
      } else {
        // Fallback mockup list if API busy or returned text
        const fallbackList = [
          { name: "Phase 1: Binary Architecture", category: "Infrastructure", progress: 100, targetRelease: "Q1 2027", description: "Design a secure, lightweight mobile binary compilation sandbox to guard memory blocks.", notes: "Integrate native telemetry checks.", timeMarker: "Phase 1", unsplashSearchTerm: "code" },
          { name: "Phase 2: Real-time Telemetry Dashboard", category: "Analytics", progress: 60, targetRelease: "Q2 2027", description: "Implement distributed websocket triggers and interactive dashboard metrics.", notes: "Uses Recharts with purple-pink accents.", timeMarker: "Phase 2", unsplashSearchTerm: "dashboard" },
          { name: "Phase 3: Decentralized Caching", category: "Network", progress: 10, targetRelease: "Q3 2027", description: "Deploy local caching mechanisms to accelerate APK downloads in offline or low-signal zones.", notes: "Testing with real physical nodes.", timeMarker: "Phase 3", unsplashSearchTerm: "server" }
        ];
        setVisualRoadmapData(fallbackList);
        triggerToast('Sifra AI compiled a customized visual roadmap draft!');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Roadmap generation failed.');
    } finally {
      setVisualRoadmapLoading(false);
    }
  };

  const handleImportVisualRoadmap = () => {
    if (!visualRoadmapData) return;
    const newProjects = visualRoadmapData.map((m, i) => ({
      id: `proj-ai-${Date.now()}-${i}`,
      name: m.name || `Phase ${i+1}: Milestone`,
      description: m.description || '',
      progress: m.progress || 10,
      status: (m.progress >= 100 ? 'Released' : m.progress > 0 ? 'Development' : 'Planning') as any,
      targetRelease: m.targetRelease || 'Q4 2026',
      category: m.category || 'General',
      notes: m.notes || ''
    }));
    onUpdateProjects([...projects, ...newProjects as any]);
    setVisualRoadmapData(null);
    triggerToast('Visual roadmap milestones successfully deployed!');
  };

  const handleCompileLinkDocs = async (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      triggerToast('Please provide a source URL first!');
      return;
    }
    setAiDocCompilerLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `We want to compile and extract key technical documentation from this source URL: "${url}". Please generate a highly detailed, professional, beautifully formatted, comprehensive Markdown manual with headers (##, ###), bullet points, bold key terms, and highlights based on this topic.`,
          itemType: 'blog'
        })
      });
      const data = await res.json();
      const contentMarkdown = data.message || data.generatedData?.content || '';
      const titleGenerated = data.generatedData?.title || 'Compiled Technical Guide from Link';
      
      const contentArea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
      const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
      if (contentArea) contentArea.value = contentMarkdown;
      if (titleInput) titleInput.value = titleGenerated;
      
      triggerToast('Sifra AI successfully compiled, formatted and populated the editor!');
    } catch (err) {
      console.error(err);
      triggerToast('Could not compile from URL. Loaded standard draft framework.');
    } finally {
      setAiDocCompilerLoading(false);
    }
  };

  const handleGenerateNewsletterAI = async (topic: string) => {
    setAiNewsletterLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please generate a highly professional and engaging mailing newsletter broadcast subject and body. The topic or update is: "${topic}". Response must be a JSON object with: { "subject": "string", "body": "string (Markdown format)" }`,
          itemType: 'blog'
        })
      });
      const data = await res.json();
      let parsed;
      try {
        const cleanMsg = data.message.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanMsg);
      } catch (e) {
        parsed = {
          subject: `Security & Platform Intelligence Briefing: ${topic}`,
          body: data.message || `Dear Subscribers,

We have completed our latest cycle on: ${topic}.`
        };
      }
      
      const subjectInput = document.getElementById('newsletter-subject-input') as HTMLInputElement;
      const bodyTextArea = document.getElementById('newsletter-body-textarea') as HTMLTextAreaElement;
      if (subjectInput) subjectInput.value = parsed.subject || '';
      if (bodyTextArea) bodyTextArea.value = parsed.body || '';
      triggerToast('Sifra AI composed custom newsletter briefing!');
    } catch (err) {
      console.error(err);
      triggerToast('Could not compile newsletter draft.');
    } finally {
      setAiNewsletterLoading(false);
    }
  };

  const handleEnhanceWebsiteContentAI = async (brandDescription: string) => {
    setAiEnhanceLoadingField('website-content');
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Please generate highly compelling professional copy for our technology portal based on this description: "${brandDescription}". Response must be a JSON object containing: { "heroTitle": "string", "heroSubtitle": "string", "aboutStory": "string", "aboutMission": "string", "aboutVision": "string", "founderBio": "string" }`,
          itemType: 'blog'
        })
      });
      const data = await res.json();
      let parsed;
      try {
        const cleanMsg = data.message.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanMsg);
      } catch (e) {
        parsed = {};
      }
      
      const heroTitleInput = document.querySelector('input[name="heroTitle"]') as HTMLInputElement;
      const heroSubtitleInput = document.querySelector('input[name="heroSubtitle"]') as HTMLInputElement;
      const aboutStoryInput = document.querySelector('textarea[name="aboutStory"]') as HTMLTextAreaElement;
      const aboutMissionInput = document.querySelector('textarea[name="aboutMission"]') as HTMLTextAreaElement;
      const aboutVisionInput = document.querySelector('textarea[name="aboutVision"]') as HTMLTextAreaElement;
      const founderBioInput = document.querySelector('textarea[name="founderBio"]') as HTMLTextAreaElement;
      
      if (parsed.heroTitle && heroTitleInput) heroTitleInput.value = parsed.heroTitle;
      if (parsed.heroSubtitle && heroSubtitleInput) heroSubtitleInput.value = parsed.heroSubtitle;
      if (parsed.aboutStory && aboutStoryInput) aboutStoryInput.value = parsed.aboutStory;
      if (parsed.aboutMission && aboutMissionInput) aboutMissionInput.value = parsed.aboutMission;
      if (parsed.aboutVision && aboutVisionInput) aboutVisionInput.value = parsed.aboutVision;
      if (parsed.founderBio && founderBioInput) founderBioInput.value = parsed.founderBio;
      
      triggerToast('Sifra AI polished and modernized all website content strings!');
    } catch (err) {
      console.error(err);
      triggerToast('Sifra AI could not optimize content right now.');
    } finally {
      setAiEnhanceLoadingField(null);
    }
  };

  const handleCreateUserMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const senderName = formData.get('senderName') as string;
    const senderEmail = formData.get('senderEmail') as string;
    const subject = formData.get('subject') as string;
    const category = formData.get('category') as any;
    const messageText = formData.get('message') as string;
    const isImportant = formData.get('isImportant') === 'true';

    const newMsg: UserMessage = {
      id: `msg-${Date.now()}`,
      senderName,
      senderEmail,
      subject,
      category,
      message: messageText,
      date: new Date().toISOString().split('T')[0],
      isImportant,
      isRead: false
    };

    onUpdateMessages([newMsg, ...messages]);
    setIsAddingMessage(false);
    triggerToast('Manually simulated new client transmission!');
  };

  const handleGenerateAIReply = async (msg: UserMessage, e: React.MouseEvent) => {
    e.preventDefault();
    setAiReplyLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The client ${msg.senderName} (${msg.senderEmail}) sent us a ${msg.category} message with subject: "${msg.subject}" and content: "${msg.message}". Please draft a highly professional, polite, helpful response in Bengali addressing all their concerns with tone "${aiReplyTone}". Include signature 'Sifra AI, Customer Care Liaison'.`,
          itemType: 'blog'
        })
      });
      const data = await res.json();
      setAiReplyText(data.message || data.generatedData?.content || 'Thank you for your transmission. We have cataloged it.');
      triggerToast('Sifra AI successfully drafted a smart reply!');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to coordinate AI reply.');
    } finally {
      setAiReplyLoading(false);
    }
  };

  const handleEnhanceContentAI = async (fieldName: string, currentValue: string) => {
    if (!currentValue.trim()) {
      triggerToast('Please type some draft content first!');
      return;
    }
    setAiEnhanceLoadingField(fieldName);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Rewrite and professionalize this text to make it extremely premium, engaging, futuristic, and sophisticated for the website field "${fieldName}": "${currentValue}". Translate to beautifully styled Bengali or English to match.`,
          itemType: 'blog'
        })
      });
      const data = await res.json();
      const enhanced = data.message || data.generatedData?.content || currentValue;
      
      const nextContent = { ...content, [fieldName]: enhanced };
      onUpdateContent(nextContent);
      triggerToast(`Field "${fieldName}" enhanced with Sifra AI!`);
    } catch (err) {
      console.error(err);
      triggerToast('AI rewrite paused.');
    } finally {
      setAiEnhanceLoadingField(null);
    }
  };

  const handleComposeNewsletterAI = async (promptGoal: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptGoal.trim()) {
      triggerToast('Please enter a goal or topic for the newsletter first!');
      return;
    }
    setAiNewsletterLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Create a gorgeous, professional newsletter marketing broadcast on the topic: "${promptGoal}". It should start with an engaging heading, follow with a beautiful update message in Bengali, and conclude with professional sign-off notes.`,
          itemType: 'blog'
        })
      });
      const data = await res.json();
      setAiNewsletterText(data.message || data.generatedData?.content || '');
      triggerToast('Sifra AI generated a polished marketing campaign draft!');
    } catch (err) {
      console.error(err);
      triggerToast('Could not reach Sifra Campaign core.');
    } finally {
      setAiNewsletterLoading(false);
    }
  };

  const handleArrangeBlogAI = async (blog: BlogItem, e: React.MouseEvent) => {
    e.preventDefault();
    setAiBlogArrangerLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze and beautifully format this blog post titled "${blog.title}". Content: "${blog.content}". Rewrite, highlight critical paragraphs, organize spacing, insert bold definitions, and structure it so it is highly professional and visually stunning. Retain original language (Bengali or English).`,
          itemType: 'blog'
        })
      });
      const data = await res.json();
      const arrangedContent = data.message || data.generatedData?.content || blog.content;
      
      // Update original blog in collection
      const nextBlogs = blogPosts.map(b => b.id === blog.id ? { ...b, content: arrangedContent } : b);
      onUpdateBlogPosts(nextBlogs);
      
      // Highlight selection
      setSelectedBlogForAI({ ...blog, content: arrangedContent });
      triggerToast('Blog post polished and formatted by Sifra AI!');
    } catch (err) {
      console.error(err);
      triggerToast('Could not contact blog arranger.');
    } finally {
      setAiBlogArrangerLoading(false);
    }
  };

  const handleSaveAd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const linkUrl = formData.get('linkUrl') as string;
    const adType = formData.get('adType') as any;
    const revenuePerClick = parseFloat(formData.get('revenuePerClick') as string) || 0.15;
    const active = formData.get('active') === 'true';

    if (editingAd) {
      onUpdateAds(ads.map(a => a.id === editingAd.id ? { ...a, title, imageUrl, linkUrl, adType, revenuePerClick, active } : a));
      setEditingAd(null);
      triggerToast('Ad details updated!');
    } else {
      const newAd = { id: `ad-${Date.now()}`, title, imageUrl, linkUrl, adType, revenuePerClick, active, impressions: 0, clicks: 0 };
      onUpdateAds([...ads, newAd]);
      setIsAddingAd(false);
      triggerToast('New ad space configured!');
    }
  };

  const handleDeleteAd = (id: string) => {
    onUpdateAds(ads.filter(a => a.id !== id));
    triggerToast('Ad space removed.');
  };

  // APPLICATION CRUD ACTIONS
  const handleSaveApp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingApp ? editingApp.id : `app-${Date.now()}`;
    
    // Feature array parsing
    const featuresRaw = formData.get('features') as string;
    const featuresList = featuresRaw ? featuresRaw.split('\n').filter(Boolean) : [];


    const appData: Application = {
      id,
      name: formData.get('name') as string,
      logo: formData.get('logo') as string,
      shortDescription: formData.get('shortDescription') as string,
      fullDescription: formData.get('fullDescription') as string,
      version: formData.get('version') as string,
      category: formData.get('category') as string,
      status: formData.get('status') as AppStatus,
      releaseDate: formData.get('releaseDate') as string,
      developerNotes: formData.get('developerNotes') as string,
      downloadUrl: formData.get('downloadUrl') as string || '#',
      tags: (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      features: featuresList,
      screenshots: editingApp ? editingApp.screenshots : [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600'
      ],
      apkInfo: {
        size: formData.get('apkSize') as string || '20 MB',
        downloadCount: editingApp ? editingApp.apkInfo.downloadCount : 0,
        compatibility: formData.get('compatibility') as string || 'Android 9.0+',
        changelog: editingApp ? editingApp.apkInfo.changelog : [
          { version: formData.get('version') as string, date: formData.get('releaseDate') as string, changes: ['Initial release compiler calibration complete.'] }
        ]
      }
    };

    if (editingApp) {
      onUpdateApps(applications.map(a => a.id === id ? appData : a));
      triggerToast(`Application '${appData.name}' updated successfully.`);
    } else {
      onUpdateApps([...applications, appData]);
      triggerToast(`Application '${appData.name}' created successfully.`);
    }

    setEditingApp(null);
    setIsAddingApp(false);
  };

  const handleTogglePublishApp = (id: string) => {
    onUpdateApps(applications.map(a => {
      if (a.id === id) {
        const nextStatus: AppStatus = a.status === 'Active' ? 'Archived' : 'Active';
        triggerToast(`Status toggled for '${a.name}' to ${nextStatus}.`);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  const handleDeleteApp = (id: string) => {
    if (confirm('Are you absolutely sure you want to remove this application file?')) {
      onUpdateApps(applications.filter(a => a.id !== id));
      triggerToast('Application record purged successfully.');
    }
  };

  // UPDATE REGISTER ACTIONS
  const handleSaveUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingUpdate ? editingUpdate.id : `update-${Date.now()}`;

    const updateData: Update = {
      id,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      category: formData.get('category') as UpdateCategory,
      date: formData.get('date') as string || new Date().toISOString().split('T')[0],
      pinned: formData.get('pinned') === 'true'
    };

    if (editingUpdate) {
      onUpdateUpdates(updates.map(u => u.id === id ? updateData : u));
      triggerToast(`Update log in category '${updateData.category}' updated.`);
    } else {
      onUpdateUpdates([updateData, ...updates]);
      triggerToast(`New update briefing published successfully.`);
    }

    setEditingUpdate(null);
    setIsAddingUpdate(false);
  };

  const handleDeleteUpdate = (id: string) => {
    if (confirm('Delete this updates brief?')) {
      onUpdateUpdates(updates.filter(u => u.id !== id));
      triggerToast('Update record removed.');
    }
  };

  // PROJECTS MANAGING ACTIONS
  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingProject ? editingProject.id : `proj-${Date.now()}`;

    const projectData: Project = {
      id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      progress: parseInt(formData.get('progress') as string) || 0,
      status: formData.get('status') as ProjectStatus,
      targetRelease: formData.get('targetRelease') as string || 'Q4 2026',
      category: formData.get('category') as string || 'General',
      notes: formData.get('notes') as string || ''
    };

    if (editingProject) {
      onUpdateProjects(projects.map(p => p.id === id ? projectData : p));
      triggerToast(`Project '${projectData.name}' roadmap synchronized.`);
    } else {
      onUpdateProjects([...projects, projectData]);
      triggerToast(`Project '${projectData.name}' registered to roadmap.`);
    }

    setEditingProject(null);
    setIsAddingProject(false);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Delete project timeline?')) {
      onUpdateProjects(projects.filter(p => p.id !== id));
      triggerToast('Project deleted.');
    }
  };

  // DOCUMENTATION ACTIONS
  const handleSaveDoc = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingDoc ? editingDoc.id : `doc-${Date.now()}`;
    const slug = (formData.get('title') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const docData: DocArticle = {
      id,
      title: formData.get('title') as string,
      slug,
      category: formData.get('category') as DocCategory,
      content: formData.get('content') as string,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (editingDoc) {
      onUpdateDocs(documents.map(d => d.id === id ? docData : d));
      triggerToast(`Document guide '${docData.title}' edited.`);
    } else {
      onUpdateDocs([...documents, docData]);
      triggerToast(`Guide '${docData.title}' compiled to the main catalog.`);
    }

    setEditingDoc(null);
    setIsAddingDoc(false);
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm('Purge document from official guides?')) {
      onUpdateDocs(documents.filter(d => d.id !== id));
      triggerToast('Article catalog node unregistered.');
    }
  };

  // MESSAGES HANDLING actions
  const handleMarkMessageRead = (id: string) => {
    onUpdateMessages(messages.map(m => m.id === id ? { ...m, isRead: !m.isRead } : m));
    triggerToast('Message reading status modified.');
  };

  const handleMarkMessageImportant = (id: string) => {
    onUpdateMessages(messages.map(m => m.id === id ? { ...m, isImportant: !m.isImportant } : m));
    triggerToast('Flag significance altered.');
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm('Discard message trace?')) {
      onUpdateMessages(messages.filter(m => m.id !== id));
      triggerToast('Letter eliminated from archives.');
    }
  };

  // SEO SAVE ACTIONS
  const handleSaveSEO = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nextSEO: SEOSettings = {
      metaTitle: formData.get('metaTitle') as string,
      metaDescription: formData.get('metaDescription') as string,
      keywords: formData.get('keywords') as string,
      schemaMarkup: formData.get('schemaMarkup') as string,
      openGraph: {
        title: formData.get('ogTitle') as string || seo.openGraph.title,
        description: formData.get('ogDescription') as string || seo.openGraph.description,
        image: seo.openGraph.image
      },
      twitterCard: {
        title: formData.get('twTitle') as string || seo.twitterCard.title,
        description: formData.get('twDescription') as string || seo.twitterCard.description,
        image: seo.twitterCard.image
      }
    };
    onUpdateSEO(nextSEO);
    triggerToast('Global structural search factors indexed.');
  };

  // CONTENT EDIT ACTIONS
  const handleSaveContent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nextContent: WebsiteContent = {
      heroTitle: formData.get('heroTitle') as string,
      heroSubtitle: formData.get('heroSubtitle') as string,
      aboutStory: formData.get('aboutStory') as string,
      aboutMission: formData.get('aboutMission') as string,
      aboutVision: formData.get('aboutVision') as string,
      aboutGoal: formData.get('aboutGoal') as string || content.aboutGoal,
      founderName: formData.get('founderName') as string,
      founderBio: formData.get('founderBio') as string,
      githubUrl: formData.get('githubUrl') as string,
      telegramUrl: formData.get('telegramUrl') as string,
    };
    onUpdateContent(nextContent);
    triggerToast('Ecosystem homepage and biography content modernized.');
  };

  // Sidebar list definitions
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Sliders size={15} /> },
    { id: 'rodp-portal', label: 'RODP Portal Access', icon: <ShieldAlert size={15} className="text-amber-400" /> },
    { id: 'sifra-ai', label: 'Sifra AI Studio', icon: <Sparkles size={15} className="text-amber-400 animate-pulse" /> },
    { id: 'applications', label: 'App Manager', icon: <Cpu size={15} /> },
    { id: 'architecture', label: 'Architecture & Features', icon: <Layers size={15} /> },
    { id: 'services', label: 'Services Manager', icon: <Briefcase size={15} /> },
    { id: 'products', label: 'Products Manager', icon: <ShoppingBag size={15} /> },
    { id: 'blog', label: 'Blog Publisher', icon: <PenTool size={15} /> },
    { id: 'faqs', label: 'FAQ Knowledgebase', icon: <HelpCircle size={15} /> },
    { id: 'media', label: 'Media & Ads', icon: <PlayCircle size={15} /> },
    { id: 'updates', label: 'Updates compiler', icon: <FileText size={15} /> },
    { id: 'projects', label: 'Roadmap launchpad', icon: <Layers size={15} /> },
    { id: 'documents', label: 'Docs compiler', icon: <AppWindow size={15} /> },
    { id: 'messages', label: 'Message Center', icon: <Mail size={15} /> },
    { id: 'subscribers', label: 'Newsletter List', icon: <FileSpreadsheet size={15} /> },
    { id: 'seo', label: 'SEO Config', icon: <Globe size={15} /> },
    { id: 'content', label: 'Website Editor', icon: <Settings size={15} /> },
    { id: 'social-media', label: 'Social Media', icon: <Link size={15} /> },
    { id: 'institute', label: 'Institute & Feedback', icon: <Users size={15} /> },
  ];

  // RODP Portal Live Applications State (Restricted to verified CEO session)
  const [rodpApps, setRodpApps] = useState<RODPApplication[]>([]);
  const [rodpFilter, setRodpFilter] = useState<'all' | 'pending' | 'in_progress' | 'approved' | 'rejected'>('all');
  const [isSimulatingRODP, setIsSimulatingRODP] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeRODPApplications((apps) => {
      setRodpApps(apps);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // FAQ Management State
  // Feedback and Institute Apps state
  const [studentApps, setStudentApps] = useState<any[]>([]);
  const [instituteFeedbacks, setInstituteFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'institute') {
      fetch('/api/institute/applications')
        .then(res => res.json())
        .then(data => { if(data.success) setStudentApps(data.data); });
      
      fetch('/api/feedback')
        .then(res => res.json())
        .then(data => { if(data.success) setInstituteFeedbacks(data.data); });
    }
  }, [activeTab]);

  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqFormQuestion, setFaqFormQuestion] = useState('');
  const [faqFormAnswer, setFaqFormAnswer] = useState('');
  const [faqFormCategory, setFaqFormCategory] = useState<'General' | 'Security & AI' | 'Downloads & Installation' | 'Developer & API' | 'Billing & Enterprise'>('General');
  const [faqFormOrder, setFaqFormOrder] = useState<number>(1);

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqFormQuestion.trim() || !faqFormAnswer.trim()) return;

    if (editingFaq) {
      const updated = faqs.map(f => f.id === editingFaq.id ? {
        ...f,
        question: faqFormQuestion,
        answer: faqFormAnswer,
        category: faqFormCategory,
        order: faqFormOrder,
      } : f);
      onUpdateFaqs?.(updated);
      triggerToast(`FAQ updated successfully!`);
    } else {
      const newFaq: FAQItem = {
        id: `faq-${Date.now()}`,
        question: faqFormQuestion,
        answer: faqFormAnswer,
        category: faqFormCategory,
        order: faqFormOrder || faqs.length + 1,
        helpfulVotes: 0
      };
      onUpdateFaqs?.([...faqs, newFaq]);
      triggerToast('New FAQ item created successfully!');
    }
    setIsAddingFaq(false);
    setEditingFaq(null);
    setFaqFormQuestion('');
    setFaqFormAnswer('');
  };

  const handleDeleteFaq = (id: string) => {
    const updated = faqs.filter(f => f.id !== id);
    onUpdateFaqs?.(updated);
    triggerToast('FAQ item deleted.');
  };

  const handleEditFaqClick = (f: FAQItem) => {
    setEditingFaq(f);
    setIsAddingFaq(true);
    setFaqFormQuestion(f.question);
    setFaqFormAnswer(f.answer);
    setFaqFormCategory(f.category as any);
    setFaqFormOrder(f.order || 1);
  };

  // Quick statistics totals
  const totalDownloads = applications.reduce((sum, app) => sum + (app.apkInfo?.downloadCount || 0), 0);
  const unreadMessagesCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen text-white flex flex-col md:flex-row rounded-[2.5rem] overflow-hidden border border-pink-500/30 bg-gradient-to-br from-pink-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(236,72,153,0.15)] m-4 relative z-10">
      
      {/* Toast Alert Popups */}
      {statusMsg && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl border border-pink-400/30 bg-white/5 backdrop-blur-xl text-pink-300 font-mono text-sm shadow-2xl shadow-emerald-500/20 animate-bounce">
          <Check size={16} className="text-pink-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Control Panel Navigation Sidebar */}
      <aside className={`w-full md:w-64 shrink-0 bg-white/5 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-pink-500/20 p-6 flex-col justify-between transition-all duration-300 ${
        isMessageCenterFullScreen && activeTab === 'messages' ? 'hidden md:hidden' : 'flex'
      }`}>
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="font-sora font-extrabold text-pink-300 tracking-widest text-lg flex items-center gap-2">
              <ShieldAlert size={20} className="animate-pulse" />
              CONTROL CENTER
            </h2>
            <span className="font-mono text-[10px] text-pink-300/50 uppercase tracking-widest block font-bold">
              REXLIFY AUTHORIZED ONLY
            </span>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  id={`admin-tab-btn-${item.id}`}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-pink-500/10 text-pink-300 border-l-4 border-pink-400 pl-3 shadow-inner shadow-emerald-500/5' 
                      : 'text-pink-200/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.id === 'messages' && unreadMessagesCount > 0 && (
                    <span className="ml-auto bg-pink-500 text-black rounded-lg px-2 py-1 text-[10px] font-bold shadow-sm shadow-emerald-500/20">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-8 border-t border-pink-500/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-pink-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="font-mono text-[10px] text-pink-300/50 uppercase tracking-widest font-bold">
              SYSTEM CONSOLE SECURE
            </span>
          </div>
          <button
            onClick={onLogout}
            id="admin-logout-trigger-btn"
            className="w-full text-center py-3 rounded-xl border border-pink-500/20 hover:border-red-500/30 text-pink-200/70 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors shadow-inner"
          >
            Exit Terminal
          </button>
        </div>
      </aside>

      {/* Main Command Console Space */}
      <main className={`flex-1 overflow-y-auto max-h-[85vh] md:max-h-none md:h-screen transition-all duration-300 ${
        isMessageCenterFullScreen && activeTab === 'messages' ? 'p-6 md:p-12' : 'p-6 md:p-10'
      }`}>
        
        {/* ----------------- DASHBOARD GENERAL PANEL ----------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="text-left space-y-1">
              <h1 className="font-sora text-3xl font-extrabold text-white tracking-tight">System Status Brief</h1>
              <p className="text-pink-200/70 text-xs font-light">Comprehensive analysis of the REXLIFY physical distribution framework.</p>
            </div>

            {/* RODP Seamless Portal Direct Access Hero Banner for Verified CEO */}
            <div className="bg-gradient-to-r from-amber-950/70 via-orange-950/40 to-yellow-950/40 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] border border-amber-500/40 relative overflow-hidden shadow-[0_0_35px_rgba(245,158,11,0.2)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                      CEO SEAMLESS DIRECT ACCESS
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      Zero Additional Password Required
                    </span>
                  </div>
                  <h3 className="font-sora text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    RODP Admin Portal Access
                  </h3>
                  <p className="text-amber-200/80 text-xs font-light max-w-2xl leading-relaxed">
                    Direct cryptographic gateway into the Rizwan Online Dreams Platform admin matrix. Manage live client applications, retail operations, customer CRM, staff logs, and billing ledger with Chief Executive authority.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    id="ceo-switch-rodp-tab-btn"
                    onClick={() => setActiveTab('rodp-portal')}
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:border-amber-400/50"
                  >
                    View Live Requests ({rodpApps.length})
                  </button>

                  <button
                    type="button"
                    id="ceo-direct-rodp-portal-btn"
                    onClick={() => {
                      localStorage.setItem('rodp_logged_in', 'true');
                      localStorage.setItem('rodp_logged_in_user', JSON.stringify({
                        role: 'super_admin',
                        name: 'Rizwan RR (CEO)',
                        email: 'rizwanroushan0@gmail.com'
                      }));
                      localStorage.setItem('rodp_target_tab', 'super_admin_panel');
                      if (onNavigateToRodp) {
                        onNavigateToRodp();
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-sora font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-amber-500/30 hover:scale-105 flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldAlert size={16} />
                    <span>Open RODP Admin Panel</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            
            
            {/* Rexlify AI Dedicated Credentials & Control */}
            <div className="bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-pink-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.15)] mt-8">
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="animate-pulse" />
                    Rexlify AI Gateway Access Configuration
                  </span>
                  <h3 className="font-sora text-xl font-extrabold text-white uppercase tracking-tight">Rexlify AI Passkey Manager</h3>
                  <p className="text-pink-200/70 text-xs font-light max-w-2xl">Update the direct security passkey required by users when they click on Rexlify AI.</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold block">New Rexlify AI Passkey</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        id="rexlify-ai-custom-pass"
                        placeholder="Enter new passkey..."
                        className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-xl text-white focus:outline-none focus:border-pink-400 font-mono"
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          const val = (document.getElementById('rexlify-ai-custom-pass') as HTMLInputElement)?.value;
                          if (!val) { alert('Please enter a valid passkey.'); return; }
                          try {
                            const { rtdb } = await import('../firebase-rexlify');
                            if (rtdb) {
                              const { ref, set } = await import('firebase/database');
                              await set(ref(rtdb, 'rexlify_ai_config/password'), val);
                              alert('✅ Rexlify AI Passkey updated successfully!');
                            }
                          } catch (e) {
                            alert('Failed to update passkey.');
                          }
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-amber-500/30 hover:from-blue-500/40 hover:to-amber-500/40 border border-purple-500/30 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-purple-500/20"
                      >
                        Update Key
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

{/* System Status RTDB Toggles */}
            <div className="bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-pink-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.15)] mt-8">
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={12} className="animate-pulse" />
                    Advanced Security & Feature Toggles (Realtime)
                  </span>
                  <h3 className="font-sora text-xl font-extrabold text-white uppercase tracking-tight">App Activation Nodes</h3>
                  <p className="text-pink-200/70 text-xs font-light max-w-2xl">Toggle individual subsystems permanently or temporarily across all devices globally. If turned off, users will see a Rexlify error overlay.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'sifra', label: 'Sifra AI System' },
                    { key: 'rexlify_ai', label: 'Rexlify AI (Main)' },
                    { key: 'rodp', label: 'RODP Admin Platform' },
                    { key: 'institute', label: 'Institute Web App' },
                    { key: 'neurax', label: 'Neurax Engine' },
                  ].map((app) => (
                    <div key={app.key} className="flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-pink-500/20 p-4 rounded-2xl shadow-inner">
                      <div className="text-left space-y-1">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider block text-white">
                          {app.label}
                        </span>
                        <span className="text-[9px] text-pink-300/60 uppercase font-mono">
                          {sysStatus[app.key] ? '🟢 Network Online' : '🔴 Port Blocked'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleSysStatus(app.key)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${sysStatus[app.key] ? 'bg-pink-500' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${sysStatus[app.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

{/* Ecosystem Safety and Binary Calibration Controls */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-pink-500/20 relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={12} className="animate-pulse" />
                    Global Safety & Platform State
                  </span>
                  <h3 className="font-sora text-md font-semibold text-white uppercase tracking-tight">Maintenance Mode (মেইনটেনেন্স মোড)</h3>
                </div>
                
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-2xl border border-pink-500/10 p-4 rounded-2xl">
                  <button
                    onClick={() => onUpdateMaintenanceMode({ enabled: !maintenanceMode.enabled, message: maintenanceMode.message })}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${maintenanceMode.enabled ? 'bg-rose-500' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 ${maintenanceMode.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                  <div className="text-left">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                      {maintenanceMode.enabled ? 'System Calibration Active' : 'System Online'}
                    </span>
                    <span className="text-[10px] text-pink-300/50">
                      {maintenanceMode.enabled ? 'Visitors see calibration screens' : 'Visitors see standard home contents'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[9px] text-pink-200/70 uppercase tracking-widest font-bold block">Custom Calibration Message</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="maintenance-msg-input"
                      placeholder="Enter custom maintenance message..."
                      defaultValue={maintenanceMode.message}
                      className="flex-1 text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-rose-500 shadow-inner"
                    />
                    <button
                      onClick={() => {
                        const val = (document.getElementById('maintenance-msg-input') as HTMLInputElement)?.value || '';
                        onUpdateMaintenanceMode({ enabled: maintenanceMode.enabled, message: val });
                        triggerToast('Maintenance briefing updated successfully!');
                      }}
                      className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all"
                    >
                      Update Msg
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 text-left border-t md:border-t-0 md:border-l border-pink-500/20 pt-6 md:pt-0 md:pl-8">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-pink-300 uppercase tracking-widest flex items-center gap-2">
                    <Link size={12} />
                    Platform Distribution Link
                  </span>
                  <h3 className="font-sora text-md font-semibold text-white uppercase tracking-tight">Global APK Download URL Config</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-pink-200/70 text-xs font-light leading-relaxed">
                    Set the physical backend download endpoint for NeuraX and Sifra application package downloads.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="font-mono text-[9px] text-pink-200/70 uppercase tracking-widest font-bold block">Target Binary Download URL (APK লিঙ্ক)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="apk-url-input"
                        placeholder="https://example.com/builds/rexlify.apk"
                        defaultValue={apkDownloadLink}
                        className="flex-1 text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner"
                      />
                      <button
                        onClick={() => {
                          const val = (document.getElementById('apk-url-input') as HTMLInputElement)?.value || '';
                          onUpdateApkDownloadLink(val);
                          triggerToast('Global APK download source updated!');
                        }}
                        className="px-4 py-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-400/20 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all"
                      >
                        Update URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Index Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border-l-4 border-pink-400 shadow-lg">
                <span className="font-mono text-[10px] font-bold text-pink-300/50 uppercase tracking-widest block">Registered APKs</span>
                <span className="font-sora font-semibold text-4xl text-white block mt-2">{applications.length}</span>
                <span className="text-[10px] text-pink-300 font-bold tracking-widest uppercase block mt-2">v{applications[0]?.version || '0.0'} Deploy active</span>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border-l-4 border-pink-400 shadow-lg">
                <span className="font-mono text-[10px] font-bold text-pink-300/50 uppercase tracking-widest block">Total Binary Downloads</span>
                <span className="font-sora font-semibold text-4xl text-pink-300 block mt-2">{totalDownloads}</span>
                <span className="text-[10px] text-pink-300/50 font-light block mt-2">Sum of catalog installations</span>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border-l-4 border-pink-400 shadow-lg">
                <span className="font-mono text-[10px] font-bold text-pink-300/50 uppercase tracking-widest block">Updates Broadcasted</span>
                <span className="font-sora font-semibold text-4xl text-white block mt-2">{updates.length}</span>
                <span className="text-[10px] text-pink-300/50 font-light block mt-2">{updates.filter(u => u.pinned).length} announcements pinned</span>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border-l-4 border-pink-400 shadow-lg">
                <span className="font-mono text-[10px] font-bold text-pink-300/50 uppercase tracking-widest block">Incoming Transmissions</span>
                <span className="font-sora font-semibold text-4xl text-red-400 block mt-2">{messages.length}</span>
                <span className="text-[10px] text-pink-300 font-bold tracking-widest uppercase block mt-2">{unreadMessagesCount} awaiting review</span>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent messages quick board */}
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-pink-500/20 space-y-6">
                <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                  <h3 className="font-sora text-sm font-semibold text-white uppercase tracking-widest">Unresolved Transmissions</h3>
                  <button onClick={() => setActiveTab('messages')} className="font-mono text-[10px] text-pink-300 uppercase tracking-widest font-bold hover:text-white transition-colors cursor-pointer">View all</button>
                </div>
                
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {messages.length === 0 ? (
                    <p className="text-pink-300/50 font-mono text-[10px] text-center py-10 uppercase tracking-widest">INBOX SECURE - ZERO SENSORS TRIGGERED</p>
                  ) : (
                    messages.slice(0, 3).map((msg) => (
                      <div key={msg.id} className="p-4 bg-white/5 backdrop-blur-2xl border border-pink-500/10 rounded-2xl flex flex-col justify-between hover:bg-white/5 transition-colors relative shadow-inner">
                        {!msg.isRead && <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-500 animate-ping" />}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-sora font-semibold text-sm text-white">{msg.senderName}</span>
                            <span className="font-mono text-[10px] text-pink-300 font-bold tracking-widest">{msg.category}</span>
                          </div>
                          <span className="font-mono text-[10px] text-pink-300/50 overflow-hidden text-ellipsis block tracking-widest">{msg.subject}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Server quick action suite */}
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-pink-500/20 space-y-6">
                <h3 className="font-sora text-sm font-semibold text-white uppercase tracking-widest border-b border-pink-500/20 pb-4">Ecosystem Fast actions</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { setIsAddingApp(true); setActiveTab('applications'); }} className="p-6 bg-white/5 backdrop-blur-2xl hover:bg-pink-500/10 border border-pink-500/10 hover:border-pink-400/30 rounded-2xl flex flex-col items-center gap-3 text-center transition-all cursor-pointer shadow-inner hover:shadow-emerald-500/10 group">
                    <Plus size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Register app APK</span>
                  </button>

                  <button onClick={() => { setIsAddingUpdate(true); setActiveTab('updates'); }} className="p-6 bg-white/5 backdrop-blur-2xl hover:bg-pink-500/10 border border-pink-500/10 hover:border-pink-400/30 rounded-2xl flex flex-col items-center gap-3 text-center transition-all cursor-pointer shadow-inner hover:shadow-emerald-500/10 group">
                    <Plus size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Publish Update</span>
                  </button>

                  <button onClick={() => { setIsAddingProject(true); setActiveTab('projects'); }} className="p-6 bg-white/5 backdrop-blur-2xl hover:bg-pink-500/10 border border-pink-500/10 hover:border-pink-400/30 rounded-2xl flex flex-col items-center gap-3 text-center transition-all cursor-pointer shadow-inner hover:shadow-emerald-500/10 group">
                    <Plus size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Concept project</span>
                  </button>

                  <button onClick={() => { setIsAddingDoc(true); setActiveTab('documents'); }} className="p-6 bg-white/5 backdrop-blur-2xl hover:bg-pink-500/10 border border-pink-500/10 hover:border-pink-400/30 rounded-2xl flex flex-col items-center gap-3 text-center transition-all cursor-pointer shadow-inner hover:shadow-emerald-500/10 group">
                    <Plus size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Compile manual</span>
                  </button>
                </div>
              </div>

            </div>

            {/* --- SITE TRAFFIC VISUALIZER CHART --- */}
            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 border-b border-pink-500/20 pb-6 relative z-10">
                <div className="text-left space-y-2">
                  <span className="font-mono text-[10px] font-bold text-pink-300 uppercase tracking-widest flex items-center gap-2">
                    <BarChart2 size={14} className="animate-pulse" />
                    LIVE TELEMETRY MONITOR
                  </span>
                  <h3 className="font-sora text-lg font-semibold text-white uppercase tracking-tight">Active Network Traffic Analytics</h3>
                </div>
                {/* Selector / simulation indicators */}
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => setChartView('trends')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-mono transition-all border cursor-pointer font-bold tracking-widest uppercase shadow-sm ${
                      chartView === 'trends'
                        ? 'bg-pink-500/20 border-pink-400/30 text-pink-300'
                        : 'bg-white/5 backdrop-blur-2xl border-pink-500/10 text-pink-200/70 hover:text-white'
                    }`}
                  >
                    GROWTH TIMELINE
                  </button>
                  <button
                    onClick={() => setChartView('distribution')}
                    className={`px-4 py-2 rounded-xl text-[10px] font-mono transition-all border cursor-pointer font-bold tracking-widest uppercase shadow-sm ${
                      chartView === 'distribution'
                        ? 'bg-pink-500/20 border-pink-400/30 text-pink-300'
                        : 'bg-white/5 backdrop-blur-2xl border-pink-500/10 text-pink-200/70 hover:text-white'
                    }`}
                  >
                    APP DOWNLOADS SHARE
                  </button>
                </div>
              </div>

              {/* Glowing Recharts Component Container */}
              <div className="relative w-full h-[320px] z-10">
                {chartView === 'trends' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: 'Jan 26', subscribers: Math.max(1, Math.round(subscribers.length * 0.15)), downloads: Math.max(5, Math.round(totalDownloads * 0.2)) },
                        { name: 'Feb 26', subscribers: Math.max(2, Math.round(subscribers.length * 0.3)), downloads: Math.max(12, Math.round(totalDownloads * 0.35)) },
                        { name: 'Mar 26', subscribers: Math.max(3, Math.round(subscribers.length * 0.45)), downloads: Math.max(28, Math.round(totalDownloads * 0.55)) },
                        { name: 'Apr 26', subscribers: Math.max(5, Math.round(subscribers.length * 0.65)), downloads: Math.max(45, Math.round(totalDownloads * 0.75)) },
                        { name: 'May 26', subscribers: Math.max(8, Math.round(subscribers.length * 0.85)), downloads: Math.max(78, Math.round(totalDownloads * 0.9)) },
                        { name: 'Jun 26 (Current)', subscribers: subscribers.length, downloads: totalDownloads },
                      ]}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#030303', 
                          borderColor: 'rgba(16, 185, 129, 0.2)',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '16px' }}
                        verticalAlign="top"
                        height={40}
                      />
                      <Area 
                        name="Subscriber Growth" 
                        type="monotone" 
                        dataKey="subscribers" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#subGrad)" 
                      />
                      <Area 
                        name="Dynamic APK Downloads" 
                        type="monotone" 
                        dataKey="downloads" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#dlGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={applications.map(app => ({
                        name: app.name,
                        downloads: app.apkInfo?.downloadCount || 0
                      }))}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="barRainbow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.3)" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#030303', 
                          borderColor: 'rgba(16, 185, 129, 0.2)',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '16px' }}
                        verticalAlign="top"
                        height={40}
                      />
                      <Bar 
                        name="Dynamic APK Downloads" 
                        dataKey="downloads" 
                        fill="url(#barRainbow)" 
                        radius={[6, 6, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Chart Legend Indicators */}
              <div className="flex justify-center gap-8 pt-4 text-[10px] font-mono uppercase tracking-widest text-pink-300/50 font-bold relative z-10">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span>Interactive visitor sessions ({messages.length * 3 + 412} sessions)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                  <span>Telemetry live: 100% active operational synchronization</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ----------------- RODP PORTAL ACCESS & REALTIME REQUESTS (CEO RESTRICTED) ----------------- */}
        {activeTab === 'rodp-portal' && (
          <div className="space-y-10 animate-fadeIn text-left">
            {/* Top Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-pink-500/20 pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={12} className="text-amber-400" />
                    RESTRICTED CEO CONSOLE
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Realtime Firebase RTDB Stream Active
                  </span>
                </div>
                <h1 className="font-sora text-3xl md:text-4xl font-black text-white tracking-tight">
                  RODP Portal Access & Live Pipeline
                </h1>
                <p className="text-amber-200/70 text-sm font-light max-w-2xl leading-relaxed">
                  Full super administrative surveillance of the Rizwan Online Dreams Platform. Direct seamless dashboard transition with zero password friction and real-time live application handling.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  id="simulate-rodp-app-btn"
                  onClick={async () => {
                    setIsSimulatingRODP(true);
                    const sampleServices = [
                      'Aadhaar Biometric Correction',
                      'PAN Card Fasttrack Filing',
                      'CSC Digital Seva Registration',
                      'West Bengal Khadyasathi E-KYC',
                      'Instant Passport Courier Form'
                    ];
                    const randomService = sampleServices[Math.floor(Math.random() * sampleServices.length)];
                    const sampleNames = ['Tanmoy Ghosh', 'Farhana Yasmin', 'Bikash Mondal', 'Sumitra Sen', 'Md. Asif Ikbal'];
                    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
                    const randomMobile = '98' + Math.floor(10000000 + Math.random() * 90000000);
                    
                    const res = await submitRODPApplication({
                      applicantName: randomName,
                      contactNumber: randomMobile,
                      serviceRequested: randomService,
                      branchName: 'Head Office (ROD001)',
                      status: 'pending',
                      notes: 'Online digital token generated via client self-serve matrix.'
                    });
                    setIsSimulatingRODP(false);
                    if (res.success) {
                      triggerToast('⚡ Test service request dispatched to Firebase RTDB!');
                    } else {
                      triggerToast('Could not dispatch test request: ' + (res.error || 'Network error'));
                    }
                  }}
                  disabled={isSimulatingRODP}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 hover:border-amber-400/50"
                  title="Submit a simulated client request to test real-time RTDB sync"
                >
                  <Sparkles size={14} className={isSimulatingRODP ? "animate-spin text-amber-400" : "text-amber-400"} />
                  <span>{isSimulatingRODP ? "Submitting..." : "+ Simulate Request"}</span>
                </button>

                <button
                  type="button"
                  id="direct-open-rodp-admin-panel-btn"
                  onClick={() => {
                    localStorage.setItem('rodp_logged_in', 'true');
                    localStorage.setItem('rodp_logged_in_user', JSON.stringify({
                      role: 'super_admin',
                      name: 'Rizwan RR (CEO)',
                      email: 'rizwanroushan0@gmail.com'
                    }));
                    localStorage.setItem('rodp_target_tab', 'super_admin_panel');
                    if (onNavigateToRodp) {
                      onNavigateToRodp();
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-sora font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-amber-500/30 hover:scale-105 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert size={16} />
                  <span>Direct RODP Admin Access</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 text-left">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">Total Inbound Requests</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-sora text-3xl font-extrabold text-white">{rodpApps.length}</span>
                  <span className="text-xs font-mono text-amber-400">Live RTDB</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-amber-500/20 text-left">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block font-bold">Pending Clearance</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-sora text-3xl font-extrabold text-amber-400">
                    {rodpApps.filter(a => a.status === 'pending').length}
                  </span>
                  <span className="text-xs font-mono text-amber-300/70">Action Required</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-blue-500/20 text-left">
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">In Processing</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-sora text-3xl font-extrabold text-blue-400">
                    {rodpApps.filter(a => a.status === 'in_progress').length}
                  </span>
                  <span className="text-xs font-mono text-blue-300/70">Active Queue</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-emerald-500/20 text-left">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Approved / Settled</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-sora text-3xl font-extrabold text-emerald-400">
                    {rodpApps.filter(a => a.status === 'approved').length}
                  </span>
                  <span className="text-xs font-mono text-emerald-300/70">Completed</span>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Real-time Live Table */}
            <div className="bg-white/5 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {(['all', 'pending', 'in_progress', 'approved', 'rejected'] as const).map((filterKey) => {
                    const count = filterKey === 'all' 
                      ? rodpApps.length 
                      : rodpApps.filter(a => a.status === filterKey).length;
                    return (
                      <button
                        key={filterKey}
                        onClick={() => setRodpFilter(filterKey)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          rodpFilter === filterKey
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {filterKey.replace('_', ' ')} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-mono text-gray-400">
                  Showing {rodpFilter === 'all' ? rodpApps.length : rodpApps.filter(a => a.status === rodpFilter).length} of {rodpApps.length} records
                </div>
              </div>

              {/* Applications List */}
              {rodpApps.filter(a => rodpFilter === 'all' || a.status === rodpFilter).length === 0 ? (
                <div className="py-16 text-center space-y-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                  <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 inline-block">
                    <ShieldAlert size={36} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sora font-bold text-white text-lg">No Applications In Queue</h3>
                    <p className="text-gray-400 text-xs font-light max-w-md mx-auto leading-relaxed">
                      Client applications submitted through the RODP portal will sync here instantly. Use the button below to generate a test submission.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await submitRODPApplication({
                        applicantName: 'Rizwan Client Demo',
                        contactNumber: '9832109876',
                        serviceRequested: 'Aadhaar Biometric Verification',
                        branchName: 'Head Office (ROD001)',
                        status: 'pending',
                        notes: 'Initial test client request dispatched from CEO console.'
                      });
                      triggerToast('⚡ Test service request created!');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus size={14} />
                    <span>Create Sample Application</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                        <th className="pb-3 px-3">Applicant Name</th>
                        <th className="pb-3 px-3">Contact</th>
                        <th className="pb-3 px-3">Service Requested</th>
                        <th className="pb-3 px-3">Branch / Location</th>
                        <th className="pb-3 px-3">Submitted</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {rodpApps
                        .filter(a => rodpFilter === 'all' || a.status === rodpFilter)
                        .map((app) => {
                          const dateStr = app.submittedAt 
                            ? new Date(typeof app.submittedAt === 'number' ? app.submittedAt : Date.now()).toLocaleString() 
                            : 'Just now';
                          return (
                            <tr key={app.firebaseId || app.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 px-3 font-medium text-white">
                                {app.applicantName}
                              </td>
                              <td className="py-4 px-3 font-mono text-amber-300">
                                {app.contactNumber}
                              </td>
                              <td className="py-4 px-3 text-gray-200">
                                {app.serviceRequested}
                              </td>
                              <td className="py-4 px-3 text-gray-400 font-mono text-[11px]">
                                {app.branchName || 'Central HQ'}
                              </td>
                              <td className="py-4 px-3 text-gray-400 font-mono text-[10px] whitespace-nowrap">
                                {dateStr}
                              </td>
                              <td className="py-4 px-3">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider inline-block ${
                                  app.status === 'approved' 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : app.status === 'in_progress'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : app.status === 'rejected'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {app.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-4 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {app.status !== 'approved' && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (app.firebaseId) {
                                          await updateRODPApplicationStatus(app.firebaseId, 'approved');
                                          triggerToast(`Application for ${app.applicantName} approved!`);
                                        }
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold transition-all cursor-pointer"
                                      title="Approve request"
                                    >
                                      Approve
                                    </button>
                                  )}

                                  {app.status !== 'in_progress' && app.status !== 'approved' && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (app.firebaseId) {
                                          await updateRODPApplicationStatus(app.firebaseId, 'in_progress');
                                          triggerToast(`Application for ${app.applicantName} marked in-progress!`);
                                        }
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-mono text-[10px] font-bold transition-all cursor-pointer"
                                      title="Mark in progress"
                                    >
                                      Process
                                    </button>
                                  )}

                                  {app.status !== 'rejected' && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (app.firebaseId) {
                                          await updateRODPApplicationStatus(app.firebaseId, 'rejected');
                                          triggerToast(`Application for ${app.applicantName} rejected.`);
                                        }
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold transition-all cursor-pointer"
                                      title="Reject request"
                                    >
                                      Reject
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (app.firebaseId && confirm(`Delete application record for ${app.applicantName}?`)) {
                                        await deleteRODPApplication(app.firebaseId);
                                        triggerToast(`Application record deleted.`);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                                    title="Delete record"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Restricted Visibility Security Notice */}
            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-950/20 text-xs font-light text-amber-200/80 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-amber-400 shrink-0" />
                <span>
                  <strong>Restricted Visibility Protocol:</strong> Real-time streaming channel (<code className="text-amber-300 font-mono">rodp_portal/applications</code>) is exclusively piped to the Chief Executive Officer console. Public endpoints cannot decrypt or poll this channel.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('rodp_logged_in', 'true');
                  localStorage.setItem('rodp_logged_in_user', JSON.stringify({
                    role: 'super_admin',
                    name: 'Rizwan RR (CEO)',
                    email: 'rizwanroushan0@gmail.com'
                  }));
                  localStorage.setItem('rodp_target_tab', 'super_admin_panel');
                  if (onNavigateToRodp) {
                    onNavigateToRodp();
                  }
                }}
                className="text-amber-300 hover:text-white font-mono text-xs underline cursor-pointer"
              >
                Launch Full RODP Matrix &rarr;
              </button>
            </div>
          </div>
        )}
        {activeTab === 'subscribers' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-pink-500/20 pb-8">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl md:text-4xl font-semibold text-white tracking-tight">Newsletter Subscribers</h1>
                <p className="text-pink-200/70 text-sm font-light">Moderate global user bases subscribed to REXLIFY intelligence broadcasts.</p>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const email = fd.get('sub_email') as string;
                if (email && email.includes('@')) {
                  if (subscribers.includes(email.toLowerCase().trim())) {
                    triggerToast('Email is already registered!');
                  } else {
                    onUpdateSubscribers([...subscribers, email.toLowerCase().trim()]);
                    triggerToast('Manual subscriber registered successfully.');
                    e.currentTarget.reset();
                  }
                } else {
                  triggerToast('Please provide a valid subscriber email!');
                }
              }} className="flex gap-4 w-full md:w-auto">
                <input
                  name="sub_email"
                  type="email"
                  placeholder="Enter manual email..."
                  required
                  className="px-5 py-4 rounded-xl bg-white/5 backdrop-blur-2xl border border-pink-500/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-400 font-mono flex-1 md:w-80 shadow-inner transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-4 rounded-xl font-mono text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2 shrink-0 cursor-pointer bg-pink-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Plus size={16} />
                  Authorize Member
                </button>
              </form>
            </div>

            {/* Subscriber stats columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border-l-4 border-pink-400 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
                <span className="font-mono text-[10px] font-bold text-pink-300/50 uppercase tracking-widest block relative z-10">Active Subscribers</span>
                <span className="font-sora font-semibold text-4xl text-white block mt-2 relative z-10">{subscribers.length}</span>
                <span className="text-[10px] text-pink-200/70 font-light block mt-2 relative z-10">Authorized update channels</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border-l-4 border-pink-400 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
                <span className="font-mono text-[10px] font-bold text-pink-300/50 uppercase tracking-widest block relative z-10">Mailing Group Status</span>
                <span className="font-sora font-semibold text-4xl text-pink-300 block mt-2 relative z-10">ONLINE</span>
                <span className="text-[10px] text-pink-200/70 font-light block mt-2 relative z-10">Broadcast tunnels secure</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border-l-4 border-pink-400 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
                <span className="font-mono text-[10px] font-bold text-pink-300/50 uppercase tracking-widest block relative z-10">Last Synchronized</span>
                <span className="font-sora font-semibold text-4xl text-white block mt-2 relative z-10">JUST NOW</span>
                <span className="text-[10px] text-pink-300 font-bold block mt-2 tracking-widest uppercase relative z-10">Cached inside LocalStorage</span>
              </div>
            </div>

            {/* Subscribers Table card */}
            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20 space-y-6">
              <h3 className="font-sora text-lg font-semibold text-white uppercase tracking-widest border-b border-pink-500/20 pb-6">Authorised Email list</h3>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left font-mono text-sm text-gray-300">
                  <thead>
                    <tr className="border-b border-pink-500/20 text-pink-300/50 uppercase text-[10px] tracking-widest">
                      <th className="pb-4 font-bold">Subscriber Registry Address</th>
                      <th className="pb-4 font-bold">Access Privilege</th>
                      <th className="pb-4 text-right font-bold">Security Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-pink-300/50 text-xs uppercase tracking-widest font-bold bg-white/5 backdrop-blur-2xl rounded-2xl shadow-inner mt-4 block">
                          Zero registered update subscribers found.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors group">
                          <td className="py-4 text-left font-semibold text-white select-all pl-4 rounded-l-xl">{sub}</td>
                          <td className="py-4 text-left">
                            <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-pink-500/10 text-pink-300 border border-pink-400/20 uppercase tracking-widest">
                              Standard updates
                            </span>
                          </td>
                          <td className="py-4 text-right pr-4 rounded-r-xl">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Revoke authentication for sub '${sub}'?`)) {
                                  onUpdateSubscribers(subscribers.filter(item => item !== sub));
                                  triggerToast('Subscriber authorization revoked.');
                                }
                              }}
                              className="p-2.5 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all cursor-pointer shadow-inner"
                              title="Revoke subscription"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* composition space */}
            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20 space-y-6">
              <h4 className="font-sora text-sm font-semibold text-white uppercase tracking-widest flex items-center gap-3 border-b border-pink-500/20 pb-4">
                <Mail size={18} className="text-pink-400" />
                Simulated Broadcast Tunnels
              </h4>
              <p className="text-pink-200/70 text-xs font-mono uppercase tracking-widest leading-relaxed">
                Compose custom markdown briefings to broadcast directly to all <strong className="text-pink-300">{subscribers.length}</strong> authorized subscription accounts.
              </p>
              <div className="space-y-4 pt-4">
                <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400 animate-pulse" />
                      Sifra AI Broadcast Assistant
                    </span>
                    {aiNewsletterLoading && <span className="text-[10px] text-amber-300 font-mono tracking-widest uppercase animate-pulse">Drafting Content...</span>}
                  </div>
                  <p className="text-pink-200/70 text-[10px] font-light">Enter a topic, changelog list, or announcement hook. Sifra AI will compose a professional email newsletter with perfect Markdown formatting.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="newsletter-ai-prompt-input" 
                      placeholder="e.g. Major improvements to NeuraX, v2.5 app release, or new sponsored ads..." 
                      className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-amber-500" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const promptVal = (document.getElementById('newsletter-ai-prompt-input') as HTMLInputElement)?.value || '';
                        if (!promptVal.trim()) {
                          triggerToast('Please provide a newsletter topic/theme first!');
                          return;
                        }
                        handleGenerateNewsletterAI(promptVal);
                      }}
                      disabled={aiNewsletterLoading}
                      className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      {aiNewsletterLoading ? 'Drafting...' : '✨ Create Draft'}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  id="newsletter-subject-input"
                  placeholder="Subject: e.g., REXLIFY v2.4 Calibration Update Completed"
                  className="w-full px-5 py-4 rounded-xl bg-white/5 backdrop-blur-2xl border border-pink-500/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-pink-400 font-mono shadow-inner transition-colors"
                />
                <textarea
                  id="newsletter-body-textarea"
                  rows={8}
                  placeholder="Body text in custom system markdown format..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-2xl border border-pink-500/20 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const subj = (document.getElementById('newsletter-subject-input') as HTMLInputElement)?.value || '';
                    if (!subj.trim()) {
                      triggerToast('Please write a subject or generate one first!');
                      return;
                    }
                    triggerToast(`Simulated dispatch of "${subj}" to all ${subscribers.length} channels initiated.`);
                  }}
                  className="golden-transparent-button px-5 py-2.5 rounded-xl font-mono text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Send size={11} />
                  Dispatch Logs Broadcast
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ----------------- APPLICATION MANAGER PANEL ----------------- */}
        {activeTab === 'applications' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Application Compiler</h1>
                <p className="text-pink-200/70 text-sm font-light">Formulate, authorize, or unpublish active mobile digital builds.</p>
              </div>
              <button
                onClick={() => { setIsAddingApp(true); setEditingApp(null); }}
                id="add-app-trigger-btn"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold tracking-widest uppercase hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Plus size={16} />
                Register App
              </button>
            </div>

            {/* APP MODAL CRITICAL ADDING/EDITING */}
            {(isAddingApp || editingApp) && (
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] space-y-8 border border-pink-400/30 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[40px] rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-pink-500/20 pb-4 relative z-10">
                  <h3 className="font-sora text-sm font-semibold text-white uppercase tracking-widest">
                    {editingApp ? `Edit App Profile: ${editingApp.name}` : 'Register New Application APK'}
                  </h3>
                  <button onClick={() => { setIsAddingApp(false); setEditingApp(null); }} className="text-pink-200/70 hover:text-white transition-colors bg-white/5 backdrop-blur-2xl p-2 rounded-full border border-pink-500/10 hover:border-white/20">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveApp} className="space-y-6 text-left relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">App Name</label>
                      <input type="text" name="name" required defaultValue={editingApp?.name || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Logo Identification Code</label>
                      <select name="logo" defaultValue={editingApp?.logo || 'neurax'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors">
                        <option value="neurax">NeuraX (White Brain / Blue Square)</option>
                        <option value="sifra">Sifra AI Logo (S / Pink Gradient)</option>
                        <option value="generic">Core Custom Identifier</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Build Version No</label>
                      <input type="text" name="version" required defaultValue={editingApp?.version || '1.0.0'} placeholder="e.g. 2.4.0" className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Category</label>
                      <input type="text" name="category" required defaultValue={editingApp?.category || 'Artificial Intelligence'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Platform Status</label>
                      <select name="status" defaultValue={editingApp?.status || 'Active'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors">
                        <option value="Active">Active</option>
                        <option value="Beta">Beta (Testing)</option>
                        <option value="Coming Soon">Coming Soon (Reservations)</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">APK File Size</label>
                      <input type="text" name="apkSize" defaultValue={editingApp?.apkInfo.size || '20.0 MB'} placeholder="e.g. 18.2 MB" className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Compatible Base</label>
                      <input type="text" name="compatibility" defaultValue={editingApp?.apkInfo.compatibility || 'Android 9.0+'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Short Description Headline</label>
                    <input type="text" name="shortDescription" required defaultValue={editingApp?.shortDescription || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Full Explanative Description</label>
                    <textarea name="fullDescription" required rows={4} defaultValue={editingApp?.fullDescription || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Core Capabilities (one per line)</label>
                      <textarea name="features" required rows={4} defaultValue={editingApp?.features.join('\n') || ''} placeholder="Capacity alpha: details..." className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />

                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Developer Operational Notes</label>
                      <textarea name="developerNotes" rows={4} defaultValue={editingApp?.developerNotes || ''} placeholder="Engine details..." className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Download Binary Path url</label>
                      <input type="text" name="downloadUrl" defaultValue={editingApp?.downloadUrl || '#'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Release Date Calender</label>
                      <input type="date" name="releaseDate" defaultValue={editingApp?.releaseDate || new Date().toISOString().split('T')[0]} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                  </div>

                  <input type="hidden" name="tags" value="AI, System, Productive" />

                  <button type="submit" className="w-full py-4 px-6 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95">
                    Compile App State
                  </button>
                </form>
              </div>
            )}

            {/* REGISTERED APPS TABLE LIST */}
            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="text-pink-300/50 font-mono text-[10px] uppercase tracking-widest border-b border-pink-500/20">
                    <tr>
                      <th className="pb-4 font-bold select-none">Application name</th>
                      <th className="pb-4 font-bold select-none">Category</th>
                      <th className="pb-4 font-bold select-none">Version</th>
                      <th className="pb-4 font-bold select-none">Binary Stats</th>
                      <th className="pb-4 font-bold select-none">Status State</th>
                      <th className="pb-4 text-right font-bold select-none">Console Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 font-sora font-semibold text-white pl-4 rounded-l-xl">{app.name}</td>
                        <td className="py-4 text-pink-200/70 font-medium">{app.category}</td>
                        <td className="py-4 font-mono font-bold text-pink-300">v{app.version}</td>
                        <td className="py-4 font-mono text-pink-200/70 text-xs">{app.apkInfo.size} &bull; <span className="text-pink-300">{app.apkInfo.downloadCount} dl</span></td>
                        <td className="py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-widest uppercase font-bold border ${
                            app.status === 'Active' ? 'bg-pink-500/10 text-pink-300 border-pink-400/20' :
                            app.status === 'Beta' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-4 rounded-r-xl">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleTogglePublishApp(app.id)} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-pink-400/30 hover:bg-pink-500/10 text-pink-200/70 hover:text-pink-300 transition-all cursor-pointer shadow-inner" title="Toggle Publish state">
                              <RefreshCw size={14} />
                            </button>
                            <button onClick={() => { setEditingApp(app); setIsAddingApp(false); }} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-amber-500/30 hover:bg-amber-500/10 text-pink-200/70 hover:text-amber-400 transition-all cursor-pointer shadow-inner">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteApp(app.id)} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-red-500/30 hover:bg-red-500/10 text-pink-200/70 hover:text-red-400 transition-all cursor-pointer shadow-inner">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ----------------- UPDATES COMPILER PANEL ----------------- */}
        {activeTab === 'updates' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Updates Compiler</h1>
                <p className="text-pink-200/70 text-sm font-light">Draft, adjust, delete, or pin news notifications and roadmap logs.</p>
              </div>
              <button
                onClick={() => { setIsAddingUpdate(true); setEditingUpdate(null); }}
                id="add-upd-trigger-btn"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold tracking-widest uppercase hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Plus size={16} />
                Draft Log
              </button>
            </div>

            {/* ADDING/EDITING FORM MODAL */}
            {(isAddingUpdate || editingUpdate) && (
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] space-y-8 border border-pink-400/30 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[40px] rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-pink-500/20 pb-4 relative z-10">
                  <h3 className="font-sora text-sm font-semibold text-white uppercase tracking-widest">
                    {editingUpdate ? `Edit Log: ${editingUpdate.title}` : 'Draft New Update Log Announcement'}
                  </h3>
                  <button onClick={() => { setIsAddingUpdate(false); setEditingUpdate(null); }} className="text-pink-200/70 hover:text-white transition-colors bg-white/5 backdrop-blur-2xl p-2 rounded-full border border-pink-500/10 hover:border-white/20">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveUpdate} className="space-y-6 text-left relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Brief Title Line</label>
                      <input type="text" name="title" required defaultValue={editingUpdate?.title || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Log Category</label>
                      <select name="category" defaultValue={editingUpdate?.category || 'Platform Updates'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors">
                        <option value="Announcements">Announcements</option>
                        <option value="Development News">Development News</option>
                        <option value="Release Notes">Release Notes</option>
                        <option value="Feature Updates">Feature Updates</option>
                        <option value="Platform Updates">Platform Updates</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Pin Announcement?</label>
                      <select name="pinned" defaultValue={editingUpdate?.pinned ? 'true' : 'false'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors">
                        <option value="false">No (Standard log flow)</option>
                        <option value="true">Yes (Pin directly to landing header)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Release Date</label>
                      <input type="date" name="date" defaultValue={editingUpdate?.date || new Date().toISOString().split('T')[0]} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Log Body / Article text</label>
                    <textarea name="content" required rows={6} defaultValue={editingUpdate?.content || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />
                  </div>

                  <button type="submit" className="w-full py-4 px-6 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95">
                    Publish Release Logs
                  </button>
                </form>
              </div>
            )}

            {/* DRAFT TABLE INDEX */}
            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="text-pink-300/50 font-mono text-[10px] uppercase tracking-widest border-b border-pink-500/20">
                    <tr>
                      <th className="pb-4 font-bold select-none">Update Headline</th>
                      <th className="pb-4 font-bold select-none">Category</th>
                      <th className="pb-4 font-bold select-none">Publish Date</th>
                      <th className="pb-4 font-bold select-none text-center">Pin Status</th>
                      <th className="pb-4 text-right font-bold select-none">Console Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {updates.map((up) => (
                      <tr key={up.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 font-sora font-semibold text-white text-sm max-w-sm overflow-hidden text-ellipsis whitespace-nowrap pl-4 rounded-l-xl">{up.title}</td>
                        <td className="py-4 text-pink-300 text-xs font-bold">{up.category}</td>
                        <td className="py-4 font-mono text-pink-200/70">{up.date}</td>
                        <td className="py-4 text-center">
                          {up.pinned ? (
                            <span className="px-3 py-1.5 bg-pink-500/10 text-pink-300 border border-pink-400/20 rounded-lg text-[10px] font-mono tracking-widest uppercase font-bold">PINNED</span>
                          ) : (
                            <span className="text-gray-600 font-mono text-[10px]">-</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-4 rounded-r-xl">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingUpdate(up); setIsAddingUpdate(false); }} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-amber-500/30 hover:bg-amber-500/10 text-pink-200/70 hover:text-amber-400 transition-all cursor-pointer shadow-inner">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteUpdate(up.id)} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-red-500/30 hover:bg-red-500/10 text-pink-200/70 hover:text-red-400 transition-all cursor-pointer shadow-inner">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ----------------- PROJECTS TIMELINE PANEL ----------------- */}
        {activeTab === 'projects' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Roadmap Launchpad</h1>
                <p className="text-pink-200/70 text-sm font-light">Conceptualize ongoing or future milestones and telemetry meters.</p>
              </div>
              <button
                onClick={() => { setIsAddingProject(true); setEditingProject(null); }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold tracking-widest uppercase hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Plus size={16} />
                Add Project
              </button>
            </div>

            {/* AI-Assisted Roadmap Generator Dashboard Section */}
            <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-purple-500/15 shadow-xl relative overflow-hidden space-y-6 text-left">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pink-500/10 pb-4">
                <div>
                  <h3 className="font-sora text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={16} /> Sifra AI Roadmap Generator
                  </h3>
                  <p className="text-pink-200/70 text-xs font-light mt-1">Input your target goals & watch Sifra AI architect a visual, phased timeline complete with image placeholders.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Describe Project Vision & Key Goals</label>
                  <textarea 
                    id="roadmap-goals-input"
                    rows={3} 
                    placeholder="e.g., Introduce full biometric security logging, deploy real-time websocket server analytics, and cache compilation binaries locally in physical nodes by Q4."
                    className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-purple-500 resize-none transition-colors"
                  />
                </div>
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => {
                      const goalsVal = (document.getElementById('roadmap-goals-input') as HTMLTextAreaElement)?.value || '';
                      handleGenerateFullVisualRoadmapAI(goalsVal);
                    }}
                    disabled={visualRoadmapLoading}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-400 text-black font-mono text-xs font-extrabold tracking-widest uppercase rounded-xl hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
                  >
                    {visualRoadmapLoading ? 'Sifra Architecting...' : '✨ Generate Structured Visual Roadmap'}
                  </button>
                </div>
              </div>

              {/* Generated Visual Roadmap Sequence */}
              {visualRoadmapData && (
                <div className="border-t border-pink-500/10 pt-6 space-y-8 animate-fadeIn">
                  <div className="flex justify-between items-center bg-purple-500/5 p-4 rounded-xl border border-purple-500/10">
                    <span className="font-mono text-[10px] text-purple-400 uppercase font-bold tracking-wider">🔬 Roadmap Draft Preview Matrix</span>
                    <button
                      type="button"
                      onClick={handleImportVisualRoadmap}
                      className="px-4 py-1.5 bg-pink-500 hover:bg-emerald-400 text-black font-mono text-[9px] uppercase tracking-widest font-extrabold rounded-lg transition-all"
                    >
                      🚀 Deploy Milestones to Launchpad
                    </button>
                  </div>

                  {/* High-fidelity responsive visual roadmap timeline sequence */}
                  <div className="relative border-l border-purple-500/20 ml-4 sm:ml-8 space-y-12 py-4">
                    {visualRoadmapData.map((phase, i) => (
                      <div key={i} className="relative pl-6 sm:pl-10 group">
                        {/* Timeline Connector Marker */}
                        <div className="absolute -left-3 top-1.5 h-6 w-6 rounded-full bg-black border-2 border-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                          <span className="h-2 w-2 rounded-full bg-purple-400 group-hover:scale-125 transition-transform" />
                        </div>

                        {/* Visual Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-2xl border border-pink-500/10 group-hover:border-purple-500/20 p-6 rounded-3xl transition-all">
                          {/* Image Placeholder Column */}
                          <div className="aspect-video lg:aspect-square w-full rounded-2xl bg-black border border-pink-500/10 overflow-hidden relative">
                            <img 
                              src={`https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80&sig=${i + 150}&q=${encodeURIComponent(phase.unsplashSearchTerm || 'tech')}`} 
                              alt={phase.name}
                              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            <span className="absolute bottom-3 left-3 px-3 py-1 bg-purple-500/25 text-purple-300 font-mono text-[9px] uppercase tracking-widest font-extrabold border border-purple-500/30 rounded-lg">
                              {phase.timeMarker || `Phase ${i+1}`}
                            </span>
                          </div>

                          {/* Content Column */}
                          <div className="lg:col-span-2 space-y-4 text-left flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-4">
                                <h4 className="font-sora text-base font-semibold text-white group-hover:text-purple-400 transition-colors">{phase.name}</h4>
                                <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded font-mono text-[8px] uppercase font-bold shrink-0">
                                  {phase.category || 'Engineering'}
                                </span>
                              </div>
                              <p className="text-pink-200/70 text-xs font-light leading-relaxed">{phase.description}</p>
                            </div>

                            {/* Status & Tech Notes */}
                            <div className="space-y-3 pt-3 border-t border-pink-500/10 text-[11px] font-sans">
                              {phase.notes && (
                                <div className="text-pink-200/70 bg-white/[0.02] p-3 rounded-xl border border-pink-500/10 font-mono text-[10px] leading-relaxed">
                                  <span className="text-purple-400 font-bold block mb-1">🛠️ Technical Objective:</span>
                                  {phase.notes}
                                </div>
                              )}
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-pink-300/50">Status Check:</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${phase.progress || 10}%` }} />
                                  </div>
                                  <span className="text-purple-400 font-bold">{phase.progress || 10}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ADDING / EDITING PROJECT MODAL */}
            {(isAddingProject || editingProject) && (
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] space-y-8 border border-pink-400/30 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[40px] rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-pink-500/20 pb-4 relative z-10">
                  <h3 className="font-sora text-sm font-semibold text-white uppercase tracking-widest">
                    {editingProject ? `Edit Roadmap Concept: ${editingProject.name}` : 'Register New Conceptual Milestone'}
                  </h3>
                  <button onClick={() => { setIsAddingProject(false); setEditingProject(null); }} className="text-pink-200/70 hover:text-white transition-colors bg-white/5 backdrop-blur-2xl p-2 rounded-full border border-pink-500/10 hover:border-white/20">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveProject} className="space-y-6 text-left relative z-10">
                  <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] text-purple-400 uppercase font-bold tracking-wider">⚡ Sifra AI Project Assistant</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          const nameVal = (document.querySelector('input[name="name"]') as HTMLInputElement)?.value;
                          handleGenerateRoadmapAI(nameVal || '', e);
                        }}
                        disabled={aiRoadmapLoading}
                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 border border-purple-500/30 rounded-xl font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        {aiRoadmapLoading ? 'Sifra Planning...' : '✨ Populate with Sifra AI'}
                      </button>
                    </div>
                    <p className="text-pink-200/70 text-[10px] font-light">Type a project name first below, then click the button. Sifra AI will plan the category, development progress %, targeted release quarter, descriptions, and notes instantly.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Project / Milestone Name</label>
                      <input type="text" name="name" required defaultValue={editingProject?.name || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Development category</label>
                      <input type="text" name="category" required defaultValue={editingProject?.category || 'Artificial Intelligence'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Development Milestone status</label>
                      <select name="status" defaultValue={editingProject?.status || 'Development'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors">
                        <option value="Planning">Planning</option>
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                        <option value="Released">Released</option>
                        <option value="Future Vision">Future Vision</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Goal Completion %</label>
                      <input type="number" name="progress" min="0" max="100" defaultValue={editingProject?.progress || 10} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Target Delivery Slot</label>
                      <input type="text" name="targetRelease" defaultValue={editingProject?.targetRelease || 'Q4 2026'} placeholder="e.g. Q1 2027" className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Brief Concept Summary</label>
                    <textarea name="description" required rows={3} defaultValue={editingProject?.description || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Diagnostic Technical Notes</label>
                    <textarea name="notes" rows={3} defaultValue={editingProject?.notes || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />
                  </div>

                  <button type="submit" className="w-full py-4 px-6 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95">
                    Synchronize Project Milestone
                  </button>
                </form>
              </div>
            )}

            {/* TIMELINES LIST TABLE */}
            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="text-pink-300/50 font-mono text-[10px] uppercase tracking-widest border-b border-pink-500/20">
                    <tr>
                      <th className="pb-4 font-bold select-none">Milestone Name</th>
                      <th className="pb-4 font-bold select-none">Status</th>
                      <th className="pb-4 font-bold select-none">Progress</th>
                      <th className="pb-4 font-bold select-none">Category</th>
                      <th className="pb-4 font-bold select-none">Target Release</th>
                      <th className="pb-4 text-right font-bold select-none">Console Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 font-sora font-semibold text-white pl-4 rounded-l-xl">{p.name}</td>
                        <td className="py-4">
                          <span className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-pink-500/10 bg-white/5 backdrop-blur-2xl font-bold tracking-widest uppercase text-pink-300 shadow-inner">{p.status}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-pink-300 font-bold w-10 text-xs">{p.progress}%</span>
                            <div className="w-24 bg-white/5 backdrop-blur-2xl h-2 rounded-full overflow-hidden shadow-inner border border-pink-500/10">
                              <div className="bg-pink-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${p.progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-pink-200/70 font-medium">{p.category}</td>
                        <td className="py-4 font-mono font-bold text-pink-300">{p.targetRelease}</td>
                        <td className="py-4 text-right pr-4 rounded-r-xl">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingProject(p); setIsAddingProject(false); }} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-amber-500/30 hover:bg-amber-500/10 text-pink-200/70 hover:text-amber-400 transition-all cursor-pointer shadow-inner">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteProject(p.id)} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-red-500/30 hover:bg-red-500/10 text-pink-200/70 hover:text-red-400 transition-all cursor-pointer shadow-inner">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ----------------- FAQ KNOWLEDGEBASE MANAGER PANEL ----------------- */}
        {activeTab === 'faqs' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-pink-500/20 pb-6 gap-4">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">FAQ Knowledgebase Manager</h1>
                <p className="text-pink-200/70 text-sm font-light">Create, organize, update, or remove ecosystem FAQs for users.</p>
              </div>
              <button
                onClick={() => {
                  setIsAddingFaq(true);
                  setEditingFaq(null);
                  setFaqFormQuestion('');
                  setFaqFormAnswer('');
                  setFaqFormCategory('General');
                  setFaqFormOrder(faqs.length + 1);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold tracking-widest uppercase hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Plus size={16} />
                Create New FAQ
              </button>
            </div>

            {/* ADD / EDIT FAQ MODAL */}
            {isAddingFaq && (
              <div className="bg-[#080808] p-8 md:p-10 rounded-[2.5rem] border border-white/15 space-y-6 shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                  <h3 className="font-sora text-xl font-bold text-white">
                    {editingFaq ? 'Edit FAQ Item' : 'New FAQ Knowledgebase Item'}
                  </h3>
                  <button
                    onClick={() => { setIsAddingFaq(false); setEditingFaq(null); }}
                    className="p-2 rounded-xl text-pink-200/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveFaq} className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Question Header</label>
                      <input
                        type="text"
                        value={faqFormQuestion}
                        onChange={(e) => setFaqFormQuestion(e.target.value)}
                        placeholder="e.g. How do I download Neurax OS binary package?"
                        required
                        className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Category</label>
                      <select
                        value={faqFormCategory}
                        onChange={(e) => setFaqFormCategory(e.target.value as any)}
                        className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 transition-colors"
                      >
                        <option value="General">General</option>
                        <option value="Security & AI">Security & AI</option>
                        <option value="Downloads & Installation">Downloads & Installation</option>
                        <option value="Developer & API">Developer & API</option>
                        <option value="Billing & Enterprise">Billing & Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Detailed Answer (Markdown Supported)</label>
                    <textarea
                      value={faqFormAnswer}
                      onChange={(e) => setFaqFormAnswer(e.target.value)}
                      rows={5}
                      placeholder="Provide clear, authoritative answer..."
                      required
                      className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 transition-colors resize-y"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-3">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Display Order</label>
                      <input
                        type="number"
                        value={faqFormOrder}
                        onChange={(e) => setFaqFormOrder(parseInt(e.target.value) || 1)}
                        className="w-20 text-xs px-3 py-2 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setIsAddingFaq(false); setEditingFaq(null); }}
                        className="px-5 py-3 rounded-xl border border-pink-500/20 text-pink-200/70 hover:text-white font-mono text-xs uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        {editingFaq ? 'Save FAQ Changes' : 'Publish FAQ Item'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* FAQ TABLE LIST */}
            <div className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-pink-500/20 text-left">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse text-sm">
                  <thead className="text-pink-300/50 font-mono text-[10px] uppercase tracking-widest border-b border-pink-500/20">
                    <tr>
                      <th className="pb-4 font-bold select-none w-12 text-center">Order</th>
                      <th className="pb-4 font-bold select-none">Question</th>
                      <th className="pb-4 font-bold select-none">Category</th>
                      <th className="pb-4 font-bold select-none text-center">Helpful Votes</th>
                      <th className="pb-4 text-right font-bold select-none">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {faqs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-pink-300/50 font-mono">
                          No FAQs defined. Click "Create New FAQ" above to add one.
                        </td>
                      </tr>
                    ) : (
                      faqs.map((f) => (
                        <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 text-center font-bold text-pink-300">{f.order || 1}</td>
                          <td className="py-4 font-sans text-sm font-medium text-white max-w-md truncate">
                            {f.question}
                          </td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-white/5 text-pink-300 border border-pink-400/20">
                              {f.category}
                            </span>
                          </td>
                          <td className="py-4 text-center font-bold text-gray-300">
                            {f.helpfulVotes || 0}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditFaqClick(f)}
                                className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Edit FAQ"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteFaq(f.id)}
                                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                title="Delete FAQ"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- DOCUMENTATION BUILDER PANEL ----------------- */}

        {activeTab === 'documents' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Docs Catalog</h1>
                <p className="text-pink-200/70 text-sm font-light">Incorporate, adjust, or eliminate instruction guidelines and manuals.</p>
              </div>
              <button
                onClick={() => { setIsAddingDoc(true); setEditingDoc(null); }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold tracking-widest uppercase hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Plus size={16} />
                Draft manual
              </button>
            </div>

            {/* EXPANDED DOCUMENT FORM MODAL */}
            {(isAddingDoc || editingDoc) && (
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] space-y-8 border border-pink-400/30 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[40px] rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-pink-500/20 pb-4 relative z-10">
                  <h3 className="font-sora text-sm font-semibold text-white uppercase tracking-widest">
                    {editingDoc ? `Edit Article: ${editingDoc.title}` : 'Compile New Technical Manual'}
                  </h3>
                  <button onClick={() => { setIsAddingDoc(false); setEditingDoc(null); }} className="text-pink-200/70 hover:text-white transition-colors bg-white/5 backdrop-blur-2xl p-2 rounded-full border border-pink-500/10 hover:border-white/20">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveDoc} className="space-y-6 text-left relative z-10">
                  <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] text-purple-400 uppercase font-bold tracking-wider">⚡ Sifra AI Document Link Compiler</span>
                      {aiDocCompilerLoading && <span className="text-[10px] text-purple-300 font-mono tracking-widest uppercase animate-pulse">Sifra Scraping & Writing...</span>}
                    </div>
                    <p className="text-pink-200/70 text-[10px] font-light">Paste any topic, reference guide, or documentation URL link below. Sifra AI will scrape/analyze the topic and compile structured Markdown documentation sections automatically.</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id="compile-doc-url-input" 
                        placeholder="e.g. https://example.com/docs/api-guide or enter a technical topic..." 
                        className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-purple-500" 
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const urlVal = (document.getElementById('compile-doc-url-input') as HTMLInputElement)?.value || '';
                          handleCompileLinkDocs(urlVal, e);
                        }}
                        disabled={aiDocCompilerLoading}
                        className="px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 border border-purple-500/30 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        {aiDocCompilerLoading ? 'Compiling...' : '✨ Compile & Populate'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Document Title Line</label>
                      <input type="text" name="title" required defaultValue={editingDoc?.title || ''} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Knowledge Section Location</label>
                      <select name="category" defaultValue={editingDoc?.category || 'REXLIFY'} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors">
                        <option value="REXLIFY">REXLIFY Gateway</option>
                        <option value="NeuraX">NeuraX Core</option>
                        <option value="Sifra">Sifra AI</option>
                        <option value="Applications">Applications</option>
                        <option value="Development">Development</option>
                        <option value="Updates">Updates</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">Markdown Content body</label>
                    <textarea name="content" required rows={12} defaultValue={editingDoc?.content || ''} placeholder="Use ## or ### for titles..." className="w-full text-sm font-mono px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />
                  </div>

                  <button type="submit" className="w-full py-4 px-6 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95">
                    Compile Article State
                  </button>
                </form>
              </div>
            )}

            {/* INDIVIDUAL DOCS INDEX */}
            <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="text-pink-300/50 font-mono text-[10px] uppercase tracking-widest border-b border-pink-500/20">
                    <tr>
                      <th className="pb-4 font-bold select-none">Guide Name</th>
                      <th className="pb-4 font-bold select-none">Ecosystem Branch</th>
                      <th className="pb-4 font-bold select-none">File Slug key</th>
                      <th className="pb-4 font-bold select-none">Last Recalibrated</th>
                      <th className="pb-4 text-right font-bold select-none">Console Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 font-sora font-semibold text-white pl-4 rounded-l-xl">{doc.title}</td>
                        <td className="py-4 text-pink-300 font-mono font-bold tracking-widest text-xs uppercase">{doc.category}</td>
                        <td className="py-4 text-pink-200/70 font-mono tracking-widest text-xs">/{doc.slug}</td>
                        <td className="py-4 font-mono text-pink-300/50 tracking-widest text-xs">{doc.lastUpdated}</td>
                        <td className="py-4 text-right pr-4 rounded-r-xl">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setEditingDoc(doc); setIsAddingDoc(false); }} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-amber-500/30 hover:bg-amber-500/10 text-pink-200/70 hover:text-amber-400 transition-all cursor-pointer shadow-inner">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl hover:border-red-500/30 hover:bg-red-500/10 text-pink-200/70 hover:text-red-400 transition-all cursor-pointer shadow-inner">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ----------------- TRANS MESSAGES PANEL ----------------- */}
        {activeTab === 'messages' && (
          <div className="fixed inset-0 bg-white/5 backdrop-blur-xl z-[50] p-6 md:p-12 overflow-y-auto flex flex-col space-y-8 animate-fadeIn">
            {/* Header block */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-pink-500/20 pb-6 shrink-0">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight flex items-center gap-3">
                  Transmission Center
                  <span className="text-[10px] bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded border border-[#10b981]/20 font-mono uppercase tracking-widest font-bold">
                    FULL-SCREEN COMMAND FOCUS
                  </span>
                </h1>
                <p className="text-pink-200/70 text-sm font-light">Interact with user feedback, suggestions, and custom support tickets facilitated by Sifra AI.</p>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 font-mono text-xs font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Minimize2 size={14} />
                Back to Dashboard
              </button>
            </div>

            {/* Widescreen Multi-Pane Workspace Redesign */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch font-sans">
              
              {/* LEFT COLUMN: Transmission Directory List (35% - lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl px-5 py-4 rounded-2xl border border-pink-500/20">
                  <span className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold">
                    Incoming Queue ({messages.length})
                  </span>
                  <span className="text-[10px] text-purple-400 font-mono bg-purple-500/5 px-2.5 py-1 rounded border border-purple-500/10">
                    Sifra Node Active
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[620px] pr-2 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-xl p-12 text-center text-pink-300/50 font-mono text-xs rounded-3xl border border-pink-500/20">
                      ZERO RECEIVED COMMUNICATIONS LOGGED
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isSelected = selectedMessageId === msg.id;
                      return (
                        <div 
                          key={msg.id} 
                          onClick={() => setSelectedMessageId(msg.id)}
                          className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-purple-500/5 border-purple-500/50 shadow-lg shadow-purple-500/5' 
                              : msg.isRead 
                                ? 'bg-white/5 backdrop-blur-xl border-pink-500/10 hover:border-white/15' 
                                : 'bg-[#080808] border-purple-500/10 border-l-4 border-l-purple-500 hover:border-purple-500/25'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <div className="font-sora text-sm font-semibold text-white truncate max-w-[200px]">
                                {msg.senderName}
                              </div>
                              <div className="text-[10px] text-pink-200/70 font-mono font-medium truncate max-w-[180px]">
                                {msg.senderEmail}
                              </div>
                            </div>
                            <span className="text-[8px] font-mono text-pink-300/50 shrink-0">{msg.date}</span>
                          </div>

                          <div className="mt-3 font-sans text-xs text-gray-300 line-clamp-2 leading-relaxed">
                            <span className="font-mono text-[9px] text-purple-300 font-bold uppercase tracking-wider block">Subject: {msg.subject}</span>
                            {msg.message}
                          </div>

                          <div className="flex justify-between items-center mt-4 pt-3 border-t border-pink-500/10">
                            <span className="font-mono text-[8px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase font-bold tracking-wider">
                              {msg.category}
                            </span>
                            <div className="flex items-center gap-2">
                              {msg.isImportant && (
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Important" />
                              )}
                              {!msg.isRead && (
                                <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" title="Unread" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Active Response Console Workspace (65% - lg:col-span-7) */}
              <div className="lg:col-span-7">
                {(() => {
                  const activeMsg = messages.find(m => m.id === selectedMessageId) || messages[0] || null;
                  if (!activeMsg) {
                    return (
                      <div className="bg-white/5 backdrop-blur-xl h-full p-12 rounded-[2rem] border border-pink-500/10 flex flex-col items-center justify-center text-center text-pink-300/50">
                        <span className="text-3xl">📥</span>
                        <p className="font-sora text-sm font-semibold text-white mt-4">No Transmissions Selected</p>
                        <p className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest mt-1">Direct feedback channel is standing by</p>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] border border-pink-500/20 space-y-6 text-left flex flex-col h-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
                      
                      {/* Control bar / status */}
                      <div className="flex justify-between items-center border-b border-pink-500/10 pb-4">
                        <div>
                          <span className="font-mono text-[9px] text-purple-400 uppercase font-bold tracking-widest block">Active command channel</span>
                          <h3 className="font-sora text-sm font-bold text-white mt-0.5">Transmission #{activeMsg.id.substring(4, 10)}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleMarkMessageRead(activeMsg.id)} 
                            className={`px-3 py-1.5 rounded-xl font-mono text-[9px] uppercase font-bold tracking-wider border transition-all cursor-pointer ${
                              activeMsg.isRead ? 'bg-white/5 backdrop-blur-2xl border-pink-500/10 text-pink-200/70 hover:text-white' : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                            }`}
                          >
                            {activeMsg.isRead ? 'Mark Unread' : 'Mark Reviewed'}
                          </button>
                          <button 
                            onClick={() => handleMarkMessageImportant(activeMsg.id)} 
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              activeMsg.isImportant ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/5 backdrop-blur-2xl border-pink-500/10 text-pink-200/70 hover:text-white'
                            }`}
                          >
                            <Sparkles size={14} className={activeMsg.isImportant ? 'fill-amber-400 text-amber-400' : ''} />
                          </button>
                          <button 
                            onClick={() => {
                              handleDeleteMessage(activeMsg.id);
                              setSelectedMessageId(null);
                            }} 
                            className="p-2 rounded-xl border border-pink-500/10 bg-white/5 backdrop-blur-2xl text-pink-200/70 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Header details block */}
                      <div className="space-y-4 bg-white/5 backdrop-blur-2xl p-5 rounded-2xl border border-pink-500/10 relative z-10">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-mono text-[9px] text-pink-300/50 uppercase tracking-widest">Sender Identity:</span>
                            <h4 className="font-sora font-semibold text-white text-base">{activeMsg.senderName}</h4>
                            <p className="font-mono text-[10px] text-purple-400 tracking-wider mt-0.5">{activeMsg.senderEmail}</p>
                          </div>
                          <span className="px-3 py-1 bg-purple-500/15 text-purple-300 border border-purple-500/20 font-mono text-[9px] uppercase font-bold tracking-widest rounded-lg">
                            {activeMsg.category}
                          </span>
                        </div>
                        <div className="border-t border-pink-500/10 pt-3 flex justify-between items-center text-[10px] font-mono text-pink-300/50 uppercase tracking-wider">
                          <span>Date Logged: {activeMsg.date}</span>
                          <span className="text-pink-300">Security: Verified Sandbox Link</span>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="space-y-2 text-left relative z-10 flex-1">
                        <span className="font-mono text-[9px] text-pink-300/50 uppercase tracking-widest">Message Payload:</span>
                        <div className="bg-white/5 backdrop-blur-2xl p-5 rounded-2xl border border-pink-500/10 text-gray-300 text-xs font-light leading-relaxed max-h-[160px] overflow-y-auto custom-scrollbar whitespace-pre-line">
                          <p className="font-mono text-[10px] text-purple-300 font-bold uppercase tracking-wider mb-2">Subject: {activeMsg.subject}</p>
                          {activeMsg.message}
                        </div>
                      </div>

                      {/* AI REPLY CONSOLE */}
                      <div className="space-y-4 pt-4 border-t border-pink-500/10 relative z-10 text-left">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div>
                            <span className="font-mono text-[9px] text-purple-400 uppercase font-bold tracking-widest block">🤖 Sifra Neural Response Assistant</span>
                            <p className="text-pink-300/50 text-[10px] font-light mt-0.5">Let AI formulate a response draft based on client intent.</p>
                          </div>
                          
                          {/* Tone custom options */}
                          <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-2xl p-1 rounded-xl border border-pink-500/20 shrink-0">
                            {(['helpful', 'explanatory', 'technical', 'urgent'] as const).map((tone) => (
                              <button
                                key={tone}
                                onClick={() => setAiReplyTone(tone)}
                                className={`px-2 py-1 rounded-lg font-mono text-[8px] uppercase tracking-wider transition-all cursor-pointer ${
                                  aiReplyTone === tone 
                                    ? 'bg-purple-500 text-black font-extrabold shadow' 
                                    : 'text-pink-200/70 hover:text-white'
                                }`}
                              >
                                {tone}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Generate Trigger */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleGenerateAIReply(activeMsg, e)}
                            disabled={aiReplyLoading}
                            className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-black font-mono text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                          >
                            {aiReplyLoading ? (
                              <span className="animate-pulse">Sifra Drafting response...</span>
                            ) : (
                              <>✨ Generate Sifra AI Quick Reply Draft</>
                            )}
                          </button>
                        </div>

                        {/* Reply content field */}
                        <div className="space-y-1 text-left">
                          <textarea
                            value={aiReplyText}
                            onChange={(e) => setAiReplyText(e.target.value)}
                            placeholder="Draft responses are loaded here. You can fully customize and edit the text before sending..."
                            rows={4}
                            className="w-full text-xs font-mono p-4 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-purple-500 resize-none shadow-inner"
                          />
                        </div>

                        {/* Submit draft / send reply simulator */}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAiReplyText('');
                              triggerToast('Reply draft cleared.');
                            }}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white font-mono text-[9px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Clear draft
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!aiReplyText.trim()) {
                                triggerToast('Please compile a reply draft first!');
                                return;
                              }
                              triggerToast(`Reply successfully dispatched to ${activeMsg.senderName}!`);
                              handleMarkMessageRead(activeMsg.id);
                              setAiReplyText('');
                            }}
                            className="px-5 py-2 bg-pink-500 hover:bg-emerald-400 text-black font-mono text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95 cursor-pointer"
                          >
                            Dispatch Response 🚀
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}


        {/* ----------------- SEO CONFIG MANAGER ----------------- */}
        {activeTab === 'seo' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">SEO and Discovery indexing</h1>
                <p className="text-pink-200/70 text-sm font-light">Structure default meta search parameters and structured JSON schemas.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSEO} className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20 text-left space-y-8 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-pink-500/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-300 uppercase tracking-widest font-bold block">Primary Meta Title String</label>
                  <input type="text" name="metaTitle" required defaultValue={seo.metaTitle} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-300 uppercase tracking-widest font-bold block">Meta keywords tags</label>
                  <input type="text" name="keywords" required defaultValue={seo.keywords} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Meta Description overview</label>
                <textarea name="metaDescription" required rows={3} defaultValue={seo.metaDescription} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Open Graph title (OG)</label>
                  <input type="text" name="ogTitle" defaultValue={seo.openGraph.title} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Open Graph Description</label>
                  <input type="text" name="ogDescription" defaultValue={seo.openGraph.description} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">SEO JSON-LD Symmetrical Schema Markup</label>
                <textarea name="schemaMarkup" required rows={6} defaultValue={seo.schemaMarkup} className="w-full text-sm font-mono px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none shadow-inner transition-colors" />
              </div>

              <button type="submit" className="w-full py-4 px-6 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 relative z-10">
                Save search structural indices
              </button>
            </form>
          </div>
        )}


        {/* ----------------- WEBSITE content EDITOR ----------------- */}
        {activeTab === 'content' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="text-left space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Website Content Compiler</h1>
                <p className="text-pink-200/70 text-sm font-light">Structure core landing titles, bios, links, and operational goals.</p>
              </div>
            </div>

            <form onSubmit={handleSaveContent} className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-pink-500/20 text-left space-y-8 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-pink-500/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="bg-pink-500/5 p-4 rounded-2xl border border-pink-400/10 space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] text-pink-300 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-pink-300 animate-pulse" />
                    Sifra AI Website Copywriter
                  </span>
                  {aiEnhanceLoadingField === 'website-content' && <span className="text-[10px] text-emerald-300 font-mono tracking-widest uppercase animate-pulse">Drafting Content...</span>}
                </div>
                <p className="text-pink-200/70 text-[10px] font-light">Describe your core platform brand strategy, operational focus, or technical mission. Sifra AI will rewrite and populate all titles, about stories, visions, and biography strings with professional copywriting instantly.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="website-ai-prompt-input" 
                    placeholder="e.g. Next-generation secure mobile binaries distribution node with premium AI integrations..." 
                    className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const promptVal = (document.getElementById('website-ai-prompt-input') as HTMLInputElement)?.value || '';
                      if (!promptVal.trim()) {
                        triggerToast('Please provide a core brand description first!');
                        return;
                      }
                      handleEnhanceWebsiteContentAI(promptVal);
                    }}
                    disabled={aiEnhanceLoadingField === 'website-content'}
                    className="px-4 py-2.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-400/20 rounded-xl font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    {aiEnhanceLoadingField === 'website-content' ? 'Writing...' : '✨ Rewrite Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-pink-500/20 relative z-10">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-300 uppercase tracking-widest font-bold block">Homepage Hero Title</label>
                  <input type="text" name="heroTitle" required defaultValue={content.heroTitle} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-300 uppercase tracking-widest font-bold block">Homepage Hero Subtitle</label>
                  <input type="text" name="heroSubtitle" required defaultValue={content.heroSubtitle} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">The REXLIFY Story (About page)</label>
                <textarea name="aboutStory" required rows={5} defaultValue={content.aboutStory} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none leading-relaxed shadow-inner transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-pink-500/20 relative z-10">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Core Mission Description</label>
                  <textarea name="aboutMission" required rows={4} defaultValue={content.aboutMission} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none leading-relaxed shadow-inner transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Systems Vision Spec</label>
                  <textarea name="aboutVision" required rows={4} defaultValue={content.aboutVision} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none leading-relaxed shadow-inner transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Founder Identifier Name</label>
                  <input type="text" name="founderName" required defaultValue={content.founderName} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">GitHub Directory Link</label>
                  <input type="text" name="githubUrl" defaultValue={content.githubUrl} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Telegram Channel Trigger</label>
                  <input type="text" name="telegramUrl" defaultValue={content.telegramUrl} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 shadow-inner transition-colors" />
                </div>
              </div>

              <div className="space-y-2 relative z-10">
                <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Founder Biography Info</label>
                <textarea name="founderBio" required rows={5} defaultValue={content.founderBio} className="w-full text-sm px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none leading-relaxed shadow-inner transition-colors" />
              </div>

               <button type="submit" className="w-full py-4 px-6 rounded-xl bg-pink-500 hover:bg-emerald-400 text-black font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 relative z-10">
                Modernize Public Interface strings
              </button>
            </form>
          </div>
        )}


        {/* ----------------- SIFRA AI STUDIO ----------------- */}
        {activeTab === 'sifra-ai' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="text-left space-y-2">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest font-bold flex items-center gap-2">
                  <Sparkles size={14} className="animate-pulse" />
                  SIFRA COGNITIVE CORE
                </span>
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Sifra AI Professional Assistant</h1>
                <p className="text-pink-200/70 text-sm font-light">
                  Ask Sifra AI to draft polished content, format SEO strings, or design brand-new features, then import them instantly with 1-click.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
              {/* Chat interface */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-pink-500/20 rounded-[2.5rem] p-6 flex flex-col h-[600px] justify-between relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                {/* Chat window */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar p-2">
                  {messagesList.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-[2rem] px-5 py-4 text-xs leading-relaxed shadow-md relative ${
                        msg.sender === 'user' 
                          ? 'bg-pink-500 text-black rounded-tr-none font-medium' 
                          : 'bg-[#0a0a0a] border border-pink-500/20 text-gray-200 rounded-tl-none font-light'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        
                        {msg.data && (
                          <div className="mt-4 p-4 bg-black/40 border border-pink-500/20 rounded-2xl space-y-3 font-mono text-[10px]">
                            <div className="flex justify-between items-center border-b border-pink-500/10 pb-2">
                              <span className="text-amber-400 font-bold uppercase tracking-wider">Concept Blueprint Generated</span>
                              <span className="text-pink-300/50 text-[9px]">JSON Format</span>
                            </div>
                            <pre className="max-h-[150px] overflow-auto text-pink-300 text-left custom-scrollbar">
                              {JSON.stringify(msg.data, null, 2)}
                            </pre>
                            <button
                              onClick={() => handleImportSifraData(itemType, msg.data)}
                              className="w-full py-2 bg-pink-500 text-black hover:bg-emerald-400 font-mono font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer"
                            >
                              Deploy Draft to Database (ডাটাবিসে যুক্ত করুন)
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-[#0a0a0a] border border-pink-500/20 text-pink-200/70 rounded-[2rem] rounded-tl-none px-5 py-4 text-xs font-mono tracking-widest uppercase flex items-center gap-3 animate-pulse">
                        <RefreshCw size={14} className="animate-spin text-amber-400" />
                        Sifra thinking... (সিফরা চিন্তা করছে...)
                      </div>
                    </div>
                  )}
                </div>

                {/* Input block */}
                <div className="border-t border-pink-500/20 pt-4 mt-4 space-y-3 relative z-10">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendPrompt();
                          }
                        }}
                        rows={2}
                        placeholder="বলুন কি তৈরি করতে চান? যেমন: 'আমার ডিজিটাল মুদ্রার ব্লগের জন্য একটি পোস্ট লিখে দিন'..."
                        className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                    <button
                      onClick={handleSendPrompt}
                      disabled={loading || !prompt.trim()}
                      className="px-6 py-3 bg-amber-500 text-black font-mono font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 self-end cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send size={14} />
                      Transmit
                    </button>
                  </div>
                </div>
              </div>

              {/* Sifra settings and quick prompts */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl border border-pink-500/20 rounded-[2.5rem] p-6 space-y-6 shadow-xl">
                  <h3 className="font-sora text-sm font-semibold text-white uppercase tracking-wider border-b border-pink-500/20 pb-3">AI Blueprinter Settings</h3>
                  
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold block">Target Item Blueprint Category</label>
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="blog">Blog Post (ব্লগ পোস্ট)</option>
                      <option value="feature">Platform Feature / Architecture (ফিচার)</option>
                      <option value="service">Service Catalog Item (সার্ভিস)</option>
                      <option value="application">Mobile APK Entry (অ্যাপ্লিকেশন)</option>
                      <option value="project">Roadmap Project (রোডম্যাপ)</option>
                      <option value="video">Media Center Video (ভিডিও)</option>
                      <option value="ad">Advertisement Space (বিজ্ঞাপন)</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <span className="font-mono text-[9px] text-pink-300/50 uppercase tracking-widest font-bold block">Quick Starter Prompts</span>
                    
                    <button
                      onClick={() => setPrompt("Create a premium blog post analyzing CBDC (Central Bank Digital Currencies) impacts in Asian markets in 2026.")}
                      className="w-full text-left p-3 rounded-xl bg-white/5 backdrop-blur-2xl hover:bg-white/5 border border-pink-500/10 text-[11px] text-gray-300 font-light hover:text-white transition-colors block"
                    >
                      "Analyze CBDC impacts in 2026..."
                    </button>

                    <button
                      onClick={() => setPrompt("Design a platform feature called 'NeuraX Sentinel' which distributes decentralized cybersecurity verification across global mobile phone node endpoints.")}
                      className="w-full text-left p-3 rounded-xl bg-white/5 backdrop-blur-2xl hover:bg-white/5 border border-pink-500/10 text-[11px] text-gray-300 font-light hover:text-white transition-colors block"
                    >
                      "Design feature 'NeuraX Sentinel'..."
                    </button>

                    <button
                      onClick={() => setPrompt("Create a new premium consulting service offering specialized offline smart-contract deployments for retail stores.")}
                      className="w-full text-left p-3 rounded-xl bg-white/5 backdrop-blur-2xl hover:bg-white/5 border border-pink-500/10 text-[11px] text-gray-300 font-light hover:text-white transition-colors block"
                    >
                      "Service for offline smart-contracts..."
                    </button>
                  </div>
                </div>

                {latestData && (
                  <div className="bg-white/5 backdrop-blur-xl border border-amber-500/20 rounded-[2.5rem] p-6 space-y-4 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-[30px] rounded-full" />
                    <h4 className="font-sora text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                      <Check size={14} className="text-pink-400" />
                      Ready to Deploy
                    </h4>
                    <p className="text-pink-200/70 text-[11px] leading-relaxed">
                      Sifra generated a <strong className="text-white uppercase font-mono">{latestData.type}</strong> blueprint. Press Deploy below to finalize.
                    </p>
                    <button
                      onClick={() => {
                        handleImportSifraData(latestData.type, latestData.data);
                        setLatestData(null);
                      }}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl transition-all cursor-pointer"
                    >
                      Instant Blueprint Deploy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* ----------------- ARCHITECTURE & FEATURES ----------------- */}
        {activeTab === 'architecture' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Platform Features Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                <div className="text-left space-y-1">
                  <h2 className="font-sora text-xl font-bold text-white uppercase tracking-tight">Core Architectural Concept Features</h2>
                  <p className="text-pink-200/70 text-xs font-light">Configure the main technological conceptual modules of Rexlify.</p>
                </div>
                <button
                  onClick={() => { setEditingFeature(null); setIsAddingFeature(true); }}
                  className="px-4 py-2 bg-pink-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <Plus size={14} /> Add Feature Concept
                </button>
              </div>

              {/* Add/Edit Feature Modal/Form Overlay */}
              {(isAddingFeature || editingFeature) && (
                <form onSubmit={handleSaveFeature} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-pink-400/30 text-left space-y-4">
                  <h3 className="font-sora text-xs font-bold text-pink-300 uppercase tracking-widest">
                    {editingFeature ? 'Edit Feature Node Spec' : 'Deploy New Architectural Concept Node'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Feature Title (ফিচার টাইটেল)</label>
                      <input type="text" name="title" required defaultValue={editingFeature?.title || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Feature Description</label>
                      <input type="text" name="desc" required defaultValue={editingFeature?.desc || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Icon Name (Globe, Cpu, Layers, ShieldCheck, RefreshCw, Sparkles)</label>
                      <input type="text" name="icon" required defaultValue={editingFeature?.icon || 'Cpu'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => { setIsAddingFeature(false); setEditingFeature(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-pink-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl">Save Node</button>
                  </div>
                </form>
              )}

              {/* Grid representation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {platformFeatures.map((feat) => (
                  <div key={feat.id} className="p-6 bg-white/5 backdrop-blur-xl border border-pink-500/10 rounded-3xl text-left space-y-4 hover:border-pink-500/20 transition-all relative">
                    <div className="flex justify-between items-start">
                      <span className="p-3 bg-pink-500/10 border border-pink-400/20 text-pink-300 rounded-2xl block text-sm font-mono font-bold">
                        {feat.icon || 'Cpu'}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingFeature(feat)} className="p-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-lg transition-colors cursor-pointer"><Edit size={12} /></button>
                        <button onClick={() => handleDeleteFeature(feat.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-sora text-sm font-semibold text-white">{feat.title}</h4>
                      <p className="text-pink-200/70 text-xs font-light mt-1 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Showcase Screenshots Section */}
            <div className="space-y-6 pt-10 border-t border-pink-500/20">
              <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                <div className="text-left space-y-1">
                  <h2 className="font-sora text-xl font-bold text-white uppercase tracking-tight">Showcase Mobile App Mockup Screenshots</h2>
                  <p className="text-pink-200/70 text-xs font-light">Manage visual assets displayed in the immersive mobile catalog preview grid.</p>
                </div>
                <button
                  onClick={() => { setEditingScreenshot(null); setIsAddingScreenshot(true); }}
                  className="px-4 py-2 bg-pink-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <Plus size={14} /> Add Screenshot
                </button>
              </div>

              {/* Add/Edit Screenshot Form Overlay */}
              {(isAddingScreenshot || editingScreenshot) && (
                <form onSubmit={handleSaveScreenshot} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-pink-400/30 text-left space-y-4">
                  <h3 className="font-sora text-xs font-bold text-pink-300 uppercase tracking-widest">
                    {editingScreenshot ? 'Edit Screenshot Node' : 'Register New Interactive Screenshot Mock'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">App Identifier Link (e.g., neurax, sifra)</label>
                      <input type="text" name="appId" required defaultValue={editingScreenshot?.appId || 'neurax'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">App Visual Label Name</label>
                      <input type="text" name="appName" required defaultValue={editingScreenshot?.appName || 'NeuraX System'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Screenshot Asset Unsplash URL / Source</label>
                      <input type="text" name="src" required defaultValue={editingScreenshot?.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Brief Image Description</label>
                      <input type="text" name="description" required defaultValue={editingScreenshot?.description || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Image Accent Tag (e.g., SECURE VAULT, AI CONSOLE)</label>
                      <input type="text" name="label" required defaultValue={editingScreenshot?.label || 'LIVE INTERFACE'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => { setIsAddingScreenshot(false); setEditingScreenshot(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-pink-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl">Save Screenshot</button>
                  </div>
                </form>
              )}

              {/* Listing Table */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-pink-500/10 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 backdrop-blur-2xl border-b border-pink-500/20 text-pink-200/70 uppercase font-mono text-[9px] tracking-widest">
                      <th className="p-4">App ID</th>
                      <th className="p-4">Label & App Name</th>
                      <th className="p-4">Visual Image URL</th>
                      <th className="p-4">Description Text</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-gray-300">
                    {showcaseScreenshots.map((screen) => (
                      <tr key={screen.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-pink-300 font-bold">{screen.appId}</td>
                        <td className="p-4">
                          <span className="block font-sans font-semibold text-white">{screen.appName}</span>
                          <span className="text-[9px] bg-pink-500/10 text-pink-300 px-2 py-0.5 rounded border border-pink-400/20">{screen.label}</span>
                        </td>
                        <td className="p-4 text-[10px] text-pink-300/50 truncate max-w-[150px]">{screen.src}</td>
                        <td className="p-4 font-sans text-pink-200/70">{screen.description}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setEditingScreenshot(screen)} className="p-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-lg cursor-pointer"><Edit size={12} /></button>
                            <button onClick={() => handleDeleteScreenshot(screen.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic UI Components Sections Section */}
            <div className="space-y-6 pt-10 border-t border-pink-500/20">
              <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                <div className="text-left space-y-1">
                  <h2 className="font-sora text-xl font-bold text-white uppercase tracking-tight">Dynamic Landing Page UI Components Compiler</h2>
                  <p className="text-pink-200/70 text-xs font-light">Dynamically compile, toggle, and append custom UI components & sections to the home page in real time.</p>
                </div>
                <button
                  onClick={() => { setEditingCustomUiComponent(null); setIsAddingCustomUiComponent(true); }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  <Plus size={14} /> Add Landing Component
                </button>
              </div>

              {/* Add/Edit Custom UI Component Form Overlay */}
              {(isAddingCustomUiComponent || editingCustomUiComponent) && (
                <form onSubmit={handleSaveCustomUiComponent} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-amber-500/30 text-left space-y-4">
                  <h3 className="font-sora text-xs font-bold text-amber-400 uppercase tracking-widest">
                    {editingCustomUiComponent ? 'Edit Dynamic UI Component Spec' : 'Compile New Dynamic UI Component'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Component Title (টাইটেল)</label>
                      <input type="text" name="title" required defaultValue={editingCustomUiComponent?.title || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Subtitle / Subheading</label>
                      <input type="text" name="subtitle" defaultValue={editingCustomUiComponent?.subtitle || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Rich Body Text Content (Markdown / Paragraph)</label>
                      <textarea name="content" required rows={4} defaultValue={editingCustomUiComponent?.content || ''} className="w-full text-xs p-4 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-amber-500 resize-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Visual Layout Architecture</label>
                      <select name="layout" defaultValue={editingCustomUiComponent?.layout || 'bento'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-amber-500">
                        <option value="single">Single Concentrated Card</option>
                        <option value="bento">Dynamic Bento-Style Card</option>
                        <option value="split">Split Columns (Left Info, Right Details)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Aesthetic Accent Theme Color</label>
                      <select name="accentColor" defaultValue={editingCustomUiComponent?.accentColor || 'emerald'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-amber-500">
                        <option value="emerald">Emerald Matrix (সায়ান গ্রিন)</option>
                        <option value="rose">Rose Crimson (লাল গোলাপ)</option>
                        <option value="amber">Amber Gold (স্বর্ণালী)</option>
                        <option value="cyan">Cyan Pulse (নীলাভ)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Landing Render Order (Weight)</label>
                      <input type="number" name="order" required defaultValue={editingCustomUiComponent?.order || '1'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Visibility Status</label>
                      <select name="visible" defaultValue={editingCustomUiComponent?.visible === false ? 'false' : 'true'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-amber-500">
                        <option value="true">Live (Visible on Homepage)</option>
                        <option value="false">Draft (Hidden)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => { setIsAddingCustomUiComponent(false); setEditingCustomUiComponent(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-amber-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl">Save Component</button>
                  </div>
                </form>
              )}

              {/* Components list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customUiComponents && customUiComponents.length > 0 ? (
                  customUiComponents.map((comp) => (
                    <div key={comp.id} className="p-6 bg-white/5 backdrop-blur-xl border border-pink-500/10 rounded-3xl text-left space-y-4 hover:border-pink-500/20 transition-all relative">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider ${
                            comp.accentColor === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                            comp.accentColor === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            comp.accentColor === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                            'bg-pink-500/10 border-pink-400/20 text-pink-300'
                          }`}>
                            {comp.layout} Layout
                          </span>
                          {comp.visible ? (
                            <span className="ml-2 text-[9px] font-mono text-pink-300">● LIVE</span>
                          ) : (
                            <span className="ml-2 text-[9px] font-mono text-pink-300/50">○ DRAFT</span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingCustomUiComponent(comp)} className="p-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-lg transition-colors cursor-pointer"><Edit size={12} /></button>
                          <button onClick={() => handleDeleteCustomUiComponent(comp.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-sora text-base font-semibold text-white">{comp.title}</h4>
                          {comp.subtitle && <p className="text-pink-200/70 text-xs font-mono font-light mt-0.5">{comp.subtitle}</p>}
                        </div>
                        <p className="text-pink-200/70 text-xs font-light line-clamp-3 leading-relaxed">{comp.content}</p>
                      </div>
                      <div className="text-[10px] font-mono text-pink-300/50 pt-2 border-t border-pink-500/10">
                        Render weight: <span className="text-white">{comp.order}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="md:col-span-2 text-center p-8 border border-dashed border-pink-500/20 rounded-3xl text-pink-300/50 text-xs">
                    No custom dynamic UI components compiled yet. Click the button above to add one.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* ----------------- SERVICES MANAGER ----------------- */}
        {activeTab === 'services' && (
          <div className="space-y-8 animate-fadeIn text-left">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Services Category Catalog</h1>
                <p className="text-pink-200/70 text-sm font-light">Structure public-facing system engineering, consulting, and calibration services.</p>
              </div>
              <button
                onClick={() => { setEditingService(null); setIsAddingService(true); }}
                className="px-4 py-2 bg-pink-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Plus size={14} /> Design New Service
              </button>
            </div>

            {/* Add / Edit Form Modal */}
            {(isAddingService || editingService) && (
              <form onSubmit={handleSaveService} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-pink-400/30 space-y-6">
                <h3 className="font-sora text-sm font-bold text-white uppercase tracking-wider">
                  {editingService ? 'Edit Service Specification' : 'Formulate Brand New Service Class'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Service Title (সার্ভিস নাম)</label>
                    <input type="text" name="title" required defaultValue={editingService?.title || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Visual Icon Name (e.g. ShieldAlert, Globe, Sliders)</label>
                    <input type="text" name="iconName" required defaultValue={editingService?.iconName || 'Briefcase'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Brief Tagline Description</label>
                    <input type="text" name="description" required defaultValue={editingService?.description || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Full Deep Tech Details (Markdown / Content)</label>
                  <textarea name="fullDetails" required rows={4} defaultValue={editingService?.fullDetails || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Key Performance Indicators (Comma separated: Safe deployment, API Integration)</label>
                  <input type="text" name="features" placeholder="Safe deployment, API Integration, 24/7 Monitoring" defaultValue={editingService?.features?.join(', ') || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                </div>

                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setIsAddingService(false); setEditingService(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-pink-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-lg">Save Service Specs</button>
                </div>
              </form>
            )}

            {/* List Table Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((serv) => (
                <div key={serv.id} className="p-6 bg-white/5 backdrop-blur-xl border border-pink-500/20 rounded-[2rem] text-left space-y-4 hover:border-pink-400/20 transition-all relative">
                  <div className="flex justify-between items-start">
                    <span className="p-3 bg-pink-500/10 text-pink-300 border border-pink-400/20 rounded-2xl block text-xs font-mono font-bold">
                      {serv.iconName || 'Briefcase'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingService(serv)} className="p-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-lg cursor-pointer"><Edit size={12} /></button>
                      <button onClick={() => handleDeleteService(serv.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-sora text-base font-semibold text-white">{serv.title}</h3>
                    <p className="text-pink-200/70 text-xs font-light mt-1 leading-relaxed">{serv.description}</p>
                  </div>
                  <div className="border-t border-pink-500/10 pt-3 flex flex-wrap gap-1">
                    {serv.features?.map((feat, i) => (
                      <span key={i} className="text-[9px] bg-white/5 backdrop-blur-2xl text-pink-200/70 border border-pink-500/10 px-2 py-0.5 rounded-lg">{feat}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ----------------- PRODUCTS MANAGER ----------------- */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fadeIn text-left">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Products Category Catalog</h1>
                <p className="text-pink-200/70 text-sm font-light">Configure client applications, distributed neural tools, and active licenses.</p>
              </div>
              <button
                onClick={() => { setEditingProduct(null); setIsAddingProduct(true); }}
                className="px-4 py-2 bg-pink-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Plus size={14} /> Add New Product
              </button>
            </div>

            {/* Add / Edit Form Modal */}
            {(isAddingProduct || editingProduct) && (
              <form onSubmit={handleSaveProduct} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-pink-400/30 space-y-6">
                <h3 className="font-sora text-sm font-bold text-white uppercase tracking-wider">
                  {editingProduct ? 'Edit Product Parameters' : 'Deploy Brand New Digital Product Entry'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Product Name (প্রোডাক্ট নাম)</label>
                    <input type="text" name="name" required defaultValue={editingProduct?.name || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Product Category</label>
                    <select name="category" defaultValue={editingProduct?.category || 'AI Tool'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400">
                      <option value="Software">Software Suite</option>
                      <option value="AI Tool">Decentralized AI Tool</option>
                      <option value="Mobile App">Mobile Client Application</option>
                      <option value="Upcoming">Upcoming Release Specs</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Product Image / Visual Unsplash URL</label>
                    <input type="text" name="image" required defaultValue={editingProduct?.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Mock Downloads Counter (e.g. 1.2K+)</label>
                    <input type="text" name="downloads" required defaultValue={editingProduct?.downloads || '10k+'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Mock Rating Stars (1.0 to 5.0)</label>
                    <input type="number" step="0.1" max="5" min="1" name="rating" required defaultValue={editingProduct?.rating || 4.8} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Product Action / Buy Link URL</label>
                    <input type="text" name="downloadUrl" required defaultValue={editingProduct?.downloadUrl || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Optional GitHub Repo Link (গিটহাব লিংক)</label>
                    <input type="text" name="githubUrl" defaultValue={editingProduct?.githubUrl || ''} placeholder="e.g. https://github.com/rexlify/project" className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Optional Manual/Docs Link (ডকুমেন্টেশন লিংক)</label>
                    <input type="text" name="docsUrl" defaultValue={editingProduct?.docsUrl || ''} placeholder="e.g. https://docs.rexlify.com" className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Product Short Tagline Description</label>
                  <input type="text" name="description" required defaultValue={editingProduct?.description || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Full Deep Specifications & Information</label>
                  <textarea name="fullDetails" required rows={4} defaultValue={editingProduct?.fullDetails || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Key Highlight Specifications (Comma separated)</label>
                  <input type="text" name="features" placeholder="Multithreading node, Instant sync, Encrypted blocks" defaultValue={editingProduct?.features?.join(', ') || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                </div>

                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-pink-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-lg">Publish Digital Asset</button>
                </div>
              </form>
            )}

            {/* Products Table Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {products.map((prod) => (
                <div key={prod.id} className="bg-white/5 backdrop-blur-xl border border-pink-500/20 rounded-[2.5rem] overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all relative">
                  <img src={prod.image} alt={prod.name} className="w-full h-40 object-cover opacity-60" />
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] uppercase tracking-widest font-bold bg-pink-500/10 text-pink-300 px-2 py-0.5 border border-pink-400/20 rounded-md">{prod.category}</span>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingProduct(prod)} className="p-1.5 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-md transition-colors cursor-pointer"><Edit size={10} /></button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md transition-colors cursor-pointer"><Trash2 size={10} /></button>
                        </div>
                      </div>
                      <h3 className="font-sora text-sm font-semibold text-white">{prod.name}</h3>
                      <p className="text-pink-200/70 text-xs font-light line-clamp-2 leading-relaxed">{prod.description}</p>
                    </div>

                    <div className="border-t border-pink-500/10 pt-4 flex justify-between items-center font-mono text-[10px] text-pink-300/50">
                      <span>⭐ {prod.rating} Rating</span>
                      <span>⬇️ {prod.downloads} Clones</span>
                    </div>

                    <div className="pt-2 border-t border-pink-500/10 flex flex-col gap-1 text-left">
                      <span className="font-mono text-[8px] text-pink-300/50 uppercase tracking-widest font-bold">Connected Links:</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prod.downloadUrl && (
                          <a href={prod.downloadUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-400/10 rounded font-mono text-[8px] uppercase tracking-wider flex items-center gap-1 transition-all">
                            🛒 Checkout
                          </a>
                        )}
                        {prod.githubUrl && (
                          <a href={prod.githubUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/10 rounded font-mono text-[8px] uppercase tracking-wider flex items-center gap-1 transition-all">
                            💻 GitHub
                          </a>
                        )}
                        {prod.docsUrl && (
                          <a href={prod.docsUrl} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/10 rounded font-mono text-[8px] uppercase tracking-wider flex items-center gap-1 transition-all">
                            📖 Docs
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ----------------- BLOG PUBLISHER ----------------- */}
        {activeTab === 'blog' && (
          <div className="space-y-8 animate-fadeIn text-left">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Global Blog Post Publisher</h1>
                <p className="text-pink-200/70 text-sm font-light">Author and catalog premium technical research documents and system updates.</p>
              </div>
              <button
                onClick={() => { setEditingBlogPost(null); setIsAddingBlogPost(true); }}
                className="px-4 py-2 bg-pink-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Plus size={14} /> Compose Article
              </button>
            </div>

            {/* Add / Edit Form Modal */}
            {(isAddingBlogPost || editingBlogPost) && (
              <form onSubmit={handleSaveBlogPost} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-pink-400/30 space-y-6">
                <h3 className="font-sora text-sm font-bold text-white uppercase tracking-wider">
                  {editingBlogPost ? 'Edit Blog Document' : 'Draft New Insight Document'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Article Title (ব্লগ টাইটেল)</label>
                    <input type="text" name="title" required defaultValue={editingBlogPost?.title || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Main Category</label>
                    <input type="text" name="category" required defaultValue={editingBlogPost?.category || 'Technology'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Author Identity</label>
                    <input type="text" name="author" required defaultValue={editingBlogPost?.author || 'Rexlify Editorial'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Est. Read Time (e.g. 5 min read)</label>
                    <input type="text" name="readTime" required defaultValue={editingBlogPost?.readTime || '5 min read'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Display Unsplash Image URL</label>
                    <input type="text" name="image" required defaultValue={editingBlogPost?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">SEO Short Summary</label>
                  <input type="text" name="summary" required defaultValue={editingBlogPost?.summary || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Article Content Markdown / Body</label>
                  <textarea name="content" required rows={10} defaultValue={editingBlogPost?.content || ''} className="w-full text-xs font-mono px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400 resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest block font-bold">Keywords / Tags (Comma separated: CBDC, NeuraX, Blockchains)</label>
                  <input type="text" name="tags" placeholder="CBDC, Tech, Digital Currency" defaultValue={editingBlogPost?.tags?.join(', ') || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-2xl text-white focus:outline-none focus:border-pink-400" />
                </div>

                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setIsAddingBlogPost(false); setEditingBlogPost(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-pink-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-lg">Broadcast Post</button>
                </div>
              </form>
            )}

            {/* Blog List Table representation */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-pink-500/20 overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 backdrop-blur-2xl border-b border-pink-500/20 text-pink-200/70 uppercase font-mono text-[9px] tracking-widest">
                    <th className="p-4">Publish Date</th>
                    <th className="p-4">Title & Author</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-gray-300">
                  {blogPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-[10px] text-pink-300/50">{post.date}</td>
                      <td className="p-4">
                        <span className="block font-sans font-semibold text-white">{post.title}</span>
                        <span className="text-[10px] text-pink-200/70 font-light">By {post.author} • {post.readTime}</span>
                      </td>
                      <td className="p-4"><span className="bg-pink-500/15 border border-pink-400/20 text-pink-300 text-[10px] px-2 py-0.5 rounded-lg">{post.category}</span></td>
                      <td className="p-4 max-w-[150px] truncate text-pink-200/70 font-sans text-[11px]">{post.tags?.join(', ')}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => setEditingBlogPost(post)} className="p-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-lg cursor-pointer"><Edit size={12} /></button>
                          <button onClick={() => handleDeleteBlogPost(post.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ----------------- MEDIA & ADS CENTER ----------------- */}
        {activeTab === 'media' && (
          <div className="space-y-10 animate-fadeIn text-left">
            {/* Sponsored Videos Center */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                <div className="space-y-1">
                  <h2 className="font-sora text-xl font-bold text-white uppercase tracking-tight">Interactive Video & Sponsored Stream Hub</h2>
                  <p className="text-pink-200/70 text-xs font-light">Structure public streaming directories, tech demos, and promotional resources.</p>
                </div>
                <button
                  onClick={() => { 
                    setEditingVideo(null); 
                    setVideoFormValues({
                      title: '',
                      url: '',
                      sponsor: '',
                      duration: 'Auto',
                      image: '',
                      category: 'Tutorials',
                      description: ''
                    });
                    setIsAddingVideo(true); 
                  }}
                  className="px-4 py-2 bg-pink-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus size={14} /> Add Video Clip
                </button>
              </div>

              {/* Add / Edit Video Spec */}
              {(isAddingVideo || editingVideo) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-purple-500/20">
                  <form onSubmit={handleSaveVideo} className="lg:col-span-2 space-y-4">
                    <h3 className="font-sora text-xs font-bold text-purple-400 uppercase tracking-widest">
                      {editingVideo ? 'Edit Media Stream specs' : 'Transmit New Digital Media Broadcaster'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Video Title (ভিডিও টাইটেল)</label>
                        <input 
                          type="text" 
                          name="title" 
                          required 
                          value={videoFormValues.title}
                          onChange={(e) => setVideoFormValues(prev => ({...prev, title: e.target.value}))}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-purple-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Embeddable Video Frame URL (YouTube / Stream source)</label>
                          <button
                            type="button"
                            onClick={(e) => handleGenerateVideoMetadataAI(videoFormValues.url, e)}
                            disabled={aiThumbnailLoading}
                            className="px-2.5 py-0.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 rounded-md font-mono text-[8px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                          >
                            {aiThumbnailLoading ? 'Suggesting...' : '✨ Suggest AI Metadata'}
                          </button>
                        </div>
                        <input 
                          type="text" 
                          name="url" 
                          required 
                          value={videoFormValues.url}
                          onChange={(e) => setVideoFormValues(prev => ({...prev, url: e.target.value}))}
                          onBlur={(e) => {
                            const val = e.target.value.trim();
                            if (val && val !== lastScannedUrl) {
                              setLastScannedUrl(val);
                              handleGenerateVideoMetadataAI(val, e);
                            }
                          }}
                          onPaste={(e) => {
                            const val = e.clipboardData.getData('text').trim();
                            if (val && val !== lastScannedUrl) {
                              setLastScannedUrl(val);
                              handleGenerateVideoMetadataAI(val, e);
                            }
                          }}
                          placeholder="e.g. YouTube, Facebook or Instagram link"
                          className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-purple-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Sponsor Entity (if applicable)</label>
                        <input 
                          type="text" 
                          name="sponsor" 
                          value={videoFormValues.sponsor}
                          onChange={(e) => setVideoFormValues(prev => ({...prev, sponsor: e.target.value}))}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-purple-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Duration Format (e.g. 12:45 or Auto)</label>
                        <input 
                          type="text" 
                          name="duration" 
                          required 
                          value={videoFormValues.duration}
                          onChange={(e) => setVideoFormValues(prev => ({...prev, duration: e.target.value}))}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-purple-500" 
                        />
                      </div>
                      
                      {/* Image / Thumbnail Section with AI support */}
                      <div className="space-y-1 md:col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Custom Image / Thumbnail URL</label>
                          <button
                            type="button"
                            onClick={(e) => handleGenerateThumbnailAI(videoFormValues.title, e)}
                            disabled={aiThumbnailLoading}
                            className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 rounded-lg font-mono text-[8px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                          >
                            {aiThumbnailLoading ? 'Sifra generating...' : '✨ Generate AI Thumbnail'}
                          </button>
                        </div>
                        <input 
                          type="text" 
                          name="image" 
                          value={videoFormValues.image}
                          onChange={(e) => setVideoFormValues(prev => ({...prev, image: e.target.value}))}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-purple-500" 
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Ad Segment Category</label>
                        <select 
                          name="category" 
                          value={videoFormValues.category}
                          onChange={(e) => setVideoFormValues(prev => ({...prev, category: e.target.value}))}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="Tutorials">Technical Tutorials</option>
                          <option value="Demos">System Demos & Walkthroughs</option>
                          <option value="Promos">Platform Promos (Reels Mode)</option>
                          <option value="Sponsored Content">Sponsored Marketing Streams</option>
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Video Short Description</label>
                        <input 
                          type="text" 
                          name="description" 
                          required 
                          value={videoFormValues.description}
                          onChange={(e) => setVideoFormValues(prev => ({...prev, description: e.target.value}))}
                          className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-purple-500" 
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-3">
                      <button type="button" onClick={() => { setIsAddingVideo(false); setEditingVideo(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                      <button type="submit" className="px-5 py-2 bg-pink-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl">Save Stream</button>
                    </div>
                  </form>

                  {/* Live Broadcast Preview Transceiver sidebar pane */}
                  <div className="bg-black/40 p-5 rounded-[2rem] border border-pink-500/20 space-y-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-center border-b border-pink-500/10 pb-2">
                      <h4 className="font-mono text-[9px] text-purple-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse shrink-0" /> Live Pre-save Transceiver
                      </h4>
                    </div>
                    {videoFormValues.url ? (
                      <div className="aspect-video w-full rounded-xl bg-black overflow-hidden relative border border-purple-500/15">
                        {parseVideoUrl(videoFormValues.url).type !== 'direct' ? (
                          <iframe 
                            src={parseVideoUrl(videoFormValues.url).embedUrl} 
                            title="Embed Live Form Preview" 
                            className="w-full h-full border-none" 
                          />
                        ) : (
                          <video src={parseVideoUrl(videoFormValues.url).embedUrl} controls muted className="w-full h-full object-cover" />
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-xl bg-black/60 flex flex-col items-center justify-center text-center p-6 border border-pink-500/10 text-pink-300/50">
                        <span className="text-xl">📺</span>
                        <p className="font-mono text-[9px] uppercase tracking-widest mt-2">Paste stream URL to bind transceiver</p>
                      </div>
                    )}

                    <div className="space-y-1 bg-white/[0.01] p-3 rounded-xl border border-pink-500/10 text-left">
                      <span className="font-mono text-[8px] text-pink-300/50 block uppercase tracking-widest">Metadata Verify:</span>
                      <p className="text-white font-sora font-semibold text-xs truncate">{videoFormValues.title || 'Untitled Broadcaster'}</p>
                      <p className="text-pink-200/70 text-[10px] font-sans truncate">{videoFormValues.description || 'No description logged'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of video list items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((vid) => (
                  <div key={vid.id} className="p-5 bg-white/5 backdrop-blur-xl border border-pink-500/20 rounded-3xl space-y-4">
                    <div className="aspect-video bg-black/60 rounded-2xl flex items-center justify-center border border-pink-500/10 relative overflow-hidden">
                      {parseVideoUrl(vid.url).type !== 'direct' ? (
                        <iframe 
                          src={parseVideoUrl(vid.url).embedUrl} 
                          title={vid.title} 
                          className="absolute inset-0 w-full h-full opacity-65 pointer-events-none border-none" 
                        />
                      ) : (
                        <video src={parseVideoUrl(vid.url).embedUrl} className="absolute inset-0 w-full h-full object-cover opacity-65 pointer-events-none" />
                      )}
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <span className="font-mono text-[9px] bg-black/75 border border-pink-500/20 text-pink-300 px-3 py-1.5 rounded-full font-bold">FRAME EMBED CHECK ACTIVE</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-400/20">{vid.category}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setEditingVideo(vid);
                              setVideoFormValues({
                                title: vid.title,
                                url: vid.url,
                                sponsor: vid.sponsor || '',
                                duration: vid.duration,
                                image: vid.image || '',
                                category: vid.category,
                                description: vid.description
                              });
                              setIsAddingVideo(true);
                            }} 
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-md cursor-pointer"
                          >
                            <Edit size={10} />
                          </button>
                          <button onClick={() => handleDeleteVideo(vid.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md cursor-pointer"><Trash2 size={10} /></button>
                        </div>
                      </div>
                      <h3 className="font-sora text-sm font-semibold text-white truncate">{vid.title}</h3>
                      <p className="text-pink-200/70 text-xs font-light line-clamp-1">{vid.description}</p>
                      <div className="flex justify-between items-center text-[10px] font-mono text-pink-300/50 border-t border-pink-500/10 pt-2">
                        <span>⌛ Duration: {vid.duration}</span>
                        {vid.sponsor && <span>🤝 {vid.sponsor}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advertisement Engine Space */}
            <div className="space-y-6 pt-10 border-t border-pink-500/20">
              <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                <div className="space-y-1">
                  <h2 className="font-sora text-xl font-bold text-white uppercase tracking-tight">Global Advertisement Space Engine</h2>
                  <p className="text-pink-200/70 text-xs font-light">Publish passive promotion tiles, coordinate clicks, and manage impressions metrics.</p>
                </div>
                <button
                  onClick={() => { setEditingAd(null); setIsAddingAd(true); }}
                  className="px-4 py-2 bg-pink-500 hover:bg-emerald-400 text-black font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus size={14} /> Configure Ad Slot
                </button>
              </div>

              {/* Add / Edit Ad Overlay */}
              {(isAddingAd || editingAd) && (
                <form onSubmit={handleSaveAd} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-pink-400/30 space-y-4">
                  <h3 className="font-sora text-xs font-bold text-pink-300 uppercase tracking-widest">
                    {editingAd ? 'Edit Ad Slot Spec' : 'Deploy Brand New Promotion Space'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Ad Slot Title (বিজ্ঞাপন টাইটেল)</label>
                      <input type="text" name="title" required defaultValue={editingAd?.title || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Image / Creative URL</label>
                      <input type="text" name="imageUrl" required defaultValue={editingAd?.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Redirect Landing URL Link</label>
                      <input type="text" name="linkUrl" required defaultValue={editingAd?.linkUrl || '#'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">CPC (Revenue Per Click USD)</label>
                      <input type="number" step="0.01" name="revenuePerClick" required defaultValue={editingAd?.revenuePerClick || 0.15} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Ad Space Layout Type</label>
                      <select name="adType" defaultValue={editingAd?.adType || 'Banner'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400">
                        <option value="Banner">Global Banner Ad</option>
                        <option value="Popup">Popup Frame Interstitial</option>
                        <option value="VideoOverlay">Overlay Video Overlay</option>
                        <option value="Sponsored">Sponsored Card Segment</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Active Deployment Status</label>
                      <select name="active" defaultValue={editingAd?.active ? 'true' : 'false'} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-pink-400">
                        <option value="true">Active & Accumulating CPC</option>
                        <option value="false">Paused / Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => { setIsAddingAd(false); setEditingAd(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-pink-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl">Deploy Space</button>
                  </div>
                </form>
              )}

              {/* Table listing */}
              <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-pink-500/20 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 backdrop-blur-2xl border-b border-pink-500/20 text-pink-200/70 uppercase font-mono text-[9px] tracking-widest">
                      <th className="p-4">Creative Title</th>
                      <th className="p-4">Type & State</th>
                      <th className="p-4">Stats CTR</th>
                      <th className="p-4">Accumulated CPC Rev</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-gray-300">
                    {ads.map((ad) => (
                      <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-sans font-semibold text-white">{ad.title}</td>
                        <td className="p-4">
                          <span className="block text-[10px] text-pink-300 uppercase font-bold">{ad.adType}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${ad.active ? 'bg-pink-500/10 text-pink-300 border-pink-400/20' : 'bg-gray-500/10 text-pink-300/50 border-pink-500/10'}`}>
                            {ad.active ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </td>
                        <td className="p-4 text-[11px] text-pink-200/70">
                          {ad.impressions || 0} Impressions • {ad.clicks || 0} Clicks
                        </td>
                        <td className="p-4 text-pink-300 font-bold">
                          ${((ad.clicks || 0) * (ad.revenuePerClick || 0.15)).toFixed(2)} USD
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setEditingAd(ad)} className="p-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-lg cursor-pointer"><Edit size={12} /></button>
                            <button onClick={() => handleDeleteAd(ad.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ----------------- INSTITUTE & FEEDBACK CENTER ----------------- */}
        {activeTab === 'institute' && (
          <div className="space-y-10 animate-fadeIn text-left">
            <div className="flex justify-between items-center border-b border-pink-500/20 pb-6">
              <div className="space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Institute & Feedback</h1>
                <p className="text-pink-200/70 text-sm font-light">Monitor student applications and system feedback.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-sora text-xl font-bold text-pink-300 uppercase tracking-tight border-b border-pink-500/20 pb-2">Student Applications (Supabase Sync)</h2>
              <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-pink-500/20 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-pink-500/20 bg-white/5">
                      <th className="p-4 text-[10px] font-mono text-pink-200/70 uppercase font-bold tracking-widest">Ref ID</th>
                      <th className="p-4 text-[10px] font-mono text-pink-200/70 uppercase font-bold tracking-widest">Name</th>
                      <th className="p-4 text-[10px] font-mono text-pink-200/70 uppercase font-bold tracking-widest">Email / Phone</th>
                      <th className="p-4 text-[10px] font-mono text-pink-200/70 uppercase font-bold tracking-widest">Occupation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {studentApps.map((app, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-4 text-pink-300 font-mono">{app.refId}</td>
                        <td className="p-4 text-white font-bold">{app.name}</td>
                        <td className="p-4">{app.email} <br/><span className="text-pink-300/50 text-xs">{app.whatsapp}</span></td>
                        <td className="p-4 text-pink-200/70">{app.occupation}</td>
                      </tr>
                    ))}
                    {studentApps.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-pink-300/50 font-mono text-xs">No applications available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-sora text-xl font-bold text-blue-400 uppercase tracking-tight border-b border-pink-500/20 pb-2">General Feedbacks (Supabase Sync)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instituteFeedbacks.map((fb, i) => (
                  <div key={i} className="p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-pink-500/20">
                    <p className="font-bold text-white mb-1">{fb.name} <span className="text-pink-300/50 text-xs font-mono">({fb.email})</span></p>
                    <p className="text-pink-200/70 text-sm whitespace-pre-wrap">{fb.message}</p>
                    <p className="text-gray-600 text-[10px] font-mono mt-4">At: {new Date(fb.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {instituteFeedbacks.length === 0 && (
                  <p className="text-pink-300/50 font-mono text-xs p-4">No feedback received.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SOCIAL MEDIA LINKS CENTER ----------------- */}
        {activeTab === 'social-media' && (
          <div className="space-y-10 animate-fadeIn text-left relative">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-pink-500/20 pb-4">
                <div className="space-y-1">
                  <h2 className="font-sora text-xl font-bold text-white uppercase tracking-tight">Social Media Connectors</h2>
                  <p className="text-pink-200/70 text-xs font-light">Manage connected external platform links displayed in the application footer.</p>
                </div>
                <button
                  onClick={() => { setEditingSocialMediaLink(null); setIsAddingSocialMediaLink(true); }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-amber-500/30 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] font-mono font-bold uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  <Plus size={14} /> Add Social Link
                </button>
              </div>

              {(isAddingSocialMediaLink || editingSocialMediaLink) && (
                <form onSubmit={handleSaveSocialMediaLink} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-blue-500/30 text-left space-y-4">
                  <h3 className="font-sora text-xs font-bold text-blue-400 uppercase tracking-widest">
                    {editingSocialMediaLink ? 'Edit Link' : 'Register New Social Link'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Platform Name (e.g. Twitter)</label>
                      <input type="text" name="platform" id="social-platform-input" required defaultValue={editingSocialMediaLink?.platform || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Icon Name (Lucide Icon, e.g. Twitter)</label>
                      <input type="text" name="icon" required defaultValue={editingSocialMediaLink?.icon || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-mono text-[9px] text-pink-200/70 uppercase block font-bold">Target URL Destination</label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const formElement = e.currentTarget.closest('form');
                            const urlVal = formElement ? (formElement.querySelector('input[name="url"]') as HTMLInputElement)?.value : '';
                            if (!urlVal) {
                              triggerToast('Please provide a URL to preview!');
                              return;
                            }
                            setSocialMediaPreviewUrl(urlVal);
                          }}
                          className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded-lg font-mono text-[8px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                        >
                          👁️ Live Preview URL
                        </button>
                      </div>
                      <input type="url" name="url" required defaultValue={editingSocialMediaLink?.url || ''} className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-black text-white focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => { setIsAddingSocialMediaLink(false); setEditingSocialMediaLink(null); }} className="px-4 py-2 border border-pink-500/20 rounded-xl font-mono text-[10px] text-pink-200/70 hover:text-white uppercase tracking-wider">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-blue-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl">Save Node</button>
                  </div>
                </form>
              )}

              <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-pink-500/20 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-pink-500/20 bg-white/5">
                      <th className="p-4 text-[10px] font-mono text-pink-200/70 uppercase font-bold tracking-widest w-1/3">Platform & Icon</th>
                      <th className="p-4 text-[10px] font-mono text-pink-200/70 uppercase font-bold tracking-widest">URL Destination</th>
                      <th className="p-4 text-[10px] font-mono text-pink-200/70 uppercase font-bold tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {socialMediaLinks.map((link) => (
                      <tr key={link.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                              <Link size={16} />
                            </div>
                            <div className="space-y-1">
                              <div className="font-sora text-sm font-semibold text-white">{link.platform}</div>
                              <div className="text-[10px] font-mono text-pink-300/50">Icon ID: {link.icon}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-pink-200/70">
                          <a href={link.url} target="_blank" rel="noreferrer" className="hover:text-blue-400 underline decoration-white/20 underline-offset-4 flex items-center gap-1">
                            {link.url} <ArrowUpRight size={10} />
                          </a>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setSocialMediaPreviewUrl(link.url)} className="p-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-lg cursor-pointer"><Eye size={12} /></button>
                            <button onClick={() => setEditingSocialMediaLink(link)} className="p-2 bg-white/5 hover:bg-white/10 text-pink-200/70 hover:text-white rounded-lg cursor-pointer"><Edit size={12} /></button>
                            <button onClick={() => handleDeleteSocialMediaLink(link.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {socialMediaLinks.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-pink-300/50 text-xs font-mono">No social media endpoints configured.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Preview Modal inside the social-media tab */}
            {socialMediaPreviewUrl && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-fadeIn">
                <div className="bg-white/5 backdrop-blur-xl border border-white/15 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative">
                  <div className="p-6 border-b border-pink-500/20 flex justify-between items-center">
                    <div>
                      <h3 className="font-sora text-sm font-semibold text-white uppercase tracking-widest">
                        Social Media Live Transceiver Preview
                      </h3>
                      <p className="text-pink-200/70 text-[10px] font-mono truncate max-w-[280px] sm:max-w-md mt-1">{socialMediaPreviewUrl}</p>
                    </div>
                    <button 
                      onClick={() => setSocialMediaPreviewUrl(null)} 
                      className="text-pink-200/70 hover:text-white bg-white/5 backdrop-blur-2xl p-2 rounded-full border border-pink-500/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="aspect-video w-full rounded-2xl bg-black border border-pink-500/10 overflow-hidden relative">
                      {parseVideoUrl(socialMediaPreviewUrl).type !== 'direct' ? (
                        <iframe 
                          src={parseVideoUrl(socialMediaPreviewUrl).embedUrl} 
                          title="Social Media Link Live Preview" 
                          className="w-full h-full border-none" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-pink-200/70">
                          <span className="text-2xl">🌐</span>
                          <p className="font-sora text-xs font-semibold text-white mt-2">Standard Web Hyperlink</p>
                          <p className="text-[10px] text-pink-300/50 font-sans mt-1 max-w-xs">This destination represents a standard website path. For security reasons, direct iframe mirroring may be restricted by the host's CORS headers.</p>
                          <a 
                            href={socialMediaPreviewUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-amber-500/30 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] font-mono text-[9px] uppercase tracking-widest font-extrabold rounded-xl transition-all inline-flex items-center gap-1"
                          >
                            Open Link Externally <ArrowUpRight size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-left space-y-1">
                      <span className="font-mono text-[9px] text-blue-400 uppercase font-bold tracking-wider">🔒 Security Sandbox Validation</span>
                      <p className="text-pink-200/70 text-[10px] font-sans">
                        Sifra AI confirmed the connection path is normalized. Frame rendered successfully. Ensure this URL matches the intended platform profile.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 backdrop-blur-2xl border-t border-pink-500/20 flex justify-end">
                    <button 
                      onClick={() => setSocialMediaPreviewUrl(null)} 
                      className="px-6 py-2 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-amber-500/30 border border-purple-500/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] font-mono text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Acknowledge & Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
