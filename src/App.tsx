import React, { useState, useEffect } from 'react';
import { import StackedImages from "./components/StackedImages"
  Zap, ShieldCheck, Award, Phone, Clock, MapPin, 
  Check, ChevronDown, Sparkles, Wrench, ArrowRight, 
  HelpCircle, Lock, Star 
} from 'lucide-react';

import Header from './components/Header';
import BookingWizard from './components/BookingWizard';
import ReviewsSection from './components/ReviewsSection';
import InteractiveMap from './components/InteractiveMap';
import OwnerConsole from './components/OwnerConsole';
import ShaderBackground from '@/components/ui/asd';

import { SERVICES, REVIEWS, FAQS } from './data';
import { Lead, Review } from './types';

export default function App() 
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isOwnerConsoleOpen, setIsOwnerConsoleOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  const handleAddReview = (newReview: Review) => {
    setReviews(prev => [newReview, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white font-sans leading-relaxed relative overflow-x-hidden">
      
      {/* Premium WebGL Cybernetic Radar Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <ShaderBackground />
      </div>

      {/* Premium Navigation Header */}
      <Header onOpenBooking={() => scrollToBooking()} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 border-b border-white/10">
        {/* Ambient subtle warm gold glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FDE047]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Rating Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] border border-white/10 rounded-full shadow-md mb-6 animate-fade-in">
            <div className="flex items-center gap-0.5 text-[#FDE047]">
              {[1, 2, 3, 4, 5].map(n => <Star key={n} className="w-3.5 h-3.5 fill-[#FDE047] text-[#FDE047] stroke-[#0C0C0C]" />)}
            </div>
            <span className="text-xs font-semibold text-neutral-300">
              4.7 Rating (129+ Verified Reviews)
            </span>
          </div>

          {/* Headline */}
          <h1 className="serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Elite Electrical Craftsmanship <br />
            <span className="italic font-normal text-[#FDE047]">
              Upfront Rates, 24/7 Priority
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base sm:text-lg text-[#888888] max-w-2xl mx-auto font-normal leading-relaxed">
            Phoenix&apos;s high-end choice for master panel upgrades, premium solar consultations, and expert troubleshooting. Serviced with absolute clarity and zero hidden fees.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col xs:flex-row justify-center items-center gap-4">
            <button
              onClick={() => scrollToBooking()}
              className="group w-full xs:w-auto px-8 py-4 bg-gradient-to-r from-[#FDE047] via-[#FFF59D] to-[#EAB308] hover:from-[#FFF59D] hover:to-[#FDE047] text-[#0C0C0C] rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(253,224,71,0.35)] hover:shadow-[0_0_35px_rgba(253,224,71,0.7)] active:scale-98 flex items-center justify-center gap-2.5 border border-yellow-200/50"
            >
              <Sparkles className="w-4 h-4 text-[#0C0C0C] animate-pulse" />
              <span>CALCULATE INSTANT PRICE</span>
              <ArrowRight className="w-4 h-4 text-[#0C0C0C] group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <a
              href="tel:6027801140"
              className="w-full xs:w-auto px-8 py-4 bg-[#111111] hover:bg-neutral-900 text-white rounded-2xl text-sm font-semibold transition-all shadow-md border border-white/10 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#FDE047] animate-bounce" /> Dispatch Desk: (602) 780-1140
            </a>
          </div>

          {/* Trust points bar */}
          <div className="mt-16 sm:mt-24 border-t border-white/10 pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              { icon: ShieldCheck, title: 'Fully Licensed & Bonded', desc: 'Arizona Class L-11 ROC compliant' },
              { icon: Clock, title: '24-Hour Emergency Dispatch', desc: 'On-scene within 45 minutes guaranteed' },
              { icon: Award, title: 'Upfront Flat pricing', desc: 'Clear quote ranges before we touch a tool' },
              { icon: Sparkles, title: 'Lifetime Workmanship', desc: '100% guarantee on all parts & labor' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#111111] border border-white/10 flex items-center justify-center text-[#FDE047] shadow-md">
                    <Icon className="w-5 h-5 text-[#FDE047]" />
                  </div>
                  <h4 className="serif font-bold text-white text-base">{item.title}</h4>
                  <p className="text-xs text-[#888888] leading-normal">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialties Bento Grid Section */}
      <section id="services" className="py-20 sm:py-32 bg-[#0C0C0C] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="label-caps">
              Elite Specializations
            </span>
            <h2 className="serif text-3xl sm:text-4xl font-normal text-white mt-4">
              Electrical services engineered with absolute precision
            </h2>
            <p className="text-[#888888] text-sm sm:text-base mt-2">
              Whether updating historic central Phoenix properties or equipping new construction solar systems, Tracy and our crew deliver flawless execution.
            </p>
          </div>

          {/* Dynamic Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((srv) => (
              <div 
                key={srv.id}
                className="group border border-white/10 hover:border-white/20 rounded-3xl p-6 sm:p-8 bg-[#111111]/75 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-[#0C0C0C] border border-white/10 rounded-2xl text-[#FDE047] group-hover:bg-[#FDE047] group-hover:text-[#0C0C0C] transition-colors">
                      <Wrench className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-[10px] font-mono text-[#888888] bg-[#0C0C0C] border border-white/10 px-2 py-0.5 rounded">
                      ROC Class-A
                    </span>
                  </div>

                  <h3 className="serif text-xl font-bold text-white">
                    {srv.title}
                  </h3>
                  <p className="text-[#888888] text-xs sm:text-sm leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-[#888888] mb-4">
                    <span>Pricing guideline</span>
                    <span className="font-mono font-semibold text-[#FDE047]">{srv.basePriceRange}</span>
                  </div>

                  <button
                    onClick={() => scrollToBooking(srv.id)}
                    className="w-full py-2.5 bg-[#0C0C0C] hover:bg-[#FDE047] text-white hover:text-[#0C0C0C] font-semibold text-xs rounded-xl transition-all border border-white/10 hover:border-transparent shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    Estimate Cost <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-center text-[10px] text-[#888888] mt-2 font-medium font-mono">
                    {srv.popularFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Lead Generator Block */}
      <section id="estimate-section" className="py-20 sm:py-32 bg-[#111111] text-white relative border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
            
            {/* Left Content / Pricing pitch */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-left">
              <div>
                <span className="label-caps">
                  Fair Price Guarantee
                </span>
                <h2 className="serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white mt-4 leading-tight">
                  Transparent upfront rates before we start.
                </h2>
                <p className="text-[#888888] text-sm sm:text-base mt-4 leading-relaxed font-normal">
                  No surprise diagnostics, no inflated emergency markups. We utilize regional Phoenix fair-rate databases to calculate clear, guaranteed quotes. Lock in your slot with Tracy in 60 seconds.
                </p>
              </div>

              {/* Guarantees checklist */}
              <div className="space-y-4">
                {[
                  '100% Upfront Quotes (No visual-estimate gimmicks)',
                  'Direct communication with Tracy (No call centers)',
                  '5-Point Safety System Diagnostic included with every booking',
                  'Clean workspace pledge (We leave your home cleaner than we found it)'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FDE047]/10 border border-[#FDE047]/30 flex items-center justify-center text-[#FDE047] mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-neutral-300 text-xs sm:text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* Instant Call Out */}
              <div className="bg-[#111111]/80 backdrop-blur-md border border-white/15 p-5 rounded-3xl flex items-center gap-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-[#FDE047]/10 border border-[#FDE047]/25 flex items-center justify-center text-[#FDE047] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">Emergency Line</p>
                  <p className="text-white font-semibold text-sm sm:text-base leading-tight mt-0.5">Need immediate dispatch?</p>
                  <a href="tel:6027801140" className="text-[#FDE047] text-xs sm:text-sm font-semibold hover:underline block mt-0.5">
                    Call Dispatcher now: (602) 780-1140
                  </a>
                </div>
              </div>
            </div>

            {/* Right: The Interactive Booking wizard component */}
            <div className="lg:col-span-7">
              <BookingWizard 
                onLeadSubmitted={handleLeadSubmitted}
                initialServiceId={selectedServiceId}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Live Radar Coverage Zone section */}
      <section id="coverage" className="py-20 sm:py-32 bg-[#0C0C0C] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="label-caps">
              Phoenix Metro Service Radar
            </span>
            <h2 className="serif text-3xl sm:text-4xl font-normal text-white mt-4">
              Dispatched daily near Central Avenue
            </h2>
            <p className="text-[#888888] text-sm sm:text-base mt-2">
              Based at the Marketplace At Central, our trucks patrol neighborhoods surrounding 8929 N Central Ave, keeping transit times minimal and emergency dispatches instantaneous.
            </p>
          </div>

          {/* Interactive Radar Coverage component */}
          <InteractiveMap />
        </div>
      </section>

      {/* Customer Testimonials & Verified reviews section */}
      <section id="reviews" className="py-20 sm:py-32 bg-[#111111] border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="label-caps">
              Consumer Validation
            </span>
            <h2 className="serif text-3xl sm:text-4xl font-normal text-white mt-4">
              Read authentic feedback from Phoenix locals
            </h2>
            <p className="text-[#888888] text-sm sm:text-base mt-2">
              From panel upgrades with Tracy to premium solar options chosen after extensive consultations, see why we hold a 4.7-star rating.
            </p>
          </div>

          {/* Filterable, writable Customer Reviews section */}
          <ReviewsSection 
            reviews={reviews}
            onAddReview={handleAddReview}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32 bg-[#0C0C0C] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="label-caps">
              Got Questions?
            </span>
            <h2 className="serif text-3xl font-normal text-white mt-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#888888] text-xs sm:text-sm mt-2">
              Have questions about pricing, zoning, or licenses? Let&apos;s answer them transparently.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {FAQS.map((faq, index) => {
              const isActive = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="border border-white/10 rounded-2xl bg-[#111111]/70 backdrop-blur-md hover:bg-[#111111]/90 overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg"
                >
                  <button
                    onClick={() => setActiveFaq(isActive ? null : index)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left font-semibold text-white text-sm sm:text-base transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-[#888888] shrink-0 transition-transform duration-300 ${isActive ? 'rotate-180 text-[#FDE047]' : ''}`} />
                  </button>
                  
                  {isActive && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-[#888888] leading-relaxed border-t border-white/10 pt-4 bg-[#0C0C0C]/50 backdrop-blur-sm">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Luxury Footer Section */}
      <footer className="bg-[#0C0C0C] text-white pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12 text-left">
            
            {/* Logo/Identity */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/15 flex items-center justify-center text-[#FDE047] shadow-md">
                  <Zap className="w-5.5 h-5.5 fill-[#FDE047] text-[#FDE047] stroke-[1.5]" />
                </div>
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

      {/* Secret Owner Admin Console */}
      {isOwnerConsoleOpen && (
        <OwnerConsole onClose={() => setIsOwnerConsoleOpen(false)} />
      )}

    </div>
  );
}
