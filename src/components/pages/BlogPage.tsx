import React from 'react';
import { motion } from 'motion/react';
import { Clock, User } from 'lucide-react';
import { BlogItem } from '../../types';

const fadeInUpVariants: any = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const BlogPage: React.FC<{ blogPosts: BlogItem[] }> = ({ blogPosts }) => {
  return (
    <div className="space-y-12 py-12 mx-auto max-w-7xl px-4 md:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="text-left space-y-1">
          <h1 className="font-sora text-3xl font-extrabold text-white tracking-tight">
            Developer Blog
          </h1>
          <p className="text-gray-400 text-sm font-light">
            Insights, tutorials, and deep technical dives from the REXLIFY architecture team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {blogPosts.map((post) => (
          <motion.div 
            key={post.id}
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 p-6 glassmorphic-card rounded-2xl hover:border-cyan-500/20 transition-all group"
          >
            <div className="w-full sm:w-1/3 aspect-square sm:aspect-auto rounded-xl overflow-hidden relative shrink-0">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="w-full sm:w-2/3 flex flex-col justify-center space-y-4">
              <span className="font-mono text-[9px] text-rose-500 tracking-widest uppercase bg-rose-500/10 w-fit px-2 py-0.5 rounded border border-rose-500/20">
                {post.category}
              </span>
              
              <h3 className="font-sora text-xl font-bold text-white leading-snug group-hover:text-cyan-400 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-gray-400 text-xs font-light leading-relaxed line-clamp-3">
                {post.summary}
              </p>

              <div className="flex items-center gap-4 pt-2 text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                <div className="flex items-center gap-1.5">
                  <User size={12} className="text-[#fdba74]" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {post.readTime}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
