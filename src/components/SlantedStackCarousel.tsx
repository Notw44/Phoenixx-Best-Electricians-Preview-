import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, Sun, ZapOff, Fan, ToggleRight, Building2, 
  ChevronLeft, ChevronRight, ArrowRight, Wrench, Sparkles 
} from 'lucide-react';
import { Service } from '../types';

// Map icon string names to Lucide Icon components
const iconMap: Record<string, React.ComponentType<any>> = {
  Cpu,
  Sun,
  ZapOff,
  Fan,
  ToggleRight,
  Building2,
  Wrench
};

interface SlantedStackCarouselProps {
  services: Service[];
  scrollToBooking: (serviceId?: string) => void;
}

export default function SlantedStackCarousel({ services, scrollToBooking }: SlantedStackCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const total = services.length;

  // Track window resizing for absolute layout responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive breakpoints
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // Next and Prev handlers
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <div 
      className="relative w-full max-w-5xl mx-auto px-2 sm:px-6 py-6 sm:py-12 flex flex-col items-center group/container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Navigation Instructions */}
      <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] border border-white/10 text-neutral-200 text-[10px] sm:text-[11px] uppercase tracking-widest font-mono shadow-md animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-[#FDE047]" />
        <span>Click the next card to cycle through jobs ({activeIndex + 1}/{total})</span>
      </div>

      {/* Immersive 3D Stage Container - Sized precisely for responsive viewports */}
      <div className="relative w-full min-h-[460px] sm:min-h-[500px] md:min-h-[460px] lg:min-h-[480px] flex items-center justify-center preserve-3d overflow-visible">
        
        {services.map((srv, index) => {
          // Calculate the index difference from active card
          let diff = index - activeIndex;
          if (diff < 0) diff += total; // wrap around for carousel effect

          // Determine if this is the exited card (the one that was just active but moved left/away)
          const isExited = diff === total - 1;

          // Only render visible stack cards (top 3) or the recently exited card (for the fade-off effect)
          const isVisible = diff < 3 || isExited;
          if (!isVisible) return null;

          const isActive = diff === 0;

          // Compute custom 3D offsets, transforms, and opacity values based on responsive breakpoints
          let scale = 1 - diff * 0.04;
          let rotate = isActive ? -1 : (diff * 3.5 * (index % 2 === 0 ? 1 : -1));
          
          // Tighten card displacement on smaller viewports so cards never clipping or overflowing screen bounds
          let translateX = isMobile ? diff * 12 : isTablet ? diff * 18 : diff * 24; 
          let translateY = isMobile ? -diff * 10 : isTablet ? -diff * 12 : -diff * 14; 
          let opacity = diff === 0 ? 1 : diff === 1 ? 0.85 : diff === 2 ? 0.55 : 0.25;
          let zIndex = 50 - diff;

          // Exited card visual styling: "fading off" to the left with smooth rotation and translation
          if (isExited) {
            scale = 0.92;
            rotate = -10;
            translateX = isMobile ? -140 : isTablet ? -200 : -280; // Fly away proportional to viewport
            translateY = isMobile ? 20 : 30;
            opacity = 0; // Fade out completely for exit animation
            zIndex = 60; // Render on top layer so it glides away gracefully
          }

          const IconComponent = iconMap[srv.iconName] || Wrench;

          return (
            <motion.div
              key={srv.id}
              style={{
                zIndex,
                transformOrigin: 'bottom center',
                pointerEvents: isExited ? 'none' : 'auto',
              }}
              animate={{
                scale,
                rotate,
                x: translateX,
                y: translateY,
                opacity,
              }}
              transition={{
                type: 'spring',
                stiffness: isMobile ? 280 : 240, // snappy springs on mobile for immediate tactile feedback
                damping: isMobile ? 28 : 24,
              }}
              whileHover={isActive && !isMobile ? {
                y: translateY - 8,
                rotate: 0,
                scale: 1.015,
                transition: { duration: 0.2, ease: 'easeOut' }
              } : undefined}
              onClick={() => {
                if (!isActive && !isExited) {
                  handleNext();
                }
              }}
              className={`absolute w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[390px] md:max-w-[440px] lg:max-w-[470px] border rounded-3xl p-5 sm:p-8 lg:p-10 bg-[#111111]/95 backdrop-blur-md select-none transition-colors duration-300 ${
                isActive 
                  ? 'border-[#FDE047]/35 cursor-default shadow-[0_20px_50px_rgba(253,224,71,0.05)]' 
                  : 'border-white/5 cursor-pointer hover:border-white/10 shadow-md'
              }`}
            >
              {/* Highlight Overlay on Active card hover */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#FDE047]/[0.015] to-transparent rounded-3xl pointer-events-none" />
              )}

              {/* Card Header - Beautiful layouts optimized for compact touchscreens */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center">
                  <div className={`p-2.5 sm:p-3.5 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#FDE047] text-[#0C0C0C] rotate-3 shadow-[0_0_15px_rgba(253,224,71,0.25)]' 
                      : 'bg-[#0C0C0C] border border-white/10 text-neutral-400'
                  }`}>
                    <IconComponent className="w-5 h-5 sm:w-5.5 sm:h-5.5 drop-shadow-[0_0_4px_rgba(253,224,71,0.4)]" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-sans text-[#FDE047] bg-[#FDE047]/10 border border-[#FDE047]/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(253,224,71,0.05)]">
                    ROC Class-A
                  </span>
                </div>

                {/* Service Details with adaptive font size scaling */}
                <div className="space-y-2 sm:space-y-3.5">
                  <h3 className="font-wiggly text-base sm:text-lg lg:text-xl text-white tracking-wide leading-snug">
                    {srv.title}
                  </h3>
                  <p className="text-neutral-300 text-[11px] sm:text-xs lg:text-sm leading-relaxed font-light min-h-[64px] sm:min-h-[72px]">
                    {srv.description}
                  </p>
                </div>
              </div>

              {/* Pricing & Call to Action Footer - fully finger-friendly size on mobile */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex flex-col gap-3 sm:gap-4">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-neutral-400">
                  <span>Pricing Option</span>
                  <span className="font-bold text-[#FDE047] drop-shadow-[0_0_6px_rgba(253,224,71,0.25)]">
                    {srv.basePriceRange}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToBooking(srv.id);
                  }}
                  disabled={!isActive}
                  className={`w-full py-3 sm:py-3.5 font-bold text-[11px] sm:text-xs rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 border shadow-md ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#FDE047] to-[#EAB308] hover:from-[#FFF59D] hover:to-[#FDE047] text-[#0C0C0C] border-yellow-200/40 hover:scale-[1.01] hover:-translate-y-0.5 active:scale-98 animate-luxury-glow cursor-pointer' 
                      : 'bg-neutral-900/40 text-neutral-500 border-white/5 cursor-not-allowed'
                  }`}
                >
                  Request Pricing <ArrowRight className="w-3.5 h-3.5 transition-transform" />
                </button>

                <p className="text-center text-[8px] sm:text-[9px] text-neutral-400 font-bold font-mono uppercase tracking-wider">
                  {srv.popularFor}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Pagination & Controls - centered and large enough to tap easily on screens */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 z-20">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-3 rounded-full bg-[#111111]/80 hover:bg-[#FDE047] text-white hover:text-black border border-white/10 hover:border-[#FDE047] transition-all duration-300 active:scale-90 cursor-pointer group shadow-lg touch-manipulation"
            aria-label="Previous service"
          >
            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Page Counter */}
          <span className="font-mono text-xs text-neutral-400 bg-neutral-900/60 border border-white/5 px-4 py-2 rounded-full min-w-[70px] text-center shadow-inner">
            <span className="text-[#FDE047] font-semibold">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="text-neutral-600 mx-1">/</span>
            {String(total).padStart(2, '0')}
          </span>

          <button
            onClick={handleNext}
            className="p-3 rounded-full bg-[#111111]/80 hover:bg-[#FDE047] text-white hover:text-black border border-white/10 hover:border-[#FDE047] transition-all duration-300 active:scale-90 cursor-pointer group shadow-lg touch-manipulation"
            aria-label="Next service"
          >
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Small Dot Indicator */}
        <div className="flex gap-1.5 py-2">
          {services.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer touch-manipulation ${
                i === activeIndex 
                  ? 'w-6 bg-[#FDE047]' 
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to service ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
