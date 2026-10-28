import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle, RefreshCw, Bookmark } from 'lucide-react';
import { Character } from '../types';

interface GachaPullModalProps {
  characters: Character[] | null;
  onClose: () => void;
  onPullAgain: (count: 1 | 10) => void;
  canPull1x: boolean;
  canPull10x: boolean;
}

export const GachaPullModal: React.FC<GachaPullModalProps> = ({
  characters,
  onClose,
  onPullAgain,
  canPull1x,
  canPull10x
}) => {
  const [revealedIndex, setRevealedIndex] = useState<number>(0);
  const [isRevealingAll, setIsRevealingAll] = useState(false);

  useEffect(() => {
    if (!characters || characters.length === 0) return;

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F172A', '#1E3A8A', '#475569', '#CBD5E1']
      });
    } catch {
      // ignore
    }
  }, [characters]);

  if (!characters || characters.length === 0) return null;

  const isMulti = characters.length > 1;
  const currentCard = characters[revealedIndex] || characters[0];

  const handleNext = () => {
    if (revealedIndex < characters.length - 1) {
      setRevealedIndex(prev => prev + 1);
    } else {
      setIsRevealingAll(true);
    }
  };

  const showSummary = isRevealingAll || (!isMulti && revealedIndex === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-white text-[#0F172A] rounded-3xl p-5 shadow-2xl border border-slate-200 flex flex-col items-center relative overflow-hidden">
        {/* Modal Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 mb-4 z-10">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {isMulti ? `Invocación Múltiple (${revealedIndex + 1}/${characters.length})` : 'Invocación Concedida'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-black px-2 py-1 rounded-lg bg-slate-100 border border-slate-200"
          >
            Cerrar
          </button>
        </div>

        {/* Main Card View: SIMPLIFIED VISUALS (ONLY Image, Name, Fandom, Category) */}
        {!showSummary ? (
          <div className="w-full flex flex-col items-center z-10 py-2">
            {/* Card Frame */}
            <div 
              className="relative w-64 h-84 rounded-3xl overflow-hidden shadow-xl border-2 border-[#0F172A] transition-all transform duration-300 hover:scale-102 holo-card"
            >
              <img
                src={currentCard.image}
                alt={currentCard.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-90" />

              {/* Fandom Badge */}
              <div className="absolute top-3 right-3 max-w-[70%]">
                <span 
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border shadow-md flex items-center gap-1 bg-white/95 text-[#0F172A] border-slate-300 truncate"
                >
                  <Bookmark className="w-3 h-3 text-[#1E3A8A] shrink-0" />
                  <span className="truncate">{currentCard.fandom}</span>
                </span>
              </div>

              {/* Category */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0F172A]/80 backdrop-blur-md text-white border border-white/20">
                  {currentCard.category}
                </span>
              </div>

              {/* Bottom Card Info: strictly Name */}
              <div className="absolute bottom-4 left-3 right-3 text-white">
                <h3 className="text-xl font-extrabold text-white leading-tight">
                  {currentCard.name}
                </h3>
              </div>
            </div>

            {/* Next / Reveal All Button */}
            <div className="flex items-center gap-2 mt-4 w-full px-4">
              {isMulti && (
                <button
                  onClick={() => setIsRevealingAll(true)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all border border-slate-200"
                >
                  Saltar a Resumen
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E3A8A] rounded-2xl transition-all shadow-md active:scale-98"
              >
                {revealedIndex < characters.length - 1 ? 'Siguiente Tarjeta' : 'Ver Resultado'}
              </button>
            </div>
          </div>
        ) : (
          /* Multi Card Summary Grid */
          <div className="w-full z-10 flex flex-col items-center">
            <div className="w-full max-h-[58vh] overflow-y-auto no-scrollbar py-1">
              <div className="grid grid-cols-2 gap-2.5">
                {characters.map((char, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center gap-2.5 relative overflow-hidden"
                  >
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-12 h-14 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold block text-[#1E3A8A] truncate">
                        {char.fandom}
                      </span>
                      <h4 className="text-xs font-bold text-[#0F172A] truncate">
                        {char.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 block truncate font-medium">
                        {char.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pull Actions */}
            <div className="w-full pt-4 mt-2 border-t border-slate-200 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!canPull1x}
                  onClick={() => {
                    setRevealedIndex(0);
                    setIsRevealingAll(false);
                    onPullAgain(1);
                  }}
                  className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-800 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>1x (20 Coins)</span>
                </button>
                <button
                  disabled={!canPull10x}
                  onClick={() => {
                    setRevealedIndex(0);
                    setIsRevealingAll(false);
                    onPullAgain(10);
                  }}
                  className="py-2.5 px-2 bg-[#0F172A] hover:bg-[#1E3A8A] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-extrabold rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>10x (180 Coins)</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#1E3A8A] text-white text-xs font-bold rounded-2xl hover:bg-[#1E40AF] transition-all flex items-center justify-center gap-1.5 mt-1 shadow-xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Guardar en Mi Inventario</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
