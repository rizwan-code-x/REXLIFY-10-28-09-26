const fs = require('fs');
let code = fs.readFileSync('src/rodp/useAppState.ts', 'utf8');

// Insert realtime DB sync for addAppointment
const rtdbSyncCode = `
      // Sync to New Realtime Database for cross-panel visibility
      import('../../firebase-rexlify').then(({ rtdb, push, ref }) => {
        if (rtdb) {
          const apptRef = ref(rtdb, 'rodp_appointments');
          push(apptRef, {
            ...record,
            createdAt: Date.now()
          }).catch(err => console.error("RTDB Sync error:", err));
        }
      }).catch(err => console.error("Could not load RTDB", err));
`;

code = code.replace("await addRecord('appointments', record, setAppointments, appointments);", "await addRecord('appointments', record, setAppointments, appointments);" + rtdbSyncCode);

fs.writeFileSync('src/rodp/useAppState.ts', code);
