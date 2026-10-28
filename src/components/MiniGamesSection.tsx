import React, { useState } from 'react';
import { 
  Gamepad2, 
  Layers, 
  Eye, 
  HelpCircle, 
  Rocket, 
  Dices,
  Coins, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { MiniGameId } from '../types';
import { StackGame } from './minigames/StackGame';
import { MemoryCardsGame } from './minigames/MemoryCardsGame';
import { SpaceShooterGame } from './minigames/SpaceShooterGame';
import { AnimeTriviaGame } from './minigames/AnimeTriviaGame';
import { DiceRollGame } from './minigames/DiceRollGame';

export const MiniGamesSection: React.FC = () => {
  const [activeGame, setActiveGame] = useState<MiniGameId | null>(null);

  const games = [
    {
      id: 'stack' as MiniGameId,
      name: 'Stack Apilador',
      subtitle: 'Apila bloques espaciales con máxima precisión',
      difficulty: 'Arcade',
      reward: '25 - 90 Coins',
      icon: Layers,
      highlight: true
    },
    {
      id: 'memory' as MiniGameId,
      name: 'Memory Cards 3D',
      subtitle: 'Vista rápida, barajado de cartas y búsqueda de pares',
      difficulty: 'Progresivo',
      reward: '20 - 120 Coins',
      icon: Eye,
      highlight: false
    },
    {
      id: 'space-shooter' as MiniGameId,
      name: 'Space Striker',
      subtitle: 'Pilota tu nave, esquiva minas y barreras láser',
      difficulty: 'Arcade',
      reward: '20 - 75 Coins',
      icon: Rocket,
      highlight: false
    },
    {
      id: 'trivia' as MiniGameId,
      name: 'Preguntas Generales',
      subtitle: '3 categorías: Cultura Pop / Anime, Videojuegos y Trivia',
      difficulty: 'Medio',
      reward: '45 - 80 Coins',
      icon: HelpCircle,
      highlight: false
    },
    {
      id: 'dice' as MiniGameId,
      name: 'Dice Roll',
      subtitle: 'Lanza el dado cósmico y prueba tu fortuna',
      difficulty: 'Fácil',
      reward: '15 - 40 Coins',
      icon: Dices,
      highlight: false
    }
  ];

  return (
    <div className="pb-24 pt-2 px-3 max-w-md mx-auto">
      {/* If a game is active, render it */}
      {activeGame === 'stack' && (
        <StackGame onBack={() => setActiveGame(null)} />
      )}
      {activeGame === 'memory' && (
        <MemoryCardsGame onBack={() => setActiveGame(null)} />
      )}
      {activeGame === 'space-shooter' && (
        <SpaceShooterGame onBack={() => setActiveGame(null)} />
      )}
      {activeGame === 'trivia' && (
        <AnimeTriviaGame onBack={() => setActiveGame(null)} />
      )}
      {activeGame === 'dice' && (
        <DiceRollGame onBack={() => setActiveGame(null)} />
      )}

      {/* Main Mini-Games List View */}
      {!activeGame && (
        <>
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shadow-xs">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                  Mini-Juegos Arcade
                </h1>
              </div>
            </div>
            <p className="text-xs text-slate-500 pl-10 font-normal">
              Juega y acumula Coins directos a tu LocalStorage para comprar personajes en la Tienda.
            </p>
          </div>

          {/* Featured Highlight: Stack Arcade */}
          <div 
            onClick={() => setActiveGame('stack')}
            role="button"
            tabIndex={0}
            className="mb-4 p-4 rounded-3xl bg-[#0F172A] text-white shadow-md border border-slate-800 cursor-pointer transition-all hover:border-[#1E3A8A] active:scale-98 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#1E3A8A] text-white flex items-center gap-1 shadow-xs border border-blue-900/60">
                <Sparkles className="w-3 h-3 fill-white" />
                NUEVO ARCADE: STACK
              </span>
              <div className="flex items-center gap-1 font-mono text-[11px] text-white font-bold bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg">
                <Coins className="w-3 h-3 text-[#1E3A8A] fill-[#1E3A8A]" />
                <span>Racha = Coins</span>
              </div>
            </div>

            <h3 className="text-base font-black text-white group-hover:text-blue-200 transition-colors">
              Stack Apilador Táctico
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Mecánica híbrida de apilado con iluminación 3D y botón 'TOCAR'. Cuadra los bloques sobre la base y no dejes caer la torre.
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-200 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700">
                Precisión & Reflejos
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-0.5">
                Jugar Ahora <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Games Cards List */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Catálogo de Desafíos
            </h2>

            {games.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.id}
                  onClick={() => setActiveGame(g.id)}
                  role="button"
                  tabIndex={0}
                  className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs hover:border-[#1E3A8A] hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-98"
                >
                  {/* Left Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#1E3A8A] transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Middle Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-100 text-[#0F172A] border-slate-300">
                        {g.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#1E3A8A] transition-colors">
                      {g.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mb-1.5">
                      {g.subtitle}
                    </p>

                    {/* Reward Estimate Badge */}
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[#0F172A] text-[10px] font-bold font-mono">
                      <Coins className="w-3 h-3 text-[#1E3A8A]" />
                      <span>{g.reward}</span>
                    </div>
                  </div>

                  {/* Right Action Chevron */}
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#0F172A] group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
