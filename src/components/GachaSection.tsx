import React, { useState } from 'react';
import { 
  Dices, 
  Sparkles, 
  Flame, 
  Coins, 
  Gamepad2, 
  Info,
  Bookmark
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CATEGORIES_LIST } from '../data/characters';
import { Character } from '../types';
import { GachaPullModal } from './GachaPullModal';

export const GachaSection: React.FC = () => {
  const { 
    currentUser, 
    characters,
    pullGacha, 
    searchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    setActiveTab,
    isCharacterClaimed
  } = useGame();

  const [activePullResult, setActivePullResult] = useState<Character[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canPull1x = (currentUser?.coins ?? 0) >= 20;
  const canPull10x = (currentUser?.coins ?? 0) >= 180;

  const handlePull = (count: 1 | 10) => {
    setErrorMessage(null);
    const cost = count === 1 ? 20 : 180;
    if ((currentUser?.coins ?? 0) < cost) {
      setErrorMessage(
        `Coins insuficientes (${currentUser?.coins ?? 0} coins). Juega en Mini-Juegos para conseguir más.`
      );
      return;
    }

    const result = pullGacha(count);
    if (!result) {
      setErrorMessage(
        '¡Todos los personajes disponibles ya han sido reclutados! Puedes devolver cartas desde tu Inventario para que vuelvan al banner.'
      );
      return;
    }
    setActivePullResult(result);
  };

  const filteredCharacters = characters.filter(char => {
    // Hide characters that are already owned by anyone
    if (isCharacterClaimed(char.id)) return false;

    const matchesCategory = selectedCategory === 'Todas' || char.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.fandom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto">
      {/* Gacha Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] text-white p-5 shadow-md border border-slate-800 mb-5">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#1E3A8A] text-white flex items-center gap-1 shadow-xs border border-blue-900/60">
              <Flame className="w-3 h-3 fill-white" />
              TEMPORADA SPYCT
            </span>
            <span className="text-[11px] text-slate-400 font-mono">V.2.5</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
            Invocación Táctica
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-[92%] mb-4">
            Desbloquea personajes de múltiples universos y fandoms populares para tu escuadrón.
          </p>

          {/* Summon Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handlePull(1)}
              className="py-3 px-3 bg-slate-800 hover:bg-slate-700 active:scale-98 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border border-slate-700 transition-all shadow-xs text-white"
            >
              <div className="flex items-center gap-1">
                <Dices className="w-4 h-4 text-slate-300" />
                <span>Invocar 1x</span>
              </div>
              <span className="text-[11px] font-mono text-slate-300 flex items-center gap-0.5 font-bold">
                <Coins className="w-3 h-3 text-white" /> 20 Coins
              </span>
            </button>

            <button
              onClick={() => handlePull(10)}
              className="py-3 px-3 bg-[#1E3A8A] hover:bg-[#1E40AF] active:scale-98 rounded-2xl font-extrabold text-xs text-white flex flex-col items-center justify-center gap-1 shadow-md transition-all border border-blue-900"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 fill-white text-white" />
                <span>Invocar 10x</span>
              </div>
              <span className="text-[11px] font-mono text-white flex items-center gap-0.5 font-bold">
                <Coins className="w-3 h-3 text-white" /> 180 Coins (10% OFF)
              </span>
            </button>
          </div>

          {/* Insufficient Coins Warning */}
          {errorMessage && (
            <div className="mt-3 p-2.5 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-center justify-between gap-2 text-xs text-rose-200">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-rose-300" />
                <span className="text-[11px]">{errorMessage}</span>
              </div>
              <button
                onClick={() => setActiveTab('minijuegos')}
                className="px-2.5 py-1 bg-white text-[#0F172A] rounded-xl text-[10px] font-bold shrink-0 flex items-center gap-0.5 shadow-xs"
              >
                <Gamepad2 className="w-3 h-3" />
                Jugar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Categorías Disponibles
          </h2>
          <span className="text-[11px] text-slate-600 font-medium font-mono">
            {filteredCharacters.length} personajes
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES_LIST.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
                  isSelected
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:text-black hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Characters Showcase Grid: Simplified Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-[#0F172A]">
            Personajes en el Banner
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Toca una tirada para invocar'}
          </span>
        </div>

        {filteredCharacters.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <p className="text-sm font-medium text-slate-500">
              No se encontraron personajes que coincidan con los filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredCharacters.map((char) => {
              return (
                <div
                  key={char.id}
                  className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs hover:border-[#0F172A] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Portrait with FANDOM Badge */}
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-2 bg-slate-100">
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Fandom Badge */}
                    <div className="absolute top-2 right-2 max-w-[85%]">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tight border shadow-xs flex items-center gap-1 bg-white/95 text-[#0F172A] border-slate-300 truncate"
                        title={char.fandom}
                      >
                        <Bookmark className="w-2.5 h-2.5 text-[#1E3A8A] shrink-0" />
                        <span className="truncate">{char.fandom}</span>
                      </span>
                    </div>

                    {/* Category & Name */}
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <span className="text-[10px] text-slate-300 block truncate font-medium">
                        {char.category}
                      </span>
                      <h4 className="text-xs font-bold leading-tight truncate">
                        {char.name}
                      </h4>
                    </div>
                  </div>

                  {/* Character Meta: Price in Coins and Quick Pull */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#0F172A] px-1">
                      <span className="text-slate-500 font-sans text-[10px]">Precio Tienda:</span>
                      <span className="flex items-center gap-0.5">
                        <Coins className="w-3 h-3 text-[#1E3A8A]" />
                        {char.priceCoins}c
                      </span>
                    </div>

                    <button
                      onClick={() => handlePull(1)}
                      className="w-full py-2 bg-slate-100 hover:bg-[#0F172A] hover:text-white text-slate-800 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Dices className="w-3 h-3 text-[#1E3A8A]" />
                      <span>Tirar Suerte (20c)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pull Modal Animation */}
      {activePullResult && (
        <GachaPullModal
          characters={activePullResult}
          onClose={() => setActivePullResult(null)}
          onPullAgain={handlePull}
          canPull1x={canPull1x}
          canPull10x={canPull10x}
        />
      )}
    </div>
  );
};
