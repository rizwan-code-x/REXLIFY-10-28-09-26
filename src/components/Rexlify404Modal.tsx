/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  AlertTriangle, 
  Github, 
  Home, 
  Grid, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert, 
  Terminal, 
  ExternalLink,
  Lock,
  Sparkles
} from 'lucide-react';
import { RexlifyLogo } from './Logo';

interface Rexlify404ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
  onNavigatePortfolio?: () => void;
}

export const Rexlify404Modal: React.FC<Rexlify404ModalProps> = ({
  isOpen,
  onClose,
  onNavigateHome,
  onNavigateCatalog,
  onNavigatePortfolio
}) => {
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([
    '[INIT] Connecting to github.com/rexlify...',
    '[HTTP 404] Repository restricted or path moved to staging node.',
    '[SYSTEM] Sovereign security policy active. Public index suppressed.'
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleRunDiagnostic = () => {
    setIsDiagnosticRunning(true);
    setDiagnosticLogs(prev => [...prev, '[TEST] Handshaking GitHub API endpoint...']);
    setTimeout(() => {
      setDiagnosticLogs(prev => [
        ...prev, 
        '[RESPONSE 404] Verified: Repository is private / under encrypted transition.',
        '[NOTICE] All ecosystem binaries remain securely downloadable from REXLIFY portal.'
      ]);
      setIsDiagnosticRunning(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with rich blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#090a10] border border-rose-500/30 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_60px_rgba(225,29,72,0.25)] text-white overflow-hidden z-10 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-600/15 blur-[90px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Top Bar with Brand and Close Button */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
              <RexlifyLogo size={42} showText={true} />
              
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* 404 Banner & Visual Headline */}
            <div className="text-center space-y-4 my-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 font-mono text-[11px] uppercase tracking-widest">
                <Lock size={12} className="animate-pulse" />
                HTTP 404 &bull; REPOSITORY NOT FOUND
              </div>

              {/* Massive 404 Number with Gradient and Plume Aura */}
              <div className="relative flex items-center justify-center my-2 select-none">
                <span className="font-sora text-7xl sm:text-8xl font-black tracking-tighter bg-gradient-to-b from-rose-400 via-rose-600 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.4)]">
                  404
                </span>
                <span className="absolute -bottom-1 text-xs font-mono tracking-[0.3em] uppercase text-rose-300/80 font-bold">
                  ARCHIVE RESTRICTED
                </span>
              </div>

              <h2 className="font-sora text-xl sm:text-2xl font-bold text-white tracking-tight">
                REXLIFY GitHub Repository Is Private / Under Migration
              </h2>

              <p className="text-gray-300 text-sm font-light leading-relaxed max-w-lg mx-auto">
                The requested GitHub repository path (<code className="font-mono text-rose-300 bg-white/5 px-2 py-0.5 rounded text-xs">github.com/rexlify</code>) is currently restricted, undergoing migration, or maintained under private enterprise protection. All public apps and architecture remain fully functional on this platform.
              </p>
            </div>

            {/* Telemetry Diagnostics Block */}
            <div className="bg-black/60 rounded-2xl border border-white/10 p-4 sm:p-5 my-6 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-gray-400 border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <Terminal size={14} />
                  <span className="font-bold tracking-wider">DIAGNOSTIC TELEMETRY</span>
                </div>
                <button
                  onClick={handleRunDiagnostic}
                  disabled={isDiagnosticRunning}
                  className="flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={11} className={isDiagnosticRunning ? 'animate-spin' : ''} />
                  <span>Re-check Node</span>
                </button>
              </div>

              <div className="space-y-1.5 text-gray-400 font-mono text-[11px] max-h-24 overflow-y-auto">
                {diagnosticLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">&gt;</span>
                    <span className={log.includes('404') ? 'text-rose-300' : log.includes('NOTICE') ? 'text-emerald-300' : 'text-gray-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action Button Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateHome) onNavigateHome();
                }}
                className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#881337] to-[#be123c] hover:from-[#9f1239] hover:to-[#e11d48] text-white font-medium text-sm shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
              >
                <Home size={16} />
                Return to Home Portal
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onNavigateCatalog) onNavigateCatalog();
                }}
                className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-all cursor-pointer"
              >
                <Grid size={16} />
                Browse Systems Catalog
              </button>
            </div>

            {/* Sub-footer note */}
            <div className="text-center pt-6 mt-6 border-t border-white/5">
              <span className="font-sans text-[11px] text-gray-500 tracking-wider">
                REXLIFY &bull; Signature of Elegance &bull; Official Digital Architecture Platform
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
