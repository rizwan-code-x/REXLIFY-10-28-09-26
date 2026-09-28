import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Trash2, 
  Download, 
  FileCode,
  FolderOpen
} from 'lucide-react';
import { FileItem } from './types';

export const FilesView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pdf' | 'excel' | 'image' | 'doc'>('all');
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState<FileItem[]>([
    { id: 'f1', name: 'Constitutional_Law_Notes.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2026-06-11' },
    { id: 'f2', name: 'Enterprise_Revenue_Q2.xlsx', type: 'excel', size: '1.1 MB', uploadedAt: '2026-06-10' },
    { id: 'f3', name: 'Neural_Flow_Diagram.png', type: 'image', size: '3.8 MB', uploadedAt: '2026-06-08' },
    { id: 'f4', name: 'Autonomous_Agent_Architecture.docx', type: 'doc', size: '890 KB', uploadedAt: '2026-06-05' },
    { id: 'f5', name: 'Federalism_Case_Study.pdf', type: 'pdf', size: '4.2 MB', uploadedAt: '2026-06-02' }
  ]);

  const filteredFiles = files.filter(f => {
    if (filter !== 'all' && f.type !== filter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-xs">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">File & Document Vault</h1>
            <p className="text-xs text-slate-600">
              Manage uploaded PDFs, Excel sheets, diagrams & research documents with instant AI context links
            </p>
          </div>
        </div>

        <label className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer">
          <Upload size={14} />
          <span>Upload File</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const newFile: FileItem = {
                  id: `f-${Date.now()}`,
                  name: file.name,
                  type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.xlsx') || file.name.endsWith('.csv') ? 'excel' : file.type.startsWith('image/') ? 'image' : 'doc',
                  size: `${(file.size / 1024).toFixed(1)} KB`,
                  uploadedAt: new Date().toISOString().slice(0, 10)
                };
                setFiles([newFile, ...files]);
              }
            }}
          />
        </label>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 rounded-2xl bg-white/80 border border-pink-200">
          {(['all', 'pdf', 'excel', 'image', 'doc'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === cat ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/90 border border-pink-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-pink-400"
          />
        </div>
      </div>

      {/* Files List */}
      <div className="rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs overflow-hidden backdrop-blur-md">
        <div className="divide-y divide-pink-50">
          {filteredFiles.map((f) => (
            <div
              key={f.id}
              className="p-4 flex items-center justify-between hover:bg-pink-50/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-100 text-pink-700">
                  {f.type === 'pdf' ? (
                    <FileText size={18} className="text-purple-600" />
                  ) : f.type === 'excel' ? (
                    <FileSpreadsheet size={18} className="text-emerald-600" />
                  ) : f.type === 'image' ? (
                    <ImageIcon size={18} className="text-pink-600" />
                  ) : (
                    <FileCode size={18} className="text-indigo-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{f.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {f.type.toUpperCase()} • {f.size} • {f.uploadedAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete File"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
