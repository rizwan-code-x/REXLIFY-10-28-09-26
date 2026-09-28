import React, { useState } from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  FileText, 
  FileSpreadsheet, 
  Code, 
  PenTool, 
  Search, 
  ChevronRight,
  Zap,
  BookOpen,
  Layout,
  Calculator,
  Languages,
  Layers
} from 'lucide-react';
import { RexlifyAiTab, AiToolItem } from './types';

interface ToolsLibraryViewProps {
  onSelectTool: (tab: RexlifyAiTab, initialPrompt?: string) => void;
}

export const ToolsLibraryView: React.FC<ToolsLibraryViewProps> = ({ onSelectTool }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const tools: AiToolItem[] = [
    { id: '1', name: 'Assignment Studio', category: 'Study', description: 'Academic paper generator with titles, methodology, and verified references.', icon: 'GraduationCap', targetTab: 'assignment' },
    { id: '2', name: 'Study Notes & Quiz Generator', category: 'Study', description: 'Transform raw study materials into chapter notes, flashcards, and MCQ tests.', icon: 'BookOpen', targetTab: 'study' },
    { id: '3', name: 'Mnemonic & Memory Tricks', category: 'Study', description: 'Generate catchy acronyms and Bengali/English memory tricks for complex subjects.', icon: 'Zap', targetTab: 'study' },
    { id: '4', name: 'PDF Error & Fact Auditor', category: 'Documents', description: 'Pinpoint inconsistencies, grammar faults, and logical discrepancies in PDF texts.', icon: 'FileText', targetTab: 'pdf' },
    { id: '5', name: 'Executive Document Summarizer', category: 'Documents', description: 'Condense 50-page reports into actionable executive briefs in seconds.', icon: 'FileText', targetTab: 'pdf' },
    { id: '6', name: 'Multi-Language Translator', category: 'Documents', description: 'Context-accurate translation between Bengali, English, and Hindi.', icon: 'Languages', targetTab: 'chat' },
    { id: '7', name: 'Spreadsheet Formula Assistant', category: 'Data', description: 'Generate advanced formulas: SUMIFS, XLOOKUP, INDEX/MATCH and nested IFs.', icon: 'Calculator', targetTab: 'excel' },
    { id: '8', name: 'Data Visualization & Charting', category: 'Data', description: 'Interactive Recharts bar, line, and pie charts from CSV data.', icon: 'FileSpreadsheet', targetTab: 'excel' },
    { id: '9', name: 'Production Code Generator', category: 'Coding', description: 'Generate type-safe, production-ready TypeScript, Python, and React components.', icon: 'Code', targetTab: 'code' },
    { id: '10', name: 'Code Debugger & Auditor', category: 'Coding', description: 'Identify security leaks, silent bugs, and memory leaks in codebases.', icon: 'Code', targetTab: 'code' },
    { id: '11', name: 'UI/UX System Architect', category: 'Coding', description: 'Synthesize full design token scales, information architecture, and component trees.', icon: 'Layout', targetTab: 'uiux' },
    { id: '12', name: 'Voice Conversational Co-pilot', category: 'Creative', description: 'Interactive voice mode with natural audio synthesis and live waveform.', icon: 'Zap', targetTab: 'voice' },
    { id: '13', name: 'Executive Presentation Drafter', category: 'Creative', description: 'Build structured slide decks and speech notes for board meetings.', icon: 'PenTool', targetTab: 'chat' }
  ];

  const filteredTools = tools.filter(t => {
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-xs">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">Specialized AI Tools Library</h1>
            <p className="text-xs text-slate-600">
              Curated suite of 20+ specialized multimodal intelligences engineered for CEO Rizwan
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 rounded-2xl bg-white/80 border border-pink-200">
          {['All', 'Study', 'Documents', 'Data', 'Coding', 'Creative'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === cat ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-pink-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search AI tools..."
            className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/90 border border-pink-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-pink-400"
          />
        </div>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectTool(tool.targetTab)}
            className="group rounded-3xl bg-white/90 border border-pink-100 hover:border-pink-300 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-pink-50 group-hover:scale-105 transition-transform text-pink-700">
                  <Sparkles size={20} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-pink-100/70 text-pink-800 border border-pink-200">
                  {tool.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-pink-700 transition-colors">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {tool.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-pink-50 flex items-center text-xs font-semibold text-pink-700 group-hover:text-purple-700">
              <span>Launch</span>
              <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
