import { useState, useEffect } from 'react';

export interface SystemStatus {
  sifra: boolean;
  rexlify_ai: boolean;
  rodp: boolean;
  institute: boolean;
  neurax: boolean;
  global_maintenance: boolean;
}

export const DEFAULT_STATUS: SystemStatus = {
  sifra: true,
  rexlify_ai: true,
  rodp: true,
  institute: true,
  neurax: true,
  global_maintenance: false
};

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import('./firebase-rexlify').then(async ({ rtdb }) => {
      if (!rtdb) {
        setLoading(false);
        return;
      }
      const { ref, onValue } = await import('firebase/database');
      const statusRef = ref(rtdb, 'rexlify_system_status');
      onValue(statusRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setStatus({ ...DEFAULT_STATUS, ...val });
        }
        setLoading(false);
      });
    }).catch(err => {
      console.error("Error loading RTDB status:", err);
      setLoading(false);
    });
  }, []);

  return { status, loading };
}
