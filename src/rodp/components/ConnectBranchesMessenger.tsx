import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, Send, Search, Bell, Check, CheckCheck, Users, 
  ShieldCheck, ArrowLeft, Radio, Megaphone, Plus, Sparkles, Building,
  Lock, AlertTriangle, Phone, Mail, Clock, Filter, Eye, CheckCircle2,
  X, ChevronRight, Info
} from 'lucide-react';
import { Shop, User, BranchConversation, ConversationMessage } from '../types';

interface ConnectBranchesMessengerProps {
  theme: 'light' | 'dark';
  currentUser: User;
  shops: Shop[];
  conversations: BranchConversation[];
  conversationMessages: ConversationMessage[];
  sendConversationMessage: (
    conversationId: string, 
    text: string, 
    senderRole: 'ceo' | 'branch', 
    senderName: string, 
    senderId: string, 
    senderBranchId?: string,
    targetBranches?: string[]
  ) => void;
  createOrGetConversation: (
    type: 'direct' | 'announcement',
    participantIds: string[],
    participantNames?: { [id: string]: string },
    participantBranchIds?: { [id: string]: string },
    title?: string,
    targetBranchIds?: string[]
  ) => BranchConversation;
  markConversationRead: (conversationId: string, userId: string) => void;
  onBack?: () => void;
}

export default function ConnectBranchesMessenger({
  theme,
  currentUser,
  shops,
  conversations = [],
  conversationMessages = [],
  sendConversationMessage,
  createOrGetConversation,
  markConversationRead,
  onBack
}: ConnectBranchesMessengerProps) {
  const isDark = theme === 'dark';
  const isCeo = currentUser.role === 'super_admin' || currentUser.email === 'rizwanroushan0@gmail.com' || currentUser.shopId === 'shop_1';

  // Identify current branch context for non-CEO
  const currentBranchShop = useMemo(() => {
    if (isCeo) return null;
    return shops.find(s => s.id === currentUser.shopId || s.customId === currentUser.shopId) || {
      id: currentUser.shopId || 'shop_7',
      customId: 'MB107',
      name: 'MB COMPUTER',
      ownerName: currentUser.name || 'Branch Manager',
      mobile: '9593388785',
      address: 'Murshidabad'
    } as Shop;
  }, [shops, currentUser, isCeo]);

  const myId = isCeo ? 'ceo' : (currentBranchShop?.id || currentUser.shopId || 'branch');
  const myBranchCode = isCeo ? 'ROD-HQ' : (currentBranchShop?.customId || 'MB107');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [ceoFilterTab, setCeoFilterTab] = useState<'all' | 'inter_branch' | 'announcements'>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // Mobile navigation state (split screen toggle)
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Announcement Modal State (for CEO)
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTargetType, setAnnouncementTargetType] = useState<'all' | 'custom'>('all');
  const [selectedTargetBranches, setSelectedTargetBranches] = useState<string[]>([]);
  const [isHighPriorityAnnouncement, setIsHighPriorityAnnouncement] = useState(true);

  // New Chat Modal for Branch to search other branches
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [branchSearchModalQuery, setBranchSearchModalQuery] = useState('');

  // Chat message container scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations authorized for current user
  const authorizedConversations = useMemo(() => {
    if (isCeo) {
      // CEO has oversight of ALL conversations including direct, announcements, and inter-branch!
      if (ceoFilterTab === 'announcements') {
        return conversations.filter(c => c.type === 'announcement');
      }
      if (ceoFilterTab === 'inter_branch') {
        return conversations.filter(c => c.type === 'direct' && !c.participantIds.includes('ceo'));
      }
      return conversations;
    }

    // Branch: ONLY show conversations where this branch is an authorized participant or announcements targeted to them
    return conversations.filter(c => {
      if (c.type === 'announcement') {
        if (!c.targetBranchIds || c.targetBranchIds.includes('all')) return true;
        return c.targetBranchIds.includes(myId) || c.targetBranchIds.includes(myBranchCode);
      }
      return c.participantIds.includes(myId) || (currentBranchShop?.customId && c.participantIds.includes(currentBranchShop.customId));
    });
  }, [conversations, isCeo, ceoFilterTab, myId, myBranchCode, currentBranchShop]);

  // Ensure default conversation is selected
  useEffect(() => {
    if (!selectedConversationId && authorizedConversations.length > 0) {
      setSelectedConversationId(authorizedConversations[0].id);
    } else if (!selectedConversationId && !isCeo && currentBranchShop) {
      // Automatically initialize CEO conversation for branch
      const conv = createOrGetConversation(
        'direct',
        ['ceo', currentBranchShop.id],
        { ceo: 'RODP Head Office (CEO Desk)', [currentBranchShop.id]: currentBranchShop.name },
        { ceo: 'ROD-HQ', [currentBranchShop.id]: currentBranchShop.customId || 'MB107' },
        `CEO Desk ↔ ${currentBranchShop.name}`
      );
      setSelectedConversationId(conv.id);
    }
  }, [authorizedConversations, selectedConversationId, isCeo, currentBranchShop, createOrGetConversation]);

  // Current active conversation object
  const activeConversation = useMemo(() => {
    return authorizedConversations.find(c => c.id === selectedConversationId) || null;
  }, [authorizedConversations, selectedConversationId]);

  // Security barrier: if user selected a non-authorized conversation, reset it
  useEffect(() => {
    if (selectedConversationId && !activeConversation && authorizedConversations.length > 0) {
      setSelectedConversationId(authorizedConversations[0].id);
    }
  }, [selectedConversationId, activeConversation, authorizedConversations]);

  // Mark conversation read on selection
  useEffect(() => {
    if (activeConversation) {
      markConversationRead(activeConversation.id, myId);
    }
  }, [activeConversation, myId, markConversationRead]);

  // Auto-scroll messages to bottom
  const activeMessages = useMemo(() => {
    if (!activeConversation) return [];
    return conversationMessages.filter(m => m.conversationId === activeConversation.id);
  }, [conversationMessages, activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  // Helper to get partner info for direct chat
  const getPartnerInfo = (conv: BranchConversation) => {
    if (conv.type === 'announcement') {
      return {
        name: conv.title || 'Official Announcement',
        branchCode: 'BROADCAST',
        isCeo: true,
        avatarName: 'ROD'
      };
    }

    if (isCeo) {
      // For CEO: find the branch participant(s)
      const otherId = conv.participantIds.find(p => p !== 'ceo') || conv.participantIds[0];
      const otherShop = shops.find(s => s.id === otherId || s.customId === otherId);
      
      // If inter-branch chat:
      if (!conv.participantIds.includes('ceo') && conv.participantIds.length >= 2) {
        const shopA = shops.find(s => s.id === conv.participantIds[0]);
        const shopB = shops.find(s => s.id === conv.participantIds[1]);
        return {
          name: `${shopA?.name || conv.participantIds[0]} ↔ ${shopB?.name || conv.participantIds[1]}`,
          branchCode: `${shopA?.customId || 'A'} ↔ ${shopB?.customId || 'B'}`,
          isInterBranch: true,
          avatarName: '⇄'
        };
      }

      return {
        name: otherShop?.name || conv.participantNames?.[otherId] || 'Branch Node',
        branchCode: otherShop?.customId || conv.participantBranchIds?.[otherId] || otherId,
        isCeo: false,
        avatarName: (otherShop?.name || 'BR').slice(0, 2).toUpperCase()
      };
    } else {
      // For Branch: partner is either 'ceo' or other branch
      const otherId = conv.participantIds.find(p => p !== myId && p !== currentBranchShop?.customId) || 'ceo';
      if (otherId === 'ceo') {
        return {
          name: 'RODP Head Office (CEO Desk)',
          branchCode: 'ROD-HQ',
          isCeo: true,
          avatarName: 'CEO'
        };
      }
      const otherShop = shops.find(s => s.id === otherId || s.customId === otherId);
      return {
        name: otherShop?.name || conv.participantNames?.[otherId] || 'Branch Office',
        branchCode: otherShop?.customId || conv.participantBranchIds?.[otherId] || otherId,
        isCeo: false,
        avatarName: (otherShop?.name || 'BR').slice(0, 2).toUpperCase()
      };
    }
  };

  // Handle message send
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeConversation) return;

    const senderRole = isCeo ? 'ceo' : 'branch';
    const senderName = isCeo ? 'Rizwan Roushan (CEO)' : (currentBranchShop?.ownerName || currentUser.name || 'Branch Manager');
    const senderBranchId = isCeo ? 'ROD-HQ' : (currentBranchShop?.customId || 'MB107');

    sendConversationMessage(
      activeConversation.id,
      messageInput.trim(),
      senderRole,
      senderName,
      myId,
      senderBranchId,
      activeConversation.targetBranchIds
    );

    setMessageInput('');
  };

  // Quick emoji insertion
  const handleInsertEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  // Handle CEO announcement submission
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementText.trim()) return;

    const targetBranchIds = announcementTargetType === 'all' 
      ? ['all'] 
      : (selectedTargetBranches.length > 0 ? selectedTargetBranches : ['all']);

    const conv = createOrGetConversation(
      'announcement',
      ['ceo'],
      { ceo: 'RODP Central Communications Desk' },
      { ceo: 'ROD-HQ' },
      announcementTitle.trim(),
      targetBranchIds
    );

    sendConversationMessage(
      conv.id,
      `${isHighPriorityAnnouncement ? '🚨 [HIGH PRIORITY ANNOUNCEMENT]\n' : '📢 '}${announcementText.trim()}`,
      'ceo',
      'Rizwan Roushan (CEO)',
      'ceo',
      'ROD-HQ',
      targetBranchIds
    );

    setIsAnnouncementModalOpen(false);
    setAnnouncementTitle('');
    setAnnouncementText('');
    setSelectedConversationId(conv.id);
  };

  // Filtered branches for list
  const filteredShopsForDirectory = useMemo(() => {
    return shops.filter(s => {
      if (!isCeo && s.id === myId) return false; // Don't show myself in new chat list
      const query = (searchQuery || branchSearchModalQuery).toLowerCase().trim();
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        (s.customId && s.customId.toLowerCase().includes(query)) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(query)) ||
        (s.address && s.address.toLowerCase().includes(query))
      );
    });
  }, [shops, isCeo, myId, searchQuery, branchSearchModalQuery]);

  return (
    <div className={`w-full h-full flex flex-col rounded-3xl overflow-hidden border shadow-2xl transition-all ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`} style={{ minHeight: '82vh' }}>

      {/* TOP HEADER BAR */}
      <div className={`px-6 py-4 border-b flex items-center justify-between gap-4 ${
        isDark ? 'bg-[#080b12] border-slate-800/80' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Back / পেছনে যান"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md">
            <MessageSquare size={20} className="fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-black uppercase">
                {isCeo ? 'CEO NETWORK DESK' : `BRANCH MESSENGER • ${myBranchCode}`}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-mono font-bold">100% LIVE SYNC</span>
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2 mt-0.5">
              <span>{isCeo ? 'Connect All Branches (সেন্ট্রাল কানেক্ট)' : `Connect Branch (ব্রাঞ্চ যোগাযোগ) • ${currentBranchShop?.name}`}</span>
            </h2>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {isCeo && (
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Megaphone size={14} />
              <span className="hidden sm:inline">নতুন ঘোষণা (Announcement)</span>
              <span className="sm:hidden">ঘোষণা</span>
            </button>
          )}

          {!isCeo && (
            <button
              type="button"
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">নতুন চ্যাট শুরু করুন</span>
              <span className="sm:hidden">চ্যাট</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN MESSAGING BODY (SPLIT VIEW) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ========================================================================= */}
        {/* LEFT CONVERSATION LIST (SIDEBAR) */}
        {/* ========================================================================= */}
        <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col transition-all ${
          mobileShowChat ? 'hidden md:flex' : 'flex'
        } ${isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>

          {/* Search Bar */}
          <div className="p-3.5 border-b border-white/5 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সার্চ ব্রাঞ্চ নাম বা আইডি (e.g. MB107)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* CEO Filter Tabs */}
            {isCeo && (
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setCeoFilterTab('all')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    ceoFilterTab === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  সকল ব্রাঞ্চ
                </button>
                <button
                  type="button"
                  onClick={() => setCeoFilterTab('inter_branch')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    ceoFilterTab === 'inter_branch' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ব্রাঞ্চ-টু-ব্রাঞ্চ
                </button>
                <button
                  type="button"
                  onClick={() => setCeoFilterTab('announcements')}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    ceoFilterTab === 'announcements' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ঘোষণা
                </button>
              </div>
            )}
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {authorizedConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <MessageSquare size={28} className="mx-auto text-slate-600" />
                <p className="text-xs text-slate-400 font-bold">কোনো সক্রিয় কথোপকথন পাওয়া যায়নি</p>
                <p className="text-[11px] text-slate-500">
                  {isCeo 
                    ? 'নিচে থাকা ব্রাঞ্চ সিলেক্ট করে মেসেজ পাঠানো শুরু করুন।' 
                    : 'হেড অফিস অথবা অন্য কোনো ব্রাঞ্চের সাথে চ্যাট শুরু করতে উপরের বাটনে চাপুন।'}
                </p>
              </div>
            ) : (
              authorizedConversations.map(conv => {
                const isSelected = conv.id === selectedConversationId;
                const partner = getPartnerInfo(conv);
                const unread = conv.unreadCounts?.[myId] || 0;
                const isAnnouncement = conv.type === 'announcement';

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversationId(conv.id);
                      setMobileShowChat(true);
                    }}
                    className={`p-3.5 flex items-start gap-3 transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'bg-emerald-950/40 border-l-4 border-emerald-500' 
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-md ${
                      isAnnouncement 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                        : partner.isCeo 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-gradient-to-tr from-cyan-600 to-teal-700 text-white'
                    }`}>
                      {isAnnouncement ? <Megaphone size={18} /> : partner.avatarName}
                    </div>

                    {/* Chat summary */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{partner.name}</span>
                        </h4>
                        {conv.lastMessageTime && (
                          <span className="text-[9px] text-slate-400 font-mono shrink-0">
                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded font-black uppercase ${
                          partner.isCeo ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {partner.branchCode}
                        </span>
                        {isAnnouncement && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1 rounded">BROADCAST</span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 truncate mt-1">
                        {conv.lastMessage || 'নতুন বার্তা পাঠানো শুরু করুন...'}
                      </p>
                    </div>

                    {/* Unread Counter Badge */}
                    {unread > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black text-[9px] rounded-full font-mono shrink-0 shadow animate-pulse">
                        {unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {/* If CEO: Quick access to start chat with any registered branch */}
            {isCeo && (
              <div className="p-3 border-t border-white/5 space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                  REGISTERED BRANCH DIRECTORY ({shops.length})
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {shops.map(s => {
                    const isMainHq = s.id === 'shop_1' || s.customId === 'ROD001';
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          const conv = createOrGetConversation(
                            'direct',
                            ['ceo', s.id],
                            { ceo: 'RODP Head Office (CEO Desk)', [s.id]: s.name },
                            { ceo: 'ROD-HQ', [s.id]: s.customId || 'MB107' },
                            `CEO ↔ ${s.name}`
                          );
                          setSelectedConversationId(conv.id);
                          setMobileShowChat(true);
                        }}
                        className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 flex items-center justify-between gap-2 cursor-pointer transition-all text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{s.name}</p>
                          <p className="text-[9px] text-amber-400 font-mono">{s.customId} • {s.branchHead || s.ownerName}</p>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                          চ্যাট ➔
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT CHAT AREA (CONVERSATION THREAD) */}
        {/* ========================================================================= */}
        <div className={`flex-1 flex flex-col overflow-hidden ${
          !mobileShowChat ? 'hidden md:flex' : 'flex'
        } ${isDark ? 'bg-slate-900/70' : 'bg-white'}`}>

          {activeConversation ? (() => {
            const partner = getPartnerInfo(activeConversation);
            const isAnnouncement = activeConversation.type === 'announcement';

            return (
              <>
                {/* Active Chat Top Bar */}
                <div className={`px-5 py-3 border-b flex items-center justify-between gap-3 ${
                  isDark ? 'bg-[#090d16] border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileShowChat(false)}
                      className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-md ${
                      isAnnouncement 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                        : partner.isCeo 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-gradient-to-tr from-cyan-600 to-teal-700 text-white'
                    }`}>
                      {isAnnouncement ? <Megaphone size={18} /> : partner.avatarName}
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                        <span>{partner.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono text-[9px]">
                          {partner.branchCode}
                        </span>
                      </h3>
                      <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>অনলাইন • সুরক্ষিত ব্রাঞ্চ কানেকশন</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400">
                      <Lock size={10} />
                      <span>E2E ENCRYPTED (CEO PROTECTED)</span>
                    </span>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className={`flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 ${
                  isDark ? 'bg-[#06080e]' : 'bg-slate-50'
                }`}>
                  {/* Security Banner Notice */}
                  <div className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl text-center max-w-md mx-auto space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      🔒 RIZWAN ONLINE DREAMS CENTRAL MESSENGER
                    </span>
                    <p className="text-[10.5px] text-slate-400">
                      এই কথোপকথনটি সরাসরি কেন্দ্রীয় ফায়ারবেস ডেটাবেসে সিঙ্ক হচ্ছে। অন্য কোনো অননুমোদিত ব্রাঞ্চ এই মেসেজ দেখতে পারবে না।
                    </p>
                  </div>

                  {activeMessages.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-800/60 text-slate-500 flex items-center justify-center mx-auto">
                        <MessageSquare size={22} />
                      </div>
                      <p className="text-xs text-slate-400 font-bold">এই চ্যাটে এখনো কোনো মেসেজ নেই</p>
                      <p className="text-[11px] text-slate-500">নিচের ইনপুট বক্সে আপনার বার্তা লিখুন এবং সেন্ট বাটনে চাপুন।</p>
                    </div>
                  ) : (
                    activeMessages.map(msg => {
                      const isMe = msg.senderId === myId;
                      const isFromCeo = msg.senderRole === 'ceo';

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-none'
                              : isFromCeo
                              ? 'bg-slate-900 border-2 border-amber-500/50 text-slate-100 rounded-tl-none shadow-amber-500/5'
                              : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/10'
                          }`}>
                            {/* Header inside bubble */}
                            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                              <span className={`text-[9.5px] font-bold font-mono ${
                                isFromCeo ? 'text-amber-400' : isMe ? 'text-emerald-200' : 'text-cyan-300'
                              }`}>
                                {isMe ? 'You' : msg.senderName} ({msg.senderBranchId || 'RODP'})
                              </span>
                              <span className="text-[8.5px] opacity-70 font-mono">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Message text */}
                            <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans pt-0.5">
                              {msg.text}
                            </p>

                            {/* Delivery checkmarks */}
                            <div className="flex justify-end pt-0.5">
                              <CheckCheck size={12} className={isMe ? 'text-amber-300' : 'text-slate-400'} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className={`p-3 border-t space-y-2 ${
                  isDark ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  {/* Quick reactions / emoji chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono uppercase font-bold shrink-0">Quick:</span>
                    {['👍 সালাম', '✅ সম্পন্ন', '💰 বিল পাঠানো হয়েছে', '📋 স্লট বুকিং', '🤝 ধন্যবাদ', '🚨 আর্জেন্ট'].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleInsertEmoji(` ${chip} `)}
                        className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-[10px] shrink-0 font-medium cursor-pointer border border-white/5 transition-all active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={isCeo ? "ব্রাঞ্চে মেসেজ পাঠান... (Type message to branch)" : "মেসেজ লিখুন... (Type message to CEO or Branch)"}
                      className="flex-1 py-3 px-4 bg-slate-900 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                    />

                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center gap-1.5 cursor-pointer shadow-lg transition-all active:scale-95 shrink-0"
                    >
                      <Send size={15} />
                      <span className="hidden sm:inline">সেন্ট (Send)</span>
                    </button>
                  </form>
                </div>
              </>
            );
          })() : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="space-y-3 max-w-sm">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-base font-black text-white uppercase">ব্রাঞ্চ মেসেঞ্জার হাব</h3>
                <p className="text-xs text-slate-400">
                  বামদিকের তালিকা থেকে যেকোনো ব্রাঞ্চ সিলেক্ট করে রিয়েল-টাইম বার্তা আদান-প্রদান শুরু করুন।
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* CEO ANNOUNCEMENT BROADCAST MODAL */}
      {/* ========================================================================= */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Megaphone size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                    ব্রাঞ্চসমূহে কেন্দ্রীয় ঘোষণা (Broadcast Announcement)
                  </h3>
                  <p className="text-[10px] text-amber-400 font-mono">
                    CEO CENTRAL DISPATCH TO ALL / SELECTED BRANCHES
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-300 block">
                  ঘোষণার শিরোনাম (Announcement Title) *
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="যেমন: জরুরি সার্ভার রক্ষণাবেক্ষণ নোটিস অথবা নতুন স্কিম চালু"
                  className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              {/* Target branches selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-300 block">
                  উদ্দিষ্ট প্রাপক (Target Audience) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnouncementTargetType('all')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                      announcementTargetType === 'all'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    🌐 সকল ব্রাঞ্চ ({shops.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementTargetType('custom')}
                    className={`p-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                      announcementTargetType === 'custom'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎯 নির্দিষ্ট ব্রাঞ্চ সিলেক্ট করুন
                  </button>
                </div>

                {announcementTargetType === 'custom' && (
                  <div className="p-3 bg-slate-950/70 border border-white/10 rounded-xl space-y-1.5 max-h-40 overflow-y-auto">
                    <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">
                      ব্রাঞ্চ নির্বাচন করুন:
                    </span>
                    {shops.map(s => {
                      const isChecked = selectedTargetBranches.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTargetBranches(prev => [...prev, s.id]);
                              } else {
                                setSelectedTargetBranches(prev => prev.filter(id => id !== s.id));
                              }
                            }}
                            className="rounded border-slate-700 text-amber-500"
                          />
                          <span className="font-bold text-white truncate">{s.name}</span>
                          <span className="text-[10px] text-amber-400 font-mono">[{s.customId}]</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-300 block">
                  ঘোষণার বিবরণ (Announcement Body) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="এখানে সমস্ত ব্রাঞ্চের জন্য আপনার কেন্দ্রীয় নির্দেশিকা বা নোটিস লিখুন..."
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-medium resize-none"
                />
              </div>

              {/* Priority checkbox */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={isHighPriorityAnnouncement}
                  onChange={(e) => setIsHighPriorityAnnouncement(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span className="font-bold">🚨 হাই প্রায়োরিটি নোটিফিকেশন হিসেবে মার্ক করুন</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="w-1/3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  ঘোষণা সম্প্রচার করুন (Broadcast) ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BRANCH NEW CHAT MODAL (DIRECT BRANCH-TO-BRANCH OR BRANCH-TO-CEO) */}
      {/* ========================================================================= */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-left text-white max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Building size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    ব্রাঞ্চ নির্বাচন করুন
                  </h3>
                  <p className="text-[10px] text-cyan-400 font-mono">
                    SELECT A REGISTERED BRANCH TO MESSAGE
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Pinned CEO Desk */}
            <div
              onClick={() => {
                const conv = createOrGetConversation(
                  'direct',
                  ['ceo', myId],
                  { ceo: 'RODP Head Office (CEO Desk)', [myId]: currentBranchShop?.name || 'My Branch' },
                  { ceo: 'ROD-HQ', [myId]: myBranchCode },
                  `CEO Desk ↔ ${currentBranchShop?.name}`
                );
                setSelectedConversationId(conv.id);
                setMobileShowChat(true);
                setIsNewChatModalOpen(false);
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                  CEO
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">RODP Head Office (CEO Desk)</h4>
                  <p className="text-[10px] text-amber-300 font-mono">ROD-HQ • সেন্ট্রাল সিইও সাপোর্ট</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-black uppercase px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg">
                মেসেজ ➔
              </span>
            </div>

            {/* Search filter for other branches */}
            <div className="space-y-2 pt-2">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                অন্যান্য রেজিস্টার্ড ব্রাঞ্চসমূহ (BRANCH-TO-BRANCH)
              </span>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={branchSearchModalQuery}
                  onChange={(e) => setBranchSearchModalQuery(e.target.value)}
                  placeholder="ব্রাঞ্চ আইডি বা নাম খুঁজুন (e.g. MB107, MAM103)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pt-1">
                {filteredShopsForDirectory.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      const conv = createOrGetConversation(
                        'direct',
                        [myId, s.id],
                        { [myId]: currentBranchShop?.name || 'Branch', [s.id]: s.name },
                        { [myId]: myBranchCode, [s.id]: s.customId || 'BRANCH' },
                        `${currentBranchShop?.name} ↔ ${s.name}`
                      );
                      setSelectedConversationId(conv.id);
                      setMobileShowChat(true);
                      setIsNewChatModalOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-white/5 flex items-center justify-between gap-2 cursor-pointer transition-all text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{s.name}</p>
                      <p className="text-[10px] text-cyan-400 font-mono">{s.customId} • {s.branchHead || s.ownerName}</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold">
                      চ্যাট ➔
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
