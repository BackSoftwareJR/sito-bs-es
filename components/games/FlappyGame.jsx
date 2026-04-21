'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRetroAudio } from './useRetroAudio';

const BIRD_SIZE = 16;
const PIPE_WIDTH = 44;
const PIPE_GAP = 115;
const GRAVITY = 0.38;
const JUMP_STRENGTH = -6.8;
const PIPE_SPEED = 2.3;
const PARALLAX_LAYERS = 3;

export default function FlappyGame({ color }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });
  const [isReady, setIsReady] = useState(false);
  const [medal, setMedal] = useState(null); // 'bronze', 'silver', 'gold', 'platinum'

  const gameState = useRef({
    bird: { x: 60, y: 150, velocity: 0, rotation: 0, wingFrame: 0 },
    pipes: [],
    stars: [],
    clouds: [],
    pipeTimer: 0,
    lastPipeX: 0,
    particles: [],
    floatingTexts: [],
    frameCount: 0,
    screenShake: 0,
  });

  const { playJump, playHit, playPowerup, playEat } = useRetroAudio();

  const getMedal = (score) => {
    if (score >= 50) return 'platinum';
    if (score >= 30) return 'gold';
    if (score >= 20) return 'silver';
    if (score >= 10) return 'bronze';
    return null;
  };

  const resetGame = useCallback(() => {
    const { width, height } = dimensions;
    gameState.current = {
      bird: { x: 60, y: height / 2, velocity: 0, rotation: 0, wingFrame: 0 },
      pipes: [],
      stars: Array.from({ length: 30 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        brightness: Math.random(),
      })),
      clouds: Array.from({ length: 5 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        width: 40 + Math.random() * 60,
        speed: Math.random() * 0.5 + 0.2,
      })),
      pipeTimer: 0,
      lastPipeX: 0,
      particles: [],
      floatingTexts: [],
      frameCount: 0,
      screenShake: 0,
    };
    setScore(0);
    setMedal(null);
    setGameOver(false);
    setIsStarted(false);
  }, [dimensions]);

  const jump = useCallback(() => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (!isStarted) {
      setIsStarted(true);
    }
    playJump();
    gameState.current.bird.velocity = JUMP_STRENGTH;
    
    // Add jump exhaust particles
    for (let i = 0; i < 5; i++) {
      gameState.current.particles.push({
        x: gameState.current.bird.x,
        y: gameState.current.bird.y + BIRD_SIZE,
        life: 1,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() + 0.5) * 2,
        size: Math.random() * 3 + 1,
      });
    }
  }, [gameOver, isStarted, resetGame, playJump]);

  // Handle high score persistence
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappy_high_score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  useEffect(() => {
    if (highScore > 0) {
      localStorage.setItem('flappy_high_score', highScore.toString());
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
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: GAME_WIDTH, height: GAME_HEIGHT } = dimensions;

    let animationId;

    const gameLoop = () => {
      const state = gameState.current;

      if (isStarted && !gameOver) {
        // Update bird
        state.bird.velocity += GRAVITY;
        state.bird.y += state.bird.velocity;

        // Bird collision with ground/ceiling
        if (state.bird.y < 0 || state.bird.y + BIRD_SIZE > GAME_HEIGHT) {
          playHit();
          state.screenShake = 10;
          setGameOver(true);
          setHighScore(prev => Math.max(prev, score));
        }

        // Update pipes
        state.pipes = state.pipes.filter(pipe => {
          pipe.x -= PIPE_SPEED;
          
          // Check collision
          const birdRight = state.bird.x + BIRD_SIZE;
          const birdBottom = state.bird.y + BIRD_SIZE;
          const pipeRight = pipe.x + PIPE_WIDTH;
          
          if (
            state.bird.x < pipeRight &&
            birdRight > pipe.x &&
            (state.bird.y < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP)
          ) {
            playHit();
            state.screenShake = 15;
            setGameOver(true);
            setHighScore(prev => Math.max(prev, score));
          }

          // Score
          if (!pipe.passed && pipe.x + PIPE_WIDTH < state.bird.x) {
            pipe.passed = true;
            playEat();
            
            state.floatingTexts.push({
              x: state.bird.x + BIRD_SIZE / 2,
              y: state.bird.y - 10,
              text: "+1",
              life: 1,
            });

            setScore(prev => {
              const newScore = prev + 1;
              if (getMedal(newScore) !== medal && getMedal(newScore)) playPowerup();
              setMedal(getMedal(newScore));
              return newScore;
            });
          }

          return pipe.x + PIPE_WIDTH > -10;
        });

        // Spawn pipes
        state.pipeTimer++;
        if (state.pipeTimer > 140) {
          state.pipeTimer = 0;
          const minGapY = 50;
          const maxGapY = GAME_HEIGHT - PIPE_GAP - 50;
          const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
          
          state.pipes.push({
            x: GAME_WIDTH,
            gapY,
            passed: false,
          });
        }
      }

      // Screen shake effect
      ctx.save();
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(shakeX, shakeY);
        state.screenShake *= 0.9;
        if (state.screenShake < 0.5) state.screenShake = 0;
      }

      // Parallax gradient sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      skyGradient.addColorStop(0, '#0a0f1a');
      skyGradient.addColorStop(0.5, '#0d1a0d');
      skyGradient.addColorStop(1, '#070b07');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Draw stars (parallax layer 1)
      state.stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) star.x = GAME_WIDTH;
        const twinkle = Math.sin(state.frameCount * 0.1 + star.x) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle * 0.6})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // Draw clouds (parallax layer 2)
      ctx.fillStyle = `${color}15`;
      state.clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) cloud.x = GAME_WIDTH + 50;
        ctx.fillRect(cloud.x, cloud.y, cloud.width, 12);
        ctx.fillRect(cloud.x + 10, cloud.y - 8, cloud.width - 20, 10);
      });

      // Draw distant city silhouette
      ctx.fillStyle = `${color}08`;
      for (let i = 0; i < GAME_WIDTH; i += 30) {
        const buildingHeight = 30 + Math.sin(i * 0.1) * 20 + Math.cos(i * 0.05) * 15;
        ctx.fillRect(i, GAME_HEIGHT - buildingHeight - 30, 28, buildingHeight);
      }

      // Draw pipes with better styling
      state.pipes.forEach(pipe => {
        const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, `${color}dd`);
        gradient.addColorStop(1, color);
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        // Pipe cap
        ctx.fillRect(pipe.x - 2, pipe.gapY - 8, PIPE_WIDTH + 4, 8);
        ctx.strokeRect(pipe.x - 2, pipe.gapY - 8, PIPE_WIDTH + 4, 8);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - pipe.gapY - PIPE_GAP);
        ctx.strokeRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, GAME_HEIGHT - pipe.gapY - PIPE_GAP);
        // Pipe cap
        ctx.fillRect(pipe.x - 2, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 4, 8);
        ctx.strokeRect(pipe.x - 2, pipe.gapY + PIPE_GAP, PIPE_WIDTH + 4, 8);
        
        ctx.shadowBlur = 0;
      });

      // Draw bird with rotation
      ctx.save();
      ctx.translate(state.bird.x + BIRD_SIZE / 2, state.bird.y + BIRD_SIZE / 2);
      ctx.rotate(state.bird.rotation);
      
      // Bird wing animation
      const wingY = Math.sin(state.frameCount * 0.3) * 4;
      ctx.fillStyle = `${color}aa`;
      ctx.beginPath();
      ctx.ellipse(-2, wingY - 2, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Bird body
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Bird eye
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(4, -2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#070b07';
      ctx.beginPath();
      ctx.arc(5, -2, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Beak
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(10, 2);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      ctx.shadowBlur = 0;
      
      // Draw particles (trail)
      if (isStarted && !gameOver) {
        if (state.frameCount % 5 === 0) {
          state.particles.push({
            x: state.bird.x,
            y: state.bird.y + BIRD_SIZE / 2,
            life: 1,
            vx: -1,
            vy: 0,
            size: Math.random() * 3 + 1,
          });
        }
      }
      
      state.particles = state.particles.filter(p => {
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        p.life -= 0.05;
        if (p.life > 0) {
          ctx.fillStyle = `${color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
          return true;
        }
        return false;
      });
      
      // Draw floating texts
      state.floatingTexts = state.floatingTexts.filter(ft => {
        ft.y -= 1; // float up faster
        ft.life -= 0.03; // fade out faster
        if (ft.life > 0) {
          ctx.fillStyle = color;
          ctx.globalAlpha = ft.life;
          ctx.font = `bold 16px monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.globalAlpha = 1;
          return true;
        }
        return false;
      });
      
      // Ground line
      ctx.fillStyle = color;
      ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 2);
      // Ground pattern
      ctx.fillStyle = `${color}40`;
      for (let i = 0; i < GAME_WIDTH; i += 15) {
        ctx.fillRect(i, GAME_HEIGHT - 18, 2, 4);
      }
      
      ctx.restore(); // End screen shake
      
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
  }, [color, isStarted, gameOver, score, dimensions]);

  return (
    <div className="flex flex-col items-center h-full w-full">
      {/* Score Display with medal */}
      <div className="flex justify-between w-full px-2 mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0"
        style={{ color, fontFamily: 'system-ui, sans-serif' }}>
        <div className="flex items-center gap-2">
          <span>Score: {score}</span>
          {medal && (
            <span className={medal === 'platinum' ? 'text-[#e5e4e2]' : medal === 'gold' ? 'text-[#ffd700]' : medal === 'silver' ? 'text-[#c0c0c0]' : 'text-[#cd7f32]'}>
              {medal === 'platinum' ? '🏆' : medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'}
            </span>
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
              FLAPPY PIXEL
            </div>
            <div className="text-[10px] sm:text-xs" style={{ color, opacity: 0.7 }}>
              [SPACE] to fly
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
        <span>SPACE to fly / jump</span>
      </div>
    </div>
  );
}
