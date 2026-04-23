'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const LENS_RADIUS = 120;
const LENS_SIZE = LENS_RADIUS * 2;
const HERO_CURSOR = 36;

function resolveCursorMode(clientX, clientY, lensOn) {
  const stack = document.elementsFromPoint(clientX, clientY);
  for (let i = 0; i < stack.length; i += 1) {
    const el = stack[i];
    if (!el || typeof el.closest !== 'function') continue;
    if (el.closest('[data-no-custom-cursor]')) return 'default';
    if (lensOn && el.closest('[data-custom-cursor-why]')) return 'why';
    if (el.closest('[data-custom-cursor-hero]')) return 'hero';
  }
  return 'default';
}

/** Hero — compact tech ring (instant follow via props x,y). */
function HeroTechCursor({ x, y }) {
  const left = x - HERO_CURSOR / 2;
  const top = y - HERO_CURSOR / 2;
  return (
    <div
      className="fixed z-[200] pointer-events-none"
      style={{ left, top, width: HERO_CURSOR, height: HERO_CURSOR }}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full border border-[#2d2818]/25 bg-[#f5f2ec]/[0.08] shadow-[0_0_0_1px_rgba(196,180,148,0.25),inset_0_0_12px_rgba(255,252,245,0.35)]" />
      <motion.div
        className="absolute inset-[3px] rounded-full border border-dashed border-[#8a7f6a]/50"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-[10px] rounded-full bg-gradient-to-br from-[#2d2818]/90 to-[#4a4336]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: '0 0 20px rgba(196, 180, 148, 0.35)' }}
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      />
    </div>
  );
}

/** Why Us — ring only (center stays clear so white layer + mask read correctly). */
function WhyLensCursor({ x, y }) {
  const left = x - LENS_RADIUS;
  const top = y - LENS_RADIUS;
  return (
    <div
      className="fixed z-[200] pointer-events-none rounded-full"
      style={{
        left,
        top,
        width: LENS_SIZE,
        height: LENS_SIZE,
        background: 'transparent',
        boxShadow: `
          inset 0 0 0 1px rgba(245, 242, 236, 0.55),
          inset 0 0 28px rgba(255, 252, 245, 0.08),
          0 0 0 1px rgba(0,0,0,0.25),
          0 20px 50px rgba(0,0,0,0.25)
        `,
      }}
      aria-hidden
    >
      <motion.div
        className="pointer-events-none absolute inset-4 rounded-full border border-[#c4b494]/35"
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      />
    </div>
  );
}

/**
 * Custom cursors — instant 1:1 pointer, system cursor hidden only over hero/why (not nav).
 * Why Us: light duplicate clipped to a circle (--lens-x/y on whyClipRef, element is full-viewport wide so coords match the pointer); lens ring only.
 */
export default function SiteCursorOverlay({ whyClipRef, lensDesktopEnabled, scrollContainerRef }) {
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);
  const [mode, setMode] = useState('default');
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const lastPointerRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const heroCursorOn = finePointer && !reduceMotion;
  const lensOn = Boolean(lensDesktopEnabled) && finePointer && !reduceMotion;

  const updateLensCoords = useCallback(
    (clientX, clientY) => {
      const el = whyClipRef?.current;
      if (!el || !lensOn) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lens-x', `${clientX - r.left}px`);
      el.style.setProperty('--lens-y', `${clientY - r.top}px`);
    },
    [whyClipRef, lensOn],
  );

  const applyAtClientPoint = useCallback(
    (clientX, clientY) => {
      if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return;
      lastPointerRef.current = { x: clientX, y: clientY };
      setPos({ x: clientX, y: clientY });

      const next = resolveCursorMode(clientX, clientY, lensOn);
      setMode(next);

      if (next === 'why') updateLensCoords(clientX, clientY);
      else if (whyClipRef?.current) {
        whyClipRef.current.style.removeProperty('--lens-x');
        whyClipRef.current.style.removeProperty('--lens-y');
      }
    },
    [lensOn, whyClipRef, updateLensCoords],
  );

  useEffect(() => {
    if (!heroCursorOn && !lensOn) return undefined;

    const onMove = (e) => {
      applyAtClientPoint(e.clientX, e.clientY);
    };

    const resyncFromLastPointer = () => {
      const { x, y } = lastPointerRef.current;
      if (x <= -1000 || y <= -1000) return;
      applyAtClientPoint(x, y);
    };

    let wheelRaf = 0;
    const onWheel = () => {
      if (wheelRaf) cancelAnimationFrame(wheelRaf);
      wheelRaf = requestAnimationFrame(() => {
        wheelRaf = 0;
        resyncFromLastPointer();
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });

    const scrollEl = scrollContainerRef?.current;
    if (scrollEl) scrollEl.addEventListener('scroll', resyncFromLastPointer, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('wheel', onWheel);
      if (wheelRaf) cancelAnimationFrame(wheelRaf);
      if (scrollEl) scrollEl.removeEventListener('scroll', resyncFromLastPointer);
    };
  }, [heroCursorOn, lensOn, applyAtClientPoint, scrollContainerRef]);

  useEffect(() => {
    const hide =
      (mode === 'hero' && heroCursorOn) || (mode === 'why' && lensOn);
    const root = document.documentElement;
    if (hide) root.classList.add('site-system-cursor-off');
    else root.classList.remove('site-system-cursor-off');
    return () => root.classList.remove('site-system-cursor-off');
  }, [mode, heroCursorOn, lensOn]);

  if (!heroCursorOn && !lensOn) return null;

  return (
    <>
      {heroCursorOn && mode === 'hero' ? <HeroTechCursor x={pos.x} y={pos.y} /> : null}
      {lensOn && mode === 'why' ? <WhyLensCursor x={pos.x} y={pos.y} /> : null}
    </>
  );
}
