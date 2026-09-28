/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';

interface Interactive3DTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (default: 10)
  perspective?: number; // Perspective distance in px (default: 1000)
  scaleOnHover?: number; // Scale factor on hover (default: 1.02)
  glowColor?: string; // Specular spotlight glow color
  onClick?: () => void;
  id?: string;
}

export const Interactive3DTiltCard: React.FC<Interactive3DTiltCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  perspective = 1000,
  scaleOnHover = 1.02,
  glowColor = 'rgba(244, 63, 94, 0.18)',
  onClick,
  id
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normalizedX = (mouseX / width) * 2 - 1;
    const normalizedY = (mouseY / height) * 2 - 1;

    const targetRotateY = (normalizedX * maxTilt).toFixed(2);
    const targetRotateX = (-normalizedY * maxTilt).toFixed(2);

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${targetRotateX}deg) rotateY(${targetRotateY}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, ${scaleOnHover})`;
      }
      if (glowRef.current) {
        const xPct = ((mouseX / width) * 100).toFixed(1);
        const yPct = ((mouseY / height) * 100).toFixed(1);
        glowRef.current.style.background = `radial-gradient(circle 280px at ${xPct}% ${yPct}%, ${glowColor}, transparent 70%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    }
  };

  return (
    <div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative preserve-3d transition-transform ease-out duration-200 ${className}`}
      style={{
        perspective: `${perspective}px`,
        transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        transitionProperty: isHovered ? 'box-shadow, border-color' : 'transform, box-shadow, border-color',
        transitionDuration: isHovered ? '100ms' : '400ms',
        willChange: 'transform',
      }}
    >
      {/* Dynamic Specular Spotlight Glow following cursor */}
      {isHovered && (
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none rounded-[inherit] z-30 transition-opacity duration-300"
          style={{
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Content wrapper with 3D child preservation */}
      <div className="w-full h-full preserve-3d">
        {children}
      </div>
    </div>
  );
};
