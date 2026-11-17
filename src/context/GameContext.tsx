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
  testTelegramConnection: (customToken?: string, customChatId?: string) => Promise<{ success: boolean; message: string; botName?: string; resolvedToken?: string; resolvedChatId?: string; chatTitle?: string }>;
  detectTelegramChatId: (customToken?: string) => Promise<{ success: boolean; chatId?: string; chatTitle?: string; message: string }>;
  detectCurrentUserTelegramId: () => Promise<{ success: boolean; userId?: string; message: string }>;
  sendCharacterToTelegram: (
    character: Character,
    level: number
  ) => Promise<{
    success: boolean;
    message: string;
    tagApplied?: boolean;
    tagValue?: string;
    tagError?: string;
    needsUserId?: boolean;
  }>;
  
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
const STORAGE_TG_USER_MAP_KEY = 'spyct_tg_user_ids_v1';
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

// Sanitize Telegram BotFather Token (handles pasted URLs, "bot" prefix, quotes, hidden spaces)
export const sanitizeTelegramToken = (raw: string): string => {
  if (!raw) return '';
  let clean = raw.replace(/[\s"'`\u200B-\u200D\uFEFF\u00A0]+/g, '');
  const urlMatch = clean.match(/api\.telegram\.org\/bot([^/?#]+)/i);
  if (urlMatch && urlMatch[1]) {
    clean = urlMatch[1];
  }
  const botPrefixMatch = clean.match(/^bot(\d+:.+)$/i);
  if (botPrefixMatch && botPrefixMatch[1]) {
    clean = botPrefixMatch[1];
  }
  return clean;
};

// Sanitize Telegram Chat ID (handles unicode minus, t.me links, quotes, zero-width chars, spaces)
export const sanitizeTelegramChatId = (raw: string): string => {
  if (!raw) return '';
  let clean = raw
    .replace(/["'`\u200B-\u200D\uFEFF\u00A0]+/g, '')
    .replace(/[\u2212\u2012\u2013\u2014\u2015\uFE63\uFF0D]/g, '-')
    .trim();

  // Handle https://t.me/c/2345678901/123 -> -1002345678901
  const privateLinkMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?t\.me\/c\/(\d+)(?:\/\d+)?/i);
  if (privateLinkMatch && privateLinkMatch[1]) {
    return `-100${privateLinkMatch[1]}`;
  }

  // Handle https://web.telegram.org/...#-1002345678901
  const webLinkMatch = clean.match(/web\.telegram\.org\/[^#]*#(-?\d+|@[a-zA-Z0-9_]+)/i);
  if (webLinkMatch && webLinkMatch[1]) {
    return webLinkMatch[1];
  }

  // Handle https://t.me/group_username -> @group_username
  const publicLinkMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]{3,})(?:\/\d+)?$/i);
  if (publicLinkMatch && publicLinkMatch[1] && publicLinkMatch[1].toLowerCase() !== 'c') {
    return `@${publicLinkMatch[1]}`;
  }

  // Remove internal whitespace in numeric IDs (e.g. "-100 234 567")
  if (/^[\s\d-]+$/.test(clean)) {
    clean = clean.replace(/\s+/g, '');
  }

  return clean;
};

const escapeTelegramHtml = (text: string): string => {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const telegramApiPost = async (token: string, method: string, params: Record<string, string>) => {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    body: new URLSearchParams(params)
  });
  return res.json();
};

// Strip emojis and format "Personaje - Fandom" within Telegram's 16-character setChatMemberTag limit
export const buildTelegramMemberTag = (characterName: string, fandom: string): string => {
  const stripEmojis = (str: string) =>
    String(str || '')
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

  const cleanName = stripEmojis(characterName) || 'Personaje';
  const cleanFandom = stripEmojis(fandom) || 'Rol';

  const fullTag = `${cleanName} - ${cleanFandom}`;
  if (fullTag.length <= 16) return fullTag;

  const firstWord = (s: string) => s.split(' ').filter(Boolean)[0] || s;
  const shortName = firstWord(cleanName);
  const shortFandom = firstWord(cleanFandom);

  const nameWithFullFandom = `${shortName} - ${cleanFandom}`;
  if (nameWithFullFandom.length <= 16) return nameWithFullFandom;

  const bothShort = `${shortName} - ${shortFandom}`;
  if (bothShort.length <= 16) return bothShort;

  // Telegram limit is strictly 16 chars; keep "Name - Fandom" readable
  const sep = ' - ';
  const maxBody = 16 - sep.length; // 13 chars
  const namePart = shortName.slice(0, Math.min(7, Math.max(3, shortName.length)));
  const remaining = Math.max(2, maxBody - namePart.length);
  const fandomPart = shortFandom.slice(0, remaining);
  return `${namePart}${sep}${fandomPart}`.slice(0, 16).trim();
};

const loadCachedTgUserMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_TG_USER_MAP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore
  }
  return {};
};

const saveCachedTgUserMap = (map: Record<string, string>) => {
  try {
    localStorage.setItem(STORAGE_TG_USER_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

const extractUsersFromUpdates = (updates: any[]): Record<string, string> => {
  const map = loadCachedTgUserMap();
  const recordUser = (u: any) => {
    if (u && u.id && u.username && !u.is_bot) {
      const key = String(u.username).toLowerCase().replace(/^@+/, '');
      map[key] = String(u.id);
    }
  };

  for (const upd of updates) {
    recordUser(upd.message?.from);
    recordUser(upd.edited_message?.from);
    recordUser(upd.callback_query?.from);
    recordUser(upd.chat_member?.from);
    recordUser(upd.chat_member?.new_chat_member?.user);
    recordUser(upd.my_chat_member?.from);
    if (Array.isArray(upd.message?.new_chat_members)) {
      upd.message.new_chat_members.forEach(recordUser);
    }
  }

  saveCachedTgUserMap(map);
  return map;
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
      return sanitizeTelegramToken(localStorage.getItem(STORAGE_BOTFATHER_TOKEN_KEY) || '');
    } catch {
      return '';
    }
  });

  const setBotFatherToken = (token: string) => {
    const clean = sanitizeTelegramToken(token);
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
      return sanitizeTelegramChatId(localStorage.getItem(STORAGE_TELEGRAM_GROUP_ID_KEY) || '');
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
    const clean = sanitizeTelegramChatId(chatId);
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
    const clean = sanitizeTelegramChatId(chatId);
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

  const resolveValidTelegramChat = async (
    token: string,
    rawChatId: string
  ): Promise<{ ok: boolean; chatId: string; title?: string; description?: string }> => {
    const cleanId = sanitizeTelegramChatId(rawChatId);
    if (!cleanId) {
      return { ok: false, chatId: '', description: 'Chat ID vacío' };
    }

    const tryGetChat = async (idToTry: string) => {
      return telegramApiPost(token, 'getChat', { chat_id: idToTry });
    };

    const firstData = await tryGetChat(cleanId);
    if (firstData.ok && firstData.result) {
      const resolvedId = String(firstData.result.id ?? cleanId);
      const title = firstData.result.title || firstData.result.username || (firstData.result.first_name ? `${firstData.result.first_name}` : resolvedId);
      return { ok: true, chatId: resolvedId, title };
    }

    // Handle automatic supergroup migration returned by Telegram
    if (firstData.parameters?.migrate_to_chat_id) {
      const migratedId = String(firstData.parameters.migrate_to_chat_id);
      const migratedData = await tryGetChat(migratedId);
      if (migratedData.ok && migratedData.result) {
        const title = migratedData.result.title || migratedData.result.username || migratedId;
        return { ok: true, chatId: migratedId, title };
      }
    }

    // If user entered a positive number (missing "-" or "-100" prefix for a group/supergroup), try recovering
    if (/^\d{6,}$/.test(cleanId)) {
      const candidates = cleanId.startsWith('100')
        ? [`-${cleanId}`, `-100${cleanId}`]
        : [`-100${cleanId}`, `-${cleanId}`];

      for (const candidate of candidates) {
        const candData = await tryGetChat(candidate);
        if (candData.ok && candData.result) {
          const title = candData.result.title || candData.result.username || candidate;
          return { ok: true, chatId: String(candData.result.id ?? candidate), title };
        }
      }
    }

    return {
      ok: false,
      chatId: cleanId,
      description: firstData.description || 'Bad Request: chat not found'
    };
  };

  const testTelegramConnection = async (
    customToken?: string,
    customChatId?: string
  ): Promise<{ success: boolean; message: string; botName?: string; resolvedToken?: string; resolvedChatId?: string; chatTitle?: string }> => {
    const token = sanitizeTelegramToken(customToken ?? botFatherToken);
    const chatId = sanitizeTelegramChatId(customChatId ?? targetTelegramChatId);

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

      // 2. If chatId provided, resolve & test sending a ping to the group/chat
      if (chatId) {
        const resolved = await resolveValidTelegramChat(token, chatId);
        const activeChatId = resolved.ok ? resolved.chatId : chatId;

        const testText = `<b>Prueba de Conexión SPYCT RPG</b>\n\nEl bot <b>${escapeTelegramHtml(botName)}</b> está correctamente vinculado al sistema.\n<b>Chat Destino:</b> <code>${escapeTelegramHtml(activeChatId)}</code>\n<i>Listo para recibir tarjetas de personajes al pulsar "Usar".</i>`;

        const sendData = await telegramApiPost(token, 'sendMessage', {
          chat_id: activeChatId,
          text: testText,
          parse_mode: 'HTML'
        });

        if (!sendData.ok) {
          return {
            success: false,
            botName,
            resolvedToken: token,
            resolvedChatId: activeChatId,
            message: `Bot validado (${botName}), pero no pudo enviar al Chat ID "${activeChatId}": ${sendData.description || 'Chat no encontrado'}. Verifica que hayas guardado el ID correcto del grupo.`
          };
        }

        const chatTitle = sendData.result?.chat?.title || sendData.result?.chat?.username || resolved.title || activeChatId;
        // Persist verified token, chatId and title immediately so Enviar never uses stale/unsaved IDs
        setBotFatherToken(token);
        setTargetTelegramChatId(activeChatId);
        setTargetTelegramChatTitle(chatTitle);

        return {
          success: true,
          botName,
          resolvedToken: token,
          resolvedChatId: activeChatId,
          chatTitle,
          message: `¡Conexión exitosa y guardada! Mensaje enviado a "${chatTitle}" (ID: ${activeChatId}) usando ${botName}.`
        };
      }

      setBotFatherToken(token);
      return {
        success: true,
        botName,
        resolvedToken: token,
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
    const token = sanitizeTelegramToken(customToken ?? botFatherToken);
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

      // Cache any @username -> user_id seen in recent updates
      extractUsersFromUpdates(updates);

      // Collect unique candidate chats from newest to oldest, handling supergroup migrations
      const groupCandidates: { id: string; title: string; type: string }[] = [];
      const privateCandidates: { id: string; title: string; type: string }[] = [];
      const seenIds = new Set<string>();

      for (let i = updates.length - 1; i >= 0; i--) {
        const u = updates[i];
        const migratedTo = u.message?.migrate_to_chat_id;
        const chat = u.message?.chat || u.channel_post?.chat || u.my_chat_member?.chat || u.chat_member?.chat;

        if (migratedTo) {
          const migId = String(migratedTo);
          if (!seenIds.has(migId)) {
            seenIds.add(migId);
            groupCandidates.push({
              id: migId,
              title: chat?.title || 'Supergrupo de Telegram',
              type: 'supergroup'
            });
          }
        }

        if (chat && chat.id) {
          const cid = String(chat.id);
          if (!seenIds.has(cid)) {
            seenIds.add(cid);
            const title = chat.title || chat.username || (chat.type === 'private' ? 'Chat Privado' : 'Grupo de Telegram');
            if (chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') {
              groupCandidates.push({ id: cid, title, type: chat.type });
            } else {
              privateCandidates.push({ id: cid, title, type: chat.type || 'private' });
            }
          }
        }
      }

      // Verify candidate chats via getChat so dead/old pre-migration group IDs are skipped
      const allCandidates = [...groupCandidates, ...privateCandidates];
      for (const candidate of allCandidates) {
        const check = await resolveValidTelegramChat(token, candidate.id);
        if (check.ok) {
          const finalId = check.chatId;
          const finalTitle = check.title || candidate.title;
          setBotFatherToken(token);
          setTargetTelegramChatId(finalId);
          setTargetTelegramChatTitle(finalTitle);
          return {
            success: true,
            chatId: finalId,
            chatTitle: finalTitle,
            message: `¡${candidate.type === 'private' ? 'Chat' : 'Grupo'} detectado y verificado! "${finalTitle}" (ID: ${finalId}) asignado correctamente.`
          };
        }
      }

      return {
        success: false,
        message: 'No se encontró ningún grupo activo donde el bot siga siendo miembro. Envía un mensaje como /test dentro de tu grupo de Telegram y vuelve a intentar.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error al consultar actualizaciones: ${err?.message || 'Error desconocido'}`
      };
    }
  };

  const resolveTelegramUserId = async (
    token: string,
    telegramUsername?: string,
    savedNumericId?: string
  ): Promise<{ userId: string | null; webhookBlocked?: boolean }> => {
    const cleanSaved = (savedNumericId || '').trim();
    if (/^\d{5,}$/.test(cleanSaved)) {
      return { userId: cleanSaved };
    }

    const cleanUser = (telegramUsername || '').toLowerCase().replace(/^@+/, '').trim();
    if (!cleanUser) {
      return { userId: null };
    }

    // 1. Check cached username -> user_id map
    const cachedMap = loadCachedTgUserMap();
    if (cachedMap[cleanUser] && /^\d{5,}$/.test(cachedMap[cleanUser])) {
      return { userId: cachedMap[cleanUser] };
    }

    // 2. Fetch latest updates from Telegram to discover @username -> user_id
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=100`);
      const data = await res.json();
      if (!data.ok) {
        if (data.description && data.description.toLowerCase().includes('webhook')) {
          return { userId: null, webhookBlocked: true };
        }
        return { userId: null };
      }

      const updates = Array.isArray(data.result) ? data.result : [];
      const updatedMap = extractUsersFromUpdates(updates);
      if (updatedMap[cleanUser] && /^\d{5,}$/.test(updatedMap[cleanUser])) {
        return { userId: updatedMap[cleanUser] };
      }
    } catch {
      // ignore network error in lookup
    }

    return { userId: null };
  };

  const detectCurrentUserTelegramId = async (): Promise<{ success: boolean; userId?: string; message: string }> => {
    const cleanToken = sanitizeTelegramToken(botFatherToken);
    if (!cleanToken) {
      return {
        success: false,
        message: 'El bot de Telegram aún no está configurado en el Panel Admin.'
      };
    }
    if (!currentUser?.telegram) {
      return {
        success: false,
        message: 'No tienes un @usuario de Telegram en tu cuenta.'
      };
    }

    const { userId, webhookBlocked } = await resolveTelegramUserId(cleanToken, currentUser.telegram, '');
    if (userId) {
      connectTelegramChatId(userId);
      return {
        success: true,
        userId,
        message: `¡ID de Telegram detectado y vinculado (${userId}) para ${currentUser.telegram}!`
      };
    }

    if (webhookBlocked) {
      return {
        success: false,
        message: 'El bot tiene un webhook activo; ingresa tu ID numérico de Telegram manualmente (puedes obtenerlo con @userinfobot).'
      };
    }

    return {
      success: false,
      message: `Aún no vemos a ${currentUser.telegram} en el grupo. Envía un mensaje cualquiera (ej. "hola") dentro del grupo de Telegram y vuelve a pulsar Detectar, o escribe tu ID numérico.`
    };
  };

  const sendCharacterToTelegram = async (
    character: Character,
    level: number
  ): Promise<{
    success: boolean;
    message: string;
    tagApplied?: boolean;
    tagValue?: string;
    tagError?: string;
    needsUserId?: boolean;
  }> => {
    const cleanToken = sanitizeTelegramToken(botFatherToken);
    let activeChatId = sanitizeTelegramChatId(targetTelegramChatId);

    if (!cleanToken) {
      return {
        success: false,
        message: 'No hay Token de BotFather configurado. Abre el Panel Admin -> Bot de BotFather para añadir tu bot.'
      };
    }
    if (!activeChatId) {
      return {
        success: false,
        message: 'No hay un Chat ID o Grupo de Telegram configurado. Configura el grupo en el Panel Admin primero.'
      };
    }

    // Look up fresh character data from database/state
    const dbCharacter = getCharacterById(character.id) || character;
    const agentTag = currentUser?.telegram || '@agente';
    const agentName = currentUser?.name || 'Operativo';
    const memberTag = buildTelegramMemberTag(dbCharacter.name, dbCharacter.fandom);

    // Resolve user's numeric Telegram user_id if available
    const userLookup = await resolveTelegramUserId(cleanToken, currentUser?.telegram, currentUser?.telegramChatId);
    const resolvedUserId = userLookup.userId;
    if (resolvedUserId && currentUser && currentUser.telegramChatId !== resolvedUserId) {
      connectTelegramChatId(resolvedUserId);
    }

    // 1. Clean card caption: photo, Personaje, Fandom, Categoría, and web user
    const cardCaption = `<b>${escapeTelegramHtml(dbCharacter.name)}</b>\n<b>Fandom:</b> ${escapeTelegramHtml(dbCharacter.fandom)}\n<b>Categoría:</b> ${escapeTelegramHtml(dbCharacter.category)}\n<b>Usuario:</b> ${escapeTelegramHtml(agentTag)} (${escapeTelegramHtml(agentName)})`;

    const attemptSendCard = async (chatIdToUse: string) => {
      let sentOk = false;
      let lastError = '';
      let migratedTo: string | null = null;

      if (dbCharacter.image && dbCharacter.image.startsWith('http')) {
        try {
          const photoData = await telegramApiPost(cleanToken, 'sendPhoto', {
            chat_id: chatIdToUse,
            photo: dbCharacter.image,
            caption: cardCaption,
            parse_mode: 'HTML'
          });
          if (photoData.ok) {
            sentOk = true;
            return { ok: true, chatData: photoData.result };
          } else {
            lastError = photoData.description || 'Error al enviar foto';
            if (photoData.parameters?.migrate_to_chat_id) {
              migratedTo = String(photoData.parameters.migrate_to_chat_id);
            }
          }
        } catch (e: any) {
          lastError = e?.message || 'Error en petición de foto';
        }
      }

      if (migratedTo) {
        return { ok: false, migratedTo, error: lastError };
      }

      if (!sentOk) {
        const photoLinkLine =
          dbCharacter.image && dbCharacter.image.startsWith('http')
            ? `\n<b>Foto:</b> <a href="${escapeTelegramHtml(dbCharacter.image)}">Ver Imagen</a>`
            : '';
        const textMessage = `${cardCaption}${photoLinkLine}`;
        const textData = await telegramApiPost(cleanToken, 'sendMessage', {
          chat_id: chatIdToUse,
          text: textMessage,
          parse_mode: 'HTML',
          disable_web_page_preview: 'false'
        });

        if (textData.ok) {
          return { ok: true, chatData: textData.result };
        }
        return {
          ok: false,
          migratedTo: textData.parameters?.migrate_to_chat_id ? String(textData.parameters.migrate_to_chat_id) : null,
          error: textData.description || lastError || 'Error desconocido'
        };
      }

      return { ok: true };
    };

    try {
      // Step 1: Verify/resolve target chat ID so setChatMemberTag & sendPhoto hit the valid supergroup
      let chatCheck = await resolveValidTelegramChat(cleanToken, activeChatId);
      if (chatCheck.ok) {
        if (chatCheck.chatId !== activeChatId) {
          activeChatId = chatCheck.chatId;
          setTargetTelegramChatId(activeChatId);
        }
        if (chatCheck.title) {
          setTargetTelegramChatTitle(chatCheck.title);
        }
      }

      // Step 2: Assign Member Tag ("Personaje - Fandom") WITHOUT making the user an admin via setChatMemberTag
      let tagApplied = false;
      let tagError: string | undefined;
      let needsUserId = false;

      if (resolvedUserId) {
        try {
          const tagRes = await telegramApiPost(cleanToken, 'setChatMemberTag', {
            chat_id: activeChatId,
            user_id: resolvedUserId,
            tag: memberTag
          });
          if (tagRes.ok) {
            tagApplied = true;
          } else {
            const desc = String(tagRes.description || 'No se pudo asignar la etiqueta');
            if (desc.toLowerCase().includes('right') || desc.toLowerCase().includes('permission') || desc.toLowerCase().includes('manage_tags')) {
              tagError = 'El bot necesita el permiso de admin "Gestionar etiquetas" (can_manage_tags) activado en el grupo.';
            } else if (desc.toLowerCase().includes('admin') || desc.toLowerCase().includes('creator') || desc.toLowerCase().includes('owner')) {
              tagError = 'Telegram solo permite asignar etiqueta de miembro a usuarios que NO sean administradores o dueño del grupo.';
            } else {
              tagError = `Telegram no pudo colocar la etiqueta: ${desc}`;
            }
          }
        } catch (err: any) {
          tagError = `Error al asignar etiqueta de miembro: ${err?.message || 'Error de red'}`;
        }
      } else {
        needsUserId = true;
        tagError = `Aún falta el ID numérico de Telegram de ${agentTag} para colocar su etiqueta automáticamente.`;
      }

      // Step 3: Publish the clean card (photo + Personaje + Fandom + Categoría + Usuario)
      let attempt = await attemptSendCard(activeChatId);

      // If group upgraded to supergroup, save new ID and retry
      if (!attempt.ok && attempt.migratedTo) {
        activeChatId = attempt.migratedTo;
        setTargetTelegramChatId(activeChatId);
        attempt = await attemptSendCard(activeChatId);
      }

      // If Telegram returned "chat not found", try resolving valid chat ID
      if (!attempt.ok && attempt.error && attempt.error.toLowerCase().includes('chat not found')) {
        chatCheck = await resolveValidTelegramChat(cleanToken, activeChatId);
        if (chatCheck.ok && chatCheck.chatId !== activeChatId) {
          activeChatId = chatCheck.chatId;
          setTargetTelegramChatId(activeChatId);
          if (chatCheck.title) {
            setTargetTelegramChatTitle(chatCheck.title);
          }
          attempt = await attemptSendCard(activeChatId);
        }
      }

      if (!attempt.ok) {
        const botIdHint = cleanToken.includes(':') ? cleanToken.split(':')[0] : 'desconocido';
        return {
          success: false,
          message: `Telegram rechazó el envío (${attempt.error}). Chat ID usado: "${activeChatId}" | Bot ID: ${botIdHint}. Verifica en Panel Admin > Bot de BotFather que el Token y Chat ID guardados coincidan exactamente y pulsa "Probar".`
        };
      }

      const returnedTitle = attempt.chatData?.chat?.title || attempt.chatData?.chat?.username;
      if (returnedTitle) {
        setTargetTelegramChatTitle(returnedTitle);
      }

      // Step 4: Send final message telling the user they can now go to the roleplay scenario
      const mentionHtml = resolvedUserId
        ? `<a href="tg://user?id=${escapeTelegramHtml(resolvedUserId)}">${escapeTelegramHtml(agentTag)}</a>`
        : escapeTelegramHtml(agentTag);

      const roleplayReadyMessage =
        `<b>¡Ya puedes ir al escenario de rol!</b>\n\n` +
        `${mentionHtml} (<b>${escapeTelegramHtml(agentName)}</b>), ya puedes rolear con tu ficha:\n` +
        `• <b>Personaje:</b> ${escapeTelegramHtml(dbCharacter.name)}\n` +
        `• <b>Fandom:</b> ${escapeTelegramHtml(dbCharacter.fandom)}\n` +
        `• <b>Categoría:</b> ${escapeTelegramHtml(dbCharacter.category)}\n` +
        `• <b>Etiqueta asignada:</b> <code>${escapeTelegramHtml(memberTag)}</code>`;

      await telegramApiPost(cleanToken, 'sendMessage', {
        chat_id: activeChatId,
        text: roleplayReadyMessage,
        parse_mode: 'HTML'
      });

      return {
        success: true,
        tagApplied,
        tagValue: memberTag,
        tagError,
        needsUserId,
        message: tagApplied
          ? `¡Listo! Se asignó la etiqueta "${memberTag}" a ${agentTag}, se publicó la tarjeta limpia de ${dbCharacter.name} y se envió el aviso para ir al escenario de rol.`
          : `Tarjeta de ${dbCharacter.name} y aviso de rol enviados al grupo. ${tagError || ''}`
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
        detectCurrentUserTelegramId,
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
