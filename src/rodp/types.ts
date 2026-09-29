export type UserRole = 'super_admin' | 'shop_owner' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  shopId?: string; // empty if super_admin
  mobile?: string;
  avatar?: string;
  permissions?: string[];
  dob?: string;
  gender?: string;
  address?: string;
  profileCompletion?: number;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  mobile: string;
  address: string;
  gstNumber?: string;
  logoUrl?: string;
  status: 'pending' | 'approved' | 'suspended' | 'hold' | 'Deleted';
  subscriptionType: 'free' | 'basic_monthly' | 'premium_yearly' | 'enterprise_franchise';
  createdAt: string;
  customId?: string;       // 3-digit unique branch/staff ID
  password?: string;       // Login password for the branch
  permissions?: string[];  // Custom enabled permissions (e.g. ['billing', 'crm'])
  branchHead?: string;     // Head of Branch
  roleType?: 'branch' | 'office' | 'staff'; // Entity category
  accentColor?: string;    // Custom platform theme accent color
  isMainBranch?: boolean;  // Whether this is the Main Branch (মেন ব্রাঞ্চ)
  managerPhoto?: string;   // Branch manager avatar/profile photo URL
  managerBio?: string;     // Custom warm bio/quote for the manager
  congratulationsMsg?: string; // Custom congratulations message from Super Admin
  managerId?: string;      // Manager ID e.g. "MGR-007"
  branchPhoto?: string;    // Physical branch shop photo URL or base64 data
  branchPhotoUploaded?: boolean; // Whether the branch photo is successfully uploaded
  alternateMobile?: string;
  email?: string;
  fullAddress?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  googleMapUrl?: string;
  businessTiming?: string;
  weeklyHoliday?: string;
  servicesAvailable?: string[];
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  closedDates?: string[]; // Array of YYYY-MM-DD dates where this branch is closed
  aiHolidayLogs?: { date: string; action: 'closed' | 'opened'; reason: string; timestamp: string }[];
  branchPhotos?: string[]; // Array of up to 5 branch photos
  branchPhotosApproved?: boolean; // Whether the 5 photos were approved by CEO
  branchDescription?: string; // Branch description
  distanceFromHeadOffice?: string; // Distance from Head Office e.g. "0 km", "3 km", "7 km"
  geoCoords?: { lat: number; lng: number };
  profileConfirmed?: boolean;
}

export interface ServiceModule {
  id: string;
  name: string;
  icon?: string; // lucide icon name
  category: string;
  description: string;
  price?: number;
  isCustom?: boolean;
  requiredDocs?: string[];
  estimatedCost?: string;
  timeNeeded?: string;
  iconColor?: string;
  bengaliDesc?: string;
  disabled?: boolean;
  showPrice?: boolean; // Default true. If false, price is hidden and shows "আমাদের ব্রাঞ্চে ভিজিট করুন"
}

export interface Appointment {
  id: string;
  name: string;
  mobileNumber: string;
  address?: string;
  serviceType: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 AM - 10:30 AM"
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed' | 'Cancelled';
  tokenNumber?: string; // Token queue system e.g. "T-05"
  assignedStaffId?: string;
  createdAt: string;
  shopId: string;
  appointmentType?: 'inquiry' | 'direct_work';
  paymentStatus?: string;
  price?: number;
  centerId?: string;
  customerName?: string;
  shopName?: string;
  branchId?: string;
  branchName?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  frequency: 'daily' | 'weekly' | 'monthly';
  dueDate: string;
  assignedTo?: string; // staff ID or "all"
  status: 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled';
  shopId: string;
  createdAt: string;
  isReminder?: boolean;
  reminderTime?: string;
  blockAppointments?: boolean;
}

export interface Complaint {
  id: string;
  referenceId: string;
  customerMobile: string;
  customerName: string;
  category: string;
  description: string;
  priority: string;
  status: 'Pending' | 'Reviewed' | 'In Progress' | 'Action Taken' | 'Resolved' | 'Closed' | 'Rejected';
  step: number; // 1 to 7
  createdAt: string;
}

export interface CustomerCRM {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  password?: string;
  status?: 'active' | 'offline' | 'suspended' | 'deleted';
  address?: string;
  notes?: string;
  createdAt: string;
  totalSpending: number;
  shopId: string;
  customId?: string;
  avatar?: string;
  lastLogin?: string;
  dob?: string;
  gender?: string;
  profileCompletion?: number;
  city?: string;
  state?: string;
  pincode?: string;
  profession?: string;
  emergencyContact?: string;
  language?: string;
  location?: string;
  deviceName?: string;
  isPermanent?: boolean;
  linkedInvoices?: string[];
  discounts?: { id: string; date: string; amount: number; purpose: string }[];
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  gstRate: number; // e.g., 18 for 18%
  discount: number; // percentage or fixed amount
}

export interface PaymentHistoryItem {
  id: string;
  paymentNo: number;
  amount: number;
  remainingBalance: number;
  paymentDate: string;
  paymentTime: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank' | 'Other';
  notes?: string;
  updatedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'NetBanking' | 'Bank' | 'Other';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  shopId: string;
  appointmentId?: string;
  qrCodeUrl?: string;
  status?: string;
  amountPaid?: number;
  remainingBalance?: number;
  payments?: PaymentHistoryItem[];
  lastPaymentDate?: string;
  paymentDueDate?: string;
  promiseNote?: string;
  branchName?: string;
  isSyncedToSheets?: boolean;
  sheetSyncedAt?: string;
  notes?: string;
  generatedBy?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Paper' | 'PVC Card' | 'Printer Ink' | 'Lamination Sheet' | 'Office Supply' | 'Other';
  stock: number;
  unit: string; // e.g., "Sheets", "Units", "Cartridges", "Rolls"
  minStockAlert: number;
  lastUpdated: string;
  shopId: string;
}

export interface DocumentVaultItem {
  id: string;
  name: string;
  category: 'Aadhaar' | 'PAN' | 'Passport' | 'Photo' | 'PDF' | 'Certificate' | 'Other';
  customerMobile?: string;
  customerName?: string;
  fileSize?: string;
  fileType: string;
  url: string; // object URL or base64 or placeholder
  uploadedAt: string;
  shopId: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'Manager' | 'Operator' | 'Helper';
  designation?: string;  // e.g. "CEO & Founder", "Head Manager", "Senior CSC Operator"
  status: 'Active' | 'Inactive';
  salary: number;
  permissions: string[]; // list of modules they can access
  attendance: { [date: string]: 'Present' | 'Absent' | 'Half-Day' | 'Leave' };
  shopId: string;
  branchCode?: string;   // e.g. "ROD-HQ", "ROD001"
  address?: string;      // Full Address
  photoUrl?: string;     // staff avatar/photo URL
  password?: string;     // password created by manager
  customId?: string;     // custom ID like "STF-101"
  issueDate?: string;    // e.g. "2026-08-01"
  validTill?: string;    // e.g. "2030-12-31"
}

export interface SessionLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  branchName?: string;
  action: 'Login' | 'Logout';
  timestamp: string;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  category: string; // e.g., "Form Fillup", "Rent", "Ink Refill", "Salary", "UPI Transaction"
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  paymentMethod: string;
  shopId: string;
}

export interface NotificationLog {
  id: string;
  recipientName: string;
  recipientMobile: string;
  type: 'WhatsApp' | 'Email' | 'SMS' | 'Push';
  message: string;
  status: 'Sent' | 'Delivered' | 'Failed' | 'Pending';
  sentAt: string;
  shopId: string;
}

export interface SecurityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  shopId?: string;
}

export interface CustomCredential {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'shop_owner' | 'staff' | 'customer';
  permissions: string[]; // list of tabs/views they can access, e.g. ["dashboard", "crm", "billing"]
  status: 'active' | 'suspended' | 'deactivated';
  statusReason?: string;
  createdAt: string;
}

export interface CompletedPriorityTask {
  id: string;
  appointmentId: string;
  customerName: string;
  customerMobile: string;
  serviceType: string;
  completionDate: string;
  notes: string;
  referenceId: string;
  screenshotUrl: string; // base64 or placeholder image
  paymentAmount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface AIKnowledgeItem {
  id: string;
  text: string;
  analysis?: string;
  tags?: string[];
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  status: 'active' | 'inactive';
  createdAt: string;
  noticeNumber?: string;
  noticeType?: string;
  rate?: string;
  deliveryTime?: string;
  tagline?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  message: string;
  createdAt: string;
  reply?: string;
  replyAt?: string;
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderMobile?: string;
  senderRole: string; // 'ceo' | 'branch_manager' | 'citizen' | 'staff'
  senderPhoto?: string;
  message: string;
  replyTo?: { id: string; senderName: string; message: string };
  reactions?: { [emoji: string]: string[] };
  createdAt: string;
}

export interface GroupSettings {
  onlyAdminsCanPost: boolean;
  isGroupMuted: boolean;
}

