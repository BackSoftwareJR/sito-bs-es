'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRetroAudio } from './useRetroAudio';

const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 16;
const BULLET_WIDTH = 3;
const BULLET_HEIGHT = 8;
const INVADER_WIDTH = 24;
const INVADER_HEIGHT = 18;
const BARRIER_WIDTH = 40;
const BARRIER_HEIGHT = 30;
const UFO_WIDTH = 40;
const UFO_HEIGHT = 16;

const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const INVADER_BULLET_SPEED = 3;
const INVADER_DROP_SPEED = 8;
const INVADER_START_SPEED = 0.8;
const UFO_SPEED = 2;

const INVADER_ROWS = 5;
const INVADER_COLS = 10;

export default function SpaceInvadersGame({ color }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [isReady, setIsReady] = useState(false);
  const [ufoActive, setUfoActive] = useState(false);

  const gameState = useRef({
    player: { x: 0, y: 0, flashTimer: 0 },
    bullets: [],
    invaderBullets: [],
    invaders: [],
    barriers: [],
    particles: [],
    stars: [],
    ufo: null, // { x, y, direction, points }
    invaderDirection: 1,
    invaderSpeed: INVADER_START_SPEED,
    lastPlayerShot: 0,
    lastInvaderShot: 0,
    ufoTimer: 0,
    frameCount: 0,
    playerLives: 3,
    screenShake: 0,
    floatingTexts: [],
    powerUps: [],
    powerUpActive: null, // { type, timer }
  });

  const { playShoot, playLaser, playExplosion, playGameOver, playHit, playPowerup } = useRetroAudio();

  const resetGame = useCallback(() => {
    const { width, height } = dimensions;
    const groundY = height - 30;
    
    // Create invaders grid
    const invaders = [];
    const startX = (width - (INVADER_COLS * (INVADER_WIDTH + 10))) / 2;
    const startY = 60;
    
    for (let row = 0; row < INVADER_ROWS; row++) {
      for (let col = 0; col < INVADER_COLS; col++) {
        const types = ['squid', 'crab', 'crab', 'octopus', 'octopus'];
        const points = [30, 20, 20, 10, 10];
        invaders.push({
          x: startX + col * (INVADER_WIDTH + 10),
          y: startY + row * (INVADER_HEIGHT + 12),
          type: types[row],
          points: points[row],
          alive: true,
          animFrame: 0,
        });
      }
    }

    // Create barriers
    const barriers = [];
    const barrierSpacing = width / 5;
    for (let i = 1; i <= 4; i++) {
      barriers.push({
        x: i * barrierSpacing - BARRIER_WIDTH / 2,
        y: groundY - 70,
        health: 4,
      });
    }

    // Create starfield
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.2 + 0.1,
      brightness: Math.random(),
    }));

    gameState.current = {
      player: { x: width / 2 - PLAYER_WIDTH / 2, y: groundY, flashTimer: 0 },
      bullets: [],
      invaderBullets: [],
      invaders,
      barriers,
      particles: [],
      stars,
      ufo: null,
      invaderDirection: 1,
      invaderSpeed: INVADER_START_SPEED + (level - 1) * 0.15,
      lastPlayerShot: 0,
      lastInvaderShot: 0,
      ufoTimer: 0,
      frameCount: 0,
      playerLives: 3,
      screenShake: 0,
      floatingTexts: [],
      powerUps: [],
      powerUpActive: null,
    };
    setScore(0);
    setGameOver(false);
    setIsStarted(false);
    setUfoActive(false);
    setLevel(1);
  }, [dimensions, level]);

  const shoot = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!isStarted) {
      setIsStarted(true);
      return;
    }
    
    const state = gameState.current;
    const now = Date.now();
    const shootDelay = state.powerUpActive?.type === 'rapid' ? 150 : 350;
    
    if (now - state.lastPlayerShot > shootDelay) {
      state.lastPlayerShot = now;
      playShoot();
      state.bullets.push({
        x: state.player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: state.player.y - BULLET_HEIGHT,
      });
    }
  }, [gameOver, isStarted, resetGame]);

  // Handle high score persistence
  useEffect(() => {
    const savedHighScore = localStorage.getItem('invaders_high_score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem('invaders_high_score', highScore.toString());
    }
  }, [highScore]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = Math.max(400, rect.width);
        const height = Math.max(350, rect.height);
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
          setIsReady(true);
        }
      }
    };
    const timer = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Keyboard controls
  const keys = useRef({ left: false, right: false, space: false });
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowLeft') keys.current.left = true;
      if (e.code === 'ArrowRight') keys.current.right = true;
      if (e.code === 'Space') {
        keys.current.space = true;
        e.preventDefault();
        shoot();
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'ArrowLeft') keys.current.left = false;
      if (e.code === 'ArrowRight') keys.current.right = false;
      if (e.code === 'Space') keys.current.space = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: GAME_WIDTH, height: GAME_HEIGHT } = dimensions;

    let animationId;

    const gameLoop = () => {
      const state = gameState.current;
      state.frameCount++;

      if (isStarted && !gameOver) {
        state.frameCount++;
        
        // Screen shake decay
        if (state.screenShake > 0) {
          state.screenShake *= 0.9;
          if (state.screenShake < 0.5) state.screenShake = 0;
        }
        
        // Update stars
        state.stars.forEach(star => {
          star.y += star.speed;
          if (star.y > GAME_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * GAME_WIDTH;
          }
        });
        
        // UFO spawn logic
        state.ufoTimer++;
        if (!state.ufo && state.ufoTimer > 600 + Math.random() * 800) {
          state.ufoTimer = 0;
          const direction = Math.random() > 0.5 ? 1 : -1;
          state.ufo = {
            x: direction === 1 ? -UFO_WIDTH : GAME_WIDTH + UFO_WIDTH,
            y: 25,
            direction,
            points: [50, 100, 150, 200, 300][Math.floor(Math.random() * 5)],
          };
          setUfoActive(true);
        }
        
        // Update UFO
        if (state.ufo) {
          state.ufo.x += UFO_SPEED * state.ufo.direction;
          if (state.ufo.x < -UFO_WIDTH - 50 || state.ufo.x > GAME_WIDTH + UFO_WIDTH + 50) {
            state.ufo = null;
            setUfoActive(false);
          }
        }

        // Move player
        if (keys.current.left && state.player.x > 10) {
          state.player.x -= PLAYER_SPEED;
        }
        if (keys.current.right && state.player.x < GAME_WIDTH - PLAYER_WIDTH - 10) {
          state.player.x += PLAYER_SPEED;
        }

        // Update bullets
        state.bullets = state.bullets.filter(bullet => {
          bullet.y -= BULLET_SPEED;
          
          // Check collision with UFO
          let hit = false;
          if (state.ufo &&
              bullet.x < state.ufo.x + UFO_WIDTH &&
              bullet.x + BULLET_WIDTH > state.ufo.x &&
              bullet.y < state.ufo.y + UFO_HEIGHT &&
              bullet.y + BULLET_HEIGHT > state.ufo.y) {
            hit = true;
            playExplosion();
            state.screenShake = 20;
            const pointsToAward = state.ufo.points;
            setScore(prev => prev + pointsToAward);
            
            // UFO explosion particles
            for (let i = 0; i < 30; i++) {
              state.particles.push({
                x: state.ufo.x + UFO_WIDTH / 2,
                y: state.ufo.y + UFO_HEIGHT / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 50,
                color: '#ff0000',
                size: Math.random() * 5 + 2,
              });
            }
            
            state.floatingTexts.push({
              x: state.ufo.x + UFO_WIDTH / 2,
              y: state.ufo.y,
              text: `+${pointsToAward}`,
              color: '#ff0000',
              life: 1,
            });
            
            // Random power-up drop
            if (Math.random() > 0.4) {
              state.powerUps.push({
                x: state.ufo.x + UFO_WIDTH / 2,
                y: state.ufo.y,
                type: Math.random() > 0.5 ? 'rapid' : 'life',
              });
            }
            
            state.ufo = null;
            setUfoActive(false);
          }
          
          // Check collision with invaders
          state.invaders.forEach(invader => {
            if (!hit && invader.alive &&
                bullet.x < invader.x + INVADER_WIDTH &&
                bullet.x + BULLET_WIDTH > invader.x &&
                bullet.y < invader.y + INVADER_HEIGHT &&
                bullet.y + BULLET_HEIGHT > invader.y) {
              invader.alive = false;
              hit = true;
              playHit();
              state.screenShake = 5;
              setScore(prev => prev + invader.points);
              
              // Create explosion particles
              for (let i = 0; i < 15; i++) {
                state.particles.push({
                  x: invader.x + INVADER_WIDTH / 2,
                  y: invader.y + INVADER_HEIGHT / 2,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 30,
                  color,
                  size: Math.random() * 3 + 1.5,
                });
              }
            }
          });
          
          // Check collision with barriers
          state.barriers.forEach(barrier => {
            if (barrier.health > 0 &&
                bullet.x < barrier.x + BARRIER_WIDTH &&
                bullet.x + BULLET_WIDTH > barrier.x &&
                bullet.y < barrier.y + BARRIER_HEIGHT &&
                bullet.y + BULLET_HEIGHT > barrier.y) {
              barrier.health--;
              hit = true;
            }
          });
          
          return bullet.y > -10 && !hit;
        });

        // Update invader bullets
        state.invaderBullets = state.invaderBullets.filter(bullet => {
          bullet.y += INVADER_BULLET_SPEED;
          
          // Check collision with player
          if (bullet.x < state.player.x + PLAYER_WIDTH &&
              bullet.x + BULLET_WIDTH > state.player.x &&
              bullet.y < state.player.y + PLAYER_HEIGHT &&
              bullet.y + BULLET_HEIGHT > state.player.y) {
            state.playerLives--;
            state.screenShake = 15;
            playExplosion();
            
            for (let i = 0; i < 20; i++) {
              state.particles.push({
                x: state.player.x + PLAYER_WIDTH / 2,
                y: state.player.y + PLAYER_HEIGHT / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 40,
                color: '#fff',
                size: Math.random() * 4 + 2,
              });
            }

            if (state.playerLives <= 0) {
              playGameOver();
              setGameOver(true);
              setHighScore(prev => Math.max(prev, score));
            }
            return false;
          }
          
          // Check collision with barriers
          let hit = false;
          state.barriers.forEach(barrier => {
            if (barrier.health > 0 &&
                bullet.x < barrier.x + BARRIER_WIDTH &&
                bullet.x + BULLET_WIDTH > barrier.x &&
                bullet.y < barrier.y + BARRIER_HEIGHT &&
                bullet.y + BULLET_HEIGHT > barrier.y) {
              barrier.health--;
              hit = true;
            }
          });
          
          return bullet.y < GAME_HEIGHT + 10 && !hit;
        });

        // Move invaders
        let shouldDrop = false;
        let aliveInvaders = 0;
        let rightmost = 0;
        let leftmost = GAME_WIDTH;
        
        state.invaders.forEach(invader => {
          if (invader.alive) {
            aliveInvaders++;
            rightmost = Math.max(rightmost, invader.x + INVADER_WIDTH);
            leftmost = Math.min(leftmost, invader.x);
            
            // Check if reached player
            if (invader.y + INVADER_HEIGHT >= state.player.y) {
              setGameOver(true);
              setHighScore(prev => Math.max(prev, score));
            }
          }
        });

        if (aliveInvaders === 0) {
          // Next level
          setLevel(prev => prev + 1);
          resetGame();
          return;
        }

        if (state.invaderDirection === 1 && rightmost >= GAME_WIDTH - 10) {
          shouldDrop = true;
          state.invaderDirection = -1;
        } else if (state.invaderDirection === -1 && leftmost <= 10) {
          shouldDrop = true;
          state.invaderDirection = 1;
        }

        state.invaders.forEach(invader => {
          if (invader.alive) {
            invader.x += state.invaderSpeed * state.invaderDirection;
            if (shouldDrop) {
              invader.y += INVADER_DROP_SPEED;
            }
            // Animate
            if (state.frameCount % 30 === 0) {
              invader.animFrame = 1 - invader.animFrame;
            }
          }
        });

        // Invaders shoot
        const now = Date.now();
        if (now - state.lastInvaderShot > 800 + Math.random() * 600) {
          state.lastInvaderShot = now;
          const shooters = state.invaders.filter(i => i.alive && i.y > 50);
          if (shooters.length > 0) {
            playLaser();
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            state.invaderBullets.push({
              x: shooter.x + INVADER_WIDTH / 2,
              y: shooter.y + INVADER_HEIGHT,
            });
          }
        }

        // Update particles
        state.particles = state.particles.filter(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          return p.life > 0;
        });

        // Update floating texts
        state.floatingTexts = state.floatingTexts.filter(ft => {
          ft.y -= 0.5;
          ft.life -= 0.02;
          return ft.life > 0;
        });

        // Update power-ups
        state.powerUps = state.powerUps.filter(p => {
          p.y += 2;
          // Check collision with player
          if (p.x < state.player.x + PLAYER_WIDTH && 
              p.x + 15 > state.player.x && 
              p.y < state.player.y + PLAYER_HEIGHT && 
              p.y + 15 > state.player.y) {
            playPowerup();
            if (p.type === 'life') {
              state.playerLives = Math.min(5, state.playerLives + 1);
            } else {
              state.powerUpActive = { type: p.type, timer: 600 };
            }
            return false;
          }
          return p.y < GAME_HEIGHT;
        });

        if (state.powerUpActive) {
          state.powerUpActive.timer--;
          if (state.powerUpActive.timer <= 0) state.powerUpActive = null;
        }
      }

      // Screen shake
      ctx.save();
      if (state.screenShake > 0) {
        ctx.translate(
          (Math.random() - 0.5) * state.screenShake,
          (Math.random() - 0.5) * state.screenShake
        );
      }

      // Space gradient background
      const spaceGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      spaceGradient.addColorStop(0, '#050810');
      spaceGradient.addColorStop(0.5, '#070b14');
      spaceGradient.addColorStop(1, '#070b07');
      ctx.fillStyle = spaceGradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw animated starfield
      state.stars.forEach(star => {
        const twinkle = Math.sin(state.frameCount * 0.05 + star.brightness * 10) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Draw barriers
      state.barriers.forEach(barrier => {
        if (barrier.health > 0) {
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 4;
          const damage = 4 - barrier.health;
          ctx.fillRect(barrier.x + damage * 3, barrier.y + damage * 2, 
                       BARRIER_WIDTH - damage * 6, BARRIER_HEIGHT - damage * 4);
          ctx.shadowBlur = 0;
        }
      });

      // Draw player
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      // Tank body
      ctx.fillRect(state.player.x, state.player.y + 6, PLAYER_WIDTH, 10);
      // Tank cannon
      ctx.fillRect(state.player.x + PLAYER_WIDTH / 2 - 3, state.player.y, 6, 10);
      ctx.shadowBlur = 0;

      // Draw bullets
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      state.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
      });
      
      // Draw invader bullets
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      state.invaderBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
      });
      ctx.shadowBlur = 0;

      // Draw UFO
      if (state.ufo) {
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        
        // UFO body
        ctx.beginPath();
        ctx.ellipse(state.ufo.x + UFO_WIDTH / 2, state.ufo.y + 8, UFO_WIDTH / 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // UFO dome
        ctx.fillStyle = '#ff6666';
        ctx.beginPath();
        ctx.ellipse(state.ufo.x + UFO_WIDTH / 2, state.ufo.y + 4, UFO_WIDTH / 4, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Blinking lights
        if (state.frameCount % 10 < 5) {
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(state.ufo.x + 5, state.ufo.y + 10, 4, 3);
          ctx.fillRect(state.ufo.x + UFO_WIDTH - 9, state.ufo.y + 10, 4, 3);
          ctx.fillRect(state.ufo.x + UFO_WIDTH / 2 - 2, state.ufo.y + 12, 4, 3);
        }
        
        ctx.shadowBlur = 0;
      }

      // Draw invaders
      state.invaders.forEach(invader => {
        if (invader.alive) {
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 6;
          
          const frame = invader.animFrame;
          const x = invader.x;
          const y = invader.y;
          const w = INVADER_WIDTH;
          const h = INVADER_HEIGHT;
          
          // Simple pixel art invaders
          if (invader.type === 'squid') {
            // Top row - squid
            ctx.fillRect(x + 8, y, 6, 3);
            ctx.fillRect(x + 4, y + 3, 14, 3);
            ctx.fillRect(x, y + 6, w, 4);
            ctx.fillRect(x + 4, y + 10, 4, 4);
            ctx.fillRect(x + 14, y + 10, 4, 4);
            if (frame === 0) {
              ctx.fillRect(x, y + 14, 4, 2);
              ctx.fillRect(x + 18, y + 14, 4, 2);
            } else {
              ctx.fillRect(x + 4, y + 14, 4, 2);
              ctx.fillRect(x + 14, y + 14, 4, 2);
            }
          } else if (invader.type === 'crab') {
            // Middle rows - crab
            ctx.fillRect(x + 2, y, 4, 3);
            ctx.fillRect(x + 16, y, 4, 3);
            ctx.fillRect(x, y + 3, w, 4);
            ctx.fillRect(x + 4, y + 7, 4, 3);
            ctx.fillRect(x + 14, y + 7, 4, 3);
            ctx.fillRect(x + 2, y + 10, 18, 3);
            if (frame === 0) {
              ctx.fillRect(x, y + 13, 4, 3);
              ctx.fillRect(x + 18, y + 13, 4, 3);
            } else {
              ctx.fillRect(x + 2, y + 13, 3, 3);
              ctx.fillRect(x + 17, y + 13, 3, 3);
            }
          } else {
            // Bottom rows - octopus
            ctx.fillRect(x + 4, y, 14, 3);
            ctx.fillRect(x, y + 3, w, 5);
            ctx.fillRect(x + 2, y + 8, 4, 3);
            ctx.fillRect(x + 16, y + 8, 4, 3);
            if (frame === 0) {
              ctx.fillRect(x, y + 11, 4, 5);
              ctx.fillRect(x + 18, y + 11, 4, 5);
              ctx.fillRect(x + 6, y + 11, 4, 3);
              ctx.fillRect(x + 12, y + 11, 4, 3);
            } else {
              ctx.fillRect(x + 2, y + 11, 4, 5);
              ctx.fillRect(x + 16, y + 11, 4, 5);
              ctx.fillRect(x + 6, y + 11, 3, 3);
              ctx.fillRect(x + 13, y + 11, 3, 3);
            }
          }
          ctx.shadowBlur = 0;
        }
      });

      // Draw particles with fade
      state.particles.forEach(p => {
        ctx.fillStyle = p.color || color;
        ctx.globalAlpha = Math.max(0, p.life / 30);
        const size = p.size || 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw floating texts
      state.floatingTexts.forEach(ft => {
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.life;
        ctx.font = `bold 12px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1;
      });

      // Draw Powerups
      state.powerUps.forEach(p => {
        ctx.fillStyle = p.type === 'rapid' ? '#ffff00' : '#00ff00';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.fillRect(p.x, p.y, 14, 14);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.type === 'rapid' ? '⚡' : '♥', p.x + 7, p.y + 11);
        ctx.shadowBlur = 0;
      });
      
      // Restore context from screen shake
      ctx.restore();

      // Chromatic Aberration / Glitch Effect
      if (state.screenShake > 8) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.7;
        ctx.drawImage(canvas, 4, 0);
        ctx.drawImage(canvas, -4, 0);
        ctx.restore();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [color, isStarted, gameOver, score, dimensions, level, resetGame]);

  return (
    <div className="flex flex-col items-center h-full w-full">
      {/* Score Display */}
      <div className="flex justify-between w-full px-2 mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0"
        style={{ color, fontFamily: 'system-ui, sans-serif' }}>
        <div className="flex gap-4 items-center">
          <span>Score: {score}</span>
          <span>Lives: {gameState.current.playerLives}</span>
          <span>Level: {level}</span>
          {ufoActive && (
            <span className="text-[#ff0000] animate-pulse text-[9px]">🛸 UFO!</span>
          )}
        </div>
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
              SPACE INVADERS
            </div>
            <div className="text-[10px] sm:text-xs" style={{ color, opacity: 0.7 }}>
              [← →] Move • [SPACE] Shoot
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
              Score: {score} • Level: {level}
            </div>
            <div className="text-[10px] sm:text-xs animate-pulse" style={{ color }}>
              [SPACE] to restart
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 text-[9px] sm:text-[10px] text-center opacity-60 uppercase tracking-wider shrink-0"
        style={{ color, fontFamily: 'system-ui, sans-serif' }}>
        <div className="flex items-center justify-center gap-4">
          <span>← → Move</span>
          <span>SPACE Shoot</span>
        </div>
      </div>
    </div>
  );
}
