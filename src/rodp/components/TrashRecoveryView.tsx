import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, RotateCcw, Search, Trash, ShieldAlert, CheckCircle2, 
  Receipt, CheckSquare, Calendar, RefreshCw, AlertCircle
} from 'lucide-react';

interface TrashItem {
  id: string;
  type: 'invoice' | 'task_proof';
  name: string;
  deletedAt: string;
  originalData: any;
}

interface TrashRecoveryViewProps {
  theme: 'light' | 'dark';
  trashItems: TrashItem[];
  restoreTrashItem: (id: string) => void;
  permanentDeleteTrashItem: (id: string) => void;
}

export default function TrashRecoveryView({
  theme,
  trashItems,
  restoreTrashItem,
  permanentDeleteTrashItem
}: TrashRecoveryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'task_proof'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRestore = (id: string, name: string) => {
    restoreTrashItem(id);
    triggerToast(`✓ successfully restored: ${name}`);
  };

  const handlePermanentDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"? This action is absolutely irreversible.`)) {
      permanentDeleteTrashItem(id);
      triggerToast(`🗑️ Permanently deleted: ${name}`);
    }
  };

  const handleClearAll = () => {
    if (trashItems.length === 0) return;
    if (window.confirm('⚠️ WARNING: Are you sure you want to completely clear the entire Recycle Bin? ALL deleted items will be permanently lost.')) {
      trashItems.forEach(item => permanentDeleteTrashItem(item.id));
      triggerToast('🔥 Entire Recycle Bin cleared successfully.');
    }
  };

  const filteredItems = trashItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-[#0a0a0c] border border-[#dfac5d] text-amber-300 font-bold text-xs tracking-wider shadow-[0_4px_30px_rgba(223,172,93,0.25)] flex items-center gap-2"
          >
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Header Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 overflow-hidden bg-gradient-to-r from-amber-500/10 via-[#0a0a0c] to-purple-500/10 border border-[#dfac5d]/15 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfac5d]/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest font-black text-amber-400 font-mono flex items-center gap-1.5">
              <ShieldAlert size={12} className="text-[#dfac5d] animate-pulse" />
              RECOVERY & COMPLIANCE DESK
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              Trash Recovery Center <span className="text-[#dfac5d] font-serif italic text-lg md:text-xl">(রিসাইকেল বিন)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-2 max-w-2xl">
              Deleted invoices, payment records, and completed task proofs are archived here securely. You can review, verify, and restore files back to their live modules, keeping shop operation records safe from accidental loss.
            </p>
          </div>
          <button
            onClick={handleClearAll}
            disabled={trashItems.length === 0}
            className={`px-5 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 ${
              trashItems.length > 0
                ? 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 shadow-[0_4px_15px_rgba(239,68,68,0.15)] cursor-pointer'
                : 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Trash2 size={13} />
            <span>Empty Trash Bin</span>
          </button>
        </div>
      </div>

      {/* Stats Quick-deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-4 text-left">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trash2 size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Total In Trash</span>
            <span className="text-xl font-black font-mono text-white">{trashItems.length} items</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-4 text-left">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Receipt size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Deleted Invoices</span>
            <span className="text-xl font-black font-mono text-white">
              {trashItems.filter(t => t.type === 'invoice').length} items
            </span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-center gap-4 text-left">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CheckSquare size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Deleted Task Proofs</span>
            <span className="text-xl font-black font-mono text-white">
              {trashItems.filter(t => t.type === 'task_proof').length} items
            </span>
          </div>
        </div>
      </div>

      {/* Control Deck (Search + Filter Options) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4.5 rounded-2xl bg-[#0a0a0c]/60 border border-slate-850">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search deleted files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-800 bg-[#020203] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
        </div>

        {/* Filter Type */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 w-full sm:w-auto">
          {(['all', 'invoice', 'task_proof'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 sm:flex-initial text-center px-4.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-[#dfac5d]/15 text-amber-300 border border-[#dfac5d]/20 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'all' ? 'All Types' : type === 'invoice' ? 'Invoices' : 'Proofs/Tasks'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Items Listing Table */}
      <div className="rounded-2xl border border-slate-850 bg-[#050507]/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-900/30 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                <th className="py-4.5 px-5">Deleted File Name / Description</th>
                <th className="py-4.5 px-5">Module Category</th>
                <th className="py-4.5 px-5">Timestamp Deleted</th>
                <th className="py-4.5 px-5 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 font-medium">
              <AnimatePresence initial={false}>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle size={24} className="text-slate-600 animate-pulse" />
                        <div className="text-center">
                          <p className="font-bold text-sm">Recycle Bin is empty</p>
                          <p className="text-[10px] opacity-75 mt-0.5">No deleted files matching search filters were found.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, x: -10 }}
                      className="hover:bg-slate-900/20 transition-all group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl shrink-0 ${
                            item.type === 'invoice' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' 
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/15'
                          }`}>
                            {item.type === 'invoice' ? <Receipt size={14} /> : <CheckSquare size={14} />}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate text-[12px]">
                              {item.name}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                              UUID: {item.id} • Original ID: {item.originalData.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-black tracking-wider ${
                          item.type === 'invoice'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {item.type === 'invoice' ? 'Billing / Invoice' : 'Task Completion Proof'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                        {new Date(item.deletedAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Restore action */}
                          <button
                            onClick={() => handleRestore(item.id, item.name)}
                            className="px-3.5 py-1.5 rounded-xl border border-[#dfac5d]/30 bg-[#dfac5d]/5 hover:bg-[#dfac5d]/20 text-[#dfac5d] font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Restore back to live module"
                          >
                            <RotateCcw size={11} />
                            <span>Restore</span>
                          </button>

                          {/* Purge permanently */}
                          <button
                            onClick={() => handlePermanentDelete(item.id, item.name)}
                            className="p-2.5 rounded-xl border border-rose-500/10 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
