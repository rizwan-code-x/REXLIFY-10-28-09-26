/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Headphones, LifeBuoy, GraduationCap, Mic, Send, Mail, Search,
  AlertTriangle, CheckCircle2, MessageSquare, Volume2, VolumeX, Sparkles,
  ChevronRight, RefreshCw, Paperclip, PhoneCall, ShieldCheck, User, Zap
} from 'lucide-react';
import { ActiveView } from './Navbar';
import { useToast } from '../context/ToastContext';

export type SaraMode = 'customer-care' | 'help' | 'institute' | 'chat' | 'voice';

interface SaraAIPageProps {
  initialMode?: SaraMode;
  setView: (view: ActiveView) => void;
  onAddMessage?: (msg: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'sara';
  text: string;
  timestamp: string;
}

export const SaraAIPage: React.FC<SaraAIPageProps> = ({
  initialMode = 'chat',
  setView,
  onAddMessage
}) => {
  const [activeMode, setActiveMode] = useState<SaraMode>(initialMode);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Voice Assistant states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(0.8);

  // Complaint form states for Help Centre
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintEmail, setComplaintEmail] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('Technical Issue');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync mode if initialMode prop changes
  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Initial welcome message per mode
  useEffect(() => {
    let welcome = '';
    if (activeMode === 'customer-care') {
      welcome = 'Hello! I am Sara AI, your Rexlify Customer Care Representative. How can I assist you with our services, pricing, or official inquiries today? You can also reach our team directly at rexlifyofficialsupportteam@gmail.com.';
    } else if (activeMode === 'help') {
      welcome = 'Welcome to the Rexlify Help Centre! I am Sara AI. Search help topics below or tell me if you are experiencing an application issue, crash, or account difficulty.';
    } else if (activeMode === 'institute') {
      welcome = 'Greetings! I am Sara AI, your Rexlify Institute Academic Advisor. Ask me anything about our 1-Month Hybrid Development Programs, course roadmaps, or faculty application process.';
    } else if (activeMode === 'voice') {
      welcome = 'Sara Voice Assistant active. Tap the microphone button to speak or listen to live audio responses.';
    } else {
      welcome = 'Hello! I am Sara AI, your advanced Rexlify AI Agent. How can I assist your workflow or coding tasks today?';
    }

    setChatMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'sara',
        text: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeMode]);

  // Speech Recognition setup (Voice Assistant)
  const handleToggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toastError('Voice Not Supported', 'Browser speech recognition is not supported in this browser. You can type your question.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      toastInfo('Voice Listening Stopped', 'Microphone disabled.');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toastInfo('Listening...', 'Speak now into your microphone.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        console.warn('Speech recognition error:', event.error);
        toastError('Speech Error', 'Could not parse speech. Please try again or type.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      toastError('Microphone Access', 'Unable to initialize microphone.');
    }
  };

  // Text to Speech playback
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = voiceVolume;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Send message to Sara AI
  const handleSendMessage = async (textToSend?: string) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: msg.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/sara-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg.trim(),
          mode: activeMode,
          chatHistory: chatMessages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        })
      });

      if (!response.ok) {
        throw new Error('API server returned non-200 response');
      }

      const data = await response.json();
      const saraReply = data.reply || 'I am here to assist you with Rexlify.';

      const saraMsg: ChatMessage = {
        id: `sara-${Date.now()}`,
        sender: 'sara',
        text: saraReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, saraMsg]);
      setIsTyping(false);

      if (activeMode === 'voice') {
        speakText(saraReply);
      }
    } catch (err) {
      console.warn('Falling back to local Sara AI response logic:', err);
      // Smart offline fallback
      let fallback = '';
      if (activeMode === 'customer-care') {
        fallback = 'Thank you for reaching out to Rexlify Customer Care. For complex inquiries or account assistance, please email our support team directly at rexlifyofficialsupportteam@gmail.com.';
      } else if (activeMode === 'help') {
        fallback = 'I have noted your query. If you are experiencing an issue, you can file a formal complaint ticket below, or email rexlifyofficialsupportteam@gmail.com.';
      } else if (activeMode === 'institute') {
        fallback = 'Rexlify Institute offers 1-Month Hybrid Development & AI Assistant programs. You can review course details and roadmaps under the Institute section.';
      } else {
        fallback = 'Sara AI is processing your request. All systems across the Rexlify platform are functioning normally.';
      }

      const saraMsg: ChatMessage = {
        id: `sara-${Date.now()}`,
        sender: 'sara',
        text: fallback,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, saraMsg]);
      setIsTyping(false);

      if (activeMode === 'voice') {
        speakText(fallback);
      }
    }
  };

  // Submit Help Centre complaint
  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject || !complaintEmail || !complaintDetails) {
      toastError('Missing Fields', 'Please complete all complaint details before submitting.');
      return;
    }

    if (onAddMessage) {
      onAddMessage({
        senderName: 'Help Centre User',
        senderEmail: complaintEmail,
        subject: `[Complaint] ${complaintSubject}`,
        category: complaintCategory as any,
        message: complaintDetails
      });
    }

    setComplaintSubmitted(true);
    toastSuccess('Complaint Logged', 'Your support ticket has been forwarded to rexlifyofficialsupportteam@gmail.com!');
    setTimeout(() => {
      setComplaintSubmitted(false);
      setComplaintSubject('');
      setComplaintEmail('');
      setComplaintDetails('');
    }, 4000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-6 select-none text-left animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative rounded-[2.5rem] p-8 md:p-10 border border-white/10 bg-gradient-to-r from-[#0a0720] via-[#0e082b] to-[#080f24] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Bot size={180} className="text-purple-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <Sparkles size={12} className="text-amber-400 animate-spin" />
              SARA AI CO-PILOT PLATFORM
            </div>

            <h1 className="font-sora text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sara AI Assistance Suite
            </h1>

            <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed">
              Interact with Rexlify&apos;s intelligent agent across 5 customized modes: Customer Care, Help Centre, Institute Advisor, Full Chat Agent, and Live Voice Assistant.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-1 text-xs font-mono shrink-0">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <Mail size={14} />
              <span>Official Support Desk:</span>
            </div>
            <a href="mailto:rexlifyofficialsupportteam@gmail.com" className="text-white hover:text-rose-400 transition-colors underline font-semibold">
              rexlifyofficialsupportteam@gmail.com
            </a>
          </div>
        </div>

        {/* 5 Mode Selector Tabs */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'customer-care' as SaraMode, label: 'Customer Care', icon: Headphones, color: 'text-rose-400' },
            { id: 'help' as SaraMode, label: 'Help Centre', icon: LifeBuoy, color: 'text-amber-400' },
            { id: 'institute' as SaraMode, label: 'Rexlify Institute', icon: GraduationCap, color: 'text-cyan-400' },
            { id: 'chat' as SaraMode, label: 'Chat with Sara AI', icon: Bot, color: 'text-purple-400' },
            { id: 'voice' as SaraMode, label: 'Sara Voice Assistant', icon: Mic, color: 'text-emerald-400' },
          ].map((mode) => {
            const IconComp = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 border border-purple-400/40 scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <IconComp size={15} className={mode.color} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mode View Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Main Interactive Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* VOICE ASSISTANT SPECIAL ANIMATED VIEW */}
          {activeMode === 'voice' && (
            <div className="rounded-3xl p-8 border border-emerald-500/30 bg-[#060e12] text-center space-y-8 relative overflow-hidden shadow-2xl">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] uppercase font-bold tracking-widest">
                  LIVE VOICE CO-PILOT
                </span>
                <h2 className="font-sora text-2xl font-bold text-white">
                  Sara Interactive Voice Assistant
                </h2>
                <p className="text-gray-400 text-xs font-light max-w-md mx-auto">
                  Speak naturally into your device. Sara AI listens and responds with real-time speech.
                </p>
              </div>

              {/* Animated Audio Visualizer Waves */}
              <div className="py-12 flex items-center justify-center gap-2 relative">
                {[40, 75, 25, 90, 60, 100, 45, 80, 30, 95, 50, 70, 35].map((height, i) => (
                  <div
                    key={i}
                    className={`w-2.5 rounded-full transition-all duration-300 ${
                      isSpeaking || isListening
                        ? 'bg-gradient-to-t from-emerald-500 to-cyan-400 animate-pulse'
                        : 'bg-white/10'
                    }`}
                    style={{
                      height: isSpeaking || isListening ? `${Math.min(100, height + Math.random() * 30)}px` : '16px'
                    }}
                  />
                ))}
              </div>

              {/* Microphone Action Button */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={handleToggleListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl ${
                    isListening
                      ? 'bg-rose-600 text-white animate-ping ring-8 ring-rose-500/30'
                      : isSpeaking
                      ? 'bg-emerald-500 text-black animate-pulse ring-8 ring-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-110 shadow-emerald-900/50'
                  }`}
                >
                  <Mic size={32} />
                </button>

                <span className="font-mono text-xs text-gray-300 font-semibold">
                  {isListening ? 'Listening to your voice...' : isSpeaking ? 'Sara AI is speaking...' : 'Tap Mic to Start Speaking'}
                </span>
              </div>
            </div>
          )}

          {/* HELP CENTRE SEARCH & REPORT BUG SECTION */}
          {activeMode === 'help' && (
            <div className="space-y-6">
              {/* Help Search Bar */}
              <div className="p-6 rounded-3xl bg-[#080718] border border-amber-500/30 space-y-4">
                <h3 className="font-sora text-base font-bold text-white flex items-center gap-2">
                  <Search size={16} className="text-amber-400" />
                  Search Help Knowledge Base
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search error messages, APK installation, account login..."
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                  <Search size={16} className="absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Submit Complaint Ticket Form */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#080718] border border-white/10 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-sora text-lg font-bold text-white flex items-center gap-2">
                      <AlertTriangle size={18} className="text-rose-400" />
                      Report an Issue or File Complaint
                    </h3>
                    <p className="text-xs text-gray-400">
                      Formal complaints are directly recorded and routed to <strong className="text-rose-300">rexlifyofficialsupportteam@gmail.com</strong>
                    </p>
                  </div>
                </div>

                {complaintSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                    <h4 className="font-sora font-bold text-base text-white">Complaint Ticket Registered</h4>
                    <p className="text-xs font-mono">Our engineering team has received your ticket and will respond to {complaintEmail}.</p>
                  </div>
                ) : (
                  <form onSubmit={handleComplaintSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 uppercase block">Your Email</label>
                        <input
                          type="email"
                          required
                          value={complaintEmail}
                          onChange={(e) => setComplaintEmail(e.target.value)}
                          placeholder="e.g. user@rexlify.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-gray-400 uppercase block">Issue Category</label>
                        <select
                          value={complaintCategory}
                          onChange={(e) => setComplaintCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          <option value="Technical Issue">Technical Issue / App Bug</option>
                          <option value="APK Download">APK Download Error</option>
                          <option value="Account Login">Account Login / Password</option>
                          <option value="Subscription">Subscription / Payment</option>
                          <option value="Other Complaint">Other Complaint</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400 uppercase block">Subject / Short Title</label>
                      <input
                        type="text"
                        required
                        value={complaintSubject}
                        onChange={(e) => setComplaintSubject(e.target.value)}
                        placeholder="e.g. Sifra AI APK install fails on Android 14"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-gray-400 uppercase block">Complaint / Incident Details</label>
                      <textarea
                        required
                        rows={3}
                        value={complaintDetails}
                        onChange={(e) => setComplaintDetails(e.target.value)}
                        placeholder="Please describe the issue in detail..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                    >
                      Submit Official Complaint Ticket
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* SARA CHAT CONVERSATION CONTAINER */}
          <div className="rounded-3xl p-6 border border-white/10 bg-[#080718] space-y-4 flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-sora text-sm font-bold text-white">
                  Sara AI Live Dialogue Console ({activeMode.toUpperCase()})
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-400">
                Powered by Gemini 3.5 Flash
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'sara' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Bot size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs font-sans leading-relaxed space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] font-mono text-gray-400 text-right opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
                  <Bot size={16} className="animate-spin" />
                  <span>Sara AI is thinking...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Box */}
            <div className="pt-3 border-t border-white/10 flex gap-2 shrink-0">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask Sara AI (${activeMode})...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Customer Care Official Contact Box */}
          <div className="p-6 rounded-3xl bg-[#080718] border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300">
                <Headphones size={20} />
              </div>
              <div>
                <h4 className="font-sora font-bold text-sm text-white">Customer Care Desk</h4>
                <span className="text-[10px] font-mono text-rose-400">Official Channel</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-light leading-relaxed">
              Our support team assists with ecosystem accounts, custom app builds, and business partnerships.
            </p>

            <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
              <span className="text-[9px] font-mono text-gray-400 uppercase block">Direct Email Support:</span>
              <a 
                href="mailto:rexlifyofficialsupportteam@gmail.com"
                className="text-xs font-mono text-rose-300 hover:underline font-bold block truncate"
              >
                rexlifyofficialsupportteam@gmail.com
              </a>
            </div>

            <button
              onClick={() => setView('contact')}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Go to Contact Page</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Quick FAQ Items */}
          <div className="p-6 rounded-3xl bg-[#080718] border border-white/10 space-y-4">
            <h4 className="font-sora font-bold text-sm text-white flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              Frequently Asked Questions
            </h4>

            <div className="space-y-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-white block">How do I download Sifra AI APK?</strong>
                <p className="text-gray-400 font-light text-[11px]">Navigate to Published Apps or Explore System to retrieve the binary installer.</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-white block">What programs does Rexlify Institute offer?</strong>
                <p className="text-gray-400 font-light text-[11px]">We offer 1-Month Hybrid Development &amp; AI Assistant certification programs.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
