const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add "institute" to sidebarItems
const sidebarString = `{ id: 'social-media', label: 'Social Media', icon: <Link size={15} /> },`;
code = code.replace(sidebarString, sidebarString + `\n    { id: 'institute', label: 'Institute & Feedback', icon: <Users size={15} /> },`);

// Add state for students & feedback
const stateHooks = `  // Feedback and Institute Apps state
  const [studentApps, setStudentApps] = useState<any[]>([]);
  const [instituteFeedbacks, setInstituteFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'institute') {
      fetch('/api/institute/applications')
        .then(res => res.json())
        .then(data => { if(data.success) setStudentApps(data.data); });
      
      fetch('/api/feedback')
        .then(res => res.json())
        .then(data => { if(data.success) setInstituteFeedbacks(data.data); });
    }
  }, [activeTab]);
`;

// Insert after `const [isAddingFaq, setIsAddingFaq] = useState(false);`
code = code.replace(`const [isAddingFaq, setIsAddingFaq] = useState(false);`, stateHooks + `\n  const [isAddingFaq, setIsAddingFaq] = useState(false);`);

// Create Institute Tab UI
const instituteTabUI = `
        {/* ----------------- INSTITUTE & FEEDBACK CENTER ----------------- */}
        {activeTab === 'institute' && (
          <div className="space-y-10 animate-fadeIn text-left">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div className="space-y-2">
                <h1 className="font-sora text-3xl font-semibold text-white tracking-tight">Institute & Feedback</h1>
                <p className="text-gray-400 text-sm font-light">Monitor student applications and system feedback.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-sora text-xl font-bold text-emerald-400 uppercase tracking-tight border-b border-white/10 pb-2">Student Applications (Supabase Sync)</h2>
              <div className="bg-[#0c0c0c] rounded-[2rem] border border-white/10 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-4 text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest">Ref ID</th>
                      <th className="p-4 text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest">Name</th>
                      <th className="p-4 text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest">Email / Phone</th>
                      <th className="p-4 text-[10px] font-mono text-gray-400 uppercase font-bold tracking-widest">Occupation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                    {studentApps.map((app, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-4 text-emerald-400 font-mono">{app.refId}</td>
                        <td className="p-4 text-white font-bold">{app.name}</td>
                        <td className="p-4">{app.email} <br/><span className="text-gray-500 text-xs">{app.whatsapp}</span></td>
                        <td className="p-4 text-gray-400">{app.occupation}</td>
                      </tr>
                    ))}
                    {studentApps.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-mono text-xs">No applications available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-sora text-xl font-bold text-blue-400 uppercase tracking-tight border-b border-white/10 pb-2">General Feedbacks (Supabase Sync)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instituteFeedbacks.map((fb, i) => (
                  <div key={i} className="p-6 bg-[#0c0c0c] rounded-3xl border border-white/10">
                    <p className="font-bold text-white mb-1">{fb.name} <span className="text-gray-500 text-xs font-mono">({fb.email})</span></p>
                    <p className="text-gray-400 text-sm whitespace-pre-wrap">{fb.message}</p>
                    <p className="text-gray-600 text-[10px] font-mono mt-4">At: {new Date(fb.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {instituteFeedbacks.length === 0 && (
                  <p className="text-gray-500 font-mono text-xs p-4">No feedback received.</p>
                )}
              </div>
            </div>
          </div>
        )}
`;

code = code.replace(`        {/* ----------------- SOCIAL MEDIA LINKS CENTER ----------------- */}`, instituteTabUI + `\n        {/* ----------------- SOCIAL MEDIA LINKS CENTER ----------------- */}`);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
