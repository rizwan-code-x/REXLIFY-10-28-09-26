import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, KeyRound, Copy, Check, Eye, EyeOff, 
  Printer, Plus, ArrowLeft, Search, Building2, Store, Phone, Mail, 
  MapPin, UserCheck, TrendingUp, DollarSign, Calendar, Edit3, Trash2,
  ExternalLink, Lock, CheckCircle2, AlertTriangle, Shield, RefreshCw,
  FileText, Users, ChevronRight, X, Sparkles, Camera, Upload, Image as ImageIcon,
  Ban, Pause, Play, RotateCcw, AlertOctagon, Send, Clock, Sliders
} from 'lucide-react';
import { Shop, Staff, Invoice, Appointment, Task, User } from '../types';
import BranchMapVisualizer from './BranchMapVisualizer';

interface CeoBranchVaultViewProps {
  theme: 'light' | 'dark';
  shops: Shop[];
  updateShop: (id: string, updates: Partial<Shop>) => void;
  addShop: (shop: Shop) => void;
  deleteShop: (id: string) => void;
  staff: Staff[];
  invoices: Invoice[];
  appointments: Appointment[];
  tasks: Task[];
  currentUser: User;
  setCurrentTab: (tab: string) => void;
  onCeoViewBranch: (shopId: string, permissions: string[], name: string) => void;
  onResetBranch?: (shopId: string) => Promise<void> | void;
}

export default function CeoBranchVaultView({
  theme,
  shops,
  updateShop,
  addShop,
  deleteShop,
  staff,
  invoices,
  appointments,
  tasks,
  currentUser,
  setCurrentTab,
  onCeoViewBranch,
  onResetBranch
}: CeoBranchVaultViewProps) {
  // Hardcoded security check: block view if not super_admin
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'office' | 'branch'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Action Modals State (6 Branch Action Controls)
  const [suspendingShop, setSuspendingShop] = useState<Shop | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('সিইও অ্যাডমিন কর্তৃক সাময়িক স্থগিতাদেশ');

  const [holdingShop, setHoldingShop] = useState<Shop | null>(null);
  const [holdReasonInput, setHoldReasonInput] = useState('সিইও নির্দেশিত সাময়িক সার্ভার রক্ষণাবেক্ষণ ও অডিট স্থগিতাদেশ');
  const [holdDurationOption, setHoldDurationOption] = useState<'15m' | '30m' | '1h' | '2h' | '24h' | 'custom'>('1h');
  const [customHoldMinutes, setCustomHoldMinutes] = useState(60);

  const [warningShop, setWarningShop] = useState<Shop | null>(null);
  const [warningMessageInput, setWarningMessageInput] = useState('');

  const [resettingShop, setResettingShop] = useState<Shop | null>(null);
  const [resetConfirmChecked, setResetConfirmChecked] = useState(false);
  const [isResettingLoading, setIsResettingLoading] = useState(false);

  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Password visibility states (keyed by shop id)
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: boolean }>({});
  const [revealAllPasswords, setRevealAllPasswords] = useState(false);

  // Copied feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copyAllToast, setCopyAllToast] = useState<string | null>(null);

  // Edit Branch Modal State
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [editName, setEditName] = useState('');
  const [editCustomId, setEditCustomId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editRoleType, setEditRoleType] = useState<'branch' | 'office' | 'staff'>('branch');
  const [editIsMainBranch, setEditIsMainBranch] = useState(false);
  const [editManagerBio, setEditManagerBio] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Onboard New Branch Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCustomId, setNewCustomId] = useState('');
  const [newPassword, setNewPassword] = useState('pass');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newMobile, setNewMobile] = useState('9593388785');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('Jalangi, Murshidabad, West Bengal');
  const [newRoleType, setNewRoleType] = useState<'branch' | 'office'>('branch');
  const [newIsMainBranch, setNewIsMainBranch] = useState(false);

  // Toggle individual password visibility
  const togglePasswordVisibility = (shopId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [shopId]: !prev[shopId]
    }));
  };

  // Toggle all passwords
  const handleToggleRevealAll = () => {
    const nextState = !revealAllPasswords;
    setRevealAllPasswords(nextState);
    const updated: { [key: string]: boolean } = {};
    shops.forEach(s => {
      updated[s.id] = nextState;
    });
    setRevealedPasswords(updated);
  };

  // Copy text helper
  const copyToClipboard = (text: string, keyIdentifier: string, successMsg?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyIdentifier);
    if (successMsg) {
      setCopyAllToast(successMsg);
      setTimeout(() => setCopyAllToast(null), 3000);
    }
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Copy all branch credentials formatted text
  const handleCopyAllBranchCredentials = () => {
    const activeShops = shops.filter(s => s.status !== 'Deleted');
    const header = `==========================================================\n👑 RIZWAN ONLINE DREAMS PLATFORM - CEO MASTER BRANCH VAULT\nConfidential Credentials Directory (Generated on ${new Date().toLocaleString()})\n==========================================================\n\n`;
    
    const body = activeShops.map((s, idx) => {
      return `[BRANCH #${idx + 1}] ${s.name} (${s.isMainBranch ? 'HEAD OFFICE / MAIN BRANCH' : 'CSC DIGITAL BRANCH'})
----------------------------------------------------------
• Branch Code / ID : ${s.customId || s.id}
• Login ID / Email : ${s.customId || s.id} / ${s.ownerEmail || 'N/A'}
• Secret Password  : ${s.password || 'pass'}
• Branch Head/Mgr  : ${s.branchHead || s.ownerName || 'Rizwan RR'}
• Contact Mobile   : ${s.mobile || '9593388785'}
• Official Email   : ${s.ownerEmail || 'N/A'}
• Physical Address : ${s.address || 'N/A'}
• Status           : ${s.status?.toUpperCase() || 'APPROVED'}
• Subscription     : ${s.subscriptionType || 'premium_yearly'}
`;
    }).join('\n');

    const fullText = header + body + `\n==========================================================\n🔒 STRICTLY CONFIDENTIAL - AUTHORIZED CEO ACCESS ONLY\n==========================================================`;
    
    navigator.clipboard.writeText(fullText);
    setCopyAllToast('✅ All Branch Credentials & Passwords copied to clipboard!');
    setTimeout(() => setCopyAllToast(null), 3500);
  };

  // Print Vault Sheet
  const handlePrintVault = () => {
    window.print();
  };

  // Open Edit Modal
  const openEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setEditName(shop.name);
    setEditCustomId(shop.customId || '');
    setEditPassword(shop.password || 'pass');
    setEditOwnerName(shop.ownerName);
    setEditMobile(shop.mobile);
    setEditEmail(shop.ownerEmail || '');
    setEditAddress(shop.address || '');
    setEditRoleType(shop.roleType || 'branch');
    setEditIsMainBranch(shop.isMainBranch || false);
    setEditManagerBio(shop.managerBio || '');
    setEditSuccessMsg(null);
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;

    if (editIsMainBranch) {
      // Ensure only one main branch
      shops.forEach(s => {
        if (s.id !== editingShop.id && s.isMainBranch) {
          updateShop(s.id, { isMainBranch: false });
        }
      });
    }

    updateShop(editingShop.id, {
      name: editName.trim(),
      customId: editCustomId.trim(),
      password: editPassword.trim(),
      ownerName: editOwnerName.trim(),
      branchHead: editOwnerName.trim(),
      mobile: editMobile.trim(),
      ownerEmail: editEmail.trim(),
      address: editAddress.trim(),
      roleType: editRoleType,
      isMainBranch: editIsMainBranch,
      managerBio: editManagerBio.trim(),
      status: 'approved',
      branchPhotosApproved: true,
      branchPhotos: (editingShop.branchPhotos && editingShop.branchPhotos.length > 0)
        ? editingShop.branchPhotos
        : [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'
          ]
    });

    setEditSuccessMsg('✅ ব্রাঞ্চের তথ্য ও পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
    setTimeout(() => {
      setEditingShop(null);
      setEditSuccessMsg(null);
    }, 1200);
  };

  // Handle Create New Branch
  const handleCreateNewBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newOwnerName.trim()) return;

    const generatedId = newCustomId.trim() || `BR${Math.floor(100 + Math.random() * 900)}`;

    const newShopObj: Shop = {
      id: `shop_${Date.now()}`,
      name: newName.trim(),
      ownerName: newOwnerName.trim(),
      ownerEmail: newEmail.trim() || `${generatedId.toLowerCase()}@rodp.com`,
      mobile: newMobile.trim() || '9593388785',
      address: newAddress.trim() || 'Jalangi, Murshidabad, West Bengal',
      gstNumber: '',
      status: 'approved',
      subscriptionType: 'premium_yearly',
      createdAt: new Date().toISOString().substring(0, 10),
      customId: generatedId,
      password: newPassword.trim() || 'pass',
      permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
      branchHead: newOwnerName.trim(),
      roleType: newRoleType,
      isMainBranch: newIsMainBranch,
      managerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      managerBio: 'সততা ও নিষ্ঠার সাথে আমাদের ব্রাঞ্চের সকল ডিজিটাল ও অনলাইন সেবা গ্রাহকদের পৌঁছে দিতে আমরা প্রতিজ্ঞাবদ্ধ।',
      congratulationsMsg: `অভিনন্দন ${newOwnerName}! ${newName} এর ব্রাঞ্চ ম্যানেজার হিসেবে আপনাকে অনেক শুভেচ্ছা।`
    };

    if (newIsMainBranch) {
      shops.forEach(s => {
        if (s.isMainBranch) {
          updateShop(s.id, { isMainBranch: false });
        }
      });
    }

    addShop(newShopObj);
    setShowAddModal(false);

    // Reset Form
    setNewName('');
    setNewCustomId('');
    setNewPassword('pass');
    setNewOwnerName('');
    setNewMobile('9593388785');
    setNewEmail('');
    setNewAddress('Jalangi, Murshidabad, West Bengal');
    setNewIsMainBranch(false);

    setCopyAllToast(`🎉 ব্রাঞ্চ "${newShopObj.name}" সফলভাবে যুক্ত হয়েছে!`);
    setTimeout(() => setCopyAllToast(null), 3500);
  };

  // Metrics helper per branch
  const getBranchMetrics = (shopId: string, customId?: string) => {
    const matchShops = (itemShopId?: string) => {
      if (!itemShopId) return false;
      return itemShopId === shopId || (customId && itemShopId.toLowerCase() === customId.toLowerCase());
    };

    const branchInvoices = invoices.filter(inv => matchShops(inv.shopId));
    const revenue = branchInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const branchAppointments = appointments.filter(app => matchShops(app.shopId)).length;
    const branchTasks = tasks.filter(t => matchShops(t.shopId) && t.status === 'Completed').length;
    const branchStaff = staff.filter(st => matchShops(st.shopId) || (customId && st.branchCode === customId));

    return {
      revenue,
      invoicesCount: branchInvoices.length,
      appointmentsCount: branchAppointments,
      tasksCount: branchTasks,
      staffCount: branchStaff.length,
      staffList: branchStaff
    };
  };

  // Filtered list of branches
  const filteredShops = useMemo(() => {
    return shops
      .filter(s => s.status !== 'Deleted')
      .filter(s => {
        if (filterType === 'office') return s.isMainBranch || s.roleType === 'office';
        if (filterType === 'branch') return !s.isMainBranch && s.roleType !== 'office';
        return true;
      })
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          (s.customId && s.customId.toLowerCase().includes(q)) ||
          (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
          (s.branchHead && s.branchHead.toLowerCase().includes(q)) ||
          (s.mobile && s.mobile.includes(q)) ||
          (s.address && s.address.toLowerCase().includes(q)) ||
          (s.ownerEmail && s.ownerEmail.toLowerCase().includes(q))
        );
      });
  }, [shops, filterType, searchQuery]);

  // Totals
  const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalInvoices = invoices.length;
  const totalStaff = staff.length;

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#070709] border border-red-500/20 shadow-2xl space-y-6 text-center animate-fade-in text-xs font-semibold">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] tracking-widest uppercase font-extrabold font-mono">
            ACCESS STRICTLY RESTRICTED
          </span>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">
            CEO Master Clearance Required
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto font-medium">
            This master vault contains confidential passwords and credentials for all system branches. Access is exclusively reserved for the CEO / Super Admin account.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold pb-16">
      
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          .printable-vault-container, .printable-vault-container * {
            visibility: visible !important;
          }
          .printable-vault-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Floating Toast notification */}
      {copyAllToast && (
        <div className="fixed top-5 right-5 z-[9999] px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-300">
          <CheckCircle2 size={18} />
          <span>{copyAllToast}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-500/15 pb-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('super_admin_panel')}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
            title="Back to Super Admin HQ / সিইও কন্ট্রোল প্যানেল"
          >
            <ArrowLeft size={16} />
            <span className="text-[11px] font-extrabold uppercase">HQ Panel</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                <Lock size={10} />
                CEO MASTER VAULT
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-black uppercase">
                {shops.filter(s => s.status !== 'Deleted').length} Branches Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mt-1">
              <Building2 size={24} className="text-amber-500" />
              <span>All Branches Master Credentials & Details</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              সমস্ত ব্রাঞ্চের লগইন আইডি, গোপন পাসওয়ার্ড, ব্রাঞ্চ হেড, মোবাইল, ও পূর্ণ এ টু জেড তথ্য ভল্ট
            </p>
          </div>
        </div>

        {/* Global Vault Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
          <button
            onClick={handleToggleRevealAll}
            className={`px-3.5 py-2 rounded-xl border text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              revealAllPasswords 
                ? 'bg-amber-500 text-slate-950 border-amber-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Toggle All Passwords Visibility"
          >
            {revealAllPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{revealAllPasswords ? 'Hide Passwords' : 'Show All Passwords'}</span>
          </button>

          <button
            onClick={handleCopyAllBranchCredentials}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            title="Copy all branches credentials as formatted text"
          >
            <Copy size={14} />
            <span>Copy All Info</span>
          </button>

          <button
            onClick={handlePrintVault}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Print / Save as PDF"
          >
            <Printer size={14} />
            <span>Print Vault PDF</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus size={15} />
            <span>Add New Branch</span>
          </button>
        </div>
      </div>

      {/* CEO Confidentiality Banner & Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 no-print">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">Total Branches</span>
            <Building2 size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {shops.filter(s => s.status !== 'Deleted').length}
          </div>
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            1 Head Office + {Math.max(0, shops.filter(s => s.status !== 'Deleted').length - 1)} Sub-branches
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500">System Collections</span>
            <DollarSign size={18} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Total {totalInvoices} Invoices recorded
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Deployed Staff</span>
            <Users size={18} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalStaff}
          </div>
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Active in branches & office
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">Security Clearance</span>
            <ShieldCheck size={18} className="text-rose-400" />
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CEO AUTHENTICATED</span>
          </div>
          <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-1">
            Passkey: RTX@RODP007 Clearance
          </p>
        </div>
      </div>

      {/* Interactive Branch Geographical Radar Map */}
      <div className="no-print">
        <BranchMapVisualizer
          theme={theme}
          shops={shops.filter(s => s.status !== 'Deleted')}
          onOpenCeoView={(shopId) => {
            const target = shops.find(s => s.id === shopId);
            if (target) {
              onCeoViewBranch(target.id, target.permissions || [], target.name);
            }
          }}
        />
      </div>

      {/* Pending Branches Banner (e.g. Branch 6 - CSC SERVICE CENTRE) */}
      {shops.some(s => s.status === 'pending' || !s.branchPhotosApproved) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/20 border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wide">
                Branch Registration & Manager Approval Required
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {shops.filter(s => s.status === 'pending' || !s.branchPhotosApproved).map(s => `${s.name} (${s.customId || s.id})`).join(', ')}
                {' '}— Enter Branch Manager Name & Approve 5 Branch Photos to activate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {shops.filter(s => s.status === 'pending' || !s.branchPhotosApproved).map(s => (
              <button
                key={s.id}
                onClick={() => openEditModal(s)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                <UserCheck size={14} />
                <span>Assign Manager ({s.customId || s.id})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 dark:bg-[#070709] border border-slate-800 p-3.5 rounded-2xl shadow-md no-print">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by branch name, code (ROD001, RCS102, MAM103, FAR104), manager, location (Barabila, Faridpur, Harekrishnapur)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                filterType === 'all' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({shops.filter(s => s.status !== 'Deleted').length})
            </button>
            <button
              onClick={() => setFilterType('office')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                filterType === 'office' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Head Office
            </button>
            <button
              onClick={() => setFilterType('branch')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                filterType === 'branch' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sub-Branches
            </button>
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Building2 size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <FileText size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Printable Vault Container */}
      <div className="printable-vault-container space-y-6">
        
        {/* Printable Header (Visible during Print) */}
        <div className="hidden print:block mb-6 text-black border-b-2 border-black pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black uppercase tracking-wider">RIZWAN ONLINE DREAMS PLATFORM</h1>
              <p className="text-xs font-bold text-gray-700">CEO CONFIDENTIAL BRANCH DIRECTORY & CREDENTIALS VAULT</p>
              <p className="text-[10px] text-gray-500">Document ID: SEC-VAULT-2026 • Export Date: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 border border-black font-black text-xs uppercase">RESTRICTED / গোপনীয়</span>
            </div>
          </div>
        </div>

        {filteredShops.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Building2 size={36} className="text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">কোন ব্রাঞ্চ পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500">আপনার সার্চ কুয়েরি অনুযায়ী কোন ব্রাঞ্চ ম্যাচ করেনি।</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredShops.map((shop, idx) => {
              const isPasswordVisible = revealedPasswords[shop.id] || revealAllPasswords;
              const metrics = getBranchMetrics(shop.id, shop.customId);
              const isMain = shop.isMainBranch || shop.roleType === 'office';

              return (
                <div
                  key={shop.id}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden relative shadow-xl flex flex-col justify-between ${
                    isMain
                      ? 'bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border-amber-500/40 hover:border-amber-500/70'
                      : 'bg-slate-900/80 dark:bg-[#070709] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Accent bar */}
                  <div className={`h-1.5 w-full ${isMain ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600' : 'bg-gradient-to-r from-indigo-500 to-sky-500'}`} />

                  <div className="p-5 space-y-4">
                    
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            ID: {shop.customId || shop.id}
                          </span>

                          {isMain ? (
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                              👑 HEAD OFFICE (মেইন ব্রাঞ্চ)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase">
                              🏢 BRANCH OFFICE (শাখা অফিস)
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase">
                            {shop.status || 'Active'}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2 mt-1">
                          <span>{shop.name}</span>
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400">
                          System ID: <strong className="text-slate-300">{shop.id}</strong> • Added: {shop.createdAt || '2026-01-10'}
                        </p>
                      </div>

                      {/* Top Action Icons */}
                      <div className="flex items-center gap-1.5 shrink-0 no-print">
                        <button
                          onClick={() => openEditModal(shop)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
                          title="Edit Branch / Change Password"
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          onClick={() => copyToClipboard(
                            `Branch: ${shop.name}\nCode: ${shop.customId || shop.id}\nPassword: ${shop.password || 'pass'}\nManager: ${shop.branchHead || shop.ownerName}\nMobile: ${shop.mobile}\nAddress: ${shop.address}`,
                            `full_${shop.id}`,
                            `✅ ${shop.name} Credentials copied!`
                          )}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all cursor-pointer"
                          title="Copy Full Branch Details"
                        >
                          {copiedKey === `full_${shop.id}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* CONFIDENTIAL CREDENTIALS VAULT BOX */}
                    <div className="p-3.5 rounded-2xl bg-[#030304] border border-amber-500/25 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <KeyRound size={12} />
                          <span>Confidential Login Credentials (লগইন তথ্য)</span>
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">
                          Encrypted Auth Token
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Branch Login ID / Code */}
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold block">
                              LOGIN USER ID / CODE
                            </span>
                            <span className="text-xs font-mono font-black text-amber-300">
                              {shop.customId || shop.id}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(shop.customId || shop.id, `id_${shop.id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                            title="Copy ID"
                          >
                            {copiedKey === `id_${shop.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>

                        {/* Secret Password */}
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold block">
                              SECRET LOGIN PASSWORD
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-white">
                                {isPasswordVisible ? (shop.password || 'pass') : '••••••••••••'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => togglePasswordVisibility(shop.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                              title={isPasswordVisible ? 'Hide' : 'Reveal'}
                            >
                              {isPasswordVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(shop.password || 'pass', `pass_${shop.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                              title="Copy Password"
                            >
                              {copiedKey === `pass_${shop.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Official Email / Alternative Login */}
                      <div className="flex items-center justify-between text-[10px] bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-850">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Mail size={12} className="text-slate-500" />
                          <span>Official Email: <strong className="text-slate-300">{shop.ownerEmail || `${(shop.customId || shop.id).toLowerCase()}@rodp.com`}</strong></span>
                        </span>
                        <button
                          onClick={() => copyToClipboard(shop.ownerEmail || `${(shop.customId || shop.id).toLowerCase()}@rodp.com`, `email_${shop.id}`)}
                          className="text-[9px] text-amber-400 hover:text-amber-300 font-mono font-bold cursor-pointer"
                        >
                          {copiedKey === `email_${shop.id}` ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                    </div>

                    {/* BRANCH LEADERSHIP & GEOGRAPHIC ADDRESS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      {/* Branch Head */}
                      <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1">
                          <UserCheck size={12} className="text-amber-400" />
                          <span>Branch Head / Manager</span>
                        </span>
                        <div className="text-xs font-black text-white">
                          {shop.branchHead || shop.ownerName || 'Branch Manager'}
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <a 
                            href={`tel:${shop.mobile}`} 
                            className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 font-mono font-bold"
                          >
                            <Phone size={11} />
                            <span>{shop.mobile || '9593388785'}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${(shop.mobile || '9593388785').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold no-print"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Physical Location Address */}
                      <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1">
                          <MapPin size={12} className="text-rose-400" />
                          <span>Physical Address / অবস্থান</span>
                        </span>
                        <div className="text-[10.5px] text-slate-300 font-medium leading-tight">
                          {shop.address || 'Jalangi, Murshidabad, West Bengal'}
                        </div>
                      </div>
                    </div>

                    {/* ASSIGNED STAFF & LIVE METRICS BAR */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-850 text-[10px]">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Users size={12} className="text-indigo-400" />
                          <span>Staff: <strong className="text-white font-mono">{metrics.staffCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300">
                          <TrendingUp size={12} className="text-emerald-400" />
                          <span>Revenue: <strong className="text-emerald-400 font-mono">₹{metrics.revenue.toLocaleString()}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300">
                          <FileText size={12} className="text-sky-400" />
                          <span>Invoices: <strong className="text-white font-mono">{metrics.invoicesCount}</strong></span>
                        </div>
                      </div>

                      <div className="text-[9px] font-mono text-slate-500">
                        Subscription: <span className="text-amber-400 uppercase font-bold">{shop.subscriptionType || 'premium'}</span>
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM ACTION BAR - 6 ACTIONS */}
                  <div className="p-3 bg-slate-950/95 border-t border-slate-800 no-print space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>সিইও এক্সেস ও ব্রাঞ্চ ম্যানেজমেন্ট কন্ট্রোল (৬টি অপশন)</span>
                      </span>
                      {shop.status === 'suspended' ? (
                        <span className="text-rose-400 font-bold bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30">
                          সাসপেন্ডেড
                        </span>
                      ) : shop.status === 'hold' ? (
                        <span className="text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                          হোল্ড
                        </span>
                      ) : shop.warningMessage && !shop.warningDismissed ? (
                        <span className="text-yellow-400 font-bold bg-yellow-500/15 px-2 py-0.5 rounded-full border border-yellow-500/30 truncate max-w-[140px]">
                          সতর্কবার্তা পাঠানো হয়েছে
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          অ্যাক্টিভ
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                      {/* 1. SUSPEND */}
                      {shop.status === 'suspended' ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateShop(shop.id, { status: 'approved', suspensionReason: undefined });
                            setActionSuccessToast(`ব্রাঞ্চ "${shop.name}" সক্রিয় করা হয়েছে!`);
                            setTimeout(() => setActionSuccessToast(null), 3500);
                          }}
                          className="px-2 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 text-[9.5px] font-black uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="সাসপেন্ড প্রত্যাহার করে সক্রিয় করুন"
                        >
                          <Play size={11} />
                          <span className="truncate">অ্যাক্টিভ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSuspendingShop(shop);
                            setSuspendReasonInput('সিইও অ্যাডমিন কর্তৃক সাময়িক স্থগিতাদেশ');
                          }}
                          className="px-2 py-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white text-[9.5px] font-black uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="ব্রাঞ্চ সম্পূর্ণ সাসপেন্ড করুন"
                        >
                          <Ban size={11} />
                          <span className="truncate">সাসপেন্ড</span>
                        </button>
                      )}

                      {/* 2. HOLD */}
                      {shop.status === 'hold' ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateShop(shop.id, { status: 'approved', holdUntil: undefined, holdReason: undefined });
                            setActionSuccessToast(`ব্রাঞ্চ "${shop.name}"-এর হোল্ড প্রত্যাহার করা হয়েছে!`);
                            setTimeout(() => setActionSuccessToast(null), 3500);
                          }}
                          className="px-2 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 text-[9.5px] font-black uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="হোল্ড প্রত্যাহার করুন"
                        >
                          <Play size={11} />
                          <span className="truncate">রিলিজ</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setHoldingShop(shop);
                            setHoldReasonInput('সিইও নির্দেশিত সাময়িক সার্ভার রক্ষণাবেক্ষণ ও অডিট স্থগিতাদেশ');
                            setHoldDurationOption('1h');
                          }}
                          className="px-2 py-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-[9.5px] font-black uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                          title="নির্দিষ্ট সময়ের জন্য হোল্ড করুন"
                        >
                          <Pause size={11} />
                          <span className="truncate">হোল্ড</span>
                        </button>
                      )}

                      {/* 3. WARNING */}
                      <button
                        type="button"
                        onClick={() => {
                          setWarningShop(shop);
                          setWarningMessageInput('');
                        }}
                        className="px-2 py-2 rounded-xl bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500 hover:text-slate-950 text-[9.5px] font-black uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                        title="ব্রাঞ্চে অফিসিয়াল সতর্কবার্তা পাঠান"
                      >
                        <AlertTriangle size={11} />
                        <span className="truncate">ওয়ার্নিং</span>
                      </button>

                      {/* 4. RESET */}
                      <button
                        type="button"
                        onClick={() => {
                          setResettingShop(shop);
                          setResetConfirmChecked(false);
                        }}
                        className="px-2 py-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/35 hover:bg-purple-600 hover:text-white text-[9.5px] font-black uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                        title="সম্পূর্ণ ডাটা মুছে ফ্যাক্টরি রিসেট করুন"
                      >
                        <RotateCcw size={11} />
                        <span className="truncate">রিসেট</span>
                      </button>

                      {/* 5. EDIT DETAILS */}
                      <button
                        type="button"
                        onClick={() => openEditModal(shop)}
                        className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[9.5px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                        title="ব্রাঞ্চের তথ্য ও পাসওয়ার্ড এডিট করুন"
                      >
                        <Edit3 size={11} />
                        <span className="truncate">এডিট</span>
                      </button>

                      {/* 6. ENTER BRANCH DASHBOARD */}
                      <button
                        type="button"
                        onClick={() => onCeoViewBranch(
                          shop.id, 
                          shop.permissions || ['dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance'], 
                          shop.name
                        )}
                        className="px-2 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-[9.5px] font-black shadow-md flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                        title="লাইভ ব্রাঞ্চ ড্যাশবোর্ডে প্রবেশ করুন"
                      >
                        <ExternalLink size={11} />
                        <span className="truncate">ড্যাশবোর্ড ➔</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="rounded-2xl border border-slate-800 overflow-x-auto bg-slate-900/60 dark:bg-[#070709] shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-[10px] uppercase font-black tracking-wider text-slate-400">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Branch Name</th>
                  <th className="py-3 px-4">Branch ID</th>
                  <th className="py-3 px-4">Login Password</th>
                  <th className="py-3 px-4">Branch Head</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Location / Address</th>
                  <th className="py-3 px-4">Revenue</th>
                  <th className="py-3 px-4 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {filteredShops.map((shop, idx) => {
                  const isPasswordVisible = revealedPasswords[shop.id] || revealAllPasswords;
                  const metrics = getBranchMetrics(shop.id, shop.customId);
                  const isMain = shop.isMainBranch || shop.roleType === 'office';

                  return (
                    <tr key={shop.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                      
                      <td className="py-3.5 px-4">
                        <div className="font-black text-white flex items-center gap-2">
                          <span>{shop.name}</span>
                          {isMain && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[8px] font-black">
                              HQ
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{shop.ownerEmail}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-amber-400">
                        <div className="flex items-center gap-1.5">
                          <span>{shop.customId || shop.id}</span>
                          <button
                            onClick={() => copyToClipboard(shop.customId || shop.id, `tbl_id_${shop.id}`)}
                            className="text-slate-500 hover:text-white no-print"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-white">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {isPasswordVisible ? (shop.password || 'pass') : '••••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(shop.id)}
                            className="text-slate-500 hover:text-white no-print"
                          >
                            {isPasswordVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(shop.password || 'pass', `tbl_pass_${shop.id}`)}
                            className="text-slate-500 hover:text-white no-print"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {shop.branchHead || shop.ownerName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {shop.mobile}
                      </td>

                      <td className="py-3.5 px-4 text-[10.5px] text-slate-400 max-w-xs truncate">
                        {shop.address}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-emerald-400">
                        ₹{metrics.revenue.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. Suspend */}
                          {shop.status === 'suspended' ? (
                            <button
                              type="button"
                              onClick={() => {
                                updateShop(shop.id, { status: 'approved', suspensionReason: undefined });
                                setActionSuccessToast(`ব্রাঞ্চ "${shop.name}" সক্রিয় করা হয়েছে!`);
                                setTimeout(() => setActionSuccessToast(null), 3500);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
                              title="সক্রিয় করুন (Activate)"
                            >
                              <Play size={12} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSuspendingShop(shop);
                                setSuspendReasonInput('সিইও অ্যাডমিন কর্তৃক সাময়িক স্থগিতাদেশ');
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                              title="সাসপেন্ড করুন (Suspend)"
                            >
                              <Ban size={12} />
                            </button>
                          )}

                          {/* 2. Hold */}
                          {shop.status === 'hold' ? (
                            <button
                              type="button"
                              onClick={() => {
                                updateShop(shop.id, { status: 'approved', holdUntil: undefined, holdReason: undefined });
                                setActionSuccessToast(`ব্রাঞ্চ "${shop.name}"-এর হোল্ড প্রত্যাহার করা হয়েছে!`);
                                setTimeout(() => setActionSuccessToast(null), 3500);
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                              title="হোল্ড রিলিজ করুন"
                            >
                              <Play size={12} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setHoldingShop(shop);
                                setHoldReasonInput('সিইও নির্দেশিত সাময়িক সার্ভার রক্ষণাবেক্ষণ ও অডিট স্থগিতাদেশ');
                                setHoldDurationOption('1h');
                              }}
                              className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                              title="হোল্ড করুন (Hold)"
                            >
                              <Pause size={12} />
                            </button>
                          )}

                          {/* 3. Warning */}
                          <button
                            type="button"
                            onClick={() => {
                              setWarningShop(shop);
                              setWarningMessageInput('');
                            }}
                            className="p-1.5 rounded-lg bg-yellow-500/15 text-yellow-300 hover:bg-yellow-500 hover:text-slate-950 transition-all cursor-pointer"
                            title="ওয়ার্নিং পাঠান (Warning)"
                          >
                            <AlertTriangle size={12} />
                          </button>

                          {/* 4. Reset */}
                          <button
                            type="button"
                            onClick={() => {
                              setResettingShop(shop);
                              setResetConfirmChecked(false);
                            }}
                            className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                            title="ফ্যাক্টরি রিসেট (Factory Reset)"
                          >
                            <RotateCcw size={12} />
                          </button>

                          {/* 5. Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(shop)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="এডিট করুন (Edit)"
                          >
                            <Edit3 size={12} />
                          </button>

                          {/* 6. Login */}
                          <button
                            type="button"
                            onClick={() => onCeoViewBranch(
                              shop.id, 
                              shop.permissions || ['dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance'], 
                              shop.name
                            )}
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[10px] transition-all cursor-pointer flex items-center gap-1"
                            title="ড্যাশবোর্ডে প্রবেশ করুন"
                          >
                            <ExternalLink size={11} />
                            <span>লগইন ➔</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT BRANCH MODAL */}
      {editingShop && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Edit3 size={18} className="text-amber-500" />
                <span>Edit Branch & Credentials</span>
              </h3>
              <button
                onClick={() => setEditingShop(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                {editSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                  Branch Name (ব্রাঞ্চের নাম)
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                    Branch ID / Code (ব্রাঞ্চ কোড)
                  </label>
                  <input
                    type="text"
                    required
                    value={editCustomId}
                    onChange={(e) => setEditCustomId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                    Login Password (গোপন পাসওয়ার্ড)
                  </label>
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                    Branch Head (ম্যানেজার নাম)
                  </label>
                  <input
                    type="text"
                    required
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                    Mobile Number (মোবাইল)
                  </label>
                  <input
                    type="text"
                    required
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                  Official Email (অফিসিয়াল ইমেইল)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                  Physical Address (গ্রাম, ডাকঘর, থানা, জেলা, পিন)
                </label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-850">
                <input
                  type="checkbox"
                  id="chkMainBranch"
                  checked={editIsMainBranch}
                  onChange={(e) => setEditIsMainBranch(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <label htmlFor="chkMainBranch" className="text-xs font-bold text-slate-200 cursor-pointer">
                  Set as Head Office / Main Branch (হেড অফিস হিসেবে চিহ্নিত করুন)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingShop(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARD NEW BRANCH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Building2 size={18} className="text-amber-500" />
                <span>Onboard New Branch & Set Password</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewBranch} className="space-y-3.5">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                  Branch Name (ব্রাঞ্চের নাম)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BARABILA DIGITAL CSC BRANCH"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                    Custom ID / Code (e.g. BAR105)
                  </label>
                  <input
                    type="text"
                    placeholder="BAR105"
                    value={newCustomId}
                    onChange={(e) => setNewCustomId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                    Login Password (পাসওয়ার্ড)
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                    Branch Head / Manager (ম্যানেজার)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ebne Farhad"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                    Mobile Number (মোবাইল)
                  </label>
                  <input
                    type="text"
                    required
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                  Official Email (ইমেইল)
                </label>
                <input
                  type="email"
                  placeholder="branch@rodp.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold block mb-1">
                  Full Physical Address (ঠিকানা)
                </label>
                <textarea
                  rows={2}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="VILLAGE + P.O ..., SAGARPARA, MURSHIDABAD, W.B."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-lg"
                >
                  Create & Activate Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION SUCCESS TOAST */}
      {actionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-[10001] bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 border border-emerald-400 animate-slide-up no-print">
          <CheckCircle2 size={16} />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* 1. SUSPEND BRANCH MODAL */}
      {suspendingShop && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left text-white my-auto animate-scale-in">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-inner">
                  <Ban size={22} className="animate-pulse" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[9px] font-black uppercase">
                    CEO COMMAND • SUSPEND BRANCH
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    ব্রাঞ্চ সম্পূর্ণ সাসপেন্ড করুন
                  </h3>
                  <p className="text-[11px] text-rose-400 font-mono font-bold">
                    🏢 {suspendingShop.name} [{suspendingShop.customId || suspendingShop.id}]
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuspendingShop(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="font-bold text-rose-300">
                ⚠️ এই অপশন কার্যকর করলে:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                <li>ব্রাঞ্চের আইডি ও পাসওয়ার্ড সম্পূর্ণ নিষ্ক্রিয় (অচল) হয়ে যাবে।</li>
                <li>ব্রাঞ্চ ম্যানেজার বা স্টাফ কোনো ধরনের লগইন বা সার্ভিস পরিচালনা করতে পারবে না।</li>
                <li>লগইন স্ক্রিনে নির্দেশ দেওয়া হবে: <em>"আপনার ব্রাঞ্চ সাময়িকভাবে সাসপেন্ড রয়েছে। অনুগ্রহ করে মেইন ব্রাঞ্চ (CEO)-এর সাথে যোগাযোগ করুন।"</em></li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono font-black text-rose-400 tracking-wider block">
                সাসপেনশনের কারণ (Suspension Reason):
              </label>
              <textarea
                rows={2}
                value={suspendReasonInput}
                onChange={(e) => setSuspendReasonInput(e.target.value)}
                placeholder="সাসপেন্ডের কারণ লিখুন..."
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSuspendingShop(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  updateShop(suspendingShop.id, { 
                    status: 'suspended',
                    suspensionReason: suspendReasonInput.trim() || 'সিইও অ্যাডমিন কর্তৃক সাময়িক স্থগিতাদেশ'
                  });
                  import('../../firebase-rexlify').then(async ({ rtdb }) => {
                    if (rtdb) {
                      const { update, ref } = await import('firebase/database');
                      update(ref(rtdb, 'rodp_shops/' + suspendingShop.id), {
                        status: 'suspended',
                        suspensionReason: suspendReasonInput.trim() || 'সিইও অ্যাডমিন কর্তৃক সাময়িক স্থগিতাদেশ',
                        updatedAt: Date.now()
                      }).catch(() => {});
                    }
                  }).catch(() => {});
                  setActionSuccessToast(`ব্রাঞ্চ "${suspendingShop.name}" সম্পূর্ণ সাসপেন্ড করা হয়েছে!`);
                  setTimeout(() => setActionSuccessToast(null), 3500);
                  setSuspendingShop(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Ban size={14} />
                <span>সাসপেন্ড কার্যকর করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. HOLD BRANCH MODAL */}
      {holdingShop && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left text-white my-auto animate-scale-in">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
                  <Pause size={22} className="animate-pulse" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black uppercase">
                    CEO COMMAND • HOLD BRANCH
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    ব্রাঞ্চ সাময়িক হোল্ড করুন
                  </h3>
                  <p className="text-[11px] text-amber-400 font-mono font-bold">
                    🏢 {holdingShop.name} [{holdingShop.customId || holdingShop.id}]
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHoldingShop(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              হোল্ড কার্যকর থাকাকালীন এই ব্রাঞ্চের আইডি/পাসওয়ার্ড দিয়ে কোনো লগইন বা কার্যক্রম চলবে না। সময় শেষ হলে অথবা সিইও রিলিজ করলে স্বয়ংক্রিয়ভাবে পুনরায় সক্রিয় হবে।
            </p>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-black text-amber-400 tracking-wider block">
                কত সময়ের জন্য হোল্ড থাকবে (Hold Duration):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '15m', label: '১৫ মিনিট', mins: 15 },
                  { id: '30m', label: '৩০ মিনিট', mins: 30 },
                  { id: '1h', label: '১ ঘণ্টা', mins: 60 },
                  { id: '2h', label: '২ ঘণ্টা', mins: 120 },
                  { id: '24h', label: '২৪ ঘণ্টা', mins: 1440 },
                  { id: 'custom', label: 'কাস্টম সময়', mins: customHoldMinutes }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setHoldDurationOption(opt.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      holdDurationOption === opt.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:border-amber-500/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {holdDurationOption === 'custom' && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10080"
                    value={customHoldMinutes}
                    onChange={(e) => setCustomHoldMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 py-2 px-3 bg-slate-950 border border-amber-500/40 rounded-xl text-xs font-mono text-white focus:outline-none"
                    placeholder="মিনিট লিখুন"
                  />
                  <span className="text-xs text-slate-400 font-bold">মিনিট নির্ধারণ করুন</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-black text-amber-400 tracking-wider block">
                ব্রাঞ্চে প্রদর্শিত সিইও বার্তা (Reason / Message):
              </label>
              <textarea
                rows={3}
                value={holdReasonInput}
                onChange={(e) => setHoldReasonInput(e.target.value)}
                placeholder="হোল্ডের কারণ লিখুন যা ব্রাঞ্চের স্ক্রিনে প্রদর্শিত হবে..."
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'সিইও নির্দেশিত সার্ভার রক্ষণাবেক্ষণ',
                  'হিসাব ও ক্যাশ লেজার অডিট স্থগিতাদেশ',
                  'জরুরি নিরাপত্তা প্রোটোকল পরীক্ষা'
                ].map((pill, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHoldReasonInput(pill)}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-amber-300 border border-white/5 cursor-pointer"
                  >
                    "{pill}"
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setHoldingShop(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  let mins = 60;
                  if (holdDurationOption === '15m') mins = 15;
                  else if (holdDurationOption === '30m') mins = 30;
                  else if (holdDurationOption === '1h') mins = 60;
                  else if (holdDurationOption === '2h') mins = 120;
                  else if (holdDurationOption === '24h') mins = 1440;
                  else if (holdDurationOption === 'custom') mins = customHoldMinutes;

                  const holdExpiry = new Date(Date.now() + mins * 60 * 1000).toISOString();
                  updateShop(holdingShop.id, {
                    status: 'hold',
                    holdUntil: holdExpiry,
                    holdReason: holdReasonInput.trim() || 'সিইও নির্দেশিত সাময়িক স্থগিতাদেশ'
                  });
                  import('../../firebase-rexlify').then(async ({ rtdb }) => {
                    if (rtdb) {
                      const { update, ref } = await import('firebase/database');
                      update(ref(rtdb, 'rodp_shops/' + holdingShop.id), {
                        status: 'hold',
                        holdUntil: holdExpiry,
                        holdReason: holdReasonInput.trim() || 'সিইও নির্দেশিত সাময়িক স্থগিতাদেশ',
                        updatedAt: Date.now()
                      }).catch(() => {});
                    }
                  }).catch(() => {});

                  setActionSuccessToast(`ব্রাঞ্চ "${holdingShop.name}" ${mins} মিনিটের জন্য হোল্ডে রাখা হয়েছে!`);
                  setTimeout(() => setActionSuccessToast(null), 3500);
                  setHoldingShop(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Pause size={14} />
                <span>হোল্ড কার্যকর করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. OFFICIAL CEO WARNING MODAL */}
      {warningShop && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-yellow-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left text-white my-auto animate-scale-in">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center shadow-inner">
                  <AlertTriangle size={22} className="animate-pulse" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-mono text-[9px] font-black uppercase">
                    CEO WARNING DESK
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    ব্রাঞ্চে সতর্কবার্তা পাঠান
                  </h3>
                  <p className="text-[11px] text-yellow-400 font-mono font-bold">
                    🏢 {warningShop.name} [{warningShop.customId || warningShop.id}]
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWarningShop(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              এই সতর্কবার্তাটি সংশ্লিষ্ট ব্রাঞ্চ ম্যানেজারের ড্যাশবোর্ডে একটি স্পষ্ট লাল-হলুদ ব্যানার হিসেবে প্রদর্শিত হবে। ব্রাঞ্চ ম্যানেজার বার্তাটি পড়ে গুণ চিহ্ন (×) আকারে কেটে দিতে পারবেন।
            </p>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-black text-yellow-400 tracking-wider block">
                সতর্কবার্তা লিখুন (Warning Message) *:
              </label>
              <textarea
                rows={4}
                required
                value={warningMessageInput}
                onChange={(e) => setWarningMessageInput(e.target.value)}
                placeholder="ব্রাঞ্চের উদ্দেশ্যে প্রয়োজনীয় সতর্কবার্তা লিখুন..."
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-400 resize-none leading-relaxed"
              />

              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 uppercase font-mono block">দ্রুত মেসেজ প্রিসেট:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'দৈনিক বিল ও ক্যাশ লেজার দ্রুত সেন্ট্রাল সিস্টেমে জমা দিন।',
                    'গ্রাহকদের সেবায় কোনো গাফিলতি বা অতিরিক্ত ফি নেওয়া গ্রহণযোগ্য নয়।',
                    'সিইও অফিশিয়াল নির্দেশিকা ও সময়সূচি কঠোরভাবে অনুসরণ করুন।'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWarningMessageInput(preset)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-yellow-500/20 text-[10px] text-slate-300 hover:text-yellow-300 border border-white/5 cursor-pointer text-left"
                    >
                      "{preset}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setWarningShop(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={!warningMessageInput.trim()}
                onClick={() => {
                  if (!warningMessageInput.trim()) return;
                  updateShop(warningShop.id, {
                    warningMessage: warningMessageInput.trim(),
                    warningSentAt: new Date().toISOString(),
                    warningDismissed: false
                  });
                  import('../../firebase-rexlify').then(async ({ rtdb }) => {
                    if (rtdb) {
                      const { update, ref } = await import('firebase/database');
                      update(ref(rtdb, 'rodp_shops/' + warningShop.id), {
                        warningMessage: warningMessageInput.trim(),
                        warningSentAt: new Date().toISOString(),
                        warningDismissed: false,
                        updatedAt: Date.now()
                      }).catch(() => {});
                    }
                  }).catch(() => {});

                  setActionSuccessToast(`ব্রাঞ্চ "${warningShop.name}"-এ সতর্কবার্তা সফলভাবে পাঠানো হয়েছে!`);
                  setTimeout(() => setActionSuccessToast(null), 3500);
                  setWarningShop(null);
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  warningMessageInput.trim()
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 active:scale-95 shadow-yellow-500/20'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Send size={14} />
                <span>ওয়ার্নিং পাঠান</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLETE FACTORY RESET BRANCH MODAL */}
      {resettingShop && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left text-white my-auto animate-scale-in">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-inner">
                  <RotateCcw size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[9px] font-black uppercase">
                    DANGER ZONE • FACTORY RESET
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    ব্রাঞ্চ সম্পূর্ণ ফ্যাক্টরি রিসেট
                  </h3>
                  <p className="text-[11px] text-purple-400 font-mono font-bold">
                    🏢 {resettingShop.name} [{resettingShop.customId || resettingShop.id}]
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResettingShop(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase font-mono">
                <AlertOctagon size={16} />
                <span>আপনি কি নিশ্চিত যে সম্পূর্ণ রিসেট করতে চান?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                ওকে ক্লিক করলে এই ব্রাঞ্চের সমস্ত ডাটা মুছে যাবে এবং নতুন ব্রাঞ্চ লগইন করার মতো একদম প্রথম অবস্থায় ফিরে যাবে:
              </p>
              <ul className="text-[11px] text-slate-300 space-y-1.5 pl-2">
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span>
                  <span>সকল বিল হিস্ট্রি ও আর্থিক লেনদেন মুছে যাবে।</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span>
                  <span>সকল অ্যাপয়েন্টমেন্ট ও সার্ভিস রেকর্ড মুছে যাবে।</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span>
                  <span>ম্যানেজারের ফটো, বায়ো এবং প্রোফাইল ভেরিফিকেশন ক্লিয়ার হবে।</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✕</span>
                  <span>পাসওয়ার্ড প্রাথমিক মূল পাসওয়ার্ডে রিসেট হবে।</span>
                </li>
                <li className="flex items-center gap-2 font-bold text-amber-300">
                  <span>✓</span>
                  <span>ব্রাঞ্চ ম্যানেজার আইডি-পাসওয়ার্ড দিয়ে লগইন করলে বাধ্যতামূলক নতুন পাসওয়ার্ড এবং নতুন লিডার ফটো আপলোড পেজ থেকে শুরু হবে।</span>
                </li>
              </ul>
            </div>

            <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-white/10 rounded-xl cursor-pointer hover:border-purple-500/40 select-none">
              <input
                type="checkbox"
                checked={resetConfirmChecked}
                onChange={(e) => setResetConfirmChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-0 cursor-pointer w-4 h-4"
              />
              <span className="text-xs text-slate-300 leading-relaxed font-semibold">
                আমি সম্পূর্ণ জেনে-বুঝে নিশ্চিত করছি যে <strong>{resettingShop.name}</strong>-এর সকল ডাটা স্থায়ীভাবে মুছে দেওয়া হবে এবং এটি নতুনের মতো প্রস্তুত হবে।
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setResettingShop(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={!resetConfirmChecked || isResettingLoading}
                onClick={async () => {
                  if (!resetConfirmChecked || !resettingShop) return;
                  setIsResettingLoading(true);
                  try {
                    if (onResetBranch) {
                      await onResetBranch(resettingShop.id);
                    } else {
                      updateShop(resettingShop.id, {
                        profileConfirmed: false,
                        passwordChanged: false,
                        managerPhoto: '',
                        managerBio: 'To provide honest, super-fast digital services to every citizen in our franchise network.',
                        status: 'approved',
                        holdUntil: undefined,
                        holdReason: undefined,
                        warningMessage: undefined
                      });
                    }

                    // Clear local storage flags for this branch
                    localStorage.removeItem(`rodp_profile_confirmed_${resettingShop.id}`);
                    localStorage.removeItem(`rodp_profile_confirmed_${resettingShop.customId}`);
                    localStorage.removeItem(`rodp_pwd_changed_${resettingShop.customId}`);
                    localStorage.removeItem(`rodp_pwd_changed_${resettingShop.id}`);
                    localStorage.removeItem(`rodp_new_leader_dismissed_${resettingShop.id}`);
                    localStorage.removeItem(`rodp_new_leader_dismissed_${resettingShop.customId}`);
                    localStorage.removeItem(`rodp_branch_products_${resettingShop.id}`);
                    localStorage.removeItem(`rodp_branch_products_${resettingShop.customId}`);
                    localStorage.removeItem(`rodp_branch_proofs_${resettingShop.id}`);
                    localStorage.removeItem(`rodp_branch_proofs_${resettingShop.customId}`);

                    // RTDB sync
                    import('../../firebase-rexlify').then(async ({ rtdb }) => {
                      if (rtdb) {
                        const { update, ref } = await import('firebase/database');
                        update(ref(rtdb, 'rodp_shops/' + resettingShop.id), {
                          profileConfirmed: false,
                          passwordChanged: false,
                          managerPhoto: '',
                          managerBio: '',
                          updatedAt: Date.now()
                        }).catch(() => {});
                      }
                    }).catch(() => {});

                    setActionSuccessToast(`ব্রাঞ্চ "${resettingShop.name}" সফলভাবে সম্পূর্ণ ফ্যাক্টরি রিসেট করা হয়েছে!`);
                    setTimeout(() => setActionSuccessToast(null), 3500);
                  } catch (err) {
                    console.error(err);
                    alert('রিসেট করতে ত্রুটি হয়েছে।');
                  } finally {
                    setIsResettingLoading(false);
                    setResettingShop(null);
                  }
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer transition-all ${
                  resetConfirmChecked && !isResettingLoading
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-95 shadow-purple-500/30'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <RotateCcw size={14} className={isResettingLoading ? 'animate-spin' : ''} />
                <span>{isResettingLoading ? 'রিসেট হচ্ছে...' : 'সম্পূর্ণ ফ্যাক্টরি রিসেট করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
