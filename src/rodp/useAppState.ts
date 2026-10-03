import { useState, useEffect } from 'react';
import { 
  User, Shop, ServiceModule, Appointment, Task, 
  CustomerCRM, Invoice, InventoryItem, DocumentVaultItem, 
  Staff, FinanceRecord, NotificationLog, SecurityLog, UserRole,
  AIKnowledgeItem, SessionLog, Notice, Inquiry, GroupMessage, GroupSettings, OnlinePayment,
  BranchChatMessage
} from './types';
import { 
  DEFAULT_SERVICES, MOCK_SHOPS, MOCK_CUSTOMERS, 
  MOCK_APPOINTMENTS, MOCK_TASKS, MOCK_INVENTORIES, 
  MOCK_STAFF, MOCK_INVOICES, MOCK_FINANCE, 
  MOCK_DOCUMENTS, MOCK_NOTIFICATIONS, MOCK_SECURITY_LOGS,
  MOCK_NOTICES, MOCK_INQUIRIES, MOCK_ONLINE_PAYMENTS
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
  const [groupSettings, setGroupSettings] = useState<GroupSettings>({
    onlyAdminsCanPost: false,
    isGroupMuted: false
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
    
    loading,
    theme,
    toggleTheme,
    logSecurityEvent
  };
}
