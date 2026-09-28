/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback } from 'react';

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
  maxTilt = 10,
  perspective = 1000,
  scaleOnHover = 1.02,
  glowColor = 'rgba(244, 63, 94, 0.18)',
  onClick,
  id
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center (-1 to +1)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normalizedX = (mouseX / width) * 2 - 1;
    const normalizedY = (mouseY / height) * 2 - 1;

    // Calculate rotational angle
    const targetRotateY = normalizedX * maxTilt;
    const targetRotateX = -normalizedY * maxTilt;

    setRotateX(targetRotateX);
    setRotateY(targetRotateY);
    setSpotlightPos({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100
    });
  }, [maxTilt]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
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
        transform: isHovered
          ? `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scaleOnHover}, ${scaleOnHover}, ${scaleOnHover})`
          : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        transitionProperty: isHovered ? 'transform' : 'transform, box-shadow, border-color',
        transitionDuration: isHovered ? '90ms' : '450ms',
        willChange: 'transform',
      }}
    >
      {/* Dynamic Specular Spotlight Glow following cursor/touchpad */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${spotlightPos.x}% ${spotlightPos.y}%, ${glowColor}, transparent 70%)`,
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
