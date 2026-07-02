import React, { useState } from 'react';
import { Search, MapPin, Navigation, Activity, Check, AlertTriangle } from 'lucide-react';

export default function InteractiveMap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [validationResult, setValidationResult] = useState<{
    status: 'covered' | 'out' | null;
    message: string;
    details?: string;
  }>({ status: null, message: '' });

  const [selectedZone, setSelectedZone] = useState<string>('Marketplace At Central');

  const zones = [
    { name: 'Marketplace At Central', x: '50%', y: '50%', status: 'Hub (Tracy)', response: 'Immediate dispatch', activeTrucks: 2, description: 'Our HQ office, parts hub, and primary dispatch center.' },
    { name: 'North Mountain', x: '45%', y: '25%', status: 'Active Patrol', response: '30-45 mins', activeTrucks: 1, description: 'Sophie Copeland panel upgrade site. High priority dispatch lane.' },
    { name: 'Paradise Valley', x: '75%', y: '35%', status: 'Active Patrol', response: '35-50 mins', activeTrucks: 1, description: 'Lutron smart dimmers and custom architectural lighting lane.' },
    { name: 'Camelback East', x: '68%', y: '65%', status: 'Active Patrol', response: '25-40 mins', activeTrucks: 2, description: 'Ceiling fan & high-efficiency cooling fixture installations.' },
    { name: 'Downtown Phoenix', x: '35%', y: '80%', status: 'Active Patrol', response: '20-35 mins', activeTrucks: 1, description: 'Commercial troubleshooting and main sub-breaker services.' },
    { name: 'Arcadia', x: '82%', y: '78%', status: 'On Call', response: '40-55 mins', activeTrucks: 0, description: 'Solar consultation crew active near local HOA boundaries.' }
  ];

  const phoenixZips = [
    '85020', '85021', '85022', '85023', '85024', '85028', '85032', '85016', 
    '85018', '85003', '85004', '85006', '85007', '85008', '85012', '85013', 
    '85014', '85015', '85050', '85054'
  ];

  const handleZipSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    const isZip = /^\d{5}$/.test(cleanQuery);

    if (isZip) {
      if (phoenixZips.includes(cleanQuery)) {
        setValidationResult({
          status: 'covered',
          message: `ZIP Code ${cleanQuery} is FULLY COVERED!`,
          details: 'We have 2 active service units nearby. Guaranteed response under 45 minutes for emergency breaker and troubleshooting calls.'
        });
        // Find closest zone
        if (['85020', '85021', '85022', '85023'].includes(cleanQuery)) {
          setSelectedZone('North Mountain');
        } else if (['85016', '85018'].includes(cleanQuery)) {
          setSelectedZone('Camelback East');
        } else {
          setSelectedZone('Downtown Phoenix');
        }
      } else {
        setValidationResult({
          status: 'out',
          message: `ZIP Code ${cleanQuery} is outside our 24/7 priority zone.`,
          details: 'While we mainly serve central Phoenix, call us at (602) 780-1140 to see if an electrician can be dispatched for your specific scope!'
        });
      }
    } else {
      // Search by zone name
      const foundZone = zones.find(z => z.name.toLowerCase().includes(cleanQuery.toLowerCase()));
      if (foundZone) {
        setSelectedZone(foundZone.name);
        setValidationResult({
          status: 'covered',
          message: `${foundZone.name} is in our Active Service Zone!`,
          details: `Average response: ${foundZone.response}. Dispatched from Marketplace At Central.`
        });
      } else {
        setValidationResult({
          status: 'out',
          message: `"${cleanQuery}" zone not detected in our immediate roster.`,
          details: 'Try searching for a Phoenix ZIP code like 85020, or call us directly for rapid dispatch.'
        });
      }
    }
  };

  const currentZoneObj = zones.find(z => z.name === selectedZone) || zones[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Search and Details Card */}
      <div className="lg:col-span-5 flex flex-col justify-between bg-[#111111]/80 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl text-left">
        <div className="space-y-6">
          <div>
            <span className="font-mono text-[10px] text-[#0C0C0C] font-bold uppercase tracking-widest bg-[#FDE047] px-2 py-0.5 rounded">
              Coverage Validator
            </span>
            <h3 className="serif text-xl sm:text-2xl font-light tracking-tight text-white mt-3">
              Is an Electrician near you?
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              Check active dispatch statuses across Phoenix. Enter your ZIP code to see guaranteed response timelines.
            </p>
          </div>

          {/* Search form */}
          <form onSubmit={handleZipSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter ZIP code (e.g. 85020, 85016)"
              className="w-full pl-4 pr-24 py-3 border border-white/10 bg-[#0C0C0C]/60 text-white focus:outline-none focus:ring-1 focus:ring-[#FDE047] focus:border-[#FDE047] text-sm rounded-xl font-mono"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#FDE047] hover:bg-[#FDE047]/90 text-[#0C0C0C] rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Verify Zip
            </button>
          </form>

          {/* Zip Search Validation Result */}
          {validationResult.status && (
            <div className={`p-4 rounded-xl text-left border ${
              validationResult.status === 'covered'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-100'
                : 'bg-amber-950/95 border-amber-500/50 text-amber-100'
            }`}>
              <div className="flex items-start gap-2.5">
                {validationResult.status === 'covered' ? (
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold font-mono tracking-wider uppercase">
                    {validationResult.message}
                  </p>
                  <p className="text-[11px] leading-relaxed mt-1 text-neutral-300">
                    {validationResult.details}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Zone Statistics details */}
          <div className="border-t border-white/10 pt-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#888888]">Selected Sector</span>
                <h4 className="serif font-normal text-white text-lg leading-tight mt-0.5">
                  {currentZoneObj.name}
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-[#0C0C0C]/60 border border-white/10 text-neutral-300 font-mono text-[9px] uppercase font-bold tracking-wider rounded">
                Zone Active
              </span>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed font-sans">
              {currentZoneObj.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 font-mono">
              <div className="bg-[#0C0C0C]/50 p-3 rounded-xl border border-white/10">
                <span className="block text-[9px] text-[#888888] font-bold uppercase">Response Time</span>
                <span className="text-xs font-bold text-[#FDE047] mt-0.5 block">{currentZoneObj.response}</span>
              </div>
              <div className="bg-[#0C0C0C]/50 p-3 rounded-xl border border-white/10">
                <span className="block text-[9px] text-[#888888] font-bold uppercase">Active Crews</span>
                <span className="text-xs font-bold text-white mt-0.5 block">
                  {currentZoneObj.activeTrucks > 0 ? `● ${currentZoneObj.activeTrucks} Truck(s)` : 'On Call Only'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center gap-2 mt-6">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <p className="text-[10px] font-mono text-neutral-400">
            Real-time GPS signals synced from fleet trucks in Phoenix.
          </p>
        </div>
      </div>

      {/* Interactive Visual Map (Beautiful vector SVG) */}
      <div className="lg:col-span-7 bg-[#111111]/80 rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[400px] shadow-2xl backdrop-blur-md">
        {/* Background visual grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

        <div className="relative z-10 flex justify-between items-center">
          <div>
            <span className="text-[#FDE047] font-sans text-[10px] font-black tracking-[0.18em] uppercase">
              LIVE PRIORITY DISPATCH • GRID RADAR
            </span>
            <p className="text-white font-sans font-bold text-sm sm:text-base mt-0.5">
              Phoenix Metropolitan Service Grid
            </p>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#0C0C0C]/60 border border-white/10 rounded-lg text-[10px] font-sans font-semibold tracking-wider text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>HQ LINK ACTIVE</span>
          </div>
        </div>

        {/* Visual Map Render (Custom SVG map illustrating the coverage) */}
        <div className="relative z-10 my-8 flex items-center justify-center min-h-[250px]">
          <svg viewBox="0 0 400 300" className="w-full max-w-[420px] h-auto drop-shadow-2xl select-none">
            {/* Phoenix Roads Grid representation */}
            <line x1="50" y1="50" x2="350" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="150" x2="350" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="250" x2="350" y2="250" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="100" y1="50" x2="100" y2="250" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="200" y1="50" x2="200" y2="250" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="300" y1="50" x2="300" y2="250" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Central Avenue Main Road line */}
            <line x1="200" y1="20" x2="200" y2="280" stroke="#FDE047" strokeWidth="2" opacity="0.4" />
            <text x="210" y="35" fill="#FDE047" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.8">
              CENTRAL AVE (8929 N)
            </text>

            {/* Interactive zone rings and nodes */}
            {zones.map((zone) => {
              const isSelected = zone.name === selectedZone;
              // Parse percentage-like strings to exact coordinates
              const coordX = zone.name === 'Marketplace At Central' ? 200 : zone.name === 'North Mountain' ? 180 : zone.name === 'Paradise Valley' ? 300 : zone.name === 'Camelback East' ? 270 : zone.name === 'Downtown Phoenix' ? 140 : 320;
              const coordY = zone.name === 'Marketplace At Central' ? 150 : zone.name === 'North Mountain' ? 75 : zone.name === 'Paradise Valley' ? 105 : zone.name === 'Camelback East' ? 195 : zone.name === 'Downtown Phoenix' ? 240 : 234;

              return (
                <g 
                  key={zone.name} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedZone(zone.name)}
                >
                  {/* Outer pulse ring for selection */}
                  {isSelected && (
                    <circle 
                      cx={coordX} 
                      cy={coordY} 
                      r="22" 
                      fill="none" 
                      stroke="#FDE047" 
                      strokeWidth="1.5" 
                      className="animate-ping"
                      opacity="0.5" 
                    />
                  )}
                  {/* Secondary hover ring */}
                  <circle 
                    cx={coordX} 
                    cy={coordY} 
                    r={isSelected ? "17" : "10"} 
                    fill={isSelected ? "rgba(253, 224, 71, 0.12)" : "rgba(255, 255, 255, 0.05)"} 
                    stroke={isSelected ? "#FDE047" : "#475569"} 
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    className="transition-all duration-300 group-hover:stroke-[#FDE047]"
                  />
                  {/* Solid core center */}
                  <circle 
                    cx={coordX} 
                    cy={coordY} 
                    r="5" 
                    fill={zone.name === 'Marketplace At Central' ? '#FDE047' : zone.activeTrucks > 0 ? '#10b981' : '#cbd5e1'} 
                  />
                  
                  {/* Custom tooltip text appearing next to the node */}
                  <text 
                    x={coordX + 14} 
                    y={coordY + 4} 
                    fill={isSelected ? '#FDE047' : '#e2e8f0'} 
                    fontSize="9" 
                    fontFamily="sans-serif" 
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="transition-all pointer-events-none group-hover:fill-white font-medium"
                  >
                    {zone.name === 'Marketplace At Central' ? '★ HQ' : zone.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="relative z-10 flex flex-wrap gap-4 justify-between items-center border-t border-white/10 pt-4 text-[10px] font-mono text-neutral-400">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FDE047] inline-block" /> HQ Dispatch
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Active Patrol Truck
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-500 inline-block" /> On Call / Support
            </span>
          </div>
          <span className="text-neutral-500">Click map nodes to check neighborhood dispatch stats</span>
        </div>
      </div>
    </div>
  );
}
