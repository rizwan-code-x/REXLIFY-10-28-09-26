const fs = require('fs');
let code = fs.readFileSync('src/rodp/components/BranchDashboardView.tsx', 'utf8');

const rtdbCode = `
  // Sync Realtime Appointments
  const [rtAppointments, setRtAppointments] = useState<any[]>([]);
  useEffect(() => {
    import('../../firebase-rexlify').then(({ rtdb, ref, onValue }) => {
      if (rtdb) {
        const apptRef = ref(rtdb, 'rodp_appointments');
        onValue(apptRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            list.sort((a, b) => b.createdAt - a.createdAt);
            setRtAppointments(list);
          }
        });
      }
    });
  }, []);
`;

code = code.replace(`  // Advanced Admin Data Processing`, rtdbCode + `\n  // Advanced Admin Data Processing`);

const uiUpdate = `
      {/* REALTIME RODP BOOKINGS */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-emerald-500/20 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-lg font-black text-slate-100 uppercase tracking-widest">Real-time Global Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase tracking-widest text-emerald-500/70">
                <th className="pb-3 pl-2">Time</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Service</th>
                <th className="pb-3 text-right pr-2">Date/Slot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rtAppointments.slice(0, 5).map(app => (
                <tr key={app.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 pl-2 text-xs font-mono text-emerald-400/80">{new Date(app.createdAt).toLocaleTimeString()}</td>
                  <td className="py-3 font-bold text-slate-200 text-sm">{app.name} <span className="text-[10px] text-slate-500 font-mono block">Token: {app.tokenNumber}</span></td>
                  <td className="py-3 text-xs text-cyan-400">{app.serviceType}</td>
                  <td className="py-3 pr-2 text-right text-xs font-mono text-slate-400">{app.date} <br/>{app.timeSlot}</td>
                </tr>
              ))}
              {rtAppointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs font-mono text-slate-600">Listening for incoming bookings...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
`;

code = code.replace(`      {/* Main KPI Grid */}`, uiUpdate + `\n      {/* Main KPI Grid */}`);

fs.writeFileSync('src/rodp/components/BranchDashboardView.tsx', code);
