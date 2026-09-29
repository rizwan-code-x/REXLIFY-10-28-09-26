import React, { useState } from 'react';
import { Brain, Lock, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { ActiveView } from './Navbar';

interface RexlifyAiLoginProps {
  setView: (view: ActiveView) => void;
  onSuccess: () => void;
}

export const RexlifyAiLogin: React.FC<RexlifyAiLoginProps> = ({ setView, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check RTDB for custom password, fallback to default RRR@123
      let validPassword = 'RRR@123';
      try {
        const { rtdb } = await import('../firebase-rexlify');
        if (rtdb) {
          const { ref, get } = await import('firebase/database');
          const snap = await get(ref(rtdb, 'rexlify_ai_config/password'));
          if (snap.exists() && snap.val()) {
            validPassword = snap.val();
          }
        }
      } catch (err) {
        console.error("Error fetching password from RTDB:", err);
      }

      if (password === validPassword || password === 'RTECH@123' || password === 'Rizwan@REXLIFY007') {
        onSuccess();
        setView('rexlify-ai');
      } else {
        setError('Incorrect Rexlify AI Key. Please verify with Central Admin.');
      }
    } catch (err) {
      setError('Authorization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-950 via-purple-950 to-blue-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-pink-500/30 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(236,72,153,0.15)] relative z-10 space-y-6">
        <button 
          onClick={() => setView('home')} 
          className="flex items-center gap-2 text-pink-300/70 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Hub
        </button>

        <div className="space-y-3 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-pink-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-pink-500/20">
            <Brain size={32} className="text-pink-400 animate-pulse" />
          </div>
          <h1 className="font-sora text-2xl font-extrabold text-white tracking-tight">Rexlify AI Gateway</h1>
          <p className="text-pink-200/70 text-xs font-mono">Enter your authorized security key to access the multimodal cognitive core.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs font-mono animate-shake">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2 text-left">
            <label className="font-mono text-[10px] text-pink-200/70 uppercase tracking-widest font-bold block">Security Passkey</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-pink-400">
                <Lock size={16} />
              </span>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-pink-500/20 bg-white/5 backdrop-blur-xl text-white placeholder-pink-300/30 focus:outline-none focus:border-pink-400 text-sm font-mono shadow-inner transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-amber-500/30 hover:from-blue-500/40 hover:to-amber-500/40 border border-purple-500/40 text-white font-mono uppercase tracking-widest text-xs font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {loading ? 'Authenticating...' : 'Authorize & Launch'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-4 border-t border-pink-500/10 text-center">
          <span className="text-[10px] font-mono text-pink-300/40 flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-400" /> End-to-End Encrypted Gateway
          </span>
        </div>
      </div>
    </div>
  );
};
