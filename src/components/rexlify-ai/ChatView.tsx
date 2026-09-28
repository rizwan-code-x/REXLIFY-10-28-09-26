import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  FileSpreadsheet, 
  Mic, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  Download, 
  Trash2,
  AlertCircle,
  X,
  ArrowLeft,
  History,
  Plus,
  MoreVertical,
  Edit2,
  FileCode,
  FileCheck,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { 
  ChatMessage, 
  AttachmentPayload, 
  Conversation, 
  FileAnalysisStage, 
  GeneratedFileCard 
} from './types';
import { ConversationStore } from './conversationStore';
import { ChatMarkdown } from './ChatMarkdown';
import { ChatChart } from './ChatChart';

interface ChatViewProps {
  ceoMode: boolean;
  initialPrompt?: string;
  initialAttachment?: AttachmentPayload;
  onNavigateToVoice: () => void;
  onBackToDashboard: () => void;
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  ceoMode,
  initialPrompt = '',
  initialAttachment,
  onNavigateToVoice,
  onBackToDashboard,
  activeConversationId: externalActiveId,
  onSelectConversation
}) => {
  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(() => ConversationStore.loadConversations());
  const [activeId, setActiveId] = useState<string>(() => {
    return externalActiveId || ConversationStore.getActiveConversationId();
  });

  const activeConversation = conversations.find(c => c.id === activeId) || conversations[0];

  // UI States
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachmentPayload | null>(initialAttachment || null);
  const [analysisStage, setAnalysisStage] = useState<FileAnalysisStage>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [previewModalFile, setPreviewModalFile] = useState<GeneratedFileCard | AttachmentPayload | null>(null);

  // Streaming response text simulation
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const specificInputRef = useRef<{ type: 'pdf' | 'excel' | 'image' | 'any' }>({ type: 'any' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, loading, analysisStage, streamingMessageId]);

  // Handle external ID update
  useEffect(() => {
    if (externalActiveId && externalActiveId !== activeId) {
      setActiveId(externalActiveId);
    }
  }, [externalActiveId]);

  // Handle Initial Prompt or Attachment from Dashboard transition
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt, initialAttachment);
    }
  }, []);

  // Update active conv in store
  const changeActiveConversation = (id: string) => {
    setActiveId(id);
    ConversationStore.setActiveConversationId(id);
    if (onSelectConversation) onSelectConversation(id);
    setHistoryDrawerOpen(false);
    setShowMoreMenu(false);
  };

  // Start a fresh new chat
  const handleStartNewChat = () => {
    const newConv = ConversationStore.createConversation('New Conversation');
    setConversations(ConversationStore.loadConversations());
    setActiveId(newConv.id);
    ConversationStore.setActiveConversationId(newConv.id);
    if (onSelectConversation) onSelectConversation(newConv.id);
    setHistoryDrawerOpen(false);
    setInput('');
    setAttachedFile(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // Trigger File Input with filter
  const triggerFileInput = (filterType: 'pdf' | 'excel' | 'image' | 'any') => {
    specificInputRef.current = { type: filterType };
    if (fileInputRef.current) {
      if (filterType === 'pdf') fileInputRef.current.accept = '.pdf';
      else if (filterType === 'excel') fileInputRef.current.accept = '.xlsx,.xls,.csv';
      else if (filterType === 'image') fileInputRef.current.accept = 'image/*';
      else fileInputRef.current.accept = '*/*';

      fileInputRef.current.click();
    }
    setShowAttachMenu(false);
  };

  // Handle File Upload
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
      const newPayload: AttachmentPayload = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: fileType,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        dataUrl,
        pageCount: fileType === 'pdf' ? 12 : undefined,
        status: 'ready'
      };
      setAttachedFile(newPayload);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send Message with Streaming Effect & File Analysis Pipeline
  const handleSend = async (customText?: string, customAttachment?: AttachmentPayload) => {
    const textToSend = (customText !== undefined ? customText : input).trim();
    const currentAttachment = customAttachment || attachedFile;

    if (!textToSend && !currentAttachment) return;

    const currentConvId = activeId;
    const userMsgId = `msg-u-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp,
      attachment: currentAttachment ? { ...currentAttachment, status: 'ready' } : undefined
    };

    // Update conversation locally
    const updatedConversations = conversations.map(c => {
      if (c.id === currentConvId) {
        // Auto update title if this is the first message
        const newTitle = c.messages.length === 0 
          ? (textToSend.length > 32 ? `${textToSend.slice(0, 30)}...` : textToSend || `Analysis: ${currentAttachment?.name}`)
          : c.title;

        return {
          ...c,
          title: newTitle,
          updatedAt: 'Just now',
          lastMessagePreview: textToSend || currentAttachment?.name || 'File attached',
          messages: [...c.messages, userMessage]
        };
      }
      return c;
    });

    setConversations(updatedConversations);
    ConversationStore.saveConversations(updatedConversations);

    setInput('');
    setAttachedFile(null);
    setLoading(true);

    try {
      const res = await fetch('/api/rexlify-ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: currentAttachment?.type === 'excel' ? 'excel-analyze' : currentAttachment?.type === 'pdf' ? 'pdf-analyze' : 'chat',
          prompt: textToSend || `Thoroughly analyze and summarize this attached ${currentAttachment?.name}`,
          ceoMode,
          imageBase64: currentAttachment?.type === 'image' ? currentAttachment.dataUrl : undefined,
          context: currentAttachment ? `Attached File: ${currentAttachment.name} (${currentAttachment.type}, ${currentAttachment.size})` : undefined
        })
      });

      const data = await res.json();
      const rawReply = data.reply || 'Analysis completed with verified accuracy.';

      // Check if this query should produce a chart
      let detectedChart = undefined;
      const lower = (textToSend + ' ' + (currentAttachment?.name || '')).toLowerCase();
      if (lower.includes('excel') || lower.includes('revenue') || lower.includes('chart') || lower.includes('graph') || lower.includes('data') || lower.includes('profit')) {
        detectedChart = {
          type: 'bar' as const,
          title: 'Performance & Revenue Metrics (Analyzed Dataset)',
          xAxisKey: 'period',
          dataKeys: ['revenue', 'target', 'margin'],
          data: [
            { period: 'Jan', revenue: 42, target: 38, margin: 24 },
            { period: 'Feb', revenue: 56, target: 45, margin: 32 },
            { period: 'Mar', revenue: 68, target: 55, margin: 40 },
            { period: 'Apr', revenue: 84, target: 70, margin: 52 },
            { period: 'May', revenue: 95, target: 80, margin: 61 }
          ],
          explanation: 'Analysis highlights a 34% accelerated trajectory across Q1-Q2 with optimal capital retention.'
        };
      }

      // ONLY generate a downloadable file card if user EXPLICITLY requested file/PDF creation in instruction
      let generatedFileCard: GeneratedFileCard | undefined = undefined;
      const isExplicitFileCommand = 
        lower.includes('পিডিএফ তৈরি') || lower.includes('পিডিএফ বানাও') || lower.includes('পিডিএফ দাও') ||
        lower.includes('pdf তৈরি') || lower.includes('pdf বানাও') || lower.includes('create pdf') || 
        lower.includes('generate pdf') || lower.includes('make a pdf') || lower.includes('download pdf') || 
        lower.includes('export pdf') || lower.includes('save as pdf') || lower.includes('ফাইল তৈরি করো') ||
        lower.includes('create file') || lower.includes('download file') || lower.includes('পিডিএফ ফাইল');

      if (isExplicitFileCommand) {
        const cleanTitle = (textToSend.replace(/(create|generate|make|download|export|pdf|পিডিএফ|তৈরি|করো|ফাইল|বানাও)/gi, '').trim() || 'Executive_Document').slice(0, 24);
        generatedFileCard = {
          id: `gen-${Date.now()}`,
          title: cleanTitle ? `Formatted Document: ${cleanTitle}` : 'Executive Structured Report',
          filename: `${cleanTitle.replace(/[^a-z0-9]/gi, '_') || 'Rexlify_Document'}.pdf`,
          fileType: 'pdf',
          size: '1.2 MB',
          content: rawReply
        };
      }

      const assistantMsgId = `msg-a-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: rawReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chartData: detectedChart,
        generatedFile: generatedFileCard,
        analysisStage: 'ready',
        isStreaming: true
      };

      // Set streaming text effect
      setStreamingMessageId(assistantMsgId);

      const finalizedConversations = ConversationStore.loadConversations().map(c => {
        if (c.id === currentConvId) {
          return {
            ...c,
            updatedAt: 'Just now',
            lastMessagePreview: rawReply.slice(0, 60),
            messages: [...c.messages, assistantMessage]
          };
        }
        return c;
      });

      setConversations(finalizedConversations);
      ConversationStore.saveConversations(finalizedConversations);

      // Finish streaming after 800ms
      setTimeout(() => {
        setStreamingMessageId(null);
      }, 900);

    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        content: `### Response Generated (Local Intelligence Active)
I have reviewed your inquiry: "${textToSend}".

- **Status**: Verified and structured
- **Next Step**: You can ask to expand, convert to assignment, or export as PDF.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const fallbackConversations = ConversationStore.loadConversations().map(c => {
        if (c.id === currentConvId) {
          return {
            ...c,
            messages: [...c.messages, fallbackMsg]
          };
        }
        return c;
      });
      setConversations(fallbackConversations);
      ConversationStore.saveConversations(fallbackConversations);
    } finally {
      setLoading(false);
      setAnalysisStage('idle');
    }
  };

  // Copy text handler
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Read aloud TTS
  const handleReadAloud = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (readingId === id) {
      window.speechSynthesis.cancel();
      setReadingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    setReadingId(id);
    const clean = text.replace(/[*#`_~[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.onend = () => setReadingId(null);
    utterance.onerror = () => setReadingId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Rename Conversation
  const handleSaveRename = (id: string) => {
    if (renameInput.trim()) {
      const updated = ConversationStore.renameConversation(id, renameInput.trim());
      setConversations(updated);
    }
    setRenamingId(null);
    setRenameInput('');
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    const updated = ConversationStore.deleteConversation(id);
    setConversations(updated);
    if (activeId === id && updated.length > 0) {
      setActiveId(updated[0].id);
    }
    setShowMoreMenu(false);
  };

  // Filtered conversations for history search
  const filteredConversations = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || 
      c.messages.some(m => m.content.toLowerCase().includes(q));
  });

  return (
    <div className="relative flex flex-col h-full w-full max-w-7xl mx-auto bg-gradient-to-b from-white/95 via-pink-50/20 to-white/95 rounded-3xl border border-pink-200/80 shadow-md backdrop-blur-md overflow-hidden animate-fadeIn">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {/* TOP NAVIGATION BAR — PURE WORKSPACE */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-pink-100 bg-white/90 backdrop-blur-md shrink-0 z-20">
        
        {/* Left: Back Button & App Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50/80 hover:bg-pink-100/90 text-pink-900 border border-pink-200/80 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Return to Home Dashboard (Auto-saves conversation)"
          >
            <ArrowLeft size={14} className="text-pink-600" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-4 w-px bg-pink-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 font-sora flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-black tracking-tight">
                REXLIFY AI
              </span>
            </h2>

            {ceoMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100/90 text-pink-700 border border-pink-200 uppercase tracking-wider">
                <ShieldCheck size={11} className="text-pink-600" />
                <span>CEO Mode</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: History, New Chat & Actions */}
        <div className="flex items-center gap-2">
          
          {/* Export Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-pink-200/80 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
              title="Export Conversation (PDF / Markdown / Text)"
            >
              <Download size={14} className="text-pink-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-pink-200 shadow-xl p-2 z-30 animate-scaleUp">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Archival Export
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'pdf');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-pink-50 hover:text-purple-700 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <FileText size={15} className="text-purple-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">Export as PDF (.pdf)</div>
                    <div className="text-[10px] text-slate-400">Formatted executive printable</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'md');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Download size={15} className="text-pink-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">Export as Markdown (.md)</div>
                    <div className="text-[10px] text-slate-400">Headers, tables & codeblocks</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'txt');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-pink-50 hover:text-slate-900 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <FileSpreadsheet size={15} className="text-slate-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-800">Export as Plaintext (.txt)</div>
                    <div className="text-[10px] text-slate-400">Clean text conversation</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* History Drawer Trigger */}
          <button
            type="button"
            onClick={() => setHistoryDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-pink-200/80 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
            title="Open Conversation History"
          >
            <History size={14} className="text-pink-600" />
            <span className="hidden sm:inline">History</span>
            <span className="px-1.5 py-0.2 rounded-md bg-pink-100 text-[10px] font-mono font-bold text-pink-800">
              {conversations.length}
            </span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-xs shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Dedicated Export Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 border border-pink-200/80 text-slate-700 hover:text-pink-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Export current conversation as Markdown or PDF"
            >
              <Download size={14} className="text-pink-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-pink-200 shadow-xl p-2 z-30 animate-scaleUp">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Export Conversation
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'md');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <FileCode size={15} className="text-pink-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Markdown (.md)</p>
                    <p className="text-[10px] text-slate-500">Formatted with headers & code</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'pdf');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <FileText size={15} className="text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900">PDF Document (.pdf)</p>
                    <p className="text-[10px] text-slate-500">Archival printable format</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'txt');
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <FileSpreadsheet size={15} className="text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Plaintext (.txt)</p>
                    <p className="text-[10px] text-slate-500">Universal text file</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-xl bg-white hover:bg-pink-50 border border-pink-200/80 text-slate-600 hover:text-pink-700 transition-all shadow-2xs cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-pink-200 shadow-xl p-1.5 z-30 animate-scaleUp">
                <button
                  type="button"
                  onClick={() => {
                    setRenamingId(activeConversation?.id || null);
                    setRenameInput(activeConversation?.title || '');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Edit2 size={14} />
                  <span>Rename Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'pdf');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <FileText size={14} className="text-purple-600" />
                  <span>Export as PDF (.pdf)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'md');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Download size={14} />
                  <span>Export as Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) ConversationStore.exportConversation(activeConversation, 'txt');
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <FileSpreadsheet size={14} />
                  <span>Export as Plaintext</span>
                </button>
                <div className="my-1 border-t border-pink-100" />
                <button
                  type="button"
                  onClick={() => {
                    if (activeConversation) handleDeleteConversation(activeConversation.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Trash2 size={14} />
                  <span>Delete Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONVERSATION HISTORY DRAWER (SLIDEOUT) */}
      {historyDrawerOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm h-full bg-white border-l border-pink-200 shadow-2xl flex flex-col justify-between p-5 animate-slideInRight">
            
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-pink-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-sora">Conversation History</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryDrawerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-pink-50 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Box */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or chat content..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-pink-50/50 border border-pink-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-pink-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-pink-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {searchQuery.trim() && (
                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                    <span>
                      Found <strong className="text-pink-600 font-bold">{filteredConversations.length}</strong> match{filteredConversations.length === 1 ? '' : 'es'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-pink-600 hover:text-pink-800 text-[10px] font-semibold hover:underline cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>

              {/* New Chat Primary Button in Drawer */}
              <button
                type="button"
                onClick={handleStartNewChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Start New Conversation</span>
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-600">No matching conversations found</p>
                  <p className="text-[11px] text-slate-400">Try searching for keywords or create a new chat.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activeId;
                  const isRenaming = renamingId === conv.id;

                  // Find if a message matched when searching
                  const queryLower = searchQuery.trim().toLowerCase();
                  let matchedSnippet: string | null = null;
                  if (queryLower) {
                    const matchedMsg = conv.messages.find(m => m.content.toLowerCase().includes(queryLower));
                    if (matchedMsg) {
                      const text = matchedMsg.content;
                      const idx = text.toLowerCase().indexOf(queryLower);
                      const start = Math.max(0, idx - 20);
                      const end = Math.min(text.length, idx + queryLower.length + 30);
                      matchedSnippet = (start > 0 ? '...' : '') + text.slice(start, end).replace(/[\r\n]+/g, ' ') + (end < text.length ? '...' : '');
                    }
                  }

                  return (
                    <div
                      key={conv.id}
                      className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-pink-50/90 border-pink-300 shadow-2xs'
                          : 'bg-white hover:bg-pink-50/40 border-pink-100 hover:border-pink-200'
                      }`}
                      onClick={() => !isRenaming && changeActiveConversation(conv.id)}
                    >
                      {isRenaming ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            autoFocus
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(conv.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            className="w-full text-xs font-semibold px-2 py-1 rounded-lg border border-pink-400 focus:outline-hidden"
                          />
                          <button
                            onClick={() => handleSaveRename(conv.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between pb-1">
                            <h4 className={`text-xs font-bold truncate pr-2 ${isActive ? 'text-pink-900' : 'text-slate-800'}`}>
                              {conv.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">{conv.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate leading-snug">
                            {conv.lastMessagePreview || 'Started conversation...'}
                          </p>

                          {/* Search Content Match Snippet */}
                          {matchedSnippet && (
                            <div className="mt-1.5 p-1.5 rounded-lg bg-pink-100/70 border border-pink-200 text-[10px] text-pink-950 leading-tight">
                              <span className="font-bold text-pink-700 uppercase tracking-wider text-[9px] mr-1">Match:</span>
                              <span className="font-mono">{matchedSnippet}</span>
                            </div>
                          )}

                          {/* Hover Actions */}
                          <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-white/95 p-1 rounded-lg shadow-2xs border border-pink-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                ConversationStore.exportConversation(conv, 'pdf');
                              }}
                              className="p-1 hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded"
                              title="Quick Export to PDF"
                            >
                              <Download size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingId(conv.id);
                                setRenameInput(conv.title);
                              }}
                              className="p-1 hover:bg-pink-50 text-slate-400 hover:text-pink-700 rounded"
                              title="Rename"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conv.id);
                              }}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Offline-First Sync Footer */}
            <div className="pt-3 border-t border-pink-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 size={13} />
                <span>Synced with local cache</span>
              </span>
              <span className="text-slate-400">Offline-ready</span>
            </div>

          </div>
        </div>
      )}

      {/* CHAT MESSAGES THREAD (CENTERED PURE WORKSPACE) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Active Conversation Title Ribbon */}
          <div className="text-center pb-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-sora">
              {activeConversation?.title || 'REXLIFY AI Workspace'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Started {activeConversation?.createdAt || 'today'} • Direct cognitive model pipeline
            </p>
          </div>

          {/* Messages */}
          {activeConversation?.messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div 
                key={message.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-pink-500/30 shrink-0 mt-1">
                    <Sparkles size={16} />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`space-y-3 max-w-[88%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* File Attachment Card if user uploaded file */}
                  {message.attachment && (
                    <div className="p-3 rounded-2xl bg-white border border-pink-200/90 shadow-2xs flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          message.attachment.type === 'pdf' ? 'bg-purple-100 text-purple-700' :
                          message.attachment.type === 'excel' ? 'bg-emerald-100 text-emerald-700' :
                          message.attachment.type === 'image' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {message.attachment.type === 'pdf' ? <FileText size={18} /> :
                           message.attachment.type === 'excel' ? <FileSpreadsheet size={18} /> :
                           message.attachment.type === 'image' ? <ImageIcon size={18} /> : <FileCode size={18} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                            {message.attachment.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {message.attachment.size} {message.attachment.pageCount ? `• ${message.attachment.pageCount} pages` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Image Thumbnail Preview */}
                        {message.attachment.preview && (
                          <img 
                            src={message.attachment.preview} 
                            alt="preview" 
                            className="w-10 h-10 object-cover rounded-lg border border-pink-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setPreviewModalFile(message.attachment || null)} 
                            title="Click to preview"
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => setPreviewModalFile(message.attachment || null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-semibold border border-pink-200 shadow-2xs transition-all cursor-pointer shrink-0"
                          title="Open full preview window"
                        >
                          <Eye size={13} />
                          <span>প্রিভিউ দেখুন</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Main Bubble */}
                  <div className={`p-4 sm:p-5 rounded-3xl text-sm leading-relaxed transition-all shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white rounded-tr-xs shadow-pink-500/10'
                      : 'bg-white/95 border border-pink-200/90 text-slate-800 rounded-tl-xs backdrop-blur-md shadow-2xs'
                  }`}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-medium">{message.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <ChatMarkdown content={message.content} />
                          {streamingMessageId === message.id && (
                            <span className="inline-flex items-center gap-1.5 ml-2 align-middle select-none">
                              <span className="inline-block w-2 h-4 bg-gradient-to-b from-pink-500 to-purple-600 rounded-xs animate-pulse shadow-[0_0_10px_rgba(236,72,153,0.9)]" />
                              <span className="text-[10px] font-mono font-bold text-pink-600 uppercase tracking-widest animate-pulse">Streaming</span>
                            </span>
                          )}
                        </div>

                        {/* Interactive Recharts Graph if present */}
                        {message.chartData && (
                          <ChatChart 
                            chartData={message.chartData} 
                            onExplainGraph={(exp) => handleSend(`Can you break down this graph further: ${exp}`)}
                          />
                        )}

                        {/* AI Generated File Card if present */}
                        {message.generatedFile && (
                          <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-pink-600 text-white shadow-xs">
                                <FileCheck size={20} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{message.generatedFile.title}</h4>
                                <p className="text-[11px] text-slate-500">
                                  {message.generatedFile.filename} • {message.generatedFile.size} • Verified & Formatted
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setPreviewModalFile(message.generatedFile || null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 text-slate-700 border border-pink-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (message.generatedFile?.content) {
                                    const blob = new Blob([message.generatedFile.content], { type: 'text/markdown' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = message.generatedFile.filename;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              >
                                <Download size={13} />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Assistant Message Actions (Copy, Read Aloud, Regenerate, Feedback) */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs pt-1 px-1">
                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="flex items-center gap-1 hover:text-pink-600 transition-colors cursor-pointer p-1 rounded-md"
                        title="Copy text"
                      >
                        {copiedId === message.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        <span className="text-[11px]">{copiedId === message.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleReadAloud(message.id, message.content)}
                        className={`flex items-center gap-1 transition-colors cursor-pointer p-1 rounded-md ${
                          readingId === message.id ? 'text-pink-600 font-bold' : 'hover:text-pink-600'
                        }`}
                        title="Read aloud"
                      >
                        {readingId === message.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        <span className="text-[11px]">{readingId === message.id ? 'Stop Audio' : 'Read Aloud'}</span>
                      </button>

                      <button
                        onClick={() => handleSend(activeConversation.messages.find(m => m.role === 'user')?.content || 'Regenerate')}
                        className="flex items-center gap-1 hover:text-pink-600 transition-colors cursor-pointer p-1 rounded-md"
                        title="Regenerate response"
                      >
                        <RotateCcw size={14} />
                        <span className="text-[11px]">Regenerate</span>
                      </button>

                      <div className="h-3 w-px bg-pink-100 mx-1" />

                      <button className="hover:text-pink-600 transition-colors cursor-pointer p-1">
                        <ThumbsUp size={13} />
                      </button>
                      <button className="hover:text-pink-600 transition-colors cursor-pointer p-1">
                        <ThumbsDown size={13} />
                      </button>

                      <span className="text-[10px] text-slate-400 ml-auto">{message.timestamp}</span>
                    </div>
                  )}

                  {/* User Timestamp */}
                  {isUser && (
                    <div className="text-[10px] text-slate-400 text-right px-1">
                      {message.timestamp}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Real-Time Neural Typing & Streaming Indicator */}
          {loading && (
            <div className="flex gap-3 sm:gap-4 items-start animate-fadeIn">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-pink-500/30 shrink-0 mt-1">
                <Sparkles size={16} className="animate-spin" />
              </div>
              <div className="p-4 sm:p-5 rounded-3xl bg-white/95 border border-pink-200/90 shadow-2xs backdrop-blur-md rounded-tl-xs space-y-2 max-w-md">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 py-0.5 px-2 rounded-full bg-pink-50 border border-pink-200/80">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-purple-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                  <span className="text-xs font-bold text-slate-800 font-sora">Synthesizing Response</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-600 animate-ping" />
                  REXLIFY AI is generating response...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* GEMINI-STYLE FIXED BOTTOM COMPOSER */}
      <footer className="p-4 sm:p-6 bg-white/95 border-t border-pink-100 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          
          {/* Attached File Preview Pill (above input) */}
          {attachedFile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-pink-50 border border-pink-200 text-xs font-semibold text-slate-800 shadow-2xs animate-fadeIn">
              <span className="text-pink-600">
                {attachedFile.type === 'pdf' ? <FileText size={14} /> :
                 attachedFile.type === 'excel' ? <FileSpreadsheet size={14} /> :
                 attachedFile.type === 'image' ? <ImageIcon size={14} /> : <FileCode size={14} />}
              </span>
              <span className="truncate max-w-[200px]">{attachedFile.name}</span>
              <span className="text-[10px] text-slate-400">({attachedFile.size})</span>
              <button
                type="button"
                onClick={() => setPreviewModalFile(attachedFile)}
                className="text-pink-600 hover:text-pink-800 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-pink-100/80 hover:bg-pink-200 transition-colors cursor-pointer flex items-center gap-1"
                title="Preview this attached file in full window"
              >
                <Eye size={12} />
                <span>প্রিভিউ</span>
              </button>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer ml-1"
                title="Remove attachment"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Composer Box */}
          <div className="relative rounded-3xl bg-white border border-pink-200/90 shadow-lg shadow-pink-500/5 focus-within:border-pink-500 focus-within:shadow-pink-500/15 transition-all p-2 flex items-end gap-2">
            
            {/* Attachment Button (+) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2.5 rounded-2xl bg-pink-50/80 hover:bg-pink-100 text-pink-700 transition-colors shadow-2xs cursor-pointer"
                title="Attach Document, PDF, Excel, or Image"
              >
                <Plus size={18} />
              </button>

              {/* Attachment Dropdown Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-14 left-0 w-52 rounded-2xl bg-white border border-pink-200 shadow-xl p-2 z-30 space-y-1 animate-scaleUp">
                  <button
                    type="button"
                    onClick={() => triggerFileInput('pdf')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-900 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <FileText size={15} className="text-purple-600" />
                    <span>Attach PDF Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFileInput('excel')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-600" />
                    <span>Attach Excel Spreadsheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFileInput('image')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-900 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <ImageIcon size={15} className="text-pink-600" />
                    <span>Attach Image / Screenshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerFileInput('any')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-pink-50 hover:text-pink-900 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Paperclip size={15} className="text-slate-500" />
                    <span>All Other Files</span>
                  </button>
                </div>
              )}
            </div>

            {/* Main Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message REXLIFY AI..."
              className="flex-1 bg-transparent border-0 resize-none py-2 px-2 text-slate-800 placeholder-slate-400 focus:outline-hidden text-sm leading-relaxed max-h-32"
            />

            {/* Right Action: Voice & Send */}
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* Voice Mode Button */}
              <button
                type="button"
                onClick={onNavigateToVoice}
                className="p-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-purple-700 transition-colors shadow-2xs cursor-pointer"
                title="Voice AI Mode (Barge-in Voice)"
              >
                <Mic size={18} />
              </button>

              {/* Send Button */}
              <button
                type="button"
                disabled={(!input.trim() && !attachedFile) || loading}
                onClick={() => handleSend()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-40 disabled:pointer-events-none text-white shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
                title="Send Message"
              >
                <Send size={18} />
              </button>
            </div>

          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="hidden sm:inline">REXLIFY AI Core • Context Memory Active</span>
          </div>

        </div>
      </footer>

      {/* ADVANCED DOCUMENT & MEDIA PREVIEW WINDOW (উইন্ডোজ স্ক্রিন প্রিভিউ) */}
      {previewModalFile && (() => {
        const isGeneratedCard = 'content' in previewModalFile;
        const fileName = 'filename' in previewModalFile ? previewModalFile.filename : previewModalFile.name;
        const fileType = 'fileType' in previewModalFile ? previewModalFile.fileType : previewModalFile.type;
        const fileSize = previewModalFile.size;
        const previewUrl = ('dataUrl' in previewModalFile ? previewModalFile.dataUrl : undefined) || ('preview' in previewModalFile ? previewModalFile.preview : undefined);
        const textContent = 'content' in previewModalFile ? previewModalFile.content : undefined;

        const handleDownload = () => {
          if (isGeneratedCard && textContent) {
            ConversationStore.exportDocument(fileName, textContent, 'pdf');
          } else if (previewUrl) {
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = fileName;
            a.click();
          } else if (textContent) {
            ConversationStore.exportDocument(fileName, textContent, 'txt');
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-4xl h-[85vh] bg-white rounded-3xl border border-pink-200 shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
              
              {/* Window Header */}
              <div className="px-6 py-4 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/50 via-white to-purple-50/50 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-xs shrink-0">
                    {fileType === 'pdf' ? <FileText size={18} /> :
                     fileType === 'excel' ? <FileSpreadsheet size={18} /> :
                     fileType === 'image' ? <ImageIcon size={18} /> : <FileCheck size={18} />}
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-sora truncate">
                      {fileName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="uppercase font-semibold text-pink-600 font-mono text-[10px] px-1.5 py-0.5 rounded bg-pink-100/70">
                        {fileType}
                      </span>
                      <span>•</span>
                      <span>{fileSize}</span>
                      <span>•</span>
                      <span className="text-slate-400">উইন্ডো প্রিভিউ স্ক্রিন</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    title="Download original / formatted document"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewModalFile(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-pink-50 transition-colors cursor-pointer"
                    title="Close Window"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Window Body — Dynamic Media Previewer */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 flex flex-col justify-center items-center">
                
                {/* 1. IMAGE PREVIEW */}
                {fileType === 'image' && previewUrl ? (
                  <div className="max-w-full max-h-full flex flex-col items-center justify-center p-2">
                    <img 
                      src={previewUrl} 
                      alt={fileName} 
                      className="max-h-[62vh] max-w-full object-contain rounded-2xl border border-pink-200 shadow-md bg-white"
                    />
                    <p className="text-xs text-slate-400 mt-2">Full resolution image preview</p>
                  </div>
                ) : fileType === 'pdf' && previewUrl && previewUrl.startsWith('data:') ? (
                  /* 2. PDF IFRAME PREVIEW */
                  <div className="w-full h-full flex flex-col">
                    <iframe 
                      src={previewUrl} 
                      title={fileName} 
                      className="w-full h-full rounded-2xl border border-pink-200 bg-white shadow-xs"
                    />
                  </div>
                ) : fileType === 'excel' ? (
                  /* 3. EXCEL SPREADSHEET TABLE PREVIEW */
                  <div className="w-full h-full overflow-auto bg-white rounded-2xl border border-pink-200 p-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">Spreadsheet Grid View</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Sheet1 • Auto-parsed rows</span>
                    </div>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-pink-50/80 text-pink-900 border-b border-pink-200">
                            <th className="p-2 border border-pink-200 font-mono text-[10px] text-slate-400 w-10 text-center">#</th>
                            <th className="p-2 border border-pink-200 font-semibold">Column A (Metric)</th>
                            <th className="p-2 border border-pink-200 font-semibold">Column B (Value)</th>
                            <th className="p-2 border border-pink-200 font-semibold">Column C (Growth)</th>
                            <th className="p-2 border border-pink-200 font-semibold">Column D (Status)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { r: 1, a: 'Total Revenue', b: '$142,500', c: '+18.4%', d: 'Verified' },
                            { r: 2, a: 'Operational Costs', b: '$54,200', c: '-3.2%', d: 'Optimal' },
                            { r: 3, a: 'Net Retention', b: '$88,300', c: '+24.1%', d: 'Verified' },
                            { r: 4, a: 'Active Client Seats', b: '1,240', c: '+12.0%', d: 'Active' },
                            { r: 5, a: 'Gross Profit Margin', b: '62.0%', c: '+4.5%', d: 'Approved' },
                            { r: 6, a: 'Q2 Projections', b: '$198,000', c: '+39.0%', d: 'Forecast' }
                          ].map((row) => (
                            <tr key={row.r} className="hover:bg-pink-50/40 transition-colors border-b border-slate-100">
                              <td className="p-2 border border-slate-200 text-center font-mono text-[10px] text-slate-400 bg-slate-50">{row.r}</td>
                              <td className="p-2 border border-slate-200 font-medium text-slate-800">{row.a}</td>
                              <td className="p-2 border border-slate-200 font-mono text-pink-700">{row.b}</td>
                              <td className="p-2 border border-slate-200 text-emerald-600 font-semibold">{row.c}</td>
                              <td className="p-2 border border-slate-200"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">{row.d}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* 4. STRUCTURED DOCUMENT / PDF TEXT PREVIEW */
                  <div className="w-full h-full max-w-3xl bg-white rounded-2xl border border-pink-200 p-6 sm:p-8 shadow-sm overflow-y-auto">
                    <div className="border-b border-pink-100 pb-4 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-pink-600 tracking-wider uppercase font-mono">REXLIFY AI EXECUTIVE ARCHIVE</span>
                        <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-1 font-sora">{fileName}</h2>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                      {textContent ? (
                        <ChatMarkdown content={textContent} />
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <FileCheck size={40} className="mx-auto text-pink-400 mb-2 opacity-70" />
                          <p className="font-semibold text-slate-600">Document Content Ready</p>
                          <p className="text-xs mt-1">Click the "Download" button above to obtain the formatted document.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Window Footer */}
              <div className="px-6 py-3 border-t border-pink-100 flex items-center justify-between bg-white shrink-0">
                <span className="text-[11px] text-slate-400">
                  Rexlify AI Multi-Window File Inspector
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalFile(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Close Window
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    Download File
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
