import React from 'react';
import { motion } from 'motion/react';

interface GunmetalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function GunmetalLogo({ className = '', size = 'lg' }: GunmetalLogoProps) {
  // Container sizes (Slightly smaller for a more refined, premium look)
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-28 h-28',
    lg: 'w-32 h-32 sm:w-36 sm:h-36',
    xl: 'w-44 h-44 sm:w-48 sm:h-48',
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-visible group/logo ${sizeClasses[size]} ${className}`}
    >
      {/* Radiant Glowing Gold Background Aura (Pulsating breath effect) */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-[#FDE047]/15 to-amber-400/5 blur-2xl rounded-full pointer-events-none" 
        style={{
          boxShadow: '0 0 45px 10px rgba(253, 224, 71, 0.12)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 3D Glassmorphic Metallic Gold Lightning Bolt */}
      <motion.div
        className="relative z-10 w-full h-full select-none cursor-pointer flex items-center justify-center"
        animate={{
          scale: [1, 1.03, 1],
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
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
          <defs>
            {/* Left Facet Gradient: Luminous, high-gloss gold/champagne with high transparency for deep glass look */}
            <linearGradient id="leftFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="15%" stopColor="#FFF9C4" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#FDE047" stopOpacity="0.35" />
              <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.15" />
            </linearGradient>

            {/* Right Facet Gradient: Deep refraction amber/gold shadow with transparency */}
            <linearGradient id="rightFacetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#D97706" stopOpacity="0.3" />
              <stop offset="80%" stopColor="#92400E" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0.5" />
            </linearGradient>

            {/* Edge Highlight Stroke Gradient: Mimics light catching the glass edges with crisp white/gold */}
            <linearGradient id="edgeHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#FFF59D" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#F59E0B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
            </linearGradient>

            {/* Glass Specular Reflection Gradient (Diagonal streak across the face) */}
            <linearGradient id="specularGrad" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="12%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="28%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Soft inner shadow/glow filter */}
            <filter id="glassShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="1.5" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.6" />
            </filter>
            
            {/* Neon back-glow for the bolt shape */}
            <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComponentTransfer in="blur" result="boost">
                <feFuncA type="linear" slope="1.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="boost" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Intense, localized pulsating neon aura directly behind the bolt */}
          <path
            d="M 52,6 L 28,52 L 47,52 L 38,94 L 72,46 L 53,46 Z"
            fill="#FDE047"
            opacity="0.25"
            filter="url(#neonGlow)"
          />

          {/* Main Bolt left facet (Glossy Luminous Glass) */}
          <path
            d="M 52,6 L 28,52 L 47,52 L 38,94 L 50,49 Z"
            fill="url(#leftFacetGrad)"
            stroke="url(#edgeHighlightGrad)"
            strokeWidth="0.6"
            strokeLinejoin="round"
            filter="url(#glassShadow)"
          />

          {/* Main Bolt right facet (Shadowed Golden Amber Glass) */}
          <path
            d="M 52,6 L 50,49 L 38,94 L 72,46 L 53,46 Z"
            fill="url(#rightFacetGrad)"
            stroke="url(#edgeHighlightGrad)"
            strokeWidth="0.6"
            strokeLinejoin="round"
            filter="url(#glassShadow)"
          />

          {/* Highly polished glossy surface reflections with screen blend */}
          <path
            d="M 52,6 L 28,52 L 47,52 L 38,94 Z"
            fill="url(#specularGrad)"
            pointerEvents="none"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* Glass Specular highlight arc line */}
          <path
            d="M 48,15 L 32,48 L 44,48"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.75"
            pointerEvents="none"
          />

          {/* Glowing central ridge highlight star */}
          <circle cx="50" cy="49" r="0.6" fill="#FFFFFF" opacity="0.95" filter="drop-shadow(0 0 1.5px #FFFFFF)" />
        </svg>
      </motion.div>
    </div>
  );
}
