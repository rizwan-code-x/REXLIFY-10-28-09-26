import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Settings, Heart, Clock as ClockIcon, Video, Upload, ArrowRight, ShieldAlert } from 'lucide-react';
import { VideoCenterItem, UserAccount } from '../../types';

const fadeInUpVariants: any = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const DashboardPage: React.FC<{ videos: VideoCenterItem[], activeUser: UserAccount }> = ({ videos, activeUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'watch-later'>('profile');

  return (
    <div className="space-y-12 py-12 mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="text-left space-y-1">
          <h1 className="font-sora text-3xl font-extrabold text-white tracking-tight">
            User Dashboard
          </h1>
          <p className="text-gray-400 text-sm font-light">
            Manage your account, preferences, and saved media.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <motion.div 
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full lg:w-64 shrink-0 glassmorphic-card rounded-2xl p-4 space-y-2 h-fit"
        >
          <div className="flex flex-col items-center gap-3 p-4 mb-4 border-b border-white/5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-rose-500 p-0.5">
              <div className="w-full h-full bg-[#07080d] rounded-full flex items-center justify-center">
                <User className="text-gray-400" size={24} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-sora text-sm font-bold text-white">Default User</h3>
              <p className="font-mono text-[9px] text-[#22d3ee] tracking-widest uppercase">GUEST ACCOUNT</p>
            </div>
          </div>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Settings size={16} /> Manage Profile
          </button>
          
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'favorites' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Heart size={16} /> Saved Favorites
          </button>
          
          <button 
            onClick={() => setActiveTab('watch-later')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'watch-later' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ClockIcon size={16} /> Watch Later
          </button>

          <div className="pt-4 mt-4 border-t border-white/5">
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 transition-all">
              <span className="flex items-center gap-2"><Upload size={14} /> Upload</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Dynamic Content Area */}
        <motion.div 
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex-1 glassmorphic-card rounded-2xl p-8"
        >
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex items-center gap-2 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl">
                 <ShieldAlert size={16} />
                 <span className="text-xs font-mono font-bold tracking-widest uppercase">GUEST MODE: PROFILE EDITS ARE NOT PERSISTED</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Username</label>
                  <input type="text" disabled value="Default User" className="w-full bg-[#07080d] text-white text-xs px-4 py-3 rounded-xl border border-white/10 opacity-60" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Email Address</label>
                  <input type="text" disabled value="user@example.com" className="w-full bg-[#07080d] text-white text-xs px-4 py-3 rounded-xl border border-white/10 opacity-60" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Short Bio</label>
                <textarea disabled value="Exploring the future of digital architecture." className="w-full bg-[#07080d] text-white text-xs px-4 py-3 rounded-xl border border-white/10 opacity-60 h-24 resize-none" />
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
             <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <Heart size={32} className="text-gray-500 mb-4" />
                <h3 className="text-white font-sora font-semibold">No Favorites Yet</h3>
                <p className="text-xs text-gray-500 mt-1">Explore our applications and click the heart icon to save them here.</p>
             </div>
          )}

          {activeTab === 'watch-later' && (
             <div className="space-y-6">
                <h3 className="font-sora text-sm font-bold text-white border-b border-white/5 pb-3">Watch Later Queue</h3>
                <div className="space-y-4">
                  {videos.slice(0, 1).map(vid => (
                     <div key={vid.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer">
                        <div className="w-32 aspect-video bg-black rounded-lg relative overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
                           <Video className="text-gray-600" size={24} />
                        </div>
                        <div className="flex flex-col justify-center">
                           <h4 className="font-sora text-sm font-bold text-white leading-snug">{vid.title}</h4>
                           <span className="font-mono text-[9px] text-[#22d3ee] tracking-widest uppercase mt-1">{vid.category}</span>
                           <span className="text-[10px] text-gray-500 font-mono mt-2">{vid.duration}</span>
                        </div>
                     </div>
                  ))}
                </div>
             </div>
          )}
        </motion.div>
      </div>

    </div>
  );
};
