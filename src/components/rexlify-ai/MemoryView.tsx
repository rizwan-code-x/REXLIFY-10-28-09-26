import React, { useState } from 'react';
import { 
  Brain, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { MemoryItem } from './types';

export const MemoryView: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: 'm1',
      category: 'preference',
      title: 'Executive Persona & User Identity',
      description: 'The primary operator is CEO Rizwan. Prioritize decisive, structured, high-signal recommendations without unnecessary filler.',
      active: true
    },
    {
      id: 'm2',
      category: 'style',
      title: 'Academic Writing Standard',
      description: 'When generating assignments or essays, enforce APA 7th edition citation norms, empirical evidence tables, and rigorous section hierarchies.',
      active: true
    },
    {
      id: 'm3',
      category: 'project',
      title: 'Bengali & English Multilingual Fluidity',
      description: 'Seamlessly translate conceptual terminology into Bengali (বাংলা) mnemonics when explaining complex neural networks or governance principles.',
      active: true
    },
    {
      id: 'm4',
      category: 'style',
      title: 'Design Aesthetics Rule',
      description: 'Strict adherence to luminous pink & purple glassmorphic palettes with high contrast. Never default to dark backgrounds.',
      active: true
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const toggleMemory = (id: string) => {
    setMemories(memories.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const deleteMemory = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newDesc.trim()) return;
    const item: MemoryItem = {
      id: `m-${Date.now()}`,
      category: 'preference',
      title: newTitle,
      description: newDesc,
      active: true
    };
    setMemories([...memories, item]);
    setNewTitle('');
    setNewDesc('');
    setShowAdd(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-xs">
            <Brain size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">Memory & Personalization Vault</h1>
            <p className="text-xs text-slate-600">
              Transparent, user-governed contextual memory. REXLIFY AI adapts to your writing, projects & style.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Memory Token</span>
        </button>
      </div>

      {/* Memory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories.map((mem) => (
          <div
            key={mem.id}
            className={`rounded-3xl p-6 border transition-all ${
              mem.active 
                ? 'bg-white/90 border-pink-200 shadow-xs' 
                : 'bg-pink-50/30 border-pink-100 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 uppercase">
                  {mem.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2">{mem.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMemory(mem.id)}
                  className="text-pink-600 hover:text-purple-700 cursor-pointer"
                  title={mem.active ? 'Disable Memory' : 'Enable Memory'}
                >
                  {mem.active ? <ToggleRight size={24} className="text-pink-600" /> : <ToggleLeft size={24} className="text-slate-400" />}
                </button>
                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {mem.description}
            </p>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-pink-200 space-y-4 animate-scaleUp">
            <h3 className="text-base font-bold text-slate-900">Add Memory Rule</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Coding Standard Preference"
              className="w-full rounded-2xl bg-pink-50/40 border border-pink-200 p-3 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500"
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              placeholder="Describe instruction or preference..."
              className="w-full rounded-2xl bg-pink-50/40 border border-pink-200 p-3 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500 resize-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl bg-pink-50 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Save Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
