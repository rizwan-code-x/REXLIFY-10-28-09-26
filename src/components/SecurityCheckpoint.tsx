/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, KeyRound, Eye, EyeOff, AlertTriangle, ArrowLeft, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActiveView } from './Navbar';
import { RexlifyLogo } from './Logo';

interface SecurityCheckpointProps {
  setView: (view: ActiveView) => void;
  onPasskeySuccess?: () => void;
}

// Authorized Passkeys (case-sensitive check)
const VALID_PASSKEYS = ['Ruma', 'RRR@007', 'RTX', 'Rexlify@007'];

const STORAGE_ATTEMPTS_KEY = 'rexlify_passkey_attempts';
const STORAGE_LOCKOUT_KEY = 'rexlify_passkey_lockout_until';
const STORAGE_24H_LOCKOUT_KEY = 'rexlify_passkey_24h_lockout_until';
export const SESSION_PASSKEY_AUTH = 'rexlify_passkey_auth';

export const SecurityCheckpoint: React.FC<SecurityCheckpointProps> = ({ setView, onPasskeySuccess }) => {
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Rate limiting / countdown states
  const [attempts, setAttempts] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '0', 10);
    } catch {
      return 0;
    }
  });
  
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const [is24hLocked, setIs24hLocked] = useState<boolean>(false);
  const [lockoutRemainingFormatted, setLockoutRemainingFormatted] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Check existing lockouts on mount and interval
  useEffect(() => {
    const updateLockoutState = () => {
      const now = Date.now();
      
      // Check 24-hour absolute lockout
      const lock24hUntil = localStorage.getItem(STORAGE_24H_LOCKOUT_KEY);
      if (lock24hUntil) {
        const remaining = parseInt(lock24hUntil, 10) - now;
        if (remaining > 0) {
          setIs24hLocked(true);
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setLockoutRemainingFormatted(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
          return;
        } else {
          // Lockout expired
          localStorage.removeItem(STORAGE_24H_LOCKOUT_KEY);
          setIs24hLocked(false);
          setLockoutRemainingFormatted('');
        }
      } else {
        setIs24hLocked(false);
      }

      // Check temporary cooldown timers (15s, 25s, 70s)
      const cooldownUntil = localStorage.getItem(STORAGE_LOCKOUT_KEY);
      if (cooldownUntil) {
        const remaining = parseInt(cooldownUntil, 10) - now;
        if (remaining > 0) {
          const secs = Math.ceil(remaining / 1000);
          setCooldownSeconds(secs);
        } else {
          localStorage.removeItem(STORAGE_LOCKOUT_KEY);
          setCooldownSeconds(0);
        }
      } else {
        setCooldownSeconds(0);
      }
    };

    updateLockoutState();
    const interval = setInterval(updateLockoutState, 1000);
    return () => clearInterval(interval);
  }, []);

  // Autofocus input when not locked
  useEffect(() => {
    if (!is24hLocked && cooldownSeconds === 0 && !isVerifying && !isSuccess) {
      inputRef.current?.focus();
    }
  }, [is24hLocked, cooldownSeconds, isVerifying, isSuccess]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();

    if (is24hLocked || cooldownSeconds > 0 || isVerifying || isSuccess) return;

    const trimmedKey = passkey.trim();
    if (!trimmedKey) {
      setWarningMsg('Please enter a passkey to initiate verification.');
      return;
    }

    setIsVerifying(true);
    setWarningMsg(null);

    setTimeout(() => {
      // Check against authorized keys (case-sensitive check)
      const isValid = VALID_PASSKEYS.includes(trimmedKey);

      if (isValid) {
        // Success Flow
        try {
          sessionStorage.setItem(SESSION_PASSKEY_AUTH, 'true');
          sessionStorage.setItem('rexlify_passkey_timestamp', Date.now().toString());
          // Clear failure record
          localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
          localStorage.removeItem(STORAGE_LOCKOUT_KEY);
          localStorage.removeItem(STORAGE_24H_LOCKOUT_KEY);
        } catch (_) {}

        setIsSuccess(true);
        setIsVerifying(false);

        // Smooth redirect to Control Gateway dashboard
        setTimeout(() => {
          if (onPasskeySuccess) onPasskeySuccess();
          setView('admin-login');
        }, 1200);

      } else {
        // Invalid Passkey Flow with Brute-Force Rate Limiting
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        try {
          localStorage.setItem(STORAGE_ATTEMPTS_KEY, newAttempts.toString());
        } catch (_) {}

        setIsVerifying(false);
        setPasskey('');

        const now = Date.now();

        if (newAttempts >= 7) {
          // 7th failed attempt & beyond: 24 Hours Lockout
          const lock24hMs = 24 * 60 * 60 * 1000;
          const unlockTime = now + lock24hMs;
          localStorage.setItem(STORAGE_24H_LOCKOUT_KEY, unlockTime.toString());
          setIs24hLocked(true);
          setWarningMsg('Terminal Locked: Multiple failed security attempts detected. Access suspended for 24 hours.');
        } else if (newAttempts === 6) {
          // 6th failed attempt: Lock input for 1 minute 10 seconds (70 seconds)
          const lockMs = 70 * 1000;
          localStorage.setItem(STORAGE_LOCKOUT_KEY, (now + lockMs).toString());
          setCooldownSeconds(70);
          setWarningMsg('Security Alert: 6 consecutive failed attempts. Input suspended for 70 seconds.');
        } else if (newAttempts === 5) {
          // 5th failed attempt: Lock input for 25 seconds
          const lockMs = 25 * 1000;
          localStorage.setItem(STORAGE_LOCKOUT_KEY, (now + lockMs).toString());
          setCooldownSeconds(25);
          setWarningMsg('Security Alert: 5 consecutive failed attempts. Input suspended for 25 seconds.');
        } else if (newAttempts === 4) {
          // 4th failed attempt: Lock input for 15 seconds
          const lockMs = 15 * 1000;
          localStorage.setItem(STORAGE_LOCKOUT_KEY, (now + lockMs).toString());
          setCooldownSeconds(15);
          setWarningMsg('Security Alert: 4 consecutive failed attempts. Input suspended for 15 seconds.');
        } else {
          // Attempts 1 to 3: Display standard warning
          setWarningMsg('Invalid Passkey. Please verify your credentials.');
        }
      }
    }, 600);
  };

  const isInputDisabled = is24hLocked || cooldownSeconds > 0 || isVerifying || isSuccess;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 relative overflow-hidden text-left selection:bg-rose-500 selection:text-white">
      
      {/* Dynamic Cyber Glows */}
      <div className="absolute top-1/3 left-1/2 -z-10 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-lg bg-[#07051a]/95 dark:bg-[#07051a]/95 backdrop-blur-2xl p-7 sm:p-10 rounded-[2.5rem] border border-rose-500/30 shadow-[0_20px_60px_rgba(244,63,94,0.15)] relative overflow-hidden text-white checkpoint-modal-box">
        
        {/* Top Hologram Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-cyan-500" />
        
        {/* Navigation Breadcrumb / Escape Route */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Return to Main System</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-mono text-rose-300 font-bold uppercase tracking-wider">
            <ShieldAlert size={12} className="animate-pulse text-rose-400" />
            <span>LAYER 1 GATE</span>
          </div>
        </div>

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3 pt-6 pb-2">
          <div className="relative">
            <RexlifyLogo size={58} />
            <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white rounded-full p-1 border-2 border-[#07051a] shadow-md">
              <Lock size={12} />
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-sora font-extrabold text-xl sm:text-2xl text-white tracking-tight flex items-center justify-center gap-2 flex-wrap">
              <span>Rexlify Security Checkpoint</span>
              <span className="text-rose-400 font-mono text-xs px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30">// Enter Passkey</span>
            </h1>
            <p className="text-gray-400 text-xs font-sans max-w-sm mx-auto leading-relaxed">
              Restricted infrastructure access point. A verified security passkey is required to access the Rexlify Control Center.
            </p>
          </div>
        </div>

        {/* 24-Hour Terminal Lockout Banner */}
        {is24hLocked ? (
          <div className="my-6 p-5 rounded-2xl border-2 border-red-500/50 bg-red-950/40 text-red-200 space-y-3 animate-shake">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <ShieldAlert size={24} className="animate-pulse" />
              </div>
              <div className="text-left">
                <span className="font-mono text-xs uppercase tracking-widest font-extrabold text-red-400 block">
                  SECURITY LOCKDOWN ACTIVE
                </span>
                <p className="text-xs text-red-200 mt-0.5 leading-snug font-medium">
                  Terminal Locked: Multiple failed security attempts detected. Access suspended for 24 hours.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-red-500/20 flex items-center justify-between text-xs font-mono">
              <span className="text-red-400">Lockout Time Remaining:</span>
              <span className="text-white font-bold bg-black/60 px-3 py-1 rounded-lg border border-red-500/40 tracking-wider">
                {lockoutRemainingFormatted || '23:59:59'}
              </span>
            </div>
          </div>
        ) : cooldownSeconds > 0 ? (
          /* Temporary Cooldown Timer Banner */
          <div className="my-6 p-4 rounded-2xl border border-amber-500/40 bg-amber-950/30 text-amber-200 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                <AlertTriangle size={15} className="animate-bounce" />
                <span>Rate-Limit Cooldown Active</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">Attempts: {attempts}/7</span>
            </div>
            <p className="text-xs text-amber-100">
              Input temporarily locked to prevent brute-force intrusion. Please wait for the timer to expire:
            </p>
            <div className="py-2 flex items-center justify-center gap-2">
              <div className="text-2xl font-mono font-extrabold text-amber-400 bg-black/50 px-4 py-1.5 rounded-xl border border-amber-500/40 shadow-inner tracking-widest">
                00:{cooldownSeconds < 10 ? `0${cooldownSeconds}` : cooldownSeconds}s
              </div>
            </div>
          </div>
        ) : null}

        {/* Success State Banner */}
        {isSuccess ? (
          <div className="my-8 py-8 flex flex-col items-center gap-4 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={36} className="animate-scaleUp" />
            </div>
            <div className="space-y-1">
              <h3 className="font-sora font-bold text-lg text-emerald-400">
                Passkey Authenticated
              </h3>
              <p className="font-mono text-xs text-gray-300">
                Clearing checkpoint... Routing to Rexlify Control Gateway.
              </p>
            </div>
          </div>
        ) : (
          /* Authentication Form */
          <form onSubmit={handleVerify} className="space-y-6 pt-4 text-left">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="checkpoint-passkey-input"
                  className="font-mono text-[11px] text-gray-300 uppercase tracking-widest font-semibold flex items-center gap-1.5"
                >
                  <KeyRound size={13} className="text-rose-400" />
                  <span>Authorized Passkey</span>
                </label>
                {attempts > 0 && !is24hLocked && (
                  <span className="font-mono text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Failed Attempts: {attempts}/7
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  id="checkpoint-passkey-input"
                  type={showPasskey ? 'text' : 'password'}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  disabled={isInputDisabled}
                  placeholder={
                    is24hLocked
                      ? 'Access suspended for 24 hours...'
                      : cooldownSeconds > 0
                        ? `Locked (${cooldownSeconds}s cooldown remaining)...`
                        : 'Enter secret passkey (case-sensitive)...'
                  }
                  autoComplete="off"
                  className={`w-full text-sm font-mono px-4 py-3.5 pr-12 rounded-2xl border transition-all shadow-inner outline-none ${
                    isInputDisabled 
                      ? 'bg-black/50 border-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-black/40 border-rose-500/30 text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 placeholder-gray-500'
                  }`}
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPasskey(!showPasskey)}
                  disabled={isInputDisabled}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title={showPasskey ? "Hide passkey" : "Reveal passkey"}
                >
                  {showPasskey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Warning / Error Message */}
            {warningMsg && !is24hLocked && cooldownSeconds === 0 && (
              <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200 text-xs font-sans flex items-start gap-2.5 animate-fadeIn">
                <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{warningMsg}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              id="checkpoint-verify-btn"
              disabled={isInputDisabled}
              className={`w-full py-4 px-6 rounded-2xl font-mono uppercase tracking-widest text-xs sm:text-sm font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                isInputDisabled
                  ? 'bg-gray-800 border border-white/10 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border border-rose-400/40 shadow-rose-900/40 hover:scale-[1.01] active:scale-[0.98]'
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating Credentials...</span>
                </>
              ) : is24hLocked ? (
                <span>Terminal Locked (24H)</span>
              ) : cooldownSeconds > 0 ? (
                <span>Cooldown Active ({cooldownSeconds}s)</span>
              ) : (
                <>
                  <Unlock size={16} />
                  <span>Authorize & Enter Gateway</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Telemetry Footer Note */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
          <span className="flex items-center gap-1.5">
            <Terminal size={12} className="text-cyan-400" />
            <span>ENCRYPTED HASH VAULT</span>
          </span>
          <span className="text-gray-400">
            SEC_VER_3.8
          </span>
        </div>

      </div>
    </div>
  );
};
