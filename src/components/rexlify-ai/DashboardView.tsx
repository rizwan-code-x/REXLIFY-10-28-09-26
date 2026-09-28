import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  FileText, 
  FileSpreadsheet, 
  BookOpen, 
  Image as ImageIcon, 
  PenTool, 
  Code, 
  GraduationCap, 
  Mic, 
  Paperclip, 
  Send, 
  ArrowRight, 
  Clock, 
  FolderKanban, 
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { RexlifyAiTab, AttachmentPayload } from './types';

interface DashboardViewProps {
  onNavigate: (tab: RexlifyAiTab, initialPrompt?: string) => void;
  onSendPrompt: (prompt: string, attachment?: AttachmentPayload) => void;
  onOpenVoice?: () => void;
  userName?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSendPrompt,
  onOpenVoice,
  userName = 'Rizwan'
}) => {
  const [prompt, setPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachmentPayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleTriggerFile = (type: 'pdf' | 'excel' | 'any') => {
    if (fileInputRef.current) {
      if (type === 'pdf') fileInputRef.current.accept = '.pdf';
      else if (type === 'excel') fileInputRef.current.accept = '.xlsx,.xls,.csv';
      else fileInputRef.current.accept = '*/*';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType: 'image' | 'pdf' | 'excel' | 'doc' = 
      file.type.startsWith('image/') ? 'image' :
      file.name.endsWith('.pdf') ? 'pdf' :
      file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || file.name.endsWith('.xls') ? 'excel' : 'doc';

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedFile({
        id: `dash-att-${Date.now()}`,
        name: file.name,
        type: fileType,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        dataUrl,
        pageCount: fileType === 'pdf' ? 14 : undefined,
        status: 'ready'
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = () => {
    if (prompt.trim() || attachedFile) {
      onSendPrompt(prompt, attachedFile || undefined);
      setPrompt('');
      setAttachedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      id: 'assignment',
      title: 'Create Assignment',
      desc: 'Structured academic assignments with title, sections, and PDF export',
      icon: <GraduationCap className="text-pink-600" size={24} />,
      tab: 'assignment' as RexlifyAiTab,
      badge: 'Academic'
    },
    {
      id: 'pdf',
      title: 'Analyze PDF',
      desc: 'Summarize, find errors, extract key facts & polish documents',
      icon: <FileText className="text-purple-600" size={24} />,
      tab: 'pdf' as RexlifyAiTab,
      badge: 'Multimodal'
    },
    {
      id: 'excel',
      title: 'Analyze Excel',
      desc: 'Spreadsheet audit, formula assistant & interactive visual charts',
      icon: <FileSpreadsheet className="text-emerald-600" size={24} />,
      tab: 'excel' as RexlifyAiTab,
      badge: 'Data AI'
    },
    {
      id: 'study',
      title: 'Create Notes & Quiz',
      desc: 'Auto-detect chapters, revision bullet points, flashcards & mnemonics',
      icon: <BookOpen className="text-rose-600" size={24} />,
      tab: 'study' as RexlifyAiTab,
      badge: 'Study AI'
    },
    {
      id: 'explain-img',
      title: 'Explain Image',
      desc: 'Deep visual reasoning on diagrams, math formulas & screenshots',
      icon: <ImageIcon className="text-fuchsia-600" size={24} />,
      tab: 'chat' as RexlifyAiTab,
      badge: 'Vision'
    },
    {
      id: 'content',
      title: 'Write Content',
      desc: 'Executive summaries, reports, applications, emails & speeches',
      icon: <PenTool className="text-pink-500" size={24} />,
      tab: 'chat' as RexlifyAiTab,
      badge: 'Writing'
    },
    {
      id: 'code',
      title: 'Code With AI',
      desc: 'Production code generator, syntax analyzer, debugger & refactorer',
      icon: <Code className="text-indigo-600" size={24} />,
      tab: 'code' as RexlifyAiTab,
      badge: 'Developer'
    },
    {
      id: 'study-me',
      title: 'Study With Me',
      desc: 'Interactive exam tutor with test modes, scoring & weak area tips',
      icon: <Sparkles className="text-amber-600" size={24} />,
      tab: 'study' as RexlifyAiTab,
      badge: 'Interactive'
    },
    {
      id: 'voice',
      title: 'Voice AI Mode',
      desc: 'Conversational voice assistant with speech recognition & audio synthesis',
      icon: <Mic className="text-purple-600" size={24} />,
      tab: 'voice' as RexlifyAiTab,
      badge: 'Real-time'
    }
  ];

  const recentProjects = [
    { name: 'Political Science Semester 1', files: 4, tasks: 6, category: 'Academics' },
    { name: 'Autonomous Robotics Agent Core', files: 12, tasks: 9, category: 'AI Research' },
    { name: 'Corporate Business Intelligence Q3', files: 8, tasks: 4, category: 'Strategy' },
  ];

  const recentFiles = [
    { name: 'Constitutional_Law_Notes.pdf', type: 'PDF', size: '2.4 MB', date: 'Today, 10:14 AM' },
    { name: 'Financial_Projections_2026.xlsx', type: 'Excel', size: '1.1 MB', date: 'Yesterday' },
    { name: 'Neural_Network_Architecture.png', type: 'Image', size: '3.8 MB', date: 'Jun 10, 2026' }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {/* Top Greeting & Vision Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-8 border border-pink-200/80 shadow-sm backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-pink-400/90 shadow-md shadow-pink-500/20 shrink-0 ring-2 ring-white/80">
              <img 
                src="/IMG-20260912-WA0005.jpg" 
                onError={(e) => {
                  e.currentTarget.src = "/rizwan_profile.jpg";
                }}
                alt="Rizwan (CEO & Founder)" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-pink-200 text-pink-700 text-xs font-semibold shadow-xs">
                <Sparkles size={13} className="text-pink-600 animate-pulse" />
                <span>CEO Mode Active • High Intelligence Engine</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 font-sora">
                {getTimeGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700">{userName}</span>
              </h1>
              <p className="text-sm md:text-base text-slate-600 font-medium">
                What would you like to accomplish today? Less clutter. More intelligence.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenVoice ? onOpenVoice() : onNavigate('voice')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-pink-900 border border-pink-200/90 font-medium text-sm shadow-xs backdrop-blur-md transition-all cursor-pointer hover:shadow-md"
            >
              <Mic size={16} className="text-purple-600" />
              <span>Voice Mode</span>
            </button>
            <button
              onClick={() => onNavigate('assignment')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium text-sm shadow-md shadow-pink-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <GraduationCap size={16} />
              <span>New Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input for Dashboard */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* Main Omnibar Prompt Box */}
      <div className="rounded-3xl bg-white/90 border border-pink-200/80 shadow-lg shadow-pink-500/5 p-4 backdrop-blur-md transition-all focus-within:border-pink-400 focus-within:shadow-pink-500/15">
        
        {/* Attached File Preview Badge if uploaded */}
        {attachedFile && (
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-pink-50 border border-pink-200 text-xs font-semibold text-slate-800 shadow-2xs animate-fadeIn">
            <span className="text-pink-600">
              {attachedFile.type === 'pdf' ? <FileText size={14} /> :
               attachedFile.type === 'excel' ? <FileSpreadsheet size={14} /> :
               attachedFile.type === 'image' ? <ImageIcon size={14} /> : <Paperclip size={14} />}
            </span>
            <span className="truncate max-w-[240px]">{attachedFile.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">({attachedFile.size})</span>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask REXLIFY AI anything, generate an assignment, analyze data, or upload files..."
            rows={3}
            className="w-full bg-transparent border-0 resize-none text-slate-800 placeholder-slate-400 focus:outline-hidden text-base leading-relaxed p-2"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pink-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleTriggerFile('any')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50/80 hover:bg-pink-100/80 text-pink-900 border border-pink-200/60 text-xs font-medium transition-all cursor-pointer"
            >
              <Paperclip size={14} className="text-pink-600" />
              <span>Attach</span>
            </button>
            <button
              type="button"
              onClick={() => handleTriggerFile('pdf')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 text-purple-900 border border-purple-200/60 text-xs font-medium transition-all cursor-pointer"
            >
              <FileText size={14} className="text-purple-600" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleTriggerFile('excel')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/60 text-xs font-medium transition-all cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenVoice ? onOpenVoice() : onNavigate('voice')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50/80 hover:bg-rose-100/80 text-rose-900 border border-rose-200/60 text-xs font-medium transition-all cursor-pointer"
            >
              <Mic size={14} className="text-rose-600" />
              <span>Voice</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Press Enter to send</span>
            <button
              type="button"
              disabled={!prompt.trim() && !attachedFile}
              onClick={handleSend}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-40 disabled:pointer-events-none text-white font-medium text-sm shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>Send</span>
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 font-sora flex items-center gap-2">
            <Sparkles size={18} className="text-pink-600" />
            <span>Intelligent Quick Actions</span>
          </h2>
          <button 
            onClick={() => onNavigate('tools')}
            className="text-xs font-semibold text-pink-700 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>All 20+ Tools</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <div
              key={action.id}
              onClick={() => onNavigate(action.tab)}
              className="group relative rounded-2xl p-5 bg-white/80 hover:bg-white border border-pink-100 hover:border-pink-300 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-pink-50/80 group-hover:scale-105 transition-transform">
                    {action.icon}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-pink-100/60 text-pink-800 border border-pink-200/50">
                    {action.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-pink-700 transition-colors">
                  {action.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {action.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-pink-50 flex items-center text-xs font-semibold text-pink-700 group-hover:text-purple-700">
                <span>Launch Tool</span>
                <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects & Recent Files Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="rounded-3xl p-6 bg-white/80 border border-pink-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban size={18} className="text-purple-600" />
              <span>Active Projects</span>
            </h3>
            <button 
              onClick={() => onNavigate('projects')}
              className="text-xs font-semibold text-pink-700 hover:text-purple-700 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentProjects.map((p, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigate('projects')}
                className="p-3.5 rounded-2xl bg-pink-50/40 hover:bg-pink-100/60 border border-pink-100 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>{p.files} files</span>
                    <span>•</span>
                    <span>{p.tasks} tasks</span>
                    <span>•</span>
                    <span className="text-purple-700 font-medium">{p.category}</span>
                  </div>
                </div>
                <ArrowRight size={15} className="text-pink-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div className="rounded-3xl p-6 bg-white/80 border border-pink-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-pink-600" />
              <span>Recent Documents</span>
            </h3>
            <button 
              onClick={() => onNavigate('files')}
              className="text-xs font-semibold text-pink-700 hover:text-purple-700 transition-colors cursor-pointer"
            >
              Open Files
            </button>
          </div>

          <div className="space-y-3">
            {recentFiles.map((f, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigate(f.type === 'PDF' ? 'pdf' : f.type === 'Excel' ? 'excel' : 'chat')}
                className="p-3.5 rounded-2xl bg-pink-50/40 hover:bg-pink-100/60 border border-pink-100 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white border border-pink-200">
                    {f.type === 'PDF' ? (
                      <FileText size={16} className="text-purple-600" />
                    ) : f.type === 'Excel' ? (
                      <FileSpreadsheet size={16} className="text-emerald-600" />
                    ) : (
                      <ImageIcon size={16} className="text-pink-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{f.name}</h4>
                    <span className="text-xs text-slate-500">{f.size} • {f.date}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-pink-200 text-pink-800">
                  {f.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
