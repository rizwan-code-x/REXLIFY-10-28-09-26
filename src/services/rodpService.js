import { rtdb } from "../config/firebase";
import { ref, push, set, onValue, serverTimestamp, update, remove } from "firebase/database";

// ১. RODP ইউজার ফর্ম সাবমিট হ্যান্ডলার
export async function submitRODPApplication(serviceData) {
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
  } catch (error) {
    console.error("RODP Submission Error:", error);
    return { success: false, error: error.message };
  }
}

// ২. রিয়েল-টাইম লাইভ ডাটা লিসেনার (শুধুমাত্র CEO ড্যাশবোর্ডের জন্য)
export function subscribeRODPApplications(callback) {
  try {
    const rodpRef = ref(rtdb, "rodp_portal/applications");
    return onValue(rodpRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }
      const list = Object.keys(data).map((key) => ({
        ...data[key],
        firebaseId: key,
      }));
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

// ৩. স্ট্যাটাস আপডেট মেথড (Approve / Reject / In Progress)
export async function updateRODPApplicationStatus(firebaseId, status, adminNotes = "") {
  try {
    const itemRef = ref(rtdb, `rodp_portal/applications/${firebaseId}`);
    await update(itemRef, {
      status,
      adminNotes,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("RODP Update Status Error:", error);
    return { success: false, error: error.message };
  }
}

// ৪. রিকোয়েস্ট ডিলিট মেথড
export async function deleteRODPApplication(firebaseId) {
  try {
    const itemRef = ref(rtdb, `rodp_portal/applications/${firebaseId}`);
    await remove(itemRef);
    return { success: true };
  } catch (error) {
    console.error("RODP Delete Error:", error);
    return { success: false, error: error.message };
  }
}
