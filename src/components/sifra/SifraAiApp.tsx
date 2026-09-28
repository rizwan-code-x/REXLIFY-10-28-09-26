/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Sparkles, Send, Mic, Play, Pause, ExternalLink, 
  Calendar, CheckCircle2, Clock, ShieldCheck, Zap, Lock, 
  Terminal, RefreshCw, Sliders, ChevronRight, FileText, Database
} from 'lucide-react';
import { SifraLogo } from '../Logo';
import { SecureExitModal } from '../SecureExitModal';
import { SIFRA_AI_LIVE_URL } from '../ExploreAppsHub';

interface SifraAiAppProps {
  onBack: () => void;
  userName?: string;
}

interface SifraMessage {
  id: string;
  sender: 'sifra' | 'user';
  text: string;
  timestamp: string;
  tag?: string;
}

const INITIAL_MESSAGES: SifraMessage[] = [
  {
    id: 'msg-1',
    sender: 'sifra',
    text: 'Salam and Welcome! I am Sifra, your autonomous personal co-pilot. I am monitoring your schedule, processing vector memory, and ready to assist with complex workflows.',
    timestamp: 'Just now',
    tag: 'SYSTEM BOOT'
  }
];

export const SifraAiApp: React.FC<SifraAiAppProps> = ({ onBack, userName = 'Rizwan' }) => {
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [messages, setMessages] = useState<SifraMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'copilot' | 'tasks' | 'settings'>('copilot');

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isThinking) return;

    const userText = inputVal.trim();
    const userMsg: SifraMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsThinking(true);

    setTimeout(() => {
      let replyText = `I have received: "${userText}". Processing autonomous task graph and synchronizing local context for execution.`;
      if (userText.toLowerCase().includes('schedule') || userText.toLowerCase().includes('time')) {
        replyText = 'Checked your agenda: You have 3 priority milestones scheduled today. All synchronization pipelines are optimal.';
      } else if (userText.toLowerCase().includes('code') || userText.toLowerCase().includes('build')) {
        replyText = 'Ready to assist with architecture planning, refactoring, and automated validation scripts.';
      }

      const botMsg: SifraMessage = {
        id: `sifra-${Date.now()}`,
        sender: 'sifra',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tag: 'AUTONOMOUS AGENT'
      };
      setMessages(prev => [...prev, botMsg]);
      setIsThinking(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar: Locked Workspace */}
      <header className="sticky top-0 z-40 bg-[#0c1017]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 md:px-8 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3.5">
          {/* Sifra Logo with muted Video Avatar */}
          <SifraLogo size={42} showText={false} />
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 uppercase">
                SIFRA AI
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                AUTONOMOUS CO-PILOT
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">
              Personalized Multi-Agent Intelligence Core
            </p>
          </div>
        </div>

        {/* Right Controls: Lock Badge & Captcha-Protected Exit */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono">
            <Lock size={12} className="text-amber-400" />
            <span>WORKSPACE LOCKED</span>
          </div>

          <a 
            href={SIFRA_AI_LIVE_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-medium transition-all"
            title="Open Live Deployment on Cloud Run"
          >
            <ExternalLink size={13} />
            <span>Cloud Run Service</span>
          </a>

          {/* EXIT BUTTON TRIGGERING CAPTCHA */}
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            title="Exit Sifra AI Platform (Requires Captcha Code Verification)"
          >
            <Lock size={13} className="text-rose-400" />
            <span>EXIT SIFRA</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Center: Interactive Sifra Agent Chat & Reasoning */}
        <div className="lg:col-span-2 flex flex-col bg-[#0f141d]/80 border border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-xl relative backdrop-blur-sm overflow-hidden min-h-[580px]">
          
          {/* Chat Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono uppercase text-slate-300 font-bold">Continuous Autonomous Loop</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400/80">Context: {userName}'s Workspace</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'sifra' && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-300 shadow-sm">
                    <Bot size={16} />
                  </div>
                )}
                <div 
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-[#141b26] border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.tag && (
                    <span className="inline-block text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30 mb-1">
                      {msg.tag}
                    </span>
                  )}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className="block text-[9px] text-slate-400 text-right mt-1 font-mono">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-2">
                <RefreshCw size={14} className="animate-spin" />
                <span>Sifra is synthesizing autonomous plan...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-800/80">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask Sifra to plan tasks, summarize data, or run models..."
              className="flex-1 bg-[#151c28] border border-slate-700/80 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isThinking}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all cursor-pointer active:scale-95 shadow-md shadow-cyan-500/20"
              title="Send to Sifra"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Right Panel: Autonomous Modules & Telemetry */}
        <div className="flex flex-col gap-4">
          
          {/* Quick Actions Card */}
          <div className="bg-[#0f141d]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase mb-3">
              <Zap size={14} />
              <span>Autonomous Trigger Desk</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setInputVal('Summarize all ongoing ecosystem tasks and generate daily priorities.');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#141b26] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>📅 Daily Focus & Scheduling</span>
                <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => {
                  setInputVal('Run neural sanity test on edge NeuraX model connection.');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#141b26] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>🧠 NeuraX Bridge Diagnostics</span>
                <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => {
                  setInputVal('Generate meeting briefing notes for Rizwan Online Dreams Platform.');
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#141b26] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-200 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>📝 RODP Executive Briefing</span>
                <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Model Status Card */}
          <div className="bg-[#0f141d]/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm flex-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase mb-3">
              <ShieldCheck size={14} />
              <span>Sifra AI Telemetry & Memory</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#141b26] border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Context Retention</span>
                  <span className="text-emerald-400 font-mono font-bold">128k Tokens</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[42%]" />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#141b26] border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Inference Latency</span>
                  <span className="text-cyan-400 font-mono font-bold">18ms</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[85%]" />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-slate-300 leading-relaxed font-mono">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
                  <Terminal size={12} />
                  <span>Cloud Deployment Ready</span>
                </div>
                Live cloud run endpoints are listening on Asia East 1 region.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Captcha Exit Modal */}
      <SecureExitModal
        isOpen={isExitModalOpen}
        appName="Sifra AI Co-Pilot"
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          onBack();
        }}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
};
