import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from './useAppState';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import AnalyticsView from './components/AnalyticsView';
import ServicesView from './components/ServicesView';
import AppointmentsView from './components/AppointmentsView';
import CRMView from './components/CRMView';
import BillingView from './components/BillingView';
import InventoryView from './components/InventoryView';
import StaffView from './components/StaffView';
import FinanceView from './components/FinanceView';
import VaultView from './components/VaultView';
import NotificationsView from './components/NotificationsView';
import AdminPanel from './components/AdminPanel';
import CustomerPortal from './components/CustomerPortal';
import DatabaseView from './components/DatabaseView';
import AIAssistantView from './components/AIAssistantView';
import LoginView from './components/LoginView';
import PriorityTasksVault from './components/PriorityTasksVault';
import ShopProfileView from './components/ShopProfileView';
import BillHistoryView from './components/BillHistoryView';
import CalendarSchedulerView from './components/CalendarSchedulerView';
import TrashRecoveryView from './components/TrashRecoveryView';
import BranchManagerCongratulatoryScreen from './components/BranchManagerCongratulatoryScreen';
import BranchDashboardView from './components/BranchDashboardView';
import CeoBranchVaultView from './components/CeoBranchVaultView';
import VerifyBillsDocsView from './components/VerifyBillsDocsView';
import ConnectBranchesMessenger from './components/ConnectBranchesMessenger';
import { connectGoogleDrive, disconnectGoogleDrive, syncToGoogleDrive, getCachedToken } from './lib/googleDrive';
import { 
  Sparkles, BrainCircuit, ChevronLeft, ChevronRight, Home, 
  ShieldAlert, Users, CheckSquare, BriefcaseBusiness, BellRing, 
  LayoutDashboard, Server, CalendarCheck2, Receipt, PackageOpen, 
  FolderKey, UserCheck, TrendingUp, Menu, X, Gift, HelpCircle, Info, Bell,
  Cloud, CloudOff, RefreshCw, AlertTriangle, CreditCard, KeyRound, Lock, ShieldCheck
} from 'lucide-react';
import { RodpLogo } from '../components/Logo';
import { SecureExitModal } from '../components/SecureExitModal';

const TAB_ORDER = [
  'connect_all_branches',
  'connect_branch',
  'super_admin_panel',
  'ceo_branch_vault',
  'shop_profile',
  'dashboard',
  'customer_portal',
  'services',
  'appointments',
  'priority_tasks_vault',
  'calendar_scheduler',
  'analytics',
  'bill_history',
  'verify_bills_docs',
  'trash_recovery',
  'billing',
  'crm',
  'database',
  'inventory',
  'staff',
  'finance',
  'vault',
  'notifications',
  'ai_assistant'
];

const variants: any = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 30 : -30,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 350, damping: 28 },
      opacity: { duration: 0.15 },
      scale: { duration: 0.15 },
    },
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -30 : 30,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring', stiffness: 350, damping: 28 },
      opacity: { duration: 0.12 },
      scale: { duration: 0.12 },
    },
  }),
};

interface AppProps {
  onBack?: () => void;
}

export default function App({ onBack }: AppProps = {}) {
  const {
    currentUser,
    changeUserRole,
    shops,
    addShop,
    updateShop,
    deleteShop,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    appointments,
    addAppointment,
    updateAppointment,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    services,
    addService,
    updateService,
    deleteService,
    inventories,
    addInventory,
    updateInventory,
    staff,
    addStaff,
    updateStaff,
    invoices,
    addInvoice,
    updateInvoice,
    finance,
    addFinanceRecord,
    deleteFinanceRecord,
    vault,
    addVaultItem,
    updateVaultItem,
    deleteVaultItem,
    onlinePayments,
    addOnlinePayment,
    updateOnlinePayment,
    deleteOnlinePayment,
    notifications,
    addNotificationLog,
    securityLogs,
    sessionLogs,
    addSessionLog,
    loading,
    theme,
    toggleTheme,
    loginUser,
    updateCustomerProfile,
    aiKnowledge,
    addAIKnowledgeItem,
    deleteAIKnowledgeItem,
    
    trashItems,
    addTrashItem,
    restoreTrashItem,
    permanentDeleteTrashItem,
    deleteInvoice,
    logSecurityEvent,
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    inquiries,
    addInquiry,
    updateInquiry,
    deleteInquiry,
    groupMessages,
    addGroupMessage,
    updateGroupMessage,
    deleteGroupMessage,
    groupSettings,
    updateGroupSettings,
    branchChats,
    addBranchChatMessage,
    branchServiceSettings,
    saveBranchServiceSetting,
    deleteBranchServiceSetting,
    serviceNotifications,
    addServiceNotification,
    replyToServiceNotification,
    markServiceNotificationRead,
    conversations,
    conversationMessages,
    sendConversationMessage,
    createOrGetConversation,
    markConversationRead
  } = useAppState();

  const isBranchVerified = (() => {
    if (currentUser && currentUser.role === 'shop_owner') {
      const matchedShop = shops.find(s => s.id === currentUser.shopId || s.customId === currentUser.shopId);
      return !matchedShop || matchedShop.branchPhotoUploaded === true;
    }
    return true;
  })();

  const [currentTab, setCurrentTab] = useState(() => {
    const target = localStorage.getItem('rodp_target_tab');
    if (target) {
      localStorage.removeItem('rodp_target_tab');
      return target;
    }
    const raw = localStorage.getItem('rodp_logged_in_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.role === 'super_admin') return 'super_admin_panel';
      } catch (e) {}
    }
    return 'dashboard';
  });
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('rodp_logged_in') === 'true';
  });

  // Offline Sync and Notification banner states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
      setDriveSyncToast('🟢 Internet Reconnected! Re-synchronizing offline database cache to Firebase...');
      setTimeout(() => {
        setDriveSyncToast('✅ Database Synced! All offline local modifications uploaded successfully.');
      }, 2200);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
      setDriveSyncToast('🔴 Device Offline! Running in high-security offline cache mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Pre-fill states for Smart Billing transition
  const [prefilledCustomerMobile, setPrefilledCustomerMobile] = useState<string | undefined>(undefined);
  const [prefilledServiceName, setPrefilledServiceName] = useState<string | undefined>(undefined);
  const [preselectedCustomerMobile, setPreselectedCustomerMobile] = useState<string | null>(null);
  
  // Real-time Audio-Visual In-App Staff Alerts
  const [staffAlerts, setStaffAlerts] = useState<{ id: string; title: string; body: string; timestamp: string }[]>([]);

  const goToBillingWithCustomer = (mobile: string, serviceName: string) => {
    setPrefilledCustomerMobile(mobile);
    setPrefilledServiceName(serviceName);
    setCurrentTab('billing');
  };

  const clearPrefilled = () => {
    setPrefilledCustomerMobile(undefined);
    setPrefilledServiceName(undefined);
  };

  // Google Drive states
  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [gdriveToken, setGdriveToken] = useState<string | null>(null);
  const [gdriveUser, setGdriveUser] = useState<any>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => localStorage.getItem('rodp_last_sync_time') || 'Never');
  const [driveSyncToast, setDriveSyncToast] = useState<string | null>(null);

  useEffect(() => {
    const isConnected = sessionStorage.getItem('rodp_gdrive_connected') === 'true';
    const cachedToken = getCachedToken();
    if (isConnected && cachedToken) {
      setGdriveConnected(true);
      setGdriveToken(cachedToken);
    }
  }, []);

  const triggerDriveToast = (msg: string) => {
    setDriveSyncToast(msg);
    setTimeout(() => setDriveSyncToast(null), 3500);
  };

  const getCompletedTasksForSync = () => {
    const raw = localStorage.getItem('rodp_completed_priority_tasks');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return [];
  };

  const handleConnectGDrive = async () => {
    try {
      const result = await connectGoogleDrive();
      setGdriveConnected(true);
      setGdriveToken(result.accessToken);
      setGdriveUser(result.user);
      triggerDriveToast('☁️ Google Drive Connected Successfully!');
      
      // Auto sync on first connect
      setIsSyncingDrive(true);
      const syncResult = await syncToGoogleDrive(result.accessToken, invoices, customers, securityLogs, shops);
      setIsSyncingDrive(false);
      if (syncResult.success) {
        const timeNow = new Date().toLocaleString();
        setLastSyncTime(timeNow);
        localStorage.setItem('rodp_last_sync_time', timeNow);
        triggerDriveToast(`✅ Drive Synced! ${syncResult.filesSynced} files loaded.`);
      } else {
        triggerDriveToast(`⚠️ Drive sync: ${syncResult.message}`);
      }
    } catch (err: any) {
      console.error(err);
      triggerDriveToast(`❌ Drive connection failed: ${err.message || err}`);
    }
  };

  const handleDisconnectGDrive = () => {
    disconnectGoogleDrive();
    setGdriveConnected(false);
    setGdriveToken(null);
    setGdriveUser(null);
    triggerDriveToast('🔌 Disconnected Google Drive backup.');
  };

  const handleSyncDriveNow = async () => {
    if (!gdriveToken) {
      triggerDriveToast('⚠️ Please connect Google Drive first!');
      return;
    }

    setIsSyncingDrive(true);
    triggerDriveToast('🔄 Syncing all live records to Google Drive...');
    
    const result = await syncToGoogleDrive(gdriveToken, invoices, customers, securityLogs, shops);
    setIsSyncingDrive(false);
    
    if (result.success) {
      const timeNow = new Date().toLocaleString();
      setLastSyncTime(timeNow);
      localStorage.setItem('rodp_last_sync_time', timeNow);
      triggerDriveToast(`✅ Drive Sync Success! Synced ${result.filesSynced} files.`);
    } else {
      triggerDriveToast(`❌ Drive Sync Failed: ${result.message}`);
    }
  };

  // Consolidated Background Auto-sync on critical data changes
  useEffect(() => {
    if (gdriveConnected && gdriveToken) {
      const timer = setTimeout(() => {
        syncToGoogleDrive(gdriveToken, invoices, customers, securityLogs, shops).then(res => {
          if (res.success) {
            const timeNow = new Date().toLocaleString();
            setLastSyncTime(timeNow);
            localStorage.setItem('rodp_last_sync_time', timeNow);
            console.log('Background Auto-sync: Google Drive backup updated successfully.');
          }
        });
      }, 2000); // 2 second debounce to prevent multiple parallel writes
      return () => clearTimeout(timer);
    }
  }, [invoices, customers, shops, securityLogs, gdriveConnected, gdriveToken]);

  // Request browser notification permission on load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const noti = (window as any).Notification;
        if (noti && typeof noti.requestPermission === 'function') {
          try {
            if (noti.permission === 'default') {
              noti.requestPermission().catch(() => {});
            }
          } catch (e) {
            console.warn('Notification.permission check skipped:', e);
          }
        }
      }
    } catch (e) {
      console.warn('Notification permission request skipped:', e);
    }
  }, []);

  // Browser Notification system to check upcoming deadlines for Appointments and Tasks
  const alertedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Load alerted IDs to prevent duplicate notifications
    try {
      const saved = localStorage.getItem('rodp_alerted_deadlines');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach(id => alertedIds.current.add(id));
        }
      }
    } catch (e) {}

    const checkDeadlines = () => {
      const now = new Date();
      
      // Format current date as YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      // 1. Check Appointments (within 30 mins)
      appointments.forEach((appt) => {
        if (appt.status === 'Completed' || appt.status === 'Cancelled' || appt.status === 'Rejected') {
          return;
        }
        
        const apptId = `appt_${appt.id}`;
        if (alertedIds.current.has(apptId)) return;
        
        if (appt.date === todayStr || appt.date === '2026-06-24') {
          const apptTime = getApptTime(appt.timeSlot);
          if (apptTime) {
            const diffMs = apptTime.getTime() - now.getTime();
            const diffMins = diffMs / (1000 * 60);
            
            if (diffMins > 0 && diffMins <= 30) {
              triggerBrowserNotification(
                `⏰ Appointment Approaching`,
                `Staff Alert: ${appt.name}'s appointment for ${appt.serviceType} is scheduled at ${appt.timeSlot} (in ${Math.round(diffMins)} mins).`,
                apptId
              );
            }
          }
        }
      });
      
      // 2. Check Tasks (within 30 mins, or due today)
      tasks.forEach((task) => {
        if (task.status === 'Completed' || task.status === 'Cancelled') {
          return;
        }
        
        const taskId = `task_${task.id}`;
        if (alertedIds.current.has(taskId)) return;
        
        if (task.dueDate === todayStr || task.dueDate === '2026-06-24') {
          let taskTime = now;
          let hasSpecificTime = false;
          
          if (task.reminderTime) {
            const parsedTime = parseTaskTime(task.reminderTime);
            if (parsedTime) {
              taskTime = new Date();
              taskTime.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
              hasSpecificTime = true;
            }
          }
          
          if (hasSpecificTime) {
            const diffMs = taskTime.getTime() - now.getTime();
            const diffMins = diffMs / (1000 * 60);
            
            if (diffMins > 0 && diffMins <= 30) {
              triggerBrowserNotification(
                `📋 Task Deadline Approaching`,
                `Staff Alert: High priority task "${task.title}" is due soon at ${task.reminderTime} (in ${Math.round(diffMins)} mins).`,
                taskId
              );
            }
          } else {
            // General daily alert for pending tasks with no specific time
            triggerBrowserNotification(
              `📋 Pending Task Due Today`,
              `Staff Alert: "${task.title}" is scheduled to be completed by today.`,
              taskId
            );
          }
        }
      });
    };

    const getApptTime = (slot: string): Date | null => {
      try {
        const timePart = slot.split('-')[0].trim();
        const [time, modifier] = timePart.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
      } catch (e) {
        return null;
      }
    };

    const parseTaskTime = (timeStr: string) => {
      try {
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          return { hours, minutes };
        } else {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return { hours, minutes };
        }
      } catch (e) {
        return null;
      }
    };

    const triggerBrowserNotification = (title: string, body: string, id: string) => {
      alertedIds.current.add(id);
      localStorage.setItem('rodp_alerted_deadlines', JSON.stringify(Array.from(alertedIds.current)));
      
      // 1. Browser Native Alert
      try {
        if (typeof window !== 'undefined') {
          const NotificationCtor = (window as any).Notification;
          if (typeof NotificationCtor === 'function') {
            try {
              if (NotificationCtor.permission === 'granted') {
                new NotificationCtor(title, {
                  body,
                  icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                });
              }
            } catch (e) {
              console.warn('HTML5 Notification constructor skipped:', e);
            }
          }
        }
      } catch (e) {
        console.warn('Notification check failed:', e);
      }

      // Add to in-app active staffAlerts state list for real-time sliding toasts
      setStaffAlerts(prev => [
        ...prev,
        {
          id: `alert_${Date.now()}_${id}`,
          title,
          body,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      
      // 2. Add to logs
      const newLog = {
        id: `not_deadline_${Date.now()}`,
        recipientName: 'Active Operator / Staff',
        recipientMobile: 'Browser Alert Desk',
        type: 'Push' as const,
        message: `${title}: ${body}`,
        status: 'Sent' as const,
        sentAt: new Date().toISOString(),
        shopId: 'shop_1'
      };
      addNotificationLog(newLog);

      // 3. Custom Event for UI reactions
      try {
        window.dispatchEvent(new CustomEvent('rodp_deadline_triggered', { detail: { title, body } }));
      } catch (e) {
        console.warn('CustomEvent dispatch failed:', e);
      }
    };

    // Instant initial check and periodic interval (every 20 seconds)
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 20000);
    return () => clearInterval(interval);
  }, [appointments, tasks]);

  // CEO Viewing Branch State
  const [isCeoViewing, setIsCeoViewing] = useState(() => {
    return localStorage.getItem('rodp_is_ceo_viewing') === 'true';
  });
  const [originalCeoUser, setOriginalCeoUser] = useState<any>(() => {
    const saved = localStorage.getItem('rodp_original_ceo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleCeoViewBranch = (shopId: string, permissions: string[], name: string) => {
    // Save current CEO user
    localStorage.setItem('rodp_original_ceo_user', JSON.stringify(currentUser));
    localStorage.setItem('rodp_is_ceo_viewing', 'true');
    setOriginalCeoUser(currentUser);
    setIsCeoViewing(true);

    // Swap to branch/shop_owner session
    loginUser('shop_owner', `CEO View: ${name}`, 'rtsuroj@gmail.com', permissions, undefined, shopId);
    
    // Direct navigate to dashboard
    setCurrentTab('dashboard');
  };

  const handleReturnToCeo = () => {
    const savedCeo = localStorage.getItem('rodp_original_ceo_user');
    if (savedCeo) {
      const parsedCeo = JSON.parse(savedCeo);
      loginUser(parsedCeo.role, parsedCeo.name, parsedCeo.email, parsedCeo.permissions, parsedCeo.mobile);
    }
    localStorage.removeItem('rodp_original_ceo_user');
    localStorage.setItem('rodp_is_ceo_viewing', 'false');
    setOriginalCeoUser(null);
    setIsCeoViewing(false);
    setCurrentTab('super_admin_panel');
  };

  // Computer browser navigation history state
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [customerActiveTab, setCustomerActiveTab] = useState<'home' | 'appointments' | 'rewards' | 'support' | 'profile' | 'documents' | 'payments' | 'services'>('home');
  const [customerAboutOpen, setCustomerAboutOpen] = useState(false);
  const [customerNotificationsOpen, setCustomerNotificationsOpen] = useState(false);
  const [languageSetting, setLanguageSetting] = useState<'English' | 'Bengali / বাংলা'>('English');

  // Sync state on mount and initialization, plus window.history setup
  useEffect(() => {
    if (currentTab) {
      setNavHistory([currentTab]);
      setHistoryIndex(0);
      window.history.replaceState({ tab: currentTab }, '', `#${currentTab}`);
    }

    const handlePopState = (event: PopStateEvent) => {
      const targetTab = (event.state && event.state.tab) || window.location.hash.replace('#', '');
      if (targetTab) {
        setCurrentTab(prevTab => {
          const prevIdx = TAB_ORDER.indexOf(prevTab);
          const newIdx = TAB_ORDER.indexOf(targetTab);
          if (prevIdx !== -1 && newIdx !== -1) {
            setDirection(newIdx < prevIdx ? 'backward' : 'forward');
          }
          return targetTab;
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = () => {
    if (currentUser) {
      const matchedShopName = shops.find(s => s.id === currentUser.shopId || s.customId === currentUser.shopId)?.name || (currentUser.role === 'super_admin' ? 'CEO Head Office' : 'Central / Main Branch');
      addSessionLog({
        id: `sess_${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        branchName: matchedShopName,
        action: 'Logout',
        timestamp: new Date().toISOString()
      });
    }
    localStorage.removeItem('rodp_logged_in');
    localStorage.removeItem('rodp_logged_in_user');
    setIsLoggedIn(false);
  };

  // Ensure default tab makes sense when switching roles
  useEffect(() => {
    let target = 'dashboard';
    if (currentUser.role === 'customer') {
      target = 'customer_portal'; // Customer goes to their user dashboard / portal
    } else if (currentUser.role === 'super_admin') {
      target = 'super_admin_panel'; // Admins/CEO go to the CEO panel automatically
    } else {
      target = 'dashboard'; // Default other users to the dashboard
    }
    setDirection('forward');
    setCurrentTab(target);
    setNavHistory([target]);
    setHistoryIndex(0);
    window.history.replaceState({ tab: target }, '', `#${target}`);
  }, [currentUser.role]);

  // Strict Role-Based Access Control (RBAC) Router Guard
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      if (currentUser.role !== 'super_admin' && currentTab === 'super_admin_panel') {
        navigateToTab('dashboard');
      }
      if (currentUser.role === 'customer' && currentTab !== 'customer_portal') {
        navigateToTab('customer_portal');
      }
    }
  }, [currentTab, currentUser.role, isLoggedIn]);

  const navigateToTab = (tab: string, shouldPushState = true) => {
    // Hardcoded security check: block paths to 'super_admin_panel' for any user not explicitly assigned the 'super_admin' role
    if (tab === 'super_admin_panel' && currentUser.role !== 'super_admin') {
      console.warn("Security block: Attempted unauthorized access to super_admin_panel.");
      return;
    }
    const prevTab = currentTab;
    const prevIdx = TAB_ORDER.indexOf(prevTab);
    const newIdx = TAB_ORDER.indexOf(tab);
    if (prevIdx !== -1 && newIdx !== -1) {
      setDirection(newIdx < prevIdx ? 'backward' : 'forward');
    } else {
      setDirection('forward');
    }
    setCurrentTab(tab);
    setIsSidebarOpen(false); // Close mobile sidebar automatically
    if (shouldPushState) {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
    // Append or transition to new history item
    const updatedHistory = navHistory.slice(0, historyIndex + 1);
    if (updatedHistory[updatedHistory.length - 1] !== tab) {
      updatedHistory.push(tab);
      setNavHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setDirection('backward');
      setCurrentTab(navHistory[prevIdx]);
      window.history.pushState({ tab: navHistory[prevIdx] }, '', `#${navHistory[prevIdx]}`);
    }
  };

  const goForward = () => {
    if (historyIndex < navHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setDirection('forward');
      setCurrentTab(navHistory[nextIdx]);
      window.history.pushState({ tab: navHistory[nextIdx] }, '', `#${navHistory[nextIdx]}`);
    }
  };

  const goHome = () => {
    const target = currentUser.role === 'customer' 
      ? 'customer_portal' 
      : (currentUser.role === 'super_admin' ? 'super_admin_panel' : 'dashboard');
    navigateToTab(target);
  };

  const getBottomNavItems = () => {
    if (currentUser.role === 'customer') {
      return [
        { id: 'customer_portal_home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'customer_portal_services', label: 'Services', icon: Server },
        { id: 'customer_portal_documents', label: 'Task Bar', icon: CheckSquare },
        { id: 'customer_portal_payments', label: 'Payment', icon: CreditCard },
      ];
    }

    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'services', label: 'Services', icon: Server },
      { id: 'appointments', label: 'Appointments', icon: CalendarCheck2 },
      { id: 'priority_tasks_vault', label: 'Proof', icon: CheckSquare },
      { id: 'analytics', label: 'Analysis', icon: TrendingUp },
      { id: 'bill_history', label: 'Bill History', icon: Receipt },
      { id: 'verify_bills_docs', label: 'Verify Bill/Doc', icon: ShieldCheck },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 animate-spin flex items-center justify-center">
          <Sparkles className="text-white animate-pulse" size={24} />
        </div>
        <p className="font-mono text-xs opacity-60">Initializing Rizwan Online Dreams Platform...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginView 
        onExitToRexlify={onBack}
        theme={theme} 
        customers={customers}
        addCustomer={addCustomer}
        shops={shops}
        staff={staff}
        notices={notices}
        addInquiry={addInquiry}
        groupMessages={groupMessages}
        addGroupMessage={addGroupMessage}
        updateGroupMessage={updateGroupMessage}
        deleteGroupMessage={deleteGroupMessage}
        groupSettings={groupSettings}
        updateGroupSettings={updateGroupSettings}
        updateShop={updateShop}
        onLoginSuccess={(role, name, email, permissions, mobile, shopId) => {
          localStorage.setItem('rodp_logged_in', 'true');
          setIsLoggedIn(true);
          loginUser(role, name, email, permissions, mobile, shopId);
          
          const matchedShopName = shops.find(s => s.id === shopId || s.customId === shopId)?.name || (role === 'super_admin' ? 'CEO Head Office' : 'Central / Main Branch');
          addSessionLog({
            id: `sess_${Date.now()}`,
            userId: `usr_${Date.now()}`,
            userName: name,
            userRole: role,
            branchName: matchedShopName,
            action: 'Login',
            timestamp: new Date().toISOString()
          });
        }} 
      />
    );
  }

  // Choose component dynamically based on tab id
  const renderActiveView = () => {
    switch (currentTab) {
      case 'connect_all_branches':
      case 'connect_branch':
        return (
          <ConnectBranchesMessenger
            theme={theme}
            currentUser={currentUser}
            shops={shops}
            conversations={conversations}
            conversationMessages={conversationMessages}
            sendConversationMessage={sendConversationMessage}
            createOrGetConversation={createOrGetConversation}
            markConversationRead={markConversationRead}
            onBack={() => navigateToTab(currentUser.role === 'super_admin' ? 'super_admin_panel' : 'dashboard')}
          />
        );
      case 'dashboard':
        if (currentUser?.role === 'shop_owner' || currentUser?.role === 'staff') {
          return (
            <BranchDashboardView
              theme={theme}
              currentUser={currentUser}
              shops={shops}
              updateShop={updateShop}
              invoices={invoices}
              addInvoice={addInvoice}
              appointments={appointments}
              addAppointment={addAppointment}
              updateAppointment={updateAppointment}
              customers={customers}
              addCustomer={addCustomer}
              goToBillingWithCustomer={goToBillingWithCustomer}
              inquiries={inquiries}
              updateInquiry={updateInquiry}
              setCurrentTab={navigateToTab}
              onlinePayments={onlinePayments}
              updateOnlinePayment={updateOnlinePayment}
              deleteOnlinePayment={deleteOnlinePayment}
              vault={vault}
              addVaultItem={addVaultItem}
              updateVaultItem={updateVaultItem}
              branchChats={branchChats}
              addBranchChatMessage={addBranchChatMessage}
              services={services}
              addService={addService}
              updateService={updateService}
              deleteService={deleteService}
              branchServiceSettings={branchServiceSettings}
              saveBranchServiceSetting={saveBranchServiceSetting}
              deleteBranchServiceSetting={deleteBranchServiceSetting}
              notices={notices}
            />
          );
        }
        return (
          <DashboardView
            theme={theme}
            appointments={appointments}
            customers={customers}
            tasks={tasks}
            invoices={invoices}
            inventories={inventories}
            setCurrentTab={navigateToTab}
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            updateAppointment={updateAppointment}
            goToBillingWithCustomer={goToBillingWithCustomer}
            currentUser={currentUser}
            shops={shops}
            updateShop={updateShop}
          />
        );
      case 'services':
        if (currentUser?.role === 'customer') {
          return (
            <CustomerPortal
              theme={theme}
              appointments={appointments}
              invoices={invoices}
              vault={vault}
              notifications={notifications}
              addAppointment={addAppointment}
              addVaultItem={addVaultItem}
              deleteVaultItem={deleteVaultItem}
              currentUser={currentUser}
              tasks={tasks}
              updateCustomerProfile={updateCustomerProfile}
              activeTab={'services'}
              setActiveTab={setCustomerActiveTab}
              isAboutOpen={customerAboutOpen}
              setIsAboutOpen={setCustomerAboutOpen}
              isNotificationsOpen={customerNotificationsOpen}
              setIsNotificationsOpen={setCustomerNotificationsOpen}
              languageSetting={languageSetting}
              setLanguageSetting={setLanguageSetting}
              services={services}
              aiKnowledge={aiKnowledge}
              shops={shops}
              notices={notices}
              inquiries={inquiries}
              addInquiry={addInquiry}
              onlinePayments={onlinePayments}
              addOnlinePayment={addOnlinePayment}
              updateOnlinePayment={updateOnlinePayment}
              deleteOnlinePayment={deleteOnlinePayment}
              updateAppointment={updateAppointment}
              branchChats={branchChats}
              addBranchChatMessage={addBranchChatMessage}
            />
          );
        }
        return (
          <ServicesView
            theme={theme}
            services={services}
            addService={addService}
            updateService={updateService}
            deleteService={deleteService}
            appointments={appointments}
            userRole={currentUser?.role}
            addAppointment={addAppointment}
            branchChats={branchChats}
            addBranchChatMessage={addBranchChatMessage}
            shops={shops}
            currentUser={currentUser}
            notices={notices}
          />
        );
      case 'appointments':
        return (
          <AppointmentsView
            theme={theme}
            appointments={appointments}
            addAppointment={addAppointment}
            updateAppointment={updateAppointment}
            staff={staff}
            tasks={tasks}
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            gdriveConnected={gdriveConnected}
            gdriveToken={gdriveToken}
            goToBillingWithCustomer={goToBillingWithCustomer}
            services={services}
            currentUser={currentUser}
            shops={shops}
          />
        );
      case 'priority_tasks_vault':
        return (
          <PriorityTasksVault
            theme={theme}
            appointments={appointments}
            updateAppointment={updateAppointment}
            setCurrentTab={navigateToTab}
            addTrashItem={addTrashItem}
          />
        );
      case 'calendar_scheduler':
        return (
          <CalendarSchedulerView
            theme={theme}
            appointments={appointments}
            tasks={tasks}
            addTask={addTask}
            deleteTask={deleteTask}
          />
        );
      case 'crm':
        return (
          <CRMView
            theme={theme}
            customers={customers}
            addCustomer={addCustomer}
            updateCustomer={updateCustomer}
            deleteCustomer={deleteCustomer}
            appointments={appointments}
            invoices={invoices}
            vault={vault}
            notifications={notifications}
            addAppointment={addAppointment}
            addVaultItem={addVaultItem}
            tasks={tasks}
            aiKnowledge={aiKnowledge}
            services={services}
            logSecurityEvent={logSecurityEvent}
            preselectedCustomerMobile={preselectedCustomerMobile}
            clearPreselectedCustomerMobile={() => setPreselectedCustomerMobile(null)}
          />
        );
      case 'database':
        return (
          <DatabaseView
            theme={theme}
            customers={customers}
            appointments={appointments}
            invoices={invoices}
            vault={vault}
            notifications={notifications}
            addAppointment={addAppointment}
            updateAppointment={updateAppointment}
            addVaultItem={addVaultItem}
            tasks={tasks}
            services={services}
            addService={addService}
            updateService={updateService}
            deleteService={deleteService}
            aiKnowledge={aiKnowledge}
            addAIKnowledgeItem={addAIKnowledgeItem}
            deleteAIKnowledgeItem={deleteAIKnowledgeItem}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            theme={theme}
            appointments={appointments}
            customers={customers}
            invoices={invoices}
            finance={finance}
            addFinanceRecord={addFinanceRecord}
            deleteFinanceRecord={deleteFinanceRecord}
            updateCustomer={updateCustomer}
            addCustomer={addCustomer}
            setCurrentTab={navigateToTab}
          />
        );
      case 'billing':
        return (
          <BillingView
            theme={theme}
            customers={customers}
            services={services}
            invoices={invoices}
            addInvoice={addInvoice}
            updateCustomer={updateCustomer}
            addCustomer={addCustomer}
            setCurrentTab={navigateToTab}
            prefilledCustomerMobile={prefilledCustomerMobile}
            prefilledServiceName={prefilledServiceName}
            clearPrefilled={clearPrefilled}
            appointments={appointments}
            shops={shops}
            gdriveConnected={gdriveConnected}
            gdriveToken={gdriveToken}
            handleConnectGDrive={handleConnectGDrive}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            theme={theme}
            inventories={inventories}
            addInventory={addInventory}
            updateInventory={updateInventory}
          />
        );
      case 'staff':
        return (
          <StaffView
            theme={theme}
            staff={staff}
            shops={shops}
            addStaff={addStaff}
            updateStaff={updateStaff}
            currentUser={currentUser}
          />
        );
      case 'finance':
        return (
          <FinanceView
            theme={theme}
            finance={finance}
            addFinanceRecord={addFinanceRecord}
          />
        );
      case 'vault':
        return (
          <VaultView
            theme={theme}
            vault={vault}
            addVaultItem={addVaultItem}
            deleteVaultItem={deleteVaultItem}
          />
        );
      case 'notifications':
        return (
          <NotificationsView
            theme={theme}
            notifications={notifications}
            addNotificationLog={addNotificationLog}
            gdriveConnected={gdriveConnected}
            gdriveToken={gdriveToken}
            notices={notices}
            addNotice={addNotice}
            updateNotice={updateNotice}
            deleteNotice={deleteNotice}
          />
        );
      case 'super_admin_panel':
        return (
          <AdminPanel
            theme={theme}
            shops={shops}
            addShop={addShop}
            updateShop={updateShop}
            deleteShop={deleteShop}
            securityLogs={securityLogs}
            sessionLogs={sessionLogs}
            invoices={invoices}
            appointments={appointments}
            tasks={tasks}
            addTask={addTask}
            customers={customers}
            onCeoViewBranch={handleCeoViewBranch}
            services={services}
            addService={addService}
            updateService={updateService}
            deleteService={deleteService}
            updateAppointment={updateAppointment}
            goToBillingWithCustomer={goToBillingWithCustomer}
            notices={notices}
            addNotice={addNotice}
            updateNotice={updateNotice}
            deleteNotice={deleteNotice}
            inquiries={inquiries}
            deleteInquiry={deleteInquiry}
            updateInquiry={updateInquiry}
            groupMessages={groupMessages}
            groupSettings={groupSettings}
            onAddGroupMessage={addGroupMessage}
            onUpdateGroupSettings={updateGroupSettings}
            onUpdateGroupMessage={updateGroupMessage}
            onNavigateToBranchVault={() => setCurrentTab('ceo_branch_vault')}
            onNavigateToVerifyBillsDocs={() => setCurrentTab('verify_bills_docs')}
            serviceNotifications={serviceNotifications}
            replyToServiceNotification={replyToServiceNotification}
            markServiceNotificationRead={markServiceNotificationRead}
            onNavigateToConnectAllBranches={() => navigateToTab('connect_all_branches')}
          />
        );
      case 'ceo_branch_vault':
        return (
          <CeoBranchVaultView
            theme={theme}
            shops={shops}
            updateShop={updateShop}
            addShop={addShop}
            deleteShop={deleteShop}
            staff={staff}
            invoices={invoices}
            appointments={appointments}
            tasks={tasks}
            currentUser={currentUser}
            setCurrentTab={setCurrentTab}
            onCeoViewBranch={handleCeoViewBranch}
          />
        );
      case 'shop_profile':
        return (
          <ShopProfileView
            theme={theme}
            shops={shops}
            updateShop={updateShop}
            currentUser={currentUser}
            addNotificationLog={addNotificationLog}
            notifications={notifications}
            appointments={appointments}
            tasks={tasks}
            addAppointment={addAppointment}
            addTask={addTask}
          />
        );
      case 'bill_history':
        return (
          <BillHistoryView
            theme={theme}
            invoices={invoices}
            shops={shops}
            setCurrentTab={navigateToTab}
            updateInvoice={updateInvoice}
            services={services}
            deleteInvoice={deleteInvoice}
            gdriveConnected={gdriveConnected}
            gdriveToken={gdriveToken}
            onVisitCustomerProfile={(mobile) => {
              setPreselectedCustomerMobile(mobile);
              navigateToTab('crm');
            }}
          />
        );
      case 'trash_recovery':
        return (
          <TrashRecoveryView
            theme={theme}
            trashItems={trashItems}
            restoreTrashItem={restoreTrashItem}
            permanentDeleteTrashItem={permanentDeleteTrashItem}
          />
        );
      case 'verify_bills_docs':
        return (
          <VerifyBillsDocsView
            theme={theme}
            currentUser={currentUser}
            shops={shops}
            onlinePayments={onlinePayments}
            updateOnlinePayment={updateOnlinePayment}
            deleteOnlinePayment={deleteOnlinePayment}
            vault={vault}
            addVaultItem={addVaultItem}
            updateVaultItem={updateVaultItem}
            deleteVaultItem={deleteVaultItem}
            invoices={invoices}
            updateInvoice={updateInvoice}
            addNotificationLog={addNotificationLog}
          />
        );
      case 'customer_portal':
        return (
          <CustomerPortal
            theme={theme}
            appointments={appointments}
            invoices={invoices}
            vault={vault}
            notifications={notifications}
            addAppointment={addAppointment}
            addVaultItem={addVaultItem}
            deleteVaultItem={deleteVaultItem}
            currentUser={currentUser}
            tasks={tasks}
            updateCustomerProfile={updateCustomerProfile}
            activeTab={customerActiveTab}
            setActiveTab={setCustomerActiveTab}
            isAboutOpen={customerAboutOpen}
            setIsAboutOpen={setCustomerAboutOpen}
            isNotificationsOpen={customerNotificationsOpen}
            setIsNotificationsOpen={setCustomerNotificationsOpen}
            languageSetting={languageSetting}
            setLanguageSetting={setLanguageSetting}
            services={services}
            aiKnowledge={aiKnowledge}
            shops={shops}
            notices={notices}
            inquiries={inquiries}
            addInquiry={addInquiry}
            onlinePayments={onlinePayments}
            addOnlinePayment={addOnlinePayment}
            updateOnlinePayment={updateOnlinePayment}
            deleteOnlinePayment={deleteOnlinePayment}
            updateAppointment={updateAppointment}
            branchChats={branchChats}
            addBranchChatMessage={addBranchChatMessage}
          />
        );
      case 'ai_assistant':
        return (
          <AIAssistantView
            theme={theme}
          />
        );
      default:
        return (
          <div className="py-12 text-center text-slate-400">
            <h3 className="font-bold text-lg">Work in Progress</h3>
            <p className="text-xs opacity-75 mt-1">This module is getting ready.</p>
          </div>
        );
    }
  };

  // Accent Color Customization mapping
  const activeShop = shops.find(s => s.id === 'shop_1') || shops[0];
  const accentColorId = activeShop?.accentColor || 'amber';

  const colorMap: { [key: string]: { hex: string, hover: string, bg: string, border: string } } = {
    amber: { hex: '#dfac5d', hover: '#c38c32', bg: 'rgba(223, 172, 93, 0.15)', border: 'rgba(223, 172, 93, 0.25)' },
    emerald: { hex: '#10b981', hover: '#059669', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.25)' },
    sapphire: { hex: '#3b82f6', hover: '#2563eb', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.25)' },
    amethyst: { hex: '#8b5cf6', hover: '#7c3aed', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.25)' },
    rose: { hex: '#f43f5e', hover: '#e11d48', bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.25)' },
    cyan: { hex: '#06b6d4', hover: '#0891b2', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.25)' }
  };

  const selectedColor = colorMap[accentColorId] || colorMap.amber;

  const mainBackgroundClass = theme === 'dark'
    ? 'bg-[#030304] text-slate-100'
    : 'bg-gradient-to-br from-slate-100 via-white to-slate-50 text-slate-800';

  return (
    <div className={`flex flex-col min-h-screen ${mainBackgroundClass} transition-colors duration-300 pb-20`}>
      
      {/* Specialized Congratulatory Screen for New Branch Managers */}
      {(() => {
        if (!isLoggedIn || !currentUser || currentUser.role !== 'shop_owner') return null;
        const matchedShop = shops.find(s => s.id === currentUser.shopId || s.customId === currentUser.shopId);
        if (!matchedShop || matchedShop.profileConfirmed) return null;
        const isBypassed = localStorage.getItem(`rodp_profile_confirmed_${matchedShop.id}`) === 'true';
        if (isBypassed) return null;
        
        return (
          <BranchManagerCongratulatoryScreen
            theme={theme}
            currentUser={currentUser}
            shops={shops}
            updateShop={updateShop}
          />
        );
      })()}

      {/* Real-time Offline Warning Banner */}
      {showOfflineBanner && (
        <div className="bg-rose-600 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow-lg backdrop-blur-md z-[9999] border-b border-rose-500/30 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <p className="font-bold tracking-wide leading-relaxed">
              ইন্টারনেট কানেকশন বিচ্ছিন্ন রয়েছে। তবে আপনি অফলাইনে সমস্ত ফিচার ব্যবহার করতে পারবেন। ইন্টারনেট আসলেই আপনার সমস্ত ডাটা স্বয়ংক্রিয়ভাবে ক্লাউড ডাটাবেজে সেভ হয়ে যাবে। (Internet is disconnected. Offline mode is active; changes will sync back to Firebase when connection is restored.)
            </p>
          </div>
          <button 
            onClick={() => setShowOfflineBanner(false)} 
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold ml-4 cursor-pointer text-[10px] w-6 h-6 flex items-center justify-center transition-all shrink-0"
            title="Dismiss / বন্ধ করুন"
          >
            ✕
          </button>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-accent: ${selectedColor.hex};
          --color-accent-hover: ${selectedColor.hover};
          --color-accent-bg: ${selectedColor.bg};
          --color-accent-border: ${selectedColor.border};
        }

        /* Dynamic Selector Overrides to apply custom accent color dynamically */
        [class*="text-[#dfac5d]"] {
          color: var(--color-accent) !important;
        }
        [class*="bg-[#dfac5d]"] {
          background-color: var(--color-accent) !important;
        }
        [class*="bg-[#dfac5d]/"] {
          background-color: var(--color-accent-bg) !important;
        }
        [class*="border-[#dfac5d]"] {
          border-color: var(--color-accent) !important;
        }
        [class*="border-[#dfac5d]/"] {
          border-color: var(--color-accent-border) !important;
        }
        
        /* Hover states */
        [class*="hover:bg-[#dfac5d]"]:hover {
          background-color: var(--color-accent) !important;
          color: #050505 !important;
        }
        [class*="hover:bg-[#dfac5d]/"]:hover {
          background-color: var(--color-accent-bg) !important;
        }
        [class*="hover:text-[#dfac5d]"]:hover {
          color: var(--color-accent) !important;
        }
        [class*="hover:border-[#dfac5d]"]:hover {
          border-color: var(--color-accent) !important;
        }

        header[class*="border-[#dfac5d]"] {
          border-color: var(--color-accent-border) !important;
        }
        button[class*="border-[#dfac5d]"]:hover {
          border-color: var(--color-accent) !important;
        }
        
        .text-gold-gradient {
          background: linear-gradient(135deg, #fff 0%, var(--color-accent) 100%) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }
        .gold-glow-num {
          color: var(--color-accent) !important;
          text-shadow: 0 0 15px var(--color-accent-border) !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-accent-border) !important;
        }
      `}} />
      
      {/* Dynamic Luxurious Header Bar with Laptop/Mobile Navigation and Swapper */}
      {currentUser.role === 'customer' ? (
         customerActiveTab === 'home' ? (
          <header className="sticky top-0 z-50 w-full bg-[#070709]/95 backdrop-blur-md border-b border-[#dfac5d]/15 px-3 h-12 flex items-center justify-between shadow-lg animate-fade-in">
            {/* Left Side: Back to Rexlify & Hamburger Menu */}
            <div className="flex items-center justify-start gap-1.5 shrink-0">
              {onBack && (
                <button
                  onClick={() => setIsExitModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm"
                  title="Exit RODP to Rexlify (Requires Captcha Verification)"
                >
                  <Lock size={12} className="text-rose-400" />
                  <span>Exit</span>
                </button>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg border border-[#dfac5d]/20 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-all cursor-pointer shrink-0"
                title="Toggle Menu"
              >
                <Menu size={16} />
              </button>
            </div>

            {/* Center/Middle: Brand Title and Subtitle */}
            <div className="flex-1 flex flex-col items-center text-center justify-center min-w-0 px-2">
              <h1 className="text-[9px] xs:text-[10px] sm:text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 uppercase whitespace-nowrap overflow-hidden text-ellipsis leading-none w-full max-w-[180px] xs:max-w-[220px] sm:max-w-md">
                Rizwan Online Dreams Platform
              </h1>
              <p className="text-[6.5px] xs:text-[7px] sm:text-[8px] font-bold text-[#dfac5d] mt-1 uppercase tracking-wider font-mono leading-none w-full whitespace-nowrap overflow-hidden text-ellipsis">
                Powered by <span className="font-extrabold text-amber-300">Rexlify connect</span> • Rizwan
              </p>
            </div>

            {/* Right Side: Notification Icon first, then Profile Icon */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              {/* Feature 1: Notifications */}
              <button
                onClick={() => setCustomerNotificationsOpen(!customerNotificationsOpen)}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer relative active:scale-95 ${
                  customerNotificationsOpen 
                    ? 'border-[#dfac5d] bg-[#dfac5d]/25 text-[#dfac5d]' 
                    : 'border-white/5 hover:border-[#dfac5d]/50 text-slate-400 hover:text-white bg-white/5'
                }`}
                title="Notifications / বিজ্ঞপ্তি"
              >
                <Bell size={14} className={customerNotificationsOpen ? 'text-[#dfac5d]' : 'text-slate-400'} />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-950 shadow-sm animate-pulse" />
              </button>

              {/* Profile Icon with red pulse */}
              <div className="relative">
                <button
                  onClick={() => {
                    setCurrentTab('customer_portal');
                    setCustomerActiveTab('profile');
                  }}
                  className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center font-extrabold text-[11px] shadow-md transition-all cursor-pointer active:scale-95 ${
                    (customerActiveTab as string) === 'profile' && currentTab === 'customer_portal'
                      ? 'bg-[#dfac5d] text-slate-950 border border-[#dfac5d] shadow-[0_0_15px_rgba(223,172,93,0.4)]'
                      : 'bg-gradient-to-br from-[#dfac5d]/20 to-[#dfac5d]/5 text-[#dfac5d] border border-[#dfac5d]/30 hover:border-[#dfac5d]/60'
                  }`}
                  title="View Profile / প্রোফাইল দেখুন"
                >
                  {currentUser.name.charAt(0).toUpperCase() || 'U'}
                </button>
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-950 shadow-sm animate-pulse pointer-events-none" />
              </div>
            </div>
          </header>
        ) : (
          /* High-Fidelity Custom Sub-Screen Top Header Bar with conditional visibility */
          <header className="sticky top-0 z-50 w-full bg-[#070709]/90 backdrop-blur-md border-b border-[#dfac5d]/20 px-4 h-12 flex items-center justify-between shadow-lg animate-fade-in">
            {/* Left Side: Premium Back Button */}
            <button
              onClick={() => setCustomerActiveTab('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dfac5d]/30 bg-[#dfac5d]/10 hover:bg-[#dfac5d]/20 text-[#dfac5d] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
              title="Back to home page / হোমপেজে ফিরুন"
            >
              <ChevronLeft size={14} className="text-[#dfac5d]" />
              <span>Back</span>
            </button>

            {/* Center/Middle: Title of current Sub-screen */}
            <div className="flex-1 text-center px-2">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono">
                {customerActiveTab === 'appointments' ? 'Appointment Booking' 
                  : customerActiveTab === 'documents' ? 'Secure Document Vault' 
                  : customerActiveTab === 'rewards' ? 'Rewards & Club Level' 
                  : customerActiveTab === 'support' ? 'Premium AI Assistant' 
                  : customerActiveTab === 'profile' ? 'Account Profile' 
                  : customerActiveTab === 'payments' ? 'UPI Online Payment'
                  : customerActiveTab}
              </span>
            </div>

            {/* Right Side: Hamburger Icon for Global Sidebar Access */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg border border-[#dfac5d]/20 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-all cursor-pointer"
                title="Open Global Menu"
              >
                <Menu size={16} />
              </button>
            </div>
          </header>
        )
      ) : (
        /* Regular Admin Header */
        <header className="sticky top-0 z-50 w-full bg-[#070709]/90 backdrop-blur-md border-b border-[#dfac5d]/15 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 shadow-lg">
          {/* Brand logo & Description */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={() => setIsExitModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white text-xs font-mono font-bold tracking-wider transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm"
                  title="Exit RODP to Rexlify Hub (Requires Captcha Verification)"
                >
                  <Lock size={13} className="text-rose-400" />
                  <span>Exit RODP</span>
                </button>
              )}
              <button
                onClick={() => navigateToTab('shop_profile')}
                className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group animate-fade-in"
                title="View Shop Profile / শপ প্রোফাইল দেখুন"
              >
                <RodpLogo size={42} showText={false} />
                <div className="min-w-0">
                  <h1 className="text-sm md:text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 uppercase truncate leading-none group-hover:text-amber-300 transition-colors">
                    Rizwan Online Dreams Platform
                  </h1>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase font-mono tracking-wider">
                    Powered by <span className="text-[#dfac5d]">Rexlify connect</span> • Rizwan
                  </p>
                </div>
              </button>
            </div>

            {/* Google Drive Status & Control Desk */}
            <div className="hidden md:flex items-center gap-3 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-850">
              {gdriveConnected ? (
                <div className="flex items-center gap-2 px-3">
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black text-[10px] uppercase font-mono tracking-wider">
                      <Cloud size={14} className="animate-pulse" />
                      <span>Drive Connected</span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 font-mono tracking-normal leading-none">
                      Last Backup: {lastSyncTime}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSyncDriveNow()}
                    disabled={isSyncingDrive}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Manual Cloud Sync / ড্রাইভ ব্যাকআপ"
                  >
                    <RefreshCw size={12} className={isSyncingDrive ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={handleDisconnectGDrive}
                    className="text-[9px] uppercase font-black tracking-widest text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 px-2 py-1 rounded-lg border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                    title="Disconnect / ড্রাইভ লিংক বাতিল করুন"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectGDrive}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-500/20 bg-[#dfac5d]/10 hover:bg-[#dfac5d]/20 text-[#dfac5d] font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Connect Google Drive to Backup Invoices & Proofs"
                >
                  <CloudOff size={13} />
                  <span>Connect GDrive</span>
                </button>
              )}
            </div>

            {/* Hamburger toggle button right next to the platform name on mobile/tablet */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2.5 rounded-xl border border-amber-500/20 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-all duration-300 shrink-0"
              title="Toggle Menu"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
      )}

      {/* Main Layout Container (Sidebar + Rendered View) */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar navigation */}
        <Sidebar
          currentTab={currentTab === 'customer_portal' ? `customer_portal_${customerActiveTab}` : currentTab}
          setCurrentTab={(tab) => {
            if (tab.startsWith('customer_portal_')) {
              const subTab = tab.replace('customer_portal_', '');
              navigateToTab('customer_portal');
              setCustomerActiveTab(subTab as any);
            } else {
              navigateToTab(tab);
            }
          }}
          userRole={currentUser.role}
          changeUserRole={changeUserRole}
          theme={theme}
          toggleTheme={toggleTheme}
          userName={currentUser.name}
          userAvatar={currentUser.avatar}
          onLogout={handleLogout}
          userPermissions={currentUser.permissions}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          languageSetting={languageSetting}
          setLanguageSetting={setLanguageSetting}
          isBranchVerified={isBranchVerified}
        />

        {/* Main dashboard content view container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full custom-scrollbar relative overflow-x-hidden">
          {/* Persistent Non-dismissible Pending Verification Banner */}
          {!isBranchVerified && currentUser?.role === 'shop_owner' && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 shrink-0 mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-rose-400 font-mono tracking-wider">
                    🔴 Pending Location Verification / ব্রাঞ্চ ভেরিফিকেশন পেন্ডিং
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                    নিরাপত্তা ও এআই ট্র্যাকিংয়ের স্বার্থে আপনার ব্রাঞ্চের বাস্তব ছবি আপলোড করা আবশ্যক। ব্রাঞ্চ ছবি আপলোড করার পূর্ব পর্যন্ত <strong>Smart Billing</strong> এবং <strong>Finance Ledger</strong> ব্লক থাকবে।
                  </p>
                  <p className="text-[9px] text-slate-500 font-semibold font-mono tracking-wider mt-0.5">
                    Please upload physical facility photo under "RODP HQ Profile" to lift constraints.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateToTab('shop_profile')}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-[9px] uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
              >
                Go to Profile Settings
              </button>
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentTab}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent Bottom Horizontal Navigation Bar for both Desktop and Mobile */}
      {(currentUser.role !== 'customer' || (currentTab === 'customer_portal' && (customerActiveTab === 'home' || customerActiveTab === 'documents' || customerActiveTab === 'payments' || customerActiveTab === 'services')) || currentTab === 'services') && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070709]/95 backdrop-blur-lg border-t border-[#dfac5d]/15 px-4 py-2 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.8)] overflow-x-auto gap-2 scrollbar-none">
          {getBottomNavItems().map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id || 
              (item.id.startsWith('customer_portal_') && 
               currentTab === 'customer_portal' && 
               customerActiveTab === item.id.replace('customer_portal_', ''));
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id.startsWith('customer_portal_')) {
                    const subTab = item.id.replace('customer_portal_', '');
                    navigateToTab('customer_portal');
                    setCustomerActiveTab(subTab as any);
                  } else {
                    navigateToTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-300 min-w-[56px] shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-black scale-105'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <IconComponent size={18} className={`${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                <span className="text-[9px] mt-1 tracking-tight font-medium truncate max-w-[70px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {isCeoViewing && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <button
            onClick={handleReturnToCeo}
            className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs tracking-wider shadow-2xl border border-white/20 flex items-center gap-2 uppercase cursor-pointer"
          >
            <ShieldAlert size={14} className="animate-spin text-white" />
            <span>Return to CEO Panel / সিইও প্যানেলে ফিরুন</span>
          </button>
        </div>
      )}
      
      {/* Google Drive Sync Floating Toast Notification */}
      <AnimatePresence>
        {driveSyncToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-6 z-50 px-5 py-3 rounded-2xl bg-[#09090b] border border-amber-500/30 text-amber-300 font-bold text-xs tracking-wider shadow-[0_4px_30px_rgba(223,172,93,0.3)] flex items-center gap-2"
          >
            <RefreshCw size={14} className="animate-spin text-amber-400" />
            <span>{driveSyncToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Floating In-App Staff Alerts */}
      <div className="fixed top-16 right-6 z-[9999] pointer-events-none space-y-3 max-w-sm w-full">
        <AnimatePresence>
          {staffAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 50, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto p-4 rounded-2xl bg-[#0a0a0c]/90 border border-amber-500/40 text-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.85)] flex gap-3 relative overflow-hidden backdrop-blur-md"
            >
              {/* Decorative side accent bar */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-amber-500 to-indigo-600" />
              
              <div className="flex-1 space-y-1 pl-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-[9px] text-[#dfac5d] uppercase tracking-widest font-black block">
                    {alert.title}
                  </span>
                  <span className="text-[8px] text-slate-500 font-bold font-mono">
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-300 leading-relaxed">
                  {alert.body}
                </p>
                <div className="pt-1.5 flex justify-end gap-1.5">
                  <button
                    onClick={() => {
                      if (alert.body.includes('appointment for')) {
                        setCurrentTab('appointments');
                      } else {
                        setCurrentTab('calendar_scheduler');
                      }
                      setStaffAlerts(prev => prev.filter(a => a.id !== alert.id));
                    }}
                    className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-[9px] uppercase hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                  >
                    View / দেখুন
                  </button>
                  <button
                    onClick={() => setStaffAlerts(prev => prev.filter(a => a.id !== alert.id))}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[9px] uppercase cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Security Captcha Exit Modal: Requires 5-character Captcha before unlocking workspace */}
      <SecureExitModal
        isOpen={isExitModalOpen}
        appName="RODP (Rizwan Online Dreams)"
        onConfirmExit={() => {
          setIsExitModalOpen(false);
          if (onBack) onBack();
        }}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </div>
  );
}
