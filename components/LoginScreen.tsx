import React, { useState } from 'react';
import { CloudLightning, Lock, ArrowRight, ScanLine, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    setLoading(true);
    setTimeout(() => {
        onLogin();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-[100] text-white font-sans overflow-hidden">
       {/* Ambient Background */}
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

       <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center">
          
          <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm relative group w-full flex justify-center">
              <div className="absolute inset-0 bg-gold-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <img 
                src="https://pub-e3bac769bc084adbae54275f1413ca66.r2.dev/logo_horizontal.png" 
                alt="Meteo Logo" 
                className="w-48 h-auto object-contain relative z-10" 
              />
          </div>

          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-10">Sales Intelligence System</p>

          <div className="w-full bg-[#0A0A0A] border border-zinc-800 rounded-xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>
             
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Lock size={10} /> Identity Verification
                </label>
                <div className="h-12 bg-[#121214] border border-zinc-800 rounded-lg flex items-center justify-between px-4">
                    <span className="font-mono text-zinc-400 tracking-widest text-sm">••••••••••••</span>
                    <ShieldCheck size={14} className="text-emerald-500" />
                </div>
             </div>

             <button 
                onClick={handleEnter}
                disabled={loading}
                className="w-full h-12 bg-white text-black font-bold uppercase tracking-widest rounded-lg hover:bg-gold-400 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
             >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce delay-150"></span>
                    </div>
                ) : (
                    <>
                        Initialize Session <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </>
                )}
             </button>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-[10px] text-zinc-600 uppercase tracking-widest">
             <ScanLine size={12} />
             System Status: Nominal
          </div>
       </div>
    </div>
  );
};

export default LoginScreen;