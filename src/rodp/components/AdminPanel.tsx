import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Plus, CheckCircle, Ban, Trash, Search, IndianRupee, 
  Store, Users, Sparkles, KeyRound, MapPin, CheckSquare, Calendar,
  Lock, Unlock, ShieldCheck, UserCheck, Power, AlertTriangle, Eye, ArrowLeft, TrendingUp,
  Wallet, Clock, BarChart3, Receipt, CreditCard, Check, X, FileText, Download, Settings,
  User, Phone, RotateCcw, Pause, Play, AlertOctagon, Send, ShieldOff, AlertCircle, Clock3, RotateCw
} from 'lucide-react';
import { Shop, SecurityLog, UserRole, ServiceModule, Task, Notice, Inquiry, ServiceChangeNotification } from '../types';

interface AdminPanelProps {
  theme: 'light' | 'dark';
  shops: Shop[];
  addShop: (shop: Shop) => void;
  updateShop: (id: string, updates: any) => void;
  deleteShop: (id: string) => void;
  onResetBranch?: (id: string) => Promise<void> | void;
  securityLogs: SecurityLog[];
  sessionLogs?: any[];
  invoices?: any[];
  appointments?: any[];
  tasks?: any[];
  addTask?: (task: Task) => void;
  customers?: any[];
  onCeoViewBranch?: (shopId: string, permissions: string[], name: string) => void;
  services?: ServiceModule[];
  addService?: (record: ServiceModule) => void;
  updateService?: (id: string, updates: any) => void;
  deleteService?: (id: string) => void;
  updateAppointment?: (id: string, updates: any) => void;
  goToBillingWithCustomer?: (mobile: string, serviceName: string) => void;
  notices?: Notice[];
  addNotice?: (notice: Notice) => void;
  updateNotice?: (id: string, updates: any) => void;
  deleteNotice?: (id: string) => void;
  inquiries?: Inquiry[];
  deleteInquiry?: (id: string) => void;
  updateInquiry?: (id: string, updates: any) => void;
  groupMessages?: any[];
  groupSettings?: any;
  onAddGroupMessage?: (msg: any) => void;
  onUpdateGroupSettings?: (settings: any) => void;
  onUpdateGroupMessage?: (id: string, updates: any) => void;
  onNavigateToBranchVault?: () => void;
  onNavigateToVerifyBillsDocs?: () => void;
  serviceNotifications?: ServiceChangeNotification[];
  replyToServiceNotification?: (id: string, replyText: string) => void;
  markServiceNotificationRead?: (id: string) => void;
  onNavigateToConnectAllBranches?: () => void;
}

export default function AdminPanel({
  theme,
  shops,
  addShop,
  updateShop,
  deleteShop,
  securityLogs,
  sessionLogs = [],
  invoices = [],
  appointments = [],
  tasks = [],
  addTask,
  customers = [],
  onCeoViewBranch,
  services = [],
  addService,
  updateService,
  deleteService,
  updateAppointment,
  goToBillingWithCustomer,
  notices = [],
  addNotice,
  updateNotice,
  deleteNotice,
  inquiries = [],
  deleteInquiry,
  updateInquiry,
  groupMessages = [],
  groupSettings,
  onAddGroupMessage,
  onUpdateGroupSettings,
  onUpdateGroupMessage,
  onNavigateToBranchVault,
  onNavigateToVerifyBillsDocs,
  serviceNotifications = [],
  replyToServiceNotification,
  markServiceNotificationRead,
  onNavigateToConnectAllBranches,
  onResetBranch
}: AdminPanelProps) {
  // Branch Control Action Modals (Suspend, Hold, Reset, Warning)
  const [holdingShop, setHoldingShop] = useState<Shop | null>(null);
  const [holdDurationOption, setHoldDurationOption] = useState<'15m' | '30m' | '1h' | '2h' | '24h' | 'custom'>('1h');
  const [customHoldMinutes, setCustomHoldMinutes] = useState(60);
  const [holdReasonInput, setHoldReasonInput] = useState('সিইও নির্দেশিত সাময়িক সার্ভার রক্ষণাবেক্ষণ ও অডিট স্থগিতাদেশ');

  const [warningShop, setWarningShop] = useState<Shop | null>(null);
  const [warningMessageInput, setWarningMessageInput] = useState('');

  const [resettingShop, setResettingShop] = useState<Shop | null>(null);
  const [resetConfirmChecked, setResetConfirmChecked] = useState(false);
  const [isResettingLoading, setIsResettingLoading] = useState(false);

  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Service Change Activity Drawer State
  const [showServiceNotifDrawer, setShowServiceNotifDrawer] = useState(false);
  const [serviceReplyInput, setServiceReplyInput] = useState<{[key: string]: string}>({});

  // Authentication Clearance State
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});
  const [isCleared, setIsCleared] = useState(() => {
    const raw = localStorage.getItem('rodp_logged_in_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.role === 'super_admin') return true;
      } catch (e) {}
    }
    return false;
  });
  const [clearancePassword, setClearancePassword] = useState('');
  const [showClearancePass, setShowClearancePass] = useState(false);
  const [clearanceError, setClearanceError] = useState<string | null>(null);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'live_sessions' | 'security_logs' | 'live_monitor'>('live_monitor');

  // Live monitor auto-updating interval tick
  const [monitorTick, setMonitorTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setMonitorTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to extract currently online staff and citizens dynamically from session logs
  const getOnlineUsers = () => {
    const userStatus: { [key: string]: { name: string; role: string; lastSeen: string; status: 'online' | 'offline'; branchName: string; loginTime: string } } = {};
    
    const sortedLogs = [...sessionLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    sortedLogs.forEach(log => {
      if (!log.userName || !log.userRole) return;
      const key = `${log.userName}_${log.userRole}`;
      if (log.action === 'Login') {
        userStatus[key] = {
          name: log.userName,
          role: log.userRole,
          lastSeen: log.timestamp || new Date().toISOString(),
          status: 'online',
          branchName: log.branchName || 'Central / Main Branch',
          loginTime: log.timestamp || new Date().toISOString()
        };
      } else if (log.action === 'Logout') {
        if (userStatus[key]) {
          userStatus[key].status = 'offline';
          userStatus[key].lastSeen = log.timestamp || new Date().toISOString();
        }
      }
    });

    return Object.values(userStatus).filter(user => user.status === 'online');
  };

  // Customer Lookup States
  const [customerSearchId, setCustomerSearchId] = useState('');
  const [searchedCustomer, setSearchedCustomer] = useState<any | null>(null);
  const [customerLookupError, setCustomerLookupError] = useState<string | null>(null);
  
  // CEO Live Appointments Filter State
  const [ceoApptFilter, setCeoApptFilter] = useState<'Pending' | 'Approved' | 'Completed' | 'All'>('Pending');

  // Search & Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedShopForDossier, setSelectedShopForDossier] = useState<Shop | null>(null);
  const [selectedMapBranchId, setSelectedMapBranchId] = useState<string | null>('shop_1');
  const [visiblePassMap, setVisiblePassMap] = useState<{[key: string]: boolean}>({});
  const [copiedPassNotice, setCopiedPassNotice] = useState<string | null>(null);

  // Dossier File Upload Drag & Drop and URL states
  const [dossierBranchDragActive, setDossierBranchDragActive] = useState(false);
  const [dossierManagerDragActive, setDossierManagerDragActive] = useState(false);
  const [dossierBranchPhotoUrl, setDossierBranchPhotoUrl] = useState('');
  const [dossierManagerPhotoUrl, setDossierManagerPhotoUrl] = useState('');
  const [dossierError, setDossierError] = useState<string | null>(null);

  // Service Price Management State Variables
  const [showServicePriceManager, setShowServicePriceManager] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  
  // Form variables for adding/editing a service
  const [svcName, setSvcName] = useState('');
  const [svcCategory, setSvcCategory] = useState('Online Work');
  const [svcDescription, setSvcDescription] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcBengali, setSvcBengali] = useState('');

  // Form States for new Entity
  const [roleType, setRoleType] = useState<'branch' | 'office' | 'staff'>('branch');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('pass');
  const [customId, setCustomId] = useState('');
  const [permissions, setPermissions] = useState<string[]>([
    'dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant'
  ]);

  // Enhanced custom parameters for Branches
  const [isMainBranch, setIsMainBranch] = useState(false);
  const [managerPhoto, setManagerPhoto] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
  const [managerBio, setManagerBio] = useState('একটি প্রফেশনাল এবং কর্মঠ মানসিকতার সাথে মেইন ব্রাঞ্চের প্রতিটি কাজের মান নিশ্চিত করাই আমার প্রধান লক্ষ্য।');
  const [congratulationsMsg, setCongratulationsMsg] = useState('অভিনন্দন! আপনি একজন অত্যন্ত দক্ষ এবং মহান মানুষ হিসেবে আমাদের মেইন ব্রাঞ্চ ও সমস্ত ব্রাঞ্চ নেটওয়ার্কের গৌরব বৃদ্ধি করেছেন।');

  // Helper for counting a customer's activity count (invoices + appointments)
  const getCustomerActivityCount = (cust: any) => {
    if (!cust) return 0;
    const customerInvoices = invoices.filter(inv => 
      inv.customerId === cust.customId || 
      inv.customerId === cust.id || 
      (cust.customId && inv.customerId?.includes(cust.customId)) ||
      inv.customerMobile === cust.mobile
    );
    const customerApps = appointments.filter(app => 
      app.customerMobile === cust.mobile || 
      app.customerId === cust.id
    );
    return customerInvoices.length + customerApps.length;
  };

  // Helper for custom initials avatar based on customer name
  const getAvatarForCustomer = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = [
      'bg-sky-500/10 text-sky-400 border-sky-500/20',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    return (
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0 ${color}`}>
        {initials || '??'}
      </div>
    );
  };

  // Export Customer History to CSV
  const handleExportCsv = (customer: any, invoicesList: any[]) => {
    if (!invoicesList || invoicesList.length === 0) return;

    // Header row
    const headers = [
      'Invoice Number',
      'Date',
      'Customer Name',
      'Customer ID',
      'Customer Mobile',
      'Services Rendered',
      'Payment Method',
      'Subtotal Amount',
      'Discount Amount',
      'Total Paid/Payable',
      'Payment Status'
    ];

    // Data rows
    const rows = invoicesList.map(inv => {
      const date = inv.createdAt ? inv.createdAt.substring(0, 10) : 'N/A';
      const serviceNames = inv.items ? inv.items.map((item: any) => item.name).join('; ') : 'N/A';
      
      return [
        inv.invoiceNumber || 'N/A',
        date,
        inv.customerName || customer.name || 'N/A',
        inv.customerId || customer.customId || 'N/A',
        inv.customerMobile || customer.mobile || 'N/A',
        `"${serviceNames.replace(/"/g, '""')}"`, // escape quotes
        inv.paymentMethod || 'N/A',
        inv.subtotal || 0,
        inv.discountAmount || 0,
        inv.totalAmount || 0,
        inv.paymentStatus || 'N/A'
      ];
    });

    // Combine headers & rows
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Create & trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RODP_Customer_Ledger_${customer.customId || 'Export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate unique 3-Digit numeric ID (range 100-999)
  const generateUnique3DigitID = (): string => {
    let id = '';
    let exists = true;
    let limit = 0;
    while (exists && limit < 1000) {
      id = Math.floor(100 + Math.random() * 900).toString();
      exists = shops.some(s => s.customId === id);
      limit++;
    }
    return id || '101';
  };

  // Pre-fill generated 3-digit ID when adding panel opens
  useEffect(() => {
    if (isAdding) {
      setCustomId(generateUnique3DigitID());
    }
  }, [isAdding]);

  // Handle clearance password check
  const handleClearanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClearanceError(null);
    const cPass = clearancePassword.trim();
    if (cPass === 'RTX@ROD007' || cPass === 'Rizwan@REXLIFY007' || cPass === 'RTX@0012352' || cPass === 'RODP@RRR123') {
      setIsCleared(true);
    } else {
      setClearanceError('❌ INVALID ACCESS TOKEN: CEO Clearance Refused.');
    }
  };

  // Handle customer search (5-digit unique ID or contact mobile lookup)
  const handleCustomerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerLookupError(null);
    setSearchedCustomer(null);

    const query = customerSearchId.trim().toLowerCase();
    if (!query) return;

    const found = customers.find(c => {
      const cid = c.customId ? String(c.customId).toLowerCase() : '';
      const name = c.name ? String(c.name).toLowerCase() : '';
      const username = c.username ? String(c.username).toLowerCase() : '';
      const rodpAddress = c.rodpAddress ? String(c.rodpAddress).toLowerCase() : '';
      const rodpUserId = c.rodpUserId ? String(c.rodpUserId).toLowerCase() : '';
      const email = c.email ? String(c.email).toLowerCase() : '';
      const refId = c.referenceId ? String(c.referenceId).toLowerCase() : '';
      const address = c.address ? String(c.address).toLowerCase() : '';
      const mob = c.mobile ? String(c.mobile).replace(/\D/g, '') : '';
      const cleanDigits = query.replace(/\D/g, '');

      return cid === query || 
             cid.includes(query) || 
             name.includes(query) ||
             username.includes(query) ||
             rodpAddress.includes(query) ||
             rodpUserId.includes(query) ||
             email.includes(query) ||
             refId.includes(query) ||
             address.includes(query) ||
             (mob && cleanDigits && mob.includes(cleanDigits)) ||
             (cid.replace(/[^0-9]/g, '') === cleanDigits && cleanDigits.length >= 4);
    });

    if (found) {
      setSearchedCustomer(found);
    } else {
      setCustomerLookupError(`❌ No user found matching Name, Username, RODP ID, Address, or Reference "${query}". Please check and try again.`);
    }
  };

  // Handle branch/staff creation
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim()) return;

    const customBranchId = customId.trim() || generateUnique3DigitID();

    const newShop: Shop = {
      id: `shop_${Date.now()}`,
      name: shopName.trim(),
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim() || `${Date.now()}@rodp.com`,
      mobile: mobile.trim() || '9593388785',
      address: address.trim() || 'Jalangi, Murshidabad, West Bengal',
      gstNumber: '',
      status: 'approved',
      subscriptionType: 'premium_yearly',
      createdAt: new Date().toISOString().substring(0, 10),
      customId: customBranchId,
      password: password.trim() || 'pass',
      permissions: permissions,
      branchHead: ownerName.trim(),
      roleType: roleType,
      isMainBranch: roleType === 'branch' ? isMainBranch : false,
      managerPhoto: roleType === 'branch' ? managerPhoto : undefined,
      managerBio: roleType === 'branch' ? managerBio : undefined,
      congratulationsMsg: roleType === 'branch' ? congratulationsMsg : undefined,
      managerId: roleType === 'branch' ? `MGR-${customBranchId}` : undefined
    };

    if (roleType === 'branch' && isMainBranch) {
      // Deactivate other main branches to ensure exactly one Main Branch exists
      shops.forEach(s => {
        if (s.isMainBranch && s.id !== newShop.id) {
          updateShop(s.id, { isMainBranch: false });
        }
      });
    }

    addShop(newShop);

    // Automatically assign a task to the newly created branch manager to upload the physical branch photo
    if (roleType === 'branch' && addTask) {
      addTask({
        id: `task_${Date.now()}`,
        title: 'ব্রাঞ্চ এর ফটো তুলে আপলোড করুন',
        description: 'দয়া করে আপনার ব্রাঞ্চের একটি বাস্তব বা পরিষ্কার ছবি তুলে প্রোফাইলে আপলোড করুন। এটি এআই গাইডেন্স এবং সেন্ট্রাল ট্র্যাকিংয়ের জন্য অত্যন্ত জরুরি। (Please upload branch photo)',
        priority: 'high',
        frequency: 'daily',
        dueDate: new Date(Date.now() + 864500000 * 3).toISOString().substring(0, 10), // 3 days
        assignedTo: 'all',
        status: 'Pending',
        shopId: newShop.id,
        createdAt: new Date().toISOString()
      });
    }

    setIsAdding(false);

    // Reset Form
    setShopName('');
    setOwnerName('');
    setOwnerEmail('');
    setMobile('');
    setAddress('');
    setPassword('pass');
    setIsMainBranch(false);
    setManagerPhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
    setManagerBio('একটি প্রফেশনাল এবং কর্মঠ মানসিকতার সাথে মেইন ব্রাঞ্চের প্রতিটি কাজের মান নিশ্চিত করাই আমার প্রধান লক্ষ্য।');
    setCongratulationsMsg('অভিনন্দন! আপনি একজন অত্যন্ত দক্ষ এবং মহান মানুষ হিসেবে আমাদের মেইন ব্রাঞ্চ ও সমস্ত ব্রাঞ্চ নেটওয়ার্কের গৌরব বৃদ্ধি করেছেন।');
    setPermissions([
      'dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant'
    ]);
  };

  // Compute live branch-specific financial metrics
  const getBranchMetrics = (shopId: string) => {
    // Filter live invoices matching this shop/branch
    const branchInvoices = invoices.filter(inv => inv.shopId === shopId);
    const revenue = branchInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    
    // Filter live appointments matching this shop/branch
    const branchAppointmentsCount = appointments.filter(app => app.shopId === shopId).length;

    // Filter live completed tasks matching this shop/branch
    const branchTasksCount = tasks.filter(t => t.shopId === shopId && t.status === 'completed').length;

    return {
      revenue,
      appointments: branchAppointmentsCount,
      tasks: branchTasksCount
    };
  };

  // Compute live cumulative totals across all branches
  const totalRevenueAllBranches = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalAppointmentsAllBranches = appointments.length;
  const totalTasksCompletedAllBranches = tasks.filter(t => t.status === 'completed').length;

  // Filter branches/staff in control center
  const filteredShops = shops.filter(s => s.status !== 'Deleted').filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.customId && s.customId.includes(searchQuery)) ||
    s.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (type?: 'branch' | 'office' | 'staff') => {
    switch (type) {
      case 'office': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'staff': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const getRoleLabel = (type?: 'branch' | 'office' | 'staff') => {
    switch (type) {
      case 'office': return 'Office Manager / অফিস';
      case 'staff': return 'Field Staff / স্টাফ';
      default: return 'Franchise Branch / ব্রাঞ্চ';
    }
  };

  const gridThemeClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/30' 
    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg';

  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  // Hardcoded security check: block super_admin_panel for any user not explicitly assigned the 'super_admin' role
  const isSuperAdminUser = (() => {
    const raw = localStorage.getItem('rodp_logged_in_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        return u.role === 'super_admin';
      } catch (e) {}
    }
    return false;
  })();

  if (!isSuperAdminUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#070709] border border-red-500/20 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden text-xs font-semibold">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-500" />
        
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
          <ShieldAlert size={28} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] tracking-widest uppercase font-extrabold font-mono">
            SECURITY BREACH BLOCKED
          </span>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">
            Unauthorized Path
          </h2>
          <p className="text-slate-400 text-[11px] leading-relaxed max-w-sm mx-auto font-medium">
            This module (super_admin_panel) is strictly restricted. Only users explicitly assigned the 'super_admin' role can access administrative views.
          </p>
        </div>
      </div>
    );
  }

  if (!isCleared) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#070709] border border-amber-500/20 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden text-xs font-semibold">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 animate-pulse" />
        
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto animate-pulse">
          <ShieldAlert size={28} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] tracking-widest uppercase font-extrabold font-mono">
            Restricted Central HQ
          </span>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">
            CEO Access Clearance
          </h2>
          <p className="text-slate-400 text-[11px] leading-relaxed max-w-sm mx-auto font-medium">
            Entering the CEO Administration Panel requires Master cryptographic key clearance. Please enter the CEO security password.
          </p>
        </div>

        {clearanceError && (
          <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
            {clearanceError}
          </p>
        )}

        <form onSubmit={handleClearanceSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">
              CEO SECURITY PASSWORD
            </label>
            <div className="relative">
              <input
                type={showClearancePass ? 'text' : 'password'}
                required
                value={clearancePassword}
                onChange={(e) => setClearancePassword(e.target.value)}
                placeholder="Enter CEO password..."
                className="w-full text-xs font-bold py-3.5 px-4 rounded-xl border border-slate-800 bg-[#030304] text-slate-200 focus:outline-none focus:border-rose-500/50 text-center tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowClearancePass(!showClearancePass)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer text-[10px] font-mono"
              >
                {showClearancePass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-xl font-black text-center text-[10px] tracking-wider uppercase hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
          >
            Authorize Central Access ➔
          </button>
        </form>

        <p className="text-[8px] text-slate-600 font-mono uppercase tracking-widest mt-2">
          SECURED UNDER SYSTEM CODE: CSC-CEO-V2026
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Top action header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-500/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck size={24} className="text-amber-500" />
            <span>CEO Central Administration HQ</span>
          </h2>
          <p className="text-xs opacity-60">Create branches/staff, assign precise permissions, view actual live revenues, and inspect security telemetry logs</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToVerifyBillsDocs && (
            <button
              onClick={onNavigateToVerifyBillsDocs}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer text-[11px] uppercase tracking-wider"
              title="Verify Bills & Documents / ভেরিফাই বিল ও ভেরিফাইড ডকুমেন্ট"
            >
              <ShieldCheck size={16} className="text-amber-300" />
              <span>Verify Bills & Documents / ভেরিফাই বিল</span>
            </button>
          )}

          {onNavigateToBranchVault && (
            <button
              onClick={onNavigateToBranchVault}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer text-[11px] uppercase tracking-wider"
              title="Show All Branches, Passwords & Credentials / সমস্ত ব্রাঞ্চ ও পাসওয়ার্ড দেখুন"
            >
              <KeyRound size={15} className="text-slate-950" />
              <span>Show All Branches & Passwords</span>
            </button>
          )}

          <button
            onClick={() => setShowServicePriceManager(true)}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-100 dark:text-slate-200 font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer text-[11px] uppercase tracking-wider font-extrabold"
          >
            <Settings size={15} className="text-amber-500 animate-spin-slow" />
            <span>Manage Service Prices</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer text-[11px] uppercase tracking-wider font-extrabold"
          >
            <Plus size={16} />
            <span>Onboard Branch / Staff</span>
          </button>
        </div>
      </div>

      {/* Global Real Statistics Cards - Demolishing all placeholder fake demo data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
            <Store size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[9px] uppercase font-bold">HQ Franchise Network</span>
            <span className={`text-base font-black ${textPrimaryClass}`}>{shops.length} Active Kiosks</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
            <IndianRupee size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[9px] uppercase font-bold">Live Total Revenue (Actual)</span>
            <span className="text-base font-black text-emerald-500">₹{totalRevenueAllBranches.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[9px] uppercase font-bold">Network Appointments</span>
            <span className={`text-base font-black ${textPrimaryClass}`}>{totalAppointmentsAllBranches} Booked</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0">
            <CheckSquare size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[9px] uppercase font-bold">Completed System Tasks</span>
            <span className={`text-base font-black ${textPrimaryClass}`}>{totalTasksCompletedAllBranches} Done</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Branch Locator Map (Murshidabad Geo Spread) */}
      <div className={`p-6 rounded-3xl border space-y-4 ${gridThemeClass} relative overflow-hidden`}>
        {/* Map Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-500/10 pb-4">
          <div>
            <h3 className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 ${textPrimaryClass}`}>
              <MapPin size={18} className="text-rose-500 animate-bounce" />
              <span>Interactive Branch Locator Map (Geographical Network Spread)</span>
              <span className="text-[9px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full border border-rose-500/20 font-mono font-bold uppercase">
                GPS LIVE GPS: MURSHIDABAD ZONE
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">CSS-based pins displaying real-time branch locations across Barabila, Sagarpara, Jalangi & Harekrishnapur</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 text-[10px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>LAT: 24.120°N | LON: 88.583°E</span>
          </div>
        </div>

        {/* Map Visual Canvas */}
        <div className="relative w-full h-[360px] rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center select-none">
          
          {/* Topographic Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />
          
          {/* Radar Sweep Circle Effects */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-indigo-500/10 animate-ping opacity-20 pointer-events-none" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-amber-500/10 pointer-events-none" />
          <div className="absolute w-[150px] h-[150px] rounded-full border border-emerald-500/10 pointer-events-none" />

          {/* District Boundary Vector Representation */}
          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" viewBox="0 0 800 400" fill="none">
            <path d="M 120 80 Q 250 40 400 90 T 680 120 T 750 300 T 520 380 T 220 340 T 120 80 Z" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <path d="M 220 180 Q 350 140 520 200 T 650 320" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" fill="none" />
            <text x="680" y="360" fill="#94a3b8" fontSize="12" fontFamily="monospace" fontWeight="bold">JALANGI SECTOR</text>
            <text x="140" y="120" fill="#94a3b8" fontSize="12" fontFamily="monospace" fontWeight="bold">SAGARPARA BLOCK</text>
          </svg>

          {/* Map Compass Rose */}
          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-[9px] font-mono text-slate-400 flex flex-col items-center pointer-events-none">
            <span className="text-amber-400 font-bold">N</span>
            <span className="text-[8px] opacity-60">W ┼ E</span>
            <span className="text-[8px] opacity-60">S</span>
          </div>

          {/* Map Scale Indicator */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[9px] font-mono text-slate-400 flex items-center gap-2 pointer-events-none">
            <div className="w-8 h-1 bg-amber-400 rounded-full" />
            <span>5 KM MAP SCALE</span>
          </div>

          {/* Render CSS Pins for all branches */}
          {shops.map((shop, index) => {
            const cid = (shop.customId || '').toUpperCase();
            
            // Map pin positions based on official branch credentials
            let pos = { left: '50%', top: '50%' };
            let pinColor = 'from-amber-500 to-rose-500';
            let pinBg = 'bg-amber-500';
            let pinRing = 'border-amber-400';
            let tagColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

            if (cid === 'ROD001' || cid === 'RRR' || shop.isMainBranch) {
              pos = { left: '42%', top: '32%' }; // Head Office Barabila
              pinColor = 'from-amber-400 via-amber-500 to-amber-600';
              pinBg = 'bg-amber-500';
              pinRing = 'border-amber-300';
              tagColor = 'bg-amber-500/30 text-amber-300 border-amber-500/50';
            } else if (cid === 'RCS102' || cid === 'JH104' || shop.name.includes('CSC CENTER') || shop.name.includes('CSC SENTER')) {
              pos = { left: '58%', top: '42%' }; // 2nd Branch - Barabila CSC
              pinColor = 'from-emerald-400 to-teal-600';
              pinBg = 'bg-emerald-500';
              pinRing = 'border-emerald-300';
              tagColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
            } else if (cid === 'MAM103' || cid === 'EB105' || shop.name.includes('MAM TELECOM') || shop.name.includes('MAM TELICOM')) {
              pos = { left: '26%', top: '64%' }; // 3rd Branch - Harekrishnapur
              pinColor = 'from-cyan-400 to-blue-600';
              pinBg = 'bg-cyan-500';
              pinRing = 'border-cyan-300';
              tagColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
            } else if (cid === 'FAR104' || cid === 'FARIDPUR106' || shop.name.includes('FARIDPUR')) {
              pos = { left: '78%', top: '50%' }; // 4th Branch - Faridpur Jalangi
              pinColor = 'from-purple-400 to-indigo-600';
              pinBg = 'bg-purple-500';
              pinRing = 'border-purple-300';
              tagColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
            } else {
              // Offset for any additional dynamically created branches
              const angle = (index * 75) % 360;
              const rad = (angle * Math.PI) / 180;
              const xPct = Math.min(85, Math.max(15, 50 + Math.cos(rad) * 32));
              const yPct = Math.min(80, Math.max(20, 50 + Math.sin(rad) * 25));
              pos = { left: `${xPct}%`, top: `${yPct}%` };
              pinColor = 'from-indigo-400 to-blue-600';
              pinBg = 'bg-indigo-500';
            }

            const isSelected = selectedMapBranchId === shop.id;

            return (
              <div
                key={shop.id}
                style={{ left: pos.left, top: pos.top }}
                onClick={() => setSelectedMapBranchId(shop.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 transition-all duration-300 hover:scale-125"
              >
                {/* Glowing Pulse Rings */}
                <div className={`absolute -inset-2 rounded-full ${pinBg} opacity-30 animate-ping`} />
                <div className={`absolute -inset-4 rounded-full ${pinBg} opacity-15 animate-pulse`} />

                {/* CSS Pin Shape */}
                <div className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr ${pinColor} p-0.5 shadow-xl border-2 ${pinRing} ${
                  isSelected ? 'scale-125 ring-4 ring-amber-400/50 z-30' : ''
                }`}>
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white">
                    {cid === 'RRR' ? (
                      <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
                    ) : (
                      <Store size={14} className="text-white" />
                    )}
                  </div>

                  {/* Pin Pointer Tail */}
                  <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${pinBg}`} />
                </div>

                {/* Pin Label Tag */}
                <div className={`absolute left-1/2 -translate-x-1/2 top-10 whitespace-nowrap px-2 py-0.5 rounded-lg border font-mono font-black text-[9px] shadow-lg backdrop-blur-md transition-all ${tagColor} ${
                  isSelected ? 'scale-110 opacity-100 ring-2 ring-amber-400' : 'opacity-80 group-hover:opacity-100'
                }`}>
                  {cid || shop.name.substring(0, 10)}
                </div>
              </div>
            );
          })}

          {/* Floating Selected Branch Popover Card */}
          {selectedMapBranchId && (() => {
            const activeShop = shops.find(s => s.id === selectedMapBranchId) || shops[0];
            if (!activeShop) return null;
            const metrics = getBranchMetrics(activeShop.id);
            const cid = (activeShop.customId || '').toUpperCase();

            return (
              <div className="absolute bottom-4 right-4 z-40 w-72 bg-slate-950/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 shadow-2xl text-white space-y-2 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                      {cid || 'BR'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-amber-300 leading-tight truncate max-w-[150px]">{activeShop.name}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">Manager: {activeShop.ownerName}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMapBranchId(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X size={14} />
                  </button>
                </div>

                <p className="text-[9px] text-slate-300 line-clamp-1 flex items-center gap-1 font-medium">
                  <MapPin size={10} className="text-rose-400 shrink-0" />
                  <span>{activeShop.address}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-[10px]">
                  <div>
                    <span className="opacity-50 block text-[8px] uppercase">Live Branch Revenue</span>
                    <span className="font-black text-emerald-400">₹{metrics.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="opacity-50 block text-[8px] uppercase">Appointments</span>
                    <span className="font-bold text-amber-300">{metrics.appointments} Booked</span>
                  </div>
                </div>

                {/* Direct CEO Access & Control Button */}
                <button
                  onClick={() => onCeoViewBranch(activeShop.id, activeShop.permissions, activeShop.name)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-400 hover:to-indigo-600 text-white font-black text-[10px] rounded-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Eye size={12} />
                  <span>Access & Control Branch Dashboard</span>
                </button>
              </div>
            );
          })()}
        </div>

        {/* Branch Selector Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 overflow-x-auto custom-scrollbar">
          <span className="text-[9px] uppercase font-mono font-bold opacity-60 text-slate-400 mr-1">Filter Map View:</span>
          {shops.map(s => {
            const isSelected = selectedMapBranchId === s.id;
            const cid = (s.customId || '').toUpperCase();
            return (
              <button
                key={s.id}
                onClick={() => setSelectedMapBranchId(s.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                    : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <Store size={12} />
                <span>{s.name} ({cid || 'BR'})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Branch / Staff / Office Manager Control Room list */}
        <div className={`p-5 rounded-3xl border lg:col-span-2 space-y-4 ${gridThemeClass}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className={`font-black text-sm uppercase tracking-wider ${textPrimaryClass} flex items-center gap-2`}>
                <span>Branches & Staff Registry ({shops.length} Active)</span>
                {onNavigateToBranchVault && (
                  <button
                    onClick={onNavigateToBranchVault}
                    className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-[9px] font-black uppercase tracking-wider hover:bg-amber-500/25 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <KeyRound size={10} />
                    <span>View Passwords & Vault</span>
                  </button>
                )}
              </h3>
              <p className="text-[10px] text-slate-400">Click any card to open detailed metrics and View live dashboard</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-1.5 pl-7 pr-3 rounded-lg border focus:outline-none text-[10px] ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {copiedPassNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>{copiedPassNotice}</span>
              </span>
              <button onClick={() => setCopiedPassNotice(null)} className="text-xs text-emerald-400/80 hover:text-emerald-200 cursor-pointer">✕</button>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredShops.length === 0 ? (
              <div className="py-16 text-center text-slate-500 font-mono text-[11px]">
                <Store size={36} className="mx-auto opacity-30 mb-2 animate-bounce" />
                <span>No matching branches or staff found in central registry.</span>
              </div>
            ) : (
              filteredShops.map(shop => {
                const metrics = getBranchMetrics(shop.id);
                return (
                  <div 
                    key={shop.id}
                    onClick={() => setSelectedShopForDossier(shop)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      shop.status?.toLowerCase() === 'suspended' 
                        ? 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30' 
                        : shop.status?.toLowerCase() === 'hold'
                          ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30'
                          : 'bg-slate-500/5 border-slate-500/5 hover:bg-slate-500/10 hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border font-mono ${getRoleBadgeColor(shop.roleType)}`}>
                          {shop.roleType || 'branch'}
                        </span>
                        <h4 className={`font-black text-xs ${textPrimaryClass}`}>{shop.name}</h4>
                        <span className="px-1.5 py-0.5 bg-slate-950 border border-white/5 rounded text-amber-400 font-mono text-[9px] font-extrabold flex items-center gap-1">
                          <KeyRound size={10} className="text-amber-500" />
                          <span>ID: {shop.customId || shop.id}</span>
                        </span>
                        
                        {/* Branch Login Password Badge & Copy Toggle */}
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/80 border border-indigo-500/30 rounded-lg text-[9px] font-mono text-cyan-300"
                        >
                          <span className="text-[8px] text-slate-400 uppercase">PASS:</span>
                          <span className="font-bold tracking-wider">
                            {visiblePassMap[shop.id] ? (shop.password || 'N/A') : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setVisiblePassMap(prev => ({ ...prev, [shop.id]: !prev[shop.id] }))}
                            className="p-0.5 hover:text-white text-slate-400 transition-colors cursor-pointer ml-1"
                            title={visiblePassMap[shop.id] ? "Hide Password" : "Show Password"}
                          >
                            <Eye size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const textToCopy = `Branch ID: ${shop.customId || shop.id}\nPassword: ${shop.password || ''}`;
                              try {
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  navigator.clipboard.writeText(textToCopy)
                                    .then(() => {
                                      setCopiedPassNotice(`Copied credentials for ${shop.name}!`);
                                      setTimeout(() => setCopiedPassNotice(null), 2500);
                                    })
                                    .catch(() => {
                                      // Fallback copy
                                      const el = document.createElement('textarea');
                                      el.value = textToCopy;
                                      el.style.position = 'absolute';
                                      el.style.left = '-9999px';
                                      document.body.appendChild(el);
                                      el.select();
                                      document.execCommand('copy');
                                      document.body.removeChild(el);
                                      setCopiedPassNotice(`Copied credentials for ${shop.name}!`);
                                      setTimeout(() => setCopiedPassNotice(null), 2500);
                                    });
                                } else {
                                  const el = document.createElement('textarea');
                                  el.value = textToCopy;
                                  el.style.position = 'absolute';
                                  el.style.left = '-9999px';
                                  document.body.appendChild(el);
                                  el.select();
                                  document.execCommand('copy');
                                  document.body.removeChild(el);
                                  setCopiedPassNotice(`Copied credentials for ${shop.name}!`);
                                  setTimeout(() => setCopiedPassNotice(null), 2500);
                                }
                              } catch (e) {
                                console.warn('Clipboard write failed, using fallback', e);
                                try {
                                  const el = document.createElement('textarea');
                                  el.value = textToCopy;
                                  el.style.position = 'absolute';
                                  el.style.left = '-9999px';
                                  document.body.appendChild(el);
                                  el.select();
                                  document.execCommand('copy');
                                  document.body.removeChild(el);
                                  setCopiedPassNotice(`Copied credentials for ${shop.name}!`);
                                  setTimeout(() => setCopiedPassNotice(null), 2500);
                                } catch (err) {
                                  alert(`Credentials:\n${textToCopy}`);
                                }
                              }
                            }}
                            className="px-1.5 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 text-indigo-300 rounded text-[8px] font-sans font-bold cursor-pointer transition-all"
                            title="Copy ID & Password"
                          >
                            Copy
                          </button>
                        </div>

                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border ${
                          shop.status?.toLowerCase() === 'suspended'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                            : shop.status?.toLowerCase() === 'hold'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {shop.status?.toLowerCase() === 'approved' || !shop.status ? 'Active' : shop.status}
                        </span>
                      </div>
                      <p className="text-[10px] opacity-70 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1"><Users size={11} /> Head: {shop.branchHead || shop.ownerName}</span>
                        <span className="flex items-center gap-1"><Phone size={11} /> Mobile: {shop.mobile || '9593388785'}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {shop.address}</span>
                      </p>
                      
                      {/* Active Permissions Scopes Checklist Preview */}
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {shop.permissions && shop.permissions.slice(0, 5).map(perm => (
                          <span key={perm} className="px-1.5 py-0.5 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-[8px] rounded uppercase font-mono">
                            {perm}
                          </span>
                        ))}
                        {shop.permissions && shop.permissions.length > 5 && (
                          <span className="text-[8px] text-slate-500 font-mono">+{shop.permissions.length - 5} more</span>
                        )}
                      </div>
                    </div>

                    {/* Live Statistics Metrics (Absolutely realistic, zero fake placeholders) */}
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-500/10 pt-3 md:pt-0">
                      <div className="text-right hidden sm:block">
                        <span className="opacity-50 block text-[8px] uppercase font-bold">Actual Sales</span>
                        <span className="text-xs font-mono font-black text-emerald-500">₹{metrics.revenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="opacity-50 block text-[8px] uppercase font-bold">Appts</span>
                        <span className={`text-xs font-mono font-black ${textPrimaryClass}`}>{metrics.appointments}</span>
                      </div>
                      
                      {/* Live Branch Dashboard Direct Access Buttons */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        {/* Quick action status triggers (Requirement: Suspend, Hold, Reset, Warning) */}
                        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 shrink-0 flex-wrap">
                          {shop.id === 'shop_1' ? (
                            <span className="px-2.5 py-1 text-[#dfac5d] flex items-center gap-1 text-[8px] font-black uppercase tracking-widest font-mono">
                              <Lock size={10} className="text-amber-500 shrink-0" />
                              <span>MAIN HQ LOCKED</span>
                            </span>
                          ) : (
                            <>
                              {/* 1. SUSPEND BUTTON */}
                              {shop.status === 'suspended' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateShop(shop.id, { status: 'approved' });
                                    setActionSuccessToast(`ব্রাঞ্চ "${shop.name}" সফলভাবে সক্রিয় (Active) করা হয়েছে!`);
                                    setTimeout(() => setActionSuccessToast(null), 3500);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 transition-all text-[8.5px] font-black uppercase cursor-pointer flex items-center gap-1 active:scale-95"
                                  title="ব্রাঞ্চ পুনরায় সক্রিয় করুন (Activate Branch)"
                                >
                                  <Play size={10} />
                                  <span>Active / আন-সাসপেন্ড</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateShop(shop.id, { status: 'suspended' });
                                    setActionSuccessToast(`ব্রাঞ্চ "${shop.name}" সাসপেন্ড করা হয়েছে! কোনো লগইন বা কাজ হবে না।`);
                                    setTimeout(() => setActionSuccessToast(null), 3500);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all text-[8.5px] font-black uppercase cursor-pointer flex items-center gap-1 active:scale-95"
                                  title="ব্রাঞ্চ সম্পূর্ণ সাসপেন্ড করুন (Suspend Branch)"
                                >
                                  <Ban size={10} />
                                  <span>সাসপেন্ড</span>
                                </button>
                              )}

                              {/* 2. HOLD BUTTON */}
                              {shop.status === 'hold' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateShop(shop.id, { status: 'approved', holdUntil: undefined, holdReason: undefined });
                                    setActionSuccessToast(`ব্রাঞ্চ "${shop.name}"-এর হোল্ড প্রত্যাহার করা হয়েছে!`);
                                    setTimeout(() => setActionSuccessToast(null), 3500);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition-all text-[8.5px] font-black uppercase cursor-pointer flex items-center gap-1 active:scale-95"
                                  title="হোল্ড প্রত্যাহার করুন (Release Hold)"
                                >
                                  <Play size={10} />
                                  <span>হোল্ড রিলিজ</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHoldingShop(shop);
                                    setHoldReasonInput('সিইও নির্দেশিত সাময়িক সার্ভার রক্ষণাবেক্ষণ ও অডিট স্থগিতাদেশ');
                                    setHoldDurationOption('1h');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500 hover:text-slate-950 transition-all text-[8.5px] font-black uppercase cursor-pointer flex items-center gap-1 active:scale-95"
                                  title="নির্দিষ্ট সময়ের জন্য হোল্ড করুন (Set Hold Timer)"
                                >
                                  <Pause size={10} />
                                  <span>হোল্ড</span>
                                </button>
                              )}

                              {/* 3. RESET BUTTON */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setResettingShop(shop);
                                  setResetConfirmChecked(false);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all text-[8.5px] font-black uppercase cursor-pointer flex items-center gap-1 active:scale-95"
                                title="সম্পূর্ণ ডাটা মুছে ফ্যাক্টরি রিসেট করুন (Factory Reset)"
                              >
                                <RotateCcw size={10} />
                                <span>রিসেট</span>
                              </button>

                              {/* 4. WARNING BUTTON */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWarningShop(shop);
                                  setWarningMessageInput('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500 hover:text-slate-950 transition-all text-[8.5px] font-black uppercase cursor-pointer flex items-center gap-1 active:scale-95"
                                title="ব্রাঞ্চে অফিসিয়াল সতর্কবার্তা পাঠান (Send Warning)"
                              >
                                <AlertTriangle size={10} />
                                <span>ওয়ার্নিং</span>
                              </button>

                              {/* Delete option */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you absolutely sure you want to delete branch: ${shop.name} (${shop.customId || shop.id})?`)) {
                                    updateShop(shop.id, { status: 'Deleted' });
                                    if (deleteShop) {
                                      deleteShop(shop.id);
                                    }
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all text-[8px] font-black uppercase cursor-pointer"
                                title="Delete Branch"
                              >
                                <Trash size={10} />
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShopForDossier(shop);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 transition-all text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Inspect Details"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>

                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCeoViewBranch) {
                                onCeoViewBranch(shop.id, shop.permissions || [], shop.name);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
                            title="Open Live Dashboard"
                          >
                            <TrendingUp size={12} />
                            <span>Dashboard ➔</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ROD WHATSAPP-STYLE GROUP CONTROLLER */}
        <div className={`p-5 rounded-3xl border lg:col-span-2 space-y-5 ${gridThemeClass}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-500/10 pb-3">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${textPrimaryClass} flex items-center gap-2`}>
                <Users size={16} className="text-purple-500" />
                <span>ROD WhatsApp-Style Group Control Center (গ্রুপ কন্ট্রোল রুম)</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">
                গ্রুপ মেম্বার এক্সেস, চ্যাট রেস্ট্রিকশন এবং অফিশিয়াল এডমিন তালিকা নিয়ন্ত্রণ করুন।
              </p>
            </div>

            {/* RESTRICTION SWITCH */}
            <div className="flex items-center gap-3 bg-[#030304]/60 px-3.5 py-2 rounded-2xl border border-slate-800">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Only Admins Can Post:</span>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateGroupSettings) {
                    onUpdateGroupSettings({
                      onlyAdminsCanPost: !groupSettings?.onlyAdminsCanPost
                    });
                  }
                }}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  groupSettings?.onlyAdminsCanPost ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    groupSettings?.onlyAdminsCanPost ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* ACTIVE ADMINS SECTION */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 font-mono">
              🛡️ Active Group Admins (অফিশিয়াল গ্রুপ এডমিন তালিকা)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* CEO Admin Card */}
              <div className="p-3 rounded-2xl bg-[#030304]/60 border border-amber-500/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs">
                  RR
                </div>
                <div className="text-left">
                  <p className={`font-black text-xs ${textPrimaryClass}`}>Rizwan Roushan</p>
                  <p className="text-[8px] font-bold text-amber-500 font-mono uppercase tracking-wide">FOUNDER & CEO (SUPER ADMIN)</p>
                  <p className="text-[9px] text-slate-400 font-semibold font-mono">Mobile: +91 97354 80008</p>
                </div>
              </div>

              {/* Branch Managers as Admins */}
              {shops.filter(s => s.roleType === 'branch').map(shop => (
                <div key={shop.id} className="p-3 rounded-2xl bg-[#030304]/60 border border-indigo-500/10 flex items-center gap-3">
                  <img 
                    src={shop.managerPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"} 
                    alt={shop.branchHead} 
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-indigo-500/20"
                  />
                  <div className="text-left">
                    <p className={`font-black text-xs ${textPrimaryClass}`}>{shop.branchHead || 'Manager Name'}</p>
                    <p className="text-[8px] font-bold text-indigo-400 font-mono uppercase tracking-wide">BRANCH ADMIN ({shop.name})</p>
                    <p className="text-[9px] text-slate-400 font-semibold font-mono">Mobile: {shop.mobile || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPACT CEO CONSOLE MESSAGE POSTER */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1">
              💬 Post Message as CEO (গ্রুপে অফিশিয়াল বার্তা পাঠান)
            </h4>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem('ceoMsg') as HTMLInputElement;
                if (!input || !input.value.trim()) return;
                
                const newMsg = {
                  id: `msg_ceo_${Date.now()}`,
                  senderId: 'ceo_rizwan',
                  senderName: 'Rizwan Roushan (CEO)',
                  senderRole: 'ceo',
                  message: input.value.trim(),
                  reactions: {},
                  createdAt: new Date().toISOString()
                };
                if (onAddGroupMessage) {
                  onAddGroupMessage(newMsg);
                }
                input.value = '';
                alert('বার্তাটি সফলভাবে ROD গ্রুপে পোস্ট করা হয়েছে!');
              }}
              className="flex gap-2"
            >
              <input 
                name="ceoMsg"
                type="text"
                placeholder="CEO হিসেবে গ্রুপে একটি বার্তা লিখুন..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#030304] border border-slate-800 text-xs font-bold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <button 
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md hover:scale-102 cursor-pointer flex items-center gap-1.5"
              >
                <span>SEND</span>
              </button>
            </form>
          </div>
        </div>

        {/* Global Telemetry Room */}
        <div className={`p-5 rounded-3xl border h-[580px] flex flex-col ${gridThemeClass}`}>
          <div className="flex items-center justify-between mb-4 border-b border-slate-500/10 pb-3">
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTelemetryTab('live_monitor')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTelemetryTab === 'live_monitor'
                    ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Users size={12} className={activeTelemetryTab === 'live_monitor' ? 'animate-pulse text-emerald-400' : ''} />
                <span>Live Monitor ({getOnlineUsers().length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTelemetryTab('live_sessions')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTelemetryTab === 'live_sessions'
                    ? 'bg-amber-500/25 text-amber-400 border border-amber-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Clock size={12} className={activeTelemetryTab === 'live_sessions' ? 'animate-pulse' : ''} />
                <span>Sessions ({sessionLogs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTelemetryTab('security_logs')}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTelemetryTab === 'security_logs'
                    ? 'bg-rose-500/25 text-rose-400 border border-rose-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <ShieldAlert size={12} className={activeTelemetryTab === 'security_logs' ? 'animate-pulse' : ''} />
                <span>Security ({securityLogs.length})</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {activeTelemetryTab === 'live_monitor' ? (
              getOnlineUsers().length === 0 ? (
                <div className="py-20 text-center text-slate-500 font-mono text-[10px] space-y-2">
                  <Power size={24} className="mx-auto opacity-20 text-emerald-500 animate-pulse" />
                  <p>No operators or citizens are currently online.</p>
                  <p className="text-[9px] opacity-60">Staff and citizens will appear here in real-time on login.</p>
                </div>
              ) : (
                getOnlineUsers().map(user => {
                  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(user.loginTime).getTime()) / 1000));
                  const hrs = Math.floor(elapsedSeconds / 3600);
                  const mins = Math.floor((elapsedSeconds % 3600) / 60);
                  const secs = elapsedSeconds % 60;
                  const durationStr = `${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`;

                  return (
                    <div 
                      key={`${user.name}_${user.role}`}
                      className={`p-4 rounded-2xl border space-y-3 transition-all hover:scale-[1.01] ${
                        theme === 'dark' 
                          ? 'bg-[#06070a]/90 border-slate-850 hover:border-emerald-500/30 shadow-lg' 
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-400/30 shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs uppercase font-mono text-emerald-400">
                              {user.name.substring(0, 2)}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950 animate-ping" />
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950" />
                          </div>
                          <div>
                            <p className={`font-black text-xs ${textPrimaryClass}`}>{user.name}</p>
                            <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase tracking-wider border font-mono ${
                              user.role === 'customer' 
                                ? 'bg-sky-500/15 text-sky-400 border-sky-500/20' 
                                : user.role === 'staff'
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                                  : 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <span className="text-[8px] text-emerald-500 font-mono font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          ACTIVE NOW
                        </span>
                      </div>

                      {/* Display Active Branch and Session Metrics */}
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-900/40 text-[10px] font-semibold text-slate-400">
                        <div className="space-y-0.5">
                          <p className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Current Branch</p>
                          <p className={`truncate font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            🏢 {user.branchName}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Logged In At</p>
                          <p className={`font-bold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                            ⏱️ {new Date(user.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Session Duration</p>
                          <p className="font-extrabold text-emerald-400 font-mono flex items-center gap-1 animate-pulse">
                            ⏳ {durationStr}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : activeTelemetryTab === 'live_sessions' ? (
              sessionLogs.length === 0 ? (
                <div className="py-20 text-center text-slate-500 font-mono text-[10px] space-y-2">
                  <Power size={24} className="mx-auto opacity-20 animate-pulse text-amber-500" />
                  <p>No active login/logout sessions detected yet.</p>
                  <p className="text-[9px] opacity-60">Sessions will record automatically in real-time.</p>
                </div>
              ) : (
                [...sessionLogs].reverse().map(log => {
                  const isLogin = log.action === 'Login';
                  return (
                    <div 
                      key={log.id}
                      className={`p-3 rounded-xl border space-y-1.5 transition-all hover:scale-[1.01] ${
                        theme === 'dark' 
                          ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' 
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] opacity-50 font-mono">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border ${
                          isLogin 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLogin ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                          <span>{log.action}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="space-y-0.5">
                          <p className={`font-bold text-[11px] ${textPrimaryClass}`}>{log.userName}</p>
                          <p className="text-[9.5px] text-amber-500 font-medium">
                            🏢 {log.branchName || 'Central Network'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-500/5 pt-1.5 mt-1 text-[8.5px] opacity-60 font-mono">
                        <span>ROLE: {log.userRole?.toUpperCase() || 'OPERATOR'}</span>
                        <span>UID: {log.userId?.substring(0, 8).toUpperCase() || 'N/A'}</span>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              securityLogs.length === 0 ? (
                <div className="py-20 text-center text-slate-500 font-mono text-[10px]">
                  <p>No security breach alerts or terminal audits recorded.</p>
                </div>
              ) : (
                securityLogs.map(log => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between text-[9px] opacity-50">
                      <span>IP: {log.ipAddress}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className={`font-bold text-[11px] ${textPrimaryClass}`}>{log.userName}</p>
                    <p className="opacity-70 leading-relaxed text-[10px] text-indigo-400">
                      Action: {log.action}
                    </p>
                    <div className="flex justify-between items-center border-t border-slate-500/5 pt-1 mt-1 text-[9px] opacity-45 font-mono">
                      <span>Role: {log.userRole.toUpperCase()}</span>
                      <span className="text-emerald-500 font-bold">AES-Verified</span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* CEO LIVE APPOINTMENTS QUEUE & OPERATIONAL WORKFLOW HUB */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-6 rounded-3xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/40 backdrop-blur-md border border-indigo-500/20 text-slate-200 shadow-xl'
          : 'bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 shadow-lg'
      } space-y-6`}>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-500/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Calendar size={16} />
              <span>CEO Live Appointments Queue & Operational Workflow Hub (অ্যাপয়েন্টমেন্ট এবং বিলিং ওয়ার্কফ্লো হাব)</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Verify, approve, or mark bookings as completed. Clicking <strong>Complete (কমপ্লিট)</strong> instantly updates Firestore status and redirects to the preloaded Smart Billing screen under their profile.
            </p>
          </div>

          {/* Filter button group */}
          <div className="flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60 self-start">
            {[
              { key: 'Pending', label: 'Pending Approval / পেন্ডিং' },
              { key: 'Approved', label: 'Approved & Active / চলতি কাজ' },
              { key: 'Completed', label: 'Completed / সম্পন্ন' },
              { key: 'All', label: 'All Roster / সব' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCeoApptFilter(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  ceoApptFilter === tab.key
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(() => {
            const filtered = appointments.filter(appt => {
              if (ceoApptFilter === 'All') return true;
              return appt.status === ceoApptFilter;
            });

            if (filtered.length === 0) {
              return (
                <div className="col-span-full py-12 text-center text-slate-500 font-mono text-[11px] space-y-2">
                  <Calendar size={32} className="mx-auto opacity-20 animate-pulse" />
                  <p>No appointments match the selected filter category.</p>
                  <p className="text-[9px] text-slate-500/60 uppercase tracking-widest"> Roster Empty </p>
                </div>
              );
            }

            return filtered.map((appt: any) => {
              const shopObj = shops.find(s => s.id === appt.shopId);
              const shopLabel = shopObj ? shopObj.name : `Branch #${appt.shopId?.replace('shop_', '')}`;
              
              return (
                <div
                  key={appt.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-[#060608] border-slate-850 hover:border-amber-500/30 shadow-lg' 
                      : 'bg-slate-50 border-slate-200 hover:border-amber-400/50 shadow-md'
                  }`}
                >
                  {/* Card Header: Token & Status */}
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-black uppercase">
                      Token: {appt.tokenNumber || 'T-XX'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border ${
                      appt.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      appt.status === 'Approved' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse' :
                      appt.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {appt.status}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-1.5 text-[11px]">
                    <h4 className={`font-black text-xs ${textPrimaryClass} flex items-center gap-1.5`}>
                      <User size={13} className="text-amber-500" />
                      <span>{appt.name || appt.customerName || 'Customer'}</span>
                    </h4>
                    <p className="opacity-70 flex items-center gap-1.5 font-semibold">
                      <Phone size={11} />
                      <span>{appt.mobileNumber || appt.customerMobile || appt.mobile || 'N/A'}</span>
                    </p>
                    {appt.address && (
                      <p className="opacity-60 flex items-center gap-1.5 truncate text-[10px]">
                        <MapPin size={11} />
                        <span>{appt.address}</span>
                      </p>
                    )}
                    <div className="pt-2 border-t border-slate-500/5 flex items-center justify-between text-[10.5px]">
                      <span className="opacity-50">Branch:</span>
                      <span className="font-bold text-amber-500 truncate max-w-[120px]" title={shopLabel}>{shopLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="opacity-50">Service Desired:</span>
                      <span className={`font-black text-xs ${textPrimaryClass}`}>{appt.serviceType}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px]">
                      <span className="opacity-50">Reserved Slot:</span>
                      <span className="font-mono font-bold text-slate-300">{appt.date} • {appt.timeSlot}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-500/5 flex items-center gap-2 justify-end">
                    {appt.status === 'Pending' && (
                      <div className="flex flex-wrap items-center gap-2 w-full justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (updateAppointment) {
                              updateAppointment(appt.id, { status: 'Approved' });
                            }
                            setCeoApptFilter('Approved');
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider cursor-pointer font-extrabold"
                        >
                          Approve (এপ্রুভ)
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (updateAppointment) {
                              updateAppointment(appt.id, { status: 'Completed' });
                            }
                            if (goToBillingWithCustomer) {
                              goToBillingWithCustomer(appt.mobileNumber || appt.mobile, appt.serviceType);
                            }
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-95 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider cursor-pointer font-extrabold shadow-sm"
                        >
                          Approve & Bill (এপ্রুভ ও বিলিং করুন) ➔
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (updateAppointment) {
                              updateAppointment(appt.id, { status: 'Rejected' });
                            }
                          }}
                          className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] uppercase font-bold cursor-pointer transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {appt.status === 'Approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          // Step 1: Mark appointment completed
                          if (updateAppointment) {
                            updateAppointment(appt.id, { status: 'Completed' });
                          }
                          // Step 2: Redirect directly to Billing and pre-fill customer
                          if (goToBillingWithCustomer) {
                            goToBillingWithCustomer(appt.mobileNumber || appt.mobile, appt.serviceType);
                          }
                        }}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer font-extrabold"
                      >
                        <Receipt size={12} className="stroke-[3]" />
                        <span>Complete & Start Bill (বিলিং করুন) ➔</span>
                      </button>
                    )}

                    {appt.status === 'Completed' && (
                      <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase text-center rounded-xl flex items-center justify-center gap-1">
                        <Check size={12} className="stroke-[3]" />
                        <span>Work Completed & Billed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* SECTION 4: NOTICE BOARD & INQUIRIES CONTROL CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-500/10">
        
        {/* Notices Board Administration */}
        <div className={`p-6 rounded-3xl border space-y-4 ${gridThemeClass}`}>
          <div className="flex justify-between items-center border-b border-slate-500/10 pb-3">
            <div>
              <h3 className={`font-black text-sm uppercase tracking-wider ${textPrimaryClass} flex items-center gap-1.5`}>
                <span>📢 Active Notices Manager</span>
              </h3>
              <p className="text-[10px] text-slate-400">Add, edit, or delete notices broadcasted on the login screen</p>
            </div>
          </div>

          {/* Form to add a new notice */}
          <form onSubmit={(e) => {
            e.preventDefault();
            const target = e.target as any;
            const title = target.noticeTitle.value.trim();
            const body = target.noticeBody.value.trim();
            const status = target.noticeStatus.value as 'active' | 'inactive';
            if (!title || !body) return;

            const newNotice: Notice = {
              id: `not_${Date.now()}`,
              title,
              body,
              status,
              createdAt: new Date().toISOString()
            };

            if (addNotice) {
              addNotice(newNotice);
            }
            target.reset();
          }} className="space-y-3 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-left">
            <h4 className="text-[10px] font-black uppercase text-amber-500 font-mono tracking-wider">Publish New Notice / নতুন নোটিশ তৈরি</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  name="noticeTitle"
                  required
                  placeholder="Notice Title (e.g. ভোটার কার্ড সংশোধন ক্যাম্প)"
                  className="md:col-span-2 text-xs font-semibold py-2 px-3 bg-[#030304] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 text-white"
                />
                <select
                  name="noticeStatus"
                  defaultValue="active"
                  className="md:col-span-1 text-xs font-bold py-2 px-3 bg-[#030304] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none text-slate-300"
                >
                  <option value="active">🟢 Active / সক্রিয়</option>
                  <option value="inactive">🔴 Inactive / নিষ্ক্রিয়</option>
                </select>
              </div>
              <textarea 
                name="noticeBody"
                required
                rows={3}
                placeholder="Notice description with key terms to highlight (e.g. ভোটার কার্ড ও **আধার কার্ড** লিঙ্ক করুন মাত্র **৩ দিনে**)"
                className="w-full text-xs font-semibold py-2 px-3 bg-[#030304] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 text-white resize-none"
              />
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
                >
                  Publish Broadcast
                </button>
              </div>
            </div>
          </form>

          {/* List of existing notices */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar text-left">
            {notices.length === 0 ? (
              <p className="text-center py-6 text-slate-500 font-mono text-[10px]">No active notices found in database.</p>
            ) : (
              notices.map(notice => (
                <div key={notice.id} className="p-3.5 rounded-2xl bg-slate-950/30 border border-slate-900 flex items-start justify-between gap-3 hover:border-slate-850 transition-colors text-left">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-xs text-white">{notice.title}</h5>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono border ${
                        notice.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {notice.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed">{notice.body}</p>
                    <div className="flex items-center gap-3 text-[8px] text-slate-600 font-mono font-bold">
                      <span>Published: {new Date(notice.createdAt).toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (updateNotice) {
                            const newStatus = notice.status === 'active' ? 'inactive' : 'active';
                            updateNotice(notice.id, { status: newStatus });
                          }
                        }}
                        className="text-amber-500 hover:underline cursor-pointer uppercase"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('আপনি কি নিশ্চিত যে এই নোটিশটি চিরতরে মুছে ফেলতে চান?')) {
                        if (deleteNotice) {
                          deleteNotice(notice.id);
                        }
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                    title="Delete Notice"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Inquiries Feed */}
        <div className={`p-6 rounded-3xl border space-y-4 ${gridThemeClass}`}>
          <div className="flex justify-between items-center border-b border-slate-500/10 pb-3">
            <div>
              <h3 className={`font-black text-sm uppercase tracking-wider ${textPrimaryClass} flex items-center gap-1.5`}>
                <span>📩 Citizens Inquiries Feed</span>
              </h3>
              <p className="text-[10px] text-slate-400">Real-time incoming submissions from notice board forms</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar text-left">
            {inquiries.length === 0 ? (
              <div className="py-20 text-center text-slate-500 font-mono text-[10px] space-y-2">
                <FileText size={24} className="mx-auto opacity-20 text-indigo-500" />
                <p>No customer inquiries received yet.</p>
                <p className="text-[9px] opacity-60">Submitted inquiries will stream here instantly.</p>
              </div>
            ) : (
              [...inquiries].reverse().map(inq => {
                const draftReply = replyTexts[inq.id] || '';
                return (
                  <div key={inq.id} className="p-4 rounded-2xl bg-slate-950/35 border border-slate-900 hover:border-indigo-500/20 transition-all space-y-2.5 relative text-left">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                          <h5 className="font-bold text-xs text-white">{inq.name}</h5>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/20 text-indigo-400 font-mono text-[8px] font-black uppercase tracking-wider">
                            {inq.id}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-mono font-bold flex flex-wrap gap-x-3 gap-y-0.5">
                          <span className="flex items-center gap-1 text-indigo-400"><Phone size={10} /> {inq.mobile}</span>
                          <span className="flex items-center gap-1 text-slate-500"><MapPin size={10} /> {inq.address}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => deleteInquiry && deleteInquiry(inq.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                        title="Clear / Resolve Inquiry"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    
                    <div className="p-2.5 rounded-xl bg-[#050507] border border-slate-900 text-[10px] text-slate-300 leading-relaxed font-semibold">
                      {inq.message}
                    </div>

                    {/* REPLY STATUS / FORM */}
                    {inq.reply ? (
                      <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[10px] text-emerald-300 space-y-1">
                        <p className="font-black uppercase tracking-wider text-[8px] text-emerald-400 font-mono flex items-center gap-1">
                          <span>✓ CEO Response Posted</span>
                        </p>
                        <p className="leading-relaxed font-semibold whitespace-pre-wrap">{inq.reply}</p>
                        <p className="text-[7.5px] text-emerald-500 font-mono text-right font-bold">
                          Replied: {new Date(inq.replyAt || '').toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="pt-1.5 space-y-2">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="উত্তর লিখুন (Type CEO reply)..."
                            value={draftReply}
                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [inq.id]: e.target.value }))}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-[#030304] border border-slate-900 text-[10px] font-bold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!draftReply.trim()) return;
                              if (updateInquiry) {
                                updateInquiry(inq.id, {
                                  reply: draftReply.trim(),
                                  replyAt: new Date().toISOString()
                                });
                                setReplyTexts(prev => {
                                  const next = { ...prev };
                                  delete next[inq.id];
                                  return next;
                                });
                                alert('উত্তরটি সফলভাবে সংরক্ষণ করা হয়েছে!');
                              }
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-[8px] text-slate-600 font-mono font-bold text-right pt-1">
                      Received: {new Date(inq.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* CEO CUSTOMER AUDIT & BILLING ANALYSIS PORTAL */}
      <div className={`p-6 rounded-3xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/40 backdrop-blur-md border border-indigo-500/20 text-slate-200 shadow-xl'
          : 'bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 shadow-lg'
      } space-y-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-500/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Users size={16} />
              <span>Find Users & Master Citizen Database (ইউজার অনুসন্ধান)</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">Search any user across the entire network by Name, Username (@username), RODP User ID, User Address (user@rodp.com), Reference ID, or Mobile.</p>
          </div>
          
          <form onSubmit={handleCustomerSearch} className="flex gap-2 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-slate-400 z-10" />
              <input
                type="text"
                placeholder="Search Name, @username, RODP ID, Ref ID..."
                value={customerSearchId}
                onChange={(e) => setCustomerSearchId(e.target.value)}
                className={`py-2 pl-9 pr-4 rounded-xl border focus:outline-none text-[11px] font-bold w-full md:w-80 font-mono tracking-wider ${
                  theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              />

              {/* Real-time filtering results */}
              {(() => {
                const query = customerSearchId.trim().toLowerCase();
                const matchedSuggestions = query ? customers.filter((c: any) => {
                  const cid = c.customId ? String(c.customId).toLowerCase() : '';
                  const name = c.name ? String(c.name).toLowerCase() : '';
                  const username = c.username ? String(c.username).toLowerCase() : '';
                  const rodpAddress = c.rodpAddress ? String(c.rodpAddress).toLowerCase() : '';
                  const refId = c.referenceId ? String(c.referenceId).toLowerCase() : '';
                  const mob = c.mobile ? String(c.mobile) : '';
                  return cid.includes(query) || name.includes(query) || username.includes(query) || rodpAddress.includes(query) || refId.includes(query) || mob.includes(query);
                }).slice(0, 6) : [];

                if (matchedSuggestions.length === 0) return null;

                return (
                  <div className={`absolute left-0 right-0 top-full mt-1.5 z-40 border rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-500/10 max-h-60 overflow-y-auto ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200 shadow-slate-950/80' : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/80'
                  }`}>
                    {matchedSuggestions.map((c: any) => {
                      const actCount = getCustomerActivityCount(c);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSearchedCustomer(c);
                            setCustomerSearchId(c.username || c.rodpAddress || c.customId || c.mobile || '');
                            setCustomerLookupError(null);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 transition-colors text-left hover:bg-slate-500/5 cursor-pointer`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getAvatarForCustomer(c.name)}
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold truncate leading-snug">{c.name} {c.username ? <span className="text-indigo-400 font-mono text-[9px]">(@{c.username})</span> : null}</p>
                              <p className="text-[9px] font-mono text-emerald-400 font-bold leading-none truncate">{c.rodpAddress || c.customId || c.mobile}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8.5px] font-bold font-mono">
                              {actCount} Active
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-extrabold text-[10px] uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>Find User</span>
            </button>
          </form>
        </div>

        {customerLookupError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10.5px] font-bold animate-pulse">
            {customerLookupError}
          </div>
        )}

        {!searchedCustomer ? (
          <div className="py-12 text-center text-slate-500 font-mono text-[11px] space-y-2">
            <Search size={40} className="mx-auto opacity-20 animate-pulse" />
            <p>Enter a customer's unique ID above to initialize a deep cryptographic billing ledger audit.</p>
            <p className="text-[9px] text-slate-500/60 uppercase tracking-widest">Awaiting Master Operator Query</p>
          </div>
        ) : (() => {
          const cust = searchedCustomer;
          
          // Compute live child metrics
          const customerInvoices = invoices.filter(inv => 
            inv.customerId === cust.customId || 
            inv.customerId === cust.id || 
            (cust.customId && inv.customerId?.includes(cust.customId)) ||
            inv.customerMobile === cust.mobile
          );

          const totalSpent = customerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
          
          const totalDues = customerInvoices
            .filter(inv => inv.paymentStatus === 'Unpaid' || inv.paymentStatus === 'Partial')
            .reduce((sum, inv) => {
              const remaining = Number(inv.remainingBalance) ?? (inv.paymentStatus === 'Unpaid' ? Number(inv.totalAmount) : 0);
              return sum + remaining;
            }, 0);

          const totalTransactions = customerInvoices.length;

          // Compute most used payment mode
          const paymentModes = customerInvoices.map(inv => inv.paymentMethod);
          const modeCounts = paymentModes.reduce((acc: any, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
          }, {});
          const preferredMode = Object.keys(modeCounts).length > 0 
            ? Object.keys(modeCounts).reduce((a, b) => modeCounts[a] > modeCounts[b] ? a : b) 
            : 'N/A';

          // Compute most frequent service category
          const categories: { [key: string]: number } = {};
          customerInvoices.forEach(inv => {
            inv.items.forEach((item: any) => {
              const nameLower = item.name.toLowerCase();
              let cat = 'Custom Services';
              if (nameLower.includes('aadhaar') || nameLower.includes('আধার')) cat = 'Aadhaar Card (আধার)';
              else if (nameLower.includes('voter') || nameLower.includes('ভোটার')) cat = 'Voter ID (ভোটার)';
              else if (nameLower.includes('pan') || nameLower.includes('প্যান')) cat = 'PAN Card (প্যান)';
              else if (nameLower.includes('passport') || nameLower.includes('পাসপোর্ট') || nameLower.includes('visa')) cat = 'Passport/Visa';
              else if (nameLower.includes('pvc') || nameLower.includes('print') || nameLower.includes('ল্যামিনেশন')) cat = 'PVC/Print';
              else if (nameLower.includes('bank') || nameLower.includes('dbt') || nameLower.includes('cash') || nameLower.includes('withdraw')) cat = 'Banking/DBT (ব্যাংকিং)';
              
              categories[cat] = (categories[cat] || 0) + 1;
            });
          });
          const mostFrequentCategory = Object.keys(categories).length > 0
            ? Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b)
            : 'No services recorded yet';

          // Identify affiliated branch (shop)
          const affiliatedShop = shops.find(s => s.id === cust.shopId) || shops[0];

          return (
            <div className="space-y-6 animate-scale-up">
              
              {/* Profile Card & Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Citizen Profile Details Card */}
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3.5`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 className={`font-black text-xs ${textPrimaryClass}`}>{cust.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">Contact: {cust.mobile}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-500/5 pt-3 space-y-2 text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="opacity-60">Username:</span>
                      <span className="font-mono text-indigo-400 font-bold">@{cust.username || cust.name.toLowerCase().replace(/\s+/g, '_')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">RODP User ID / URL:</span>
                      <span className="font-mono text-emerald-400 font-bold max-w-[150px] truncate" title={cust.rodpAddress || cust.email || 'N/A'}>
                        {cust.rodpAddress || cust.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Reference ID:</span>
                      <span className="font-mono text-amber-500 font-bold">{cust.referenceId || cust.customId || 'No Ref'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Registered Address:</span>
                      <span className="text-slate-300 max-w-[140px] truncate font-medium" title={cust.address || 'Jalangi, Murshidabad'}>
                        {cust.address || 'Jalangi, Murshidabad'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Registration Date:</span>
                      <span className="text-slate-400">{cust.createdAt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Primary Branch Node:</span>
                      <span className="font-bold text-slate-300 truncate max-w-[140px]" title={affiliatedShop ? affiliatedShop.name : 'Unknown Branch'}>
                        {affiliatedShop ? `${affiliatedShop.name} (${affiliatedShop.customId || affiliatedShop.id})` : 'Central HQ (ROD001)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">User Status:</span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] uppercase font-bold">
                        {cust.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing Analysis Bento Box Grid */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  
                  {/* Cumulate Spend */}
                  <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                    <div className="flex justify-between items-start">
                      <span className="opacity-60 text-[9px] uppercase font-bold tracking-wide">Cumulative Spent</span>
                      <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                        <IndianRupee size={12} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-black text-emerald-500 font-mono font-bold">₹{totalSpent.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Across {totalTransactions} Transactions</span>
                    </div>
                  </div>

                  {/* Outstanding Dues */}
                  <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                    <div className="flex justify-between items-start">
                      <span className="opacity-60 text-[9px] uppercase font-bold tracking-wide">Outstanding Balance</span>
                      <div className={`p-1.5 rounded-lg ${totalDues > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <Wallet size={12} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`text-xl font-black font-mono font-bold ${totalDues > 0 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                        ₹{totalDues.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {totalDues > 0 ? 'Dues Pending Collection' : 'Zero Outstanding Balance'}
                      </span>
                    </div>
                  </div>

                  {/* Preferred settlement method */}
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center gap-3`}>
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                      <CreditCard size={15} />
                    </div>
                    <div>
                      <span className="opacity-50 block text-[8px] uppercase font-black">Preferred Settlement</span>
                      <span className={`text-xs font-black ${textPrimaryClass}`}>{preferredMode}</span>
                    </div>
                  </div>

                  {/* Most frequent service category */}
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center gap-3`}>
                    <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl shrink-0">
                      <BarChart3 size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="opacity-50 block text-[8px] uppercase font-black">Frequent Service Category</span>
                      <span className={`text-xs font-black ${textPrimaryClass} truncate block`} title={mostFrequentCategory}>{mostFrequentCategory}</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Citizen Transaction Ledger Timeline / List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-3">
                  <h4 className={`font-black text-xs uppercase tracking-wider ${textPrimaryClass} flex items-center gap-1.5`}>
                    <Receipt size={14} className="text-indigo-400" />
                    <span>Citizen Historical Invoice Ledger ({customerInvoices.length} Bills)</span>
                  </h4>
                  <div className="flex items-center gap-2 shrink-0">
                    {customerInvoices.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleExportCsv(cust, customerInvoices)}
                        className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-white rounded-xl font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow hover:shadow-indigo-500/20 active:scale-95"
                      >
                        <FileText size={12} className="text-[#dfac5d]" />
                        <span>Export as CSV</span>
                      </button>
                    )}
                    <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest hidden sm:inline">HQ Secured Log</span>
                  </div>
                </div>

                <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-950/30">
                  <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/70 text-[9px] uppercase tracking-wider text-slate-400 font-extrabold sticky top-0">
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Ledger Code</th>
                          <th className="py-2.5 px-4">Affiliate Branch</th>
                          <th className="py-2.5 px-4">Services Rendered</th>
                          <th className="py-2.5 px-4 text-center">Settlement</th>
                          <th className="py-2.5 px-4 text-right">Bill Total</th>
                          <th className="py-2.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {customerInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-[10.5px]">
                              No billing records logged for this citizen.
                            </td>
                          </tr>
                        ) : (
                          customerInvoices.map((inv: any) => {
                            const shopObj = shops.find(s => s.id === inv.shopId);
                            const shopLabel = shopObj ? shopObj.name : `Branch #${inv.shopId?.replace('shop_', '')}`;
                            return (
                              <tr 
                                key={inv.id} 
                                className="hover:bg-slate-500/5 transition-colors text-slate-300 font-semibold"
                              >
                                <td className="py-2.5 px-4 font-mono text-slate-400 text-[10px]">{inv.createdAt ? inv.createdAt.substring(0, 10) : 'N/A'}</td>
                                <td className="py-2.5 px-4 font-mono text-amber-500 font-bold">{inv.invoiceNumber}</td>
                                <td className="py-2.5 px-4 truncate max-w-[120px]" title={shopLabel}>{shopLabel}</td>
                                <td className="py-2.5 px-4 truncate max-w-[180px]" title={inv.items.map((i: any) => i.name).join(', ')}>
                                  {inv.items.map((i: any) => i.name).join(', ')}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[9px]">
                                    {inv.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-100">₹{inv.totalAmount}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase border ${
                                    inv.paymentStatus === 'Paid' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : inv.paymentStatus === 'Partial'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {inv.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

      </div>

      {/* Onboard Entity Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto custom-scrollbar ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-500/10 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 uppercase tracking-wide text-amber-500">
                <Sparkles size={16} className="text-amber-500 animate-spin" />
                <span>Onboard Branch, Office, or Staff</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="p-1 rounded-lg hover:bg-slate-500/10">
                <Ban size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              
              {/* Entity Type Selector */}
              <div className="space-y-1.5">
                <label className="opacity-60 block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Who is this panel for? / প্যানেলটির ধরণ সিলেক্ট করুন</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'branch', label: 'Branch / ব্রাঞ্চ' },
                    { id: 'office', label: 'Office / অফিস' },
                    { id: 'staff', label: 'Staff / স্টাফ' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setRoleType(item.id as any)}
                      className={`py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
                        roleType === item.id 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md' 
                          : 'border-slate-800 bg-[#030304]/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Inputs depending on type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">
                    {roleType === 'branch' ? 'Branch/Shop Name *' : 'Account/Panel Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={roleType === 'branch' ? 'e.g. Jalangi CSC Branch' : 'e.g. Faisal Supervisor'}
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">
                    {roleType === 'branch' ? 'Branch Head Name *' : 'Assignee Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Unique 3-Digit login ID (Auto-generated)</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. 101"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value.replace(/\D/g, ''))}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-mono font-bold text-center tracking-widest bg-slate-950/90 border-amber-500/30 text-amber-400`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Login Passcode / পাসওয়ার্ড *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-mono font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Contact Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. branch1@rodp.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Phone Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              {roleType === 'branch' && (
                <div className="space-y-4">
                  <div>
                    <label className="opacity-60 block mb-1">Physical Address / ব্রাঞ্চের ঠিকানা *</label>
                    <input
                      type="text"
                      required={roleType === 'branch'}
                      placeholder="Village/Street, Post, Block, District, PIN Code"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  {/* Main Branch Option */}
                  <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                    <input
                      type="checkbox"
                      id="isMainBranchCheck"
                      checked={isMainBranch}
                      onChange={(e) => setIsMainBranch(e.target.checked)}
                      className="rounded border-amber-500 text-amber-500 focus:ring-0 cursor-pointer h-4 w-4"
                    />
                    <label htmlFor="isMainBranchCheck" className="text-xs font-bold text-amber-400 cursor-pointer select-none">
                      এটি কি মেইন ব্রাঞ্চ (Main Branch)?
                    </label>
                  </div>

                  {/* Manager Avatar Preset Selection */}
                  <div className="space-y-2">
                    <label className="opacity-60 block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                      Head Manager Photo / ম্যানেজারের কভার ও প্রোফাইল ফটো
                    </label>
                    <div className="flex items-center gap-3">
                      <img
                        src={managerPhoto}
                        alt="Manager Preview"
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50 p-0.5 shrink-0 bg-slate-950"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={managerPhoto}
                          onChange={(e) => setManagerPhoto(e.target.value)}
                          placeholder="Paste photo URL or select preset"
                          className={`w-full p-1.5 rounded-lg border focus:outline-none text-[9px] font-mono ${
                            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                        <div className="flex gap-2">
                          {[
                            { name: 'Elite M', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
                            { name: 'Cyber F', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
                            { name: 'CEO Elite', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
                            { name: 'Director M', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' }
                          ].map(preset => (
                            <button
                              type="button"
                              key={preset.name}
                              onClick={() => setManagerPhoto(preset.url)}
                              className={`px-2 py-1 rounded text-[8px] font-bold border transition-colors ${
                                managerPhoto === preset.url
                                  ? 'bg-amber-500 border-amber-600 text-slate-950'
                                  : 'border-slate-800 bg-[#030304]/80 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manager Bio Input */}
                  <div>
                    <label className="opacity-60 block mb-1 text-[10px]">Head Manager's Quote / Bio (বায়ো)</label>
                    <textarea
                      rows={2}
                      placeholder="ম্যানেজারের জন্য একটি সুন্দর বায়ো লিখুন..."
                      value={managerBio}
                      onChange={(e) => setManagerBio(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-semibold leading-relaxed ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>

                  {/* Super Admin Congratulations Custom Message */}
                  <div>
                    <label className="opacity-60 block mb-1 text-[10px]">Congratulations Wishes (শুভেচ্ছা বার্তা)</label>
                    <textarea
                      rows={2}
                      placeholder="অফিস ইউজে লগইন করার পর যে চমৎকার শুভেচ্ছা বার্তা শো করবে..."
                      value={congratulationsMsg}
                      onChange={(e) => setCongratulationsMsg(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-semibold leading-relaxed ${
                        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Customized Permission checkboxes - CEO can toggle easily */}
              <div className="space-y-2">
                <label className="opacity-60 block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                  Assign Dashboard Permissions / পারমিশন সেট করুন
                </label>
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 bg-[#030304]/60 p-3 rounded-2xl border border-slate-800/80">
                  {[
                    { id: 'dashboard', label: 'Dashboard Control' },
                    { id: 'services', label: 'Service Modules' },
                    { id: 'appointments', label: 'Appointments Hub' },
                    { id: 'priority_tasks_vault', label: 'Task List proof' },
                    { id: 'calendar_scheduler', label: 'Calendar Grid' },
                    { id: 'analytics', label: 'Stats Analytics' },
                    { id: 'crm', label: 'Customer CRM' },
                    { id: 'billing', label: 'Smart Billing' },
                    { id: 'inventory', label: 'Inventory Desk' },
                    { id: 'vault', label: 'Document Vault' },
                    { id: 'staff', label: 'Staff Roster' },
                    { id: 'finance', label: 'Finance Ledger' },
                    { id: 'ai_assistant', label: 'AI Copilot' },
                    { id: 'notifications', label: 'System Alert Logs' }
                  ].map(scope => {
                    const isChecked = permissions.includes(scope.id);
                    return (
                      <label key={scope.id} className="flex items-center gap-1.5 text-[9px] text-slate-300 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setPermissions(permissions.filter(p => p !== scope.id));
                            } else {
                              setPermissions([...permissions, scope.id]);
                            }
                          }}
                          className="rounded border-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="truncate">{scope.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit triggers */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest cursor-pointer ${
                    theme === 'dark' ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  Create & Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PAGE DOSSIER OVERLAY FOR SELECTED SHOP / BRANCH */}
      {selectedShopForDossier && (() => {
        const shop = selectedShopForDossier;
        const metrics = getBranchMetrics(shop.id);

        // File upload processors for branch and manager photos
        const processBranchPhotoDossierFile = (file: File) => {
          setDossierError(null);
          if (!file.type.startsWith('image/')) {
            setDossierError('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন।');
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            updateShop(shop.id, { branchPhoto: base64String, branchPhotoUploaded: true });
            setSelectedShopForDossier({ ...shop, branchPhoto: base64String, branchPhotoUploaded: true });
          };
          reader.readAsDataURL(file);
        };

        const processManagerPhotoDossierFile = (file: File) => {
          setDossierError(null);
          if (!file.type.startsWith('image/')) {
            setDossierError('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন।');
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            updateShop(shop.id, { managerPhoto: base64String });
            setSelectedShopForDossier({ ...shop, managerPhoto: base64String });
          };
          reader.readAsDataURL(file);
        };

        return (
          <div className="fixed inset-0 bg-[#06070c]/98 backdrop-blur-md z-50 overflow-y-auto animate-fade-in p-2 md:p-6 text-slate-200">
            <div className={`w-full max-w-7xl mx-auto rounded-3xl shadow-2xl border flex flex-col min-h-screen ${
              theme === 'dark' ? 'bg-[#0a0b12] border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              
              {/* TOP WORKSTATION PANEL HEADER */}
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/60 rounded-t-3xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      FRANCHISE STATION
                    </span>
                    <span className="text-[10px] tracking-widest text-slate-500 font-mono uppercase">LIVE DEPLOYMENT STREAM</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
                    <Store className="text-amber-500" size={18} />
                    <span>{shop.name} — Workspace Console</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setSelectedShopForDossier(null);
                      setDossierError(null);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <X size={14} />
                    <span>Close Workstation</span>
                  </button>
                </div>
              </div>

              {/* TWO COLUMN GRID LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8 flex-1">
                
                {/* LEFT COLUMN: IDENTITY & MANAGER CONFIG (EDITABLE DETAILS) */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* EDITABLE PARAMETERS SECTION */}
                  <div className="p-6 rounded-2xl bg-[#040509] border border-slate-800/80 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-2 border-b border-slate-900 pb-2.5">
                      <Settings size={14} />
                      <span>Edit Branch Parameters / ব্রাঞ্চের মূল তথ্য সংশোধন</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Branch Name</label>
                        <input
                          type="text"
                          value={shop.name || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { name: e.target.value });
                            setSelectedShopForDossier({ ...shop, name: e.target.value });
                          }}
                          className="w-full text-xs font-bold py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Head Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Head Operator / Manager Name</label>
                        <input
                          type="text"
                          value={shop.branchHead || shop.ownerName || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { branchHead: e.target.value, ownerName: e.target.value });
                            setSelectedShopForDossier({ ...shop, branchHead: e.target.value, ownerName: e.target.value });
                          }}
                          className="w-full text-xs font-bold py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Mobile */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Contact Mobile Number</label>
                        <input
                          type="text"
                          value={shop.mobile || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { mobile: e.target.value });
                            setSelectedShopForDossier({ ...shop, mobile: e.target.value });
                          }}
                          className="w-full text-xs font-bold py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Login Password (সংশোধনযোগ্য)</label>
                        <input
                          type="text"
                          value={shop.password || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { password: e.target.value });
                            setSelectedShopForDossier({ ...shop, password: e.target.value });
                          }}
                          className="w-full text-xs font-bold py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none text-amber-400 font-mono"
                        />
                      </div>

                      {/* Email Address */}
                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Official Email Address</label>
                        <input
                          type="email"
                          value={shop.ownerEmail || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { ownerEmail: e.target.value });
                            setSelectedShopForDossier({ ...shop, ownerEmail: e.target.value });
                          }}
                          className="w-full text-xs font-bold py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none text-slate-400"
                        />
                      </div>

                      {/* Address */}
                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Physical Address / ঠিকানা</label>
                        <textarea
                          rows={2}
                          value={shop.address || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { address: e.target.value });
                            setSelectedShopForDossier({ ...shop, address: e.target.value });
                          }}
                          className="w-full text-xs font-bold py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BRANCH MANAGER PHOTO UPLOAD & BIO PROFILE */}
                  <div className="p-6 rounded-2xl bg-[#040509] border border-slate-800/80 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2 border-b border-slate-900 pb-2.5">
                      <UserCheck size={14} />
                      <span>Branch Manager Profile & Photo / ম্যানেজার প্রোফাইল ও ফটো আপলোড</span>
                    </h3>

                    {/* Manager Photo Workspace */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <img
                          src={shop.managerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                          alt="Manager avatar"
                          className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500/30 p-1 shrink-0 bg-slate-950 shadow-xl"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 space-y-2 w-full">
                          <label className="text-[10px] text-slate-400 uppercase font-black block">Manager Profile Photo URL</label>
                          <input
                            type="text"
                            placeholder="Paste Photo URL directly"
                            value={shop.managerPhoto || ''}
                            onChange={(e) => {
                              updateShop(shop.id, { managerPhoto: e.target.value });
                              setSelectedShopForDossier({ ...shop, managerPhoto: e.target.value });
                            }}
                            className="w-full text-xs font-mono py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-300"
                          />
                        </div>
                      </div>

                      {/* Drag & Drop area for Manager Photo */}
                      <div
                        onDragEnter={(e) => { e.preventDefault(); setDossierManagerDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDossierManagerDragActive(false); }}
                        onDragOver={(e) => { e.preventDefault(); setDossierManagerDragActive(true); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDossierManagerDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            processManagerPhotoDossierFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => document.getElementById('dossier-manager-photo-file')?.click()}
                        className={`border border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                          dossierManagerDragActive 
                            ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400' 
                            : 'border-slate-800 bg-slate-950/50 hover:bg-slate-950/90 text-slate-400'
                        }`}
                      >
                        <input
                          type="file"
                          id="dossier-manager-photo-file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              processManagerPhotoDossierFile(e.target.files[0]);
                            }
                          }}
                        />
                        <span className="text-[10px] font-bold block text-slate-300">
                          ম্যানেজারের লাইভ ছবি ড্র্যাগ করে এখানে ড্রপ করুন অথবা ক্লিক করে আপলোড করুন
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          Drag manager photo or Click to Browse
                        </span>
                      </div>
                    </div>

                    {/* Biography & Congratulations Msg */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Manager Biography / পরিচিতি বার্তা</label>
                        <textarea
                          rows={2}
                          value={shop.managerBio || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { managerBio: e.target.value });
                            setSelectedShopForDossier({ ...shop, managerBio: e.target.value });
                          }}
                          placeholder="ম্যানেজারের সংক্ষিপ্ত প্রফেশনাল পরিচিতি..."
                          className="w-full text-xs font-bold py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Congratulations Template / অভিনন্দন বার্তা</label>
                        <textarea
                          rows={2}
                          value={shop.congratulationsMsg || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { congratulationsMsg: e.target.value });
                            setSelectedShopForDossier({ ...shop, congratulationsMsg: e.target.value });
                          }}
                          placeholder="ম্যানেজারের উদ্দেশ্যে মেইন ব্রাঞ্চ ও সেন্ট্রাল প্যানেলের অভিনন্দন বার্তা..."
                          className="w-full text-xs font-bold py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                  </div>

                </div>

                {/* RIGHT COLUMN: BRANCH PHYSICAL PHOTO, METRICS, PERMISSIONS */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* PHYSICAL BRANCH PHOTO WORKSPACE */}
                  <div className="p-6 rounded-2xl bg-[#040509] border border-slate-800/80 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-slate-900 pb-2.5">
                      <Store size={14} />
                      <span>Branch Physical Photo Setup / ব্রাঞ্চের বাস্তব ছবি আপলোড</span>
                    </h3>

                    {/* Branch Photo Visual Area */}
                    <div className="space-y-3">
                      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 aspect-video relative flex items-center justify-center">
                        {shop.branchPhoto ? (
                          <img
                            src={shop.branchPhoto}
                            alt="Branch Physical Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center p-6 space-y-2">
                            <AlertTriangle className="text-amber-500 mx-auto animate-pulse" size={28} />
                            <div className="text-[10px] font-bold text-slate-400">কোনো ব্রাঞ্চ ফটো আপলোড করা নেই!</div>
                            <div className="text-[9px] text-slate-600">ম্যানেজার ড্যাশবোর্ডে "ফটো তোলো" নির্দেশ দেওয়া আছে।</div>
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-[8px] font-mono uppercase tracking-wider">
                          {shop.branchPhoto ? 'Uploaded ✓' : 'No Photo ⚠️'}
                        </div>
                      </div>

                      {/* Direct URL input for branch photo */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-black block">Branch Physical Photo URL</label>
                        <input
                          type="text"
                          placeholder="https://example.com/branch-front.jpg"
                          value={shop.branchPhoto || ''}
                          onChange={(e) => {
                            updateShop(shop.id, { branchPhoto: e.target.value, branchPhotoUploaded: !!e.target.value });
                            setSelectedShopForDossier({ ...shop, branchPhoto: e.target.value, branchPhotoUploaded: !!e.target.value });
                          }}
                          className="w-full text-xs font-mono py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-emerald-500 focus:outline-none text-slate-300"
                        />
                      </div>

                      {/* Drag & Drop zone for Branch Photo */}
                      <div
                        onDragEnter={(e) => { e.preventDefault(); setDossierBranchDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDossierBranchDragActive(false); }}
                        onDragOver={(e) => { e.preventDefault(); setDossierBranchDragActive(true); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDossierBranchDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            processBranchPhotoDossierFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => document.getElementById('dossier-branch-photo-file')?.click()}
                        className={`border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                          dossierBranchDragActive 
                            ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400' 
                            : 'border-slate-800 bg-slate-950/50 hover:bg-slate-950/90 text-slate-400'
                        }`}
                      >
                        <input
                          type="file"
                          id="dossier-branch-photo-file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              processBranchPhotoDossierFile(e.target.files[0]);
                            }
                          }}
                        />
                        <span className="text-[10px] font-bold block text-slate-300">
                          ব্রাঞ্চের বাস্তব ছবি ড্র্যাগ করে এখানে ড্রপ করুন অথবা ক্লিক করে আপলোড করুন
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">
                          Drag branch exterior/interior photo or Click to Browse
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BRANCH CONNECTION STATUS & PERFORMANCE METRICS */}
                  <div className="p-6 rounded-2xl bg-[#040509] border border-slate-800/80 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-900 pb-2.5">
                      <BarChart3 size={14} />
                      <span>Branch Performance Audit / একাউন্ট স্ট্যাটাস ও ট্র্যাকিং</span>
                    </h3>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                        <span className="opacity-50 block text-[8px] uppercase font-bold">Invoiced Income</span>
                        <span className="text-sm font-mono font-black text-emerald-500">₹{metrics.revenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                        <span className="opacity-50 block text-[8px] uppercase font-bold">Appointments</span>
                        <span className="text-sm font-mono font-black text-indigo-400">{metrics.appointments}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-center">
                        <span className="opacity-50 block text-[8px] uppercase font-bold">Tasks Completed</span>
                        <span className="text-sm font-mono font-black text-cyan-400">{metrics.tasks}</span>
                      </div>
                    </div>

                    {/* Status selection */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-500 font-mono tracking-wider">Account State Configuration</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { key: 'approved', label: 'Active' },
                          { key: 'suspended', label: 'Suspended' },
                          { key: 'hold', label: 'Hold' },
                          { key: 'Deleted', label: 'Soft Delete' },
                        ].map(st => {
                          const isActive = shop.status === st.key || (st.key === 'approved' && (!shop.status || shop.status === 'approved'));
                          return (
                            <button
                              type="button"
                              key={st.key}
                              onClick={() => {
                                if (st.key === 'Deleted') {
                                  if (window.confirm(`Are you sure you want to soft-delete branch: ${shop.name}? It will no longer appear in the active registry and access will be blocked.`)) {
                                    updateShop(shop.id, { status: 'Deleted' });
                                    setSelectedShopForDossier(null);
                                  }
                                } else {
                                  updateShop(shop.id, { status: st.key });
                                  setSelectedShopForDossier({ ...shop, status: st.key as any });
                                }
                              }}
                              className={`py-2 rounded-xl border text-[9px] font-black uppercase text-center transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md scale-105'
                                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {st.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* CUSTOM ENABLED PERMISSION MODULES */}
                  <div className="p-6 rounded-2xl bg-[#040509] border border-slate-800/80 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Deployable System Access Scopes ({shop.permissions?.length || 0} Enabled)
                    </h4>
                    
                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-900">
                      {[
                        { id: 'dashboard', label: 'Dashboard Control' },
                        { id: 'services', label: 'Service Modules' },
                        { id: 'appointments', label: 'Appointments Hub' },
                        { id: 'priority_tasks_vault', label: 'Task List proof' },
                        { id: 'calendar_scheduler', label: 'Calendar Grid' },
                        { id: 'analytics', label: 'Stats Analytics' },
                        { id: 'crm', label: 'Customer CRM' },
                        { id: 'billing', label: 'Smart Billing' },
                        { id: 'inventory', label: 'Inventory Desk' },
                        { id: 'vault', label: 'Document Vault' },
                        { id: 'staff', label: 'Staff Roster' },
                        { id: 'finance', label: 'Finance Ledger' },
                        { id: 'ai_assistant', label: 'AI Copilot' },
                        { id: 'notifications', label: 'System Alert Logs' }
                      ].map(scope => {
                        const isChecked = shop.permissions?.includes(scope.id);
                        return (
                          <label key={scope.id} className="flex items-center gap-1.5 text-[9px] text-slate-300 font-bold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked || false}
                              onChange={() => {
                                const nextPermissions = isChecked 
                                  ? shop.permissions?.filter(p => p !== scope.id) || []
                                  : [...(shop.permissions || []), scope.id];
                                updateShop(shop.id, { permissions: nextPermissions });
                                setSelectedShopForDossier({ ...shop, permissions: nextPermissions });
                              }}
                              className="rounded border-slate-850 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                            <span className="truncate">{scope.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* FOOTER CONTROL BAR WITH DIRECT BYPASS PORTAL ACCESS */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/60 rounded-b-3xl flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* View Dashboard trigger / Direct branch bypass portal access */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShopForDossier(null);
                    if (onCeoViewBranch) {
                      onCeoViewBranch(shop.id, shop.permissions || [], shop.name);
                    }
                  }}
                  className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 font-black text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <Power size={14} className="text-slate-950" />
                  <span>🔌 এই ব্রাঞ্চ অ্যাকাউন্টে সরাসরি প্রবেশ করুন (Direct Branch Access)</span>
                </button>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you absolutely sure you want to completely terminate and delete contract details for: ${shop.name}? This is permanent and irreversible.`)) {
                        deleteShop(shop.id);
                        setSelectedShopForDossier(null);
                      }
                    }}
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors"
                  >
                    Terminate Contract
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedShopForDossier(null);
                      setDossierError(null);
                    }}
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors"
                  >
                    Save & Exit Workstation
                  </button>
                </div>

              </div>

              {dossierError && (
                <div className="bg-rose-500/20 border-t border-rose-500/30 p-2.5 text-center text-[10px] text-rose-400 font-extrabold rounded-b-3xl">
                  ⚠️ {dossierError}
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* SERVICE PRICE MANAGEMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showServicePriceManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-slate-200">
          <div className="w-full max-w-4xl p-6 rounded-3xl bg-[#0d0e12] border border-slate-850 text-slate-200 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => {
                setShowServicePriceManager(false);
                setEditingServiceId(null);
                setSvcName('');
                setSvcPrice('');
                setSvcDescription('');
                setSvcBengali('');
              }}
              className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <IndianRupee className="text-amber-500 animate-pulse" size={18} />
                <div>
                  <h3 className="font-black text-slate-100 text-sm uppercase">Service Details & Price Management Module</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">Central Firebase-backed catalogue with instant real-time synchronization across all branches.</p>
                </div>
              </div>

              {/* Real-time Branch Service Activity Notification Indicator (Requirements 12, 13, 14) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowServiceNotifDrawer(!showServiceNotifDrawer)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border ${
                    serviceNotifications.some(n => !n.read)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-lg animate-pulse'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <BellRing size={13} className={serviceNotifications.some(n => !n.read) ? 'text-amber-400' : ''} />
                  <span>ব্রাঞ্চ সার্ভিস নোটিফিকেশন</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                    serviceNotifications.filter(n => !n.read).length > 0
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {serviceNotifications.filter(n => !n.read).length}
                  </span>
                </button>
              </div>
            </div>

            {/* REAL-TIME SERVICE NOTIFICATIONS DRAWER (Requirements 12, 13, 14) */}
            {showServiceNotifDrawer && (
              <div className="p-4 rounded-2xl bg-[#07090f] border border-amber-500/30 space-y-3 animate-fade-in text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono">
                      ব্রাঞ্চের সার্ভিস পরিবর্তন ও মূল্য নোটিফিকেশন ({serviceNotifications.length})
                    </h4>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Firebase Live Stream
                  </span>
                </div>

                {serviceNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-1">
                    <CheckCircle size={22} className="mx-auto text-emerald-400 opacity-60" />
                    <p className="text-xs font-bold text-slate-300">কোনো নতুন ব্রাঞ্চ সার্ভিস পরিবর্তন নেই</p>
                    <p className="text-[10px] text-slate-500">ব্রাঞ্চ কোনো সার্ভিস কাস্টমাইজ বা যোগ করলে তাৎক্ষণিক এখানে আসবে।</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {serviceNotifications.map(notif => {
                      const replyVal = serviceReplyInput[notif.id] ?? '';
                      return (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                            notif.read ? 'bg-slate-950/60 border-white/5' : 'bg-slate-900 border-amber-500/40 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black uppercase">
                                {notif.branchName} [{notif.branchId}]
                              </span>
                              <span className="text-white font-bold">{notif.serviceName}</span>
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-black uppercase ${
                                notif.changeType === 'created' ? 'bg-emerald-500/20 text-emerald-300' :
                                notif.changeType === 'repriced' ? 'bg-cyan-500/20 text-cyan-300' :
                                notif.changeType === 'disabled' ? 'bg-rose-500/20 text-rose-300' :
                                'bg-slate-800 text-slate-300'
                              }`}>
                                {notif.changeType}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.timestamp).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2 rounded-lg border border-white/5 font-mono">
                            <div>
                              <span className="text-slate-500">পূর্বের মান (Previous): </span>
                              <span className="text-slate-300">{notif.previousValue !== undefined ? notif.previousValue : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">নতুন মান (New Value): </span>
                              <span className="text-emerald-400 font-bold">{notif.newValue !== undefined ? notif.newValue : 'Modified'}</span>
                            </div>
                          </div>

                          {/* Existing CEO Reply */}
                          {notif.ceoReply && (
                            <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-[10.5px] space-y-0.5 text-left">
                              <span className="text-[9px] font-mono uppercase text-emerald-400 font-black">
                                ✓ CEO REPLY SENT ({new Date(notif.ceoRepliedAt || '').toLocaleTimeString()}):
                              </span>
                              <p className="text-emerald-200">{notif.ceoReply}</p>
                            </div>
                          )}

                          {/* Inline Reply Input for CEO */}
                          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                            <input
                              type="text"
                              value={replyVal}
                              onChange={(e) => setServiceReplyInput({ ...serviceReplyInput, [notif.id]: e.target.value })}
                              placeholder={`ব্রাঞ্চে উত্তর লিখুন (${notif.branchName})...`}
                              className="flex-1 px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!replyVal.trim()) return;
                                if (replyToServiceNotification) {
                                  replyToServiceNotification(notif.id, replyVal.trim());
                                }
                                setServiceReplyInput({ ...serviceReplyInput, [notif.id]: '' });
                                alert(`ব্রাঞ্চ (${notif.branchName}) এ সফলভাবে সিইও রিপ্লাই পৌঁছে গেছে!`);
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-lg cursor-pointer transition-all active:scale-95 shrink-0"
                            >
                              উত্তর দিন (Reply)
                            </button>
                            {!notif.read && markServiceNotificationRead && (
                              <button
                                type="button"
                                onClick={() => markServiceNotificationRead(notif.id)}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-lg cursor-pointer"
                              >
                                পঠিত
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              {/* Left Form: Add / Edit Service (5 cols) */}
              <div className="lg:col-span-5 bg-[#050507] p-5 rounded-2xl border border-slate-900 space-y-4">
                <h4 className="font-black text-xs uppercase text-amber-500 flex items-center gap-1.5 border-b border-slate-850 pb-2">
                  <Sparkles size={12} />
                  <span>{editingServiceId ? 'Edit Service Details' : 'Add New Service / অনলাইন সেবা'}</span>
                </h4>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!svcName.trim()) {
                    alert('Please enter service name.');
                    return;
                  }
                  const priceVal = parseFloat(svcPrice) || 0;
                  
                  if (editingServiceId) {
                    if (updateService) {
                      updateService(editingServiceId, {
                        name: svcName.trim(),
                        category: svcCategory,
                        description: svcDescription.trim(),
                        bengaliDesc: svcBengali.trim(),
                        price: priceVal
                      });
                    }
                    alert('Service successfully updated!');
                    setEditingServiceId(null);
                  } else {
                    const newSvc: ServiceModule = {
                      id: `svc_${Date.now()}`,
                      name: svcName.trim(),
                      category: svcCategory,
                      description: svcDescription.trim(),
                      bengaliDesc: svcBengali.trim(),
                      price: priceVal,
                      disabled: false
                    };
                    if (addService) {
                      addService(newSvc);
                    }
                    alert('Service successfully added to global database!');
                  }

                  // Reset form
                  setSvcName('');
                  setSvcPrice('');
                  setSvcDescription('');
                  setSvcBengali('');
                }} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-black block">Service Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={svcName}
                      onChange={(e) => setSvcName(e.target.value)}
                      placeholder="e.g. Passport Photo Print"
                      className="w-full text-xs font-bold py-2 px-3 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-black block">Service Bengali Name (বাংলা নাম)</label>
                    <input
                      type="text"
                      value={svcBengali}
                      onChange={(e) => setSvcBengali(e.target.value)}
                      placeholder="যেমন: পাসপোর্ট ছবি প্রিন্ট"
                      className="w-full text-xs font-bold py-2 px-3 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-black block">Category</label>
                      <select
                        value={svcCategory}
                        onChange={(e) => setSvcCategory(e.target.value)}
                        className="w-full text-xs font-bold py-2 px-3 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none text-[#dfac5d]"
                      >
                        <option value="Online Work">Online Work</option>
                        <option value="Government">Government</option>
                        <option value="Banking">Banking</option>
                        <option value="Printing">Printing</option>
                        <option value="Custom">Custom Service</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-black block">Default Price (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={svcPrice}
                        onChange={(e) => setSvcPrice(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full text-xs font-bold py-2 px-3 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none text-emerald-400 font-mono text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-black block">Short Description</label>
                    <textarea
                      value={svcDescription}
                      onChange={(e) => setSvcDescription(e.target.value)}
                      placeholder="e.g. Ultra high quality digital photo print on glossy paper."
                      rows={2}
                      className="w-full text-xs p-2.5 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none resize-none font-medium"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 font-black text-center text-[10px] uppercase tracking-wider rounded-xl cursor-pointer font-extrabold"
                    >
                      {editingServiceId ? 'Update Service' : 'Create Service Item'}
                    </button>
                    {editingServiceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceId(null);
                          setSvcName('');
                          setSvcPrice('');
                          setSvcDescription('');
                          setSvcBengali('');
                        }}
                        className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] uppercase font-black cursor-pointer font-extrabold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right List: Active Services List (7 cols) */}
              <div className="lg:col-span-7 bg-[#050507] p-5 rounded-2xl border border-slate-900 flex flex-col space-y-3 min-h-[400px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-850 pb-2.5">
                  <h4 className="font-black text-xs uppercase text-slate-200">Global Service Directory</h4>
                  
                  {/* Search box within services modal */}
                  <div className="relative w-full sm:w-48">
                    <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="w-full py-1 pl-7 pr-2.5 rounded-lg border border-slate-800 bg-[#0a0a0c] text-[10px] focus:outline-none text-white font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 flex-1 custom-scrollbar">
                  {services
                    .filter(s => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || (s.bengaliDesc && s.bengaliDesc.toLowerCase().includes(serviceSearchQuery.toLowerCase())))
                    .map(s => (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors text-left ${
                          s.disabled 
                            ? 'bg-rose-950/10 border-rose-900/10 opacity-60' 
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-slate-900 text-amber-400 text-[8px] rounded uppercase font-mono tracking-wider font-extrabold">
                              {s.category}
                            </span>
                            <span className="text-xs font-black text-slate-200 truncate">{s.name}</span>
                            {s.bengaliDesc && (
                              <span className="text-[10px] text-slate-500 font-medium">({s.bengaliDesc})</span>
                            )}
                          </div>
                          <p className="text-[9.5px] text-slate-500 truncate mt-0.5 font-medium">{s.description || 'No description provided.'}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                            s.showPrice === false 
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                              : 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'
                          }`}>
                            {s.showPrice === false ? 'আমাদের ব্রাঞ্চে ভিজিট করুন' : `₹${s.price || 0}`}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Price Visibility Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                if (updateService) {
                                  updateService(s.id, { showPrice: s.showPrice === false ? true : false });
                                }
                              }}
                              className={`px-2 py-1 rounded-lg border text-[8.5px] font-black uppercase transition-colors cursor-pointer flex items-center gap-1 ${
                                s.showPrice === false
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                              title={s.showPrice === false ? 'Price Hidden (Displays "আমাদের ব্রাঞ্চে ভিজিট করুন"). Click to Show Price.' : 'Price Visible. Click to Hide Price.'}
                            >
                              <Eye size={10} />
                              <span>{s.showPrice === false ? 'মূল্য বন্ধ' : 'মূল্য চালু'}</span>
                            </button>

                            {/* Enable/Disable Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                if (updateService) {
                                  updateService(s.id, { disabled: !s.disabled });
                                }
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                s.disabled
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/20'
                                  : 'bg-rose-950/20 text-rose-400 border-rose-900/30 hover:bg-rose-900/20'
                              }`}
                              title={s.disabled ? 'Enable service' : 'Disable service'}
                            >
                              <Power size={11} />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingServiceId(s.id);
                                setSvcName(s.name);
                                setSvcPrice(String(s.price || 0));
                                setSvcCategory(s.category);
                                setSvcDescription(s.description || '');
                                setSvcBengali(s.bengaliDesc || '');
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 hover:text-white hover:bg-indigo-500/10 cursor-pointer"
                              title="Edit"
                            >
                              <CheckCircle size={11} className="rotate-45" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete service "${s.name}"? This will remove it from all branch list selections.`)) {
                                  if (deleteService) {
                                    deleteService(s.id);
                                    alert('Service deleted successfully!');
                                  }
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-500 hover:text-white cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowServicePriceManager(false);
                  setEditingServiceId(null);
                  setSvcName('');
                  setSvcPrice('');
                  setSvcDescription('');
                  setSvcBengali('');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 font-black uppercase text-[10px] tracking-wider cursor-pointer font-extrabold"
              >
                Close Settings
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HOLD BRANCH ACCESS MODAL */}
      {/* ========================================================================= */}
      {holdingShop && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left text-white my-auto animate-scale-in">
            {/* Modal Header */}
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

            {/* Notice Description */}
            <p className="text-xs text-slate-300 leading-relaxed">
              হোল্ড কার্যকর থাকাকালীন এই ব্রাঞ্চের আইডি/পাসওয়ার্ড দিয়ে কোনো লগইন বা কার্যক্রম চলবে না। সময় শেষ হলে অথবা সিইও রিলিজ করলে স্বয়ংক্রিয়ভাবে পুনরায় সক্রিয় হবে।
            </p>

            {/* Hold Duration Options */}
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

            {/* CEO Hold Reason / Message */}
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

              {/* Quick Pills */}
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

            {/* Actions */}
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

      {/* ========================================================================= */}
      {/* 2. OFFICIAL CEO WARNING MODAL */}
      {/* ========================================================================= */}
      {warningShop && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-yellow-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left text-white my-auto animate-scale-in">
            {/* Modal Header */}
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
              এই সতর্কবার্তাটি সংশ্লিষ্ট ব্রাঞ্চ ম্যানেজারের হোমপেজে একটি স্পষ্ট নোটিশ ব্যানার হিসেবে প্রদর্শিত হবে। ব্রাঞ্চ ম্যানেজার বার্তাটি পড়ে গুণ চিহ্ন (×) আকারে কেটে দিতে পারবেন।
            </p>

            {/* Warning Message Input */}
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

              {/* Preset Warning Pills */}
              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 uppercase font-mono block">দ্রুত মেসেজ প্রিসেট:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'দৈনিক বিল ও ক্যাশ লেজার দ্রুত সেন্ট্রাল সিস্টেমে জমা দিন।',
                    'গ্রাহকদের সেবায় কোনো গাফিলতি বা অতিরিক্ত ফি নেওয়া গ্রহণযোগ্য নয়।',
                    'সিইও অফিশিয়াল নির্দেশিকা ও সময়সূচি কঠোরভাবে অনুসরণ করুন।'
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

            {/* Actions */}
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

      {/* ========================================================================= */}
      {/* 3. COMPLETE FACTORY RESET BRANCH MODAL */}
      {/* ========================================================================= */}
      {resettingShop && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left text-white my-auto animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-inner">
                  <RotateCcw size={22} className="animate-spin-slow" />
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

            {/* Warning Details Card */}
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
                  <span>ব্রাঞ্চটি নতুনের মতো প্রথম লগইন ও সেটআপ পেজ থেকে শুরু হবে।</span>
                </li>
              </ul>
            </div>

            {/* Checkbox confirmation */}
            <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-white/10 rounded-xl cursor-pointer hover:border-purple-500/40 select-none">
              <input
                type="checkbox"
                checked={resetConfirmChecked}
                onChange={(e) => setResetConfirmChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-purple-600 focus:ring-0 cursor-pointer w-4 h-4"
              />
              <span className="text-xs text-slate-300 leading-relaxed font-semibold">
                আমি সম্পূর্ণ জেনে-বুঝে নিশ্চিত করছি যে <strong>{resettingShop.name}</strong>-এর সকল ডাটা স্থায়ীভাবে মুছে দেওয়া হবে।
              </span>
            </label>

            {/* Actions */}
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
                  if (!resetConfirmChecked) return;
                  setIsResettingLoading(true);
                  try {
                    if (onResetBranch) {
                      await onResetBranch(resettingShop.id);
                    } else {
                      updateShop(resettingShop.id, {
                        profileConfirmed: false,
                        passwordChanged: false,
                        managerPhoto: '',
                        managerBio: '',
                        status: 'approved',
                        holdUntil: undefined,
                        holdReason: undefined,
                        warningMessage: undefined
                      });
                    }
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
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-95 shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <RotateCcw size={14} className={isResettingLoading ? 'animate-spin' : ''} />
                <span>{isResettingLoading ? 'রিসেট হচ্ছে...' : 'হ্যাঁ, সম্পূর্ণ রিসেট করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Success Toast */}
      {actionSuccessToast && (
        <div className="fixed top-6 right-6 z-[10001] px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl border border-white/20 flex items-center gap-2.5 animate-bounce-subtle backdrop-blur-md">
          <CheckCircle2 size={18} className="text-amber-300 shrink-0" />
          <span>{actionSuccessToast}</span>
          <button
            type="button"
            onClick={() => setActionSuccessToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-white ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

    </div>
  );
}
