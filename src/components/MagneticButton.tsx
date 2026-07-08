import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  id?: string;
}

export default function MagneticButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  id
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Calculate distance from center of the button
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    // Limit magnetic radius to 120px to prevent unwanted jumps
    const distance = Math.sqrt(x * x + y * y);
    if (distance < 140) {
      // Gentle draw strength
      const strength = 0.22; 
      setPosition({ x: x * strength, y: y * strength });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-pointer select-none overflow-visible ${className}`}
      id={id || undefined}
    >
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, mass: 0.15 }}
        className="w-full h-full relative"
      >
        {variant === 'primary' ? (
          /* Liquid rotating premium golden border flow wrapper */
          <div className="relative p-[1.5px] overflow-hidden rounded-xl bg-neutral-900 group shadow-lg hover:shadow-[#FDE047]/10 transition-all duration-500">
            {/* The rotating liquid laser border */}
            <motion.div
              className="absolute -inset-[150%] bg-gradient-to-tr from-[#FDE047] via-amber-500 to-[#FFF59D] opacity-100"
              animate={{ rotate: 360 }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              style={{ originX: 0.5, originY: 0.5 }}
            />
            
            {/* High-contrast dark backdrop mask behind the actual button contents */}
            <div 
              onClick={onClick}
              className="relative px-6 py-3.5 bg-neutral-950 hover:bg-neutral-900/90 rounded-[10px] text-white flex items-center justify-center gap-2 transition-colors duration-300"
            >
              {children}
            </div>
          </div>
        ) : (
          /* Dark elegant glass magnetic button style */
          <div 
            onClick={onClick}
            className="group relative px-6 py-3.5 bg-[#111111]/90 hover:bg-neutral-900 backdrop-blur-md rounded-xl text-white flex items-center justify-center gap-2 border border-white/10 hover:border-[#FDE047]/30 transition-all duration-300 shadow-md"
          >
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
}
