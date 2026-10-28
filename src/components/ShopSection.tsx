import React, { useState } from 'react';
import { 
  Store, 
  Coins, 
  Info, 
  CheckCircle2, 
  Gamepad2,
  Bookmark
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CATEGORIES_LIST } from '../data/characters';
import { Character } from '../types';

export const ShopSection: React.FC = () => {
  const { 
    currentUser, 
    characters,
    buyCharacter, 
    isCharacterClaimed, 
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    setActiveTab
  } = useGame();

  const [notification, setNotification] = useState<{ message: string; isError: boolean } | null>(null);

  const handleBuy = (character: Character) => {
    const result = buyCharacter(character.id);
    setNotification({
      message: result.message,
      isError: !result.success
    });

    setTimeout(() => {
      setNotification(null);
    }, 4000);
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
      {/* Shop Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
              Tienda de Personajes
            </h1>
          </div>
        </div>
        <p className="text-xs text-slate-500 pl-10 font-normal">
          Compra personajes directamente con tus coins. Sin aleatoriedad.
        </p>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div 
          className={`mb-4 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 border ${
            notification.isError
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-slate-100 text-[#0F172A] border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.isError ? (
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          {notification.isError && (
            <button
              onClick={() => setActiveTab('minijuegos')}
              className="px-2 py-1 bg-[#0F172A] text-white rounded-xl text-[10px] font-bold shrink-0 shadow-xs"
            >
              Ganar Coins
            </button>
          )}
        </div>
      )}

      {/* Category Pills */}
      <div className="mb-4">
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

      {/* User Coins Banner */}
      <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Coins className="w-3.5 h-3.5 fill-white" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Balance Actual:</span>
            <span className="text-sm font-extrabold text-[#0F172A] font-mono">
              {currentUser?.coins ?? 0} Coins
            </span>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('minijuegos')}
          className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-xs"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Ganar Coins</span>
        </button>
      </div>

      {/* Catalog Cards: SIMPLIFIED VISUALS (ONLY Image, Name, Fandom, Category, Price in Coins + Buy button) */}
      <div className="space-y-3">
        {filteredCharacters.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
            <p className="text-sm font-medium text-slate-500">
              No hay personajes en esta categoría con el filtro seleccionado.
            </p>
          </div>
        ) : (
          filteredCharacters.map((char) => {
            const userHasEnoughCoins = (currentUser?.coins ?? 0) >= char.priceCoins;

            return (
              <div
                key={char.id}
                className="bg-white rounded-3xl p-3.5 border border-slate-200 shadow-xs hover:border-[#0F172A] hover:shadow-md transition-all flex gap-3.5 items-center relative overflow-hidden"
              >
                {/* 1. Imagen del personaje */}
                <div className="relative w-24 h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  <img
                    src={char.image}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>

                {/* Info de la tarjeta */}
                <div className="flex-1 min-w-0">
                  {/* 3. Fandom / Serie badge y Precio en Coins */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 text-[#0F172A] border-slate-300 bg-slate-100 truncate max-w-[70%]"
                      title={char.fandom}
                    >
                      <Bookmark className="w-2.5 h-2.5 text-[#1E3A8A] shrink-0" />
                      <span className="truncate">{char.fandom}</span>
                    </span>

                    {/* 5. Precio en Coins */}
                    <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                      <Coins className="w-3 h-3 text-[#1E3A8A]" />
                      <span>{char.priceCoins}</span>
                    </div>
                  </div>

                  {/* 2. Nombre del personaje */}
                  <h3 className="text-sm font-bold text-[#0F172A] truncate">
                    {char.name}
                  </h3>

                  {/* Categoría: Debajo del Nombre */}
                  <div className="mt-0.5 mb-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-[#1E3A8A] border border-slate-200 inline-block truncate max-w-full">
                      {char.category}
                    </span>
                  </div>

                  {/* 5. Botón de compra */}
                  <div>
                    <button
                      onClick={() => handleBuy(char)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
                        userHasEnoughCoins
                          ? 'bg-[#0F172A] hover:bg-[#1E3A8A] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Coins className="w-3 h-3 text-white" />
                      <span>Comprar por {char.priceCoins} Coins</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
