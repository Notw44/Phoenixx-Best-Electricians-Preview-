import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, User, MessageSquare, CheckCircle2, Send, AlertCircle, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const submittedAt = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) + " " + new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const contactData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      submittedAt
    };

    let savedToSupabase = false;

    // 1. Try to save directly to Supabase client-side for instant dashboard visibility
    if (supabase) {
      try {
        const { error } = await supabase
          .from('quotes')
          .insert([{
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || 'Not Provided',
            service_requested: 'General Message Inquiry',
            project_description: message.trim(),
            created_at: new Date().toISOString()
          }]);

        if (!error) {
          savedToSupabase = true;
          console.log("Contact successfully saved directly to Supabase 'quotes' table.");
        } else {
          console.error("Direct Supabase 'quotes' insert failed:", error.message);
          setSubmitStatus('error');
          setErrorMessage("Supabase error: " + error.message);
          setIsSubmitting(false);
          return;
        }
      } catch (err: any) {
        console.error("Direct Supabase 'quotes' exception:", err);
        setSubmitStatus('error');
        setErrorMessage("Supabase exception: " + (err.message || err));
        setIsSubmitting(false);
        return;
      }
    } else {
      console.error("Supabase client is not configured/initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_KEY.");
      setSubmitStatus('error');
      setErrorMessage("Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_KEY in your environment.");
      setIsSubmitting(false);
      return;
    }

    // 2. Always log to localStorage so it is available locally in the Operator Portal on Vercel
    try {
      const existing = JSON.parse(localStorage.getItem('pbe_contacts') || '[]');
      const newContact = {
        id: 'CON-' + Math.floor(1000 + Math.random() * 9000),
        ...contactData
      };
      existing.unshift(newContact);
      localStorage.setItem('pbe_contacts', JSON.stringify(existing));
      console.log("Contact successfully logged to local storage.");
    } catch (lsErr) {
      console.warn("Failed to write contact to localStorage:", lsErr);
    }

    // 3. Sync/fallback with the server-side API to maintain db.json consistency, passing skipSupabase: true
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...contactData, skipSupabase: savedToSupabase })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        const data = await response.json().catch(() => ({}));
        // If Supabase already succeeded, we still count as success but log a sync warning
        if (savedToSupabase) {
          setSubmitStatus('success');
          setName('');
          setEmail('');
          setPhone('');
          setMessage('');
          console.warn("Server sync returned a non-ok status, but direct Supabase insert succeeded:", data.error);
        } else {
          setSubmitStatus('error');
          setErrorMessage(data.error || 'Failed to sync with server.');
        }
      }
    } catch (err) {
      console.error("Failed to sync contact message via API:", err);
      if (savedToSupabase) {
        setSubmitStatus('success');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        console.info("Server sync network error, but direct Supabase insert succeeded.");
      } else {
        setSubmitStatus('error');
        setErrorMessage('A network error occurred during server sync.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-44 sm:py-64 lg:py-72 bg-[#0C0C0C] relative border-t border-white/10">
      {/* Background glow and subtle dots layout */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(253,224,71,0.01)_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#FDE047]/1.5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Column: Direct contact details and brand guarantee */}
          <div className="lg:col-span-5 text-left space-y-8 flex flex-col justify-center">
            <div>
              <span className="label-caps text-[#FDE047] tracking-[0.2em]">
                Direct Priority Link
              </span>
              <h2 className="serif text-4xl sm:text-5xl font-normal text-white mt-4 leading-tight">
                Get in touch with Tracy &amp; team.
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base mt-6 leading-relaxed">
                Have a unique blueprint, custom commercial project, or simply want to inquire about regional zoning? Send our central dispatch unit a message.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-[#FDE047] shrink-0">
                  <Phone className="w-4 h-4 text-[#FDE047]" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-semibold">24/7 Priority Hotline</p>
                  <a href="tel:6027801140" className="text-white font-semibold text-sm hover:text-[#FDE047] transition-colors block mt-0.5">
                    (602) 780-1140
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-[#FDE047] shrink-0">
                  <Mail className="w-4 h-4 text-[#FDE047]" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-semibold">Support Desk Email</p>
                  <a href="mailto:dispatch@phoenixbest.com" className="text-white font-semibold text-sm hover:text-[#FDE047] transition-colors block mt-0.5">
                    dispatch@phoenixbest.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-[#FDE047] shrink-0">
                  <MapPin className="w-4 h-4 text-[#FDE047]" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-semibold">Central Phoenix HQ</p>
                  <p className="text-neutral-300 text-sm mt-0.5 leading-relaxed">
                    8929 N Central Ave #53C, Phoenix, AZ 85020
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">Response Guarantee</span>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                All contact form submissions trigger a high-priority push alert directly to Tracy's dispatch tablet. Expect a reply or callback within 2 hours.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form itself */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-[#111111]/85 backdrop-blur-md border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#FDE047]/1 blur-[60px] rounded-full pointer-events-none" />

              <h3 className="serif text-2xl font-normal text-white mb-2">
                Send a Secure Message
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm mb-8 leading-relaxed">
                Fill out the secure ledger below. Your data is compiled instantly and protected with database-level isolation.
              </p>

              {submitStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 px-6 text-center space-y-4 flex flex-col items-center justify-center border border-emerald-500/20 bg-emerald-500/5 rounded-2xl"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="serif text-xl font-semibold text-white">Message Transmitted</h4>
                    <p className="text-xs sm:text-sm text-neutral-300 max-w-sm mx-auto">
                      Your message has been secure-logged and dispatched to Tracy's mobile. We will get in touch with you shortly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus('idle')}
                    className="mt-4 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-850 text-white border border-white/10 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sophie Copeland"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sophie@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(602) 555-0199"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                      Message
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3.5 pointer-events-none text-neutral-500">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <textarea
                        name="message"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your electrical inquiry, blueprint, or any questions..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm min-h-[140px] transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Error Alert */}
                  {submitStatus === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-200 flex items-start gap-2.5 text-xs"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold uppercase tracking-wider font-mono">Transmission Error</p>
                        <p className="text-neutral-300 mt-0.5">{errorMessage}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 border shadow-sm ${
                        isSubmitting 
                          ? 'bg-neutral-900 border-white/5 text-neutral-500 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-[#FDE047] to-[#EAB308] hover:from-[#FFF59D] hover:to-[#FDE047] text-[#0C0C0C] border-yellow-200/40 hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(253,224,71,0.15)] active:scale-98 cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-t-[#0C0C0C] border-[#0C0C0C]/20 animate-spin" />
                          <span>TRANSMITTING MESSAGE...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>SEND SECURE MESSAGE</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
