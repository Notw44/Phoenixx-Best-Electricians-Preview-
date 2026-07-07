import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lead } from '../types';

interface BookingWizardProps {
  onLeadSubmitted: (newLead: Lead) => void;
  initialServiceId?: string;
}

export default function BookingWizard({ onLeadSubmitted, initialServiceId = '' }: BookingWizardProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState(initialServiceId || 'panel_upgrade');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle service pre-selection when initialServiceId changes
  useEffect(() => {
    if (initialServiceId) {
      setServiceNeeded(initialServiceId);
    }
  }, [initialServiceId]);

  const serviceOptions = [
    { id: 'panel_upgrade', label: 'Electrical Panel Upgrade' },
    { id: 'solar_installation', label: 'Smart Solar Solutions' },
    { id: 'breaker_troubleshooting', label: 'Breaker Repair & Troubleshooting' },
    { id: 'ceiling_fan_lighting', label: 'Ceiling Fan & Premium Lighting' },
    { id: 'switches_outlets', label: 'Smart Switches & Outlets' },
    { id: 'condo_work', label: 'Condo & Multi-Family Electrical' },
    { id: 'other', label: 'Other Electrical Service' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const selectedServiceObj = serviceOptions.find(opt => opt.id === serviceNeeded);
    const serviceLabel = selectedServiceObj ? selectedServiceObj.label : 'General Inquiry';

    let savedToSupabase = false;

    // 1. Submit directly to Supabase quotes table if configured
    if (supabase) {
      try {
        const { error } = await supabase
          .from('quotes')
          .insert([{
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            service_requested: serviceLabel,
            project_description: message.trim(),
            created_at: new Date().toISOString()
          }]);

        if (!error) {
          savedToSupabase = true;
          console.log("Quote successfully saved directly to Supabase 'quotes' table.");
        } else {
          console.warn("Direct Supabase 'quotes' insert failed:", error.message);
        }
      } catch (err) {
        console.error("Direct Supabase 'quotes' exception:", err);
      }
    }

    // 2. Submit to local Express backend /api/leads to maintain synchronization & local storage consistency
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          serviceNeeded: serviceLabel,
          scopeSize: 'Free Quote Form',
          details: message.trim(),
          estimatedPrice: 'Free Quote Requested',
          preferredTime: 'Flexible'
        })
      });

      if (response.ok) {
        const savedLead: Lead = await response.json();
        onLeadSubmitted(savedLead);
        setSubmitSuccess(true);
        resetFormState();
      } else {
        if (savedToSupabase) {
          // Fallback if local server failed but Supabase succeeded
          setSubmitSuccess(true);
          resetFormState();
        } else {
          throw new Error('Failed to submit quote request. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      if (savedToSupabase) {
        setSubmitSuccess(true);
        resetFormState();
      } else {
        setErrorMessage(err.message || 'A network error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormState = () => {
    setName('');
    setPhone('');
    setEmail('');
    setServiceNeeded('panel_upgrade');
    setMessage('');
  };

  if (submitSuccess) {
    return (
      <div className="relative rounded-3xl border border-white/10 p-8 sm:p-12 text-center shadow-2xl max-w-xl mx-auto overflow-hidden bg-black/45 backdrop-blur-md">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="serif text-2xl font-normal text-white mb-3">
            Request Received
          </h3>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            Thank you! We&apos;ll contact you soon.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="mt-8 px-6 py-2.5 bg-black/55 hover:bg-black/75 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white rounded-xl transition-all border border-white/10 backdrop-blur-sm"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-10 max-w-xl mx-auto overflow-hidden bg-[#0D0D0D]">
      <div className="relative z-10">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sophie Copeland"
              className="w-full p-3.5 rounded-xl border border-white/10 bg-neutral-900 text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm disabled:opacity-50 placeholder-white/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                required
                disabled={isSubmitting}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(602) 780-1140"
                className="w-full p-3.5 rounded-xl border border-white/10 bg-neutral-900 text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm disabled:opacity-50 placeholder-white/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sophie@example.com"
                className="w-full p-3.5 rounded-xl border border-white/10 bg-neutral-900 text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm disabled:opacity-50 placeholder-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-2">
              Service Needed
            </label>
            <select
              disabled={isSubmitting}
              value={serviceNeeded}
              onChange={(e) => setServiceNeeded(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-white/10 bg-neutral-900 text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm disabled:opacity-50"
            >
              {serviceOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#111111] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#888888] uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              required
              disabled={isSubmitting}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your electrical project or issue..."
              className="w-full p-3.5 rounded-xl border border-white/10 bg-neutral-900 text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm min-h-[120px] disabled:opacity-50 placeholder-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[#FDE047] to-[#EAB308] hover:from-[#FFF59D] hover:to-[#FDE047] text-[#0C0C0C] font-bold text-sm rounded-xl transition-all duration-300 animate-luxury-glow active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Sending Request...' : 'Request Free Quote'}
          </button>
        </form>
      </div>
    </div>
  );
}
