import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, AlertCircle, ArrowUpRight, Target, X, AlertTriangle, Zap, CheckCircle2, Clock, ChevronRight, Activity, Building, User, ChevronLeft, Flame, Siren } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { generateDailyBrief } from '../services/gemini';
import { DailyBrief, Deal, DealStage } from '../types';
import { STAGE_COLORS, STRESS_WEIGHTS } from '../constants';

interface DashboardProps {
  deals: Deal[];
  onDealClick?: (deal: Deal) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ deals, onDealClick }) => {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(true);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  
  // --- 1. Staffing / Burnout Calculation ---
  const staffRisks = useMemo(() => {
     const ownerMap: Record<string, { name: string; score: number; risk: string; criticals: number }> = {};
     
     deals.forEach(deal => {
        if (deal.stage === DealStage.CLOSED_LOST || deal.stage === DealStage.CLOSED_WON) return;
        
        let owner = deal.ownerName?.split(',')[0].trim() || 'Unassigned';
        if (!ownerMap[owner]) ownerMap[owner] = { name: owner, score: 0, risk: 'Low', criticals: 0 };
        
        let stress = STRESS_WEIGHTS.STAGE_SCORE[deal.stage] || 1;
        if (deal.health === 'red') {
            stress += STRESS_WEIGHTS.CRITICAL_HEALTH_PENALTY;
            ownerMap[owner].criticals++;
        }
        if (deal.value > STRESS_WEIGHTS.HIGH_VALUE_THRESHOLD) stress += STRESS_WEIGHTS.HIGH_VALUE_PENALTY;
        
        ownerMap[owner].score += stress;
     });

     Object.values(ownerMap).forEach(p => {
         if (p.score > 25) p.risk = 'Critical';
         else if (p.score > 15) p.risk = 'High';
         else if (p.score > 8) p.risk = 'Moderate';
         else p.risk = 'Low';
     });

     return Object.values(ownerMap).sort((a,b) => b.score - a.score);
  }, [deals]);

  const getOwnerRisk = (ownerName: string) => {
      const simpleName = ownerName?.split(',')[0].trim();
      return staffRisks.find(s => s.name === simpleName);
  };

  // --- 2. Spotlight Logic: Top 5 Urgent Cases ---
  const topSpotlights = useMemo(() => {
    const activeDeals = deals.filter(d => 
        d.stage !== DealStage.CLOSED_LOST && 
        d.stage !== DealStage.CLOSED_WON
    );

    if (activeDeals.length === 0) return [];

    // Sort by urgency
    const sorted = [...activeDeals].sort((a, b) => {
        // Red Health is #1 Priority
        if (a.health === 'red' && b.health !== 'red') return -1;
        if (a.health !== 'red' && b.health === 'red') return 1;
        // High Risk is #2
        if (a.riskLevel === 'high' && b.riskLevel !== 'high') return -1;
        if (a.riskLevel !== 'high' && b.riskLevel === 'high') return 1;
        // Value is #3
        return b.value - a.value;
    });
    return sorted.slice(0, 5);
  }, [deals]);

  const currentSpotlight = topSpotlights[spotlightIndex];

  // Determine the Reason for Spotlight
  const spotlightReason = useMemo(() => {
    if (!currentSpotlight) return null;
    
    if (currentSpotlight.health === 'red') {
        if (currentSpotlight.inactiveDays && currentSpotlight.inactiveDays > 30) return `Critical Stagnation (${currentSpotlight.inactiveDays} days)`;
        if (currentSpotlight.stageDurationDays && currentSpotlight.stageDurationDays > 60) return `Stuck in Stage (${currentSpotlight.stageDurationDays} days)`;
        if (currentSpotlight.riskLevel === 'high' && (currentSpotlight.inactiveDays || 0) > 14) return `High Risk Inactivity`;
        return 'Critical Health Alert';
    }
    if (currentSpotlight.riskLevel === 'high') return 'High Risk Priority';
    return 'Top Value Opportunity';
  }, [currentSpotlight]);

  // Generate Pulse Data with "Visual Shake" logic
  const pulseData = useMemo(() => {
    if (!currentSpotlight) return [];
    const points = [];
    // Higher jitter for Red/High risk to simulate "racing heart" or "unstable"
    const instability = currentSpotlight.health === 'red' || currentSpotlight.riskLevel === 'high' ? 25 : 5; 
    
    for (let i = 20; i >= 0; i--) {
        // Base value
        let value = 50;
        
        // Add random jitter based on instability
        value += (Math.random() - 0.5) * instability;

        // Add a "beat" pattern
        if (i % 5 === 0) {
            value += (currentSpotlight.health === 'red' ? 40 : 20); // Harder beat for red
        }
        
        points.push({ i, value: Math.max(0, Math.min(100, value)) });
    }
    return points;
  }, [currentSpotlight]);

  // --- 3. Effects & API with Caching ---
  useEffect(() => {
    let isMounted = true;
    const fetchBrief = async () => {
      // CACHE STRATEGY: Check if we have a valid brief for today to save API calls
      const todayKey = new Date().toISOString().split('T')[0];
      const cacheKey = `meteo_brief_${todayKey}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
         try {
             const parsed = JSON.parse(cached);
             if (isMounted) {
                 setBrief(parsed);
                 setLoadingBrief(false);
             }
             return; // Exit early if cache hit
         } catch (e) {
             console.error("Cache parse error", e);
             localStorage.removeItem(cacheKey);
         }
      }

      const activeDeals = deals.filter(d => d.stage !== DealStage.CLOSED_LOST && d.stage !== DealStage.CLOSED_WON);
      
      if (activeDeals.length > 0) {
        setLoadingBrief(true);
        const data = await generateDailyBrief(activeDeals);
        if (isMounted) {
          setBrief(data);
          setLoadingBrief(false);
          
          // Only cache if it's a valid successful response (not an error fallback)
          if (data && data.priorities.length > 0 && !data.priorities[0].includes('quota') && !data.priorities[0].includes('Check internet')) {
              localStorage.setItem(cacheKey, JSON.stringify(data));
          }
        }
      } else {
        setLoadingBrief(false);
      }
    };
    fetchBrief();
    return () => { isMounted = false; };
  }, [deals]);

  const handleNextSpotlight = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSpotlightIndex((prev) => (prev + 1) % topSpotlights.length);
  };

  const handlePrevSpotlight = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSpotlightIndex((prev) => (prev - 1 + topSpotlights.length) % topSpotlights.length);
  };

  const getLineColor = (deal: Deal) => {
      if (deal.health === 'red' || deal.riskLevel === 'high') return '#EF4444'; // Red
      return '#10B981'; // Emerald
  };

  const getPulseAnimationClass = (deal: Deal) => {
      if (deal.health === 'red' || deal.riskLevel === 'high') return 'animate-heartbeat-fast border-red-500/30';
      return 'animate-heartbeat-slow border-emerald-500/20';
  };

  const currentOwnerRisk = currentSpotlight ? getOwnerRisk(currentSpotlight.ownerName) : null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1800px] mx-auto pb-10">
      
      {/* 1. CRITICAL FOCUS SPOTLIGHT CAROUSEL */}
      {currentSpotlight && (
          <div className="w-full animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-500/10 rounded border border-red-500/20">
                        <Flame size={18} className="text-red-500 animate-pulse" />
                    </div>
                    <h2 className="text-lg font-bold font-heading tracking-widest text-white uppercase">Critical Focus Spotlight</h2>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        CASE {spotlightIndex + 1}/{topSpotlights.length}
                    </span>
                 </div>
                 
                 {/* Carousel Controls */}
                 <div className="flex gap-2">
                     <button onClick={handlePrevSpotlight} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                         <ChevronLeft size={20} />
                     </button>
                     <button onClick={handleNextSpotlight} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                         <ChevronRight size={20} />
                     </button>
                 </div>
             </div>

             {/* Main Card */}
             <div 
                onClick={() => onDealClick && onDealClick(currentSpotlight)}
                className="w-full bg-[#09090B] rounded-xl border border-zinc-800 p-6 lg:p-8 relative overflow-hidden group hover:border-gold-500/30 transition-all cursor-pointer shadow-2xl"
             >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 relative z-10 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white font-heading mb-3 group-hover:text-gold-400 transition-colors">{currentSpotlight.title}</h1>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                                <Building size={12} className="text-gold-500" />
                                <span className="uppercase tracking-wide font-bold text-[10px] text-zinc-300">{currentSpotlight.companyName}</span>
                            </div>
                            <div className="flex items-center gap-2 px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                                <User size={12} className="text-zinc-400" />
                                <span className="uppercase tracking-wide font-bold text-[10px] text-zinc-300">{currentSpotlight.ownerName.split(' ')[0]}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STAGE_COLORS[currentSpotlight.stage]}`}>{currentSpotlight.stage}</span>
                            
                            {/* Burnout Warning inside Spotlight */}
                            {currentOwnerRisk && (currentOwnerRisk.risk === 'High' || currentOwnerRisk.risk === 'Critical') && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 rounded">
                                    <Siren size={12} className="text-orange-500 animate-pulse" />
                                    <span className="uppercase tracking-wide font-bold text-[10px] text-orange-400">
                                        Owner Risk: {currentOwnerRisk.risk}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-zinc-900/50 px-5 py-3 rounded-lg border border-zinc-800 backdrop-blur-md text-right md:min-w-[200px]">
                         <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Projected Value</p>
                         <p className="text-3xl font-bold text-white font-mono">{new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(currentSpotlight.value)}</p>
                    </div>
                </div>

                {/* Animated Pulse Chart */}
                <div className="pt-2 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className={currentSpotlight.health === 'red' ? "text-red-500 animate-shake-subtle" : "text-emerald-500"} />
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Momentum Pulse</h3>
                        </div>
                        {spotlightReason && (
                             <div className={`flex items-center gap-1.5 px-2 py-1 border rounded text-[10px] font-bold uppercase tracking-wide ${
                                 currentSpotlight.health === 'red' 
                                 ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                 : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                             }`}>
                                 <AlertCircle size={10} />
                                 {spotlightReason}
                             </div>
                        )}
                    </div>
                    
                    {/* The Chart Container with Visual Pulse CSS */}
                    <div className={`h-48 md:h-64 w-full relative bg-zinc-900/20 rounded border backdrop-blur-sm overflow-hidden transition-all duration-500 ${getPulseAnimationClass(currentSpotlight)}`}>
                         {/* CRT Grid Effect */}
                         <div className="absolute inset-0 z-0 opacity-20" 
                              style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                         </div>

                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={pulseData}>
                                <YAxis domain={[0, 100]} hide />
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={getLineColor(currentSpotlight)} 
                                    strokeWidth={4}
                                    dot={false}
                                    isAnimationActive={true}
                                    animationDuration={300} // Fast updates for shaky feel
                                    style={{ filter: `drop-shadow(0 0 10px ${getLineColor(currentSpotlight)})` }}
                                />
                            </LineChart>
                         </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Swipe Hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {topSpotlights.map((_, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === spotlightIndex ? 'bg-gold-500' : 'bg-zinc-800'}`}></div>
                    ))}
                </div>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-gold-500 flex items-center gap-1">
                    View Details <ChevronRight size={12}/>
                </div>
             </div>
          </div>
      )}

      {/* 2. INTELLIGENCE & STAFFING ROW */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
             <div className="p-1.5 bg-gold-500/10 rounded">
                <Sparkles className="text-gold-500" size={18} />
             </div>
             <h2 className="text-xl font-bold font-heading tracking-widest text-white uppercase">Meteo Intelligence</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CARD 1: Strategic Priorities (Existing) */}
            <div className="bg-[#09090B] border border-zinc-800 rounded-lg relative flex flex-col hover:border-gold-600/30 transition-all duration-300 group shadow-lg">
               <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                  <h4 className="font-heading font-bold text-sm text-gold-500 uppercase tracking-widest">Strategic Focus</h4>
                  <AlertCircle size={16} className="text-gold-500 opacity-80" />
               </div>
               <div className="p-6 flex-1 flex flex-col gap-4">
                  {loadingBrief ? <div className="animate-pulse space-y-2"><div className="h-4 bg-zinc-800 rounded w-3/4"></div><div className="h-4 bg-zinc-800 rounded w-1/2"></div></div> :
                  brief?.priorities.map((item, idx) => (
                    <div key={idx} className="flex gap-4 group/item">
                        <div className="flex flex-col items-center gap-1 pt-1">
                            <div className="w-5 h-5 rounded-sm bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-[10px] font-bold text-gold-500 font-mono">
                                {idx + 1}
                            </div>
                            <div className="w-px h-full bg-zinc-800 group-last/item:hidden"></div>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed font-medium pb-2 border-b border-dashed border-zinc-800/50 w-full group-last/item:border-none">
                            {item}
                        </p>
                    </div>
                  ))}
               </div>
            </div>

            {/* CARD 2: Execution Protocol (Existing) */}
            <div className="bg-[#09090B] border border-zinc-800 rounded-lg relative flex flex-col hover:border-zinc-600 transition-all duration-300 group shadow-lg">
               <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                  <h4 className="font-heading font-bold text-sm text-zinc-200 uppercase tracking-widest">Execution Prep</h4>
                  <Zap size={16} className="text-zinc-400" />
               </div>
               <div className="p-6 flex-1 flex flex-col gap-4">
                  {loadingBrief ? <div className="animate-pulse space-y-2"><div className="h-4 bg-zinc-800 rounded w-full"></div><div className="h-4 bg-zinc-800 rounded w-2/3"></div></div> :
                  brief?.meetingPrep.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded bg-zinc-900/20 border border-zinc-800/50 hover:bg-zinc-900/40 hover:border-zinc-700 transition-colors">
                      <CheckCircle2 className="text-emerald-500/80 shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-zinc-300 leading-snug">{item}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* CARD 3: BURNOUT RISK FORECAST (REPLACED INFLOW VELOCITY) */}
            <div className="bg-[#09090B] border border-zinc-800 rounded-lg relative flex flex-col hover:border-red-500/30 transition-all duration-300 group shadow-lg">
               <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                  <h4 className="font-heading font-bold text-sm text-red-400 uppercase tracking-widest">Staffing Forecast</h4>
                  <AlertTriangle size={16} className="text-red-400" />
               </div>
               
               <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto max-h-[300px] custom-scrollbar">
                  {staffRisks.length > 0 ? (
                     staffRisks.slice(0, 5).map((staff, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded border border-zinc-800/50 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                                  {staff.name.charAt(0)}
                               </div>
                               <div>
                                  <div className="font-bold text-sm text-zinc-200">{staff.name}</div>
                                  <div className="text-[10px] text-zinc-500 uppercase">Stress Score: {staff.score}</div>
                               </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                staff.risk === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                staff.risk === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' :
                                'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            }`}>
                               {staff.risk}
                            </div>
                        </div>
                     ))
                  ) : (
                     <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 italic">
                        No staffing data available.
                     </div>
                  )}
               </div>
               
               {/* Footer Summary */}
               <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/10 text-[10px] text-zinc-500 flex justify-between uppercase tracking-wider font-bold">
                   <span>Total Active Staff</span>
                   <span>{staffRisks.length} Members</span>
               </div>
               <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;