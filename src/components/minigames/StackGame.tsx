import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Coins, 
  Trophy, 
  Layers, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface Props {
  onBack: () => void;
}

interface StackBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  glowColor: string;
}

interface DebrisBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  vy: number;
  vx: number;
  rotation: number;
  vRot: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

const NEON_PALETTE = [
  { main: '#1E3A8A', glow: 'rgba(30, 58, 138, 0.5)', name: 'Azul Marino' },
  { main: '#0F172A', glow: 'rgba(15, 23, 42, 0.5)', name: 'Negro Táctico' },
  { main: '#1D4ED8', glow: 'rgba(29, 78, 216, 0.5)', name: 'Azul Zafiro' },
  { main: '#1E40AF', glow: 'rgba(30, 64, 175, 0.5)', name: 'Cobalto Deep' },
  { main: '#0284C7', glow: 'rgba(2, 132, 199, 0.5)', name: 'Azul Espacial' },
  { main: '#334155', glow: 'rgba(51, 65, 85, 0.5)', name: 'Pizarra Oscura' },
  { main: '#2563EB', glow: 'rgba(37, 99, 235, 0.5)', name: 'Azul Real' }
];

export const StackGame: React.FC<Props> = ({ onBack }) => {
  const { addCoins } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [streak, setStreak] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [highStreak, setHighStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem('spyct_stack_high_streak') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [perfectCombo, setPerfectCombo] = useState<number>(0);
  const [comboBanner, setComboBanner] = useState<string | null>(null);

  // References for mutable game loop state
  const BLOCK_HEIGHT = 26;
  const CANVAS_WIDTH = 340;
  const CANVAS_HEIGHT = 440;

  const stackRef = useRef<StackBlock[]>([]);
  const movingBlockRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    direction: number;
    color: string;
    glowColor: string;
  }>({
    x: 0,
    y: 80,
    width: 140,
    height: BLOCK_HEIGHT,
    speed: 3.2,
    direction: 1,
    color: NEON_PALETTE[0].main,
    glowColor: NEON_PALETTE[0].glow
  });

  const debrisRef = useRef<DebrisBlock[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cameraOffsetRef = useRef<number>(0);
  const targetCameraOffsetRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const streakRef = useRef<number>(0);
  const perfectComboRef = useRef<number>(0);

  const initGame = useCallback(() => {
    streakRef.current = 0;
    perfectComboRef.current = 0;
    setStreak(0);
    setCoinsEarned(0);
    setPerfectCombo(0);
    setComboBanner(null);

    const baseWidth = 150;
    const baseX = (CANVAS_WIDTH - baseWidth) / 2;
    const baseY = CANVAS_HEIGHT - 60;

    // Initial base block
    stackRef.current = [
      {
        x: baseX,
        y: baseY,
        width: baseWidth,
        height: BLOCK_HEIGHT,
        color: NEON_PALETTE[0].main,
        glowColor: NEON_PALETTE[0].glow
      }
    ];

    debrisRef.current = [];
    particlesRef.current = [];
    cameraOffsetRef.current = 0;
    targetCameraOffsetRef.current = 0;

    // Moving block spawn
    const firstMovingColor = NEON_PALETTE[1 % NEON_PALETTE.length];
    movingBlockRef.current = {
      x: 0,
      y: baseY - BLOCK_HEIGHT,
      width: baseWidth,
      height: BLOCK_HEIGHT,
      speed: 3.2,
      direction: 1,
      color: firstMovingColor.main,
      glowColor: firstMovingColor.glow
    };

    setGameState('playing');
  }, []);

  const triggerDrop = useCallback(() => {
    if (gameState !== 'playing') return;

    const currentStack = stackRef.current;
    if (currentStack.length === 0) return;

    const topBlock = currentStack[currentStack.length - 1];
    const moving = movingBlockRef.current;

    // Calculate overlap
    const overlapLeft = Math.max(moving.x, topBlock.x);
    const overlapRight = Math.min(moving.x + moving.width, topBlock.x + topBlock.width);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      // Missed completely -> Game Over
      const finalStreak = streakRef.current;
      // Award streak coins: at least 2 coins per block
      const rewardCoins = Math.max(5, finalStreak * 3);
      setCoinsEarned(rewardCoins);
      addCoins(rewardCoins, 'Stack Arcade');

      if (finalStreak > highStreak) {
        setHighStreak(finalStreak);
        try {
          localStorage.setItem('spyct_stack_high_streak', String(finalStreak));
        } catch {
          // ignore
        }
      }

      // Drop entire block as debris
      debrisRef.current.push({
        x: moving.x,
        y: moving.y,
        width: moving.width,
        height: moving.height,
        color: moving.color,
        vy: 2,
        vx: moving.direction * 1.5,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.15,
        alpha: 1
      });

      setGameState('gameover');
      return;
    }

    // Check for near-perfect alignment (within 3 pixels tolerance)
    const diff = Math.abs(moving.x - topBlock.x);
    const isPerfect = diff <= 3.5;

    let newWidth = overlapWidth;
    let newX = overlapLeft;

    if (isPerfect) {
      // Perfect placement: preserve previous full width and reward combo
      newWidth = topBlock.width;
      newX = topBlock.x;
      perfectComboRef.current += 1;
      setPerfectCombo(perfectComboRef.current);
      setComboBanner(`¡PERFECTO! x${perfectComboRef.current}`);

      // Sparkles in bright blue / white
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push({
          x: newX + Math.random() * newWidth,
          y: moving.y + BLOCK_HEIGHT / 2,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: Math.random() > 0.5 ? '#38BDF8' : '#FFFFFF',
          life: 25,
          maxLife: 25,
          size: Math.random() * 3 + 2
        });
      }
    } else {
      perfectComboRef.current = 0;
      setPerfectCombo(0);
      setComboBanner(null);

      // Slice off debris
      if (moving.x < topBlock.x) {
        // Cut on the left side
        const debrisWidth = topBlock.x - moving.x;
        debrisRef.current.push({
          x: moving.x,
          y: moving.y,
          width: debrisWidth,
          height: BLOCK_HEIGHT,
          color: moving.color,
          vy: 2,
          vx: -1.8,
          rotation: 0,
          vRot: -0.06,
          alpha: 1
        });
      } else {
        // Cut on the right side
        const debrisWidth = (moving.x + moving.width) - (topBlock.x + topBlock.width);
        debrisRef.current.push({
          x: topBlock.x + topBlock.width,
          y: moving.y,
          width: debrisWidth,
          height: BLOCK_HEIGHT,
          color: moving.color,
          vy: 2,
          vx: 1.8,
          rotation: 0,
          vRot: 0.06,
          alpha: 1
        });
      }

      // Sparks at slice point
      for (let i = 0; i < 10; i++) {
        particlesRef.current.push({
          x: moving.x > topBlock.x ? topBlock.x + topBlock.width : topBlock.x,
          y: moving.y + BLOCK_HEIGHT / 2,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: moving.color,
          life: 18,
          maxLife: 18,
          size: Math.random() * 2 + 1.5
        });
      }
    }

    // Add successfully placed block to stack
    const newPlacedBlock: StackBlock = {
      x: newX,
      y: moving.y,
      width: newWidth,
      height: BLOCK_HEIGHT,
      color: moving.color,
      glowColor: moving.glowColor
    };
    currentStack.push(newPlacedBlock);

    streakRef.current += 1;
    setStreak(streakRef.current);

    // Camera follow: if tower reaches middle, smoothly offset camera
    const totalTowerHeight = currentStack.length * BLOCK_HEIGHT;
    if (totalTowerHeight > CANVAS_HEIGHT * 0.45) {
      targetCameraOffsetRef.current = totalTowerHeight - (CANVAS_HEIGHT * 0.45);
    }

    // Prepare next moving block
    const nextLevel = currentStack.length;
    const nextPalette = NEON_PALETTE[nextLevel % NEON_PALETTE.length];
    const nextY = newPlacedBlock.y - BLOCK_HEIGHT;
    
    // Smooth speed scaling based on human reaction limits (3.2 to 5.4 max)
    const nextSpeed = Math.min(3.2 + streakRef.current * 0.12, 5.4);
    const startDirection = streakRef.current % 2 === 0 ? 1 : -1;
    const startX = startDirection === 1 ? -newWidth : CANVAS_WIDTH;

    movingBlockRef.current = {
      x: startX,
      y: nextY,
      width: newWidth,
      height: BLOCK_HEIGHT,
      speed: nextSpeed,
      direction: startDirection,
      color: nextPalette.main,
      glowColor: nextPalette.glow
    };
  }, [gameState, addCoins, highStreak]);

  // Main Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      // 1. Smooth camera interpolation
      cameraOffsetRef.current += (targetCameraOffsetRef.current - cameraOffsetRef.current) * 0.1;

      // 2. Clear & Draw Crisp White Canvas Background with subtle grid
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // White Canvas Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle Perspective Grid Lines in cool slate
      ctx.save();
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      for (let x = 20; x < CANVAS_WIDTH; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 30) {
        const adjustedY = (y + cameraOffsetRef.current * 0.5) % CANVAS_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, adjustedY);
        ctx.lineTo(CANVAS_WIDTH, adjustedY);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      // Apply Camera Offset
      ctx.translate(0, cameraOffsetRef.current);

      // 3. Draw Placed Blocks with 3D Bevel & Metallic Blue/Black Fill
      stackRef.current.forEach((block, idx) => {
        ctx.save();
        
        // Glow effect
        ctx.shadowColor = block.glowColor;
        ctx.shadowBlur = idx === stackRef.current.length - 1 ? 14 : 6;

        // Block Body Gradient
        const blockGrad = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
        blockGrad.addColorStop(0, '#FFFFFF');
        blockGrad.addColorStop(0.2, block.color);
        blockGrad.addColorStop(0.85, block.color);
        blockGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = blockGrad;

        // Rounded Block
        const rad = 4;
        ctx.beginPath();
        ctx.roundRect(block.x, block.y, block.width, block.height, rad);
        ctx.fill();

        // 3D Top Bevel Highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fillRect(block.x + 2, block.y + 1, block.width - 4, 2.5);

        // Border Outline
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      });

      // 4. Update & Draw Moving Block (if playing)
      if (gameState === 'playing') {
        const mb = movingBlockRef.current;
        mb.x += mb.speed * mb.direction;

        // Bounce horizontally
        if (mb.x + mb.width >= CANVAS_WIDTH + 20) {
          mb.direction = -1;
        } else if (mb.x <= -20) {
          mb.direction = 1;
        }

        ctx.save();
        ctx.shadowColor = mb.glowColor;
        ctx.shadowBlur = 12;

        const mGrad = ctx.createLinearGradient(mb.x, mb.y, mb.x, mb.y + mb.height);
        mGrad.addColorStop(0, '#FFFFFF');
        mGrad.addColorStop(0.25, mb.color);
        mGrad.addColorStop(0.85, mb.color);
        mGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = mGrad;

        ctx.beginPath();
        ctx.roundRect(mb.x, mb.y, mb.width, mb.height, 4);
        ctx.fill();

        // Top Highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fillRect(mb.x + 2, mb.y + 1, mb.width - 4, 3);

        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.restore();
      }

      // 5. Update & Draw Falling Debris
      debrisRef.current.forEach((deb) => {
        deb.y += deb.vy;
        deb.x += deb.vx;
        deb.vy += 0.35; // gravity
        deb.rotation += deb.vRot;
        deb.alpha -= 0.015;

        if (deb.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, deb.alpha);
          ctx.translate(deb.x + deb.width / 2, deb.y + deb.height / 2);
          ctx.rotate(deb.rotation);
          ctx.fillStyle = deb.color;
          ctx.fillRect(-deb.width / 2, -deb.height / 2, deb.width, deb.height);
          ctx.restore();
        }
      });
      debrisRef.current = debrisRef.current.filter(d => d.alpha > 0 && d.y < CANVAS_HEIGHT + 200);

      // 6. Update & Draw Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        const alpha = Math.max(0, p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [gameState]);

  // Keyboard shortcut: Space / Enter / ArrowDown triggers drop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (gameState === 'playing') {
          triggerDrop();
        } else if (gameState === 'idle' || gameState === 'gameover') {
          initGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, triggerDrop, initGame]);

  return (
    <div className="bg-white text-[#0F172A] rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden select-none">
      {/* Top Header Bar */}
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
            <span>Récord: {highStreak}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#1E3A8A]">
            <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Pila: {streak}</span>
          </div>
        </div>
      </div>

      {/* Floating Combo / Perfect Banner */}
      {comboBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#0F172A] text-white shadow-lg border border-[#1E3A8A] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            {comboBanner}
          </span>
        </div>
      )}

      {/* Game Canvas Container - Responsive for all mobile/desktop sizes */}
      <div 
        onClick={gameState === 'playing' ? triggerDrop : undefined}
        className="relative mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm bg-white cursor-pointer w-full max-w-[340px] aspect-[340/440]"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full block"
        />

        {/* Start / Idle Screen Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center mb-3 shadow-sm border border-slate-800">
              <Layers className="w-7 h-7 text-white" />
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E3A8A] mb-1">
              ARCADE DE PRECISIÓN 3D
            </span>
            <h2 className="text-2xl font-black tracking-tight text-[#0F172A] mb-2">
              STACK APILADOR
            </h2>
            <p className="text-xs text-slate-500 max-w-[240px] mb-5 leading-relaxed">
              Apila bloques con máxima precisión. Presiona el botón o toca la pantalla para soltar el bloque sobre la base.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                initGame();
              }}
              className="w-full max-w-[220px] py-3 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl font-black text-sm tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>INICIAR DESAFÍO</span>
            </button>
          </div>
        )}

        {/* Game Over Modal Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-2 shadow-xs">
              <Layers className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-[#0F172A] mb-1">
              ¡Torre Desalineada!
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              El bloque no cayó sobre la pila.
            </p>

            {/* Score & Coins Summary */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-[240px] mb-4">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Racha Final</span>
                <span className="text-base font-black font-mono text-[#0F172A]">{streak}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Coins Ganados</span>
                <span className="text-base font-black font-mono text-[#1E3A8A] flex items-center justify-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  +{coinsEarned}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-600 font-semibold mb-4 font-mono flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Monedas sumadas al LocalStorage
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                initGame();
              }}
              className="w-full max-w-[220px] py-3 bg-[#0F172A] hover:bg-[#1E3A8A] text-white rounded-2xl font-black text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>JUGAR DE NUEVO</span>
            </button>
          </div>
        )}
      </div>

      {/* FIXED HIGHLIGHTED "TOCAR" BUTTON - BLUE & BLACK THEME */}
      <div className="mt-3 max-w-[340px] mx-auto">
        <button
          type="button"
          onClick={gameState === 'playing' ? triggerDrop : initGame}
          className="w-full py-3.5 bg-gradient-to-b from-[#1E3A8A] to-[#0F172A] active:from-[#172554] active:to-[#020617] text-white font-black text-sm tracking-wider uppercase rounded-2xl shadow-[0_5px_0_#020617,0_8px_16px_rgba(15,23,42,0.25)] active:translate-y-1 active:shadow-[0_2px_0_#020617] transition-all flex items-center justify-center gap-2 border-t-2 border-blue-400/30"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
          <span>TOCAR</span>
        </button>
        <span className="text-[10px] text-slate-500 text-center block mt-1.5 font-medium">
          Toca el botón o cualquier parte de la pantalla para soltar el bloque
        </span>
      </div>
    </div>
  );
};
