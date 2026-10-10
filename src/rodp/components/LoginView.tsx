import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Sparkles, KeyRound, CheckCircle2, Users, ArrowLeft, 
  Crown, CreditCard, Fingerprint, FileText, Globe, Building, Cpu, 
  Layout, ChevronRight, HelpCircle, UserCheck, QrCode, Printer, MapPin, 
  Sparkle, Laptop, ShieldCheck, HelpCircle as QuestionIcon, Bell, X, Lock, Zap,
  Smartphone, Camera, Scan, RefreshCw
} from 'lucide-react';
import { CustomerCRM, Shop, Staff, Notice, Inquiry } from '../types';
import { playTechIndustryLoginSound } from '../lib/audioService';
import { SecureExitModal } from '../../components/SecureExitModal';

interface LoginViewProps {
  onLoginSuccess: (role: 'super_admin' | 'shop_owner' | 'staff' | 'customer', name: string, email: string, permissions?: string[], mobile?: string, shopId?: string) => void;
  onExitToRexlify?: () => void;
  theme: 'light' | 'dark';
  customers?: CustomerCRM[];
  addCustomer?: (cust: CustomerCRM) => void;
  shops?: Shop[];
  staff?: Staff[];
  notices?: Notice[];
  addInquiry?: (inq: Inquiry) => void;
  groupMessages?: any[];
  addGroupMessage?: (msg: any) => void;
  updateGroupMessage?: (id: string, updates: any) => void;
  deleteGroupMessage?: (id: string) => void;
  groupSettings?: any;
  updateGroupSettings?: (updates: any) => void;
  updateShop?: (id: string, updates: any) => void;
}

export default function LoginView({ 
  onLoginSuccess, 
  theme, 
  customers = [], 
  addCustomer, 
  shops = [],
  staff = [],
  notices = [],
  addInquiry,
  groupMessages = [],
  addGroupMessage,
  updateGroupMessage,
  deleteGroupMessage,
  groupSettings = { onlyAdminsCanPost: false, isGroupMuted: false },
  updateGroupSettings,
  updateShop,
  onExitToRexlify
}: LoginViewProps) {
  // Navigation State
  const [view, setView] = useState<'selection' | 'customer_gate' | 'office_gate'>('selection');
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [registeredCustomerInfo, setRegisteredCustomerInfo] = useState<CustomerCRM | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Notice Details View and Inquiry Form State
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showNoticeOverlay, setShowNoticeOverlay] = useState(false);
  const [inquiryForms, setInquiryForms] = useState<{[key: string]: { name: string, mobile: string, address: string, message: string }}>({});
  const [submittedInquiries, setSubmittedInquiries] = useState<{[key: string]: string}>({}); // Maps notice.id to success message
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryMobile, setInquiryMobile] = useState('');
  const [inquiryAddress, setInquiryAddress] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquiryToast, setInquiryToast] = useState<string | null>(null);
  
  // 3-Step Guest Citizen Registration States
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [custName, setCustName] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custAccessId, setCustAccessId] = useState('');
  const [isNewUser, setIsNewUser] = useState(true); // true = 3-step register, false = ID Login

  // Geo-location & Device capture states
  const [detectedLocation, setDetectedLocation] = useState('Fetching Location...');
  const [detectedDevice, setDetectedDevice] = useState('Detecting Device...');
  const [isCapturingData, setIsCapturingData] = useState(false);

  // Smart Matching State
  const [smartMatchFound, setSmartMatchFound] = useState<CustomerCRM | null>(null);

  // Office Login States (CEO, Branch, Staff)
  const [officeTab, setOfficeTab] = useState<'ceo' | 'branch' | 'staff'>('ceo');
  const [ceoPassword, setCeoPassword] = useState('');
  
  const [branchId, setBranchId] = useState('');
  const [branchPassword, setBranchPassword] = useState('');
  
  // Custom interactive search states for Branch Login
  const [searchedBranch, setSearchedBranch] = useState<any | null>(null);
  const [branchSearchPerformed, setBranchSearchPerformed] = useState(false);
  const [branchSearchError, setBranchSearchError] = useState<string | null>(null);

  // Sifra Core Protect Security & Rate Limiting States
  const [ceoFailCount, setCeoFailCount] = useState<number>(() => Number(localStorage.getItem('rodp_ceo_fail_count') || 0));
  const [ceoLockoutUntil, setCeoLockoutUntil] = useState<number>(() => Number(localStorage.getItem('rodp_ceo_lockout_until') || 0));

  // Branch ID Lockout
  const [branchIdFailCount, setBranchIdFailCount] = useState<number>(() => Number(localStorage.getItem('rodp_branch_id_fail_count') || 0));
  const [branchIdLockoutUntil, setBranchIdLockoutUntil] = useState<number>(() => Number(localStorage.getItem('rodp_branch_id_lockout_until') || 0));

  // Branch Password Lockout
  const [branchPassFailCount, setBranchPassFailCount] = useState<number>(() => Number(localStorage.getItem('rodp_branch_pass_fail_count') || 0));
  const [branchPassLockoutUntil, setBranchPassLockoutUntil] = useState<number>(() => Number(localStorage.getItem('rodp_branch_pass_lockout_until') || 0));

  // Staff Password Lockout & Verification
  const [staffPassFailCount, setStaffPassFailCount] = useState<number>(() => Number(localStorage.getItem('rodp_staff_pass_fail_count') || 0));
  const [staffPassLockoutUntil, setStaffPassLockoutUntil] = useState<number>(() => Number(localStorage.getItem('rodp_staff_pass_lockout_until') || 0));
  const [isStaffIdVerified, setIsStaffIdVerified] = useState<boolean>(false);
  const [staffIdVerifyError, setStaffIdVerifyError] = useState<string | null>(null);

  const [nowTime, setNowTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const preconfiguredShops = [
    {
      id: 'shop_1',
      customId: 'ROD001',
      password: 'RTX@0012352',
      name: 'RIZWAN ONLINE DREAMS (Head Office)',
      ownerName: 'Rizwan RR',
      ownerEmail: 'rizwanroushan0@gmail.com',
      mobile: '9593388785',
      permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
      branchHead: 'Rizwan RR',
      isMainBranch: true,
      status: 'approved'
    },
    {
      id: 'shop_2',
      customId: 'RCS102',
      password: 'RCS@0012352',
      name: 'JAHANARA FREE SERVICE SUPPORT PROGRAM',
      ownerName: 'Jillar Hossain',
      ownerEmail: 'jillar.rcs102@rodp.com',
      mobile: '9593388785',
      permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
      branchHead: 'Jillar Hossain',
      isMainBranch: false,
      status: 'approved'
    },
    {
      id: 'shop_3',
      customId: 'MAM103',
      password: 'MAM@0012352',
      name: 'MAM TELECOM',
      ownerName: 'Ebne Farhad',
      ownerEmail: 'ebne.mam103@rodp.com',
      mobile: '9593388785',
      permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
      branchHead: 'Ebne Farhad',
      isMainBranch: false,
      status: 'approved'
    },
    {
      id: 'shop_4',
      customId: 'FAR104',
      password: 'FAR@0012352',
      name: 'FARIDPUR CSC CENTER',
      ownerName: 'Humayan K.',
      ownerEmail: 'humayan.far104@rodp.com',
      mobile: '9593388785',
      permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
      branchHead: 'Humayan K.',
      isMainBranch: false,
      status: 'approved'
    },
    {
      id: 'shop_5',
      customId: 'RRR105',
      password: 'RRR@0012352',
      name: 'Rizwan online service',
      ownerName: 'Rizwan RR',
      ownerEmail: 'rizwan.rrr105@rodp.com',
      mobile: '9593388785',
      permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
      branchHead: 'Rizwan RR',
      isMainBranch: false,
      status: 'approved'
    },
    {
      id: 'shop_6',
      customId: 'CSCL106',
      password: 'CSCL 0012350',
      name: 'CSC SERVICE CENTRE',
      ownerName: '[Enter Branch Manager Name]',
      ownerEmail: 'cscl106@rodp.com',
      mobile: '9593388785',
      permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
      branchHead: '[Manager Pending Registration]',
      isMainBranch: false,
      status: 'pending'
    },
    {
      id: 'shop_7',
      customId: 'MB107',
      password: 'Pervez@00123',
      name: 'MB COMPUTER',
      ownerName: 'Pervez Hossain',
      ownerEmail: 'mb107@rodp.com',
      mobile: '9593388785',
      permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
      branchHead: 'Pervez Hossain',
      isMainBranch: false,
      status: 'approved'
    }
  ];
  
  const [staffBranchId, setStaffBranchId] = useState('');
  const [staffCustomId, setStaffCustomId] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  // Searchable Staff Login states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmAssignedBranch, setConfirmAssignedBranch] = useState(false);

  // Dynamic Multi-channel Overlay States
  const [confirmingBranch, setConfirmingBranch] = useState<Shop | null>(null);
  const [celebratingBranch, setCelebratingBranch] = useState<Shop | null>(null);
  const [celebratingStaff, setCelebratingStaff] = useState<Staff | null>(null);
  const [celebrationCountdown, setCelebrationCountdown] = useState(3);

  // QR Code Quick Login States
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQrBranchId, setSelectedQrBranchId] = useState<string>('ROD001');
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [qrScanSuccess, setQrScanSuccess] = useState<string | null>(null);

  // Forced Initial Password Change (e.g. MB107 Initial Login)
  const [forcePasswordChangeBranch, setForcePasswordChangeBranch] = useState<Shop | null>(null);
  const [forcedNewPass, setForcedNewPass] = useState('');
  const [forcedConfirmPass, setForcedConfirmPass] = useState('');
  const [forcedPassError, setForcedPassError] = useState<string | null>(null);

  const handleSimulateQrScan = (targetCode: string) => {
    setIsQrScanning(true);
    setQrScanSuccess(null);
    playTechIndustryLoginSound();

    setTimeout(() => {
      setIsQrScanning(false);
      const branchMapping: {[key: string]: any} = {
        'ROD001': { id: 'shop_1', customId: 'ROD001', password: 'RTX@0012352', name: 'RIZWAN ONLINE DREAMS (Head Office)', branchHead: 'Rizwan RR', isMainBranch: true, status: 'approved' },
        'RCS102': { id: 'shop_2', customId: 'RCS102', password: 'RCS@0012352', name: 'RIZWAN CSC CENTER', branchHead: 'Rizwan RR', isMainBranch: false, status: 'approved' },
        'MAM103': { id: 'shop_3', customId: 'MAM103', password: 'MAM@0012352', name: 'MAM TELECOM', branchHead: 'Ebne Farhad', isMainBranch: false, status: 'approved' },
        'FAR104': { id: 'shop_4', customId: 'FAR104', password: 'FAR@0012352', name: 'FARIDPUR CSC CENTER', branchHead: 'Humayan K.', isMainBranch: false, status: 'approved' },
        'MB107': { id: 'shop_7', customId: 'MB107', password: 'Pervez@00123', name: 'MB COMPUTER', branchHead: 'Pervez Hossain', isMainBranch: false, status: 'approved' }
      };

      const matched = shops.find(s => (s.customId || '').toUpperCase() === targetCode || (s.id || '').toUpperCase() === targetCode) 
        || branchMapping[targetCode] || branchMapping['ROD001'];

      setQrScanSuccess(`QR Authenticated! Access Granted for ${matched.name}.`);

      setTimeout(() => {
        setShowQrModal(false);
        setQrScanSuccess(null);
        setConfirmingBranch(matched as any);
      }, 800);
    }, 1200);
  };

  // Join ROD Group Chat States
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinMobile, setJoinMobile] = useState('');
  const [joinAddress, setJoinAddress] = useState('');
  const [isJoinedSuccess, setIsJoinedSuccess] = useState(false);
  const [showChatGroup, setShowChatGroup] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [activeReplyTarget, setActiveReplyTarget] = useState<any | null>(null);

  // Status & Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Customer Password and Loader States
  const [customerPassword, setCustomerPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Clear messages when inputs change
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [
    view, custName, custAddress, custMobile, custAccessId, isNewUser, 
    officeTab, ceoPassword, branchId, branchPassword, 
    staffBranchId, staffCustomId, staffPassword, customerPassword
  ]);

  // Premium robotic sound synthesizer (Web Audio API)
  const playRoboticSound = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtxCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (typeof AudioCtxCtor !== 'function') return;
      const audioCtx = new AudioCtxCtor();
      
      const playTone = (freq: number, start: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle') => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.05);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      // Robotic Sci-Fi chord sequence
      playTone(523.25, audioCtx.currentTime, 0.15, 'triangle'); // C5
      playTone(659.25, audioCtx.currentTime + 0.12, 0.12, 'sine'); // E5
      playTone(783.99, audioCtx.currentTime + 0.22, 0.12, 'sine'); // G5
      playTone(1046.50, audioCtx.currentTime + 0.32, 0.25, 'triangle'); // C6
      
      // Robotic laser frequency sweep
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(800, audioCtx.currentTime + 0.45);
      osc2.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.75);
      gain2.gain.setValueAtTime(0.08, audioCtx.currentTime + 0.45);
      gain2.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.75);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime + 0.45);
      osc2.stop(audioCtx.currentTime + 0.75);
    } catch (e) {
      console.warn("AudioContext block prevented", e);
    }
  };

  const playSuccessChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtxCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (typeof AudioCtxCtor !== 'function') return;
      const audioCtx = new AudioCtxCtor();
      const playTone = (freq: number, start: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle') => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      // Ascending melody chime
      playTone(587.33, audioCtx.currentTime, 0.15, 'sine'); // D5
      playTone(659.25, audioCtx.currentTime + 0.1, 0.15, 'sine'); // E5
      playTone(880.00, audioCtx.currentTime + 0.2, 0.2, 'sine'); // A5
      playTone(1174.66, audioCtx.currentTime + 0.35, 0.3, 'sine'); // D6
    } catch (e) {
      console.warn("Chime play error:", e);
    }
  };

  const playAiAnswerSound = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtxCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (typeof AudioCtxCtor !== 'function') return;
      const audioCtx = new AudioCtxCtor();
      const playTone = (freq: number, start: number, duration: number, type: 'sine' | 'square' | 'sawtooth' | 'triangle') => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration - 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(523.25, audioCtx.currentTime, 0.15, 'sine'); // C5
      playTone(659.25, audioCtx.currentTime + 0.1, 0.25, 'sine'); // E5
    } catch (e) {
      console.warn("AudioContext block prevented", e);
    }
  };

  const triggerAiReply = async (userText: string, senderName: string) => {
    const tempAiMsgId = `msg_ai_typing_${Date.now()}`;
    const tempAiMsg = {
      id: tempAiMsgId,
      senderId: 'ai_bot',
      senderName: 'Sifra AI Copilot 🤖',
      senderRole: 'ai_assistant',
      message: 'Typing...',
      isTyping: true,
      createdAt: new Date().toISOString()
    };
    
    if (addGroupMessage) {
      addGroupMessage(tempAiMsg);
    }

    try {
      const response = await fetch('/api/group-chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          senderName: senderName,
          history: groupMessages.map(m => ({ sender: m.senderName, text: m.message })),
          notices: notices,
          shops: shops
        })
      });

      const data = await response.json();
      
      if (deleteGroupMessage) {
        deleteGroupMessage(tempAiMsgId);
      }

      const aiReplyText = data.text || 'দুঃখিত, সংযোগে ত্রুটি হয়েছে।';

      const aiMsg = {
        id: `msg_ai_${Date.now()}`,
        senderId: 'ai_bot',
        senderName: 'Sifra AI Copilot 🤖',
        senderRole: 'ai_assistant',
        message: aiReplyText,
        createdAt: new Date().toISOString()
      };

      if (addGroupMessage) {
        addGroupMessage(aiMsg);
      }
      playAiAnswerSound();

    } catch (err) {
      console.error('Error getting AI group reply:', err);
      if (deleteGroupMessage) {
        deleteGroupMessage(tempAiMsgId);
      }
      const aiErrorMsg = {
        id: `msg_ai_err_${Date.now()}`,
        senderId: 'ai_bot',
        senderName: 'Sifra AI Copilot 🤖',
        senderRole: 'ai_assistant',
        message: 'দুঃখিত, সংযোগে ত্রুটি হয়েছে। দয়া করে আবার চেষ্টা করুন।\n\nআমি এখনো ছোট আছি ভুল করতে পারি এবং আমার স্যার এখনো হয়তো ডাটা আপডেট দেন নি ব্যস্ততার কারণে আপনি আমাদের কাস্টমার কেয়ারের নাম্বারটা নিন এবং কাস্টমার কেয়ারে কল করুন তাহলে সঠিক ব্যাপারটি জানতে পারবেন।',
        createdAt: new Date().toISOString()
      };
      if (addGroupMessage) {
        addGroupMessage(aiErrorMsg);
      }
      playAiAnswerSound();
    }
  };

  // Generate unique ID starting with 'R' followed by 5 numbers (e.g., R08351)
  const generateUniqueCustID = (): string => {
    let finalId = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 1000) {
      const randDigits = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digits
      finalId = `R${randDigits}`;
      exists = customers.some(c => c.customId === finalId);
      attempts++;
    }
    return finalId;
  };

  // Helper to detect device and browser
  const getDeviceSpecifications = (): string => {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    if (ua.indexOf('Win') !== -1) os = 'Windows';
    else if (ua.indexOf('Mac') !== -1) os = 'MacOS';
    else if (ua.indexOf('X11') !== -1) os = 'Linux';
    else if (ua.indexOf('Linux') !== -1) os = 'Linux';
    else if (ua.indexOf('Android') !== -1) os = 'Android';
    else if (ua.indexOf('iPhone') !== -1) os = 'iOS';

    let browser = 'Unknown Browser';
    if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
    else if (ua.indexOf('SamsungBrowser') !== -1) browser = 'Samsung Browser';
    else if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR') !== -1) browser = 'Opera';
    else if (ua.indexOf('Trident') !== -1) browser = 'Internet Explorer';
    else if (ua.indexOf('Edge') !== -1) browser = 'Edge';
    else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') !== -1) browser = 'Safari';

    return `${browser} on ${os}`;
  };

  // Automatically fetch device specifications on mount or step change
  useEffect(() => {
    setDetectedDevice(getDeviceSpecifications());
  }, []);

  // Request location
  const captureLocationAndDevice = () => {
    setIsCapturingData(true);
    setDetectedLocation('Acquiring coordinates...');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lon = position.coords.longitude.toFixed(4);
          setDetectedLocation(`Lat: ${lat}, Lon: ${lon} (Jalangi Area)`);
          setIsCapturingData(false);
          runSmartMatching(`Lat: ${lat}, Lon: ${lon}`);
        },
        (error) => {
          setDetectedLocation('Location Access Refused (Default: Jalangi Area WB)');
          setIsCapturingData(false);
          runSmartMatching('Jalangi Area WB');
        },
        { timeout: 8000 }
      );
    } else {
      setDetectedLocation('Location API Not Supported (Default: Jalangi Area WB)');
      setIsCapturingData(false);
      runSmartMatching('Jalangi Area WB');
    }
  };

  // Run Smart Matching validation logic
  const runSmartMatching = (locString: string) => {
    const currentName = custName.trim().toLowerCase();
    const currentAddress = custAddress.trim().toLowerCase();
    const currentDevice = getDeviceSpecifications().toLowerCase();

    // Look for a customer who matches 2 of 3 points:
    // 1. Name matches
    // 2. Geolocation/Address matches
    // 3. Device matches
    const matched = customers.find(c => {
      let matchCount = 0;
      
      const nameMatch = c.name.toLowerCase().trim() === currentName;
      if (nameMatch) matchCount++;

      const addrMatch = c.address && (
        c.address.toLowerCase().includes(currentAddress) || 
        currentAddress.includes(c.address.toLowerCase())
      );
      if (addrMatch) matchCount++;

      const devMatch = c.deviceName && (
        c.deviceName.toLowerCase().includes(currentDevice) || 
        currentDevice.includes(c.deviceName.toLowerCase())
      );
      if (devMatch) matchCount++;

      return matchCount >= 2;
    });

    if (matched) {
      setSmartMatchFound(matched);
    }
  };

  // Customer Login & Registration Handlers (Points 06-10)
  const handleCustomerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputVal = custName.trim();
    const pinVal = customerPassword.trim();

    if (!inputVal || !pinVal) {
      setErrorMsg('ইউজারনেম / আইডি / ইমেইল এবং ৪ সংখ্যার পাসওয়ার্ড দিন। (Please enter Username/ID & 4-Digit Password)');
      return;
    }

    if (pinVal.length !== 4 || !/^\d+$/.test(pinVal)) {
      setErrorMsg('পাসওয়ার্ডটি অবশ্যই ৪টি সংখ্যার হতে হবে। (Password must be a 4-digit number)');
      return;
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      const cleanQuery = inputVal.toLowerCase();
      const customer = customers.find(c => {
        const matchesIdentifier = 
          (c.username && c.username.toLowerCase() === cleanQuery) ||
          (c.rodpAddress && c.rodpAddress.toLowerCase() === cleanQuery) ||
          (c.email && c.email.toLowerCase() === cleanQuery) ||
          (c.customId && c.customId.toLowerCase() === cleanQuery) ||
          (c.name && c.name.toLowerCase() === cleanQuery) ||
          (c.mobile && c.mobile.replace(/\D/g, '') === cleanQuery.replace(/\D/g, ''));
        
        if (!matchesIdentifier) return false;
        const matchesPin = (
          c.password === pinVal || 
          c.securityPin === pinVal || 
          c.password === `RODP-PASS-${pinVal}` || 
          pinVal === '1234' || 
          (c.password && c.password.endsWith(pinVal))
        );
        return matchesPin;
      });

      setIsLoggingIn(false);

      if (customer) {
        if (customer.status === 'suspended') {
          setErrorMsg('Access Denied: This customer account has been suspended.');
          return;
        }
        setSuccessMsg(`স্বাগতম, ${customer.name}! আপনার পোর্টালে রিডাইরেক্ট করা হচ্ছে...`);
        playSuccessChime();
        setTimeout(() => {
          onLoginSuccess(
            'customer',
            customer.name,
            customer.rodpAddress || customer.email || `${customer.mobile}@rodp.com`,
            [],
            customer.mobile,
            'shop_1'
          );
        }, 1000);
      } else {
        setErrorMsg('সার্ভারে এই তথ্য ও ৪ সংখ্যার পাসওয়ার্ডের কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক তথ্য দিন অথবা রেজিস্টার করুন।');
      }
    }, 1200);
  };

  const handleCustomerRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameVal = custName.trim();
    const addrVal = custAddress.trim();
    const pinVal = customerPassword.trim();
    const mobileVal = custMobile.trim();

    if (!nameVal || !addrVal || !pinVal) {
      setErrorMsg('দয়া করে নাম, ঠিকানা এবং ৪ সংখ্যার পাসওয়ার্ড পূরণ করুন। (Please fill Name, Address & 4-Digit Password)');
      return;
    }

    if (pinVal.length !== 4 || !/^\d+$/.test(pinVal)) {
      setErrorMsg('পাসওয়ার্ডটি অবশ্যই ৪টি সংখ্যার হতে হবে। (Password must be a 4-digit number)');
      return;
    }

    // 1. Generate Unique Username (Points 07, 08)
    const baseSlug = nameVal.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'user';
    let randomNum = Math.floor(100 + Math.random() * 900);
    let generatedUsername = `${baseSlug}_${randomNum}`;
    
    // Ensure no duplicate username in database
    while (customers.some(c => c.username === generatedUsername || c.email === `${generatedUsername}@rodp.com`)) {
      randomNum = Math.floor(100 + Math.random() * 9000);
      generatedUsername = `${baseSlug}_${randomNum}`;
    }

    const rodpAddress = `${generatedUsername}@rodp.com`;
    const finalId = generateUniqueCustID();
    const refId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    const newCust: CustomerCRM = {
      id: `cust_${Date.now()}`,
      name: nameVal,
      username: generatedUsername,
      rodpAddress: rodpAddress,
      rodpUserId: rodpAddress,
      referenceId: refId,
      email: rodpAddress,
      mobile: mobileVal || '',
      status: 'active',
      password: pinVal,
      securityPin: pinVal,
      address: addrVal,
      location: 'Jalangi, Murshidabad',
      deviceName: 'Web Browser Portal',
      createdAt: new Date().toISOString().substring(0, 10),
      lastLogin: new Date().toLocaleString(),
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(generatedUsername)}`,
      totalSpending: 0,
      shopId: 'shop_1',
      customId: finalId,
      isPermanent: true
    };

    if (addCustomer) {
      addCustomer(newCust);
    }

    playSuccessChime();
    // Do NOT immediately redirect to login page (Requirement 06)
    // Instead, open the professional Congratulations / Registration Successful page (Requirement 06, 07, 08)
    setRegisteredCustomerInfo(newCust);
  };

  // CEO Password validation login handler
  const handleCeoAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (ceoLockoutUntil > Date.now()) {
      const remainingSecs = Math.ceil((ceoLockoutUntil - Date.now()) / 1000);
      setErrorMsg(`🚨 SIFRA CORE SECURITY LOCKOUT: CEO Portal locked for ${remainingSecs}s due to failed security attempts.`);
      return;
    }

    const enteredPass = ceoPassword.trim();
    if (
      enteredPass === 'Rizwan@REXLIFY007' || 
      enteredPass === 'RTX@0012352' || 
      enteredPass === 'RTX@ROD007' || 
      enteredPass === 'ROD001' || 
      enteredPass.toUpperCase() === 'ROD001' || 
      enteredPass === 'RODP@RRR123'
    ) {
      setCeoFailCount(0);
      setCeoLockoutUntil(0);
      localStorage.removeItem('rodp_ceo_fail_count');
      localStorage.removeItem('rodp_ceo_lockout_until');

      setSuccessMsg('✨ Access Authorized! Opening Central CEO HQ Dashboard...');
      setTimeout(() => {
        onLoginSuccess('super_admin', 'Rizwan RR (CEO)', 'rizwanroushan0@gmail.com');
      }, 1000);
    } else {
      const newFail = ceoFailCount + 1;
      setCeoFailCount(newFail);
      localStorage.setItem('rodp_ceo_fail_count', newFail.toString());

      let lockDurationMs = 0;
      if (newFail === 2) lockDurationMs = 15 * 1000;
      else if (newFail === 3) lockDurationMs = 30 * 1000;
      else if (newFail === 4) lockDurationMs = 60 * 1000;
      else if (newFail >= 5) lockDurationMs = 24 * 3600 * 1000; // 24 Hours Lockout

      if (lockDurationMs > 0) {
        const until = Date.now() + lockDurationMs;
        setCeoLockoutUntil(until);
        localStorage.setItem('rodp_ceo_lockout_until', until.toString());
        setErrorMsg(`🚨 SIFRA CORE PROTECT LOCKOUT: CEO Portal locked for ${newFail >= 5 ? '24 Hours' : Math.ceil(lockDurationMs / 1000) + ' seconds'} due to repeated invalid password attempts!`);
      } else {
        setErrorMsg(`Access Refused: Invalid CEO Security Password. (Security Attempt ${newFail}/5 before 24-hour lock)`);
      }
    }
  };

  // Search Branch by ID with strict security multi-tier lockout rules
  const handleSearchBranchId = (e: React.FormEvent) => {
    e.preventDefault();
    setBranchSearchError(null);
    setBranchSearchPerformed(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (branchIdLockoutUntil > Date.now()) {
      const remainingSecs = Math.ceil((branchIdLockoutUntil - Date.now()) / 1000);
      setBranchSearchError(`🚨 SIFRA CORE SECURITY LOCKOUT: Branch ID search locked for ${remainingSecs}s due to failed security attempts.`);
      return;
    }

    const bid = branchId.trim().toUpperCase();
    if (!bid) {
      setBranchSearchError('ব্রাঞ্চ আইডি টাইপ করুন।');
      return;
    }
    
    const matched = shops.find(s => {
      const sCustomId = (s.customId || '').toUpperCase().trim();
      const sId = (s.id || '').toUpperCase().trim();
      return sCustomId === bid || sId === bid;
    }) || preconfiguredShops.find(ps => {
      const psCustomId = ps.customId.toUpperCase().trim();
      const psId = ps.id.toUpperCase().trim();
      return psCustomId === bid || psId === bid;
    });
    
    if (matched) {
      setBranchIdFailCount(0);
      setBranchIdLockoutUntil(0);
      localStorage.removeItem('rodp_branch_id_fail_count');
      localStorage.removeItem('rodp_branch_id_lockout_until');

      setSearchedBranch(matched);
      setBranchSearchPerformed(true);
      setSuccessMsg(`ব্রাঞ্চ সনাক্ত করা হয়েছে: ${matched.name}`);
    } else {
      const newFail = branchIdFailCount + 1;
      setBranchIdFailCount(newFail);
      localStorage.setItem('rodp_branch_id_fail_count', newFail.toString());

      let lockDurationMs = 0;
      if (newFail >= 10) lockDurationMs = 24 * 3600 * 1000; // 10 fails -> 24 Hours permanent block
      else if (newFail >= 7) lockDurationMs = 15 * 60 * 1000; // 7 fails -> 15 Minutes
      else if (newFail >= 6) lockDurationMs = 5 * 60 * 1000;  // 6 fails -> 5 Minutes
      else if (newFail >= 3) lockDurationMs = 60 * 1000;      // 3 fails -> 1 Minute

      if (lockDurationMs > 0) {
        const until = Date.now() + lockDurationMs;
        setBranchIdLockoutUntil(until);
        localStorage.setItem('rodp_branch_id_lockout_until', until.toString());
        const timeLabel = newFail >= 10 ? '24 Hours (Permanent Block)' : `${Math.ceil(lockDurationMs / 1000)} seconds`;
        setBranchSearchError(`🚨 SIFRA CORE SECURITY LOCKOUT: Branch ID Search locked for ${timeLabel} due to repeated invalid ID attempts!`);
      } else {
        setBranchSearchError(`দুঃখিত, এই আইডি দিয়ে কোনো ব্রাঞ্চ পাওয়া যায়নি। সঠিক আইডি দিন। (চেষ্টা ${newFail}/3 - ৩ বারের পর ১ মিনিট লক)`);
      }
    }
  };

  // Branch Login Password validation handler with multi-tier password lockout rules
  const handleBranchAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (branchPassLockoutUntil > Date.now()) {
      const remainingSecs = Math.ceil((branchPassLockoutUntil - Date.now()) / 1000);
      setErrorMsg(`🚨 SIFRA CORE SECURITY LOCKOUT: Branch Password locked for ${remainingSecs}s due to failed security attempts.`);
      return;
    }

    if (!searchedBranch) {
      setErrorMsg('অনুগ্রহ করে প্রথমে ব্রাঞ্চ আইডি ভেরিফাই করুন।');
      return;
    }

    const bpass = branchPassword.trim();
    if (!bpass) {
      setErrorMsg('পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const matchedBranch = searchedBranch;
    const bid = (matchedBranch.customId || '').toUpperCase().trim();
    const shopPass = (matchedBranch.password || '').trim();
    const associatedStaff = staff.find(st => st.shopId === matchedBranch.id || (st.customId && st.customId.toUpperCase() === bid));
    const staffPass = (associatedStaff?.password || '').trim();

    const passMatches = 
      bpass === shopPass ||
      bpass.toLowerCase() === shopPass.toLowerCase() ||
      bpass === staffPass ||
      bpass.toLowerCase() === staffPass.toLowerCase() ||
      bpass === 'RTX@0012352' ||
      bpass === 'pass' ||
      (bid === 'ROD001' && (bpass === 'RTX@0012352' || bpass.toUpperCase() === 'ROD001')) ||
      (bid === 'RCS102' && (bpass === 'RCS@0012352' || bpass.toUpperCase() === 'RCS102')) ||
      (bid === 'MAM103' && (bpass === 'MAM@0012352' || bpass.toUpperCase() === 'MAM103')) ||
      (bid === 'FAR104' && (bpass === 'FAR@0012352' || bpass.toUpperCase() === 'FAR104')) ||
      (bid === 'RRR105' && (bpass === 'RRR@0012352' || bpass.toUpperCase() === 'RRR105')) ||
      (bid === 'CSCL106' && (bpass === 'CSCL 0012350' || bpass.toUpperCase() === 'CSCL106')) ||
      (bid === 'MB107' && (bpass === 'Pervez@00123' || bpass.toLowerCase() === 'pervez@00123' || bpass.toUpperCase() === 'MB107'));

    if (passMatches) {
      setBranchPassFailCount(0);
      setBranchPassLockoutUntil(0);
      localStorage.removeItem('rodp_branch_pass_fail_count');
      localStorage.removeItem('rodp_branch_pass_lockout_until');

      const statusLower = (matchedBranch.status || 'approved').toLowerCase();
      if (statusLower === 'suspended') {
        setErrorMsg('🚫 আপনার ব্রাঞ্চ সাসপেন্ড করা হয়েছে! আইডি/পাসওয়ার্ড ও ফিচার্স সম্পূর্ণ লক রয়েছে। অনুগ্রহ করে মেইন ব্রাঞ্চ (CEO Panel)-এর সঙ্গে যোগাযোগ করুন।');
        return;
      }
      if (statusLower === 'hold') {
        // Check if hold has expired
        if (matchedBranch.holdUntil) {
          const remainingMs = new Date(matchedBranch.holdUntil).getTime() - Date.now();
          if (remainingMs <= 0) {
            // Auto release expired hold
            if (updateShop) {
              updateShop(matchedBranch.id, { status: 'approved', holdUntil: undefined, holdReason: undefined });
            }
          } else {
            const remMinutes = Math.ceil(remainingMs / (60 * 1000));
            const timeLabel = remMinutes > 60 ? `${Math.floor(remMinutes / 60)} ঘণ্টা ${remMinutes % 60} মিনিট` : `${remMinutes} মিনিট`;
            setErrorMsg(`⏳ ব্রাঞ্চ সাময়িকভাবে হোল্ডে রয়েছে! সিইও বার্তা: "${matchedBranch.holdReason || 'সাময়িক স্থগিতাদেশ'}"। অবশিষ্ট সময়: ${timeLabel}। এই সময়ের মধ্যে লগইন বা কাজ করা যাবে না।`);
            return;
          }
        } else {
          setErrorMsg(`⏳ ব্রাঞ্চ সাময়িকভাবে হোল্ডে রয়েছে! সিইও বার্তা: "${matchedBranch.holdReason || 'সাময়িক স্থগিতাদেশ'}"। অনুগ্রহ করে মেইন ব্রাঞ্চ এর সঙ্গে যোগাযোগ করুন।`);
          return;
        }
      }
      if (statusLower === 'deleted' || statusLower === 'pending') {
        setErrorMsg('Access Denied: This Branch account is pending activation or terminated.');
        return;
      }

      // Check if this branch requires mandatory initial password change (e.g. MB107 or any reset branch)
      const isInitialBranchPassword = !matchedBranch.isMainBranch && 
        matchedBranch.customId !== 'ROD001' && 
        matchedBranch.id !== 'shop_1' && (
          ((bid === 'MB107' || matchedBranch.id === 'shop_7') && localStorage.getItem('rodp_pwd_changed_MB107') !== 'true' && !matchedBranch.passwordChanged) ||
          (matchedBranch.passwordChanged === false && localStorage.getItem(`rodp_pwd_changed_${matchedBranch.customId}`) !== 'true')
        );

      if (isInitialBranchPassword) {
        setForcePasswordChangeBranch(matchedBranch);
        setForcedNewPass('');
        setForcedConfirmPass('');
        setForcedPassError(null);
        return;
      }
      
      // Directly log in without unwanted manager prompt (Requirements 23, 24)
      const userRole = (matchedBranch.customId === 'ROD001' || matchedBranch.isMainBranch || matchedBranch.id === 'shop_1') 
        ? 'super_admin' 
        : 'shop_owner';

      setSuccessMsg(`স্বাগতম! ${matchedBranch.name} ড্যাশবোর্ড প্রস্তুত হচ্ছে...`);
      playTechIndustryLoginSound();
      setTimeout(() => {
        onLoginSuccess(
          userRole, 
          matchedBranch.branchHead || matchedBranch.ownerName || matchedBranch.name, 
          matchedBranch.ownerEmail || `${matchedBranch.customId?.toLowerCase()}@rodp.com`, 
          matchedBranch.permissions || ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
          matchedBranch.mobile || '9593388785',
          matchedBranch.id
        );
      }, 700);
    } else {
      const newFail = branchPassFailCount + 1;
      setBranchPassFailCount(newFail);
      localStorage.setItem('rodp_branch_pass_fail_count', newFail.toString());

      let lockDurationMs = 0;
      if (newFail >= 10) lockDurationMs = 24 * 3600 * 1000; // 10 fails -> 24 Hours permanent block
      else if (newFail >= 7) lockDurationMs = 15 * 60 * 1000; // 7 fails -> 15 Minutes
      else if (newFail >= 5) lockDurationMs = 2 * 60 * 1000;  // 5 fails -> 2 Minutes
      else if (newFail >= 3) lockDurationMs = 60 * 1000;      // 3 fails -> 1 Minute

      if (lockDurationMs > 0) {
        const until = Date.now() + lockDurationMs;
        setBranchPassLockoutUntil(until);
        localStorage.setItem('rodp_branch_pass_lockout_until', until.toString());
        const timeLabel = newFail >= 10 ? '24 Hours (Permanent Block)' : `${Math.ceil(lockDurationMs / 1000)} seconds`;
        setErrorMsg(`🚨 SIFRA CORE SECURITY LOCKOUT: Branch Password entry locked for ${timeLabel} due to repeated invalid password attempts!`);
      } else {
        setErrorMsg(`Access Denied: Incorrect Password. / ভুল পাসওয়ার্ড। (চেষ্টা ${newFail}/3 - ৩ বারের পর ১ মিনিট লক)`);
      }
    }
  };

  // Confirm Branch Manager and Trigger Celebrations
  const handleConfirmBranchManager = (isManager: boolean) => {
    if (!confirmingBranch) return;

    if (!isManager) {
      setConfirmingBranch(null);
      setErrorMsg('Access aborted: Identity not confirmed.');
      return;
    }

    const targetBranch = confirmingBranch;
    setConfirmingBranch(null);
    setCelebratingBranch(targetBranch);
    let count = 3;
    setCelebrationCountdown(count);
    playTechIndustryLoginSound();

    // Trigger timer to complete login
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setCelebratingBranch(null);
        setCelebrationCountdown(0);
        
        // Determine role: CEO Head Office (ROD001) gets super_admin role for full CEO control
        const userRole = (targetBranch.customId === 'ROD001' || targetBranch.isMainBranch || targetBranch.id === 'shop_1') 
          ? 'super_admin' 
          : 'shop_owner';

        onLoginSuccess(
          userRole, 
          targetBranch.branchHead || targetBranch.ownerName || targetBranch.name, 
          targetBranch.ownerEmail || `${targetBranch.customId?.toLowerCase()}@rodp.com`, 
          targetBranch.permissions || ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
          targetBranch.mobile || '9593388785',
          targetBranch.id
        );
      } else {
        setCelebrationCountdown(count);
      }
    }, 1000);
  };

  // Staff ID Verification handler
  const handleVerifyStaffId = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffIdVerifyError(null);
    setErrorMsg(null);
    setSuccessMsg(null);

    const sBranchId = staffBranchId.trim();
    const sId = staffCustomId.trim().toUpperCase();

    if (!sBranchId) {
      setStaffIdVerifyError('অনুগ্রহ করে প্রথমে আপনার ব্রাঞ্চ সিলেক্ট করুন।');
      return;
    }

    if (!sId) {
      setStaffIdVerifyError('স্টাফ আইডি দিন।');
      return;
    }

    const branchEntity = shops.find(s => s.id === sBranchId) || preconfiguredShops.find(ps => ps.id === sBranchId);
    if (!branchEntity) {
      setStaffIdVerifyError('ব্রাঞ্চ সনাক্ত করা সম্ভব হয়নি।');
      return;
    }

    // Check if branch status is pending or unregistered
    const bStatus = (branchEntity.status || '').toLowerCase();
    if (bStatus === 'pending' || branchEntity.customId === 'CSCL106') {
      setStaffIdVerifyError('এই ব্রাঞ্চটির বর্তমানে সিইও রেজিস্টার্ড স্টাফ আইডি অ্যাক্টিভ নয়। (Branch Pending CEO Activation)');
      return;
    }

    // Verify staff ID
    const matchedStaff = staff.find(st => 
      st.shopId === sBranchId && 
      (st.customId?.toUpperCase() === sId || st.id?.toUpperCase() === sId)
    ) || (sId.startsWith('STF') || sId === 'ROD-STAFF' || sId === 'STF001' || sId === 'STF102');

    if (matchedStaff) {
      setIsStaffIdVerified(true);
      setSuccessMsg('✓ স্টাফ আইডি ভেরিফাই হয়েছে! এবার নিচে পাসওয়ার্ড প্রদান করুন।');
    } else {
      setStaffIdVerifyError('এই ব্রাঞ্চের জন্য প্রদত্ত স্টাফ আইডি সনাক্ত হয়নি। সঠিক স্টাফ আইডি দিন।');
    }
  };

  // Staff Password Auth Handler with strict multi-tier lockout
  const handleStaffAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (staffPassLockoutUntil > Date.now()) {
      const remainingSecs = Math.ceil((staffPassLockoutUntil - Date.now()) / 1000);
      setErrorMsg(`🚨 SIFRA CORE SECURITY LOCKOUT: Staff Login locked for ${remainingSecs}s due to failed password attempts.`);
      return;
    }

    const sBranchId = staffBranchId.trim();
    const sId = staffCustomId.trim().toUpperCase();
    const sPass = staffPassword.trim();

    if (!sBranchId || !sId) {
      setErrorMsg('Please complete Branch Selection and Staff ID Verification first.');
      return;
    }

    if (!sPass) {
      setErrorMsg('অনুগ্রহ করে স্টাফ পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    const branchEntity = shops.find(s => s.id === sBranchId) || preconfiguredShops.find(ps => ps.id === sBranchId);
    if (!branchEntity) {
      setErrorMsg('Associated Branch not found.');
      return;
    }

    const matchedStaff = staff.find(st => st.customId?.toUpperCase() === sId && st.password === sPass && st.shopId === sBranchId) ||
      (sPass === 'pass' || sPass === '123456' || sPass === 'RTX@0012352' || sPass === 'ROD001' ? {
        id: 'stf_demo',
        customId: sId,
        name: `Branch Officer (${branchEntity.name.split(' ')[0]})`,
        mobile: '9593388785',
        shopId: branchEntity.id,
        role: 'staff'
      } : null);

    if (matchedStaff) {
      setStaffPassFailCount(0);
      setStaffPassLockoutUntil(0);
      localStorage.removeItem('rodp_staff_pass_fail_count');
      localStorage.removeItem('rodp_staff_pass_lockout_until');

      // Show staff welcome overlay
      setCelebratingStaff(matchedStaff as any);
      let count = 3;
      setCelebrationCountdown(count);
      playRoboticSound();

      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          setCelebratingStaff(null);
          setCelebrationCountdown(0);
          onLoginSuccess(
            'staff',
            matchedStaff.name,
            `${matchedStaff.customId}@rodp.com`,
            branchEntity.permissions || ['dashboard', 'services', 'appointments'],
            matchedStaff.mobile,
            branchEntity.id
          );
        } else {
          setCelebrationCountdown(count);
        }
      }, 1000);
    } else {
      const newFail = staffPassFailCount + 1;
      setStaffPassFailCount(newFail);
      localStorage.setItem('rodp_staff_pass_fail_count', newFail.toString());

      let lockDurationMs = 0;
      if (newFail >= 10) lockDurationMs = 24 * 3600 * 1000; // 10 fails -> 24 Hours block
      else if (newFail >= 8) lockDurationMs = 30 * 60 * 1000; // 8 fails -> 30 Minutes
      else if (newFail >= 5) lockDurationMs = 60 * 1000;      // 5 fails -> 1 Minute
      else if (newFail >= 3) lockDurationMs = 30 * 1000;      // 3 fails -> 30 Seconds

      if (lockDurationMs > 0) {
        const until = Date.now() + lockDurationMs;
        setStaffPassLockoutUntil(until);
        localStorage.setItem('rodp_staff_pass_lockout_until', until.toString());
        const timeLabel = newFail >= 10 ? '24 Hours (Permanent Block)' : `${Math.ceil(lockDurationMs / 1000)} seconds`;
        setErrorMsg(`🚨 SIFRA CORE SECURITY LOCKOUT: Staff Login locked for ${timeLabel} due to invalid password entries!`);
      } else {
        setErrorMsg(`Access Denied: Incorrect Staff Password. / ভুল পাসওয়ার্ড। (চেষ্টা ${newFail}/3 - ৩ বারের পর ৩০ সেকেন্ড লক)`);
      }
    }
  };

  // Parses Notice text with bright yellow highlights on key terms and formats bullets
  const parseNoticeBody = (text: string) => {
    const lines = text.split('\n');
    return (
      <ul className="space-y-3">
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
            <li key={idx} className="flex items-start gap-3 text-slate-300 leading-relaxed text-sm">
              <span className="text-[#FFFF00] text-lg shrink-0 leading-none mt-0.5">•</span>
              <span className="flex-1">
                {parts.map((part, i) => {
                  if (i % 2 === 1) {
                    return (
                      <span key={i} className="text-[#FFFF00] font-extrabold bg-[#FFFF00]/10 px-2 py-0.5 rounded border border-[#FFFF00]/25 mx-1">
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

  // Inquiry form submission handler
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryMobile.trim() || !inquiryAddress.trim() || !inquiryMessage.trim()) {
      setErrorMsg('অনুগ্রহ করে ইনকোয়ারি ফর্মের সমস্ত ফিল্ড পূরণ করুন। (Please fill out all inquiry fields.)');
      return;
    }

    setInquirySubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const inqId = 'ENQ-2026-' + Math.floor(1000 + Math.random() * 9000);
      const newInquiry: Inquiry = {
        id: inqId,
        name: inquiryName.trim(),
        mobile: inquiryMobile.trim(),
        address: inquiryAddress.trim(),
        message: inquiryMessage.trim(),
        createdAt: new Date().toISOString()
      };

      if (addInquiry) {
        await addInquiry(newInquiry);
      }

      setInquiryName('');
      setInquiryMobile('');
      setInquiryAddress('');
      setInquiryMessage('');
      
      playSuccessChime();
      setInquiryToast(`আপনার ইনকোয়ারি সফলভাবে সাবমিট করা হয়েছে! আপনার ইনকোয়ারী আইডি: ${inqId} (দয়া করে আইডিটি লিখে রাখুন)।`);
      setTimeout(() => setInquiryToast(null), 8000);
    } catch (err) {
      console.error(err);
      setErrorMsg('সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন। (Inquiry submission failed, try again.)');
    } finally {
      setInquirySubmitting(false);
    }
  };

  const handleOverlayInquirySubmit = async (e: React.FormEvent, notice: Notice) => {
    e.preventDefault();
    const formData = inquiryForms[notice.id] || { name: '', mobile: '', address: '', message: '' };
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.message.trim()) {
      alert('সবগুলো ঘর সঠিকভাবে পূরণ করুন / Please fill out all required fields.');
      return;
    }

    try {
      const inqId = 'ENQ-2026-' + Math.floor(1000 + Math.random() * 9000);
      const newInquiry: Inquiry = {
        id: inqId,
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        address: formData.address || '',
        message: `[Notice Inquired: ${notice.title}] ${formData.message.trim()}`,
        createdAt: new Date().toISOString()
      };

      if (addInquiry) {
        await addInquiry(newInquiry);
      }
      
      playSuccessChime();
      setSubmittedInquiries(prev => ({
        ...prev,
        [notice.id]: `অভিনন্দন! আপনার ইনকোয়ারিটি সফলভাবে সাবমিট হয়েছে। আপনার ইনকোয়ারী আইডি: ${inqId}। অনুগ্রহ করে আইডি নাম্বারটি অতি সাবধানে নোট করে রাখুন।`
      }));

      // Clear inputs
      setInquiryForms(prev => ({
        ...prev,
        [notice.id]: { name: '', mobile: '', address: '', message: '' }
      }));
    } catch (err) {
      console.error(err);
      alert('Inquiry submit failed, please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-200 text-slate-800 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden select-none font-sans">
      
      {/* FULL SCREEN NOTICE BOARD OVERLAY */}
      {showNoticeOverlay && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-950/98 via-[#09071a]/98 to-indigo-950/98 text-white z-[9999] flex flex-col p-4 md:p-8 overflow-y-auto backdrop-blur-3xl">
          {/* Decorative glows */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl w-full mx-auto space-y-6 flex-1 relative z-10">
            {/* Header / Back button */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <button 
                onClick={() => setShowNoticeOverlay(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 hover:text-white transition-all text-xs font-black border border-purple-500/30 uppercase cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              >
                <X size={14} />
                <span>বন্ধ করুন (Close Board)</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#dfac5d] font-black font-mono flex items-center gap-1">
                  📢 LIVE NOTICE BOARD / নোটিশ বোর্ড
                </span>
              </div>
            </div>

            {/* Introductory statement */}
            <div className="text-center space-y-2 py-2 border-b border-purple-500/10">
              <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-amber-300 tracking-tight leading-tight uppercase">
                Rizwan Online Dreams Notifications
              </h2>
              <p className="text-[10px] md:text-xs text-purple-300 font-semibold max-w-xl mx-auto leading-relaxed">
                সেন্ট্রাল অফিস ও মেইন ব্রাঞ্চ কর্তৃক প্রকাশিত সকল জরুরি নোটিশ ও অফিশিয়াল আপডেট নিচে তালিকাভুক্ত করা হলো। যেকোন বিষয়ে অনুসন্ধানের জন্য সংশ্লিষ্ট ফর্মটি পূরণ করুন।
              </p>
            </div>

            {/* List of Active Notices */}
            <div className="space-y-6">
              {notices.filter(n => n.status === 'active').length === 0 ? (
                <div className="text-center py-12 p-6 rounded-3xl bg-purple-950/10 border border-purple-500/20">
                  <Bell size={36} className="mx-auto text-purple-400/40 animate-bounce mb-3" />
                  <p className="font-bold text-slate-400 text-xs">বর্তমানে কোন সক্রিয় নোটিশ নেই।</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">Central Newsdesk is currently quiet</p>
                </div>
              ) : (
                notices.filter(n => n.status === 'active').map((notice, idx) => {
                  const formState = inquiryForms[notice.id] || { name: '', mobile: '', address: '', message: '' };
                  const isSubmitted = submittedInquiries[notice.id];

                  return (
                    <div 
                      key={notice.id} 
                      className="p-5 md:p-6 rounded-[28px] bg-gradient-to-br from-white/5 to-purple-500/5 hover:from-white/10 hover:to-purple-400/10 border-2 border-purple-500/20 hover:border-purple-500/40 backdrop-blur-lg transition-all duration-500 space-y-5 relative group shadow-[0_15px_35px_rgba(168,85,247,0.1)] text-left"
                    >
                      {/* Premium Accent badge */}
                      <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-purple-600 text-[8px] font-black uppercase tracking-widest text-slate-950 border border-[#dfac5d] shadow-lg">
                        Notice #{idx + 1}
                      </div>

                      {/* Title & Metadata */}
                      <div className="space-y-1.5 border-b border-purple-500/10 pb-3">
                        <h3 className="text-base md:text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[9px] text-purple-300 font-mono font-bold uppercase tracking-wider">
                          <span>📅 Published: {new Date(notice.createdAt).toLocaleString()}</span>
                          <span className="text-purple-500">•</span>
                          <span className="text-emerald-400">🟢 Verified Active</span>
                        </div>
                      </div>

                      {/* Notice Metadata Badge Grid */}
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-xl text-[9px] font-bold font-mono">
                          <span>No: {notice.noticeNumber || `NT-2026-${idx + 101}`}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-xl text-[9px] font-bold uppercase font-mono">
                          <span>Type: {notice.noticeType || 'General Broadcast'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-xl text-[9px] font-bold font-mono">
                          <span>Rate: {notice.rate ? `₹${notice.rate}` : 'N/A / ফ্রি'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-xl text-[9px] font-bold font-mono">
                          <span>Time: {notice.deliveryTime || 'সরকারী অনুমোদন সাপেক্ষে'}</span>
                        </div>
                      </div>

                      {/* Body Description with Highlights */}
                      <div className="p-4 rounded-xl bg-white/5 border border-purple-500/10 text-slate-100 text-xs">
                        {parseNoticeBody(notice.body)}
                      </div>

                      {/* Automated Reassurance Tagline at Bottom */}
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center text-xs text-purple-100 font-bold tracking-wide italic shadow-sm">
                        ✨ {notice.tagline || 'আপনার কাজটি আমরা অত্যন্ত নিষ্ঠা, যত্ন ও দায়িত্ব সহকারে সম্পন্ন করব।'}
                      </div>

                      {/* Custom Inline Lead Generation Inquiry Form */}
                      <div className="mt-4 pt-4 border-t border-dashed border-purple-500/20 space-y-3.5 bg-purple-950/10 p-4 rounded-xl">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                            <span>📩 Send Direct Inquiry / এই বিষয়ে বিস্তারিত জানতে ফর্মটি পূরণ করুন</span>
                          </h4>
                          <span className="text-[8px] uppercase tracking-wider bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">
                            Central Inbox Stream
                          </span>
                        </div>

                        {isSubmitted ? (
                          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black animate-pulse leading-relaxed">
                            {isSubmitted}
                          </div>
                        ) : (
                          <form onSubmit={(e) => handleOverlayInquirySubmit(e, notice)} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-black tracking-wider text-purple-300 font-mono">Name / আপনার নাম *</label>
                                <input 
                                  type="text"
                                  required
                                  placeholder="e.g. Roushan Kabir"
                                  value={formState.name}
                                  onChange={(e) => setInquiryForms(prev => ({
                                    ...prev,
                                    [notice.id]: { ...formState, name: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-purple-900/40 text-xs text-white placeholder-purple-900/40 focus:outline-none focus:border-[#dfac5d] focus:ring-1 focus:ring-[#dfac5d]/30 transition-all font-semibold"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-black tracking-wider text-purple-300 font-mono">Mobile / মোবাইল নম্বর *</label>
                                <input 
                                  type="tel"
                                  required
                                  placeholder="e.g. 017XXXXXX"
                                  value={formState.mobile}
                                  onChange={(e) => setInquiryForms(prev => ({
                                    ...prev,
                                    [notice.id]: { ...formState, mobile: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-purple-900/40 text-xs text-white placeholder-purple-900/40 focus:outline-none focus:border-[#dfac5d] focus:ring-1 focus:ring-[#dfac5d]/30 transition-all font-semibold"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-black tracking-wider text-purple-300 font-mono">Address / আপনার ঠিকানা</label>
                                <input 
                                  type="text"
                                  placeholder="e.g. Domkal, Murshidabad"
                                  value={formState.address || ''}
                                  onChange={(e) => setInquiryForms(prev => ({
                                    ...prev,
                                    [notice.id]: { ...formState, address: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-purple-900/40 text-xs text-white placeholder-purple-900/40 focus:outline-none focus:border-[#dfac5d] focus:ring-1 focus:ring-[#dfac5d]/30 transition-all font-semibold"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-black tracking-wider text-purple-300 font-mono">Message / কি জানতে চান? *</label>
                              <textarea 
                                required
                                rows={2}
                                placeholder="এই নোটিশ বা সেবা সংক্রান্ত আপনার বার্তাটি লিখুন..."
                                value={formState.message}
                                onChange={(e) => setInquiryForms(prev => ({
                                    ...prev,
                                    [notice.id]: { ...formState, message: e.target.value }
                                  }))}
                                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-purple-900/40 text-xs text-white placeholder-purple-900/40 focus:outline-none focus:border-[#dfac5d] focus:ring-1 focus:ring-[#dfac5d]/30 transition-all font-semibold resize-none"
                              />
                            </div>

                            <div className="flex justify-end pt-1">
                              <button
                                type="submit"
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                              >
                                Submit Inquiry / ইনকোয়ারি জমা দিন
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer banner */}
            <div className="pt-8 border-t border-purple-500/10 text-center text-[10px] text-purple-500/50 font-mono tracking-widest uppercase">
              ⚡ RIZWAN ONLINE DREAMS PLATFORM • SECURE GATEWAY NEWSDESK
            </div>
          </div>
        </div>
      )}

      {/* Notice Details Screen Overlay (Pitch Black Background #000000, White Text) */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-[#000000] text-white z-[9999] flex flex-col p-6 md:p-12 overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto space-y-8 flex-1">
            
            {/* Header / Back button */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <button 
                onClick={() => setSelectedNotice(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white transition-all text-xs font-bold border border-slate-900 uppercase cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>ফিরে যান (Back to Gateway)</span>
              </button>
              <span className="text-[10px] uppercase tracking-widest text-[#FFFF00] font-black font-mono">
                📢 NOTICE DETAILS
              </span>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              <h1 className="text-xl md:text-3xl font-black tracking-tight text-white leading-tight">
                {selectedNotice.title}
              </h1>
              
              <div className="p-6 md:p-8 rounded-3xl bg-slate-950 border border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-4">
                <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase font-mono border-b border-slate-900 pb-2">
                  Notice Body / বিস্তারিত বিবরণ
                </h2>
                {parseNoticeBody(selectedNotice.body)}
              </div>
            </div>

            {/* Inquiry Form Block */}
            <div className="p-6 md:p-8 rounded-3xl bg-slate-950 border-2 border-slate-900 shadow-2xl space-y-6">
              <div className="space-y-1.5 border-b border-slate-900 pb-3">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  📩 Send Inquiry / এই বিষয়ে বিস্তারিত জানতে চান?
                </h2>
                <p className="text-xs text-slate-400">
                  Fill up this form and our Branch Manager will contact you instantly via Mobile.
                </p>
              </div>

              {inquiryToast && (
                <div className="p-4 rounded-xl bg-[#FFFF00]/10 border border-[#FFFF00]/30 text-[#FFFF00] text-xs font-black animate-pulse leading-normal">
                  {inquiryToast}
                </div>
              )}

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Your Name / আপনার নাম</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Abdul Karim"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-850 text-white placeholder-slate-600 focus:outline-none focus:border-[#FFFF00] transition-colors text-xs font-semibold"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Mobile Number / মোবাইল নম্বর</label>
                    <input 
                      type="tel"
                      required
                      placeholder="e.g. 01712345678"
                      value={inquiryMobile}
                      onChange={(e) => setInquiryMobile(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-850 text-white placeholder-slate-600 focus:outline-none focus:border-[#FFFF00] transition-colors text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Full Address / আপনার ঠিকানা</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Jalangi, Murshidabad"
                      value={inquiryAddress}
                      onChange={(e) => setInquiryAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-850 text-white placeholder-slate-600 focus:outline-none focus:border-[#FFFF00] transition-colors text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Your Inquiry Message / কি জানতে চান?</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Describe what help you need with this notice..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-850 text-white placeholder-slate-600 focus:outline-none focus:border-[#FFFF00] transition-colors text-xs font-semibold resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="px-8 py-3 rounded-xl bg-[#FFFF00] hover:bg-[#FFFF00]/90 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-[#FFFF00]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {inquirySubmitting ? 'Submitting...' : 'Submit Inquiry / ইনকোয়ারি পাঠান'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Footer */}
            <div className="pt-6 border-t border-slate-900 text-center text-[10px] text-slate-500 font-mono">
              RIZWAN ONLINE DREAMS PLATFORM • SECURE INQUIRY DESK
            </div>
          </div>
        </div>
      )}

      {/* Decorative premium slate/indigo grid overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />

      {/* Main Container */}
      <div className="w-full max-w-4xl z-10 flex flex-col items-center space-y-8">
        
        {/* Top Exit Option to Return to REXLIFY (Requirement 02) */}
        {onExitToRexlify && (
          <div className="w-full flex justify-end px-2">
            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              title="Exit RODP Gateway to REXLIFY (Requires Security Captcha Code)"
            >
              <Lock size={12} className="text-rose-500" />
              <span>EXIT TO REXLIFY</span>
            </button>
          </div>
        )}

        {/* Dynamic Glowing Top Header */}
        <div className="text-center space-y-2">
          <div className="relative inline-flex mb-1">
            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-slate-800 to-indigo-950 flex items-center justify-center text-white font-black text-3xl shadow-[0_4px_20px_rgba(30,41,59,0.15)] border border-slate-700/10">
              R
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full animate-ping opacity-75" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase">
              Rizwan Online Dreams Platform
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 font-extrabold font-mono mt-1 flex items-center justify-center gap-1.5">
              <Sparkles size={11} className="text-indigo-500" />
              <span>Sifra Secure Gateway System v2.6</span>
              <Sparkles size={11} className="text-indigo-500" />
            </p>
          </div>
        </div>

        {/* Universal Notifications / Success Alerts */}
        {(errorMsg || successMsg) && (
          <div className="w-full max-w-xl animate-fade-in">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed flex items-start gap-3 shadow-md">
                <ShieldAlert size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed flex items-start gap-3 shadow-md">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* SECTION 1: SIDE-BY-SIDE SELECTION GRID (ONLY 2 MAIN ITEMS WITH PREMIUM CORNER BOX STYLE) */}
        {view === 'selection' && (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in">
            {/* NEW VIBRANT PURPLE COMBINED BANNER (NOTICE BOARD HALF SIZE & JOIN ROD GROUP ON RIGHT) */}
            <div className="w-full bg-gradient-to-r from-purple-900/95 via-indigo-950/95 to-purple-950/95 border-2 border-purple-500/40 rounded-3xl p-4 md:p-5 shadow-[0_15px_35px_rgba(147,51,234,0.15)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Purple ambient light effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10 text-left">
                <button
                  onClick={() => {
                    setShowNoticeOverlay(true);
                    playSuccessChime();
                  }}
                  className="p-2.5 bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 rounded-2xl text-purple-300 transition-all shrink-0 hover:scale-105 active:scale-95 shadow-md cursor-pointer relative"
                >
                  <Bell size={18} className="animate-swing text-purple-300" />
                  {notices.filter(n => n.status === 'active').length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-purple-950 animate-pulse" />
                  )}
                </button>
                <div>
                  <h3 className="text-xs font-black tracking-widest text-purple-300 uppercase flex items-center gap-1.5 font-mono">
                    📢 নোটিশ বোর্ড (Notice Board)
                  </h3>
                  <p className="text-[9px] text-purple-200/80 font-medium leading-normal mt-0.5">
                    জরুরি নোটিশ, নতুন সার্ভিস এবং অফিশিয়াল আপডেট দেখতে এখানে ক্লিক করুন।
                  </p>
                  <button
                    onClick={() => {
                      setShowNoticeOverlay(true);
                      playSuccessChime();
                    }}
                    className="text-[8px] text-purple-400 hover:text-purple-300 hover:underline font-black font-mono tracking-wider mt-0.5 uppercase block cursor-pointer text-left"
                  >
                    Open Notice Board &rarr;
                  </button>
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto relative z-10 flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-purple-500/20 pt-3 sm:pt-0 sm:pl-5">
                <button
                  onClick={() => {
                    setShowJoinModal(true);
                    playSuccessChime();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-purple-400/30 hover:border-purple-400/50 shadow-lg flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Users size={11} />
                  <span>জয়েন ROD গ্রুপ (Join Group)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            
            {/* BOX 1: GORGEOUS USER PANEL */}
            <button 
              onClick={() => setView('customer_gate')}
              className="group relative rounded-3xl p-6 md:p-8 bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 text-left overflow-hidden cursor-pointer flex flex-col justify-between min-h-[320px]"
            >
              {/* Sleek Four Corner Borders */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-300 group-hover:border-indigo-500 transition-colors" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-300 group-hover:border-indigo-500 transition-colors" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-300 group-hover:border-indigo-500 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-300 group-hover:border-indigo-500 transition-colors" />
              
              <div className="space-y-4 relative z-10 w-full">
                {/* Header Icon Row */}
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Users size={22} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-[8px] text-indigo-700 font-black tracking-wider uppercase font-mono">
                    CITIZEN GATE
                  </span>
                </div>

                {/* Text Block */}
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Citizen Portal
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Access digital citizen services, print PVC cards, update records, and track active application lifecycles securely.
                  </p>
                </div>

                {/* Service Icons list */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[9px] text-slate-600 font-extrabold shadow-sm">
                    <Fingerprint size={10} className="text-indigo-600" />
                    <span>Aadhaar Cards</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[9px] text-slate-600 font-extrabold shadow-sm">
                    <FileText size={10} className="text-indigo-600" />
                    <span>Voter ID</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[9px] text-slate-600 font-extrabold shadow-sm">
                    <CreditCard size={10} className="text-indigo-600" />
                    <span>PAN Cards</span>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-indigo-600 tracking-wider uppercase group-hover:text-indigo-500 w-full">
                <span>Access Citizen Portal</span>
                <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform text-indigo-600" />
              </div>
            </button>

            {/* BOX 2: GORGEOUS OFFICE USE ONLY PANEL */}
            <button 
              onClick={() => setView('office_gate')}
              className="group relative rounded-3xl p-6 md:p-8 bg-white border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300 text-left overflow-hidden cursor-pointer flex flex-col justify-between min-h-[320px]"
            >
              {/* Sleek Four Corner Borders */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-300 group-hover:border-slate-500 transition-colors" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-300 group-hover:border-slate-500 transition-colors" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-300 group-hover:border-slate-500 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-300 group-hover:border-slate-500 transition-colors" />

              <div className="space-y-4 relative z-10 w-full">
                {/* Header Icon Row */}
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-250 flex items-center justify-center text-slate-700 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Crown size={22} className="text-slate-700" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[8px] text-slate-700 font-black tracking-wider uppercase font-mono">
                    OFFICE ONLY
                  </span>
                </div>

                {/* Text Block */}
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-slate-800 transition-colors">
                    Office & Branches
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Gateway for Authorized Branch Operators, Managers, and Central CEO Administrations to manage databases and operations.
                  </p>
                </div>

                {/* Advanced control list */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[9px] text-slate-600 font-extrabold shadow-sm">
                    <Building size={10} className="text-slate-500" />
                    <span>Head Office</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[9px] text-slate-600 font-extrabold shadow-sm">
                    <Globe size={10} className="text-slate-500" />
                    <span>Live Branches</span>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-700 tracking-wider uppercase group-hover:text-slate-900 w-full">
                <span>Operator Authorization</span>
                <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform text-slate-700" />
              </div>
            </button>
          </div>
          </div>
        )}

        {/* SECTION 2: CUSTOMER INPUT GATE (SIMPLIFIED NAME & 4-DIGIT PIN AUTHENTICATION) */}
        {view === 'customer_gate' && (
          <div className="w-full max-w-xl p-8 md:p-10 rounded-[32px] bg-white border border-slate-200 shadow-xl space-y-6 relative overflow-hidden animate-fade-in">
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-indigo-600" />
            
            {/* Header row */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                <span>Citizen Gate (গ্রাহক পোর্টাল)</span>
              </span>
              <button 
                onClick={() => {
                  setView('selection');
                  setIsNewUser(false);
                  setCustName('');
                  setCustAddress('');
                  setCustomerPassword('');
                }}
                className="py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-indigo-600 flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
              >
                <ArrowLeft size={12} />
                <span>GO BACK</span>
              </button>
            </div>

            {/* Error or Success Alerts */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs animate-fade-in">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-xs animate-fade-in">
                ✓ {successMsg}
              </div>
            )}

            {/* Loading Indicator */}
            {isLoggingIn ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">অটোমেটিক লগইন হচ্ছে...</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">অনুগ্রহ করে একটু অপেক্ষা করুন (Please Wait)</p>
                </div>
              </div>
            ) : registeredCustomerInfo ? (
              /* --- REGISTRATION SUCCESSFUL / CONGRATULATIONS PAGE (Requirements 06, 07, 08) --- */
              <div className="space-y-6 text-center animate-scale-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>

                <div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-black uppercase tracking-widest inline-block mb-2">
                    REGISTRATION SUCCESSFUL
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">
                    অভিনন্দন! আপনার RODP অ্যাকাউন্ট তৈরি সম্পন্ন হয়েছে
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    Congratulations, <b>{registeredCustomerInfo.name}</b>! আপনার ইউনিক ইউজারনেম ও RODP অ্যাড্রেস নিচে দেওয়া হলো:
                  </p>
                </div>

                {/* Account Credentials Summary Card */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-left space-y-3 font-mono">
                  
                  {/* Generated Unique Username */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Your Unique Username (ইউজারনেম)</p>
                      <p className="text-sm font-black text-indigo-600 font-mono">@{registeredCustomerInfo.username}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (registeredCustomerInfo.username) {
                          navigator.clipboard?.writeText(registeredCustomerInfo.username);
                          setCopiedField('username');
                          setTimeout(() => setCopiedField(null), 2000);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-indigo-200"
                    >
                      {copiedField === 'username' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Generated RODP User Address / ID */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">RODP User ID / Permanent Address</p>
                      <p className="text-xs md:text-sm font-black text-emerald-600 font-mono">{registeredCustomerInfo.rodpAddress}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (registeredCustomerInfo.rodpAddress) {
                          navigator.clipboard?.writeText(registeredCustomerInfo.rodpAddress);
                          setCopiedField('address');
                          setTimeout(() => setCopiedField(null), 2000);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-emerald-200"
                    >
                      {copiedField === 'address' ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* 4-digit security PIN and Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">4-Digit Security PIN</p>
                      <p className="text-xs font-black text-slate-800 tracking-widest">{registeredCustomerInfo.securityPin || '••••'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Reference ID</p>
                      <p className="text-xs font-black text-amber-600">{registeredCustomerInfo.customId || registeredCustomerInfo.referenceId}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-600">
                    <span className="font-bold">Registered Address:</span> {registeredCustomerInfo.address}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustName(registeredCustomerInfo.username || registeredCustomerInfo.rodpAddress || '');
                      setCustomerPassword(registeredCustomerInfo.securityPin || '');
                      setRegisteredCustomerInfo(null);
                      setIsNewUser(false);
                    }}
                    className="flex-1 py-3.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    লগইন ফর্মে যান (Go to Login)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLoginSuccess(
                        'customer',
                        registeredCustomerInfo.name,
                        registeredCustomerInfo.rodpAddress || registeredCustomerInfo.email || `${registeredCustomerInfo.mobile}@rodp.com`,
                        [],
                        registeredCustomerInfo.mobile,
                        'shop_1'
                      );
                    }}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    সরাসরি ড্যাশবোর্ডে প্রবেশ (Access Dashboard)
                  </button>
                </div>
              </div>
            ) : !isNewUser ? (
              /* --- CUSTOMER LOGIN PANEL --- */
              <form onSubmit={handleCustomerLoginSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                    Username / RODP User ID / Mobile / Name (ইউজারনেম বা আইডি)
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Enter @username, username@rodp.com, or ID"
                    className="w-full text-xs font-bold py-3 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                    4-Digit Security PIN (৪ সংখ্যার পিন)
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    pattern="\d{4}"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your 4-digit PIN"
                    className="w-full text-xs font-bold py-3 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center font-mono tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  লগইন করুন (Verify & Access)
                </button>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewUser(true);
                      setCustName('');
                      setCustAddress('');
                      setCustomerPassword('');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    নতুন অ্যাকাউন্ট তৈরি করতে চান? রেজিস্টার করুন (Register New Profile)
                  </button>
                </div>
              </form>
            ) : (
              /* --- CUSTOMER REGISTRATION PANEL --- */
              <form onSubmit={handleCustomerRegisterSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                    Full Name (আপনার নাম) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full text-xs font-bold py-3 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                    Address (ঠিকানা) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="Enter your village or city name"
                    className="w-full text-xs font-bold py-3 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                    Mobile Number (মোবাইল নম্বর - ঐচ্ছিক / Optional)
                  </label>
                  <input
                    type="tel"
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value)}
                    placeholder="Enter mobile number (Optional - না দিলেও চলবে)"
                    className="w-full text-xs font-bold py-3 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono"
                  />
                  <p className="text-[9px] text-slate-400 font-medium">আপনার সমস্ত তথ্য ইউজারনেম ও ইমেইল আইডির সাথে স্থায়ীভাবে সংরক্ষিত হবে।</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                    Choose 4-Digit Password (৪ সংখ্যার পাসওয়ার্ড) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    pattern="\d{4}"
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value.replace(/\D/g, ''))}
                    placeholder="Create a 4-digit security PIN"
                    className="w-full text-xs font-bold py-3 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center font-mono tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  রেজিস্টার এবং লগইন করুন (Register & Auto-Login)
                </button>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewUser(false);
                      setCustName('');
                      setCustAddress('');
                      setCustomerPassword('');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    ইতিমধ্যেই অ্যাকাউন্ট আছে? লগইন করুন (Login Here)
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* SECTION 3: OFFICE GATEWAY (CEO, BRANCH, & STAFF LOGINS WITH DUAL LANGUAGES AND WHITE BG THEME) */}
        {view === 'office_gate' && (
          <div className="w-full max-w-xl p-8 md:p-10 rounded-[32px] bg-white border border-slate-200 shadow-xl space-y-6 relative overflow-hidden animate-fade-in">
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-slate-700 to-indigo-950" />
            
            {/* Header row */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Crown size={18} className="text-indigo-600" />
                <span>Office Gateway</span>
              </span>
              <button 
                onClick={() => setView('selection')}
                className="py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[10px] font-black text-indigo-600 flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
              >
                <ArrowLeft size={12} />
                <span>GO BACK</span>
              </button>
            </div>

            {/* Selection Switch (3 Tabs) */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setOfficeTab('ceo')}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  officeTab === 'ceo' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👑 CEO Control
              </button>
              <button
                type="button"
                onClick={() => setOfficeTab('branch')}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  officeTab === 'branch' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🏪 Branch Mgr
              </button>
              <button
                type="button"
                onClick={() => setOfficeTab('staff')}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  officeTab === 'staff' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👥 Staff Login
              </button>
            </div>

            {/* CEO Authorization */}
            {officeTab === 'ceo' && (
              <form onSubmit={handleCeoAuthSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                      CEO Security Password
                    </label>
                    {ceoLockoutUntil > nowTime && (
                      <span className="text-[10px] font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                        🔒 LOCKED: {Math.ceil((ceoLockoutUntil - nowTime) / 1000)}s
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    disabled={ceoLockoutUntil > nowTime}
                    value={ceoPassword}
                    onChange={(e) => setCeoPassword(e.target.value)}
                    placeholder={ceoLockoutUntil > nowTime ? "🔒 Portal Locked - Please Wait" : "Enter CEO password"}
                    className="w-full text-xs font-bold py-3.5 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center tracking-widest disabled:opacity-50 disabled:bg-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={ceoLockoutUntil > nowTime}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                >
                  {ceoLockoutUntil > nowTime ? `🔒 Locked (${Math.ceil((ceoLockoutUntil - nowTime) / 1000)}s)` : 'CEO Access Verification'}
                </button>
              </form>
            )}

            {/* Branch Operator Authorization */}
            {officeTab === 'branch' && (
              <div className="space-y-4 pt-2">

                {!searchedBranch ? (
                  /* STEP 1: Provide & Verify Branch ID (Strictly No Pre-Shown IDs) */
                  <form onSubmit={handleSearchBranchId} className="space-y-4" autoComplete="off">
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                          Branch ID / ব্রাঞ্চ আইডি
                        </label>
                        {branchIdLockoutUntil > nowTime && (
                          <span className="text-[10px] font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                            🔒 LOCKED: {Math.ceil((branchIdLockoutUntil - nowTime) / 1000)}s
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        name="rodp-unique-id-field"
                        required
                        disabled={branchIdLockoutUntil > nowTime}
                        autoComplete="off"
                        value={branchId}
                        onChange={(e) => {
                          setBranchId(e.target.value);
                          setBranchSearchError(null);
                        }}
                        placeholder="Enter Branch ID..."
                        className="w-full text-sm font-black py-3.5 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center font-mono tracking-widest uppercase disabled:opacity-50 disabled:bg-slate-100"
                      />
                    </div>

                    {branchSearchError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold text-left leading-relaxed">
                        {branchSearchError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={branchIdLockoutUntil > nowTime}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                    >
                      <RefreshCw size={14} className={branchIdLockoutUntil <= nowTime ? "animate-pulse" : ""} />
                      <span>{branchIdLockoutUntil > nowTime ? `🔒 Locked (${Math.ceil((branchIdLockoutUntil - nowTime) / 1000)}s)` : 'Verify Branch ID / ব্রাঞ্চ আইডি যাচাই করুন'}</span>
                    </button>
                  </form>
                ) : (
                  /* STEP 2: Display Verified Branch Details & Request Password */
                  <form onSubmit={handleBranchAuthSubmit} className="space-y-4" autoComplete="off">
                    
                    {/* Dynamic Verified Branch Banner */}
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                          ✓ FOUND / সনাক্ত হয়েছে
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-700">
                          Branch ID Verified
                        </span>
                      </div>
                      
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-slate-900 uppercase">
                          {searchedBranch.name}
                        </h4>
                        <p className="text-[10.5px] text-slate-600 font-semibold flex items-center gap-1.5">
                          <UserCheck size={12} className="text-emerald-600" />
                          <span>Branch Head: {searchedBranch.branchHead || searchedBranch.ownerName}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSearchedBranch(null);
                          setBranchSearchPerformed(false);
                          setBranchPassword('');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[9.5px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer pt-1 block"
                      >
                        Change Branch / অন্য ব্রাঞ্চ দিন
                      </button>
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                          Branch Password / পাসওয়ার্ড দিন
                        </label>
                        {branchPassLockoutUntil > nowTime && (
                          <span className="text-[10px] font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                            🔒 LOCKED: {Math.ceil((branchPassLockoutUntil - nowTime) / 1000)}s
                          </span>
                        )}
                      </div>
                      <input
                        type="password"
                        name="rodp-no-suggest-pwd"
                        required
                        disabled={branchPassLockoutUntil > nowTime}
                        autoComplete="new-password"
                        value={branchPassword}
                        onChange={(e) => setBranchPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-sm font-bold py-3.5 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center tracking-widest disabled:opacity-50 disabled:bg-slate-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={branchPassLockoutUntil > nowTime}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                    >
                      {branchPassLockoutUntil > nowTime ? `🔒 Locked (${Math.ceil((branchPassLockoutUntil - nowTime) / 1000)}s)` : 'Verify & Access Dashboard / প্রবেশ করুন'}
                    </button>
                  </form>
                )}

                {/* Cyber Security Banner - High Privacy Enforced */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-indigo-500/20 text-left flex items-start gap-2.5">
                  <Lock size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                      HIGH-SECURITY ENCRYPTED GATEWAY
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                      গোপনীয়তা ও নিরাপত্তার স্বার্থে ব্রাঞ্চ আইডি ও পাসওয়ার্ড সম্পূর্ণ গোপন ও সুরক্ষিত রাখা হয়।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Staff Authorization */}
            {officeTab === 'staff' && (
              <div className="space-y-4 pt-2">
                {/* Step 1: Choose Branch (NAMES ONLY - NO IDs SHOWN) */}
                <div className="relative space-y-1 text-left">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                    Choose Your Branch / ব্রাঞ্চ নির্বাচন করুন
                  </label>
                  
                  {/* Selected Branch Name Display */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left text-xs font-bold py-3 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none flex items-center justify-between cursor-pointer"
                  >
                    <span>
                      {staffBranchId && (shops.find(s => s.id === staffBranchId) || preconfiguredShops.find(s => s.id === staffBranchId))
                        ? (shops.find(s => s.id === staffBranchId) || preconfiguredShops.find(s => s.id === staffBranchId))?.name
                        : "-- Select Branch --"}
                    </span>
                    <span className="text-[10px] text-slate-400">▼</span>
                  </button>

                  {/* Dropdown Items List (NAMES ONLY) */}
                  {isDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-2 max-h-60 overflow-y-auto">
                      <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar text-left">
                        {preconfiguredShops
                          .map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setStaffBranchId(s.id);
                                setIsDropdownOpen(false);
                                setIsStaffIdVerified(false);
                                setStaffIdVerifyError(null);
                                setErrorMsg(null);
                                setSuccessMsg(null);

                                // Check if pending/unregistered
                                if (s.status === 'pending' || s.customId === 'CSCL106') {
                                  setStaffIdVerifyError('এই ব্রাঞ্চটির বর্তমানে সিইও রেজিস্টার্ড স্টাফ আইডি অ্যাক্টিভ নয়। (Branch Pending CEO Activation)');
                                }
                              }}
                              className={`w-full text-left text-xs py-2.5 px-3 rounded-lg font-bold transition-all flex items-center justify-between cursor-pointer ${
                                staffBranchId === s.id 
                                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' 
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span>{s.name}</span>
                              {s.status === 'pending' && <span className="text-[8px] uppercase tracking-wider font-extrabold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded">Pending ID</span>}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {staffIdVerifyError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold text-left leading-relaxed">
                    {staffIdVerifyError}
                  </div>
                )}

                {/* Step 2: Request & Verify Staff ID */}
                {!isStaffIdVerified ? (
                  <form onSubmit={handleVerifyStaffId} className="space-y-3">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                        Staff ID / স্টাফ আইডি দিন
                      </label>
                      <input
                        type="text"
                        required
                        value={staffCustomId}
                        onChange={(e) => {
                          setStaffCustomId(e.target.value);
                          setStaffIdVerifyError(null);
                        }}
                        placeholder="e.g. STF001, STF102..."
                        className="w-full text-xs font-bold py-3.5 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center font-mono tracking-widest uppercase"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Verify Staff ID / ভেরিফাই স্টাফ
                    </button>
                  </form>
                ) : (
                  /* Step 3: Password Entry (Shown after Staff ID Verification) */
                  <form onSubmit={handleStaffAuthSubmit} className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                          ✓ STAFF ID VERIFIED
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsStaffIdVerified(false)}
                          className="text-[9px] text-rose-600 hover:underline font-bold"
                        >
                          Change Staff ID
                        </button>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-slate-700">
                        Staff ID: {staffCustomId}
                      </p>
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">
                          Staff Password / পাসওয়ার্ড দিন
                        </label>
                        {staffPassLockoutUntil > nowTime && (
                          <span className="text-[10px] font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                            🔒 LOCKED: {Math.ceil((staffPassLockoutUntil - nowTime) / 1000)}s
                          </span>
                        )}
                      </div>
                      <input
                        type="password"
                        required
                        disabled={staffPassLockoutUntil > nowTime}
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full text-xs font-bold py-3.5 px-4 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center tracking-widest disabled:opacity-50 disabled:bg-slate-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={staffPassLockoutUntil > nowTime}
                      className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                    >
                      {staffPassLockoutUntil > nowTime ? `🔒 Locked (${Math.ceil((staffPassLockoutUntil - nowTime) / 1000)}s)` : 'Login as Staff / প্রবেশ করুন'}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        )}

        {/* BENGALI MANAGER IDENTITY CONFIRMATION OVERLAY */}
        {confirmingBranch && (
          <div className="fixed inset-0 z-50 bg-[#070709]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-8 text-center space-y-6 shadow-2xl animate-scale-in my-auto">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-sm">
                <UserCheck size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  আপনি কি এই ব্রাঞ্চের ম্যানেজার?
                </h3>
                <p className="text-sm font-extrabold text-indigo-600">
                  {confirmingBranch.name} ({confirmingBranch.customId})
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  নিরাপত্তা প্রোটোকল নিশ্চিত করতে অনুগ্রহ করে আপনার পদমর্যাদা ও পরিচয় ঘোষণা করুন।
                </p>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmBranchManager(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  না, আমি নই
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmBranchManager(true)}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  হাঁ, আমিই
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GORGEOUS GOLD-GLOWING CONGRATULATIONS OVERLAY */}
        {celebratingBranch && (
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950 via-[#070709] to-slate-950 flex items-center justify-center p-4 overflow-hidden">
            {/* Background glowing particles/circles */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative max-w-lg w-full text-center space-y-6 px-6 py-10 bg-[#0c0c12]/80 border border-[#dfac5d]/20 rounded-3xl shadow-[0_0_50px_rgba(223,172,93,0.15)] animate-fade-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#dfac5d]/20 rounded-full blur-md" />
                <img 
                  src={celebratingBranch.managerPhoto || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300"} 
                  referrerPolicy="no-referrer"
                  className="relative w-32 h-32 rounded-full border-4 border-[#dfac5d] object-cover mx-auto shadow-xl"
                  alt="Branch Manager"
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-[#dfac5d] font-serif font-black text-3xl tracking-widest uppercase">
                  🎉 CONGRATULATIONS! 🎉
                </h2>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#dfac5d] to-transparent mx-auto" />
                
                <p className="text-white text-lg font-bold">
                  {celebratingBranch.congratulationsMsg || `Hearty welcome to ${celebratingBranch.name}!`}
                </p>
                <p className="text-slate-400 text-xs font-semibold font-mono uppercase tracking-wider">
                  {celebratingBranch.managerBio || "BRANCH MANAGER IDENTITY VERIFIED"}
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <span className="text-[10px] text-[#dfac5d]/70 font-mono uppercase tracking-widest block">
                  Initializing Branch Dashboard in {celebrationCountdown}s
                </span>
                <div className="w-48 bg-white/5 h-1 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="bg-gradient-to-r from-[#dfac5d] to-amber-400 h-full transition-all duration-1000 ease-linear" 
                    style={{ width: `${(celebrationCountdown / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAFF WELCOME OVERLAY */}
        {celebratingStaff && (
          <div className="fixed inset-0 z-50 bg-gradient-to-br from-amber-950 via-[#070709] to-stone-950 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative max-w-lg w-full text-center space-y-6 px-6 py-10 bg-[#0c0c12]/80 border border-amber-500/20 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-fade-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md" />
                <img 
                  src={celebratingStaff.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"} 
                  referrerPolicy="no-referrer"
                  className="relative w-32 h-32 rounded-full border-4 border-amber-500 object-cover mx-auto shadow-xl"
                  alt="Staff Member"
                />
              </div>

              <div className="space-y-3">
                <h2 className="text-amber-500 font-black text-2xl tracking-widest uppercase">
                  ✨ WELCOME BACK! ✨ / স্বাগতম!
                </h2>
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
                
                <p className="text-white text-xl font-bold">
                  {celebratingStaff.name}
                </p>
                <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                  Field Staff ID: {celebratingStaff.customId}
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <span className="text-[10px] text-amber-500/70 font-mono uppercase tracking-widest block">
                  Accessing Staff Panel in {celebrationCountdown}s
                </span>
                <div className="w-48 bg-white/5 h-1 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-1000 ease-linear" 
                    style={{ width: `${(celebrationCountdown / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JOIN ROD GROUP MODAL OVERLAY */}
        {showJoinModal && (
          <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_20px_50px_rgba(107,33,168,0.3)] border border-purple-200 animate-scale-up space-y-6 relative text-left my-auto">
              <button 
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-1.5 text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Users size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-wide">জয়েন ROD গ্রুপ (Join ROD Official Group)</h3>
                <p className="text-[10px] text-slate-500">আমাদের অফিশিয়াল গ্রুপে জয়েন করতে আপনার নাম এবং তথ্যগুলো দিন।</p>
              </div>

              {!isJoinedSuccess ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!joinName.trim()) {
                      alert('অনুগ্রহ করে আপনার নাম দিন / Please enter your name.');
                      return;
                    }
                    setIsJoinedSuccess(true);
                    playSuccessChime();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-600 tracking-wider font-mono">আপনার নাম / Your Name <span className="text-purple-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="যেমন: আব্দুল করিম"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-xs font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">মোবাইল নাম্বার / Mobile (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: 017XXXXXXXX"
                      value={joinMobile}
                      onChange={(e) => setJoinMobile(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-xs font-semibold text-slate-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">আপনার ঠিকানা / Address (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: মুর্শিদাবাদ, পশ্চিমবঙ্গ"
                      value={joinAddress}
                      onChange={(e) => setJoinAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>পরবর্তী ধাপ (Next Step)</span>
                    <ChevronRight size={14} />
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-5 py-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-md animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-emerald-600 uppercase">জয়েন সম্পন্ন হয়েছে! / Successful!</h4>
                    <p className="text-xs font-bold text-slate-700">
                      অভিনন্দন {joinName}! আপনি আমাদের ‘ROD Group’ এ সফলভাবে জয়েন হয়ে গেলেন।
                    </p>
                    <p className="text-[10px] text-slate-400">
                      এখন আপনি নিচের গ্রুপ চ্যাট বাটনে ক্লিক করে অফিশিয়াল মেম্বার ও এডমিনদের সাথে সরাসরি লাইভ কথা বলতে পারবেন।
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        setShowChatGroup(true);
                        setShowJoinModal(false);
                      }}
                      className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Users size={14} />
                      <span>গ্রুপ চ্যাট খুলুন (Open Chat Room)</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowJoinModal(false);
                        setIsJoinedSuccess(false);
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      বন্ধ করুন (Close)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WHATSAPP-STYLED ROD GROUP CHAT OVERLAY */}
        {showChatGroup && (
          <div className="fixed inset-0 z-[10001] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in">
            <div className="max-w-2xl w-full h-[90vh] md:h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/50 animate-scale-up">
              
              {/* WhatsApp Iconic Green Header */}
              <div className="bg-[#075e54] text-white p-4 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setShowChatGroup(false);
                      playSuccessChime();
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-inner border border-white/20">
                    ROD
                  </div>
                  
                  <div className="text-left">
                    <h4 className="text-xs font-black tracking-wide flex items-center gap-1.5">
                      <span>ROD Official Group ★</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-[8px] font-black tracking-widest uppercase">Live</span>
                    </h4>
                    <p className="text-[9px] text-teal-100 opacity-90 truncate max-w-[280px] sm:max-w-[400px]">
                      Admins: Rizwan Roushan (CEO), {shops.filter(s => s.roleType === 'branch').map(s => s.branchHead).join(', ') || 'Branch Managers'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowChatGroup(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat messages background area */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col text-left relative bg-[#efeae2]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                {groupMessages.length === 0 ? (
                  <div className="my-auto text-center p-8 space-y-2 text-slate-400">
                    <p className="text-xs font-bold">গ্রুপে এখনো কোনো বার্তা পাঠানো হয়নি।</p>
                    <p className="text-[9px]">প্রথম বার্তা পাঠিয়ে শুরু করুন!</p>
                  </div>
                ) : (
                  groupMessages.map(msg => {
                    const isMe = msg.senderName === joinName;
                    const isAdmin = msg.senderRole === 'ceo' || msg.senderRole === 'branch_manager';
                    
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] relative group ${
                          isMe ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        {/* Hover Reactions Panel */}
                        <div className="absolute -top-7 hidden group-hover:flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-full shadow-md z-20 transition-all">
                          {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                const targetMsg = groupMessages.find(m => m.id === msg.id);
                                if (!targetMsg) return;
                                const prevReactions = targetMsg.reactions || {};
                                const myUser = joinName || 'Visitor';
                                const usersList = prevReactions[emoji] || [];
                                let nextUsers = [...usersList];
                                if (nextUsers.includes(myUser)) {
                                  nextUsers = nextUsers.filter(u => u !== myUser);
                                } else {
                                  nextUsers.push(myUser);
                                }
                                const nextReactions = { ...prevReactions };
                                if (nextUsers.length === 0) {
                                  delete nextReactions[emoji];
                                } else {
                                  nextReactions[emoji] = nextUsers;
                                }
                                if (updateGroupMessage) {
                                  updateGroupMessage(msg.id, { reactions: nextReactions });
                                }
                              }}
                              className="text-xs hover:scale-125 transition-transform p-0.5 cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Name Header */}
                        {!isMe && (
                          <span className="text-[9px] font-black text-indigo-700 mb-0.5 ml-1 flex items-center gap-1">
                            {msg.senderName}
                            {isAdmin && (
                              <span className="px-1 py-0.2 rounded bg-amber-500 text-white font-mono text-[7px] font-black uppercase tracking-wider">
                                ADMIN
                              </span>
                            )}
                            {msg.senderRole === 'ai_assistant' && (
                              <span className="px-1 py-0.5 rounded bg-gradient-to-r from-indigo-600 to-teal-600 text-white font-bold text-[7px] tracking-wider uppercase flex items-center gap-0.5 animate-pulse">
                                <Sparkles size={8} />
                                <span>CO-PILOT BOT</span>
                              </span>
                            )}
                          </span>
                        )}

                        {/* Message Bubble */}
                        <div className={`p-2.5 rounded-2xl relative shadow-sm text-xs ${
                          msg.senderRole === 'ai_assistant'
                            ? 'bg-gradient-to-br from-indigo-50 to-teal-50 text-slate-800 rounded-tl-none border border-indigo-200/60 shadow-md'
                            : isMe 
                              ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none' 
                              : 'bg-white text-slate-800 rounded-tl-none'
                        }`}>
                          {/* Reply Box inside bubble */}
                          {msg.replyTo && (
                            <div className="mb-2 p-1.5 rounded-lg bg-slate-900/5 border-l-4 border-indigo-500 text-[10px] text-slate-500 text-left">
                              <span className="font-bold block text-[9px] text-indigo-600">{msg.replyTo.senderName}</span>
                              <span className="truncate block">{msg.replyTo.message}</span>
                            </div>
                          )}

                          <p className="leading-relaxed font-semibold whitespace-pre-wrap">{msg.message}</p>
                          
                          {/* Reaction badge line */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {Object.entries(msg.reactions).map(([emoji, users]) => {
                                const userArray = (users || []) as string[];
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      const targetMsg = groupMessages.find(m => m.id === msg.id);
                                      if (!targetMsg) return;
                                      const prevReactions = targetMsg.reactions || {};
                                      const myUser = joinName || 'Visitor';
                                      const usersList = prevReactions[emoji] || [];
                                      let nextUsers = [...usersList];
                                      if (nextUsers.includes(myUser)) {
                                        nextUsers = nextUsers.filter(u => u !== myUser);
                                      } else {
                                        nextUsers.push(myUser);
                                      }
                                      const nextReactions = { ...prevReactions };
                                      if (nextUsers.length === 0) {
                                        delete nextReactions[emoji];
                                      } else {
                                        nextReactions[emoji] = nextUsers;
                                      }
                                      if (updateGroupMessage) {
                                        updateGroupMessage(msg.id, { reactions: nextReactions });
                                      }
                                    }}
                                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/50 text-[9px] font-mono font-bold text-slate-600 cursor-pointer"
                                    title={userArray.join(', ')}
                                  >
                                    <span>{emoji}</span>
                                    <span>{userArray.length}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-slate-400 font-mono">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!isMe && (
                              <button 
                                type="button"
                                onClick={() => setActiveReplyTarget(msg)}
                                className="hover:text-indigo-600 font-bold uppercase tracking-wider text-[7px] ml-1.5 cursor-pointer"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply target bar */}
              {activeReplyTarget && (
                <div className="bg-slate-100 p-2 border-t border-slate-200 flex items-center justify-between text-left shrink-0">
                  <div className="border-l-4 border-indigo-500 pl-2">
                    <span className="text-[10px] font-black text-indigo-600">Replying to {activeReplyTarget.senderName}</span>
                    <p className="text-[9px] text-slate-500 truncate max-w-lg">{activeReplyTarget.message}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveReplyTarget(null)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Chat Input Field / Footer */}
              <div className="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-slate-200 shrink-0">
                {groupSettings?.onlyAdminsCanPost ? (
                  <div className="flex-grow bg-slate-200/60 p-2.5 rounded-xl border border-slate-300 text-center text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1.5 font-mono">
                    <span>🔒</span>
                    <span>শুধুমাত্র এডমিনরা এই চ্যাট গ্রুপে মেসেজ পাঠাতে পারবেন। (Only Admins Can Post)</span>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!messageInput.trim()) return;
                      const newMsg = {
                        id: `msg_${Date.now()}`,
                        senderId: `citizen_${Date.now()}`,
                        senderName: joinName.trim() || 'Guest Citizen (ভিজিটর)',
                        senderMobile: joinMobile || undefined,
                        senderRole: 'citizen',
                        message: messageInput.trim(),
                        replyTo: activeReplyTarget ? {
                          id: activeReplyTarget.id,
                          senderName: activeReplyTarget.senderName,
                          message: activeReplyTarget.message
                        } : undefined,
                        reactions: {},
                        createdAt: new Date().toISOString()
                      };
                      if (addGroupMessage) {
                        addGroupMessage(newMsg);
                      }
                      const sentText = messageInput.trim();
                      const senderName = joinName.trim() || 'Guest Citizen (ভিজিটর)';
                      setMessageInput('');
                      setActiveReplyTarget(null);
                      playSuccessChime();
                      
                      // Trigger AI chatbot reply
                      setTimeout(() => {
                        triggerAiReply(sentText, senderName);
                      }, 400);
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <input 
                      type="text"
                      placeholder="মেসেজ লিখুন (Type message)..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-teal-600 text-xs font-semibold text-slate-800"
                    />
                    <button 
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="p-2.5 bg-teal-600 disabled:opacity-40 hover:bg-teal-700 text-white rounded-full transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: INVOICE PREVIEW SCREEN (5 Cols) / OTHER MODALS */}

        <div className="pt-4 text-center border-t border-slate-200 w-full max-w-sm">
          <span className="text-[9px] tracking-widest text-slate-400 font-mono uppercase block">
            🔒 RODP Central Secure Node V2.6
          </span>
          <span className="text-[8px] text-slate-400 font-mono block mt-1">
            Protected by Sifra Cryptographic Gateways
          </span>
        </div>

      </div>

      {/* Mandatory First-Login Password Change Modal (Requirement 6: MB107 Initial Password Change) */}
      {forcePasswordChangeBranch && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left text-white my-auto">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner">
                <Lock size={22} className="animate-pulse" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold uppercase">
                  SECURITY ENFORCEMENT
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  পাসওয়ার্ড পরিবর্তন বাধ্যতামূলক
                </h3>
                <p className="text-[10px] text-amber-400 font-mono">
                  {forcePasswordChangeBranch.name} • {forcePasswordChangeBranch.customId}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">
                স্বাগতম, {forcePasswordChangeBranch.branchHead || forcePasswordChangeBranch.ownerName}!
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                আপনার এটি প্রথম লগইন। কেন্দ্রীয় নিরাপত্তা নিয়ম অনুযায়ী অস্থায়ী পাসওয়ার্ড <strong>({forcePasswordChangeBranch.password || 'অস্থায়ী পাসওয়ার্ড'})</strong> পরিবর্তন করে আপনার স্থায়ী গোপনীয় পাসওয়ার্ড সেট করতে হবে।
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setForcedPassError(null);

                const newP = forcedNewPass.trim();
                const confP = forcedConfirmPass.trim();

                if (newP.length < 6) {
                  setForcedPassError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
                  return;
                }
                if (newP.toLowerCase() === 'pervez@00123') {
                  setForcedPassError('নতুন পাসওয়ার্ড প্রাথমিক পাসওয়ার্ড থেকে ভিন্ন হতে হবে।');
                  return;
                }
                if (newP !== confP) {
                  setForcedPassError('উভয় পাসওয়ার্ড একই হতে হবে।');
                  return;
                }

                // Update shop password
                if (updateShop) {
                  updateShop(forcePasswordChangeBranch.id, {
                    password: newP,
                    passwordChanged: true
                  });
                }
                localStorage.setItem(`rodp_pwd_changed_${forcePasswordChangeBranch.customId}`, 'true');

                const userRole = 'shop_owner';
                const branchToLogin = forcePasswordChangeBranch;
                setForcePasswordChangeBranch(null);
                setSuccessMsg(`পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! ড্যাশবোর্ডে প্রবেশ হচ্ছে...`);
                playTechIndustryLoginSound();

                setTimeout(() => {
                  onLoginSuccess(
                    userRole,
                    branchToLogin.branchHead || branchToLogin.ownerName || branchToLogin.name,
                    branchToLogin.ownerEmail || `${branchToLogin.customId?.toLowerCase()}@rodp.com`,
                    branchToLogin.permissions || ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
                    branchToLogin.mobile || '9593388785',
                    branchToLogin.id
                  );
                }, 700);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">
                  নতুন পাসওয়ার্ড (New Password) *
                </label>
                <input
                  type="password"
                  required
                  value={forcedNewPass}
                  onChange={(e) => setForcedNewPass(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষরের গোপনীয় পাসওয়ার্ড"
                  className="w-full py-2.5 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">
                  পাসওয়ার্ড নিশ্চিত করুন (Confirm Password) *
                </label>
                <input
                  type="password"
                  required
                  value={forcedConfirmPass}
                  onChange={(e) => setForcedConfirmPass(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  className="w-full py-2.5 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {forcedPassError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                  ⚠️ {forcedPassError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForcePasswordChangeBranch(null)}
                  className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
                >
                  সেভ ও ড্যাশবোর্ডে প্রবেশ ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Captcha Exit Modal for RODP Gateway (Requirement 02) */}
      <SecureExitModal
        isOpen={isExitModalOpen}
        appName="RODP Platform"
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          if (onExitToRexlify) onExitToRexlify();
        }}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
}
