import React, { useState } from 'react';
import { 
  Zap, Cpu, Sun, Fan, ToggleRight, Building2, 
  CheckCircle2, ArrowRight, Clock, ArrowLeft, 
  Sparkles, Check, Phone, AlertCircle
} from 'lucide-react';
import { Lead } from '../types';

interface BookingWizardProps {
  onLeadSubmitted: (newLead: Lead) => void;
  initialServiceId?: string;
}

export default function BookingWizard({ onLeadSubmitted, initialServiceId = '' }: BookingWizardProps) {
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<string>(initialServiceId);
  const [scopeSize, setScopeSize] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredTime, setPreferredTime] = useState('Same Day Emergency');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);

  const serviceOptions = [
    { id: 'panel_upgrade', label: 'Electrical Panel Upgrade', icon: Cpu, baseRange: '$1,800 - $3,500', note: 'Expert load calculation' },
    { id: 'solar_installation', label: 'Smart Solar Solutions', icon: Sun, baseRange: '$12k - $25k', note: 'Includes premium consultations' },
    { id: 'breaker_troubleshooting', label: 'Breaker Repair & Troubleshooting', icon: Zap, baseRange: '$150 - $450', note: 'Emergency dispatch available' },
    { id: 'ceiling_fan_lighting', label: 'Ceiling Fan / Fixture Install', icon: Fan, baseRange: '$120 - $350', note: 'Perfect for Phoenix heat' },
    { id: 'switches_outlets', label: 'Smart Switches & Outlets', icon: ToggleRight, baseRange: '$80 - $180', note: 'Upgraded dimmers & safety GFCIs' },
    { id: 'condo_work', label: 'Condo & specialized code work', icon: Building2, baseRange: 'Custom Quote', note: 'HOA & multi-family compliant' },
  ];

  const scopeOptions = {
    panel_upgrade: [
      { id: '100_to_200', label: 'Standard 100A to 200A main service', price: '$1,800 - $2,400', duration: '1 Day' },
      { id: 'heavy_duty_320', label: 'Heavy duty 320A/400A main panel', price: '$2,800 - $3,800', duration: '1-2 Days' },
      { id: 'subpanel_add', label: 'Add 100A subpanel (Garage/ADU)', price: '$950 - $1,500', duration: '1 Day' }
    ],
    solar_installation: [
      { id: 'standard_solar', label: 'Standard Residential Array (5-8kW)', price: '$12,000 - $16,000', duration: '2-3 Days' },
      { id: 'premium_solar_battery', label: 'Premium Solar + Battery Backup (Tesla Powerwall)', price: '$19,000 - $26,000', duration: '3-4 Days' },
      { id: 'consultation', label: 'Professional consultation & shade analysis', price: '$0 (Complimentary)', duration: '1 Hour' }
    ],
    breaker_troubleshooting: [
      { id: 'single_breaker_trip', label: 'Single circuit breaker trips continuously', price: '$150 - $280', duration: '1 Hour' },
      { id: 'partial_outage', label: 'Partial house power loss / burning smell', price: '$250 - $490', duration: '1-2 Hours' },
      { id: 'gfci_fault', label: 'Bathroom/Kitchen GFCI fault troubleshooting', price: '$120 - $220', duration: '1 Hour' }
    ],
    ceiling_fan_lighting: [
      { id: 'single_fan_install', label: 'Assemble and hang 1 ceiling fan', price: '$130 - $220', duration: '1 Hour' },
      { id: 'multi_fan_install', label: 'Install 3+ ceiling fans (Package rate)', price: '$350 - $550', duration: '2-3 Hours' },
      { id: 'recessed_led', label: 'Install architectural recessed LEDs (6-pack)', price: '$480 - $750', duration: '3 Hours' }
    ],
    switches_outlets: [
      { id: 'smart_switch_setup', label: 'Install smart dimmers / custom Lutron switches', price: '$90 - $160', duration: '1 Hour' },
      { id: 'gfci_upgrade', label: 'Install safety GFCI outlets in wet area', price: '$85 - $150', duration: '1 Hour' },
      { id: 'ev_outlet', label: 'Install dedicated NEMA 14-50 EV charging outlet', price: '$450 - $850', duration: '2 Hours' }
    ],
    condo_work: [
      { id: 'condo_general', label: 'Standard electrical update inside unit', price: '$200 - $500', duration: 'Half Day' },
      { id: 'ho_review', label: 'Complete structural update meeting HOA specifications', price: 'Custom Estimate', duration: '1 Day' }
    ]
  };

  const handleNextStep = () => {
    if (step === 1 && !serviceType) return;
    if (step === 2 && !scopeSize) return;

    if (step === 2) {
      setIsCalibrating(true);
      setTimeout(() => {
        setIsCalibrating(false);
        setStep(3);
      }, 1200);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBackStep = () => {
    setStep(prev => prev - 1);
  };

  const calculateEstimate = () => {
    const serviceScopes = scopeOptions[serviceType as keyof typeof scopeOptions] || [];
    const selectedScopeObj = serviceScopes.find(s => s.id === scopeSize);
    return selectedScopeObj ? selectedScopeObj.price : 'Custom Quote';
  };

  const getEstimatedDuration = () => {
    const serviceScopes = scopeOptions[serviceType as keyof typeof scopeOptions] || [];
    const selectedScopeObj = serviceScopes.find(s => s.id === scopeSize);
    return selectedScopeObj ? selectedScopeObj.duration : 'Varies';
  };

  const getSelectedServiceLabel = () => {
    return serviceOptions.find(s => s.id === serviceType)?.label || '';
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) return;

    const estimateValue = calculateEstimate();
    const serviceLabel = getSelectedServiceLabel();
    const serviceScopes = scopeOptions[serviceType as keyof typeof scopeOptions] || [];
    const selectedScopeLabel = serviceScopes.find(s => s.id === scopeSize)?.label || '';

    const newLead: Lead = {
      id: 'PBE-' + Math.floor(100000 + Math.random() * 900000),
      name,
      phone,
      email,
      serviceNeeded: serviceLabel,
      scopeSize: selectedScopeLabel,
      details: details || 'No additional details provided',
      status: 'pending',
      submittedAt: new Date().toLocaleString(),
      estimatedPrice: estimateValue,
      preferredTime
    };

    // Save lead to local storage for realistic persistence
    const savedLeads = JSON.parse(localStorage.getItem('pbe_leads') || '[]');
    savedLeads.unshift(newLead);
    localStorage.setItem('pbe_leads', JSON.stringify(savedLeads));

    setSubmittedLead(newLead);
    onLeadSubmitted(newLead);
    setStep(4);
  };

  const resetForm = () => {
    setStep(1);
    setServiceType('');
    setScopeSize('');
    setDetails('');
    setName('');
    setPhone('');
    setEmail('');
    setPreferredTime('Same Day Emergency');
    setSubmittedLead(null);
  };

  const selectedScopes = scopeOptions[serviceType as keyof typeof scopeOptions] || [];

  return (
    <div className="bg-[#111111]/80 rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-w-2xl mx-auto backdrop-blur-md">
      {/* Header banner */}
      <div className="bg-[#0C0C0C]/50 text-white p-6 sm:p-8 relative border-b border-white/10 backdrop-blur-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Zap className="w-24 h-24 text-[#FDE047] fill-[#FDE047]" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-0.5 bg-[#FDE047] text-[#0C0C0C] font-mono text-[10px] uppercase font-bold tracking-widest rounded">
            Upfront Rates
          </div>
          <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider font-mono">Phoenix Metro Service Zone</span>
        </div>
        <h3 className="serif text-xl sm:text-2xl font-normal tracking-tight">
          Instant Electrician Pricing &amp; Booking
        </h3>
        <p className="text-[#888888] text-xs sm:text-sm mt-1 font-sans">
          Complete {serviceType ? '2 more steps' : 'a quick estimate'} to lock in Tracy&apos;s upfront flat rates.
        </p>

        {/* Custom Step Indicator */}
        <div className="flex items-center gap-3 mt-6">
          {[1, 2, 3, 4].map((num) => (
            <React.Fragment key={num}>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                    step === num
                      ? 'bg-[#FDE047] text-[#0C0C0C] ring-4 ring-[#FDE047]/20 scale-110'
                      : step > num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-900 text-neutral-500'
                  }`}
                >
                  {step > num ? <Check className="w-3 h-3 stroke-[3]" /> : num}
                </div>
                <span className={`text-[10px] uppercase font-semibold tracking-wider font-mono hidden sm:inline ${step === num ? 'text-white' : 'text-neutral-500'}`}>
                  {num === 1 ? 'Needs' : num === 2 ? 'Scope' : num === 3 ? 'Contact' : 'Confirmed'}
                </span>
              </div>
              {num < 4 && <div className={`flex-1 h-[2px] min-w-[20px] rounded-full ${step > num ? 'bg-emerald-500' : 'bg-neutral-900'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Interactive Estimator Body */}
      <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-between bg-transparent">
        
        {/* Step 1: Service Categories Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="label-caps mb-2">
              Step 1: What electrical challenge can we solve?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {serviceOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = serviceType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setServiceType(opt.id);
                      setScopeSize(''); // Reset scope size on service change
                    }}
                    className={`flex items-start text-left p-4 rounded-2xl border transition-all relative ${
                      isSelected
                        ? 'border-[#FDE047] bg-[#0C0C0C] shadow-lg ring-1 ring-[#FDE047]'
                        : 'border-white/10 bg-[#0C0C0C]/85 hover:border-white/20 hover:bg-[#0C0C0C]'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl mr-3.5 transition-colors ${
                      isSelected ? 'bg-[#FDE047] text-[#0C0C0C]' : 'bg-neutral-900 text-neutral-400'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pr-6">
                      <p className="font-semibold text-white text-sm">{opt.label}</p>
                      <p className="text-neutral-400 text-[11px] leading-tight mt-0.5">{opt.note}</p>
                      <span className="block text-[11px] font-mono text-[#FDE047] mt-2 font-medium">
                        Base: {opt.baseRange}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-emerald-500">
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="pt-4 flex justify-end">
              <button
                disabled={!serviceType}
                onClick={handleNextStep}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  serviceType 
                    ? 'bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#0C0C0C] shadow-lg active:scale-98 cursor-pointer' 
                    : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'
                }`}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Specific Scope Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="label-caps">
                Step 2: Refine the project scope
              </p>
              <button 
                onClick={handleBackStep}
                className="flex items-center gap-1 text-xs text-[#888888] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {isCalibrating ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-neutral-900 border-t-[#FDE047] animate-spin" />
                  <Sparkles className="w-5 h-5 text-[#FDE047] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white text-sm">Calibrating Upfront Rates...</p>
                  <p className="text-xs text-[#888888] mt-1 font-mono">Running calculations &amp; Tracy&apos;s workload</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  {selectedScopes.map((scope) => {
                    const isSelected = scopeSize === scope.id;
                    return (
                      <button
                        key={scope.id}
                        onClick={() => setScopeSize(scope.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#FDE047] bg-[#0C0C0C] ring-1 ring-[#FDE047] shadow-lg'
                            : 'border-white/10 bg-[#0C0C0C]/85 hover:border-white/20 hover:bg-[#0C0C0C]'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-white text-sm">{scope.label}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#888888]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" /> est: {scope.duration}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium font-mono text-[10px]">PHOENIX FAIR-RATE COMPLIANT</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block font-mono text-sm font-semibold text-[#FDE047]">
                            {scope.price}
                          </span>
                          <span className="block text-[10px] text-neutral-400 mt-0.5">Estimated</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider">
                    Add any extra context (Tripped breaker count, ceiling high, etc.)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="E.g., Panel is located in the garage, ceiling fan is 12ft high, breaker didn't reset after we ran the AC."
                    className="w-full p-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm min-h-[80px]"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={handleBackStep}
                    className="px-5 py-3 rounded-xl text-sm font-medium border border-white/10 text-[#888888] hover:text-white hover:bg-neutral-900 transition-all"
                  >
                    Back
                  </button>
                  <button
                    disabled={!scopeSize}
                    onClick={handleNextStep}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                      scopeSize 
                        ? 'bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#0C0C0C] shadow-lg active:scale-98 cursor-pointer' 
                        : 'bg-neutral-900 text-[#888888] cursor-not-allowed'
                    }`}
                  >
                    Generate Estimate <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Contact details & lock pricing */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="label-caps">
                Step 3: Secure quote &amp; Lock-in schedule
              </p>
              <button 
                type="button"
                onClick={handleBackStep}
                className="flex items-center gap-1 text-xs text-[#888888] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Price Preview Card */}
            <div className="bg-[#0C0C0C] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-[#FDE047] border border-white/5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#FDE047] font-semibold uppercase tracking-wider font-mono">
                  Guaranteed Est. Range Locked
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white">
                    {calculateEstimate()}
                  </span>
                  <span className="text-xs text-[#888888]">({getEstimatedDuration()} active labor)</span>
                </div>
                <p className="text-neutral-400 text-[11px] mt-1 leading-normal">
                  Our price includes basic diagnostic, parts, and a 1-year performance warranty. No surprise dispatch fees.
                </p>
              </div>
            </div>

            {/* Input grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sophie Copeland"
                  className="w-full p-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                  Mobile Number (For Tracy Dispatch Alert)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. (602) 780-1140"
                  className="w-full p-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                  Email Address (For Invoices/Quotes)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sophie@example.com"
                  className="w-full p-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                  Preferred Schedule Window
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full p-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm"
                >
                  <option value="Same Day Emergency" className="bg-[#111111] text-white">⚡ Same-Day Emergency Priority</option>
                  <option value="Tomorrow Morning" className="bg-[#111111] text-white">Tomorrow Morning (8AM - 12PM)</option>
                  <option value="Tomorrow Afternoon" className="bg-[#111111] text-white">Tomorrow Afternoon (1PM - 5PM)</option>
                  <option value="Later this Week" className="bg-[#111111] text-white">Later this Week (Flexible Schedule)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center gap-4">
              <button
                type="button"
                onClick={handleBackStep}
                className="px-5 py-3 rounded-xl text-sm font-medium border border-white/10 text-[#888888] hover:text-white hover:bg-neutral-900 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#0C0C0C] shadow-lg active:scale-98 transition-all"
              >
                Secure Guaranteed Rate <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Beautiful Confirmation & Dispatch Simulation */}
        {step === 4 && submittedLead && (
          <div className="space-y-6 py-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-white/10 pb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-mono text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Quote Guaranteed &amp; Schedule Held
                </p>
                <h4 className="serif text-lg font-bold text-white mt-1">
                  Awesome, {submittedLead.name.split(' ')[0]}! Your Ticket is Active.
                </h4>
              </div>
              <div className="text-right font-mono bg-[#0C0C0C] px-3 py-1.5 rounded-lg border border-white/10">
                <span className="block text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Ticket ID</span>
                <span className="text-xs font-bold text-[#FDE047]">{submittedLead.id}</span>
              </div>
            </div>

            {/* Interactive Live dispatch status card */}
            <div className="bg-[#0C0C0C] text-white p-5 rounded-2xl relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Clock className="w-20 h-20 text-[#FDE047]" />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FDE047] animate-ping" />
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FDE047] absolute" />
                <span className="text-xs font-mono font-bold tracking-widest text-[#FDE047] uppercase ml-1">
                  Dispatch status: Contacting Tracy
                </span>
              </div>

              <div className="space-y-3 relative z-10 text-left">
                <div className="flex justify-between items-center text-xs text-neutral-400 border-b border-white/10 pb-2">
                  <span>Service Request</span>
                  <span className="font-medium text-white">{submittedLead.serviceNeeded}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-400 border-b border-white/10 pb-2">
                  <span>Locked Estimate</span>
                  <span className="font-mono font-medium text-[#FDE047]">{submittedLead.estimatedPrice}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Schedule Slot</span>
                  <span className="font-medium text-white">{submittedLead.preferredTime}</span>
                </div>
              </div>

              <div className="mt-5 p-3.5 bg-[#111111] rounded-xl border border-white/10 flex items-start gap-3 text-left">
                <AlertCircle className="w-4 h-4 text-[#FDE047] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-neutral-300 leading-normal">
                    Tracy is reviewing your requested scope: <span className="text-[#FDE047] font-medium italic">“{submittedLead.scopeSize}”</span>. You will receive an automated text update at <span className="font-mono text-white font-semibold">{submittedLead.phone}</span> once dispatch confirms.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="tel:6027801140"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 border border-white/10 hover:border-[#FDE047] hover:bg-[#0C0C0C] rounded-xl text-white text-sm font-semibold transition-all"
              >
                <Phone className="w-4 h-4 text-[#FDE047]" /> Speed Up via Call: (602) 780-1140
              </a>
              <button
                onClick={resetForm}
                className="py-3 px-5 bg-neutral-900 hover:bg-neutral-850 rounded-xl text-neutral-300 hover:text-white text-sm font-medium transition-all border border-white/10"
              >
                Create Another Estimate
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
