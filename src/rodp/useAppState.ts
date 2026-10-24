import { useState, useEffect } from 'react';
import { 
  User, Shop, ServiceModule, Appointment, Task, 
  CustomerCRM, Invoice, InventoryItem, DocumentVaultItem, 
  Staff, FinanceRecord, NotificationLog, SecurityLog, UserRole,
  AIKnowledgeItem, SessionLog, Notice, Inquiry, GroupMessage, GroupSettings, OnlinePayment,
  BranchChatMessage, BranchServiceSetting, ServiceChangeNotification, BranchConversation, ConversationMessage,
  ApplyFormWebsite, ApplyFormActivity
} from './types';
import { 
  DEFAULT_SERVICES, MOCK_SHOPS, MOCK_CUSTOMERS, 
  MOCK_APPOINTMENTS, MOCK_TASKS, MOCK_INVENTORIES, 
  MOCK_STAFF, MOCK_INVOICES, MOCK_FINANCE, 
  MOCK_DOCUMENTS, MOCK_NOTIFICATIONS, MOCK_SECURITY_LOGS,
  MOCK_NOTICES, MOCK_INQUIRIES, MOCK_ONLINE_PAYMENTS,
  DEFAULT_APPLY_FORM_WEBSITES, MOCK_APPLY_FORM_ACTIVITIES
} from './mockData';
import { db, auth, isFirebaseAvailable } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, getDocs, setDoc, doc, updateDoc, 
  onSnapshot, writeBatch, query, where, deleteDoc
} from 'firebase/firestore';
import {
  getWorkspaceToken,
  appendAppointmentToSheet,
  addAppointmentToCalendar,
  sendGmailNotification,
  appendInvoiceToSheet
} from './lib/googleWorkspace';

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

export function useAppState() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('rodp_logged_in_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      id: 'usr_owner1',
      name: 'Rizwan Roushan',
      email: 'rizwanroushan0@gmail.com',
      role: 'shop_owner',
      shopId: 'shop_1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };
  });

  const [shops, setShops] = useState<Shop[]>([]);
  const [customers, setCustomers] = useState<CustomerCRM[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [services, setServices] = useState<ServiceModule[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [finance, setFinance] = useState<FinanceRecord[]>([]);
  const [vault, setVault] = useState<DocumentVaultItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [aiKnowledge, setAiKnowledge] = useState<AIKnowledgeItem[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [onlinePayments, setOnlinePayments] = useState<OnlinePayment[]>([]);
  const [branchChats, setBranchChats] = useState<BranchChatMessage[]>([]);
  const [branchServiceSettings, setBranchServiceSettings] = useState<BranchServiceSetting[]>(() => {
    const saved = localStorage.getItem('rodp_branch_service_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [serviceNotifications, setServiceNotifications] = useState<ServiceChangeNotification[]>(() => {
    const saved = localStorage.getItem('rodp_service_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [conversations, setConversations] = useState<BranchConversation[]>(() => {
    const saved = localStorage.getItem('rodp_conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>(() => {
    const saved = localStorage.getItem('rodp_conversation_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [groupSettings, setGroupSettings] = useState<GroupSettings>({
    onlyAdminsCanPost: false,
    isGroupMuted: false
  });
  const [applyFormWebsites, setApplyFormWebsites] = useState<ApplyFormWebsite[]>(() => {
    const saved = localStorage.getItem('rodp_applyFormWebsites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_APPLY_FORM_WEBSITES;
  });
  const [applyFormActivities, setApplyFormActivities] = useState<ApplyFormActivity[]>(() => {
    const saved = localStorage.getItem('rodp_applyFormActivities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return MOCK_APPLY_FORM_ACTIVITIES;
  });
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Trash & Recovery State
  const [trashItems, setTrashItems] = useState<any[]>(() => {
    const saved = localStorage.getItem('rodp_trash_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const saveTrashItems = (items: any[]) => {
    setTrashItems(items);
    localStorage.setItem('rodp_trash_items', JSON.stringify(items));
  };

  const addTrashItem = (type: 'invoice' | 'task_proof', originalData: any, name: string) => {
    const newItem = {
      id: `trash_${Date.now()}`,
      type,
      name,
      deletedAt: new Date().toISOString(),
      originalData
    };
    const next = [newItem, ...trashItems];
    saveTrashItems(next);
  };

  const restoreTrashItem = (id: string) => {
    const item = trashItems.find(t => t.id === id);
    if (!item) return;

    if (item.type === 'invoice') {
      addRecord('invoices', item.originalData, setInvoices, invoices);
    } else if (item.type === 'task_proof') {
      const savedTasksRaw = localStorage.getItem('rodp_completed_priority_tasks');
      let tasksList = [];
      if (savedTasksRaw) {
        try {
          tasksList = JSON.parse(savedTasksRaw);
        } catch (e) {}
      }
      const updatedTasks = [item.originalData, ...tasksList];
      localStorage.setItem('rodp_completed_priority_tasks', JSON.stringify(updatedTasks));
      try {
        window.dispatchEvent(new Event('rodp_completed_tasks_updated'));
      } catch (e) {
        console.warn('dispatchEvent failed:', e);
      }
    }

    const next = trashItems.filter(t => t.id !== id);
    saveTrashItems(next);
  };

  const permanentDeleteTrashItem = (id: string) => {
    const next = trashItems.filter(t => t.id !== id);
    saveTrashItems(next);
  };

  const deleteInvoice = (invoice: Invoice) => {
    addTrashItem('invoice', invoice, `Invoice #${invoice.id} - ₹${invoice.totalAmount} for ${invoice.customerName}`);
    
    const updated = invoices.filter(i => i.id !== invoice.id);
    setInvoices(updated);
    localStorage.setItem('rodp_invoices', JSON.stringify(updated));

    if (isFirebaseAvailable && db && auth?.currentUser) {
      try {
        deleteDoc(doc(db, 'invoices', invoice.id)).catch(err => {
          console.warn('Firebase delete invoice notice:', err?.message || err);
        });
      } catch (err: any) {
        console.warn('Firebase delete invoice error:', err?.message || err);
      }
    }
  };

  // Load from Firestore OR LocalStorage fallback
  useEffect(() => {
    // Always load local fallbacks immediately so UI is completely responsive
    loadLocalFallbacks();

    if (!isFirebaseAvailable || !db || !auth) {
      setLoading(false);
      return;
    }

    let unsubscribers: (() => void)[] = [];

    // Follow React Firebase Setup: Only attach onSnapshot listeners if user is authenticated
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous listeners if auth state changed
      unsubscribers.forEach(u => u());
      unsubscribers = [];

      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Quick helper to setup listener when authenticated
        const setupSync = (colName: string, setter: (data: any) => void, defaultVal: any) => {
          const colRef = collection(db, colName);
          const unsub = onSnapshot(colRef, (snapshot) => {
            if (snapshot.empty) {
              // Seeding initial collections in firebase if authenticated and empty
              if (auth?.currentUser) {
                const batch = writeBatch(db);
                defaultVal.forEach((item: any) => {
                  const docRef = doc(db, colName, item.id);
                  batch.set(docRef, sanitizeForFirestore(item));
                });
                batch.commit().catch(err => console.warn(`Note seeding ${colName}:`, err?.message || err));
              }
              
              const stored = localStorage.getItem(`rodp_${colName}`);
              if (stored) {
                try {
                  setter(JSON.parse(stored));
                } catch {
                  setter(defaultVal);
                }
              } else {
                setter(defaultVal);
              }
            } else {
              const list = snapshot.docs.map(d => d.data());
              setter(list);
              localStorage.setItem(`rodp_${colName}`, JSON.stringify(list));
            }
          }, (err) => {
            console.warn(`Firestore sync notice for ${colName} (using local store):`, err?.message || err);
            const stored = localStorage.getItem(`rodp_${colName}`);
            if (stored) {
              try {
                setter(JSON.parse(stored));
              } catch {
                setter(defaultVal);
              }
            } else {
              setter(defaultVal);
            }
          });
          unsubscribers.push(unsub);
        };

        setupSync('shops', setShops, MOCK_SHOPS);
        setupSync('customers', setCustomers, MOCK_CUSTOMERS);
        setupSync('appointments', setAppointments, MOCK_APPOINTMENTS);
        setupSync('tasks', setTasks, MOCK_TASKS);
        setupSync('services', setServices, DEFAULT_SERVICES);
        setupSync('inventories', setInventories, MOCK_INVENTORIES);
        setupSync('staff', setStaff, MOCK_STAFF);
        setupSync('invoices', setInvoices, MOCK_INVOICES);
        setupSync('finance', setFinance, MOCK_FINANCE);
        setupSync('vault', setVault, MOCK_DOCUMENTS);
        setupSync('notifications', setNotifications, MOCK_NOTIFICATIONS);
        setupSync('securityLogs', setSecurityLogs, MOCK_SECURITY_LOGS);
        setupSync('sessionLogs', setSessionLogs, []);
        setupSync('aiKnowledge', setAiKnowledge, []);
        setupSync('notices', setNotices, MOCK_NOTICES);
        setupSync('inquiries', setInquiries, MOCK_INQUIRIES);
        setupSync('onlinePayments', setOnlinePayments, MOCK_ONLINE_PAYMENTS);
        setupSync('groupMessages', setGroupMessages, [
          {
            id: 'msg_init',
            senderId: 'usr_owner1',
            senderName: 'Rizwan Roushan Rownaq',
            senderRole: 'ceo',
            senderMobile: '01700000000',
            message: 'স্বাগতম সবাইকে Rizwan Online Dreams এর অফিশিয়াল ROD চ্যাট গ্রুপে! এখানে সকল মেম্বার ও ব্রাঞ্চের সাথে লাইভ চ্যাট ও রিয়েল-টাইম কাজের আপডেট শেয়ার করা হবে।',
            createdAt: new Date().toISOString()
          }
        ]);
        setupSync('groupSettings', (data: any) => {
          if (Array.isArray(data) && data.length > 0) {
            setGroupSettings(data[0]);
          } else if (data && !Array.isArray(data)) {
            setGroupSettings(data);
          }
        }, [{ id: 'settings', onlyAdminsCanPost: false, isGroupMuted: false }]);
        setupSync('applyFormWebsites', setApplyFormWebsites, DEFAULT_APPLY_FORM_WEBSITES);
        setupSync('applyFormActivities', setApplyFormActivities, MOCK_APPLY_FORM_ACTIVITIES);

        setLoading(false);
      } catch (err: any) {
        console.warn('Firebase synchronization listener note:', err?.message || err);
        loadLocalFallbacks();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribers.forEach(u => u());
    };
  }, []);

  // Universal Firebase Realtime Database Synchronization (Points 06-16)
  // Ensures instant bidirectional synchronization between Admin/CEO Panel and User Apps without manual reload
  useEffect(() => {
    let unsubAppts: (() => void) | null = null;
    let unsubNotices: (() => void) | null = null;
    let unsubInvoices: (() => void) | null = null;

    import('../firebase-rexlify').then(({ rtdb }) => {
      if (!rtdb) return;
      import('firebase/database').then(({ ref, onValue }) => {
        // 1. Realtime Appointments Listener (Admin & User reflection)
        const apptRef = ref(rtdb, 'rodp_appointments');
        unsubAppts = onValue(apptRef, (snapshot) => {
          const val = snapshot.val();
          if (val === null) {
            setAppointments([]);
            localStorage.setItem('rodp_appointments', JSON.stringify([]));
          } else if (val && typeof val === 'object') {
            const list: Appointment[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setAppointments(list);
            localStorage.setItem('rodp_appointments', JSON.stringify(list));
          }
        }, (err) => console.warn('RTDB appointments stream warning:', err));

        // 2. Realtime Notices Listener (CEO/Admin -> User App reflection)
        const noticeRef = ref(rtdb, 'rodp_notices');
        unsubNotices = onValue(noticeRef, (snapshot) => {
          const val = snapshot.val();
          if (val === null) {
            setNotices([]);
            localStorage.setItem('rodp_notices', JSON.stringify([]));
          } else if (val && typeof val === 'object') {
            const list: Notice[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setNotices(list);
            localStorage.setItem('rodp_notices', JSON.stringify(list));
          }
        }, (err) => console.warn('RTDB notices stream warning:', err));

        // 3. Realtime Invoices Listener
        const invRef = ref(rtdb, 'rodp_invoices');
        unsubInvoices = onValue(invRef, (snapshot) => {
          const val = snapshot.val();
          if (val === null) {
            setInvoices([]);
            localStorage.setItem('rodp_invoices', JSON.stringify([]));
          } else if (val && typeof val === 'object') {
            const list: Invoice[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setInvoices(list);
            localStorage.setItem('rodp_invoices', JSON.stringify(list));
          }
        }, (err) => console.warn('RTDB invoices stream warning:', err));

        // 4. Realtime Customers / Users Listener (Requirement 13)
        const custRef = ref(rtdb, 'rodp_customers');
        onValue(custRef, (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: CustomerCRM[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            if (list.length > 0) {
              setCustomers(prev => {
                const map = new Map<string, CustomerCRM>();
                prev.forEach(item => map.set(item.id, item));
                list.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
                const merged = Array.from(map.values());
                localStorage.setItem('rodp_customers', JSON.stringify(merged));
                return merged;
              });
            }
          }
        }, (err) => console.warn('RTDB customers stream warning:', err));

        // 5. Realtime Shops / Branches Listener (Requirement 21)
        const shopRef = ref(rtdb, 'rodp_shops');
        onValue(shopRef, (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: Shop[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            if (list.length > 0) {
              setShops(prev => {
                const map = new Map<string, Shop>();
                prev.forEach(item => map.set(item.id, item));
                list.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
                const merged = Array.from(map.values());
                localStorage.setItem('rodp_shops', JSON.stringify(merged));
                return merged;
              });
            }
          }
        }, (err) => console.warn('RTDB shops stream warning:', err));

        // 6. Realtime Online Payments Listener (Real-Time Customer -> Branch & CEO)
        const payRef = ref(rtdb, 'rodp_online_payments');
        onValue(payRef, (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: OnlinePayment[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            if (list.length > 0) {
              list.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
              setOnlinePayments(prev => {
                const map = new Map<string, OnlinePayment>();
                prev.forEach(item => map.set(item.id, item));
                list.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
                const merged = Array.from(map.values());
                localStorage.setItem('rodp_onlinePayments', JSON.stringify(merged));
                return merged;
              });
            }
          }
        }, (err) => console.warn('RTDB online payments stream warning:', err));

        // 7. Realtime Branch Live Chats (Customer <-> Branch WhatsApp Style)
        const chatRef = ref(rtdb, 'rodp_branch_chats');
        onValue(chatRef, (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: BranchChatMessage[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            if (list.length > 0) {
              list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
              setBranchChats(list);
              localStorage.setItem('rodp_branch_chats', JSON.stringify(list));
            }
          }
        }, (err) => console.warn('RTDB branch chats warning:', err));

        // 8. Realtime Document Vault (Citizen Verified Proofs)
        const vaultRef = ref(rtdb, 'rodp_vault');
        onValue(vaultRef, (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: DocumentVaultItem[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            if (list.length > 0) {
              setVault(prev => {
                const map = new Map<string, DocumentVaultItem>();
                prev.forEach(item => map.set(item.id, item));
                list.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
                const merged = Array.from(map.values());
                localStorage.setItem('rodp_vault', JSON.stringify(merged));
                return merged;
              });
            }
          }
        }, (err) => console.warn('RTDB vault warning:', err));

        // 9. Realtime Services Live Catalogue (Requirement 7 & 8: CEO changes sync instantly across all branches)
        const servicesRef = ref(rtdb, 'rodp_services');
        onValue(servicesRef, (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: ServiceModule[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            if (list.length > 0) {
              setServices(list);
              localStorage.setItem('rodp_services', JSON.stringify(list));
            }
          }
        }, (err) => console.warn('RTDB services stream warning:', err));

        // 10. Realtime Branch Service Settings & Overrides (Requirement 9, 10, 11)
        const bSvcRef = ref(rtdb, 'rodp_branch_service_settings');
        onValue(bSvcRef, (snapshot) => {
          const val = snapshot.val();
          if (val === null) {
            setBranchServiceSettings([]);
            localStorage.setItem('rodp_branch_service_settings', JSON.stringify([]));
          } else if (val && typeof val === 'object') {
            const list: BranchServiceSetting[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            setBranchServiceSettings(list);
            localStorage.setItem('rodp_branch_service_settings', JSON.stringify(list));
          }
        }, (err) => console.warn('RTDB branch service settings stream warning:', err));

        // 11. Realtime Service Notifications for CEO (Requirement 12, 13, 14)
        const svcNotifRef = ref(rtdb, 'rodp_service_notifications');
        onValue(svcNotifRef, (snapshot) => {
          const val = snapshot.val();
          if (val === null) {
            setServiceNotifications([]);
            localStorage.setItem('rodp_service_notifications', JSON.stringify([]));
          } else if (val && typeof val === 'object') {
            const list: ServiceChangeNotification[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setServiceNotifications(list);
            localStorage.setItem('rodp_service_notifications', JSON.stringify(list));
          }
        }, (err) => console.warn('RTDB service notifications stream warning:', err));

        // 12. Realtime Branch & CEO Conversations (Requirement 15 - 27)
        const convRef = ref(rtdb, 'rodp_conversations');
        onValue(convRef, (snapshot) => {
          const val = snapshot.val();
          if (val === null) {
            setConversations([]);
            localStorage.setItem('rodp_conversations', JSON.stringify([]));
          } else if (val && typeof val === 'object') {
            const list: BranchConversation[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            list.sort((a, b) => new Date(b.updatedAt || b.lastMessageTime || 0).getTime() - new Date(a.updatedAt || a.lastMessageTime || 0).getTime());
            setConversations(list);
            localStorage.setItem('rodp_conversations', JSON.stringify(list));
          }
        }, (err) => console.warn('RTDB conversations stream warning:', err));

        // 13. Realtime Conversation Messages (Requirement 18, 22, 25)
        const convMsgRef = ref(rtdb, 'rodp_conversation_messages');
        onValue(convMsgRef, (snapshot) => {
          const val = snapshot.val();
          if (val === null) {
            setConversationMessages([]);
            localStorage.setItem('rodp_conversation_messages', JSON.stringify([]));
          } else if (val && typeof val === 'object') {
            const list: ConversationMessage[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            list.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
            setConversationMessages(list);
            localStorage.setItem('rodp_conversation_messages', JSON.stringify(list));
          }
        }, (err) => console.warn('RTDB conversation messages stream warning:', err));

        // 14. Realtime Apply Form Websites Listener
        const applyWebsitesRef = ref(rtdb, 'rodp_apply_form_websites');
        onValue(applyWebsitesRef, (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: ApplyFormWebsite[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            if (list.length > 0) {
              setApplyFormWebsites(prev => {
                const map = new Map<string, ApplyFormWebsite>();
                prev.forEach(item => map.set(item.id, item));
                list.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
                const merged = Array.from(map.values());
                localStorage.setItem('rodp_applyFormWebsites', JSON.stringify(merged));
                return merged;
              });
            }
          }
        }, (err) => console.warn('RTDB apply form websites warning:', err));

        // 15. Realtime Apply Form Activities Listener
        const applyActivitiesRef = ref(rtdb, 'rodp_apply_form_activities');
        onValue(applyActivitiesRef, (snapshot) => {
          const val = snapshot.val();
          if (val && typeof val === 'object') {
            const list: ApplyFormActivity[] = Object.keys(val).map(k => ({
              ...val[k],
              id: val[k].id || k
            }));
            if (list.length > 0) {
              list.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
              setApplyFormActivities(list);
              localStorage.setItem('rodp_applyFormActivities', JSON.stringify(list));
            }
          }
        }, (err) => console.warn('RTDB apply form activities warning:', err));
      });
    }).catch(err => console.warn('Could not initialize universal RTDB listeners:', err));

    return () => {
      if (unsubAppts) unsubAppts();
      if (unsubNotices) unsubNotices();
      if (unsubInvoices) unsubInvoices();
    };
  }, []);

  const loadLocalFallbacks = () => {
    // Local storage sync
    const getOrSet = (key: string, defaultVal: any) => {
      const stored = localStorage.getItem(`rodp_${key}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultVal;
        }
      }
      localStorage.setItem(`rodp_${key}`, JSON.stringify(defaultVal));
      return defaultVal;
    };

    // Merge and load shops (Ensure 4 official branches ROD001, RCS102, MAM103, FAR104 are strictly active)
    const rawShops = getOrSet('shops', MOCK_SHOPS);
    const loadedShops = Array.isArray(rawShops) ? rawShops : [];
    // Filter out old legacy default branches
    const filteredLoadedShops = loadedShops.filter(s => !['RRR', 'JH104', 'EB105', 'FARIDPUR106'].includes((s.customId || '').toUpperCase()));
    const mergedShops = [...filteredLoadedShops];
    MOCK_SHOPS.forEach(mockS => {
      const idx = mergedShops.findIndex(s => s.id === mockS.id || (s.customId && mockS.customId && s.customId.toUpperCase() === mockS.customId.toUpperCase()));
      if (idx !== -1) {
        mergedShops[idx] = { ...mergedShops[idx], ...mockS };
      } else {
        mergedShops.push(mockS);
      }
    });
    setShops(mergedShops);
    syncLocal('shops', mergedShops);

    // Merge and load staff
    const rawStaff = getOrSet('staff', MOCK_STAFF);
    const loadedStaff = Array.isArray(rawStaff) ? rawStaff : [];
    const filteredLoadedStaff = loadedStaff.filter(st => !['RRR', 'JH104', 'EB105', 'FARIDPUR106'].includes((st.customId || '').toUpperCase()));
    const mergedStaff = [...filteredLoadedStaff];
    MOCK_STAFF.forEach(mockStf => {
      const idx = mergedStaff.findIndex(st => st.id === mockStf.id || (st.customId && mockStf.customId && st.customId.toUpperCase() === mockStf.customId.toUpperCase()));
      if (idx !== -1) {
        mergedStaff[idx] = { ...mergedStaff[idx], ...mockStf };
      } else {
        mergedStaff.push(mockStf);
      }
    });
    setStaff(mergedStaff);
    syncLocal('staff', mergedStaff);

    setCustomers(getOrSet('customers', MOCK_CUSTOMERS));
    setAppointments(getOrSet('appointments', MOCK_APPOINTMENTS));
    setTasks(getOrSet('tasks', MOCK_TASKS));
    setServices(getOrSet('services', DEFAULT_SERVICES));
    setInventories(getOrSet('inventories', MOCK_INVENTORIES));
    setInvoices(getOrSet('invoices', MOCK_INVOICES));
    setFinance(getOrSet('finance', MOCK_FINANCE));
    setVault(getOrSet('vault', MOCK_DOCUMENTS));
    setNotifications(getOrSet('notifications', MOCK_NOTIFICATIONS));
    setSecurityLogs(getOrSet('securityLogs', MOCK_SECURITY_LOGS));
    setSessionLogs(getOrSet('sessionLogs', []));
    setAiKnowledge(getOrSet('aiKnowledge', []));
    setNotices(getOrSet('notices', MOCK_NOTICES));
    setInquiries(getOrSet('inquiries', MOCK_INQUIRIES));
    setOnlinePayments(getOrSet('onlinePayments', MOCK_ONLINE_PAYMENTS));
    setGroupMessages(getOrSet('groupMessages', [
      {
        id: 'msg_init',
        senderId: 'usr_owner1',
        senderName: 'Rizwan Roushan Rownaq',
        senderRole: 'ceo',
        senderMobile: '01700000000',
        message: 'স্বাগতম সবাইকে Rizwan Online Dreams এর অফিশিয়াল ROD চ্যাট গ্রুপে! এখানে সকল মেম্বার ও ব্রাঞ্চের সাথে লাইভ চ্যাট ও রিয়েল-টাইম কাজের আপডেট শেয়ার করা হবে।',
        createdAt: new Date().toISOString()
      }
    ]));
    setGroupSettings(getOrSet('groupSettings', { onlyAdminsCanPost: false, isGroupMuted: false }));
    setApplyFormWebsites(getOrSet('applyFormWebsites', DEFAULT_APPLY_FORM_WEBSITES));
    setApplyFormActivities(getOrSet('applyFormActivities', MOCK_APPLY_FORM_ACTIVITIES));
    setLoading(false);
  };

  // Sync state changes to local storage as safety backup
  const syncLocal = (key: string, data: any) => {
    localStorage.setItem(`rodp_${key}`, JSON.stringify(data));
  };

  // State mutators with dual Firebase / Local support
  const addRecord = async (colName: string, record: any, setter: any, stateList: any[]) => {
    setter((prev: any[]) => {
      const updated = [...prev, record];
      syncLocal(colName, updated);
      return updated;
    });

    if (isFirebaseAvailable && db && auth?.currentUser) {
      try {
        const cleanedRecord = sanitizeForFirestore(record);
        await setDoc(doc(db, colName, record.id), cleanedRecord);
      } catch (err: any) {
        console.warn(`Firebase write notice on ${colName}:`, err?.message || err);
      }
    }

    if (colName === 'services') {
      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, set }) => {
          set(ref(rtdb, `rodp_services/${record.id}`), sanitizeForFirestore(record)).catch(err => {
            console.warn('RTDB service sync write notice:', err);
          });
        });
      });
    }
  };

  const updateRecord = async (colName: string, id: string, updates: any, setter: any, stateList: any[]) => {
    setter((prev: any[]) => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      syncLocal(colName, updated);
      return updated;
    });

    if (isFirebaseAvailable && db && auth?.currentUser) {
      try {
        const cleanedUpdates = sanitizeForFirestore(updates);
        await updateDoc(doc(db, colName, id), cleanedUpdates);
      } catch (err: any) {
        console.warn(`Firebase update notice on ${colName}:`, err?.message || err);
      }
    }

    if (colName === 'services') {
      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, update }) => {
          update(ref(rtdb, `rodp_services/${id}`), sanitizeForFirestore(updates)).catch(err => {
            console.warn('RTDB service sync update notice:', err);
          });
        });
      });
    }
  };

  const deleteRecord = async (colName: string, id: string, setter: any, stateList: any[]) => {
    setter((prev: any[]) => {
      const updated = prev.filter(item => item.id !== id);
      syncLocal(colName, updated);
      return updated;
    });

    if (isFirebaseAvailable && db && auth?.currentUser) {
      try {
        await deleteDoc(doc(db, colName, id));
      } catch (err: any) {
        console.warn(`Firebase delete notice on ${colName}:`, err?.message || err);
      }
    }

    if (colName === 'services') {
      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, set }) => {
          set(ref(rtdb, `rodp_services/${id}`), null).catch(err => {
            console.warn('RTDB service sync delete notice:', err);
          });
        });
      });
    }
  };

  const changeUserRole = (role: UserRole) => {
    let name = 'Rizwan Roushan';
    let email = 'rizwanroushan0@gmail.com';
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    let shopId = 'shop_1';
    let mobile: string | undefined = undefined;

    if (role === 'super_admin') {
      name = 'RODP Super Admin / CEO';
      email = 'ceo.rodp@online-dreams.com';
      avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
      shopId = '';
    } else if (role === 'staff') {
      name = 'Faisal Rizwan';
      email = 'faisal.rodp@gmail.com';
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
      shopId = 'shop_1';
      mobile = '9876543210';
    } else if (role === 'customer') {
      name = 'Rahul Sharma';
      email = 'rahul.sharma@gmail.com';
      avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150';
      shopId = 'shop_1';
      mobile = '9988776655';
    }

    setCurrentUser({
      id: role === 'customer' ? 'cust_1' : (role === 'staff' ? 'staff_1' : 'usr_owner1'),
      name,
      email,
      role,
      shopId,
      avatar,
      mobile
    });

    // Log security activity
    const newLog: SecurityLog = {
      id: `sec_${Date.now()}`,
      userId: role === 'customer' ? 'cust_1' : 'usr_owner1',
      userName: name,
      userRole: role,
      action: `Switched View Role to: ${role}`,
      ipAddress: '157.34.122.98',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      shopId: shopId || undefined
    };
    addRecord('securityLogs', newLog, setSecurityLogs, securityLogs);
  };

  const loginUser = (role: UserRole, name: string, email: string, permissions?: string[], mobile?: string, shopId?: string) => {
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    if (role === 'super_admin') {
      avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
    } else if (role === 'staff') {
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    } else if (role === 'customer') {
      avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150';
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      shopId: shopId || (role === 'super_admin' ? '' : 'shop_1'),
      avatar,
      permissions,
      mobile: mobile || (role === 'customer' ? '9988776655' : undefined)
    };

    setCurrentUser(newUser);
    localStorage.setItem('rodp_logged_in_user', JSON.stringify(newUser));

    // Log security activity
    const newLog: SecurityLog = {
      id: `sec_${Date.now()}`,
      userId: newUser.id,
      userName: name,
      userRole: role,
      action: `Logged In Securely: ${name} (${role.toUpperCase()})`,
      ipAddress: '157.34.122.98',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      shopId: newUser.shopId || undefined
    };
    addRecord('securityLogs', newLog, setSecurityLogs, securityLogs);

    // Dynamic Live Session Log recording
    const matchedShopName = shops.find(s => s.id === newUser.shopId || s.customId === newUser.shopId)?.name || (role === 'super_admin' ? 'CEO Head Office' : 'Central / Main Branch');
    const newSessionLog: SessionLog = {
      id: `sess_${Date.now()}`,
      userId: newUser.id,
      userName: name,
      userRole: role,
      branchName: matchedShopName,
      action: 'Login',
      timestamp: new Date().toISOString()
    };
    addRecord('sessionLogs', newSessionLog, setSessionLogs, sessionLogs);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const logSecurityEvent = async (action: string) => {
    const newLog: SecurityLog = {
      id: `sec_${Date.now()}`,
      userId: currentUser?.id || 'anonymous',
      userName: currentUser?.name || 'Anonymous User',
      userRole: currentUser?.role || 'customer',
      action,
      ipAddress: '157.34.122.98',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      shopId: currentUser?.shopId || undefined
    };
    await addRecord('securityLogs', newLog, setSecurityLogs, securityLogs);
  };

  const updateCustomerProfile = async (updates: { 
    name: string; 
    email: string; 
    mobile: string; 
    avatar: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dob?: string;
    gender?: string;
    profession?: string;
    emergencyContact?: string;
    language?: string;
    profileCompletion?: number;
  }) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('rodp_logged_in_user', JSON.stringify(updatedUser));

    const matchingCustomer = customers.find(c => 
      c.id === currentUser.id || 
      c.mobile === currentUser.mobile || 
      c.mobile === updates.mobile || 
      (c as any).mobileNumber === currentUser.mobile ||
      (c as any).mobileNumber === updates.mobile ||
      c.email === updates.email
    );
    if (matchingCustomer) {
      await updateRecord('customers', matchingCustomer.id, {
        name: updates.name,
        email: updates.email,
        mobile: updates.mobile,
        avatar: updates.avatar,
        address: updates.address !== undefined ? updates.address : (matchingCustomer.address || ''),
        city: updates.city !== undefined ? updates.city : (matchingCustomer.city || ''),
        state: updates.state !== undefined ? updates.state : (matchingCustomer.state || ''),
        pincode: updates.pincode !== undefined ? updates.pincode : (matchingCustomer.pincode || ''),
        dob: updates.dob !== undefined ? updates.dob : (matchingCustomer.dob || ''),
        gender: updates.gender !== undefined ? updates.gender : (matchingCustomer.gender || 'Rather not say'),
        profession: updates.profession !== undefined ? updates.profession : (matchingCustomer.profession || ''),
        emergencyContact: updates.emergencyContact !== undefined ? updates.emergencyContact : (matchingCustomer.emergencyContact || ''),
        language: updates.language !== undefined ? updates.language : (matchingCustomer.language || 'English'),
        profileCompletion: updates.profileCompletion !== undefined ? updates.profileCompletion : (matchingCustomer.profileCompletion || 0)
      }, setCustomers, customers);
    }

    await logSecurityEvent(`Updated profile details for customer: ${updates.name} (${updates.mobile})`);
  };

  return {
    currentUser,
    updateCustomerProfile,
    changeUserRole,
    loginUser,
    shops,
    addShop: (record: Shop) => {
      addRecord('shops', record, setShops, shops);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_shops/' + record.id), { ...record, updatedAt: Date.now() }).catch(err => console.warn('RTDB shop sync notice:', err));
        }
      }).catch(err => console.warn(err));
    },
    updateShop: (id: string, updates: any) => {
      if (id === 'shop_1') {
        if (updates.status && updates.status !== 'approved') {
          updates.status = 'approved';
        }
      }
      updateRecord('shops', id, updates, setShops, shops);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_shops/' + id), { ...updates, updatedAt: Date.now() }).catch(err => console.warn('RTDB shop update notice:', err));
        }
      }).catch(err => console.warn(err));
    },
    deleteShop: (id: string) => {
      if (id === 'shop_1') {
        alert('You cannot delete the Main HQ Office! (মেন অফিস ডিলিট করা সম্ভব নয়)');
        return;
      }
      deleteRecord('shops', id, setShops, shops);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_shops/' + id)).catch(err => console.warn('RTDB shop delete notice:', err));
        }
      }).catch(err => console.warn(err));
    },
    resetBranchData: async (id: string) => {
      const targetShop = shops.find(s => s.id === id);
      if (!targetShop) return;
      if (id === 'shop_1' || targetShop.isMainBranch || targetShop.customId === 'ROD001') {
        alert('You cannot reset the Main Head Office (ROD001)!');
        return;
      }

      // Determine default password
      let defaultPassword = 'pass';
      if (targetShop.customId === 'MB107') defaultPassword = 'Pervez@00123';
      else if (targetShop.customId === 'RRR105') defaultPassword = 'RRR@0012352';
      else if (targetShop.customId === 'CSCL106') defaultPassword = 'CSCL 0012350';
      else if (targetShop.customId === 'FAR104' || targetShop.customId === 'FARIDPUR106') defaultPassword = 'FAR@0012352';
      else if (targetShop.customId === 'MAM103' || targetShop.customId === 'EB105') defaultPassword = 'MAM@0012352';
      else if (targetShop.customId === 'RCS102' || targetShop.customId === 'JH104') defaultPassword = 'RCS@0012352';
      else if (targetShop.customId) defaultPassword = `${targetShop.customId}@00123`;

      // 1. Reset shop fields to fresh brand new state
      const resetShopUpdates: Partial<Shop> = {
        password: defaultPassword,
        passwordChanged: false,
        profileConfirmed: false,
        managerPhoto: '',
        managerBio: 'To provide honest, super-fast digital services to every citizen in our franchise network.',
        branchPhoto: '',
        branchPhotos: [],
        branchPhotosApproved: false,
        status: 'approved',
        holdUntil: undefined,
        holdReason: undefined,
        warningMessage: undefined,
        warningSentAt: undefined,
        warningDismissed: undefined,
      };

      updateRecord('shops', id, resetShopUpdates, setShops, shops);
      
      // Sync to RTDB
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_shops/' + id), { ...resetShopUpdates, updatedAt: Date.now() }).catch(err => console.warn('RTDB shop reset notice:', err));
        }
      }).catch(err => console.warn(err));

      // 2. Remove all invoices belonging to this branch
      const remainingInvoices = invoices.filter(inv => inv.shopId !== id && inv.shopId !== targetShop.customId);
      setInvoices(remainingInvoices);
      localStorage.setItem('rodp_invoices', JSON.stringify(remainingInvoices));

      // Remove from Firestore
      const removedInvoices = invoices.filter(inv => inv.shopId === id || inv.shopId === targetShop.customId);
      if (isFirebaseAvailable && db && auth?.currentUser) {
        removedInvoices.forEach(inv => {
          try {
            deleteDoc(doc(db, 'invoices', inv.id)).catch(() => {});
          } catch (e) {}
        });
      }

      // 3. Remove all appointments belonging to this branch
      const remainingAppointments = appointments.filter(apt => apt.shopId !== id && apt.shopId !== targetShop.customId && apt.branchId !== id);
      setAppointments(remainingAppointments);
      localStorage.setItem('rodp_appointments', JSON.stringify(remainingAppointments));

      const removedAppointments = appointments.filter(apt => apt.shopId === id || apt.shopId === targetShop.customId || apt.branchId === id);
      if (isFirebaseAvailable && db && auth?.currentUser) {
        removedAppointments.forEach(apt => {
          try {
            deleteDoc(doc(db, 'appointments', apt.id)).catch(() => {});
          } catch (e) {}
        });
      }

      // 4. Clear local storage flags for this branch
      localStorage.removeItem(`rodp_profile_confirmed_${id}`);
      localStorage.removeItem(`rodp_profile_confirmed_${targetShop.customId}`);
      localStorage.removeItem(`rodp_pwd_changed_${targetShop.customId}`);
      localStorage.removeItem(`rodp_pwd_changed_${id}`);
      localStorage.removeItem(`rodp_new_leader_dismissed_${id}`);
      localStorage.removeItem(`rodp_new_leader_dismissed_${targetShop.customId}`);
      localStorage.removeItem(`rodp_branch_products_${id}`);
      localStorage.removeItem(`rodp_branch_products_${targetShop.customId}`);
      localStorage.removeItem(`rodp_branch_proofs_${id}`);
      localStorage.removeItem(`rodp_branch_proofs_${targetShop.customId}`);
    },
    
    customers,
    addCustomer: (record: CustomerCRM) => {
      addRecord('customers', record, setCustomers, customers);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_customers/' + record.id), { ...record, updatedAt: Date.now() }).catch(err => console.warn('RTDB customer sync notice:', err));
        }
      }).catch(err => console.warn(err));
    },
    updateCustomer: (id: string, updates: any) => {
      updateRecord('customers', id, updates, setCustomers, customers);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_customers/' + id), { ...updates, updatedAt: Date.now() }).catch(err => console.warn('RTDB customer update notice:', err));
        }
      }).catch(err => console.warn(err));
    },
    deleteCustomer: (id: string) => {
      deleteRecord('customers', id, setCustomers, customers);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_customers/' + id)).catch(err => console.warn('RTDB customer delete notice:', err));
        }
      }).catch(err => console.warn(err));
    },
    
    appointments,
    addAppointment: async (record: Appointment) => {
      await addRecord('appointments', record, setAppointments, appointments);
      // Sync to Realtime Database for instant cross-panel visibility (Points 11, 15)
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          const apptRef = ref(rtdb, 'rodp_appointments/' + record.id);
          set(apptRef, {
            ...record,
            updatedAt: Date.now()
          }).catch(err => console.error("RTDB Sync error:", err));
        }
      }).catch(err => console.error("Could not load RTDB", err));

      // Sync to Google Workspace if active token is set
      const token = getWorkspaceToken();
      if (token) {
        try {
          await appendAppointmentToSheet(token, record);
          await addAppointmentToCalendar(token, record);
          
          const customerEmail = currentUser?.email || 'rizwanroushan0@gmail.com';
          const subject = `RODP Booking Confirmed: Token ${record.tokenNumber || 'Queue'}`;
          const htmlMsg = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
              <h2 style="color: #4f46e5; margin-bottom: 5px;">Booking Confirmation</h2>
              <p style="color: #6b7280; font-size: 14px; margin-top: 0;">Rizwan Online Dreams Platform (RODP)</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p>Dear <b>${record.name}</b>,</p>
              <p>Your appointment has been successfully booked in our system. Here are the details:</p>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f9fafb;">
                  <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Service</td>
                  <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${record.serviceType}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Date</td>
                  <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${record.date}</td>
                </tr>
                <tr style="background: #f9fafb;">
                  <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Time Slot</td>
                  <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${record.timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Token Number</td>
                  <td style="padding: 10px; color: #4f46e5; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${record.tokenNumber || 'Pending'}</td>
                </tr>
              </table>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">This is an automated notification. For instant help, contact our customer service helpline at +91 9593388785.</p>
            </div>
          `;
          await sendGmailNotification(token, customerEmail, subject, htmlMsg);
        } catch (e) {
          console.error('Google Workspace appointment sync error:', e);
        }
      }
    },
    updateAppointment: (id: string, updates: any) => {
      updateRecord('appointments', id, updates, setAppointments, appointments);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_appointments/' + id), {
            ...updates,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB appt update warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB', err));
    },
    deleteAppointment: (id: string) => {
      deleteRecord('appointments', id, setAppointments, appointments);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_appointments/' + id)).catch(err => console.warn('RTDB appt delete warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB', err));
    },
    
    tasks,
    addTask: (record: Task) => addRecord('tasks', record, setTasks, tasks),
    updateTask: (id: string, updates: any) => updateRecord('tasks', id, updates, setTasks, tasks),
    deleteTask: (id: string) => deleteRecord('tasks', id, setTasks, tasks),

    services,
    addService: (record: ServiceModule) => addRecord('services', record, setServices, services),
    updateService: (id: string, updates: any) => updateRecord('services', id, updates, setServices, services),
    deleteService: (id: string) => deleteRecord('services', id, setServices, services),

    inventories,
    addInventory: (record: InventoryItem) => addRecord('inventories', record, setInventories, inventories),
    updateInventory: (id: string, updates: any) => updateRecord('inventories', id, updates, setInventories, inventories),
    
    staff,
    addStaff: (record: Staff) => addRecord('staff', record, setStaff, staff),
    updateStaff: (id: string, updates: any) => updateRecord('staff', id, updates, setStaff, staff),
    
    invoices,
    addInvoice: (record: Invoice) => {
      addRecord('invoices', record, setInvoices, invoices);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_invoices/' + record.id), {
            ...record,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB invoice save error:', err));
        }
      }).catch(err => console.warn('Could not load RTDB', err));
    },
    updateInvoice: (id: string, updates: any) => {
      updateRecord('invoices', id, updates, setInvoices, invoices);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_invoices/' + id), {
            ...updates,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB invoice update error:', err));
        }
      }).catch(err => console.warn('Could not load RTDB', err));
    },
    deleteInvoice: (invoice: Invoice) => {
      deleteInvoice(invoice);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_invoices/' + invoice.id)).catch(err => console.warn('RTDB invoice delete error:', err));
        }
      }).catch(err => console.warn('Could not load RTDB', err));
    },

    trashItems,
    addTrashItem,
    restoreTrashItem,
    permanentDeleteTrashItem,
    
    finance,
    addFinanceRecord: (record: FinanceRecord) => addRecord('finance', record, setFinance, finance),
    deleteFinanceRecord: (id: string) => deleteRecord('finance', id, setFinance, finance),
    
    vault,
    addVaultItem: (record: DocumentVaultItem) => {
      addRecord('vault', record, setVault, vault);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_vault/' + record.id), {
            ...record,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB vault save warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB for vault', err));
    },
    updateVaultItem: (id: string, updates: any) => {
      updateRecord('vault', id, updates, setVault, vault);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_vault/' + id), {
            ...updates,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB vault update warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB for vault update', err));
    },
    deleteVaultItem: (id: string) => {
      deleteRecord('vault', id, setVault, vault);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_vault/' + id)).catch(err => console.warn('RTDB vault delete warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB for vault delete', err));
    },

    onlinePayments,
    addOnlinePayment: (record: OnlinePayment) => {
      addRecord('onlinePayments', record, setOnlinePayments, onlinePayments);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_online_payments/' + record.id), {
            ...record,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB payment save warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB for payment', err));
    },
    updateOnlinePayment: (id: string, updates: any) => {
      updateRecord('onlinePayments', id, updates, setOnlinePayments, onlinePayments);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_online_payments/' + id), {
            ...updates,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB payment update warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB for payment update', err));
    },
    deleteOnlinePayment: (id: string) => {
      deleteRecord('onlinePayments', id, setOnlinePayments, onlinePayments);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_online_payments/' + id)).catch(err => console.warn('RTDB payment remove warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB for payment remove', err));
    },
    
    notifications,
    addNotificationLog: (record: NotificationLog) => addRecord('notifications', record, setNotifications, notifications),
    
    securityLogs,
    sessionLogs,
    addSessionLog: (record: SessionLog) => addRecord('sessionLogs', record, setSessionLogs, sessionLogs),
    aiKnowledge,
    addAIKnowledgeItem: (record: AIKnowledgeItem) => addRecord('aiKnowledge', record, setAiKnowledge, aiKnowledge),
    deleteAIKnowledgeItem: (id: string) => deleteRecord('aiKnowledge', id, setAiKnowledge, aiKnowledge),
    
    notices,
    addNotice: (record: Notice) => {
      addRecord('notices', record, setNotices, notices);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_notices/' + record.id), {
            ...record,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB notice save warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB', err));
    },
    updateNotice: (id: string, updates: any) => {
      updateRecord('notices', id, updates, setNotices, notices);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_notices/' + id), {
            ...updates,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB notice update warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB', err));
    },
    deleteNotice: (id: string) => {
      deleteRecord('notices', id, setNotices, notices);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_notices/' + id)).catch(err => console.warn('RTDB notice remove warning:', err));
        }
      }).catch(err => console.warn('Could not load RTDB', err));
    },

    inquiries,
    addInquiry: (record: Inquiry) => addRecord('inquiries', record, setInquiries, inquiries),
    updateInquiry: (id: string, updates: any) => updateRecord('inquiries', id, updates, setInquiries, inquiries),
    deleteInquiry: (id: string) => deleteRecord('inquiries', id, setInquiries, inquiries),
    
    groupMessages,
    addGroupMessage: (record: GroupMessage) => addRecord('groupMessages', record, setGroupMessages, groupMessages),
    updateGroupMessage: (id: string, updates: any) => updateRecord('groupMessages', id, updates, setGroupMessages, groupMessages),
    deleteGroupMessage: (id: string) => deleteRecord('groupMessages', id, setGroupMessages, groupMessages),
    groupSettings,
    updateGroupSettings: async (updates: any) => {
      setGroupSettings(prev => {
        const next = { ...prev, ...updates };
        localStorage.setItem('rodp_groupSettings', JSON.stringify(next));
        if (isFirebaseAvailable && db && auth?.currentUser) {
          try {
            setDoc(doc(db, 'groupSettings', 'settings'), sanitizeForFirestore(next)).catch(err => {
              console.warn('Firebase save groupSettings notice:', err?.message || err);
            });
          } catch (err: any) {
            console.warn('Firebase save groupSettings error:', err?.message || err);
          }
        }
        return next;
      });
    },

    branchChats,
    addBranchChatMessage: (msg: BranchChatMessage) => {
      setBranchChats(prev => {
        const updated = [...prev, msg];
        localStorage.setItem('rodp_branch_chats', JSON.stringify(updated));
        return updated;
      });
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_branch_chats/' + msg.id), {
            ...msg,
            updatedAt: Date.now()
          }).catch(err => console.warn('RTDB chat save notice:', err));
        }
      }).catch(err => console.warn('Could not load RTDB for chat', err));
    },

    // Branch Service Overrides & Branch-Specific Services (Requirements 9, 10, 11)
    branchServiceSettings,
    saveBranchServiceSetting: (setting: BranchServiceSetting, notif?: Partial<ServiceChangeNotification>) => {
      setBranchServiceSettings(prev => {
        const idx = prev.findIndex(s => s.id === setting.id);
        const updated = idx >= 0 ? prev.map((s, i) => i === idx ? setting : s) : [...prev, setting];
        localStorage.setItem('rodp_branch_service_settings', JSON.stringify(updated));
        return updated;
      });

      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, set }) => {
          set(ref(rtdb, `rodp_branch_service_settings/${setting.id}`), sanitizeForFirestore(setting)).catch(err => {
            console.warn('RTDB branch service setting save warning:', err);
          });
        });
      });

      if (isFirebaseAvailable && db && auth?.currentUser) {
        try {
          setDoc(doc(db, 'branch_service_settings', setting.id), sanitizeForFirestore(setting)).catch(console.warn);
        } catch (e) {}
      }

      if (notif) {
        const notifRecord: ServiceChangeNotification = {
          id: `notif_svc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          branchId: setting.branchId,
          branchName: setting.branchName || 'Branch',
          serviceId: setting.serviceId,
          serviceName: setting.name || notif.serviceName || 'Service',
          changeType: notif.changeType || 'edited',
          previousValue: notif.previousValue,
          newValue: notif.newValue,
          timestamp: new Date().toISOString(),
          read: false
        };

        setServiceNotifications(prev => {
          const updated = [notifRecord, ...prev];
          localStorage.setItem('rodp_service_notifications', JSON.stringify(updated));
          return updated;
        });

        import('../firebase-rexlify').then(({ rtdb }) => {
          if (!rtdb) return;
          import('firebase/database').then(({ ref, set }) => {
            set(ref(rtdb, `rodp_service_notifications/${notifRecord.id}`), sanitizeForFirestore(notifRecord)).catch(console.warn);
          });
        });

        if (isFirebaseAvailable && db && auth?.currentUser) {
          try {
            setDoc(doc(db, 'service_notifications', notifRecord.id), sanitizeForFirestore(notifRecord)).catch(console.warn);
          } catch (e) {}
        }
      }
    },
    deleteBranchServiceSetting: (id: string, notif?: Partial<ServiceChangeNotification>) => {
      setBranchServiceSettings(prev => {
        const updated = prev.filter(s => s.id !== id);
        localStorage.setItem('rodp_branch_service_settings', JSON.stringify(updated));
        return updated;
      });

      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, set }) => {
          set(ref(rtdb, `rodp_branch_service_settings/${id}`), null).catch(console.warn);
        });
      });

      if (isFirebaseAvailable && db && auth?.currentUser) {
        try {
          deleteDoc(doc(db, 'branch_service_settings', id)).catch(console.warn);
        } catch (e) {}
      }

      if (notif && notif.branchId && notif.serviceId) {
        const notifRecord: ServiceChangeNotification = {
          id: `notif_svc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          branchId: notif.branchId,
          branchName: notif.branchName || 'Branch',
          serviceId: notif.serviceId,
          serviceName: notif.serviceName || 'Service',
          changeType: 'deleted',
          previousValue: notif.previousValue,
          newValue: 'Deleted',
          timestamp: new Date().toISOString(),
          read: false
        };

        setServiceNotifications(prev => {
          const updated = [notifRecord, ...prev];
          localStorage.setItem('rodp_service_notifications', JSON.stringify(updated));
          return updated;
        });

        import('../firebase-rexlify').then(({ rtdb }) => {
          if (!rtdb) return;
          import('firebase/database').then(({ ref, set }) => {
            set(ref(rtdb, `rodp_service_notifications/${notifRecord.id}`), sanitizeForFirestore(notifRecord)).catch(console.warn);
          });
        });

        if (isFirebaseAvailable && db && auth?.currentUser) {
          try {
            setDoc(doc(db, 'service_notifications', notifRecord.id), sanitizeForFirestore(notifRecord)).catch(console.warn);
          } catch (e) {}
        }
      }
    },

    // Service Notifications & CEO Replies (Requirements 12, 13, 14)
    serviceNotifications,
    addServiceNotification: (record: ServiceChangeNotification) => {
      setServiceNotifications(prev => {
        const updated = [record, ...prev];
        localStorage.setItem('rodp_service_notifications', JSON.stringify(updated));
        return updated;
      });

      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, set }) => {
          set(ref(rtdb, `rodp_service_notifications/${record.id}`), sanitizeForFirestore(record)).catch(console.warn);
        });
      });

      if (isFirebaseAvailable && db && auth?.currentUser) {
        try {
          setDoc(doc(db, 'service_notifications', record.id), sanitizeForFirestore(record)).catch(console.warn);
        } catch (e) {}
      }
    },
    replyToServiceNotification: (id: string, replyText: string) => {
      const now = new Date().toISOString();
      setServiceNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, ceoReply: replyText, ceoRepliedAt: now, read: true } : n);
        localStorage.setItem('rodp_service_notifications', JSON.stringify(updated));
        return updated;
      });

      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, update }) => {
          update(ref(rtdb, `rodp_service_notifications/${id}`), {
            ceoReply: replyText,
            ceoRepliedAt: now,
            read: true
          }).catch(console.warn);
        });
      });

      if (isFirebaseAvailable && db && auth?.currentUser) {
        try {
          updateDoc(doc(db, 'service_notifications', id), {
            ceoReply: replyText,
            ceoRepliedAt: now,
            read: true
          }).catch(console.warn);
        } catch (e) {}
      }
    },
    markServiceNotificationRead: (id: string) => {
      setServiceNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem('rodp_service_notifications', JSON.stringify(updated));
        return updated;
      });

      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, update }) => {
          update(ref(rtdb, `rodp_service_notifications/${id}`), { read: true }).catch(console.warn);
        });
      });
    },

    // Real-Time Branch Communication & Messaging (Requirements 15 - 27)
    conversations,
    conversationMessages,
    sendConversationMessage: (
      conversationId: string, 
      text: string, 
      senderRole: 'ceo' | 'branch', 
      senderName: string, 
      senderId: string, 
      senderBranchId?: string,
      targetBranches?: string[]
    ) => {
      const timestamp = new Date().toISOString();
      const msgId = `cmsg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newMsg: ConversationMessage = {
        id: msgId,
        conversationId,
        senderId,
        senderBranchId,
        senderName,
        senderRole,
        text,
        timestamp,
        status: 'sent',
        readBy: [senderId],
        isAnnouncement: conversationId.startsWith('announcement_'),
        targetBranches
      };

      setConversationMessages(prev => {
        const updated = [...prev, newMsg];
        localStorage.setItem('rodp_conversation_messages', JSON.stringify(updated));
        return updated;
      });

      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, set }) => {
          set(ref(rtdb, `rodp_conversation_messages/${msgId}`), sanitizeForFirestore(newMsg)).catch(console.warn);
        });
      });

      if (isFirebaseAvailable && db && auth?.currentUser) {
        try {
          setDoc(doc(db, 'conversation_messages', msgId), sanitizeForFirestore(newMsg)).catch(console.warn);
        } catch (e) {}
      }

      setConversations(prev => {
        const existing = prev.find(c => c.id === conversationId);
        const unreadCounts = { ...(existing?.unreadCounts || {}) };
        if (existing) {
          existing.participantIds.forEach(pId => {
            if (pId !== senderId) {
              unreadCounts[pId] = (unreadCounts[pId] || 0) + 1;
            }
          });
        }

        const convUpdates: Partial<BranchConversation> = {
          lastMessage: text,
          lastMessageTime: timestamp,
          lastSenderId: senderId,
          lastSenderName: senderName,
          unreadCounts,
          updatedAt: timestamp
        };

        const updated = prev.map(c => c.id === conversationId ? { ...c, ...convUpdates } : c);
        localStorage.setItem('rodp_conversations', JSON.stringify(updated));

        import('../firebase-rexlify').then(({ rtdb }) => {
          if (!rtdb) return;
          import('firebase/database').then(({ ref, update }) => {
            update(ref(rtdb, `rodp_conversations/${conversationId}`), sanitizeForFirestore(convUpdates)).catch(console.warn);
          });
        });

        if (isFirebaseAvailable && db && auth?.currentUser) {
          try {
            updateDoc(doc(db, 'conversations', conversationId), sanitizeForFirestore(convUpdates)).catch(console.warn);
          } catch (e) {}
        }

        return updated;
      });
    },

    createOrGetConversation: (
      type: 'direct' | 'announcement',
      participantIds: string[],
      participantNames: { [id: string]: string } = {},
      participantBranchIds: { [id: string]: string } = {},
      title?: string,
      targetBranchIds?: string[]
    ): BranchConversation => {
      const sortedIds = [...participantIds].sort();
      const existing = conversations.find(c => {
        if (type === 'announcement' && c.type === 'announcement' && title && c.title === title) return true;
        if (c.type === type && c.participantIds.length === sortedIds.length) {
          const cSorted = [...c.participantIds].sort();
          return cSorted.every((id, i) => id === sortedIds[i]);
        }
        return false;
      });

      if (existing) return existing;

      const convId = type === 'announcement' 
        ? `announcement_${Date.now()}` 
        : `conv_${sortedIds.join('_')}`;

      const newConv: BranchConversation = {
        id: convId,
        type,
        participantIds,
        participantNames,
        participantBranchIds,
        title: title || (type === 'announcement' ? 'Official Announcement' : 'Direct Conversation'),
        targetBranchIds: targetBranchIds || ['all'],
        unreadCounts: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setConversations(prev => {
        const updated = [newConv, ...prev];
        localStorage.setItem('rodp_conversations', JSON.stringify(updated));
        return updated;
      });

      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, set }) => {
          set(ref(rtdb, `rodp_conversations/${convId}`), sanitizeForFirestore(newConv)).catch(console.warn);
        });
      });

      if (isFirebaseAvailable && db && auth?.currentUser) {
        try {
          setDoc(doc(db, 'conversations', convId), sanitizeForFirestore(newConv)).catch(console.warn);
        } catch (e) {}
      }

      return newConv;
    },

    markConversationRead: (conversationId: string, userId: string) => {
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c.id === conversationId) {
            const unreadCounts = { ...(c.unreadCounts || {}) };
            unreadCounts[userId] = 0;
            return { ...c, unreadCounts };
          }
          return c;
        });
        localStorage.setItem('rodp_conversations', JSON.stringify(updated));
        return updated;
      });

      import('../firebase-rexlify').then(({ rtdb }) => {
        if (!rtdb) return;
        import('firebase/database').then(({ ref, update }) => {
          update(ref(rtdb, `rodp_conversations/${conversationId}/unreadCounts`), { [userId]: 0 }).catch(console.warn);
        });
      });
    },

    // Apply Forms Management & Realtime Activity Tracking
    applyFormWebsites,
    addApplyFormWebsite: (website: ApplyFormWebsite) => {
      addRecord('applyFormWebsites', website, setApplyFormWebsites, applyFormWebsites);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_apply_form_websites/' + website.id), { ...website, updatedAt: Date.now() }).catch(console.warn);
        }
      }).catch(console.warn);
    },
    updateApplyFormWebsite: (website: ApplyFormWebsite) => {
      updateRecord('applyFormWebsites', website.id, website, setApplyFormWebsites, applyFormWebsites);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_apply_form_websites/' + website.id), { ...website, updatedAt: Date.now() }).catch(console.warn);
        }
      }).catch(console.warn);
    },
    deleteApplyFormWebsite: (id: string) => {
      deleteRecord('applyFormWebsites', id, setApplyFormWebsites, applyFormWebsites);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_apply_form_websites/' + id)).catch(console.warn);
        }
      }).catch(console.warn);
    },

    applyFormActivities,
    recordApplyFormActivity: (activity: ApplyFormActivity) => {
      addRecord('applyFormActivities', activity, setApplyFormActivities, applyFormActivities);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { set, ref } = await import('firebase/database');
          set(ref(rtdb, 'rodp_apply_form_activities/' + activity.id), { ...activity, updatedAt: Date.now() }).catch(console.warn);
        }
      }).catch(console.warn);
    },
    updateApplyFormActivity: (activity: ApplyFormActivity) => {
      updateRecord('applyFormActivities', activity.id, activity, setApplyFormActivities, applyFormActivities);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { update, ref } = await import('firebase/database');
          update(ref(rtdb, 'rodp_apply_form_activities/' + activity.id), { ...activity, updatedAt: Date.now() }).catch(console.warn);
        }
      }).catch(console.warn);
    },
    deleteApplyFormActivity: (id: string) => {
      deleteRecord('applyFormActivities', id, setApplyFormActivities, applyFormActivities);
      import('../firebase-rexlify').then(async ({ rtdb }) => {
        if (rtdb) {
          const { remove, ref } = await import('firebase/database');
          remove(ref(rtdb, 'rodp_apply_form_activities/' + id)).catch(console.warn);
        }
      }).catch(console.warn);
    },
    
    loading,
    theme,
    toggleTheme,
    logSecurityEvent
  };
}
