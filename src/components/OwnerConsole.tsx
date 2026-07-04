import React, { useState, useEffect } from 'react';
import { 
  Trash2, Users, TrendingUp, Activity, CheckCircle, 
  Calendar, DollarSign, X, FileSpreadsheet, Sparkles, Wrench,
  Lock, Mail, LogOut, Eye, EyeOff, ShieldAlert, Sparkle, ArrowRight,
  Database, AlertTriangle, Check, Copy, MessageSquare, ExternalLink
} from 'lucide-react';
import { Lead, ContactMessage } from '../types';
import { supabase } from '../lib/supabase';

interface OwnerConsoleProps {
  onClose: () => void;
}

export default function OwnerConsole({ onClose }: OwnerConsoleProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'leads' | 'contacts' | 'setup'>('leads');
  const [copied, setCopied] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'active' | 'missing_tables' | 'disabled'>('checking');
  
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [isAuthBypassed, setIsAuthBypassed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadLeads();
    loadContacts();
    checkSupabaseStatus();

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const checkSupabaseStatus = async () => {
    if (!supabase) {
      setSupabaseStatus('disabled');
      return;
    }
    try {
      const { error } = await supabase.from('reviews').select('id').limit(1);
      if (error && error.message.includes('Could not find the table')) {
        setSupabaseStatus('missing_tables');
      } else if (error) {
        console.warn("Supabase check returned query error:", error.message);
        setSupabaseStatus('missing_tables');
      } else {
        setSupabaseStatus('active');
      }
    } catch (err) {
      console.error("Error checking Supabase status:", err);
      setSupabaseStatus('missing_tables');
    }
  };

  const loadContacts = () => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContacts(data);
        }
      })
      .catch(err => {
        console.error('Error fetching contact submissions:', err);
      });
  };

  const loadLeads = () => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeads(data);
        }
      })
      .catch(err => {
        console.error('Error fetching leads from backend, fallback to localStorage:', err);
        const savedLeads = JSON.parse(localStorage.getItem('pbe_leads') || '[]');
        setLeads(savedLeads);
      });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError('');
    setAuthLoading(true);

    if (!supabase) {
      // Demo bypass logic
      if (email === 'admin@example.com' && password === 'admin123') {
        setIsAuthBypassed(true);
      } else {
        setAuthError('In demo mode, use admin@example.com / admin123 to log in.');
      }
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during sign in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError('');
    setAuthLoading(true);

    if (!supabase) {
      setAuthError('Supabase is not configured yet. Sign up is only available with live Supabase integration.');
      setAuthLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else if (data.user && !data.session) {
        setAuthError('Sign up successful! Please check your email for confirmation.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during sign up.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      setIsAuthBypassed(false);
    }
    setEmail('');
    setPassword('');
    setAuthError('');
  };

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'dispatched' | 'completed') => {
    try {
      const response = await fetch(`/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
      } else {
        throw new Error('API update failed');
      }
    } catch (err) {
      console.error('Failed to update status on backend, applying local fallback:', err);
      const updated = leads.map(l => {
        if (l.id === id) {
          return { ...l, status: newStatus };
        }
        return l;
      });
      localStorage.setItem('pbe_leads', JSON.stringify(updated));
      setLeads(updated);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this lead/ticket record?')) return;
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
      } else {
        throw new Error('API delete failed');
      }
    } catch (err) {
      console.error('Failed to delete lead from server, applying local fallback:', err);
      const updated = leads.filter(l => l.id !== id);
      localStorage.setItem('pbe_leads', JSON.stringify(updated));
      setLeads(updated);
    }
  };

  const clearAllLeads = async () => {
    if (!window.confirm('Delete all stored leads? This cannot be undone.')) return;
    try {
      const response = await fetch('/api/leads/purge', {
        method: 'POST'
      });
      if (response.ok) {
        setLeads([]);
      } else {
        throw new Error('API purge failed');
      }
    } catch (err) {
      console.error('Failed to purge server leads, applying local fallback:', err);
      localStorage.setItem('pbe_leads', JSON.stringify([]));
      setLeads([]);
    }
  };

  const resetDemoLeads = async () => {
    if (!window.confirm('Reset leads collection back to original demo values?')) return;
    try {
      const response = await fetch('/api/leads/reset', {
        method: 'POST'
      });
      if (response.ok) {
        const resetData = await response.json();
        setLeads(resetData);
      }
    } catch (err) {
      console.error('Failed to reset demo leads:', err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setContacts(prev => prev.filter(c => c.id !== id));
      } else {
        throw new Error('API delete failed');
      }
    } catch (err) {
      console.error('Failed to delete contact from server:', err);
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  const clearAllContacts = async () => {
    if (!window.confirm('Are you sure you want to purge all contact messages? This cannot be undone.')) return;
    try {
      const response = await fetch('/api/contacts/purge', {
        method: 'POST'
      });
      if (response.ok) {
        setContacts([]);
      } else {
        throw new Error('API purge failed');
      }
    } catch (err) {
      console.error('Failed to purge contacts:', err);
      setContacts([]);
    }
  };

  // Calculations
  const totalLeads = leads.length;
  const pendingLeads = leads.filter(l => l.status === 'pending').length;
  const dispatchedLeads = leads.filter(l => l.status === 'dispatched').length;
  const completedLeads = leads.filter(l => l.status === 'completed').length;

  const calculateRevenue = () => {
    let minSum = 0;
    leads.forEach(l => {
      // Crude extractor of numbers from price strings like "$1,800 - $2,400" or "$150 - $280"
      const numbers = l.estimatedPrice.replace(/[^0-9]/g, '');
      if (numbers.length > 0) {
        // e.g. "18002400" -> average it or take lower bound
        const parsed = parseInt(numbers);
        if (parsed > 1000000) {
          minSum += Math.floor(parsed / 10000); // approximate
        } else {
          minSum += parsed;
        }
      } else {
        minSum += 250; // flat avg default
      }
    });
    return minSum;
  };

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(l => l.status === filterStatus);

  if (!session && !isAuthBypassed) {
    return (
      <div className="fixed inset-0 bg-[#0C0C0C]/96 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-[#111111] rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl border border-white/10 text-white p-8 relative">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-white/15 flex items-center justify-center text-[#FDE047] mx-auto shadow-md mb-4">
              <Lock className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="serif text-2xl font-normal tracking-tight text-white">
              Operator Portal
            </h3>
            <p className="text-neutral-400 text-xs mt-2">
              Sign in to manage lead dispatches, client tickets, and reviews.
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={authView === 'login' ? handleLogin : handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold font-mono text-[#888888] uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold font-mono text-[#888888] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-white/10 bg-[#0C0C0C] text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#0C0C0C] shadow-lg active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? 'Authenticating...' : authView === 'login' ? 'Access Console' : 'Register Operator'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Setup / Demo Bypass Indicator */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center space-y-4">
            {authView === 'login' ? (
              <p className="text-xs text-neutral-400">
                Need an operator account?{' '}
                <button 
                  onClick={() => { setAuthView('signup'); setAuthError(''); }} 
                  className="text-[#FDE047] hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-xs text-neutral-400">
                Already registered?{' '}
                <button 
                  onClick={() => { setAuthView('login'); setAuthError(''); }} 
                  className="text-[#FDE047] hover:underline"
                >
                  Log In
                </button>
              </p>
            )}

            {!supabase && (
              <div className="bg-neutral-900/50 rounded-xl p-4 border border-white/5 text-left">
                <span className="inline-block text-[9px] font-bold font-mono bg-[#FDE047]/10 text-[#FDE047] px-2 py-0.5 rounded uppercase tracking-widest mb-1.5">
                  Demo Bypass Active
                </span>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Supabase variables not set. Enter:
                  <span className="block text-white font-mono font-bold mt-1">admin@example.com / admin123</span>
                  to explore the operator portal locally.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0C0C0C]/96 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] rounded-3xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10 text-white">
        
        {/* Header Console */}
        <div className="bg-[#0C0C0C] text-white p-6 flex justify-between items-center border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FDE047] animate-pulse" />
              <span className="font-mono text-[10px] text-[#FDE047] font-bold uppercase tracking-widest">
                Owner Operator Console
              </span>
            </div>
            <h3 className="serif text-xl font-normal tracking-tight mt-1">
              Lead Dispatch &amp; Performance Control
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs border border-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer font-semibold"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FDE047]" /> Sign Out
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#0C0C0C] px-6 flex border-b border-white/10 gap-6 shrink-0">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'border-[#FDE047] text-[#FDE047]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Leads Pipeline ({totalLeads})
          </button>
          
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'border-[#FDE047] text-[#FDE047]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Inbound Messages ({contacts.length})
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'setup'
                ? 'border-[#FDE047] text-[#FDE047]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            Supabase Setup
            <span className={`w-2 h-2 rounded-full ${
              supabaseStatus === 'active' 
                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' 
                : supabaseStatus === 'missing_tables' 
                ? 'bg-amber-500 animate-pulse' 
                : 'bg-neutral-600'
            }`} />
          </button>
        </div>

        {/* Dynamic Warning Banner */}
        {supabaseStatus === 'missing_tables' && activeTab !== 'setup' && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Database Sync Notice:</strong> Supabase connection is active, but schema tables are missing. The app is gracefully using local <code>db.json</code> fallback.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('setup')}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded text-[10px] font-bold uppercase tracking-wide text-white cursor-pointer transition-colors"
            >
              Run Setup Script
            </button>
          </div>
        )}

        {/* Main Tab Content Display */}
        {activeTab === 'leads' && (
          <>
            {/* Dashboard Analytics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10 bg-[#0C0C0C] text-left shrink-0">
              <div className="p-5 border-r border-white/10">
                <span className="block text-[10px] uppercase font-mono font-bold text-[#888888]">Total Leads</span>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-5 h-5 text-[#FDE047]" />
                  <span className="text-2xl font-black font-mono text-white">{totalLeads}</span>
                </div>
              </div>

              <div className="p-5 border-r border-white/10">
                <span className="block text-[10px] uppercase font-mono font-bold text-[#888888]">Active Dispatches</span>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="text-2xl font-black font-mono text-amber-400">{dispatchedLeads}</span>
                </div>
              </div>

              <div className="p-5 border-r border-white/10">
                <span className="block text-[10px] uppercase font-mono font-bold text-[#888888]">Completed Calls</span>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-2xl font-black font-mono text-emerald-400">{completedLeads}</span>
                </div>
              </div>

              <div className="p-5">
                <span className="block text-[10px] uppercase font-mono font-bold text-[#888888]">Pipeline Value</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span className="text-xl font-black font-mono text-emerald-400">
                    ${calculateRevenue().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Console Action Bar */}
            <div className="bg-[#0C0C0C] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'all', label: 'All Records' },
                  { id: 'pending', label: 'Pending Response' },
                  { id: 'dispatched', label: 'Dispatched Units' },
                  { id: 'completed', label: 'Archived / Complete' },
                ].map(btn => (
                  <button
                    key={btn.id}
                    onClick={() => setFilterStatus(btn.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filterStatus === btn.id
                        ? 'bg-[#FDE047] text-[#0C0C0C]'
                        : 'bg-neutral-900 border border-white/5 hover:border-white/20 text-[#888888] hover:text-white'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadLeads}
                  className="px-3 py-1.5 bg-[#111111] border border-white/10 hover:border-white/20 rounded-lg text-xs text-white font-medium cursor-pointer"
                >
                  Sync Records
                </button>
                <button
                  onClick={resetDemoLeads}
                  className="px-3 py-1.5 bg-yellow-950/20 border border-yellow-500/20 hover:bg-yellow-900/20 text-[#FDE047] rounded-lg text-xs font-medium cursor-pointer"
                  title="Restore original demo leads dataset"
                >
                  Reset Demo
                </button>
                <button
                  onClick={clearAllLeads}
                  className="px-3 py-1.5 bg-red-955/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Purge Records
                </button>
              </div>
            </div>

            {/* Leads Table / List */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#111111]">
              {filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Wrench className="w-12 h-12 text-[#888888] animate-bounce" />
                  <p className="font-semibold text-white text-sm mt-3">No matching lead tickets found</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                    Submit a new inquiry using the instant estimate calculator to see it reflected here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <div 
                      key={lead.id}
                      className={`border rounded-2xl p-5 bg-[#0C0C0C] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${
                        lead.status === 'pending'
                          ? 'border-white/10'
                          : lead.status === 'dispatched'
                          ? 'border-amber-500/50 bg-[#0C0C0C]/95'
                          : 'border-white/5 opacity-80'
                      }`}
                    >
                      {/* Lead Core Info */}
                      <div className="space-y-2 flex-1 w-full text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#FDE047] bg-neutral-900 px-2 py-0.5 rounded border border-white/5">
                            {lead.id}
                          </span>
                          <h4 className="font-semibold text-white text-sm">{lead.name}</h4>
                          <span className="text-[#888888] font-mono text-[11px]">• {lead.submittedAt}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                          <div>
                            <span className="text-neutral-400 font-medium">Service Needed: </span>
                            <span className="text-white font-semibold">{lead.serviceNeeded}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-medium">Locked Rate: </span>
                            <span className="text-[#FDE047] font-bold font-mono">{lead.estimatedPrice}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-medium">Selected Scope: </span>
                            <span className="text-neutral-300 italic font-mono">{lead.scopeSize}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 font-medium">Schedule Window: </span>
                            <span className="text-white font-semibold">{lead.preferredTime}</span>
                          </div>
                        </div>

                        <p className="text-neutral-300 text-xs bg-[#111111] p-2.5 rounded-lg border border-white/5 italic">
                          &ldquo;{lead.details}&rdquo;
                        </p>

                        {lead.photoUrl && (
                          <div className="pt-1.5 pb-0.5">
                            <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 block mb-1">Attached Photo:</span>
                            <a 
                              href={lead.photoUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-block relative rounded-lg overflow-hidden border border-white/10 hover:border-[#FDE047]/50 transition-all group"
                            >
                              <img 
                                src={lead.photoUrl} 
                                alt="Attached electrical setup" 
                                className="max-h-24 max-w-xs object-cover hover:scale-105 transition-transform duration-200"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white bg-black/60 px-2 py-1 rounded">View Full Size</span>
                              </div>
                            </a>
                          </div>
                        )}

                        {/* Contact links */}
                        <div className="flex gap-4 pt-1 font-mono text-[11px]">
                          <span className="text-neutral-400">Phone: <a href={`tel:${lead.phone}`} className="text-[#FDE047] hover:underline font-bold">{lead.phone}</a></span>
                          <span className="text-neutral-400">Email: <a href={`mailto:${lead.email}`} className="text-neutral-300 hover:underline">{lead.email}</a></span>
                        </div>
                      </div>

                      {/* Actions & Dispatch states */}
                      <div className="flex flex-row md:flex-col items-end gap-3 w-full md:w-auto border-t border-white/5 md:border-t-0 pt-4 md:pt-0 shrink-0">
                        <div className="flex items-center gap-1.5 bg-[#111111] p-1 rounded-xl w-full md:w-auto border border-white/10">
                          <button
                            onClick={() => handleStatusChange(lead.id, 'pending')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              lead.status === 'pending'
                                ? 'bg-neutral-800 text-white shadow'
                                : 'text-[#888888] hover:text-white'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleStatusChange(lead.id, 'dispatched')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              lead.status === 'dispatched'
                                ? 'bg-[#FDE047] text-[#0C0C0C] shadow font-extrabold'
                                : 'text-[#888888] hover:text-white'
                            }`}
                          >
                            Dispatch
                          </button>
                          <button
                            onClick={() => handleStatusChange(lead.id, 'completed')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              lead.status === 'completed'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'text-[#888888] hover:text-white'
                            }`}
                          >
                            Done
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 bg-red-955/20 hover:bg-red-900/30 border border-red-500/20 rounded-xl text-red-400 transition-colors self-center md:self-end cursor-pointer"
                          title="Delete ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'contacts' && (
          <>
            {/* Contacts Header bar */}
            <div className="bg-[#0C0C0C] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 shrink-0">
              <div className="text-left">
                <span className="font-mono text-[10px] text-[#FDE047] uppercase tracking-widest font-bold">Secure Contact Ledger</span>
                <p className="text-xs text-neutral-400 mt-0.5">Inbound customer messages sent via the Central Priority Link form.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadContacts}
                  className="px-3.5 py-1.5 bg-[#111111] border border-white/10 hover:border-white/20 rounded-lg text-xs text-white font-medium cursor-pointer"
                >
                  Refresh Messages
                </button>
                <button
                  onClick={clearAllContacts}
                  className="px-3.5 py-1.5 bg-red-955/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Purge Messages
                </button>
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#111111]">
              {contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <MessageSquare className="w-12 h-12 text-[#888888] mb-3" />
                  <p className="font-semibold text-white text-sm">No contact messages received</p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                    Submissions from the secure website contact form will be logged here immediately.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className="border border-white/10 rounded-2xl p-5 bg-[#0C0C0C] text-left relative overflow-hidden group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-[#FDE047] bg-neutral-900 px-2 py-0.5 rounded border border-white/5">
                              {contact.id || 'CON-LOG'}
                            </span>
                            <h4 className="font-semibold text-white text-sm">{contact.name}</h4>
                            <span className="text-[#888888] font-mono text-[11px]">• {contact.submittedAt}</span>
                          </div>

                          <div className="text-xs text-neutral-300 font-medium font-mono">
                            Email: <a href={`mailto:${contact.email}`} className="text-[#FDE047] hover:underline font-bold">{contact.email}</a>
                          </div>

                          <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-xs text-neutral-300 mt-2 whitespace-pre-line leading-relaxed italic">
                            &ldquo;{contact.message}&rdquo;
                          </div>
                        </div>

                        <div className="sm:self-center shrink-0">
                          <button
                            onClick={() => handleDeleteContact(contact.id || '')}
                            className="p-2 bg-red-955/20 hover:bg-red-900/40 border border-red-500/20 text-red-400 rounded-xl transition-all hover:scale-[1.03] cursor-pointer"
                            title="Remove message log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'setup' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#111111] text-left space-y-6">
            <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FDE047]/2 blur-[80px] rounded-full pointer-events-none" />
              
              <h4 className="serif text-xl text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-[#FDE047]" />
                Supabase Schema Installation Guide
              </h4>
              <p className="text-xs text-neutral-400 mt-2 max-w-2xl leading-relaxed">
                If you are running this app with custom environment variables and seeing error warnings like <code className="text-amber-400 bg-neutral-950 px-1 py-0.5 rounded text-[10px]">Could not find table 'public.reviews' in schema cache</code>, it means your live Supabase project doesn't have the required database tables yet. Paste our schema script to provision them in 2 seconds.
              </p>

              <div className="flex items-center gap-3 mt-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] font-bold ${
                  supabaseStatus === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  Current Status: {supabaseStatus === 'active' ? 'Schema Active & Synced' : 'Schema Missing / Offline Fallback'}
                </span>
                
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white transition-colors"
                >
                  Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-white text-sm">Step 1: Copy Schema Script</h5>
                  <p className="text-[11px] text-neutral-400">Click the button below to copy the fully configured SQL schema.</p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/supabase_setup.sql');
                      const sql = await response.text();
                      await navigator.clipboard.writeText(sql);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (e) {
                      console.error("Failed to copy setup script:", e);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#0C0C0C] font-black'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> COPIED TO CLIPBOARD!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> COPY SETUP SQL SCHEMA
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-white text-sm">Step 2: Paste in Supabase SQL Editor</h5>
                <ol className="list-decimal pl-5 text-xs text-neutral-400 space-y-2 leading-relaxed">
                  <li>Go to your <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#FDE047] hover:underline font-semibold">Supabase Workspace</a> and select your project.</li>
                  <li>In the left sidebar, click the <strong>SQL Editor</strong> button (looks like <code className="bg-neutral-950 px-1 rounded font-mono">SQL</code>).</li>
                  <li>Click <strong>+ New Query</strong> to open a clean tab.</li>
                  <li>Paste the copied SQL schema, and click <strong>Run</strong> in the bottom right corner.</li>
                  <li>Once executed successfully, refresh this operator portal! Tables will immediately be active and synced.</li>
                </ol>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-semibold block mb-2">Schema Preview (SQL):</span>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-white/5 font-mono text-[11px] text-neutral-400 overflow-x-auto max-h-[220px] select-all">
{`-- 1. Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id text PRIMARY KEY,
    name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    "serviceNeeded" text,
    "scopeSize" text,
    details text,
    status text DEFAULT 'pending'::text,
    "submittedAt" text,
    "estimatedPrice" text,
    "preferredTime" text,
    "photoUrl" text
);

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id text PRIMARY KEY,
    author text NOT NULL,
    rating integer NOT NULL,
    "timeAgo" text,
    text text NOT NULL,
    "avatarUrl" text,
    category text,
    tags text[]
);

-- 3. Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    "submittedAt" text
);`}
              </pre>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="bg-[#0C0C0C] p-4 border-t border-white/10 text-center font-mono text-[10px] text-neutral-500 shrink-0">
          Sync active with secure local storage fallback &amp; real-time API integrations. Ready for production.
        </div>
      </div>
    </div>
  );
}
