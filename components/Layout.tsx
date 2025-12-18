import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { LayoutDashboard, List, Search, CloudLightning, LineChart, Bot, X, Activity, Trophy, ChevronRight, User, Menu, ChevronDown } from 'lucide-react';
import AIAssistant from './AIAssistant';
import { Deal } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  notificationCount: number;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  searchQuery, 
  onSearch, 
  deals,
  onDealClick
}) => {
  const [showAssistant, setShowAssistant] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDeals = searchQuery 
    ? deals.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.companyName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const getPageTitle = () => {
      if (activeTab === 'deal_detail') return 'Deal Intelligence';
      if (activeTab === 'ranking') return 'Sales Leaderboard';
      if (activeTab === 'overview') return 'Overview';
      return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  const handleMobileNav = (tab: string) => {
      onTabChange(tab);
      setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-app text-primary overflow-hidden font-sans relative">
      {/* Sidebar - Desktop Only (Hidden on Mobile) */}
      <aside className="hidden lg:flex w-64 bg-card/50 backdrop-blur-md border-r border-border flex-col z-30 transition-all duration-300">
        <div className="h-20 flex items-center justify-start px-6 border-b border-border/50">
          <img 
            src="https://pub-e3bac769bc084adbae54275f1413ca66.r2.dev/logo_horizontal.png" 
            alt="Meteo Logo" 
            className="h-12 w-auto object-contain"
          />
        </div>

        <nav className="flex-1 py-6 space-y-1 px-3">
          <NavButton 
            active={activeTab === 'overview'} 
            onClick={() => onTabChange('overview')} 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
          />
          <NavButton 
            active={activeTab === 'forecast'} 
            onClick={() => onTabChange('forecast')} 
            icon={<LineChart size={20} />} 
            label="Forecast" 
          />
          <NavButton 
            active={activeTab === 'deals'} 
            onClick={() => onTabChange('deals')} 
            icon={<List size={20} />} 
            label="Pipeline" 
          />
          <NavButton 
            active={activeTab === 'ranking'} 
            onClick={() => onTabChange('ranking')} 
            icon={<Trophy size={20} />} 
            label="The Arena" 
          />
          <NavButton 
            active={activeTab === 'staffing'} 
            onClick={() => onTabChange('staffing')} 
            icon={<Activity size={20} />} 
            label="Bandwidth" 
          />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-particle-pattern">
        {/* Header */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-6 z-20 border-b border-border bg-app/80 backdrop-blur-sm relative">
          
          <div className="flex items-center gap-3">
             {/* Mobile Menu Trigger */}
             <button 
                className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>

             {/* Dynamic Title / Dropdown Toggle */}
             <div className="flex items-center gap-3">
                <img 
                  src="https://pub-e3bac769bc084adbae54275f1413ca66.r2.dev/logo_horizontal.png" 
                  alt="Meteo Logo" 
                  className="h-8 w-auto object-contain lg:hidden"
                />
                <div className="w-px h-6 bg-zinc-800 hidden md:block"></div>
                <div className="flex flex-col">
                    <button 
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="flex items-center gap-2 text-lg md:text-xl font-bold uppercase tracking-wider text-white font-heading text-left"
                    >
                      {getPageTitle()}
                      <ChevronDown size={16} className={`lg:hidden text-gold-500 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
             </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar with Autocomplete */}
            <div className="relative hidden md:block group z-50" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary group-focus-within:text-gold-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Query deal intelligence..." 
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-xs text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 w-64 transition-all focus:w-80 placeholder-zinc-600"
                value={searchQuery || ''}
                onChange={(e) => {
                  onSearch && onSearch(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && filteredDeals.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-[#09090B] border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                   <div className="py-2">
                      <p className="px-4 py-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Top Matches</p>
                      {filteredDeals.map(deal => (
                        <button 
                          key={deal.id}
                          onClick={() => {
                            onDealClick(deal);
                            setShowSearchResults(false);
                            if(onSearch) onSearch(''); // Clear search after selection
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center justify-between group/item transition-colors"
                        >
                           <div className="flex flex-col gap-1">
                              <span className="font-bold text-sm text-white group-hover/item:text-gold-500 transition-colors">{deal.title}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 uppercase">{deal.companyName}</span>
                                <span className="text-[10px] text-zinc-600 px-1.5 py-0.5 bg-white/5 rounded flex items-center gap-1">
                                  <User size={8} /> {deal.ownerName.split(' ')[0]}
                                </span>
                              </div>
                           </div>
                           <ChevronRight size={14} className="text-zinc-600 group-hover/item:text-gold-500 opacity-0 group-hover/item:opacity-100 transition-all" />
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowAssistant(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(234,179,8,0.3)]"
            >
              <Bot size={16} />
              <span>ASK OTTY</span>
            </button>
          </div>

          {/* MOBILE DROPDOWN MENU */}
          {isMobileMenuOpen && (
              <div className="absolute top-full left-0 w-full bg-[#09090B] border-b border-border shadow-2xl z-50 flex flex-col p-2 animate-in slide-in-from-top-2 lg:hidden">
                  <MobileNavButton 
                    active={activeTab === 'overview'} 
                    onClick={() => handleMobileNav('overview')} 
                    icon={<LayoutDashboard size={18} />} 
                    label="Overview" 
                  />
                  <MobileNavButton 
                    active={activeTab === 'forecast'} 
                    onClick={() => handleMobileNav('forecast')} 
                    icon={<LineChart size={18} />} 
                    label="Forecast" 
                  />
                  <MobileNavButton 
                    active={activeTab === 'deals'} 
                    onClick={() => handleMobileNav('deals')} 
                    icon={<List size={18} />} 
                    label="Pipeline" 
                  />
                  <MobileNavButton 
                    active={activeTab === 'ranking'} 
                    onClick={() => handleMobileNav('ranking')} 
                    icon={<Trophy size={18} />} 
                    label="The Arena" 
                  />
                  <MobileNavButton 
                    active={activeTab === 'staffing'} 
                    onClick={() => handleMobileNav('staffing')} 
                    icon={<Activity size={18} />} 
                    label="Bandwidth" 
                  />
              </div>
          )}
        </header>

        {/* Scrollable Area with Animation */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pt-6 relative page-enter">
          {children}
        </main>
      </div>

      {/* Mobile FAB */}
      <button 
        onClick={() => setShowAssistant(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 h-14 w-14 bg-gold-500 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(234,179,8,0.4)] active:scale-95 transition-transform"
      >
         <Bot size={28} className="text-black" />
      </button>

      {/* Otty Popup Panel */}
      {showAssistant && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-0 md:items-end md:justify-end md:inset-auto md:bottom-24 md:right-8 animate-in fade-in duration-200">
            <div className="w-full md:w-[450px] h-[75vh] md:h-[650px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50"></div>
               <button 
                  onClick={() => setShowAssistant(false)}
                  className="absolute top-4 right-4 z-20 p-2 bg-app/50 backdrop-blur rounded-lg text-secondary hover:text-white border border-border"
               >
                  <X size={16} />
               </button>
               <AIAssistant deals={deals} />
            </div>
         </div>
      )}

    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
      active 
        ? 'text-gold-400 bg-white/5' 
        : 'text-secondary hover:text-primary hover:bg-white/5'
    }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold-500 shadow-[0_0_10px_#EAB308]"></div>}
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="block text-xs font-bold tracking-wide uppercase">{label}</span>
  </button>
);

const MobileNavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg transition-colors border-l-2 ${
        active 
          ? 'bg-white/5 text-gold-400 border-gold-500' 
          : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
    </button>
);

export default Layout;