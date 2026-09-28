import React, { useState } from 'react';
import { 
  BellRing, Send, Search, CheckCircle, MessageSquare, Mail, 
  Smartphone, AlertCircle, Sparkles, Filter, Trash, Play,
  Plus, Trash2, ToggleLeft, ToggleRight, FileText, Layers, Bell,
  Edit, Clock, Coins, Hash, X, Check, RefreshCw, Loader, Eye
} from 'lucide-react';
import { NotificationLog, Notice } from '../types';

interface NotificationsViewProps {
  theme: 'light' | 'dark';
  notifications: NotificationLog[];
  addNotificationLog: (log: NotificationLog) => void;
  gdriveConnected?: boolean;
  gdriveToken?: string | null;
  notices?: Notice[];
  addNotice?: (notice: Notice) => void;
  updateNotice?: (id: string, updates: any) => void;
  deleteNotice?: (id: string) => void;
}

export default function NotificationsView({
  theme,
  notifications,
  addNotificationLog,
  gdriveConnected = false,
  gdriveToken = null,
  notices = [],
  addNotice,
  updateNotice,
  deleteNotice
}: NotificationsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState('All');
  
  // Tab controller
  const [activeSubTab, setActiveSubTab] = useState<'notifications' | 'notice_board'>('notifications');

  // Preview and Creator Dialogs
  const [showNoticePreview, setShowNoticePreview] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Notice form inputs
  const [newNoticeNumber, setNewNoticeNumber] = useState('');
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeType, setNewNoticeType] = useState('আধার কার্ড সেবা');
  const [newNoticeBody, setNewNoticeBody] = useState('');
  const [newNoticeRate, setNewNoticeRate] = useState('');
  const [newNoticeDeliveryTime, setNewNoticeDeliveryTime] = useState('সরকারী অনুমোদন সাপেক্ষে (আমরা আমাদের তরফ থেকে সর্বোচ্চ চেষ্টা করব)');
  const [newNoticeTagline, setNewNoticeTagline] = useState('আপনার কাজটি আমরা অত্যন্ত নিষ্ঠা, যত্ন ও দায়িত্ব সহকারে করব।');
  const [newNoticeStatus, setNewNoticeStatus] = useState<'active' | 'inactive'>('active');

  // AI draft prompt state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleOpenCreateForm = () => {
    setEditingNotice(null);
    setNewNoticeNumber('NT-2026-' + Math.floor(1000 + Math.random() * 9000));
    setNewNoticeTitle('');
    setNewNoticeType('আধার কার্ড সেবা');
    setNewNoticeBody('');
    setNewNoticeRate('');
    setNewNoticeDeliveryTime('সরকারী অনুমোদন সাপেক্ষে (আমরা আমাদের তরফ থেকে সর্বোচ্চ চেষ্টা করব)');
    setNewNoticeTagline('আপনার কাজটি আমরা অত্যন্ত নিষ্ঠা, যত্ন ও দায়িত্ব সহকারে করব।');
    setNewNoticeStatus('active');
    setAiPrompt('');
    setAiError('');
    setShowCreateForm(true);
  };

  const handleOpenEditForm = (notice: Notice) => {
    setEditingNotice(notice);
    setNewNoticeNumber(notice.noticeNumber || 'NT-2026-' + Math.floor(1000 + Math.random() * 9000));
    setNewNoticeTitle(notice.title);
    setNewNoticeType(notice.noticeType || 'আধার কার্ড সেবা');
    setNewNoticeBody(notice.body);
    setNewNoticeRate(notice.rate || '');
    setNewNoticeDeliveryTime(notice.deliveryTime || 'সরকারী অনুমোদন সাপেক্ষে (আমরা আমাদের তরফ থেকে সর্বোচ্চ চেষ্টা করব)');
    setNewNoticeTagline(notice.tagline || 'আপনার কাজটি আমরা অত্যন্ত নিষ্ঠা, যত্ন ও দায়িত্ব সহকারে করব।');
    setNewNoticeStatus(notice.status);
    setAiPrompt('');
    setAiError('');
    setShowCreateForm(true);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeBody.trim()) {
      alert('অনুগ্রহ করে নোটিশের শিরোনাম ও বিবরণ লিখুন।');
      return;
    }

    if (editingNotice) {
      if (updateNotice) {
        updateNotice(editingNotice.id, {
          title: newNoticeTitle.trim(),
          body: newNoticeBody.trim(),
          status: newNoticeStatus,
          noticeNumber: newNoticeNumber,
          noticeType: newNoticeType,
          rate: newNoticeRate.trim(),
          deliveryTime: newNoticeDeliveryTime.trim(),
          tagline: newNoticeTagline.trim(),
        });
        alert('🎉 নোটিশ সফলভাবে আপডেট করা হয়েছে!');
      }
    } else {
      const newNoticeObj: Notice = {
        id: `not_${Date.now()}`,
        title: newNoticeTitle.trim(),
        body: newNoticeBody.trim(),
        status: newNoticeStatus,
        createdAt: new Date().toISOString(),
        noticeNumber: newNoticeNumber,
        noticeType: newNoticeType,
        rate: newNoticeRate.trim(),
        deliveryTime: newNoticeDeliveryTime.trim(),
        tagline: newNoticeTagline.trim(),
      };

      if (addNotice) {
        addNotice(newNoticeObj);
        alert('🎉 নতুন নোটিশ সফলভাবে পাবলিশ করা হয়েছে এবং নোটিফিকেশন বেল-এ যুক্ত হয়েছে!');
      }
    }

    setShowCreateForm(false);
    setEditingNotice(null);
  };

  const handleGenerateNoticeWithAI = async () => {
    if (!aiPrompt.trim()) {
      setAiError('অনুগ্রহ করে এআই-এর জন্য নোটিশের ধারণা বা বিষয়বস্তু লিখুন।');
      return;
    }

    setAiGenerating(true);
    setAiError('');

    try {
      const response = await fetch('/api/generate-notice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });

      if (!response.ok) {
        throw new Error('AI generation service returned an error.');
      }

      const data = await response.json();
      if (data.title) {
        setNewNoticeTitle(data.title);
      }
      if (data.body) {
        setNewNoticeBody(data.body);
      }
      if (data.noticeType) {
        setNewNoticeType(data.noticeType);
      }
      if (data.rate) {
        setNewNoticeRate(data.rate);
      }
      if (data.deliveryTime) {
        setNewNoticeDeliveryTime(data.deliveryTime);
      }
      if (data.tagline) {
        setNewNoticeTagline(data.tagline);
      }

      setAiPrompt('');
      alert('✨ Sifra AI সফলভাবে নোটিশটির খসড়া প্রস্তুত করেছে! নিচে লাইভ প্রভিউ দেখুন ও প্রয়োজনে এডিট করে পাবলিশ করুন।');
    } catch (err: any) {
      console.error(err);
      setAiError('এআই নোটিশ জেনারেশন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setAiGenerating(false);
    }
  };

  // Trigger form state
  const [recipientName, setRecipientName] = useState('');
  const [recipientMobile, setRecipientMobile] = useState('');
  const [channelType, setChannelType] = useState<'WhatsApp' | 'Email' | 'SMS' | 'Push'>('WhatsApp');
  const [message, setMessage] = useState('');

  const channels = ['All', 'WhatsApp', 'Email', 'SMS', 'Push'];

  const parseNoticePreview = (text: string) => {
    const lines = text.split('\n');
    return (
      <ul className="space-y-2">
        {lines.map((line, idx) => {
          let cleanLine = line.trim();
          if (cleanLine.startsWith('•')) {
            cleanLine = cleanLine.substring(1).trim();
          }
          if (cleanLine.startsWith('-')) {
            cleanLine = cleanLine.substring(1).trim();
          }
          if (!cleanLine) return null;

          const parts = cleanLine.split(/\*\*([^*]+)\*\*/g);
          return (
            <li key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed text-xs">
              <span className="text-amber-400 text-sm shrink-0 leading-none mt-0.5">•</span>
              <span className="flex-1">
                {parts.map((part, i) => {
                  if (i % 2 === 1) {
                    return (
                      <span key={i} className="text-[#FFFF00] font-black bg-[#FFFF00]/10 px-1.5 py-0.5 rounded border border-[#FFFF00]/25 mx-1">
                        {part}
                      </span>
                    );
                  }
                  const terms = ['আধার কার্ড', 'প্যান আধার লিঙ্ক', 'ভোটার কার্ড', '৩ দিনে', '১০ মিনিটে', 'বিশেষ ছাড়', 'পাসপোর্ট', 'PCC'];
                  let subParts: (string | React.ReactNode)[] = [part];
                  for (const term of terms) {
                    const tempParts: (string | React.ReactNode)[] = [];
                    for (const subPart of subParts) {
                      if (typeof subPart === 'string') {
                        const splitTerm = subPart.split(term);
                        for (let k = 0; k < splitTerm.length; k++) {
                          tempParts.push(splitTerm[k]);
                          if (k < splitTerm.length - 1) {
                            tempParts.push(
                              <span key={`${term}-${k}`} className="text-[#FFFF00] font-black underline decoration-dashed decoration-[#FFFF00]/60 bg-[#FFFF00]/5 px-1 rounded">
                                {term}
                              </span>
                            );
                          }
                        }
                      } else {
                        tempParts.push(subPart);
                      }
                    }
                    subParts = tempParts;
                  }
                  return <React.Fragment key={i}>{subParts}</React.Fragment>;
                })}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  const filteredLogs = notifications.filter(log => {
    const matchesSearch = log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.recipientMobile.includes(searchQuery) ||
                          log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = filterChannel === 'All' || log.type === filterChannel;
    return matchesSearch && matchesChannel;
  });

  const [isSendingLiveEmail, setIsSendingLiveEmail] = useState(false);

  const handleSendTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientMobile.trim() || !message.trim()) return;

    let deliveryStatus: 'Sent' | 'Failed' = 'Sent';
    let alertMsgStr = `Notification dispatched via simulated ${channelType} gateway to ${recipientName}.`;

    // If channelType is Email and Google connection is authorized, trigger a real API call!
    if (channelType === 'Email' && gdriveConnected && gdriveToken) {
      setIsSendingLiveEmail(true);
      try {
        const { sendEmailViaGmail } = await import('../lib/googleIntegrations');
        const emailTo = recipientMobile.trim();
        if (!emailTo.includes('@')) {
          alert('⚠️ For Email dispatch, please enter a valid recipient email address in the "Mobile / Email" field.');
          setIsSendingLiveEmail(false);
          return;
        }

        const subject = `Rizwan Online Dreams Notification Alert - ${recipientName}`;
        const result = await sendEmailViaGmail(gdriveToken, emailTo, subject, message);
        if (result.success) {
          alertMsgStr = `📧 Real Gmail successfully sent to ${recipientName} (${emailTo}) via your authorized Google account!`;
        } else {
          deliveryStatus = 'Failed';
          alertMsgStr = `❌ Gmail dispatch failed: ${result.message}`;
        }
      } catch (err: any) {
        deliveryStatus = 'Failed';
        alertMsgStr = `❌ Gmail error: ${err.message}`;
      } finally {
        setIsSendingLiveEmail(false);
      }
    }

    const newLog: NotificationLog = {
      id: `not_${Date.now()}`,
      recipientName,
      recipientMobile,
      type: channelType,
      message,
      status: deliveryStatus,
      sentAt: new Date().toISOString(),
      shopId: 'shop_1'
    };

    addNotificationLog(newLog);

    // Reset Form
    setRecipientName('');
    setRecipientMobile('');
    setMessage('');

    setTimeout(() => {
      alert(alertMsgStr);
    }, 400);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'WhatsApp': return <MessageSquare size={16} className="text-emerald-500" />;
      case 'Email': return <Mail size={16} className="text-indigo-400" />;
      case 'SMS': return <Smartphone size={16} className="text-cyan-400" />;
      default: return <BellRing size={16} className="text-purple-400" />;
    }
  };

  const gridThemeClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-800/80' 
    : 'bg-white border-slate-200 shadow-xs';

  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Multi-Channel Notification Center</h2>
          <p className="text-xs opacity-60 font-medium">Configure and trigger instant citizen alerts, passport notifications, and broadcast global notice boards</p>
        </div>
      </div>

      {/* NEW SUB-TAB NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px gap-2">
        <button
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send size={14} />
          <span>System Alerts Dispatcher (সিস্টেম অ্যালার্ট ও নোটিফিকেশন)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notice_board')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-black uppercase text-xs tracking-wider transition-all cursor-pointer relative ${
            activeSubTab === 'notice_board'
              ? 'border-pink-500 text-pink-600 dark:text-pink-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell size={14} className={notices.length > 0 ? "animate-swing text-pink-500" : ""} />
          <span>Notice Board Controller (নোটিশ বোর্ড কন্ট্রোলার)</span>
          {notices.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-pink-500 text-white rounded-full text-[8px] font-black leading-none">
              {notices.length}
            </span>
          )}
        </button>
      </div>

      {/* RENDER THE CORRESPONDING TAB */}
      {activeSubTab === 'notifications' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Form triggers dispatch */}
          <div className={`p-5 rounded-3xl border self-start ${gridThemeClass}`}>
            <h3 className={`font-black text-sm mb-4 flex items-center gap-1.5 ${textPrimaryClass}`}>
              <Sparkles size={16} className="text-indigo-400 animate-pulse" />
              <span>Manual Message Dispatch</span>
            </h3>

            <form onSubmit={handleSendTrigger} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="opacity-60 block mb-1">Citizen Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter recipient"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Mobile / Email</label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit phone/email"
                    value={recipientMobile}
                    onChange={(e) => setRecipientMobile(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="opacity-60 block mb-1">Dispatch Gateway</label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="WhatsApp">WhatsApp Business API</option>
                  <option value="SMS">Twilio High-Speed SMS</option>
                  <option value="Email">Amazon SES SMTP Email</option>
                  <option value="Push">App Push Notification</option>
                </select>
              </div>

              <div>
                <label className="opacity-60 block mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your alert message. (e.g. Dear Amit, your Fresh Passport application has been reviewed by the RPO Patna. Date: 26 Jun.)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={14} /> Dispatch Notification
              </button>
            </form>
          </div>

          {/* Right logs table list */}
          <div className={`p-5 rounded-3xl border lg:col-span-2 h-[500px] flex flex-col ${gridThemeClass}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h3 className={`font-black text-sm ${textPrimaryClass}`}>Dispatched Telemetry logs</h3>

              <div className="flex gap-1 overflow-x-auto">
                {channels.map(ch => (
                  <button
                    key={ch}
                    onClick={() => setFilterChannel(ch)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${
                      filterChannel === ch
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-950' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
              {filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-500/5 border border-slate-500/5 shrink-0">
                      {getDocIcon(log.type)}
                    </div>
                    <div>
                      <h4 className={`font-black text-xs ${textPrimaryClass}`}>{log.recipientName} ({log.recipientMobile})</h4>
                      <p className={`text-[10px] mt-1 leading-relaxed opacity-85 ${textSecondaryClass}`}>
                        {log.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-500/10 pt-2 md:pt-0 shrink-0 self-end md:self-center">
                    <span className="text-[9px] font-mono opacity-50">
                      {new Date(log.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-[9px] font-bold uppercase flex items-center gap-0.5">
                      <CheckCircle size={10} /> Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* NOTICE BOARD CONTROLLER TAB */
        <div className="space-y-6">
          
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-pink-500/5 border border-pink-500/10">
            <div className="text-left">
              <h3 className="text-base font-black text-slate-900 dark:text-pink-300 flex items-center gap-2">
                <Bell className="animate-swing text-pink-500" size={18} />
                <span>Notice Board Manager / নোটিশ বোর্ড কন্ট্রোলার</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                সিটিজেনদের জন্য প্রকাশিত সকল গুরুত্বপূর্ণ বিজ্ঞপ্তি, সরকারি ক্যাম্প ও ফি তালিকা এখান থেকে নিয়ন্ত্রণ করুন।
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowNoticePreview(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-black text-xs tracking-wider transition-all border border-purple-500/25 uppercase cursor-pointer"
              >
                <Eye size={16} />
                <span>প্রিভিউ (Preview Board)</span>
              </button>

              <button
                onClick={handleOpenCreateForm}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-xs tracking-wider transition-all uppercase cursor-pointer shadow-lg shadow-pink-500/10 whitespace-nowrap"
              >
                <Plus size={16} />
                <span>নতুন নোটিশ লিখুন (Create Notice)</span>
              </button>
            </div>
          </div>

          {/* CITIZEN NOTICE BOARD PREVIEW OVERLAY */}
          {showNoticePreview && (
            <div className="fixed inset-0 bg-gradient-to-br from-purple-950 via-[#09071a]/99 to-indigo-950 text-white z-[9999] flex flex-col p-4 md:p-8 overflow-y-auto backdrop-blur-3xl">
              <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-4xl w-full mx-auto space-y-6 flex-1 relative z-10 text-left">
                {/* Simulated Header */}
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                  <button 
                    onClick={() => setShowNoticePreview(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 hover:text-white transition-all text-xs font-black border border-rose-500/30 uppercase cursor-pointer"
                  >
                    <X size={14} />
                    <span>প্রিভিউ বন্ধ করুন (Exit Preview)</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[9px] font-black uppercase text-purple-300 font-mono tracking-widest animate-pulse">
                      Simulated Client View
                    </span>
                  </div>
                </div>

                {/* Notice Board Banner */}
                <div className="text-center space-y-2 py-4 border-b border-purple-500/10">
                  <h2 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-amber-300 tracking-tight leading-tight uppercase">
                    Rizwan Online Dreams Notifications
                  </h2>
                  <p className="text-xs text-purple-300 font-semibold max-w-xl mx-auto leading-relaxed">
                    সেন্ট্রাল অফিস ও মেইন ব্রাঞ্চ কর্তৃক প্রকাশিত সকল জরুরি নোটিশ ও অফিশিয়াল আপডেট নিচে তালিকাভুক্ত করা হলো।
                  </p>
                </div>

                {/* List of active notices inside simulator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {notices.filter(n => n.status === 'active').length === 0 ? (
                    <div className="col-span-full text-center py-16 p-6 rounded-3xl bg-purple-950/10 border border-purple-500/20">
                      <Bell size={40} className="mx-auto text-purple-400/40 animate-bounce mb-3" />
                      <p className="font-bold text-slate-400 text-sm">বর্তমানে কোন সক্রিয় নোটিশ নেই।</p>
                      <p className="text-xs text-slate-500 font-mono mt-1 uppercase">Central Newsdesk is currently quiet</p>
                    </div>
                  ) : (
                    notices.filter(n => n.status === 'active').map((notice, idx) => {
                      return (
                        <div 
                          key={notice.id} 
                          className="p-6 rounded-[28px] bg-gradient-to-br from-white/5 to-purple-500/5 border-2 border-purple-500/20 backdrop-blur-lg space-y-4 relative text-left"
                        >
                          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-[8px] font-black uppercase tracking-widest text-slate-950 border border-[#dfac5d] shadow-lg">
                            Notice #{idx + 1}
                          </div>

                          <div className="space-y-1 pb-2 border-b border-purple-500/10">
                            <h3 className="text-sm md:text-base font-black tracking-tight text-white">
                              {notice.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[9px] text-purple-300 font-mono font-bold uppercase tracking-wider">
                              <span>📅 {new Date(notice.createdAt).toLocaleDateString()}</span>
                              <span className="text-purple-500">•</span>
                              <span className="text-emerald-400">🟢 Active</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono">
                              No: {notice.noticeNumber || `NT-2026-${idx + 101}`}
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase font-mono">
                              {notice.noticeType || 'General Broadcast'}
                            </div>
                            <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono">
                              Rate: {notice.rate ? `₹${notice.rate}` : 'ফ্রি'}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white/5 border border-purple-500/10 text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                            {notice.body}
                          </div>

                          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-center text-[10px] text-purple-100 font-bold tracking-wide italic">
                            ✨ {notice.tagline || 'আপনার কাজটি আমরা অত্যন্ত নিষ্ঠা, যত্ন ও দায়িত্ব সহকারে সম্পন্ন করব।'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CREATOR MODAL / EXPANSION PANEL */}
          {showCreateForm && (
            <div className="p-6 md:p-8 rounded-[32px] bg-white dark:bg-slate-950 border-2 border-pink-500/20 shadow-2xl space-y-6 animate-fade-in relative">
              <button 
                onClick={() => setShowCreateForm(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 text-left">
                <h4 className="text-base font-black text-pink-600 dark:text-pink-400 flex items-center gap-2">
                  <Sparkles size={18} className="animate-pulse" />
                  <span>{editingNotice ? 'নোটিশটি সংশোধন করুন (Edit Notice)' : 'নতুন নোটিশ প্রস্তুত করুন (Publish Live Notice)'}</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ম্যানুয়ালি ফরম পূরণ করে অথবা নিচে আমাদের Sifra AI-এর সাথে চ্যাট করে নিমিষেই আকর্ষণীয় নোটিশ প্রস্তুত করুন।
                </p>
              </div>

              {/* TWO COLUMN CREATION: FORM ON LEFT, LIVE PREVIEW ON RIGHT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                
                {/* Form Inputs & Sifra AI Assistant */}
                <div className="space-y-5">
                  
                  {/* Sifra AI Assistant Box */}
                  <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/20 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black text-pink-500 tracking-wider flex items-center gap-1">
                        <Sparkles size={13} className="text-amber-500" />
                        Sifra AI Notice Copilot / এআই অ্যাসিস্ট্যান্ট
                      </span>
                      <span className="text-[8px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full font-bold">Gemini Engine</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        placeholder="যেমন: 'নতুন আধার আপডেট ক্যাম্প শুরু হবে, ফি ৫০ টাকা, ৩ দিনে সমাধান।'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="flex-1 p-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-pink-500/20 focus:outline-none focus:border-pink-500/50 text-slate-900 dark:text-white resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateNoticeWithAI}
                        disabled={aiGenerating}
                        className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 text-white font-bold text-xs uppercase cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors min-w-[100px]"
                      >
                        {aiGenerating ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>খসড়া হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>এআই রাইটার</span>
                          </>
                        )}
                      </button>
                    </div>
                    {aiError && <p className="text-[10px] text-rose-500 font-bold">{aiError}</p>}
                  </div>

                  <form onSubmit={handleSaveNotice} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="opacity-70 block mb-1 text-[10px] uppercase font-black">Notice Number / নোটিশ নম্বর (Auto)</label>
                        <input
                          type="text"
                          required
                          value={newNoticeNumber}
                          onChange={(e) => setNewNoticeNumber(e.target.value)}
                          className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono font-bold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="opacity-70 block mb-1 text-[10px] uppercase font-black">Notice Type / বিভাগ</label>
                        <select
                          value={newNoticeType}
                          onChange={(e) => setNewNoticeType(e.target.value)}
                          className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none text-slate-800 dark:text-white"
                        >
                          <option value="আধার কার্ড সেবা">🆔 আধার কার্ড সেবা</option>
                          <option value="প্যান কার্ড সেবা">💳 প্যান কার্ড সেবা</option>
                          <option value="ভোটার কার্ড সেবা">🗳️ ভোটার কার্ড সেবা</option>
                          <option value="পাসপোর্ট সেবা">✈️ পাসপোর্ট সেবা</option>
                          <option value="সরকারি প্রকল্প">🏦 সরকারি প্রকল্প</option>
                          <option value="অন্যান্য সেবা">⚙️ অন্যান্য সেবা</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="opacity-70 block mb-1 text-[10px] uppercase font-black">Notice Title / নোটিশের শিরোনাম</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: নতুন ভোটার কার্ড PVC প্রিন্ট"
                        value={newNoticeTitle}
                        onChange={(e) => setNewNoticeTitle(e.target.value)}
                        className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="opacity-70 block mb-1 text-[10px] uppercase font-black">Rate / চার্জ (৳ - ঐচ্ছিক)</label>
                        <input
                          type="text"
                          placeholder="যেমন: ৫০ (ফ্রি হলে ফাকা রাখুন)"
                          value={newNoticeRate}
                          onChange={(e) => setNewNoticeRate(e.target.value)}
                          className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none text-slate-800 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="opacity-70 block mb-1 text-[10px] uppercase font-black">Completion Time / সম্পন্ন করার সময়</label>
                        <input
                          type="text"
                          required
                          placeholder="যেমন: ৩ দিনে / ৫ দিনে"
                          value={newNoticeDeliveryTime}
                          onChange={(e) => setNewNoticeDeliveryTime(e.target.value)}
                          className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="opacity-70 block mb-1 text-[10px] uppercase font-black">Reassurance Tagline / দায়বদ্ধতা বার্তা</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: আপনার কাজটি আমরা অত্যন্ত নিষ্ঠা ও দায়িত্বের সাথে সম্পন্ন করব।"
                        value={newNoticeTagline}
                        onChange={(e) => setNewNoticeTagline(e.target.value)}
                        className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none text-slate-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="opacity-70 block mb-1 text-[10px] uppercase font-black">Notice Content / নোটিশের বিবরণ</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="এখানে নোটিশের বিবরণ লিখুন। কোনো নির্দিষ্ট কাজকে হাইলাইট করতে ডবল স্টার ব্যবহার করুন (যেমন **ভোটার কার্ড** বা **৩ দিনে**)।"
                        value={newNoticeBody}
                        onChange={(e) => setNewNoticeBody(e.target.value)}
                        className="w-full p-2.5 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none text-slate-800 dark:text-white leading-relaxed resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <label className="text-[10px] uppercase font-black opacity-70">Notice Status / বর্তমান অবস্থা:</label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setNewNoticeStatus('active')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                              newNoticeStatus === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                            }`}
                          >
                            🟢 Active / লাইভ
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewNoticeStatus('inactive')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                              newNoticeStatus === 'inactive' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                            }`}
                          >
                            🔴 Inactive / ড্রাফট
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase shadow-lg hover:scale-[1.01] transition-transform cursor-pointer"
                      >
                        {editingNotice ? 'সংশোধন সংরক্ষণ করুন (Update Notice)' : 'নোটিশ লাইভ করুন (Publish Notice)'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Real-time Notice Board Card Visual Preview */}
                <div className="space-y-4">
                  <h5 className="text-xs uppercase font-black text-pink-500 tracking-wider flex items-center gap-1.5">
                    <FileText size={14} />
                    <span>Real-Time Citizen Preview / নোটিশটি নাগরিকদের কাছে যেমন দেখাবে:</span>
                  </h5>

                  <div className="p-8 rounded-[32px] bg-gradient-to-br from-pink-900/40 via-purple-950/40 to-slate-900/40 border border-pink-500/30 text-white space-y-6 shadow-xl relative overflow-hidden backdrop-blur-md text-left">
                    {/* Glowing effect inside preview */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-pink-600 text-[8px] font-black uppercase tracking-widest text-slate-950 border border-amber-500 shadow-lg">
                      Notice #{notices.length + (editingNotice ? 0 : 1)}
                    </div>

                    <div className="space-y-1.5 border-b border-pink-500/10 pb-4 text-left">
                      <h3 className="text-lg md:text-xl font-black tracking-tight text-white">
                        {newNoticeTitle || 'আপনার নোটিশের শিরোনাম এখানে আসবে...'}
                      </h3>
                      <div className="flex items-center gap-3 text-[9px] text-pink-300 font-mono font-bold uppercase tracking-wider">
                        <span>📅 Published: {new Date().toLocaleDateString()}</span>
                        <span className="text-pink-500">•</span>
                        <span className="text-emerald-400">🟢 Verified Active</span>
                      </div>
                    </div>

                    {/* Meta Badge Grid */}
                    <div className="flex flex-wrap gap-2 text-left">
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold">
                        <span>No: {newNoticeNumber || 'NT-2026-XXXX'}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-pink-500/10 border border-pink-500/20 text-pink-300 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase font-mono">
                        <span>Type: {newNoticeType}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold">
                        <span>Rate: {newNoticeRate ? `₹${newNoticeRate}` : 'N/A / ফ্রি'}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold">
                        <span>Time: {newNoticeDeliveryTime || 'সরকারী অনুমোদন সাপেক্ষে'}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-pink-500/15 text-slate-100 text-left text-xs leading-relaxed min-h-[100px]">
                      {newNoticeBody ? parseNoticePreview(newNoticeBody) : <span className="opacity-40 italic">কোনো নোটিশের খসড়া বিবরণ নেই। বাম দিকে টাইপ করুন বা এআই রাইটার ব্যবহার করুন...</span>}
                    </div>

                    {/* Tagline */}
                    <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center text-[10px] text-pink-100 font-bold italic">
                      ✨ {newNoticeTagline || 'আপনার কাজটি আমরা অত্যন্ত নিষ্ঠা, যত্ন ও দায়িত্ব সহকারে করব।'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTICES LIST (GLASSMORPHISM, TRANSPARENT, PINK WHITE MIX) */}
          <div className={`p-6 rounded-3xl border ${gridThemeClass} space-y-4`}>
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between text-left">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-pink-300 uppercase tracking-wider">
                  Live Published Notices Database ({notices.length})
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">এখান থেকে আপনি যেকোনো নোটিশ সরাসরি এডিট, টগল বা মুছে ফেলতে পারেন।</p>
              </div>
              <span className="text-[10px] font-black uppercase font-mono px-2.5 py-1 bg-pink-500/10 text-pink-500 rounded-full border border-pink-500/20">
                Notice Feed Stream
              </span>
            </div>

            {notices.length === 0 ? (
              <div className="text-center py-20 text-slate-400 space-y-3">
                <Bell size={40} className="mx-auto text-pink-400/40 animate-pulse" />
                <p className="font-bold text-sm">কোনো নোটিশ খুঁজে পাওয়া যায়নি।</p>
                <p className="text-xs">নতুন নোটিশ তৈরি করতে উপরের "নতুন নোটিশ লিখুন" বাটনে ক্লিক করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map((notice, idx) => (
                  <div 
                    key={notice.id} 
                    className="p-6 rounded-[28px] bg-gradient-to-br from-white/10 to-pink-500/5 dark:from-slate-900/10 dark:to-pink-950/5 border-2 border-pink-500/15 hover:border-pink-500/35 transition-all duration-300 space-y-4 relative group text-left flex flex-col justify-between"
                  >
                    <div>
                      {/* Notice Header */}
                      <div className="flex justify-between items-start gap-4 border-b border-pink-500/10 pb-3">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-pink-500 bg-pink-500/5 border border-pink-500/20 px-2 py-0.5 rounded-full">
                            Notice #{idx + 1}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1.5 leading-tight group-hover:text-pink-500 transition-colors">
                            {notice.title}
                          </h4>
                          <span className="text-[9px] text-slate-400 mt-1 block">📅 {new Date(notice.createdAt).toLocaleString()}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditForm(notice)}
                            title="Edit Notice"
                            className="p-1.5 rounded-xl border border-pink-500/20 bg-pink-500/5 text-pink-500 hover:bg-pink-500/15 transition-all cursor-pointer animate-none"
                          >
                            <Edit size={14} />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (updateNotice) {
                                const newStatus = notice.status === 'active' ? 'inactive' : 'active';
                                updateNotice(notice.id, { status: newStatus });
                              }
                            }}
                            title="Toggle Live Status"
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                              notice.status === 'active'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/15'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {notice.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('আপনি কি নিশ্চিত যে এই নোটিশটি চিরতরে মুছে ফেলতে চান? (Are you sure you want to delete?)')) {
                                if (deleteNotice) {
                                  deleteNotice(notice.id);
                                }
                              }
                            }}
                            title="Delete Notice"
                            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Meta badges inside item card */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-500 text-[9px] font-mono font-bold">
                          No: {notice.noticeNumber || `NT-2026-${idx + 101}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-pink-500/5 border border-pink-500/20 text-pink-400 text-[9px] font-bold uppercase font-mono">
                          Type: {notice.noticeType || 'General'}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono font-bold">
                          Rate: {notice.rate ? `₹${notice.rate}` : 'N/A / ফ্রি'}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                          Time: {notice.deliveryTime || 'সরকারী অনুমোদন সাপেক্ষে'}
                        </span>
                      </div>

                      {/* Notice Body */}
                      <div className="p-4 rounded-2xl bg-white/5 dark:bg-slate-900/30 border border-pink-500/10 text-slate-700 dark:text-slate-300 text-xs leading-relaxed mt-4">
                        {parseNoticePreview(notice.body)}
                      </div>
                    </div>

                    {/* Tagline banner inside item card */}
                    <div className="mt-4 p-2.5 rounded-xl bg-pink-500/5 border border-pink-500/10 text-center text-[10px] text-pink-500 dark:text-pink-300 font-bold italic leading-relaxed">
                      ✨ {notice.tagline || 'আপনার কাজটি আমরা অত্যন্ত নিষ্ঠা, যত্ন ও দায়িত্ব সহকারে করব।'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

const getDocIcon = (type: string) => {
  switch (type) {
    case 'WhatsApp': return <MessageSquare size={16} className="text-emerald-500" />;
    case 'Email': return <Mail size={16} className="text-indigo-400" />;
    case 'SMS': return <Smartphone size={16} className="text-cyan-400" />;
    default: return <BellRing size={16} className="text-purple-400" />;
  }
};
