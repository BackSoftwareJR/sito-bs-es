'use client';

import React, { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../lib/i18n-context';

/** File names in `public/images/` — 4 foto Case Famiglia (stesso set per entrambi i caroselli). */
const CASE_FAMIGLIA_FILES = [
  'WhatsApp Image 2026-04-22 at 00.52.33.jpeg',
  'WhatsApp Image 2026-04-22 at 00.52.33 (1).jpeg',
  'WhatsApp Image 2026-04-22 at 00.52.33 (3).jpeg',
  'WhatsApp Image 2026-04-22 at 00.52.33 (4).jpeg',
];

const CAROUSEL_SLIDE_COUNT = CASE_FAMIGLIA_FILES.length;

function publicImage(filename) {
  return encodeURI(`/images/${filename}`);
}

/** Fisher–Yates — ordine diverso per carosello sinistro/destro. */
function shuffleSlideDeck(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TEXT_ROTATION_MS = 10000;
const LEFT_IMAGE_MS = 5200;
const RIGHT_IMAGE_MS = 5800;

/** Carosello verticale: foto + striscia controlli clay affiancata (non sopra il soggetto). */
function SideCarousel({
  sources,
  alts,
  idx,
  onPrev,
  onNext,
  onPick,
  reduceMotion,
  ariaPrev,
  ariaNext,
}) {
  const n = sources.length;
  if (n === 0) {
    return (
      <div className="mx-auto aspect-[9/16] w-full max-w-[8.75rem] animate-pulse rounded-[1.05rem] bg-[#e4dfd6] sm:max-w-[10rem] md:max-w-[10.75rem]" />
    );
  }
  return (
    <div
      className="mx-auto flex w-full max-w-[8.75rem] items-stretch overflow-hidden rounded-[1.05rem] border border-[#e0d9cf] bg-[#ebe7e0] shadow-[inset_0_1px_0_rgba(255,252,245,0.55),0_6px_18px_rgba(45,40,24,0.07)] sm:max-w-[10rem] md:max-w-[10.75rem]"
      role="group"
      aria-roledescription="carousel"
    >
      <div className="relative min-h-[11.5rem] min-w-0 flex-1 aspect-[9/16] sm:min-h-[12.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={idx}
            src={sources[idx]}
            alt={alts[idx]}
            className="absolute inset-0 h-full w-full object-cover"
            initial={reduceMotion ? false : { opacity: 0.35 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2d2818]/22 via-transparent to-transparent" />
      </div>

      {/* Striscia dedicata: precedente · indicatori · successiva */}
      <nav
        aria-label="Scorrimento foto"
        className="flex w-[2.125rem] shrink-0 flex-col items-center border-l border-[#d4cfc5]/55 bg-gradient-to-b from-[#faf8f4] via-[#f3efe8] to-[#ebe6df] py-2 shadow-[inset_3px_0_12px_rgba(255,252,245,0.65)] sm:w-9 sm:py-2.5"
      >
        <button
          type="button"
          aria-label={ariaPrev}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#d4cfc5]/70 bg-[#fdfcf9] text-[13px] font-semibold leading-none text-[#4a4336] shadow-[0_2px_8px_rgba(45,40,24,0.06)] transition-colors hover:border-[#c4b494] hover:bg-white hover:text-[#2d2818] active:scale-95 sm:h-8 sm:w-8"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
        >
          ↑
        </button>

        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-2">
          {sources.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Foto ${i + 1} di ${n}`}
              aria-current={i === idx ? 'true' : undefined}
              className={`rounded-full transition-all duration-300 ease-out ${i === idx ? 'h-7 w-1.5 bg-[#7c6f5b] shadow-[0_0_0_1px_rgba(124,111,91,0.25)]' : 'h-2 w-2 bg-[#c4b494]/45 hover:bg-[#a89880]/65'}`}
              onClick={(e) => {
                e.stopPropagation();
                onPick(i);
              }}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label={ariaNext}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#d4cfc5]/70 bg-[#fdfcf9] text-[13px] font-semibold leading-none text-[#4a4336] shadow-[0_2px_8px_rgba(45,40,24,0.06)] transition-colors hover:border-[#c4b494] hover:bg-white hover:text-[#2d2818] active:scale-95"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        >
          ↓
        </button>
      </nav>
    </div>
  );
}

export default function CaseFamigliaServiceCard({
  service,
  variants,
  className,
  expanded,
  onExpandHover,
  onCollapseHover,
  onTouchToggle,
  onOpenDetail,
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const [fineHover, setFineHover] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(0);
  const [textIdx, setTextIdx] = useState(0);
  /** Stesso pool di 4 foto, ordini shuffled separati per carosello (rigenerati ad ogni apertura). */
  const [leftDeck, setLeftDeck] = useState([]);
  const [rightDeck, setRightDeck] = useState([]);
  const touchAnchorRef = useRef(null);

  useLayoutEffect(() => {
    if (!expanded) {
      setLeftDeck([]);
      setRightDeck([]);
      return;
    }
    const base = CASE_FAMIGLIA_FILES.map((filename, i) => ({
      src: publicImage(filename),
      alt: t(`services.caseFamiglia.expand.imageAlt${i}`),
    }));
    setLeftDeck(shuffleSlideDeck(base));
    setRightDeck(shuffleSlideDeck(base));
    setLeftIdx(0);
    setRightIdx(Math.floor(Math.random() * CAROUSEL_SLIDE_COUNT));
  }, [expanded, t]);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setFineHover(mq.matches);
    sync();
    setMediaReady(true);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const slides = [
    t('services.caseFamiglia.expand.slide0'),
    t('services.caseFamiglia.expand.slide1'),
    t('services.caseFamiglia.expand.slide2'),
  ];

  useEffect(() => {
    if (!expanded || reduceMotion || leftDeck.length === 0) return undefined;
    const id = window.setInterval(() => {
      setLeftIdx((i) => (i + 1) % CAROUSEL_SLIDE_COUNT);
    }, LEFT_IMAGE_MS);
    return () => window.clearInterval(id);
  }, [expanded, reduceMotion, leftDeck.length]);

  useEffect(() => {
    if (!expanded || reduceMotion || rightDeck.length === 0) return undefined;
    const id = window.setInterval(() => {
      setRightIdx((i) => (i + 1) % CAROUSEL_SLIDE_COUNT);
    }, RIGHT_IMAGE_MS);
    return () => window.clearInterval(id);
  }, [expanded, reduceMotion, rightDeck.length]);

  useEffect(() => {
    if (!expanded || reduceMotion) return undefined;
    const id = window.setInterval(() => {
      setTextIdx((i) => (i + 1) % slides.length);
    }, TEXT_ROTATION_MS);
    return () => window.clearInterval(id);
  }, [expanded, reduceMotion]);

  useEffect(() => {
    if (!expanded) {
      setLeftIdx(0);
      setRightIdx(0);
      setTextIdx(0);
    }
  }, [expanded]);

  const stepLeft = useCallback((dir) => {
    setLeftIdx((i) => {
      const n = CAROUSEL_SLIDE_COUNT;
      return ((i + dir) % n + n) % n;
    });
  }, []);
  const stepRight = useCallback((dir) => {
    setRightIdx((i) => {
      const n = CAROUSEL_SLIDE_COUNT;
      return ((i + dir) % n + n) % n;
    });
  }, []);

  const handleMouseEnter = () => {
    if (fineHover) onExpandHover?.();
  };
  const handleMouseLeave = () => {
    if (fineHover) onCollapseHover?.();
  };

  const handleCardPointerDown = (e) => {
    touchAnchorRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleCardClick = (e) => {
    if (!mediaReady) {
      onOpenDetail();
      return;
    }
    if (fineHover) {
      onOpenDetail();
      return;
    }
    if (e.target.closest('[data-cf-expand-panel]')) return;
    const anchor = touchAnchorRef.current;
    touchAnchorRef.current = null;
    if (anchor && Math.hypot(e.clientX - anchor.x, e.clientY - anchor.y) > 14) return;
    e.preventDefault();
    e.stopPropagation();
    onTouchToggle?.();
  };

  const handleCta = (e) => {
    e.stopPropagation();
    onOpenDetail();
  };

  return (
    <motion.div
      layout
      variants={variants}
      transition={{ layout: { duration: reduceMotion ? 0.12 : 0.38, ease: [0.22, 1, 0.36, 1] } }}
      className={`relative z-0 w-full self-start transition-[z-index] duration-200 ${expanded ? 'z-20' : ''} ${className ?? ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      onPointerDown={handleCardPointerDown}
      aria-expanded={expanded}
    >
      {/* Single clay surface — grows as one unit (no second card stacked below) */}
      <div
        className={`clay-card overflow-hidden rounded-[1.15rem] sm:rounded-[1.35rem] ${expanded ? 'ring-1 ring-[#c4b494]/25 shadow-[12px_16px_36px_rgba(166,159,147,0.28)]' : ''}`}
      >
        {/* Header row — always part of the same card */}
        <div className="group flex min-h-[68px] cursor-pointer items-center gap-3 px-4 py-2.5 sm:min-h-[92px] sm:gap-5 sm:px-6 sm:py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg shadow-sm transition-transform clay-pill bg-[#f5f2ec] group-hover:scale-110 sm:h-11 sm:w-11 sm:text-xl">
            {service.icon}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <h4 className="text-sm font-black leading-tight text-[#2d2818] transition-colors group-hover:text-[#7c6f5b] sm:text-base">
              {service.title}
            </h4>
            <p className="line-clamp-2 text-[11px] text-[#6a6050] opacity-90 sm:text-xs">{service.desc}</p>
          </div>
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d4cfc5] bg-[#f5f2ec] text-xs text-[#3d3828] transition-transform sm:h-8 sm:w-8 sm:text-sm ${expanded ? 'rotate-45' : 'group-hover:rotate-45'}`}
            aria-hidden="true"
          >
            ↗
          </span>
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.14 : 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="border-t border-[#d4cfc5]/25 bg-gradient-to-b from-[#f0ebe3]/90 to-transparent px-3 pb-3 pt-2.5 sm:px-5 sm:pb-4 sm:pt-3"
                data-cf-expand-panel
              >
                {/* Mobile: carousels top row → text below. Desktop: L | center | R */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(176px,1.35fr)_minmax(0,1fr)] md:gap-x-4 md:gap-y-0">
                  <div className="col-start-1 row-start-1 md:col-start-1 md:row-start-1">
                    <SideCarousel
                      sources={leftDeck.map((x) => x.src)}
                      alts={leftDeck.map((x) => x.alt)}
                      idx={leftIdx}
                      onPrev={() => stepLeft(-1)}
                      onNext={() => stepLeft(1)}
                      onPick={setLeftIdx}
                      reduceMotion={reduceMotion}
                      ariaPrev={t('services.caseFamiglia.expand.prevLeft')}
                      ariaNext={t('services.caseFamiglia.expand.nextLeft')}
                    />
                  </div>
                  <div className="col-start-2 row-start-1 md:col-start-3 md:row-start-1">
                    <SideCarousel
                      sources={rightDeck.map((x) => x.src)}
                      alts={rightDeck.map((x) => x.alt)}
                      idx={rightIdx}
                      onPrev={() => stepRight(-1)}
                      onNext={() => stepRight(1)}
                      onPick={setRightIdx}
                      reduceMotion={reduceMotion}
                      ariaPrev={t('services.caseFamiglia.expand.prevRight')}
                      ariaNext={t('services.caseFamiglia.expand.nextRight')}
                    />
                  </div>

                  <div className="col-span-2 flex flex-col justify-center gap-2.5 md:col-span-1 md:col-start-2 md:row-start-1 md:gap-2 md:py-0.5">
                    <p className="text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.12em] text-[#8a7f6a] sm:text-left sm:text-[11px]">
                      {t('services.caseFamiglia.expand.partner')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
                      <span className="rounded-full border border-[#d4cfc5]/60 bg-[#fdfcf9]/80 px-2.5 py-1 text-[9px] font-semibold text-[#5e5444] shadow-sm sm:text-[10px]">
                        {t('services.caseFamiglia.expand.pillA')}
                      </span>
                      <span className="rounded-full border border-[#d4cfc5]/60 bg-[#fdfcf9]/80 px-2.5 py-1 text-[9px] font-semibold text-[#5e5444] shadow-sm sm:text-[10px]">
                        {t('services.caseFamiglia.expand.pillB')}
                      </span>
                    </div>
                    <div className="relative min-h-[3.6rem] sm:min-h-[3.45rem]">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                          key={textIdx}
                          initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                          transition={{ duration: reduceMotion ? 0.1 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="text-center text-[12px] leading-snug text-[#4a4336] sm:text-left sm:text-[13px] sm:leading-relaxed"
                        >
                          {slides[textIdx]}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5 sm:justify-start">
                      <button
                        type="button"
                        data-cf-cta
                        onClick={handleCta}
                        className="inline-flex items-center justify-center rounded-full border border-[#c4b494]/55 bg-[#fdfcf9] px-4 py-2 text-[11px] font-bold tracking-wide text-[#2d2818] shadow-[0_2px_10px_rgba(45,40,24,0.07)] transition-transform hover:scale-[1.02] active:scale-[0.98] sm:text-xs"
                      >
                        {t('services.caseFamiglia.expand.cta')}
                      </button>
                      <span className="text-[9px] text-[#9a9184] sm:text-[10px]">{t('services.caseFamiglia.expand.hint')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
