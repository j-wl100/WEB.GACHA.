import React from 'react';
import { 
  Dices, 
  Store, 
  Gamepad2, 
  Briefcase, 
  Coins, 
  Search, 
  User as UserIcon, 
  X,
  Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { ActiveTab } from '../types';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery,
    isProfileOpen,
    setIsProfileOpen
  } = useGame();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'gacha', label: 'Gacha', icon: Dices },
    { id: 'tienda', label: 'Tienda', icon: Store },
    { id: 'minijuegos', label: 'Mini-Juegos', icon: Gamepad2 },
    { id: 'inventario', label: 'Inventario', icon: Briefcase },
  ];

  const characterCount = currentUser?.inventory?.length || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
      {/* Top Main Bar */}
      <div className="max-w-md mx-auto px-3.5 pt-2.5 pb-2 flex items-center justify-between gap-2">
        {/* Left: Dice Quick Shortcut */}
        <button
          onClick={() => setActiveTab('gacha')}
          title="Ir a Gacha"
          aria-label="Ir a Gacha"
          className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all active:scale-95 shrink-0 ${
            activeTab === 'gacha'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'bg-slate-100 text-[#0F172A] hover:bg-slate-200'
          }`}
        >
          <Dices className="w-5 h-5 text-current" />
        </button>

        {/* Center: Search Bar */}
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar personaje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm font-medium bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-[#1E3A8A] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 rounded-full"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Coins Counter & Profile Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Coin Badge */}
          <div 
            onClick={() => setActiveTab('minijuegos')}
            role="button"
            tabIndex={0}
            title="Coins disponibles. Toca para ganar más en Mini-Juegos."
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-2xl cursor-pointer transition-transform active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white shadow-xs">
              <Coins className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-xs font-bold text-[#0F172A] tracking-tight font-mono">
              {currentUser ? currentUser.coins : 0}
            </span>
            <span className="text-[10px] text-slate-600 font-semibold hidden xs:inline">Coins</span>
          </div>

          {/* Profile / Admin Button */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Perfil y Administración"
            className={`flex items-center justify-center w-10 h-10 rounded-2xl border transition-all active:scale-95 ${
              isProfileOpen
                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                : 'bg-white text-[#0F172A] border-slate-200 hover:bg-slate-50'
            }`}
          >
            {currentUser ? (
              <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white text-[11px] font-bold flex items-center justify-center uppercase">
                {currentUser.name.charAt(0)}
              </div>
            ) : (
              <UserIcon className="w-4 h-4 text-[#0F172A]" />
            )}
          </button>
        </div>
      </div>

      {/* 4 Navigation Tabs */}
      <div className="max-w-md mx-auto px-3 pb-2.5 pt-1">
        <nav className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
                {item.id === 'inventario' && characterCount > 0 && (
                  <span
                    className={`ml-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-300 text-slate-800'
                    }`}
                  >
                    {characterCount}
                  </span>
                )}
                {item.id === 'gacha' && !isActive && (
                  <Sparkles className="w-2.5 h-2.5 text-[#1E3A8A] absolute -top-0.5 right-1" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
