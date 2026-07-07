import React from 'react';
import { motion } from 'motion/react';
import luxuryGoldBoltLogo from '../assets/images/luxury_gold_bolt_nobg_1783388227777.jpg';

interface GunmetalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function GunmetalLogo({ className = '', size = 'lg' }: GunmetalLogoProps) {
  // Container sizes (Enlarged exactly 3x to bring out magnificent 3D details)
  const sizeClasses = {
    sm: 'w-36 h-36',
    md: 'w-40 h-40',
    lg: 'w-48 h-48 sm:w-56 sm:h-56',
    xl: 'w-64 h-64',
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-visible group/logo ${sizeClasses[size]} ${className}`}
    >
      {/* Radiant Glowing Gold Background Aura (Pulsating breath effect) */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 via-[#FDE047]/15 to-amber-400/10 blur-xl rounded-full pointer-events-none" 
        style={{
          boxShadow: '0 0 35px 10px rgba(253, 224, 71, 0.2)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 3D Glossy Orange-Gold Lightning Bolt Image (Screen-blended with luxurious heartbeat pulse animation) */}
      <motion.img
        src={luxuryGoldBoltLogo}
        alt="Phoenix Best Logo"
        className="relative z-10 w-full h-full object-contain select-none cursor-pointer"
        style={{
          mixBlendMode: 'screen',
          filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.85)) brightness(1.05)',
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        whileHover={{
          scale: 1.1,
          rotate: 3,
          transition: { duration: 0.3 }
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
