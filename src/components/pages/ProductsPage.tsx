import React from 'react';
import { motion } from 'motion/react';
import { Layers, Star, Cpu, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { ProductItem } from '../../types';
import { NeuraxLogo, SifraLogo, NooraxLogo } from '../Logo';

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const ProductsPage: React.FC<{ products: ProductItem[] }> = () => {
  const coreProducts = [
    {
      id: 'neurax-core',
      name: 'NeuraX Core AI',
      category: 'Autonomous NPU Cognitive Engine',
      logo: 'neurax',
      status: 'Production Architecture',
      rating: 5.0,
      description: 'Zero-telemetry client-side neural processing engine optimized for local AI computation, offline code synthesis, and intelligent automation.',
      specs: [
        { label: 'Latency', value: '< 12ms Edge Execution' },
        { label: 'Architecture', value: 'Local Small Language Model (SLM)' },
        { label: 'Privacy', value: '100% On-Device / Zero Cloud Logging' }
      ]
    },
    {
      id: 'sifra-ai',
      name: 'Sifra AI Enterprise',
      category: 'Autonomous Agentic Assistant',
      logo: 'sifra',
      status: 'Active Deployment',
      rating: 4.9,
      description: 'Privacy-first intelligent software engineering co-pilot equipped with proactive debugging workflows, live schema validation, and secure cloud synthesis.',
      specs: [
        { label: 'Latency', value: 'Real-time Streaming Matrix' },
        { label: 'Architecture', value: 'Multi-Role Cognitive Agent' },
        { label: 'Integrations', value: 'Gemini 2.5 Flash + TypeScript Runtimes' }
      ]
    },
    {
      id: 'noorax-vision',
      name: 'NOORAX AI Vision',
      category: 'Multimodal Neural Vision Core',
      logo: 'noorax',
      status: 'Active Beta v1.4',
      rating: 4.8,
      description: 'High-throughput visual decomposition engine providing real-time screenshot-to-code compilation, neural optical character recognition, and spatial UI analysis.',
      specs: [
        { label: 'Latency', value: '< 45ms Image Inference' },
        { label: 'Architecture', value: 'Multimodal Spatial Perception' },
        { label: 'Capabilities', value: 'Architecture OCR & Visual Code Extraction' }
      ]
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-10 lg:px-16 py-12 space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono tracking-widest uppercase">
            <Layers size={12} className="text-purple-400" />
            <span>View-Only Architecture Overview</span>
          </div>
          <h1 className="font-sora text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Dashboard: Flagship Digital Architectures
          </h1>
          <p className="text-gray-400 text-sm font-light max-w-2xl">
            Explore verified software architectures, cognitive neural engines, and multimodal intelligence systems developed by Rizwan RR.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {coreProducts.map((prod) => (
          <motion.div 
            key={prod.id}
            variants={fadeInUpVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-[#05050f]/90 rounded-[2.5rem] border border-white/10 p-8 flex flex-col justify-between hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] transition-all duration-500 relative overflow-hidden group space-y-6"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                  {prod.logo === 'neurax' && <NeuraxLogo size={36} />}
                  {prod.logo === 'sifra' && <SifraLogo size={36} />}
                  {prod.logo === 'noorax' && <NooraxLogo size={36} />}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase tracking-widest">
                    {prod.status}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                    <Star size={11} className="fill-amber-400" />
                    <span>{prod.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[10px] text-pink-400 tracking-widest uppercase font-bold block">
                  {prod.category}
                </span>
                <h3 className="font-sora text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {prod.name}
                </h3>
                <p className="text-gray-400 text-xs font-light leading-relaxed pt-1">
                  {prod.description}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-6 border-t border-white/10 font-mono text-[11px]">
              {prod.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                  <span className="text-gray-400">{spec.label}:</span>
                  <span className="text-purple-300 font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

