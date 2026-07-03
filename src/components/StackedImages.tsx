import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

// 1. First, import the assets (Vite will compile these into production-safe paths)
import luxurySmartHomePanel from './assets/images/luxury_smart_home_panel_1783000379209.jpg';
import designerLighting from './assets/images/designer_lighting_1783000392525.jpg';

export default function PortfolioSpotlight() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
      
      {/* LEFT COLUMN: Text Content */}
      <div className="lg:col-span-6 space-y-8 text-left">
        <span className="text-[#FDE047] text-xs font-bold uppercase tracking-widest">
          The Standard of Perfection
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white mt-4 leading-tight">
          Architectural integrity, masterfully connected.
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base mt-6 leading-relaxed">
          We don't just run wiring; we design the physical pulse of your home. Every wire is structured at perfect right angles with industrial-grade tension balancing.
        </p>
      </div>

      {/* RIGHT COLUMN: Overlapping Photos & Badges Sticking Outside Containers */}
      <div className="lg:col-span-6 relative h-[380px] sm:h-[480px] mt-12 lg:mt-0 flex items-center">
        
        {/* Decorative back framing border (skewed) */}
        <div className="absolute inset-4 border border-[#FDE047]/10 rounded-3xl transform -skew-x-2 pointer-events-none" />

        {/* PHOTO 1: The Base photo (slightly offset down and left) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="w-10/12 aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10"
        >
          <img 
            src={luxurySmartHomePanel} 
            alt="Luxury smart home automation panel" 
            className="w-full h-full object-cover filter brightness-90 hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient overlay to make the overlay text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-5 z-20">
            <p className="text-[10px] font-mono tracking-widest text-[#FDE047] uppercase font-bold">FEATURED INSTALL</p>
            <p className="text-xs font-bold text-white mt-0.5">Bespoke Panel Architecture</p>
          </div>
        </motion.div>

        {/* PHOTO 2: Overlapping, rotating, and sticking out of the border */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.35 }}
          whileHover={{ rotate: 1, scale: 1.03, transition: { duration: 0.2 } }}
          className="absolute right-0 -top-8 w-7/12 aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-20 transform rotate-3"
        >
          <img 
            src={designerLighting} 
            alt="Architectural designer ambient lighting" 
            className="w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-5 z-20">
            <p className="text-[10px] font-mono tracking-widest text-[#FDE047] uppercase font-bold">PARADISE VALLEY RESIDENCE</p>
            <p className="text-xs font-bold text-white mt-0.5">Bespoke Architectural Ambient Glow</p>
          </div>
        </motion.div>
        
        {/* DECORATIVE BADGE: Sticking completely outside the visual container bounds */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="absolute -bottom-6 right-8 bg-[#0C0C0C]/90 border border-[#FDE047]/30 text-white p-4 rounded-2xl z-30 flex items-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform -rotate-1"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FDE047]/10 flex items-center justify-center text-[#FDE047]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-mono tracking-wider text-neutral-400 uppercase leading-none">CRAFTSMANSHIP PLEDGE</p>
            <p className="text-xs font-bold text-white mt-1">100% Lifetime Guarantee</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
