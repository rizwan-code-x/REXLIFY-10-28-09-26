import React, { useState } from 'react';
import { 
  Layout, 
  Sparkles, 
  Layers, 
  Palette, 
  Compass, 
  CheckCircle, 
  Copy, 
  Check,
  RefreshCw
} from 'lucide-react';

export const UiUxArchitectView: React.FC = () => {
  const [appIdea, setAppIdea] = useState('An intelligent executive workspace with transparent memory, multimodal chat, and academic assignment generation');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [blueprint, setBlueprint] = useState(`### 1. Primary User Journey & Persona
- **Persona**: CEO Rizwan / Modern Knowledge Worker
- **Goal**: Rapid ingestion of messy multi-format data into structured, publishable artifacts with zero UI clutter.
- **Entry Flow**: Omnibar Command Center -> Context Routing -> Real-time Verification -> Export.

### 2. Information Architecture & Navigation
- **Left Structural Rail**: Brand Badge, Omnibar Trigger, Mode Selectors (Chat, Assignment, PDF, Data, Voice).
- **Workspace Canvas**: Focused single-module canvas with generous padding (min 24px) and soft glassmorphism.
- **Right Context Drawer**: Token metrics, latency, project memory tokens.

### 3. Design System Tokens (Luminous Pink & Violet Aesthetic)
- **Background**: \`from-pink-50 via-rose-50 to-purple-50\`
- **Glass Cards**: \`bg-white/90 backdrop-blur-md border border-pink-100 shadow-sm\`
- **Primary CTA Buttons**: \`bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600\`
- **Transparent Utility Buttons**: \`bg-white/80 hover:bg-white text-pink-900 border-pink-200\`
- **Corner Radii Rule**: Container 24px, Cards 16px, Buttons 12px.`);

  const handleGenerate = async () => {
    if (!appIdea.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/rexlify-ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'uiux',
          prompt: `Generate UI/UX architecture blueprint for app: ${appIdea}`,
          ceoMode: true
        })
      });
      const data = await res.json();
      if (data.reply) setBlueprint(data.reply);
    } catch {
      // Keep blueprint
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-pink-600 text-white shadow-xs">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">UI/UX System Architect</h1>
            <p className="text-xs text-slate-600">
              Convert product concepts into structured information architecture, user flows & design tokens
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(blueprint);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-pink-50 text-pink-900 border border-pink-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-pink-600" />}
          <span>{copied ? 'Copied' : 'Copy Blueprint'}</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-5 shadow-xs space-y-3 backdrop-blur-md">
        <label className="block text-xs font-bold text-slate-700">Application Concept / Feature Idea</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={appIdea}
            onChange={(e) => setAppIdea(e.target.value)}
            placeholder="Describe your product idea or interface requirement..."
            className="flex-1 rounded-2xl bg-pink-50/40 border border-pink-200 px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-pink-400"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !appIdea.trim()}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>Architect System</span>
          </button>
        </div>
      </div>

      {/* Generated Blueprint View */}
      <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-pink-600" />
            <h3 className="text-sm font-bold text-slate-900">System Architecture Specification</h3>
          </div>
          <span className="text-[10px] font-mono text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
            Design Tokens Verified
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-pink-50/20 border border-pink-100 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
          {blueprint}
        </div>
      </div>
    </div>
  );
};
