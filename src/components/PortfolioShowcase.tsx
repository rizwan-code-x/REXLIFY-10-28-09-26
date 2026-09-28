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
        {/* Pillar 1: Neural Inference */}
        <div className="bg-[#060614]/95 border border-white/10 hover:border-amber-500/40 rounded-3xl p-7 flex flex-col justify-between space-y-6 transition-all duration-300 group relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Cpu size={22} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                Layer 01
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-sora text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                Neural Inference & Edge Runtime
              </h3>
              <p className="text-gray-400 text-xs font-light leading-relaxed">
                Direct client-side model execution utilizing local GPU and NPU acceleration. Provides zero-latency vector embeddings without external network dependencies.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-2 font-mono text-[10px] text-gray-400">
            <div className="flex items-center justify-between">
              <span>LATENCY:</span>
              <span className="text-emerald-400 font-bold">&lt; 10ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>EXECUTION:</span>
              <span className="text-white font-bold">100% Offline Edge</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Distributed Cloud Mesh */}
        <div className="bg-[#060614]/95 border border-white/10 hover:border-cyan-500/40 rounded-3xl p-7 flex flex-col justify-between space-y-6 transition-all duration-300 group relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Network size={22} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                Layer 02
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-sora text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Distributed Cloud & Multi-Platform Mesh
              </h3>
              <p className="text-gray-400 text-xs font-light leading-relaxed">
                Seamless cryptographic state synchronization interconnecting web clients, mobile endpoints, and edge gateways with real-time operational reliability.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-2 font-mono text-[10px] text-gray-400">
            <div className="flex items-center justify-between">
              <span>SECURITY:</span>
              <span className="text-cyan-400 font-bold">Zero-Trust Tokens</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SYNC PROTOCOL:</span>
              <span className="text-white font-bold">Encrypted WebSockets</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Autonomous Agents */}
        <div className="bg-[#060614]/95 border border-white/10 hover:border-rose-500/40 rounded-3xl p-7 flex flex-col justify-between space-y-6 transition-all duration-300 group relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Bot size={22} />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                Layer 03
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-sora text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
                Autonomous Agents & Human-AI Synergy
              </h3>
              <p className="text-gray-400 text-xs font-light leading-relaxed">
                Adaptive cognitive co-pilots executing autonomous task scheduling, vector knowledge retrieval, and multimodal system assistance.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-2 font-mono text-[10px] text-gray-400">
            <div className="flex items-center justify-between">
              <span>DECISION LOOP:</span>
              <span className="text-rose-400 font-bold">Continuous Autonomous</span>
            </div>
            <div className="flex items-center justify-between">
              <span>MULTIMODAL:</span>
              <span className="text-white font-bold">Text, Vision, Voice</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
