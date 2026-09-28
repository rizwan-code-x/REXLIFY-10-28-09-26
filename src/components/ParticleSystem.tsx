/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: string;
  x: number; // Percentage width 0-100
  y: number; // Percentage height 0-100
  size: number;
  color: string;
  duration: number;
  delay: number;
  baseX: number;
  baseY: number;
}

interface ClickSpark {
  id: string;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
}

export const ParticleSystem: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [interactiveSparks, setInteractiveSparks] = useState<ClickSpark[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse coordinates to apply a gentle magnetic drift to the background particles
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // Normalized coordinates (0 to 1)

  useEffect(() => {
    // Colors of the REXLIFY tech stack: rose, amber, cyan
    const colors = [
      'rgba(244, 63, 94, 0.25)',  // rose-500
      'rgba(217, 119, 6, 0.2)',   // amber-600
      'rgba(6, 182, 212, 0.2)',   // cyan-500
      'rgba(255, 255, 255, 0.15)', // bright nodes
    ];

    // Initialize random base floating particles
    const initialParticles: Particle[] = Array.from({ length: 28 }).map((_, i) => {
      const baseX = Math.random() * 100;
      const baseY = Math.random() * 100;
      return {
        id: `p-${i}`,
        x: baseX,
        y: baseY,
        baseX,
        baseY,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 20 + 20, // ultra slow fluid flow
        delay: Math.random() * -20, // stagger initial start state
      };
    });

    setParticles(initialParticles);

    // Dynamic mouse move listener
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
    };

    // Spawn tiny tactical futuristic sparks on user click to accent the digital workspace
    const handleMouseClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const clickColors = ['#f43f5e', '#fdba74', '#22d3ee', '#ffffff'];
      const selectedColor = clickColors[Math.floor(Math.random() * clickColors.length)];

      // Generate 6 radial micro-particles
      const newSparks: ClickSpark[] = Array.from({ length: 6 }).map((_, index) => {
        const angle = (index * 60 + Math.random() * 20) * (Math.PI / 180);
        return {
          id: `spark-${Date.now()}-${index}`,
          x: clickX,
          y: clickY,
          color: selectedColor,
          angle,
          distance: Math.random() * 45 + 25,
          size: Math.random() * 2 + 1.5,
        };
      });

      setInteractiveSparks((prev) => [...prev.slice(-30), ...newSparks]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
    };
  }, []);

  // Filter out sparks periodically
  useEffect(() => {
    if (interactiveSparks.length === 0) return;
    const timer = setTimeout(() => {
      setInteractiveSparks([]);
    }, 1200);
    return () => clearTimeout(timer);
  }, [interactiveSparks]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
      {/* Floating Network Nodes */}
      {particles.map((p) => {
        // Calculate dynamic drift based on mouse position (max 4% shift)
        const driftX = (mousePos.x - 0.5) * 4;
        const driftY = (mousePos.y - 0.5) * 4;

        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.7, 0.1],
              scale: [0.8, 1.2, 0.8],
              // Add mouse tracking displacement beautifully combined with fluid CSS animations
              x: `${p.baseX + driftX}%`,
              y: `${p.baseY + driftY}%`,
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: '50%',
              boxShadow: p.size > 2.5 ? `0 0 8px ${p.color}` : 'none',
              left: 0,
              top: 0,
              willChange: 'transform, left, top',
            }}
          />
        );
      })}

      {/* Futuristic Mouse Click Starburst Accents */}
      <AnimatePresence>
        {interactiveSparks.map((spark) => {
          const targetX = spark.x + Math.cos(spark.angle) * spark.distance;
          const targetY = spark.y + Math.sin(spark.angle) * spark.distance;

          return (
            <motion.div
              key={spark.id}
              initial={{ 
                x: spark.x, 
                y: spark.y, 
                opacity: 0.9,
                scale: 1 
              }}
              animate={{ 
                x: targetX, 
                y: targetY, 
                opacity: 0,
                scale: 0.1 
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.7, 
                ease: [0.1, 0.8, 0.25, 1] 
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: spark.size,
                height: spark.size,
                backgroundColor: spark.color,
                borderRadius: '50%',
                boxShadow: `0 0 6px ${spark.color}`,
                willChange: 'transform, opacity',
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
