import React, { useState } from 'react';
import { 
  Briefcase, 
  Send, 
  Dices, 
  Store,
  Bookmark,
  Trash2,
  AlertTriangle,
  Coins,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Character } from '../types';
import { TelegramCardModal } from './TelegramCardModal';

export const InventorySection: React.FC = () => {
  const { 
    getUserCharacters, 
    setActiveTab, 
    searchQuery,
    refundCharacter
  } = useGame();

  const [selectedCharacterForCard, setSelectedCharacterForCard] = useState<{
    character: Character;
    level: number;
    obtainedAt: string;
  } | null>(null);

  // Character targeted for refund/delete modal
  const [characterToRefund, setCharacterToRefund] = useState<Character | null>(null);
  const [refundNotification, setRefundNotification] = useState<string | null>(null);

  const inventoryItems = getUserCharacters();

  const filteredItems = inventoryItems.filter(({ character }) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      character.name.toLowerCase().includes(q) ||
      character.fandom.toLowerCase().includes(q) ||
      character.category.toLowerCase().includes(q)
    );
  });

  const handleConfirmRefund = () => {
    if (!characterToRefund) return;
    const result = refundCharacter(characterToRefund.id);
    setCharacterToRefund(null);
    if (result.success) {
      setRefundNotification(result.message);
      setTimeout(() => {
        setRefundNotification(null);
      }, 4000);
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto">
      {/* Inventory Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
              Mi Inventario
            </h1>
          </div>
          <p className="text-xs text-slate-500 pl-10 font-normal">
            Tienes {inventoryItems.length} personajes. Usa tus operativos o bórralos para recuperar el 50% de Coins.
          </p>
        </div>
      </div>

      {/* Notification banner */}
      {refundNotification && (
        <div className="mb-3 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-2 text-xs font-medium border border-slate-700 animate-in fade-in slide-in-from-top-2 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{refundNotification}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-white font-bold shrink-0">
            <Coins className="w-3.5 h-3.5 text-[#1E3A8A] fill-[#1E3A8A]" />
            <span>+Coins</span>
          </div>
        </div>
      )}

      {/* Operatives Collection Summary */}
      <div className="mb-3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs shadow-xs">
        <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1E3A8A]"></span>
          Colección de Operativos
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          Total: <strong className="text-[#0F172A]">{inventoryItems.length}</strong>
        </span>
      </div>

      {/* Inventory Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[#0F172A] mb-1">
            {searchQuery ? 'No se encontraron personajes' : 'Tu inventario está vacío'}
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
            {searchQuery 
              ? 'Prueba con otro término de búsqueda.' 
              : 'Invoca personajes en el Gacha o adquiérelos directamente en la Tienda.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('gacha')}
              className="px-3 py-2 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Ir a Gacha</span>
            </button>
            <button
              onClick={() => setActiveTab('tienda')}
              className="px-3 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95 hover:bg-slate-200"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Ver Tienda</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map(({ character, level, obtainedAt }) => {
            const refundValue = Math.floor(character.priceCoins * 0.5);

            return (
              <div
                key={character.id}
                className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs hover:border-[#0F172A] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Character Portrait */}
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden mb-2.5 bg-slate-100 border border-slate-200">
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                  {/* Top Right: FANDOM Badge */}
                  <div className="absolute top-2 right-2 max-w-[65%]">
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-xs flex items-center gap-1 bg-white/95 text-[#0F172A] border-slate-300 truncate"
                      title={character.fandom}
                    >
                      <Bookmark className="w-2.5 h-2.5 text-[#1E3A8A] shrink-0" />
                      <span className="truncate">{character.fandom}</span>
                    </span>
                  </div>

                  {/* Character Name & Category inside portrait */}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[10px] text-slate-300 block truncate font-medium">
                      {character.category}
                    </span>
                    <h4 className="text-xs font-bold leading-tight truncate">
                      {character.name}
                    </h4>
                  </div>
                </div>

                {/* Action Buttons: "Usar" and "Borrar" side by side */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedCharacterForCard({ character, level, obtainedAt })}
                    className="py-2 px-1 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs"
                    title="Usar tarjeta en Telegram"
                  >
                    <Send className="w-3 h-3" />
                    <span>Usar</span>
                  </button>

                  <button
                    onClick={() => setCharacterToRefund(character)}
                    className="py-2 px-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                    title={`Borrar y recibir ${refundValue} Coins (50%)`}
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    <span>Borrar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Telegram Card Modal */}
      {selectedCharacterForCard && (
        <TelegramCardModal
          character={selectedCharacterForCard.character}
          level={selectedCharacterForCard.level}
          obtainedAt={selectedCharacterForCard.obtainedAt}
          onClose={() => setSelectedCharacterForCard(null)}
        />
      )}

      {/* Floating Confirmation Modal with exact text */}
      {characterToRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Icon Header */}
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-300 text-[#1E3A8A] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-[#1E3A8A]" />
            </div>

            <h3 className="text-sm font-bold text-center text-[#0F172A] mb-2">
              Confirmar Devolución
            </h3>

            {/* Character summary chip */}
            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
              <img
                src={characterToRefund.image}
                alt={characterToRefund.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 block truncate">{characterToRefund.fandom}</span>
                <p className="text-xs font-bold text-[#0F172A] truncate">{characterToRefund.name}</p>
                <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#1E3A8A]">
                  <Coins className="w-3 h-3" />
                  <span>Valor actual: {characterToRefund.priceCoins} Coins</span>
                </div>
              </div>
            </div>

            {/* EXACT TEXT REQUIRED */}
            <p className="text-xs text-slate-600 text-center leading-relaxed mb-4 px-1 font-medium">
              Se devolverá el 50% del valor actual en Coins de este personaje. ¿Deseas confirmar o cancelar?
            </p>

            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center mb-4">
              <span className="text-xs font-mono font-bold text-emerald-800 flex items-center justify-center gap-1">
                Recibirás: +{Math.floor(characterToRefund.priceCoins * 0.5)} Coins
              </span>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCharacterToRefund(null)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                className="py-2.5 px-3 bg-[#0F172A] hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
