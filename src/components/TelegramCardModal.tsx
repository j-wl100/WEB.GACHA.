import React, { useState } from 'react';
import { 
  Send, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Bot,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Character } from '../types';
import { useGame } from '../context/GameContext';

interface Props {
  character: Character;
  level: number;
  obtainedAt: string;
  onClose: () => void;
}

export const TelegramCardModal: React.FC<Props> = ({
  character,
  level,
  onClose
}) => {
  const { 
    currentUser, 
    botFatherToken, 
    targetTelegramChatId,
    targetTelegramChatTitle,
    sendCharacterToTelegram
  } = useGame();

  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const cardCode = `SPYCT-${character.id.toUpperCase()}-${level}-${currentUser?.telegram?.replace('@', '') || '0000'}`;

  // Clean Telegram Card format with FANDOM and CATEGORY
  const cardTelegramText = `TARJETA OFICIAL SPYCT RPG
----------------------------------
Personaje: ${character.name} (Nivel ${level})
Fandom: ${character.fandom} [${character.category}]
Precio Base: ${character.priceCoins} Coins
Código Único: ${cardCode}
Propietario: ${currentUser?.telegram || '@agente'}
----------------------------------
Validado por SPYCT Bot Network`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cardTelegramText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToTelegramGroup = async () => {
    if (!botFatherToken || !targetTelegramChatId) {
      setSendResult({
        success: false,
        message: 'El bot o grupo de destino de Telegram debe ser vinculado primero desde el Panel de Administración protegido.'
      });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    const result = await sendCharacterToTelegram(character, level);
    setIsSending(false);
    setSendResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white text-[#0F172A] rounded-3xl p-5 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 z-20"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3 z-10">
          <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A] leading-tight">
              Usar Tarjeta en Telegram
            </h2>
            <p className="text-[10px] text-slate-500">
              Despliegue táctico al grupo oficial de Telegram
            </p>
          </div>
        </div>

        {/* Scrollable Card Container */}
        <div className="overflow-y-auto no-scrollbar py-1">
          {/* Collectible Virtual Card */}
          <div className="relative rounded-2xl p-3 text-white overflow-hidden shadow-xl border-2 border-[#0F172A] bg-[#0F172A] holo-card mb-3">
            {/* Watermark / Brand Header showing FANDOM & CATEGORY */}
            <div className="flex items-center justify-between pb-2 border-b border-white/20 mb-2">
              <span className="text-[10px] font-black tracking-widest text-slate-300 font-mono">
                SPYCT // {character.category.toUpperCase()}
              </span>
              <span 
                className="px-2 py-0.5 rounded-full text-[9px] font-bold border text-white border-white/30 bg-[#1E3A8A]"
              >
                {character.fandom}
              </span>
            </div>

            {/* Character Visual Hero */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-2 bg-slate-900 border border-slate-800">
              <img
                src={character.image}
                alt={character.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-md text-[9px] font-bold text-white font-mono border border-white/20">
                  NVL. {level}
                </span>
              </div>

              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-base font-bold leading-tight truncate text-white">
                  {character.name}
                </h3>
              </div>
            </div>

            {/* Card Footer: Telegram owner tag & unique serial code */}
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[9px] text-slate-400 font-mono">
              <div className="truncate pr-1">
                <span className="text-slate-500 block">Propietario:</span>
                <span className="text-white font-bold truncate">
                  {currentUser?.telegram || '@agente'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">ID Tarjeta:</span>
                <span className="text-white font-bold">{cardCode.slice(0, 14)}...</span>
              </div>
            </div>
          </div>

          {/* Group Delivery Status Feedback */}
          {sendResult && (
            <div className={`p-3 rounded-2xl mb-3 text-xs leading-relaxed animate-in fade-in flex items-start gap-2 ${
              sendResult.success 
                ? 'bg-slate-100 border border-slate-300 text-[#0F172A]' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {sendResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <strong className="block font-bold mb-0.5">
                  {sendResult.success ? 'Envío Exitoso:' : 'No se pudo enviar:'}
                </strong>
                <span>{sendResult.message}</span>
              </div>
            </div>
          )}

          {/* Telegram Destination & Bot Status (Read-Only) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl mb-3 text-xs flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Grupo de Destino:
              </span>
              <p className="text-[11px] font-bold text-[#0F172A] truncate">
                {targetTelegramChatTitle 
                  ? targetTelegramChatTitle 
                  : targetTelegramChatId 
                  ? `ID: ${targetTelegramChatId}` 
                  : 'Vinculación gestionada en Panel Admin'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-xl shrink-0">
              <span className={`w-2 h-2 rounded-full ${botFatherToken && targetTelegramChatId ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <span className="text-[10px] font-bold text-slate-700">
                {botFatherToken && targetTelegramChatId ? 'Vinculado' : 'Sin vincular'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          {/* Main Primary Button: Send directly to the Telegram Group */}
          <button
            onClick={handleSendToTelegramGroup}
            disabled={isSending}
            className="w-full py-3 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Enviando al Grupo de Telegram...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 text-white" />
                <span>Enviar Tarjeta al Grupo de Telegram</span>
              </>
            )}
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span className="text-[#1E3A8A]">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copiar Tarjeta</span>
                </>
              )}
            </button>

            <a
              href={`https://t.me/share/url?url=${encodeURIComponent('https://t.me/SPYCT_RPG_Bot')}&text=${encodeURIComponent(cardTelegramText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-slate-600" />
              <span>Compartir</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
