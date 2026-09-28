const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Insert the hooks and Firebase import at the top
if (!code.includes('import { ref, onValue, set } from "firebase/database";')) {
    code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { ref, onValue, set } from 'firebase/database';");
}

// Add state for RTDB status
const stateCode = `
  const [sysStatus, setSysStatus] = useState({
    sifra: true,
    rexlify_ai: true,
    rodp: true,
    institute: true,
    neurax: true,
    global_maintenance: false
  });
  
  useEffect(() => {
    let rtdbInstance = null;
    import('../firebase-rexlify').then(async ({ rtdb }) => {
      if (!rtdb) return;
      rtdbInstance = rtdb;
      const statusRef = ref(rtdb, 'rexlify_system_status');
      onValue(statusRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          setSysStatus(prev => ({ ...prev, ...val }));
        }
      });
    });
  }, []);

  const handleToggleSysStatus = async (key) => {
    const newValue = !sysStatus[key];
    try {
      const { rtdb } = await import('../firebase-rexlify');
      if (rtdb) {
        await set(ref(rtdb, 'rexlify_system_status/' + key), newValue);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };
`;
code = code.replace("export const AdminPanel: React.FC<AdminPanelProps> = ({", stateCode + "\nexport const AdminPanel: React.FC<AdminPanelProps> = ({");

// Build UI for toggles
const toggleUI = `
            {/* System Status RTDB Toggles */}
            <div className="bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-pink-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.15)] mt-8">
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert size={12} className="animate-pulse" />
                    Advanced Security & Feature Toggles (Realtime)
                  </span>
                  <h3 className="font-sora text-xl font-extrabold text-white uppercase tracking-tight">App Activation Nodes</h3>
                  <p className="text-pink-200/70 text-xs font-light max-w-2xl">Toggle individual subsystems permanently or temporarily across all devices globally. If turned off, users will see a Rexlify error overlay.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'sifra', label: 'Sifra AI System' },
                    { key: 'rexlify_ai', label: 'Rexlify AI (Main)' },
                    { key: 'rodp', label: 'RODP Admin Platform' },
                    { key: 'institute', label: 'Institute Web App' },
                    { key: 'neurax', label: 'Neurax Engine' },
                  ].map((app) => (
                    <div key={app.key} className="flex items-center justify-between bg-white/5 backdrop-blur-2xl border border-pink-500/20 p-4 rounded-2xl shadow-inner">
                      <div className="text-left space-y-1">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider block text-white">
                          {app.label}
                        </span>
                        <span className="text-[9px] text-pink-300/60 uppercase font-mono">
                          {sysStatus[app.key] ? '🟢 Network Online' : '🔴 Port Blocked'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleSysStatus(app.key)}
                        className={\`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none cursor-pointer \${sysStatus[app.key] ? 'bg-pink-500' : 'bg-gray-700'}\`}
                      >
                        <div className={\`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 \${sysStatus[app.key] ? 'translate-x-6' : 'translate-x-0'}\`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
`;

code = code.replace("{/* Ecosystem Safety and Binary Calibration Controls */}", toggleUI + "\n{/* Ecosystem Safety and Binary Calibration Controls */}");

fs.writeFileSync('src/components/AdminPanel.tsx', code);
