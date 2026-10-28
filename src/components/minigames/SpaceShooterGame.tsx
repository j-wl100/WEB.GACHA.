import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, 
  Coins, 
  ArrowLeft, 
  RotateCcw, 
  Shield, 
  Zap, 
  Crosshair, 
  Trophy,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface Props {
  onBack: () => void;
}

interface Bullet {
  x: number;
  y: number;
  isPlayer: boolean;
  speed: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  hp: number;
  maxHp: number;
  type: 'drone' | 'asteroid' | 'cruiser';
  shootCooldown: number;
  vx?: number;
}

// New Obstacle types that appear as player advances:
interface Obstacle {
  id: number;
  type: 'mine' | 'laser-barrier' | 'debris';
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  gapX?: number;
  gapWidth?: number;
  blinkTimer?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'triple' | 'shield';
  speed: number;
}

export const SpaceShooterGame: React.FC<Props> = ({ onBack }) => {
  const { addCoins } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [sectorLevel, setSectorLevel] = useState(1);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [hasShield, setHasShield] = useState(false);
  const [sectorAlert, setSectorAlert] = useState<string | null>(null);

  // References for game loop
  const playerRef = useRef({
    x: 144,
    y: 390,
    width: 32,
    height: 36,
    speed: 6.0,
    movingLeft: false,
    movingRight: false,
    shooting: false,
    shootCooldown: 0,
    invincibleTimer: 0
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const starsRef = useRef<{ x: number; y: number; speed: number; size: number }[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const livesRef = useRef(3);
  const shieldRef = useRef(false);
  const tripleShotRef = useRef(0);

  // Background stars
  useEffect(() => {
    starsRef.current = Array.from({ length: 45 }, () => ({
      x: Math.random() * 320,
      y: Math.random() * 460,
      speed: 0.6 + Math.random() * 1.5,
      size: Math.random() * 2 + 1
    }));
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setSectorLevel(1);
    setCoinsEarned(0);
    setLives(3);
    setHasShield(false);
    setSectorAlert('Sector 1: Despegue Táctico');

    scoreRef.current = 0;
    distanceRef.current = 0;
    livesRef.current = 3;
    shieldRef.current = false;
    tripleShotRef.current = 0;

    playerRef.current = {
      x: 144,
      y: 390,
      width: 32,
      height: 36,
      speed: 6.0,
      movingLeft: false,
      movingRight: false,
      shooting: false,
      shootCooldown: 0,
      invincibleTimer: 0
    };

    bulletsRef.current = [];
    enemiesRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        playerRef.current.movingLeft = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        playerRef.current.movingRight = true;
      }
      if (e.key === ' ' || e.key === 'ArrowUp') {
        playerRef.current.shooting = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        playerRef.current.movingLeft = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        playerRef.current.movingRight = false;
      }
      if (e.key === ' ' || e.key === 'ArrowUp') {
        playerRef.current.shooting = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let enemySpawnCounter = 0;
    let obstacleSpawnCounter = 0;

    const gameLoop = () => {
      frameCount++;
      enemySpawnCounter++;
      obstacleSpawnCounter++;

      // Increase distance travelled
      distanceRef.current += 1.2;
      const curDist = Math.floor(distanceRef.current);
      setDistance(curDist);

      // Check Sector Progression
      const currentSector = Math.floor(curDist / 400) + 1;
      setSectorLevel(currentSector);

      if (curDist === 400) {
        setSectorAlert('Sector 2: Alerta de Minas Espaciales');
      } else if (curDist === 800) {
        setSectorAlert('Sector 3: Barreras Láser Activas');
      } else if (curDist === 1300) {
        setSectorAlert('Sector 4: Campo Denso de Escombros');
      }

      const p = playerRef.current;

      // Fair player core hitbox (forgiving margins centered within ship for genuine skill-based maneuvering)
      const hitMarginX = 8;
      const hitMarginY = 7;
      const pHitX = p.x + hitMarginX;
      const pHitW = p.width - (hitMarginX * 2); // 16px wide core
      const pHitY = p.y + hitMarginY;
      const pHitH = p.height - (hitMarginY * 2); // 22px tall core

      // 1. Move Player
      if (p.movingLeft) p.x = Math.max(8, p.x - p.speed);
      if (p.movingRight) p.x = Math.min(canvas.width - p.width - 8, p.x + p.speed);

      if (p.invincibleTimer > 0) p.invincibleTimer--;
      if (p.shootCooldown > 0) p.shootCooldown--;
      if (tripleShotRef.current > 0) tripleShotRef.current--;

      // Shoot
      if ((p.shooting || frameCount % 12 === 0) && p.shootCooldown <= 0) {
        if (tripleShotRef.current > 0) {
          bulletsRef.current.push(
            { x: p.x + p.width / 2, y: p.y, isPlayer: true, speed: 7 },
            { x: p.x + p.width / 2 - 8, y: p.y + 4, isPlayer: true, speed: 6.5 },
            { x: p.x + p.width / 2 + 8, y: p.y + 4, isPlayer: true, speed: 6.5 }
          );
        } else {
          bulletsRef.current.push({
            x: p.x + p.width / 2,
            y: p.y,
            isPlayer: true,
            speed: 7.5
          });
        }
        p.shootCooldown = 9;
      }

      // 2. Spawn Enemies at human-playable cadence (skill-based spacing)
      const enemySpawnThreshold = Math.max(55, 85 - currentSector * 4);
      if (enemySpawnCounter > enemySpawnThreshold) {
        enemySpawnCounter = 0;
        const randType = Math.random();
        let type: 'drone' | 'asteroid' | 'cruiser' = 'drone';
        let size = 22;
        let hp = 1;
        let speed = 1.3 + Math.random() * 0.5;

        if (randType > 0.8) {
          type = 'cruiser';
          size = 28;
          hp = 2;
          speed = 0.95;
        } else if (randType > 0.5) {
          type = 'asteroid';
          size = 24;
          hp = 2;
          speed = 1.3 + Math.random() * 0.4;
        }

        enemiesRef.current.push({
          id: Date.now() + Math.random(),
          x: Math.random() * (canvas.width - size - 24) + 12,
          y: -size,
          size,
          speed: speed + (currentSector > 2 ? 0.2 : 0),
          hp,
          maxHp: hp,
          type,
          shootCooldown: Math.floor(Math.random() * 60) + 70,
          vx: type === 'drone' && currentSector >= 2 ? (Math.random() > 0.5 ? 0.8 : -0.8) : 0
        });
      }

      // 3. SPAWN OBSTACLES WITH FAIR SPACING AND MANEUVERABLE SPEEDS
      if (curDist >= 450) {
        const obstacleSpawnThreshold = Math.max(125, 185 - currentSector * 8);
        if (obstacleSpawnCounter > obstacleSpawnThreshold) {
          obstacleSpawnCounter = 0;

          // Decide obstacle type based on distance
          const rand = Math.random();
          if (curDist >= 900 && rand > 0.55) {
            // LASER BARRIER GATE: Generous passable gap (105px) allowing plenty of room for normal human reaction
            const gapWidth = 105;
            const gapX = Math.random() * (canvas.width - gapWidth - 28) + 14;
            obstaclesRef.current.push({
              id: Date.now() + Math.random(),
              type: 'laser-barrier',
              x: 0,
              y: -20,
              width: canvas.width,
              height: 12,
              speed: 1.05 + (currentSector * 0.08),
              gapX,
              gapWidth
            });
          } else if (curDist >= 600 && rand > 0.3) {
            // FLOATING EXPLOSIVE MINE: Slow glide, destroyable with shots
            obstaclesRef.current.push({
              id: Date.now() + Math.random(),
              type: 'mine',
              x: Math.random() * (canvas.width - 44) + 12,
              y: -25,
              width: 22,
              height: 22,
              speed: 0.95 + Math.random() * 0.3,
              blinkTimer: 0
            });
          } else {
            // SLOW DRIFTING DEBRIS
            obstaclesRef.current.push({
              id: Date.now() + Math.random(),
              type: 'debris',
              x: Math.random() * (canvas.width - 50) + 10,
              y: -30,
              width: 38,
              height: 24,
              speed: 1.15 + Math.random() * 0.25
            });
          }
        }
      }

      // 4. Update Stars (subtle dark dots on clean white canvas)
      starsRef.current.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      // 5. Update Bullets
      bulletsRef.current.forEach(b => {
        b.y += b.isPlayer ? -b.speed : b.speed;
      });
      bulletsRef.current = bulletsRef.current.filter(b => b.y > -20 && b.y < canvas.height + 20);

      // 6. Update PowerUps
      powerUpsRef.current.forEach(pw => {
        pw.y += pw.speed;
        if (
          pw.x > p.x - 12 &&
          pw.x < p.x + p.width + 12 &&
          pw.y > p.y - 12 &&
          pw.y < p.y + p.height + 12
        ) {
          if (pw.type === 'shield') {
            shieldRef.current = true;
            setHasShield(true);
          } else if (pw.type === 'triple') {
            tripleShotRef.current = 400;
          }
          scoreRef.current += 50;
          setScore(scoreRef.current);
          pw.y = canvas.height + 100;
        }
      });
      powerUpsRef.current = powerUpsRef.current.filter(pw => pw.y < canvas.height + 10);

      // 7. Update Obstacles & Collision with Player
      obstaclesRef.current.forEach(obs => {
        obs.y += obs.speed;
        if (obs.blinkTimer !== undefined) obs.blinkTimer++;

        // Collision logic using player core hitbox
        if (p.invincibleTimer <= 0) {
          if (obs.type === 'laser-barrier') {
            // Hits if player is within barrier Y and OUTSIDE the gap
            if (
              pHitY + pHitH > obs.y + 2 &&
              pHitY < obs.y + obs.height - 2
            ) {
              const inGap = pHitX >= obs.gapX! && (pHitX + pHitW) <= (obs.gapX! + obs.gapWidth!);
              if (!inGap) {
                takePlayerDamage();
              }
            }
          } else {
            // Mine or Debris box collision with fair margins
            const margin = obs.type === 'mine' ? 3 : 4;
            if (
              pHitX < obs.x + obs.width - margin &&
              pHitX + pHitW > obs.x + margin &&
              pHitY < obs.y + obs.height - margin &&
              pHitY + pHitH > obs.y + margin
            ) {
              takePlayerDamage();
            }
          }
        }

        // Bullets hitting obstacles
        bulletsRef.current.forEach(b => {
          if (b.isPlayer && obs.type === 'mine') {
            if (
              b.x > obs.x &&
              b.x < obs.x + obs.width &&
              b.y > obs.y &&
              b.y < obs.y + obs.height
            ) {
              b.y = -100;
              obs.y = canvas.height + 100; // detonate
              scoreRef.current += 30;
              setScore(scoreRef.current);

              // Shrapnel explosion
              for (let i = 0; i < 8; i++) {
                particlesRef.current.push({
                  x: obs.x + obs.width / 2,
                  y: obs.y + obs.height / 2,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  life: 18,
                  color: '#1E3A8A'
                });
              }
            }
          }
        });
      });
      obstaclesRef.current = obstaclesRef.current.filter(obs => obs.y < canvas.height + 50);

      // 8. Update Enemies
      enemiesRef.current.forEach(enemy => {
        enemy.y += enemy.speed;
        if (enemy.vx) {
          enemy.x += enemy.vx;
          if (enemy.x <= 10 || enemy.x >= canvas.width - enemy.size - 10) {
            enemy.vx *= -1;
          }
        }

        if (enemy.type === 'cruiser') {
          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0) {
            enemy.shootCooldown = 135; // Generous interval for dodging
            bulletsRef.current.push({
              x: enemy.x + enemy.size / 2,
              y: enemy.y + enemy.size,
              isPlayer: false,
              speed: 2.2
            });
          }
        }

        // Bullet hit enemy
        bulletsRef.current.forEach(bullet => {
          if (bullet.isPlayer) {
            if (
              bullet.x > enemy.x &&
              bullet.x < enemy.x + enemy.size &&
              bullet.y > enemy.y &&
              bullet.y < enemy.y + enemy.size
            ) {
              enemy.hp--;
              bullet.y = -100;

              for (let i = 0; i < 4; i++) {
                particlesRef.current.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 15,
                  color: '#1E3A8A'
                });
              }

              if (enemy.hp <= 0) {
                scoreRef.current += enemy.type === 'cruiser' ? 60 : enemy.type === 'asteroid' ? 30 : 20;
                setScore(scoreRef.current);

                if (Math.random() < 0.15) {
                  powerUpsRef.current.push({
                    x: enemy.x + enemy.size / 2,
                    y: enemy.y,
                    type: Math.random() > 0.5 ? 'triple' : 'shield',
                    speed: 2
                  });
                }

                for (let i = 0; i < 10; i++) {
                  particlesRef.current.push({
                    x: enemy.x + enemy.size / 2,
                    y: enemy.y + enemy.size / 2,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    life: 20,
                    color: '#0F172A'
                  });
                }
              }
            }
          }
        });

        // Enemy collision with player core
        if (
          p.invincibleTimer <= 0 &&
          enemy.hp > 0 &&
          enemy.x + enemy.size - 4 > pHitX &&
          enemy.x + 4 < pHitX + pHitW &&
          enemy.y + enemy.size - 4 > pHitY &&
          enemy.y + 4 < pHitY + pHitH
        ) {
          enemy.hp = 0;
          takePlayerDamage();
        }
      });

      // Enemy bullet hit player core
      bulletsRef.current.forEach(bullet => {
        if (!bullet.isPlayer && p.invincibleTimer <= 0) {
          if (
            bullet.x > pHitX &&
            bullet.x < pHitX + pHitW &&
            bullet.y > pHitY &&
            bullet.y < pHitY + pHitH
          ) {
            bullet.y = canvas.height + 100;
            takePlayerDamage();
          }
        }
      });

      enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0 && e.y < canvas.height + 50);

      // 9. Particles
      particlesRef.current.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
      });
      particlesRef.current = particlesRef.current.filter(pt => pt.life > 0);

      // --- RENDER STAGE (CLEAN WHITE / OFF-WHITE CANVAS WITH BLACK & DARK NAVY DETAILS) ---
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid lines (dark navy very low opacity)
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Stars (subtle dark dots)
      starsRef.current.forEach(star => {
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Draw Obstacles
      obstaclesRef.current.forEach(obs => {
        ctx.save();
        if (obs.type === 'laser-barrier') {
          // Dark blue pulsating laser beam with gap
          ctx.fillStyle = '#1E3A8A';
          // Left segment
          ctx.fillRect(0, obs.y, obs.gapX!, obs.height);
          // Right segment
          const rightStart = obs.gapX! + obs.gapWidth!;
          ctx.fillRect(rightStart, obs.y, canvas.width - rightStart, obs.height);

          // Gap guide indicators
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.gapX!, obs.y - 2, obs.gapWidth!, obs.height + 4);
        } else if (obs.type === 'mine') {
          // Floating Spiked Mine in Black & Dark Blue
          const cx = obs.x + obs.width / 2;
          const cy = obs.y + obs.height / 2;
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.arc(cx, cy, obs.width / 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Spikes
          ctx.strokeStyle = '#1E3A8A';
          ctx.lineWidth = 2;
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * (obs.width / 3), cy + Math.sin(angle) * (obs.height / 3));
            ctx.lineTo(cx + Math.cos(angle) * (obs.width / 1.8), cy + Math.sin(angle) * (obs.height / 1.8));
            ctx.stroke();
          }

          // Blinking center core
          ctx.fillStyle = obs.blinkTimer! % 20 < 10 ? '#1E3A8A' : '#0F172A';
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Debris Wall
          ctx.fillStyle = '#334155';
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw PowerUps (Black & Dark Blue circles)
      powerUpsRef.current.forEach(pw => {
        ctx.save();
        ctx.fillStyle = '#1E3A8A';
        ctx.beginPath();
        ctx.arc(pw.x, pw.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(pw.type === 'shield' ? 'S' : '3X', pw.x - 5, pw.y + 3);
        ctx.restore();
      });

      // Draw Bullets (Dark Blue)
      bulletsRef.current.forEach(b => {
        ctx.save();
        if (b.isPlayer) {
          ctx.fillStyle = '#1E3A8A';
          ctx.fillRect(b.x - 2, b.y, 4, 12);
        } else {
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Draw Enemies (Black & Dark Navy)
      enemiesRef.current.forEach(e => {
        ctx.save();
        if (e.type === 'asteroid') {
          ctx.fillStyle = '#475569';
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x + e.size / 2, e.y + e.size / 2, e.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (e.type === 'cruiser') {
          ctx.fillStyle = '#0F172A';
          ctx.strokeStyle = '#1E3A8A';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(e.x + e.size / 2, e.y + e.size);
          ctx.lineTo(e.x + e.size, e.y);
          ctx.lineTo(e.x, e.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Drone
          ctx.fillStyle = '#1E3A8A';
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(e.x + e.size / 2, e.y + e.size);
          ctx.lineTo(e.x + e.size, e.y + e.size * 0.3);
          ctx.lineTo(e.x, e.y + e.size * 0.3);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw Player Ship (Black Body with Dark Navy Wings)
      if (p.invincibleTimer % 4 < 2) {
        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

        // Thruster flame (Dark Blue)
        ctx.fillStyle = '#1E3A8A';
        ctx.beginPath();
        ctx.moveTo(-5, p.height / 2);
        ctx.lineTo(5, p.height / 2);
        ctx.lineTo(0, p.height / 2 + 8 + (frameCount % 4) * 2);
        ctx.closePath();
        ctx.fill();

        // Ship hull
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#1E3A8A';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 2);
        ctx.lineTo(p.width / 2, p.height / 2);
        ctx.lineTo(0, p.height / 3);
        ctx.lineTo(-p.width / 2, p.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit in Dark Blue
        ctx.fillStyle = '#1E3A8A';
        ctx.beginPath();
        ctx.ellipse(0, -2, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shield circle if active
        if (shieldRef.current) {
          ctx.strokeStyle = '#1E3A8A';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, p.width * 0.9, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Draw Particles
      particlesRef.current.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 2.5, 2.5);
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState]);

  const takePlayerDamage = () => {
    if (shieldRef.current) {
      shieldRef.current = false;
      setHasShield(false);
      playerRef.current.invincibleTimer = 45;
      return;
    }

    livesRef.current--;
    setLives(livesRef.current);
    playerRef.current.invincibleTimer = 70; // 1.15 seconds of recovery invincibility

    if (livesRef.current <= 0) {
      setGameState('gameover');
      const finalScore = scoreRef.current;
      const finalDist = Math.floor(distanceRef.current);
      const reward = Math.max(10, Math.floor((finalScore + finalDist) / 25));
      setCoinsEarned(reward);
      addCoins(reward, 'Space Striker');

      if (finalScore > highScore) {
        setHighScore(finalScore);
      }
    }
  };

  return (
    <div className="bg-white text-[#0F172A] rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-md relative overflow-hidden flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-3 z-10">
        <button
          onClick={onBack}
          className="px-2.5 py-1.5 text-slate-700 hover:text-black rounded-xl bg-slate-100 text-xs font-bold flex items-center gap-1 border border-slate-200 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-700" /> Volver
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#1E3A8A]">
            <Compass className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>{distance}m</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-900">
            <Trophy className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>{score} pts</span>
          </div>

          <div className="flex items-center gap-0.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Rocket
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < lives ? 'text-[#1E3A8A] fill-[#1E3A8A]' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-[320px] h-[430px] rounded-2xl overflow-hidden border-2 border-slate-300 shadow-sm bg-white flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={320}
          height={430}
          className="w-full h-full block"
        />

        {/* Sector Alert Toast */}
        {gameState === 'playing' && sectorAlert && (
          <div className="absolute top-2 left-2 right-2 p-1.5 bg-[#0F172A]/90 text-white rounded-lg text-center text-[10px] font-bold font-mono tracking-wide animate-in fade-in duration-200 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#1E3A8A]" />
            <span>{sectorAlert}</span>
          </div>
        )}

        {/* Start Screen Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shadow-md">
              <Rocket className="w-7 h-7 text-white" />
            </div>

            <div>
              <h2 className="text-lg font-black tracking-tight text-[#0F172A]">
                Space Striker SPYCT
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                Pilota tu nave espacial. Conforme avances aparecerán <strong>minas espaciales</strong> y <strong>barreras láser</strong> que deberás esquivar.
              </p>
            </div>

            <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-mono text-[#1E3A8A] font-bold">
              Obstáculos Progresivos + Recompensa en Coins
            </div>

            <button
              onClick={startGame}
              className="w-full py-3 bg-[#0F172A] hover:bg-[#1E3A8A] text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>DESPEGAR Y JUGAR</span>
            </button>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center">
              <Rocket className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-[#0F172A]">
              MISIÓN FINALIZADA
            </h3>

            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between px-6 text-slate-600">
                <span>Distancia recorrida:</span>
                <strong className="text-slate-900">{distance}m</strong>
              </div>
              <div className="flex justify-between px-6 text-slate-600">
                <span>Puntos de combate:</span>
                <strong className="text-[#1E3A8A]">{score} pts</strong>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#1E3A8A]">
              <Coins className="w-4 h-4 text-[#1E3A8A]" />
              <span>+{coinsEarned} Coins ganadas</span>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={startGame}
                className="py-2.5 bg-[#0F172A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Jugar Otra Vez
              </button>
              <button
                onClick={onBack}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Controls (Black and Dark Navy) */}
      {gameState === 'playing' && (
        <div className="w-[320px] mt-3 flex items-center justify-between gap-2 z-10 select-none">
          {/* Left Arrow Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); playerRef.current.movingLeft = true; }}
            onTouchEnd={(e) => { e.preventDefault(); playerRef.current.movingLeft = false; }}
            onMouseDown={() => { playerRef.current.movingLeft = true; }}
            onMouseUp={() => { playerRef.current.movingLeft = false; }}
            className="flex-1 h-13 bg-slate-100 active:bg-slate-200 text-[#0F172A] rounded-2xl border border-slate-300 flex items-center justify-center transition-colors shadow-xs active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 text-[#0F172A]" />
          </button>

          {/* Fire / Shoot Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); playerRef.current.shooting = true; }}
            onTouchEnd={(e) => { e.preventDefault(); playerRef.current.shooting = false; }}
            onMouseDown={() => { playerRef.current.shooting = true; }}
            onMouseUp={() => { playerRef.current.shooting = false; }}
            className="flex-1 h-13 bg-[#0F172A] active:bg-[#1E3A8A] text-white rounded-2xl border border-[#0F172A] flex items-center justify-center gap-1 font-black text-xs transition-colors shadow-sm active:scale-95"
          >
            <Crosshair className="w-4 h-4 text-white" />
            <span className="text-[11px] tracking-wider">DISPARO</span>
          </button>

          {/* Right Arrow Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); playerRef.current.movingRight = true; }}
            onTouchEnd={(e) => { e.preventDefault(); playerRef.current.movingRight = false; }}
            onMouseDown={() => { playerRef.current.movingRight = true; }}
            onMouseUp={() => { playerRef.current.movingRight = false; }}
            className="flex-1 h-13 bg-slate-100 active:bg-slate-200 text-[#0F172A] rounded-2xl border border-slate-300 flex items-center justify-center transition-colors shadow-xs active:scale-95"
          >
            <ChevronRight className="w-6 h-6 text-[#0F172A]" />
          </button>
        </div>
      )}

      {/* Helper legend */}
      <p className="text-[10px] text-slate-400 font-mono mt-2">
        Controles táctiles en pantalla o flechas / barra espaciadora
      </p>
    </div>
  );
};
