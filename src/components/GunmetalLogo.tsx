import React from 'react';
import { motion } from 'motion/react';

interface GunmetalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function GunmetalLogo({ className = '', size = 'lg' }: GunmetalLogoProps) {
  // Refined sizes for perfect page balance and expert-level layout hierarchy
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-11 h-11 sm:w-12 sm:h-12', // Perfectly sized for navigation headers
    xl: 'w-24 h-24 sm:w-28 sm:h-28', // Magnificent but perfectly scaled for hero sections
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-visible group/logo ${sizeClasses[size]} ${className}`}
      id="gunmetal-logo-wrapper"
    >
      {/* LAYER 1: Deep Outer Ambient Glow (Slow, breathing aura for rich atmosphere) */}
      <motion.div 
        className="absolute inset-[-20%] bg-gradient-to-tr from-yellow-500/5 via-[#FDE047]/10 to-amber-500/5 blur-3xl rounded-full pointer-events-none" 
        style={{
          boxShadow: '0 0 60px 15px rgba(253, 224, 71, 0.08)',
        }}
        animate={{
          scale: [0.95, 1.15, 0.95],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* LAYER 2: Tighter Core Electric Glow (A vibrant heat pulse that oscillates at an offset rate) */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-[#FDE047]/20 to-yellow-400/10 blur-xl rounded-full pointer-events-none" 
        style={{
          boxShadow: '0 0 35px 8px rgba(253, 224, 71, 0.18)',
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.75, 0.4],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* LAYER 3: Interactive Hover Expansion Ring */}
      <motion.div 
        className="absolute inset-[-10%] rounded-full bg-gradient-to-tr from-[#FDE047] to-amber-500 opacity-0 blur-lg transition-all duration-500 group-hover/logo:opacity-15 group-hover/logo:scale-125"
        style={{
          boxShadow: '0 0 45px 15px rgba(253, 224, 71, 0.25)',
        }}
      />

      {/* 3D Glassmorphic Metallic Gold Lightning Bolt Container */}
      <motion.div
        className="relative z-10 w-full h-full select-none cursor-pointer flex items-center justify-center"
        animate={{
          scale: [1, 1.02, 1],
        }}
        whileHover={{
          scale: 1.08,
          rotate: 2,
          transition: { duration: 0.25, ease: 'easeOut' }
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]">
          <defs>
            {/* Left Facet Gradient: Semi-translucent, high-gloss liquid gold */}
            <linearGradient id="leftFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="15%" stopColor="#FFF9C4" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#FDE047" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
            </linearGradient>

            {/* Right Facet Gradient: Deep refraction glass amber/gold */}
            <linearGradient id="rightFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#D97706" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#92400E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0.55" />
            </linearGradient>

            {/* Edge Highlight Stroke Gradient: Ultra-sharp light catcher */}
            <linearGradient id="edgeHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#FFF59D" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
            </linearGradient>

            {/* Specular Glint (Diagonal sweeping shimmer gradient) */}
            <linearGradient id="shimmerSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Mask to lock the sweep strictly to the bolt profile */}
            <mask id="boltMask">
              <path
                d="M 52,6 L 28,52 L 47,52 L 38,94 L 72,46 L 53,46 Z"
                fill="#FFFFFF"
              />
            </mask>

            {/* Soft inner shadow/glow filter */}
            <filter id="glassShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="1.5" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.65" />
            </filter>
            
            {/* Neon core back-glow filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComponentTransfer in="blur" result="boost">
                <feFuncA type="linear" slope="1.8" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="boost" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Intense, localized neon aura directly behind the bolt */}
          <path
            d="M 52,6 L 28,52 L 47,52 L 38,94 L 72,46 L 53,46 Z"
            fill="#FDE047"
            opacity="0.3"
            filter="url(#neonGlow)"
          />

          {/* Main Bolt left facet (Glossy Luminous Glass) */}
          <path
            d="M 52,6 L 28,52 L 47,52 L 38,94 L 50,49 Z"
            fill="url(#leftFacetGrad)"
            stroke="url(#edgeHighlightGrad)"
            strokeWidth="0.65"
            strokeLinejoin="round"
            filter="url(#glassShadow)"
          />

          {/* Main Bolt right facet (Shadowed Golden Amber Glass) */}
          <path
            d="M 52,6 L 50,49 L 38,94 L 72,46 L 53,46 Z"
            fill="url(#rightFacetGrad)"
            stroke="url(#edgeHighlightGrad)"
            strokeWidth="0.65"
            strokeLinejoin="round"
            filter="url(#glassShadow)"
          />

          {/* Dynamic sweeping glass shimmer reflection */}
          <g mask="url(#boltMask)">
            <motion.rect
              x="-150"
              y="-50"
              width="300"
              height="200"
              fill="url(#shimmerSweepGrad)"
              animate={{
                x: [-150, 150],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 2.5,
                ease: 'easeInOut',
              }}
              style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}
            />
          </g>

          {/* Fixed Glass Specular highlight arc line to anchor the 3D look */}
          <path
            d="M 49,15 L 34,48 L 44,48"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.8"
            pointerEvents="none"
          />

          {/* Glowing central ridge highlight star */}
          <circle cx="50" cy="49" r="0.6" fill="#FFFFFF" opacity="0.95" filter="drop-shadow(0 0 1.5px #FFFFFF)" />
        </svg>
      </motion.div>
    </div>
  );
}
