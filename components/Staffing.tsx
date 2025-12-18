import React, { useMemo } from 'react';
import { Deal, DealStage, StaffingProfile } from '../types';
import { STRESS_WEIGHTS, STAGE_COLORS } from '../constants';
import { User, AlertTriangle, Briefcase, DollarSign, Activity, Flame } from 'lucide-react';

interface StaffingProps {
  deals: Deal[];
}

const Staffing: React.FC<StaffingProps> = ({ deals }) => {
  const staffProfiles = useMemo(() => {
    const ownerMap: Record<string, StaffingProfile> = {};

    deals.forEach(deal => {
      // Only track active deals for burnout
      if (deal.stage === DealStage.CLOSED_LOST || deal.stage === DealStage.CLOSED_WON) return;

      let rawOwner = deal.ownerName || 'Unassigned';
      if (rawOwner.includes(',')) rawOwner = rawOwner.split(',')[0];
      const owner = rawOwner.trim();
      if (!owner || owner.toLowerCase() === 'unassigned') return;

      if (!ownerMap[owner]) {
        ownerMap[owner] = {
          name: owner,
          dealCount: 0,
          activeValue: 0,
          stressScore: 0,
          burnoutRisk: 'Low',
          criticalDeals: 0,
          negotiationCount: 0,
          deals: []
        };
      }

      const profile = ownerMap[owner];
      profile.dealCount++;
      profile.activeValue += deal.value;
      profile.deals.push(deal);
      
      if (deal.health === 'red') profile.criticalDeals++;
      if (deal.stage === DealStage.NEGOTIATION) profile.negotiationCount++;

      // --- STRESS CALCULATION ---
      let dealStress = STRESS_WEIGHTS.STAGE_SCORE[deal.stage] || 1;
      
      // Critical Health adds mental load
      if (deal.health === 'red') dealStress += STRESS_WEIGHTS.CRITICAL_HEALTH_PENALTY;
      
      // High value deals add pressure
      if (deal.value > STRESS_WEIGHTS.HIGH_VALUE_THRESHOLD) dealStress += STRESS_WEIGHTS.HIGH_VALUE_PENALTY;

      profile.stressScore += dealStress;
    });

    // Determine Risk Level based on total score
    Object.values(ownerMap).forEach(profile => {
      if (profile.stressScore > 25) profile.burnoutRisk = 'Critical';
      else if (profile.stressScore > 15) profile.burnoutRisk = 'High';
      else if (profile.stressScore > 8) profile.burnoutRisk = 'Moderate';
      else profile.burnoutRisk = 'Low';
    });

    return Object.values(ownerMap).sort((a, b) => b.stressScore - a.stressScore);
  }, [deals]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', notation: 'compact' }).format(val);

  return (
    <div className="space-y-6 md:space-y-8 max-w-full mx-auto pb-20">
      <div className="flex flex-col mb-4 px-1">
        <h2 className="text-2xl md:text-3xl font-bold text-primary font-heading mb-2">Team Bandwidth</h2>
        <p className="text-sm md:text-base text-secondary max-w-2xl">
          Tracking workload intensity based on deal stage, value pressure, and critical health status.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {staffProfiles.map((profile) => (
          <div key={profile.name} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
             
             {/* Header */}
             <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center bg-app/30 gap-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shrink-0">
                      <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
                         <User size={24} className="text-primary" />
                      </div>
                   </div>
                   <div>
                      <h3 className="text-lg md:text-xl font-bold text-primary">{profile.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium mt-1">
                         <span className="flex items-center gap-1 text-secondary"><Briefcase size={12}/> {profile.dealCount} Active</span>
                         <span className="flex items-center gap-1 text-secondary"><DollarSign size={12}/> {formatCurrency(profile.activeValue)}</span>
                      </div>
                   </div>
                </div>
                
                <div className={`w-full md:w-auto px-4 py-2 rounded-xl border flex items-center justify-between md:justify-start gap-2 ${
                    profile.burnoutRisk === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' :
                    profile.burnoutRisk === 'High' ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400' :
                    profile.burnoutRisk === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400' :
                    'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                }`}>
                    <div className="flex items-center gap-2">
                        <Activity size={18} />
                        <span className="text-[10px] uppercase font-bold opacity-70 md:hidden">Stress Level</span>
                    </div>
                    <div className="flex flex-col items-end leading-none">
                       <span className="text-[10px] uppercase font-bold opacity-70 hidden md:block">Stress Level</span>
                       <span className="font-bold">{profile.burnoutRisk}</span>
                    </div>
                </div>
             </div>

             {/* Metrics Body */}
             <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-xs md:text-sm font-medium text-secondary">Workload Intensity</span>
                   <div className="flex-1 h-3 bg-app rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                            profile.stressScore > 20 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`} 
                        style={{ width: `${Math.min((profile.stressScore / 30) * 100, 100)}%` }}
                      ></div>
                   </div>
                   <span className="text-sm font-mono font-bold text-primary">{profile.stressScore} pts</span>
                </div>

                {/* Factors */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                   <div className="bg-app/50 p-3 rounded-xl border border-border">
                      <p className="text-[10px] md:text-xs text-secondary uppercase tracking-wider mb-1">Negotiation Stage</p>
                      <p className={`font-bold text-base md:text-lg ${profile.negotiationCount > 2 ? 'text-orange-500' : 'text-primary'}`}>
                        {profile.negotiationCount} <span className="text-xs font-normal text-secondary">deals</span>
                      </p>
                   </div>
                   <div className="bg-app/50 p-3 rounded-xl border border-border">
                      <p className="text-[10px] md:text-xs text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                        Critical Health <AlertTriangle size={12} className={profile.criticalDeals > 0 ? "text-red-500" : "text-gray-400"}/>
                      </p>
                      <p className={`font-bold text-base md:text-lg ${profile.criticalDeals > 0 ? 'text-red-500' : 'text-primary'}`}>
                        {profile.criticalDeals} <span className="text-xs font-normal text-secondary">deals</span>
                      </p>
                   </div>
                </div>

                {/* Top Stressors */}
                <div className="mt-6">
                    <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Top Stressors</h5>
                    <div className="space-y-2">
                        {profile.deals
                           .sort((a, b) => b.value - a.value) // Sort by value to show biggest burdens
                           .slice(0, 3)
                           .map(deal => (
                             <div key={deal.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-app transition-colors">
                                <div className="flex flex-col">
                                   <span className="font-medium text-primary truncate max-w-[140px] md:max-w-[180px]">{deal.title}</span>
                                   <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit ${STAGE_COLORS[deal.stage]}`}>{deal.stage}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                   <span className="font-mono text-secondary">{formatCurrency(deal.value)}</span>
                                   {deal.health === 'red' && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><Flame size={10}/> Critical</span>}
                                </div>
                             </div>
                           ))
                        }
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Staffing;