export type CharacterRarity = 'Común' | 'Raro' | 'Épico' | 'Legendario';

export type CharacterCategory = 
  | 'Todas'
  | 'Anime & Manga' 
  | 'Dramas & Novelas' 
  | 'Películas' 
  | 'Series' 
  | 'Gaming'
  | 'Idols'
  | 'Famosos'
  | 'Streamers & CC'
  | 'Otro';

export interface Character {
  id: string;
  name: string;
  fandom: string;
  category: Exclude<CharacterCategory, 'Todas'>;
  image: string;
  priceCoins: number;
  rarity?: CharacterRarity;
  role?: string;
  atk?: number;
  def?: number;
  spd?: number;
  priceGems?: number;
  description?: string;
  quote?: string;
}

export interface UserInventoryItem {
  characterId: string;
  obtainedAt: string;
  level: number;
}

export interface User {
  id: string;
  name: string;
  age: number;
  telegram: string; // e.g. @usuario
  coins: number;
  gems: number;
  telegramChatId?: string;
  inventory: UserInventoryItem[];
  createdAt: string;
}

export type ActiveTab = 'gacha' | 'tienda' | 'minijuegos' | 'inventario';

export type MiniGameId = 'stack' | 'memory' | 'space-shooter' | 'trivia' | 'dice';
