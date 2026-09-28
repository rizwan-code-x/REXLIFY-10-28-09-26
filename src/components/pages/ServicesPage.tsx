import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Shield, Globe, Smartphone, Megaphone, Palette, Cloud, GraduationCap, Workflow, Codepen, Cpu } from 'lucide-react';
import { ServiceItem } from '../../types';

const iconMap: Record<string, any> = {
  Cpu, Globe, Smartphone, Megaphone, Palette, Cloud, Shield, GraduationCap, Workflow, Codepen
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const ServicesPage: React.FC<{ setView: (view: string) => void, services: ServiceItem[] }> = ({ setView, services }) => {
  return (
    <div className="space-y-12 py-12 mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="text-left space-y-1">
          <h1 className="font-sora text-3xl font-extrabold text-white tracking-tight">
            Digital Services
          </h1>
          <p className="text-gray-400 text-sm font-light">
            Comprehensive technology solutions engineered for the future.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((srv) => {
          const IconComponent = iconMap[srv.iconName] || Cpu;
          return (
            <motion.div 
              key={srv.id}
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="glassmorphic-card p-8 rounded-2xl flex flex-col justify-between hover:scale-[1.01] hover:border-rose-500/20 transition-all group"
            >
              <div className="space-y-6">
                <div className="p-3 bg-cyan-500/10 w-fit rounded-xl text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-900/10">
                  <IconComponent size={28} />
                </div>
                
                <h3 className="font-sora text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {srv.title}
                </h3>
                
                <p className="text-gray-400 text-xs font-light leading-relaxed">
                  {srv.description}
                </p>

                <ul className="space-y-2 pt-2">
                  {srv.features.slice(0, 3).map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-500">
                      <span className="text-[#be123c] mt-0.5">•</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setView('contact')}
                  className="text-xs font-bold tracking-wider uppercase text-white hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Learn More
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
