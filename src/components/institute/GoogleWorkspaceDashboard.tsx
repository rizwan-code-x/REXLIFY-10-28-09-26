/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, FolderGit2, FileSpreadsheet, Calendar, StickyNote, 
  ExternalLink, ShieldCheck, Search, Globe
} from 'lucide-react';

export const GoogleWorkspaceDashboard: React.FC = () => {
  const googleServices = [
    {
      name: 'Google Search & Hub',
      desc: 'Official external search engine & web connectivity hub.',
      url: 'https://www.google.com',
      icon: <Globe className="text-blue-400" size={28} />,
      badge: 'External Gateway',
      gradient: 'from-blue-500/25 to-cyan-500/25',
      border: 'border-blue-500/30'
    },
    {
      name: 'Google Classroom',
      desc: 'Access live classes, lecture assignments, and announcements directly.',
      url: 'https://classroom.google.com',
      icon: <BookOpen className="text-cyan-400" size={28} />,
      badge: 'Active Classroom',
      gradient: 'from-cyan-500/25 to-teal-500/25',
      border: 'border-cyan-500/30'
    },
    {
      name: 'Google Drive Storage',
      desc: 'Secure cloud storage repository for all study materials and notes.',
      url: 'https://drive.google.com',
      icon: <FolderGit2 className="text-amber-400" size={28} />,
      badge: 'Cloud Repository',
      gradient: 'from-amber-500/25 to-yellow-500/25',
      border: 'border-amber-500/30'
    },
    {
      name: 'Google Sheets',
      desc: 'Spreadsheet suite for tracking milestones, attendance, and expenses.',
      url: 'https://sheets.google.com',
      icon: <FileSpreadsheet className="text-emerald-400" size={28} />,
      badge: 'Data Tracking',
      gradient: 'from-emerald-500/25 to-green-500/25',
      border: 'border-emerald-500/30'
    },
    {
      name: 'Google Calendar',
      desc: 'Schedule upcoming lectures, deadlines, and live lab evaluations.',
      url: 'https://calendar.google.com',
      icon: <Calendar className="text-purple-400" size={28} />,
      badge: 'Schedule Sync',
      gradient: 'from-purple-500/25 to-indigo-500/25',
      border: 'border-purple-500/30'
    },
    {
      name: 'Google Keep',
      desc: 'Capture quick micro-notes, reminders, and lecture takeaways.',
      url: 'https://keep.google.com',
      icon: <StickyNote className="text-rose-400" size={28} />,
      badge: 'Quick Scratchpad',
      gradient: 'from-rose-500/25 to-pink-500/25',
      border: 'border-rose-500/30'
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-8 max-w-6xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl bg-slate-900/60 border border-cyan-500/30 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
      >
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-white/10 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold mb-2">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>OFFICIAL GOOGLE EXTERNAL CONNECTIVITY HUB</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              Direct Google External Links
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Internal API synchronization has been deactivated. Connect directly via official Google external links below.
            </p>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>External Gateway Ready</span>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 relative z-10">
          {googleServices.map((service, idx) => (
            <a
              key={idx}
              href={service.url}
              target="_blank"
              rel="noreferrer"
              className={`group relative rounded-2xl p-6 bg-slate-950/70 border ${service.border} hover:border-cyan-400 transition-all duration-300 hover:scale-[1.02] shadow-xl flex flex-col justify-between`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`} />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    {service.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {service.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
                    <span>{service.name}</span>
                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {service.desc}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform relative z-10">
                <span>Connect Externally</span>
                <span>→</span>
              </div>
            </a>
          ))}
        </div>

      </motion.div>
    </section>
  );
};
