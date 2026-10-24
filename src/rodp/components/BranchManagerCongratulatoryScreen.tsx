import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Sparkles, Check, Upload, User, Quote, ArrowRight, ArrowLeft,
  ShieldCheck, Star, Crown, Layout, CheckCircle2, AlertCircle, Camera,
  RefreshCw, X, Shield, Eye, Building2, Phone, Mail, CheckCircle
} from 'lucide-react';
import { Shop, User as UserType } from '../types';

interface BranchManagerCongratulatoryScreenProps {
  theme: 'light' | 'dark';
  currentUser: UserType;
  shops: Shop[];
  updateShop: (id: string, updates: any) => void;
}

export default function BranchManagerCongratulatoryScreen({
  theme,
  currentUser,
  shops,
  updateShop
}: BranchManagerCongratulatoryScreenProps) {
  // Find the shop managed by this user
  const userShop = shops.find(s => s.id === currentUser.shopId || s.customId === currentUser.shopId);
  
  const [step, setStep] = useState<'form' | 'animation'>('form');

  // Multi-window view mode: 'dual' (both windows side-by-side in 16:9), 'win1' (personal dossier), 'win2' (photo & save)
  const [activeWindowTab, setActiveWindowTab] = useState<'dual' | 'win1' | 'win2'>('dual');

  const [mgrName, setMgrName] = useState(currentUser.name || userShop?.ownerName || '');
  const [mgrBio, setMgrBio] = useState(
    userShop?.managerBio || 'To provide honest, super-fast digital services to every citizen in our franchise network.'
  );
  const [mgrPhoto, setMgrPhoto] = useState(userShop?.managerPhoto || '');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formValidationWarning, setFormValidationWarning] = useState<string | null>(null);

  // Default avatars presets
  const avatarPresets = [
    {
      label: 'Executive 1',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80'
    },
    {
      label: 'Executive 2',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80'
    },
    {
      label: 'Executive 3',
      url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80'
    },
    {
      label: 'Executive 4',
      url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=250&auto=format&fit=crop&q=80'
    },
    {
      label: 'Executive 5',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80'
    },
    {
      label: 'Executive 6',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80'
    }
  ];

  // Quick vision quotation suggestions
  const visionSuggestions = [
    'সততা ও সর্বোচ্চ দ্রুততায় নাগরিকদের ফ্র্যাঞ্চাইজি সেবা প্রদান করা।',
    'ডিজিটাল ইন্ডিয়া ও আর ও ডি পি নেটওয়ার্কের বিশ্বস্ত সেবাকেন্দ্র।',
    'প্রতিটি নাগরিকের সরকারি ও অনলাইন আবেদন নির্ভুলভাবে সম্পন্ন করা।'
  ];

  // Handler for image upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMgrPhoto(reader.result as string);
      setUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Submit profile confirmation
  const handleSubmitConfirmation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!mgrName.trim()) {
      setFormValidationWarning('অনুগ্রহ করে ম্যানেজারের পূর্ণ নাম লিখুন (Please enter Manager Name).');
      setActiveWindowTab('win1');
      return;
    }

    if (!isConfirmed) {
      setFormValidationWarning('অনুগ্রহ করে উইন্ডো ২-এর কনফার্মেশন চেকবক্সে টিক দিয়ে দায়িত্ব গ্রহণ করুন।');
      setActiveWindowTab('win2');
      return;
    }

    setFormValidationWarning(null);
    // Transition to glorious celebration animation
    setStep('animation');
  };

  // Final enter dashboard action
  const handleEnterDashboard = () => {
    if (userShop) {
      updateShop(userShop.id, {
        ownerName: mgrName.trim(),
        branchHead: mgrName.trim(),
        managerBio: mgrBio.trim(),
        managerPhoto: mgrPhoto,
        profileConfirmed: true
      });
      // Set local storage bypass so user does not see it again during active session
      localStorage.setItem(`rodp_profile_confirmed_${userShop.id}`, 'true');
    }
  };

  return (
    <div 
      data-lenis-prevent="true"
      className="fixed inset-0 z-[9999] h-screen w-full bg-[#05070d] text-slate-100 flex flex-col overflow-hidden select-auto font-sans"
    >
      {/* Background ambience sparkles & radial glows */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.12),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full min-h-0 w-full relative z-10 overflow-hidden"
          >
            {/* Top decorative gradient bar */}
            <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-500 shrink-0" />
            
            {/* 16:9 EXECUTIVE HEADER BAR */}
            <header className="px-4 sm:px-8 py-3.5 border-b border-white/10 bg-[#080b14]/95 backdrop-blur-md shrink-0 z-30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left Title & Crown */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-amber-400/20 to-indigo-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <Crown size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider border border-amber-500/30">
                      ★ NEW LEADER COMMISSION ROOM
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-indigo-500/30">
                      16:9 Executive Portal
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-0.5 flex items-center gap-2">
                    <span className="text-white drop-shadow-sm">ব্রাঞ্চ ম্যানেজার কমিশন ও প্রোফাইল সেটআপ</span>
                    <span className="text-[10px] text-amber-400 font-mono font-normal">| Leadership Setup</span>
                  </h1>
                </div>
              </div>

              {/* Center Window Switcher Navigation (Dual-Window or Step-By-Step) */}
              <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 shadow-inner max-w-md self-start lg:self-center">
                <button
                  type="button"
                  onClick={() => setActiveWindowTab('dual')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWindowTab === 'dual'
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layout size={13} />
                  <span>১৬:৯ ডুয়েল উইন্ডো (Dual)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWindowTab('win1')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWindowTab === 'win1'
                      ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User size={13} />
                  <span>১. পার্সোনাল ডিটেইলস</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWindowTab('win2')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWindowTab === 'win2'
                      ? 'bg-emerald-600 text-white shadow-md scale-[1.02]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera size={13} />
                  <span>২. ফটো ও সেভ</span>
                </button>
              </div>

              {/* Right Assigned Branch Command Badge */}
              <div className="flex items-center gap-3 self-start lg:self-auto bg-slate-900/60 border border-white/10 px-3.5 py-2 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <Building2 size={16} />
                </div>
                <div className="text-left">
                  <span className="text-[9px] text-slate-400 font-mono uppercase block font-bold">Assigned Command</span>
                  <div className="text-xs font-black text-amber-400 font-mono flex items-center gap-1.5">
                    <span>{userShop?.name || 'Assigned Branch'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      {userShop?.customId || 'HQ'}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Validation warning banner if present */}
            {formValidationWarning && (
              <div className="mx-4 sm:mx-8 mt-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center justify-between gap-3 animate-shake">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  <span>{formValidationWarning}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormValidationWarning(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-rose-300 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* MAIN 16:9 DUAL-WINDOW CONTAINER (FULLY SCROLLABLE, ZERO CLAMPING) */}
            <main 
              data-lenis-prevent="true"
              className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 w-full max-w-[1700px] mx-auto custom-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                
                {/* ========================================================================= */}
                {/* WINDOW 1: বাঁদিকের উইন্ডো (PERSONAL DOSSIER & LEADERSHIP VISION) */}
                {/* ========================================================================= */}
                {(activeWindowTab === 'dual' || activeWindowTab === 'win1') && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 sm:p-7 rounded-[28px] bg-[#090c16]/90 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden"
                  >
                    {/* Top Glow Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-indigo-500" />
                    
                    {/* Window 1 Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm shadow-sm">
                          ১
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                            <span>উইন্ডো ১: ব্যক্তিগত তথ্য ও নেতৃত্ব বাণী</span>
                          </h2>
                          <p className="text-[11px] text-slate-400">
                            Personal Dossier & Official Leadership Credentials
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-amber-400 font-bold uppercase">
                        Step 1 of 2
                      </span>
                    </div>

                    {/* Field 1: Manager Name */}
                    <div className="space-y-2">
                      <label className="text-[11px] text-amber-400 uppercase tracking-widest font-black block font-mono flex items-center justify-between">
                        <span>ম্যানেজার পূর্ণ নাম (Manager Display Name) *</span>
                        <span className="text-[9px] text-slate-500 lowercase">required</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          type="text"
                          required
                          value={mgrName}
                          onChange={(e) => {
                            setMgrName(e.target.value);
                            if (formValidationWarning) setFormValidationWarning(null);
                          }}
                          placeholder="আপনার অফিশিয়াল নাম লিখুন (e.g. Pervez Hossain)"
                          className="w-full text-xs sm:text-sm font-bold py-3.5 pl-11 pr-4 bg-slate-950 border border-slate-800 rounded-2xl focus:border-amber-500 focus:outline-none text-white placeholder-slate-700 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Field 2: Assigned Branch Information Card (Read-only verified) */}
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/5 space-y-3">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Building2 size={13} className="text-amber-400" />
                        <span>অ্যাসাইন্ড ব্রাঞ্চ বিবরণী (Assigned Franchise Center)</span>
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[9px] text-slate-500 font-mono uppercase block">Branch Name:</span>
                          <span className="font-bold text-white font-mono">{userShop?.name || 'Rizwan Online Service'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[9px] text-slate-500 font-mono uppercase block">Franchise ID / Code:</span>
                          <span className="font-bold text-amber-400 font-mono">{userShop?.customId || 'HQ-MAIN'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[9px] text-slate-500 font-mono uppercase block">Official Contact:</span>
                          <span className="font-bold text-slate-300 font-mono">+91 {userShop?.mobile || '9593388785'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[9px] text-slate-500 font-mono uppercase block">Role Level:</span>
                          <span className="font-bold text-emerald-400 font-mono">Commissioned Branch Head</span>
                        </div>
                      </div>
                    </div>

                    {/* Field 3: Bio & Vision Statement */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-amber-400 uppercase tracking-widest font-black block font-mono">
                          নেতৃত্বের বাণী ও ভিশন (Leadership Vision Statement) *
                        </label>
                      </div>
                      <div className="relative">
                        <Quote className="absolute left-3.5 top-3.5 text-slate-600" size={16} />
                        <textarea
                          required
                          rows={4}
                          value={mgrBio}
                          onChange={(e) => setMgrBio(e.target.value)}
                          placeholder="আপনার ব্রাঞ্চ ও গ্রাহকদের উদ্দেশ্যে দিকনির্দেশনামূলক বক্তব্য লিখুন..."
                          className="w-full text-xs font-semibold py-3.5 pl-11 pr-4 bg-slate-950 border border-slate-800 rounded-2xl focus:border-amber-500 focus:outline-none text-white placeholder-slate-700 resize-none leading-relaxed shadow-inner"
                        />
                      </div>

                      {/* Vision Suggestion Pills */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                          💡 দ্রুত ভিশন বেছে নিন (Quick Suggestion Pills):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {visionSuggestions.map((sugg, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setMgrBio(sugg)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-[10px] font-semibold transition-all cursor-pointer text-left"
                            >
                              "{sugg}"
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Leadership Code of Conduct Points */}
                    <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
                      <span className="font-black text-indigo-300 uppercase font-mono text-[10px] flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-indigo-400" />
                        <span>ব্রাঞ্চ প্রধানের মূল অঙ্গীকার (Executive Commitments):</span>
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-slate-300 pl-1">
                        <li className="flex items-center gap-2">
                          <Check size={13} className="text-emerald-400 shrink-0" />
                          <span>প্রতিটি নাগরিককে দ্রুত, সৎ এবং নির্ভরযোগ্য অনলাইন সেবা প্রদান করা।</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={13} className="text-emerald-400 shrink-0" />
                          <span>দৈনিক পেমেন্ট হিসাব ও ক্যাশ লেজার স্বচ্ছতার সাথে সেন্ট্রাল ক্লাউডে সিঙ্ক রাখা।</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={13} className="text-emerald-400 shrink-0" />
                          <span>সিইও নির্দেশিত ফ্র্যাঞ্চাইজি নিরাপত্তা ও গোপনীয়তা বিধি কঠোরভাবে পালন করা।</span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* ========================================================================= */}
                {/* WINDOW 2: ডানদিকের উইন্ডো (PHOTO UPLOAD, LIVE BADGE & FINAL ACTIVATION) */}
                {/* ========================================================================= */}
                {(activeWindowTab === 'dual' || activeWindowTab === 'win2') && (
                  <motion.div
                    id="window-2-container"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 sm:p-7 rounded-[28px] bg-[#090c16]/90 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden scroll-mt-24"
                  >
                    {/* Top Glow Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-amber-500" />

                    {/* Window 2 Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black text-sm shadow-sm">
                          ২
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                            <span>উইন্ডো ২: ফটো আপলোড ও কমান্ড অ্যাক্টিভেশন</span>
                          </h2>
                          <p className="text-[11px] text-slate-400">
                            Photo Upload, Holographic Leader Badge & Save
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-indigo-400 font-bold uppercase">
                        Step 2 of 2
                      </span>
                    </div>

                    {/* Photo Upload & Avatar Picker Box */}
                    <div className="space-y-4 p-5 rounded-2xl bg-slate-950/90 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                          <Camera size={14} />
                          <span>ম্যানেজার অফিশিয়াল ছবি (Executive Photo)</span>
                        </span>
                        {mgrPhoto && (
                          <button
                            type="button"
                            onClick={() => setMgrPhoto('')}
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-mono font-bold cursor-pointer"
                          >
                            রিমুভ করুন (Remove)
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        {/* Photo Circle / Square Preview */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center relative overflow-hidden shadow-xl shrink-0 group">
                          {mgrPhoto ? (
                            <img src={mgrPhoto} alt="Manager" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center opacity-40">
                              <Upload size={24} className="mx-auto mb-1 text-slate-400" />
                              <span className="text-[9px] font-mono uppercase font-black block">No Photo</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[9px] text-white font-mono font-bold">Preview</span>
                          </div>
                        </div>

                        {/* Upload Controls & Preset selector */}
                        <div className="flex-1 space-y-3 w-full">
                          <label className="block w-full py-3 px-4 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-850 hover:to-indigo-900 border border-indigo-500/30 hover:border-amber-500/50 rounded-2xl text-center text-xs font-black uppercase text-white transition-all cursor-pointer shadow-md">
                            <span className="flex items-center justify-center gap-2">
                              <Upload size={14} className="text-amber-400" />
                              <span>{uploadLoading ? 'ছবি প্রসেস হচ্ছে...' : 'কাস্টম ছবি ফাইল নির্বাচন করুন'}</span>
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePhotoUpload}
                              disabled={uploadLoading}
                            />
                          </label>

                          {/* 6 Executive Avatar Presets */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">
                              অথবা প্রিসেট অবতার নির্বাচন করুন:
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              {avatarPresets.map((avatar, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setMgrPhoto(avatar.url)}
                                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative ${
                                    mgrPhoto === avatar.url
                                      ? 'border-amber-400 scale-110 shadow-[0_0_12px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/40'
                                      : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                                  }`}
                                  title={avatar.label}
                                >
                                  <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                                  {mgrPhoto === avatar.url && (
                                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                      <Check size={12} className="text-white drop-shadow font-black" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE 16:9 EXECUTIVE LEADER ID BADGE PREVIEW */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#0a0e1c] to-slate-950 border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-4">
                      {/* Holographic Watermark */}
                      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black flex items-center gap-1.5">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>LIVE EXECUTIVE BADGE PREVIEW (সিটিজেন ভিউ)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold">
                          ✓ LIVE SYNC
                        </span>
                      </div>

                      {/* Card Holographic Body */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-300 to-indigo-600 animate-spin-slow opacity-75" />
                          <div className="absolute inset-0.5 rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                            {mgrPhoto ? (
                              <img src={mgrPhoto} alt="Leader" className="w-full h-full object-cover" />
                            ) : (
                              <User size={30} className="text-slate-600" />
                            )}
                          </div>
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                            <Crown size={12} className="stroke-[3]" />
                          </div>
                        </div>

                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[9px] font-black font-mono text-amber-300">
                            <span>GREAT LEADER</span>
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-white truncate font-sans">
                            {mgrName || 'ম্যানেজারের নাম'}
                          </h3>
                          <p className="text-[10px] text-amber-400/90 font-mono truncate font-bold">
                            🏢 {userShop?.name || 'Assigned Branch'} [{userShop?.customId || 'HQ'}]
                          </p>
                          <p className="text-[10px] text-slate-400 italic line-clamp-2 leading-relaxed pt-0.5">
                            "{mgrBio || 'বিশ্বস্ত ডিজিটাল সেবা...'}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Solemn Responsibility Affirmation Checkbox */}
                    <label className="flex items-start gap-3.5 p-4 bg-slate-950 border border-amber-500/30 rounded-2xl cursor-pointer hover:border-amber-500/60 transition-all select-none group">
                      <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => {
                          setIsConfirmed(e.target.checked);
                          if (formValidationWarning) setFormValidationWarning(null);
                        }}
                        className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-slate-900 checked:border-amber-500"
                      />
                      <div className="text-xs text-slate-200 leading-relaxed font-semibold">
                        আমি সত্যতার সাথে ঘোষণা করছি যে প্রদত্ত সকল তথ্য সঠিক এবং আমি{' '}
                        <strong className="text-amber-400 font-mono">{userShop?.name || 'Assigned Branch'}</strong>-এর
                        শাখা প্রধান হিসেবে দায়িত্ব গ্রহণ করছি।
                      </div>
                    </label>
                  </motion.div>
                )}

              </div>
            </main>

            {/* ========================================================================= */}
            {/* STICKY BOTTOM EXECUTIVE ACTION BAR (NEVER GETS CUT OFF ON ANY DISPLAY!) */}
            {/* ========================================================================= */}
            <footer className="shrink-0 z-40 bg-[#060810]/95 backdrop-blur-xl border-t border-white/10 px-4 sm:px-8 py-3.5 shadow-2xl">
              <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Left: Validation indicator */}
                <div className="flex items-center gap-2.5 text-xs">
                  {isConfirmed && mgrName.trim() ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 size={16} />
                      <span>সকল তথ্য সম্পূর্ণ! আপনি এখন ড্যাশবোর্ডে প্রবেশ করতে পারেন।</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px] sm:text-xs">
                      <AlertCircle size={15} />
                      <span>
                        {!mgrName.trim()
                          ? 'উইন্ডো ১-এ আপনার নাম পূরণ করুন।'
                          : 'উইন্ডো ২-এ কনফার্মেশন বক্সে টিক দিন।'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  {/* Step Switchers if in single-window mode */}
                  {activeWindowTab === 'win2' && (
                    <button
                      type="button"
                      onClick={() => setActiveWindowTab('win1')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>উইন্ডো ১ (তথ্য)</span>
                    </button>
                  )}
                  {activeWindowTab === 'win1' && (
                    <button
                      type="button"
                      onClick={() => setActiveWindowTab('win2')}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>উইন্ডো ২ (ফটো)</span>
                      <ArrowRight size={14} />
                    </button>
                  )}

                  {/* MASTER SAVE BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleSubmitConfirmation()}
                    className={`px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
                      isConfirmed && mgrName.trim()
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}
                  >
                    <ShieldCheck size={16} />
                    <span>সেভ ও অ্যাক্টিভেট করুন (SAVE COMMAND) ➔</span>
                  </button>
                </div>
              </div>
            </footer>
          </motion.div>
        ) : (
          /* ========================================================================= */
          /* GLORIOUS LEADERSHIP CELEBRATION ANIMATION & ENTRANCE SCREEN */
          /* ========================================================================= */
          <motion.div
            key="animation"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-screen w-full relative z-10"
          >
            <div className="w-full max-w-lg bg-[#04060c] border border-amber-500/40 rounded-[36px] p-7 sm:p-9 text-center shadow-[0_0_60px_rgba(245,158,11,0.25)] relative overflow-hidden space-y-6">
              {/* Spinning background sun rays */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_65%)] pointer-events-none" />
              
              {/* Crown and glowing particles */}
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="relative z-10"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center mx-auto shadow-2xl relative">
                  <Crown size={38} className="text-slate-950 animate-bounce" />
                  <div className="absolute inset-0 rounded-full border border-amber-300 animate-ping opacity-25" />
                </div>
              </motion.div>

              {/* Great Leader Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: 'spring', stiffness: 250 }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/30 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-widest relative z-10"
              >
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span>GREAT LEADER COMMISSIONED</span>
                <Star size={10} className="fill-amber-400 text-amber-400" />
              </motion.div>

              {/* Featured Profile Photo Frame with Golden Glow */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-600 animate-spin-slow opacity-80" />
                <div className="absolute inset-1 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                  {mgrPhoto ? (
                    <img src={mgrPhoto} alt="Leader" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-700" />
                  )}
                </div>
                {/* Golden glow shadow */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_35px_rgba(245,158,11,0.65)] pointer-events-none" />
              </motion.div>

              {/* Manager Name in Gold Gradient text */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="space-y-1 relative z-10"
              >
                <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider">
                  {mgrName}
                </h1>
                <p className="text-[10px] text-amber-400/90 uppercase font-bold tracking-widest font-mono">
                  COMMISSIONED BRANCH HEAD • ACTIVE COMMAND
                </p>
              </motion.div>

              {/* Custom Bio Quote Display */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 rounded-2xl bg-slate-950/90 border border-slate-900/80 max-w-sm mx-auto relative text-center"
              >
                <Quote className="absolute -top-2.5 left-4 text-amber-500/30" size={18} />
                <p className="text-xs italic text-slate-300 font-semibold leading-relaxed">
                  "{mgrBio}"
                </p>
              </motion.div>

              {/* Congratulations Branch Details */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
                className="space-y-1"
              >
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                  Assigned Command Center:
                </span>
                <p className="text-xs font-bold text-slate-200 font-mono">
                  🏢 {userShop?.name || 'Authorized Franchise'} [{userShop?.customId || 'HQ'}]
                </p>
              </motion.div>

              {/* Enter Leadership Dashboard Trigger */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="pt-2"
              >
                <button
                  type="button"
                  onClick={handleEnterDashboard}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>ENTER LEADERSHIP WORKSPACE</span>
                  <ArrowRight size={15} className="stroke-[3]" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
