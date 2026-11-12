/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, Network, Bot, ArrowRight } from 'lucide-react';
import { Application, ProductItem, Project, DocArticle } from '../types';

interface PortfolioShowcaseProps {
  applications?: Application[];
  products?: ProductItem[];
  projects?: Project[];
  documents?: DocArticle[];
  setView: (view: any) => void;
  onIncrementDownload?: (appId: string) => void;
  onSimulateDownload?: (appId: string, name: string, filename: string) => void;
  initialCategory?: string;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  setView
}) => {
  return (
    <section id="portfolio-matrix" className="space-y-12 py-8 relative">
      {/* Background Ambient Radial Glows (Performance Optimized: Pure Radials, Zero Blur Filter) */}
      <div 
        className="absolute top-10 left-1/4 -translate-x-1/2 w-[450px] h-[450px] rounded-full pointer-events-none -z-10 gpu-accelerated" 
        style={{ background: 'radial-gradient(circle, rgba(225, 29, 72, 0.08) 0%, rgba(225, 29, 72, 0.01) 50%, transparent 70%)' }}
      />
      <div 
        className="absolute top-1/2 right-10 w-[400px] h-[400px] rounded-full pointer-events-none -z-10 gpu-accelerated" 
        style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.07) 0%, rgba(245, 158, 11, 0.01) 50%, transparent 70%)' }}
      />

      {/* -------------------- SECTION HEADER & OVERVIEW (RETAINED) -------------------- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
        <div className="space-y-3 text-left max-w-3xl">
          <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Crafted Softwares & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-200">Neural Systems</span>
          </h2>
          <p className="font-sans text-gray-400 text-sm sm:text-base font-light leading-relaxed">
            Explore cutting-edge client-side AI architectures, full-stack digital platforms, mobile APKs, and security runtimes created by Rizwan RR.
          </p>
        </div>

        <button
          onClick={() => {
            setView('explore-system');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer w-fit group"
        >
          <span>System Topology</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* -------------------- MINIMAL HIGH-LEVEL ARCHITECTURE TOPOLOGY -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      </div>
    </section>
  );
};
