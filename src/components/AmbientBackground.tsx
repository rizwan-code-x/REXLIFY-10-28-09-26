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

  // Target and smoothed mouse coordinates (0 to 1 normalized & pixel coordinates)
  const targetPos = useRef({ x: 0.5, y: 0.35, px: 0, py: 0 });
  const smoothedPos = useRef({ x: 0.5, y: 0.35, px: 0, py: 0 });
  const [interactiveGlowStyle, setInteractiveGlowStyle] = useState<{
    x: number;
    y: number;
    intensity: number;
  }>({
    x: 50,
    y: 35,
    intensity: 1,
  });

  const [clickPulses, setClickPulses] = useState<ClickPulse[]>([]);
  const [nodes, setNodes] = useState<AmbientNode[]>([]);
  const rafId = useRef<number | null>(null);

  // Initialize subtle ambient nodes
  useEffect(() => {
    const palette = isNeonTheme
      ? ['rgba(124, 58, 237, 0.15)', 'rgba(219, 39, 119, 0.12)', 'rgba(14, 165, 233, 0.15)']
      : [
          'rgba(244, 63, 94, 0.15)',   // subtle rose
          'rgba(217, 119, 6, 0.12)',   // subtle amber
          'rgba(56, 189, 248, 0.14)',  // subtle sky/cyan
          'rgba(168, 85, 247, 0.12)',  // subtle violet
          'rgba(255, 255, 255, 0.18)', // subtle starlight
        ];

    const initialNodes: AmbientNode[] = Array.from({ length: 22 }).map((_, i) => {
      const baseX = Math.random() * 100;
      const baseY = Math.random() * 100;
      return {
        id: `node-${i}`,
        baseX,
        baseY,
        size: Math.random() * 2.2 + 0.8,
        color: palette[Math.floor(Math.random() * palette.length)],
        duration: Math.random() * 18 + 22,
        delay: Math.random() * -20,
        opacity: Math.random() * 0.4 + 0.2,
      };
    });

    setNodes(initialNodes);
  }, [isNeonTheme]);

  // High-performance smooth 60/120fps tracking loop with lerp
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        targetPos.current.px = rect.width * 0.5;
        targetPos.current.py = rect.height * 0.35;
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      targetPos.current = {
        x: normX,
        y: normY,
        px: clientX - rect.left,
        py: clientY - rect.top,
      };
    };

    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const pulseColors = isNeonTheme
        ? ['rgba(124, 58, 237, 0.3)', 'rgba(219, 39, 119, 0.25)', 'rgba(14, 165, 233, 0.3)']
        : ['rgba(244, 63, 94, 0.22)', 'rgba(56, 189, 248, 0.22)', 'rgba(217, 119, 6, 0.18)', 'rgba(168, 85, 247, 0.2)'];

      const newPulse: ClickPulse = {
        id: `pulse-${Date.now()}-${Math.random()}`,
        x: clickX,
        y: clickY,
        color: pulseColors[Math.floor(Math.random() * pulseColors.length)],
        maxRadius: Math.random() * 120 + 220,
      };

      setClickPulses((prev) => [...prev.slice(-6), newPulse]);
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('click', onClick);

    // Lerp animation frame loop
    let lastRenderTime = 0;
    const animate = (time: number) => {
      // Lerp factor
      const lerp = 0.055;
      smoothedPos.current.x += (targetPos.current.x - smoothedPos.current.x) * lerp;
      smoothedPos.current.y += (targetPos.current.y - smoothedPos.current.y) * lerp;
      smoothedPos.current.px += (targetPos.current.px - smoothedPos.current.px) * lerp;
      smoothedPos.current.py += (targetPos.current.py - smoothedPos.current.py) * lerp;

      // Throttle React state update to ~30-40fps for high efficiency while keeping silky smoothness
      if (time - lastRenderTime > 20) {
        lastRenderTime = time;
        setInteractiveGlowStyle({
          x: smoothedPos.current.x * 100,
          y: smoothedPos.current.y * 100,
          intensity: 1,
        });
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateDimensions);
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
    }, 1400);
    return () => clearTimeout(timer);
  }, [clickPulses]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none"
      style={{ willChange: 'transform' }}
    >
      {/* 1. Subtle Procedural Ambient Light Noise Texture (High-End Tactile Film Grain) */}
      <svg
        className="fixed inset-0 w-full h-full opacity-[0.038] mix-blend-overlay pointer-events-none z-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="rexlify-ambient-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#rexlify-ambient-noise)" />
      </svg>

      {/* 2. Interactive Cursor-Responsive Ambient Spotlight (Smooth Dynamic Follow) */}
      {!isNeonTheme && (
        <div
          className="absolute -inset-[300px] pointer-events-none transition-opacity duration-700 ease-out z-0"
          style={{
            background: `
              radial-gradient(
                700px circle at ${interactiveGlowStyle.x}% ${interactiveGlowStyle.y}%,
                rgba(99, 102, 241, 0.075) 0%,
                rgba(56, 189, 248, 0.045) 25%,
                rgba(244, 63, 94, 0.025) 50%,
                transparent 75%
              )
            `,
            willChange: 'background',
          }}
        />
      )}

      {/* 3. Deep Fluid Ambient Atmospheric Drift Luminaries (Organic studio depth) */}
      {!isNeonTheme && (
        <>
          {/* Top-Left Ambient Luminary */}
          <div
            className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 pointer-events-none animate-pulse -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.04) 55%, transparent 75%)',
              animationDuration: '14s',
              transform: `translate3d(${(interactiveGlowStyle.x - 50) * 0.15}px, ${(interactiveGlowStyle.y - 50) * 0.15}px, 0)`,
              transition: 'transform 0.4s ease-out',
            }}
          />

          {/* Bottom-Right Ambient Luminary */}
          <div
            className="absolute bottom-[-10%] right-[5%] w-[650px] h-[650px] rounded-full blur-[160px] opacity-35 pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.10) 0%, rgba(244, 63, 94, 0.03) 55%, transparent 75%)',
              transform: `translate3d(${(interactiveGlowStyle.x - 50) * -0.2}px, ${(interactiveGlowStyle.y - 50) * -0.2}px, 0)`,
              transition: 'transform 0.5s ease-out',
            }}
          />

          {/* Center Subtle Warm Amber Luxury Glow */}
          <div
            className="absolute top-[40%] left-[45%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-25 pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(217, 119, 6, 0.07) 0%, transparent 65%)',
              transform: `translate3d(${(interactiveGlowStyle.x - 50) * 0.08}px, ${(interactiveGlowStyle.y - 50) * 0.08}px, 0)`,
              transition: 'transform 0.6s ease-out',
            }}
          />
        </>
      )}

      {/* 4. Click / Interaction Ambient Shockwave Pulses */}
      <AnimatePresence>
        {clickPulses.map((pulse) => (
          <motion.div
            key={pulse.id}
            initial={{
              left: pulse.x,
              top: pulse.y,
              width: 0,
              height: 0,
              opacity: 0.7,
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
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1], // fluid ease-out
            }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${pulse.color} 0%, transparent 70%)`,
              filter: 'blur(20px)',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          />
        ))}
      </AnimatePresence>

      {/* 5. Minimalist Ambient Luminous Micro-Motes (Delicate floating nodes) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {nodes.map((node) => {
          const driftX = (interactiveGlowStyle.x - 50) * 0.08;
          const driftY = (interactiveGlowStyle.y - 50) * 0.08;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [node.opacity * 0.3, node.opacity, node.opacity * 0.3],
                scale: [0.9, 1.15, 0.9],
                x: `${node.baseX + driftX}%`,
                y: `${node.baseY + driftY}%`,
              }}
              transition={{
                duration: node.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: node.delay,
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: node.size,
                height: node.size,
                backgroundColor: node.color,
                borderRadius: '50%',
                boxShadow: node.size > 2 ? `0 0 10px ${node.color}` : `0 0 4px ${node.color}`,
                willChange: 'transform, opacity',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
