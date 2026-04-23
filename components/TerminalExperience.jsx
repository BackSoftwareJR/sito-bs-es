'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../lib/i18n-context';
import SnakeGame from './games/SnakeGame';
import FlappyGame from './games/FlappyGame';
import DinoGame from './games/DinoGame';
import SpaceInvadersGame from './games/SpaceInvadersGame';

const GAMES = {
  SNAKE: 'SNAKE',
  FLAPPY: 'FLAPPY',
  DINO: 'DINO',
  SPACE: 'SPACE',
};

const APPS = {
  ORACLE: 'ORACLE',
  SLOT: 'SLOT',
  EXCUSE: 'EXCUSE',
  ARCADE: 'ARCADE',
};

const APP_TITLE_KEYS = {
  [APPS.ORACLE]: 'terminal.apps.oracle',
  [APPS.SLOT]: 'terminal.apps.slot',
  [APPS.EXCUSE]: 'terminal.apps.excuse',
  [APPS.ARCADE]: 'terminal.apps.arcade',
};

const GAME_TITLE_KEYS = {
  [GAMES.SNAKE]: 'terminal.games.snake',
  [GAMES.FLAPPY]: 'terminal.games.flappy',
  [GAMES.DINO]: 'terminal.games.dino',
  [GAMES.SPACE]: 'terminal.games.space',
};

const APP_ORDER = [APPS.ORACLE, APPS.SLOT, APPS.EXCUSE, APPS.ARCADE];
const GAME_ORDER = [GAMES.SNAKE, GAMES.FLAPPY, GAMES.DINO, GAMES.SPACE];

/* ===========================================================
   MINI-APPS COMPONENTS
=========================================================== */

function OracleApp({ color }) {
  const { t } = useI18n();
  const [val, setVal] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading1, loading2, result
  const [result, setResult] = useState('');

  const answers = useMemo(() => {
    const arr = t('terminal.oracle.answers');
    return Array.isArray(arr) ? arr : [];
  }, [t]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!val.trim() || answers.length === 0) return;
    setStatus('loading1');
    setTimeout(() => setStatus('loading2'), 800);
    setTimeout(() => {
      setResult(answers[Math.floor(Math.random() * answers.length)]);
      setStatus('result');
    }, 1800);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 justify-center">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('terminal.oracle.title')}</h2>
        <p className="text-xs sm:text-sm opacity-80">{t('terminal.oracle.subtitle')}</p>
      </div>

      {status === 'idle' && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-sm mx-auto w-full">
          <input 
            type="text" 
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder={t('terminal.oracle.placeholder')}
            className="bg-transparent border-b-2 outline-none px-2 py-1 text-sm sm:text-base text-center placeholder:opacity-40 uppercase"
            style={{ borderColor: color, color: color }}
            autoFocus
          />
          <button type="submit" className="border-2 px-4 py-2 font-bold hover:bg-white/10 transition-colors" style={{ borderColor: color, color: color }}>
            {t('terminal.oracle.ask')}
          </button>
        </form>
      )}

      {status.startsWith('loading') && (
        <div className="text-center font-mono opacity-80 animate-pulse text-sm sm:text-base">
          {status === 'loading1' ? t('terminal.oracle.loading1') : t('terminal.oracle.loading2')}
        </div>
      )}

      {status === 'result' && (
        <div className="text-center animate-bounce-in">
          <div className="text-lg sm:text-xl font-bold mb-6 border p-4" style={{ borderColor: color }}>
            {result}
          </div>
          <button onClick={() => { setVal(''); setStatus('idle'); }} className="text-sm opacity-70 hover:opacity-100 underline underline-offset-4">
            {t('terminal.oracle.again')}
          </button>
        </div>
      )}
    </div>
  );
}

function SlotApp({ color }) {
  const { t } = useI18n();
  const [status, setStatus] = useState('idle'); // idle, spinning, result
  const [slots, setSlots] = useState(['?', '?', '?']);
  const [prize, setPrize] = useState('');

  const spin = () => {
    setStatus('spinning');
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      const chars = ['🍒', '🐛', '💩', '☕', '🍕', '🤡', '💻', '💀'];
      setSlots([
        chars[Math.floor(Math.random() * chars.length)],
        chars[Math.floor(Math.random() * chars.length)],
        chars[Math.floor(Math.random() * chars.length)]
      ]);
      if (ticks > 15) {
        clearInterval(interval);
        determinePrize();
      }
    }, 100);
  };

  const determinePrize = () => {
    const roll = Math.random();
    if (roll > 0.85) {
      setSlots(['☕', '☕', '☕']);
      setPrize(t('terminal.slot.prizes.coffee'));
    } else if (roll > 0.70) {
      setSlots(['🐛', '🐛', '🐛']);
      setPrize(t('terminal.slot.prizes.bugs'));
    } else if (roll > 0.55) {
      setSlots(['🍕', '🍕', '🍕']);
      setPrize(t('terminal.slot.prizes.pizza'));
    } else if (roll > 0.40) {
      setSlots(['🤡', '🤡', '🤡']);
      setPrize(t('terminal.slot.prizes.client'));
    } else if (roll > 0.25) {
      setSlots(['💻', '💻', '💻']);
      setPrize(t('terminal.slot.prizes.nerd'));
    } else {
      setSlots(['💩', '💀', '💣']);
      setPrize(t('terminal.slot.prizes.nothing'));
    }
    setStatus('result');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">{t('terminal.slot.title')}</h2>
      <p className="text-xs sm:text-sm opacity-80 mb-8 text-center max-w-xs">{t('terminal.slot.subtitle')}</p>

      <div className="flex gap-4 text-4xl sm:text-6xl mb-8 font-mono border-4 p-4 rounded-lg bg-black/50 tracking-widest" style={{ borderColor: color }}>
        <span>{slots[0]}</span>
        <span>{slots[1]}</span>
        <span>{slots[2]}</span>
      </div>

      {status === 'idle' && (
        <button onClick={spin} className="border-2 px-8 py-3 text-lg font-bold hover:bg-white/10 transition-colors animate-pulse" style={{ borderColor: color }}>
          {t('terminal.slot.spin')}
        </button>
      )}

      {status === 'result' && (
        <div className="text-center animate-bounce-in max-w-sm">
          <p className="font-bold text-sm sm:text-base mb-6 border border-dashed p-3">{prize}</p>
          <button onClick={() => setStatus('idle')} className="text-sm opacity-70 hover:opacity-100 underline underline-offset-4">
            {t('terminal.slot.tryAgain')}
          </button>
        </div>
      )}
    </div>
  );
}

function ExcuseApp({ color }) {
  const { t } = useI18n();
  const [excuse, setExcuse] = useState('');
  const [status, setStatus] = useState('idle'); // idle, generating, done

  const excuses = useMemo(() => {
    const arr = t('terminal.excuse.excuses');
    return Array.isArray(arr) ? arr : [];
  }, [t]);

  const generate = () => {
    if (excuses.length === 0) return;
    setStatus('generating');
    setTimeout(() => {
      let rand;
      do { rand = excuses[Math.floor(Math.random() * excuses.length)]; } while (rand === excuse && excuses.length > 1);
      setExcuse(rand);
      setStatus('done');
    }, 1500); // 1.5 seconds typing delay
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">{t('terminal.excuse.title')}</h2>
      <p className="text-xs sm:text-sm opacity-80 mb-8 max-w-sm">
        {t('terminal.excuse.subtitle')}
      </p>

      {status === 'generating' ? (
        <div className="text-center font-mono opacity-80 animate-pulse text-sm sm:text-base">
          {t('terminal.excuse.loading')}
        </div>
      ) : excuse ? (
        <div className="max-w-md animate-bounce-in">
          <div className="text-lg sm:text-xl font-mono border-l-4 p-4 text-left italic bg-black/30 mb-8" style={{ borderColor: color }}>
            "{excuse}"
          </div>
          <button onClick={generate} className="border-2 px-6 py-2 font-bold hover:bg-white/10 transition-colors" style={{ borderColor: color }}>
            {t('terminal.excuse.generateAnother')}
          </button>
        </div>
      ) : (
        <button onClick={generate} className="border-2 px-8 py-3 text-lg font-bold hover:bg-white/10 transition-colors" style={{ borderColor: color }}>
          {t('terminal.excuse.generate')}
        </button>
      )}
    </div>
  );
}

/* ===========================================================
   RETRO ARCADE — CRT Monitor Hub
   Contains Apps & Arcades
=========================================================== */
export default function TerminalExperience({ onSwitchToModern }) {
  const { t } = useI18n();
  const [bootPhase, setBootPhase] = useState('boot');
  const [screenAnim, setScreenAnim] = useState('');
  const [terminalColor, setTerminalColor] = useState('amber');
  const [currentApp, setCurrentApp] = useState(APPS.ORACLE);
  const [currentGame, setCurrentGame] = useState(GAMES.SNAKE);
  const [retroCursor, setRetroCursor] = useState({ x: 0, y: 0, on: false });
  const appTabRefs = useRef({});
  const gameTabRefs = useRef({});

  const COLOR_PROFILES = useMemo(() => ({
    amber: { main: '#ffcc00', glow: 'rgba(255,204,0,0.35)', glowStrong: 'rgba(255,204,0,0.6)', beam: 'rgba(255,204,0,0.02)', beamStrong: 'rgba(255,204,0,0.05)' },
    green: { main: '#00ff66', glow: 'rgba(0,255,102,0.35)', glowStrong: 'rgba(0,255,102,0.6)', beam: 'rgba(0,255,102,0.02)', beamStrong: 'rgba(0,255,102,0.05)' },
    pink: { main: '#ff33dd', glow: 'rgba(255,51,221,0.35)', glowStrong: 'rgba(255,51,221,0.6)', beam: 'rgba(255,51,221,0.02)', beamStrong: 'rgba(255,51,221,0.05)' },
  }), []);

  // Quick boot sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreenAnim('screen-on');
      setBootPhase('ready');
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Re-enable system cursor if it was hidden on the modern site (hero / why lens)
  useEffect(() => {
    document.documentElement.classList.remove('site-system-cursor-off');
  }, []);

  const handleAppTabsKeyDownCapture = useCallback(
    (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const t = e.target;
      if (!t?.closest?.('[data-terminal-app-tabs]')) return;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      e.preventDefault();
      e.stopPropagation();
      const order = APP_ORDER;
      const idx = order.indexOf(currentApp);
      if (idx < 0) return;
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = order[(idx + delta + order.length) % order.length];
      setCurrentApp(next);
      requestAnimationFrame(() => appTabRefs.current[next]?.focus?.());
    },
    [currentApp],
  );

  const handleGameTabsKeyDownCapture = useCallback(
    (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const t = e.target;
      if (!t?.closest?.('[data-terminal-game-tabs]')) return;
      e.preventDefault();
      e.stopPropagation();
      const order = GAME_ORDER;
      const idx = order.indexOf(currentGame);
      if (idx < 0) return;
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const next = order[(idx + delta + order.length) % order.length];
      setCurrentGame(next);
      requestAnimationFrame(() => gameTabRefs.current[next]?.focus?.());
    },
    [currentGame],
  );

  // Frecce ← / → cambiano app quando il focus non è sulle tab (gestite sopra), né su input, né in sala giochi
  useEffect(() => {
    if (bootPhase !== 'ready') return undefined;
    const onWindowKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const ae = document.activeElement;
      if (ae?.closest?.('[data-terminal-app-tabs]')) return;
      if (ae?.closest?.('[data-terminal-game-tabs]')) return;
      if (ae?.tagName === 'INPUT' || ae?.tagName === 'TEXTAREA' || ae?.isContentEditable) return;
      if (currentApp === APPS.ARCADE) return;
      e.preventDefault();
      e.stopPropagation();
      const order = APP_ORDER;
      const idx = order.indexOf(currentApp);
      if (idx < 0) return;
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      setCurrentApp(order[(idx + delta + order.length) % order.length]);
    };
    window.addEventListener('keydown', onWindowKey, true);
    return () => window.removeEventListener('keydown', onWindowKey, true);
  }, [bootPhase, currentApp]);

  const handleTogglePower = useCallback(() => {
    onSwitchToModern();
  }, [onSwitchToModern]);

  const handleAppChange = (app) => {
    setCurrentApp(app);
  };

  const handleGameChange = (game) => {
    setCurrentGame(game);
  };

  const renderGame = useCallback(() => {
    const color = COLOR_PROFILES[terminalColor].main;
    switch (currentGame) {
      case GAMES.SNAKE: return <SnakeGame color={color} />;
      case GAMES.FLAPPY: return <FlappyGame color={color} />;
      case GAMES.DINO: return <DinoGame color={color} />;
      case GAMES.SPACE: return <SpaceInvadersGame color={color} />;
      default: return <SnakeGame color={color} />;
    }
  }, [currentGame, terminalColor, COLOR_PROFILES]);

  const renderApp = useCallback(() => {
    const color = COLOR_PROFILES[terminalColor].main;
    switch (currentApp) {
      case APPS.ORACLE: return <OracleApp color={color} />;
      case APPS.SLOT: return <SlotApp color={color} />;
      case APPS.EXCUSE: return <ExcuseApp color={color} />;
      case APPS.ARCADE: return (
        <div className="w-full h-full flex flex-col">
          {/* GAME SELECTOR TABS - Sub menu */}
          <div
            role="tablist"
            data-terminal-game-tabs
            onKeyDownCapture={handleGameTabsKeyDownCapture}
            className="flex shrink-0 items-center justify-center gap-1 border-b border-[var(--t-color)] border-opacity-30 p-1 sm:gap-2 sm:p-2"
          >
            {GAME_ORDER.map((game) => (
              <motion.button
                key={game}
                ref={(el) => {
                  gameTabRefs.current[game] = el;
                }}
                type="button"
                role="tab"
                tabIndex={currentGame === game ? 0 : -1}
                onClick={() => handleGameChange(game)}
                className={`border px-2 py-1 text-[8px] font-black uppercase tracking-wider transition-all sm:text-[9px] ${
                  currentGame === game
                    ? 'border-[var(--t-color)] bg-[var(--t-color)] text-[#070b07]'
                    : 'border-[var(--t-color)] border-opacity-30 text-[var(--t-color)] hover:border-opacity-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(GAME_TITLE_KEYS[game])}
              </motion.button>
            ))}
          </div>
          {/* Game Area */}
          <div className="flex-1 flex items-center justify-center overflow-hidden p-1 sm:p-2 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentGame}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 w-full h-full flex items-center justify-center p-2"
              >
                {renderGame()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      );
      default: return <OracleApp color={color} />;
    }
  }, [currentApp, currentGame, terminalColor, COLOR_PROFILES, renderGame, t, handleGameTabsKeyDownCapture]);

  const profile = COLOR_PROFILES[terminalColor];

  const bootTitleHtml = useMemo(() => ({ __html: t('terminal.boot.title') }), [t]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex cursor-none items-center justify-center overflow-hidden p-0"
      style={{
        background: '#0a0a0a',
        '--t-color': profile.main,
        '--t-color-glow': profile.glow,
        '--t-color-glow-strong': profile.glowStrong,
        '--t-color-beam': profile.beam,
        '--t-color-beam-strong': profile.beamStrong,
        color: profile.main,
      }}
      onPointerMove={(e) => setRetroCursor({ x: e.clientX, y: e.clientY, on: true })}
      onPointerLeave={() => setRetroCursor((s) => ({ ...s, on: false }))}
    >

      <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-3 md:p-4">

        {/* MONITOR BODY - Ultra-realistic plastic casing */}
        <div className="w-full h-full relative flex flex-col overflow-hidden rounded-lg sm:rounded-xl"
          style={{
            background: 'linear-gradient(175deg, #ddd9cb 0%, #d6d2c4 8%, #ccc8b8 20%, #c8c4b2 35%, #c0bca8 50%, #b8b4a0 65%, #b0ab95 80%, #a8a38d 92%, #9a9580 100%)',
            boxShadow: `
              inset 0 2px 0 rgba(255,255,255,0.7),
              inset 0 -2px 3px rgba(0,0,0,0.15),
              inset 2px 0 0 rgba(255,255,255,0.4),
              inset -2px 0 0 rgba(0,0,0,0.08),
              inset 0 0 40px rgba(0,0,0,0.03),
              0 20px 60px -20px rgba(0,0,0,0.8),
              0 8px 30px -10px rgba(0,0,0,0.5),
              0 0 0 1px rgba(0,0,0,0.15)
            `,
          }}>
          {/* Subtle plastic grain texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px 256px',
            }} />

          {/* Edge highlights and reflections */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <div className="absolute top-[2px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          {/* Corner wear marks */}
          <div className="absolute top-0 left-0 w-20 h-20 opacity-10"
            style={{
              background: 'radial-gradient(ellipse at 0% 0%, rgba(0,0,0,0.3), transparent 70%)',
            }} />
          <div className="absolute top-0 right-0 w-20 h-20 opacity-10"
            style={{
              background: 'radial-gradient(ellipse at 100% 0%, rgba(0,0,0,0.3), transparent 70%)',
            }} />

          {/* ── TOP BEZEL ── */}
          <div className={`flex items-center justify-center px-3 sm:px-6 lg:px-8 shrink-0 relative h-5 sm:h-8 md:h-10`}>
            <div className="absolute top-0 left-4 sm:left-6 right-4 sm:right-6 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            {/* Brand logo area */}
            <div className="flex items-center gap-2 sm:gap-3 relative">
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 bg-[#33ff33] shadow-[0_0_6px_#33ff33,0_0_12px_rgba(51,255,51,0.4)]`} />
              <span className="font-black uppercase text-[8px] xs:text-[10px] sm:text-[12px] md:text-[14px] tracking-[0.3em] sm:tracking-[0.5em]"
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  color: '#3d3828',
                  textShadow: '0 1px 0 rgba(255,255,255,0.4), 0 -0.5px 0 rgba(0,0,0,0.1)',
                }}>
                BACK SOFTWARE
              </span>
            </div>
          </div>

          {/* ── SCREEN AREA ── */}
          <div className="flex-1 relative" style={{ minHeight: 0, marginLeft: '4px', marginRight: '4px', marginTop: '2px', marginBottom: '2px' }}>
            
            {/* Outer screen bezel */}
            <div className="absolute inset-0 overflow-hidden rounded-sm sm:rounded-md"
              style={{
                background: 'linear-gradient(160deg, #4a4840 0%, #3d3b30 15%, #2e2c22 40%, #252318 60%, #1e1c14 80%, #1a1810 100%)',
                boxShadow: `
                inset 0 3px 8px rgba(0,0,0,0.95),
                inset 0 -2px 5px rgba(0,0,0,0.6),
                inset 3px 0 6px rgba(0,0,0,0.5),
                inset -3px 0 6px rgba(0,0,0,0.5),
                0 2px 0 rgba(255,255,255,0.12),
                0 -1px 0 rgba(0,0,0,0.4)
              `,
              }}>
              {/* Bevel edge highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/15 via-transparent to-transparent" />

              {/* Inner bezel ring */}
              <div className="absolute inset-[2px] xs:inset-[3px] sm:inset-[4px] lg:inset-[6px] overflow-hidden rounded-sm"
                style={{
                  background: 'linear-gradient(180deg, #1a1a18 0%, #0d0d0c 100%)',
                  boxShadow: `
                  inset 0 0 6px rgba(0,0,0,0.9),
                  inset 0 1px 0 rgba(255,255,255,0.05),
                  0 0 1px rgba(255,255,255,0.08)
                `,
                }}>
                {/* Screen glass */}
                <div
                  className="crt-screen relative flex h-full w-full select-none flex-col overflow-hidden bg-[#070b07]"
                  style={{
                    boxShadow: 'inset 0 0 120px rgba(0,0,0,0.98), inset 0 0 40px rgba(0,12,0,0.6)',
                  }}
                >

                {/* Vignette */}
                <div className="absolute inset-0 z-10 crt-vignette" />

                {/* Glare reflection */}
                <div className="absolute inset-0 z-10 pointer-events-none" style={{
                  background: 'linear-gradient(125deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 20%, transparent 40%, transparent 80%, rgba(255,255,255,0.01) 100%)',
                }} />

                {/* Screen content wrapper */}
                <div className={`absolute inset-0 ${screenAnim} flex flex-col`}>

                  {/* APP SELECTOR TABS - Top */}
                  {bootPhase === 'ready' && (
                    <div
                      role="tablist"
                      aria-label={t('terminal.apps.tablistLabel')}
                      data-terminal-app-tabs
                      onKeyDownCapture={handleAppTabsKeyDownCapture}
                      className="relative z-20 flex flex-wrap items-center justify-center gap-3 border-b-2 border-[var(--t-color)] border-opacity-30 bg-[#070b07]/90 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md sm:gap-6 sm:p-5"
                    >
                      {/* Subtle gradient under the menu */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 translate-y-full bg-gradient-to-b from-[#070b07]/80 to-transparent" />

                      {APP_ORDER.map((app) => (
                        <motion.button
                          key={app}
                          ref={(el) => {
                            appTabRefs.current[app] = el;
                          }}
                          type="button"
                          role="tab"
                          aria-selected={currentApp === app}
                          tabIndex={currentApp === app ? 0 : -1}
                          onClick={() => handleAppChange(app)}
                          className={`border-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all sm:px-8 sm:py-3 sm:text-xs md:text-sm ${
                            currentApp === app
                              ? 'scale-105 border-[var(--t-color)] bg-[var(--t-color)] text-[#070b07] shadow-[0_0_20px_var(--t-color-glow-strong)]'
                              : 'border-[var(--t-color)] border-opacity-40 text-[var(--t-color)] hover:border-opacity-100 hover:bg-[var(--t-color)]/10 hover:shadow-[0_0_15px_var(--t-color-glow)]'
                          }`}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {t(APP_TITLE_KEYS[app])}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* BOOT SCREEN */}
                  {bootPhase === 'boot' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--t-color)] z-30">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg sm:text-xl font-black tracking-widest animate-pulse text-center"
                        dangerouslySetInnerHTML={bootTitleHtml}
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[10px] sm:text-xs mt-2 opacity-70"
                      >
                        {t('terminal.boot.loading')}
                      </motion.div>
                    </div>
                  )}

                  {/* APP CONTENT AREA */}
                  {bootPhase === 'ready' && (
                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentApp}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="w-full h-full flex flex-col font-mono"
                        >
                          {renderApp()}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* ── BOTTOM BEZEL ── */}
          <div className="h-10 xs:h-12 sm:h-[52px] md:h-[56px] shrink-0 flex items-center justify-between px-3 xs:px-4 sm:px-6 lg:px-8 gap-2 xs:gap-3 sm:gap-4 relative">
            {/* Top inner lip */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.12) 10%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.12) 90%, transparent)',
              }} />
            <div className="absolute top-[3px] left-0 right-0 h-[1px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.08) 50%, transparent)',
              }} />
            <div className="absolute bottom-0 left-0 right-0 h-[1px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.2) 15%, rgba(0,0,0,0.25) 50%, transparent)',
              }} />
            <div className="absolute bottom-[2px] left-0 right-0 h-[1px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 20%, transparent)',
              }} />

            {/* ── LEFT: screw + speaker grille ── */}
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
              <Screw />
              <div className="hidden sm:block relative p-[3px] pr-2"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.03))',
                  borderRadius: '2px',
                  boxShadow: `
                    inset 0 0.5px 0 rgba(255,255,255,0.15),
                    inset 0 -0.5px 0 rgba(0,0,0,0.1)
                  `,
                }}>
                <div className="flex gap-[1.5px]">
                  {[...Array(18)].map((_, i) => (
                    <div key={i} className="w-[2.5px] h-4 sm:h-5 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #7a7565, #6a655a, #7a7565)',
                        boxShadow: 'inset 0 0 1px rgba(0,0,0,0.3), 0 0 0.5px rgba(255,255,255,0.1)',
                      }} />
                  ))}
                </div>
              </div>
            </div>

            {/* ── CENTER: Model plate ── */}
            <div className="relative hidden lg:block">
              <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-center leading-tight"
                style={{
                  fontFamily: 'system-ui, sans-serif',
                  color: '#7a7565',
                  textShadow: '0 0.5px 0 rgba(255,255,255,0.2)',
                }}>
                <div>ARCADE-3 CRT</div>
                <div className="opacity-60">MADE IN IVREA, IT</div>
              </div>
            </div>

            {/* ── RIGHT: Color selector + Power + Screw ── */}
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
              {/* Color selector */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {bootPhase === 'ready' && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleTogglePower}
                    className="mr-1 xs:mr-2 px-2 sm:px-3 py-1 text-[7px] xs:text-[8px] sm:text-[10px] font-black uppercase tracking-wider border border-[var(--t-color)] text-[var(--t-color)] hover:bg-[var(--t-color)] hover:text-[#080c08] transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    <span className="hidden xs:inline">{t('terminal.arcade.exit')}</span>
                    <span className="xs:hidden">{t('terminal.arcade.exit').replace(/[→\s]+$/, '')}</span>
                  </motion.button>
                )}
                {Object.entries(COLOR_PROFILES).map(([name, p]) => (
                  <button key={name}
                    onClick={() => setTerminalColor(name)}
                    className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-200 relative"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${p.main}cc, ${p.main}66)`,
                      boxShadow: terminalColor === name
                        ? `0 0 6px ${p.main}, 0 0 12px ${p.glow}, inset 0 1px 2px rgba(255,255,255,0.5)`
                        : `inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.15)`,
                      border: terminalColor === name ? `1.5px solid ${p.main}` : '1px solid rgba(0,0,0,0.2)',
                    }}
                    title={name}
                  />
                ))}
              </div>
              
              {/* Power switch */}
              <div className="relative">
                <div className="text-[4px] xs:text-[5px] sm:text-[6px] font-black uppercase tracking-wider text-center mb-0.5 opacity-40"
                  style={{ fontFamily: 'system-ui, sans-serif', color: '#6a655a' }}>
                  POWER
                </div>
                <button onClick={handleTogglePower}
                  className="relative w-5 h-6 xs:w-5 xs:h-7 sm:w-6 sm:h-8 overflow-hidden cursor-pointer"
                  style={{
                    background: 'linear-gradient(180deg, #8a8580 0%, #7a7570 50%, #6a655a 100%)',
                    borderRadius: '3px',
                    boxShadow: `
                      inset 0 1px 2px rgba(0,0,0,0.4),
                      inset 0 -1px 1px rgba(255,255,255,0.15),
                      0 0 0 0.5px rgba(0,0,0,0.3),
                      0 2px 4px rgba(0,0,0,0.3)
                    `,
                  }}>
                  <div className="absolute inset-[2px] rounded-[2px] overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, #95908a 0%, #8a8580 50%, #7a7570 100%)',
                      boxShadow: 'inset 0 -1px 3px rgba(0,0,0,0.2), 0 0.5px 0 rgba(255,255,255,0.3)',
                    }}>
                    <div className="absolute top-[2px] left-0 right-0 text-center">
                      <span className="text-[4px] xs:text-[5px] font-black tracking-wider text-[#2d2818]" style={{ fontFamily: 'system-ui, sans-serif' }}>I</span>
                    </div>
                    <div className="absolute bottom-[2px] left-0 right-0 text-center">
                      <span className="text-[4px] xs:text-[5px] font-black tracking-wider text-[#8a856f] opacity-40" style={{ fontFamily: 'system-ui, sans-serif' }}>O</span>
                    </div>
                    <div className="absolute top-1/2 left-1 right-1 h-[0.5px] bg-black/15 -translate-y-1/2" />
                  </div>
                </button>
              </div>
            </div>
            <Screw />
          </div>
        </div>
      </div>

      {retroCursor.on ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[100000] box-border border border-[#0a0a0a]"
          style={{
            width: 12,
            height: 20,
            left: retroCursor.x,
            top: retroCursor.y,
            transform: 'translate(2px, 2px)',
            background: profile.main,
            boxShadow: `0 0 8px ${profile.glowStrong}, inset 0 0 0 1px rgba(255,255,255,0.35)`,
            animation: 'terminal-cursor-blink 1.05s steps(1, end) infinite',
            imageRendering: 'pixelated',
          }}
        />
      ) : null}
    </div>
  );
}

/* ===========================================================
   SCREW COMPONENT — Ultra-realistic Phillips-head screw
=========================================================== */
function Screw() {
  return (
    <div className="relative shrink-0" style={{ width: '18px', height: '18px' }}>
      <div className="absolute inset-0 rounded-full" style={{
        background: 'conic-gradient(from 0deg, #c8c4b4, #ddd9cb, #c8c4b4, #b0ab95, #c8c4b4, #ddd9cb, #c8c4b4)',
        boxShadow: `
          inset 0 1.5px 3px rgba(0,0,0,0.35),
          0 1px 1.5px rgba(255,255,255,0.4),
          0 0 0 0.5px rgba(0,0,0,0.15),
          0 2px 4px rgba(0,0,0,0.2)
        `,
      }}>
        <div className="absolute inset-[2.5px] rounded-full" style={{
          background: 'conic-gradient(from 45deg, #a8a490, #c0bca8, #a8a490, #959080, #a8a490)',
          boxShadow: 'inset 0 0.5px 1.5px rgba(0,0,0,0.3), 0 0 0.5px rgba(255,255,255,0.15)',
        }}>
          <div className="absolute top-1/2 left-[2px] right-[2px] h-[1.5px] -translate-y-1/2"
            style={{
              background: 'linear-gradient(90deg, transparent 5%, #4a4535 20%, #3a3525 50%, #4a4535 80%, transparent 95%)',
              boxShadow: 'inset 0 0.5px 1px rgba(0,0,0,0.5)',
            }} />
          <div className="absolute left-1/2 top-[2px] bottom-[2px] w-[1.5px] -translate-x-1/2"
            style={{
              background: 'linear-gradient(180deg, transparent 5%, #4a4535 20%, #3a3525 50%, #4a4535 80%, transparent 95%)',
              boxShadow: 'inset 0.5px 0 1px rgba(0,0,0,0.5)',
            }} />
        </div>
      </div>
      <div className="absolute top-[4px] left-[4px] w-[3px] h-[3px] rounded-full bg-white/20" />
    </div>
  );
}
