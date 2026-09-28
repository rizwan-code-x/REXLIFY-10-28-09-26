const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Insert RTDB listener hook
const rtdbCode = `
  // RODP Appointments State (RTDB Sync)
  const [rodpAppointments, setRodpAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      import('../firebase-rexlify').then(({ rtdb, ref, onValue }) => {
        if (rtdb) {
          const apptRef = ref(rtdb, 'rodp_appointments');
          onValue(apptRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
              list.sort((a, b) => b.createdAt - a.createdAt);
              setRodpAppointments(list);
            } else {
              setRodpAppointments([]);
            }
          });
        }
      });
    }
  }, [activeTab]);
`;

code = code.replace(`  // Navigation handling`, rtdbCode + `\n  // Navigation handling`);

const rodpAppointmentsUI = `
            {/* RODP Realtime Appointments */}
            <div className="space-y-6">
              <h2 className="font-sora text-xl font-bold text-emerald-400 uppercase tracking-tight border-b border-white/10 pb-2">RODP Realtime Appointments</h2>
              <div className="bg-[#0c0c0c] rounded-[2rem] border border-emerald-500/20 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-emerald-500/5">
                      <th className="p-4 text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">Time</th>
                      <th className="p-4 text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">Customer</th>
                      <th className="p-4 text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">Service</th>
                      <th className="p-4 text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest">Slot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {rodpAppointments.slice(0, 10).map((app, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-4 text-emerald-400 font-mono text-xs">{new Date(app.createdAt).toLocaleString()}</td>
                        <td className="p-4 text-white font-bold">{app.name} <br/><span className="text-gray-500 text-[10px] font-mono">Token: {app.tokenNumber}</span></td>
                        <td className="p-4 text-cyan-400 text-xs">{app.serviceType}</td>
                        <td className="p-4 font-mono text-xs">{app.date} {app.timeSlot}</td>
                      </tr>
                    ))}
                    {rodpAppointments.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-mono text-xs">No RODP appointments received yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
`;

code = code.replace(`{/* Recent Security Activity */}`, rodpAppointmentsUI + `\n            {/* Recent Security Activity */}`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
