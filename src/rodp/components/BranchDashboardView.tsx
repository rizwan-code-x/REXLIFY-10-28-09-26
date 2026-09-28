import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, Store, TrendingUp, ShieldCheck, KeyRound, Edit, Plus, Trash2,
  DollarSign, Package, ShoppingCart, UserCheck, Image as ImageIcon, Camera, Save, Lock, CheckCircle2,
  Phone, MapPin, Grid, Layers, ClipboardList, Info, Sparkles, Check, X, RefreshCw, Upload, FileText,
  Calendar, Users, BarChart3, FileCheck, Search, Eye, AlertCircle, Building, Mail, Clock, Globe,
  Landmark, CreditCard, Tag, ShieldAlert, ChevronLeft, ChevronRight, MessageSquare, Bot, AlertTriangle,
  LayoutDashboard, Activity
} from 'lucide-react';
import { Shop, Invoice, Appointment, CustomerCRM } from '../types';

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
  playTechIndustryLoginSound
}: BranchDashboardViewProps) {
  
  // CEO / Super Admin Branch Selection
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const defaultShopId = currentUser?.shopId || (shops[0]?.id || 'shop_2');
  const [selectedShopId, setSelectedShopId] = useState<string>(defaultShopId);

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
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'profile' | 'services' | 'appointments' | 'billing' | 'customers' | 'analytics' | 'proofs' | 'calendar'>('overview');

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
            { id: 'profile', label: '👤 Branch Profile & Dossier', icon: User },
            { id: 'calendar', label: '📅 Smart Calendar & AI Holidays', icon: Calendar },
            { id: 'services', label: '🛍️ Services & Products', icon: Layers },
            { id: 'appointments', label: '📋 Appointments Queue', icon: Calendar },
            { id: 'billing', label: '🧾 POS & Bill History', icon: FileText },
            { id: 'customers', label: '👥 Customers CRM', icon: Users },
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
                  setActiveSubTab(tab.id as any);
                }}
                className={`px-4 py-2.5 rounded-2xl font-black text-[10.5px] whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
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
              
              {/* Today's Appointments */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Today's Apt</span>
                  <Calendar size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{todayAppointmentsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono">Scheduled for today</div>
              </div>

              {/* Pending Appointments */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Pending Apt</span>
                  <Clock size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">{pendingAppointmentsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono">Awaiting verification</div>
              </div>

              {/* Completed Appointments */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Completed Apt</span>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{completedAppointmentsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono">Successfully served</div>
              </div>

              {/* Total Customers */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Total Customers</span>
                  <Users size={16} className="text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-indigo-300">{branchCustomers.length}</div>
                <div className="text-[9.5px] text-slate-400 font-mono">Registered at branch</div>
              </div>

              {/* Today's Collection */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Today's Revenue</span>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">₹{todayCollection.toLocaleString('en-IN')}</div>
                <div className="text-[9.5px] text-slate-400 font-mono">Daily cash + online</div>
              </div>

              {/* Monthly Collection */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Monthly Revenue</span>
                  <TrendingUp size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300">₹{monthlyCollection.toLocaleString('en-IN')}</div>
                <div className="text-[9.5px] text-slate-400 font-mono">Current month total</div>
              </div>

              {/* Pending Bills */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Pending Bills</span>
                  <AlertTriangle size={16} className="text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400">{pendingBillsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono">Unpaid / Partial bills</div>
              </div>

              {/* Total Bills */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Total Invoices</span>
                  <FileText size={16} className="text-slate-300" />
                </div>
                <div className="text-2xl font-black text-white">{totalBillsCount}</div>
                <div className="text-[9.5px] text-slate-400 font-mono">Generated bill slips</div>
              </div>

              {/* Customer Satisfaction */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-all sm:col-span-2 lg:col-span-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-mono uppercase font-bold">Customer Satisfaction Index</span>
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-black text-amber-300">{satisfactionScore}%</div>
                  <div className="text-xs text-amber-400 font-mono font-bold">★★★★★ (4.9 / 5.0)</div>
                </div>
                <div className="text-[9.5px] text-slate-400 font-mono">Future Ready AI Sentiment Rating</div>
              </div>

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
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-black uppercase text-amber-400 font-mono">
              Branch Service Catalog & Products ({products.length})
            </h3>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Service / Product Name"
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
                + Add Service
              </button>
            </form>

            {productMessage && (
              <div className="text-xs text-emerald-400 font-bold">{productMessage}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {products.map(p => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
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

      {/* SUB-TAB 5: APPOINTMENTS QUEUE */}
      {activeSubTab === 'appointments' && (
        <div className="space-y-6 text-left">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-sm font-black uppercase text-amber-400 font-mono">
              Branch Appointments Ledger ({branchAppointments.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branchAppointments.map(apt => (
                <div key={apt.id} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{apt.name} ({apt.mobileNumber})</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{apt.serviceType}</p>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Date: {apt.date}</span>
                    <span>Slot: {apt.timeSlot}</span>
                  </div>
                </div>
              ))}
              {branchAppointments.length === 0 && (
                <div className="text-xs text-slate-500">No appointments registered for this branch yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

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
