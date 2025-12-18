import React, { useMemo } from 'react';
import { Deal, ActivityType } from '../types';
import { ArrowLeft, Phone, Mail, Calendar, Building, Thermometer, Wind, Eye, Activity, Zap, User } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { STAGE_COLORS } from '../constants';

interface DealDetailProps {
  deal: Deal;
  onBack: () => void;
}

const DealDetail: React.FC<DealDetailProps> = ({ deal, onBack }) => {
  
  // Calculate Pulse History for Line Chart
  const pulseData = useMemo(() => {
    const points = [];
    const now = new Date();
    for (let i = 20; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        let value = 30 + Math.random() * 15;
        
        const hasActivity = deal.activityLogs.some(log => log.date === dateStr);
        if (hasActivity) {
            value += 40 + Math.random() * 20;
        } else {
            value += (Math.random() - 0.5) * 10;
        }

        value += (deal.probability / 100) * 10;
        value = Math.max(10, Math.min(100, value));
        
        points.push({ i, value });
    }
    return points;
  }, [deal]);

  const getLineColor = () => {
      if (deal.health === 'red' || deal.riskLevel === 'high') return '#EF4444';
      if (deal.riskLevel === 'medium') return '#EAB308';
      return '#10B981';
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto pb-10">
      
      {/* Navigation */}
      <button onClick={onBack} className="flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors w-fit group">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Matrix
      </button>

      {/* Header */}
      <div className="bg-[#09090B] rounded-lg p-6 md:p-8 border border-zinc-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px] transform translate-x-20 -translate-y-20 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading mb-3">{deal.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded border border-zinc-800">
                <Building size={14} className="text-gold-500" />
                <span className="uppercase tracking-wide font-bold text-xs text-white">{deal.companyName}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded border border-zinc-800">
                <User size={14} className="text-zinc-400" />
                <span className="uppercase tracking-wide font-bold text-xs text-white">{deal.ownerName}</span>
              </div>
              <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase border ${STAGE_COLORS[deal.stage]}`}>{deal.stage}</span>
            </div>
          </div>
          <div className="bg-zinc-900/80 px-6 py-4 rounded-lg border border-zinc-700/50 backdrop-blur-md">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-1 text-right">Projected Value</p>
            <p className="text-3xl md:text-4xl font-bold text-gold-500 flex items-center font-heading tracking-tight">
              {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(deal.value)}
            </p>
          </div>
        </div>

        {/* Momentum Pulse Visualization (Heartbeat Style) */}
        <div className="border-t border-zinc-800 pt-8 relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-red-500/10 rounded">
                    <Activity size={16} className="text-red-500" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Momentum Pulse</h3>
            </div>
            
            <div className="h-40 w-full relative bg-zinc-900/20 rounded border border-zinc-800/50 backdrop-blur-sm overflow-hidden">
                {/* CRT/Monitor Grid Effect */}
                <div className="absolute inset-0 z-0 opacity-20" 
                     style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pulseData}>
                        <YAxis domain={[0, 100]} hide />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={getLineColor()} 
                            strokeWidth={3}
                            dot={false}
                            isAnimationActive={true}
                            animationDuration={2000}
                            style={{ filter: `drop-shadow(0 0 8px ${getLineColor()})` }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between mt-2 text-[10px] text-zinc-600 font-mono uppercase">
                <span>History (20 Days)</span>
                <span>Live Status</span>
            </div>
        </div>
      </div>

      {/* Deal Meteorology Infographic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gauge 1: Temperature/Probability */}
            <div className="bg-[#09090B] p-6 rounded-lg border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden group hover:border-zinc-700 transition-colors">
               <div className="flex items-center gap-2 mb-4 text-zinc-500 z-10">
                  <Thermometer size={16} className="text-gold-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Temperature</span>
               </div>
               
               {/* CSS Gauge */}
               <div className="relative w-28 h-14 overflow-hidden mb-2 z-10">
                 <div className="absolute top-0 left-0 w-28 h-28 rounded-full border-[8px] border-zinc-900 border-b-transparent border-r-transparent transform -rotate-45"></div>
                 <div 
                   className={`absolute top-0 left-0 w-28 h-28 rounded-full border-[8px] border-b-transparent border-r-transparent transform transition-all duration-1000 ease-out origin-center
                    ${deal.probability > 70 ? 'border-emerald-500' : deal.probability > 40 ? 'border-gold-500' : 'border-red-500'}
                   `}
                   style={{ transform: `rotate(${(deal.probability / 100) * 180 - 135}deg)` }}
                 ></div>
               </div>
               <span className="text-3xl font-bold text-white z-10 font-heading">{deal.probability}%</span>
            </div>

            {/* Gauge 2: Pressure/Risk */}
            <div className="bg-[#09090B] p-6 rounded-lg border border-zinc-800 flex flex-col items-center justify-center relative group hover:border-zinc-700 transition-colors">
               <div className="flex items-center gap-2 mb-6 text-zinc-500">
                  <Wind size={16} className="text-red-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Pressure</span>
               </div>
               <div className="w-full h-2 bg-zinc-900 rounded-full mb-4 overflow-hidden relative">
                   <div 
                     className={`h-full rounded-full transition-all duration-1000 ${
                        deal.riskLevel === 'high' ? 'bg-red-500 shadow-[0_0_10px_#EF4444]' : 
                        deal.riskLevel === 'medium' ? 'bg-gold-500' : 'bg-emerald-500'
                     }`}
                     style={{ width: deal.riskLevel === 'high' ? '90%' : deal.riskLevel === 'medium' ? '50%' : '20%' }}
                   ></div>
               </div>
               <span className={`font-bold uppercase tracking-wider text-sm ${
                   deal.riskLevel === 'high' ? 'text-red-500' : 
                   deal.riskLevel === 'medium' ? 'text-gold-500' : 'text-emerald-500'
               }`}>{deal.riskLevel}</span>
            </div>

             {/* Gauge 3: Visibility */}
            <div className="bg-[#09090B] p-6 rounded-lg border border-zinc-800 flex flex-col items-center justify-center relative group hover:border-zinc-700 transition-colors">
               <div className="flex items-center gap-2 mb-6 text-zinc-500">
                  <Eye size={16} className="text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Visibility</span>
               </div>
               <div className="flex items-end gap-1 h-12 mb-2">
                  <div className="w-2 bg-blue-900/50 h-[40%] rounded-sm"></div>
                  <div className="w-2 bg-blue-900 h-[60%] rounded-sm"></div>
                  <div className="w-2 bg-blue-500 h-[80%] rounded-sm shadow-[0_0_8px_#3B82F6]"></div>
                  <div className="w-2 bg-blue-900/50 h-[30%] rounded-sm"></div>
               </div>
               <span className="text-xs text-zinc-400 mt-1 uppercase font-bold">Clear Path</span>
            </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#09090B] rounded-lg border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">Signal Log</h3>
            <button className="text-[10px] font-bold uppercase text-gold-500 border border-gold-500/30 px-3 py-1 rounded hover:bg-gold-500/10 transition-colors flex items-center gap-1">
                <Zap size={12} /> Log Interaction
            </button>
        </div>
        <div className="p-6 space-y-6">
          {deal.activityLogs.length === 0 ? (
              <div className="text-zinc-500 italic text-center py-8 text-sm border-2 border-dashed border-zinc-800/50 rounded-lg">
                  No signals recorded yet. Start engaging.
              </div>
          ) : (
            deal.activityLogs.map((log) => (
              <div key={log.id} className="flex gap-6 group relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-8 bottom-[-24px] w-px bg-zinc-800 group-last:hidden"></div>
                
                <div className="flex flex-col items-center z-10">
                  <div className={`p-2.5 rounded-lg border text-white shadow-sm ${
                      log.sentiment === 'positive' ? 'bg-emerald-500/10 border-emerald-500/30' :
                      log.sentiment === 'negative' ? 'bg-red-500/10 border-red-500/30' :
                      'bg-zinc-800 border-zinc-700'
                  }`}>
                    {log.type === ActivityType.MEETING && <Calendar size={14} />}
                    {log.type === ActivityType.CALL && <Phone size={14} />}
                    {log.type === ActivityType.EMAIL && <Mail size={14} />}
                  </div>
                </div>
                <div className="pb-2 w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        {log.type}
                        {log.sentiment === 'positive' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">{log.date}</span>
                  </div>
                   <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                      <p className="text-xs text-zinc-300 leading-relaxed">{log.summary}</p>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DealDetail;