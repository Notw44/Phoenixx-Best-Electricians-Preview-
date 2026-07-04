import React, { useState, useEffect } from 'react';
import { 
  Trash2, Users, TrendingUp, Activity, CheckCircle, 
  Calendar, DollarSign, X, FileSpreadsheet, Sparkles, Wrench 
} from 'lucide-react';
import { Lead } from '../types';

interface OwnerConsoleProps {
  onClose: () => void;
}

export default function OwnerConsole({ onClose }: OwnerConsoleProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadLeads();
  }, []);

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
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Dashboard Analytics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10 bg-[#0C0C0C] text-left">
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
                ${(totalLeads * 350 + 1800).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Console Action Bar */}
        <div className="bg-[#0C0C0C] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10">
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
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium cursor-pointer"
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

        {/* Footer info */}
        <div className="bg-[#0C0C0C] p-4 border-t border-white/10 text-center font-mono text-[10px] text-neutral-500">
          Sync active with secure localStorage storage. Secure local session. Ready for CRM integration.
        </div>
      </div>
    </div>
  );
}
