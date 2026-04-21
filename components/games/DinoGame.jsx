'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRetroAudio } from './useRetroAudio';

const DINO_SIZE = 28;
const DINO_WIDTH = 26;
const GRAVITY = 0.8;
const JUMP_STRENGTH = -12.5;
const BASE_SPEED = 5;
const MAX_SPEED = 14;
const DAY_NIGHT_CYCLE = 2000; // frames

export default function DinoGame({ color }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 250 });
  const [isReady, setIsReady] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(0); // 0-1, 0=noon, 0.5=midnight

  const gameState = useRef({
    dino: { x: 30, y: 0, velocity: 0, isJumping: false, isDucking: false, blinkTimer: 0 },
    obstacles: [],
    clouds: [],
    stars: [],
    particles: [],
    birds: [],
    gameSpeed: BASE_SPEED,
    distance: 0,
    frameCount: 0,
    moonPhase: 0,
    floatingTexts: [],
    screenShake: 0,
  });

  const { playJump, playHit, playPowerup } = useRetroAudio();

  const resetGame = useCallback(() => {
    const { width, height } = dimensions;
    const groundY = height - 40;
    gameState.current = {
      dino: { x: 30, y: groundY - DINO_SIZE, velocity: 0, isJumping: false, isDucking: false, blinkTimer: 0 },
      obstacles: [],
      clouds: Array.from({ length: 4 }, () => ({
        x: Math.random() * width,
        y: 20 + Math.random() * 60,
        width: 30 + Math.random() * 50,
        speed: 0.3 + Math.random() * 0.4,
      })),
      stars: Array.from({ length: 40 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        size: Math.random() * 1.5 + 0.5,
        twinkle: Math.random(),
      })),
      particles: [],
      birds: [],
      gameSpeed: BASE_SPEED,
      distance: 0,
      frameCount: 0,
      moonPhase: Math.floor(Math.random() * 8),
      floatingTexts: [],
      screenShake: 0,
    };
    setScore(0);
    setTimeOfDay(0);
    setGameOver(false);
    setIsStarted(false);
  }, [dimensions]);

  const jump = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    const dino = gameState.current.dino;
    if (!dino.isJumping) {
      if (!isStarted) setIsStarted(true);
      playJump();
      dino.velocity = JUMP_STRENGTH;
      dino.isJumping = true;
    }
  }, [gameOver, isStarted, resetGame, playJump]);

  const duck = useCallback((isDucking) => {
    const dino = gameState.current.dino;
    const groundY = dimensions.height - 40;
    dino.isDucking = isDucking;
    if (isDucking) {
      dino.y = groundY - DINO_SIZE / 2;
    } else if (!dino.isJumping) {
      dino.y = groundY - DINO_SIZE;
    }
  }, [dimensions]);

  // Handle high score persistence
  useEffect(() => {
    const savedHighScore = localStorage.getItem('dino_high_score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem('dino_high_score', highScore.toString());
    }
  }, [highScore]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(300, rect.width);
        const height = Math.max(200, rect.height);
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
          setIsReady(true);
        }
      }
    };
    // Delay slightly to ensure container is rendered
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.key === 'ArrowDown') {
        duck(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown') {
        duck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump, duck]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: GAME_WIDTH, height: GAME_HEIGHT } = dimensions;
    const GROUND_Y = GAME_HEIGHT - 40;

    let animationId;

    const gameLoop = () => {
      const state = gameState.current;

      if (isStarted && !gameOver) {
        state.frameCount++;
        state.distance += state.gameSpeed;
        
        // Score based on distance
        if (state.frameCount % 10 === 0) {
          const newScore = Math.floor(state.distance / 10);
          if (newScore > 0 && newScore % 100 === 0 && newScore !== score) {
            playPowerup();
            state.floatingTexts.push({
              x: GAME_WIDTH / 2,
              y: GAME_HEIGHT / 2,
              text: `${newScore}!🏆`,
              life: 1,
            });
          }
          setScore(newScore);
        }

        // Increase speed gradually
        if (state.frameCount % 600 === 0 && state.gameSpeed < MAX_SPEED) {
          state.gameSpeed += 0.5;
        }

        // Update dino physics
        if (state.dino.isJumping) {
          state.dino.velocity += GRAVITY;
          state.dino.y += state.dino.velocity;
          
          // Add dust particles when jumping
          if (state.frameCount % 3 === 0 && state.dino.velocity > 0) {
            state.particles.push({
              x: state.dino.x + DINO_WIDTH / 2,
              y: state.dino.y + DINO_SIZE,
              vx: -state.gameSpeed + (Math.random() - 0.5) * 2,
              vy: -Math.random() * 2,
              life: 1,
              size: Math.random() * 3 + 1,
            });
          }
          
          if (state.dino.y >= GROUND_Y - (state.dino.isDucking ? DINO_SIZE / 2 : DINO_SIZE)) {
            state.dino.y = GROUND_Y - (state.dino.isDucking ? DINO_SIZE / 2 : DINO_SIZE);
            state.dino.velocity = 0;
            state.dino.isJumping = false;
            // Landing dust
            for (let i = 0; i < 5; i++) {
              state.particles.push({
                x: state.dino.x + DINO_WIDTH / 2,
                y: GROUND_Y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3,
                life: 1,
                size: Math.random() * 4 + 2,
              });
            }
          }
        }
        
        // Update time of day
        const cycleProgress = (state.frameCount % DAY_NIGHT_CYCLE) / DAY_NIGHT_CYCLE;
        setTimeOfDay(cycleProgress > 0.5 ? (cycleProgress - 0.5) * 2 : 0);

        // Update obstacles
        state.obstacles = state.obstacles.filter(obstacle => {
          obstacle.x -= state.gameSpeed;

          // Collision detection
          const dinoHitbox = {
            x: state.dino.x + 4,
            y: state.dino.y + 4,
            width: DINO_WIDTH - 8,
            height: (state.dino.isDucking ? DINO_SIZE / 2 : DINO_SIZE) - 8,
          };

          const obsHitbox = {
            x: obstacle.x + 3,
            y: obstacle.y + 3,
            width: obstacle.width - 6,
            height: obstacle.height - 6,
          };

          if (
            dinoHitbox.x < obsHitbox.x + obsHitbox.width &&
            dinoHitbox.x + dinoHitbox.width > obsHitbox.x &&
            dinoHitbox.y < obsHitbox.y + obsHitbox.height &&
            dinoHitbox.y + dinoHitbox.height > obsHitbox.y
          ) {
            playHit();
            state.screenShake = 15;
            setGameOver(true);
            setHighScore(prev => Math.max(prev, Math.floor(state.distance / 10)));
          }

          return obstacle.x + obstacle.width > -20;
        });

        // Spawn obstacles
        if (state.frameCount % Math.floor(1200 / state.gameSpeed) === 0) {
          const isCactus = Math.random() > 0.3;
          if (isCactus) {
            const cactusType = Math.floor(Math.random() * 3);
            const heights = [30, 40, 35];
            const widths = [16, 22, 18];
            state.obstacles.push({
              x: GAME_WIDTH,
              y: GROUND_Y - heights[cactusType],
              width: widths[cactusType],
              height: heights[cactusType],
              type: 'cactus',
            });
          } else {
            // Bird
            const birdY = [GROUND_Y - 50, GROUND_Y - 70, GROUND_Y - 45][Math.floor(Math.random() * 3)];
            state.obstacles.push({
              x: GAME_WIDTH,
              y: birdY,
              width: 24,
              height: 16,
              type: 'bird',
              wingFrame: 0,
            });
          }
        }

        // Update clouds
        state.clouds = state.clouds.filter(cloud => {
          cloud.x -= cloud.speed;
          return cloud.x + cloud.width > -50;
        });

        // Spawn clouds
        if (state.frameCount % 200 === 0 && state.clouds.length < 5) {
          state.clouds.push({
            x: GAME_WIDTH + Math.random() * 100,
            y: 20 + Math.random() * (GAME_HEIGHT / 3),
            width: 30 + Math.random() * 20,
            speed: 0.5 + Math.random() * 0.5,
          });
        }
      }

      // Day/Night sky gradient
      const cycleProgress = (state.frameCount % DAY_NIGHT_CYCLE) / DAY_NIGHT_CYCLE;
      const isNight = cycleProgress > 0.4 && cycleProgress < 0.9;
      const nightIntensity = isNight ? 
        (cycleProgress < 0.65 ? (cycleProgress - 0.4) / 0.25 : (0.9 - cycleProgress) / 0.25) : 0;
      
      const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      if (isNight) {
        skyGradient.addColorStop(0, `rgb(${10 * (1-nightIntensity)}, ${15 * (1-nightIntensity)}, ${26 * (1-nightIntensity) + 20 * nightIntensity})`);
        skyGradient.addColorStop(0.5, `rgb(${13 * (1-nightIntensity)}, ${26 * (1-nightIntensity)}, ${13 * (1-nightIntensity) + 15 * nightIntensity})`);
        skyGradient.addColorStop(1, '#070b07');
      } else {
        skyGradient.addColorStop(0, '#0a0f1a');
        skyGradient.addColorStop(0.5, '#0d1a0d');
        skyGradient.addColorStop(1, '#070b07');
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Screen shake effect
      ctx.save();
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(shakeX, shakeY);
        state.screenShake *= 0.9;
        if (state.screenShake < 0.5) state.screenShake = 0;
      }
      
      // Draw stars at night
      if (nightIntensity > 0.1) {
        state.stars.forEach(star => {
          const twinkle = Math.sin(state.frameCount * 0.1 + star.twinkle * 10) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${star.twinkle * twinkle * nightIntensity})`;
          ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        // Draw moon
        ctx.fillStyle = `rgba(255, 255, 240, ${nightIntensity})`;
        ctx.shadowColor = `rgba(255, 255, 240, ${nightIntensity})`;
        ctx.shadowBlur = 20 * nightIntensity;
        ctx.beginPath();
        ctx.arc(GAME_WIDTH - 50, 40, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Draw sun during day
      if (!isNight || nightIntensity < 0.5) {
        const sunY = 50 + Math.sin(cycleProgress * Math.PI) * 30;
        ctx.fillStyle = color + (isNight ? '40' : '20');
        ctx.beginPath();
        ctx.arc(GAME_WIDTH - 60, sunY, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw clouds
      ctx.fillStyle = `${color}30`;
      state.clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y - 5, cloud.width / 4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 2 / 3, cloud.y - 5, cloud.width / 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw ground line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_WIDTH, GROUND_Y);
      ctx.stroke();

      // Ground pattern
      ctx.fillStyle = `${color}40`;
      for (let i = 0; i < GAME_WIDTH; i += 20) {
        const offset = (state.distance % 20);
        ctx.fillRect(i - offset, GROUND_Y + 2, 4, 2);
      }

      // Draw obstacles
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      
      state.obstacles.forEach(obstacle => {
        if (obstacle.type === 'cactus') {
          // Simple cactus shape
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width / 3, obstacle.height);
          // Arms
          if (obstacle.height > 30) {
            ctx.fillRect(obstacle.x - 4, obstacle.y + 8, 8, 3);
            ctx.fillRect(obstacle.x + obstacle.width / 3, obstacle.y + 15, 6, 3);
          }
        } else {
          // Bird
          obstacle.wingFrame = (state.frameCount % 20) > 10 ? 0 : 1;
          ctx.beginPath();
          ctx.moveTo(obstacle.x, obstacle.y + 8);
          ctx.lineTo(obstacle.x + 8, obstacle.y + (obstacle.wingFrame === 0 ? 4 : 12));
          ctx.lineTo(obstacle.x + 16, obstacle.y + 8);
          ctx.lineTo(obstacle.x + 24, obstacle.y + (obstacle.wingFrame === 0 ? 4 : 12));
          ctx.stroke();
        }
      });
      
      ctx.shadowBlur = 0;

      // Update blink timer
      state.dino.blinkTimer++;
      const isBlinking = state.dino.blinkTimer > 150 && state.dino.blinkTimer < 160;
      
      // Draw dino with enhanced visuals
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      
      const dinoHeight = state.dino.isDucking ? DINO_SIZE / 2 : DINO_SIZE;
      const legOffset = state.frameCount % 15 > 7 ? 0 : 4;
      
      // Body (rounded rect effect)
      ctx.fillRect(state.dino.x + 2, state.dino.y + 2, DINO_WIDTH - 4, dinoHeight - 4);
      
      // Head
      ctx.fillRect(state.dino.x + DINO_WIDTH - 10, state.dino.y - 6, 12, 12);
      
      // Eye (with blinking)
      if (!isBlinking) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(state.dino.x + DINO_WIDTH - 6, state.dino.y - 3, 4, 4);
        ctx.fillStyle = '#070b07';
        ctx.fillRect(state.dino.x + DINO_WIDTH - 4, state.dino.y - 1, 2, 2);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(state.dino.x + DINO_WIDTH - 6, state.dino.y - 1, 4, 2);
      }
      if (state.dino.blinkTimer > 200) state.dino.blinkTimer = 0;
      
      // Reset blink
      
      // Legs (animated running)
      ctx.fillStyle = color;
      if (!state.dino.isJumping) {
        const runCycle = Math.floor(state.frameCount / 8) % 2;
        if (runCycle === 0) {
          ctx.fillRect(state.dino.x + 4, state.dino.y + dinoHeight - 2, 4, 6);
          ctx.fillRect(state.dino.x + 14, state.dino.y + dinoHeight - 2, 4, 4);
        } else {
          ctx.fillRect(state.dino.x + 4, state.dino.y + dinoHeight - 2, 4, 4);
          ctx.fillRect(state.dino.x + 14, state.dino.y + dinoHeight - 2, 4, 6);
        }
      } else {
        // Jumping pose
        ctx.fillRect(state.dino.x + 6, state.dino.y + dinoHeight, 4, 3);
        ctx.fillRect(state.dino.x + 16, state.dino.y + dinoHeight - 2, 4, 5);
      }
      
      // Tail
      ctx.beginPath();
      ctx.moveTo(state.dino.x, state.dino.y + dinoHeight / 2);
      ctx.lineTo(state.dino.x - 6, state.dino.y + dinoHeight / 2 - 3);
      ctx.lineTo(state.dino.x - 6, state.dino.y + dinoHeight / 2 + 3);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      // Draw particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.03;
        
        if (p.life > 0 && p.y < GROUND_Y) {
          ctx.fillStyle = `${color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          return true;
        }
        return false;
      });

      // Draw floating texts
      state.floatingTexts = state.floatingTexts.filter(ft => {
        ft.y -= 0.5;
        ft.life -= 0.015;
        if (ft.life > 0) {
          ctx.fillStyle = color;
          ctx.globalAlpha = ft.life;
          ctx.font = `bold 24px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.globalAlpha = 1;
          return true;
        }
        return false;
      });

      ctx.restore(); // Restore from screenshake

      // Chromatic Aberration / Glitch Effect
      if (state.screenShake > 5) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.7;
        ctx.drawImage(canvas, 3, 0);
        ctx.drawImage(canvas, -3, 0);
        ctx.restore();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [color, isStarted, gameOver, dimensions]);

  return (
    <div className="flex flex-col items-center h-full w-full">
      {/* Score Display */}
      <div className="flex justify-between w-full px-2 mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0"
        style={{ color, fontFamily: 'system-ui, sans-serif' }}>
        <span>Score: {score}</span>
        <span>High: {highScore}</span>
      </div>

      {/* Game Canvas with enhanced CRT effects */}
      <div ref={containerRef} className="relative border-2 border-[var(--t-color)] opacity-70 flex-1 w-full min-h-0 overflow-hidden" style={{ boxShadow: `0 0 30px ${color}20, inset 0 0 60px ${color}10` }}>
        {/* CRT Scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${color}03 2px, ${color}03 4px)`,
          mixBlendMode: 'overlay'
        }} />
        {/* CRT Flicker */}
        <div className="absolute inset-0 pointer-events-none z-10 animate-pulse" style={{
          background: `linear-gradient(180deg, ${color}02 0%, transparent 50%, ${color}02 100%)`,
          animationDuration: '4s'
        }} />
        {/* Screen curvature vignette */}
        <div className="absolute inset-0 pointer-events-none z-10" style={{
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.8)'
        }} />
        
        {!isReady ? (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-xs font-bold animate-pulse" style={{ color }}>LOADING...</div>
          </div>
        ) : (
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block w-full h-full relative z-0"
          style={{ imageRendering: 'pixelated' }}
        />
        )}

        {/* Start Overlay */}
        {!isStarted && !gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b07]/70"
          >
            <div className="text-sm sm:text-base font-black mb-2 animate-pulse" style={{ color }}>
              DINO RUN
            </div>
            <div className="text-[10px] sm:text-xs" style={{ color, opacity: 0.7 }}>
              [SPACE] or [↑] to jump
            </div>
            <div className="text-[9px] sm:text-[10px] mt-1" style={{ color, opacity: 0.5 }}>
              [↓] to duck
            </div>
          </motion.div>
        )}
        
        {/* Game Over Overlay */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#070b07]/90"
          >
            <div className="text-2xl sm:text-3xl font-black mb-2" style={{ color }}>
              GAME OVER
            </div>
            <div className="text-xs sm:text-sm mb-4" style={{ color, opacity: 0.7 }}>
              Score: {score}
            </div>
            <div className="text-[10px] sm:text-xs animate-pulse" style={{ color }}>
              [SPACE] to restart
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 text-[9px] sm:text-[10px] text-center opacity-60 uppercase tracking-wider"
        style={{ color, fontFamily: 'system-ui, sans-serif' }}>
        <div className="flex items-center justify-center gap-4">
          <span>↑/SPACE Jump</span>
          <span>↓ Duck</span>
        </div>
      </div>
    </div>
  );
}
