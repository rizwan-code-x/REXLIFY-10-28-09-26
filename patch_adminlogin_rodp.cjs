const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

code = code.replace("onLoginSuccess: (role: 'ceo' | 'teacher' | 'rexlify-ai') => void;", "onLoginSuccess: (role: 'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin') => void;");
code = code.replace("const [loginMode, setLoginMode] = useState<'select' | 'ceo' | 'teacher' | 'rexlify-ai'>('select');", "const [loginMode, setLoginMode] = useState<'select' | 'ceo' | 'teacher' | 'rexlify-ai' | 'rodp-admin'>('select');");

const oldButtons = `            <button
              onClick={() => setLoginMode('rexlify-ai')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Brain size={20} className="text-blue-400" />
              <span>Rexlify AI Access</span>
            </button>`;

const newButtons = `            <button
              onClick={() => setLoginMode('rexlify-ai')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Brain size={20} className="text-blue-400" />
              <span>Rexlify AI Access</span>
            </button>
            <button
              onClick={() => setLoginMode('rodp-admin')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <ShieldCheck size={20} className="text-amber-400" />
              <span>RODP Admin Panel</span>
            </button>`;

code = code.replace(oldButtons, newButtons);

const oldSuccessLogic = `          } else if (loginMode === 'rexlify-ai') {
            onLoginSuccess('rexlify-ai');
            setView('rexlify-ai');
          }`;

const newSuccessLogic = `          } else if (loginMode === 'rexlify-ai') {
            onLoginSuccess('rexlify-ai');
            setView('rexlify-ai');
          } else if (loginMode === 'rodp-admin') {
            // Auto-login to RODP as super_admin
            localStorage.setItem('rodp_logged_in', 'true');
            localStorage.setItem('rodp_logged_in_user', JSON.stringify({ role: 'super_admin', name: 'Rizwan Roushan', email: 'rtsuroj@gmail.com' }));
            onLoginSuccess('rodp-admin');
            setView('rodp');
          }`;

code = code.replace(oldSuccessLogic, newSuccessLogic);

code = code.replace('loginMode === \'teacher\' ? "Teacher" : "Access"', 'loginMode === \'teacher\' ? "Teacher" : loginMode === \'rodp-admin\' ? "RODP Admin" : "Access"');
code = code.replace('loginMode === \'teacher\' ? "Teacher" : "Rexlify AI"', 'loginMode === \'teacher\' ? "Teacher" : loginMode === \'rodp-admin\' ? "RODP Admin" : "Rexlify AI"');

fs.writeFileSync('src/components/AdminLogin.tsx', code);
