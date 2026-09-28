import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ChatMarkdownProps {
  content: string;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ content }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Parse markdown blocks (code blocks, tables, headers, lists, quotes, paragraphs)
  const renderFormattedBlocks = () => {
    // Split by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, partIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const language = firstLine && !firstLine.includes(' ') ? firstLine : 'code';
        const codeText = (language !== 'code' ? lines.slice(1) : lines).join('\n');

        return (
          <div key={partIdx} className="my-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 overflow-hidden shadow-md">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/60 text-xs text-slate-400 font-mono">
              <span className="uppercase text-[11px] font-semibold tracking-wider text-pink-400">{language}</span>
              <button
                onClick={() => handleCopyCode(codeText, partIdx)}
                className="flex items-center gap-1 text-[11px] hover:text-white transition-colors cursor-pointer"
              >
                {copiedCodeIdx === partIdx ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-pink-100">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Check for Markdown table
      if (part.includes('|') && part.includes('\n')) {
        const lines = part.trim().split('\n');
        const isTable = lines.some(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
        if (isTable) {
          const tableLines: string[] = [];
          const otherLines: string[] = [];
          let insideTable = false;

          lines.forEach(l => {
            if (l.trim().startsWith('|') && l.trim().endsWith('|')) {
              insideTable = true;
              tableLines.push(l);
            } else {
              if (insideTable) {
                // table finished
                otherLines.push(l);
              } else {
                otherLines.push(l);
              }
            }
          });

          if (tableLines.length >= 2) {
            const headerCols = tableLines[0]
              .split('|')
              .filter((_, i, arr) => i > 0 && i < arr.length - 1)
              .map(c => c.trim());
            
            // Filter out separator line |---|---|
            const bodyLines = tableLines.slice(2);

            return (
              <div key={partIdx} className="my-3 space-y-2">
                <div className="overflow-x-auto rounded-2xl border border-pink-200/90 shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-pink-100/70 text-slate-900 font-bold border-b border-pink-200">
                      <tr>
                        {headerCols.map((h, i) => (
                          <th key={i} className="px-3.5 py-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-100 bg-white">
                      {bodyLines.map((row, rowIdx) => {
                        const cols = row
                          .split('|')
                          .filter((_, i, arr) => i > 0 && i < arr.length - 1)
                          .map(c => c.trim());
                        return (
                          <tr key={rowIdx} className="hover:bg-pink-50/50 transition-colors">
                            {cols.map((col, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2 font-normal leading-relaxed">{col}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {otherLines.length > 0 && (
                  <div className="text-slate-800 leading-relaxed">
                    {renderStandardText(otherLines.join('\n'))}
                  </div>
                )}
              </div>
            );
          }
        }
      }

      return (
        <div key={partIdx} className="text-slate-800 leading-relaxed">
          {renderStandardText(part)}
        </div>
      );
    });
  };

  const renderStandardText = (text: string) => {
    const lines = text.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***') {
        return <hr key={idx} className="my-3 border-t border-pink-200/80" />;
      }

      // Headers
      if (trimmed.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-900 font-sora mt-3 mb-1 text-pink-900">
            {formatInline(trimmed.slice(5))}
          </h4>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-slate-900 font-sora mt-4 mb-2 text-slate-900">
            {formatInline(trimmed.slice(4))}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg font-bold text-slate-900 font-sora mt-5 mb-2 pb-1 border-b border-pink-100 text-slate-900">
            {formatInline(trimmed.slice(3))}
          </h2>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={idx} className="text-xl font-bold text-slate-900 font-sora mt-5 mb-3 text-pink-700">
            {formatInline(trimmed.slice(2))}
          </h1>
        );
      }

      // Blockquotes / Callout Mnemonic
      if (trimmed.startsWith('> ')) {
        return (
          <div key={idx} className="my-2 p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-500 text-slate-800 text-xs italic shadow-2xs">
            {formatInline(trimmed.slice(2))}
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
            <span className="leading-relaxed">{formatInline(trimmed.slice(2))}</span>
          </div>
        );
      }

      // Numbered items: 1. 2. etc
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-sm text-slate-700">
            <span className="font-bold text-pink-700 text-xs shrink-0 w-4">{numMatch[1]}.</span>
            <span className="leading-relaxed">{formatInline(numMatch[2])}</span>
          </div>
        );
      }

      // Empty line spacing
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Normal paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1">
          {formatInline(line)}
        </p>
      );
    });
  };

  const formatInline = (str: string) => {
    // Bold: **text**
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((chunk, i) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{chunk.slice(2, -2)}</strong>;
      }
      // Inline code: `code`
      const codeParts = chunk.split(/(`.*?`)/g);
      return codeParts.map((subChunk, j) => {
        if (subChunk.startsWith('`') && subChunk.endsWith('`')) {
          return (
            <code key={`${i}-${j}`} className="px-1.5 py-0.5 rounded-md bg-pink-50 border border-pink-200 text-pink-700 font-mono text-[11px]">
              {subChunk.slice(1, -1)}
            </code>
          );
        }
        return subChunk;
      });
    });
  };

  return <div className="space-y-1">{renderFormattedBlocks()}</div>;
};
