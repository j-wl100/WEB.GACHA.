import { Character } from '../types';

export const CHARACTER_CATEGORIES = [
  'Anime & Manga',
  'Dramas & Novelas',
  'Películas',
  'Series',
  'Gaming',
  'Idols',
  'Famosos',
  'Streamers & CC',
  'Otro'
] as const;

export const CATEGORIES_LIST = [
  'Todas',
  'Anime & Manga',
  'Dramas & Novelas',
  'Películas',
  'Series',
  'Gaming',
  'Idols',
  'Famosos',
  'Streamers & CC',
  'Otro'
] as const;

export const CHARACTERS_DATABASE: Character[] = [
  // ANIME & MANGA
  {
    id: 'char-satoru',
    name: 'Satoru Gojo',
    fandom: 'Jujutsu Kaisen',
    category: 'Anime & Manga',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    priceCoins: 350,
    rarity: 'Legendario',
    role: 'Hechicero Infinito',
    atk: 98,
    def: 95,
    spd: 99
  },
  {
    id: 'char-zoro',
    name: 'Roronoa Zoro',
    fandom: 'One Piece',
    category: 'Anime & Manga',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    priceCoins: 220,
    rarity: 'Épico',
    role: 'Maestro Santoryu',
    atk: 92,
    def: 86,
    spd: 88
  },
  {
    id: 'char-makima',
    name: 'Makima Control',
    fandom: 'Chainsaw Man',
    category: 'Anime & Manga',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    priceCoins: 210,
    rarity: 'Épico',
    role: 'Estratega de Seguridad',
    atk: 89,
    def: 91,
    spd: 84
  },
  {
    id: 'char-tanjiro',
    name: 'Tanjiro Kamado',
    fandom: 'Demon Slayer',
    category: 'Anime & Manga',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    priceCoins: 110,
    rarity: 'Raro',
    role: 'Danza del Fuego',
    atk: 78,
    def: 74,
    spd: 80
  },
  {
    id: 'char-anya',
    name: 'Anya Forger',
    fandom: 'Spy x Family',
    category: 'Anime & Manga',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    priceCoins: 50,
    rarity: 'Común',
    role: 'Telépata de Élite',
    atk: 45,
    def: 60,
    spd: 65
  },

  // DRAMAS & NOVELAS
  {
    id: 'char-vincenzo',
    name: 'Vincenzo Cassano',
    fandom: 'Vincenzo',
    category: 'Dramas & Novelas',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    priceCoins: 360,
    rarity: 'Legendario',
    role: 'Consigliere Mafia',
    atk: 96,
    def: 90,
    spd: 93
  },
  {
    id: 'char-ko-munyeong',
    name: 'Ko Mun-yeong',
    fandom: "It's Okay to Not Be Okay",
    category: 'Dramas & Novelas',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
    priceCoins: 200,
    rarity: 'Épico',
    role: 'Autora de Sombras',
    atk: 88,
    def: 82,
    spd: 86
  },
  {
    id: 'char-ri-jeonghyeok',
    name: 'Capitán Ri Jeong-hyeok',
    fandom: 'Crash Landing on You',
    category: 'Dramas & Novelas',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    priceCoins: 210,
    rarity: 'Épico',
    role: 'Comandante de Frontera',
    atk: 87,
    def: 94,
    spd: 81
  },
  {
    id: 'char-kang-saebyeok',
    name: 'Kang Sae-byeok (067)',
    fandom: 'Squid Game',
    category: 'Dramas & Novelas',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    priceCoins: 120,
    rarity: 'Raro',
    role: 'Superviviente Táctica',
    atk: 82,
    def: 75,
    spd: 89
  },

  // PELÍCULAS
  {
    id: 'char-neo',
    name: 'Neo (The One)',
    fandom: 'The Matrix',
    category: 'Películas',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    priceCoins: 380,
    rarity: 'Legendario',
    role: 'Hacker Cuántico',
    atk: 99,
    def: 96,
    spd: 98
  },
  {
    id: 'char-john-wick',
    name: 'John Wick (Baba Yaga)',
    fandom: 'John Wick',
    category: 'Películas',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
    priceCoins: 370,
    rarity: 'Legendario',
    role: 'Sicario Continental',
    atk: 97,
    def: 89,
    spd: 94
  },
  {
    id: 'char-mia-wallace',
    name: 'Mia Wallace',
    fandom: 'Pulp Fiction',
    category: 'Películas',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    priceCoins: 190,
    rarity: 'Épico',
    role: 'Ícono Pulp',
    atk: 84,
    def: 80,
    spd: 86
  },
  {
    id: 'char-tyler-durden',
    name: 'Tyler Durden',
    fandom: 'Fight Club',
    category: 'Películas',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
    priceCoins: 215,
    rarity: 'Épico',
    role: 'Líder Anárquico',
    atk: 91,
    def: 84,
    spd: 87
  },

  // SERIES
  {
    id: 'char-thomas-shelby',
    name: 'Thomas Shelby',
    fandom: 'Peaky Blinders',
    category: 'Series',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    priceCoins: 360,
    rarity: 'Legendario',
    role: 'Líder Peaky Blinder',
    atk: 95,
    def: 93,
    spd: 91
  },
  {
    id: 'char-eleven',
    name: 'Eleven (011)',
    fandom: 'Stranger Things',
    category: 'Series',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    priceCoins: 230,
    rarity: 'Épico',
    role: 'Kinesis Psiónica',
    atk: 94,
    def: 79,
    spd: 85
  },
  {
    id: 'char-wednesday',
    name: 'Wednesday Addams',
    fandom: 'Wednesday',
    category: 'Series',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    priceCoins: 210,
    rarity: 'Épico',
    role: 'Detective Forense',
    atk: 87,
    def: 86,
    spd: 88
  },
  {
    id: 'char-walter-white',
    name: 'Heisenberg (Walter)',
    fandom: 'Breaking Bad',
    category: 'Series',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    priceCoins: 340,
    rarity: 'Legendario',
    role: 'Alquimista Maestro',
    atk: 96,
    def: 88,
    spd: 85
  },

  // GAMING
  {
    id: 'char-geralt',
    name: 'Geralt of Rivia',
    fandom: 'The Witcher',
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    priceCoins: 360,
    rarity: 'Legendario',
    role: 'Lobo Blanco',
    atk: 97,
    def: 93,
    spd: 90
  },
  {
    id: 'char-kratos',
    name: 'Kratos (God of War)',
    fandom: 'God of War',
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    priceCoins: 380,
    rarity: 'Legendario',
    role: 'Fantasma de Esparta',
    atk: 99,
    def: 98,
    spd: 89
  },
  {
    id: 'char-master-chief',
    name: 'Master Chief (John-117)',
    fandom: 'Halo',
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    priceCoins: 340,
    rarity: 'Legendario',
    role: 'Spartan-II',
    atk: 95,
    def: 96,
    spd: 90
  },
  {
    id: 'char-link',
    name: 'Link (Héroe del Tiempo)',
    fandom: 'The Legend of Zelda',
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=80',
    priceCoins: 240,
    rarity: 'Épico',
    role: 'Portador del Valor',
    atk: 92,
    def: 89,
    spd: 93
  },

  // IDOLS
  {
    id: 'char-jungkook',
    name: 'Jungkook',
    fandom: 'BTS',
    category: 'Idols',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    priceCoins: 320,
    rarity: 'Legendario',
    role: 'Golden Maknae',
    atk: 94,
    def: 90,
    spd: 96
  },
  {
    id: 'char-lisa',
    name: 'Lisa Manobal',
    fandom: 'BLACKPINK',
    category: 'Idols',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
    priceCoins: 310,
    rarity: 'Legendario',
    role: 'Rap & Dance Star',
    atk: 93,
    def: 88,
    spd: 97
  },

  // FAMOSOS
  {
    id: 'char-pedro-pascal',
    name: 'Pedro Pascal',
    fandom: 'Hollywood & TV',
    category: 'Famosos',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    priceCoins: 290,
    rarity: 'Épico',
    role: 'Protector Carismático',
    atk: 90,
    def: 92,
    spd: 88
  },
  {
    id: 'char-zendaya',
    name: 'Zendaya',
    fandom: 'Dune & Euphoria',
    category: 'Famosos',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    priceCoins: 295,
    rarity: 'Épico',
    role: 'Ícono Global',
    atk: 91,
    def: 89,
    spd: 94
  },

  // STREAMERS & CC
  {
    id: 'char-ibai',
    name: 'Ibai Llanos',
    fandom: 'Twitch & KOI',
    category: 'Streamers & CC',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    priceCoins: 280,
    rarity: 'Épico',
    role: 'Gigante del Entretenimiento',
    atk: 92,
    def: 95,
    spd: 85
  },
  {
    id: 'char-auronplay',
    name: 'AuronPlay',
    fandom: 'Twitch & YouTube',
    category: 'Streamers & CC',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80',
    priceCoins: 275,
    rarity: 'Épico',
    role: 'Maestro de la Comedia',
    atk: 88,
    def: 87,
    spd: 90
  },

  // OTRO
  {
    id: 'char-cyber-operativo',
    name: 'Operativo SPYCT-00',
    fandom: 'SPYCT Universe',
    category: 'Otro',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    priceCoins: 250,
    rarity: 'Épico',
    role: 'Agente Secreto Cuántico',
    atk: 90,
    def: 90,
    spd: 90
  }
];

export const RARITY_CONFIG: Record<string, {
  color: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
  gradient: string;
  glow: string;
  stars: number;
  probWeight: number;
}> = {
  'Legendario': {
    color: '#0F172A',
    bgBadge: 'bg-slate-100',
    textBadge: 'text-[#0F172A]',
    borderBadge: 'border-slate-300',
    gradient: 'from-slate-900 to-slate-800',
    glow: 'rgba(15, 23, 42, 0.2)',
    stars: 5,
    probWeight: 10
  },
  'Épico': {
    color: '#1E3A8A',
    bgBadge: 'bg-slate-100',
    textBadge: 'text-[#1E3A8A]',
    borderBadge: 'border-slate-300',
    gradient: 'from-blue-950 to-blue-900',
    glow: 'rgba(30, 58, 138, 0.2)',
    stars: 4,
    probWeight: 30
  },
  'Raro': {
    color: '#334155',
    bgBadge: 'bg-slate-100',
    textBadge: 'text-slate-800',
    borderBadge: 'border-slate-300',
    gradient: 'from-slate-800 to-slate-700',
    glow: 'rgba(51, 65, 85, 0.15)',
    stars: 3,
    probWeight: 40
  },
  'Común': {
    color: '#64748B',
    bgBadge: 'bg-slate-100',
    textBadge: 'text-slate-600',
    borderBadge: 'border-slate-200',
    gradient: 'from-slate-600 to-slate-500',
    glow: 'rgba(100, 116, 139, 0.1)',
    stars: 2,
    probWeight: 20
  }
};
