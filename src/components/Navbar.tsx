/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Box, Menu, X, ShieldAlert, Cpu, Globe, Search, Moon, Zap, Sun, LogIn, LogOut, UserCheck, ChevronDown, Check } from 'lucide-react';
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
  | 'admin-login' 
  | 'admin-dashboard'
  | 'image-analyzer'
  | 'institute'
  | 'faculty'
  | 'explore-system'
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
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] px-4 md:px-10 lg:px-16 py-3 transition-colors duration-300">
      {/* Edge-to-Edge Fluid Flex Container */}
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* Logo Brand Trigger */}
        <div className="cursor-pointer shrink-0" onClick={() => handleNavClick('home')}>
          <RexlifyLogo size={36} />
        </div>

          {/* GLOBAL DESKTOP SEARCH BAR COMPONENT */}
          <div className="hidden lg:block relative max-w-md w-72 xl:w-96 focus-within:w-[420px] transition-all duration-300">
            <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-rose-500/50 focus-within:shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all">
              <Search size={14} className="text-gray-500 shrink-0 mr-1.5" />
              <input
                ref={searchRef}
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Query ecosystem..."
                className="bg-transparent text-white text-xs placeholder-gray-500 w-full outline-none border-none py-0.5"
              />
              {!navSearch && (
                <span className="absolute right-2 px-1.5 py-0.5 bg-white/5 text-[8px] font-mono text-gray-500 rounded border border-white/5 pointer-events-none select-none">
                  [/]
                </span>
              )}
            </div>

            {/* Float Dropdown results popover */}
            {isSearchFocused && navSearch && (
              <div className="absolute top-12 left-0 right-0 max-h-96 overflow-y-auto bg-[#05021a]/95 border border-rose-500/20 rounded-2xl shadow-2xl backdrop-blur-lg p-3 z-50 text-left space-y-4 animate-fadeIn no-scrollbar">
                {!hasAnyResults ? (
                  <div className="py-6 text-center text-gray-500 text-xxs font-mono uppercase tracking-widest leading-none">
                    NO PLATFORM CORES MATCHED
                  </div>
                ) : (
                  <>
                    {/* APPS LIST SECTION */}
                    {matchedApps.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-extrabold block px-2 leading-none">
                          System Interfaces
                        </span>
                        {matchedApps.map(app => (
                          <div 
                            key={app.id} 
                            onClick={() => selectAppResult(app.id)}
                            className="p-2 hover:bg-white/[0.03] border border-transparent hover:border-rose-500/10 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 group"
                          >
                            <div className="shrink-0">
                              {app.logo === 'sifra' ? <SifraLogo size={20} /> : app.logo === 'neurax' ? <NeuraxLogo size={20} /> : <span className="text-base">{app.logo}</span>}
                            </div>
                            <div className="text-left leading-tight">
                              <span className="text-white text-xs font-bold font-sora block group-hover:text-rose-400 transition-colors">
                                {highlightMatch(app.name, navSearch)}
                              </span>
                              <span className="text-[9px] text-gray-400 font-light truncate max-w-[200px] block">
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
                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest font-extrabold block px-2 leading-none">
                          Pipeline Milestones
                        </span>
                        {matchedProjects.map(proj => (
                          <div 
                            key={proj.id} 
                            onClick={() => selectProjectResult(proj.name)}
                            className="p-2 hover:bg-white/[0.03] border border-transparent hover:border-rose-500/10 rounded-xl transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-white text-xs font-bold font-sora block group-hover:text-amber-400 transition-colors">
                                {highlightMatch(proj.name, navSearch)}
                              </span>
                              <span className="font-mono text-[8px] text-rose-500 font-bold">{proj.progress}%</span>
                            </div>
                            <span className="text-[9px] text-gray-400 font-light block truncate">
                              {highlightMatch(proj.description, navSearch)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* BLOG POST TRANSMISSIONS */}
                    {matchedBlogs.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-mono text-[8px] text-[#22d3ee] uppercase tracking-widest font-extrabold block px-2 leading-none">
                          Log Transmissions
                        </span>
                        {matchedBlogs.map(post => (
                          <div 
                            key={post.id} 
                            onClick={() => selectBlogResult(post.id)}
                            className="p-2 hover:bg-white/[0.03] border border-transparent hover:border-cyan-500/10 rounded-xl transition-all cursor-pointer group"
                          >
                            <span className="text-[9px] text-gray-500 font-mono block mb-0.5">{post.date}</span>
                            <span className="text-white text-xs font-bold font-sora block group-hover:text-cyan-400 transition-colors leading-tight">
                              {highlightMatch(post.title, navSearch)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* DOCUMENTATION MANUALS */}
                    {matchedDocs.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-mono text-[8px] text-emerald-400 uppercase tracking-widest font-extrabold block px-2 leading-none">
                          Documentation & Guides
                        </span>
                        {matchedDocs.map(doc => (
                          <div 
                            key={doc.id} 
                            onClick={() => selectDocResult(doc.id)}
                            className="p-2 hover:bg-white/[0.03] border border-transparent hover:border-emerald-500/10 rounded-xl transition-all cursor-pointer group"
                          >
                            <span className="text-[8px] font-mono text-emerald-500 uppercase block mb-0.5">{doc.category}</span>
                            <span className="text-white text-xs font-bold font-sora block group-hover:text-emerald-400 transition-colors leading-tight">
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

          {/* Unified Clean Minimal Action Container */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Dynamic Multi-Language Switcher Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                id="navbar-language-switcher-btn"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none text-xs font-semibold ${
                  isLangDropdownOpen 
                    ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                    : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20 text-gray-200'
                }`}
                aria-label="Select Language"
                title="Select Interface Language"
              >
                <Globe size={14} className="text-purple-400 shrink-0" />
                <span className="text-sm leading-none">{currentLangOption.flag}</span>
                <span className="font-mono text-xs font-bold uppercase tracking-wider hidden sm:inline">{currentLangOption.code}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180 text-purple-400' : ''}`} />
              </button>

              {/* Language Dropdown Popover */}
              {isLangDropdownOpen && (
                <div 
                  id="navbar-language-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#07051a]/98 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1"
                >
                  <div className="px-2.5 py-1.5 border-b border-white/5 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                      {t.languageLabel || 'Language'}
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono font-semibold">10 Locales</span>
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
                              ? 'bg-purple-600/15 border border-purple-500/30 text-purple-300 font-bold shadow-sm' 
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
                          {isSelected && <Check size={14} className="text-purple-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Smooth Dark Mode / Light Mode Switcher right next to Language Switcher */}
            <button
              type="button"
              onClick={toggleThemeMode}
              id="navbar-theme-toggle-btn"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/5 hover:border-purple-500/30 text-gray-200 transition-all cursor-pointer select-none text-xs font-semibold"
              aria-label="Toggle Dark/Light Mode"
              title={themeMode === 'neon-cyber' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {themeMode === 'neon-cyber' ? (
                <>
                  <Sun size={14} className="text-amber-400" />
                  <span className="font-mono text-xs font-bold tracking-wider hidden sm:inline text-amber-300">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-purple-400" />
                  <span className="font-mono text-xs font-bold tracking-wider hidden sm:inline text-purple-300">DARK</span>
                </>
              )}
            </button>

            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('admin-dashboard')}
                  id="nav-to-admin-dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-all cursor-pointer"
                >
                  <ShieldAlert size={14} className="animate-pulse" />
                  <span className="hidden md:inline">{t.controlCenter}</span>
                </button>
                <button
                  onClick={onLogout}
                  id="nav-logout-btn"
                  className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleNavClick('institute')}
                  id="nav-rexlify-institute-btn"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 hover:bg-cyan-500/25 hover:text-white transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                >
                  🎓 Rexlify Institute
                </button>
                <button
                  onClick={() => handleNavClick('faculty')}
                  id="nav-join-faculty-btn"
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Teach</span>
                  <span className="bg-amber-400 text-black text-[8px] px-1 rounded font-bold uppercase">
                    Hiring Active
                  </span>
                </button>
                <button
                  onClick={() => handleNavClick('explore-system')}
                  id="nav-explore-our-system"
                  className="hidden md:inline-block px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-200 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 hover:text-white transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  Explore Our System
                </button>
                <button
                  onClick={() => handleNavClick('contact')}
                  id="nav-cta-contact"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {t.contactDev}
                </button>
              </div>
            )}

            {/* Elegant Hamburger Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="hamburg-toggle"
              className={`p-1.5 px-2.5 rounded-xl border transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 ${isOpen ? 'border-purple-500/40 bg-purple-500/5 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-white/5 bg-black/40 text-gray-400 hover:text-white'}`}
              title="Toggle Menu Gateway"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
              <span className="text-[10px] font-mono uppercase tracking-wider hidden sm:inline">MENU</span>
            </button>
          </div>

        </div>

      {/* Drawer / Unified Dropdown Menu (accessible on both desktop and mobile) */}
      {isOpen && (
        <div className="mt-2 mx-auto max-w-7xl rounded-2xl border border-white/10 bg-[#07051a]/98 backdrop-blur-xl px-6 py-6 shadow-2xl flex flex-col gap-6 max-h-[85vh] overflow-y-auto no-scrollbar animate-fadeIn text-left">
          
          {/* MOBILE DIRECT SEARCH BLOCK (Visible only on smaller screens) */}
          <div className="relative w-full lg:hidden">
            <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-500 shrink-0 mr-2" />
              <input
                ref={mobileSearchRef}
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search applications, milestones, logs..."
                className="bg-transparent text-white text-xs placeholder-gray-500 w-full outline-none"
              />
            </div>

            {/* Mobile results display inline */}
            {navSearch && (
              <div className="mt-2 bg-black/30 border border-rose-500/10 rounded-xl p-2.5 text-left space-y-3.5 max-h-60 overflow-y-auto">
                {!hasAnyResults ? (
                  <div className="py-2 text-center text-gray-500 text-[10px] font-mono leading-none">
                    NO PLATFORM CORES MATCHED
                  </div>
                ) : (
                  <>
                    {matchedApps.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block font-extrabold px-1">
                          System Interfaces
                        </span>
                        {matchedApps.map(app => (
                          <div 
                            key={app.id} 
                            onClick={() => selectAppResult(app.id)}
                            className="p-1.5 hover:bg-white/5 border border-transparent rounded-lg flex items-center gap-2 cursor-pointer"
                          >
                            <div className="shrink-0">
                              {app.logo === 'sifra' ? <SifraLogo size={18} /> : app.logo === 'neurax' ? <NeuraxLogo size={18} /> : <span>{app.logo}</span>}
                            </div>
                            <span className="text-white text-xs font-semibold block">{app.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {matchedProjects.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest block font-extrabold px-1">
                          Pipeline Milestones
                        </span>
                        {matchedProjects.map(proj => (
                          <div 
                            key={proj.id} 
                            onClick={() => selectProjectResult(proj.name)}
                            className="p-1.5 hover:bg-white/5 border border-transparent rounded-lg flex justify-between items-center text-xs cursor-pointer"
                          >
                            <span className="text-white font-semibold">{proj.name}</span>
                            <span className="text-[10px] text-rose-500 font-mono font-bold">{proj.progress}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {matchedBlogs.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-mono text-[8px] text-cyan-500 uppercase tracking-widest block font-extrabold px-1">
                          Log Transmissions
                        </span>
                        {matchedBlogs.map(post => (
                          <div 
                            key={post.id} 
                            onClick={() => selectBlogResult(post.id)}
                            className="p-1.5 hover:bg-white/5 border border-transparent rounded-lg text-xs cursor-pointer"
                          >
                            <span className="text-white font-semibold block truncate leading-tight">{post.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="lg:hidden h-px bg-white/10 my-0.5" />

          {/* Unified Grid Layout of Ecosystem Navigation Links */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-[#be123c] font-bold uppercase tracking-[0.2em] block">
              ◆ ECOSYSTEM CHANNELS ◆
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {menuItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    id={`nav-item-mobile-${item.id}`}
                    className={`text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-[#be123c]/10 border-rose-500/40 text-rose-400 pl-5 shadow-inner' 
                        : 'text-gray-400 border-white/5 bg-white/[0.01] hover:text-white hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* Mobile Language Switcher Strip */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-rose-400 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Globe size={12} />
              <span>{t.languageLabel || 'LANGUAGE'} ({currentLangOption.nativeName})</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {SUPPORTED_LANGUAGES.map((opt) => {
                const isSelected = opt.code === language;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setLanguage(opt.code);
                    }}
                    id={`nav-mob-lang-${opt.code}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600/20 border-rose-500/40 text-rose-300 shadow-inner'
                        : 'bg-black/30 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm leading-none">{opt.flag}</span>
                    <span className="truncate text-left">{opt.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-white/5 my-1" />

          {/* External Ecosystem Portals */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-amber-500/80 font-bold uppercase tracking-[0.2em] block">
              ◆ CYBER PORTAL GRIDS ◆
            </span>
            <div className="grid grid-cols-1 gap-3">
              <a
                href="https://rizwan.ai.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all font-bold text-xs flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>NOORAX AI</span>
                </div>
                <span className="font-mono text-[8px] text-emerald-500/60 uppercase group-hover:translate-x-1 transition-transform">LAUNCH →</span>
              </a>
            </div>
          </div>

          {/* User & Admin controls on mobile */}
          <div className="sm:hidden h-px bg-white/5 my-1" />
          
          <div className="sm:hidden flex flex-col gap-2 pt-1">
            {!isAdminLoggedIn && (
              <button
                onClick={() => handleNavClick('dashboard')}
                id="nav-mob-dashboard-btn"
                className="w-full text-center py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-rose-400"
              >
                👤 {t.userPortal}
              </button>
            )}
            <button
              onClick={() => handleNavClick('contact')}
              id="nav-mob-cta"
              className="w-full text-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-amber-600"
            >
              {t.contactDev}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
