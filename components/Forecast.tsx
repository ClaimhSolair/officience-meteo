import React, { useMemo } from 'react';
import { Deal, DealStage } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Calendar, BrainCircuit, Activity, AlertOctagon } from 'lucide-react';

interface ForecastProps {
  deals: Deal[];
}

const Forecast: React.FC<ForecastProps> = ({ deals }) => {
  
  const activeDeals = useMemo(() => deals.filter(d => 
    d.stage !== DealStage.CLOSED_LOST && d.stage !== DealStage.CLOSED_WON
  ), [deals]);

  const totalWeighted = activeDeals.reduce((sum, d) => sum + (d.weightedValue || 0), 0);
  const totalAIWeighted = activeDeals.reduce((sum, d) => sum + (d.aiWeightedValue || 0), 0);
  const aiDelta = totalAIWeighted - totalWeighted;

  const chartData = useMemo(() => {
    const months: Record<string, { name: string; weighted: number; ai: number; sortKey: number }> = {};
    
    activeDeals.forEach(deal => {
      const date = deal.dealDate ? new Date(deal.dealDate) : new Date();
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' }); 
      const sortKey = date.getFullYear() * 100 + date.getMonth();

      if (!months[monthKey]) {
        months[monthKey] = { name: monthKey, weighted: 0, ai: 0, sortKey };
      }
      months[monthKey].weighted += (deal.weightedValue || 0);
      months[monthKey].ai += (deal.aiWeightedValue || 0);
    });

    return Object.values(months)
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(0, 6); 
  }, [activeDeals]);

  const redDeals = useMemo(() => 
    activeDeals.filter(d => d.health === 'red').sort((a, b) => b.value - a.value),
  [activeDeals]);

  const aiTopPicks = useMemo(() => 
    [...activeDeals]
      .sort((a, b) => (b.aiProbability || 0) * b.value - (a.aiProbability || 0) * a.value)
      .slice(0, 5),
  [activeDeals]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-2">
             <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Weighted Forecast</p>
             <TrendingUp size={16} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold font-heading text-white">{formatCurrency(totalWeighted)}</h3>
        </div>

        <div className="bg-card p-5 rounded-xl border border-gold-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-2 relative z-10">
             <p className="text-[10px] font-bold text-gold-500 uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit size={12} /> AI Adjusted
             </p>
             <Activity size={16} className="text-gold-500" />
          </div>
          <h3 className="text-2xl font-bold font-heading text-white relative z-10">{formatCurrency(totalAIWeighted)}</h3>
          <div className={`text-xs font-bold mt-1 ${aiDelta >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
            {aiDelta >= 0 ? '+' : ''}{formatCurrency(aiDelta)} vs Std.
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border">
          <div className="flex justify-between items-start mb-2">
             <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Health Risk</p>
             <AlertOctagon size={16} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-bold font-heading text-white">{redDeals.length} <span className="text-sm font-normal text-secondary">deals</span></h3>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Chart */}
        <div className="xl:col-span-2 bg-card p-6 rounded-xl border border-border">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16} className="text-gold-500"/>
            Revenue Projection
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272A" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717A', fontSize: 10}} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717A', fontSize: 10}} 
                  tickFormatter={(val) => `${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  cursor={{fill: '#27272A', opacity: 0.4}}
                  contentStyle={{backgroundColor: '#09090B', borderRadius: '8px', border: '1px solid #27272A', color: '#FAFAFA'}}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px', paddingTop: '10px'}}/>
                <Bar dataKey="weighted" name="Standard" fill="#3F3F46" radius={[2, 2, 0, 0]} barSize={24} />
                <Bar dataKey="ai" name="AI Adjusted" fill="#EAB308" radius={[2, 2, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Top Picks */}
        <div className="xl:col-span-1 bg-card p-6 rounded-xl border border-border flex flex-col">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
             <BrainCircuit size={16} className="text-emerald-400" />
             Top Picks
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {aiTopPicks.map((deal, idx) => (
              <div key={deal.id} className="p-3 rounded-lg bg-app border border-border hover:border-emerald-500/50 transition-all group">
                <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-emerald-500">#{idx + 1}</span>
                      <h4 className="font-bold text-xs text-white truncate max-w-[120px]">{deal.title}</h4>
                   </div>
                   <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-900/30">
                     {(deal.aiProbability || 0).toFixed(0)}%
                   </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-secondary">
                  <span>{deal.companyName}</span>
                  <span className="font-mono text-white">{formatCurrency(deal.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;