/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ActiveView } from './Navbar';

interface UniversalBackButtonProps {
  currentView: ActiveView;
  setView: (view: ActiveView) => void;
  onBack?: () => void;
}

export const UniversalBackButton: React.FC<UniversalBackButtonProps> = ({
  currentView,
  setView,
  onBack
}) => {
  // Do not render on Homepage, Admin Dashboard, REXLIFY AI suite, or RODP standalone workspace
  if (currentView === 'home' || currentView === 'admin-dashboard' || currentView === 'rexlify-ai' || currentView === 'rodp') {
    return null;
  }

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-20 z-40 px-4 sm:px-8 md:px-12 pt-3 pb-1 pointer-events-none w-full flex justify-start">
      <button
        onClick={handleBackClick}
        id="universal-back-button"
        type="button"
        className="pointer-events-auto group relative inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#090818]/90 border border-rose-500/40 hover:border-rose-400 text-rose-300 hover:text-white font-sora font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer select-none"
        title="Back to Previous Page / Homepage"
      >
        <div className="p-1 rounded-xl bg-rose-500/20 group-hover:bg-rose-500 text-rose-300 group-hover:text-black transition-colors">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="font-mono text-xs uppercase tracking-wider font-bold">Back</span>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
      </button>
    </div>
  );
};
