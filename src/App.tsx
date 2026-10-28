import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { GachaSection } from './components/GachaSection';
import { ShopSection } from './components/ShopSection';
import { MiniGamesSection } from './components/MiniGamesSection';
import { InventorySection } from './components/InventorySection';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ProfileDropdown } from './components/ProfileDropdown';

const MainContent: React.FC = () => {
  const { activeTab } = useGame();

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] flex flex-col items-center selection:bg-[#0F172A] selection:text-white">
      {/* Mobile-first centered frame container */}
      <div className="w-full max-w-md min-h-screen bg-[#FFFFFF] flex flex-col relative shadow-[0_4px_30px_rgba(15,23,42,0.06)] border-x border-slate-200">
        {/* Fixed Top Header & Navigation */}
        <Header />

        {/* Dynamic Section based on activeTab */}
        <main className="flex-1 w-full animate-in fade-in duration-150">
          {activeTab === 'gacha' && <GachaSection />}
          {activeTab === 'tienda' && <ShopSection />}
          {activeTab === 'minijuegos' && <MiniGamesSection />}
          {activeTab === 'inventario' && <InventorySection />}
        </main>

        {/* Global Modals & Overlays */}
        <AuthModal />
        <AdminPanelModal />
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
