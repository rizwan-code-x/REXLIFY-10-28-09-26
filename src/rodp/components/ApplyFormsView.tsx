import React, { useState, useMemo } from 'react';
import {
  ExternalLink, FileText, Search, Plus, Edit3, Trash2, CheckCircle2,
  Clock, AlertCircle, XCircle, ShieldCheck, Building2, Globe, Filter,
  ArrowUpRight, User, Phone, IndianRupee, Calendar, X, ChevronDown, Check,
  Sparkles, Layers, Info, Eye, Briefcase, RefreshCw
} from 'lucide-react';
import {
  ApplyFormCategory, ApplyFormWebsite, ApplyFormActivity,
  ApplyFormActivityType, Shop, User as UserType
} from '../types';

interface ApplyFormsViewProps {
  theme: 'light' | 'dark';
  currentUser: UserType | any;
  shops: Shop[];
  websites: ApplyFormWebsite[];
  activities: ApplyFormActivity[];
  onAddWebsite: (website: ApplyFormWebsite) => void;
  onUpdateWebsite: (website: ApplyFormWebsite) => void;
  onDeleteWebsite: (id: string) => void;
  onRecordActivity: (activity: ApplyFormActivity) => void;
  onUpdateActivity: (activity: ApplyFormActivity) => void;
  onDeleteActivity: (id: string) => void;
  initialFilter?: { status?: string; dateRange?: string; branchId?: string };
}

const CATEGORIES: ApplyFormCategory[] = [
  'Aadhaar',
  'Voter',
  'PAN',
  'Ration',
  'Passport',
  'Driving License',
  'Income Tax & Finance',
  'Government Schemes',
  'Job & Exam',
  'Banking & Payment',
  'Other'
];

export default function ApplyFormsView({
  theme,
  currentUser,
  shops = [],
  websites = [],
  activities = [],
  onAddWebsite,
  onUpdateWebsite,
  onDeleteWebsite,
  onRecordActivity,
  onUpdateActivity,
  onDeleteActivity,
  initialFilter
}: ApplyFormsViewProps) {
  // Branch Scoping
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const userShop = shops.find(s => s.id === currentUser?.shopId || s.customId === currentUser?.shopId) || shops[0];
  const [selectedBranchId, setSelectedBranchId] = useState<string>(initialFilter?.branchId || (isSuperAdmin ? 'all' : (userShop?.id || 'shop_1')));

  // Category & Search Filters for Portals
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [portalSearch, setPortalSearch] = useState('');

  // Activity History Filters
  const [activityStatusFilter, setActivityStatusFilter] = useState<string>(initialFilter?.status || 'All');
  const [activityDateFilter, setActivityDateFilter] = useState<string>(initialFilter?.dateRange || 'All');
  const [activitySearch, setActivitySearch] = useState('');

  // Modals
  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<ApplyFormWebsite | null>(null);
  const [websiteFormData, setWebsiteFormData] = useState({
    name: '',
    url: '',
    category: 'Aadhaar' as ApplyFormCategory,
    description: '',
    badge: 'Custom Portal',
    scope: isSuperAdmin ? 'global' : (userShop?.id || 'shop_1')
  });
  const [urlError, setUrlError] = useState<string | null>(null);

  // Work Tracker Modal
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [trackerMode, setTrackerMode] = useState<'create' | 'edit'>('create');
  const [editingActivity, setEditingActivity] = useState<ApplyFormActivity | null>(null);
  const [trackerFormData, setTrackerFormData] = useState({
    websiteId: '',
    websiteName: '',
    websiteUrl: '',
    category: 'Aadhaar',
    activityType: 'Work Started' as ApplyFormActivityType,
    customerName: '',
    customerMobile: '',
    referenceNumber: '',
    feeCharged: 50,
    notes: '',
    targetShopId: userShop?.id || 'shop_1'
  });

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'website' | 'activity';
    id: string;
    title: string;
  } | null>(null);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Safe URL Validator: Strictly http:// or https://, rejects javascript:, data:, etc.
  const isValidUrl = (testUrl: string): boolean => {
    if (!testUrl || typeof testUrl !== 'string') return false;
    const trimmed = testUrl.trim();
    if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
      return false;
    }
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Safe external portal launcher
  const handleOpenPortal = (website: ApplyFormWebsite) => {
    if (!isValidUrl(website.url)) {
      alert('Invalid or untrusted portal URL.');
      return;
    }

    // Determine current effective shop
    const activeShop = selectedBranchId !== 'all'
      ? (shops.find(s => s.id === selectedBranchId) || userShop)
      : userShop;

    // Log 'Opened' activity in database
    const newActivity: ApplyFormActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      shopId: activeShop?.id || 'shop_1',
      shopName: activeShop?.name || 'Rizwan Cyber Point',
      ownerName: activeShop?.ownerName || currentUser?.name || 'Authorized Operator',
      userId: currentUser?.id || 'usr_staff',
      userName: currentUser?.name || 'Staff Operator',
      websiteId: website.id,
      websiteName: website.name,
      websiteUrl: website.url,
      category: website.category,
      activityType: 'Opened',
      referenceNumber: '',
      customerName: '',
      customerMobile: '',
      notes: `Portal opened from ROD Apply Forms dashboard.`,
      feeCharged: 0,
      timestamp: new Date().toISOString()
    };

    onRecordActivity(newActivity);

    // Open in safe new tab (zero credentials stored or transferred)
    window.open(website.url, '_blank', 'noopener,noreferrer');

    showToast(`Opening ${website.name} (Logged in history)`);
  };

  // Open Work Tracker for a specific portal
  const handleOpenTrackerForWebsite = (website: ApplyFormWebsite) => {
    const activeShop = selectedBranchId !== 'all'
      ? (shops.find(s => s.id === selectedBranchId) || userShop)
      : userShop;

    setTrackerMode('create');
    setEditingActivity(null);
    setTrackerFormData({
      websiteId: website.id,
      websiteName: website.name,
      websiteUrl: website.url,
      category: website.category,
      activityType: 'Work Started',
      customerName: '',
      customerMobile: '',
      referenceNumber: '',
      feeCharged: 50,
      notes: '',
      targetShopId: activeShop?.id || 'shop_1'
    });
    setIsTrackerModalOpen(true);
  };

  // Edit existing activity
  const handleEditActivity = (activity: ApplyFormActivity) => {
    setTrackerMode('edit');
    setEditingActivity(activity);
    setTrackerFormData({
      websiteId: activity.websiteId || '',
      websiteName: activity.websiteName,
      websiteUrl: activity.websiteUrl,
      category: activity.category,
      activityType: activity.activityType,
      customerName: activity.customerName || '',
      customerMobile: activity.customerMobile || '',
      referenceNumber: activity.referenceNumber || '',
      feeCharged: activity.feeCharged || 0,
      notes: activity.notes || '',
      targetShopId: activity.shopId
    });
    setIsTrackerModalOpen(true);
  };

  // Save Activity Record
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const activeShop = shops.find(s => s.id === trackerFormData.targetShopId) || userShop;

    if (trackerMode === 'create') {
      const newActivity: ApplyFormActivity = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        shopId: activeShop?.id || 'shop_1',
        shopName: activeShop?.name || 'Rizwan Cyber Point',
        ownerName: activeShop?.ownerName || currentUser?.name || 'Authorized Operator',
        userId: currentUser?.id || 'usr_staff',
        userName: currentUser?.name || 'Staff Operator',
        websiteId: trackerFormData.websiteId,
        websiteName: trackerFormData.websiteName || 'Government Portal',
        websiteUrl: trackerFormData.websiteUrl,
        category: trackerFormData.category,
        activityType: trackerFormData.activityType,
        referenceNumber: trackerFormData.referenceNumber.trim(),
        customerName: trackerFormData.customerName.trim(),
        customerMobile: trackerFormData.customerMobile.trim(),
        notes: trackerFormData.notes.trim(),
        feeCharged: Number(trackerFormData.feeCharged) || 0,
        timestamp: new Date().toISOString()
      };
      onRecordActivity(newActivity);
      showToast('Activity & work details saved successfully!');
    } else if (editingActivity) {
      const updated: ApplyFormActivity = {
        ...editingActivity,
        shopId: trackerFormData.targetShopId,
        shopName: activeShop?.name || editingActivity.shopName,
        websiteName: trackerFormData.websiteName,
        websiteUrl: trackerFormData.websiteUrl,
        category: trackerFormData.category,
        activityType: trackerFormData.activityType,
        referenceNumber: trackerFormData.referenceNumber.trim(),
        customerName: trackerFormData.customerName.trim(),
        customerMobile: trackerFormData.customerMobile.trim(),
        notes: trackerFormData.notes.trim(),
        feeCharged: Number(trackerFormData.feeCharged) || 0
      };
      onUpdateActivity(updated);
      showToast('Activity record updated!');
    }

    setIsTrackerModalOpen(false);
  };

  // Save Custom Website
  const handleSaveWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);

    const trimmedUrl = websiteFormData.url.trim();
    if (!isValidUrl(trimmedUrl)) {
      setUrlError('Please enter a valid secure URL starting with https:// or http:// (no script/data schemes allowed).');
      return;
    }

    if (!websiteFormData.name.trim()) {
      setUrlError('Website name is required.');
      return;
    }

    if (editingWebsite) {
      const updated: ApplyFormWebsite = {
        ...editingWebsite,
        name: websiteFormData.name.trim(),
        url: trimmedUrl,
        category: websiteFormData.category,
        description: websiteFormData.description.trim(),
        badge: websiteFormData.badge.trim() || 'Custom Portal',
        shopId: isSuperAdmin ? websiteFormData.scope : (userShop?.id || 'shop_1'),
        updatedAt: new Date().toISOString()
      };
      onUpdateWebsite(updated);
      showToast('Website shortcut updated successfully!');
    } else {
      const newWeb: ApplyFormWebsite = {
        id: `web_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: websiteFormData.name.trim(),
        url: trimmedUrl,
        category: websiteFormData.category,
        description: websiteFormData.description.trim(),
        isOfficial: false,
        shopId: isSuperAdmin ? websiteFormData.scope : (userShop?.id || 'shop_1'),
        badge: websiteFormData.badge.trim() || 'Branch Portal',
        createdBy: currentUser?.name || 'Operator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onAddWebsite(newWeb);
      showToast('New website shortcut added to Apply Forms!');
    }

    setIsWebsiteModalOpen(false);
    setEditingWebsite(null);
  };

  // Open Edit Website Modal
  const handleStartEditWebsite = (web: ApplyFormWebsite) => {
    setEditingWebsite(web);
    setWebsiteFormData({
      name: web.name,
      url: web.url,
      category: (web.category as ApplyFormCategory) || 'Aadhaar',
      description: web.description || '',
      badge: web.badge || 'Custom Portal',
      scope: web.shopId || 'global'
    });
    setUrlError(null);
    setIsWebsiteModalOpen(true);
  };

  // Open Add Website Modal
  const handleStartAddWebsite = () => {
    setEditingWebsite(null);
    setWebsiteFormData({
      name: '',
      url: 'https://',
      category: 'Government Schemes',
      description: '',
      badge: isSuperAdmin ? 'National Portal' : 'Branch Custom',
      scope: isSuperAdmin ? 'global' : (userShop?.id || 'shop_1')
    });
    setUrlError(null);
    setIsWebsiteModalOpen(true);
  };

  // Execute confirmed deletion
  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'website') {
      onDeleteWebsite(deleteConfirm.id);
      showToast('Website shortcut deleted.');
    } else if (deleteConfirm.type === 'activity') {
      onDeleteActivity(deleteConfirm.id);
      showToast('Activity log record deleted.');
    }
    setDeleteConfirm(null);
  };

  // Filtered Websites
  const filteredWebsites = useMemo(() => {
    return websites.filter(web => {
      // Branch scoping: include global or matches user shop
      if (!isSuperAdmin) {
        if (web.shopId && web.shopId !== 'global' && web.shopId !== userShop?.id) {
          return false;
        }
      } else if (selectedBranchId !== 'all') {
        if (web.shopId && web.shopId !== 'global' && web.shopId !== selectedBranchId) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && web.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (portalSearch.trim()) {
        const q = portalSearch.toLowerCase();
        const nameMatch = web.name.toLowerCase().includes(q);
        const descMatch = (web.description || '').toLowerCase().includes(q);
        const catMatch = web.category.toLowerCase().includes(q);
        const urlMatch = web.url.toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !catMatch && !urlMatch) return false;
      }

      return true;
    });
  }, [websites, isSuperAdmin, selectedBranchId, userShop, selectedCategory, portalSearch]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // Branch scoping
      if (!isSuperAdmin) {
        if (act.shopId !== userShop?.id) return false;
      } else if (selectedBranchId !== 'all') {
        if (act.shopId !== selectedBranchId) return false;
      }

      // Status filter
      if (activityStatusFilter !== 'All' && act.activityType !== activityStatusFilter) {
        return false;
      }

      // Date filter
      if (activityDateFilter !== 'All') {
        const actDate = new Date(act.timestamp);
        const now = new Date();
        if (activityDateFilter === 'Today') {
          const isToday = actDate.getDate() === now.getDate() &&
            actDate.getMonth() === now.getMonth() &&
            actDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (activityDateFilter === 'Week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (actDate < oneWeekAgo) return false;
        } else if (activityDateFilter === 'Month') {
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (actDate < oneMonthAgo) return false;
        }
      }

      // Search filter
      if (activitySearch.trim()) {
        const q = activitySearch.toLowerCase();
        const custMatch = (act.customerName || '').toLowerCase().includes(q);
        const phoneMatch = (act.customerMobile || '').toLowerCase().includes(q);
        const refMatch = (act.referenceNumber || '').toLowerCase().includes(q);
        const portalMatch = act.websiteName.toLowerCase().includes(q);
        const noteMatch = (act.notes || '').toLowerCase().includes(q);
        if (!custMatch && !phoneMatch && !refMatch && !portalMatch && !noteMatch) return false;
      }

      return true;
    });
  }, [activities, isSuperAdmin, selectedBranchId, userShop, activityStatusFilter, activityDateFilter, activitySearch]);

  // Activity Status Stats
  const stats = useMemo(() => {
    const list = activities.filter(act => {
      if (!isSuperAdmin) return act.shopId === userShop?.id;
      if (selectedBranchId !== 'all') return act.shopId === selectedBranchId;
      return true;
    });

    const now = new Date();
    const todayList = list.filter(act => {
      const d = new Date(act.timestamp);
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const opened = list.filter(a => a.activityType === 'Opened').length;
    const started = list.filter(a => a.activityType === 'Work Started').length;
    const completed = list.filter(a => a.activityType === 'Completed').length;
    const pending = list.filter(a => a.activityType === 'Pending').length;
    const cancelled = list.filter(a => a.activityType === 'Cancelled').length;
    const totalFees = list.filter(a => a.activityType === 'Completed').reduce((sum, a) => sum + (a.feeCharged || 0), 0);

    return {
      total: list.length,
      today: todayList.length,
      opened,
      started,
      completed,
      pending,
      cancelled,
      totalFees
    };
  }, [activities, isSuperAdmin, selectedBranchId, userShop]);

  const effectiveShop = selectedBranchId !== 'all'
    ? (shops.find(s => s.id === selectedBranchId) || userShop)
    : userShop;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#0b0f19] border border-[#dfac5d]/50 text-white shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP SHOP OWNER BRANDING HEADER */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 liquid-glass-panel border border-[#dfac5d]/20 bg-gradient-to-br from-[#0c0d14] via-[#08090d] to-[#121019] shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#dfac5d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#dfac5d] text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5">
                <Globe size={11} className="text-amber-400 animate-pulse" />
                ROD Official Government Gateway
              </span>

              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} />
                Verified Cyber & CSC Seva Kendra
              </span>

              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00f2fe] text-[9px] font-mono font-bold">
                Branch ID: {effectiveShop?.customId || effectiveShop?.id || 'ROD001'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gold-gradient tracking-tight flex items-center gap-3">
                <span>{effectiveShop?.name || 'Rizwan Cyber Point & Digital Seva'}</span>
              </h1>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Authorized Proprietor: <span className="text-slate-200 font-bold">{effectiveShop?.ownerName || 'Rizwan Roushan'}</span>
                {effectiveShop?.mobile && <span className="ml-3 text-slate-400">| Contact: <span className="text-[#dfac5d] font-mono">{effectiveShop.mobile}</span></span>}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
              Curated official portal shortcuts for Aadhaar, Voter, PAN, Ration, Passport, and state welfare schemes.
              Every click records activity and allows work tracking with zero sensitive citizen credentials stored.
            </p>
          </div>

          {/* Quick Header Actions & Branch Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Multi-Branch Selector for Super Admin / CEO */}
            {isSuperAdmin && (
              <div className="relative">
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-black/70 border border-[#dfac5d]/30 text-xs font-bold text-[#dfac5d] focus:outline-none focus:border-[#dfac5d] appearance-none pr-9 cursor-pointer"
                >
                  <option value="all">🌐 All Branches Overview</option>
                  {shops.map(s => (
                    <option key={s.id} value={s.id}>
                      📍 {s.customId || s.id}: {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-[#dfac5d] pointer-events-none" />
              </div>
            )}

            <button
              onClick={handleStartAddWebsite}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#dfac5d] via-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(223,172,93,0.3)] transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>Add Portal Shortcut</span>
            </button>

            <button
              onClick={() => {
                setTrackerMode('create');
                setEditingActivity(null);
                setTrackerFormData({
                  websiteId: '',
                  websiteName: 'Other Direct Service',
                  websiteUrl: 'https://',
                  category: 'Other',
                  activityType: 'Work Started',
                  customerName: '',
                  customerMobile: '',
                  referenceNumber: '',
                  feeCharged: 50,
                  notes: '',
                  targetShopId: userShop?.id || 'shop_1'
                });
                setIsTrackerModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Briefcase size={14} className="text-[#00f2fe]" />
              <span>Log Application</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-[#dfac5d]/10">
          <div
            onClick={() => setActivityStatusFilter('Opened')}
            className="p-3 rounded-2xl bg-black/40 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
              <span>Opened</span>
              <Eye size={12} className="text-[#00f2fe]" />
            </div>
            <div className="text-xl font-black text-white font-mono mt-1">{stats.opened}</div>
          </div>

          <div
            onClick={() => setActivityStatusFilter('Work Started')}
            className="p-3 rounded-2xl bg-black/40 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
              <span>Started</span>
              <Clock size={12} className="text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">{stats.started}</div>
          </div>

          <div
            onClick={() => setActivityStatusFilter('Completed')}
            className="p-3 rounded-2xl bg-black/40 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
              <span>Completed</span>
              <CheckCircle2 size={12} className="text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">{stats.completed}</div>
          </div>

          <div
            onClick={() => setActivityStatusFilter('Pending')}
            className="p-3 rounded-2xl bg-black/40 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
              <span>Pending</span>
              <AlertCircle size={12} className="text-purple-400" />
            </div>
            <div className="text-xl font-black text-purple-400 font-mono mt-1">{stats.pending}</div>
          </div>

          <div
            onClick={() => setActivityStatusFilter('Cancelled')}
            className="p-3 rounded-2xl bg-black/40 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
              <span>Cancelled</span>
              <XCircle size={12} className="text-rose-400" />
            </div>
            <div className="text-xl font-black text-rose-400 font-mono mt-1">{stats.cancelled}</div>
          </div>

          <div
            onClick={() => setActivityDateFilter('Today')}
            className="p-3 rounded-2xl bg-black/40 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
              <span>Today's Log</span>
              <Calendar size={12} className="text-cyan-400" />
            </div>
            <div className="text-xl font-black text-[#00f2fe] font-mono mt-1">{stats.today}</div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase">
              <span>Service Fees</span>
              <IndianRupee size={12} className="text-[#dfac5d]" />
            </div>
            <div className="text-xl font-black text-[#dfac5d] font-mono mt-1">₹{stats.totalFees}</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: OFFICIAL GOVERNMENT WEBSITES SHORTCUTS */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Building2 size={18} className="text-[#dfac5d]" />
              <span>Official Government Service Portals</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                {filteredWebsites.length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct official gateways. Click "Open Portal" to launch securely in an external tab.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search portal, e.g. Aadhaar, Voter, PAN..."
              value={portalSearch}
              onChange={(e) => setPortalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#dfac5d]"
            />
            {portalSearch && (
              <button
                onClick={() => setPortalSearch('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#dfac5d] text-slate-950 font-black shadow-[0_0_12px_rgba(223,172,93,0.3)]'
                : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Portals
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#dfac5d] text-slate-950 font-black shadow-[0_0_12px_rgba(223,172,93,0.3)]'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWebsites.map(web => {
            const isCustom = !web.isOfficial;
            const canManage = isSuperAdmin || (web.shopId && web.shopId === userShop?.id);

            return (
              <div
                key={web.id}
                className="group relative p-5 rounded-2xl liquid-glass-panel border border-slate-800/90 hover:border-[#dfac5d]/40 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[#dfac5d] text-[10px] font-black uppercase tracking-wider">
                        {web.badge || web.category}
                      </span>
                      {web.isOfficial ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                          Govt Official
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Edit/Delete for custom shortcuts */}
                    {isCustom && canManage && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEditWebsite(web)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Edit Shortcut"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({
                            type: 'website',
                            id: web.id,
                            title: `Delete shortcut "${web.name}"?`
                          })}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Shortcut"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-[#dfac5d] transition-colors leading-snug">
                      {web.name}
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed line-clamp-2">
                      {web.description || `Official online portal for ${web.category} applications & tracking.`}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    {web.url}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPortal(web)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-[#dfac5d]/20 to-amber-500/10 hover:from-[#dfac5d] hover:to-amber-500 text-[#dfac5d] hover:text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#dfac5d]/30 hover:border-transparent transition-all duration-300 cursor-pointer shadow-[0_0_12px_rgba(223,172,93,0.1)]"
                  >
                    <span>Open Portal</span>
                    <ArrowUpRight size={14} className="stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => handleOpenTrackerForWebsite(web)}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    title="Log Application or Customer Details"
                  >
                    <Briefcase size={13} className="text-[#00f2fe]" />
                    <span className="hidden sm:inline">Track</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredWebsites.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-black/40 space-y-2">
            <Globe size={28} className="mx-auto text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-300">No portals match your search</h4>
            <p className="text-xs text-slate-500">Try adjusting your category filter or search keywords, or add a custom portal shortcut.</p>
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVITY & WORK HISTORY LOG */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Clock size={18} className="text-[#00f2fe]" />
              <span>Activity & Work History Tracker</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/20 font-mono font-bold">
                {filteredActivities.length} Records
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit log of opened portals, started jobs, completed tasks, and fees collected.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={activityStatusFilter}
              onChange={(e) => setActivityStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-[#dfac5d]"
            >
              <option value="All">All Statuses</option>
              <option value="Opened">👁️ Opened Only</option>
              <option value="Work Started">⏳ Work Started</option>
              <option value="Completed">✅ Completed</option>
              <option value="Pending">⚠️ Pending</option>
              <option value="Cancelled">❌ Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={activityDateFilter}
              onChange={(e) => setActivityDateFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-[#dfac5d]"
            >
              <option value="All">All Time</option>
              <option value="Today">Today Only</option>
              <option value="Week">Past 7 Days</option>
              <option value="Month">Past 30 Days</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search size={13} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search customer, ref #, portal..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#dfac5d]"
              />
            </div>
          </div>
        </div>

        {/* History Table / List */}
        <div className="rounded-2xl border border-slate-800/90 overflow-hidden liquid-glass-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#05060a] border-b border-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Portal / Service</th>
                  <th className="py-3.5 px-4">Customer & Phone</th>
                  <th className="py-3.5 px-4">Ref # / ARN</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Fee Charged</th>
                  <th className="py-3.5 px-4">Branch / Operator</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300 font-medium">
                {filteredActivities.map(act => {
                  const dateStr = new Date(act.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  });

                  // Status badge styling
                  const statusBadges: Record<ApplyFormActivityType, { bg: string; text: string; border: string; icon: any }> = {
                    'Opened': { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-700', icon: Eye },
                    'Work Started': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: Clock },
                    'Completed': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: CheckCircle2 },
                    'Pending': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', icon: AlertCircle },
                    'Cancelled': { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', icon: XCircle }
                  };
                  const badge = statusBadges[act.activityType] || statusBadges['Opened'];
                  const Icon = badge.icon;

                  return (
                    <tr key={act.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-bold text-white truncate">{act.websiteName}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{act.category}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {act.customerName ? (
                          <div>
                            <div className="font-bold text-slate-200">{act.customerName}</div>
                            {act.customerMobile && (
                              <div className="text-[10px] text-slate-400 font-mono">{act.customerMobile}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px] italic">Not specified</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        {act.referenceNumber ? (
                          <span className="px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-[#dfac5d]">
                            {act.referenceNumber}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <Icon size={11} />
                          {act.activityType}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {act.feeCharged && act.feeCharged > 0 ? (
                          <span className="text-emerald-400">₹{act.feeCharged}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-[11px] text-slate-300 font-bold">{act.shopName}</div>
                        <div className="text-[10px] text-slate-500">{act.userName}</div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditActivity(act)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                            title="Update Status / Notes"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({
                              type: 'activity',
                              id: act.id,
                              title: `Delete activity log record for "${act.websiteName}"?`
                            })}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredActivities.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No activity records found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT CUSTOM WEBSITE */}
      {isWebsiteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0b0c12] border border-[#dfac5d]/30 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="text-[#dfac5d]" size={18} />
                <h3 className="text-base font-black text-white">
                  {editingWebsite ? 'Edit Government Shortcut' : 'Add New Portal Shortcut'}
                </h3>
              </div>
              <button
                onClick={() => setIsWebsiteModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveWebsite} className="p-6 space-y-4">
              {urlError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{urlError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Portal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Bengal Ration Card Portal"
                  value={websiteFormData.name}
                  onChange={(e) => setWebsiteFormData({ ...websiteFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#dfac5d]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Official Website URL * (Must start with https:// or http://)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://wbpds.wb.gov.in/"
                  value={websiteFormData.url}
                  onChange={(e) => setWebsiteFormData({ ...websiteFormData, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-[#dfac5d]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Security guarantee: URL will open in an isolated tab with no credentials passed.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={websiteFormData.category}
                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, category: e.target.value as ApplyFormCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#dfac5d]"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. State Portal"
                    value={websiteFormData.badge}
                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#dfac5d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of services offered on this portal..."
                  value={websiteFormData.description}
                  onChange={(e) => setWebsiteFormData({ ...websiteFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#dfac5d]"
                />
              </div>

              {isSuperAdmin && (
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Branch Availability Scope
                  </label>
                  <select
                    value={websiteFormData.scope}
                    onChange={(e) => setWebsiteFormData({ ...websiteFormData, scope: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#dfac5d]"
                  >
                    <option value="global">🌐 Global (Visible to All Branches)</option>
                    {shops.map(s => (
                      <option key={s.id} value={s.id}>
                        📍 {s.customId || s.id}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWebsiteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#dfac5d] hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider"
                >
                  {editingWebsite ? 'Save Changes' : 'Create Shortcut'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WORK TRACKER / APPLICATION ENTRY */}
      {isTrackerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0b0c12] border border-[#dfac5d]/30 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="text-[#00f2fe]" size={18} />
                <h3 className="text-base font-black text-white">
                  {trackerMode === 'create' ? 'Track Application / Work Entry' : 'Update Application Status'}
                </h3>
              </div>
              <button
                onClick={() => setIsTrackerModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="p-6 space-y-4">
              <div className="p-3 rounded-2xl bg-black/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Service / Portal:</span>
                  <span className="text-xs font-bold text-[#dfac5d]">{trackerFormData.websiteName || 'Direct Application'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {trackerFormData.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Application Status *
                  </label>
                  <select
                    value={trackerFormData.activityType}
                    onChange={(e) => setTrackerFormData({ ...trackerFormData, activityType: e.target.value as ApplyFormActivityType })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#dfac5d]"
                  >
                    <option value="Work Started">⏳ Work Started</option>
                    <option value="Completed">✅ Completed</option>
                    <option value="Pending">⚠️ Pending / In Review</option>
                    <option value="Cancelled">❌ Cancelled</option>
                    <option value="Opened">👁️ Just Opened</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Fee Charged (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={trackerFormData.feeCharged}
                    onChange={(e) => setTrackerFormData({ ...trackerFormData, feeCharged: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-[#dfac5d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tanveer Ahmed"
                    value={trackerFormData.customerName}
                    onChange={(e) => setTrackerFormData({ ...trackerFormData, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#dfac5d]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    Customer Mobile
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={trackerFormData.customerMobile}
                    onChange={(e) => setTrackerFormData({ ...trackerFormData, customerMobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-[#dfac5d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Application / Acknowledgment Ref # (ARN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ARN-2026-992144, UID-UPD-8821"
                  value={trackerFormData.referenceNumber}
                  onChange={(e) => setTrackerFormData({ ...trackerFormData, referenceNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-[#dfac5d]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                  Operational Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Document verified, OTP confirmed, acknowledgment slip handed over to customer..."
                  value={trackerFormData.notes}
                  onChange={(e) => setTrackerFormData({ ...trackerFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-[#dfac5d]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTrackerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION DIALOG */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0b0c12] border border-rose-500/30 p-6 space-y-4 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 size={20} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-white">Confirm Deletion</h3>
              <p className="text-xs text-slate-400">{deleteConfirm.title}</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
