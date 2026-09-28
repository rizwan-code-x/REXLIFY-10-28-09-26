import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Home, 
  MessageSquare, 
  Mic, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  FileSpreadsheet, 
  Code, 
  Layout, 
  FolderKanban, 
  FolderOpen, 
  Grid, 
  Brain, 
  BarChart3, 
  Settings, 
  ArrowLeft, 
  Search, 
  PanelRightClose, 
  PanelRightOpen, 
  Plus, 
  User, 
  Cpu, 
  Clock, 
  Zap,
  CheckCircle2,
  X,
  Menu,
  Lock
} from 'lucide-react';
import { RexlifyAiTab, AttachmentPayload } from './types';
import { RexlifyLogo } from '../Logo';
import { SecureExitModal } from '../SecureExitModal';
import { DashboardView } from './DashboardView';
import { ChatView } from './ChatView';
import { VoiceView } from './VoiceView';
import { VoiceModal } from './VoiceModal';
import { AssignmentStudioView } from './AssignmentStudioView';
import { StudyNotesView } from './StudyNotesView';
import { PdfStudioView } from './PdfStudioView';
import { ExcelStudioView } from './ExcelStudioView';
import { CodingAssistantView } from './CodingAssistantView';
import { UiUxArchitectView } from './UiUxArchitectView';
import { ProjectsView } from './ProjectsView';
import { FilesView } from './FilesView';
import { ToolsLibraryView } from './ToolsLibraryView';
import { MemoryView } from './MemoryView';
import { AnalyticsView } from './AnalyticsView';
import { SettingsView } from './SettingsView';

interface RexlifyAiAppProps {
  onBack: () => void;
  userName?: string;
}

export const RexlifyAiApp: React.FC<RexlifyAiAppProps> = ({
  onBack,
  userName = 'Rizwan'
}) => {
  const [activeTab, setActiveTab] = useState<RexlifyAiTab>('dashboard');
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [ceoMode, setCeoMode] = useState<boolean>(true);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [initialPromptForChat, setInitialPromptForChat] = useState<string>('');
  const [initialAttachmentForChat, setInitialAttachmentForChat] = useState<AttachmentPayload | undefined>(undefined);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [commandOpen, setCommandOpen] = useState<boolean>(false);
  const [commandQuery, setCommandQuery] = useState<string>('');

  // Keyboard shortcut for Cmd/Ctrl + K Command Center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: RexlifyAiTab, initialPrompt?: string) => {
    if (tab === 'voice') {
      setVoiceModalOpen(true);
      return;
    }
    if (initialPrompt) {
      setInitialPromptForChat(initialPrompt);
    }
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  const handleSendPromptFromDashboard = (prompt: string, attachment?: AttachmentPayload) => {
    setInitialPromptForChat(prompt);
    setInitialAttachmentForChat(attachment);
    setActiveTab('chat');
  };

  const navItems: { id: RexlifyAiTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={17} /> },
    { id: 'chat', label: 'Multimodal Chat', icon: <MessageSquare size={17} /> },
    { id: 'voice', label: 'Voice AI Mode', icon: <Mic size={17} />, badge: 'Live' },
    { id: 'assignment', label: 'Assignment Studio', icon: <GraduationCap size={17} />, badge: 'PDF' },
    { id: 'study', label: 'Study & Notes', icon: <BookOpen size={17} /> },
    { id: 'pdf', label: 'PDF Document Studio', icon: <FileText size={17} /> },
    { id: 'excel', label: 'Spreadsheet & Data AI', icon: <FileSpreadsheet size={17} /> },
    { id: 'code', label: 'Coding Assistant', icon: <Code size={17} /> },
    { id: 'uiux', label: 'UI/UX Architect', icon: <Layout size={17} /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={17} /> },
    { id: 'files', label: 'Document Vault', icon: <FolderOpen size={17} /> },
    { id: 'tools', label: 'Tools Catalog', icon: <Grid size={17} /> },
    { id: 'memory', label: 'Memory Vault', icon: <Brain size={17} /> },
    { id: 'analytics', label: 'Productivity Stats', icon: <BarChart3 size={17} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={17} /> }
  ];

  const quickCommands = [
    { label: 'Create Academic Assignment', tab: 'assignment' as RexlifyAiTab, desc: 'Generates structured paper with APA citations' },
    { label: 'Analyze PDF Document', tab: 'pdf' as RexlifyAiTab, desc: 'Summarize and check errors in PDF' },
    { label: 'Start Interactive Voice Mode', tab: 'voice' as RexlifyAiTab, desc: 'Speech-to-speech AI assistant' },
    { label: 'Spreadsheet Audit & Charting', tab: 'excel' as RexlifyAiTab, desc: 'Data cleaning, formula assistance, Recharts visualizer' },
    { label: 'Study Notes & Exam Quiz', tab: 'study' as RexlifyAiTab, desc: 'Flashcards, mnemonics, and MCQ test mode' },
    { label: 'Coding Assistant & Refactor', tab: 'code' as RexlifyAiTab, desc: 'Generate and audit production code' }
  ];

  const filteredCommands = quickCommands.filter(c => 
    c.label.toLowerCase().includes(commandQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/50 to-purple-50/60 text-slate-800 font-sans selection:bg-pink-200 selection:text-pink-900">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Left Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 border-r border-pink-200/80 p-5 flex flex-col justify-between backdrop-blur-md transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}>
          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {/* Logo and Brand Header */}
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-3">
                <RexlifyLogo size={38} showText={false} />
                <div>
                  <h1 className="text-base font-bold font-sora text-slate-900 tracking-tight flex items-center gap-1.5">
                    <span>REXLIFY AI</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-700">
                      2.4
                    </span>
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium">Multimodal Cognitive Core</p>
                </div>
              </div>

              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-pink-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* New Chat CTA Button */}
            <button
              onClick={() => {
                setInitialPromptForChat('');
                setActiveTab('chat');
                setMobileSidebarOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium text-xs shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>New Conversation</span>
            </button>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm shadow-pink-500/20'
                        : 'text-slate-600 hover:bg-pink-50 hover:text-pink-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer: CEO Mode & User Profile */}
          <div className="pt-4 border-t border-pink-100 space-y-3">
            <div className="p-3 rounded-2xl bg-pink-50/70 border border-pink-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-pink-600" />
                <span className="text-xs font-bold text-slate-800">CEO Mode</span>
              </div>
              <button
                onClick={() => setCeoMode(!ceoMode)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  ceoMode ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  ceoMode ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-400/80 shadow-xs shrink-0 ring-2 ring-pink-100">
                  <img 
                    src="/IMG-20260912-WA0005.jpg" 
                    onError={(e) => {
                      e.currentTarget.src = "/rizwan_profile.jpg";
                    }}
                    alt="Rizwan (CEO)" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Rizwan (CEO)</p>
                  <p className="text-[10px] text-slate-500 font-mono">rexlify@cloud.net</p>
                </div>
              </div>

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>
          </div>
        </aside>

        {/* Main Center Stage */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Universal Top Header with Sticky Glow Back Button */}
          <header className="h-16 border-b border-pink-200/80 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 z-30 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Hamburger Toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-pink-50 text-slate-700 hover:bg-pink-100 cursor-pointer"
                title="Open menu"
              >
                <Menu size={18} />
              </button>

              {/* SECURE EXIT NAVIGATION BUTTON */}
              <button
                onClick={() => setIsExitModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 shadow-xs hover:shadow-md hover:border-rose-300 text-xs font-semibold transition-all cursor-pointer active:scale-95 group"
                title="Exit Rexlify AI Workspace (Requires Captcha Verification)"
              >
                <Lock size={13} className="text-rose-600" />
                <span>Exit Rexlify AI</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 pl-2">
                <span>REXLIFY AI</span>
                <span>/</span>
                <span className="text-slate-900 font-bold capitalize">{activeTab.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Omnibar Global Command Search Bar */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-pink-50/60 hover:bg-pink-100/60 border border-pink-200/80 text-xs text-slate-500 transition-all cursor-pointer shadow-2xs w-64 lg:w-80"
              >
                <Search size={14} className="text-pink-600" />
                <span className="flex-1 text-left">Search or execute command...</span>
                <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-pink-200 text-[10px] font-mono text-slate-400">
                  ⌘K
                </kbd>
              </button>

              {/* CEO Mode Indicator Pill */}
              {ceoMode && (
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200 text-xs font-bold shadow-2xs">
                  <Sparkles size={12} className="text-pink-600 animate-pulse" />
                  <span>CEO Mode</span>
                </div>
              )}

              {/* Right Panel Toggle Button */}
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="p-2 rounded-2xl bg-white/80 hover:bg-white border border-pink-200 text-slate-700 hover:text-pink-700 transition-all shadow-xs cursor-pointer"
                title={showRightPanel ? 'Hide Context Panel' : 'Show Context Panel'}
              >
                {showRightPanel ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>
            </div>
          </header>

          {/* Dynamic Module Canvas */}
          <div className={`flex-1 ${activeTab === 'chat' ? 'overflow-hidden p-2 sm:p-4 flex flex-col' : 'overflow-y-auto p-4 sm:p-6 lg:p-8'}`}>
            {activeTab === 'dashboard' && (
              <DashboardView 
                onNavigate={handleNavigate} 
                onSendPrompt={handleSendPromptFromDashboard}
                onOpenVoice={() => setVoiceModalOpen(true)}
                userName={userName}
              />
            )}
            {activeTab === 'chat' && (
              <ChatView 
                ceoMode={ceoMode} 
                initialPrompt={initialPromptForChat}
                initialAttachment={initialAttachmentForChat}
                onNavigateToVoice={() => setVoiceModalOpen(true)}
                onBackToDashboard={() => {
                  setInitialPromptForChat('');
                  setInitialAttachmentForChat(undefined);
                  setActiveTab('dashboard');
                }}
              />
            )}
            {activeTab === 'voice' && (
              <VoiceView 
                ceoMode={ceoMode} 
                onSwitchToChat={(transcript) => {
                  setInitialPromptForChat(transcript);
                  setActiveTab('chat');
                }}
              />
            )}
            {activeTab === 'assignment' && <AssignmentStudioView />}
            {activeTab === 'study' && <StudyNotesView />}
            {activeTab === 'pdf' && <PdfStudioView />}
            {activeTab === 'excel' && <ExcelStudioView />}
            {activeTab === 'code' && <CodingAssistantView />}
            {activeTab === 'uiux' && <UiUxArchitectView />}
            {activeTab === 'projects' && <ProjectsView />}
            {activeTab === 'files' && <FilesView />}
            {activeTab === 'tools' && <ToolsLibraryView onSelectTool={handleNavigate} />}
            {activeTab === 'memory' && <MemoryView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'settings' && (
              <SettingsView 
                ceoMode={ceoMode} 
                onToggleCeoMode={() => setCeoMode(!ceoMode)} 
              />
            )}
          </div>
        </main>

        {/* Right Context Panel (Collapsible) */}
        {showRightPanel && (
          <aside className="w-80 border-l border-pink-200/80 bg-white/90 p-5 hidden xl:flex flex-col justify-between backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <h3 className="text-xs font-bold text-slate-800 font-sora flex items-center gap-2">
                  <Cpu size={14} className="text-pink-600" />
                  <span>Cognitive Context</span>
                </h3>
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Telemetry Metrics */}
              <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Model:</span>
                  <span className="font-bold text-pink-700">Gemini 2.5 Flash</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Response Latency:</span>
                  <span className="font-mono font-bold text-slate-800">124 ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Security Invariant:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Verified Cloud
                  </span>
                </div>
              </div>

              {/* Active Project Context */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Active Project Memory</h4>
                <div className="p-3 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-1">
                  <p className="text-xs font-bold text-slate-900">Autonomous Robotics Agent</p>
                  <p className="text-[11px] text-slate-500">12 files indexed • 2 pending tasks</p>
                </div>
              </div>

              {/* Quick Prompt Inspirations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Suggested Inquiries</h4>
                <div className="space-y-1.5">
                  {[
                    'Synthesize constitutional law case review',
                    'Audit Q2 revenue variance in Excel',
                    'Explain neural backprop chain rule in Bengali',
                    'Generate full-stack TypeScript agent pipeline'
                  ].map((tip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendPromptFromDashboard(tip)}
                      className="w-full text-left p-2.5 rounded-xl bg-pink-50/40 hover:bg-pink-100/60 border border-pink-100 text-[11px] text-slate-700 hover:text-pink-900 transition-all cursor-pointer leading-tight"
                    >
                      {tip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-pink-100 text-[10px] text-slate-400 font-mono text-center">
              REXLIFY AI Core • v2.4.0 Live
            </div>
          </aside>
        )}
      </div>

      {/* Global Omnibar Command Palette Modal (Cmd/Ctrl + K) */}
      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-white p-4 shadow-2xl border border-pink-200 space-y-4 animate-scaleUp">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-pink-600" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Search commands, navigate modules, or launch tools..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-pink-50/40 border border-pink-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-pink-500"
              />
              <button
                onClick={() => setCommandOpen(false)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-pink-50">
              {filteredCommands.map((cmd, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab(cmd.tab);
                    setCommandOpen(false);
                  }}
                  className="p-3 rounded-2xl hover:bg-pink-50/80 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{cmd.label}</p>
                    <p className="text-[10px] text-slate-500">{cmd.desc}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-pink-100 text-pink-700">
                    Jump
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Centralized Voice Engine Modal with Barge-in & VAD */}
      {voiceModalOpen && (
        <VoiceModal 
          isOpen={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          ceoMode={ceoMode}
          onSwitchToChat={(transcript) => {
            setInitialPromptForChat(transcript);
            setActiveTab('chat');
            setVoiceModalOpen(false);
          }}
        />
      )}

      {/* Security Captcha Exit Modal */}
      <SecureExitModal
        isOpen={isExitModalOpen}
        appName="Rexlify AI Suite"
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          onBack();
        }}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
};
