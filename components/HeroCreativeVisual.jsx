'use client';

import React, { useId, useEffect, useState, useRef, useCallback } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
} from 'framer-motion';

const SPRING_TILT = { stiffness: 220, damping: 26, mass: 0.42 };
const SPRING_SHIFT = { stiffness: 340, damping: 32, mass: 0.32 };
const SPRING_ROTZ = { stiffness: 200, damping: 28, mass: 0.4 };
const RING_R = 190;
const RING_C = 2 * Math.PI * RING_R;

const PALETTE = ['#2d2818', '#3d3528', '#4a4336', '#5a5041', '#6a6050', '#8a7f6a', '#a8987a', '#c4b494'];

function pickStroke(angle) {
  const t = (angle + Math.PI) / (Math.PI * 2);
  const i = Math.floor(t * PALETTE.length) % PALETTE.length;
  return PALETTE[i];
}

/** Press burst — shape varies by position + angle (deterministic “signature”). */
function PressBurst({ nx, ny, angle, dist, archetype }) {
  const color = pickStroke(angle);
  const accent = PALETTE[(Math.floor(nx * 6) + Math.floor(ny * 6)) % PALETTE.length];
  const hub = {
    position: 'absolute',
    left: `${nx * 100}%`,
    top: `${ny * 100}%`,
    width: 0,
    height: 0,
    transform: 'translate(-50%, -50%)',
  };

  if (archetype === 0) {
    return (
      <div style={hub} className="pointer-events-none">
        {[0, 0.1, 0.2].map((delay, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: 48,
              height: 48,
              marginLeft: -24,
              marginTop: -24,
              borderColor: i === 0 ? color : accent,
              opacity: 0.75 - i * 0.15,
            }}
            initial={{ scale: 0.15, opacity: 0.9 }}
            animate={{ scale: 3.2 + dist * 0.5, opacity: 0 }}
            transition={{ duration: 0.62, delay, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    );
  }

  if (archetype === 1) {
    const rays = 10;
    const rotBase = (angle * 180) / Math.PI;
    return (
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${nx * 100}%`,
          top: `${ny * 100}%`,
          width: 0,
          height: 0,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {Array.from({ length: rays }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 left-0 w-[2px] h-[72px] rounded-full origin-bottom"
            style={{
              marginLeft: '-1px',
              rotate: `${rotBase + i * (360 / rays)}deg`,
              background: `linear-gradient(to top, ${color}, transparent)`,
            }}
            initial={{ scaleY: 0.15, opacity: 1 }}
            animate={{ scaleY: 2.5, opacity: 0 }}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
    );
  }

  if (archetype === 2) {
    return (
      <div style={hub} className="pointer-events-none">
        <motion.div
          className="border-[2.5px] border-dashed"
          style={{
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderColor: color,
            borderRadius: '22%',
          }}
          initial={{ scale: 0.2, rotate: 0, opacity: 0.95 }}
          animate={{ scale: 2.8 + dist * 0.4, rotate: 108 + dist * 40, opacity: 0 }}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    );
  }

  if (archetype === 3) {
    const spin = (angle * 180) / Math.PI;
    return (
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${nx * 100}%`,
          top: `${ny * 100}%`,
          width: 0,
          height: 0,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            left: -28,
            top: -28,
            width: 56,
            height: 56,
            background: `radial-gradient(circle, ${accent}66 0%, transparent 68%)`,
          }}
          initial={{ scale: 0.2, opacity: 1 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
        {[0, 90, 180, 270].map((deg, i) => (
          <motion.div
            key={deg}
            className="absolute h-px w-14 origin-center bg-current"
            style={{
              color,
              left: -28,
              top: -0.5,
              rotate: `${deg + spin}deg`,
              transformOrigin: '50% 50%',
            }}
            initial={{ scaleX: 0.2, opacity: 0.9 }}
            animate={{ scaleX: 2.8, opacity: 0 }}
            transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
    );
  }

  /* archetype 4 — shard burst */
  const shards = 12;
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${nx * 100}%`,
        top: `${ny * 100}%`,
        width: 0,
        height: 0,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {Array.from({ length: shards }).map((_, i) => {
        const a = (i / shards) * Math.PI * 2 + angle;
        const push = 52 + dist * 28;
        return (
          <motion.div
            key={i}
            className="absolute h-4 w-1.5 rounded-sm"
            style={{
              left: -3,
              top: -8,
              background: i % 2 === 0 ? color : accent,
              rotate: `${(a * 180) / Math.PI + 90}deg`,
            }}
            initial={{ scale: 0.35, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: 1.15,
              opacity: 0,
              x: Math.cos(a) * push,
              y: Math.sin(a) * push,
            }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}

/**
 * Hero visual — deep 3D, mouse follow (tilt + shift + roll), scroll ring, localized press bursts.
 */
export default function HeroCreativeVisual({
  scrollContainerRef,
  sectionRef,
  caption,
  pointerHint,
}) {
  const reduceMotion = useReducedMotion();
  const reactId = useId();
  const id = reactId.replace(/:/g, '');
  const captionId = `hero-visual-cap-${id}`;
  const [finePointer, setFinePointer] = useState(false);
  const [impulses, setImpulses] = useState([]);
  const impulseSeq = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const rm = Boolean(reduceMotion);

  const scrollTiltX = useTransform(scrollYProgress, (p) => (rm ? 0 : p * 22 - p * p * 3));
  const scrollTiltY = useTransform(scrollYProgress, (p) => (rm ? 0 : p * -26 + p * p * 5));
  const scrollZ = useTransform(scrollYProgress, (p) => (rm ? 0 : p * -104));
  const scrollScale = useTransform(scrollYProgress, (p) => (rm ? 1 : 1 - p * 0.09));
  const gridShift = useTransform(scrollYProgress, (p) => (rm ? 0 : p * 14));
  const dashSlide = useTransform(scrollYProgress, (p) => (rm ? 0 : p * 100));
  const specX = useTransform(scrollYProgress, (p) => (rm ? 50 : 36 + p * 28));
  const specY = useTransform(scrollYProgress, (p) => (rm ? 48 : 34 + p * 30));
  const innerLift = useTransform(scrollYProgress, (p) => (rm ? 0 : p * 38));
  const backPlateRotateX = useTransform(scrollYProgress, (p) => (rm ? 0 : p * -8));
  const ringDashOffset = useTransform(scrollYProgress, (p) => RING_C * (1 - p));
  const scrollRotZ = useTransform(scrollYProgress, (p) => (rm ? 0 : p * -7));
  const specularBg = useTransform(
    [specX, specY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,252,245,0.55) 0%, rgba(255,252,245,0) 46%)`,
  );

  const pointerTargetX = useMotionValue(0);
  const pointerTargetY = useMotionValue(0);
  const pointerShiftX = useMotionValue(0);
  const pointerShiftY = useMotionValue(0);
  const pointerRotZ = useMotionValue(0);

  const springPointerX = useSpring(pointerTargetX, SPRING_TILT);
  const springPointerY = useSpring(pointerTargetY, SPRING_TILT);
  const springShiftX = useSpring(pointerShiftX, SPRING_SHIFT);
  const springShiftY = useSpring(pointerShiftY, SPRING_SHIFT);
  const springRotZ = useSpring(pointerRotZ, SPRING_ROTZ);

  const pointerActive = finePointer && !rm;

  const rotateX = useTransform([scrollTiltX, springPointerX], ([s, px]) => (s ?? 0) + (px ?? 0));
  const rotateY = useTransform([scrollTiltY, springPointerY], ([s, py]) => (s ?? 0) + (py ?? 0));
  const rotateZ = useTransform([scrollRotZ, springRotZ], ([s, rz]) => (s ?? 0) + (rz ?? 0));

  const innerCounterX = useTransform(springPointerX, (v) => -v * 0.38);
  const innerCounterY = useTransform(springPointerY, (v) => -v * 0.38);

  const resetPointerMotion = useCallback(() => {
    pointerTargetX.set(0);
    pointerTargetY.set(0);
    pointerShiftX.set(0);
    pointerShiftY.set(0);
    pointerRotZ.set(0);
  }, [pointerTargetX, pointerTargetY, pointerShiftX, pointerShiftY, pointerRotZ]);

  const applyPointerFromNormalized = useCallback(
    (nx, ny) => {
      pointerTargetX.set(ny * -42);
      pointerTargetY.set(nx * 48);
      pointerShiftX.set(nx * 36);
      pointerShiftY.set(ny * 30);
      pointerRotZ.set(nx * 14 - ny * 6);
    },
    [pointerTargetX, pointerTargetY, pointerShiftX, pointerShiftY, pointerRotZ],
  );

  useEffect(() => {
    if (!pointerActive) {
      resetPointerMotion();
      return undefined;
    }
    const onWindowMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = e.clientX / w - 0.5;
      const ny = e.clientY / h - 0.5;
      applyPointerFromNormalized(nx, ny);
    };
    window.addEventListener('mousemove', onWindowMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onWindowMove);
      resetPointerMotion();
    };
  }, [pointerActive, applyPointerFromNormalized, resetPointerMotion]);

  const addImpulse = useCallback(
    (e) => {
      if (rm || e.button !== 0) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      const angle = Math.atan2(ny - 0.5, nx - 0.5);
      const dist = Math.min(1.2, Math.hypot(nx - 0.5, ny - 0.5) * 2.2);
      const cell = Math.floor(nx * 5.99) + Math.floor(ny * 5.99) * 6;
      const archetype = (cell + Math.round((angle + Math.PI) * 2)) % 5;
      const id = ++impulseSeq.current;
      setImpulses((s) => [...s.slice(-6), { id, nx, ny, angle, dist, archetype }]);
      window.setTimeout(() => {
        setImpulses((s) => s.filter((x) => x.id !== id));
      }, 720);
    },
    [rm],
  );

  const spin = (duration, direction = 1) =>
    rm ? {} : { animate: { rotate: direction * 360 }, transition: { repeat: Infinity, duration, ease: 'linear' } };

  const floatY = rm
    ? {}
    : {
        animate: { y: [0, -7, 0] },
        transition: { repeat: Infinity, duration: 5.5, ease: [0.45, 0, 0.55, 1] },
      };

  return (
    <figure
      className="flex flex-col items-center justify-center w-full gap-2 sm:gap-2.5 m-0 touch-pan-y"
      aria-labelledby={captionId}
    >
      <div
        className="relative w-full max-w-[min(100%,min(92vw,380px))] sm:max-w-[min(100%,420px)] aspect-square max-h-[min(36vh,220px)] sm:max-h-[min(40vh,260px)] lg:max-h-none xl:min-h-[300px]"
        style={{ perspective: 'min(520px, 92vw)' }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none text-[#2d2818]"
          viewBox="0 0 400 400"
          aria-hidden
        >
          <g transform={`translate(200 200) rotate(-90)`}>
            <circle r={RING_R} fill="none" stroke="currentColor" strokeWidth="2" className="opacity-[0.1]" />
            <motion.circle
              r={RING_R}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="opacity-[0.22]"
              strokeDasharray={RING_C}
              style={{ strokeDashoffset: ringDashOffset }}
            />
          </g>
        </svg>

        <motion.div
          className={`relative z-10 w-full h-full [transform-style:preserve-3d] ${pointerActive ? 'cursor-grab active:cursor-grabbing' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.85, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onPointerDown={addImpulse}
          style={{
            rotateX,
            rotateY,
            rotateZ,
            translateZ: scrollZ,
            x: springShiftX,
            y: springShiftY,
            scale: scrollScale,
            transformStyle: 'preserve-3d',
            willChange: rm ? undefined : 'transform',
          }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-[6%] rounded-[32%] opacity-[0.18] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 38%, #2d2818 0%, transparent 72%)',
              translateZ: -58,
              rotateX: backPlateRotateX,
              transformStyle: 'preserve-3d',
            }}
            aria-hidden
          />

          <motion.div
            className="absolute inset-0 rounded-[38%] pointer-events-none mix-blend-soft-light opacity-[0.72]"
            style={{
              translateZ: 68,
              background: specularBg,
              transformStyle: 'preserve-3d',
            }}
            aria-hidden
          />

          <motion.div
            className="relative w-full h-full [transform-style:preserve-3d]"
            style={{
              translateZ: innerLift,
              rotateX: innerCounterX,
              rotateY: innerCounterY,
              transformStyle: 'preserve-3d',
            }}
            aria-hidden
          >
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible" fill="none">
              <defs>
                <radialGradient id={`heroCore-${id}`} cx="50%" cy="48%" r="50%">
                  <stop offset="0%" stopColor="#c4b494" stopOpacity="0.65" />
                  <stop offset="45%" stopColor="#8a7f6a" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#2d2818" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`heroRing-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9c2b6" />
                  <stop offset="50%" stopColor="#a69b88" />
                  <stop offset="100%" stopColor="#7a6f5e" />
                </linearGradient>
                <filter id={`heroSoft-${id}`} x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <motion.g stroke="#5a5041" strokeWidth="0.45" style={{ opacity: 0.26, translateY: gridShift }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={`v${i}`} x1={52 + i * 37} y1="72" x2={52 + i * 37} y2="328" />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`h${i}`} x1="52" y1={72 + i * 37} x2="348" y2={72 + i * 37} />
                ))}
              </motion.g>

              <g transform="translate(200 200)">
                <motion.g {...spin(48, 1)}>
                  <motion.circle
                    r="168"
                    stroke={`url(#heroRing-${id})`}
                    strokeWidth="1.2"
                    strokeDasharray="4 10"
                    opacity="0.65"
                    style={{ strokeDashoffset: dashSlide }}
                  />
                </motion.g>

                <motion.g {...spin(36, -1)}>
                  <circle
                    r="142"
                    stroke="#9a8f7c"
                    strokeWidth="0.9"
                    strokeDasharray="1 6"
                    opacity="0.55"
                  />
                </motion.g>

                <motion.g {...spin(22, 1)}>
                  {[0, 72, 144, 216, 288].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    const r = 130;
                    const x = Math.cos(rad) * r;
                    const y = Math.sin(rad) * r;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={i % 2 === 0 ? 5 : 3.5}
                        fill={i % 2 === 0 ? '#2d2818' : '#5a5041'}
                        opacity="0.92"
                      />
                    );
                  })}
                </motion.g>

                <motion.g {...spin(28, -1)}>
                  <path
                    d="M -95 -55 Q 0 -120 95 -55 T 95 55 Q 0 120 -95 55 T -95 -55"
                    stroke="#b5a78f"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.44"
                    strokeDasharray="8 14"
                  />
                </motion.g>

                <motion.g {...spin(18, 1)}>
                  <circle
                    r="88"
                    stroke="#2d2818"
                    strokeWidth="1.3"
                    strokeDasharray="2 5"
                    opacity="0.32"
                  />
                </motion.g>

                <motion.g {...spin(14, -1)}>
                  <rect
                    x="-62"
                    y="-62"
                    width="124"
                    height="124"
                    rx="28"
                    stroke="#5a5041"
                    strokeWidth="1.1"
                    opacity="0.36"
                    transform="rotate(12)"
                  />
                </motion.g>

                <motion.g {...floatY}>
                  <circle r="54" fill={`url(#heroCore-${id})`} filter={`url(#heroSoft-${id})`} />
                  <motion.circle
                    r="38"
                    stroke="#2d2818"
                    strokeWidth="1.5"
                    fill="rgba(245,242,236,0.4)"
                    animate={rm ? {} : { opacity: [0.52, 0.92, 0.52] }}
                    transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
                  />
                  <circle r="6" fill="#2d2818" opacity="0.94" />
                </motion.g>

                <motion.g {...spin(32, -1)} opacity="0.58">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const r0 = 102;
                    const r1 = 112;
                    return (
                      <line
                        key={deg}
                        x1={Math.cos(rad) * r0}
                        y1={Math.sin(rad) * r0}
                        x2={Math.cos(rad) * r1}
                        y2={Math.sin(rad) * r1}
                        stroke="#4a4336"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </motion.g>
              </g>
            </svg>
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden>
          {impulses.map((imp) => (
            <PressBurst key={imp.id} {...imp} />
          ))}
        </div>
      </div>

      <figcaption
        id={captionId}
        className="text-center text-[11px] sm:text-xs font-semibold leading-snug text-[#6a6050] max-w-[16rem] sm:max-w-xs tracking-tight px-1"
      >
        {caption}
        {pointerActive && pointerHint ? (
          <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#9a9080]">
            {pointerHint}
          </span>
        ) : null}
      </figcaption>

      <motion.div
        className="flex justify-center text-[#8a7f6a]"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          animate={rm ? {} : { y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.85, ease: [0.4, 0, 0.6, 1] }}
        >
          <path
            d="M12 5v14M5 12l7 7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.65"
          />
        </motion.svg>
      </motion.div>
    </figure>
  );
}
