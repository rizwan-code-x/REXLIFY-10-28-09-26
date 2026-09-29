/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Sparkles, KeyRound, AlertTriangle, Fingerprint, 
  Users, Crown, Brain, ArrowLeft, LogOut, ChevronRight, GraduationCap, 
  Terminal, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { ActiveView } from './Navbar';
import { RexlifyLogo } from './Logo';
import { SecurityCheckpoint, SESSION_PASSKEY_AUTH } from './SecurityCheckpoint';

interface AdminLoginProps {
  setView: (view: ActiveView) => void;
  onLoginSuccess: (role: 'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin') => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ setView, onLoginSuccess }) => {
  const [hasPasskeyAccess, setHasPasskeyAccess] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_PASSKEY_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [loginMode, setLoginMode] = useState<'select' | 'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin'>('select');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [lockoutMsg, setLockoutMsg] = useState<string | null>(null);

  // If passkey session token is absent, intercept and present Security Checkpoint first
  if (!hasPasskeyAccess) {
    return (
      <SecurityCheckpoint 
        setView={setView} 
        onPasskeySuccess={() => setHasPasskeyAccess(true)} 
      />
    );
  }

  // Lockout check for secondary layer
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
            localStorage.setItem('rodp_logged_in', 'true');
            localStorage.setItem('rodp_logged_in_user', JSON.stringify({ role: 'super_admin', name: 'Rizwan RR (CEO)', email: 'rizwanroushan0@gmail.com' }));
            localStorage.setItem('rodp_target_tab', 'super_admin_panel');
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
            localStorage.setItem('rodp_logged_in_user', JSON.stringify({ role: 'super_admin', name: 'Rizwan RR (CEO)', email: 'rizwanroushan0@gmail.com' }));
            localStorage.setItem('rodp_target_tab', 'super_admin_panel');
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
    }, 1200);
  };

  const handleLockSession = () => {
    try {
      sessionStorage.removeItem(SESSION_PASSKEY_AUTH);
    } catch (_) {}
    setHasPasskeyAccess(false);
    setView('home');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 relative overflow-hidden text-left selection:bg-rose-500 selection:text-white">
      
      {/* Background Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-rose-500/10 blur-[90px] pointer-events-none" />

      <div className={`w-full ${loginMode === 'select' ? 'max-w-4xl' : 'max-w-lg'} bg-[#07051a]/95 backdrop-blur-2xl p-6 sm:p-10 rounded-[2.5rem] border border-white/10 space-y-8 relative overflow-hidden shadow-2xl transition-all duration-300`}>
        
        {/* Top Control Header with Passkey Verified Indicator & Session Lock */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
              PASSKEY VERIFIED // TIER-2 ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLockSession}
              id="lock-gateway-session-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-950/40 hover:border-rose-500/40 text-gray-300 hover:text-rose-300 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer"
              title="Lock security passkey and return home"
            >
              <LogOut size={12} />
              <span>Lock Session</span>
            </button>
          </div>
        </div>

        {/* Central Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <RexlifyLogo size={58} showText={true} layout="vertical" />
          <div className="pt-1">
            <h1 className="font-sora font-extrabold text-white text-2xl sm:text-3xl tracking-tight">
              Rexlify Control Gateway
            </h1>
            <p className="font-mono text-xs text-gray-400 uppercase tracking-widest block mt-1.5 font-semibold">
              SECOND SECURITY LAYER // ROLE-BASED ACCESS
            </p>
          </div>
        </div>

        {/* ----------------- 3. CONTROL GATEWAY REDESIGN: MODERN 2x2 BOX GRID ----------------- */}
        {loginMode === 'select' ? (
          <div className="space-y-6 pt-2">
            <div className="text-center">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Select Authorized Gateway Destination
              </span>
            </div>

            {/* 2x2 Responsive Box Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Box 1: CEO & Founder Login */}
              <button
                type="button"
                onClick={() => { setLoginMode('ceo'); setPassword(''); setErrorMsg(null); }}
                id="gateway-card-ceo"
                className="group relative p-6 rounded-2xl bg-white/[0.03] hover:bg-gradient-to-br hover:from-emerald-500/15 hover:to-cyan-500/10 border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)] text-left cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Crown size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                      CHIEF EXECUTIVE
                    </span>
                  </div>
                  <h3 className="font-sora font-bold text-white text-lg tracking-tight group-hover:text-emerald-300 transition-colors">
                    CEO & Founder Login
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
                    Master administrative telemetry, system governance, and privileged operational commands.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span className="uppercase tracking-wider font-semibold">Enter Vault</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>

              {/* Box 2: Teacher & Faculty Login */}
              <button
                type="button"
                onClick={() => { setLoginMode('teacher'); setPassword(''); setErrorMsg(null); }}
                id="gateway-card-teacher"
                className="group relative p-6 rounded-2xl bg-white/[0.03] hover:bg-gradient-to-br hover:from-purple-500/15 hover:to-pink-500/10 border border-purple-500/30 hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(168,85,247,0.2)] text-left cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-400/30 text-purple-400 group-hover:scale-110 transition-transform">
                      <GraduationCap size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-[9px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                      FACULTY PORTAL
                    </span>
                  </div>
                  <h3 className="font-sora font-bold text-white text-lg tracking-tight group-hover:text-purple-300 transition-colors">
                    Teacher & Faculty Login
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
                    Course syllabus management, student review, assignment evaluation, and academic telemetry.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-purple-400">
                  <span className="uppercase tracking-wider font-semibold">Access Institute</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>

              {/* Box 3: Rexlify AI Access */}
              <button
                type="button"
                onClick={() => { setLoginMode('rexlify-ai'); setPassword(''); setErrorMsg(null); }}
                id="gateway-card-ai"
                className="group relative p-6 rounded-2xl bg-white/[0.03] hover:bg-gradient-to-br hover:from-blue-500/15 hover:to-indigo-500/10 border border-blue-500/30 hover:border-blue-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)] text-left cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-400 group-hover:scale-110 transition-transform">
                      <Brain size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-[9px] font-mono text-blue-300 font-bold uppercase tracking-wider">
                      NEURAL ENGINE
                    </span>
                  </div>
                  <h3 className="font-sora font-bold text-white text-lg tracking-tight group-hover:text-blue-300 transition-colors">
                    Rexlify AI Access
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
                    Direct neural copilot terminal, model inference tuning, vector context, and cognitive pipelines.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-blue-400">
                  <span className="uppercase tracking-wider font-semibold">Launch AI Matrix</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>

              {/* Box 4: RODP Admin Panel */}
              <button
                type="button"
                onClick={() => { setLoginMode('rodp-admin'); setPassword(''); setErrorMsg(null); }}
                id="gateway-card-rodp"
                className="group relative p-6 rounded-2xl bg-white/[0.03] hover:bg-gradient-to-br hover:from-amber-500/15 hover:to-orange-500/10 border border-amber-500/30 hover:border-amber-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(245,158,11,0.2)] text-left cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 blur-[30px] rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                      ENTERPRISE RODP
                    </span>
                  </div>
                  <h3 className="font-sora font-bold text-white text-lg tracking-tight group-hover:text-amber-300 transition-colors">
                    RODP Admin Panel
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 font-sans leading-relaxed">
                    Retail operations, invoice lifecycle, customer loyalty ledger, and transaction surveillance.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-amber-400">
                  <span className="uppercase tracking-wider font-semibold">Enter RODP Panel</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>

            </div>
          </div>
        ) : (
          /* ----------------- 4. SECOND SECURITY LAYER (EXISTING AUTH FORM) ----------------- */
          <div className="space-y-6 pt-2">
            
            {/* Security Alert notice */}
            <div className="p-4 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-950/20 text-xs font-light leading-relaxed text-gray-200 flex gap-3 items-start text-left shadow-inner">
              <AlertTriangle size={18} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
              <span>
                You are authenticating the <strong>{loginMode === 'ceo' ? "CEO & Founder" : loginMode === 'teacher' ? "Teacher & Faculty" : loginMode === 'rodp-admin' ? "RODP Super Admin" : "Rexlify AI"}</strong> operations module. Cryptographic telemetry logging is active.
              </span>
            </div>

            {/* Form controls */}
            {isAuthorizing ? (
              <div className="py-12 flex flex-col items-center gap-6 text-center relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-t-2 border-emerald-400 animate-spin" />
                  <Lock size={20} className="absolute inset-0 m-auto text-emerald-400 animate-pulse" />
                </div>
                <p className="font-mono text-xs tracking-widest text-emerald-400 uppercase font-bold">
                  DECRYPTING TELEMETRY AUTH_TOKEN...
                </p>
              </div>
            ) : lockoutMsg ? (
              <div className="py-8 flex flex-col items-center gap-4 text-center">
                <Lock size={48} className="text-red-500 animate-pulse" />
                <p className="font-mono text-sm text-red-400 font-bold">{lockoutMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                <div className="space-y-2 text-left">
                  <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                    Enter {loginMode === 'ceo' ? "CEO" : loginMode === 'teacher' ? "Faculty" : loginMode === 'rodp-admin' ? "RODP Admin" : "AI"} Access Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      id="admin-auth-password"
                      autoFocus
                      className="w-full text-sm font-mono px-5 py-4 pl-12 rounded-xl border border-white/10 bg-black/50 text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                    />
                    <KeyRound size={18} className="absolute left-4 top-4 text-gray-500" />
                  </div>
                </div>

                {errorMsg && (
                  <p className="font-mono text-xs text-red-400 bg-red-500/10 py-3 px-4 rounded-xl border border-red-500/20 text-left shadow-inner">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    id="admin-auth-submit-btn"
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono uppercase tracking-widest text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    Verify Security Credentials
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setLoginMode('select'); setPassword(''); setErrorMsg(null); }} 
                    className="w-full sm:w-auto px-5 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-mono uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  >
                    Back to Grid
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        
        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-400">
          <button
            onClick={() => setView('home')}
            className="text-gray-400 hover:text-white transition-colors uppercase tracking-widest font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>System Home</span>
          </button>
          <span>REXLIFY INFRASTRUCTURE 2026</span>
        </div>

      </div>
    </div>
  );
};
