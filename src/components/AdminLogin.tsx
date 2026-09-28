/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Sparkles, KeyRound, AlertTriangle, Fingerprint, Users, Crown, Brain } from 'lucide-react';
import { ActiveView } from './Navbar';
import { RexlifyLogo } from './Logo';

interface AdminLoginProps {
  setView: (view: ActiveView) => void;
  onLoginSuccess: (role: 'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin') => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ setView, onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState<'select' | 'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin'>('select');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [lockoutMsg, setLockoutMsg] = useState<string | null>(null);

  // Lockout check
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = localStorage.getItem('rexlify_admin_lockout_until');
      if (lockoutUntil) {
        const timeRemaining = parseInt(lockoutUntil, 10) - Date.now();
        if (timeRemaining > 0) {
          const seconds = Math.ceil(timeRemaining / 1000);
          if (seconds > 3600) {
            setLockoutMsg(`System locked. Try again in ${Math.ceil(seconds / 3600)} hours.`);
          } else if (seconds > 60) {
            setLockoutMsg(`System locked. Try again in ${Math.ceil(seconds / 60)} minutes.`);
          } else {
            setLockoutMsg(`System locked. Try again in ${seconds} seconds.`);
          }
        } else {
          localStorage.removeItem('rexlify_admin_lockout_until');
          setLockoutMsg(null);
        }
      } else {
        setLockoutMsg(null);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutMsg) return;
    if (!password) {
      setErrorMsg('Direct Key requested.');
      return;
    }

    setIsAuthorizing(true);
    setErrorMsg(null);

    setTimeout(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: loginMode, password })
        });
        const data = await response.json();

        if (data.success) {
          // Success
          localStorage.removeItem('rexlify_admin_failed_attempts');
          localStorage.removeItem('rexlify_admin_lockout_until');
          if (loginMode === 'ceo') {
            onLoginSuccess('ceo');
            setView('admin-dashboard');
          } else if (loginMode === 'teacher') {
            onLoginSuccess('teacher');
            setView('teacher-dashboard');
          } else if (loginMode === 'rexlify-ai') {
            onLoginSuccess('rexlify-ai');
            setView('rexlify-ai');
          } else if (loginMode === 'rodp-admin') {
            // Auto-login to RODP as super_admin
            localStorage.setItem('rodp_logged_in', 'true');
            localStorage.setItem('rodp_logged_in_user', JSON.stringify({ role: 'super_admin', name: 'Rizwan Roushan', email: 'rtsuroj@gmail.com' }));
            onLoginSuccess('rodp-admin');
            setView('rodp');
          }
        } else {
          // Handle failed attempts
          let attempts = parseInt(localStorage.getItem('rexlify_admin_failed_attempts') || '0', 10);
          attempts += 1;
          localStorage.setItem('rexlify_admin_failed_attempts', attempts.toString());

          let lockoutDuration = 0;
          if (attempts > 7) lockoutDuration = 24 * 60 * 60 * 1000; // 24 hours
          else if (attempts > 5) lockoutDuration = 60 * 60 * 1000; // 1 hour
          else if (attempts > 3) lockoutDuration = 30 * 1000; // 30 seconds
          else if (attempts > 2) lockoutDuration = 15 * 1000; // 15 seconds

          if (lockoutDuration > 0) {
            localStorage.setItem('rexlify_admin_lockout_until', (Date.now() + lockoutDuration).toString());
            setErrorMsg('Security breach detected. System locked.');
          } else {
            setErrorMsg('Invalid telemetry access token.');
          }
          setIsAuthorizing(false);
        }
      } catch (err) {
        setErrorMsg('Network error connecting to Auth gateway.');
        setIsAuthorizing(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      
      {/* Background Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[80px]" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[200px] w-[200px] rounded-full bg-emerald-500/5 blur-[50px] animate-pulse" />

      <div className="w-full max-w-md bg-[#050505] p-8 md:p-10 rounded-[2.5rem] border border-white/10 space-y-8 relative overflow-hidden shadow-2xl">
        
        {/* Decorative corner brackets or system highlights */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-4">
          <RexlifyLogo size={56} showText={true} layout="vertical" />
          <div className="pt-2">
            <h2 className="font-sora font-semibold text-white text-2xl tracking-tight">
              Control Gateway
            </h2>
            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block mt-2 font-bold">
              REXLIFY AUTHORIZED CHANNELS ONLY
            </span>
          </div>
        </div>

        {loginMode === 'select' ? (
          <div className="space-y-4 pt-4">
            <button
              onClick={() => setLoginMode('ceo')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Crown size={20} className="text-emerald-400" />
              <span>CEO & Founder Login</span>
            </button>
            <button
              onClick={() => setLoginMode('teacher')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Users size={20} className="text-purple-400" />
              <span>Teacher & Faculty Login</span>
            </button>
            <button
              onClick={() => setLoginMode('rexlify-ai')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Brain size={20} className="text-blue-400" />
              <span>Rexlify AI Access</span>
            </button>
            <button
              onClick={() => setLoginMode('rodp-admin')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <ShieldCheck size={20} className="text-amber-400" />
              <span>RODP Admin Panel</span>
            </button>
          </div>
        ) : (
          <>
            {/* Security Alert notice */}
            <div className="p-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/10 text-xs font-light leading-relaxed text-gray-300 flex gap-3 items-start text-left shadow-inner">
              <AlertTriangle size={18} className="text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
              <span>
                You are attempting to access the {loginMode === 'ceo' ? "CEO" : loginMode === 'teacher' ? "Teacher" : loginMode === 'rodp-admin' ? "RODP Admin" : "Rexlify AI"} operational command module. Unauthorized login triggers cryptographic logging.
              </span>
            </div>

            {/* Form controls */}
            {isAuthorizing ? (
              <div className="py-12 flex flex-col items-center gap-6 text-center relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin" />
                  <Lock size={20} className="absolute inset-0 m-auto text-emerald-500 animate-pulse" />
                </div>
                <p className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-bold">
                  DECRYPTING TELEMETRY snap_keys...
                </p>
              </div>
            ) : lockoutMsg ? (
              <div className="py-8 flex flex-col items-center gap-4 text-center">
                <Lock size={48} className="text-red-500" />
                <p className="font-mono text-sm text-red-400 font-bold">{lockoutMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-8 relative z-10">
                <div className="space-y-3 text-left">
                  <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                    Enter {loginMode === 'ceo' ? "CEO" : loginMode === 'teacher' ? "Teacher" : loginMode === 'rodp-admin' ? "RODP Admin" : "Access"} Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      id="admin-auth-password"
                      className="w-full text-sm font-mono px-5 py-4 pl-12 rounded-xl border border-white/10 bg-[#030303] text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                    />
                    <KeyRound size={18} className="absolute left-4 top-4 text-gray-500" />
                  </div>
                </div>

                {errorMsg && (
                  <p className="font-mono text-xs text-red-400 bg-red-500/10 py-3 px-4 rounded-xl border border-red-500/20 text-left shadow-inner">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  id="admin-auth-submit-btn"
                  className="w-full py-4 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono uppercase tracking-widest text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  Verify System Key
                </button>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => setLoginMode('select')} className="text-xs text-emerald-500 hover:text-emerald-400 font-mono underline">
                    Back to Selection
                  </button>
                </div>
              </form>
            )}
          </>
        )}
        
        <div className="pt-6 text-center border-t border-white/10 relative z-10">
          <button
            onClick={() => setView('home')}
            className="text-[10px] font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-bold"
          >
            ← System Home
          </button>
        </div>

      </div>
    </div>
  );
};
