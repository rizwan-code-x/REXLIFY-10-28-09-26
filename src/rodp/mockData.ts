import { 
  Shop, User, ServiceModule, Appointment, Task, 
  CustomerCRM, Invoice, InventoryItem, DocumentVaultItem, 
  Staff, FinanceRecord, NotificationLog, SecurityLog
} from './types';
import { MAIN_OFFICE_PHOTO_URL } from './components/DeveloperMedia';

export const DEFAULT_SERVICES: ServiceModule[] = [
  { id: 'aadhaar', name: '🆔 Aadhaar Services', icon: 'Server', category: 'Identity', description: 'Biometric registration, demographic updates, name/address corrections, & e-Aadhaar downloads.', price: 50 },
  { id: 'pan', name: '💳 PAN Card Services', icon: 'Server', category: 'Finance', description: 'New PAN applications, corrections, reprint requests, & Aadhaar-PAN linking.', price: 150 },
  { id: 'voter', name: '🗳️ Voter Card Services', icon: 'Server', category: 'Identity', description: 'New voter enrollment, card replacement, address updates, & epic downloads.', price: 50 },
  { id: 'passport', name: '📕 Passport Services', icon: 'Server', category: 'Travel', description: 'Fresh passport bookings, renewals, tatkaal services, & PCC application assistance.', price: 500 },
  { id: 'train', name: '🚆 Train Ticket Services', icon: 'Server', category: 'Travel', description: 'IRCTC authorized booking, instant cancellation, tatkal booking, & PNR status tracking.', price: 60 },
  { id: 'flight', name: '✈️ Flight Ticket Services', icon: 'Server', category: 'Travel', description: 'Domestic & international flight bookings, web check-in, and baggage assistance.', price: 100 },
  { id: 'hotel', name: '🏨 Hotel Booking', icon: 'Server', category: 'Travel', description: 'Affordable and premium hotel accommodations across India with instant confirmation.', price: 150 },
  { id: 'print', name: '🖨️ Print & Xerox', icon: 'Server', category: 'Document', description: 'High-speed black & white and high-quality color prints on premium paper.', price: 5 },
  { id: 'document', name: '📄 Document Services', icon: 'Server', category: 'Document', description: 'Affidavit drafting, legal agreements, stamp papers, scanners, and typing services.', price: 100 },
  { id: 'banking', name: '🏦 Banking Services', icon: 'Server', category: 'Finance', description: 'AEPS micro ATM withdrawals, balance inquiry, account opening assistance.', price: 20 },
  { id: 'money', name: '💰 Money Transfer', icon: 'Server', category: 'Finance', description: 'Instant IMPS/NEFT fund transfer to any bank account in India, 24/7.', price: 25 },
  { id: 'recharge', name: '📲 Mobile Recharge', icon: 'Server', category: 'Telecom', description: 'Prepaid mobile recharges and postpaid bill payments for all network operators.', price: 10 },
  { id: 'electricity', name: '⚡ Electricity Bill Payment', icon: 'Server', category: 'Utilities', description: 'Instant bill verification and payment receipt generation for state boards.', price: 15 },
  { id: 'dth', name: '📺 DTH Recharge', icon: 'Server', category: 'Telecom', description: 'Fast, hassle-free recharges for Tata Play, Airtel DTH, DishTV, & Videocon.', price: 10 },
  { id: 'govt', name: '📋 Government Services', icon: 'Server', category: 'Govt Schemes', description: 'E-Shram card, PM-Kisan registration, Ration Card corrections, & pension forms.', price: 100 },
  { id: 'education', name: '🎓 Education Services', icon: 'Server', category: 'Education', description: 'College admission form assistance, exam results, and scholarship applications.', price: 150 },
  { id: 'job', name: '💼 Job Application Services', icon: 'Server', category: 'Education', description: 'Government job form fillings (SSC, UPSC, Railway, banking) & resume drafting.', price: 150 },
  { id: 'insurance', name: '🛡️ Insurance Services', icon: 'Server', category: 'Finance', description: 'Two-wheeler, four-wheeler, life, and health insurance instant policy issuance.', price: 200 },
  { id: 'photo', name: '📷 Photo Services', icon: 'Server', category: 'Document', description: 'Professional passport-size photo printing, image editing, and background removal.', price: 50 },
  { id: 'online_form', name: '🌐 Online Form Fillup', icon: 'Server', category: 'Govt Schemes', description: 'Assistance for various state and central portals, applications, and certs.', price: 80 },
  { id: 'cyber', name: '💻 Cyber Cafe Services', icon: 'Server', category: 'Utilities', description: 'High-speed internet browsing, typing work, online exams, and computer usage.', price: 40 }
];

export const MOCK_SHOPS: Shop[] = [
  {
    id: 'shop_1',
    name: 'RIZWAN ONLINE DREAMS (Head Office)',
    ownerName: 'Rizwan RR',
    ownerEmail: 'rizwanroushan0@gmail.com',
    mobile: '9593388785',
    address: 'VILLAGE BARABILA, P.O FARIDPUR, P.S SAGARPARA, MURSHIDABAD, W.B. 742303',
    gstNumber: '',
    logoUrl: MAIN_OFFICE_PHOTO_URL,
    status: 'approved',
    subscriptionType: 'premium_yearly',
    createdAt: '2026-01-10',
    customId: 'ROD001',
    password: 'RTX@0012352',
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
    branchHead: 'Rizwan RR',
    roleType: 'office',
    isMainBranch: true,
    managerPhoto: MAIN_OFFICE_PHOTO_URL,
    managerBio: 'প্রতিষ্ঠাতা ও সিইও হিসেবে হেড অফিসের সমস্ত কার্যক্রম পরিচালনা ও প্রতিটি ব্রাঞ্চের কাজের মান তদারকি করাই আমার দায়িত্ব।',
    congratulationsMsg: 'অভিনন্দন! আপনি আমাদের হেড অফিস ও সমস্ত ব্রাঞ্চ নেটওয়ার্কের সিইও ও প্রতিষ্ঠাতা।',
    distanceFromHeadOffice: '0 km (Head Office)',
    geoCoords: { lat: 24.214, lng: 88.682 },
    branchPhotosApproved: true,
    branchPhotos: [
      MAIN_OFFICE_PHOTO_URL,
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
    ],
    branchDescription: 'Rizwan Online Dreams Central Head Office HQ - Controlling all branches, databases, and customer operations across Murshidabad district.'
  },
  {
    id: 'shop_2',
    name: 'JAHANARA FREE SERVICE SUPPORT PROGRAM',
    ownerName: 'Jillar Hossain',
    ownerEmail: 'jillar.rcs102@rodp.com',
    mobile: '9593388785',
    address: 'VILLAGE BARABILA, P.O FARIDPUR, SAGARPARA, MURSHIDABAD, W.B. 742303',
    gstNumber: '',
    logoUrl: MAIN_OFFICE_PHOTO_URL,
    status: 'approved',
    subscriptionType: 'premium_yearly',
    createdAt: '2026-02-01',
    customId: 'RCS102',
    password: 'RCS@0012352',
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
    branchHead: 'Jillar Hossain',
    roleType: 'branch',
    isMainBranch: false,
    managerBio: '২য় ব্রাঞ্চের ম্যানেজার হিসেবে সততা ও দক্ষতার সাথে ফ্রি সার্ভিস সাপোর্ট প্রগ্রাম ও সিএসসি সেবা পরিচালনায় নিবেদিত।',
    congratulationsMsg: 'অভিনন্দন জিলদার হোসেন! ২য় ব্রাঞ্চ (JAHANARA FREE SERVICE SUPPORT PROGRAM) এর ব্রাঞ্চ ম্যানেজার হিসেবে আপনার অবদান প্রশংসনীয়।',
    distanceFromHeadOffice: '1.5 km',
    geoCoords: { lat: 24.218, lng: 88.687 },
    branchPhotosApproved: true,
    branchPhotos: [
      MAIN_OFFICE_PHOTO_URL,
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
    ],
    branchDescription: 'Jahanara Free Service Support Program & CSC Center providing full digital support to citizens.'
  },
  {
    id: 'shop_3',
    name: 'MAM TELECOM',
    ownerName: 'Ebne Farhad',
    ownerEmail: 'ebne.mam103@rodp.com',
    mobile: '9593388785',
    address: 'VILLAGE + P.O HAREKRISHNAPUR, SAGARPARA, MURSHIDABAD, W.B. 742305',
    gstNumber: '',
    logoUrl: MAIN_OFFICE_PHOTO_URL,
    status: 'approved',
    subscriptionType: 'premium_yearly',
    createdAt: '2026-02-10',
    customId: 'MAM103',
    password: 'MAM@0012352',
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
    branchHead: 'Ebne Farhad',
    roleType: 'branch',
    isMainBranch: false,
    managerBio: '৩য় ব্রাঞ্চ (ম্যাম টেলিকম - হরেকৃষ্ণপুর) এর সফল পরিচালনায় নিবেদিতপ্রাণ ব্রাঞ্চ ম্যানেজার।',
    congratulationsMsg: 'অভিনন্দন ইবনে ফরহাদ! ৩য় ব্রাঞ্চ (MAM TELECOM) এর ব্রাঞ্চ ম্যানেজার হিসেবে আপনাকে অনেক শুভেচ্ছা।',
    distanceFromHeadOffice: '3.0 km (Harekrishnapur)',
    geoCoords: { lat: 24.225, lng: 88.695 },
    branchPhotosApproved: true,
    branchPhotos: [
      MAIN_OFFICE_PHOTO_URL,
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
    ],
    branchDescription: 'MAM Telecom Harekrishnapur Branch - 3 KM from Head Office providing telecom and digital services.'
  },
  {
    id: 'shop_4',
    name: 'FARIDPUR CSC CENTER',
    ownerName: 'Humayan K.',
    ownerEmail: 'humayan.far104@rodp.com',
    mobile: '9593388785',
    address: 'VILLAGE + P.O FARIDPUR, JALANGI, MURSHIDABAD, W.B. 742303',
    gstNumber: '',
    logoUrl: MAIN_OFFICE_PHOTO_URL,
    status: 'approved',
    subscriptionType: 'premium_yearly',
    createdAt: '2026-02-15',
    customId: 'FAR104',
    password: 'FAR@0012352',
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
    branchHead: 'Humayan K.',
    roleType: 'branch',
    isMainBranch: false,
    managerBio: '৪র্থ ব্রাঞ্চ (ফরিদপুর সিএসসি সেন্টার) এর সকল গ্রাহক সেবা দ্রুত ও নির্ভরযোগ্যভাবে প্রদান করছি।',
    congratulationsMsg: 'অভিনন্দন হুমায়ুন কে.! ৪র্থ ব্রাঞ্চ (FARIDPUR CSC CENTER) এর ব্রাঞ্চ ম্যানেজার হিসেবে সুস্বাগতম।',
    distanceFromHeadOffice: '7.0 km (Faridpur)',
    geoCoords: { lat: 24.240, lng: 88.710 },
    branchPhotosApproved: true,
    branchPhotos: [
      MAIN_OFFICE_PHOTO_URL,
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
    ],
    branchDescription: 'Faridpur CSC Center Branch - 7 KM from Head Office providing public digital government card services.'
  },
  {
    id: 'shop_5',
    name: 'Rizwan online service',
    ownerName: 'Rizwan RR',
    ownerEmail: 'rizwan.rrr105@rodp.com',
    mobile: '9593388785',
    address: 'VILLAGE BARABILA, P.O FARIDPUR, SAGARPARA, MURSHIDABAD, W.B. 742303',
    gstNumber: '',
    logoUrl: MAIN_OFFICE_PHOTO_URL,
    status: 'approved',
    subscriptionType: 'premium_yearly',
    createdAt: '2026-02-20',
    customId: 'RRR105',
    password: 'RRR@0012352',
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
    branchHead: 'Rizwan RR',
    roleType: 'branch',
    isMainBranch: false,
    managerBio: '৫ম ব্রাঞ্চ (রিজওয়ান অনলাইন সার্ভিস) এর সকল অনলাইন সার্ভিস পরিচালনায় নিয়োজিত।',
    congratulationsMsg: 'অভিনন্দন রিজওয়ান আরআর! ৫ম ব্রাঞ্চ (Rizwan online service) এর ব্রাঞ্চ ম্যানেজার হিসেবে আপনাকে শুভেচ্ছা।',
    distanceFromHeadOffice: '2.2 km',
    geoCoords: { lat: 24.210, lng: 88.675 },
    branchPhotosApproved: true,
    branchPhotos: [
      MAIN_OFFICE_PHOTO_URL,
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
    ],
    branchDescription: 'Rizwan Online Service - Dedicated branch for online application and portal processing.'
  },
  {
    id: 'shop_6',
    name: 'CSC SERVICE CENTRE',
    ownerName: '[Enter Branch Manager Name]',
    ownerEmail: 'cscl106@rodp.com',
    mobile: '9593388785',
    address: 'SAGARPARA MAIN MARKET, MURSHIDABAD, W.B. 742305',
    gstNumber: '',
    logoUrl: MAIN_OFFICE_PHOTO_URL,
    status: 'pending',
    subscriptionType: 'premium_yearly',
    createdAt: '2026-02-25',
    customId: 'CSCL106',
    password: 'CSCL 0012350',
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
    branchHead: '[Manager Pending CEO Registration]',
    roleType: 'branch',
    isMainBranch: false,
    managerBio: '৬ষ্ঠ ব্রাঞ্চের ম্যানেজার রেজিস্ট্রেশন ও সিইও অ্যাপ্রুভাল পেন্ডিং রয়েছে।',
    congratulationsMsg: '৬ষ্ঠ ব্রাঞ্চ নিবন্ধনের জন্য প্রস্তুত। সিইও প্যানেল থেকে ম্যানেজার নেম রেজিস্টার করে এপ্রুভ সম্পন্ন করুন।',
    distanceFromHeadOffice: '5.5 km',
    geoCoords: { lat: 24.230, lng: 88.702 },
    branchPhotosApproved: false,
    branchPhotos: [],
    branchDescription: 'CSC Service Centre Branch 6 - Currently pending manager registration and 5-photo upload approval from CEO.'
  }
];

export const MOCK_CUSTOMERS: CustomerCRM[] = [];

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const MOCK_TASKS: Task[] = [];
export const MOCK_INVENTORIES: InventoryItem[] = [];
export const MOCK_STAFF: Staff[] = [
  {
    id: 'stf_ceo',
    name: 'Rizwan Roushan',
    email: 'rizwanroushan0@gmail.com',
    mobile: '9593388785',
    role: 'Manager',
    designation: 'CEO & Founder / Head Manager',
    status: 'Active',
    salary: 100000,
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance'],
    attendance: { '2026-08-01': 'Present' },
    shopId: 'jalangi',
    branchCode: 'ROD-HQ',
    address: 'Sadhanganj Bazar Road, Jalangi, Murshidabad, WB - 742305',
    customId: 'CEO-001',
    password: 'RTX@0012352',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    issueDate: '2026-08-01',
    validTill: '2030-12-31'
  },
  {
    id: 'stf_1',
    name: 'Rizwan RR',
    email: 'rizwan.jalangi@rodp.com',
    mobile: '9593388785',
    role: 'Manager',
    designation: 'Jalangi Branch Head Manager',
    status: 'Active',
    salary: 50000,
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance'],
    attendance: { '2026-08-01': 'Present' },
    shopId: 'jalangi',
    branchCode: 'ROD001',
    address: 'Jalangi Main Center, Murshidabad, WB - 742305',
    customId: 'ROD001',
    password: 'RTX@0012352',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    issueDate: '2026-08-01',
    validTill: '2030-12-31'
  },
  {
    id: 'stf_2',
    name: 'Rizwan Roushan (RCS)',
    email: 'rizwan.rcs102@rodp.com',
    mobile: '9593388785',
    role: 'Manager',
    designation: 'Raipur Center Manager',
    status: 'Active',
    salary: 25000,
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory'],
    attendance: { '2026-08-01': 'Present' },
    shopId: 'shop_2',
    branchCode: 'RCS102',
    address: 'Raipur CSC Hub, Jalangi, Murshidabad',
    customId: 'RCS102',
    password: 'RCS@0012352',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300',
    issueDate: '2026-08-01',
    validTill: '2030-12-31'
  },
  {
    id: 'stf_3',
    name: 'Ebne Farhad',
    email: 'ebne.mam103@rodp.com',
    mobile: '9593388785',
    role: 'Manager',
    designation: 'Mamudpur Branch Manager',
    status: 'Active',
    salary: 25000,
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory'],
    attendance: { '2026-08-01': 'Present' },
    shopId: 'shop_3',
    branchCode: 'MAM103',
    address: 'Mamudpur Station Road, Murshidabad',
    customId: 'MAM103',
    password: 'MAM@0012352',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    issueDate: '2026-08-01',
    validTill: '2030-12-31'
  },
  {
    id: 'stf_4',
    name: 'Humayan K.',
    email: 'humayan.far104@rodp.com',
    mobile: '9593388785',
    role: 'Manager',
    designation: 'Faridpur Branch Manager',
    status: 'Active',
    salary: 25000,
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory'],
    attendance: { '2026-08-01': 'Present' },
    shopId: 'shop_4',
    branchCode: 'FAR104',
    address: 'Faridpur Bus Stand Crossing, Murshidabad',
    customId: 'FAR104',
    password: 'FAR@0012352',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    issueDate: '2026-08-01',
    validTill: '2030-12-31'
  }
];

export const MOCK_INVOICES: Invoice[] = [];
export const MOCK_FINANCE: FinanceRecord[] = [];
export const MOCK_DOCUMENTS: DocumentVaultItem[] = [];
export const MOCK_NOTIFICATIONS: NotificationLog[] = [];
export const MOCK_SECURITY_LOGS: SecurityLog[] = [];

export const MOCK_NOTICES = [
  {
    id: 'notice_1',
    title: 'জরুরী বিজ্ঞপ্তি: নতুন ভোটার কার্ড আবেদন এবং সংশোধন শুরু হয়েছে 🗳️',
    body: '• ভোটার কার্ড সংশোধনের জন্য আপনার নিকটবর্তী আধার কার্ড এবং জন্মের প্রমাণপত্র সঙ্গে আনুন।\n• ১০ মিনিটে ভোটার কার্ড সংশোধন এবং e-Epic ডাউনলোড করুন।\n• বিশেষ করে নামের বানান ও জন্মতারিখ সংশোধন করা যাবে।\n• আমাদের সেন্টারে এই সপ্তাহে বিশেষ ছাড় রয়েছে অনলাইন ফর্ম ফিলআপের চার্জে।',
    status: 'active' as const,
    createdAt: '2026-07-15T09:00:00Z'
  },
  {
    id: 'notice_2',
    title: 'আধার কার্ড এবং প্যান কার্ড লিঙ্ক পরিষেবা চালু আছে 💳',
    body: '• ভারত সরকারের নির্দেশিকা অনুযায়ী প্যান আধার লিঙ্ক করা বাধ্যতামূলক।\n• অবহেলা করলে আপনার প্যান কার্ড নিষ্ক্রিয় হতে পারে।\n• আজই আমাদের সেন্টারে এসে লিঙ্ক স্টেটাস চেক করুন।\n• নতুন প্যান কার্ড মাত্র ৩ দিনে ইমেলে চলে আসবে।',
    status: 'active' as const,
    createdAt: '2026-07-16T10:30:00Z'
  },
  {
    id: 'notice_3',
    title: 'অনলাইন পাসপোর্ট আবেদন এবং ভিসা কনসালটেশন 📕',
    body: '• ফ্রেশ পাসপোর্ট এবং রিনিউয়ালের বুকিং অত্যন্ত দ্রুত করা হচ্ছে।\n• পুলিশ ক্লিয়ারেন্স সার্টিফিকেট (PCC) আবেদন সহায়তা।\n• দ্রুত স্লট বুকিং এবং ইন্টারভিউ গাইডেন্স দেওয়া হবে।',
    status: 'active' as const,
    createdAt: '2026-07-17T06:00:00Z'
  }
];

export const MOCK_INQUIRIES = [
  {
    id: 'inq_1',
    name: 'আব্দুল করিম (Abdul Karim)',
    mobile: '01712345678',
    address: 'জলঙ্গী, মুর্শিদাবাদ',
    message: 'আমার ভোটার কার্ডে নামের বানান ভুল আছে, এটা কি সংশোধন করা যাবে এবং কত সময় লাগবে?',
    createdAt: '2026-07-17T06:10:00Z'
  }
];
