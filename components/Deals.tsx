import React from 'react';
import { Deal } from '../types';
import { STAGE_COLORS, RISK_COLORS } from '../constants';
import { ChevronRight, Filter, Plus, User } from 'lucide-react';

interface DealsProps {
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
}

const Deals: React.FC<DealsProps> = ({ deals, onSelectDeal }) => {
  return (
    <div className="space-y-6 w-full mx-auto pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-white font-heading tracking-wide uppercase">Pipeline Matrix</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:border-gold-500/50 transition-colors text-xs font-bold uppercase tracking-wider text-secondary hover:text-white">
             <Filter size={14} />
             <span>Filter</span>
          </button>
          <button className="flex-1 md:flex-none justify-center flex items-center gap-2 px-5 py-2 bg-gold-500 text-black rounded-lg hover:bg-gold-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]">
             <Plus size={16} strokeWidth={3} />
             <span className="text-xs font-bold uppercase tracking-wider">New</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-app border-b border-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">Deal / Company</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">Owner</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">Stage</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">Value</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">Probability</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">Next Step</th>
                <th className="px-6 py-4 text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">Risk</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deals.map((deal) => (
                <tr 
                  key={deal.id} 
                  className="hover:bg-white/5 cursor-pointer transition-colors group"
                  onClick={() => onSelectDeal(deal)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white group-hover:text-gold-400 transition-colors max-w-[200px] truncate">{deal.title}</span>
                      <span className="text-xs text-secondary mt-0.5 uppercase tracking-wide">{deal.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-border flex items-center justify-center text-[10px] font-bold text-secondary uppercase">
                          {deal.ownerName.charAt(0)}
                        </div>
                        <span className="text-xs text-secondary truncate max-w-[100px]">
                          {deal.ownerName.split(' ')[0]}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${STAGE_COLORS[deal.stage]}`}>
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-mono text-sm">
                    {new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(deal.value)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24">
                        <div className="flex justify-between text-[10px] text-secondary mb-1">
                             <span>{deal.probability}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1">
                            <div 
                                className={`h-1 rounded-full ${deal.probability > 60 ? 'bg-emerald-500' : 'bg-gold-500'}`} 
                                style={{ width: `${deal.probability}%` }}
                            ></div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-secondary max-w-[150px] truncate opacity-70">
                    {deal.nextStep}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${RISK_COLORS[deal.riskLevel]}`}>
                      {deal.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={16} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {deals.map((deal) => (
            <div 
                key={deal.id} 
                onClick={() => onSelectDeal(deal)}
                className="bg-card p-4 rounded-xl border border-border active:scale-[0.98] transition-transform"
            >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-white text-sm">{deal.title}</h3>
                        <p className="text-xs text-secondary uppercase tracking-wide mt-0.5">{deal.companyName}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STAGE_COLORS[deal.stage]}`}>
                        {deal.stage}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 my-3 bg-app/50 p-3 rounded-lg border border-border">
                    <div>
                        <p className="text-[10px] text-secondary uppercase mb-1">Value</p>
                        <p className="font-mono text-sm font-bold text-gold-400">{new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(deal.value)}</p>
                    </div>
                    <div>
                         <p className="text-[10px] text-secondary uppercase mb-1">Probability</p>
                         <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-800 h-1 rounded-full">
                                <div className="bg-white h-1 rounded-full" style={{width: `${deal.probability}%`}}></div>
                            </div>
                            <span className="text-xs font-bold">{deal.probability}%</span>
                         </div>
                    </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold uppercase ${RISK_COLORS[deal.riskLevel]}`}>{deal.riskLevel} Risk</span>
                    <span className="text-secondary">{deal.ownerName}</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Deals;