import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Deals from './components/Deals';
import DealDetail from './components/DealDetail';
import Staffing from './components/Staffing';
import Forecast from './components/Forecast';
import Ranking from './components/Ranking';
import LoginScreen from './components/LoginScreen';
import { Deal } from './types';
import { fetchDeals } from './services/dealService';
import { Loader2, X } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Modal State for "Pop-up view"
  const [modalDeal, setModalDeal] = useState<Deal | null>(null);

  useEffect(() => {
    // Initial theme set
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const loadData = async () => {
      const fetchedDeals = await fetchDeals();
      setDeals(fetchedDeals);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter deals based on search query for main views (optional usage)
  const filteredDeals = useMemo(() => {
    if (!searchQuery.trim()) return deals;
    
    const lowerQuery = searchQuery.toLowerCase();
    return deals.filter(deal => 
      deal.title.toLowerCase().includes(lowerQuery) ||
      deal.companyName.toLowerCase().includes(lowerQuery) ||
      deal.ownerName.toLowerCase().includes(lowerQuery) ||
      deal.stage.toLowerCase().includes(lowerQuery) ||
      deal.riskLevel.toLowerCase().includes(lowerQuery)
    );
  }, [deals, searchQuery]);

  // Calculate new deals (created this month) for notification
  const newDealsCount = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return deals.filter(d => {
       const cDate = d.createdDate ? new Date(d.createdDate) : new Date(0);
       return cDate >= startOfMonth;
    }).length;
  }, [deals]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedDeal(null); 
    setModalDeal(null);
  };

  // Navigates to full page deal view
  const handleSelectDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setActiveTab('deal_detail'); 
  };
  
  // Opens the pop-up modal (Used by Search & Dashboard Spotlight)
  const handleOpenDealModal = (deal: Deal) => {
      setModalDeal(deal);
  }

  const handleBackToDeals = () => {
    setSelectedDeal(null);
    setActiveTab('deals');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#1F49BF]" />
          <p>Syncing with Google Sheets...</p>
        </div>
      );
    }

    if (selectedDeal) {
      return <DealDetail deal={selectedDeal} onBack={handleBackToDeals} />;
    }

    switch (activeTab) {
      case 'overview':
        return <Dashboard deals={filteredDeals} onDealClick={handleOpenDealModal} />;
      case 'forecast':
        return <Forecast deals={deals} />; 
      case 'deals':
        return <Deals deals={filteredDeals} onSelectDeal={handleSelectDeal} />;
      case 'staffing':
        return <Staffing deals={deals} />; 
      case 'ranking':
        return <Ranking deals={deals} />;
      default:
        return <Dashboard deals={filteredDeals} onDealClick={handleOpenDealModal} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout 
      activeTab={selectedDeal ? 'deals' : activeTab} 
      onTabChange={handleTabChange}
      searchQuery={searchQuery}
      onSearch={setSearchQuery}
      theme={theme}
      toggleTheme={toggleTheme}
      notificationCount={newDealsCount}
      deals={deals}
      onDealClick={handleOpenDealModal}
    >
      {renderContent()}

      {/* Pop-up Deal View Modal */}
      {modalDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-[#09090B] w-full max-w-6xl h-[90vh] rounded-2xl border border-border shadow-2xl relative flex flex-col overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                    <button 
                        onClick={() => setModalDeal(null)}
                        className="p-2 bg-black/50 hover:bg-white/10 text-white rounded-full border border-white/10 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {/* Reuse DealDetail but hide the 'Back' button via css or prop if needed, currently just rendering it inside container */}
                    <div className="p-4">
                        <DealDetail deal={modalDeal} onBack={() => setModalDeal(null)} />
                    </div>
                </div>
             </div>
          </div>
      )}
    </Layout>
  );
};

export default App;