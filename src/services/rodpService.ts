import { rtdb } from "../config/firebase";
import { ref, push, set, onValue, serverTimestamp, update, remove } from "firebase/database";

export interface RODPApplication {
  id?: string;
  firebaseId?: string;
  applicantName: string;
  contactNumber: string;
  email?: string;
  serviceRequested: string;
  branchName?: string;
  notes?: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  submittedAt?: any;
  updatedAt?: any;
  adminNotes?: string;
}

// 1. Submit RODP Application from client/portal
export async function submitRODPApplication(serviceData: Partial<RODPApplication>) {
  try {
    const rodpRef = ref(rtdb, "rodp_portal/applications");
    const newEntry = push(rodpRef);

    const payload = {
      ...serviceData,
      id: newEntry.key,
      status: serviceData.status || "pending",
      submittedAt: serverTimestamp()
    };

    await set(newEntry, payload);
    return { success: true, id: newEntry.key };
  } catch (error: any) {
    console.error("RODP Submission Error:", error);
    return { success: false, error: error.message };
  }
}

// 2. Real-time stream for verified CEO panel
export function subscribeRODPApplications(callback: (apps: RODPApplication[]) => void) {
  try {
    const rodpRef = ref(rtdb, "rodp_portal/applications");
    return onValue(rodpRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const list: RODPApplication[] = Object.keys(data).map((key) => ({
        ...data[key],
        firebaseId: key,
      }));
      // Sort newest first
      list.sort((a, b) => {
        const timeA = typeof a.submittedAt === 'number' ? a.submittedAt : 0;
        const timeB = typeof b.submittedAt === 'number' ? b.submittedAt : 0;
        return timeB - timeA;
      });
      callback(list);
    }, (error) => {
      console.warn("RODP RTDB Stream Warning:", error);
    });
  } catch (err) {
    console.warn("RODP RTDB Subscription Warning:", err);
    return () => {};
  }
}

// 3. Update application status
export async function updateRODPApplicationStatus(
  firebaseId: string, 
  status: 'pending' | 'in_progress' | 'approved' | 'rejected', 
  adminNotes?: string
) {
  try {
    const itemRef = ref(rtdb, `rodp_portal/applications/${firebaseId}`);
    await update(itemRef, {
      status,
      adminNotes: adminNotes || '',
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error: any) {
    console.error("RODP Update Status Error:", error);
    return { success: false, error: error.message };
  }
}

// 4. Delete application
export async function deleteRODPApplication(firebaseId: string) {
  try {
    const itemRef = ref(rtdb, `rodp_portal/applications/${firebaseId}`);
    await remove(itemRef);
    return { success: true };
  } catch (error: any) {
    console.error("RODP Delete Error:", error);
    return { success: false, error: error.message };
  }
}
