/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Box, Menu, X, ShieldAlert, Cpu, Globe, Search, Moon, Zap, Sun, LogIn, LogOut, UserCheck, ChevronDown, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { RexlifyLogo, NeuraxLogo, SifraLogo } from './Logo';
import { Language, TRANSLATIONS, SUPPORTED_LANGUAGES, LanguageOption } from '../translations';
import { Application, Project, BlogItem, DocArticle } from '../types';
import { useAuth } from '../context/AuthContext';

export type ActiveView = 
  | 'home' 
  | 'portfolio'
  | 'services'
  | 'products'
  | 'blog'
  | 'showcase' 
  | 'sponsors'
  | 'about' 
  | 'applications' 
  | 'projects' 
  | 'updates' 
  | 'documentation' 
  | 'faq'
  | 'contact' 
  | 'dashboard'
  | 'quantexa'
  | 'privacy'
  | 'terms'
  | 'security-checkpoint'
  | 'admin-login' 
  | 'admin-dashboard'
  | 'image-analyzer'
  | 'institute'
  | 'faculty'
  | 'explore-system'
  | 'additional-systems'
  | 'rexlify-social'
  | 'customer-care'
  | 'help-centre'
  | 'sara-chat'
  | 'sara-voice'
  | 'rodp'
  | 'rexlify-ai'
  | 'rexlify-ai-login'
  | 'sifra'
  | 'neurax'
  | 'rizwan-innovation'
  | 'institute-intro'
  | 'institute-portal'
  | 'teacher-dashboard';

interface NavbarProps {
  currentView: ActiveView;
  setView: (view: ActiveView) => void;
  isAdminLoggedIn: boolean;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  applications: Application[];
  projects: Project[];
  blogPosts: BlogItem[];
  documents?: DocArticle[];
  themeMode: 'deep-space' | 'neon-cyber';
  toggleThemeMode: () => void;
  is3DMode: boolean;
  toggle3DMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setView, 
  isAdminLoggedIn, 
  onLogout,
  language,
  setLanguage,
  applications,
  projects,
  blogPosts,
  documents = [],
  themeMode,
  toggleThemeMode,
  is3DMode,
  toggle3DMode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const t = TRANSLATIONS[language];
  const { user, signInWithGoogle, logout: authLogout } = useAuth();
  
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const isLightMode = themeMode === 'neon-cyber';
  const isHomePage = currentView === 'home';

  const VIEW_TITLES: Partial<Record<ActiveView, string>> = {
    'explore-system': 'Explore Our System',
    'institute': 'Rexlify Institute',
    'faculty': 'Faculty Recruitment (Hiring Active)',
    'institute-intro': 'Institute Introduction',
    'institute-portal': 'Student Portal',
    'teacher-dashboard': 'Teacher Dashboard',
    'portfolio': 'Master Portfolio & Apps',
    'services': 'Engineering Services',
    'products': 'Neural Products',
    'blog': 'Transmissions & Logs',
    'showcase': 'Media Showcase',
    'sponsors': 'Ecosystem Sponsors',
    'about': 'About Rexlify',
    'applications': 'System Applications',
    'projects': 'Roadmap Milestones',
    'updates': 'System Updates',
    'documentation': 'Documentation & Guides',
    'faq': 'Frequently Asked Questions',
    'contact': 'Contact Developer',
    'dashboard': 'User Portal & Cloud Locker',
    'quantexa': 'Quantexa Analytics',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
    'customer-care': 'Customer Care Desk',
    'help-centre': 'Help Centre & Complaints',
    'sara-chat': 'Chat with Sara AI',
    'sara-voice': 'Sara Voice Assistant',
    'image-analyzer': 'Image Analyzer Engine',
    'security-checkpoint': 'Security Checkpoint // Enter Passkey',
    'admin-login': 'Control Gateway // Tier-2',
    'admin-dashboard': 'Control Center',
    'additional-systems': 'Explore Our Additional Systems',
    'rexlify-social': 'Rexlify Social Media (Reels)',
    'rodp': 'RODP Workspace',
    'rexlify-ai': 'Rexlify AI Studio',
    'rexlify-ai-login': 'AI Studio Login',
    'sifra': 'Sifra AI Copilot',
    'neurax': 'NeuraX Edge Network',
    'rizwan-innovation': 'Rizwan Innovation'
  };

  const currentContextTitle = VIEW_TITLES[currentView] || (currentView !== 'home' ? currentView.replace(/-/g, ' ') : '');

  // Lock body scroll when fullscreen menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    if (isLangDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangDropdownOpen]);

  // Helper for highlighting search query matches
  const highlightMatch = (text: string, q: string) => {
    if (!q.trim() || !text) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-rose-500/30 text-rose-300 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // '/' focuses search
      if (e.key === '/' && 
          document.activeElement !== searchRef.current && 
          document.activeElement !== mobileSearchRef.current &&
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (isOpen) {
          mobileSearchRef.current?.focus();
        } else {
          searchRef.current?.focus();
        }
      }
      // 'Escape' closes modal & clears search
      if (e.key === 'Escape') {
        setIsOpen(false);
        setNavSearch('');
        searchRef.current?.blur();
        mobileSearchRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [isOpen]);

  const currentLangOption = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const menuItems: { id: ActiveView; label: string }[] = [
    { id: 'home', label: t.ecoGateway },
    { id: 'additional-systems', label: '📱 Explore Our Additional Systems' },
    { id: 'rexlify-social', label: '🎬 Rexlify Social Media (Reels)' },
    { id: 'portfolio', label: `✨ ${t.portfolio}` },
    { id: 'institute', label: `🎓 Rexlify Institute` },
    { id: 'faculty', label: `💼 Teach at Rexlify (Hiring)` },
    { id: 'image-analyzer', label: `📷 ${t.imageAnalyzer}` },
    { id: 'faq', label: `❓ ${t.faq}` },
    { id: 'services', label: t.services },
    { id: 'products', label: t.products },
    { id: 'blog', label: t.blog },
    { id: 'showcase', label: t.media },
    { id: 'sponsors', label: t.sponsors },
    { id: 'dashboard', label: t.dashboard || t.userPortal },
    { id: 'quantexa', label: t.quantexa },
    { id: 'projects', label: t.roadmap },
    { id: 'updates', label: t.updates },
    { id: 'documentation', label: t.docs },
    { id: 'about', label: t.about },
    { id: 'explore-system', label: '🚀 Explore Our System' },
    { id: 'contact', label: t.contact },
  ];

  const handleNavClick = (view: ActiveView) => {
    try { sessionStorage.setItem('rexlify_user_gesture', 'true'); } catch (_) {}
    setView(view);
    setIsOpen(false);
    setNavSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search calculations inside the active arrays
  const query = navSearch.trim().toLowerCase();
  
  const matchedApps = query ? applications.filter(app => 
    app.name.toLowerCase().includes(query) ||
    app.shortDescription.toLowerCase().includes(query) ||
    app.category.toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchedProjects = query ? projects.filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchedBlogs = query ? blogPosts.filter(b => 
    b.title.toLowerCase().includes(query) ||
    b.summary.toLowerCase().includes(query) ||
    b.category.toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const matchedDocs = query ? documents.filter(d => 
    d.title.toLowerCase().includes(query) ||
    d.content.toLowerCase().includes(query) ||
    d.category.toLowerCase().includes(query)
  ).slice(0, 3) : [];

  const hasAnyResults = matchedApps.length > 0 || matchedProjects.length > 0 || matchedBlogs.length > 0 || matchedDocs.length > 0;

  const selectAppResult = (appId: string) => {
    setView('applications');
    setNavSearch('');
    setIsOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('rexlify-select-app', { detail: { appId } }));
    }, 50);
  };

  const selectProjectResult = (projectName: string) => {
    setView('projects');
    setNavSearch('');
    setIsOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('rexlify-select-project', { detail: { projectName } }));
    }, 50);
  };

  const selectBlogResult = (postId: string) => {
    setView('blog');
    setNavSearch('');
    setIsOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('rexlify-select-blog-post', { detail: { postId } }));
    }, 50);
  };

  const selectDocResult = (docId: string) => {
    setView('documentation');
    setNavSearch('');
    setIsOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('rexlify-select-doc', { detail: { docId } }));
    }, 50);
  };

  return (
    <>
      {/* -------------------- PRIMARY STICKY TOP NAVBAR -------------------- */}
      <nav className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl shadow-lg px-4 md:px-8 lg:px-12 py-2.5 transition-colors duration-300 ${
        isLightMode
          ? 'bg-white/90 border-pink-200/60 shadow-[0_4px_25px_rgba(244,114,182,0.12)]'
          : 'bg-[#0a0a0f]/95 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
      }`}>
        <div className="w-full flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left Side: Brand Logo + Dynamic Context Breadcrumb + Back Button */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Contextual "Back to Main" Button (Visible whenever user is inside a specific feature flow) */}
            {!isHomePage && (
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                id="navbar-back-to-main-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-sora font-semibold cursor-pointer select-none group shrink-0 ${
                  isLightMode
                    ? 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-400/40 text-pink-700 hover:text-pink-900 shadow-sm'
                    : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/40 text-rose-300 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                }`}
                title="Return to Main Homepage"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Back to Main</span>
                <span className="sm:hidden">Back</span>
              </button>
            )}

            {/* Core Brand Identity Logo */}
            <div className="cursor-pointer shrink-0" onClick={() => handleNavClick('home')}>
              <RexlifyLogo size={36} />
            </div>

            {/* Dynamic Feature Context Title Breadcrumb (Only on Feature Pages) */}
            {!isHomePage && currentContextTitle && (
              <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-mono font-bold shrink-0 ${
                isLightMode
                  ? 'bg-white/80 border-pink-300/40 text-gray-800 shadow-sm'
                  : 'bg-white/5 border-white/10 text-gray-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse shrink-0" />
                <span className="tracking-wider uppercase truncate max-w-[220px]">
                  {currentContextTitle}
                </span>
              </div>
            )}
          </div>

          {/* Center: Global Search Bar on Homepage */}
          {isHomePage && (
            <div className="hidden lg:block relative max-w-md w-64 xl:w-96 focus-within:w-[420px] transition-all duration-300">
              <div className={`relative flex items-center border rounded-xl px-3 py-1.5 transition-all ${
                isLightMode
                  ? 'bg-white border-pink-200 focus-within:border-pink-500 focus-within:shadow-[0_0_15px_rgba(244,114,182,0.25)]'
                  : 'bg-black/40 border-white/10 focus-within:border-rose-500/50 focus-within:shadow-[0_0_15px_rgba(244,63,94,0.15)]'
              }`}>
                <Search size={14} className="text-gray-400 shrink-0 mr-1.5" />
                <input
                  ref={searchRef}
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Query ecosystem..."
                  className={`bg-transparent text-xs w-full outline-none border-none py-0.5 ${
                    isLightMode ? 'text-gray-900 placeholder-gray-400 font-semibold' : 'text-white placeholder-gray-500'
                  }`}
                />
                {!navSearch && (
                  <span className="absolute right-2 px-1.5 py-0.5 bg-white/5 text-[8px] font-mono text-gray-400 rounded border border-white/5 pointer-events-none select-none">
                    [/]
                  </span>
                )}
              </div>

              {/* Float Dropdown results popover */}
              {isSearchFocused && navSearch && (
                <div className={`absolute top-12 left-0 right-0 max-h-96 overflow-y-auto border rounded-2xl shadow-2xl backdrop-blur-xl p-3 z-50 text-left space-y-4 animate-fadeIn no-scrollbar ${
                  isLightMode
                    ? 'bg-white/95 border-pink-200 text-gray-900 shadow-pink-500/10'
                    : 'bg-[#05021a]/95 border-rose-500/20 text-white'
                }`}>
                  {!hasAnyResults ? (
                    <div className="py-6 text-center text-gray-400 text-xxs font-mono uppercase tracking-widest leading-none">
                      NO PLATFORM CORES MATCHED
                    </div>
                  ) : (
                    <>
                      {/* APPS LIST SECTION */}
                      {matchedApps.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-mono text-[8px] text-gray-400 uppercase tracking-widest font-extrabold block px-2 leading-none">
                            System Interfaces
                          </span>
                          {matchedApps.map(app => (
                            <div 
                              key={app.id} 
                              onClick={() => selectAppResult(app.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group ${
                                isLightMode ? 'hover:bg-pink-50' : 'hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className="shrink-0">
                                {app.logo === 'sifra' ? <SifraLogo size={20} /> : app.logo === 'neurax' ? <NeuraxLogo size={20} /> : <span className="text-base">{app.logo}</span>}
                              </div>
                              <div className="text-left leading-tight">
                                <span className={`text-xs font-bold font-sora block ${isLightMode ? 'text-gray-900 group-hover:text-pink-600' : 'text-white group-hover:text-rose-400'}`}>
                                  {highlightMatch(app.name, navSearch)}
                                </span>
                                <span className="text-[9px] text-gray-500 font-light truncate max-w-[200px] block">
                                  {highlightMatch(app.shortDescription, navSearch)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ROADMAP TARGET SECTIONS */}
                      {matchedProjects.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-mono text-[8px] text-gray-400 uppercase tracking-widest font-extrabold block px-2 leading-none">
                            Pipeline Milestones
                          </span>
                          {matchedProjects.map(proj => (
                            <div 
                              key={proj.id} 
                              onClick={() => selectProjectResult(proj.name)}
                              className={`p-2 rounded-xl transition-all cursor-pointer group ${
                                isLightMode ? 'hover:bg-pink-50' : 'hover:bg-white/[0.03]'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-0.5">
                                <span className={`text-xs font-bold font-sora block ${isLightMode ? 'text-gray-900 group-hover:text-pink-600' : 'text-white group-hover:text-amber-400'}`}>
                                  {highlightMatch(proj.name, navSearch)}
                                </span>
                                <span className="font-mono text-[8px] text-rose-500 font-bold">{proj.progress}%</span>
                              </div>
                              <span className="text-[9px] text-gray-500 font-light block truncate">
                                {highlightMatch(proj.description, navSearch)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* BLOG POST TRANSMISSIONS */}
                      {matchedBlogs.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-mono text-[8px] text-cyan-600 uppercase tracking-widest font-extrabold block px-2 leading-none">
                            Log Transmissions
                          </span>
                          {matchedBlogs.map(post => (
                            <div 
                              key={post.id} 
                              onClick={() => selectBlogResult(post.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer group ${
                                isLightMode ? 'hover:bg-pink-50' : 'hover:bg-white/[0.03]'
                              }`}
                            >
                              <span className="text-[9px] text-gray-400 font-mono block mb-0.5">{post.date}</span>
                              <span className={`text-xs font-bold font-sora block ${isLightMode ? 'text-gray-900 group-hover:text-cyan-600' : 'text-white group-hover:text-cyan-400'} leading-tight`}>
                                {highlightMatch(post.title, navSearch)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* DOCUMENTATION MANUALS */}
                      {matchedDocs.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-mono text-[8px] text-emerald-600 uppercase tracking-widest font-extrabold block px-2 leading-none">
                            Documentation & Guides
                          </span>
                          {matchedDocs.map(doc => (
                            <div 
                              key={doc.id} 
                              onClick={() => selectDocResult(doc.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer group ${
                                isLightMode ? 'hover:bg-pink-50' : 'hover:bg-white/[0.03]'
                              }`}
                            >
                              <span className="text-[8px] font-mono text-emerald-600 uppercase block mb-0.5">{doc.category}</span>
                              <span className={`text-xs font-bold font-sora block ${isLightMode ? 'text-gray-900 group-hover:text-emerald-600' : 'text-white group-hover:text-emerald-400'} leading-tight`}>
                                {highlightMatch(doc.title, navSearch)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Action Container: Language, Theme Toggle, Clean Menu Gateway */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Multi-Language Switcher Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                id="navbar-language-switcher-btn"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-semibold ${
                  isLightMode
                    ? isLangDropdownOpen 
                      ? 'border-pink-500 bg-pink-100 text-pink-900' 
                      : 'border-pink-200 bg-white/80 hover:bg-pink-50 text-gray-800'
                    : isLangDropdownOpen 
                      ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                      : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20 text-gray-200'
                }`}
                aria-label="Select Language"
                title="Select Interface Language"
              >
                <Globe size={14} className={isLightMode ? "text-pink-600 shrink-0" : "text-purple-400 shrink-0"} />
                <span className="text-sm leading-none">{currentLangOption.flag}</span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline">{currentLangOption.code}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180 text-pink-500' : ''}`} />
              </button>

              {/* Language Dropdown Popover */}
              {isLangDropdownOpen && (
                <div 
                  id="navbar-language-dropdown-menu"
                  className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 animate-fadeIn space-y-1 ${
                    isLightMode
                      ? 'bg-white/98 border-pink-200 text-gray-900 shadow-pink-500/15'
                      : 'bg-[#07051a]/98 border-white/10 text-white'
                  }`}
                >
                  <div className={`px-2.5 py-1.5 border-b flex items-center justify-between ${isLightMode ? 'border-pink-100' : 'border-white/5'}`}>
                    <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                      {t.languageLabel || 'Language'}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold ${isLightMode ? 'text-pink-600' : 'text-purple-400'}`}>10 Locales</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-0.5 no-scrollbar py-1">
                    {SUPPORTED_LANGUAGES.map((opt) => {
                      const isSelected = opt.code === language;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => {
                            setLanguage(opt.code);
                            setIsLangDropdownOpen(false);
                          }}
                          id={`lang-option-${opt.code}`}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isSelected 
                              ? isLightMode
                                ? 'bg-pink-100/80 border border-pink-300 text-pink-900 font-bold'
                                : 'bg-purple-600/15 border border-purple-500/30 text-purple-300 font-bold shadow-sm'
                              : isLightMode
                                ? 'text-gray-700 hover:text-gray-900 hover:bg-pink-50 border border-transparent'
                                : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none">{opt.flag}</span>
                            <div className="text-left leading-tight">
                              <span className="block font-medium">{opt.nativeName}</span>
                              <span className="block text-[9px] text-gray-400 font-normal">{opt.name}</span>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className={isLightMode ? "text-pink-600 shrink-0" : "text-purple-400 shrink-0"} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Smooth Dark Mode / Light Mode Switcher */}
            <button
              type="button"
              onClick={toggleThemeMode}
              id="navbar-theme-toggle-btn"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-semibold ${
                isLightMode
                  ? 'border-pink-200 bg-white/80 hover:bg-pink-50 text-gray-800'
                  : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-purple-500/30 text-gray-200'
              }`}
              aria-label="Toggle Dark/Light Mode"
              title={themeMode === 'neon-cyber' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {themeMode === 'neon-cyber' ? (
                <>
                  <Sun size={14} className="text-amber-500" />
                  <span className="font-mono text-xs font-bold tracking-wider hidden sm:inline text-amber-700">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-purple-400" />
                  <span className="font-mono text-xs font-bold tracking-wider hidden sm:inline text-purple-300">DARK</span>
                </>
              )}
            </button>

            {/* Admin Dashboard link if logged in */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('admin-dashboard')}
                  id="nav-to-admin-dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-500 text-xs font-semibold hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  <ShieldAlert size={14} className="animate-pulse" />
                  <span className="hidden md:inline">{t.controlCenter}</span>
                </button>
                <button
                  onClick={onLogout}
                  id="nav-logout-btn"
                  className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-all cursor-pointer"
                >
                  {t.logout}
                </button>
              </div>
            ) : isHomePage ? (
              /* Persistent CTA Buttons displayed ONLY on Homepage to eliminate clutter on feature pages */
              <div className="hidden lg:flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleNavClick('institute')}
                  id="nav-rexlify-institute-btn"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 hover:bg-cyan-500/25 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  🎓 Rexlify Institute
                </button>
                <button
                  onClick={() => handleNavClick('faculty')}
                  id="nav-join-faculty-btn"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Teach</span>
                  <span className="bg-amber-400 text-black text-[8px] px-1 rounded font-bold uppercase">
                    Hiring Active
                  </span>
                </button>
                <button
                  onClick={() => handleNavClick('explore-system')}
                  id="nav-explore-our-system"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 dark:text-purple-200 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  Explore
                </button>
                <button
                  onClick={() => handleNavClick('additional-systems')}
                  id="nav-cta-additional-systems"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap shadow-md shadow-pink-900/30 flex items-center gap-1.5"
                >
                  <Sparkles size={13} className="text-pink-200 animate-spin" />
                  <span>Explore Our Additional Systems</span>
                </button>
              </div>
            ) : null}

            {/* Essential Hamburger / Fullscreen Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="hamburg-toggle"
              className={`p-1.5 px-3 rounded-xl border transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 ${
                isOpen 
                  ? isLightMode
                    ? 'border-pink-500 bg-pink-100 text-pink-800'
                    : 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                  : isLightMode
                    ? 'border-pink-200 bg-white/80 hover:bg-pink-50 text-gray-800'
                    : 'border-white/10 bg-black/40 text-gray-300 hover:text-white'
              }`}
              title="Toggle Fullscreen Menu Gateway"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
              <span className="text-[10px] font-mono uppercase tracking-wider hidden sm:inline font-bold">MENU</span>
            </button>
          </div>

        </div>
      </nav>

      {/* -------------------- FULLSCREEN TAKEOVER MENU MODAL (ISOLATED VIEW - ZERO UNDERLYING LEAKAGE) -------------------- */}
      {isOpen && (
        <div 
          id="fullscreen-menu-overlay"
          className={`fixed inset-0 z-[9999] w-screen h-screen flex flex-col overflow-y-auto no-scrollbar transition-colors duration-300 animate-fadeIn text-left ${
            isLightMode 
              ? 'bg-gradient-to-br from-[#fff0f5] via-[#ffffff] to-[#ffe4e6] text-[#1a1a1a]'
              : 'bg-[#07051a] text-white'
          }`}
          style={{ opacity: 1 }}
        >
          {/* Top Control Bar of Fullscreen Takeover */}
          <div className={`w-full px-6 md:px-12 py-4 flex items-center justify-between border-b shrink-0 ${
            isLightMode ? 'border-pink-200/80 bg-white/80 backdrop-blur-md' : 'border-white/10 bg-[#07051a]/90 backdrop-blur-md'
          }`}>
            <div className="flex items-center gap-3">
              <div className="cursor-pointer" onClick={() => handleNavClick('home')}>
                <RexlifyLogo size={40} />
              </div>
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-mono uppercase font-bold tracking-widest ${
                isLightMode ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <Sparkles size={12} className={isLightMode ? "text-pink-600" : "text-amber-400"} />
                <span>UNIVERSAL MENU GATEWAY</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle within Menu */}
              <button
                type="button"
                onClick={toggleThemeMode}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  isLightMode
                    ? 'border-pink-300 bg-white hover:bg-pink-50 text-gray-800'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-200'
                }`}
              >
                {isLightMode ? (
                  <>
                    <Sun size={14} className="text-amber-500" />
                    <span>LIGHT</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-purple-400" />
                    <span>DARK</span>
                  </>
                )}
              </button>

              {/* Close Button with ESC label */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                id="fullscreen-menu-close-btn"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer font-mono text-xs font-bold shadow-md ${
                  isLightMode
                    ? 'bg-pink-600 hover:bg-pink-700 border-pink-600 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white shadow-rose-900/40'
                }`}
                title="Close Fullscreen Menu (Esc)"
              >
                <X size={18} />
                <span>CLOSE</span>
                <span className="text-[10px] opacity-75 font-mono hidden sm:inline">[ESC]</span>
              </button>
            </div>
          </div>

          {/* Body Content Container */}
          <div className="max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
            
            {/* Search Ecosystem Input */}
            <div className="space-y-3">
              <div className={`relative flex items-center border rounded-2xl px-4 py-3 shadow-sm ${
                isLightMode 
                  ? 'bg-white border-pink-300/80 focus-within:border-pink-500 shadow-pink-500/10'
                  : 'bg-black/50 border-white/15 focus-within:border-rose-500/60'
              }`}>
                <Search size={18} className={isLightMode ? "text-pink-500 mr-2.5" : "text-gray-400 mr-2.5"} />
                <input
                  ref={mobileSearchRef}
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Search applications, milestones, documentation, blog transmissions..."
                  className={`w-full outline-none text-sm font-sans ${
                    isLightMode ? 'text-[#1a1a1a] placeholder-gray-400 font-semibold' : 'text-white placeholder-gray-400'
                  }`}
                />
                {navSearch && (
                  <button 
                    onClick={() => setNavSearch('')} 
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-mono font-bold text-gray-500"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Live search matching results panel inside Fullscreen takeover */}
              {navSearch && (
                <div className={`p-4 rounded-2xl border space-y-4 max-h-72 overflow-y-auto ${
                  isLightMode 
                    ? 'bg-white/95 border-pink-200 shadow-xl' 
                    : 'bg-black/60 border-white/10 shadow-2xl'
                }`}>
                  {!hasAnyResults ? (
                    <div className="py-4 text-center text-gray-500 text-xs font-mono">
                      NO PLATFORM CORES MATCHED &quot;{navSearch}&quot;
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchedApps.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-mono text-[9px] uppercase tracking-widest font-extrabold text-pink-600 block">
                            System Interfaces
                          </span>
                          {matchedApps.map(app => (
                            <div 
                              key={app.id} 
                              onClick={() => selectAppResult(app.id)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                                isLightMode 
                                  ? 'bg-pink-50/70 border-pink-200 hover:bg-pink-100 text-[#1a1a1a]' 
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                              }`}
                            >
                              <div className="shrink-0">
                                {app.logo === 'sifra' ? <SifraLogo size={22} /> : app.logo === 'neurax' ? <NeuraxLogo size={22} /> : <span>{app.logo}</span>}
                              </div>
                              <div>
                                <span className="font-bold text-xs block">{app.name}</span>
                                <span className="text-[10px] text-gray-500 truncate block max-w-[200px]">{app.shortDescription}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {matchedProjects.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="font-mono text-[9px] uppercase tracking-widest font-extrabold text-amber-600 block">
                            Milestones
                          </span>
                          {matchedProjects.map(proj => (
                            <div 
                              key={proj.id} 
                              onClick={() => selectProjectResult(proj.name)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                isLightMode 
                                  ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100 text-[#1a1a1a]' 
                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                              }`}
                            >
                              <span className="font-bold text-xs">{proj.name}</span>
                              <span className="font-mono text-xs text-rose-500 font-bold">{proj.progress}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Universal Ecosystem Channels Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className={`font-mono text-xs font-extrabold uppercase tracking-[0.2em] flex items-center gap-2 ${
                  isLightMode ? 'text-pink-700' : 'text-rose-400'
                }`}>
                  <Box size={14} />
                  <span>ECOSYSTEM CHANNELS &amp; PORTALS</span>
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  {menuItems.length} Direct Views
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {menuItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      id={`fullscreen-menu-item-${item.id}`}
                      className={`text-left px-4 py-3.5 rounded-2xl text-xs font-semibold transition-all border cursor-pointer flex items-center justify-between group ${
                        isActive 
                          ? isLightMode
                            ? 'bg-pink-100 border-pink-400 text-pink-900 font-bold shadow-md pl-5'
                            : 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-bold shadow-lg pl-5'
                          : isLightMode
                            ? 'bg-white/80 hover:bg-white border-pink-300/60 hover:border-pink-500 text-[#1a1a1a] shadow-sm hover:shadow'
                            : 'bg-white/[0.03] hover:bg-white/10 border-white/10 hover:border-white/20 text-gray-200 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] text-pink-600">→</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Selector Section */}
            <div className="space-y-3">
              <span className={`font-mono text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${
                isLightMode ? 'text-pink-700' : 'text-rose-400'
              }`}>
                <Globe size={14} />
                <span>INTERFACE LANGUAGE ({currentLangOption.nativeName})</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {SUPPORTED_LANGUAGES.map((opt) => {
                  const isSelected = opt.code === language;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setLanguage(opt.code)}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? isLightMode
                            ? 'bg-pink-600 text-white border-pink-600 shadow-md font-bold'
                            : 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-inner'
                          : isLightMode
                            ? 'bg-white/70 hover:bg-white border-pink-200 text-[#1a1a1a]'
                            : 'bg-black/40 border-white/10 text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base leading-none">{opt.flag}</span>
                      <span className="truncate">{opt.nativeName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cyber Portals & External Ecosystem Links */}
            <div className="space-y-3">
              <span className={`font-mono text-xs font-bold uppercase tracking-[0.2em] block ${
                isLightMode ? 'text-amber-800' : 'text-amber-400'
              }`}>
                ◆ CYBER PORTAL GRIDS &bull; EXTERNAL LAUNCHPADS ◆
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://rizwan.ai.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-3 rounded-2xl border transition-all font-bold text-xs flex items-center justify-between group ${
                    isLightMode
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-sm'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>NOORAX AI COGNITIVE CORE</span>
                  </div>
                  <span className="font-mono text-[9px] uppercase group-hover:translate-x-1 transition-transform">LAUNCH →</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleNavClick('explore-system')}
                  className={`px-4 py-3 rounded-2xl border transition-all font-bold text-xs flex items-center justify-between group cursor-pointer ${
                    isLightMode
                      ? 'bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100 shadow-sm'
                      : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                    <span>EXPLORE ALL 26+ INTEGRATED SYSTEMS</span>
                  </div>
                  <span className="font-mono text-[9px] uppercase group-hover:translate-x-1 transition-transform">VIEW →</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Footer inside takeover */}
            <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isLightMode ? 'border-pink-200' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isLightMode
                      ? 'bg-white hover:bg-pink-50 border-pink-300 text-[#1a1a1a]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-rose-300'
                  }`}
                >
                  👤 {t.userPortal}
                </button>
                <button
                  onClick={() => handleNavClick('customer-care')}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isLightMode
                      ? 'bg-white hover:bg-pink-50 border-pink-300 text-[#1a1a1a]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200'
                  }`}
                >
                  🎧 Customer Care Desk
                </button>
              </div>

              <button
                onClick={() => handleNavClick('contact')}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer ${
                  isLightMode
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'
                    : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500'
                }`}
              >
                {t.contactDev}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
