import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Edit3, 
  UserPlus, 
  Check, 
  ShieldAlert,
  Bot,
  Users,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Bookmark,
  Sparkles,
  Coins,
  Image as ImageIcon,
  Send,
  ExternalLink,
  Radio
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { User, Character, CharacterCategory } from '../types';
import { CHARACTER_CATEGORIES } from '../data/characters';

export const AdminPanelModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    isAdminUnlocked, 
    verifyAdminPassword,
    lockAdminPanel,
    characters,
    adminAddCharacter,
    adminUpdateCharacter,
    adminDeleteCharacter,
    users, 
    adminUpdateUser, 
    adminDeleteUser,
    adminCreateUser,
    botFatherToken,
    setBotFatherToken,
    targetTelegramChatId,
    targetTelegramChatTitle,
    setTargetTelegramChatId,
    setTargetTelegramChatTitle,
    testTelegramConnection,
    detectTelegramChatId
  } = useGame();

  // Password Lock Screen State
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Active Tab: default to 'personajes' as requested
  const [activeAdminTab, setActiveAdminTab] = useState<'personajes' | 'operativos' | 'botfather'>('personajes');

  // Character Management State
  const [charSearch, setCharSearch] = useState('');
  const [isCharFormOpen, setIsCharFormOpen] = useState(false);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [charToDelete, setCharToDelete] = useState<Character | null>(null);

  // The 5 requested fields for Character Add / Edit
  const [formName, setFormName] = useState('');
  const [formFandom, setFormFandom] = useState('');
  const [formCategory, setFormCategory] = useState<Exclude<CharacterCategory, 'Todas'>>('Anime & Manga');
  const [formImage, setFormImage] = useState('');
  const [formPriceCoins, setFormPriceCoins] = useState('150');
  const [charFeedback, setCharFeedback] = useState<string | null>(null);

  // Users State
  const [adminSearch, setAdminSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string; telegram: string } | null>(null);

  // Edit user form state
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editTelegram, setEditTelegram] = useState('');
  const [editCoins, setEditCoins] = useState('');
  const [editGems, setEditGems] = useState('');

  // New user form state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newTelegram, setNewTelegram] = useState('');
  const [newCoins, setNewCoins] = useState('200');
  const [newGems, setNewGems] = useState('20');

  // BotFather integration form state
  const [inputToken, setInputToken] = useState(botFatherToken);
  const [inputChatId, setInputChatId] = useState(targetTelegramChatId);
  const [showToken, setShowToken] = useState(false);
  const [tokenFeedback, setTokenFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isDetectingChatId, setIsDetectingChatId] = useState(false);

  if (!isAdminModalOpen) return null;

  // Handle Password Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    const success = verifyAdminPassword(passwordInput);
    if (success) {
      setPasswordInput('');
      setPasswordError(null);
    } else {
      setPasswordError('Contraseña incorrecta. El acceso al panel permanece bloqueado.');
    }
  };

  // Character Management Handlers
  const handleOpenAddChar = () => {
    setEditingCharId(null);
    setFormName('');
    setFormFandom('');
    setFormCategory('Anime & Manga');
    setFormImage('');
    setFormPriceCoins('150');
    setIsCharFormOpen(true);
    setCharFeedback(null);
  };

  const handleStartEditChar = (char: Character) => {
    setEditingCharId(char.id);
    setFormName(char.name);
    setFormFandom(char.fandom);
    setFormCategory(char.category);
    setFormImage(char.image);
    setFormPriceCoins(String(char.priceCoins));
    setIsCharFormOpen(true);
    setCharFeedback(null);
  };

  const handleSaveCharForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setCharFeedback('Por favor ingresa el nombre del personaje.');
      return;
    }
    if (!formFandom.trim()) {
      setCharFeedback('Por favor ingresa el fandom o serie.');
      return;
    }
    if (!formImage.trim()) {
      setCharFeedback('Por favor ingresa la URL de la foto.');
      return;
    }
    const price = parseInt(formPriceCoins, 10);
    if (isNaN(price) || price <= 0) {
      setCharFeedback('El precio en Coins debe ser un número mayor a 0.');
      return;
    }

    if (editingCharId) {
      adminUpdateCharacter(editingCharId, {
        name: formName.trim(),
        fandom: formFandom.trim(),
        category: formCategory,
        image: formImage.trim(),
        priceCoins: price
      });
      setCharFeedback(`¡Personaje "${formName.trim()}" actualizado correctamente!`);
    } else {
      adminAddCharacter({
        name: formName.trim(),
        fandom: formFandom.trim(),
        category: formCategory,
        image: formImage.trim(),
        priceCoins: price
      });
      setCharFeedback(`¡Personaje "${formName.trim()}" añadido exitosamente!`);
    }

    setTimeout(() => {
      setIsCharFormOpen(false);
      setEditingCharId(null);
      setCharFeedback(null);
    }, 1200);
  };

  const handleConfirmDeleteChar = () => {
    if (charToDelete) {
      adminDeleteCharacter(charToDelete.id);
      if (editingCharId === charToDelete.id) {
        setIsCharFormOpen(false);
        setEditingCharId(null);
      }
      setCharToDelete(null);
    }
  };

  // Filtered Characters
  const filteredCharacters = characters.filter(c => {
    if (!charSearch) return true;
    const q = charSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.fandom.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  // User Handlers
  const handleConfirmDeleteUser = () => {
    if (userToDelete) {
      adminDeleteUser(userToDelete.id);
      setUserToDelete(null);
      if (editingUserId === userToDelete.id) {
        setEditingUserId(null);
      }
    }
  };

  const filteredUsers = users.filter(u => {
    if (!adminSearch) return true;
    const q = adminSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.telegram.toLowerCase().includes(q)
    );
  });

  const handleStartEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditAge(String(user.age));
    setEditTelegram(user.telegram);
    setEditCoins(String(user.coins));
    setEditGems(String(user.gems));
  };

  const handleSaveEditUser = (userId: string) => {
    adminUpdateUser(userId, {
      name: editName.trim(),
      age: parseInt(editAge, 10) || 18,
      telegram: editTelegram.trim(),
      coins: parseInt(editCoins, 10) || 0,
      gems: parseInt(editGems, 10) || 0
    });
    setEditingUserId(null);
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTelegram.trim()) return;
    adminCreateUser(
      newName, 
      parseInt(newAge, 10) || 20, 
      newTelegram, 
      parseInt(newCoins, 10) || 100, 
      parseInt(newGems, 10) || 10
    );
    setIsAddingUser(false);
    setNewName('');
    setNewAge('');
    setNewTelegram('');
  };

  const handleSaveBotToken = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = inputToken.trim();
    const cleanChatId = inputChatId.trim();

    if (!cleanToken && !cleanChatId) {
      setTokenFeedback({
        type: 'error',
        message: 'Por favor ingresa un token válido de BotFather o un ID de Grupo.'
      });
      return;
    }
    setBotFatherToken(cleanToken);
    setTargetTelegramChatId(cleanChatId);
    setTokenFeedback({
      type: 'success',
      message: 'Token y Grupo de Telegram guardados y sincronizados con el sistema de cartas.'
    });
    setTimeout(() => setTokenFeedback(null), 4000);
  };

  const handleTestConnection = async () => {
    const tokenToTest = inputToken.trim() || botFatherToken;
    const chatToTest = inputChatId.trim() || targetTelegramChatId;
    if (!tokenToTest) {
      setTokenFeedback({
        type: 'error',
        message: 'Debes ingresar un token de BotFather para comprobar la conexión.'
      });
      return;
    }

    setIsTestingConnection(true);
    setTokenFeedback(null);
    const result = await testTelegramConnection(tokenToTest, chatToTest);
    setIsTestingConnection(false);
    setTokenFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
  };

  const handleAutoDetectChatId = async () => {
    const tokenToUse = inputToken.trim() || botFatherToken;
    if (!tokenToUse) {
      setTokenFeedback({
        type: 'error',
        message: 'Debes ingresar el Token de BotFather primero para detectar el grupo.'
      });
      return;
    }
    setIsDetectingChatId(true);
    setTokenFeedback(null);
    const res = await detectTelegramChatId(tokenToUse);
    setIsDetectingChatId(false);
    if (res.success && res.chatId) {
      setInputChatId(res.chatId);
      setTokenFeedback({
        type: 'success',
        message: res.message
      });
    } else {
      setTokenFeedback({
        type: 'error',
        message: res.message
      });
    }
  };

  const handleClearToken = () => {
    setBotFatherToken('');
    setTargetTelegramChatId('');
    setTargetTelegramChatTitle('');
    setInputToken('');
    setInputChatId('');
    setTokenFeedback({
      type: 'info',
      message: 'Token de BotFather y grupo de Telegram desvinculados.'
    });
    setTimeout(() => setTokenFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white text-[#0F172A] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera Principal */}
        <div className="p-4 sm:p-5 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              {isAdminUnlocked ? (
                <ShieldAlert className="w-5 h-5 text-[#1E3A8A]" />
              ) : (
                <Lock className="w-5 h-5 text-slate-300" />
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Panel de Administración</span>
                {isAdminUnlocked && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Desbloqueado
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-300 font-mono">
                {isAdminUnlocked 
                  ? 'Gestión de Personajes, Operativos y Bot de Telegram'
                  : 'Acceso restringido para administradores'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdminUnlocked && (
              <button
                onClick={lockAdminPanel}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
                title="Bloquear panel"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bloquear</span>
              </button>
            )}
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar panel de administración"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOCKED STATE VIEW */}
        {!isAdminUnlocked ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center my-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F172A] mb-4 shadow-xs">
              <Lock className="w-8 h-8 text-[#0F172A]" />
            </div>

            <h3 className="text-lg font-extrabold text-[#0F172A] mb-1">
              Acceso Administrativo Protegido
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
              Este panel requiere contraseña de seguridad para visualizar y gestionar personajes, operativos y configuraciones.
            </p>

            <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3">
              <div className="relative text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa la contraseña..."
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(null);
                    }}
                    autoFocus
                    className="w-full h-11 pl-3.5 pr-10 text-xs font-mono bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:bg-white focus:border-[#0F172A] focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-1.5 text-left animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-bold text-xs rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Panel</span>
              </button>
            </form>
          </div>
        ) : (
          /* UNLOCKED ADMIN PANEL CONTENT */
          <>
            {/* Tab Navigation */}
            <div className="px-4 pt-3 pb-2 bg-slate-100 border-b border-slate-200 shrink-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveAdminTab('personajes')}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeAdminTab === 'personajes'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Personajes ({characters.length})</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('operativos')}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeAdminTab === 'operativos'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Operativos ({users.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveAdminTab('botfather');
                  setInputToken(botFatherToken);
                  setInputChatId(targetTelegramChatId);
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  activeAdminTab === 'botfather'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Bot de BotFather</span>
                <span className={`w-2 h-2 rounded-full ${botFatherToken ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </button>
            </div>

            {/* TAB 1: GESTIÓN COMPLETA DE PERSONAJES (CRUD) */}
            {activeAdminTab === 'personajes' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, fandom o categoría..."
                      value={charSearch}
                      onChange={(e) => setCharSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 text-xs font-medium bg-white text-slate-900 border border-slate-300 rounded-2xl focus:border-[#0F172A] focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  <button
                    onClick={isCharFormOpen ? () => setIsCharFormOpen(false) : handleOpenAddChar}
                    className="w-full sm:w-auto h-10 px-4 bg-[#0F172A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                  >
                    {isCharFormOpen ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>Cerrar Formulario</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Añadir Personaje</span>
                      </>
                    )}
                  </button>
                </div>

                {/* FORMULARIO DE ADMINISTRACIÓN: ÚNICAMENTE LOS 5 CAMPOS */}
                {isCharFormOpen && (
                  <form 
                    onSubmit={handleSaveCharForm} 
                    className="p-4 bg-slate-100 border-b border-slate-200 text-xs shrink-0 animate-in slide-in-from-top-2 overflow-y-auto max-h-[50vh]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-xs text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                        {editingCharId ? 'Editar Personaje' : 'Añadir Nuevo Personaje'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        5 campos requeridos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {/* Campo 1: Nombre del personaje */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          1. Nombre del personaje
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Satoru Gojo"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full h-9 px-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-[#0F172A] focus:outline-none text-xs"
                          required
                        />
                      </div>

                      {/* Campo 2: Fandom / Serie */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          2. Fandom / Serie
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Jujutsu Kaisen"
                          value={formFandom}
                          onChange={(e) => setFormFandom(e.target.value)}
                          className="w-full h-9 px-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-[#0F172A] focus:outline-none text-xs"
                          required
                        />
                      </div>

                      {/* Campo 3: Categoría */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          3. Categoría
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as Exclude<CharacterCategory, 'Todas'>)}
                          className="w-full h-9 px-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-[#0F172A] focus:outline-none text-xs font-medium"
                          required
                        >
                          {CHARACTER_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Campo 5: Precio en Coins */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          5. Precio en Coins
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Ej: 200"
                            value={formPriceCoins}
                            onChange={(e) => setFormPriceCoins(e.target.value)}
                            className="w-full h-9 pl-8 pr-3 bg-white border border-slate-300 text-slate-900 font-mono font-bold rounded-xl focus:border-[#0F172A] focus:outline-none text-xs"
                            required
                          />
                          <Coins className="w-3.5 h-3.5 text-[#1E3A8A] absolute left-2.5 top-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Campo 4: URL de la foto (link directo https://...) */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          4. URL de la foto (link directo https://...)
                        </label>
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-1">
                            <input
                              type="url"
                              placeholder="https://images.unsplash.com/photo-..."
                              value={formImage}
                              onChange={(e) => setFormImage(e.target.value)}
                              className="w-full h-9 pl-8 pr-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:border-[#0F172A] focus:outline-none text-xs font-mono"
                              required
                            />
                            <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
                          </div>

                          {formImage && (
                            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 shrink-0">
                              <img 
                                src={formImage} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {charFeedback && (
                      <div className="mb-3 p-2 rounded-xl text-xs bg-slate-200 text-[#0F172A] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#1E3A8A]" />
                        <span>{charFeedback}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCharFormOpen(false);
                          setEditingCharId(null);
                        }}
                        className="h-9 px-4 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="h-9 px-5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{editingCharId ? 'Guardar Cambios' : 'Añadir Personaje'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de Personajes: Simplificada visualmente (Nombre, Fandom, Categoría, Imagen, Precio + Acciones) */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4">
                  {filteredCharacters.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      No se encontraron personajes registrados.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredCharacters.map((char) => {
                        return (
                          <div
                            key={char.id}
                            className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex items-center gap-3 relative hover:border-[#0F172A] transition-colors"
                          >
                            {/* Imagen del personaje */}
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                              <img
                                src={char.image}
                                alt={char.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>

                            {/* Info simplificada: Nombre, Fandom, Categoría, Precio en Coins */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-[#0F172A] border border-slate-200 truncate max-w-[120px]">
                                  {char.fandom}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-800 text-white shrink-0">
                                  {char.category}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-[#0F172A] truncate mb-1">
                                {char.name}
                              </h4>

                              <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#0F172A] mb-2">
                                <Coins className="w-3 h-3 text-[#1E3A8A]" />
                                <span>{char.priceCoins} Coins</span>
                              </div>

                              {/* Acciones: Editar y Eliminar */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleStartEditChar(char)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                  title="Editar personaje"
                                >
                                  <Edit3 className="w-3 h-3 text-[#1E3A8A]" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => setCharToDelete(char)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                  title="Eliminar personaje"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: OPERATIVOS */}
            {activeAdminTab === 'operativos' && (
              <>
                <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o Telegram..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 text-xs font-medium bg-white text-slate-900 border border-slate-300 rounded-2xl focus:border-[#0F172A] focus:outline-none placeholder-slate-400"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddingUser(!isAddingUser)}
                    className="w-full sm:w-auto h-10 px-4 bg-[#0F172A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAddingUser ? 'Cerrar Formulario' : 'Crear Operativo'}</span>
                  </button>
                </div>

                {isAddingUser && (
                  <form onSubmit={handleCreateNewUser} className="p-4 bg-slate-100 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs shrink-0 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">Nombre</label>
                      <input
                        type="text"
                        placeholder="Nombre"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full h-8 px-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">Edad</label>
                      <input
                        type="number"
                        placeholder="20"
                        value={newAge}
                        onChange={(e) => setNewAge(e.target.value)}
                        className="w-full h-8 px-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">Telegram</label>
                      <input
                        type="text"
                        placeholder="@usuario"
                        value={newTelegram}
                        onChange={(e) => setNewTelegram(e.target.value)}
                        className="w-full h-8 px-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">Coins / Gemas</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          placeholder="Coins"
                          value={newCoins}
                          onChange={(e) => setNewCoins(e.target.value)}
                          className="w-1/2 h-8 px-1 text-center bg-white border border-slate-300 text-[#0F172A] rounded-xl font-bold text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Gemas"
                          value={newGems}
                          onChange={(e) => setNewGems(e.target.value)}
                          className="w-1/2 h-8 px-1 text-center bg-white border border-slate-300 text-[#1E3A8A] rounded-xl font-bold text-xs"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex items-end">
                      <button
                        type="submit"
                        className="w-full h-8 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl font-bold text-xs shadow-xs"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3">NOMBRE</th>
                          <th className="p-3">EDAD</th>
                          <th className="p-3">TELEGRAM</th>
                          <th className="p-3">COINS</th>
                          <th className="p-3">GEMAS</th>
                          <th className="p-3 text-right">ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              No se encontraron registros de usuarios.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => {
                            const isEditing = editingUserId === user.id;

                            if (isEditing) {
                              return (
                                <tr key={user.id} className="bg-slate-50">
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full h-8 px-2 bg-white border border-slate-400 rounded-lg text-xs text-slate-900"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={editAge}
                                      onChange={(e) => setEditAge(e.target.value)}
                                      className="w-16 h-8 px-2 bg-white border border-slate-400 rounded-lg text-xs text-slate-900"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={editTelegram}
                                      onChange={(e) => setEditTelegram(e.target.value)}
                                      className="w-full h-8 px-2 bg-white border border-slate-400 rounded-lg text-xs text-slate-900"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={editCoins}
                                      onChange={(e) => setEditCoins(e.target.value)}
                                      className="w-20 h-8 px-2 bg-white border border-slate-400 rounded-lg text-xs font-mono font-bold text-[#0F172A]"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={editGems}
                                      onChange={(e) => setEditGems(e.target.value)}
                                      className="w-16 h-8 px-2 bg-white border border-slate-400 rounded-lg text-xs font-mono font-bold text-[#1E3A8A]"
                                    />
                                  </td>
                                  <td className="p-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleSaveEditUser(user.id)}
                                        className="p-1.5 bg-[#0F172A] text-white rounded-lg hover:bg-[#1E3A8A]"
                                        title="Guardar cambios"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setUserToDelete({ id: user.id, name: user.name, telegram: user.telegram })}
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg"
                                        title="Eliminar cuenta"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                      </button>
                                      <button
                                        onClick={() => setEditingUserId(null)}
                                        className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                                        title="Cancelar"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-bold text-[#0F172A]">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-[10px] shrink-0 uppercase">
                                      {user.name.charAt(0)}
                                    </div>
                                    <span>{user.name}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-slate-600 font-mono">
                                  {user.age}
                                </td>
                                <td className="p-3 text-[#1E3A8A] font-mono">
                                  {user.telegram}
                                </td>
                                <td className="p-3">
                                  <span className="font-mono font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                    {user.coins}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="font-mono font-bold text-[#1E3A8A] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                    {user.gems}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleStartEditUser(user)}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl font-semibold flex items-center gap-1 transition-colors text-[11px]"
                                      title="Editar datos de cuenta"
                                    >
                                      <Edit3 className="w-3 h-3 text-[#1E3A8A]" />
                                      <span>Editar</span>
                                    </button>
                                    <button
                                      onClick={() => setUserToDelete({ id: user.id, name: user.name, telegram: user.telegram })}
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center gap-1 transition-colors text-[11px]"
                                      title="Eliminar cuenta de usuario"
                                    >
                                      <Trash2 className="w-3 h-3 text-rose-600" />
                                      <span>Eliminar</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: CONECTA TU BOT DE BOTFATHER CON TOKEN Y GRUPO */}
            {activeAdminTab === 'botfather' && (
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#0F172A] leading-tight mb-0.5">
                      Conecta tu Bot de BotFather y Grupo de Telegram
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Configura el HTTP API Token de tu bot y el Chat ID del grupo para que cuando cualquier usuario toque &quot;Usar&quot; en una tarjeta, se envíe automáticamente al grupo de Telegram con foto y datos.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                      Estado de la Integración
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${botFatherToken && targetTelegramChatId ? 'bg-emerald-500' : botFatherToken ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      <span className="text-xs font-bold text-[#0F172A]">
                        {botFatherToken && targetTelegramChatId
                          ? 'Bot y Grupo Vinculados'
                          : botFatherToken
                          ? 'Bot Vinculado (Falta Grupo)'
                          : 'Sin Configurar'}
                      </span>
                    </div>
                    {targetTelegramChatId && (
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {targetTelegramChatTitle ? `Grupo: ${targetTelegramChatTitle}` : `Chat ID: ${targetTelegramChatId}`}
                      </span>
                    )}
                  </div>

                  {(botFatherToken || targetTelegramChatId) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all"
                      >
                        {isTestingConnection ? 'Comprobando...' : 'Probar Envío'}
                      </button>
                      <button
                        onClick={handleClearToken}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all"
                        title="Desvincular bot y grupo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveBotToken} className="space-y-3.5 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
                  {/* Token */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        1. Token de BotFather (HTTP API)
                      </span>
                      {inputToken && (
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="text-[10px] text-[#1E3A8A] font-semibold flex items-center gap-1 hover:underline"
                        >
                          {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showToken ? 'Ocultar' : 'Mostrar'}</span>
                        </button>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showToken ? 'text' : 'password'}
                        placeholder="Ej: 7123456789:AAHfkj92_8djk28Dskj823nsd..."
                        value={inputToken}
                        onChange={(e) => setInputToken(e.target.value)}
                        className="w-full h-11 px-3.5 pr-10 text-xs font-mono bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:bg-white focus:border-[#0F172A] focus:outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Grupo Chat ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <Send className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        <span>2. Chat ID o Grupo de Destino</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoDetectChatId}
                        disabled={isDetectingChatId || !inputToken}
                        className="text-[11px] text-[#1E3A8A] font-bold flex items-center gap-1 hover:underline disabled:opacity-40"
                        title="Detecta automáticamente el grupo leyendo el último mensaje"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{isDetectingChatId ? 'Detectando...' : 'Detectar Automático'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ej: -1002345678901 o @mi_grupo"
                        value={inputChatId}
                        onChange={(e) => setInputChatId(e.target.value)}
                        className="w-full h-11 px-3.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 focus:bg-white focus:border-[#0F172A] focus:outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Envía un mensaje o añade el bot a tu grupo en Telegram y pulsa &quot;Detectar Automático&quot;.
                    </p>
                  </div>

                  {tokenFeedback && (
                    <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                      tokenFeedback.type === 'success' 
                        ? 'bg-slate-100 border border-slate-300 text-[#0F172A]' 
                        : tokenFeedback.type === 'error'
                        ? 'bg-rose-50 border border-rose-200 text-rose-800'
                        : 'bg-slate-50 border border-slate-200 text-slate-700'
                    }`}>
                      {tokenFeedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{tokenFeedback.message}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-[#0F172A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-2xl transition-all shadow-xs active:scale-98"
                    >
                      Guardar Configuración de Telegram
                    </button>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTestingConnection}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5"
                    >
                      <Radio className={`w-3.5 h-3.5 text-[#1E3A8A] ${isTestingConnection ? 'animate-pulse' : ''}`} />
                      <span>{isTestingConnection ? 'Comprobando...' : 'Probar'}</span>
                    </button>
                  </div>
                </form>

                {/* Instructions snippet */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1.5">
                  <h4 className="font-bold text-[#0F172A] uppercase tracking-wider text-[11px]">
                    Pasos rápidos para que funcione:
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                    <li>Crea tu bot en <strong className="text-[#0F172A]">@BotFather</strong> con <code>/newbot</code> y copia el HTTP API Token.</li>
                    <li>Añade a tu bot al grupo de Telegram como Administrador.</li>
                    <li>Escribe un mensaje de prueba en el grupo y pulsa <strong>&quot;Detectar Automático&quot;</strong>.</li>
                    <li>Pulsa <strong>&quot;Guardar Configuración&quot;</strong> y <strong>&quot;Probar&quot;</strong> para verificar el envío.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-mono shrink-0">
              <span>
                {activeAdminTab === 'personajes' 
                  ? `Personajes: ${characters.length}`
                  : activeAdminTab === 'operativos'
                  ? `Total Operativos: ${users.length}`
                  : `Bot: ${botFatherToken ? 'Conectado' : 'Sin Token'}`}
              </span>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="px-4 py-1.5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Cerrar Panel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog for Deleting Character */}
      {charToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 text-[#0F172A] animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Eliminar Personaje
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Confirmación requerida
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente a <strong className="text-[#0F172A]">{charToDelete.name}</strong> ({charToDelete.fandom})? Esta acción no se puede deshacer.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCharToDelete(null)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all border border-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteChar}
                className="py-2.5 px-3 bg-rose-700 hover:bg-rose-800 active:scale-98 text-white text-xs font-bold rounded-2xl transition-all shadow-xs"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deleting Account */}
      {userToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 text-[#0F172A] animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">
                  Eliminar Cuenta
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  Confirmación de eliminación
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              ¿Estás seguro de que deseas eliminar la cuenta de <strong className="text-[#0F172A]">{userToDelete.name}</strong> ({userToDelete.telegram})? Se eliminarán de forma permanente todos sus personajes y balances.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all border border-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="py-2.5 px-3 bg-rose-700 hover:bg-rose-800 active:scale-98 text-white text-xs font-bold rounded-2xl transition-all shadow-xs"
              >
                Eliminar Cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
