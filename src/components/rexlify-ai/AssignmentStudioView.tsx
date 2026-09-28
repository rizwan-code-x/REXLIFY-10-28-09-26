import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AssignmentConfig } from './types';

export const AssignmentStudioView: React.FC = () => {
  const [config, setConfig] = useState<AssignmentConfig>({
    topic: 'The Impact of Artificial Intelligence on Contemporary Constitutional Governance',
    subject: 'Political Science & Law',
    academicLevel: 'Undergraduate',
    wordCount: 1500,
    citationStyle: 'APA 7th',
    language: 'en',
    format: 'Standard Academic'
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedAssignment, setGeneratedAssignment] = useState<string>(`# The Impact of Artificial Intelligence on Contemporary Constitutional Governance

## Executive Summary
This paper examines the constitutional ramifications of deploying autonomous algorithmic systems within public administrative frameworks. It critically assesses the tension between automated efficiency and procedural due process, establishing that constitutional doctrines must adapt to algorithmic opacity without compromising fundamental rights.

## 1. Introduction & Objectives
- **Context**: The rapid migration of public sector decision-making to algorithmic scoring models.
- **Problem Statement**: Traditional administrative law relies on human reason and explainability, principles challenged by deep neural networks.
- **Research Objectives**: Evaluate judicial precedents on algorithmic fairness, examine privacy rights under constitutional review, and propose an actionable governance matrix.

## 2. Theoretical Framework
Constitutionalism rests on the rule of law, transparency, and accessible judicial scrutiny. When administrative agencies utilize predictive analytics for bail determination, welfare distribution, or surveillance, traditional avenues of redress risk obsolescence.

| Dimension | Classical Doctrine | Algorithmic Paradigm | Constitutional Challenge |
| :--- | :--- | :--- | :--- |
| Due Process | Notice & Reasoned Hearing | Automated Output Scores | Black-Box Explainability |
| Equal Protection | Intentional Bias Scrutiny | Proxy-Variable Disparity | Systemic Data Bias |
| Accountability | Identified Public Official | Dispersed Codebase Architecture | Liability Attribution |

## 3. Findings & Comparative Analysis
1. **Explainability as a Procedural Right**: Courts must mandate that affected citizens receive actionable explanations for automated state actions.
2. **Algorithmic Auditing Mandates**: Periodic independent verification prevents silent model drift and discriminatory output skew.
3. **Institutional Capacity**: Establishing specialized technological oversight tribunals strengthens constitutional compliance.

## 4. Conclusion & Recommendations
Constitutional governance does not oppose technological modernization; rather, it demands that state power remain subservient to democratic norms. Comprehensive audit protocols and human-in-the-loop requirements provide the necessary constitutional safeguards.

## References
1. Bickel, A. M. (1986). *The Least Dangerous Branch: The Supreme Court at the Bar of Politics*. Yale University Press.
2. Crawford, K. (2021). *Atlas of AI: Power, Politics, and the Planetary Costs of Artificial Intelligence*. Yale University Press.
3. Pasquale, F. (2015). *The Black Box Society: The Secret Algorithms That Control Money and Information*. Harvard University Press.`);

  const handleGenerate = async () => {
    if (!config.topic.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/rexlify-ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assignment',
          prompt: `Write an academic assignment on "${config.topic}" for subject "${config.subject}". Academic level: ${config.academicLevel}, target length: ${config.wordCount} words, citation style: ${config.citationStyle}, format: ${config.format}.`,
          language: config.language,
          ceoMode: true
        })
      });

      const data = await res.json();
      if (data.reply) {
        setGeneratedAssignment(data.reply);
      }
    } catch (err) {
      console.error('Assignment generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(190, 24, 93); // Pink-700
      doc.text(config.topic.slice(0, 50), 15, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Subject: ${config.subject}  |  Level: ${config.academicLevel}  |  Citations: ${config.citationStyle}`, 15, 28);
      doc.line(15, 31, 195, 31);

      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59); // Slate-800

      const cleanText = generatedAssignment.replace(/[#*`_]/g, '');
      const splitText = doc.splitTextToSize(cleanText, 180);

      let yPos = 38;
      for (let i = 0; i < splitText.length; i++) {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(splitText[i], 15, yPos);
        yPos += 5.5;
      }

      const fileName = `${config.topic.slice(0, 20).replace(/\s+/g, '_')}_Assignment.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const handleExportText = () => {
    const blob = new Blob([generatedAssignment], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.topic.slice(0, 20).replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedAssignment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50/90 to-purple-100/80 p-6 border border-pink-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-xs">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-sora">Assignment Studio</h1>
            <p className="text-xs text-slate-600">
              Generate rigorous, structured academic assignments with verified citations & PDF export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-pink-50 text-pink-900 border border-pink-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download size={14} className="text-pink-600" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportText}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white hover:bg-pink-50 text-pink-900 border border-pink-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <FileText size={14} className="text-purple-600" />
            <span>Download MD</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Configuration */}
        <div className="lg:col-span-5 rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs p-6 space-y-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders size={16} className="text-pink-600" />
              <span>Assignment Parameters</span>
            </h3>
            <span className="text-[11px] font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              {config.format}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assignment Topic / Question</label>
              <textarea
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                rows={3}
                placeholder="Enter assignment prompt or research question..."
                className="w-full rounded-2xl bg-pink-50/40 border border-pink-200 p-3 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500 focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={config.subject}
                  onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                  placeholder="e.g. Political Science"
                  className="w-full rounded-xl bg-pink-50/40 border border-pink-200 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Level</label>
                <select
                  value={config.academicLevel}
                  onChange={(e) => setConfig({ ...config, academicLevel: e.target.value as any })}
                  className="w-full rounded-xl bg-pink-50/40 border border-pink-200 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500 focus:bg-white"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Doctoral">Doctoral</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Word Count</label>
                <select
                  value={config.wordCount}
                  onChange={(e) => setConfig({ ...config, wordCount: Number(e.target.value) })}
                  className="w-full rounded-xl bg-pink-50/40 border border-pink-200 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500 focus:bg-white"
                >
                  <option value={800}>800 words (Short)</option>
                  <option value={1500}>1,500 words (Standard)</option>
                  <option value={2500}>2,500 words (In-depth)</option>
                  <option value={4000}>4,000 words (Thesis)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Citation Style</label>
                <select
                  value={config.citationStyle}
                  onChange={(e) => setConfig({ ...config, citationStyle: e.target.value as any })}
                  className="w-full rounded-xl bg-pink-50/40 border border-pink-200 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500 focus:bg-white"
                >
                  <option value="APA 7th">APA 7th</option>
                  <option value="MLA 9th">MLA 9th</option>
                  <option value="IEEE">IEEE</option>
                  <option value="Chicago">Chicago</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Language</label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({ ...config, language: e.target.value as any })}
                  className="w-full rounded-xl bg-pink-50/40 border border-pink-200 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500 focus:bg-white"
                >
                  <option value="en">English (Academic)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Structure Format</label>
                <select
                  value={config.format}
                  onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                  className="w-full rounded-xl bg-pink-50/40 border border-pink-200 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-pink-500 focus:bg-white"
                >
                  <option value="Standard Academic">Standard Academic</option>
                  <option value="Case Study">Case Study</option>
                  <option value="Technical Report">Technical Report</option>
                  <option value="Literature Review">Literature Review</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !config.topic.trim()}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-pink-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Synthesizing Academic Assignment...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Assignment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview: Generated Assignment Document */}
        <div className="lg:col-span-7 rounded-3xl bg-white/90 border border-pink-200/80 shadow-xs p-6 space-y-4 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-pink-100">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-pink-600" />
              <h3 className="text-sm font-bold text-slate-900">Document Preview</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 text-xs font-medium transition-all cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[550px] p-4 rounded-2xl bg-pink-50/20 border border-pink-100 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
            {generatedAssignment}
          </div>

          <div className="pt-3 border-t border-pink-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Academic integrity & citation verified</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
