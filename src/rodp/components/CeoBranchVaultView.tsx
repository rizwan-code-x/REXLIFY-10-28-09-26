import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, ShieldAlert, KeyRound, Copy, Check, Eye, EyeOff, 
  Printer, Plus, ArrowLeft, Search, Building2, Store, Phone, Mail, 
  MapPin, UserCheck, TrendingUp, DollarSign, Calendar, Edit3, Trash2,
  ExternalLink, Lock, CheckCircle2, AlertTriangle, Shield, RefreshCw,
  FileText, Users, ChevronRight, X, Sparkles, Camera, Upload, Image as ImageIcon
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
  onCeoViewBranch
}: CeoBranchVaultViewProps) {
  // Hardcoded security check: block view if not super_admin
  const isSuperAdmin = currentUser?.role === 'super_admin';

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'office' | 'branch'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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

                  {/* BOTTOM ACTION BAR */}
                  <div className="p-3.5 bg-slate-950/90 border-t border-slate-850 flex items-center justify-between gap-3 no-print">
                    <div className="text-[10px] text-slate-400">
                      💡 Click to manage or test live operations
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(shop)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Edit Details
                      </button>

                      <button
                        onClick={() => onCeoViewBranch(
                          shop.id, 
                          shop.permissions || ['dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance'], 
                          shop.name
                        )}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-[10px] font-black shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                      >
                        <ExternalLink size={12} />
                        <span>Enter Branch Dashboard ➔</span>
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(shop)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            onClick={() => onCeoViewBranch(
                              shop.id, 
                              shop.permissions || ['dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance'], 
                              shop.name
                            )}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] transition-all cursor-pointer"
                            title="Open Branch Dashboard"
                          >
                            Login ➔
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

    </div>
  );
}
