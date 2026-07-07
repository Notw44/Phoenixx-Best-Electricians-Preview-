import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, ShieldCheck, Award, Phone, Clock, MapPin, 
  Check, ChevronDown, Sparkles, Wrench, ArrowRight, 
  HelpCircle, Lock, Star 
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from './lib/supabase';

import Header from './components/Header';
import GunmetalLogo from './components/GunmetalLogo';
import BookingWizard from './components/BookingWizard';
import ReviewsSection from './components/ReviewsSection';
import InteractiveMap from './components/InteractiveMap';
import OwnerConsole from './components/OwnerConsole';
import ContactForm from './components/ContactForm';
import ShaderBackground from '@/components/ui/asd';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { PortfolioStack } from '@/components/ui/portfolio-stack';
import QuoteCalculator from './components/QuoteCalculator';

import luxurySmartHomePanel from './assets/images/luxury_smart_home_panel_1783000379209.jpg';
import designerLighting from './assets/images/designer_lighting_1783000392525.jpg';
import electricianWorking from './assets/images/electrician_working_1783049484014.jpg';
import smartHomeWiring from './assets/images/smart_home_wiring_1783049500442.jpg';
import luxuryQuoteBg from './assets/images/luxury_quote_bg_1783389801014.jpg';

// Newly generated high-end black and gold electrician images
import luxuryCircuitPanel from './assets/images/luxury_circuit_panel_1783294895636.jpg';
import smartHomeAutomationRack from './assets/images/smart_home_automation_rack_1783294908397.jpg';
import designerLightingControls from './assets/images/designer_lighting_controls_1783294921523.jpg';
import electricianGoldGlow from './assets/images/electrician_gold_glow_1783294935435.jpg';

// Premium brand-new luxury portfolio showcase images
import luxuryHomeTheater from './assets/images/luxury_home_theater_1783295923695.jpg';
import smartLightingKitchen from './assets/images/smart_lighting_kitchen_1783295935423.jpg';
import evChargerGarage from './assets/images/ev_charger_garage_1783295946540.jpg';
import automationServerProgramming from './assets/images/automation_server_programming_1783295958248.jpg';

import { SERVICES, REVIEWS, FAQS } from './data';
import { Lead, Review } from './types';

// Deluxe, 60fps viewport-triggered count-up counter for stats
function AnimatedCounter({ value, duration = 1.5, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMs = duration * 1000;
    const intervalTime = 16; // approx 60fps
    const totalSteps = totalMs / intervalTime;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value, duration, started]);

  return <span ref={elementRef}>{count}{suffix}</span>;
}

export default function App() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isOwnerConsoleOpen, setIsOwnerConsoleOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const portfolioProjects = [
    {
      id: "p1",
      title: "Cinematic Acoustics & Ambient Light",
      subtitle: "01 / HIGH-END HOME CINEMA",
      category: "Home Theater Integration",
      description: "Custom fiber-optic starfield ceiling paired with premium automated Lutron scene dimming. We wired and calibrated the complete Dolby Atmos 11.2 spatial sound-array and luxury acoustics.",
      image: luxuryHomeTheater,
      specs: [
        { label: "Cabling", value: "Solid-Core Audio-Grade Silver" },
        { label: "Dimmers", value: "Lutron Palladiom Backlit" }
      ]
    },
    {
      id: "p2",
      title: "Architectural Culinary Illuminations",
      subtitle: "02 / LUMINESCENT ARCHITECTURE",
      category: "Designer Lighting",
      description: "Precision-routed low-voltage brass LED tape lighting seamlessly integrated under luxury onyx countertops and custom cabinetry. Hand-crafted control nodes with seamless 3-way scene switching.",
      image: smartLightingKitchen,
      specs: [
        { label: "LED Voltage", value: "24V DC Ripple-Free Class 2" },
        { label: "Controls", value: "Crestron Horizon Keypads" }
      ]
    },
    {
      id: "p3",
      title: "High-Performance Dual EV Infrastructure",
      subtitle: "03 / ZERO EMISSION ECOSYSTEM",
      category: "Infrastructure & Power",
      description: "Dedicated 100A sub-panel supply routing behind custom wall paneling to charge dual premium electric vehicles. Features custom gold-and-amber status LEDs and surge-suppression integration.",
      image: evChargerGarage,
      specs: [
        { label: "Power Supply", value: "240V / 80A Dedicated Line" },
        { label: "Protection", value: "Type 1 SPD Whole-House Guard" }
      ]
    },
    {
      id: "p4",
      title: "Central Automation Backbone Configuration",
      subtitle: "04 / DEEP SYSTEM INTEGRATION",
      category: "Smart Home Control",
      description: "Pristine server rack configuration routing more than 150 low-voltage control lines. Integrated Lutron HomeWorks hub, secure network layers, and uninterruptible power backups.",
      image: automationServerProgramming,
      specs: [
        { label: "Connections", value: "CAT6A STP Shielded 10Gbps" },
        { label: "Rack Power", value: "2.4kW Double-Conversion UPS" }
      ]
    }
  ];

  useEffect(() => {
    const fetchApprovedReviews = async () => {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('approved', true)
            .order('id', { ascending: false });

          if (!error && data && data.length > 0) {
            const mapped = data.map((row: any) => ({
              id: String(row.id),
              author: row.customer_name,
              rating: row.rating,
              timeAgo: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now',
              text: row.review,
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.customer_name)}`,
              category: 'general' as const,
              tags: ['Verified Customer']
            }));
            setReviews(mapped);
            return;
          } else if (error) {
            console.warn("Supabase reviews query returned error:", error.message);
          }
        } catch (err) {
          console.error("Failed to query reviews directly from Supabase:", err);
        }
      }

      // Fallback 1: Express Server API (which we will also filter)
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setReviews(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load reviews from API, keeping default static reviews:', err);
      }
    };

    fetchApprovedReviews();
  }, []);

  // Scroll to estimate engine helper
  const scrollToBooking = (serviceId?: string) => {
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    const element = document.getElementById('estimate-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLeadSubmitted = (newLead: Lead) => {
    // Lead successfully logged to localStorage via BookingWizard
    console.log('New lead registered:', newLead);
  };

  const handleAddReview = async (newReview: Review) => {
    let submittedToSupabase = false;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('reviews')
          .insert([{
            customer_name: newReview.author,
            rating: newReview.rating,
            review: newReview.text,
            approved: false // Default to false so it requires admin approval
          }]);

        if (!error) {
          submittedToSupabase = true;
          console.log("Review submitted successfully directly to Supabase (pending approval).");
        } else {
          console.warn("Direct Supabase review insert failed:", error.message);
        }
      } catch (err) {
        console.error("Direct Supabase review exception:", err);
      }
    }

    if (!submittedToSupabase) {
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author: newReview.author,
            rating: newReview.rating,
            text: newReview.text,
            category: newReview.category,
            tags: newReview.tags
          })
        });
        if (response.ok) {
          console.log("Review submitted successfully via backend API (pending approval).");
        }
      } catch (err) {
        console.error('Network error adding review:', err);
      }
    }
    
    // NOTE: We DO NOT append the review to the local reviews state immediately!
    // Since it is approved = false, it must NOT appear on the home page until Tracy approves it in OwnerConsole.
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white font-sans leading-relaxed relative overflow-x-clip">
      
      {/* Premium WebGL Animated Gold & Slate Steel Background - Blended perfectly for high-end luxury */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.28]">
        <ShaderBackground />
      </div>

      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={luxurySmartHomePanel}
        bgImageSrc={designerLighting}
        title="Elite Craftsmanship"
        date="Phoenix Best Electricians"
        scrollToExpand="Scroll to Enter Site"
        textBlend={true}
      >
        {/* Premium Navigation Header */}
        <Header onOpenBooking={() => scrollToBooking()} />

      {/* Hero Section with spacious, luxurious vertical padding */}
      <section className="relative overflow-hidden pt-40 pb-44 sm:pt-56 sm:pb-64 lg:pt-64 lg:pb-72 border-b border-white/10">
        {/* Ambient subtle warm gold glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FDE047]/2.5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.12] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center"
        >
          {/* Rating Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-full shadow-md mb-10 hover:border-[#FDE047]/30 transition-all duration-300">
            <div className="flex items-center gap-0.5 text-[#FDE047] drop-shadow-[0_0_6px_rgba(253,224,71,0.5)]">
              {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-3.5 h-3.5 fill-[#FDE047] text-[#FDE047] stroke-[#0C0C0C]" />)}
            </div>
            <span className="text-xs font-semibold text-neutral-300">
              4.7 Rating (<AnimatedCounter value={129} suffix="+" /> Verified Reviews)
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white max-w-4xl mx-auto leading-[1.2]">
            <span className="font-wiggly block mb-3 tracking-wide">Elite Electrical Craftsmanship</span>
            <span className="serif italic font-normal text-[#FDE047] drop-shadow-[0_0_10px_rgba(253,224,71,0.2)]">
              Upfront Rates, 24/7 Priority
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-10 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Phoenix&apos;s high-end choice for master panel upgrades, premium solar consultations, and expert troubleshooting. Serviced with absolute clarity and zero hidden fees.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => scrollToBooking()}
              className="group w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#FDE047] via-[#FFF59D] to-[#EAB308] hover:from-[#FFF59D] hover:to-[#FDE047] hover:scale-[1.02] hover:-translate-y-0.5 text-[#0C0C0C] rounded-xl text-sm font-bold tracking-wide transition-all duration-300 animate-luxury-glow active:scale-98 flex items-center justify-center gap-2 border border-yellow-200/50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#0C0C0C] animate-pulse group-hover:rotate-12 transition-transform duration-300" />
              <span>Request Free Quote</span>
              <ArrowRight className="w-4 h-4 text-[#0C0C0C] group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <a
              href="tel:6027801140"
              className="group w-full sm:w-auto px-6 py-3.5 bg-[#111111] hover:bg-neutral-900 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-2xl text-white rounded-xl text-sm font-semibold transition-all shadow-md border border-white/10 flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#FDE047] animate-bounce group-hover:rotate-12 transition-transform" /> <span className="font-wiggly tracking-wide">Call (602) 780-1140</span>
            </a>
          </div>

          {/* Trust points bar */}
          <div className="mt-24 sm:mt-36 border-t border-white/10 pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            {[
              { icon: ShieldCheck, title: 'Fully Licensed & Bonded', desc: 'Arizona Class L-11 ROC compliant' },
              { icon: Clock, title: '24-Hour Emergency Dispatch', desc: <>On-scene within <AnimatedCounter value={45} /> minutes guaranteed</> },
              { icon: Award, title: 'Upfront Flat pricing', desc: 'Clear quote ranges before we touch a tool' },
              { icon: Sparkles, title: 'Lifetime Workmanship', desc: <><AnimatedCounter value={100} suffix="%" /> guarantee on all parts & labor</> }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="space-y-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-[#111111] border border-white/10 flex items-center justify-center text-[#FDE047] shadow-md group-hover:border-[#FDE047]/30 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_15px_25px_rgba(253,224,71,0.08)]">
                    <Icon className="w-5.5 h-5.5 text-[#FDE047] group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_5px_rgba(253,224,71,0.5)]" />
                  </div>
                  <h4 className="font-wiggly text-white text-base group-hover:text-[#FDE047] transition-colors tracking-wide leading-tight">{item.title}</h4>
                  <p className="text-xs text-neutral-300 leading-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Specialties Bento Grid Section with spacious, luxurious vertical padding */}
      <section id="services" className="py-44 sm:py-64 lg:py-72 bg-[#0C0C0C] border-b border-white/10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(253,224,71,0.01)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-24"
          >
            <span className="font-wiggly tracking-[0.15em] text-[#FDE047] text-sm uppercase block">
              Elite Specializations
            </span>
            <h2 className="font-wiggly text-2xl sm:text-3xl lg:text-4xl font-normal text-white mt-4 leading-snug">
              Electrical services engineered with absolute precision
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-4">
              Whether updating historic central Phoenix properties or equipping new construction solar systems, Tracy and our crew deliver flawless execution.
            </p>
          </motion.div>

          {/* Dynamic Service Cards - Deluxe staggered layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
            {SERVICES.map((srv, idx) => (
              <motion.div 
                key={srv.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
                className="group border border-white/10 hover:border-[#FDE047]/45 rounded-3xl p-8 sm:p-10 bg-[#111111]/75 backdrop-blur-md transition-all duration-300 shadow-xl hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-[#0C0C0C] border border-white/10 rounded-2xl text-[#FDE047] group-hover:bg-[#FDE047] group-hover:text-[#0C0C0C] group-hover:rotate-6 transition-all duration-300 shadow-[0_0_15px_rgba(253,224,71,0.05)] group-hover:shadow-[0_0_20px_rgba(253,224,71,0.25)]">
                      <Wrench className="w-5.5 h-5.5 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.5)]" />
                    </div>
                    <span className="text-[10px] font-sans text-[#FDE047] bg-[#FDE047]/10 border border-[#FDE047]/30 px-2.5 py-1 rounded-full font-bold uppercase tracking-[0.08em] shadow-[0_0_10px_rgba(253,224,71,0.1)]">
                      ROC Class-A
                    </span>
                  </div>

                  <h3 className="font-wiggly text-xl text-white group-hover:text-[#FDE047] transition-colors tracking-wide leading-tight">
                    {srv.title}
                  </h3>
                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-4">
                    <span>Pricing Option</span>
                    <span className="font-sans font-bold text-[#FDE047] drop-shadow-[0_0_6px_rgba(253,224,71,0.3)]">Request Quote</span>
                  </div>

                  <button
                    onClick={() => scrollToBooking(srv.id)}
                    className="w-full py-3.5 bg-gradient-to-r from-[#FDE047] to-[#EAB308] hover:from-[#FFF59D] hover:to-[#FDE047] text-[#0C0C0C] font-bold text-xs rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 border border-yellow-200/40 shadow-sm active:scale-98 flex items-center justify-center gap-1.5 animate-luxury-glow cursor-pointer"
                  >
                    Request Pricing <ArrowRight className="w-3.5 h-3.5 transition-transform" />
                  </button>
                  <p className="text-center text-[10px] text-neutral-400 mt-3.5 font-bold font-mono uppercase tracking-wider">
                    {srv.popularFor}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deluxe Portfolio Spotlight with spacious, luxurious vertical padding */}
      <section className="relative overflow-clip pt-24 sm:pt-32 pb-0 bg-gradient-to-tr from-[#12100C] via-[#1D1A13] to-[#0D0B0A] border-y border-yellow-500/10">
        {/* Subtle diagonal grid accents */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(253,224,71,0.02)_1px,transparent_1px)] [background-size:32px_32px] opacity-60 pointer-events-none" />
        
        {/* Diagonal Dividers (accent skew stripes at the top & bottom border) */}
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-[#FDE047]/20 to-transparent transform -skew-y-1" />
        <div className="absolute bottom-0 left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-[#FDE047]/20 to-transparent transform skew-y-1" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 mb-16">
          {/* Section Header with description and specs row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-8 text-left space-y-6">
              <span className="font-wiggly tracking-[0.15em] text-[#FDE047] text-sm uppercase block">
                The Standard of Perfection
              </span>
              <h2 className="font-wiggly text-3xl sm:text-4xl lg:text-5xl font-normal text-white leading-tight mt-4">
                Architectural integrity, masterfully connected.
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-2">
                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                  We don&apos;t just run wiring; we design the physical pulse of your home. From clean-room industrial conduits to pristine, hand-routed designer Lutron panels, every wire is structured at perfect right angles with industrial-grade tension balancing.
                </p>
                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                  Scroll down to experience our modern installations in dynamic detail, showing luxury smart lighting, automated backbones, and custom circuitry setups.
                </p>
              </div>
            </div>
            
            <div className="lg:col-span-4 lg:pt-16 flex flex-col sm:flex-row lg:flex-col gap-8 justify-end text-left">
              <div className="border-l-2 border-[#FDE047]/30 pl-4 space-y-1.5 group cursor-pointer">
                <p className="text-xl font-bold font-wiggly text-white group-hover:text-[#FDE047] transition-colors">90&deg; Rules</p>
                <p className="text-xs text-neutral-400">Perfect perpendicular wire routing for cooling and neatness</p>
              </div>
              <div className="border-l-2 border-[#FDE047]/30 pl-4 space-y-1.5 group cursor-pointer">
                <p className="text-xl font-bold font-wiggly text-white group-hover:text-[#FDE047] transition-colors">Lutron Pro</p>
                <p className="text-xs text-neutral-400">Certified Smart Ambient dimming integrations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Polished Stacking Portfolio Showcase */}
        <div className="w-full relative mt-12 px-4 sm:px-6">
          <PortfolioStack projects={portfolioProjects} />
        </div>
      </section>

      {/* Interactive Project Cost Estimator & Quote Section */}
      <section id="quote-section" className="py-24 sm:py-32 bg-black border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(253,224,71,0.01)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-wiggly tracking-[0.15em] text-[#FDE047] text-sm uppercase block">
              Interactive Estimator
            </span>
            <h2 className="font-wiggly text-3xl sm:text-4xl font-normal text-white mt-4">
              Instant Project Cost Estimator
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-4">
              Select your electrical service, customize your requirements, and receive a physically accurate cost calculation with options to instantly dispatch Tracy.
            </p>
          </div>

          <QuoteCalculator onLeadSubmitted={handleLeadSubmitted} />
        </div>
      </section>

      {/* Key Lead Generator Block with spacious, luxurious vertical padding */}
      <section 
        id="estimate-section" 
        className="pt-4 pb-24 sm:pb-32 bg-[#111111] text-white relative border-b border-white/10 overflow-hidden"
      >
        {/* Animated Golden Electricity Background Container */}
        <div className="absolute inset-0 z-0 select-none overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${luxuryQuoteBg})` }}
            animate={{
              scale: [1.02, 1.15, 1.05, 1.12, 1.02],
              x: [0, -15, 15, -8, 0],
              y: [0, 8, -12, 10, 0],
            }}
            transition={{
              duration: 35,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
          
          {/* Subtle lightning flicker effect overlay simulating electrical power surges */}
          <motion.div 
            className="absolute inset-0 bg-[#FDE047]/5 mix-blend-color-dodge"
            animate={{
              opacity: [0, 0.12, 0, 0.05, 0.22, 0.02, 0, 0.1, 0]
            }}
            transition={{
              duration: 12,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
          
          {/* Moving electrical golden currents & surges */}
          <div className="absolute inset-0 overflow-hidden opacity-80">
            {/* Surge 1: Horizontal electric pulse */}
            <motion.div 
              className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FDE047]/70 to-transparent blur-[1px]"
              style={{ top: '35%' }}
              animate={{
                x: ['-100%', '100%'],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 7,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
            {/* Surge 2: Reverse horizontal electric pulse */}
            <motion.div 
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#EAB308]/60 to-transparent blur-[2px]"
              style={{ top: '70%' }}
              animate={{
                x: ['100%', '-100%'],
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 9,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 5
              }}
            />
            {/* Surge 3: Vertical charge flow */}
            <motion.div 
              className="absolute top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-transparent via-[#FDE047]/50 to-transparent blur-[1.5px]"
              style={{ left: '30%' }}
              animate={{
                y: ['-100%', '100%'],
                opacity: [0, 0.7, 0.7, 0],
              }}
              transition={{
                duration: 11,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          </div>

          {/* Deep atmospheric overlay for high-contrast legibility */}
          <div className="absolute inset-0 bg-neutral-950/75 backdrop-blur-[1px]" />
        </div>
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <span className="font-wiggly text-xs tracking-[0.15em] text-[#FDE047] bg-[#FDE047]/10 border border-[#FDE047]/20 px-3.5 py-1 rounded-full uppercase block w-fit mx-auto">
              Free Service Quote
            </span>
            <h2 className="font-wiggly text-3xl sm:text-4xl font-normal text-white mt-5">
              Request a Free Quote
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-3 max-w-lg mx-auto">
              Tell us about your electrical requirements. Tracy and our team will get back to you with clean upfront rates.
            </p>
          </div>

          <BookingWizard 
            onLeadSubmitted={handleLeadSubmitted}
            initialServiceId={selectedServiceId}
          />
        </div>
      </section>

      {/* Live Radar Coverage Zone section with spacious, luxurious vertical padding */}
      <section id="coverage" className="py-44 sm:py-64 lg:py-72 bg-[#0C0C0C] border-b border-white/10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(253,224,71,0.01)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-24"
          >
            <span className="font-wiggly tracking-[0.15em] text-[#FDE047] text-sm uppercase block">
              Phoenix Metro Service Radar
            </span>
            <h2 className="font-wiggly text-2xl sm:text-3xl lg:text-4xl font-normal text-white mt-4 leading-snug">
              Dispatched daily near Central Avenue
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base mt-4">
              Based at the Marketplace At Central, our trucks patrol neighborhoods surrounding 8929 N Central Ave, keeping transit times minimal and emergency dispatches instantaneous.
            </p>
          </motion.div>

          {/* Interactive Radar Coverage component */}
          <InteractiveMap />
        </div>
      </section>

      {/* Customer Testimonials & Verified reviews section with spacious, luxurious vertical padding */}
      <section id="reviews" className="py-44 sm:py-64 lg:py-72 bg-[#111111] border-t border-b border-white/10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(253,224,71,0.015)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-24"
          >
            <span className="font-wiggly tracking-[0.15em] text-[#FDE047] text-sm uppercase block">
              Consumer Validation
            </span>
            <h2 className="font-wiggly text-2xl sm:text-3xl lg:text-4xl font-normal text-white mt-4 leading-snug">
              Read authentic feedback from Phoenix locals
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base mt-4">
              From panel upgrades with Tracy to premium solar options chosen after extensive consultations, see why we hold a 4.7-star rating.
            </p>
          </motion.div>

          {/* Filterable, writable Customer Reviews section */}
          <ReviewsSection 
            reviews={reviews}
            onAddReview={handleAddReview}
          />
        </div>
      </section>

      {/* FAQ Section with spacious, luxurious vertical padding */}
      <section className="py-44 sm:py-64 lg:py-72 bg-[#0C0C0C] border-b border-white/10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(253,224,71,0.01)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-24"
          >
            <span className="font-wiggly tracking-[0.15em] text-[#FDE047] text-sm uppercase block">
              Got Questions?
            </span>
            <h2 className="font-wiggly text-3xl font-normal text-white mt-4">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-300 text-xs sm:text-sm mt-4">
              Have questions about pricing, zoning, or licenses? Let&apos;s answer them transparently.
            </p>
          </motion.div>

          <div className="space-y-6 text-left">
            {FAQS.map((faq, index) => {
              const isActive = activeFaq === index;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.35) }}
                  whileHover={{ y: -5, scale: 1.015, transition: { duration: 0.2 } }}
                  className="border border-white/10 rounded-2xl bg-[#111111]/70 backdrop-blur-md hover:bg-[#111111]/90 hover:border-[#FDE047]/30 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-[0_20px_40px_rgba(253,224,71,0.03)]"
                >
                  <button
                    onClick={() => setActiveFaq(isActive ? null : index)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left font-semibold text-white text-sm sm:text-base transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-neutral-400 shrink-0 transition-all duration-300 ${isActive ? 'rotate-180 text-[#FDE047] drop-shadow-[0_0_5px_rgba(253,224,71,0.5)]' : ''}`} />
                  </button>
                  
                  {isActive && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/10 pt-4 bg-[#0C0C0C]/50 backdrop-blur-sm">
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Us Form */}
      <ContactForm />

      {/* Luxury Footer Section */}
      <footer className="bg-[#0C0C0C] text-white pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12 text-left">
            
            {/* Logo/Identity */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <GunmetalLogo size="md" />
                <div>
                  <span className="block serif text-xl font-bold tracking-tight text-white">
                    Phoenix Best
                  </span>
                  <span className="block text-[10px] tracking-widest font-mono text-neutral-200 uppercase leading-none mt-1">
                    Electricians • Licensed 24/7
                  </span>
                </div>
              </div>
              <p className="text-neutral-300 text-xs leading-relaxed max-w-sm mt-3">
                The high-end standard of electrical service across Central Phoenix, Midtown, Paradise Valley, and Camelback East. Open 24 hours.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-mono text-neutral-200 bg-neutral-900/90 border border-white/15 px-2.5 py-1 rounded">
                  ROC # 334918 (L-11) Class-A Electricians
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="label-caps mb-4">Core Specialties</h4>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li><button onClick={() => scrollToBooking('panel_upgrade')} className="hover:text-white hover:underline transition-all">Electrical Panel Upgrades</button></li>
                <li><button onClick={() => scrollToBooking('solar_installation')} className="hover:text-white hover:underline transition-all">Smart Solar Installations</button></li>
                <li><button onClick={() => scrollToBooking('breaker_troubleshooting')} className="hover:text-white hover:underline transition-all">Emergency Breaker Repair</button></li>
                <li><button onClick={() => scrollToBooking('ceiling_fan_lighting')} className="hover:text-white hover:underline transition-all">Ceiling Fan &amp; Light Systems</button></li>
                <li><button onClick={() => scrollToBooking('switches_outlets')} className="hover:text-white hover:underline transition-all">Lutron Switches &amp; Dimmers</button></li>
              </ul>
            </div>

            {/* Office/GMB Details */}
            <div>
              <h4 className="label-caps mb-4">Central Office</h4>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FDE047] shrink-0 mt-0.5" />
                  <span>
                    8929 N Central Ave #53C,<br />
                    Phoenix, AZ 85020<br />
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Floor 1 • Marketplace At Central</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#FDE047] shrink-0" />
                  <a href="tel:6027801140" className="hover:text-white transition-colors font-bold font-mono text-white">
                    (602) 780-1140
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FDE047] shrink-0" />
                  <span>Open 24 Hours / 7 Days</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Lower bottom bar / copy and credentials */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-neutral-300 text-center sm:text-left">
            <p className="text-neutral-300">&copy; {new Date().getFullYear()} Phoenix Best Electricians LLC. All rights reserved.</p>
            
            <div className="flex items-center gap-4">
              <span className="text-neutral-300 hover:text-white cursor-pointer transition-colors hover:underline">Privacy Policy</span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-300 hover:text-white cursor-pointer transition-colors hover:underline">Terms of Service</span>
              <span className="text-neutral-600">•</span>
              
              {/* Secret/Sleek operator portal trigger */}
              <button 
                onClick={() => setIsOwnerConsoleOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 border border-white/10 rounded text-[#FDE047] hover:text-white hover:bg-neutral-850 transition-colors font-semibold"
              >
                <Lock className="w-3 h-3 text-[#FDE047]" /> Operator Portal
              </button>
            </div>
          </div>
        </div>
      </footer>

      </ScrollExpandMedia>

      {/* Sticky Floating Desk Phone for Desktop only */}
      <div className="hidden lg:flex fixed bottom-8 right-8 z-50 items-center gap-3 bg-[#111111]/95 backdrop-blur-md border border-[#FDE047]/30 px-5 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#FDE047]/60 transition-all duration-300 group hover:-translate-y-1">
        <div className="w-10 h-10 rounded-xl bg-[#FDE047]/10 border border-[#FDE047]/25 flex items-center justify-center text-[#FDE047] shrink-0 shadow-[0_0_12px_rgba(253,224,71,0.15)] group-hover:bg-[#FDE047] group-hover:text-[#0C0C0C] transition-all duration-300">
          <Phone className="w-5 h-5 animate-bounce group-hover:animate-none text-[#FDE047] group-hover:text-[#0C0C0C] drop-shadow-[0_0_4px_rgba(253,224,71,0.5)]" />
        </div>
        <div>
          <p className="text-[9px] font-mono tracking-widest text-[#FDE047] uppercase font-bold leading-none">24/7 Dispatch Desk</p>
          <p className="text-neutral-400 text-[10px] leading-tight mt-1">Live Dispatch Agent</p>
          <a href="tel:6027801140" className="text-white text-sm font-extrabold block mt-0.5 hover:text-[#FDE047] transition-colors">
            (602) 780-1140
          </a>
        </div>
      </div>

      {/* Secret Owner Admin Console */}
      {isOwnerConsoleOpen && (
        <OwnerConsole onClose={() => setIsOwnerConsoleOpen(false)} />
      )}

    </div>
  );
}
