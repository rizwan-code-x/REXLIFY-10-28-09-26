import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { playBillGenerateSound, playBillSaveSound } from '../lib/audioService';
import { 
  Receipt, Plus, Trash2, Printer, Share2, Sparkles, Download, 
  Search, Check, CreditCard, Landmark, Banknote, Mail, MessageSquare,
  ArrowRight, Tag, HelpCircle, X, PlusCircle, CheckCircle, ShieldCheck, FileText,
  Fingerprint, Globe, Layers, CheckSquare, Sparkle, LayoutGrid, AlertCircle, Users, RefreshCw
} from 'lucide-react';
import { Invoice, InvoiceItem, CustomerCRM, ServiceModule } from '../types';
import { fetchGoogleContacts, GoogleContact, createGoogleContact } from '../lib/googleDrive';
import { SIGNATURE_SEAL_SVG } from './DeveloperMedia';

interface BillingViewProps {
  theme: 'light' | 'dark';
  customers: CustomerCRM[];
  services: ServiceModule[];
  invoices: Invoice[];
  addInvoice: (inv: Invoice) => void;
  updateCustomer: (id: string, updates: any) => void;
  addCustomer?: (cust: CustomerCRM) => void;
  prefilledCustomerMobile?: string;
  prefilledServiceName?: string;
  clearPrefilled?: () => void;
  setCurrentTab?: (tab: string) => void;
  appointments?: any[];
  shops?: any[];
  gdriveConnected?: boolean;
  gdriveToken?: string | null;
  handleConnectGDrive?: () => Promise<void>;
}

const OTHERS_SERVICE: ServiceModule = {
  id: 'others_custom',
  name: 'Others (Custom)',
  category: 'Custom',
  description: 'Enter custom service name and price',
  price: 0
};

export default function BillingView({
  theme,
  customers,
  services,
  invoices,
  addInvoice,
  updateCustomer,
  addCustomer,
  prefilledCustomerMobile,
  prefilledServiceName,
  clearPrefilled,
  setCurrentTab,
  appointments = [],
  shops = [],
  gdriveConnected = false,
  gdriveToken = null,
  handleConnectGDrive
}: BillingViewProps) {
  
  // 1. Dynamic Client states (all optional) loaded from localStorage if present
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('rodp_billing_customerName') || '';
  });
  const [customerMobile, setCustomerMobile] = useState(() => {
    return localStorage.getItem('rodp_billing_customerMobile') || '';
  });
  const [customerAppId, setCustomerAppId] = useState(() => {
    return localStorage.getItem('rodp_billing_customerAppId') || '';
  });
  const [appointmentRefId, setAppointmentRefId] = useState<string>('');
  const [billBranchId, setBillBranchId] = useState<string>('shop_1');
  const [billBranchName, setBillBranchName] = useState<string>('RIZWAN ONLINE DREAMS (Head Office)');

  // 2. Multi-Service items cart (অনলাইন সেবা সমূহ) loaded from localStorage if present
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; quantity?: number; unitPrice?: number; description?: string; workDone?: string; }[]>(() => {
    try {
      const saved = localStorage.getItem('rodp_billing_cartItems');
      return saved ? JSON.parse(saved) : [{ id: `cart_${Date.now()}_0`, name: '', price: 0 }];
    } catch (e) {
      return [{ id: `cart_${Date.now()}_0`, name: '', price: 0 }];
    }
  });

  // 3. Search / Suggestion states
  const [filteredCustomerSuggestions, setFilteredCustomerSuggestions] = useState<CustomerCRM[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // 4. Ledger parameters loaded from localStorage if present
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'NetBanking'>(() => {
    return (localStorage.getItem('rodp_billing_paymentMethod') as any) || 'Cash';
  });
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>(() => {
    return (localStorage.getItem('rodp_billing_paymentStatus') as any) || 'Paid';
  });
  const [discountAmount, setDiscountAmount] = useState<number>(() => {
    const saved = localStorage.getItem('rodp_billing_discountAmount');
    return saved ? Number(saved) : 0;
  });
  const [partialAmountPaid, setPartialAmountPaid] = useState<number>(0);

  // Auto-save form progress to localStorage
  useEffect(() => {
    localStorage.setItem('rodp_billing_customerName', customerName);
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_customerMobile', customerMobile);
  }, [customerMobile]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_customerAppId', customerAppId);
  }, [customerAppId]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_paymentMethod', paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_paymentStatus', paymentStatus);
  }, [paymentStatus]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_discountAmount', String(discountAmount));
  }, [discountAmount]);

  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    customer: CustomerCRM | null;
  } | null>(null);

  // 5. Active Invoice Preview
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState<boolean>(false);

  // Google Contacts Integration states
  const [googleContacts, setGoogleContacts] = useState<GoogleContact[]>([]);
  const [isFetchingContacts, setIsFetchingContacts] = useState(false);
  const [contactsSearchQuery, setContactsSearchQuery] = useState('');
  const [showContactsDropdown, setShowContactsDropdown] = useState(false);
  const [isMobileSavedSuccessfully, setIsMobileSavedSuccessfully] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isContactSaved, setIsContactSaved] = useState(false);

  useEffect(() => {
    if (gdriveConnected && gdriveToken) {
      setIsFetchingContacts(true);
      fetchGoogleContacts(gdriveToken)
        .then(contacts => {
          setGoogleContacts(contacts);
        })
        .catch(err => {
          console.error("Failed to load Google Contacts:", err);
        })
        .finally(() => {
          setIsFetchingContacts(false);
        });
    }
  }, [gdriveConnected, gdriveToken]);

  const filteredContacts = googleContacts.filter(contact => {
    const q = contactsSearchQuery.toLowerCase().trim();
    if (!q) return false;
    return (
      contact.name.toLowerCase().includes(q) ||
      contact.mobile.includes(q) ||
      (contact.email && contact.email.toLowerCase().includes(q))
    );
  });

  // Active Builder draft item states
  const [builderItemName, setBuilderItemName] = useState('');
  const [builderItemPrice, setBuilderItemPrice] = useState<string>('');
  const [builderItemQuantity, setBuilderItemQuantity] = useState<number>(1);
  const [builderItemDescription, setBuilderItemDescription] = useState<string>('');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [filteredServiceSuggestions, setFilteredServiceSuggestions] = useState<ServiceModule[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [builderWorkDone, setBuilderWorkDone] = useState('');

  // Xerox States
  const [isXeroxOpen, setIsXeroxOpen] = useState(false);
  const [xeroxCopies, setXeroxCopies] = useState<number>(1);
  const [xeroxRate, setXeroxRate] = useState<number>(() => {
    const found = services.find(s => s.name.toLowerCase().includes('xerox') || s.name.toLowerCase().includes('জেরক্স'));
    return found?.price || 2;
  }); // Default from central database or ₹2 per copy
  const [xeroxPurpose, setXeroxPurpose] = useState<string>('');

  // Color Print States
  const [isColorPrintEnabled, setIsColorPrintEnabled] = useState(false);
  const [colorCopies, setColorCopies] = useState<number>(1);
  const [colorRate, setColorRate] = useState<number>(() => {
    const found = services.find(s => s.name.toLowerCase().includes('color print') || s.name.toLowerCase().includes('কালার'));
    return found?.price || 5;
  }); // Default from central database or ₹5 per copy
  const [colorPurpose, setColorPurpose] = useState<string>('');

  // Keep rates automatically synced with the central services database
  useEffect(() => {
    const xeroxFound = services.find(s => s.name.toLowerCase().includes('xerox') || s.name.toLowerCase().includes('জেরক্স'));
    if (xeroxFound && xeroxFound.price !== undefined) {
      setXeroxRate(xeroxFound.price);
    }
  }, [services]);

  useEffect(() => {
    const colorFound = services.find(s => s.name.toLowerCase().includes('color print') || s.name.toLowerCase().includes('কালার'));
    if (colorFound && colorFound.price !== undefined) {
      setColorRate(colorFound.price);
    }
  }, [services]);

  // AI Calculator States
  const [isAiCalcOpen, setIsAiCalcOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiCalcLoading, setIsAiCalcLoading] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Safe item name extractor to prevent [object Object] and extract human-readable text
  const extractItemName = (name: any): string => {
    if (!name) return '';
    if (typeof name === 'string') {
      if (name.includes('[object Object]')) {
        return name.replace(/\[object Object\]/g, 'Service Item').trim();
      }
      return name;
    }
    if (typeof name === 'object') {
      return name.name || name.title || name.serviceName || name.label || 'Service Item';
    }
    return String(name);
  };

  // Trigger feedback toast
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleServiceSearchChange = (valOrEvent: string | React.ChangeEvent<HTMLInputElement>) => {
    const val = typeof valOrEvent === 'string' ? valOrEvent : (valOrEvent?.target?.value || '');
    setBuilderItemName(val);
    if (!val.trim()) {
      setFilteredServiceSuggestions([]);
      return;
    }
    const filtered = services.filter(s => !s.disabled).filter(s => {
      const sName = typeof s.name === 'string' ? s.name : ((s.name as any)?.name || '');
      const cleanName = sName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
      return cleanName.toLowerCase().includes(val.toLowerCase());
    });
    setFilteredServiceSuggestions(filtered.slice(0, 5));
  };

  const handleServiceSearchFocus = () => {
    const val = typeof builderItemName === 'string' ? builderItemName : '';
    if (!val.trim()) {
      setFilteredServiceSuggestions([]);
      return;
    }
    const filtered = services.filter(s => !s.disabled).filter(s => {
      const sName = typeof s.name === 'string' ? s.name : ((s.name as any)?.name || '');
      const cleanName = sName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
      return cleanName.toLowerCase().includes(val.toLowerCase());
    });
    setFilteredServiceSuggestions(filtered.slice(0, 5));
  };

  const selectServiceSuggestion = (svc: ServiceModule) => {
    const rawName = typeof svc.name === 'string' ? svc.name : ((svc.name as any)?.name || 'Service Item');
    const cleanName = rawName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
    setBuilderItemName(cleanName);
    setBuilderItemPrice(String(svc.price !== undefined ? svc.price : 100));
    setBuilderItemQuantity(1);
    setFilteredServiceSuggestions([]);
    triggerFeedback(`✅ Selected service: ${cleanName}`);
  };

  const handleProcessAiBilling = async () => {
    if (!aiPrompt.trim()) {
      alert('অনুগ্রহ করে কিছু বর্ণনা লিখুন!');
      return;
    }
    setIsAiCalcLoading(true);
    try {
      const response = await fetch('/api/ai-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, services })
      });
      if (!response.ok) {
        throw new Error('Failed to process AI Calculator query');
      }
      const data = await response.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        const addedItems = data.items.map((item: any, idx: number) => {
          const price = parseFloat(item.price) || 0;
          const qty = parseInt(item.quantity) || 1;
          const totalPrice = price * qty;
          const qtyText = qty > 1 ? ` (${qty} pcs @ ₹${price}/pc)` : '';
          const descText = item.description ? ` - ${item.description}` : '';
          return {
            id: `cart_ai_${Date.now()}_${idx}`,
            name: `${item.name}${qtyText}${descText}`,
            price: totalPrice,
            unitPrice: price,
            quantity: qty,
            description: item.description || ''
          };
        });
        
        const filteredCart = cartItems.filter(item => item.name.trim() !== '');
        setCartItems([...filteredCart, ...addedItems]);
        setAiPrompt('');
        setIsAiCalcOpen(false);
        triggerFeedback(`✨ AI successfully added ${addedItems.length} items to your cart!`);
      } else {
        alert('AI কোনো সার্ভিস চিহ্নিত করতে পারেনি। অনুগ্রহ করে একটু বিস্তারিত করে বলুন!');
      }
    } catch (err: any) {
      console.error(err);
      alert('AI ক্যালকুলেটর প্রসেস করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ম্যানুয়ালি করুন!');
    } finally {
      setIsAiCalcLoading(false);
    }
  };

  const handleAddXeroxItem = () => {
    if (xeroxCopies <= 0) {
      alert('অনুগ্রহ করে সঠিক কপি সংখ্যা দিন!');
      return;
    }
    const totalPrice = xeroxCopies * xeroxRate;
    const purposeSuffix = xeroxPurpose.trim() ? ` - Purpose: ${xeroxPurpose.trim()}` : '';
    const xeroxItem = {
      id: `cart_xerox_${Date.now()}`,
      name: `Xerox Copy (${xeroxCopies} copies @ ₹${xeroxRate}/pc${purposeSuffix})`,
      price: totalPrice,
      unitPrice: xeroxRate,
      quantity: xeroxCopies,
      description: xeroxPurpose
    };
    
    // Filter out initial empty cart items
    const filteredCart = cartItems.filter(item => item.name.trim() !== '');
    setCartItems([...filteredCart, xeroxItem]);
    
    // Reset states
    setXeroxCopies(1);
    setXeroxPurpose('');
    setIsXeroxOpen(false);
    triggerFeedback(`✅ Xerox charges ₹${totalPrice} successfully added to bill!`);
  };

  const handleAddColorPrintItem = () => {
    if (colorCopies <= 0) {
      alert('অনুগ্রহ করে সঠিক কালার প্রিন্ট কপি সংখ্যা দিন!');
      return;
    }
    const totalPrice = colorCopies * colorRate;
    const purposeSuffix = colorPurpose.trim() ? ` - Purpose: ${colorPurpose.trim()}` : '';
    const colorItem = {
      id: `cart_color_${Date.now()}`,
      name: `Color Print (${colorCopies} copies @ ₹${colorRate}/pc${purposeSuffix})`,
      price: totalPrice,
      unitPrice: colorRate,
      quantity: colorCopies,
      description: colorPurpose
    };
    
    // Filter out initial empty cart items
    const filteredCart = cartItems.filter(item => item.name.trim() !== '');
    setCartItems([...filteredCart, colorItem]);
    
    // Reset states
    setColorCopies(1);
    setColorPurpose('');
    setIsColorPrintEnabled(false);
    triggerFeedback(`✅ Color Print charges ₹${totalPrice} successfully added to bill!`);
  };

  const handleAddOrUpdateItem = () => {
    const cleanBuilderName = extractItemName(builderItemName).trim();
    if (!cleanBuilderName) {
      alert('অনুগ্রহ করে সার্ভিসের নাম লিখুন!');
      return;
    }
    const priceNum = Math.max(0, parseFloat(builderItemPrice) || 0);
    const qty = Math.max(1, builderItemQuantity || 1);
    const totalItemPrice = priceNum * qty;
    
    const qtyText = qty > 1 ? ` (${qty} pcs @ ₹${priceNum}/pc)` : '';
    const workText = builderWorkDone.trim() ? ` - Work: ${builderWorkDone.trim()}` : '';
    const descText = builderItemDescription.trim() ? ` - Note: ${builderItemDescription.trim()}` : '';
    const finalName = `${cleanBuilderName}${workText}${qtyText}${descText}`;
    
    if (editingItemIndex !== null) {
      const updated = [...cartItems];
      updated[editingItemIndex] = {
        ...updated[editingItemIndex],
        name: finalName,
        price: totalItemPrice,
        unitPrice: priceNum,
        quantity: qty,
        description: builderItemDescription.trim(),
        workDone: builderWorkDone.trim()
      } as any;
      setCartItems(updated);
      setEditingItemIndex(null);
      triggerFeedback('✅ Item successfully updated!');
    } else {
      const newItem = {
        id: `cart_${Date.now()}_${cartItems.length}`,
        name: finalName,
        price: totalItemPrice,
        unitPrice: priceNum,
        quantity: qty,
        description: builderItemDescription.trim(),
        workDone: builderWorkDone.trim()
      };
      const filteredCart = cartItems.filter(item => extractItemName(item.name).trim() !== '');
      setCartItems([...filteredCart, newItem]);
      triggerFeedback('✅ Item successfully added!');
    }
    
    // Reset builder form
    setBuilderItemName('');
    setBuilderItemPrice('');
    setBuilderItemQuantity(1);
    setBuilderItemDescription('');
    setBuilderWorkDone('');
  };

  const handleEditAddedItem = (index: number) => {
    const item = cartItems[index] as any;
    const rawName = extractItemName(item.name);
    if (item.workDone !== undefined) {
      setBuilderItemName(rawName.split(' - Work: ')[0] || rawName);
      setBuilderWorkDone(item.workDone || '');
      setBuilderItemPrice(String(item.unitPrice !== undefined ? item.unitPrice : item.price));
      setBuilderItemQuantity(item.quantity || 1);
      setBuilderItemDescription(item.description || '');
    } else {
      const cleanName = rawName.split(' (')[0].split(' - ')[0];
      setBuilderItemName(cleanName);
      setBuilderItemPrice(String(item.unitPrice !== undefined ? item.unitPrice : item.price));
      setBuilderItemQuantity(item.quantity || 1);
      setBuilderItemDescription(item.description || '');
      setBuilderWorkDone('');
    }
    setEditingItemIndex(index);
    setFilteredServiceSuggestions([]);
    triggerFeedback(`✍️ Editing item ${index + 1}`);
  };

  const handleCancelEdit = () => {
    setBuilderItemName('');
    setBuilderItemPrice('');
    setBuilderItemQuantity(1);
    setBuilderItemDescription('');
    setBuilderWorkDone('');
    setEditingItemIndex(null);
    setFilteredServiceSuggestions([]);
  };

  // Auto-fill redirect from appointments/other pages (Requirements 20, 25, 26, 27)
  useEffect(() => {
    if (prefilledCustomerMobile) {
      setCustomerMobile(prefilledCustomerMobile);
      const cleanMob = prefilledCustomerMobile.replace(/\D/g, '');
      const cust = customers.find(c => 
        (c.mobile && c.mobile.replace(/\D/g, '') === cleanMob) ||
        (c.customId && c.customId.toLowerCase() === prefilledCustomerMobile.toLowerCase()) ||
        (c.username && c.username.toLowerCase() === prefilledCustomerMobile.toLowerCase()) ||
        (c.rodpAddress && c.rodpAddress.toLowerCase() === prefilledCustomerMobile.toLowerCase())
      );
      
      // Look for latest linked appointment
      const matchedApp = appointments.find(a => 
        (a.mobileNumber && a.mobileNumber.replace(/\D/g, '') === cleanMob) ||
        (a.referenceId && a.referenceId.toLowerCase() === prefilledCustomerMobile.toLowerCase()) ||
        (a.id && a.id.toLowerCase() === prefilledCustomerMobile.toLowerCase())
      );

      if (matchedApp) {
        if (matchedApp.customerName || matchedApp.name) setCustomerName(matchedApp.customerName || matchedApp.name);
        if (matchedApp.referenceId || matchedApp.id) setAppointmentRefId(matchedApp.referenceId || matchedApp.id);
        if (matchedApp.branchId || matchedApp.shopId) setBillBranchId(matchedApp.branchId || matchedApp.shopId);
        if (matchedApp.branchName) setBillBranchName(matchedApp.branchName);
      }

      if (cust) {
        if (!matchedApp) setCustomerName(cust.name);
        setCustomerAppId(cust.rodpAddress || cust.customId || cust.username || '');
        if (cust.shopId && !matchedApp) {
          setBillBranchId(cust.shopId);
          const foundShop = shops.find(s => s.id === cust.shopId);
          if (foundShop) setBillBranchName(foundShop.name);
        }
      } else if (!matchedApp) {
        setCustomerAppId('');
      }
    }
    if (prefilledServiceName) {
      const cleanName = prefilledServiceName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
      let price = 100;
      const svc = services.find(s => s.name.toLowerCase().includes(cleanName.toLowerCase()));
      if (svc) {
        price = svc.price || 100;
      }
      setCartItems([{ id: `cart_pre_${Date.now()}`, name: cleanName, price, quantity: 1 }]);
    }
    if (prefilledCustomerMobile || prefilledServiceName) {
      if (clearPrefilled) clearPrefilled();
    }
  }, [prefilledCustomerMobile, prefilledServiceName, appointments, customers, services, shops]);

  // Handle client name type with autocomplete
  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerName(value);
    if (value.trim()) {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase()) ||
        (c.customId && c.customId.toLowerCase().includes(value.toLowerCase())) ||
        c.mobile.includes(value)
      );
      setFilteredCustomerSuggestions(filtered);
    } else {
      setFilteredCustomerSuggestions([]);
    }
  };

  // Link prefilled client suggestions
  const selectCustomerSuggestion = (customer: CustomerCRM) => {
    setCustomerName(customer.name);
    setCustomerMobile(customer.mobile || '');
    setCustomerAppId(customer.customId || '');
    setFilteredCustomerSuggestions([]);
    triggerFeedback(`✅ linked to customer profile: ${customer.name}`);
  };

  const handleVerifyCustomer = () => {
    const mobileTrimmed = customerMobile.trim();
    if (!mobileTrimmed) {
      alert("Please enter a mobile number first.");
      return;
    }
    const foundCust = customers.find(c => c.mobile === mobileTrimmed || c.customId === mobileTrimmed);
    if (foundCust) {
      setVerificationResult({ found: true, customer: foundCust });
    } else {
      setVerificationResult({ found: false, customer: null });
    }
  };

  const handleConfirmVerify = () => {
    if (verificationResult && verificationResult.found && verificationResult.customer) {
      setCustomerName(verificationResult.customer.name);
      setCustomerAppId(verificationResult.customer.customId || verificationResult.customer.id);
      setVerificationResult(null); // Clear after confirmation
    }
  };

  // Cart operations
  const addCartItem = () => {
    setCartItems([...cartItems, { id: `cart_${Date.now()}_${cartItems.length}`, name: '', price: 0 }]);
  };

  const removeCartItem = (index: number) => {
    if (cartItems.length === 1) {
      setCartItems([{ id: `cart_${Date.now()}_0`, name: '', price: 0 }]);
    } else {
      setCartItems(cartItems.filter((_, i) => i !== index));
    }
  };

  const updateCartItem = (index: number, updates: { name?: string; price?: number }) => {
    const next = [...cartItems];
    next[index] = { ...next[index], ...updates };
    setCartItems(next);
  };

  // Dynamic live item logo helper
  const getLiveItemLogo = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('aadhaar') || lower.includes('আধার')) {
      return { 
        icon: <Fingerprint size={16} className="text-sky-400" />, 
        label: "Aadhaar", 
        color: "border-sky-500/20 bg-sky-500/5 text-sky-400" 
      };
    }
    if (lower.includes('voter') || lower.includes('ভোটার')) {
      return { 
        icon: <CheckSquare size={16} className="text-emerald-400" />, 
        label: "Voter", 
        color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" 
      };
    }
    if (lower.includes('pan') || lower.includes('প্যান')) {
      return { 
        icon: <CreditCard size={16} className="text-amber-400" />, 
        label: "PAN", 
        color: "border-amber-500/20 bg-amber-500/5 text-amber-400" 
      };
    }
    if (lower.includes('passport') || lower.includes('পাসপোর্ট') || lower.includes('visa')) {
      return { 
        icon: <Globe size={16} className="text-indigo-400" />, 
        label: "Passport", 
        color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" 
      };
    }
    if (lower.includes('pvc') || lower.includes('print') || lower.includes('ল্যামিনেশন')) {
      return { 
        icon: <Layers size={16} className="text-pink-400" />, 
        label: "PVC", 
        color: "border-pink-500/20 bg-pink-500/5 text-pink-400" 
      };
    }
    if (lower.includes('bank') || lower.includes('টাকা') || lower.includes('dbt') || lower.includes('cash') || lower.includes('withdraw') || lower.includes('deposit') || lower.includes('payment') || lower.includes('financ')) {
      return { 
        icon: <Landmark size={16} className="text-purple-400" />, 
        label: "Banking", 
        color: "border-purple-500/20 bg-purple-500/5 text-purple-400" 
      };
    }
    return { 
      icon: <Sparkle size={16} className="text-amber-400/80" />, 
      label: "Custom", 
      color: "border-slate-800 bg-slate-900/40 text-slate-400" 
    };
  };

  // Generate dynamic service category logos based on item names
  const getServiceCategoryLogos = (items: InvoiceItem[]) => {
    const categories: { key: string; logoText: string; subText: string; icon: React.ReactNode; colorClass: string; borderClass: string; bgClass: string; textClass: string }[] = [];
    const uniqueKeys = new Set<string>();

    items.forEach(item => {
      const lower = item.name.toLowerCase();
      if ((lower.includes('aadhaar') || lower.includes('আধার')) && !uniqueKeys.has('aadhaar')) {
        uniqueKeys.add('aadhaar');
        categories.push({
          key: 'aadhaar',
          logoText: "AADHAAR CARD / আধার কার্ড",
          subText: "UIDAI Digital Services Gateway",
          icon: <Fingerprint size={16} />,
          colorClass: "text-sky-600",
          borderClass: "border-sky-300",
          bgClass: "bg-sky-50",
          textClass: "text-sky-800"
        });
      }
      if ((lower.includes('voter') || lower.includes('ভোটার')) && !uniqueKeys.has('voter')) {
        uniqueKeys.add('voter');
        categories.push({
          key: 'voter',
          logoText: "VOTER ID CARD / ভোটার কার্ড",
          subText: "Election Commission of India",
          icon: <CheckSquare size={16} />,
          colorClass: "text-emerald-600",
          borderClass: "border-emerald-300",
          bgClass: "bg-emerald-50",
          textClass: "text-emerald-800"
        });
      }
      if ((lower.includes('pan') || lower.includes('প্যান')) && !uniqueKeys.has('pan')) {
        uniqueKeys.add('pan');
        categories.push({
          key: 'pan',
          logoText: "PAN CARD / প্যান কার্ড",
          subText: "Income Tax Department of India",
          icon: <CreditCard size={16} />,
          colorClass: "text-amber-600",
          borderClass: "border-amber-300",
          bgClass: "bg-amber-50",
          textClass: "text-amber-800"
        });
      }
      if ((lower.includes('passport') || lower.includes('পাসপোর্ট') || lower.includes('visa')) && !uniqueKeys.has('passport')) {
        uniqueKeys.add('passport');
        categories.push({
          key: 'passport',
          logoText: "PASSPORT OFFICE / পাসপোর্ট",
          subText: "Ministry of External Affairs",
          icon: <Globe size={16} />,
          colorClass: "text-indigo-600",
          borderClass: "border-indigo-300",
          bgClass: "bg-indigo-50",
          textClass: "text-indigo-800"
        });
      }
      if ((lower.includes('pvc') || lower.includes('print') || lower.includes('ল্যামিনেশন')) && !uniqueKeys.has('pvc')) {
        uniqueKeys.add('pvc');
        categories.push({
          key: 'pvc',
          logoText: "PVC CARD / স্মার্ট পিভিসি",
          subText: "Laminated Digital PVC Printout",
          icon: <Layers size={16} />,
          colorClass: "text-pink-600",
          borderClass: "border-pink-300",
          bgClass: "bg-pink-50",
          textClass: "text-pink-800"
        });
      }
      if ((lower.includes('bank') || lower.includes('টাকা') || lower.includes('dbt') || lower.includes('cash') || lower.includes('withdraw') || lower.includes('deposit') || lower.includes('payment') || lower.includes('financ')) && !uniqueKeys.has('banking')) {
        uniqueKeys.add('banking');
        categories.push({
          key: 'banking',
          logoText: "BANKING & FINANCE / ব্যাংকিং",
          subText: "AePS Financial Transfer Node",
          icon: <Landmark size={16} />,
          colorClass: "text-purple-600",
          borderClass: "border-purple-300",
          bgClass: "bg-purple-50",
          textClass: "text-purple-800"
        });
      }
    });

    // Fallback if none matches
    if (categories.length === 0) {
      categories.push({
        key: 'digital',
        logoText: "DIGITAL SERVICE / ডিজিটাল সার্ভিস",
        subText: "RODP Certified Solution",
        icon: <Sparkles size={16} />,
        colorClass: "text-[#dfac5d]",
        borderClass: "border-slate-200",
        bgClass: "bg-slate-50",
        textClass: "text-slate-800"
      });
    }

    return categories;
  };

  // Compile and Save the Bill
  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('গ্রাহকের নাম আবশ্যক! (Customer Name is Mandatory)');
      return;
    }

    // Validate that there is at least one non-empty item
    const validItems = cartItems.filter(item => {
      const n = extractItemName(item.name).trim();
      return n !== '' && n !== '[object Object]';
    });
    if (validItems.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি সার্ভিস বা কাজের নাম যুক্ত করুন।');
      return;
    }

    const finalCustomerName = customerName.trim();
    const finalCustomerMobile = customerMobile.trim() || '';
    const finalCustomerAppId = customerAppId.trim() || `RODP-${Math.floor(1000 + Math.random() * 9000)}`;

    const todayDateStr = new Date().toISOString().split('T')[0];
    // No restriction on multiple invoice generation for the same customer on the same day as per user request.
    // We allow generating multiple bills under the same name/mobile and automatically update the profile.

    const subtotal = validItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const finalDiscount = Math.min(Number(discountAmount) || 0, subtotal);
    const totalAmount = Math.max(0, subtotal - finalDiscount);

    // Calculate sequential invoice code
    let nextInvoiceNum = 1;
    if (invoices && invoices.length > 0) {
      const numericNumbers = invoices
        .map(inv => parseInt(inv.invoiceNumber, 10))
        .filter(num => !isNaN(num));
      if (numericNumbers.length > 0) {
        nextInvoiceNum = Math.max(...numericNumbers) + 1;
      } else {
        nextInvoiceNum = invoices.length + 1;
      }
    }
    const invoiceNum = nextInvoiceNum.toString();

    // Build items payload
    const itemsPayload: InvoiceItem[] = validItems.map((item, idx) => ({
      id: `svc_item_${Date.now()}_${idx}`,
      name: extractItemName(item.name).trim(),
      quantity: Math.max(1, Number(item.quantity) || 1),
      price: Math.max(0, Number(item.price) || 0),
      gstRate: 0,
      discount: 0
    }));

    const amountPaid = paymentStatus === 'Paid' 
      ? totalAmount 
      : paymentStatus === 'Unpaid' 
        ? 0 
        : Math.min(partialAmountPaid, totalAmount);
    const remainingBalance = Math.max(0, totalAmount - amountPaid);
    
    const initialPaymentList = amountPaid > 0 ? [{
      id: `pmt_init_${Date.now()}`,
      paymentNo: 1,
      amount: amountPaid,
      remainingBalance,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentTime: new Date().toTimeString().split(' ')[0],
      paymentMethod: (paymentMethod === 'NetBanking' ? 'Bank' : paymentMethod) as any,
      notes: paymentStatus === 'Paid' ? 'Initial Full Payment' : 'Initial Down Payment',
      updatedBy: 'Admin'
    }] : [];

    let finalCustId = finalCustomerAppId;
    const customerDbId = `cust_${Date.now()}`;
    let matchedCustomer: CustomerCRM | undefined = undefined;

    if (finalCustomerName) {
      matchedCustomer = customers.find(c => 
        (finalCustomerMobile && c.mobile === finalCustomerMobile) || 
        c.name.toLowerCase() === finalCustomerName.toLowerCase()
      );
    }

    if (matchedCustomer) {
      finalCustId = matchedCustomer.id;
    } else {
      finalCustId = customerDbId;
    }

    const targetShopId = billBranchId || matchedCustomer?.shopId || 'shop_1';
    const targetShopName = billBranchName || shops.find(s => s.id === targetShopId)?.name || 'RIZWAN ONLINE DREAMS (Head Office)';
    const targetRefId = appointmentRefId || matchedCustomer?.referenceId || `REF-${Math.floor(10000 + Math.random() * 90000)}`;

    const compiledInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: finalCustId,
      customerName: finalCustomerName,
      customerMobile: finalCustomerMobile,
      items: itemsPayload,
      subtotal,
      taxAmount: 0,
      discountAmount: finalDiscount,
      totalAmount,
      createdAt: new Date().toISOString(),
      paymentMethod,
      paymentStatus,
      shopId: targetShopId,
      branchName: targetShopName,
      referenceId: targetRefId,
      amountPaid,
      remainingBalance,
      payments: initialPaymentList,
      lastPaymentDate: amountPaid > 0 ? new Date().toISOString().split('T')[0] : undefined
    };

    // Save to global CRM state if name matches
    if (finalCustomerName) {
      if (matchedCustomer) {
        const prevSpending = matchedCustomer.totalSpending || 0;
        const prevInvoices = matchedCustomer.linkedInvoices || [];
        updateCustomer(matchedCustomer.id, {
          totalSpending: prevSpending + totalAmount,
          mobile: matchedCustomer.mobile || finalCustomerMobile,
          customId: matchedCustomer.customId || finalCustomerAppId,
          linkedInvoices: [...prevInvoices, compiledInvoice.id]
        });
      } else if (addCustomer) {
        const newCust: CustomerCRM = {
          id: customerDbId,
          customId: finalCustomerAppId,
          name: finalCustomerName,
          mobile: finalCustomerMobile,
          email: '',
          password: `RODP-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'active' as const,
          address: 'Jalangi, Murshidabad',
          notes: 'Auto-created via Billing System',
          totalSpending: totalAmount,
          createdAt: new Date().toISOString(),
          isPermanent: true,
          shopId: 'shop_1',
          linkedInvoices: [compiledInvoice.id]
        };
        addCustomer(newCust);
      }
    }

    addInvoice(compiledInvoice);
    setActiveInvoice(compiledInvoice);
    setShowInvoicePreview(true);
    playBillGenerateSound();
    triggerFeedback(`🎉 Bill #${invoiceNum} successfully compiled and generated!`);
  };

  // Actions
  const handlePrint = () => {
    if (!activeInvoice) return;
    triggerFeedback('🖨️ Opening print service dialog...');
    window.print();
  };

  const handleDownloadTxt = () => {
    if (!activeInvoice) return;

    let itemsText = '';
    activeInvoice.items.forEach((item, idx) => {
      itemsText += `${idx + 1}. ${item.name.padEnd(40)} | ₹${item.price.toFixed(2)}\n`;
    });

    const textContent = `
========================================
    RIZWAN ONLINE DREAMS PLATFORM (RODP)
          OFFICIAL INVOICE RECEIPT
========================================
Invoice Number : ${activeInvoice.invoiceNumber}
Date of Issue  : ${activeInvoice.createdAt.substring(0, 10)}
Time of Issue  : ${activeInvoice.createdAt.substring(11, 19)}
----------------------------------------
CLIENT SPECIFICATION SHEET:
Customer Name  : ${activeInvoice.customerName}
Mobile Number  : ${activeInvoice.customerMobile || 'Not Provided'}
Customer App ID: ${activeInvoice.customerId}
----------------------------------------
SERVICES RENDERED DETAILS:
${itemsText}----------------------------------------
FINANCIAL COMPUTATION SUMMARY:
Subtotal Charge: ₹${activeInvoice.subtotal.toFixed(2)}
Discount Given : ₹${activeInvoice.discountAmount.toFixed(2)}
----------------------------------------
Net Total Bill : ₹${activeInvoice.totalAmount.toFixed(2)}
----------------------------------------
SETTLEMENT AUDIT STATUS:
Payment Method : ${activeInvoice.paymentMethod}
Ledger Status  : ${activeInvoice.paymentStatus.toUpperCase()}
========================================
  Thank you for visiting RODP Service!
========================================
    `;

    const blob = new Blob([textContent.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RODP_INVOICE_${activeInvoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerFeedback('📥 Certified receipt document downloaded successfully.');
  };

  const handleDownloadPdf = () => {
    if (!activeInvoice) return;
    triggerFeedback('📥 Generating certified PDF receipt...');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = '#1e293b'; // Slate 800
      const accentColor = '#dfac5d'; // RODP Gold
      const lightBgColor = '#f8fafc'; // Slate 50
      const mutedTextColor = '#64748b'; // Slate 500

      // Header Banner
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.rect(0, 0, 210, 40, 'F');

      // Title
      doc.setTextColor(223, 172, 93); // Gold
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('RIZWAN ONLINE DREAMS PLATFORM', 15, 18);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text('Your Trusted Rural Digital Service Hub | Jalangi, West Bengal', 15, 24);

      // Invoice info block right-aligned
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('TAX INVOICE', 150, 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`No: ${activeInvoice.invoiceNumber}`, 150, 24);
      doc.text(`Date: ${activeInvoice.createdAt.substring(0, 10)}`, 150, 29);

      // Customer section
      doc.setFillColor(248, 250, 252); // Light background
      doc.rect(15, 50, 180, 32, 'F');
      
      doc.setDrawColor(226, 232, 240); // Light gray border
      doc.setLineWidth(0.5);
      doc.rect(15, 50, 180, 32, 'D');

      doc.setTextColor(30, 41, 59);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('BILLED TO (CITIZEN DETAILS):', 20, 57);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${activeInvoice.customerName}`, 20, 64);
      doc.text(`Contact Mobile: ${activeInvoice.customerMobile || 'Not Provided'}`, 20, 70);
      doc.text(`Citizen unique ID: ${activeInvoice.customerId || 'N/A'}`, 20, 76);

      // Right-side info inside customer block (Shop info)
      doc.text('SERVICE PROVIDER:', 115, 57);
      doc.setFontSize(9);
      doc.text('Rizwan Online Dreams HQ', 115, 64);
      doc.text('GSTIN: Exempted (Kiosk-Tier)', 115, 70);
      doc.text('Jalangi, Murshidabad, WB', 115, 76);

      // Services Table Header
      let y = 92;
      doc.setFillColor(30, 41, 59);
      doc.rect(15, y, 180, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('Srl.', 18, y + 5.5);
      doc.text('Rendered Service Module', 35, y + 5.5);
      doc.text('Unit Price', 135, y + 5.5);
      doc.text('Amount (INR)', 165, y + 5.5);

      // Services Rows
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      
      y += 8;
      activeInvoice.items.forEach((item, index) => {
        // Alternating background
        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, 9, 'F');
        }
        
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 9, 195, y + 9);

        doc.text(String(index + 1), 18, y + 6);
        doc.text(item.name, 35, y + 6);
        doc.text(`Rs. ${item.price.toFixed(2)}`, 135, y + 6);
        doc.text(`Rs. ${item.price.toFixed(2)}`, 165, y + 6);
        y += 9;
      });

      // Total Calculation block
      y += 5;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y, 195, y);
      y += 5;

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text('Payment Settlement Method:', 15, y + 4);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(activeInvoice.paymentMethod.toUpperCase(), 15, y + 9);
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Ledger Audit Status:', 65, y + 4);
      doc.setFont('Helvetica', 'bold');
      if (activeInvoice.paymentStatus === 'Paid') {
        doc.setTextColor(16, 185, 129);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(activeInvoice.paymentStatus.toUpperCase(), 65, y + 9);

      // Financials Right Aligned
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Subtotal:', 135, y + 4);
      doc.setTextColor(30, 41, 59);
      doc.text(`Rs. ${activeInvoice.subtotal.toFixed(2)}`, 165, y + 4);

      doc.setTextColor(100, 116, 139);
      doc.text('Discounts given:', 135, y + 9);
      doc.setTextColor(239, 68, 68);
      doc.text(`-Rs. ${activeInvoice.discountAmount.toFixed(2)}`, 165, y + 9);

      y += 13;
      doc.setFillColor(248, 250, 252);
      doc.rect(130, y, 65, 10, 'F');
      doc.setDrawColor(223, 172, 93);
      doc.rect(130, y, 65, 10, 'D');

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('NET PAYABLE:', 134, y + 6.5);
      doc.setTextColor(223, 172, 93);
      doc.text(`Rs. ${activeInvoice.totalAmount.toFixed(2)}`, 164, y + 6.5);

      // Net Payable and Simple Footer Signature Space
      const footerY = Math.min(235, y + 15);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Authorized Signature', 150, footerY + 12);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(145, footerY + 8, 185, footerY + 8);

      // Footer
      doc.setDrawColor(241, 245, 249);
      doc.line(15, 265, 195, 265);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text('Thank you for choosing Rizwan Online Dreams Platform! This is a system-generated secure tax invoice receipt.', 15, 271);
      doc.text('Authorized Signature: RODP Kiosk Super-Admin Node | Securing Rural Dreams', 15, 275);

      doc.save(`RODP_INVOICE_${activeInvoice.invoiceNumber}.pdf`);
      triggerFeedback('📥 Certified PDF invoice receipt generated and downloaded successfully!');
    } catch (error) {
      console.error(error);
      triggerFeedback('❌ PDF generation failed. Downloading raw TXT receipt instead.');
      handleDownloadTxt();
    }
  };

  const handleResetForm = () => {
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAppId('');
    setCartItems([{ id: `cart_${Date.now()}_0`, name: '', price: 0 }]);
    setDiscountAmount(0);
    setActiveInvoice(null);
    setShowInvoicePreview(false);
    setIsMobileSavedSuccessfully(false);
    setIsContactSaved(false);
    setIsSavingContact(false);
  };

  const handleSaveMobileAndSendECopy = () => {
    if (!activeInvoice) return;
    
    const finalMobile = activeInvoice.customerMobile;
    const finalName = activeInvoice.customerName;
    const finalCustomerId = activeInvoice.customerId || `RODP-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!finalMobile) {
      alert('এই বিলে কোনো মোবাইল নম্বর প্রদান করা হয়নি! (No Mobile Number in this invoice)');
      return;
    }

    // Check if customer already exists in database
    const matchedCustomer = customers.find(c => c.mobile === finalMobile);

    if (matchedCustomer) {
      // Update existing customer profile
      updateCustomer(matchedCustomer.id, {
        name: finalName,
        totalSpending: (matchedCustomer.totalSpending || 0) + activeInvoice.totalAmount,
        notes: `Profile updated and synced. Last invoice: ${activeInvoice.id}`
      });
      triggerFeedback(`✅ কাস্টমার (${finalName}) ডাটাবেজে সাকসেসফুলি আপডেট হয়েছে এবং বিলের e-Copy পাঠানো হয়েছে!`);
    } else {
      // Create new customer profile
      if (addCustomer) {
        const newCust: CustomerCRM = {
          id: `cust_${Date.now()}`,
          customId: finalCustomerId,
          name: finalName,
          mobile: finalMobile,
          email: '',
          password: `RODP-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'active' as const,
          address: 'Jalangi, Murshidabad',
          notes: 'Auto-saved via Invoice Save Mobile Number Option',
          totalSpending: activeInvoice.totalAmount,
          createdAt: new Date().toISOString(),
          isPermanent: true,
          shopId: activeInvoice.shopId || 'shop_1',
          linkedInvoices: [activeInvoice.id]
        };
        addCustomer(newCust);
      }
      triggerFeedback(`🎉 গ্রাহক (${finalName}) এর প্রোফাইল সাকসেসফুলি ডাটাবেজে ক্রিয়েট হয়েছে এবং বিলের e-Copy পাঠানো হয়েছে!`);
    }

    setIsMobileSavedSuccessfully(true);
    playBillSaveSound();
  };

  const handleSaveToGoogleContacts = async () => {
    if (!activeInvoice) return;
    const finalMobile = activeInvoice.customerMobile;
    const finalName = activeInvoice.customerName;

    if (!finalMobile) {
      alert('এই বিলে কোনো মোবাইল নম্বর প্রদান করা হয়নি! (No Mobile Number in this invoice)');
      return;
    }

    if (!gdriveConnected || !gdriveToken) {
      alert('অনুগ্রহ করে গুগল কন্টাক্ট লিঙ্ক করুন! (Please link your Google account first)');
      return;
    }

    setIsSavingContact(true);
    try {
      await createGoogleContact(gdriveToken, { name: finalName, mobile: finalMobile });
      setIsContactSaved(true);
      triggerFeedback('👤 গ্রাহকের নাম ও মোবাইল নম্বর সফলভাবে আপনার গুগল কন্টাক্টে সংরক্ষিত হয়েছে!');
    } catch (err: any) {
      console.error(err);
      alert(`গুগল কন্টাক্টে সংরক্ষণ করতে ব্যর্থ হয়েছে: ${err.message || err}`);
    } finally {
      setIsSavingContact(false);
    }
  };

  const renderStep1 = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="p-6 rounded-3xl bg-[#0a0a0c]/80 border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-3 flex justify-between items-center">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400" /> 1. Customer Details (Optional)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] text-slate-400 font-bold uppercase">
              Optional
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 relative">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={handleCustomerNameChange}
                placeholder=""
                className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border-2 border-indigo-500/40 bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              {filteredCustomerSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[64px] z-30 bg-white border-2 border-indigo-400 rounded-xl overflow-hidden shadow-2xl max-h-40 overflow-y-auto">
                  {filteredCustomerSuggestions.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomerSuggestion(c)}
                      className="w-full text-left p-2.5 hover:bg-indigo-50 text-slate-900 font-bold border-b border-slate-100 transition-colors block text-xs"
                    >
                      {c.name} <span className="text-[10px] text-indigo-600 font-mono">({c.customId || 'No ID'})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Mobile Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customerMobile}
                  onChange={(e) => {
                    setCustomerMobile(e.target.value);
                    setVerificationResult(null);
                  }}
                  placeholder=""
                  className="flex-1 text-xs font-bold py-2.5 px-3.5 rounded-xl border-2 border-indigo-500/40 bg-white text-slate-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVerifyCustomer}
                  className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  Verify
                </button>
              </div>
              {verificationResult && (
                <div className="mt-2 p-2 rounded-xl border border-slate-800 bg-[#050505] flex items-center justify-between gap-2 transition-all">
                  <span className="text-[9px] text-slate-300">
                    {verificationResult.found ? (
                      <>
                        Matched: <strong className="text-amber-400">{verificationResult.customer?.name}</strong> ({verificationResult.customer?.customId})
                      </>
                    ) : (
                      <span className="text-rose-400">Not found in database</span>
                    )}
                  </span>
                  {verificationResult.found && (
                    <button
                      type="button"
                      onClick={handleConfirmVerify}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-md transition-all cursor-pointer"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Customer ID / App ID</label>
              <input
                type="text"
                value={customerAppId}
                onChange={(e) => setCustomerAppId(e.target.value)}
                placeholder=""
                className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border-2 border-indigo-500/40 bg-white text-slate-900 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 border-t border-white/5 pt-4 mt-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                <span className="text-[10px] uppercase text-[#dfac5d] font-extrabold flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-blue-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.285 1.35 15.54 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
                  </svg>
                  Google Contacts integration
                </span>
                {gdriveConnected ? (
                  <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-mono">
                    🟢 Synced With Google Contacts
                  </span>
                ) : (
                  <span className="text-[8px] font-bold text-slate-500 bg-slate-500/10 px-2.5 py-0.5 rounded-full border border-slate-800 uppercase tracking-widest font-mono">
                    🔴 Unconnected
                  </span>
                )}
              </div>

              {!gdriveConnected ? (
                <div className="p-3.5 rounded-2xl bg-blue-950/10 border border-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-blue-400 tracking-wider uppercase">গুগল কন্টাক্ট লিংক করুন</p>
                    <p className="text-[9px] text-slate-400 leading-normal font-medium">গুগল কন্টাক্টের সঙ্গে সিঙ্ক করতে গুগল অ্যাকাউন্ট ইন্টিগ্রেট করুন।</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (handleConnectGDrive) {
                        try { await handleConnectGDrive(); } catch (e: any) { alert(`Google OAuth failed: ${e.message || e}`); }
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 hover:scale-[1.02]"
                  >
                    Link Google Account
                  </button>
                </div>
              ) : (
                <div className="space-y-2 relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={contactsSearchQuery}
                      onChange={(e) => {
                        setContactsSearchQuery(e.target.value);
                        setShowContactsDropdown(true);
                      }}
                      onFocus={() => setShowContactsDropdown(true)}
                      placeholder=""
                      className="w-full text-xs font-bold py-2.5 px-3.5 pl-10 rounded-xl border-2 border-indigo-500/40 bg-white text-slate-900 focus:outline-none"
                    />
                    <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    {contactsSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setContactsSearchQuery('');
                          setShowContactsDropdown(false);
                        }}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {showContactsDropdown && contactsSearchQuery.trim() !== '' && (
                    <div className="absolute left-0 right-0 top-12 z-40 bg-white border-2 border-indigo-400 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-150">
                      {isFetchingContacts ? (
                        <div className="p-4 text-center text-[10px] text-slate-500 font-bold animate-pulse">⏳ Fetching contacts...</div>
                      ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((contact, i) => (
                          <div key={i} className="p-3 hover:bg-indigo-50 transition-all flex items-center justify-between gap-4 text-left">
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                                <span>{contact.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                                {contact.mobile && <span>📱 {contact.mobile}</span>}
                                {contact.email && <span>✉️ {contact.email}</span>}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomerName(contact.name);
                                if (contact.mobile) {
                                  let cleaned = contact.mobile.replace(/[\s\-\(\)]/g, '');
                                  if (cleaned.startsWith('+91')) cleaned = cleaned.substring(3);
                                  setCustomerMobile(cleaned);
                                }
                                setContactsSearchQuery('');
                                setShowContactsDropdown(false);
                                setVerificationResult(null);
                                triggerFeedback(`👤 Loaded customer: ${contact.name}`);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-[10px] text-rose-500 font-bold bg-rose-50 border border-rose-200">❌ No match in Google Contacts</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pink-500/10 cursor-pointer"
          >
            <span>Next: Services & Xerox (পরবর্তী ধাপ)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* AI BILLING ASSISTANT QUICK LINK */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/20 to-blue-950/20 border border-cyan-500/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="text-cyan-400 shrink-0 animate-pulse" size={18} />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400">AI billing assistant (এআই অটো-বিলিং)</p>
              <p className="text-[9px] text-slate-400 leading-tight">ভয়েস বা চ্যাটের মাধ্যমে অটোমেটিক বিল তৈরি করতে এআই ব্যবহার করুন।</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAiCalcOpen(true)}
            className="px-3.5 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-500/30 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer"
          >
            Open AI Builder
          </button>
        </div>

        {isAiCalcOpen && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/20 space-y-3 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-cyan-400">AI Prompt Billing</span>
              <button type="button" onClick={() => setIsAiCalcOpen(false)} className="text-slate-400 hover:text-white"><X size={14} /></button>
            </div>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., 2 copy xerox, 1 passport photo and laminating..."
              rows={2}
              className="w-full text-xs font-bold p-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiCalcOpen(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-[9px] uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessAiBilling}
                disabled={isAiCalcLoading}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isAiCalcLoading ? 'Processing...' : 'Apply Prompt'}
              </button>
            </div>
          </div>
        )}

        {/* SERVICE BUILDER WORKSTATION */}
        <div className="p-6 rounded-3xl bg-[#0a0a0c]/80 border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-3 flex justify-between items-center">
            <span className="text-xs font-black text-pink-400 uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid size={16} className="text-pink-400" /> ২. সার্ভিস ও ওয়ার্ক শিট (Service & Work Station)
            </span>
            {editingItemIndex !== null && (
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                Editing Item #{editingItemIndex + 1}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Name */}
            <div className="space-y-1.5 relative md:col-span-2">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">সার্ভিস বা প্রোডাক্ট নাম (Service/Product Name)</label>
              <input
                type="text"
                value={builderItemName}
                onChange={handleServiceSearchChange}
                onFocus={handleServiceSearchFocus}
                placeholder=""
                className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border-2 border-pink-500/40 bg-white text-slate-900 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
              />
              {filteredServiceSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[64px] z-30 bg-white border-2 border-pink-400 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
                  {filteredServiceSuggestions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectServiceSuggestion(s)}
                      className="w-full text-left p-2.5 hover:bg-pink-50 text-slate-900 font-bold border-b border-slate-100 transition-colors block text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-extrabold">{s.name}</p>
                          <p className="text-[9px] text-pink-600 font-semibold">{s.category}</p>
                        </div>
                        <span className="text-xs font-mono font-black text-slate-900 bg-pink-100 px-2 py-0.5 rounded-lg">₹{s.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">সার্ভিস চার্জ (Price ₹)</label>
              <input
                type="number" onWheel={(e) => e.currentTarget.blur()}
                min={0}
                value={builderItemPrice}
                onChange={(e) => setBuilderItemPrice(e.target.value)}
                placeholder=""
                className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border-2 border-pink-500/40 bg-white text-slate-900 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">পরিমাণ (Quantity)</label>
              <input
                type="number" onWheel={(e) => e.currentTarget.blur()}
                min={1}
                value={builderItemQuantity}
                onChange={(e) => setBuilderItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                placeholder=""
                className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border-2 border-pink-500/40 bg-white text-slate-900 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Work Done Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">কি কাজ করা হয়েছে (Work Done Description)</label>
              <input
                type="text"
                value={builderWorkDone}
                onChange={(e) => setBuilderWorkDone(e.target.value)}
                placeholder=""
                className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border-2 border-pink-500/40 bg-white text-slate-900 focus:outline-none"
              />
            </div>

            {/* Live Calculation Preview */}
            <div className="md:col-span-2 flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-pink-500/25 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-bold text-[11px]">
                  আইটেম হিসাব (Item Total Preview):
                </span>
              </div>
              <span className="font-mono font-black text-emerald-400 text-sm">
                ₹{((parseFloat(builderItemPrice) || 0) * (builderItemQuantity || 1)).toFixed(2)}
                <span className="text-[10px] text-slate-400 font-normal ml-2 font-sans">
                  (₹{parseFloat(builderItemPrice) || 0} × {builderItemQuantity || 1} Unit)
                </span>
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {editingItemIndex !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={handleAddOrUpdateItem}
              className={`flex-1 py-3 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                editingItemIndex !== null
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/15'
                  : 'bg-pink-600 hover:bg-pink-500 shadow-pink-600/15'
              }`}
            >
              <Plus size={14} className="text-white" />
              <span>{editingItemIndex !== null ? 'Update Service (আপডেট করুন)' : 'Done & Add Service (যুক্ত করুন)'}</span>
            </button>
          </div>
        </div>

        {/* QUICK SERVICE PANELS (XEROX & PRINT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Xerox Button */}
          <button
            type="button"
            onClick={() => setIsXeroxOpen(!isXeroxOpen)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
              isXeroxOpen 
                ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500 text-pink-400' 
                : 'bg-[#0a0a0c]/80 border-white/5 text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider">Xerox Service Workstation</p>
              <p className="text-[9px] text-slate-400 leading-normal font-medium">জেরক্স এর জন্য এখানে ক্লিক করুন।</p>
            </div>
            <Plus size={16} className={`transform transition-transform ${isXeroxOpen ? 'rotate-45 text-pink-400' : 'text-slate-400'}`} />
          </button>

          {/* Color Print Button */}
          <button
            type="button"
            onClick={() => setIsColorPrintEnabled(!isColorPrintEnabled)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
              isColorPrintEnabled 
                ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500 text-pink-400' 
                : 'bg-[#0a0a0c]/80 border-white/5 text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider">Color Print Workstation</p>
              <p className="text-[9px] text-slate-400 leading-normal font-medium">কালার প্রিন্ট এর জন্য এখানে ক্লিক করুন।</p>
            </div>
            <Plus size={16} className={`transform transition-transform ${isColorPrintEnabled ? 'rotate-45 text-pink-400' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Xerox drawer details */}
        {isXeroxOpen && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-pink-500/30 space-y-4 animate-fade-in">
            <div className="border-b border-white/5 pb-2">
              <p className="text-xs font-black text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                📄 Xerox Job Specification
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Xerox Copies (সংখ্যা)</label>
                <input
                  type="number" onWheel={(e) => e.currentTarget.blur()}
                  min={1}
                  value={xeroxCopies}
                  onChange={(e) => setXeroxCopies(Number(e.target.value))}
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-pink-500/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Rate (রেট ₹)</label>
                <input
                  type="number" onWheel={(e) => e.currentTarget.blur()}
                  min={1}
                  value={xeroxRate}
                  onChange={(e) => setXeroxRate(Number(e.target.value))}
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-pink-500/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Xerox Details/Purpose</label>
                <input
                  type="text"
                  value={xeroxPurpose}
                  onChange={(e) => setXeroxPurpose(e.target.value)}
                  placeholder="e.g. Aadhaar, Marks Sheet"
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-pink-500/40"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div className="text-[10px] text-slate-400 font-bold">
                Live Total: <span className="text-emerald-400 font-mono font-black text-xs">₹{xeroxCopies * xeroxRate}</span>
              </div>
              <button
                type="button"
                onClick={handleAddXeroxItem}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={12} className="text-white" />
                <span>Add Xerox (যুক্ত করুন)</span>
              </button>
            </div>
          </div>
        )}

        {/* Color Print drawer details */}
        {isColorPrintEnabled && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-pink-500/30 space-y-4 animate-fade-in">
            <div className="border-b border-white/5 pb-2">
              <p className="text-xs font-black text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                🖼️ Color Print Job Specification
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Copies (কপি সংখ্যা)</label>
                <input
                  type="number" onWheel={(e) => e.currentTarget.blur()}
                  min={1}
                  value={colorCopies}
                  onChange={(e) => setColorCopies(Number(e.target.value))}
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-pink-500/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Rate (রেট ₹)</label>
                <input
                  type="number" onWheel={(e) => e.currentTarget.blur()}
                  min={1}
                  value={colorRate}
                  onChange={(e) => setColorRate(Number(e.target.value))}
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-pink-500/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Color Print Details</label>
                <input
                  type="text"
                  value={colorPurpose}
                  onChange={(e) => setColorPurpose(e.target.value)}
                  placeholder="e.g. Photo Print, Digital ID"
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <div className="text-[10px] text-slate-400 font-bold">
                Live Total: <span className="text-emerald-400 font-mono font-black text-xs">₹{colorCopies * colorRate}</span>
              </div>
              <button
                type="button"
                onClick={handleAddColorPrintItem}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={12} className="text-white" />
                <span>Add Color Print (যুক্ত করুন)</span>
              </button>
            </div>
          </div>
        )}

        {/* LIST OF SUCCESSFULLY ADDED ITEMS */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-black flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400" /> যুক্ত করা অনলাইন সেবাসমূহ (Added Services - {cartItems.length})
          </h4>

          {cartItems.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-900 text-center text-slate-500">
              <AlertCircle size={20} className="mx-auto mb-2 opacity-30 text-cyan-400" />
              কোনো আইটেম এখনও যুক্ত করা হয়নি। উপর থেকে সার্ভিসটির নাম লিখে Done এ ক্লিক করুন।
            </div>
          ) : (
            <div className="space-y-2.5">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-900/80 hover:border-slate-800/80 flex justify-between items-center gap-3 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono font-black text-[#dfac5d] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-200 truncate">{extractItemName(item.name)}</p>
                      {item.description && (
                        <p className="text-[9px] text-slate-500 font-medium truncate mt-0.5">
                          📝 {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                      ₹{item.price}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEditAddedItem(index)}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer"
                        title="Edit item"
                      >
                        <PlusCircle size={13} className="rotate-45" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const next = cartItems.filter((_, i) => i !== index);
                          setCartItems(next);
                          triggerFeedback('🗑️ Item removed from list.');
                        }}
                        className="p-2 rounded-lg bg-rose-950/20 text-rose-400 border border-rose-900/40 hover:bg-rose-50 hover:text-white transition-all cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer"
          >
            Back (পূর্ববর্তী ধাপ)
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pink-500/10 cursor-pointer"
          >
            <span>Next: Settlement & Discount (পরবর্তী ধাপ)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="p-6 rounded-3xl bg-[#0a0a0c]/80 border border-white/5 space-y-4">
          <div className="border-b border-white/5 pb-3 flex justify-between items-center">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={16} className="text-[#dfac5d]" /> ৩. পেমেন্ট ও ডিসকাউন্ট (Settlement Parameters)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">পেমেন্ট পদ্ধতি (Method)</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-800 bg-[#050505] text-[#dfac5d] focus:outline-none"
              >
                <option value="Cash">Cash Payment</option>
                <option value="UPI">UPI Digital Transfer</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="NetBanking">Net Banking</option>
              </select>
            </div>

            {/* Ledger Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">বিল স্ট্যাটাস (Status)</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-800 bg-[#050505] text-emerald-400 focus:outline-none"
              >
                <option value="Paid">Fully Paid (পরিশোধিত)</option>
                <option value="Unpaid">Unpaid (বাকি)</option>
                <option value="Partial">Partially Paid (আংশিক)</option>
              </select>
            </div>

            {/* Amount Paid input if Partial */}
            {paymentStatus === 'Partial' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">পরিশোধিত টাকা (Amount Paid ₹)</label>
                <input
                  type="number" onWheel={(e) => e.currentTarget.blur()}
                  min={0}
                  value={partialAmountPaid || ''}
                  onChange={(e) => setPartialAmountPaid(Number(e.target.value))}
                  placeholder=""
                  className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-amber-500 focus:outline-none"
                />
              </div>
            )}

            {/* Discount */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase text-slate-400 font-extrabold block">ছাড়ের পরিমাণ (Discount ₹)</label>
              <input
                type="number" onWheel={(e) => e.currentTarget.blur()}
                min={0}
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                placeholder=""
                className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Save & Generate invoice trigger */}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-2xl font-black text-center text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_8px_30px_rgba(223,172,93,0.3)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles size={16} className="animate-pulse" />
            <span>সেভ এবং বিল জেনারেট করুন (Save & Generate Bill Receipt)</span>
          </button>
        </div>

        {/* Back Button */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer"
          >
            Back (পূর্ববর্তী ধাপ)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none bg-gradient-to-br from-purple-950 via-slate-950 to-[#020617] p-6 md:p-10 rounded-3xl border border-purple-500/20 text-white shadow-2xl">
      
      {/* Toast notifications */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0a0a0c] border border-amber-500/40 text-[#dfac5d] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-2 max-w-sm">
          <Sparkles size={16} className="text-cyan-400 shrink-0 animate-spin" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfac5d]/5 rounded-bl-full pointer-events-none" />
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-200 to-slate-100 tracking-tight uppercase">
            Billing & POS Control Desk
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Create multi-service dynamic receipts with instant logo stamps, printing, and automated CRM tracking.
          </p>
        </div>
        
        {showInvoicePreview && (
          <button 
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-xl border border-[#dfac5d]/30 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-colors cursor-pointer text-[10px] font-black uppercase tracking-wider bg-[#dfac5d]/5"
          >
            Create New Bill
          </button>
        )}
      </div>

      {/* TWO PANEL WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PANEL 1: BILL CREATION FORM (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveBill} className="space-y-6">
            
            {/* Step Progress Bar */}
            <div className="p-4 rounded-3xl bg-slate-900/30 border border-white/5 flex justify-between items-center gap-2">
              {[
                { step: 1, label: 'Name & Details', sub: 'গ্রাহকের নাম ও বিবরণ' },
                { step: 2, label: 'Service & Work', sub: 'সার্ভিস ও জেরক্স/প্রিন্ট' },
                { step: 3, label: 'Payment & Discount', sub: 'পেমেন্ট ও ডিসকাউন্ট' }
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex-1 p-3 rounded-2xl border text-center transition-all ${
                    currentStep === s.step
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/50 text-white shadow-lg shadow-pink-500/5'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      currentStep === s.step ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {s.step}
                    </span>
                    <span className="text-[10px] font-black tracking-tight uppercase block leading-none">{s.label}</span>
                    <span className="text-[8px] font-bold text-slate-500 block leading-none">{s.sub}</span>
                  </div>
                </button>
              ))}
            </div>

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

          </form>
        </div>

        {/* PANEL 2: INVOICE PREVIEW SCREEN (5 Cols) */}
        <div className="lg:col-span-5">
          {!showInvoicePreview || !activeInvoice ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center space-y-4 bg-[#0a0a0c]/20">
              <Receipt size={40} className="mx-auto text-slate-700 animate-pulse" />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Invoice Receipt Preview</h4>
              <p className="text-[10px] text-slate-600 max-w-xs mx-auto">
                Fill the specification details on the left workstation and generate. A certified multi-service print-ready invoice will display here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PRINT CSS STYLESHEET */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body {
                    background: white !important;
                    color: black !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: flex-start !important;
                    min-height: 100vh !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  /* Hide all parts of the web app layout */
                  body > *:not(#rodp-printable-invoice-wrapper),
                  #root, header, footer, nav, aside, button, .no-print {
                    display: none !important;
                  }
                  /* Render ONLY our printable wrapper */
                  #rodp-printable-invoice-wrapper, 
                  #rodp-printable-invoice-wrapper *,
                  #rodp-printable-invoice, 
                  #rodp-printable-invoice * {
                    display: block !important;
                    visibility: visible !important;
                  }
                  #rodp-printable-invoice-wrapper {
                    position: static !important;
                    width: 100% !important;
                    max-width: 180mm !important; /* A4 width minus margins */
                    margin: 0 auto !important;
                    padding: 0 !important;
                    background: white !important;
                  }
                  #rodp-printable-invoice {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                    padding: 10mm !important;
                    border: 1px solid #cbd5e1 !important;
                    border-radius: 16px !important;
                    box-shadow: none !important;
                  }
                  /* Remove browser margins and default page info */
                  @page {
                    size: A4;
                    margin: 15mm 10mm;
                  }
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              `}} />

              {/* PRINTABLE BLOCK WRAPPER */}
              <div id="rodp-printable-invoice-wrapper" className="w-full">
                {/* PRINTABLE BLOCK */}
                <div 
                  ref={invoiceRef}
                  id="rodp-printable-invoice"
                  className="p-8 rounded-3xl bg-white text-slate-900 space-y-8 shadow-2xl relative overflow-hidden border border-slate-200"
                >
                  {/* Visual corner decoration */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-slate-100/50 rounded-bl-full pointer-events-none" />

                  {/* Header Information with Official Shop Logo */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-3">
                      {/* Stylized Shop Logo */}
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0 border border-slate-850">
                        R
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">OFFICIAL RECEIPT</h2>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-0.5">RIZWAN ONLINE DREAMS PLATFORM</h1>
                        <p className="text-[8px] text-slate-500 font-bold leading-normal max-w-xs mt-0.5">
                          Jalangi, Barabila, Murshidabad, West Bengal, Pin-742305<br />
                          Authorized Government CSC Service Hub & Digital Biometric Node
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right font-semibold">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Ledger Code</span>
                      <span className="text-sm font-mono font-black text-slate-900 block">{activeInvoice.invoiceNumber}</span>
                      <span className={`text-[8px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-2 uppercase tracking-wider border ${
                        activeInvoice.paymentStatus === 'Paid' 
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
                          : activeInvoice.paymentStatus === 'Unpaid'
                            ? 'text-rose-600 bg-rose-50 border-rose-200'
                            : 'text-amber-600 bg-amber-50 border-amber-200'
                      }`}>
                        {activeInvoice.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* DYNAMIC MULTI-SERVICE LOGO DECK */}
                  <div className="space-y-2">
                    <span className="text-[8px] uppercase text-slate-400 tracking-wider block font-bold">Authorized Service Gates</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getServiceCategoryLogos(activeInvoice.items).map((logo, index) => (
                        <div 
                          key={logo.key + '_' + index} 
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all ${logo.bgClass} ${logo.borderClass} ${logo.textClass}`}
                        >
                          <div className="p-1 rounded-lg bg-white border border-slate-200/60 shrink-0 shadow-sm flex items-center justify-center">
                            {logo.icon}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[9px] font-black tracking-tight leading-none truncate">{logo.logoText}</p>
                            <p className="text-[7px] text-slate-500 font-bold font-mono tracking-wide leading-none truncate">{logo.subText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Billing Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-b border-slate-100 py-4">
                    <div>
                      <span className="text-[8px] uppercase text-slate-400 block font-bold">Billing Recipient (গ্রাহক)</span>
                      <span className="text-slate-800 font-extrabold block mt-0.5 text-xs">{activeInvoice.customerName}</span>
                      <span className="text-slate-500 block mt-0.5 font-mono text-[9px]">
                        {activeInvoice.customerMobile ? `Contact: ${activeInvoice.customerMobile}` : 'Contact: Not Provided'}
                      </span>
                      <span className="text-slate-500 block mt-0.5 font-mono text-[9px]">
                        App ID: {activeInvoice.customerId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase text-slate-400 block font-bold">Date of Issuance</span>
                      <span className="text-slate-800 font-extrabold block mt-0.5">{activeInvoice.createdAt.substring(0, 10)}</span>
                      <span className="text-slate-500 block mt-0.5 font-mono">Time: {activeInvoice.createdAt.substring(11, 16)} UTC</span>
                    </div>
                  </div>

                  {/* Service Items Table */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-12 gap-2 text-[8px] uppercase tracking-wider text-slate-400 font-extrabold border-b border-slate-100 pb-1.5">
                      <span className="col-span-1">#</span>
                      <span className="col-span-9">Description of Services Rendered</span>
                      <span className="col-span-2 text-right">Amount</span>
                    </div>

                    {activeInvoice.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 text-[10px] text-slate-800 font-bold border-b border-slate-50 pb-2">
                        <span className="col-span-1 font-mono text-slate-400">{index + 1}</span>
                        <span className="col-span-9">{extractItemName(item.name)}</span>
                        <span className="col-span-2 text-right font-mono text-slate-900">₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Computation Summary */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-4 text-[10px]">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal Base Charge</span>
                      <span className="font-mono">₹{activeInvoice.subtotal}</span>
                    </div>
                    {activeInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount (ছাড়)</span>
                        <span className="font-mono">-₹{activeInvoice.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Central & State GST (Exempt)</span>
                      <span className="font-mono">₹0</span>
                    </div>
                    <div className="flex justify-between text-slate-900 pt-2 text-xs font-extrabold border-t border-dashed border-slate-200">
                      <span className="uppercase tracking-wider text-[#050505]">Certified Net Bill Total</span>
                      <span className="font-mono text-sm text-slate-900">₹{activeInvoice.totalAmount}</span>
                    </div>

                    {/* Paid and Remaining breakdown */}
                    <div className="flex justify-between text-emerald-600 pt-1 text-[10px] font-bold">
                      <span>Amount Deposited (জমা টাকা)</span>
                      <span className="font-mono">₹{(activeInvoice.amountPaid ?? activeInvoice.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 pb-1 text-[10px] font-bold">
                      <span>Remaining Balance (বাকি টাকা)</span>
                      <span className="font-mono">₹{(activeInvoice.remainingBalance ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Disclaimer Policy */}
                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-1 text-[8px] text-slate-500 leading-relaxed font-sans">
                    <p className="font-bold text-amber-600 uppercase tracking-wider text-[7px]">Small Business Policy & Compliance Notice</p>
                    <p>
                      <strong>English:</strong> We are a small-scale rural digital service kiosk operating under micro-enterprise tax exemption guidelines. In accordance with the Government of India Income Tax Act, GST is neither charged nor collected.
                    </p>
                    <p>
                      <strong>বাংলা:</strong> আমরা গ্রামীণ এলাকার একটি ক্ষুদ্র ডিজিটাল সেবা কেন্দ্র যা ক্ষুদ্র উদ্যোগ কর অব্যাহতি নীতিমালার অধীনে পরিচালিত। ভারতের আয়কর আইন অনুযায়ী, এখানে কোনো রকম জিএসটি (GST) নেওয়া বা দেওয়া হয় না।
                    </p>
                  </div>

                  {/* Audit Settlement details */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-[9px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-bold">Settlement Mode:</span>
                      <span className="font-mono text-slate-800 font-extrabold">{activeInvoice.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Ledger status:</span>
                      <span className={`font-mono font-extrabold ${
                        activeInvoice.paymentStatus === 'Paid' 
                          ? 'text-emerald-600' 
                          : activeInvoice.paymentStatus === 'Unpaid' 
                            ? 'text-rose-600' 
                            : 'text-amber-600'
                      }`}>
                        {activeInvoice.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="pt-2 text-center text-[8px] text-slate-400 font-mono uppercase tracking-widest border-t border-slate-200 mt-2">
                      OFFICIALLY CERTIFIED SECURE LEDGER RECEIPT
                    </div>
                  </div>

                  {/* Simple Footer Signature Spacer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <div className="text-right">
                      <div className="w-40 border-b border-slate-300 mb-1"></div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Authorized Signature</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download size={15} className="text-[#dfac5d]" />
                  <span className="text-[10px] uppercase tracking-widest font-black">Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer size={15} className="text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-widest font-black">Print Invoice</span>
                </button>
              </div>

              {/* DONE ACTION BUTTON */}
              <button
                type="button"
                onClick={() => {
                  playBillSaveSound();
                  triggerFeedback('💾 বিলটি সফলভাবে হিস্ট্রি সেকশনে সংরক্ষিত হয়েছে! (Saved & Synced)');
                  handleResetForm();
                  if (setCurrentTab) {
                    setCurrentTab('bill_history');
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-center text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 border border-emerald-400/20"
              >
                <CheckCircle size={15} className="text-white" />
                <span>সম্পন্ন করুন (Done / Save & Close)</span>
              </button>

              {/* SAVE MOBILE NUMBER & SEND E-COPY */}
              {activeInvoice.customerMobile && (
                <button
                  type="button"
                  disabled={isMobileSavedSuccessfully}
                  onClick={handleSaveMobileAndSendECopy}
                  className={`w-full py-3 text-xs uppercase tracking-widest font-black rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isMobileSavedSuccessfully 
                      ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : 'bg-[#dfac5d]/10 hover:bg-[#dfac5d]/20 border-[#dfac5d]/20 text-[#dfac5d] active:scale-98 shadow-md shadow-amber-500/5'
                  }`}
                >
                  {isMobileSavedSuccessfully ? (
                    <>
                      <CheckCircle size={15} className="text-emerald-400" />
                      <span>মোবাইল নম্বর সংরক্ষিত (Mobile Number Saved ✓)</span>
                    </>
                  ) : (
                    <>
                      <FileText size={15} className="text-[#dfac5d]" />
                      <span>সেভ মোবাইল নম্বর ও ই-কপি পাঠান (Save Mobile & Send E-Copy)</span>
                    </>
                  )}
                </button>
              )}

              {/* SAVE TO GOOGLE CONTACTS */}
              {activeInvoice.customerMobile && gdriveConnected && (
                <button
                  type="button"
                  disabled={isContactSaved || isSavingContact}
                  onClick={handleSaveToGoogleContacts}
                  className={`w-full py-3 text-xs uppercase tracking-widest font-black rounded-2xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isContactSaved 
                      ? 'bg-blue-950/40 border-blue-500/20 text-blue-400 cursor-not-allowed'
                      : 'bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/20 text-blue-400 active:scale-98 shadow-md shadow-blue-500/5'
                  }`}
                >
                  {isSavingContact ? (
                    <>
                      <RefreshCw size={15} className="animate-spin text-blue-400" />
                      <span>সংরক্ষণ হচ্ছে... (Saving Contact...)</span>
                    </>
                  ) : isContactSaved ? (
                    <>
                      <CheckCircle size={15} className="text-blue-400" />
                      <span>গুগল কন্টাক্টে সংরক্ষিত (Saved to Google Contacts ✓)</span>
                    </>
                  ) : (
                    <>
                      <Users size={15} className="text-blue-400" />
                      <span>গুগল কন্টাক্টে সেভ করুন (Save to Google Contacts)</span>
                    </>
                  )}
                </button>
              )}

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
