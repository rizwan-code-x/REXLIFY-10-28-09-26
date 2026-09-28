const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert useSystemStatus hook
if (!code.includes('useSystemStatus')) {
    code = code.replace("import React, {", "import React, {");
    code = code.replace("import { Footer }", "import { useSystemStatus } from './useSystemStatus';\nimport { Footer }");
}

const statusHook = `
  const { status, loading } = useSystemStatus();

  // Helper to render disabled block
  const renderDisabledBlock = (appName) => (
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
code = code.replace("const [is3DMode, setIs3DMode] = useState(false);", "const [is3DMode, setIs3DMode] = useState(false);\n" + statusHook);

// Add the blocks
code = code.replace("if (view === 'rexlify-ai') {", "if (view === 'rexlify-ai') {\n      if (!loading && !status.rexlify_ai) return renderDisabledBlock('Rexlify AI');");
code = code.replace("if (view === 'sifra-ai') {", "if (view === 'sifra-ai') {\n      if (!loading && !status.sifra) return renderDisabledBlock('Sifra AI');");
code = code.replace("if (view === 'neurax-ai') {", "if (view === 'neurax-ai') {\n      if (!loading && !status.neurax) return renderDisabledBlock('Neurax AI');");
code = code.replace("if (view === 'rodp') {", "if (view === 'rodp') {\n      if (!loading && !status.rodp) return renderDisabledBlock('RODP Platform');");
code = code.replace("if (view === 'student-portal') {", "if (view === 'student-portal') {\n      if (!loading && !status.institute) return renderDisabledBlock('Institute Portal');");

fs.writeFileSync('src/App.tsx', code);
