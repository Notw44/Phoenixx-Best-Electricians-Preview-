import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowRight, CheckCircle, Calculator, Info, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lead } from '../types';

interface QuoteCalculatorProps {
  onLeadSubmitted: (newLead: Lead) => void;
}

type ProjectCategory = 'panel' | 'ev_charger' | 'smart_lighting' | 'fan_lighting' | 'surge_outlets';

export default function QuoteCalculator({ onLeadSubmitted }: QuoteCalculatorProps) {
  const [category, setCategory] = useState<ProjectCategory>('panel');
  
  // Panel state
  const [panelAmps, setPanelAmps] = useState<number>(200);
  const [needsMeterRelocation, setNeedsMeterRelocation] = useState<boolean>(false);
  
  // EV Charger state
  const [chargerDistance, setChargerDistance] = useState<string>('medium'); // close (<15ft), medium (15-50ft), far (50ft+)
  const [isDualCharger, setIsDualCharger] = useState<boolean>(false);

  // Smart Lighting state
  const [numSwitches, setNumSwitches] = useState<number>(4);
  const [needsHub, setNeedsHub] = useState<boolean>(true);

  // Fan & Fixture state
  const [numFixtures, setNumFixtures] = useState<number>(2);
  const [ceilingHeight, setCeilingHeight] = useState<string>('standard'); // standard, high

  // Surge & Outlets state
  const [includeSurgeUnit, setIncludeSurgeUnit] = useState<boolean>(true);
  const [numOutlets, setNumOutlets] = useState<number>(3);

  // Form Submission State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cost calculations
  const [estimateRange, setEstimateRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    let min = 0;
    let max = 0;

    switch (category) {
      case 'panel':
        if (panelAmps === 100) {
          min = 1600; max = 2200;
        } else if (panelAmps === 200) {
          min = 2400; max = 3200;
        } else { // 400A
          min = 4200; max = 5600;
        }
        if (needsMeterRelocation) {
          min += 1200;
          max += 1800;
        }
        break;
      case 'ev_charger':
        min = isDualCharger ? 850 : 450;
        max = isDualCharger ? 1200 : 750;
        if (chargerDistance === 'medium') {
          min += 200; max += 350;
        } else if (chargerDistance === 'far') {
          min += 600; max += 900;
        }
        break;
      case 'smart_lighting':
        min = numSwitches * 125;
        max = numSwitches * 165;
        if (needsHub) {
          min += 250; max += 350;
        }
        break;
      case 'fan_lighting':
        const costPerFixtureMin = ceilingHeight === 'high' ? 260 : 160;
        const costPerFixtureMax = ceilingHeight === 'high' ? 380 : 240;
        min = numFixtures * costPerFixtureMin;
        max = numFixtures * costPerFixtureMax;
        break;
      case 'surge_outlets':
        min = numOutlets * 85;
        max = numOutlets * 115;
        if (includeSurgeUnit) {
          min += 340; max += 480;
        }
        break;
    }

    setEstimateRange({ min, max });
  }, [category, panelAmps, needsMeterRelocation, chargerDistance, isDualCharger, numSwitches, needsHub, numFixtures, ceilingHeight, includeSurgeUnit, numOutlets]);

  const getDetailsString = () => {
    switch (category) {
      case 'panel':
        return `Panel Upgrade: ${panelAmps}A panel. ${needsMeterRelocation ? 'Requires' : 'No'} meter relocation.`;
      case 'ev_charger':
        return `EV Charger: ${isDualCharger ? 'Dual' : 'Single'} port setup. Distance to panel: ${chargerDistance === 'close' ? '<15ft' : chargerDistance === 'medium' ? '15-50ft' : '50ft+'}.`;
      case 'smart_lighting':
        return `Smart Lighting: ${numSwitches} Lutron/Crestron switches. ${needsHub ? 'Includes' : 'Excludes'} smart hub controller.`;
      case 'fan_lighting':
        return `Fan & Lighting: ${numFixtures} fixtures on ${ceilingHeight === 'high' ? 'High/Vaulted' : 'Standard'} ceiling.`;
      case 'surge_outlets':
        return `Surge & Outlets: ${numOutlets} outlets. ${includeSurgeUnit ? 'Includes Whole-Home Surge protection unit.' : 'No surge protection.'}`;
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'panel': return 'Electrical Panel Upgrade';
      case 'ev_charger': return 'Smart EV Infrastructure';
      case 'smart_lighting': return 'Lutron/Crestron Ambient Control';
      case 'fan_lighting': return 'Premium Ceiling Fan & Fixtures';
      case 'surge_outlets': return 'Whole-Home Surge & Receptacles';
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMsg('Please complete all contact fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const serviceLabel = getCategoryLabel();
    const detailsText = getDetailsString();
    const priceText = `$${estimateRange.min.toLocaleString()} - $${estimateRange.max.toLocaleString()}`;

    let savedToSupabase = false;

    // 1. Save directly to Supabase if available
    if (supabase) {
      try {
        const { error } = await supabase
          .from('quotes')
          .insert([{
            name: customerName.trim(),
            email: customerEmail.trim(),
            phone: customerPhone.trim(),
            service_requested: serviceLabel,
            project_description: `[Interactive Estimator Quote] ${detailsText}. Price Range: ${priceText}`,
            created_at: new Date().toISOString()
          }]);

        if (!error) {
          savedToSupabase = true;
          console.log("Interactive Quote saved successfully in Supabase 'quotes'.");
        } else {
          console.warn("Direct Supabase interactive quote insert failed:", error.message);
        }
      } catch (err) {
        console.error("Direct Supabase interactive quote exception:", err);
      }
    }

    // 2. Submit to local Express backend /api/leads
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          serviceNeeded: serviceLabel,
          scopeSize: 'Interactive Quote Estimator',
          details: detailsText,
          estimatedPrice: priceText,
          preferredTime: 'Instant Request'
        })
      });

      if (response.ok) {
        const savedLead: Lead = await response.json();
        onLeadSubmitted(savedLead);
        setSubmitSuccess(true);
        resetForm();
      } else {
        if (savedToSupabase) {
          setSubmitSuccess(true);
          resetForm();
        } else {
          throw new Error('Could not submit quote. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Interactive submission error:', err);
      if (savedToSupabase) {
        setSubmitSuccess(true);
        resetForm();
      } else {
        setErrorMsg(err.message || 'Connection lost. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
  };

  return (
    <div id="quote-estimator" className="relative w-full max-w-5xl mx-auto rounded-3xl border border-white/10 bg-[#121212] overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Control Panel: Selector & Customizers */}
        <div className="lg:col-span-7 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-[#FDE047]" />
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FDE047]">Configure Project Details</h3>
          </div>

          {/* Project Type Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
            {(['panel', 'ev_charger', 'smart_lighting', 'fan_lighting', 'surge_outlets'] as ProjectCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-3 px-2 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                  category === cat
                    ? 'border-[#FDE047] bg-[#FDE047]/10 text-white shadow-[0_0_15px_rgba(253,224,71,0.15)]'
                    : 'border-white/5 bg-neutral-900/50 text-neutral-400 hover:border-white/15 hover:text-white'
                }`}
              >
                {cat === 'panel' && 'Panel'}
                {cat === 'ev_charger' && 'EV Charger'}
                {cat === 'smart_lighting' && 'Smart Light'}
                {cat === 'fan_lighting' && 'Fan/Fixture'}
                {cat === 'surge_outlets' && 'Surge/Plug'}
              </button>
            ))}
          </div>

          {/* Dynamic Configuration Controls with Staggered Animations */}
          <div className="min-h-[180px] flex flex-col justify-center py-4 border-y border-white/5 my-6">
            <AnimatePresence mode="wait">
              {category === 'panel' && (
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-xs font-mono text-neutral-400 uppercase mb-3">Service Panel Amperage</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[100, 200, 400].map((amp) => (
                        <button
                          key={amp}
                          type="button"
                          onClick={() => setPanelAmps(amp)}
                          className={`py-3.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                            panelAmps === amp
                              ? 'border-white bg-white/10 text-white'
                              : 'border-white/5 bg-neutral-900/40 text-neutral-400 hover:border-white/10 hover:text-white'
                          }`}
                        >
                          {amp} Amp
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/60 border border-white/5">
                    <div className="pr-4">
                      <span className="block text-xs font-bold text-white uppercase mb-1">Meter Box Relocation</span>
                      <span className="block text-[11px] text-neutral-400">Select if utility provider requires relocating meter box outside</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNeedsMeterRelocation(!needsMeterRelocation)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        needsMeterRelocation ? 'bg-[#FDE047]' : 'bg-neutral-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                          needsMeterRelocation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}

              {category === 'ev_charger' && (
                <motion.div
                  key="ev_charger"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-xs font-mono text-neutral-400 uppercase mb-3">Wire Routing Distance to Main Panel</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'close', label: '< 15 ft', desc: 'Direct / Same Wall' },
                        { id: 'medium', label: '15 - 50 ft', desc: 'Across Garage' },
                        { id: 'far', label: '50+ ft', desc: 'Opposite Side' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setChargerDistance(item.id)}
                          className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                            chargerDistance === item.id
                              ? 'border-white bg-white/10 text-white'
                              : 'border-white/5 bg-neutral-900/40 text-neutral-400 hover:border-white/10'
                          }`}
                        >
                          <span className="block font-bold text-sm">{item.label}</span>
                          <span className="block text-[9px] text-neutral-500 mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/60 border border-white/5">
                    <div>
                      <span className="block text-xs font-bold text-white uppercase mb-1">Dual Charger Configuration</span>
                      <span className="block text-[11px] text-neutral-400">Wiring setup supporting two Tesla or premium chargers simultaneously</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDualCharger(!isDualCharger)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        isDualCharger ? 'bg-[#FDE047]' : 'bg-neutral-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                          isDualCharger ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}

              {category === 'smart_lighting' && (
                <motion.div
                  key="smart_lighting"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-mono text-neutral-400 uppercase">Number of Lutron/Crestron Switches</label>
                      <span className="text-sm font-bold text-white font-mono">{numSwitches} Switches</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={numSwitches}
                      onChange={(e) => setNumSwitches(parseInt(e.target.value))}
                      className="w-full accent-[#FDE047] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-2 font-mono">
                      <span>1 switch</span>
                      <span>8 switches</span>
                      <span>16 switches</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/60 border border-white/5">
                    <div>
                      <span className="block text-xs font-bold text-white uppercase mb-1">Include Smart Control Hub</span>
                      <span className="block text-[11px] text-neutral-400">Central bridge (RA3 / Homeworks) for wireless ecosystem pairing</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNeedsHub(!needsHub)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        needsHub ? 'bg-[#FDE047]' : 'bg-neutral-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                          needsHub ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}

              {category === 'fan_lighting' && (
                <motion.div
                  key="fan_lighting"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-mono text-neutral-400 uppercase">Number of Fans / Fixtures</label>
                      <span className="text-sm font-bold text-white font-mono">{numFixtures} Fixtures</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={numFixtures}
                      onChange={(e) => setNumFixtures(parseInt(e.target.value))}
                      className="w-full accent-[#FDE047] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-2 font-mono">
                      <span>1 Unit</span>
                      <span>4 Units</span>
                      <span>8 Units</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-400 uppercase mb-3">Ceiling Height Class</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'standard', label: 'Standard (8 - 10 ft)', desc: 'Standard A-Frame Ladder Setup' },
                        { id: 'high', label: 'High / Vaulted (12+ ft)', desc: 'Scaffolding / Extension Reach Required' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCeilingHeight(item.id)}
                          className={`py-3 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                            ceilingHeight === item.id
                              ? 'border-white bg-white/10 text-white'
                              : 'border-white/5 bg-neutral-900/40 text-neutral-400 hover:border-white/10'
                          }`}
                        >
                          <span className="block font-bold text-xs">{item.label}</span>
                          <span className="block text-[9px] text-neutral-500 mt-0.5 leading-tight">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {category === 'surge_outlets' && (
                <motion.div
                  key="surge_outlets"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-mono text-neutral-400 uppercase">New Dedicated Outlets / Receptacles</label>
                      <span className="text-sm font-bold text-white font-mono">{numOutlets} Outlets</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={numOutlets}
                      onChange={(e) => setNumOutlets(parseInt(e.target.value))}
                      className="w-full accent-[#FDE047] h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 mt-2 font-mono">
                      <span>1 Plug</span>
                      <span>6 Plugs</span>
                      <span>12 Plugs</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900/60 border border-white/5">
                    <div>
                      <span className="block text-xs font-bold text-white uppercase mb-1">Whole-House Surge Guard (Type 1/2)</span>
                      <span className="block text-[11px] text-neutral-400">Protects home appliances & delicate circuit boards from grids surges</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeSurgeUnit(!includeSurgeUnit)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        includeSurgeUnit ? 'bg-[#FDE047]' : 'bg-neutral-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                          includeSurgeUnit ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950/40 border border-white/5 text-[11px] text-neutral-400">
            <Info className="w-4 h-4 text-[#FDE047] shrink-0 mt-0.5" />
            <p>Our custom estimations reflect professional licensed labor, parts routing, municipal inspections, and lifetime copper connection guarantees in Central Phoenix.</p>
          </div>
        </div>

        {/* Right Panel: Cost Estimate & Dispatch Form */}
        <div className="lg:col-span-5 bg-[#181818] p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="text-center pb-6 border-b border-white/5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-1">Phoenix Best Estimate</span>
              <h4 className="serif text-lg text-white font-normal mb-4">{getCategoryLabel()}</h4>
              
              <div className="py-5 px-4 bg-black/40 border border-white/5 rounded-2xl inline-block w-full">
                <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 block mb-1">Estimated Cost Range</span>
                <span className="text-3xl sm:text-4xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 font-bold block">
                  ${estimateRange.min.toLocaleString()} - ${estimateRange.max.toLocaleString()}
                </span>
                <span className="text-[9px] font-mono uppercase text-[#FDE047] block mt-2">Licensed Upfront Rates</span>
              </div>
            </div>

            <div className="py-5 space-y-3.5 border-b border-white/5 text-xs">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Central Phoenix Base Service Fee</span>
                <span className="font-mono text-white">$0 (Waived)</span>
              </div>
              <div className="flex justify-between items-start text-neutral-400">
                <span>Scope Specifications</span>
                <span className="text-white text-right max-w-[200px] block leading-tight">{getDetailsString()}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Materials & Lifetime Copper Warranty</span>
                <span className="font-mono text-[#FDE047]">Included</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            {submitSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-6 bg-[#FDE047]/5 border border-[#FDE047]/15 rounded-2xl"
              >
                <CheckCircle className="w-10 h-10 text-[#FDE047] mx-auto mb-3" />
                <h5 className="font-bold text-white text-sm mb-1">Estimate Reserved Successfully</h5>
                <p className="text-[11px] text-neutral-400 leading-relaxed mb-4">Tracy has locked in this custom calculation for you. We will call you within 15 minutes.</p>
                <button 
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="text-xs font-bold font-mono text-white underline cursor-pointer"
                >
                  Recalculate or Change Service
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitQuote} className="space-y-4">
                <span className="block text-xs font-bold text-white uppercase mb-2">Claim This Quote Estimate</span>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FDE047]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FDE047]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FDE047]"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="text-red-400 text-[10px] bg-red-950/40 border border-red-500/20 p-2 rounded-lg flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl font-bold bg-[#FDE047] hover:bg-[#FDE047]/90 active:scale-[0.98] text-black transition-all cursor-pointer text-xs flex items-center justify-center gap-2 uppercase tracking-wider animate-luxury-glow"
                >
                  {isSubmitting ? 'Reserving Estimate...' : 'Dispatch Quote Request'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
