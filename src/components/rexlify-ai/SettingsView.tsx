import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Cpu
} from 'lucide-react';

interface SettingsViewProps {
  ceoMode: boolean;
  onToggleCeoMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  ceoMode,
  onToggleCeoMode
}) => {
  const [voiceRate, setVoiceRate] = useState(1.05);
  const [responseStyle, setResponseStyle] = useState('Executive & Direct');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-xs">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">Workspace Configuration</h1>
            <p className="text-xs text-slate-600">
              Customize AI persona, multimodal parameters, voice synthesis & privacy controls
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
        >
          {saved ? <Check size={14} className="text-white" /> : <Sparkles size={14} />}
          <span>{saved ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* CEO Mode Settings */}
        <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-700">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personalized CEO Mode</h3>
                <p className="text-xs text-slate-500">
                  Operate REXLIFY AI with dedicated context memory for CEO Rizwan
                </p>
              </div>
            </div>

            <button
              onClick={onToggleCeoMode}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                ceoMode 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-xs' 
                  : 'bg-white text-slate-600 border-pink-200'
              }`}
            >
              {ceoMode ? 'CEO Mode Active' : 'Enable CEO Mode'}
            </button>
          </div>
        </div>

        {/* AI Persona & Response Style */}
        <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-3 border-b border-pink-100">
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-700">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Reasoning Persona</h3>
              <p className="text-xs text-slate-500">Fine-tune execution depth and verbosity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Executive & Direct', 'Academic Rigor', 'Creative & Strategic'].map((style) => (
              <button
                key={style}
                onClick={() => setResponseStyle(style)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  responseStyle === style
                    ? 'bg-pink-100/70 border-pink-500 text-pink-900 font-semibold shadow-xs'
                    : 'bg-pink-50/20 border-pink-100 text-slate-700 hover:bg-pink-50'
                }`}
              >
                <div className="text-xs font-bold">{style}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {style === 'Executive & Direct'
                    ? 'Crisp, structured bullet points with zero fluff.'
                    : style === 'Academic Rigor'
                    ? 'In-depth methodology, literature review & citations.'
                    : 'Expansive ideation, analogies & visionary synthesis.'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice AI Parameters */}
        <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-3 pb-3 border-b border-pink-100">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
              <Volume2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Speech Synthesis Velocity</h3>
              <p className="text-xs text-slate-500">Speed multiplier for voice audio responses</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={voiceRate}
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="flex-1 accent-pink-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-700 min-w-12">
              {voiceRate.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-3xl bg-white/90 border border-pink-200/80 p-6 shadow-xs space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Zero Secret-Key Exposure</h3>
                <p className="text-xs text-slate-500">
                  All Gemini neural network calls are executed on containerized cloud runtimes
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              SECURE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
