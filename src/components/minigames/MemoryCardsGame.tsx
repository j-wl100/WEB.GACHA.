import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Coins, 
  Trophy, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  ShieldAlert,
  Crown,
  Sword,
  Gem,
  Flame,
  Shield,
  Key,
  Compass,
  Crosshair,
  Target,
  Radio,
  Cpu,
  Clock,
  Shuffle,
  Layers,
  Award
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface Props {
  onBack: () => void;
}

export type IconType = 
  | 'shield' 
  | 'sword' 
  | 'crown' 
  | 'zap' 
  | 'key' 
  | 'flame' 
  | 'gem' 
  | 'compass' 
  | 'crosshair' 
  | 'target' 
  | 'radio' 
  | 'cpu';

interface DeckTemplate {
  id: string;
  word: string;
  letter: string;
  colorName: string;
  colorHex: string;
  iconType: IconType;
}

// 12 Tactical Card Items without any emojis
const MASTER_DECK: DeckTemplate[] = [
  {
    id: 'item-shield',
    word: 'ESCUDO',
    letter: 'E',
    colorName: 'Azul Cobalto',
    colorHex: '#1E3A8A',
    iconType: 'shield'
  },
  {
    id: 'item-sword',
    word: 'ESPADA',
    letter: 'S',
    colorName: 'Negro Ébano',
    colorHex: '#0F172A',
    iconType: 'sword'
  },
  {
    id: 'item-crown',
    word: 'CORONA',
    letter: 'K',
    colorName: 'Azul Zafiro',
    colorHex: '#1D4ED8',
    iconType: 'crown'
  },
  {
    id: 'item-zap',
    word: 'RAYO',
    letter: 'Z',
    colorName: 'Azul Eléctrico',
    colorHex: '#2563EB',
    iconType: 'zap'
  },
  {
    id: 'item-key',
    word: 'LLAVE',
    letter: 'L',
    colorName: 'Azul Marino',
    colorHex: '#1E40AF',
    iconType: 'key'
  },
  {
    id: 'item-flame',
    word: 'FÉNIX',
    letter: 'F',
    colorName: 'Pizarra Oscura',
    colorHex: '#334155',
    iconType: 'flame'
  },
  {
    id: 'item-gem',
    word: 'DIAMANTE',
    letter: 'D',
    colorName: 'Azul Espacial',
    colorHex: '#0284C7',
    iconType: 'gem'
  },
  {
    id: 'item-compass',
    word: 'BRÚJULA',
    letter: 'B',
    colorName: 'Azul Noche',
    colorHex: '#172554',
    iconType: 'compass'
  },
  {
    id: 'item-crosshair',
    word: 'BLANCO',
    letter: 'T',
    colorName: 'Pizarra Profunda',
    colorHex: '#1E293B',
    iconType: 'crosshair'
  },
  {
    id: 'item-target',
    word: 'OBJETIVO',
    letter: 'O',
    colorName: 'Negro Táctico',
    colorHex: '#020617',
    iconType: 'target'
  },
  {
    id: 'item-radio',
    word: 'RADAR',
    letter: 'R',
    colorName: 'Azul Real',
    colorHex: '#1D4ED8',
    iconType: 'radio'
  },
  {
    id: 'item-cpu',
    word: 'NÚCLEO',
    letter: 'N',
    colorName: 'Índigo Profundo',
    colorHex: '#312E81',
    iconType: 'cpu'
  }
];

interface CardInstance {
  instanceId: string;
  pairId: string;
  word: string;
  letter: string;
  colorName: string;
  colorHex: string;
  iconType: IconType;
  isFlipped: boolean;
  isMatched: boolean;
  shuffleOffset: { x: number; y: number };
}

// Level configurations:
// Level 1: 3 pairs (6 cards), 7 minutes (420s), 4.0s preview
// Level 2: 4 pairs (8 cards), 5 minutes (300s), 3.2s preview
// Level 3: 6 pairs (12 cards), 3.5 minutes (210s), 2.5s preview
// Level 4: 8 pairs (16 cards), 2 minutes (120s), 1.8s preview
// Level 5+: 10 pairs (20 cards), 1 minute (60s), 1.4s preview
const LEVEL_CONFIGS = [
  { level: 1, pairs: 3, timeSeconds: 420, previewSeconds: 4.0, gridCols: 'grid-cols-3' },
  { level: 2, pairs: 4, timeSeconds: 300, previewSeconds: 3.2, gridCols: 'grid-cols-4' },
  { level: 3, pairs: 6, timeSeconds: 210, previewSeconds: 2.5, gridCols: 'grid-cols-3 sm:grid-cols-4' },
  { level: 4, pairs: 8, timeSeconds: 120, previewSeconds: 1.8, gridCols: 'grid-cols-4' },
  { level: 5, pairs: 10, timeSeconds: 60, previewSeconds: 1.4, gridCols: 'grid-cols-4 sm:grid-cols-5' },
];

export const MemoryCardsGame: React.FC<Props> = ({ onBack }) => {
  const { addCoins } = useGame();

  const [gameState, setGameState] = useState<'idle' | 'preview' | 'shuffling' | 'playing' | 'round_clear' | 'gameover'>('idle');
  const [level, setLevel] = useState(1);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [highLevel, setHighLevel] = useState(() => {
    try {
      return parseInt(localStorage.getItem('spyct_memory_high_level') || '1', 10);
    } catch {
      return 1;
    }
  });

  // Cards on board
  const [cards, setCards] = useState<CardInstance[]>([]);
  // Currently flipped card instance IDs during gameplay (max 2)
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [totalPairsThisRound, setTotalPairsThisRound] = useState(3);

  // Timers
  const [previewRemaining, setPreviewRemaining] = useState(4.0);
  const [previewTotal, setPreviewTotal] = useState(4.0);
  const [timeRemaining, setTimeRemaining] = useState(420);
  const [initialTimeLimit, setInitialTimeLimit] = useState(420);

  const previewTimerRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const shuffleTimerRef = useRef<number | null>(null);
  const flipBackTimeoutRef = useRef<number | null>(null);
  const isEvaluatingRef = useRef<boolean>(false);

  const clearAllTimers = useCallback(() => {
    if (previewTimerRef.current !== null) {
      clearInterval(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (gameTimerRef.current !== null) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (shuffleTimerRef.current !== null) {
      clearTimeout(shuffleTimerRef.current);
      shuffleTimerRef.current = null;
    }
    if (flipBackTimeoutRef.current !== null) {
      clearTimeout(flipBackTimeoutRef.current);
      flipBackTimeoutRef.current = null;
    }
    isEvaluatingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Current level settings
  const getConfigForLevel = (lvl: number) => {
    const clampedIndex = Math.min(lvl - 1, LEVEL_CONFIGS.length - 1);
    const base = LEVEL_CONFIGS[clampedIndex];
    if (lvl > LEVEL_CONFIGS.length) {
      // Endless escalation beyond level 5: 10 pairs, 50s, 1.2s preview
      return {
        level: lvl,
        pairs: 10,
        timeSeconds: Math.max(30, 60 - (lvl - 5) * 5),
        previewSeconds: 1.2,
        gridCols: 'grid-cols-4 sm:grid-cols-5'
      };
    }
    return base;
  };

  // Build deck for the given level
  const generateLevelDeck = (numPairs: number): CardInstance[] => {
    // Pick random unique templates
    const shuffledTemplates = [...MASTER_DECK].sort(() => 0.5 - Math.random());
    const selectedTemplates = shuffledTemplates.slice(0, numPairs);

    // Create 2 cards for each template
    const rawCards: CardInstance[] = [];
    selectedTemplates.forEach((t) => {
      // First card of pair
      rawCards.push({
        instanceId: `${t.id}-a`,
        pairId: t.id,
        word: t.word,
        letter: t.letter,
        colorName: t.colorName,
        colorHex: t.colorHex,
        iconType: t.iconType,
        isFlipped: true, // Initially flipped up during preview
        isMatched: false,
        shuffleOffset: { x: 0, y: 0 }
      });
      // Second card of pair
      rawCards.push({
        instanceId: `${t.id}-b`,
        pairId: t.id,
        word: t.word,
        letter: t.letter,
        colorName: t.colorName,
        colorHex: t.colorHex,
        iconType: t.iconType,
        isFlipped: true, // Initially flipped up during preview
        isMatched: false,
        shuffleOffset: { x: 0, y: 0 }
      });
    });

    // Initial shuffle of cards on board
    return rawCards.sort(() => 0.5 - Math.random());
  };

  // Start a round
  const startRound = useCallback((targetLevel: number) => {
    clearAllTimers();
    const config = getConfigForLevel(targetLevel);
    setLevel(targetLevel);
    setTotalPairsThisRound(config.pairs);
    setMatchedPairsCount(0);
    setSelectedCards([]);
    isEvaluatingRef.current = false;

    const newDeck = generateLevelDeck(config.pairs);
    setCards(newDeck);

    // Set preview times
    setPreviewTotal(config.previewSeconds);
    setPreviewRemaining(config.previewSeconds);
    setInitialTimeLimit(config.timeSeconds);
    setTimeRemaining(config.timeSeconds);

    // Enter PREVIEW state (cards face up for short duration)
    setGameState('preview');

    const intervalStep = 50;
    let pLeft = config.previewSeconds;

    previewTimerRef.current = window.setInterval(() => {
      pLeft -= intervalStep / 1000;
      if (pLeft <= 0) {
        clearInterval(previewTimerRef.current!);
        previewTimerRef.current = null;
        setPreviewRemaining(0);
        
        // Transition: Flip all cards face down and begin shuffle
        beginShufflePhase(config.timeSeconds);
      } else {
        setPreviewRemaining(pLeft);
      }
    }, intervalStep);
  }, [clearAllTimers]);

  // Flip cards face down and animate shuffle
  const beginShufflePhase = (mainTimeLimit: number) => {
    setGameState('shuffling');

    // Step 1: Flip all cards face down
    setCards(prev => prev.map(c => ({ ...c, isFlipped: false })));

    // Step 2: Trigger random physical shuffle displacement offsets
    shuffleTimerRef.current = window.setTimeout(() => {
      // Displace cards temporarily to simulate physical shuffling
      setCards(prev => {
        return prev.map(c => {
          const rx = (Math.random() - 0.5) * 45;
          const ry = (Math.random() - 0.5) * 45;
          return { ...c, shuffleOffset: { x: rx, y: ry } };
        });
      });

      // Step 3: Rearrange order in array and settle back to normal positions
      window.setTimeout(() => {
        setCards(prev => {
          const reshuffled = [...prev].sort(() => 0.5 - Math.random());
          return reshuffled.map(c => ({ ...c, shuffleOffset: { x: 0, y: 0 } }));
        });

        // Step 4: Start main countdown and allow interaction
        window.setTimeout(() => {
          setGameState('playing');
          startMainGameTimer(mainTimeLimit);
        }, 350);
      }, 700);
    }, 400);
  };

  // Main countdown timer
  const startMainGameTimer = (secondsLimit: number) => {
    if (gameTimerRef.current !== null) {
      clearInterval(gameTimerRef.current);
    }
    let timeLeft = secondsLimit;
    setTimeRemaining(timeLeft);

    gameTimerRef.current = window.setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(gameTimerRef.current!);
        gameTimerRef.current = null;
        setTimeRemaining(0);
        // Time expired! Game over / Reset round
        setGameState('gameover');
      } else {
        setTimeRemaining(timeLeft);
      }
    }, 1000);
  };

  // Start fresh game from Level 1
  const initGame = () => {
    setCoinsEarned(0);
    startRound(1);
  };

  // Handle card click
  const handleCardClick = (instanceId: string) => {
    if (gameState !== 'playing' || isEvaluatingRef.current) return;

    const clickedCard = cards.find(c => c.instanceId === instanceId);
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;

    // Flip the clicked card
    const updatedCards = cards.map(c => 
      c.instanceId === instanceId ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newSelected = [...selectedCards, instanceId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      isEvaluatingRef.current = true;
      const [firstId, secondId] = newSelected;
      const firstCard = updatedCards.find(c => c.instanceId === firstId);
      const secondCard = updatedCards.find(c => c.instanceId === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // MATCH FOUND!
        const nextMatchedCount = matchedPairsCount + 1;
        setMatchedPairsCount(nextMatchedCount);

        window.setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.pairId === firstCard.pairId ? { ...c, isMatched: true, isFlipped: true } : c
          ));
          setSelectedCards([]);
          isEvaluatingRef.current = false;

          // Check if round is won
          if (nextMatchedCount >= totalPairsThisRound) {
            handleRoundClear();
          }
        }, 400);
      } else {
        // NO MATCH -> Flip both back down after short pause
        flipBackTimeoutRef.current = window.setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.instanceId === firstId || c.instanceId === secondId)
              ? { ...c, isFlipped: false }
              : c
          ));
          setSelectedCards([]);
          isEvaluatingRef.current = false;
        }, 800);
      }
    }
  };

  // Round Won Handler
  const handleRoundClear = () => {
    if (gameTimerRef.current !== null) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }

    // Reward calculation: Base coins per level + time bonus
    const baseReward = 20 + level * 10;
    const timeBonus = Math.floor(timeRemaining / 15);
    const roundTotalCoins = baseReward + timeBonus;

    setCoinsEarned(prev => prev + roundTotalCoins);
    addCoins(roundTotalCoins, `Memory Cards Nivel ${level}`);

    const nextLvl = level + 1;
    if (nextLvl > highLevel) {
      setHighLevel(nextLvl);
      try {
        localStorage.setItem('spyct_memory_high_level', String(nextLvl));
      } catch {
        // ignore
      }
    }

    setGameState('round_clear');
  };

  // Proceed to next level
  const handleNextLevel = () => {
    startRound(level + 1);
  };

  // Render SVG icons without any emojis
  const renderCardIcon = (type: IconType, className = 'w-6 h-6') => {
    switch (type) {
      case 'shield': return <Shield className={className} />;
      case 'sword': return <Sword className={className} />;
      case 'crown': return <Crown className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'key': return <Key className={className} />;
      case 'flame': return <Flame className={className} />;
      case 'gem': return <Gem className={className} />;
      case 'compass': return <Compass className={className} />;
      case 'crosshair': return <Crosshair className={className} />;
      case 'target': return <Target className={className} />;
      case 'radio': return <Radio className={className} />;
      case 'cpu': return <Cpu className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Timer format (MM:SS)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const previewPercent = Math.max(0, Math.min(100, (previewRemaining / previewTotal) * 100));
  const timePercent = Math.max(0, Math.min(100, (timeRemaining / initialTimeLimit) * 100));
  const currentConfig = getConfigForLevel(level);

  return (
    <div className="bg-white text-[#0F172A] rounded-3xl p-3.5 sm:p-5 border border-slate-200 shadow-sm relative select-none">
      {/* Top Header Navigation Bar */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#0F172A]">
            <Trophy className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Máx Nivel: {highLevel}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#1E3A8A]">
            <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Nivel: {level}</span>
          </div>
        </div>
      </div>

      {/* Start / Idle Screen */}
      {gameState === 'idle' && (
        <div className="py-8 px-4 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mb-4 shadow-sm border border-slate-800">
            <Shuffle className="w-8 h-8 text-white" />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E3A8A] mb-1">
            DESAFÍO TÁCTICO DE PARES 3D
          </span>
          <h2 className="text-2xl font-black text-[#0F172A] mb-2 tracking-tight">
            MEMORY CARDS: SHUFFLE & PAIRS
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
            Las tarjetas se muestran brevemente, luego se voltean y se revuelven entre muchas. Encuentra todos los pares antes de que expire el tiempo de la misión.
          </p>

          {/* Quick Rules Box */}
          <div className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-6 text-left space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
              <span>Vista previa rápida al inicio de cada ronda.</span>
            </div>
            <div className="flex items-center gap-2">
              <Shuffle className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
              <span>Las cartas se ocultan y se revuelven en el tablero.</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
              <span>Límite de tiempo: inicia con 7 minutos y disminuye.</span>
            </div>
          </div>

          <button
            onClick={initGame}
            className="w-full max-w-[260px] py-3.5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl font-black text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>INICIAR MISIÓN (7 MINUTOS)</span>
          </button>
        </div>
      )}

      {/* Active Game Layout: Preview, Shuffling, Playing */}
      {(gameState === 'preview' || gameState === 'shuffling' || gameState === 'playing') && (
        <div>
          {/* Status Header: Countdown & Target Counter */}
          <div className="mb-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            {gameState === 'preview' ? (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#1E3A8A] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 animate-pulse" />
                    <span>¡Memoriza las cartas! Se ocultarán en breve</span>
                  </span>
                  <span className="font-mono text-sm">{previewRemaining.toFixed(1)}s</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1E3A8A] transition-all duration-75 rounded-full"
                    style={{ width: `${previewPercent}%` }}
                  />
                </div>
              </div>
            ) : gameState === 'shuffling' ? (
              <div className="flex items-center justify-center gap-2 py-0.5 text-xs font-extrabold text-[#0F172A] animate-pulse">
                <Shuffle className="w-4 h-4 text-[#1E3A8A] animate-spin" />
                <span>Revolviendo y barajando posiciones...</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-bold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Clock className={`w-4 h-4 ${timeRemaining < 60 ? 'text-rose-600 animate-pulse' : 'text-[#1E3A8A]'}`} />
                    <span>Tiempo Restante:</span>
                    <span className={`font-mono text-sm font-black ${timeRemaining < 60 ? 'text-rose-600' : 'text-[#0F172A]'}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </span>

                  <span className="flex items-center gap-1 text-slate-600 font-mono text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    <span>Pares: {matchedPairsCount} / {totalPairsThisRound}</span>
                  </span>
                </div>

                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full ${
                      timeRemaining < 60 ? 'bg-rose-600' : 'bg-[#1E3A8A]'
                    }`}
                    style={{ width: `${timePercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cards Grid Container */}
          <div className={`grid ${currentConfig.gridCols} gap-2 mx-auto max-w-md`}>
            {cards.map((card) => {
              const isCardRevealed = card.isFlipped || card.isMatched;

              return (
                <div
                  key={card.instanceId}
                  onClick={() => handleCardClick(card.instanceId)}
                  role="button"
                  tabIndex={0}
                  style={{
                    perspective: '1000px',
                    transform: `translate(${card.shuffleOffset.x}px, ${card.shuffleOffset.y}px)`,
                    transition: gameState === 'shuffling' ? 'transform 0.4s ease-in-out' : 'transform 0.15s ease'
                  }}
                  className={`aspect-[3/4] cursor-pointer relative select-none rounded-2xl ${
                    card.isMatched ? 'opacity-85' : 'hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  {/* Card Flip Inner Wrapper */}
                  <div
                    className="w-full h-full relative"
                    style={{
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: isCardRevealed ? 'rotateY(0deg)' : 'rotateY(180deg)'
                    }}
                  >
                    {/* FRONT FACE: Shown when Flipped UP */}
                    <div
                      className={`absolute inset-0 w-full h-full rounded-2xl border-2 flex flex-col justify-between p-2 bg-white shadow-sm overflow-hidden ${
                        card.isMatched 
                          ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/30' 
                          : 'border-slate-300'
                      }`}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      {/* Top Row: Letter and Color Dot */}
                      <div className="flex items-center justify-between leading-none">
                        <span className="font-mono text-[11px] font-black bg-[#0F172A] text-white px-1.5 py-0.5 rounded-md">
                          {card.letter}
                        </span>
                        <div 
                          className="w-2.5 h-2.5 rounded-full shadow-xs border border-white"
                          style={{ backgroundColor: card.colorHex }}
                          title={card.colorName}
                        />
                      </div>

                      {/* Center: Tactical Vector Icon (NO EMOJIS) */}
                      <div 
                        className="my-auto mx-auto w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform"
                        style={{ backgroundColor: card.colorHex }}
                      >
                        {renderCardIcon(card.iconType, 'w-5 h-5 sm:w-6 sm:h-6')}
                      </div>

                      {/* Bottom: Word Stamped */}
                      <div className="text-center">
                        <span className="block text-[8px] sm:text-[9px] font-black tracking-wider text-[#0F172A] uppercase truncate font-mono">
                          {card.word}
                        </span>
                      </div>
                    </div>

                    {/* BACK FACE: Shown when Flipped DOWN */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-2xl border-2 border-[#1E3A8A] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] shadow-md flex flex-col items-center justify-center p-2 text-center overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      {/* Tactical Pattern corners */}
                      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#1E3A8A]" />
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#1E3A8A]" />
                      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[#1E3A8A]" />
                      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#1E3A8A]" />

                      <div className="w-8 h-8 rounded-full bg-[#1E3A8A]/40 border border-[#1E3A8A] flex items-center justify-center text-white mb-1 shadow-inner">
                        <ShieldAlert className="w-4 h-4 text-white" />
                      </div>

                      <span className="text-[8px] font-mono font-bold tracking-widest text-slate-300 uppercase">
                        SPYCT
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Level Hints / Tips */}
          <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-500 px-1 border-t border-slate-100 pt-2 font-mono">
            <span>Objetivo: Emparejar {totalPairsThisRound} cartas</span>
            <span>Ronda {level} &bull; Límite {Math.floor(initialTimeLimit / 60)}m</span>
          </div>
        </div>
      )}

      {/* Round Clear Modal Screen */}
      {gameState === 'round_clear' && (
        <div className="py-6 px-4 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 text-[#0F172A] flex items-center justify-center mb-3 shadow-xs">
            <Award className="w-8 h-8 text-[#1E3A8A]" />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E3A8A] mb-1">
            MISIÓN COMPLETADA
          </span>
          <h3 className="text-xl font-black text-[#0F172A] mb-1">
            ¡Nivel {level} Superado!
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs">
            Encontraste todos los pares a tiempo. El siguiente nivel tendrá más tarjetas, menor tiempo de vista y mayor exigencia.
          </p>

          {/* Coins Earned Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-4 w-full max-w-[260px] text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
              Recompensa Acumulada
            </span>
            <div className="flex items-center justify-center gap-1.5 text-xl font-black text-[#0F172A] font-mono">
              <Coins className="w-5 h-5 text-[#1E3A8A]" />
              <span>+{coinsEarned} Coins</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center justify-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Guardado en LocalStorage
            </span>
          </div>

          <button
            onClick={handleNextLevel}
            className="w-full max-w-[240px] py-3.5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl font-black text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>CONTINUAR AL NIVEL {level + 1}</span>
          </button>
        </div>
      )}

      {/* Game Over Screen (Time Expired / Lost) */}
      {gameState === 'gameover' && (
        <div className="py-6 px-4 text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3 shadow-xs">
            <XCircle className="w-7 h-7" />
          </div>

          <span className="text-[10px] font-mono font-bold tracking-widest text-rose-600 uppercase mb-1">
            TIEMPO AGOTADO
          </span>
          <h3 className="text-xl font-black text-[#0F172A] mb-1">
            ¡Misión Caducada!
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs">
            No lograste descubrir todos los pares antes de que el reloj llegara a cero. El desafío se reinicia desde el Nivel 1.
          </p>

          {/* Stats Box */}
          <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] mb-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Nivel Alcanzado</span>
              <span className="text-lg font-black font-mono text-[#0F172A]">{level}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Coins Totales</span>
              <span className="text-lg font-black font-mono text-[#1E3A8A] flex items-center justify-center gap-1">
                <Coins className="w-4 h-4 text-[#1E3A8A]" />
                +{coinsEarned}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-600 font-semibold mb-4 font-mono flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Tus Coins se mantuvieron en LocalStorage
          </p>

          <button
            onClick={initGame}
            className="w-full max-w-[240px] py-3.5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl font-black text-xs tracking-wider uppercase shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR DESDE NIVEL 1</span>
          </button>
        </div>
      )}
    </div>
  );
};
