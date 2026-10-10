import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, Store, TrendingUp, ShieldCheck, KeyRound, Edit, Plus, Trash2,
  DollarSign, Package, ShoppingCart, UserCheck, Image as ImageIcon, Camera, Save, Lock, CheckCircle2,
  Phone, MapPin, Grid, Layers, ClipboardList, Info, Sparkles, Check, X, RefreshCw, Upload, FileText,
  Calendar, Users, BarChart3, FileCheck, Search, Eye, AlertCircle, Building, Mail, Clock, Globe,
  Landmark, CreditCard, Tag, ShieldAlert, ChevronLeft, ChevronRight, MessageSquare, Bot, AlertTriangle,
  LayoutDashboard, Activity, Send
} from 'lucide-react';
import { Shop, Invoice, Appointment, CustomerCRM, ServiceModule, BranchServiceSetting, ServiceChangeNotification } from '../types';
import VerifyBillsDocsView from './VerifyBillsDocsView';

interface BranchDashboardViewProps {
  theme: 'light' | 'dark';
  currentUser: any;
  shops: Shop[];
  updateShop: (id: string, updates: any) => void;
  invoices: Invoice[];
  addInvoice?: (invoice: Invoice) => void;
  appointments?: Appointment[];
  addAppointment?: (appointment: Appointment) => void;
  updateAppointment?: (id: string, updates: any) => void;
  deleteAppointment?: (id: string) => void;
  customers?: any[];
  addCustomer?: (customer: any) => void;
  playTechIndustryLoginSound?: () => void;
  inquiries?: any[];
  updateInquiry?: (id: string, updates: any) => void;
  goToBillingWithCustomer?: (mobile: string, service?: string) => void;
  setCurrentTab?: (tab: string) => void;
  onlinePayments?: any[];
  updateOnlinePayment?: (id: string, updates: any) => void;
  deleteOnlinePayment?: (id: string) => void;
  vault?: any[];
  addVaultItem?: (item: any) => void;
  updateVaultItem?: (id: string, updates: any) => void;
  branchChats?: any[];
  addBranchChatMessage?: (msg: any) => void;
  services?: ServiceModule[];
  addService?: (srv: any) => void;
  updateService?: (id: string, updates: any) => void;
  deleteService?: (id: string) => void;
  branchServiceSettings?: BranchServiceSetting[];
  saveBranchServiceSetting?: (setting: BranchServiceSetting, notif?: Partial<ServiceChangeNotification>) => void;
  deleteBranchServiceSetting?: (id: string, notif?: Partial<ServiceChangeNotification>) => void;
  notices?: any[];
}

interface CustomProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
}

interface BranchProof {
  id: string;
  title: string;
  customerName: string;
  customerMobile: string;
  serviceType: string;
  proofImageUrl: string;
  notes?: string;
  createdAt: string;
}

const HEAD_OFFICE_REF = {
  name: 'RIZWAN ONLINE DREAMS (Head Office)',
  address: 'Jalangi Main Market Road, Murshidabad, West Bengal',
  pinCode: '742305',
  contact: '9593388785',
  email: 'rtsuroj@gmail.com'
};

export default function BranchDashboardView({
  theme,
  currentUser,
  shops,
  updateShop,
  invoices,
  addInvoice,
  appointments = [],
  addAppointment,
  updateAppointment,
  deleteAppointment,
  customers = [],
  addCustomer,
  playTechIndustryLoginSound,
  inquiries = [],
  updateInquiry,
  goToBillingWithCustomer,
  setCurrentTab,
  onlinePayments = [],
  updateOnlinePayment,
  deleteOnlinePayment,
  vault = [],
  addVaultItem,
  updateVaultItem,
  branchChats = [],
  addBranchChatMessage,
  services = [],
  addService,
  updateService,
  deleteService,
  branchServiceSettings = [],
  saveBranchServiceSetting,
  deleteBranchServiceSetting,
  notices = []
}: BranchDashboardViewProps) {
  
  // CEO / Super Admin Branch Selection
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const defaultShopId = currentUser?.shopId || (shops[0]?.id || 'shop_2');
  const [selectedShopId, setSelectedShopId] = useState<string>(defaultShopId);

  // Appointment filter & actions state
  const [branchAptFilter, setBranchAptFilter] = useState<'All' | 'Pending' | 'Approved' | 'Completed' | 'Reapply' | 'Rejected'>('All');
  const [branchBillFilter, setBranchBillFilter] = useState<'All' | 'Today' | 'Pending'>('All');
  const [reapplyModalApp, setReapplyModalApp] = useState<Appointment | null>(null);
  const [reapplyReasonText, setReapplyReasonText] = useState<string>('');
  const [transferModalApp, setTransferModalApp] = useState<Appointment | null>(null);
  const [transferTargetShopId, setTransferTargetShopId] = useState<string>('');

  // Sync selectedShopId if user changes or initially loads
  useEffect(() => {
    if (!isSuperAdmin && currentUser?.shopId) {
      setSelectedShopId(currentUser.shopId);
    }
  }, [currentUser, isSuperAdmin]);

  // Active Shop Context
  const currentShop = useMemo(() => {
    return shops.find(s => s.id === selectedShopId || s.customId === selectedShopId) || {
      id: selectedShopId || 'default',
      name: 'RIZWAN CSC DIGITAL BRANCH',
      ownerName: currentUser?.name || 'Branch Manager',
      ownerEmail: currentUser?.email || '',
      mobile: '9593388785',
      address: 'Jalangi, Murshidabad, West Bengal',
      status: 'approved',
      subscriptionType: 'premium_yearly',
      customId: selectedShopId || 'default',
      password: '',
      branchHead: currentUser?.name || 'Branch Manager',
      managerBio: '',
      managerPhoto: '',
      closedDates: [],
      aiHolidayLogs: []
    } as Shop;
  }, [shops, selectedShopId, currentUser?.name, currentUser?.email]);

  // Active Sub-Tab Navigation inside Branch Dashboard
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'profile' | 'services' | 'appointments' | 'billing' | 'verify_bills_docs' | 'customers' | 'analytics' | 'proofs' | 'calendar' | 'inquiries'>('overview');

  // Modal Control States
  const [isQuickBillOpen, setIsQuickBillOpen] = useState(false);
  const [isQuickAptOpen, setIsQuickAptOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // File Input Refs
  const managerFileInputRef = useRef<HTMLInputElement>(null);
  const branchFileInputRef = useRef<HTMLInputElement>(null);
  const proofFileInputRef = useRef<HTMLInputElement>(null);

  // Branch Profile State
  const [shopName, setShopName] = useState<string>(currentShop.name || '');
  const [branchCode, setBranchCode] = useState<string>(currentShop.customId || currentShop.id || '');
  const [branchHead, setBranchHead] = useState<string>(currentShop.branchHead || currentShop.ownerName || '');
  const [managerMobile, setManagerMobile] = useState<string>(currentShop.mobile || '');
  const [alternateMobile, setAlternateMobile] = useState<string>(currentShop.alternateMobile || '');
  const [managerEmail, setManagerEmail] = useState<string>(currentShop.email || currentShop.ownerEmail || '');
  const [fullAddress, setFullAddress] = useState<string>(currentShop.fullAddress || currentShop.address || '');
  const [district, setDistrict] = useState<string>(currentShop.district || 'Murshidabad');
  const [stateName, setStateName] = useState<string>(currentShop.state || 'West Bengal');
  const [pinCode, setPinCode] = useState<string>(currentShop.pinCode || '742305');
  const [googleMapUrl, setGoogleMapUrl] = useState<string>(currentShop.googleMapUrl || '');
  const [businessTiming, setBusinessTiming] = useState<string>(currentShop.businessTiming || '09:00 AM - 08:00 PM');
  const [weeklyHoliday, setWeeklyHoliday] = useState<string>(currentShop.weeklyHoliday || 'Sunday');
  const [gstNumber, setGstNumber] = useState<string>(currentShop.gstNumber || '');
  const [servicesAvailable, setServicesAvailable] = useState<string[]>(currentShop.servicesAvailable || ['Aadhaar Services', 'PAN Card', 'Banking & AEPS', 'Parchon & Printing', 'IRCTC Rail Booking', 'Passport & Visa']);
  const [bankName, setBankName] = useState<string>(currentShop.bankName || '');
  const [accountNumber, setAccountNumber] = useState<string>(currentShop.accountNumber || '');
  const [ifscCode, setIfscCode] = useState<string>(currentShop.ifscCode || '');
  const [upiId, setUpiId] = useState<string>(currentShop.upiId || '');
  const [managerPhoto, setManagerPhoto] = useState<string>(currentShop.managerPhoto || '');
  const [branchPhoto, setBranchPhoto] = useState<string>(currentShop.branchPhoto || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync profile state when currentShop changes
  useEffect(() => {
    if (currentShop) {
      setShopName(currentShop.name || '');
      setBranchCode(currentShop.customId || currentShop.id || '');
      setBranchHead(currentShop.branchHead || currentShop.ownerName || '');
      setManagerMobile(currentShop.mobile || '');
      setAlternateMobile(currentShop.alternateMobile || '');
      setManagerEmail(currentShop.email || currentShop.ownerEmail || '');
      setFullAddress(currentShop.fullAddress || currentShop.address || '');
      setDistrict(currentShop.district || 'Murshidabad');
      setStateName(currentShop.state || 'West Bengal');
      setPinCode(currentShop.pinCode || '742305');
      setGoogleMapUrl(currentShop.googleMapUrl || '');
      setBusinessTiming(currentShop.businessTiming || '09:00 AM - 08:00 PM');
      setWeeklyHoliday(currentShop.weeklyHoliday || 'Sunday');
      setGstNumber(currentShop.gstNumber || '');
      setServicesAvailable(currentShop.servicesAvailable || ['Aadhaar Services', 'PAN Card', 'Banking & AEPS', 'Parchon & Printing', 'IRCTC Rail Booking']);
      setBankName(currentShop.bankName || '');
      setAccountNumber(currentShop.accountNumber || '');
      setIfscCode(currentShop.ifscCode || '');
      setUpiId(currentShop.upiId || '');
      setManagerPhoto(currentShop.managerPhoto || '');
      setBranchPhoto(currentShop.branchPhoto || '');
    }
  }, [currentShop.id, currentShop.name, selectedShopId]);

  // Profile Completion Score Calculation (20 Fields Total)
  const profileFields = [
    shopName, branchCode, branchHead, managerMobile, alternateMobile, managerEmail,
    fullAddress, district, stateName, pinCode, googleMapUrl, businessTiming,
    weeklyHoliday, gstNumber, servicesAvailable.length > 0, bankName, accountNumber,
    ifscCode, upiId, managerPhoto || branchPhoto
  ];
  const filledFieldsCount = profileFields.filter(Boolean).length;
  // Calculate completion %; requirement states 10% initial pre-filled baseline for brand-new empty profiles
  const profileCompletionPct = Math.min(100, Math.max(10, Math.round((filledFieldsCount / 20) * 100)));

  // File Upload Handlers
  const handleManagerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setManagerPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBranchPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setBranchPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Save Branch Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving branch dossier...');

    const updates = {
      name: shopName,
      customId: branchCode,
      branchHead: branchHead,
      ownerName: branchHead,
      mobile: managerMobile,
      alternateMobile: alternateMobile,
      email: managerEmail,
      ownerEmail: managerEmail,
      address: fullAddress,
      fullAddress: fullAddress,
      district: district,
      state: stateName,
      pinCode: pinCode,
      googleMapUrl: googleMapUrl,
      businessTiming: businessTiming,
      weeklyHoliday: weeklyHoliday,
      gstNumber: gstNumber,
      servicesAvailable: servicesAvailable,
      bankName: bankName,
      accountNumber: accountNumber,
      ifscCode: ifscCode,
      upiId: upiId,
      managerPhoto: managerPhoto,
      branchPhoto: branchPhoto,
      branchPhotoUploaded: !!branchPhoto
    };

    updateShop(currentShop.id, updates);

    if (playTechIndustryLoginSound) playTechIndustryLoginSound();

    setTimeout(() => {
      setSaveStatus('✓ Branch Profile updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 500);
  };

  // Products / Services Inventory
  const [products, setProducts] = useState<CustomProduct[]>(() => {
    const saved = localStorage.getItem(`rodp_branch_products_${currentShop.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(`rodp_branch_products_${currentShop.id}`, JSON.stringify(products));
  }, [products, currentShop.id]);

  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number | ''>('');
  const [newProdStock, setNewProdStock] = useState<number | ''>('');
  const [newProdCategory, setNewProdCategory] = useState('Services');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [productMessage, setProductMessage] = useState<string | null>(null);

  // Real-time Branch Chat States (Requirement: Explore Chat in Service section)
  const [activeChatCustomerId, setActiveChatCustomerId] = useState<string | null>(null);
  const [branchReplyText, setBranchReplyText] = useState('');
  const [isExploreChatOpen, setIsExploreChatOpen] = useState(false);

  // Central Firebase Service Catalog & Branch Overrides (Requirements 8, 9, 10, 11, 12, 13, 14)
  const [branchSvcSearch, setBranchSvcSearch] = useState('');
  const [branchSvcTab, setBranchSvcTab] = useState<'all' | 'global' | 'branch_custom'>('all');
  const [editingOverrideSvcId, setEditingOverrideSvcId] = useState<string | null>(null);
  const [overridePriceValue, setOverridePriceValue] = useState<string>('');
  const [showAddBranchSvcModal, setShowAddBranchSvcModal] = useState(false);
  const [newBranchSvcName, setNewBranchSvcName] = useState('');
  const [newBranchSvcPrice, setNewBranchSvcPrice] = useState<string>('');
  const [newBranchSvcCategory, setNewBranchSvcCategory] = useState('Online Forms & Portal');
  const [newBranchSvcDesc, setNewBranchSvcDesc] = useState('');
  const [branchSvcFeedback, setBranchSvcFeedback] = useState<string | null>(null);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newProduct: CustomProduct = {
      id: `prod_${Date.now()}`,
      name: newProdName,
      price: Number(newProdPrice),
      stock: newProdStock === '' ? 100 : Number(newProdStock),
      category: newProdCategory,
      description: newProdDesc
    };

    setProducts([newProduct, ...products]);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdStock('');
    setNewProdDesc('');
    setProductMessage('🎉 New branch service added successfully!');
    setTimeout(() => setProductMessage(null), 3000);
  };

  // Counter Checkout Sale
  const [selectedProductForSale, setSelectedProductForSale] = useState<CustomProduct | null>(null);
  const [saleCustName, setSaleCustName] = useState('');
  const [saleCustMobile, setSaleCustMobile] = useState('');
  const [saleQty, setSaleQty] = useState(1);
  const [salePaymentMode, setSalePaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [saleSuccessInvoice, setSaleSuccessInvoice] = useState<Invoice | null>(null);

  const handleProcessSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForSale) return;

    const total = selectedProductForSale.price * saleQty;
    const invId = `INV-${Date.now().toString().substring(6)}`;
    const invoiceNumber = `RODP-BR-${currentShop.customId || 'BR'}-${Date.now().toString().substring(8)}`;

    const newInvoice: Invoice = {
      id: invId,
      invoiceNumber: invoiceNumber,
      customerId: `cust_${Date.now()}`,
      customerName: saleCustName || 'Counter Customer',
      customerMobile: saleCustMobile || '9593388785',
      items: [
        {
          id: selectedProductForSale.id,
          name: selectedProductForSale.name,
          quantity: saleQty,
          price: selectedProductForSale.price,
          gstRate: 0,
          discount: 0
        }
      ],
      subtotal: total,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: total,
      createdAt: new Date().toISOString().substring(0, 10),
      paymentMethod: salePaymentMode,
      paymentStatus: 'Paid',
      shopId: currentShop.id,
      generatedBy: branchHead || 'Branch Manager'
    };

    if (addInvoice) addInvoice(newInvoice);

    setProducts(products.map(p => {
      if (p.id === selectedProductForSale.id) {
        return { ...p, stock: Math.max(0, p.stock - saleQty) };
      }
      return p;
    }));

    if (playTechIndustryLoginSound) playTechIndustryLoginSound();

    setSaleSuccessInvoice(newInvoice);
    setSelectedProductForSale(null);
    setSaleCustName('');
    setSaleCustMobile('');
    setSaleQty(1);
  };

  // Proof Documents
  const [proofs, setProofs] = useState<BranchProof[]>(() => {
    const saved = localStorage.getItem(`rodp_branch_proofs_${currentShop.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(`rodp_branch_proofs_${currentShop.id}`, JSON.stringify(proofs));
  }, [proofs, currentShop.id]);

  const [proofTitle, setProofTitle] = useState('');
  const [proofCustName, setProofCustName] = useState('');
  const [proofCustMobile, setProofCustMobile] = useState('');
  const [proofServiceType, setProofServiceType] = useState('🆔 Aadhaar Service');
  const [proofImage, setProofImage] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofSuccessMsg, setProofSuccessMsg] = useState<string | null>(null);

  const handleProofImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofTitle || !proofCustName) return;

    const newProof: BranchProof = {
      id: `proof_${Date.now()}`,
      title: proofTitle,
      customerName: proofCustName,
      customerMobile: proofCustMobile || '9593388785',
      serviceType: proofServiceType,
      proofImageUrl: proofImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop',
      notes: proofNotes,
      createdAt: new Date().toLocaleDateString()
    };

    setProofs([newProof, ...proofs]);
    setProofTitle('');
    setProofCustName('');
    setProofCustMobile('');
    setProofImage('');
    setProofNotes('');
    setProofSuccessMsg('✅ Service proof document uploaded!');
    setTimeout(() => setProofSuccessMsg(null), 3000);
  };

  // Branch Appointment Creator
  const [aptCustName, setAptCustName] = useState('');
  const [aptCustMobile, setAptCustMobile] = useState('');
  const [aptServiceType, setAptServiceType] = useState('🆔 Aadhaar Services');
  const [aptDate, setAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [aptTimeSlot, setAptTimeSlot] = useState('11:00 AM - 11:30 AM');
  const [aptMsg, setAptMsg] = useState<string | null>(null);

  const handleCreateBranchAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptCustName || !aptCustMobile) return;

    const tokenNum = `ROD-BR-${Math.floor(100000 + Math.random() * 900000)}`;
    const newApt: Appointment = {
      id: `apt_br_${Date.now()}`,
      tokenNumber: tokenNum,
      name: aptCustName,
      mobileNumber: aptCustMobile,
      serviceType: aptServiceType,
      date: aptDate,
      timeSlot: aptTimeSlot,
      status: 'Pending',
      centerId: currentShop.id,
      shopId: currentShop.id,
      createdAt: new Date().toISOString(),
      price: 150
    };

    if (addAppointment) addAppointment(newApt);

    setAptCustName('');
    setAptCustMobile('');
    setAptMsg(`✅ Appointment booked! Token: ${tokenNum}`);
    setTimeout(() => setAptMsg(null), 4000);
    setIsQuickAptOpen(false);
  };

  // Branch Customer Creator
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [custMsg, setCustMsg] = useState<string | null>(null);

  const handleCreateBranchCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustMobile) return;

    const newCust: CustomerCRM = {
      id: `cust_${Date.now()}`,
      name: newCustName,
      mobile: newCustMobile,
      address: newCustAddress || fullAddress || currentShop.address,
      shopId: currentShop.id,
      createdAt: new Date().toISOString(),
      totalSpending: 0
    };

    if (addCustomer) addCustomer(newCust);

    setNewCustName('');
    setNewCustMobile('');
    setNewCustAddress('');
    setCustMsg('🎉 Customer profile created!');
    setTimeout(() => setCustMsg(null), 3000);
  };

  // Strictly Filtered Branch Records for Current Branch
  const branchInvoices = invoices.filter(i => i.shopId === currentShop.id || i.shopId === currentShop.customId);
  const branchAppointments = appointments.filter(a => a.centerId === currentShop.id || a.centerId === currentShop.customId || a.shopId === currentShop.id || a.shopId === currentShop.customId);
  const branchCustomers = customers.filter(c => c.shopId === currentShop.id || c.shopId === currentShop.customId || c.branchId === currentShop.id);

  // Live Real-Time Analytics Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const todayAppointmentsCount = branchAppointments.filter(a => a.date === todayStr).length;
  const pendingAppointmentsCount = branchAppointments.filter(a => a.status === 'Pending' || a.status === 'In Progress').length;
  const completedAppointmentsCount = branchAppointments.filter(a => a.status === 'Completed').length;

  const todayInvoices = branchInvoices.filter(i => (i.createdAt || '').startsWith(todayStr));
  const todayCollection = todayInvoices.reduce((sum, inv) => sum + (inv.paymentStatus === 'Paid' ? inv.totalAmount : (inv.amountPaid || 0)), 0);

  const monthInvoices = branchInvoices.filter(i => (i.createdAt || '').startsWith(currentMonthStr));
  const monthlyCollection = monthInvoices.reduce((sum, inv) => sum + (inv.paymentStatus === 'Paid' ? inv.totalAmount : (inv.amountPaid || 0)), 0);

  const pendingBillsCount = branchInvoices.filter(i => i.paymentStatus !== 'Paid' && (i.remainingBalance ? i.remainingBalance > 0 : true)).length;
  const totalBillsCount = branchInvoices.length;

  // Customer Satisfaction Score
  const satisfactionScore = completedAppointmentsCount > 0 || branchInvoices.length > 0 
    ? Math.min(100, Math.max(92, 95 + Math.round((completedAppointmentsCount / (branchAppointments.length || 1)) * 5))) 
    : 98.5;

  // Smart Calendar State
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  // AI Holiday Assistant Command State
  const [aiHolidayPrompt, setAiHolidayPrompt] = useState('');
  const [aiHolidayMessage, setAiHolidayMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // AI Holiday Assistant Command Parser & Executor
  const handleAIHolidayCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiHolidayPrompt.trim()) return;

    const q = aiHolidayPrompt.toLowerCase().trim();
    let targetDate = todayStr;
    const now = new Date();

    if (q.includes('tomorrow') || q.includes('আগামীকাল')) {
      const tom = new Date(now);
      tom.setDate(tom.getDate() + 1);
      targetDate = tom.toISOString().split('T')[0];
    } else if (q.includes('today') || q.includes('আজ')) {
      targetDate = todayStr;
    } else {
      // Search for YYYY-MM-DD or DD-MM-YYYY or date numbers in prompt
      const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/;
      const match = q.match(dateRegex);
      if (match) {
        targetDate = match[0];
      }
    }

    const isCloseCommand = q.includes('close') || q.includes('closed') || q.includes('holiday') || q.includes('বন্ধ') || q.includes('ছুটি');
    const isOpenCommand = q.includes('open') || q.includes('reopen') || q.includes('খুলুন') || q.includes('চালু');

    const currentClosedDates: string[] = currentShop.closedDates || [];
    const currentLogs = currentShop.aiHolidayLogs || [];

    if (isCloseCommand) {
      if (!currentClosedDates.includes(targetDate)) {
        const nextClosed = [...currentClosedDates, targetDate];
        const newLog = {
          date: targetDate,
          action: 'closed' as const,
          reason: `AI Command: "${aiHolidayPrompt}"`,
          timestamp: new Date().toLocaleString()
        };
        updateShop(currentShop.id, {
          closedDates: nextClosed,
          aiHolidayLogs: [newLog, ...currentLogs]
        });
        setAiHolidayMessage({
          text: `🤖 AI Action Executed: ${currentShop.name} successfully marked CLOSED on ${targetDate}. New appointments blocked.`,
          type: 'success'
        });
      } else {
        setAiHolidayMessage({
          text: `⚠️ Branch is already marked closed on ${targetDate}.`,
          type: 'error'
        });
      }
    } else if (isOpenCommand) {
      const nextClosed = currentClosedDates.filter(d => d !== targetDate);
      const newLog = {
        date: targetDate,
        action: 'opened' as const,
        reason: `AI Command: "${aiHolidayPrompt}"`,
        timestamp: new Date().toLocaleString()
      };
      updateShop(currentShop.id, {
        closedDates: nextClosed,
        aiHolidayLogs: [newLog, ...currentLogs]
      });
      setAiHolidayMessage({
        text: `🤖 AI Action Executed: ${currentShop.name} REOPENED on ${targetDate}. Appointment slot booking restored.`,
        type: 'success'
      });
    } else {
      setAiHolidayMessage({
        text: `💡 AI Assistant Hint: Please say "Today declare holiday", "Tomorrow keep branch closed", or "Reopen branch on YYYY-MM-DD".`,
        type: 'error'
      });
    }

    setAiHolidayPrompt('');
  };

  // Toggle Single Closed Date Manually
  const handleToggleClosedDate = (dateStr: string) => {
    const currentClosed: string[] = currentShop.closedDates || [];
    const currentLogs = currentShop.aiHolidayLogs || [];
    let nextClosed: string[];
    let action: 'closed' | 'opened';

    if (currentClosed.includes(dateStr)) {
      nextClosed = currentClosed.filter(d => d !== dateStr);
      action = 'opened';
    } else {
      nextClosed = [...currentClosed, dateStr];
      action = 'closed';
    }

    const newLog = {
      date: dateStr,
      action: action,
      reason: isSuperAdmin ? 'CEO Manual Override' : 'Branch Manager Manual Toggle',
      timestamp: new Date().toLocaleString()
    };

    updateShop(currentShop.id, {
      closedDates: nextClosed,
      aiHolidayLogs: [newLog, ...currentLogs]
    });
  };

  // Selected Invoice Modal for Receipt View
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState<Invoice | null>(null);
  const [selectedProofModal, setSelectedProofModal] = useState<BranchProof | null>(null);

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold max-w-7xl mx-auto pb-12">
      
      {/* Hidden File Inputs */}
      <input type="file" ref={managerFileInputRef} onChange={handleManagerPhotoUpload} accept="image/*" className="hidden" />
      <input type="file" ref={branchFileInputRef} onChange={handleBranchPhotoUpload} accept="image/*" className="hidden" />
      <input type="file" ref={proofFileInputRef} onChange={handleProofImageUpload} accept="image/*" className="hidden" />

      {/* CEO / SUPER ADMIN BRANCH SELECTOR BAR */}
      {isSuperAdmin && (
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Building size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-black uppercase tracking-wider">
                  CEO Control Center
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {shops.length} Active Branches
                </span>
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mt-0.5">
                Switch Branch Terminal Dashboard
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 whitespace-nowrap">
              Select Branch:
            </span>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="py-2 px-4 rounded-2xl bg-slate-950 text-amber-300 border border-amber-500/40 font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner min-w-[240px]"
            >
              {shops.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (ID: {s.customId || s.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TOP BRANCH PROFILE CARD (REQUIREMENT 2 & 3) */}
      <div 
        onClick={() => setActiveSubTab('profile')}
        className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-[#0a0a0f] border-indigo-500/20' : 'bg-white border-slate-200'} relative overflow-hidden shadow-2xl cursor-pointer group transition-all duration-300 hover:border-amber-500/50`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 text-left">
          
          {/* Left Branch & Manager Info */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-slate-950 border-2 border-amber-500/40 overflow-hidden shrink-0 shadow-xl flex items-center justify-center">
              {currentShop.branchPhoto || currentShop.managerPhoto ? (
                <img 
                  src={currentShop.branchPhoto || currentShop.managerPhoto} 
                  alt={currentShop.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Store size={36} className="text-amber-400" />
              )}
              <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-black uppercase tracking-wider">
                  Official Branch Terminal
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-black">
                  CODE: {currentShop.customId || currentShop.id}
                </span>
                {currentShop.weeklyHoliday && (
                  <span className="text-[9px] text-rose-300 font-mono bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md font-bold">
                    Holiday: {currentShop.weeklyHoliday}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                {currentShop.name}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] opacity-80 font-mono">
                <span className="flex items-center gap-1">
                  <User size={12} className="text-amber-400" />
                  <strong className="text-white">{currentShop.branchHead || currentShop.ownerName || 'Branch Manager'}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={12} className="text-emerald-400" />
                  <span>{currentShop.mobile || '9593388785'}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin size={12} className="text-rose-400" />
                  <span>{currentShop.address}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Completion Score Meter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-white/10 shrink-0 min-w-[280px]">
            <div className="space-y-1 flex-1">
              <div className="flex justify-between items-center font-mono text-[10px]">
                <span className="text-slate-400 font-bold uppercase">Profile Dossier</span>
                <strong className="text-amber-400 font-black">{profileCompletionPct}% Completed</strong>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${profileCompletionPct}%` }}
                />
              </div>
              <p className="text-[9.5px] text-slate-400 pt-0.5">
                {profileCompletionPct < 100 ? "Click to complete remaining profile details" : "✓ Branch Profile 100% Fully Completed"}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSubTab('profile');
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <Edit size={14} />
              <span>Edit Dossier</span>
            </button>
          </div>

        </div>

        {/* Sub-Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 border-t border-slate-500/10 mt-6 scrollbar-none">
          {[
            { id: 'overview', label: '📊 Dashboard Overview', icon: LayoutDashboard },
            { id: 'connect_branch', label: '💬 Connect Branch / ব্রাঞ্চ কানেক্ট (CEO Live)', icon: MessageSquare, isPrimaryAction: true },
            { id: 'profile', label: '👤 Branch Profile & Dossier', icon: User },
            { id: 'calendar', label: '📅 Smart Calendar & AI Holidays', icon: Calendar },
            { id: 'services', label: '🛍️ Services & Products', icon: Layers },
            { id: 'appointments', label: '📋 Appointments Queue', icon: Calendar },
            { id: 'billing', label: '🧾 POS & Bill History', icon: FileText },
            { id: 'verify_bills_docs', label: '🛡️ Verify Bills & Docs / ভেরিফাই বিল', icon: ShieldCheck },
            { id: 'customers', label: '👥 Customers CRM', icon: Users },
            { id: 'inquiries', label: '✉️ Email Inquiries', icon: Mail },
            { id: 'analytics', label: '📈 Financial Analytics', icon: BarChart3 },
            { id: 'proofs', label: '📁 Proof Documents', icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tab.id === 'connect_branch' && setCurrentTab) {
                    setCurrentTab('connect_branch');
                    return;
                  }
                  setActiveSubTab(tab.id as any);
                }}
                className={`px-4 py-2.5 rounded-2xl font-black text-[10.5px] whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  (tab as any).isPrimaryAction
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95'
                    : isActive 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-extrabold' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* OFFICIAL CEO WARNING BANNER (Requirement: Warning with dismiss '×' button) */}
      {currentShop.warningMessage && !currentShop.warningDismissed && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-yellow-950/90 via-amber-950/80 to-slate-900 border-2 border-yellow-500/70 text-white shadow-2xl flex items-start justify-between gap-4 animate-bounce-subtle text-left">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 flex items-center justify-center shrink-0 shadow-inner">
              <AlertTriangle size={22} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-500 text-slate-950 text-[9px] font-mono font-black uppercase">
                  ⚠️ OFFICIAL CEO WARNING / প্রধান কার্যালয়ের সতর্কবার্তা
                </span>
                {currentShop.warningSentAt && (
                  <span className="text-[10px] text-yellow-200/80 font-mono">
                    {new Date(currentShop.warningSentAt).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-yellow-100 leading-relaxed">
                {currentShop.warningMessage}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateShop(currentShop.id, { warningDismissed: true })}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-yellow-500 hover:text-slate-950 text-white transition-all cursor-pointer shrink-0"
            title="Dismiss Warning (বন্ধ করুন)"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* SUSPENDED STATUS BLOCKING BANNER */}
      {!isSuperAdmin && currentShop.status === 'suspended' && (
        <div className="p-6 rounded-3xl bg-rose-950/95 border-2 border-rose-500 text-white shadow-2xl space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Lock size={24} className="animate-bounce" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-mono font-black uppercase">
                🚫 BRANCH SUSPENDED BY CEO
              </span>
              <h3 className="text-base sm:text-lg font-black text-rose-100 mt-1">
                আপনার ব্রাঞ্চটি সাময়িকভাবে সাসপেন্ড করা হয়েছে!
              </h3>
            </div>
          </div>
          <p className="text-xs text-rose-200 leading-relaxed font-semibold">
            আইডি, পাসওয়ার্ড ও সকল ডিজিটাল কার্যক্রম সাময়িকভাবে লক রয়েছে। অনুগ্রহ করে অবিলম্বে মেইন ব্রাঞ্চ (CEO Panel)-এর সঙ্গে যোগাযোগ করুন।
          </p>
        </div>
      )}

      {/* ON HOLD STATUS BLOCKING BANNER */}
      {!isSuperAdmin && currentShop.status === 'hold' && (
        <div className="p-6 rounded-3xl bg-amber-950/95 border-2 border-amber-500 text-white shadow-2xl space-y-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-mono font-black uppercase">
                ⏳ BRANCH CURRENTLY ON HOLD
              </span>
              <h3 className="text-base sm:text-lg font-black text-amber-100 mt-1">
                আপনার ব্রাঞ্চ সাময়িকভাবে হোল্ডে রাখা হয়েছে
              </h3>
            </div>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1 text-xs">
            <p className="text-amber-200 font-bold">
              সিইও বার্তা: "{currentShop.holdReason || 'সাময়িক স্থগিতাদেশ ও সার্ভার রক্ষণাবেক্ষণ'}"
            </p>
            {currentShop.holdUntil && (
              <p className="text-[11px] text-amber-300/80 font-mono">
                হোল্ড মেয়াদ শেষ হবে: {new Date(currentShop.holdUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(currentShop.holdUntil).toLocaleDateString()})
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 1: OVERVIEW & DASHBOARD ANALYTICS + QUICK ACTIONS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          
          {/* DASHBOARD ANALYTICS CARDS (REQUIREMENT 4) */}
          <div className="space-y-3 text-left">
            <h3 className="text-xs font-black uppercase font-mono tracking-widest text-slate-400 flex items-center gap-2">
              <Activity size={16} className="text-amber-400" />
              <span>Real-Time Branch Live Metrics</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              
              {/* Today's Appointments - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('appointments');
                  setBranchAptFilter('All');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/60 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-amber-300">Today's Apt ➔</span>
                  <Calendar size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{todayAppointmentsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Scheduled today</span>
                  <span className="text-amber-400 text-[8.5px] font-black uppercase">Open ➔</span>
                </div>
              </button>

              {/* Pending Appointments - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('appointments');
                  setBranchAptFilter('Pending');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-amber-500/30 space-y-2 shadow-xl hover:border-amber-500 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-amber-400">Pending Apt ➔</span>
                  <Clock size={16} className="text-amber-400 animate-spin" />
                </div>
                <div className="text-2xl font-black text-amber-400">{pendingAppointmentsCount}</div>
                <div className="text-[9.5px] text-amber-400/80 font-mono flex items-center justify-between">
                  <span>Awaiting verification</span>
                  <span className="text-amber-300 text-[8.5px] font-black uppercase">Review ➔</span>
                </div>
              </button>

              {/* Completed Appointments - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('appointments');
                  setBranchAptFilter('Completed');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-emerald-500/60 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-400">Completed Apt ➔</span>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{completedAppointmentsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Successfully served</span>
                  <span className="text-emerald-400 text-[8.5px] font-black uppercase">History ➔</span>
                </div>
              </button>

              {/* Total Customers - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('customers');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-indigo-500/60 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-indigo-400">Total Customers ➔</span>
                  <Users size={16} className="text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-indigo-300">{branchCustomers.length}</div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Registered at branch</span>
                  <span className="text-indigo-400 text-[8.5px] font-black uppercase">CRM ➔</span>
                </div>
              </button>

              {/* Today's Collection - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('billing');
                  setBranchBillFilter('Today');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-emerald-500/60 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-400">Today's Revenue ➔</span>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">₹{todayCollection.toLocaleString('en-IN')}</div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Daily collection</span>
                  <span className="text-emerald-400 text-[8.5px] font-black uppercase">POS ➔</span>
                </div>
              </button>

              {/* Monthly Collection - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('analytics');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/60 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-amber-400">Monthly Revenue ➔</span>
                  <TrendingUp size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">₹{monthlyCollection.toLocaleString('en-IN')}</div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Current month total</span>
                  <span className="text-amber-400 text-[8.5px] font-black uppercase">Stats ➔</span>
                </div>
              </button>

              {/* Pending Bills - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('billing');
                  setBranchBillFilter('Pending');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-rose-500/60 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-rose-400">Pending Bills ➔</span>
                  <AlertTriangle size={16} className="text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400">{pendingBillsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Unpaid bills</span>
                  <span className="text-rose-400 text-[8.5px] font-black uppercase">Collect ➔</span>
                </div>
              </button>

              {/* Total Bills - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('billing');
                  setBranchBillFilter('All');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-white/40 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-300">Total Invoices ➔</span>
                  <FileText size={16} className="text-slate-300" />
                </div>
                <div className="text-2xl font-black text-white">{totalBillsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>All bill slips</span>
                  <span className="text-slate-300 text-[8.5px] font-black uppercase">View ➔</span>
                </div>
              </button>

              {/* Customer Satisfaction - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('analytics');
                }}
                className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-400/60 hover:bg-slate-900/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none sm:col-span-2 lg:col-span-2"
              >
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-amber-300">Customer Satisfaction Index ➔</span>
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black text-amber-300">{satisfactionScore}%</div>
                  <div className="text-xs text-amber-400 font-mono font-bold">★★★★★ (4.9 / 5.0)</div>
                </div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Future Ready AI Sentiment</span>
                  <span className="text-amber-400 text-[8.5px] font-black uppercase">Analytics ➔</span>
                </div>
              </button>

              {/* Online Bills & Docs Verification - Clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('verify_bills_docs');
                }}
                className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 space-y-2 shadow-xl hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-left focus:outline-none sm:col-span-2 lg:col-span-1"
              >
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="text-[9px] font-mono uppercase font-bold text-emerald-300">Verify Bills & Docs ➔</span>
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-300">
                  {onlinePayments.filter(p => p.status === 'Pending').length} Pending
                </div>
                <div className="text-[9.5px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Verify online payments & proof</span>
                  <span className="text-emerald-400 text-[8.5px] font-black uppercase">Open ➔</span>
                </div>
              </button>

            </div>
          </div>

          {/* QUICK ACTIONS SECTION (REQUIREMENT 5) */}
          <div className="space-y-3 text-left pt-2">
            <h3 className="text-xs font-black uppercase font-mono tracking-widest text-slate-400 flex items-center gap-2">
              <Grid size={16} className="text-amber-400" />
              <span>Branch Terminal Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { id: 'create_bill', label: 'Create Bill', icon: Plus, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', action: () => setIsQuickBillOpen(true) },
                { id: 'new_apt', label: 'New Appointment', icon: Calendar, color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', action: () => setIsQuickAptOpen(true) },
                { id: 'cust_list', label: 'Customer List', icon: Users, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', action: () => setActiveSubTab('customers') },
                { id: 'bill_hist', label: 'Bill History', icon: FileText, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', action: () => setActiveSubTab('billing') },
                { id: 'apt_hist', label: 'Appointment History', icon: Clock, color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', action: () => setActiveSubTab('appointments') },
                { id: 'srv_list', label: 'Service List', icon: Layers, color: 'bg-teal-500/10 text-teal-400 border-teal-500/30', action: () => setActiveSubTab('services') },
                { id: 'reports', label: 'Reports', icon: BarChart3, color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', action: () => setActiveSubTab('analytics') },
                { id: 'notifs', label: 'Notifications', icon: Sparkles, color: 'bg-amber-400/10 text-amber-300 border-amber-400/30', action: () => setIsNotificationsOpen(true) },
              ].map((qa) => (
                <button
                  key={qa.id}
                  onClick={qa.action}
                  className={`p-4 rounded-2xl border ${qa.color} flex flex-col items-center justify-center text-center space-y-2 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg`}
                >
                  <qa.icon size={22} />
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* QUICK PREVIEW CALENDAR & AI HOLIDAY MANAGER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left pt-2">
            
            {/* Left: Smart Calendar Preview Widget */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-xs font-black text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <Calendar size={16} className="text-amber-400" />
                  <span>Branch Calendar Schedule ({currentShop.name})</span>
                </h3>
                <button
                  onClick={() => setActiveSubTab('calendar')}
                  className="text-[10px] text-amber-400 hover:underline font-mono font-bold uppercase"
                >
                  Open Full Smart Calendar →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="p-2 text-slate-500 font-black uppercase">{d}</div>
                ))}

                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `${currentMonthStr}-${dayNum.toString().padStart(2, '0')}`;
                  const isClosed = (currentShop.closedDates || []).includes(dateStr);
                  const hasApt = branchAppointments.some(a => a.date === dateStr);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => handleToggleClosedDate(dateStr)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                        isClosed 
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-black'
                          : hasApt 
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs">{dayNum}</span>
                      {isClosed && (
                        <span className="block text-[8px] text-rose-400 font-mono uppercase font-black">Closed</span>
                      )}
                      {!isClosed && hasApt && (
                        <span className="block text-[8px] text-amber-400 font-mono uppercase font-bold">Booked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: AI Holiday Assistant Command Card */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-amber-500/20 space-y-4 shadow-xl">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider">
                  AI Holiday Manager Assistant
                </span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Bot size={18} className="text-amber-400" />
                  <span>Natural Language Holiday Command</span>
                </h3>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                Type commands like <strong className="text-amber-300">"Today declare holiday"</strong> or <strong className="text-amber-300">"Tomorrow keep branch closed"</strong>.
              </p>

              {aiHolidayMessage && (
                <div className={`p-3 rounded-xl border text-[10.5px] font-mono font-bold ${
                  aiHolidayMessage.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}>
                  {aiHolidayMessage.text}
                </div>
              )}

              <form onSubmit={handleAIHolidayCommand} className="space-y-3">
                <input
                  type="text"
                  placeholder='e.g. "Today declare holiday" or "Tomorrow keep branch closed"'
                  value={aiHolidayPrompt}
                  onChange={(e) => setAiHolidayPrompt(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-white/10 focus:border-amber-400 text-xs text-white font-mono focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>Execute AI Holiday Command</span>
                </button>
              </form>

              {/* Recent AI Holiday Logs */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[9px] uppercase font-mono font-black text-slate-500 block">
                  Recent AI Holiday History ({currentShop.aiHolidayLogs?.length || 0})
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {(currentShop.aiHolidayLogs || []).slice(0, 5).map((log, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950 text-[9.5px] font-mono border border-white/5 flex justify-between items-center">
                      <span className={log.action === 'closed' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {log.action === 'closed' ? '🔴 Closed' : '🟢 Opened'}: {log.date}
                      </span>
                      <span className="text-slate-500 text-[8.5px]">{log.timestamp}</span>
                    </div>
                  ))}
                  {(!currentShop.aiHolidayLogs || currentShop.aiHolidayLogs.length === 0) && (
                    <div className="text-[10px] text-slate-500 italic">No AI holiday declarations logged yet.</div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: BRANCH PROFILE & FULL DOSSIER PAGE (REQUIREMENT 3) */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6 text-left">
          
          {/* Head Office Reference Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] flex items-center gap-3">
            <Building size={20} className="shrink-0 text-amber-400" />
            <div>
              <strong className="block font-black text-white uppercase">Fixed Reference - Head Office Credentials:</strong>
              <span>{HEAD_OFFICE_REF.name} • Address: {HEAD_OFFICE_REF.address}, PIN: {HEAD_OFFICE_REF.pinCode} • Contact: {HEAD_OFFICE_REF.contact}</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* SECTION 1: VISUAL BRANDING & PHOTOS */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-5 shadow-xl">
              <h3 className="text-sm font-black uppercase text-amber-400 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                <Camera size={16} />
                <span>1. Branch Visual Photos & Manager Logo</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Manager Avatar */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Branch Manager / Head Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-amber-500/30 overflow-hidden flex items-center justify-center shrink-0">
                      {managerPhoto ? (
                        <img src={managerPhoto} alt="Manager" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={32} className="text-slate-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => managerFileInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Upload Manager Photo
                    </button>
                  </div>
                </div>

                {/* Shop Photo */}
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-400">Physical Shop Front Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-amber-500/30 overflow-hidden flex items-center justify-center shrink-0">
                      {branchPhoto ? (
                        <img src={branchPhoto} alt="Shop Front" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Store size={32} className="text-slate-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => branchFileInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Upload Shop Photo
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION 2: BRANCH CORE IDENTIFICATION */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-5 shadow-xl">
              <h3 className="text-sm font-black uppercase text-amber-400 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                <Store size={16} />
                <span>2. Core Branch Information & Manager Dossier</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Branch Code / ID</label>
                  <input
                    type="text"
                    required
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Branch Head / Manager Name</label>
                  <input
                    type="text"
                    required
                    value={branchHead}
                    onChange={(e) => setBranchHead(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Primary Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={managerMobile}
                    onChange={(e) => setManagerMobile(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Alternate Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9800000000"
                    value={alternateMobile}
                    onChange={(e) => setAlternateMobile(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Official Email Address</label>
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: ADDRESS & GOOGLE MAP LOCATION */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-5 shadow-xl">
              <h3 className="text-sm font-black uppercase text-amber-400 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                <MapPin size={16} />
                <span>3. Physical Address & Google Map Location</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Full Physical Address</label>
                  <input
                    type="text"
                    required
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">PIN Code</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Google Map Location Link / URL (Future Ready)</label>
                  <input
                    type="url"
                    placeholder="e.g. https://maps.google.com/?q=..."
                    value={googleMapUrl}
                    onChange={(e) => setGoogleMapUrl(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: OPERATING SCHEDULE & HOLIDAYS */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-5 shadow-xl">
              <h3 className="text-sm font-black uppercase text-amber-400 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                <Clock size={16} />
                <span>4. Business Timings & Weekly Holiday</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Business Timing</label>
                  <input
                    type="text"
                    value={businessTiming}
                    onChange={(e) => setBusinessTiming(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Weekly Holiday</label>
                  <select
                    value={weeklyHoliday}
                    onChange={(e) => setWeeklyHoliday(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="None">None (Open 7 Days)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">GST Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 19AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: BANKING & UPI DETAILS */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-5 shadow-xl">
              <h3 className="text-sm font-black uppercase text-amber-400 font-mono flex items-center gap-2 border-b border-white/5 pb-2">
                <CreditCard size={16} />
                <span>5. Bank Account & UPI Collection Setup</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Account Number</label>
                  <input
                    type="text"
                    placeholder="Account No."
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">UPI ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 9593388785@ybl"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            {saveStatus && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold text-center">
                {saveStatus}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl cursor-pointer"
            >
              Save & Synchronize Branch Profile
            </button>

          </form>

        </div>
      )}

      {/* SUB-TAB 3: SMART CALENDAR & AI HOLIDAY MANAGER FULL VIEW (REQUIREMENT 6, 7, 8, 10) */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6 text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Calendar Grid */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase font-mono tracking-wider">
                    Smart Calendar - {currentShop.name}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-300 font-bold">
                    {calendarMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Legend Badges */}
              <div className="flex flex-wrap gap-4 text-[10px] font-mono border-b border-white/5 pb-3">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Open Date</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Booked Appointments</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Closed / AI Holiday</span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center font-mono">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="p-2 text-slate-500 font-black uppercase text-[10px]">{d}</div>
                ))}

                {Array.from({ length: 31 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `${currentMonthStr}-${dayNum.toString().padStart(2, '0')}`;
                  const isClosed = (currentShop.closedDates || []).includes(dateStr);
                  const dayApts = branchAppointments.filter(a => a.date === dateStr);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => handleToggleClosedDate(dateStr)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer space-y-1 ${
                        isClosed 
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-black'
                          : dayApts.length > 0 
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <span className="text-sm font-bold block">{dayNum}</span>
                      {isClosed ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-[8px] font-mono uppercase font-black block">CLOSED</span>
                      ) : dayApts.length > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-[8px] font-mono uppercase font-black block">{dayApts.length} Apt</span>
                      ) : (
                        <span className="text-[8px] text-slate-500 block">Open</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Assistant & Logs */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-amber-500/30 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider">
                    AI Holiday Assistant
                  </span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Bot size={18} className="text-amber-400" />
                    <span>Holiday Command Panel</span>
                  </h3>
                </div>

                {aiHolidayMessage && (
                  <div className={`p-3 rounded-xl border text-[10.5px] font-mono font-bold ${
                    aiHolidayMessage.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}>
                    {aiHolidayMessage.text}
                  </div>
                )}

                <form onSubmit={handleAIHolidayCommand} className="space-y-3">
                  <input
                    type="text"
                    placeholder='e.g. "Today declare holiday"'
                    value={aiHolidayPrompt}
                    onChange={(e) => setAiHolidayPrompt(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-white/10 focus:border-amber-400 text-xs text-white font-mono focus:outline-none"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} />
                    <span>Process AI Command</span>
                  </button>
                </form>
              </div>

              {/* CEO AI Holiday History Log */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3 shadow-xl">
                <h4 className="text-xs font-black uppercase font-mono text-slate-400 flex items-center gap-2">
                  <Clock size={14} className="text-amber-400" />
                  <span>AI Holiday History & Audit Log</span>
                </h4>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {(currentShop.aiHolidayLogs || []).map((log, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 font-mono text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className={log.action === 'closed' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {log.action === 'closed' ? '🔴 Declared Closed' : '🟢 Reopened'}: {log.date}
                        </span>
                        <span className="text-slate-500 text-[8.5px]">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-400 text-[9.5px]">{log.reason}</p>
                    </div>
                  ))}
                  {(!currentShop.aiHolidayLogs || currentShop.aiHolidayLogs.length === 0) && (
                    <div className="text-xs text-slate-500 italic">No holiday actions logged yet.</div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 4: SERVICES & PRODUCTS */}
      {activeSubTab === 'services' && (
        <div className="space-y-6 text-left">
          {/* TOP SECTION: EXPLORE CHAT & LIVE MESSENGER (Requirement: Explore Chat in Service section) */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold uppercase">
                    Branch Messenger Console
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <MessageSquare size={17} className="text-emerald-400" />
                  <span>এক্সপ্লোর চ্যাট • কাস্টমারদের লাইভ মেসেজ (Explore Customer Chats)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  আপনার ব্রাঞ্চে কাস্টমারদের পাঠানো মেসেজ দেখুন ও সরাসরি হোয়াটসঅ্যাপের মতো উত্তর দিন।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExploreChatOpen(!isExploreChatOpen)}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shrink-0 ${
                  isExploreChatOpen
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <MessageSquare size={15} />
                <span>{isExploreChatOpen ? 'চ্যাট বন্ধ করুন' : '💬 এক্সপ্লোর চ্যাট খুলুন'}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 text-[10px] font-mono font-bold">
                  {branchChats.filter(m => m.branchId === currentShop.id).length}
                </span>
              </button>
            </div>

            {/* EXPANDED CHAT CONSOLE */}
            {isExploreChatOpen && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                {(() => {
                  const branchMsgs = branchChats.filter(m => m.branchId === currentShop.id);
                  if (branchMsgs.length === 0) {
                    return (
                      <div className="py-8 text-center bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                        <MessageSquare size={28} className="mx-auto text-slate-600 animate-bounce" />
                        <p className="text-xs text-slate-400 font-bold">এই ব্রাঞ্চে এখনো কোনো কাস্টমার মেসেজ পাঠাননি।</p>
                        <p className="text-[11px] text-slate-500">কাস্টমার পোর্টাল থেকে কানেক্ট ব্রাঞ্চ করলে এখানে তৎক্ষণাৎ মেসেজ আসবে।</p>
                      </div>
                    );
                  }

                  // Group by customer mobile or senderId
                  const custMap = new Map<string, typeof branchMsgs>();
                  branchMsgs.forEach(m => {
                    const key = m.senderMobile || m.senderId || 'unknown';
                    if (!custMap.has(key)) custMap.set(key, []);
                    custMap.get(key)!.push(m);
                  });

                  const activeCustKey = activeChatCustomerId || Array.from(custMap.keys())[0];
                  const activeCustMsgs = custMap.get(activeCustKey) || [];
                  const activeCustInfo = activeCustMsgs.find(m => m.senderRole === 'customer') || activeCustMsgs[0];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer Thread List */}
                      <div className="space-y-2 max-h-[350px] overflow-y-auto">
                        <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">
                          কাস্টমার ইনবক্স ({custMap.size})
                        </span>
                        {Array.from(custMap.entries()).map(([key, msgs]) => {
                          const isSel = key === activeCustKey;
                          const lastM = msgs[msgs.length - 1];
                          const cust = msgs.find(m => m.senderRole === 'customer') || msgs[0];

                          return (
                            <div
                              key={key}
                              onClick={() => setActiveChatCustomerId(key)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                                isSel ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-950/80 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-bold text-white truncate">{cust?.senderName || 'Citizen'}</h4>
                                <span className="text-[8px] text-slate-500 font-mono">
                                  {new Date(lastM.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[10px] text-amber-400 font-mono">{cust?.senderMobile}</p>
                              <p className="text-[10.5px] text-slate-300 truncate mt-0.5">{lastM.message}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Chat Messages and Reply window */}
                      <div className="md:col-span-2 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between overflow-hidden min-h-[350px]">
                        <div className="p-3 bg-slate-900 border-b border-white/10 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white">{activeCustInfo?.senderName || 'Customer'}</h4>
                            <span className="text-[9px] text-amber-400 font-mono">{activeCustInfo?.senderMobile}</span>
                          </div>
                          <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                            Live Chat
                          </span>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[240px]">
                          {activeCustMsgs.map(m => {
                            const isManager = m.senderRole === 'branch_manager' || m.senderRole === 'ceo' || m.senderRole === 'super_admin';
                            return (
                              <div key={m.id} className={`flex ${isManager ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2.5 rounded-xl text-xs space-y-0.5 ${
                                  isManager ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/10'
                                }`}>
                                  <div className="flex items-center justify-between gap-2 text-[8px] opacity-75 font-mono">
                                    <span>{isManager ? 'You (Manager)' : m.senderName}</span>
                                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-xs">{m.message}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Reply Input */}
                        <div className="p-2.5 bg-slate-900 border-t border-white/10 flex items-center gap-2">
                          <input
                            type="text"
                            value={branchReplyText}
                            onChange={(e) => setBranchReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (!branchReplyText.trim() || !activeCustInfo) return;
                                const reply = {
                                  id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                  branchId: currentShop.id,
                                  branchName: currentShop.name,
                                  senderId: currentUser?.id || 'mgr_1',
                                  senderName: `${currentUser?.name || 'Branch Manager'}`,
                                  senderMobile: currentUser?.mobile || (currentShop as any).managerMobile || (currentShop as any).contact || '9593388785',
                                  senderRole: 'branch_manager',
                                  message: branchReplyText.trim(),
                                  timestamp: new Date().toISOString(),
                                  read: true
                                };
                                if (addBranchChatMessage) {
                                  addBranchChatMessage(reply);
                                }
                                setBranchReplyText('');
                              }
                            }}
                            placeholder="কাস্টমারকে উত্তর পাঠান... (Type reply)"
                            className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!branchReplyText.trim() || !activeCustInfo) return;
                              const reply = {
                                id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                                branchId: currentShop.id,
                                branchName: currentShop.name,
                                senderId: currentUser?.id || 'mgr_1',
                                senderName: `${currentUser?.name || 'Branch Manager'}`,
                                senderMobile: currentUser?.mobile || (currentShop as any).managerMobile || (currentShop as any).contact || '9593388785',
                                senderRole: 'branch_manager',
                                message: branchReplyText.trim(),
                                timestamp: new Date().toISOString(),
                                read: true
                              };
                              if (addBranchChatMessage) {
                                addBranchChatMessage(reply);
                              }
                              setBranchReplyText('');
                            }}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <Send size={13} />
                            <span>পাঠান</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* CENTRAL FIREBASE SERVICE CATALOG & BRANCH OVERRIDE ENGINE (Requirements 8, 9, 10, 11, 12, 13, 14) */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6 shadow-2xl">
            {/* Header with Search and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-black uppercase">
                    Firebase Live Central Catalog
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Auto-Sync Active</span>
                </div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Layers size={18} className="text-amber-400" />
                  <span>সার্ভিস ক্যাটালগ ও ব্রাঞ্চ প্রাইস ম্যানেজমেন্ট (Service Catalog & Overrides)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  সিইও প্যানেলের কেন্দ্রীয় সার্ভিস তালিকা লাইভ সিঙ্ক হচ্ছে। আপনার ব্রাঞ্চের জন্য নিজস্ব মূল্য নির্ধারণ বা নতুন সার্ভিস যোগ করতে পারবেন।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddBranchSvcModal(!showAddBranchSvcModal)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus size={14} />
                  <span>+ নিজস্ব সার্ভিস যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/5">
                {[
                  { id: 'all', label: 'সব সার্ভিস (All)' },
                  { id: 'global', label: '🌐 কেন্দ্রীয় সিইও সার্ভিস (Global)' },
                  { id: 'branch_custom', label: '🏪 নিজস্ব ব্রাঞ্চ সার্ভিস ও ওভাররাইড (Branch Custom)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBranchSvcTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                      branchSvcTab === tab.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="সার্ভিস খুঁজুন (Search)..."
                  value={branchSvcSearch}
                  onChange={(e) => setBranchSvcSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {branchSvcFeedback && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>{branchSvcFeedback}</span>
              </div>
            )}

            {/* ADD NEW BRANCH-SPECIFIC SERVICE MODAL / FORM (Requirement 9) */}
            {showAddBranchSvcModal && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/40 space-y-4 shadow-xl text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono">
                      নতুন ব্রাঞ্চ-নির্দিষ্ট সার্ভিস তৈরি করুন ({currentShop.name})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddBranchSvcModal(false)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">সার্ভিসের নাম *</label>
                    <input
                      type="text"
                      placeholder="e.g. Urgent Color Photo Print"
                      value={newBranchSvcName}
                      onChange={(e) => setNewBranchSvcName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">মূল্য (Price ₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={newBranchSvcPrice}
                      onChange={(e) => setNewBranchSvcPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">ক্যাটাগরি</label>
                    <select
                      value={newBranchSvcCategory}
                      onChange={(e) => setNewBranchSvcCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="Online Forms & Portal">Online Forms & Portal</option>
                      <option value="Printing & Parchon">Printing & Parchon</option>
                      <option value="Aadhaar & PAN Services">Aadhaar & PAN Services</option>
                      <option value="Computer & Hardware Service">Computer & Hardware Service</option>
                      <option value="Banking & AEPS">Banking & AEPS</option>
                      <option value="Other Digital Service">Other Digital Service</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">বিবরণ / Bengali Note</label>
                    <input
                      type="text"
                      placeholder="e.g. জরুরি কালার পাসপোর্ট ছবি প্রিন্ট"
                      value={newBranchSvcDesc}
                      onChange={(e) => setNewBranchSvcDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBranchSvcModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    বাতিল (Cancel)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBranchSvcName.trim() || !newBranchSvcPrice) {
                        alert('অনুগ্রহ করে নাম এবং মূল্য প্রদান করুন।');
                        return;
                      }
                      const newSvcId = `branch_svc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                      const newSetting: BranchServiceSetting = {
                        id: `${currentShop.id}_${newSvcId}`,
                        branchId: currentShop.id,
                        branchName: currentShop.name,
                        serviceId: newSvcId,
                        isBranchOnly: true,
                        name: newBranchSvcName.trim(),
                        category: newBranchSvcCategory,
                        description: newBranchSvcDesc.trim() || newBranchSvcName.trim(),
                        bengaliDesc: newBranchSvcDesc.trim(),
                        price: Number(newBranchSvcPrice),
                        overrideActive: true,
                        disabled: false,
                        updatedAt: new Date().toISOString()
                      };

                      if (saveBranchServiceSetting) {
                        saveBranchServiceSetting(newSetting, {
                          branchId: currentShop.customId || currentShop.id,
                          branchName: currentShop.name,
                          serviceId: newSvcId,
                          serviceName: newBranchSvcName.trim(),
                          changeType: 'created',
                          previousValue: 0,
                          newValue: Number(newBranchSvcPrice)
                        });
                      }

                      setNewBranchSvcName('');
                      setNewBranchSvcPrice('');
                      setNewBranchSvcDesc('');
                      setShowAddBranchSvcModal(false);
                      setBranchSvcFeedback(`✓ নতুন ব্রাঞ্চ সার্ভিস সফলভাবে যোগ করা হয়েছে এবং সিইও প্যানেলে নোটিফিকেশন পাঠানো হয়েছে!`);
                      setTimeout(() => setBranchSvcFeedback(null), 4000);
                    }}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase rounded-xl transition-all cursor-pointer shadow-lg"
                  >
                    সার্ভিস সেভ করুন
                  </button>
                </div>
              </div>
            )}

            {/* SERVICES CARDS GRID */}
            {(() => {
              // 1. Gather all global services
              const globalServicesList = (services || []).map(s => {
                const setting = branchServiceSettings.find(bs => bs.branchId === currentShop.id && bs.serviceId === s.id);
                return {
                  ...s,
                  isBranchOnly: false,
                  setting: setting || null,
                  activePrice: (setting?.overrideActive && setting?.price !== undefined) ? setting.price : (s.price || 0),
                  isOverridden: !!(setting?.overrideActive && setting?.price !== undefined),
                  isDisabledInBranch: !!setting?.disabled
                };
              });

              // 2. Gather branch-only services
              const branchOnlyList = branchServiceSettings
                .filter(bs => bs.branchId === currentShop.id && bs.isBranchOnly)
                .map(bs => ({
                  id: bs.serviceId,
                  name: bs.name || 'Branch Service',
                  category: bs.category || 'Branch Special',
                  description: bs.description || '',
                  bengaliDesc: bs.bengaliDesc,
                  price: bs.price || 0,
                  isBranchOnly: true,
                  setting: bs,
                  activePrice: bs.price || 0,
                  isOverridden: true,
                  isDisabledInBranch: !!bs.disabled
                }));

              const allCombined = [...globalServicesList, ...branchOnlyList];

              const filtered = allCombined.filter(item => {
                // Tab filter
                if (branchSvcTab === 'global' && item.isBranchOnly) return false;
                if (branchSvcTab === 'branch_custom' && !item.isBranchOnly && !item.isOverridden) return false;
                // Search filter
                if (branchSvcSearch) {
                  const q = branchSvcSearch.toLowerCase();
                  return item.name.toLowerCase().includes(q) || 
                         (item.category || '').toLowerCase().includes(q) ||
                         (item.description || '').toLowerCase().includes(q);
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-12 text-center bg-slate-950/60 rounded-3xl border border-white/5 space-y-2">
                    <Layers size={32} className="mx-auto text-slate-600" />
                    <p className="text-xs font-bold text-slate-300">কোনো সার্ভিস পাওয়া যায়নি</p>
                    <p className="text-[11px] text-slate-500">ফিল্টার পরিবর্তন করুন অথবা নতুন ব্রাঞ্চ সার্ভিস যোগ করুন।</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(item => {
                    const isGlobal = !item.isBranchOnly;
                    const isEditingThis = editingOverrideSvcId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all text-left space-y-3 relative ${
                          item.isDisabledInBranch
                            ? 'bg-slate-950/40 border-rose-500/20 opacity-70'
                            : item.isOverridden
                              ? 'bg-slate-950/90 border-amber-500/40 shadow-lg'
                              : 'bg-slate-950/80 border-white/5 hover:border-white/15'
                        }`}
                      >
                        {/* Header Badges */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isGlobal ? (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[8.5px] font-mono font-black uppercase">
                                  🌐 Global CEO Service
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[8.5px] font-mono font-black uppercase">
                                  🏪 Branch Specific
                                </span>
                              )}

                              {item.isDisabledInBranch ? (
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[8px] font-mono font-bold">
                                  ব্রাঞ্চে নিষ্ক্রিয় (Disabled)
                                </span>
                              ) : item.isOverridden ? (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[8px] font-mono font-bold">
                                  কাস্টম মূল্য সক্রিয়
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[8px] font-mono">
                                  সিইও ডিফল্ট
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-black text-white pt-1">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-mono">{item.category}</p>
                          </div>

                          {/* Price Tag */}
                          <div className="text-right">
                            <div className="text-sm font-black font-mono text-amber-400">
                              ₹{item.activePrice}
                            </div>
                            {isGlobal && item.isOverridden && (
                              <div className="text-[9px] text-slate-500 line-through font-mono">
                                CEO: ₹{item.price}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {/* Inline Override / Price Editor */}
                        {isEditingThis ? (
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2">
                            <label className="text-[9.5px] font-mono uppercase text-amber-300 font-bold block">
                              ব্রাঞ্চের কাস্টম মূল্য সেট করুন (₹):
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={overridePriceValue}
                                onChange={(e) => setOverridePriceValue(e.target.value)}
                                placeholder="e.g. 120"
                                className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-white/20 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!overridePriceValue) return;
                                  const newPrice = Number(overridePriceValue);
                                  const prevPrice = item.activePrice;

                                  const settingId = item.setting?.id || `${currentShop.id}_${item.id}`;
                                  const updatedSetting: BranchServiceSetting = {
                                    id: settingId,
                                    branchId: currentShop.id,
                                    branchName: currentShop.name,
                                    serviceId: item.id,
                                    isBranchOnly: item.isBranchOnly,
                                    name: item.name,
                                    category: item.category,
                                    price: newPrice,
                                    overrideActive: true,
                                    disabled: item.isDisabledInBranch,
                                    updatedAt: new Date().toISOString()
                                  };

                                  if (saveBranchServiceSetting) {
                                    saveBranchServiceSetting(updatedSetting, {
                                      branchId: currentShop.customId || currentShop.id,
                                      branchName: currentShop.name,
                                      serviceId: item.id,
                                      serviceName: item.name,
                                      changeType: 'repriced',
                                      previousValue: prevPrice,
                                      newValue: newPrice
                                    });
                                  }

                                  setEditingOverrideSvcId(null);
                                  setBranchSvcFeedback(`✓ "${item.name}" এর ব্রাঞ্চ মূল্য ₹${newPrice} সেট হয়েছে (সিইও নোটিফিকেশন প্রেরিত)`);
                                  setTimeout(() => setBranchSvcFeedback(null), 3500);
                                }}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-lg cursor-pointer"
                              >
                                সেভ
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingOverrideSvcId(null)}
                                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Action Buttons */
                          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOverrideSvcId(item.id);
                                  setOverridePriceValue(item.activePrice.toString());
                                }}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold font-mono transition-colors cursor-pointer"
                              >
                                {item.isOverridden ? 'মূল্য পরিবর্তন (Edit)' : 'কাস্টম মূল্য দিন'}
                              </button>

                              {isGlobal && item.isOverridden && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const settingId = item.setting?.id || `${currentShop.id}_${item.id}`;
                                    const updatedSetting: BranchServiceSetting = {
                                      id: settingId,
                                      branchId: currentShop.id,
                                      branchName: currentShop.name,
                                      serviceId: item.id,
                                      overrideActive: false,
                                      price: item.price,
                                      disabled: item.isDisabledInBranch,
                                      updatedAt: new Date().toISOString()
                                    };

                                    if (saveBranchServiceSetting) {
                                      saveBranchServiceSetting(updatedSetting, {
                                        branchId: currentShop.customId || currentShop.id,
                                        branchName: currentShop.name,
                                        serviceId: item.id,
                                        serviceName: item.name,
                                        changeType: 'edited',
                                        previousValue: item.activePrice,
                                        newValue: item.price
                                      });
                                    }

                                    setBranchSvcFeedback(`✓ "${item.name}" রিসেট হয়ে কেন্দ্রীয় সিইও মূল্যে ফিরেছে`);
                                    setTimeout(() => setBranchSvcFeedback(null), 3000);
                                  }}
                                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-[9.5px] font-mono transition-colors cursor-pointer"
                                  title="Reset to CEO Base Price"
                                >
                                  সিইও মূল্যে রিসেট
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newDisabled = !item.isDisabledInBranch;
                                const settingId = item.setting?.id || `${currentShop.id}_${item.id}`;
                                const updatedSetting: BranchServiceSetting = {
                                  id: settingId,
                                  branchId: currentShop.id,
                                  branchName: currentShop.name,
                                  serviceId: item.id,
                                  isBranchOnly: item.isBranchOnly,
                                  name: item.name,
                                  category: item.category,
                                  price: item.activePrice,
                                  overrideActive: item.isOverridden,
                                  disabled: newDisabled,
                                  updatedAt: new Date().toISOString()
                                };

                                if (saveBranchServiceSetting) {
                                  saveBranchServiceSetting(updatedSetting, {
                                    branchId: currentShop.customId || currentShop.id,
                                    branchName: currentShop.name,
                                    serviceId: item.id,
                                    serviceName: item.name,
                                    changeType: newDisabled ? 'disabled' : 'enabled',
                                    previousValue: item.isDisabledInBranch ? 'Disabled' : 'Enabled',
                                    newValue: newDisabled ? 'Disabled' : 'Enabled'
                                  });
                                }

                                setBranchSvcFeedback(`✓ "${item.name}" এই ব্রাঞ্চের জন্য ${newDisabled ? 'নিষ্ক্রিয়' : 'সক্রিয়'} করা হয়েছে`);
                                setTimeout(() => setBranchSvcFeedback(null), 3000);
                              }}
                              className={`p-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                item.isDisabledInBranch
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                              }`}
                              title={item.isDisabledInBranch ? 'Enable in this branch' : 'Disable in this branch'}
                            >
                              {item.isDisabledInBranch ? 'সক্রিয় করুন' : 'নিষ্ক্রিয়'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Quick Counter Retail Products & Accessories (Preserved for branch sales) */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-black uppercase text-amber-400 font-mono flex items-center justify-between">
              <span>Branch Hardware & Counter Accessories ({products.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Physical Stock</span>
            </h3>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Product Name (e.g. Lamination Pouch)"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={newProdPrice}
                onChange={(e) => setNewProdPrice(e.target.value ? Number(e.target.value) : '')}
                className="py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                placeholder="Category"
                value={newProdCategory}
                onChange={(e) => setNewProdCategory(e.target.value)}
                className="py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
              />
              <button
                type="submit"
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl"
              >
                + Add Product
              </button>
            </form>

            {productMessage && (
              <div className="text-xs text-emerald-400 font-bold">{productMessage}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {products.map(p => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-left">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-black text-white">{p.name}</h4>
                    <span className="text-amber-400 font-mono font-bold">₹{p.price}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{p.category}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: APPOINTMENTS QUEUE WITH 4-ACTION CONTROLS */}
      {activeSubTab === 'appointments' && (() => {
        const filteredAppointments = branchAppointments.filter(apt => {
          if (branchAptFilter === 'All') return true;
          return apt.status === branchAptFilter;
        });

        return (
          <div className="space-y-6 text-left animate-fade-in">
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-5 shadow-2xl">
              
              {/* Header & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 font-mono flex items-center gap-2">
                    <Calendar size={18} className="text-amber-400" />
                    <span>Branch Appointments Ledger ({filteredAppointments.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Live review, 4-way decision matrix, customer verification & billing workflow.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap bg-slate-950/80 p-1.5 rounded-2xl border border-white/5">
                  {(['All', 'Pending', 'Approved', 'Completed', 'Reapply', 'Rejected'] as const).map((filter) => {
                    const count = branchAppointments.filter(a => filter === 'All' ? true : a.status === filter).length;
                    const isActive = branchAptFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setBranchAptFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{filter}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Appointment Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAppointments.map(apt => {
                  const isApproved = apt.status === 'Approved' || apt.status === 'Completed';
                  const isCompleted = apt.status === 'Completed';
                  const isPending = apt.status === 'Pending';
                  const isReapply = apt.status === 'Reapply';
                  const isRejected = apt.status === 'Rejected';

                  return (
                    <div 
                      key={apt.id} 
                      className="p-5 rounded-3xl bg-slate-950/90 border border-white/10 hover:border-amber-500/40 transition-all space-y-3.5 shadow-xl relative overflow-hidden group"
                    >
                      {/* Top Bar */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9.5px] font-black uppercase">
                              Ref #{apt.id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              isApproved ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                              isReapply ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                              isRejected ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-white">{apt.name}</h4>
                          <p className="text-[11px] text-amber-300 font-mono font-bold">📞 {apt.mobileNumber}</p>
                        </div>

                        {/* Refresh / Bill Prompt Button */}
                        <div className="flex items-center gap-1">
                          {(!isCompleted || isSuperAdmin) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (goToBillingWithCustomer) {
                                  goToBillingWithCustomer(apt.mobileNumber, apt.serviceType);
                                } else {
                                  setIsQuickBillOpen(true);
                                }
                              }}
                              className="p-2 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-all cursor-pointer"
                              title="Create/Refresh Bill for Appointment"
                            >
                              <RefreshCw size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Service Details & Schedule */}
                      <div className="p-3 bg-slate-900/80 rounded-2xl border border-white/5 space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold uppercase text-[9px]">SERVICE:</span>
                          <span className="text-white font-extrabold">{apt.serviceType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold uppercase text-[9px]">SCHEDULE:</span>
                          <span className="text-cyan-300 font-bold">{apt.date} • {apt.timeSlot}</span>
                        </div>
                        {apt.notes && (
                          <div className="pt-1 text-[10px] text-slate-400 font-sans border-t border-white/5">
                            <span className="font-bold text-slate-500">Note:</span> {apt.notes}
                          </div>
                        )}
                        {apt.reapplyReason && (
                          <div className="pt-1 text-[10px] text-amber-400 font-sans border-t border-amber-500/10">
                            <span className="font-black">Re-apply Note:</span> {apt.reapplyReason}
                          </div>
                        )}
                      </div>

                      {/* 4-ACTION WORKFLOW MATRIX BUTTONS */}
                      <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                        {(isPending || isReapply) && (
                          <>
                            {/* 1. APPROVE */}
                            <button
                              type="button"
                              onClick={() => {
                                updateAppointment && updateAppointment(apt.id, { status: 'Approved' });
                              }}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[9.5px] uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-1 active:scale-95"
                            >
                              <Check size={11} />
                              <span>Approve</span>
                            </button>

                            {/* 2. RE-APPLY */}
                            <button
                              type="button"
                              onClick={() => {
                                setReapplyModalApp(apt);
                                setReapplyReasonText(apt.reapplyReason || '');
                              }}
                              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black rounded-xl text-[9.5px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              <RefreshCw size={11} />
                              <span>Re-Apply</span>
                            </button>

                            {/* 3. REJECT */}
                            <button
                              type="button"
                              onClick={() => {
                                updateAppointment && updateAppointment(apt.id, { status: 'Rejected' });
                              }}
                              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-black rounded-xl text-[9.5px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              <X size={11} />
                              <span>Reject</span>
                            </button>

                            {/* 4. SEND OTHER BRANCH */}
                            <button
                              type="button"
                              onClick={() => {
                                setTransferModalApp(apt);
                                setTransferTargetShopId(shops.find(s => s.id !== currentShop.id)?.id || shops[0]?.id || '');
                              }}
                              className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-black rounded-xl text-[9.5px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              <Building size={11} />
                              <span>Transfer Branch</span>
                            </button>
                          </>
                        )}

                        {apt.status === 'Approved' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                updateAppointment && updateAppointment(apt.id, { status: 'Completed' });
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md active:scale-95"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Completed</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (goToBillingWithCustomer) {
                                  goToBillingWithCustomer(apt.mobileNumber, apt.serviceType);
                                } else {
                                  setIsQuickBillOpen(true);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md active:scale-95"
                            >
                              <FileText size={12} />
                              <span>Bill Now</span>
                            </button>
                          </>
                        )}

                        {isCompleted && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <Check size={12} />
                            <span>Service Fulfilled & Tax Invoiced</span>
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}

                {filteredAppointments.length === 0 && (
                  <div className="col-span-full p-12 text-center rounded-3xl bg-slate-950/60 border border-white/5 space-y-3">
                    <Calendar size={36} className="mx-auto text-slate-600" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      No appointments matching status filter "{branchAptFilter}"
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* SUB-TAB 6: POS & BILL HISTORY */}
      {activeSubTab === 'billing' && (
        <div className="space-y-6 text-left">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-black uppercase text-amber-400 font-mono">
              Branch Invoices & POS History ({branchInvoices.length})
            </h3>

            <div className="space-y-3">
              {branchInvoices.map(inv => (
                <div key={inv.id} className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex justify-between items-center font-mono">
                  <div>
                    <span className="text-amber-400 font-bold block">Bill #{inv.invoiceNumber}</span>
                    <span className="text-xs text-slate-300">{inv.customerName} ({inv.customerMobile})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-400 block">₹{inv.totalAmount}</span>
                    <span className="text-[10px] text-slate-400">{inv.createdAt}</span>
                  </div>
                </div>
              ))}
              {branchInvoices.length === 0 && (
                <div className="text-xs text-slate-500">No bill slips generated for this branch yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: CUSTOMERS CRM */}
      {activeSubTab === 'customers' && (
        <div className="space-y-6 text-left">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-black uppercase text-amber-400 font-mono">
              Branch Customer Registry ({branchCustomers.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {branchCustomers.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-1">
                  <h4 className="text-xs font-bold text-white">{c.name}</h4>
                  <p className="text-[10px] text-amber-300 font-mono">{c.mobile}</p>
                  <p className="text-[10px] text-slate-400">{c.address}</p>
                </div>
              ))}
              {branchCustomers.length === 0 && (
                <div className="text-xs text-slate-500">No customer profiles added yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: FINANCIAL ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 text-left">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-black uppercase text-amber-400 font-mono">
              Branch Financial Reports & Revenue Analytics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
                <span className="text-slate-400 text-xs block">Total Revenue Collected</span>
                <span className="text-2xl font-black text-emerald-400">₹{branchInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0)}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
                <span className="text-slate-400 text-xs block">Total Transactions</span>
                <span className="text-2xl font-black text-amber-300">{branchInvoices.length} Bills</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 9: PROOF DOCUMENTS */}
      {activeSubTab === 'proofs' && (
        <div className="space-y-6 text-left">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-black uppercase text-amber-400 font-mono">
              Branch Service Proof Documents ({proofs.length})
            </h3>

            <form onSubmit={handleAddProof} className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Proof Title"
                  value={proofTitle}
                  onChange={(e) => setProofTitle(e.target.value)}
                  className="py-2 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={proofCustName}
                  onChange={(e) => setProofCustName(e.target.value)}
                  className="py-2 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                />
                <button
                  type="submit"
                  className="py-2 px-4 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl"
                >
                  Upload Proof
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {proofs.map(p => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
                  <img src={p.proofImageUrl} alt={p.title} className="w-full h-32 object-cover rounded-xl" />
                  <h4 className="text-xs font-bold text-white">{p.title}</h4>
                  <p className="text-[10px] text-slate-400">{p.customerName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 10: EMAIL INQUIRIES & CITIZEN MESSAGES */}
      {activeSubTab === 'inquiries' && (() => {
        // Filter inquiries targeted to this branch or all if super admin
        const branchInquiries = inquiries.filter(inq => {
          if (isSuperAdmin) return true;
          return inq.branchId === currentShop.id || inq.branchId === currentShop.customId || inq.targetBranch === currentShop.name;
        });

        return (
          <div className="space-y-6 text-left animate-fade-in">
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-5 shadow-2xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase text-amber-400 font-mono flex items-center gap-2">
                    <Mail size={18} className="text-amber-400" />
                    <span>Citizen Email Verification & Inquiries Ledger ({branchInquiries.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Messages, email verifications and customer support tickets directed to this branch from the Help Center.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {branchInquiries.map(inq => {
                  const isResolved = inq.status === 'Resolved' || inq.status === 'Answered';
                  return (
                    <div 
                      key={inq.id} 
                      className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3 hover:border-amber-500/40 transition-all shadow-lg"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[9px] font-bold uppercase">
                              Ticket #{inq.id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              isResolved 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                            }`}>
                              {inq.status || 'Pending'}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-white mt-1">{inq.subject}</h4>
                          <p className="text-[11px] text-cyan-300 font-mono">From: {inq.senderEmail || inq.customerEmail || inq.senderName}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{inq.timestamp || inq.createdAt || 'Recent'}</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                        {inq.message || inq.description}
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Customer: {inq.senderName || 'Citizen'} ({inq.senderPhone || 'No Phone'})
                        </span>
                        
                        {!isResolved && updateInquiry && (
                          <button
                            type="button"
                            onClick={() => {
                              updateInquiry(inq.id, { status: 'Resolved' });
                            }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <Check size={12} />
                            <span>Mark Resolved / রিপ্লাই দিন</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {branchInquiries.length === 0 && (
                  <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-white/5 space-y-2">
                    <Mail size={32} className="mx-auto text-slate-600" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      No customer inquiries or email verifications received yet for this branch.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* SUB-TAB: VERIFY ONLINE BILLS & CITIZEN PROOF DOCUMENTS */}
      {activeSubTab === 'verify_bills_docs' && (
        <div className="space-y-6 text-left animate-fade-in">
          <VerifyBillsDocsView
            theme={theme}
            currentUser={currentUser}
            shops={shops}
            onlinePayments={onlinePayments}
            updateOnlinePayment={updateOnlinePayment || (() => {})}
            deleteOnlinePayment={deleteOnlinePayment}
            vault={vault}
            addVaultItem={addVaultItem}
            updateVaultItem={updateVaultItem}
            invoices={invoices}
          />
        </div>
      )}

      {/* QUICK BILL CREATION MODAL */}
      {isQuickBillOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase font-mono">Create POS Bill Slips</h3>
              <button onClick={() => setIsQuickBillOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleProcessSale} className="space-y-3">
              <div>
                <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Customer Name"
                  value={saleCustName}
                  onChange={(e) => setSaleCustName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Customer Mobile</label>
                <input
                  type="tel"
                  required
                  placeholder="Mobile Number"
                  value={saleCustMobile}
                  onChange={(e) => setSaleCustMobile(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Select Product / Service</label>
                <select
                  onChange={(e) => {
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) setSelectedProductForSale(prod);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-amber-300 font-bold"
                >
                  <option value="">Select Service / Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedProductForSale}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-lg disabled:opacity-40"
              >
                Generate Bill Slip
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK APPOINTMENT CREATION MODAL */}
      {isQuickAptOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase font-mono">New Branch Appointment</h3>
              <button onClick={() => setIsQuickAptOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateBranchAppointment} className="space-y-3">
              <div>
                <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Customer Name"
                  value={aptCustName}
                  onChange={(e) => setAptCustName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="Mobile Number"
                  value={aptCustMobile}
                  onChange={(e) => setAptCustMobile(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Service Category</label>
                <select
                  value={aptServiceType}
                  onChange={(e) => setAptServiceType(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-xs text-amber-300 font-bold"
                >
                  <option value="🆔 Aadhaar Services">🆔 Aadhaar Services</option>
                  <option value="💳 PAN Card Application">💳 PAN Card Application</option>
                  <option value="🏦 Banking & Money Transfer">🏦 Banking & Money Transfer</option>
                  <option value="🚆 IRCTC Rail Booking">🚆 IRCTC Rail Booking</option>
                  <option value="✈️ Passport & Visa">✈️ Passport & Visa</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Date</label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full py-2 px-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[9.5px] uppercase font-mono font-bold text-slate-400">Slot</label>
                  <select
                    value={aptTimeSlot}
                    onChange={(e) => setAptTimeSlot(e.target.value)}
                    className="w-full py-2 px-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                    <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition-all shadow-lg"
              >
                Book Branch Token
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RE-APPLY REASON MODAL */}
      {reapplyModalApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
                <RefreshCw size={16} className="text-amber-400" />
                <span>Request Citizen Re-Application</span>
              </h3>
              <button onClick={() => setReapplyModalApp(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Specify reason or missing documents required from <strong className="text-white">{reapplyModalApp.name}</strong> for <strong className="text-amber-300">{reapplyModalApp.serviceType}</strong>:
              </p>
              <textarea
                rows={3}
                value={reapplyReasonText}
                onChange={(e) => setReapplyReasonText(e.target.value)}
                placeholder="e.g. Please upload clear Aadhaar card front & back copy / অস্পষ্ট ডকুমেন্ট আবার আপলোড করুন..."
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReapplyModalApp(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (updateAppointment) {
                    updateAppointment(reapplyModalApp.id, {
                      status: 'Reapply',
                      reapplyReason: reapplyReasonText || 'অতিরিক্ত ডকুমেন্ট বা তথ্য প্রয়োজন।'
                    });
                  }
                  setReapplyModalApp(null);
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Send Re-Apply Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER BRANCH MODAL */}
      {transferModalApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 text-left shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
                <Building size={16} className="text-indigo-400" />
                <span>Transfer Appointment to Other Branch</span>
              </h3>
              <button onClick={() => setTransferModalApp(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Select target destination branch for <strong className="text-white">{transferModalApp.name}</strong>:
              </p>
              
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {shops.filter(s => s.id !== currentShop.id).map(shop => {
                  const isSelected = transferTargetShopId === shop.id;
                  return (
                    <div
                      key={shop.id}
                      onClick={() => setTransferTargetShopId(shop.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                        isSelected 
                          ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                          : 'bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <h5 className="text-xs font-bold">{shop.name}</h5>
                        <p className="text-[10px] text-slate-400">{shop.address || shop.branchHead}</p>
                      </div>
                      {isSelected && <span className="text-indigo-400 font-bold text-xs font-mono">Selected ✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferModalApp(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetShop = shops.find(s => s.id === transferTargetShopId);
                  if (updateAppointment && targetShop) {
                    updateAppointment(transferModalApp.id, {
                      shopId: targetShop.id,
                      shopName: targetShop.name,
                      notes: `${transferModalApp.notes ? transferModalApp.notes + ' | ' : ''}Transferred from ${currentShop.name}`
                    });
                  }
                  setTransferModalApp(null);
                }}
                className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS ALERT MODAL */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white uppercase font-mono flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span>Branch Live Notifications</span>
              </h3>
              <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-[11px]">
              <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold block">✓ System Online</span>
                <span className="text-slate-400 text-[10px]">Real-time synchronization connected to Head Office.</span>
              </div>
              <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-1">
                <span className="text-amber-300 font-bold block">🤖 AI Holiday Manager</span>
                <span className="text-slate-400 text-[10px]">You can declare branch holidays using AI natural commands anytime.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
