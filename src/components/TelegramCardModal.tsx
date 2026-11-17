import React, { useState, useEffect } from 'react';
import { 
  Send, 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Bot,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Tag,
  RefreshCw,
  Pencil,
  AtSign
} from 'lucide-react';
import { Character } from '../types';
import { useGame, buildTelegramMemberTag } from '../context/GameContext';

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
    botUsername,
    targetTelegramChatId,
    targetTelegramChatTitle,
    sendCharacterToTelegram,
    detectCurrentUserTelegramId,
    updateCurrentUserTelegram,
    applyCharacterMemberTag
  } = useGame();

  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDetectingUser, setIsDetectingUser] = useState(false);
  const [isEditingTelegram, setIsEditingTelegram] = useState(false);
  const [telegramDraft, setTelegramDraft] = useState(currentUser?.telegram || '');
  const [userEditFeedback, setUserEditFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [userLinkFeedback, setUserLinkFeedback] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{
    success: boolean;
    message: string;
    tagApplied?: boolean;
    tagValue?: string;
    tagError?: string;
    needsUserId?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isEditingTelegram && currentUser?.telegram) {
      setTelegramDraft(currentUser.telegram);
    }
  }, [currentUser?.telegram, isEditingTelegram]);

  const cardCode = `SPYCT-${character.id.toUpperCase()}-${level}-${currentUser?.telegram?.replace('@', '') || '0000'}`;
  const fullLabelRaw = `${character.name} - ${character.fandom}`;
  const telegramTagValue = buildTelegramMemberTag(character.name, character.fandom);
  const hasDetectedUserId = Boolean(currentUser?.telegramChatId && /^\d{5,}$/.test(currentUser.telegramChatId));

  // Clean Telegram Card format with Name, Fandom, Category, Web User & Roleplay Ready text
  const cardTelegramText = `${character.name}
Fandom: ${character.fandom}
Categoría: ${character.category}
Usuario: ${currentUser?.telegram || '@agente'}
Etiqueta: ${telegramTagValue}

¡Ya puedes ir al escenario de rol!`;

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
    setUserLinkFeedback(null);

    const result = await sendCharacterToTelegram(character, level);
    setIsSending(false);
    setSendResult(result);
  };

  const handleDetectAndApplyTag = async () => {
    setIsDetectingUser(true);
    setUserLinkFeedback(null);
    const res = await applyCharacterMemberTag(character);
    setIsDetectingUser(false);

    if (res.success) {
      setSendResult({
        success: true,
        tagApplied: true,
        tagValue: res.tagValue,
        message: res.message
      });
      setUserLinkFeedback(null);
    } else {
      setUserLinkFeedback(res.message);
    }
  };

  const handleSaveTelegramUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserEditFeedback(null);
    const res = updateCurrentUserTelegram(telegramDraft);
    if (!res.success) {
      setUserEditFeedback({ ok: false, text: res.error || 'Usuario inválido' });
      return;
    }

    setIsEditingTelegram(false);
    setUserLinkFeedback(null);

    if (botFatherToken && res.cleanTelegram) {
      setIsDetectingUser(true);
      const detectRes = await detectCurrentUserTelegramId(res.cleanTelegram);
      setIsDetectingUser(false);
      setUserEditFeedback({
        ok: true,
        text: detectRes.success
          ? `Usuario actualizado a ${res.cleanTelegram} y detectado para colocar etiquetas.`
          : `Usuario actualizado a ${res.cleanTelegram}. Ahora pulsa "Usar y Enviar al Grupo".`
      });
    } else {
      setUserEditFeedback({
        ok: true,
        text: `Usuario actualizado a ${res.cleanTelegram}.`
      });
    }
  };

  const shareUrlTarget = botUsername ? `https://t.me/${botUsername}` : 'https://t.me/';

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

          {/* Member Tag Preview (Personaje - Fandom) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl mb-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#1E3A8A]" />
                Etiqueta de Miembro:
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#0F172A] text-white font-mono text-[11px] font-bold truncate max-w-[180px]">
                {telegramTagValue}
              </span>
            </div>
            {fullLabelRaw.length > 16 && (
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                Telegram limita las etiquetas de miembro a 16 caracteres (formato: <span className="font-semibold">{telegramTagValue}</span>).
              </p>
            )}
          </div>

          {/* Group Delivery Status Feedback */}
          {sendResult && (
            <div className={`p-3 rounded-2xl mb-3 text-xs leading-relaxed animate-in fade-in space-y-2 ${
              sendResult.success 
                ? 'bg-slate-100 border border-slate-300 text-[#0F172A]' 
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-start gap-2">
                {sendResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <strong className="block font-bold mb-0.5">
                    {sendResult.success
                      ? sendResult.tagApplied
                        ? 'Etiqueta Aplicada y Ficha Enviada:'
                        : 'Ficha Enviada (Etiqueta Pendiente):'
                      : 'No se pudo enviar:'}
                  </strong>
                  <span>{sendResult.message}</span>
                </div>
              </div>

              {/* Helper when user's @username hasn't interacted with our bot/group yet */}
              {sendResult.success && sendResult.needsUserId && (
                <div className="pt-2 border-t border-slate-300 space-y-2">
                  <p className="text-[10px] text-slate-600 leading-snug">
                    Para colocar la etiqueta a <strong>{currentUser?.telegram || '@usuario'}</strong> sin hacerlo admin, escribe <code>hola</code> en el grupo con esa cuenta{botUsername ? ' o abre nuestro bot y pulsa Iniciar' : ''}, y luego toca el botón de abajo:
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {botUsername && (
                      <a
                        href={`https://t.me/${botUsername}?start=rol`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-200 border border-slate-300 text-[#0F172A] rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <Bot className="w-3 h-3 text-[#1E3A8A]" />
                        <span>Abrir @{botUsername}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleDetectAndApplyTag}
                      disabled={isDetectingUser}
                      className="px-2.5 py-1.5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3 h-3 ${isDetectingUser ? 'animate-spin' : ''}`} />
                      <span>{isDetectingUser ? 'Detectando...' : 'Detectar y Colocar Etiqueta'}</span>
                    </button>
                  </div>
                  {userLinkFeedback && (
                    <p className="text-[10px] font-semibold text-[#1E3A8A]">{userLinkFeedback}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Account-linked @username block (editable only for the account's @usuario) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl mb-2.5 text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Usuario vinculado a esta cuenta:
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] font-bold text-[#0F172A] truncate font-mono">
                    {currentUser?.telegram || '@agente'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                    hasDetectedUserId
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {hasDetectedUserId ? 'Detectado' : 'Sin detectar aún'}
                  </span>
                </div>
              </div>

              {!isEditingTelegram && (
                <button
                  type="button"
                  onClick={() => {
                    setTelegramDraft(currentUser?.telegram || '');
                    setUserEditFeedback(null);
                    setIsEditingTelegram(true);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#0F172A] rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0"
                >
                  <Pencil className="w-3 h-3 text-[#1E3A8A]" />
                  <span>Modificar @user</span>
                </button>
              )}
            </div>

            {isEditingTelegram && (
              <form onSubmit={handleSaveTelegramUsername} className="space-y-1.5 pt-1 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={telegramDraft}
                      onChange={(e) => setTelegramDraft(e.target.value)}
                      placeholder="@tu_usuario"
                      autoFocus
                      className="w-full h-8 pl-7 pr-2.5 text-[11px] font-mono bg-white border border-slate-300 rounded-xl text-slate-900 focus:border-[#0F172A] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isDetectingUser}
                    className="h-8 px-2.5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl text-[10px] font-bold shrink-0 disabled:opacity-60"
                  >
                    {isDetectingUser ? '...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingTelegram(false);
                      setUserEditFeedback(null);
                    }}
                    className="h-8 px-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded-xl text-[10px] font-bold shrink-0"
                  >
                    Cancelar
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Solo modifica el @usuario de Telegram registrado en tu cuenta para recibir tu etiqueta en el grupo.
                </p>
              </form>
            )}

            {userEditFeedback && (
              <p className={`text-[10px] font-semibold leading-snug ${userEditFeedback.ok ? 'text-[#1E3A8A]' : 'text-rose-600'}`}>
                {userEditFeedback.text}
              </p>
            )}
          </div>

          {/* Telegram Destination & Bot Status (Read-Only) */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl mb-3 text-xs flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Grupo de Destino:
              </span>
              <p className="text-[11px] font-bold text-[#0F172A] truncate">
                {targetTelegramChatTitle && targetTelegramChatId && targetTelegramChatTitle !== targetTelegramChatId
                  ? `${targetTelegramChatTitle} (${targetTelegramChatId})`
                  : targetTelegramChatTitle
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
                <span>Asignando Etiqueta y Enviando...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 text-white" />
                <span>Usar y Enviar al Grupo</span>
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
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrlTarget)}&text=${encodeURIComponent(cardTelegramText)}`}
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
