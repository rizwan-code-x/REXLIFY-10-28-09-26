/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ClickPulse {
  id: string;
  x: number;
  y: number;
  color: string;
  maxRadius: number;
}

interface AmbientNode {
  id: string;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  opacity: number;
}

export const AmbientBackground: React.FC<{ isNeonTheme?: boolean }> = ({ isNeonTheme = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowLayerRef = useRef<HTMLDivElement>(null);

  // Target and smoothed mouse coordinates (0 to 1 normalized & pixel coordinates)
  const targetPos = useRef({ x: 0.5, y: 0.35 });
  const smoothedPos = useRef({ x: 0.5, y: 0.35 });

  const [clickPulses, setClickPulses] = useState<ClickPulse[]>([]);
  const [nodes, setNodes] = useState<AmbientNode[]>([]);
  const rafId = useRef<number | null>(null);

  // Initialize subtle ambient nodes (reduced count for smooth 60fps)
  useEffect(() => {
    const palette = isNeonTheme
      ? ['rgba(124, 58, 237, 0.15)', 'rgba(219, 39, 119, 0.12)', 'rgba(14, 165, 233, 0.15)']
      : [
          'rgba(244, 63, 94, 0.12)',   // subtle rose
          'rgba(217, 119, 6, 0.10)',   // subtle amber
          'rgba(56, 189, 248, 0.12)',  // subtle sky/cyan
          'rgba(168, 85, 247, 0.10)',  // subtle violet
        ];

    const initialNodes: AmbientNode[] = Array.from({ length: 14 }).map((_, i) => {
      const baseX = Math.random() * 100;
      const baseY = Math.random() * 100;
      return {
        id: `node-${i}`,
        baseX,
        baseY,
        size: Math.random() * 2 + 1,
        color: palette[Math.floor(Math.random() * palette.length)],
        duration: Math.random() * 14 + 18,
        delay: Math.random() * -15,
        opacity: Math.random() * 0.35 + 0.15,
      };
    });

    setNodes(initialNodes);
  }, [isNeonTheme]);

  // High-performance smooth tracking without triggering React component re-renders
  useEffect(() => {
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const w = window.innerWidth || 1920;
      const h = window.innerHeight || 1080;

      targetPos.current.x = Math.max(0, Math.min(1, clientX / w));
      targetPos.current.y = Math.max(0, Math.min(1, clientY / h));
    };

    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const clickX = e.clientX;
      const clickY = e.clientY;

      const pulseColors = isNeonTheme
        ? ['rgba(124, 58, 237, 0.25)', 'rgba(219, 39, 119, 0.2)']
        : ['rgba(244, 63, 94, 0.18)', 'rgba(56, 189, 248, 0.18)', 'rgba(217, 119, 6, 0.15)'];

      const newPulse: ClickPulse = {
        id: `pulse-${Date.now()}-${Math.random()}`,
        x: clickX,
        y: clickY,
        color: pulseColors[Math.floor(Math.random() * pulseColors.length)],
        maxRadius: Math.random() * 80 + 160,
      };

      setClickPulses((prev) => [...prev.slice(-3), newPulse]);
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });

    // Native DOM style updates via requestAnimationFrame - bypasses React re-render cycle completely
    const animate = () => {
      const lerp = 0.05;
      smoothedPos.current.x += (targetPos.current.x - smoothedPos.current.x) * lerp;
      smoothedPos.current.y += (targetPos.current.y - smoothedPos.current.y) * lerp;

      if (glowLayerRef.current) {
        const xPct = (smoothedPos.current.x * 100).toFixed(1);
        const yPct = (smoothedPos.current.y * 100).toFixed(1);
        glowLayerRef.current.style.background = `radial-gradient(600px circle at ${xPct}% ${yPct}%, rgba(99, 102, 241, 0.05) 0%, rgba(56, 189, 248, 0.03) 30%, transparent 70%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('click', onClick);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isNeonTheme]);

  // Clean up finished click pulses
  useEffect(() => {
    if (clickPulses.length === 0) return;
    const timer = setTimeout(() => {
      setClickPulses((prev) => prev.slice(1));
    }, 1200);
    return () => clearTimeout(timer);
  }, [clickPulses]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Interactive Cursor-Responsive Ambient Spotlight (Updated directly on DOM, zero React re-renders) */}
      {!isNeonTheme && (
        <div
          ref={glowLayerRef}
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out z-0"
          style={{ willChange: 'background' }}
        />
      )}

      {/* 2. Deep Fluid Ambient Atmospheric Drift Luminaries (Hardware accelerated, zero blur filter overhead) */}
      {!isNeonTheme && (
        <>
          {/* Top-Left Ambient Luminary */}
          <div
            className="absolute top-[-5%] left-[5%] w-[450px] h-[450px] rounded-full pointer-events-none -z-10 gpu-accelerated"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(99, 102, 241, 0.02) 45%, transparent 70%)',
            }}
          />

          {/* Bottom-Right Ambient Luminary */}
          <div
            className="absolute bottom-[-5%] right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none -z-10 gpu-accelerated"
            style={{
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, rgba(244, 63, 94, 0.02) 45%, transparent 70%)',
            }}
          />
        </>
      )}

      {/* 3. Click / Interaction Ambient Shockwave Pulses */}
      <AnimatePresence>
        {clickPulses.map((pulse) => (
          <motion.div
            key={pulse.id}
            initial={{
              left: pulse.x,
              top: pulse.y,
              width: 0,
              height: 0,
              opacity: 0.5,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              width: pulse.maxRadius * 2,
              height: pulse.maxRadius * 2,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${pulse.color} 0%, transparent 70%)`,
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        ))}
      </AnimatePresence>

      {/* 4. Minimalist Ambient Luminous Micro-Motes (Static / Lightweight CSS rendering for smooth 60fps) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute rounded-full pointer-events-none transition-opacity duration-1000"
            style={{
              left: `${node.baseX}%`,
              top: `${node.baseY}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              backgroundColor: node.color,
              opacity: node.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};
