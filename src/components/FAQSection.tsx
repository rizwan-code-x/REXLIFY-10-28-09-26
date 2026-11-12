/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ThumbsUp, 
  Sparkles, 
  MessageSquare, 
  Check, 
  Filter 
} from 'lucide-react';
import { FAQItem } from '../types';
import { useToast } from '../context/ToastContext';

interface FAQSectionProps {
  faqs: FAQItem[];
  onVoteHelpful?: (faqId: string) => void;
  onOpenContact?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ 
  faqs, 
  onVoteHelpful,
  onOpenContact 
}) => {
  const { success } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(faqs[0]?.id || null);
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      faq.question.toLowerCase().includes(q) || 
      faq.answer.toLowerCase().includes(q) || 
      faq.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleVote = (faqId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedIds[faqId]) return;

    setVotedIds((prev) => ({ ...prev, [faqId]: true }));
    if (onVoteHelpful) {
      onVoteHelpful(faqId);
    }
    success('Feedback Recorded', 'Thank you for marking this answer as helpful!');
  };

  // Substring highlight helper
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-rose-500/30 text-rose-300 font-bold px-1 rounded">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <section id="faq-section-container" className="w-full max-w-5xl mx-auto py-12 px-4 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">
          <HelpCircle size={14} className="animate-pulse" />
          KNOWLEDGE BASE & SUPPORT
        </div>
        <h2 className="font-sora font-extrabold text-3xl md:text-4xl text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-400 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Find answers to common questions about Sifra AI, image analysis tools, authentication, APK downloads, and security policies.
        </p>
      </div>

      {/* Controls: Search Bar & Categories */}
      <div className="space-y-4">
        
        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center bg-[#050215] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all">
            <Search size={18} className="text-gray-500 shrink-0 mr-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or keywords..."
              className="bg-transparent text-white text-xs md:text-sm placeholder-gray-500 w-full outline-none border-none font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-mono text-gray-500 hover:text-white px-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3 pt-4">
        {filteredFaqs.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-white/10 bg-black/40 text-center space-y-3">
            <Filter size={32} className="mx-auto text-gray-600" />
            <p className="text-sm font-sora text-gray-400 font-bold">No questions matched your search criteria.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`faq-card-item rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#060318] border-emerald-500/40 shadow-xl shadow-emerald-500/5'
                    : 'bg-[#03010c] border-white/10 hover:border-white/20'
                }`}
              >
                {/* Header Toggle */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="faq-category-badge px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase shrink-0">
                      {faq.category}
                    </span>
                    <h3 className="faq-question-text font-sora text-sm md:text-base font-semibold text-white leading-tight">
                      {highlightText(faq.question, searchQuery)}
                    </h3>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 text-gray-400 shrink-0">
                    {isOpen ? <ChevronUp size={16} className="text-emerald-400" /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Collapsible Answer Body */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4 animate-fadeIn">
                    <p className="faq-answer-text text-xs md:text-sm text-gray-300 font-sora font-light leading-relaxed">
                      {highlightText(faq.answer, searchQuery)}
                    </p>

                    {/* Footer Actions / Voting */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[10px] font-mono text-gray-500">
                        Was this answer helpful?
                      </span>

                      <button
                        onClick={(e) => handleVote(faq.id, e)}
                        disabled={votedIds[faq.id]}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                          votedIds[faq.id]
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-emerald-500/30'
                        }`}
                      >
                        {votedIds[faq.id] ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            Helpful ({(faq.helpfulCount || 0) + 1})
                          </>
                        ) : (
                          <>
                            <ThumbsUp size={12} />
                            Helpful ({faq.helpfulCount || 0})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help CTA */}
      <div />

    </section>
  );
};
