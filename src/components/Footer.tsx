/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  ShieldCheck, Mail, BookOpen, ExternalLink, Cpu, Check, AlertCircle, Box,
  Github, Youtube, Facebook, Instagram
} from 'lucide-react';
import { RexlifyLogo } from './Logo';
import { Rexlify404Modal } from './Rexlify404Modal';
import { ActiveView } from './Navbar';
import { Language, TRANSLATIONS } from '../translations';
import { SocialMediaLink } from '../types';
import { useToast } from '../context/ToastContext';

interface FooterProps {
  setView: (view: ActiveView) => void;
  isAdminLoggedIn: boolean;
  language: Language;
  onAddSubscriber: (email: string) => boolean;
  socialMediaLinks?: SocialMediaLink[];
  is3DMode: boolean;
  toggle3DMode: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  setView, 
  isAdminLoggedIn,
  language,
  onAddSubscriber,
  socialMediaLinks = [],
  is3DMode,
  toggle3DMode
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showGitHub404, setShowGitHub404] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();
  
  const t = TRANSLATIONS[language];

  const handleNav = (view: ActiveView) => {
    setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      toastError('Subscription Failed', 'Please enter a valid email address.');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    const isAdded = onAddSubscriber(email);
    if (isAdded) {
      setStatus('success');
      toastSuccess('Subscribed Successfully!', 'You are now registered for Rexlify security transmissions & updates.');
      setEmail('');
    } else {
      setStatus('error');
      toastError('Already Subscribed', 'This email address is already on our broadcast list.');
    }
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <footer className="relative z-10 w-full mt-24 border-t border-white/5 bg-[#030010]/95 pt-16 pb-12">
      {/* Visual neon light leak */}
      <div className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-[#be123c] to-transparent opacity-40 blur-sm" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* 'Stay Updated' Newsletter Module */}
        <div className="mb-14 rounded-3xl border border-white/5 bg-black/45 p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
          {/* Subtle colored ambient corner bulbs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#be123c]/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#22d3ee]/5 to-transparent rounded-tr-full pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-center relative z-10">
            <div className="lg:col-span-3 space-y-2 text-left">
              <span className="font-mono text-[9px] tracking-widest text-[#be123c] font-bold uppercase block">
                ◆ SECURITY TRANSMISSIONS HUB ◆
              </span>
              <h3 className="font-sora text-lg md:text-xl font-bold text-white uppercase tracking-tight">
                {t.stayUpdated}
              </h3>
              <p className="text-gray-400 text-xs font-light max-w-xl leading-relaxed">
                {t.stayUpdatedDesc}
              </p>
            </div>

            <div className="lg:col-span-2">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.enterEmail}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-900/90 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500/80 font-mono transition-colors"
                />
                <button
                  type="submit"
                  className="golden-transparent-button px-5 py-3 rounded-xl font-mono text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Mail size={13} />
                  {t.subscribeBtn}
                </button>
              </form>

              {/* Instant feedback alerts */}
              {status === 'success' && (
                <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono uppercase tracking-wider animate-fadeIn">
                  <Check size={12} />
                  <span>{t.successSub}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="mt-3 flex items-center gap-1.5 text-rose-500 text-[10px] font-mono uppercase tracking-wider animate-fadeIn">
                  <AlertCircle size={12} />
                  <span>{t.errorSub}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-4">
          
          {/* Brand Info */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="cursor-pointer" onClick={() => handleNav('home')}>
              <RexlifyLogo size={42} />
            </div>
            <p className="text-gray-400 text-xs font-light leading-relaxed font-sans text-left">
              Rizwan's Engineered Next-Generation Logic & Intelligence For Future Yield. A futuristic workspace optimizing client-side computation, secure neural agents and collapsible FAQs.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                ROUTING COMPACT STACK ACTIVE
              </span>
            </div>
          </div>

          {/* Platform Columns */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-sm font-semibold font-sora text-white tracking-wider flex items-center gap-1.5">
              <Cpu size={14} className="text-[#be123c]" />
              {t.ecoGateway}
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
              <li>
                <button onClick={() => handleNav('home')} id="foot-nav-home" className="hover:text-amber-400 tracking-wide transition-colors cursor-pointer text-left">
                  Ecosystem Gateway
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('applications')} id="foot-nav-apps" className="hover:text-amber-400 tracking-wide transition-colors cursor-pointer text-left">
                  Applications Catalog
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('projects')} id="foot-nav-projects" className="hover:text-amber-400 tracking-wide transition-colors cursor-pointer text-left">
                  Future Projects
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('updates')} id="foot-nav-updates" className="hover:text-amber-400 tracking-wide transition-colors cursor-pointer text-left">
                  Release Updates
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Columns */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-sm font-semibold font-sora text-white tracking-wider flex items-center gap-1.5">
              <BookOpen size={14} className="text-amber-500" />
              Resources
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
              <li>
                <button onClick={() => handleNav('documentation')} id="foot-nav-docs" className="hover:text-amber-400 tracking-wide transition-colors cursor-pointer text-left">
                  Documentation Books
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} id="foot-nav-about" className="hover:text-amber-400 tracking-wide transition-colors cursor-pointer text-left">
                  About Rizwan RR
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} id="foot-nav-contact" className="hover:text-amber-400 tracking-wide transition-colors cursor-pointer text-left">
                  Submit Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Official Access */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-sm font-semibold font-sora text-white tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-cyan-500" />
              Infrastructure
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-gray-400">
              <li>
                <button onClick={() => handleNav('privacy')} className="hover:text-cyan-400 tracking-wide transition-colors cursor-pointer text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('terms')} className="hover:text-cyan-400 tracking-wide transition-colors pointer-events-auto cursor-pointer text-left">
                  Terms of Service
                </button>
              </li>
              <li className="mt-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleNav(isAdminLoggedIn ? 'admin-dashboard' : 'admin-login')}
                  id="rexlify-control-center-trigger-btn"
                  className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-red-500/25 bg-red-950/20 text-rose-300 font-mono text-[10px] tracking-widest uppercase hover:bg-rose-950/40 hover:border-red-500/50 transition-all shadow-md shadow-rose-950/20 cursor-pointer"
                >
                  <ShieldCheck size={13} className="text-rose-500 animate-pulse group-hover:rotate-12 transition-transform" />
                  REXLIFY Control Center
                </button>
              </li>
              <li className="mt-3">
                <button
                  onClick={toggle3DMode}
                  id="footer-3d-mode-toggle"
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-mono tracking-widest uppercase transition-all shadow-md cursor-pointer ${
                    is3DMode
                      ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40'
                      : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Box size={13} className={is3DMode ? 'animate-pulse text-emerald-400' : 'text-gray-500'} />
                  3D Mode: {is3DMode ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Closing details */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6">
          <p className="text-[11px] font-mono text-gray-500 font-light text-center lg:text-left">
            &copy; 2026 REXLIFY. Created by Rizwan Roushan Rownaq (Rizwan RR). All rights reserved.
          </p>

          {/* Social & Contact Link Hub */}
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono">
            
            {/* GitHub */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowGitHub404(true);
              }}
              id="footer-social-github"
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-rose-500/40 text-gray-400 hover:text-white hover:bg-rose-500/10 transition-all duration-300 shadow-sm inline-flex items-center justify-center cursor-pointer"
              title="Official GitHub - Rexlify (404 Restricted Archive)"
              aria-label="GitHub"
            >
              <Github size={16} />
            </button>

            {/* YouTube */}
            <a
              href="https://youtube.com/@rizwan-px3vl?si=sjb2yx9QQByo3ROc"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-social-youtube"
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 shadow-sm inline-flex items-center justify-center cursor-pointer"
              title="YouTube Channel"
              aria-label="YouTube"
            >
              <Youtube size={16} />
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1839Jtxgab/"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-social-facebook"
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-blue-500/40 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-300 shadow-sm inline-flex items-center justify-center cursor-pointer"
              title="Facebook Profile / Page"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/rexlifyofficialsupportteam?igsi=em1kaGt5aXh4Znhq"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-social-instagram"
              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-pink-500/40 text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all duration-300 shadow-sm inline-flex items-center justify-center cursor-pointer"
              title="Instagram - @rexlifyofficialsupportteam"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>

            {/* Any additional custom configured admin social links */}
            {socialMediaLinks.filter(l => !['github', 'youtube', 'facebook', 'instagram'].includes(l.platform.toLowerCase())).map((link) => {
              const Icon = (LucideIcons as any)[link.icon] || LucideIcons.Link;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-300 shadow-sm"
                  title={link.platform}
                  aria-label={link.platform}
                >
                  <Icon size={16} />
                </a>
              );
            })}

            {/* Gmail / Support Email Contact */}
            <a
              href="mailto:rexlifyofficialsupportteam@gmail.com"
              id="footer-social-email"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 text-xs text-gray-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-300 font-mono shadow-sm"
              title="Official Support Email"
            >
              <Mail size={14} className="text-amber-400" />
              <span>rexlifyofficialsupportteam@gmail.com</span>
            </a>

          </div>
        </div>

      </div>

      {/* REXLIFY Branded GitHub 404 Modal */}
      <Rexlify404Modal
        isOpen={showGitHub404}
        onClose={() => setShowGitHub404(false)}
        onNavigateHome={() => handleNav('home')}
        onNavigateCatalog={() => handleNav('applications')}
        onNavigatePortfolio={() => handleNav('portfolio')}
      />
    </footer>
  );
};
