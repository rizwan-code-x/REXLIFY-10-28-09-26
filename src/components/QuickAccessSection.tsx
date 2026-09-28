/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Headphones, LifeBuoy, GraduationCap, Bot, Mic, ArrowRight, Mail, Sparkles } from 'lucide-react';
import { ActiveView } from './Navbar';
import { Interactive3DTiltCard } from './Interactive3DTiltCard';

interface QuickAccessSectionProps {
  setView: (view: ActiveView) => void;
  onOpenSaraMode?: (mode: 'customer-care' | 'help' | 'institute' | 'chat' | 'voice') => void;
}

export const QuickAccessSection: React.FC<QuickAccessSectionProps> = ({ setView, onOpenSaraMode }) => {
  const cards = [
    {
      id: 'customer-care',
      mode: 'customer-care' as const,
      title: 'Customer Care',
      titleBn: 'কাস্টমার কেয়ার',
      desc: 'Official support, contact & email desk',
      email: 'rexlifyofficialsupportteam@gmail.com',
      icon: Headphones,
      gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-400',
      glowColor: 'rgba(244, 63, 94, 0.25)',
      badge: 'Official Desk',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      actionView: 'customer-care' as ActiveView
    },
    {
      id: 'help-centre',
      mode: 'help' as const,
      title: 'Help Centre',
      titleBn: 'হেল্প সেন্টার',
      desc: 'Report issues, complaints & instant search',
      icon: LifeBuoy,
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-400',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      badge: 'Report & Search',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      actionView: 'help-centre' as ActiveView
    },
    {
      id: 'rexlify-institute',
      mode: 'institute' as const,
      title: 'Rexlify Institute',
      titleBn: 'রেপ্লিফাই ইনস্টিটিউট',
      desc: 'Course roadmap & certification programs',
      icon: GraduationCap,
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-400',
      glowColor: 'rgba(6, 182, 212, 0.25)',
      badge: 'Skill Roadmap',
      badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
      actionView: 'institute' as ActiveView
    },
    {
      id: 'sara-chat',
      mode: 'chat' as const,
      title: 'Chat with Sara AI',
      titleBn: 'সারা এআই চ্যাট',
      desc: 'Full conversational AI co-pilot',
      icon: Bot,
      gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-400',
      glowColor: 'rgba(168, 85, 247, 0.25)',
      badge: 'Full AI Agent',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      actionView: 'sara-chat' as ActiveView
    },
    {
      id: 'sara-voice',
      mode: 'voice' as const,
      title: 'Sara Voice Assistant',
      titleBn: 'সারা ভয়েস অ্যাসিস্ট্যান্ট',
      desc: 'Live interactive voice response',
      icon: Mic,
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-400',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      badge: 'Live Voice Mode',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      actionView: 'sara-voice' as ActiveView
    }
  ];

  const handleCardClick = (card: typeof cards[0]) => {
    if (onOpenSaraMode) {
      onOpenSaraMode(card.mode);
    }
    setView(card.actionView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-6xl my-10 space-y-4 text-left quick-access-container">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[10px] uppercase font-bold tracking-widest">
            <Sparkles size={12} className="text-amber-400" />
            QUICK ACCESS GATEWAY &bull; SARA AI CO-PILOT
          </div>
          <h3 className="font-sora text-xl sm:text-2xl font-bold text-white tracking-tight quick-access-heading">
            Ecosystem Portals &amp; Sara AI
          </h3>
        </div>
        <span className="text-xs font-mono text-gray-400 quick-access-sub">
          5 Sara AI Assistant Modes Integrated
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const IconComp = card.icon;
          return (
            <div key={card.id} className="h-full">
              <Interactive3DTiltCard
                maxTilt={10}
                scaleOnHover={1.03}
                glowColor={card.glowColor}
                className="h-full"
              >
                <div
                  onClick={() => handleCardClick(card)}
                  id={`quick-access-btn-${card.id}`}
                  className={`relative h-full bg-[#070614]/90 rounded-3xl p-5 border ${card.borderColor} backdrop-blur-xl transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer group hover:shadow-2xl overflow-hidden quick-access-card`}
                >
                  {/* Subtle top gradient glow */}
                  <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${card.gradient} pointer-events-none rounded-t-3xl`} />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-black transition-all quick-access-icon">
                        <IconComp size={22} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase font-bold border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-sora text-base font-bold text-white group-hover:text-rose-300 transition-colors leading-tight quick-access-title">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-sans mt-1 leading-snug quick-access-desc">
                        {card.desc}
                      </p>
                    </div>

                    {card.email && (
                      <div className="pt-2 flex items-center gap-1.5 text-[9px] font-mono text-rose-400 truncate">
                        <Mail size={11} className="shrink-0" />
                        <span className="truncate">{card.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono font-semibold text-gray-300 group-hover:text-white relative z-10 quick-access-link">
                    <span>Access Portal</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-rose-400" />
                  </div>
                </div>
              </Interactive3DTiltCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};
