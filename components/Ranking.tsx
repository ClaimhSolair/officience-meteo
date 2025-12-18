import React, { useMemo } from 'react';
import { Deal, DealStage } from '../types';
import { RANKING_WEIGHTS } from '../constants';
import { Medal, Trophy, Crown, TrendingUp, Star } from 'lucide-react';

interface RankingProps {
  deals: Deal[];
}

interface SalesRanking {
  name: string;
  totalValue: number;
  dealCount: number;
  score: number;
  deals: Deal[];
}

const Ranking: React.FC<RankingProps> = ({ deals }) => {
  const rankings = useMemo(() => {
    const ownerMap: Record<string, SalesRanking> = {};

    deals.forEach(deal => {
      // 1. Filter: Consider only OPEN deals
      if (deal.stage === DealStage.CLOSED_LOST || deal.stage === DealStage.CLOSED_WON) {
        return;
      }

      // 2. Normalize Owner Name: Take 1st name before comma, trim whitespace
      let rawOwner = deal.ownerName || 'Unassigned';
      if (rawOwner.includes(',')) {
        rawOwner = rawOwner.split(',')[0];
      }
      const owner = rawOwner.trim();
      if (!owner || owner.toLowerCase() === 'unassigned') return;

      // Initialize if not exists
      if (!ownerMap[owner]) {
        ownerMap[owner] = {
          name: owner,
          totalValue: 0,
          dealCount: 0,
          score: 0,
          deals: []
        };
      }

      // 3. Calculation Logic
      // Base: Deal Value
      // Weight: Stage
      // Multiplier: Priority
      const stageWeight = RANKING_WEIGHTS.STAGE[deal.stage] || 0.1;
      const priorityMult = RANKING_WEIGHTS.PRIORITY[deal.riskLevel === 'high' ? 'high' : deal.riskLevel === 'medium' ? 'medium' : 'low'];
      
      const dealScore = deal.value * stageWeight * priorityMult;

      ownerMap[owner].totalValue += deal.value;
      ownerMap[owner].dealCount += 1;
      ownerMap[owner].score += dealScore;
      ownerMap[owner].deals.push(deal);
    });

    // Convert map to array and sort by Score Descending
    return Object.values(ownerMap).sort((a, b) => b.score - a.score);
  }, [deals]);

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-10 w-full max-w-[1600px] mx-auto pb-20 px-4">
      <div className="flex flex-col mb-8 border-b border-zinc-800 pb-6">
        <h2 className="text-3xl font-bold text-white font-heading mb-2 uppercase tracking-wide">The Arena</h2>
        <p className="text-zinc-500 text-sm max-w-2xl font-mono">
          Live performance tracking based on weighted deal velocity.
        </p>
      </div>

      {/* Podium Section */}
      {top3.length > 0 && (
        <div className="flex flex-col md:flex-row justify-center items-end gap-6 lg:gap-12 mb-16 min-h-[450px]">
          {/* Silver - 2nd Place */}
          {top3[1] && <PodiumCard rank={2} data={top3[1]} />}
          
          {/* Gold - 1st Place (Center, Largest) */}
          {top3[0] && <PodiumCard rank={1} data={top3[0]} />}
          
          {/* Bronze - 3rd Place */}
          {top3[2] && <PodiumCard rank={3} data={top3[2]} />}
        </div>
      )}

      {/* The Rest List */}
      {rest.length > 0 && (
        <div className="bg-[#09090B] rounded-lg border border-zinc-800 overflow-hidden shadow-sm max-w-5xl mx-auto">
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
             <h3 className="font-bold text-lg text-white font-heading uppercase tracking-widest">Challengers</h3>
             <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase">
                <TrendingUp size={14} className="text-gold-500" />
                <span>Rising Stars</span>
             </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#09090B] border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Salesperson</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Deals</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Pipeline Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Power Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {rest.map((r, idx) => (
                <tr key={r.name} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-zinc-600 group-hover:text-white transition-colors">#{idx + 4}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-400 border border-zinc-700">
                         {r.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-zinc-300 group-hover:text-gold-400 transition-colors capitalize text-sm">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-400 font-mono text-sm">{r.dealCount}</td>
                  <td className="px-6 py-4 text-right text-zinc-400 font-mono text-sm">{formatCurrency(r.totalValue)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-zinc-900 text-zinc-300 border border-zinc-800">
                       {Math.round(r.score).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PodiumCard = ({ rank, data }: { rank: number; data: SalesRanking }) => {
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;

  const heightClass = isGold ? 'h-[460px]' : isSilver ? 'h-[400px]' : 'h-[360px]';
  
  const accentColor = isGold ? 'text-gold-500' : isSilver ? 'text-zinc-300' : 'text-orange-700';
  const bgColor = isGold ? 'bg-gradient-to-b from-gold-500/10 to-[#09090B]' : isSilver ? 'bg-gradient-to-b from-zinc-500/10 to-[#09090B]' : 'bg-gradient-to-b from-orange-900/10 to-[#09090B]';
  const borderColor = isGold ? 'border-gold-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : isSilver ? 'border-zinc-700' : 'border-orange-900/50';

  return (
    <div className={`relative flex flex-col items-center justify-end ${heightClass} w-full md:w-1/3 max-w-xs order-${rank === 1 ? 2 : rank === 2 ? 1 : 3} group perspective-1000`}>
      
      {/* Crown for #1 */}
      {isGold && (
        <div className="absolute -top-12 animate-bounce z-20">
           <Crown size={48} className="text-gold-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" fill="currentColor" />
        </div>
      )}

      {/* Card Content */}
      <div className={`w-full h-full ${bgColor} border rounded-xl flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${borderColor}`}>
        
        {/* Header */}
        <div className="relative z-10 flex flex-col items-center w-full pt-8 pb-6">
            <div className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center shadow-lg mb-4 rotate-3 group-hover:rotate-0 transition-all duration-300 bg-[#09090B] ${
                isGold ? 'border-gold-500 text-gold-500' : 
                isSilver ? 'border-zinc-400 text-zinc-400' : 
                'border-orange-700 text-orange-700'
            }`}>
                <span className="font-bold text-2xl uppercase font-heading">{data.name.charAt(0)}</span>
            </div>
            
            <h3 className={`text-xl font-bold text-white capitalize text-center leading-tight mb-2 font-heading px-2 truncate w-full`}>
              {data.name}
            </h3>
            
            <div className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border bg-[#09090B] ${
                isGold ? 'border-gold-500/50 text-gold-500' : 
                isSilver ? 'border-zinc-600 text-zinc-400' : 
                'border-orange-900/50 text-orange-700'
            }`}>
              {isGold ? <Trophy size={12}/> : <Medal size={12}/>}
              Rank #{rank}
            </div>
        </div>

        {/* Stats Body */}
        <div className="flex-1 px-5 pb-4 w-full">
            <div className="bg-[#09090B]/50 rounded-lg p-4 border border-zinc-800/50 space-y-3 w-full backdrop-blur-sm">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Volume</span>
                    <span className={`font-bold text-base font-mono ${isGold ? 'text-white' : 'text-zinc-300'}`}>
                        {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', notation: "compact" }).format(data.totalValue)}
                    </span>
                </div>
                 <div className="w-full h-px bg-zinc-800/50"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Active Deals</span>
                    <span className="font-bold text-base font-mono text-zinc-300">{data.dealCount}</span>
                </div>
            </div>
        </div>

        {/* Power Score Footer */}
        <div className="bg-[#09090B] p-5 text-center border-t border-zinc-800">
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-bold mb-1">Power Score</p>
            <p className={`text-3xl font-black font-heading tracking-tighter ${accentColor}`}>
                {Math.round(data.score).toLocaleString()}
            </p>
        </div>
        
        {/* Background Particles/Glow */}
        {isGold && <div className="absolute inset-0 bg-gold-500/5 z-0 pointer-events-none"></div>}
      </div>
    </div>
  );
};

export default Ranking;