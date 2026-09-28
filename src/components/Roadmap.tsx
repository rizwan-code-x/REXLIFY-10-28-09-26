import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Cpu, Sparkles, AlertCircle, Compass, 
  CheckCircle2, Flame, RefreshCw, Zap, Search, Target 
} from 'lucide-react';
import { Project } from '../types';

interface RoadmapProps {
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  renderSearchBar: (placeholder: string) => React.ReactNode;
}

export const Roadmap: React.FC<RoadmapProps> = ({
  projects,
  searchQuery,
  setSearchQuery,
  renderSearchBar
}) => {

  const filteredProjects = projects.filter((proj) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      proj.name.toLowerCase().includes(query) ||
      proj.category.toLowerCase().includes(query) ||
      proj.description.toLowerCase().includes(query) ||
      proj.status.toLowerCase().includes(query)
    );
  });

  // Get status color coding
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Released':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-400 shadow-emerald-500/40',
          gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
          icon: <CheckCircle2 size={13} className="text-emerald-400 animate-pulse" />
        };
      case 'Testing':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          dot: 'bg-amber-400 shadow-amber-500/40',
          gradient: 'from-amber-500 via-orange-500 to-rose-500',
          icon: <RefreshCw size={13} className="text-amber-400 animate-spin-slow" />
        };
      case 'Development':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          dot: 'bg-rose-400 shadow-rose-500/40',
          gradient: 'from-rose-500 via-fuchsia-500 to-purple-500',
          icon: <Cpu size={13} className="text-rose-400" />
        };
      case 'Planning':
      case 'Future Vision':
      default:
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
          dot: 'bg-cyan-400 shadow-cyan-500/40',
          gradient: 'from-cyan-500 via-blue-500 to-teal-500',
          icon: <Target size={13} className="text-cyan-400 animate-pulse" />
        };
    }
  };

  return (
    <div className="space-y-16 py-12">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div className="text-left space-y-2">
          <span className="font-mono text-xs tracking-[0.25em] text-[#be123c] uppercase font-bold block">
            Ecosystem Pipeline & Targets
          </span>
          <h1 className="font-sora text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Ecosystem Roadmap
          </h1>
          <p className="text-gray-400 text-sm font-light max-w-2xl leading-relaxed">
            Monitor development phases, milestone completions, and future framework projections for NeuraX, Sifra AI, and the REXLIFY environment.
          </p>
        </div>
        <div className="w-full md:w-auto shrink-0">
          {renderSearchBar("Search active milestones...")}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/5 bg-white/[0.01]">
          <Search className="text-gray-500 mx-auto animate-pulse" size={32} />
          <div className="space-y-1 max-w-md mx-auto">
            <p className="font-sora font-semibold text-white">No active targets found</p>
            <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
              No development blocks resolved matching "{searchQuery}"
            </p>
          </div>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-xs font-mono text-rose-400 hover:text-white transition-colors uppercase tracking-widest font-bold"
          >
            Reset query filter
          </button>
        </div>
      ) : (
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Vertical central colorful point-to-point path line */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-rose-500 via-amber-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.2)] opacity-80" />

          {/* List of Milestones */}
          <div className="space-y-16">
            {filteredProjects.map((proj, idx) => {
              const isEven = idx % 2 === 0;
              const config = getStatusConfig(proj.status);

              return (
                <div key={proj.id} className="relative flex flex-col md:flex-row items-stretch">
                  
                  {/* Point-to-point connection node bead positioned perfectly along the path */}
                  <div className="absolute left-6 md:left-1/2 top-10 -translate-x-1/2 z-10 flex items-center justify-center">
                    <span className="relative flex h-6 w-6">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-35 ${config.dot}`} />
                      <span className={`relative inline-flex rounded-full h-6 w-6 border-4 border-[#07080d] items-center justify-center ${config.dot}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    </span>
                  </div>

                  {/* Left Column Spacer/Grid container for desktop placement */}
                  <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:pr-12 md:text-right text-left' : 'md:order-2 md:pl-12 text-left'}`}>
                    
                    {/* Entrance animations driven by scroll in motion */}
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -40 : 40, y: 15 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.65, delay: idx * 0.05, ease: "easeOut" }}
                      className="glassmorphic-card p-6 md:p-8 rounded-2xl border border-white/5 hover:border-white/10 hover:shadow-[0_0_40px_rgba(244,63,94,0.06)] hover:scale-[1.01] transition-all duration-300 group relative flex flex-col justify-between h-full"
                    >
                      {/* Background Soft Glow matching milestone theme */}
                      <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none`} />

                      {/* Top metadata tags bar */}
                      <div className={`flex flex-wrap items-center gap-2.5 text-[10px] font-mono leading-none ${isEven ? 'md:justify-end justify-start' : 'justify-start'}`}>
                        <span className="text-gray-500 uppercase">{proj.category}</span>
                        <span className="text-gray-600">&bull;</span>
                        <span className="text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          {proj.targetRelease}
                        </span>
                      </div>

                      {/* Main Header / title */}
                      <div className="space-y-2.5 mt-3.5">
                        <div className={`flex items-center gap-2.5 ${isEven ? 'md:flex-row-reverse' : 'flex-row'}`}>
                          <div className={`px-2 py-1 rounded text-[8.5px] font-mono tracking-widest uppercase font-extrabold border flex items-center gap-1.5 ${config.bg}`}>
                            {config.icon}
                            {proj.status}
                          </div>
                        </div>

                        <h3 className="font-sora text-lg md:text-xl font-extrabold text-white group-hover:text-rose-400 transition-colors duration-200">
                          {proj.name}
                        </h3>
                        
                        <p className="text-gray-400 text-xs font-light leading-relaxed">
                          {proj.description}
                        </p>
                      </div>

                      {/* High precision execution progression bar */}
                      <div className="space-y-2 mt-6 pt-5 border-t border-white/5">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-gray-500 uppercase font-bold">Execution progress</span>
                          <span className="font-bold text-rose-400 leading-none">{proj.progress}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${proj.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                            className={`bg-gradient-to-r ${config.gradient} h-full rounded-full`} 
                          />
                        </div>
                      </div>

                      {/* Admin/Developer diagnostic sub notes */}
                      {proj.notes && (
                        <div className={`mt-5 p-3 rounded-xl bg-black/40 border border-white/5 text-[10.5px] font-mono leading-relaxed text-gray-500 text-left relative overflow-hidden`}>
                          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-rose-500/40" />
                          <span className="text-slate-400 block font-bold text-[8.5px] uppercase tracking-wider mb-0.5">DEV DIRECTIVES</span>
                          {proj.notes}
                        </div>
                      )}
                    </motion.div>

                  </div>

                  {/* Spacer helper column for even/odd placement on wide grids */}
                  <div className={`hidden md:block w-1/2 ${isEven ? 'md:order-2' : ''}`} />

                </div>
              );
            })}
          </div>

          {/* Vertical scroll instruction indicator */}
          <div className="flex justify-center items-center gap-2 font-mono text-[8.5px] text-gray-500 uppercase tracking-widest pt-12 animate-pulse select-none">
            <span className="inline-block w-4 h-px bg-gray-700" />
            <span>End of current architectural index</span>
            <span className="inline-block w-4 h-px bg-gray-700" />
          </div>

        </div>
      )}

    </div>
  );
};
