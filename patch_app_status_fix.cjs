const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const statusHook = `
  const { status, loading } = useSystemStatus();

  // Helper to render disabled block
  const renderDisabledBlock = (appName: string) => (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-pink-500/20 p-8 rounded-[2rem] text-center space-y-6 shadow-[0_0_50px_rgba(236,72,153,0.1)]">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <AlertTriangle size={32} className="text-rose-500" />
        </div>
        <div>
          <h2 className="font-sora text-xl font-bold text-white mb-2 uppercase tracking-widest">{appName} Offline</h2>
          <p className="text-gray-400 text-sm font-mono leading-relaxed">
            This module has been temporarily stopped by the REXLIFY Central Administration due to routine maintenance or system calibration. 
            <br/><br/>
            Please check back later. System cryptographic codes remain secured.
          </p>
        </div>
        <button onClick={() => setView('home')} className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-purple-500/30 text-white rounded-xl font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-lg shadow-purple-500/20">
          Return to Hub
        </button>
      </div>
    </div>
  );
`;

code = code.replace("const [is3DMode, setIs3DMode] = useState<boolean>(true);", "const [is3DMode, setIs3DMode] = useState<boolean>(true);\n" + statusHook);

fs.writeFileSync('src/App.tsx', code);
