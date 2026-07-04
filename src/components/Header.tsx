import React, { useState, useEffect } from 'react';
import { Phone, Zap, Clock, ShieldCheck, MapPin } from 'lucide-react';

interface HeaderProps {
  onOpenBooking: () => void;
}

export default function Header({ onOpenBooking }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDispatchers, setActiveDispatchers] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    // Dynamic dispatcher counter fluctuation
    const interval = setInterval(() => {
      setActiveDispatchers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 2 && next <= 5 ? next : prev;
      });
    }, 8000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* 24/7 Top Alert Bar */}
      <div className="bg-[#0C0C0C] text-neutral-300 text-xs py-2 px-4 border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-sans tracking-[0.12em] text-[10px] uppercase font-bold text-neutral-200">
              Live Priority Dispatch: <span className="text-[#FDE047]">{activeDispatchers} Units</span> Patrolling Phoenix Metro Area
            </span>
          </div>
          <div className="flex items-center gap-4 text-neutral-300 font-sans font-medium tracking-wider text-[10px]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FDE047]" /> OPEN 24 HOURS
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#FDE047]" /> 8929 N CENTRAL AVE #53C
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0C0C0C]/98 backdrop-blur-md shadow-lg border-b border-white/10 py-3'
            : 'bg-[#0C0C0C]/92 backdrop-blur-md border-b border-white/10 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-[#FDE047] shadow-md transition-transform group-hover:scale-105">
              <Zap className="w-5.5 h-5.5 fill-[#FDE047] text-[#FDE047] stroke-[1.5]" />
            </div>
            <div>
              <span className="block serif text-xl font-bold tracking-tight text-white">
                Phoenix Best
              </span>
              <span className="block text-[10px] tracking-[0.16em] font-sans font-semibold text-neutral-400 uppercase leading-none mt-1">
                Electricians • Licensed 24/7
              </span>
            </div>
          </a>

          {/* Nav Items (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
            {[
              { label: "Specialties", href: "#services" },
              { label: "Process", href: "#estimate-section" },
              { label: "Reviews", href: "#reviews" },
              { label: "Service Area", href: "#coverage" },
              { label: "Contact", href: "#contact" }
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="relative py-1 hover:text-white transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FDE047] group-hover:w-full transition-all duration-300 ease-out" />
              </a>
            ))}
          </nav>

          {/* Action Callouts */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="tel:6027801140"
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#FDE047]/10 hover:bg-[#FDE047]/20 transition-all text-[#FDE047] text-xs sm:text-sm font-bold border border-[#FDE047]/30"
            >
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FDE047] animate-bounce" />
              <span className="hidden xs:inline">Call Tracy:</span>
              <span className="font-sans text-white font-bold tracking-wide">(602) 780-1140</span>
            </a>

            <button
              onClick={onOpenBooking}
              className="px-3.5 py-1.5 sm:px-5 sm:py-2 bg-gradient-to-r from-[#FDE047] to-[#EAB308] hover:from-[#FFF59D] hover:to-[#FDE047] text-[#0C0C0C] rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(253,224,71,0.25)] hover:shadow-[0_0_25px_rgba(253,224,71,0.55)] active:scale-98 border border-yellow-200/40"
            >
              REQUEST PRICING
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
