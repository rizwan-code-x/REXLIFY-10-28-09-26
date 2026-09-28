/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from '../translations';

interface FAQProps {
  language: Language;
}

export const FAQ: React.FC<FAQProps> = ({ language }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = TRANSLATIONS[language];

  const faqItems = [
    { question: t.faqQ1, answer: t.faqA1 },
    { question: t.faqQ2, answer: t.faqA2 },
    { question: t.faqQ3, answer: t.faqA3 },
    { question: t.faqQ4, answer: t.faqA4 },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="space-y-12 py-12 border-t border-white/5"
      id="faq-schematics-section"
    >
      <div className="text-center space-y-4">
        <span className="font-mono text-xs tracking-[0.25em] text-[#be123c] uppercase font-bold flex items-center justify-center gap-1.5">
          <HelpCircle size={12} />
          {t.faqSubtitle}
        </span>
        <h2 className="font-sora text-3xl font-extrabold text-white tracking-tight">
          {t.faqTitle}
        </h2>
        <div className="h-0.5 w-16 bg-gradient-to-r from-[#be123c] to-[#fdba74] mx-auto rounded" />
      </div>

      <div className="max-w-3xl mx-auto space-y-4 px-2">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl border transition-all duration-300"
              style={{
                background: isOpen ? 'rgba(11, 6, 21, 0.55)' : 'rgba(3, 0, 20, 0.4)',
                borderColor: isOpen ? 'rgba(217, 119, 6, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isOpen ? '0 4px 20px rgba(217, 119, 6, 0.08)' : 'none'
              }}
            >
              <button
                onClick={() => handleToggle(index)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none cursor-pointer select-none"
              >
                <div className="flex items-start gap-3.5 pr-4">
                  <span className="p-1.5 rounded-lg bg-black/40 text-[#f59e0b] mt-0.5 shrink-0 flex items-center justify-center border border-[#d97706]/10">
                    <Info size={14} className="fill-current/5" />
                  </span>
                  <span className="font-sora font-bold text-sm md:text-base text-gray-200 hover:text-white transition-colors leading-snug">
                    {item.question}
                  </span>
                </div>
                <div className="shrink-0 p-1.5 rounded-full bg-white/5 text-gray-400">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pl-[4.2rem] text-xs font-mono text-gray-400 leading-relaxed border-t border-white/[0.03] pt-3.5 select-text">
                      <p className="whitespace-pre-line text-justify uppercase tracking-wide text-[10px]">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Embedded Golden & Black Transparent button to submit another ticket */}
      <div className="flex flex-col items-center justify-center pt-4">
        <div className="p-6 rounded-2xl bg-black/35 border border-white/5 max-w-xl text-center space-y-3 backdrop-blur-sm">
          <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
            ◆ Need a bespoke specification built? Connect directly with Rizwan RR ◆
          </p>
          <button
            onClick={() => {
              const contactBtn = document.getElementById('foot-nav-contact');
              if (contactBtn) contactBtn.click();
            }}
            className="golden-transparent-button px-5 py-2.5 rounded-xl font-mono text-[10.5px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <MessageSquare size={13} />
            Transmission Center
          </button>
        </div>
      </div>
    </motion.section>
  );
};
