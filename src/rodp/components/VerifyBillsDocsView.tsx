import React, { useState } from 'react';
import { 
  ShieldCheck, FileText, CheckCircle2, Clock, AlertTriangle, Eye, Download, 
  Search, Check, X, Building, ArrowRight, Sparkles, Filter, 
  ZoomIn, ZoomOut, RotateCw, IndianRupee, User, Phone, Mail, QrCode, Tag, AlertCircle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OnlinePayment, DocumentVaultItem, Shop, Invoice, User as AppUser } from '../types';

interface VerifyBillsDocsViewProps {
  theme: 'light' | 'dark';
  currentUser: AppUser;
  shops: Shop[];
  onlinePayments: OnlinePayment[];
  updateOnlinePayment: (id: string, updates: Partial<OnlinePayment>) => void;
  deleteOnlinePayment?: (id: string) => void;
  vault: DocumentVaultItem[];
  addVaultItem?: (item: DocumentVaultItem) => void;
  updateVaultItem?: (id: string, updates: Partial<DocumentVaultItem>) => void;
  deleteVaultItem?: (id: string) => void;
  invoices: Invoice[];
  updateInvoice?: (id: string, updates: Partial<Invoice>) => void;
  addNotificationLog?: (log: any) => void;
}

export default function VerifyBillsDocsView({
  theme,
  currentUser,
  shops,
  onlinePayments,
  updateOnlinePayment,
  deleteOnlinePayment,
  vault,
  addVaultItem,
  updateVaultItem,
  deleteVaultItem,
  invoices,
  updateInvoice,
  addNotificationLog
}: VerifyBillsDocsViewProps) {
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const userShopId = currentUser?.shopId;

  // Active top tab
  const [activeTab, setActiveTab] = useState<'verify_bills' | 'verify_docs'>('verify_bills');

  // Add Document Modal State
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<DocumentVaultItem['category']>('Aadhaar');
  const [newDocCustName, setNewDocCustName] = useState('');
  const [newDocCustMobile, setNewDocCustMobile] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocShopId, setNewDocShopId] = useState(userShopId || 'shop_1');
  const [newDocStatus, setNewDocStatus] = useState<'Verified' | 'Pending'>('Verified');

  // Bill filters
  const [billStatusFilter, setBillStatusFilter] = useState<'All' | 'Pending' | 'Accepted' | 'Confirmed' | 'Rejected'>('All');
  const [billSearch, setBillSearch] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Document filters
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('All');
  const [docStatusFilter, setDocStatusFilter] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>('All');
  const [docSearch, setDocSearch] = useState('');

  // Modals
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; subtitle?: string; metadata?: any } | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  const [confirmModalPayment, setConfirmModalPayment] = useState<OnlinePayment | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<OnlinePayment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter payments
  const filteredPayments = onlinePayments.filter(pay => {
    // Branch scope: if not super admin, restrict to user's branch
    if (!isSuperAdmin && userShopId) {
      if (pay.shopId && pay.shopId !== userShopId) return false;
    } else if (selectedBranchFilter !== 'all') {
      if (pay.shopId !== selectedBranchFilter) return false;
    }

    if (billStatusFilter !== 'All' && pay.status !== billStatusFilter) return false;

    if (billSearch.trim()) {
      const q = billSearch.toLowerCase().trim();
      const matchName = pay.customerName?.toLowerCase().includes(q);
      const matchMobile = pay.customerMobile?.includes(q);
      const matchId = pay.id?.toLowerCase().includes(q);
      const matchTxn = pay.transactionId?.toLowerCase().includes(q);
      const matchInvoice = pay.invoiceNumber?.toLowerCase().includes(q);
      if (!matchName && !matchMobile && !matchId && !matchTxn && !matchInvoice) return false;
    }

    return true;
  });

  // Filter documents
  const filteredDocs = vault.filter(doc => {
    if (!isSuperAdmin && userShopId) {
      if (doc.shopId && doc.shopId !== userShopId) return false;
    }

    if (docCategoryFilter !== 'All' && doc.category !== docCategoryFilter) return false;

    const docStatus = doc.status || 'Pending';
    if (docStatusFilter !== 'All' && docStatus !== docStatusFilter) return false;

    if (docSearch.trim()) {
      const q = docSearch.toLowerCase().trim();
      const matchName = doc.name?.toLowerCase().includes(q);
      const matchCust = doc.customerName?.toLowerCase().includes(q);
      const matchMobile = doc.customerMobile?.includes(q);
      if (!matchName && !matchCust && !matchMobile) return false;
    }

    return true;
  });

  // Action handlers
  const handleAcceptPayment = (payment: OnlinePayment) => {
    updateOnlinePayment(payment.id, {
      status: 'Accepted',
      acceptedAt: new Date().toISOString(),
      confirmedBy: currentUser.name
    });
    triggerToast(`✓ পেমেন্ট #${payment.id} সফলভাবে একসেপ্ট (Accepted) করা হয়েছে। এবার কনফার্ম করুন।`);
  };

  const handleFinalConfirmPayment = (payment: OnlinePayment) => {
    // 1. Update payment status to Confirmed
    updateOnlinePayment(payment.id, {
      status: 'Confirmed',
      confirmedAt: new Date().toISOString(),
      confirmedBy: currentUser.name
    });

    // 2. If matching invoice exists, mark invoice as Paid
    if (payment.invoiceId && updateInvoice) {
      updateInvoice(payment.invoiceId, {
        paymentStatus: 'Paid',
        amountPaid: payment.amount,
        remainingBalance: 0,
        paymentMethod: 'UPI'
      });
    } else if (payment.invoiceNumber && updateInvoice) {
      const matched = invoices.find(i => i.invoiceNumber === payment.invoiceNumber);
      if (matched) {
        updateInvoice(matched.id, {
          paymentStatus: 'Paid',
          amountPaid: payment.amount,
          remainingBalance: 0,
          paymentMethod: 'UPI'
        });
      }
    }

    // 3. Create persistent celebratory notification for the customer
    if (addNotificationLog) {
      const congratulatoryMsg = `আপনার পেমেন্ট ব্রাঞ্চ রিসিভ করেছে। অভিনন্দন ${payment.customerName}! আপনার ₹${payment.amount} পেমেন্ট ব্রাঞ্চ সফলভাবে গ্রহণ করেছে। থ্যাংক ইউ!\n\nআপনাদের সেবায় সর্বদা নিয়োজিত — RIZWAN ONLINE DREAMS\nAlways dedicated to your service.`;
      addNotificationLog({
        id: `notif_pay_${Date.now()}`,
        recipientName: payment.customerName,
        recipientMobile: payment.customerMobile,
        type: 'SMS',
        message: congratulatoryMsg,
        timestamp: new Date().toISOString(),
        status: 'Sent',
        shopId: payment.shopId || userShopId || 'shop_1'
      });
    }

    // 4. Save to shared local broadcast for real-time customer celebration banner
    try {
      const confirmedPayload = {
        paymentId: payment.id,
        customerName: payment.customerName,
        customerMobile: payment.customerMobile,
        amount: payment.amount,
        confirmedAt: new Date().toISOString(),
        confirmedBy: currentUser.name,
        branchName: payment.shopName || 'RIZWAN ONLINE DREAMS'
      };
      localStorage.setItem('rodp_latest_confirmed_payment', JSON.stringify(confirmedPayload));
      window.dispatchEvent(new Event('rodp_payment_confirmed_event'));
    } catch (e) {
      console.warn('Local broadcast error:', e);
    }

    setConfirmModalPayment(null);
    triggerToast(`🎉 পেমেন্ট কনফার্মেশন সম্পন্ন! কাস্টমার ${payment.customerName}-কে অভিনন্দন নোটিফিকেশন পাঠানো হয়েছে।`);
  };

  const handleRejectPayment = () => {
    if (!rejectModalPayment) return;
    updateOnlinePayment(rejectModalPayment.id, {
      status: 'Rejected',
      notes: rejectReason ? `বাতিলের কারণ: ${rejectReason}` : 'পেমেন্ট স্ক্রিনশট বা ট্রানজেকশন তথ্য সঠিক নয়।'
    });
    setRejectModalPayment(null);
    setRejectReason('');
    triggerToast(`❌ পেমেন্ট বাতিল করা হয়েছে।`);
  };

  const handleVerifyDocument = (doc: DocumentVaultItem, newStatus: 'Verified' | 'Rejected') => {
    if (updateVaultItem) {
      updateVaultItem(doc.id, {
        status: newStatus,
        verifiedAt: new Date().toISOString(),
        verifiedBy: currentUser.name
      });
      triggerToast(newStatus === 'Verified' ? `✓ ডকুমেন্ট "${doc.name}" অনুমোদিত (Verified) হয়েছে।` : `ডকুমেন্ট "${doc.name}" রিজেক্ট করা হয়েছে।`);
    }
  };

  const handleAddNewDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const newDoc: DocumentVaultItem = {
      id: `doc_${Date.now()}`,
      name: newDocName.trim(),
      category: newDocCategory,
      customerName: newDocCustName.trim() || 'Citizen User',
      customerMobile: newDocCustMobile.trim() || '9593388785',
      url: newDocUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
      fileType: 'image/jpeg',
      fileSize: '1.2 MB',
      uploadedAt: new Date().toISOString(),
      shopId: newDocShopId,
      status: newDocStatus,
      verifiedAt: newDocStatus === 'Verified' ? new Date().toISOString() : undefined,
      verifiedBy: currentUser.name
    };
    if (addVaultItem) {
      addVaultItem(newDoc);
    }
    setIsAddDocModalOpen(false);
    setNewDocName('');
    setNewDocCustName('');
    setNewDocCustMobile('');
    setNewDocUrl('');
    triggerToast('✓ নতুন ভেরিফাইড ডকুমেন্ট সফলভাবে স্টোরেজে যুক্ত করা হয়েছে!');
  };

  // Stats calculation
  const totalSubmissions = onlinePayments.length;
  const pendingCount = onlinePayments.filter(p => p.status === 'Pending').length;
  const acceptedCount = onlinePayments.filter(p => p.status === 'Accepted').length;
  const confirmedCount = onlinePayments.filter(p => p.status === 'Confirmed').length;
  const totalConfirmedAmount = onlinePayments
    .filter(p => p.status === 'Confirmed')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans pb-16">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] max-w-md p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white font-bold text-xs shadow-2xl border border-white/20 flex items-center gap-3 backdrop-blur-md"
          >
            <Sparkles className="animate-spin text-amber-300" size={18} />
            <span className="flex-1">{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-amber-500/25 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-black uppercase tracking-widest">
                VERIFICATION & AUDIT CONSOLE
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Real-Time Sync
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              <ShieldCheck className="text-amber-400 shrink-0" size={28} />
              <span>ভেরিফাই বিল ও ভেরিফাইড ডকুমেন্ট</span>
            </h1>
            
            <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
              অনলাইনে কাস্টমারদের জমা দেওয়া বিল পেমেন্ট স্ক্রিনশট যাচাই, Accept ও Confirm করুন এবং আপলোডকৃত পরিচয়পত্র ও ডকুমেন্টস অডিট করুন।
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-white/10 shrink-0 font-mono text-center">
            <div className="px-3 py-1 border-r border-white/10">
              <span className="text-[9px] text-amber-400 font-bold block uppercase">Pending Bills</span>
              <span className="text-xl font-black text-white">{pendingCount}</span>
            </div>
            <div className="px-3 py-1">
              <span className="text-[9px] text-emerald-400 font-bold block uppercase">Confirmed</span>
              <span className="text-xl font-black text-emerald-400">₹{totalConfirmedAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher: 1. Verify Bills | 2. Verify Documents */}
        <div className="flex gap-2 pt-6 mt-6 border-t border-white/10 relative z-10 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('verify_bills')}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'verify_bills'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900 border border-white/10'
            }`}
          >
            <IndianRupee size={16} />
            <span>১. ভেরিফাই বিল (Verify Online Bills)</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-950 text-amber-300 font-black font-mono">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verify_docs')}
            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'verify_docs'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900 border border-white/10'
            }`}
          >
            <FileText size={16} />
            <span>২. ভেরিফাইড ডকুমেন্ট (Verify Documents)</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-white/10 text-slate-300 font-black font-mono">
              {vault.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PART 1: VERIFY ONLINE BILLS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'verify_bills' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
            
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap bg-slate-950/70 p-1.5 rounded-xl border border-white/5">
              {(['All', 'Pending', 'Accepted', 'Confirmed', 'Rejected'] as const).map(st => {
                const count = onlinePayments.filter(p => st === 'All' ? true : p.status === st).length;
                const isActive = billStatusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setBillStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{st}</span>
                    <span className="text-[9px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Search & Branch Selector */}
            <div className="flex items-center gap-3">
              {isSuperAdmin && (
                <div className="flex items-center gap-1.5 bg-slate-950/70 px-3 py-2 rounded-xl border border-white/10">
                  <Building size={13} className="text-amber-400" />
                  <select
                    value={selectedBranchFilter}
                    onChange={(e) => setSelectedBranchFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Branches (সব ব্রাঞ্চ)</option>
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={billSearch}
                  onChange={(e) => setBillSearch(e.target.value)}
                  placeholder="Search Name, Mobile, Ref ID..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredPayments.map((pay) => {
              const isPending = pay.status === 'Pending';
              const isAccepted = pay.status === 'Accepted';
              const isConfirmed = pay.status === 'Confirmed';
              const isRejected = pay.status === 'Rejected';

              return (
                <div
                  key={pay.id}
                  className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-xl space-y-4 ${
                    isConfirmed 
                      ? 'bg-slate-900/60 border-emerald-500/30' 
                      : isAccepted
                      ? 'bg-slate-900/70 border-cyan-500/40 shadow-cyan-500/5'
                      : isRejected
                      ? 'bg-slate-950/80 border-rose-500/20'
                      : 'bg-slate-900/80 border-amber-500/40 shadow-amber-500/5'
                  }`}
                >
                  {/* Decorative background glow */}
                  <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
                    isConfirmed ? 'bg-emerald-500/10' : isAccepted ? 'bg-cyan-500/10' : 'bg-amber-500/10'
                  }`} />

                  {/* Header Row */}
                  <div className="flex justify-between items-start gap-2 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-[9.5px] font-black uppercase tracking-wider">
                          Ref #{pay.id}
                        </span>
                        {pay.invoiceNumber && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[9px]">
                            {pay.invoiceNumber}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-white">{pay.customerName}</h3>
                      <p className="text-xs text-amber-300 font-mono flex items-center gap-2">
                        <Phone size={11} />
                        <span>{pay.customerMobile}</span>
                        {pay.customerEmail && (
                          <span className="text-slate-400 text-[10.5px]">({pay.customerEmail})</span>
                        )}
                      </p>
                    </div>

                    {/* Status Badge & Amount */}
                    <div className="text-right space-y-1">
                      <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                        ₹{pay.amount.toLocaleString('en-IN')}
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border font-mono ${
                        isConfirmed 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : isAccepted
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 animate-pulse'
                          : isRejected
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse'
                      }`}>
                        {isConfirmed ? '✓ Confirmed & Received' : isAccepted ? '⚡ Accepted (Awaiting Confirm)' : pay.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details & Branch */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-950/70 rounded-2xl border border-white/5 text-xs font-mono relative z-10">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Transaction / UTR ID</span>
                      <span className="text-slate-200 font-bold">{pay.transactionId || 'UPI Standard Txn'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Target Branch</span>
                      <span className="text-amber-400 font-bold truncate block">{pay.shopName || 'Main Branch Office'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Submission Time</span>
                      <span className="text-slate-400 text-[10px]">{new Date(pay.submittedAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Verified By</span>
                      <span className="text-slate-300 text-[10px]">{pay.confirmedBy || (isAccepted ? 'Review Desk' : 'Pending')}</span>
                    </div>
                  </div>

                  {/* Screenshot Preview Card OR Text-Only Payment Request */}
                  {pay.screenshotUrl && pay.screenshotUrl !== 'text_only' ? (
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/5 space-y-2 relative z-10">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="font-bold uppercase flex items-center gap-1.5">
                          <Eye size={12} className="text-amber-400" />
                          <span>Payment Slip / রসিদের স্ক্রিনশট</span>
                        </span>
                        <span className="text-[9px] text-amber-400/80">Click image to expand full-screen</span>
                      </div>

                      <div
                        onClick={() => {
                          setPreviewImage({
                            url: pay.screenshotUrl,
                            title: `Payment Slip: ₹${pay.amount} • ${pay.customerName}`,
                            subtitle: `Ref #${pay.id} • Txn: ${pay.transactionId || 'N/A'} • ${pay.shopName || 'Branch'}`,
                            metadata: pay
                          });
                          setImageZoom(1);
                          setImageRotation(0);
                        }}
                        className="relative h-44 rounded-xl overflow-hidden bg-slate-900 border border-white/10 group/img cursor-pointer flex items-center justify-center"
                      >
                        <img
                          src={pay.screenshotUrl}
                          alt="Payment Proof Slip"
                          className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <div className="p-3 rounded-full bg-amber-500 text-slate-950 font-black shadow-xl flex items-center gap-1.5 text-xs uppercase">
                            <Eye size={16} />
                            <span>বড় করে দেখুন (Full View)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2 text-left relative z-10">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <AlertCircle size={15} />
                        <span>কাস্টমার পেমেন্ট রিকোয়েস্ট (Text Submission)</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
                        {pay.notes || pay.transactionId || 'অনলাইন বিল পেমেন্ট রিকোয়েস্ট'}
                      </p>
                      <p className="text-[11px] text-amber-300 font-medium">
                        এই ব্যক্তি একটি পেমেন্ট রিকোয়েস্ট পাঠিয়েছেন যার পরিমাণ <strong>₹{pay.amount}</strong> এবং নাম <strong>{pay.customerName}</strong>, অনুগ্রহ করে তথ্য দেখে একসেপ্ট ও কনফার্ম করুন।
                      </p>
                    </div>
                  )}

                  {/* Action Decision Buttons */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 items-center justify-between relative z-10">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Step 1 Action: Accept */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleAcceptPayment(pay)}
                          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-1.5 active:scale-95"
                          title="Verify and Accept Payment details"
                        >
                          <Check size={14} />
                          <span>১. একসেপ্ট (Accept)</span>
                        </button>
                      )}

                      {/* Step 2 Action: Confirm */}
                      {(isPending || isAccepted) && (
                        <button
                          type="button"
                          onClick={() => setConfirmModalPayment(pay)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
                          title="Confirm Payment & Issue Final Receipt"
                        >
                          <CheckCircle2 size={14} />
                          <span>২. কনফার্ম (Confirm & Receive)</span>
                        </button>
                      )}

                      {/* Reject Button */}
                      {!isConfirmed && !isRejected && (
                        <button
                          type="button"
                          onClick={() => {
                            setRejectModalPayment(pay);
                            setRejectReason('');
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <X size={14} />
                          <span>রিজেক্ট (Reject)</span>
                        </button>
                      )}
                    </div>

                    {isConfirmed && (
                      <div className="text-emerald-400 text-xs font-bold font-mono flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 size={14} />
                        <span>পেমেন্ট ব্রাঞ্চ রিসিভ করেছে ও নোটিফিকেশন পাঠানো হয়েছে</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}

            {filteredPayments.length === 0 && (
              <div className="col-span-full p-12 text-center rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
                <ShieldCheck size={40} className="mx-auto text-slate-600 animate-pulse" />
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  No online bill payments found for filter "{billStatusFilter}"
                </h4>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                  কাস্টমার প্যানেল থেকে যখন কোনো ইউজার অনলাইনে ইউপিআই বা ব্যাংকে পেমেন্ট করে স্ক্রিনশট সাবমিট করবে, তখন তা রিয়েল-টাইমে এখানে প্রদর্শিত হবে।
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PART 2: VERIFIED DOCUMENTS AUDIT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'verify_docs' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Row: Title & Add Document Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <FileText className="text-cyan-400" size={18} />
                <span>নাগরিক ডকুমেন্টস ও ভেরিফিকেশন স্টোরেজ (Citizen Verified Proofs)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ডকুমেন্ট স্টোরেজে সংরক্ষিত ফাইল প্রিভিউ করুন বা নতুন ভেরিফাইড ডকুমেন্ট সরাসরি যুক্ত করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddDocModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus size={15} className="stroke-[3px]" />
              <span>নতুন ডকুমেন্ট যুক্ত করুন (Add Document)</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap bg-slate-950/70 p-1.5 rounded-xl border border-white/5">
              {(['All', 'Aadhaar', 'PAN', 'Passport', 'Certificate', 'Other'] as const).map(cat => {
                const isActive = docCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDocCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Status Filter & Search */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-950/70 px-3 py-2 rounded-xl border border-white/10">
                <Filter size={13} className="text-cyan-400" />
                <select
                  value={docStatusFilter}
                  onChange={(e) => setDocStatusFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="All">All Verification Status</option>
                  <option value="Pending">Pending (অপেক্ষমান)</option>
                  <option value="Verified">Verified (অনুমোদিত)</option>
                  <option value="Rejected">Rejected (বাতিল)</option>
                </select>
              </div>

              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search Document, Customer..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/70 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => {
              const isDocVerified = doc.status === 'Verified';
              const isDocRejected = doc.status === 'Rejected';

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 transition-all shadow-xl space-y-4 relative overflow-hidden group text-left"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[9px] font-black uppercase">
                        {doc.category}
                      </span>
                      <h4 className="text-sm font-black text-white mt-1 line-clamp-1">{doc.name}</h4>
                      <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                        {doc.customerName || 'Citizen User'} {doc.customerMobile ? `(${doc.customerMobile})` : ''}
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider font-mono ${
                      isDocVerified 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isDocRejected 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                    }`}>
                      {doc.status || 'Pending'}
                    </span>
                  </div>

                  {/* Document Preview Area */}
                  <div
                    onClick={() => {
                      setPreviewImage({
                        url: doc.url,
                        title: doc.name,
                        subtitle: `${doc.category} • ${doc.customerName || 'Citizen'} • ${doc.fileSize || 'Standard'}`
                      });
                      setImageZoom(1);
                      setImageRotation(0);
                    }}
                    className="relative h-36 rounded-2xl overflow-hidden bg-slate-950 border border-white/5 cursor-pointer flex items-center justify-center group/preview"
                  >
                    <img
                      src={doc.url}
                      alt={doc.name}
                      className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase flex items-center gap-1.5 shadow-lg">
                        <Eye size={14} />
                        <span>View Document</span>
                      </span>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono border-t border-white/5 pt-2">
                    <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    <span>Size: {doc.fileSize || '1.0 MB'}</span>
                  </div>

                  {/* Verification action buttons */}
                  <div className="flex gap-2 pt-1">
                    {!isDocVerified && (
                      <button
                        type="button"
                        onClick={() => handleVerifyDocument(doc, 'Verified')}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check size={14} />
                        <span>Verify / অ্যাপ্রুভ</span>
                      </button>
                    )}

                    {!isDocRejected && (
                      <button
                        type="button"
                        onClick={() => handleVerifyDocument(doc, 'Rejected')}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}

                    <a
                      href={doc.url}
                      download={doc.name}
                      className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                      title="Download Document"
                    >
                      <Download size={14} />
                    </a>
                  </div>

                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="col-span-full p-12 text-center rounded-3xl bg-slate-900/40 border border-white/5 space-y-3">
                <FileText size={40} className="mx-auto text-slate-600" />
                <h4 className="text-sm font-black text-slate-300 uppercase tracking-wider">
                  No documents found matching "{docCategoryFilter}"
                </h4>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN IMAGE / SLIP PREVIEW MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
              <div className="space-y-0.5 text-left">
                <h3 className="text-base font-black text-white font-mono uppercase">{previewImage.title}</h3>
                {previewImage.subtitle && (
                  <p className="text-xs text-amber-400 font-mono font-medium">{previewImage.subtitle}</p>
                )}
              </div>

              {/* Control buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageZoom(prev => Math.min(prev + 0.25, 3))}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setImageZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setImageRotation(prev => (prev + 90) % 360)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Rotate"
                >
                  <RotateCw size={16} />
                </button>
                <a
                  href={previewImage.url}
                  download="slip-document.jpg"
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors"
                  title="Download Image"
                >
                  <Download size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-colors ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Image Canvas */}
            <div className="flex-1 flex items-center justify-center overflow-auto p-4 relative">
              <motion.img
                src={previewImage.url}
                alt="Document Preview"
                style={{
                  transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Quick action footer if metadata is payment */}
            {previewImage.metadata && previewImage.metadata.status !== 'Confirmed' && (
              <div className="p-4 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between gap-4 shrink-0">
                <span className="text-xs text-slate-300 font-mono">
                  Review complete? You can directly accept or confirm this payment:
                </span>
                <div className="flex gap-2">
                  {previewImage.metadata.status === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleAcceptPayment(previewImage.metadata);
                        setPreviewImage(null);
                      }}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider"
                    >
                      Accept
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const meta = previewImage.metadata;
                      setPreviewImage(null);
                      setConfirmModalPayment(meta);
                    }}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider"
                  >
                    Confirm & Receive
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* FINAL PAYMENT CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {confirmModalPayment && (
          <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden"
            >
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      পেমেন্ট কনফার্ম ও রিসিভ করুন
                    </h3>
                    <p className="text-xs text-emerald-400 font-mono font-bold">
                      CONFIRM & ISSUE DIGITAL CLEARANCE
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModalPayment(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-bold text-white">{confirmModalPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Mobile:</span>
                  <span className="font-bold text-cyan-400">{confirmModalPayment.customerMobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Received:</span>
                  <span className="font-black text-emerald-400 text-sm">₹{confirmModalPayment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Txn / UTR:</span>
                  <span className="font-bold text-slate-300">{confirmModalPayment.transactionId || 'Standard UPI'}</span>
                </div>
              </div>

              {/* Congratulatory message preview */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-2 text-xs">
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black block font-mono">
                  CUSTOMER NOTIFICATION MESSAGE PREVIEW:
                </span>
                <p className="text-slate-200 font-medium leading-relaxed">
                  "আপনার পেমেন্ট ব্রাঞ্চ রিসিভ করেছে। অভিনন্দন <strong>{confirmModalPayment.customerName}</strong>! আপনার পেমেন্ট ব্রাঞ্চ সফলভাবে গ্রহণ করেছে। থ্যাংক ইউ!"
                </p>
                <p className="text-[11px] text-amber-300/90 font-bold italic pt-1 border-t border-emerald-500/10">
                  "আপনাদের সেবায় সর্বদা নিয়োজিত — RIZWAN ONLINE DREAMS / Always dedicated to your service"
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalPayment(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cancel / ফিরে যান
                </button>
                <button
                  type="button"
                  onClick={() => handleFinalConfirmPayment(confirmModalPayment)}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  Confirm & Receive / কনফার্ম করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* REJECT PAYMENT DIALOG */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rejectModalPayment && (
          <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-sm font-black text-rose-400 uppercase font-mono flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <span>পেমেন্ট বাতিল করুন (Reject Payment)</span>
                </h3>
                <button onClick={() => setRejectModalPayment(null)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                গ্রাহক <strong>{rejectModalPayment.customerName}</strong> এর ₹{rejectModalPayment.amount} পেমেন্ট বাতিল করার কারণ লিখুন:
              </p>

              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="যেমন: অস্পষ্ট স্ক্রিনশট অথবা ট্রানজেকশন ব্যালেন্সে পৌঁছায়নি..."
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalPayment(null)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectPayment}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs uppercase tracking-wider"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          ADD NEW VERIFIED CITIZEN DOCUMENT MODAL
      ======================================================== */}
      <AnimatePresence>
        {isAddDocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                      নতুন ডকুমেন্ট সংরক্ষণ করুন
                    </h3>
                    <p className="text-[10.5px] text-slate-400 font-mono">Store Verified Proof to System Vault</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddNewDocument} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Document Title / ফাইলের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. Aadhaar Card (Front & Back)"
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                      Category / বিভাগ *
                    </label>
                    <select
                      value={newDocCategory}
                      onChange={(e) => setNewDocCategory(e.target.value as any)}
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                      <option value="Passport">Passport / Visa</option>
                      <option value="Certificate">Certificate / Marksheet</option>
                      <option value="Photo">Passport Photo</option>
                      <option value="PDF">PDF Document</option>
                      <option value="Other">Other Proof</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                      Verification Status
                    </label>
                    <select
                      value={newDocStatus}
                      onChange={(e) => setNewDocStatus(e.target.value as any)}
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Verified">✓ Verified (অনুমোদিত)</option>
                      <option value="Pending">⏳ Pending (অপেক্ষমান)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={newDocCustName}
                      onChange={(e) => setNewDocCustName(e.target.value)}
                      placeholder="e.g. Asif Iqbal"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                      Mobile Connection
                    </label>
                    <input
                      type="tel"
                      value={newDocCustMobile}
                      onChange={(e) => setNewDocCustMobile(e.target.value)}
                      placeholder="e.g. 9593388785"
                      className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block mb-1">
                    Document Image / File Upload (বা ইমেজ URL)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setNewDocUrl(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newDocUrl}
                      onChange={(e) => setNewDocUrl(e.target.value)}
                      placeholder="https://... ইমেজ লিংক (বা ফাইল সিলেক্ট করুন)"
                      className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDocModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase"
                  >
                    বাতিল (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check size={16} />
                    <span>সংরক্ষণ করুন (Save)</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
