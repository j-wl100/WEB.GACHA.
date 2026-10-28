import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Character, ActiveTab, CharacterCategory } from '../types';
import { CHARACTERS_DATABASE, RARITY_CONFIG } from '../data/characters';

interface GameContextType {
  currentUser: User | null;
  users: User[];
  characters: Character[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  
  // Modals & Popovers
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isTelegramModalOpen: boolean;
  setIsTelegramModalOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;

  // Admin Security
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (unlocked: boolean) => void;
  verifyAdminPassword: (pwd: string) => boolean;
  lockAdminPanel: () => void;
  
  // Character Management (CRUD)
  adminAddCharacter: (data: {
    name: string;
    fandom: string;
    category: Exclude<CharacterCategory, 'Todas'>;
    image: string;
    priceCoins: number;
  }) => void;
  adminUpdateCharacter: (
    id: string,
    data: {
      name: string;
      fandom: string;
      category: Exclude<CharacterCategory, 'Todas'>;
      image: string;
      priceCoins: number;
    }
  ) => void;
  adminDeleteCharacter: (id: string) => void;

  // Actions
  registerUser: (name: string, age: number, telegram: string) => { success: boolean; error?: string };
  loginUser: (identifier: string) => { success: boolean; error?: string };
  logout: () => void;
  pullGacha: (count: 1 | 10) => Character[] | null;
  buyCharacter: (characterId: string) => { success: boolean; message: string };
  refundCharacter: (characterId: string) => { success: boolean; refundAmount: number; message: string };
  connectTelegramChatId: (chatId: string) => void;
  addCoins: (amount: number, reason?: string) => void;
  addGems: (amount: number) => void;
  adminUpdateUser: (userId: string, data: Partial<User>) => void;
  adminDeleteUser: (userId: string) => void;
  adminCreateUser: (name: string, age: number, telegram: string, coins: number, gems: number) => void;
  
  // BotFather & Telegram Group Integration
  botFatherToken: string;
  setBotFatherToken: (token: string) => void;
  targetTelegramChatId: string;
  setTargetTelegramChatId: (chatId: string) => void;
  targetTelegramChatTitle: string;
  setTargetTelegramChatTitle: (title: string) => void;
  testTelegramConnection: (customToken?: string, customChatId?: string) => Promise<{ success: boolean; message: string; botName?: string }>;
  detectTelegramChatId: (customToken?: string) => Promise<{ success: boolean; chatId?: string; chatTitle?: string; message: string }>;
  sendCharacterToTelegram: (character: Character, level: number) => Promise<{ success: boolean; message: string }>;
  
  // Helpers
  getCharacterById: (id: string) => Character | undefined;
  getUserCharacters: () => { character: Character; level: number; obtainedAt: string }[];
  isCharacterOwned: (id: string) => boolean;
  isCharacterClaimed: (id: string) => boolean;
}

const STORAGE_USERS_KEY = 'spyct_rpg_users_v2';
const STORAGE_CURRENT_USER_ID = 'spyct_rpg_active_user_v2';
const STORAGE_BOTFATHER_TOKEN_KEY = 'spyct_botfather_token_v1';
const STORAGE_TELEGRAM_GROUP_ID_KEY = 'spyct_telegram_group_id_v1';
const STORAGE_TELEGRAM_GROUP_TITLE_KEY = 'spyct_telegram_group_title_v1';
const STORAGE_CHARACTERS_KEY = 'spyct_rpg_characters_v3';
const STORAGE_DELETED_CHARS_KEY = 'spyct_rpg_deleted_ids_v3';
const ADMIN_PASSWORD_CODE = 'J#SPYCT';

// Clean initial state: no mock or test users
const INITIAL_DEMO_USERS: User[] = [];

// Helper to sanitize / migrate legacy categories
const sanitizeCategory = (rawCat: string): Exclude<CharacterCategory, 'Todas'> => {
  if (rawCat === 'Anime') return 'Anime & Manga';
  if (rawCat === 'K-Drama') return 'Dramas & Novelas';
  if (rawCat === 'Movie') return 'Películas';
  if (
    rawCat === 'Anime & Manga' ||
    rawCat === 'Dramas & Novelas' ||
    rawCat === 'Películas' ||
    rawCat === 'Series' ||
    rawCat === 'Gaming' ||
    rawCat === 'Idols' ||
    rawCat === 'Famosos' ||
    rawCat === 'Streamers & CC' ||
    rawCat === 'Otro'
  ) {
    return rawCat as Exclude<CharacterCategory, 'Todas'>;
  }
  return 'Otro';
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY) || localStorage.getItem('spyct_rpg_users_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validUsers = parsed.filter(u => u && typeof u === 'object' && !u.id?.startsWith('user-default-'));
          return validUsers;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_DEMO_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_CURRENT_USER_ID) || localStorage.getItem('spyct_rpg_active_user_v1');
      if (savedId && !savedId.startsWith('user-default-')) {
        return savedId;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Persistent Characters State: keeps defaults, keeps added characters, respects deletions
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      const deletedRaw = localStorage.getItem(STORAGE_DELETED_CHARS_KEY);
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];

      const savedChars = localStorage.getItem(STORAGE_CHARACTERS_KEY) || localStorage.getItem('spyct_rpg_characters_v2');
      let loaded: Character[] = [];
      if (savedChars) {
        const parsed = JSON.parse(savedChars);
        if (Array.isArray(parsed)) {
          loaded = parsed
            .map(c => ({
              ...c,
              category: sanitizeCategory(c.category)
            }))
            .filter(c => !deletedIds.includes(c.id));
        }
      }

      // Merge with default characters: include defaults that have not been explicitly deleted
      const existingIds = new Set(loaded.map(c => c.id));
      const defaultsToAdd = CHARACTERS_DATABASE.filter(
        d => !deletedIds.includes(d.id) && !existingIds.has(d.id)
      );

      const combined = [...loaded, ...defaultsToAdd];
      return combined.length > 0 ? combined : CHARACTERS_DATABASE;
    } catch (e) {
      console.error('Failed to parse saved characters', e);
      return CHARACTERS_DATABASE;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('gacha');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Admin password unlock state (resets per session/tab, can be locked)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // BotFather Token state
  const [botFatherToken, setBotFatherTokenState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_BOTFATHER_TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });

  const setBotFatherToken = (token: string) => {
    const clean = token.trim();
    setBotFatherTokenState(clean);
    try {
      if (clean) {
        localStorage.setItem(STORAGE_BOTFATHER_TOKEN_KEY, clean);
      } else {
        localStorage.removeItem(STORAGE_BOTFATHER_TOKEN_KEY);
      }
    } catch {
      // ignore
    }
  };

  // Target Telegram Group / Chat ID State
  const [targetTelegramChatId, setTargetTelegramChatIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_TELEGRAM_GROUP_ID_KEY) || '';
    } catch {
      return '';
    }
  });

  const [targetTelegramChatTitle, setTargetTelegramChatTitleState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_TELEGRAM_GROUP_TITLE_KEY) || '';
    } catch {
      return '';
    }
  });

  const setTargetTelegramChatId = (chatId: string) => {
    const clean = chatId.trim();
    setTargetTelegramChatIdState(clean);
    try {
      if (clean) {
        localStorage.setItem(STORAGE_TELEGRAM_GROUP_ID_KEY, clean);
      } else {
        localStorage.removeItem(STORAGE_TELEGRAM_GROUP_ID_KEY);
      }
    } catch {
      // ignore
    }
  };

  const setTargetTelegramChatTitle = (title: string) => {
    const clean = title.trim();
    setTargetTelegramChatTitleState(clean);
    try {
      if (clean) {
        localStorage.setItem(STORAGE_TELEGRAM_GROUP_TITLE_KEY, clean);
      } else {
        localStorage.removeItem(STORAGE_TELEGRAM_GROUP_TITLE_KEY);
      }
    } catch {
      // ignore
    }
  };

  // Sync users to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);

  // Sync current user ID
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_ID);
    }
  }, [currentUserId]);

  // Sync characters to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHARACTERS_KEY, JSON.stringify(characters));
    } catch (e) {
      console.error('Failed to save characters', e);
    }
  }, [characters]);

  const currentUser = users.find(u => u.id === currentUserId) || null;

  // Check if first-time user needs authentication modal
  useEffect(() => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    }
  }, [currentUser]);

  const verifyAdminPassword = (pwd: string): boolean => {
    if (pwd === ADMIN_PASSWORD_CODE) {
      setIsAdminUnlocked(true);
      return true;
    }
    return false;
  };

  const lockAdminPanel = () => {
    setIsAdminUnlocked(false);
  };

  const getCharacterById = (id: string): Character | undefined => {
    return characters.find(c => c.id === id);
  };

  const isCharacterOwned = (id: string): boolean => {
    if (!currentUser) return false;
    return currentUser.inventory.some(item => item.characterId === id);
  };

  const isCharacterClaimed = (id: string): boolean => {
    return users.some(u => u.inventory.some(item => item.characterId === id));
  };

  const getUserCharacters = () => {
    if (!currentUser) return [];
    return currentUser.inventory.map(item => {
      const char = getCharacterById(item.characterId);
      return {
        character: char || {
          id: item.characterId,
          name: 'Operativo Desconocido',
          fandom: 'SPYCT',
          category: 'Anime & Manga' as const,
          image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
          priceCoins: 50
        },
        level: item.level,
        obtainedAt: item.obtainedAt
      };
    });
  };

  // Admin Character Management CRUD
  const adminAddCharacter = (data: {
    name: string;
    fandom: string;
    category: Exclude<CharacterCategory, 'Todas'>;
    image: string;
    priceCoins: number;
  }) => {
    const newChar: Character = {
      id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      fandom: data.fandom.trim(),
      category: data.category,
      image: data.image.trim() || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      priceCoins: Math.max(1, Math.round(Number(data.priceCoins) || 100)),
      rarity: 'Raro',
      role: data.fandom.trim()
    };
    setCharacters(prev => [newChar, ...prev]);
  };

  const adminUpdateCharacter = (
    id: string,
    data: {
      name: string;
      fandom: string;
      category: Exclude<CharacterCategory, 'Todas'>;
      image: string;
      priceCoins: number;
    }
  ) => {
    setCharacters(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          name: data.name.trim(),
          fandom: data.fandom.trim(),
          category: data.category,
          image: data.image.trim() || c.image,
          priceCoins: Math.max(1, Math.round(Number(data.priceCoins) || 100))
        };
      }
      return c;
    }));
  };

  const adminDeleteCharacter = (id: string) => {
    try {
      const deletedRaw = localStorage.getItem(STORAGE_DELETED_CHARS_KEY);
      const deletedIds: string[] = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(STORAGE_DELETED_CHARS_KEY, JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error('Failed to update deleted character IDs', e);
    }

    setCharacters(prev => prev.filter(c => c.id !== id));

    // Also remove from all user inventories
    setUsers(prev => prev.map(u => ({
      ...u,
      inventory: u.inventory.filter(item => item.characterId !== id)
    })));
  };

  const registerUser = (name: string, age: number, telegram: string): { success: boolean; error?: string } => {
    const cleanName = name.trim();
    const rawTg = telegram.trim();
    const cleanTg = rawTg.startsWith('@') ? rawTg : `@${rawTg}`;

    if (!cleanName) {
      return { success: false, error: 'Por favor ingresa tu nombre de agente.' };
    }
    if (!age || age < 10 || age > 120) {
      return { success: false, error: 'Por favor ingresa una edad válida (10 - 120 años).' };
    }
    if (!rawTg || rawTg === '@') {
      return { success: false, error: 'Por favor ingresa tu usuario de Telegram (@usuario).' };
    }

    let currentUsersList = users;
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) currentUsersList = parsed;
      }
    } catch {
      // ignore
    }

    const tgWithoutAt = cleanTg.toLowerCase().replace(/^@+/, '');
    const existingTg = currentUsersList.find(u => 
      u.telegram.toLowerCase().replace(/^@+/, '') === tgWithoutAt
    );
    if (existingTg) {
      return {
        success: false,
        error: `El usuario de Telegram "${cleanTg}" ya está registrado. Inicia sesión con él en la pestaña "Iniciar Sesión".`
      };
    }

    const starterCharId = characters[0]?.id || 'char-satoru';

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      age: Number(age),
      telegram: cleanTg,
      coins: 160, // Starter bonus!
      gems: 15,   // Starter gems!
      inventory: [
        {
          characterId: starterCharId,
          obtainedAt: new Date().toISOString(),
          level: 1
        }
      ],
      createdAt: new Date().toISOString()
    };

    const nextList = [newUser, ...currentUsersList];
    setUsers(nextList);
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(nextList));
      localStorage.setItem(STORAGE_CURRENT_USER_ID, newUser.id);
    } catch (e) {
      console.error('LocalStorage save error', e);
    }
    setCurrentUserId(newUser.id);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const loginUser = (identifier: string): { success: boolean; error?: string } => {
    const raw = identifier.trim();
    if (!raw) {
      return {
        success: false,
        error: 'Por favor ingresa tu usuario de Telegram o tu Nombre de agente registrado.'
      };
    }

    let userList = users;
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) userList = parsed;
      }
    } catch {
      // ignore
    }

    if (userList.length === 0) {
      return {
        success: false,
        error: 'No hay ninguna cuenta registrada en el sistema todavía. Por favor crea una cuenta en la pestaña "Crear Cuenta".'
      };
    }

    const queryLower = raw.toLowerCase();
    const queryWithoutAt = queryLower.replace(/^@+/, '');
    const queryWithAt = `@${queryWithoutAt}`;

    const match = userList.find(u => {
      const uTg = u.telegram.toLowerCase();
      const uTgWithoutAt = uTg.replace(/^@+/, '');
      const uName = u.name.toLowerCase().trim();

      return (
        uTg === queryLower ||
        uTgWithoutAt === queryWithoutAt ||
        uTg === queryWithAt ||
        uName === queryLower ||
        u.id.toLowerCase() === queryLower
      );
    });

    if (match) {
      setCurrentUserId(match.id);
      try {
        localStorage.setItem(STORAGE_CURRENT_USER_ID, match.id);
      } catch {
        // ignore
      }
      setIsAuthModalOpen(false);
      return { success: true };
    }

    return {
      success: false,
      error: `No encontramos ninguna cuenta con "${raw}". Verifica si escribiste bien tu @usuario de Telegram o regístrate en "Crear Cuenta".`
    };
  };

  const logout = () => {
    setCurrentUserId(null);
    setIsProfileOpen(false);
    setIsAuthModalOpen(true);
  };

  const addCoins = (amount: number) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, coins: Math.max(0, u.coins + amount) };
      }
      return u;
    }));
  };

  const addGems = (amount: number) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, gems: Math.max(0, u.gems + amount) };
      }
      return u;
    }));
  };

  const pullGacha = (count: 1 | 10): Character[] | null => {
    if (!currentUser || characters.length === 0) return null;
    const cost = count === 1 ? 20 : 180;

    if (currentUser.coins < cost) {
      return null;
    }

    // Filter available pool to unowned/unclaimed characters
    const availablePool = characters.filter(c => !isCharacterClaimed(c.id));
    if (availablePool.length === 0) {
      return null;
    }

    const pullSingle = (claimedInThisRoll: Set<string>): Character | null => {
      const remaining = availablePool.filter(c => !claimedInThisRoll.has(c.id));
      if (remaining.length === 0) return null;

      const totalWeight = Object.values(RARITY_CONFIG).reduce((acc, curr) => acc + curr.probWeight, 0);
      let rand = Math.random() * totalWeight;

      let chosenRarity = 'Común';
      for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
        if (rand < config.probWeight) {
          chosenRarity = rarity;
          break;
        }
        rand -= config.probWeight;
      }

      let pool = remaining.filter(c => c.rarity === chosenRarity);
      if (pool.length === 0) {
        pool = remaining;
      }

      const randomIdx = Math.floor(Math.random() * pool.length);
      return pool[randomIdx] || remaining[0];
    };

    const pulled: Character[] = [];
    const pulledIds = new Set<string>();

    for (let i = 0; i < count; i++) {
      const p = pullSingle(pulledIds);
      if (p) {
        pulled.push(p);
        pulledIds.add(p.id);
      } else {
        break;
      }
    }

    if (pulled.length === 0) {
      return null;
    }

    const actualCost = pulled.length === 1 && count === 1 
      ? 20 
      : count === 10 
      ? Math.round((180 / 10) * pulled.length) 
      : 20 * pulled.length;

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const updatedInventory = [...u.inventory];
        
        pulled.forEach(char => {
          const existingItemIndex = updatedInventory.findIndex(item => item.characterId === char.id);
          if (existingItemIndex >= 0) {
            updatedInventory[existingItemIndex] = {
              ...updatedInventory[existingItemIndex],
              level: updatedInventory[existingItemIndex].level + 1
            };
          } else {
            updatedInventory.push({
              characterId: char.id,
              obtainedAt: new Date().toISOString(),
              level: 1
            });
          }
        });

        return {
          ...u,
          coins: u.coins - actualCost,
          inventory: updatedInventory
        };
      }
      return u;
    }));

    return pulled;
  };

  const buyCharacter = (characterId: string): { success: boolean; message: string } => {
    if (!currentUser) {
      return { success: false, message: 'Inicia sesión primero.' };
    }

    const character = getCharacterById(characterId);
    if (!character) {
      return { success: false, message: 'Personaje no encontrado.' };
    }

    if (isCharacterClaimed(characterId)) {
      return { success: false, message: '¡Este personaje ya ha sido adquirido por otro agente!' };
    }

    if (currentUser.coins < character.priceCoins) {
      return { 
        success: false, 
        message: `Coins insuficientes. Tienes ${currentUser.coins} y necesitas ${character.priceCoins}. ¡Gana más en Mini-Juegos!` 
      };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          coins: u.coins - character.priceCoins,
          inventory: [
            ...u.inventory,
            {
              characterId: character.id,
              obtainedAt: new Date().toISOString(),
              level: 1
            }
          ]
        };
      }
      return u;
    }));

    return { 
      success: true, 
      message: `¡Has adquirido a ${character.name}! Revisa tu inventario.` 
    };
  };

  // System for refunding card (50% value return and release to store)
  const refundCharacter = (characterId: string): { success: boolean; refundAmount: number; message: string } => {
    if (!currentUser) {
      return { success: false, refundAmount: 0, message: 'Debes iniciar sesión.' };
    }

    const character = getCharacterById(characterId);
    const price = character ? character.priceCoins : 100;
    const refundAmount = Math.floor(price * 0.5);

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          coins: u.coins + refundAmount,
          inventory: u.inventory.filter(item => item.characterId !== characterId)
        };
      }
      return u;
    }));

    return {
      success: true,
      refundAmount,
      message: `Has devuelto a ${character?.name || 'personaje'}. Recibiste ${refundAmount} Coins.`
    };
  };

  const connectTelegramChatId = (chatId: string) => {
    if (!currentUser) return;
    const clean = chatId.trim();
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, telegramChatId: clean };
      }
      return u;
    }));
  };

  const adminUpdateUser = (userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, ...data };
      }
      return u;
    }));
  };

  // When admin deletes a user, their account and bound cards are eliminated,
  // automatically making those cards available for anyone in the Store.
  const adminDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUserId === userId) {
      setCurrentUserId(null);
      setIsAuthModalOpen(true);
    }
  };

  const adminCreateUser = (name: string, age: number, telegram: string, coins: number, gems: number) => {
    const cleanTg = telegram.startsWith('@') ? telegram.trim() : `@${telegram.trim()}`;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      age: Number(age),
      telegram: cleanTg,
      coins: Number(coins) || 0,
      gems: Number(gems) || 0,
      inventory: [],
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const testTelegramConnection = async (customToken?: string, customChatId?: string): Promise<{ success: boolean; message: string; botName?: string }> => {
    const token = (customToken ?? botFatherToken).trim();
    const chatId = (customChatId ?? targetTelegramChatId).trim();

    if (!token) {
      return { success: false, message: 'Por favor ingresa el Token de BotFather.' };
    }

    try {
      // 1. Verify Bot Token validity with getMe
      const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const meData = await meRes.json();
      if (!meData.ok) {
        return { 
          success: false, 
          message: `Error de Token: ${meData.description || 'Token inválido'}. Verifica la clave copiada de @BotFather.` 
        };
      }

      const botName = `@${meData.result.username || meData.result.first_name}`;

      // 2. If chatId provided, test sending a test ping to the group/chat
      if (chatId) {
        const testText = `<b>Prueba de Conexión SPYCT RPG</b>\n\nEl bot <b>${botName}</b> está correctamente vinculado al sistema.\n<b>Chat Destino:</b> <code>${chatId}</code>\n<i>Listo para recibir tarjetas de personajes al pulsar "Usar".</i>`;
        const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: testText,
            parse_mode: 'HTML'
          })
        });
        const sendData = await sendRes.json();
        if (!sendData.ok) {
          return {
            success: false,
            botName,
            message: `Bot validado (${botName}), pero no pudo enviar al grupo: ${sendData.description || 'Chat no encontrado'}. Asegúrate de que el bot sea miembro (o admin) del grupo y que el Chat ID sea correcto.`
          };
        }

        const chatTitle = sendData.result?.chat?.title || sendData.result?.chat?.username || chatId;
        setTargetTelegramChatTitle(chatTitle);

        return {
          success: true,
          botName,
          message: `¡Conexión exitosa! Mensaje de prueba enviado al grupo "${chatTitle}" usando ${botName}.`
        };
      }

      return {
        success: true,
        botName,
        message: `Token válido. Bot detectado: ${botName}. Ahora ingresa el Chat ID del Grupo para completar la configuración.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error de red al conectar con Telegram: ${err?.message || 'Verifica tu conexión a internet.'}`
      };
    }
  };

  const detectTelegramChatId = async (customToken?: string): Promise<{ success: boolean; chatId?: string; chatTitle?: string; message: string }> => {
    const token = (customToken ?? botFatherToken).trim();
    if (!token) {
      return { success: false, message: 'Primero ingresa y guarda tu Token de BotFather.' };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=50`);
      const data = await res.json();
      if (!data.ok) {
        if (data.description && data.description.includes('webhook')) {
          return {
            success: false,
            message: 'Tu bot tiene un webhook activo en Telegram. Puedes borrarlo temporalmente abriendo https://api.telegram.org/bot' + token + '/deleteWebhook en tu navegador o ingresar el ID del grupo manualmente.'
          };
        }
        return { success: false, message: `Error de Telegram: ${data.description}` };
      }

      const updates = data.result || [];
      if (!Array.isArray(updates) || updates.length === 0) {
        return {
          success: false,
          message: 'No se encontraron actualizaciones recientes. Agrega tu bot a tu grupo de Telegram, hazlo administrador (o escribe un comando como /id o /test en el grupo) y vuelve a pulsar este botón.'
        };
      }

      // Prioritize groups or supergroups
      let groupChat: { id: string | number; title?: string; type?: string; username?: string } | null = null;
      let fallbackChat: { id: string | number; title?: string; type?: string; username?: string } | null = null;

      for (let i = updates.length - 1; i >= 0; i--) {
        const u = updates[i];
        const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat || u.chat_member?.chat;
        if (chat && chat.id) {
          if (!fallbackChat) {
            fallbackChat = chat;
          }
          if (chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') {
            groupChat = chat;
            break;
          }
        }
      }

      const chosenChat = groupChat || fallbackChat;
      if (chosenChat && chosenChat.id) {
        const detectedId = String(chosenChat.id);
        const title = chosenChat.title || chosenChat.username || (chosenChat.type === 'private' ? 'Chat Privado' : 'Grupo de Telegram');
        setTargetTelegramChatId(detectedId);
        setTargetTelegramChatTitle(title);
        return {
          success: true,
          chatId: detectedId,
          chatTitle: title,
          message: `¡${chosenChat.type === 'supergroup' || chosenChat.type === 'group' ? 'Grupo' : 'Chat'} detectado! "${title}" (ID: ${detectedId}) asignado correctamente.`
        };
      }

      return {
        success: false,
        message: 'No se identificó ningún chat en las actualizaciones. Envía un mensaje como /test en el grupo de Telegram y vuelve a intentar.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error al consultar actualizaciones: ${err?.message || 'Error desconocido'}`
      };
    }
  };

  const sendCharacterToTelegram = async (character: Character, level: number): Promise<{ success: boolean; message: string }> => {
    if (!botFatherToken) {
      return {
        success: false,
        message: 'No hay Token de BotFather configurado. Abre la configuración de Telegram para añadir tu bot.'
      };
    }
    if (!targetTelegramChatId) {
      return {
        success: false,
        message: 'No hay un Chat ID o Grupo de Telegram configurado. Configura el grupo de destino primero.'
      };
    }

    const cardCode = `SPYCT-${character.id.toUpperCase()}-${level}-${currentUser?.telegram?.replace('@', '') || '0000'}`;
    const agentTag = currentUser?.telegram || '@agente';
    const agentName = currentUser?.name || 'Operativo';
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('es-ES')} - ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

    const caption = `<b>TARJETA OFICIAL SPYCT RPG</b>\n━━━━━━━━━━━━━━━━━━━━\n<b>Personaje:</b> ${character.name}\n<b>Nivel:</b> ${level}\n<b>Fandom:</b> ${character.fandom}\n<b>Categoría:</b> ${character.category}\n<b>Valor:</b> ${character.priceCoins} Coins\n<b>ID Único:</b> <code>${cardCode}</code>\n━━━━━━━━━━━━━━━━━━━━\n<b>Agente:</b> ${agentTag} (${agentName})\n<b>Fecha:</b> ${formattedDate}\n<i>Validado por la Red SPYCT</i>`;

    try {
      // Try sendPhoto first if character has valid HTTP image
      let sentOk = false;
      let lastError = '';

      if (character.image && character.image.startsWith('http')) {
        try {
          const photoRes = await fetch(`https://api.telegram.org/bot${botFatherToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetTelegramChatId,
              photo: character.image,
              caption: caption,
              parse_mode: 'HTML'
            })
          });
          const photoData = await photoRes.json();
          if (photoData.ok) {
            sentOk = true;
          } else {
            lastError = photoData.description || 'Error al enviar foto';
          }
        } catch (e: any) {
          lastError = e?.message || 'Error en petición de foto';
        }
      }

      // If photo send didn't succeed, fallback to sendMessage with photo link
      if (!sentOk) {
        const textMessage = `${caption}\n\n<b>Foto:</b> <a href="${character.image}">Ver Imagen</a>`;
        const textRes = await fetch(`https://api.telegram.org/bot${botFatherToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetTelegramChatId,
            text: textMessage,
            parse_mode: 'HTML',
            disable_web_page_preview: false
          })
        });
        const textData = await textRes.json();
        if (textData.ok) {
          sentOk = true;
        } else {
          return {
            success: false,
            message: `Telegram rechazó el envío: ${textData.description || lastError || 'Error desconocido'}. Asegúrate de que el bot pertenezca al grupo.`
          };
        }
      }

      return {
        success: true,
        message: `¡Tarjeta de ${character.name} enviada exitosamente al grupo de Telegram!`
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error de red al enviar la tarjeta a Telegram: ${err?.message || 'Verifica la conexión'}`
      };
    }
  };

  return (
    <GameContext.Provider
      value={{
        currentUser,
        users,
        characters,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isTelegramModalOpen,
        setIsTelegramModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isProfileOpen,
        setIsProfileOpen,
        isAdminUnlocked,
        setIsAdminUnlocked,
        verifyAdminPassword,
        lockAdminPanel,
        adminAddCharacter,
        adminUpdateCharacter,
        adminDeleteCharacter,
        registerUser,
        loginUser,
        logout,
        pullGacha,
        buyCharacter,
        refundCharacter,
        connectTelegramChatId,
        addCoins,
        addGems,
        adminUpdateUser,
        adminDeleteUser,
        adminCreateUser,
        botFatherToken,
        setBotFatherToken,
        targetTelegramChatId,
        setTargetTelegramChatId,
        targetTelegramChatTitle,
        setTargetTelegramChatTitle,
        testTelegramConnection,
        detectTelegramChatId,
        sendCharacterToTelegram,
        getCharacterById,
        getUserCharacters,
        isCharacterOwned,
        isCharacterClaimed
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
