/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, Zap, Activity, Lock, Terminal, ShieldCheck, 
  Layers, Sliders, RefreshCw, Play, CheckCircle2, AlertCircle, BarChart3, Database
} from 'lucide-react';
import { NeuraxLogo } from '../Logo';
import { SecureExitModal } from '../SecureExitModal';

interface NeuraxAiAppProps {
  onBack: () => void;
  userName?: string;
}

export const NeuraxAiApp: React.FC<NeuraxAiAppProps> = ({ onBack, userName = 'Rizwan' }) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [quantization, setQuantization] = useState<'FP16' | 'INT8' | 'INT4'>('INT8');
  const [isRunningBench, setIsRunningBench] = useState(false);
  const [tokensPerSec, setTokensPerSec] = useState<number>(142);
  const [neuralPrompt, setNeuralPrompt] = useState('Analyze edge biometric vectors with zero-latency quantization.');
  const [neuralResponse, setNeuralResponse] = useState(
    'NeuraX Neural Core initialized. 4-bit edge weights loaded into local memory cache. Inference operating at 142 tokens/sec without external network dependency.'
  );

  const handleRunInference = () => {
    setIsRunningBench(true);
    setTimeout(() => {
      setTokensPerSec(quantization === 'INT4' ? 186 : quantization === 'INT8' ? 144 : 98);
      setNeuralResponse(
        `[NeuraX Edge Matrix ${quantization} Execution]: Evaluated "${neuralPrompt}".\nEmbedding dimensional depth: 1536 vectors.\nThermal throttle status: Nominal (36°C).\nCryptographic signature verified across decentralized NeuraX subnet.`
      );
      setIsRunningBench(false);
    }, 750);
  };

  return (
    <div className="min-h-screen bg-[#06070d] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header with NeuraX Video Branding & Exit Lock */}
      <header className="sticky top-0 z-40 bg-[#0a0d17]/95 backdrop-blur-md border-b border-purple-500/20 px-4 md:px-8 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3.5">
          {/* NeuraX Video Logo */}
          <NeuraxLogo size={42} showText={false} />
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-pink-300 uppercase">
                NEURAX AI
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-[10px] font-mono text-purple-300">
                <Activity size={10} className="text-purple-400 animate-pulse" />
                NEURAL CORE & EDGE
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              High-Velocity Decentralized Vector Engine
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[11px] font-mono">
            <Lock size={12} className="text-purple-400" />
            <span>NEURAL LOCK ACTIVE</span>
          </div>

          {/* EXIT BUTTON TRIGGERING CAPTCHA */}
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            title="Exit NeuraX Platform (Requires Captcha Code Verification)"
          >
            <Lock size={13} className="text-rose-400" />
            <span>EXIT NEURAX</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Neural Execution Engine */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Prompt & Execution Panel */}
          <div className="bg-[#0e111d]/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-purple-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">Edge Inference Sandbox</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <span className="text-slate-400">Precision:</span>
                {(['FP16', 'INT8', 'INT4'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setQuantization(p)}
                    className={`px-1.5 py-0.5 rounded ${quantization === p ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
              Input Vector Signal / Direct Neural Prompt:
            </label>
            <textarea
              value={neuralPrompt}
              onChange={(e) => setNeuralPrompt(e.target.value)}
              rows={3}
              className="w-full bg-[#131726] border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />

            <div className="flex justify-between items-center mt-3">
              <div className="text-[11px] font-mono text-slate-400">
                Target Node: <span className="text-purple-400">Edge Device Snapdragon / NPU</span>
              </div>
              <button
                onClick={handleRunInference}
                disabled={isRunningBench}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 shadow-md shadow-purple-600/30"
              >
                {isRunningBench ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                <span>Execute Tensor Batch</span>
              </button>
            </div>
          </div>

          {/* Neural Output Stream */}
          <div className="bg-[#0e111d]/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <Terminal size={14} className="text-pink-400" />
                <span>Inference Output Log</span>
              </div>
              <span className="text-emerald-400 font-bold">{tokensPerSec} tokens/sec</span>
            </div>
            
            <div className="flex-1 bg-[#090b14] border border-slate-850 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-y-auto whitespace-pre-wrap">
              {neuralResponse}
            </div>
          </div>
        </div>

        {/* Right Col: Telemetry Radar */}
        <div className="flex flex-col gap-4">
          
          <div className="bg-[#0e111d]/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 uppercase mb-3">
              <BarChart3 size={14} />
              <span>Edge Performance Metrics</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#131726] border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>RAM Footprint</span>
                  <span className="text-purple-300 font-bold">482 MB</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-400 h-full w-[35%]" />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131726] border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Subnet Latency</span>
                  <span className="text-emerald-400 font-bold">4.2 ms</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[94%]" />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#131726] border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Cold Start Time</span>
                  <span className="text-pink-300 font-bold">0.12 sec</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-pink-400 h-full w-[90%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0e111d]/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-pink-300 uppercase mb-2">
                <Layers size={14} />
                <span>Multimodal Pipelines</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                NeuraX runs continuous audio, spatial image vectoring, and text reasoning simultaneously on consumer mobile hardware.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              Session Master: {userName} • Rexlify Connect
            </div>
          </div>
        </div>
      </div>

      {/* Security Captcha Exit Modal */}
      <SecureExitModal
        isOpen={isExitModalOpen}
        appName="NeuraX AI Core"
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          onBack();
        }}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
};
