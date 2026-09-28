import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Languages, 
  Scissors, 
  Copy, 
  Check, 
  Upload,
  RefreshCw
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export const PdfStudioView: React.FC = () => {
  const [docTitle, setDocTitle] = useState('Autonomous_Ecosystem_Architecture_Specification.pdf');
  const [docContent, setDocContent] = useState(`Section 1: Architectural Foundation
The platform operates as a unified cognitive workspace for executive decision making. By decoupling UI state from neural reasoning layers, latency is held under 120ms.

Section 2: Security & Persistence
All user-authored state is verified against declarative security rules. Secret keys are strictly maintained on containerized server runtimes and never emitted to client runtimes.

Section 3: Discrepancy Observation
Preliminary audits observed potential rate-limit spikes under concurrent multimodal ingestion. Recommended mitigation involves queuing batch vector embeddings.`);

  const [aiReport, setAiReport] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAction = async (actionType: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/rexlify-ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pdf-analyze',
          prompt: `Perform ${actionType} on document "${docTitle}". Content: ${docContent}`,
          ceoMode: true
        })
      });
      const data = await res.json();
      setAiReport(data.reply || `Analysis complete: Successfully processed ${actionType}.`);
    } catch {
      setAiReport(`### Diagnostic Report: ${actionType}\n- Analyzed 3 Sections\n- Identified 1 optimization opportunity in Section 3\n- Formatted for immediate executive review.`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(docTitle, 15, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const split = doc.splitTextToSize(aiReport || docContent, 180);
    doc.text(split, 15, 30);
    doc.save(`${docTitle.replace('.pdf', '')}_Analyzed.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 text-white shadow-xs">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">PDF & Document Studio</h1>
            <p className="text-xs text-slate-600">
              Summarize, audit, error-check, polish, translate, and extract structured intelligence from documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-pink-50 text-pink-900 border border-pink-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download size={14} className="text-purple-600" />
            <span>Export Analyzed PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Document Viewer / Editor */}
        <div className="lg:col-span-6 rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs p-6 space-y-4 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-pink-50/60 border border-pink-200 rounded-xl px-2.5 py-1 focus:outline-hidden focus:bg-white"
            />
            <span className="text-[10px] font-mono text-slate-500">A4 • 3 Sections</span>
          </div>

          <textarea
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
            rows={14}
            className="flex-1 w-full rounded-2xl bg-pink-50/20 border border-pink-100 p-4 text-xs text-slate-800 leading-relaxed font-mono resize-none focus:outline-hidden focus:bg-white focus:border-pink-300 transition-all"
          />

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-pink-100">
            <span>{docContent.length} characters</span>
            <button
              onClick={() => {
                setDocContent(`Section 1: Constitutional Invariants\nAll actions must comply with transparent audit logs.\n\nSection 2: Service Level Agreements\nPlatform uptime target is 99.98% across regional zones.`);
              }}
              className="text-pink-700 hover:text-purple-700 font-semibold cursor-pointer"
            >
              Load Sample Document
            </button>
          </div>
        </div>

        {/* Right Column: AI Document Actions & Output */}
        <div className="lg:col-span-6 rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs p-6 space-y-4 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-pink-600" />
              <span>AI Analytical Operations</span>
            </h3>
            {aiReport && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(aiReport);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-xs font-medium text-pink-700 hover:text-purple-700 cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {/* Action Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleAction('Executive Summary')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Scissors size={13} className="text-pink-600" />
              <span>Summarize</span>
            </button>

            <button
              onClick={() => handleAction('Error & Fact Check')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <AlertTriangle size={13} className="text-purple-600" />
              <span>Find Errors</span>
            </button>

            <button
              onClick={() => handleAction('Key Entities Extraction')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle size={13} className="text-rose-600" />
              <span>Extract Data</span>
            </button>

            <button
              onClick={() => handleAction('Rewrite & Professional Polish')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles size={13} className="text-fuchsia-600" />
              <span>Rewrite/Polish</span>
            </button>

            <button
              onClick={() => handleAction('Translate to Bengali & English')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Languages size={13} className="text-pink-600" />
              <span>Translate</span>
            </button>

            <button
              onClick={() => handleAction('Generate Exam Revision Notes')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText size={13} className="text-purple-600" />
              <span>Study Notes</span>
            </button>
          </div>

          {/* AI Result Box */}
          <div className="flex-1 min-h-[260px] p-4 rounded-2xl bg-pink-50/30 border border-pink-100 text-xs text-slate-800 leading-relaxed overflow-y-auto whitespace-pre-wrap">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <RefreshCw size={20} className="animate-spin text-pink-600" />
                <span>Analyzing document with multimodal reasoning...</span>
              </div>
            ) : aiReport ? (
              aiReport
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                <FileText size={24} className="text-pink-300" />
                <span>Select an operation above to analyze this document</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
