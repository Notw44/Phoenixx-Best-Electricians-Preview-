import React, { useState } from 'react';
import { 
  Zap, Cpu, Sun, Fan, ToggleRight, Building2, 
  CheckCircle2, ArrowRight, Clock, ArrowLeft, 
  Sparkles, Check, Phone, AlertCircle, UploadCloud, FileImage, X
} from 'lucide-react';
import { Lead } from '../types';
import { supabase } from '../lib/supabase';

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

  // File upload state
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const serviceOptions = [
    { id: 'panel_upgrade', label: 'Electrical Panel Upgrade', icon: Cpu, baseRange: 'Custom Quote', note: 'Expert load calculation' },
    { id: 'solar_installation', label: 'Smart Solar Solutions', icon: Sun, baseRange: 'Custom Quote', note: 'Includes premium consultations' },
    { id: 'breaker_troubleshooting', label: 'Breaker Repair & Troubleshooting', icon: Zap, baseRange: 'Custom Quote', note: 'Emergency dispatch available' },
    { id: 'ceiling_fan_lighting', label: 'Ceiling Fan / Fixture Install', icon: Fan, baseRange: 'Custom Quote', note: 'Perfect for Phoenix heat' },
    { id: 'switches_outlets', label: 'Smart Switches & Outlets', icon: ToggleRight, baseRange: 'Custom Quote', note: 'Upgraded dimmers & safety GFCIs' },
    { id: 'condo_work', label: 'Condo & specialized code work', icon: Building2, baseRange: 'Custom Quote', note: 'HOA & multi-family compliant' },
  ];

  const scopeOptions = {
    panel_upgrade: [
      { id: '100_to_200', label: 'Standard 100A to 200A main service', price: 'Custom Quote', duration: '1 Day' },
      { id: 'heavy_duty_320', label: 'Heavy duty 320A/400A main panel', price: 'Custom Quote', duration: '1-2 Days' },
      { id: 'subpanel_add', label: 'Add 100A subpanel (Garage/ADU)', price: 'Custom Quote', duration: '1 Day' }
    ],
    solar_installation: [
      { id: 'standard_solar', label: 'Standard Residential Array (5-8kW)', price: 'Custom Quote', duration: '2-3 Days' },
      { id: 'premium_solar_battery', label: 'Premium Solar + Battery Backup (Tesla Powerwall)', price: 'Custom Quote', duration: '3-4 Days' },
      { id: 'consultation', label: 'Professional consultation & shade analysis', price: 'Complimentary', duration: '1 Hour' }
    ],
    breaker_troubleshooting: [
      { id: 'single_breaker_trip', label: 'Single circuit breaker trips continuously', price: 'Custom Quote', duration: '1 Hour' },
      { id: 'partial_outage', label: 'Partial house power loss / burning smell', price: 'Custom Quote', duration: '1-2 Hours' },
      { id: 'gfci_fault', label: 'Bathroom/Kitchen GFCI fault troubleshooting', price: 'Custom Quote', duration: '1 Hour' }
    ],
    ceiling_fan_lighting: [
      { id: 'single_fan_install', label: 'Assemble and hang 1 ceiling fan', price: 'Custom Quote', duration: '1 Hour' },
      { id: 'multi_fan_install', label: 'Install 3+ ceiling fans (Package rate)', price: 'Custom Quote', duration: '2-3 Hours' },
      { id: 'recessed_led', label: 'Install architectural recessed LEDs (6-pack)', price: 'Custom Quote', duration: '3 Hours' }
    ],
    switches_outlets: [
      { id: 'smart_switch_setup', label: 'Install smart dimmers / custom Lutron switches', price: 'Custom Quote', duration: '1 Hour' },
      { id: 'gfci_upgrade', label: 'Install safety GFCI outlets in wet area', price: 'Custom Quote', duration: '1 Hour' },
      { id: 'ev_outlet', label: 'Install dedicated NEMA 14-50 EV charging outlet', price: 'Custom Quote', duration: '2 Hours' }
    ],
    condo_work: [
      { id: 'condo_general', label: 'Standard electrical update inside unit', price: 'Custom Quote', duration: 'Half Day' },
      { id: 'ho_review', label: 'Complete structural update meeting HOA specifications', price: 'Custom Quote', duration: '1 Day' }
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

  // --- File Upload & Drag/Drop Handlers ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setUploading(true);

    if (!supabase) {
      // Offline/Demo Mode fallback: Convert to data url base64 so it can be previewed immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('electrical-photos')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.warn("Direct upload to Supabase bucket 'electrical-photos' failed. Converting to Base64 data URL fallback:", error.message);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoUrl(reader.result as string);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('electrical-photos')
          .getPublicUrl(uniqueFileName);
        
        setPhotoUrl(publicUrl);
        setUploading(false);
      }
    } catch (err) {
      console.error("Exception uploading to storage. Falling back to local Base64:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setPhotoUrl('');
    setFileName('');
    setUploading(false);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) return;

    const estimateValue = calculateEstimate();
    const serviceLabel = getSelectedServiceLabel();
    const serviceScopes = scopeOptions[serviceType as keyof typeof scopeOptions] || [];
    const selectedScopeLabel = serviceScopes.find(s => s.id === scopeSize)?.label || '';

    const leadPayload = {
      name,
      phone,
      email,
      serviceNeeded: serviceLabel,
      scopeSize: selectedScopeLabel,
      details: details || 'No additional details provided',
      estimatedPrice: estimateValue,
      preferredTime,
      photoUrl
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });
      if (response.ok) {
        const savedLead: Lead = await response.json();
        setSubmittedLead(savedLead);
        onLeadSubmitted(savedLead);

        const savedLeads = JSON.parse(localStorage.getItem('pbe_leads') || '[]');
        savedLeads.unshift(savedLead);
        localStorage.setItem('pbe_leads', JSON.stringify(savedLeads));
      } else {
        throw new Error('Server returned error status');
      }
    } catch (err) {
      console.error('Network error submitting lead, falling back to local simulation:', err);
      const fallbackLead: Lead = {
        id: 'PBE-' + Math.floor(100000 + Math.random() * 900000),
        name,
        phone,
        email,
        serviceNeeded: serviceLabel,
        scopeSize: selectedScopeLabel,
        details: details || 'No additional details provided',
        status: 'pending',
        submittedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }) + " " + new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        estimatedPrice: estimateValue,
        preferredTime,
        photoUrl
      };
      setSubmittedLead(fallbackLead);
      onLeadSubmitted(fallbackLead);

      const savedLeads = JSON.parse(localStorage.getItem('pbe_leads') || '[]');
      savedLeads.unshift(fallbackLead);
      localStorage.setItem('pbe_leads', JSON.stringify(savedLeads));
    }
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
    setPhotoUrl('');
    setFileName('');
    setUploading(false);
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
            Custom Quote
          </div>
          <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider font-mono">Phoenix Metro Service Zone</span>
        </div>
        <h3 className="serif text-xl sm:text-2xl font-normal tracking-tight">
          Bespoke Custom Pricing &amp; Booking
        </h3>
        <p className="text-neutral-300 text-xs sm:text-sm mt-1 font-sans">
          Complete {serviceType ? '2 more steps' : 'a quick request'} to receive a custom quote with Tracy&apos;s clear flat rates.
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
                      <span className="block text-[11px] font-sans text-[#FDE047] mt-2 font-semibold">
                        Pricing: {opt.baseRange}
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
                          <span className="block font-sans text-xs font-bold text-[#FDE047]">
                            {scope.price}
                          </span>
                          <span className="block text-[10px] text-neutral-400 mt-0.5">Custom Scope</span>
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
                    Continue to Request Pricing <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}        {/* Step 3: Contact details & lock custom pricing */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="label-caps">
                Step 3: Secure Quote &amp; Lock-in Schedule
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
                  Custom Quote Requested
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-sans text-lg font-black text-white">
                    Custom Quote Pending
                  </span>
                  <span className="text-xs text-neutral-400">({getEstimatedDuration()} project duration)</span>
                </div>
                <p className="text-neutral-400 text-[11px] mt-1 leading-normal">
                  We calculate custom flat rates for panel upgrades, solar panels, and smart solutions. Tracy will review your scope details and contact you.
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

            {/* File Upload Field */}
            <div className="space-y-1.5 pt-1.5">
              <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider text-left">
                Photos of your Electrical Setup (Optional)
              </label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center relative ${
                  dragActive 
                    ? 'border-[#FDE047] bg-[#FDE047]/5' 
                    : photoUrl 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-white/10 hover:border-white/20 bg-[#0C0C0C]'
                }`}
              >
                <input
                  type="file"
                  id="photo-upload-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                
                {uploading ? (
                  <div className="space-y-2 py-2 flex flex-col items-center justify-center">
                    <span className="w-8 h-8 rounded-full border-2 border-t-[#FDE047] border-[#FDE047]/20 animate-spin inline-block" />
                    <p className="text-xs text-neutral-400 font-medium">Uploading your image to secure storage...</p>
                  </div>
                ) : photoUrl ? (
                  <div className="space-y-3 py-1 flex flex-col items-center justify-center">
                    <div className="relative inline-block">
                      <img 
                        src={photoUrl} 
                        alt="Uploaded preview" 
                        className="max-h-32 rounded-xl object-cover border border-emerald-500/30"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={clearFile}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all border border-red-500 cursor-pointer"
                        title="Remove attachment"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs">
                      <p className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" /> Attached: {fileName || "image.png"}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Will be dispatched with your inquiry details.</p>
                    </div>
                  </div>
                ) : (
                  <label 
                    htmlFor="photo-upload-input" 
                    className="cursor-pointer py-2 w-full h-full flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-neutral-400">
                      <UploadCloud className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        <span className="text-[#FDE047] hover:underline">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1">
                        JPEG, PNG, WEBP (Max 5MB) • Clear wiring details or panel setups help accurate quoting
                      </p>
                    </div>
                  </label>
                )}
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
                Submit Price Request <Check className="w-4 h-4 stroke-[2.5]" />
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
                  Custom Quote Requested &amp; Schedule Held
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
