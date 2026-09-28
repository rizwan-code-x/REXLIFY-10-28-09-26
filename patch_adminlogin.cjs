const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

// Update Props interface
code = code.replace("onLoginSuccess: (role: 'ceo' | 'teacher') => void;", "onLoginSuccess: (role: 'ceo' | 'teacher' | 'rexlify-ai') => void;");

// Update loginMode state
code = code.replace("const [loginMode, setLoginMode] = useState<'select' | 'ceo' | 'teacher'>('select');", "const [loginMode, setLoginMode] = useState<'select' | 'ceo' | 'teacher' | 'rexlify-ai'>('select');");

// Update handleAuth logic
const oldSuccessLogic = `          const isCEO = loginMode === 'ceo';
          onLoginSuccess(isCEO ? 'ceo' : 'teacher');
          setView(isCEO ? 'admin-dashboard' : 'teacher-dashboard');`;

const newSuccessLogic = `          if (loginMode === 'ceo') {
            onLoginSuccess('ceo');
            setView('admin-dashboard');
          } else if (loginMode === 'teacher') {
            onLoginSuccess('teacher');
            setView('teacher-dashboard');
          } else if (loginMode === 'rexlify-ai') {
            onLoginSuccess('rexlify-ai');
            setView('rexlify-ai');
          }`;

code = code.replace(oldSuccessLogic, newSuccessLogic);

// Add Brain icon for Rexlify AI
if (!code.includes('Brain,')) {
    code = code.replace("import { Lock, KeyRound, AlertTriangle, ShieldCheck, Crown, Users } from 'lucide-react';", "import { Lock, KeyRound, AlertTriangle, ShieldCheck, Crown, Users, Brain } from 'lucide-react';");
}

// Update UI options
const oldButtons = `        {loginMode === 'select' ? (
          <div className="space-y-4 pt-4">
            <button
              onClick={() => setLoginMode('ceo')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Crown size={20} className="text-emerald-400" />
              <span>CEO & Founder Login</span>
            </button>
            <button
              onClick={() => setLoginMode('teacher')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Users size={20} className="text-purple-400" />
              <span>Teacher / Faculty Login</span>
            </button>
          </div>
        ) : (`;

const newButtons = `        {loginMode === 'select' ? (
          <div className="space-y-4 pt-4">
            <button
              onClick={() => setLoginMode('ceo')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Crown size={20} className="text-emerald-400" />
              <span>CEO & Founder Login</span>
            </button>
            <button
              onClick={() => setLoginMode('teacher')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Users size={20} className="text-purple-400" />
              <span>Teacher & Faculty Login</span>
            </button>
            <button
              onClick={() => setLoginMode('rexlify-ai')}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 text-white font-mono uppercase tracking-widest text-sm font-bold transition-all cursor-pointer"
            >
              <Brain size={20} className="text-blue-400" />
              <span>Rexlify AI Access</span>
            </button>
          </div>
        ) : (`;

code = code.replace(oldButtons, newButtons);

// Remove placeholder examples from inputs and fix warning message
const oldWarning = `              <span>
                You are attempting to access the {loginMode === 'ceo' ? "CEO" : "Teacher"} operational command module. Unauthorized login triggers cryptographic logging.
              </span>`;
const newWarning = `              <span>
                You are attempting to access the {loginMode === 'ceo' ? "CEO" : loginMode === 'teacher' ? "Teacher" : "Rexlify AI"} operational command module. Unauthorized login triggers cryptographic logging.
              </span>`;
code = code.replace(oldWarning, newWarning);

const oldLabel = `                  <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                    Enter {loginMode === 'ceo' ? "CEO" : "Teacher"} Password
                  </label>`;
const newLabel = `                  <label className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                    Enter {loginMode === 'ceo' ? "CEO" : loginMode === 'teacher' ? "Teacher" : "Access"} Password
                  </label>`;
code = code.replace(oldLabel, newLabel);

code = code.replace(/placeholder="Enter password..."/g, 'placeholder="••••••••"');

fs.writeFileSync('src/components/AdminLogin.tsx', code);
