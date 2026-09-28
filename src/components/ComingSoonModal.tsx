/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Sparkles, Send, CheckCircle2, Cpu, Shield, Globe } from 'lucide-react';
import { NeuraxLogo, NooraxLogo, RexlifyLogo } from './Logo';
import { useToast } from '../context/ToastContext';

export interface ComingSoonProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  expectedRelease: string;
  statusPercentage: number;
  category: string;
  iconType: 'neurax' | 'noorax' | 'rodp' | 'default';
  highlights: string[];
}

interface ComingSoonModalProps {
  product: ComingSoonProduct | null;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ product, onClose }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  if (!product) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toastError('Invalid Email', 'Please provide a valid email address for release notifications.');
      return;
    }
    setSubscribed(true);
    toastSuccess('Waitlist Registered', `You will be notified as soon as ${product.name} launches!`);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
      onClose();
    }, 2500);
  };

  const renderIcon = () => {
    if (product.iconType === 'neurax') return <NeuraxLogo size={48} />;
    if (product.iconType === 'noorax') return <NooraxLogo size={48} />;
    if (product.iconType === 'rodp') return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-sora font-extrabold text-lg shadow-lg">
        RODP
      </div>
    );
    return <RexlifyLogo size={48} showText={false} />;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#080716] border border-rose-500/30 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.25)] text-white overflow-hidden z-10 my-auto text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer z-20"
          >
            <X size={18} />
          </button>

          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                {renderIcon()}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] uppercase font-bold tracking-widest mb-1">
                  <Clock size={11} className="text-amber-400" />
                  <span>COMING SOON</span>
                </div>
                <h2 className="font-sora text-2xl font-bold text-white leading-tight">
                  {product.name}
                </h2>
                <span className="text-xs text-rose-400 font-mono">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Tagline & Description */}
            <div className="space-y-2">
              <h3 className="font-sora text-sm font-semibold text-gray-200">
                {product.tagline}
              </h3>
              <p className="text-gray-300 text-xs font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-400">Development Readiness</span>
                <span className="text-amber-400 font-bold">{product.statusPercentage}% Target {product.expectedRelease}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${product.statusPercentage}%` }}
                />
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold">
                Key Architectural Highlights
              </span>
              <div className="space-y-1.5">
                {product.highlights.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Waitlist Subscription Box */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <span className="text-xs font-sora font-semibold text-white block">
                Get Early Alpha &amp; Release Access Notification:
              </span>

              {subscribed ? (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Success! You are on the VIP Release Waitlist.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Send size={13} />
                    <span>Notify Me</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
