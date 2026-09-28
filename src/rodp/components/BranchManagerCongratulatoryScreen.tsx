import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, Check, Upload, User, Quote, ArrowRight, ShieldCheck, Star, Crown } from 'lucide-react';
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
  
  const [step, setStep] = useState<'form' | 'animation'>(() => {
    // If shop already has profileConfirmed, we shouldn't show this, but we protect here too
    return 'form';
  });

  const [mgrName, setMgrName] = useState(currentUser.name || userShop?.ownerName || '');
  const [mgrBio, setMgrBio] = useState(userShop?.managerBio || 'To provide honest, super-fast digital services to every citizen in our franchise network.');
  const [mgrPhoto, setMgrPhoto] = useState(userShop?.managerPhoto || '');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Default avatars presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
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
  const handleSubmitConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    // Transition to glorious celebration animation
    setStep('animation');
  };

  // Final enter dashboard action
  const handleEnterDashboard = () => {
    if (userShop) {
      updateShop(userShop.id, {
        ownerName: mgrName,
        managerBio: mgrBio,
        managerPhoto: mgrPhoto,
        profileConfirmed: true
      });
      // Set local storage bypass so user does not see it again during active session
      localStorage.setItem(`rodp_profile_confirmed_${userShop.id}`, 'true');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 sm:p-6 select-none font-sans">
      {/* Background ambience sparkles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-lg bg-[#07080c] border border-slate-800/80 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Top decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-amber-500" />
            
            <div className="text-center space-y-3 mb-6 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Crown size={28} className="animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                New Leader Commission Room
              </h2>
              <p className="text-slate-400 text-[11px] max-w-sm mx-auto leading-relaxed">
                Welcome, Commander! Your new branch workspace is ready. Confirm your manager identity credentials to publish your bio to the active franchise board.
              </p>
            </div>

            <form onSubmit={handleSubmitConfirmation} className="space-y-5 text-left">
              {/* Manager Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-500 uppercase tracking-widest font-black block font-mono">
                  Manager Display Name / পূর্ণ নাম
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input
                    type="text"
                    required
                    value={mgrName}
                    onChange={(e) => setMgrName(e.target.value)}
                    placeholder="Enter your professional display name"
                    className="w-full text-xs font-bold py-3 pl-10 pr-4 bg-[#0a0c12] border border-slate-800 rounded-2xl focus:border-amber-500 focus:outline-none text-white placeholder-slate-700"
                  />
                </div>
              </div>

              {/* Bio Description Area */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-amber-500 uppercase tracking-widest font-black block font-mono">
                  Personal Biography / আপনার বাণী
                </label>
                <div className="relative">
                  <Quote className="absolute left-3 top-3 text-slate-600" size={14} />
                  <textarea
                    required
                    rows={3}
                    value={mgrBio}
                    onChange={(e) => setMgrBio(e.target.value)}
                    placeholder="Share a short, warm welcome note or bio quote..."
                    className="w-full text-xs font-semibold py-3 pl-10 pr-4 bg-[#0a0c12] border border-slate-800 rounded-2xl focus:border-amber-500 focus:outline-none text-white placeholder-slate-700 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Photo Upload Frame Selection */}
              <div className="space-y-2">
                <label className="text-[10px] text-amber-500 uppercase tracking-widest font-black block font-mono">
                  Featured profile photo / প্রোফাইল ছবি
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Photo Frame Preview */}
                  <div className="mx-auto sm:mx-0 w-24 h-24 rounded-2xl bg-[#0a0c12] border-2 border-slate-800 flex items-center justify-center relative overflow-hidden group">
                    {mgrPhoto ? (
                      <img src={mgrPhoto} alt="Manager profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center opacity-40">
                        <Upload size={20} className="mx-auto mb-1 text-slate-400" />
                        <span className="text-[8px] font-mono uppercase font-black">Upload</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions & Presets */}
                  <div className="sm:col-span-2 space-y-2.5">
                    {/* File Input */}
                    <label className="block px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center text-[10px] font-black uppercase text-slate-300 hover:text-white transition-all cursor-pointer">
                      <span>{uploadLoading ? 'Processing...' : 'Upload custom photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploadLoading}
                      />
                    </label>

                    {/* Quick Avatar Presets */}
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider mr-1">Presets:</span>
                      {avatarPresets.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setMgrPhoto(url)}
                          className={`w-7 h-7 rounded-full overflow-hidden border transition-all cursor-pointer ${
                            mgrPhoto === url ? 'border-amber-500 scale-110 shadow-md' : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox Confirm */}
              <label className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-900 rounded-2xl cursor-pointer hover:border-slate-850 transition-all">
                <input
                  type="checkbox"
                  required
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-[#0a0c12]"
                />
                <div className="text-[10px] text-slate-400 leading-normal font-semibold">
                  I solemnly confirm my manager profile details and accept operational leadership of <strong>{userShop?.name || 'Assigned Branch'}</strong>.
                </div>
              </label>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={!isConfirmed}
                className={`w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isConfirmed
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer hover:scale-[1.01] active:scale-95'
                    : 'bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>CONFIRM PROFILE & ACTIVATE COMMAND</span>
                <ArrowRight size={13} />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="animation"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md bg-[#040508] border border-amber-500/25 rounded-[36px] p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden space-y-6"
          >
            {/* Spinning background sun rays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />
            
            {/* Crown and glowing particles */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
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
              <span>GREAT LEADER</span>
              <Star size={10} className="fill-amber-400 text-amber-400" />
            </motion.div>

            {/* Featured Profile Photo Frame with Golden Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
              className="relative w-36 h-36 mx-auto"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-indigo-600 animate-spin-slow opacity-80" />
              <div className="absolute inset-1 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                {mgrPhoto ? (
                  <img src={mgrPhoto} alt="Leader" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-700" />
                )}
              </div>
              {/* Absolute golden glow shadow */}
              <div className="absolute inset-0 rounded-full shadow-[0_0_35px_rgba(245,158,11,0.65)] pointer-events-none" />
            </motion.div>

            {/* Manager Name in Gold Gradient text */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="space-y-1 relative z-10"
            >
              <h1 className="text-2xl font-black bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider">
                {mgrName}
              </h1>
              <p className="text-[10px] text-amber-400/80 uppercase font-bold tracking-widest">
                COMMISSIONED BRANCH HEAD
              </p>
            </motion.div>

            {/* Custom Bio Quote Display */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-900/60 max-w-sm mx-auto relative text-center"
            >
              <Quote className="absolute -top-2.5 left-4 text-amber-500/30" size={20} />
              <p className="text-xs italic text-slate-300 font-semibold leading-relaxed">
                "{mgrBio}"
              </p>
            </motion.div>

            {/* Congratulations Custom Msg or defaults */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95 }}
              className="space-y-1"
            >
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-mono">
                Assigned Command Center:
              </span>
              <p className="text-xs font-bold text-slate-200">
                🏢 {userShop?.name || 'Authorized Rizwan Franchise Center'}
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
                onClick={handleEnterDashboard}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ENTER LEADERSHIP WORKSPACE</span>
                <ArrowRight size={14} className="stroke-[3]" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
