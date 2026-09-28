/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  RotateCw, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Volume2, 
  Eye,
  KeyRound,
  X
} from 'lucide-react';

interface SecureExitModalProps {
  isOpen: boolean;
  appName: string;
  onConfirmExit: () => void;
  onCancel: () => void;
}

// Generate 5-character Captcha: exactly 2 digits (0-9) and 3 uppercase letters (A-Z)
export function generate5CharCaptcha(): string {
  const digits = '0123456789';
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous 'I' and 'O' for crystal clarity

  // Pick 2 digits
  const pickedDigits: string[] = [];
  for (let i = 0; i < 2; i++) {
    pickedDigits.push(digits[Math.floor(Math.random() * digits.length)]);
  }

  // Pick 3 letters
  const pickedLetters: string[] = [];
  for (let i = 0; i < 3; i++) {
    pickedLetters.push(letters[Math.floor(Math.random() * letters.length)]);
  }

  // Combine and shuffle
  const combined = [...pickedDigits, ...pickedLetters];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

export const SecureExitModal: React.FC<SecureExitModalProps> = ({
  isOpen,
  appName,
  onConfirmExit,
  onCancel
}) => {
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Generate new captcha on open
  useEffect(() => {
    if (isOpen) {
      const newCode = generate5CharCaptcha();
      setCaptchaCode(newCode);
      setUserInput('');
      setErrorMessage('');
      setIsSuccess(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Draw high-visibility canvas graphic
  useEffect(() => {
    if (!isOpen || !captchaCode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background: Dark cyber slate with high contrast
    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(0, 0, width, height);

    // Subtle background matrix grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // High contrast aesthetic wave curves (do not hide letters)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.bezierCurveTo(width * 0.25, height * 0.2, width * 0.75, height * 0.8, width, height * 0.5);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.3);
    ctx.bezierCurveTo(width * 0.35, height * 0.85, width * 0.65, height * 0.15, width, height * 0.7);
    ctx.stroke();

    // Characters palette - crystal clear high contrast
    const colors = ['#38bdf8', '#fbbf24', '#f472b6', '#4ade80', '#c084fc', '#f87171'];
    const charSpacing = width / (captchaCode.length + 1);

    ctx.textBaseline = 'middle';
    ctx.font = 'bold 36px "Space Grotesk", monospace, sans-serif';

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i];
      const charColor = colors[i % colors.length];
      const x = charSpacing * (i + 1);
      const y = height / 2 + (Math.sin(i * 1.5) * 4);
      const angle = (Math.sin(i * 2) * 8 * Math.PI) / 180; // Gentle tilt: -8 to +8 deg

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Character soft shadow for 3D depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillText(char, 2, 2);

      // Character main fill
      ctx.fillStyle = charColor;
      ctx.fillText(char, 0, 0);

      ctx.restore();
    }
  }, [isOpen, captchaCode]);

  const handleRefresh = () => {
    const newCode = generate5CharCaptcha();
    setCaptchaCode(newCode);
    setUserInput('');
    setErrorMessage('');
    inputRef.current?.focus();
  };

  const handleSpeakCaptcha = () => {
    if ('speechSynthesis' in window && captchaCode) {
      window.speechSynthesis.cancel();
      const textToSpeak = captchaCode.split('').join(' ');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVerifyAndExit = () => {
    const cleaned = userInput.trim().toUpperCase();
    if (!cleaned) {
      setErrorMessage('Please enter the 5-character authorization code.');
      inputRef.current?.focus();
      return;
    }

    if (cleaned === captchaCode) {
      setErrorMessage('');
      setIsSuccess(true);
      setTimeout(() => {
        onConfirmExit();
      }, 500);
    } else {
      setErrorMessage('Incorrect security code. Please check and try again.');
      setUserInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVerifyAndExit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-3xl bg-[#090b14] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 sm:p-7 text-white overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal and stay in workspace"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Lock size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                  WORKSPACE LOCKED
                </span>
                <span className="text-xs text-slate-400 font-mono">Secured Session</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5 font-sora">
                Exit {appName}
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 mb-5 leading-relaxed font-sans">
            You are currently working inside the dedicated <span className="text-cyan-300 font-bold">{appName}</span> environment. Enter the 5-character authorization code below to unlock and return to <span className="text-amber-300 font-bold">Rexlify Hub</span>.
          </p>

          {/* Captcha Canvas Box */}
          <div className="relative mb-4 rounded-2xl border border-white/15 bg-[#0a0d18] overflow-hidden p-2 shadow-inner">
            <div className="flex items-center justify-between px-2 pb-1.5 border-b border-white/5 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <KeyRound size={12} className="text-cyan-400" />
                Security Verification Code (5 Chars)
              </span>
              <span className="text-[10px] text-slate-500">2 digits + 3 letters</span>
            </div>

            <div className="relative flex items-center justify-center py-2">
              <canvas 
                ref={canvasRef} 
                width={260} 
                height={72} 
                className="rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] select-none"
              />
            </div>

            {/* Captcha Controls */}
            <div className="flex items-center justify-between px-2 pt-1 border-t border-white/5">
              <button
                type="button"
                onClick={handleRefresh}
                className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono font-bold py-1 px-2 rounded-lg hover:bg-cyan-500/10 transition-colors cursor-pointer"
                title="Generate a new security code"
              >
                <RotateCw size={13} />
                <span>New Code</span>
              </button>

              {'speechSynthesis' in window && (
                <button
                  type="button"
                  onClick={handleSpeakCaptcha}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono py-1 px-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Listen to captcha code"
                >
                  <Volume2 size={13} />
                  <span>Listen</span>
                </button>
              )}
            </div>
          </div>

          {/* User Input Field */}
          <div className="space-y-2 mb-5">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Enter Code (Caps Auto-formatted):
            </label>
            <input
              ref={inputRef}
              type="text"
              maxLength={5}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                setErrorMessage('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 7K2PQ"
              className="w-full bg-black/60 border-2 border-cyan-500/40 focus:border-cyan-400 rounded-xl px-4 py-3 text-center text-xl font-mono font-extrabold tracking-[0.35em] text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all uppercase"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {errorMessage ? (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-rose-400 text-xs font-mono font-semibold"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            ) : isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold"
              >
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Verification Authorized! Releasing workspace lock...</span>
              </motion.div>
            ) : (
              <p className="text-[10px] text-slate-400 font-mono">
                Press <span className="text-white font-bold">Enter</span> to verify and release the workspace lock.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 text-center"
            >
              Cancel & Stay
            </button>
            <button
              type="button"
              onClick={handleVerifyAndExit}
              disabled={isSuccess}
              className={`w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center shadow-lg ${
                isSuccess
                  ? 'bg-emerald-500 text-black border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black border border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              }`}
            >
              {isSuccess ? (
                <>
                  <Unlock size={14} />
                  <span>Unlocked!</span>
                </>
              ) : (
                <>
                  <ArrowLeft size={14} />
                  <span>Verify & Exit</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
