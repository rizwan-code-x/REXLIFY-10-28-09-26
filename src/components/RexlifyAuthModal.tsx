/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { registerUser, RegisteredUser } from '../services/userService';

interface RexlifyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: RegisteredUser) => void;
  targetFeatureName?: string;
}

export const RexlifyAuthModal: React.FC<RexlifyAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetFeatureName
}) => {
  // Step: 'welcome' (Screen 1) | 'login' (Screen 2)
  const [step, setStep] = useState<'welcome' | 'login'>('welcome');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus name input when moving to login step
  useEffect(() => {
    if (step === 'login') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('welcome');
      setUserName('');
      setError('');
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegisterClick = () => {
    setError('');
    setStep('login');
  };

  const handleBackClick = () => {
    setError('');
    setStep('welcome');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userName.trim();

    if (!trimmed) {
      setError('Please enter your name to proceed');
      inputRef.current?.focus();
      return;
    }

    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      inputRef.current?.focus();
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Register user in storage and Firebase RTDB
      const user = await registerUser(trimmed);
      setIsSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(user);
        }
        onClose();
      }, 700);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Could not complete registration. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-2 sm:p-4 md:p-8 animate-fadeIn"
      style={{
        background: 'radial-gradient(circle at 50% 40%, #76ace8 0%, #5a94db 45%, #467fc5 100%)'
      }}
    >
      {/* Background Soft Glow Elements */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Exit / Close Button */}
      <button
        onClick={onClose}
        aria-label="Close registration dialog"
        className="absolute top-4 right-4 md:top-8 md:right-8 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/40 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Exit"
      >
        <X size={20} />
      </button>

      {/* Main Container mirroring reference image composition */}
      <div className="relative w-full max-w-5xl h-[620px] md:h-[660px] rounded-[2.5rem] overflow-hidden shadow-[0_25px_70px_rgba(20,55,110,0.35)] border border-white/30 bg-gradient-to-br from-[#6aa2e4] to-[#4c84cb] flex flex-col md:flex-row">
        
        {/* ========================================================================= */}
        {/* SLIDING LAYER 1: CHERRY BLOSSOMS VISUAL */}
        {/* In 'welcome' step: sits on the LEFT (0%) */}
        {/* In 'login' step: smoothly slides to the RIGHT (100%) */}
        {/* ========================================================================= */}
        <div
          className={`absolute top-0 bottom-0 w-full md:w-1/2 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 ${
            step === 'welcome'
              ? 'left-0 translate-x-0'
              : 'left-0 md:translate-x-full'
          }`}
        >
          <div className="relative w-full h-full overflow-hidden">
            {/* The high-fidelity cherry blossom image matching reference image */}
            <img
              src="/assets/aistudio/file_00000000a7808211a732bbb614118a2e_831fd6d6.jpg"
              alt="Cherry blossoms"
              className={`w-full h-full object-cover object-left transition-transform duration-700 ${
                step === 'login' ? 'scale-x-[-1] object-right' : 'scale-x-100'
              }`}
            />
            {/* Soft subtle radial overlay blending with the blue background */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${
                step === 'welcome'
                  ? 'bg-gradient-to-r from-transparent via-transparent to-[#5a94db]/60 md:to-[#5a94db]/80'
                  : 'bg-gradient-to-l from-transparent via-transparent to-[#5a94db]/60 md:to-[#5a94db]/80'
              }`}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SLIDING LAYER 2: TRANSLUCENT GLASSMORPHISM PANEL */}
        {/* In 'welcome' step: sits on the RIGHT */}
        {/* In 'login' step: smoothly slides to the LEFT */}
        {/* ========================================================================= */}
        <div
          className={`absolute top-0 bottom-0 w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-20 ${
            step === 'welcome'
              ? 'left-0 md:translate-x-full'
              : 'left-0 translate-x-0'
          }`}
        >
          {/* Glass Card Container */}
          <div
            className="w-full max-w-[420px] rounded-[2.2rem] p-7 md:p-9 text-white relative overflow-hidden backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(20,60,120,0.25),inset_0_1px_3px_rgba(255,255,255,0.6)]"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)'
            }}
          >
            {/* Inner subtle glow */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[2.2rem]" />

            {/* SCREEN 1: WELCOME SCREEN (Reference-Matched) */}
            {step === 'welcome' && (
              <div className="space-y-6 text-left animate-fadeIn">
                {targetFeatureName && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[11px] font-medium tracking-wide">
                    <Sparkles size={12} className="text-yellow-200" />
                    <span>Accessing: {targetFeatureName}</span>
                  </div>
                )}

                {/* Heading matching reference typography */}
                <div className="space-y-0 leading-tight">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm font-sora">
                    Welcome
                  </h1>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm font-sora">
                    to Rexlify
                  </h1>
                </div>

                {/* Subtitle matching reference verbatim */}
                <p className="text-white/90 text-sm md:text-base font-normal leading-relaxed drop-shadow-sm pt-2">
                  This is the official application page of our website which is professional and premium. To enter, please enter your name and click the register button below.
                </p>

                {/* Lower section with subtle horizontal glass micro-lines and REGISTER button */}
                <div className="pt-6 space-y-4">
                  {/* Subtle glass texture lines */}
                  <div
                    className="w-full h-8 rounded-lg opacity-40 pointer-events-none"
                    style={{
                      background: 'repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 1px, transparent 1px, transparent 6px)'
                    }}
                  />

                  {/* REGISTER Pill Button */}
                  <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="w-full py-4 rounded-full bg-white/25 hover:bg-white/35 active:scale-95 text-white font-extrabold text-sm md:text-base tracking-widest uppercase transition-all duration-300 border border-white/70 shadow-[0_4px_25px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.45)] cursor-pointer text-center block"
                  >
                    REGISTER
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: LOGIN / NAME FORM (Matching Layout & Styling) */}
            {step === 'login' && (
              <form onSubmit={handleFormSubmit} className="space-y-6 text-left animate-fadeIn">
                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors cursor-pointer group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Welcome</span>
                </button>

                {/* Heading */}
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm font-sora">
                    Welcome Back
                  </h2>
                  <p className="text-white/90 text-xs md:text-sm font-normal leading-relaxed">
                    Enter your name to continue to the official Rexlify application page.
                  </p>
                </div>

                {/* Name Input Field */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider">
                    Your Name
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your full name"
                      required
                      autoComplete="name"
                      disabled={isSubmitting || isSuccess}
                      className="w-full px-5 py-3.5 rounded-full bg-white/20 border border-white/60 text-white placeholder-white/60 text-sm md:text-base focus:outline-none focus:bg-white/25 focus:border-white focus:ring-2 focus:ring-white/30 shadow-inner transition-all backdrop-blur-md"
                    />
                  </div>
                  {error && (
                    <p className="text-rose-200 text-xs font-medium pl-3 animate-shake">
                      {error}
                    </p>
                  )}
                </div>

                {/* Lower section with texture and LOGIN button */}
                <div className="pt-4 space-y-4">
                  {/* Subtle glass texture lines */}
                  <div
                    className="w-full h-6 rounded-lg opacity-35 pointer-events-none"
                    style={{
                      background: 'repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0px, rgba(255, 255, 255, 0.2) 1px, transparent 1px, transparent 6px)'
                    }}
                  />

                  {/* Primary LOGIN Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="w-full py-4 rounded-full bg-white/25 hover:bg-white/35 active:scale-95 disabled:opacity-50 text-white font-extrabold text-sm md:text-base tracking-widest uppercase transition-all duration-300 border border-white/70 shadow-[0_4px_25px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.45)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSuccess ? (
                      <>
                        <Check size={18} className="text-emerald-300" />
                        <span>ENTERING...</span>
                      </>
                    ) : isSubmitting ? (
                      <span>SAVING SESSION...</span>
                    ) : (
                      <span>LOGIN</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
