const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const configSection = `
            {/* Rexlify AI Dedicated Credentials & Control */}
            <div className="bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-pink-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(236,72,153,0.15)] mt-8">
              <div className="space-y-6 text-left">
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="animate-pulse" />
                    Rexlify AI Gateway Access Configuration
                  </span>
                  <h3 className="font-sora text-xl font-extrabold text-white uppercase tracking-tight">Rexlify AI Passkey Manager</h3>
                  <p className="text-pink-200/70 text-xs font-light max-w-2xl">Update the direct security passkey required by users when they click on Rexlify AI.</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold block">New Rexlify AI Passkey</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        id="rexlify-ai-custom-pass"
                        placeholder="Enter new passkey..."
                        className="w-full text-xs px-4 py-3 rounded-xl border border-pink-500/20 bg-white/5 backdrop-blur-xl text-white focus:outline-none focus:border-pink-400 font-mono"
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          const val = (document.getElementById('rexlify-ai-custom-pass') as HTMLInputElement)?.value;
                          if (!val) { alert('Please enter a valid passkey.'); return; }
                          try {
                            const { rtdb } = await import('../firebase-rexlify');
                            if (rtdb) {
                              const { ref, set } = await import('firebase/database');
                              await set(ref(rtdb, 'rexlify_ai_config/password'), val);
                              alert('✅ Rexlify AI Passkey updated successfully!');
                            }
                          } catch (e) {
                            alert('Failed to update passkey.');
                          }
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-amber-500/30 hover:from-blue-500/40 hover:to-amber-500/40 border border-purple-500/30 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-purple-500/20"
                      >
                        Update Key
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
`;

code = code.replace("{/* System Status RTDB Toggles */}", configSection + "\n{/* System Status RTDB Toggles */}");

fs.writeFileSync('src/components/AdminPanel.tsx', code);
