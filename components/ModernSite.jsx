'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../lib/i18n-context';
import { ShinyButton } from './ui/shiny-button';
import PhoneGallery from './PhoneGallery';
import LanguageSwitcher from './LanguageSwitcher';
import HeroCreativeVisual from './HeroCreativeVisual';
import SiteCursorOverlay from './cursors/SiteCursorOverlay';
import CaseFamigliaServiceCard from './services/CaseFamigliaServiceCard';
import WhyUsDualContent from './why-us/WhyUsDualContent';

/**
 * Con Case Famiglia espansa: griglia md a 2 colonne — CF a sinistra (4 righe),
 * Siti + Marketing + Foto + Grafica impilati a destra, Software sotto a tutta larghezza.
 */
function serviziGridPlacementWhenCfExpanded(key) {
  switch (key) {
    case 'caseFamiglia':
      return 'md:col-span-1 md:row-span-4 md:col-start-1 md:row-start-1';
    case 'sitiLanding':
      return 'md:col-start-2 md:row-start-1';
    case 'marketing':
      return 'md:col-start-2 md:row-start-2';
    case 'fotoVideo':
      return 'md:col-start-2 md:row-start-3';
    case 'graficaCopy':
      return 'md:col-start-2 md:row-start-4';
    case 'software':
      return 'md:col-span-2 md:col-start-1 md:row-start-5';
    default:
      return '';
  }
}

/* ===========================================================
   MODERN TYPEWRITER — animated placeholder for modern form
=========================================================== */
function ModernTypewriter({ servizio, t }) {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const getPlaceholders = () => {
    // Build a locale-aware lookup from translated service display name -> key.
    const serviceKeyMap = {
      [t('contact.form.step2.services.siti')]: 'siti',
      [t('contact.form.step2.services.marketing')]: 'marketing',
      [t('contact.form.step2.services.foto')]: 'foto',
      [t('contact.form.step2.services.grafica')]: 'grafica',
      [t('contact.form.step2.services.software')]: 'software',
      [t('contact.form.step2.services.casa')]: 'casa',
      [t('contact.form.step2.services.altro')]: 'altro',
    };

    // `servizio` may also be a service title or title + package (e.g. "Siti Web - Landing"),
    // so we match via startsWith against the known display names.
    const match = Object.keys(serviceKeyMap).find(name => name && servizio && servizio.startsWith(name));
    const key = match ? serviceKeyMap[match] : null;
    if (key) {
      const placeholders = [
        t(`contact.form.step3.placeholders.${key}.0`),
        t(`contact.form.step3.placeholders.${key}.1`),
        t(`contact.form.step3.placeholders.${key}.2`),
      ];
      return placeholders;
    }
    return [t('contact.form.step3.placeholderDefault')];
  };

  React.useEffect(() => {
    const placeholders = getPlaceholders();
    const currentText = placeholders[currentIdx];

    if (isTyping && idx < currentText.length) {
      const timer = setTimeout(() => {
        setText(currentText.slice(0, idx + 1));
        setIdx(prev => prev + 1);
      }, 55);
      return () => clearTimeout(timer);
    }

    if (isTyping && idx >= currentText.length) {
      setIsTyping(false);
      const timer = setTimeout(() => {
        setIdx(prev => prev - 1);
      }, 3200);
      return () => clearTimeout(timer);
    }

    if (!isTyping && idx > 0) {
      const timer = setTimeout(() => {
        setText(currentText.slice(0, idx - 1));
        setIdx(prev => prev - 1);
      }, 32);
      return () => clearTimeout(timer);
    }

    if (!isTyping && idx === 0) {
      setCurrentIdx(prev => (prev + 1) % placeholders.length);
      setIsTyping(true);
    }
  }, [idx, servizio, currentIdx, isTyping]);

  React.useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 p-4 pointer-events-none flex items-start"
      style={{ color: '#a69f93' }}>
      <span className="font-medium text-sm">{text}</span>
      {showCursor && <span className="inline-block w-0.5 h-5 bg-[#a69f93] ml-0.5 animate-pulse" />}
    </div>
  );
}

/* ===========================================================
   PROJECT CARD — Animated card with FLIP layout transitions
=========================================================== */
function ProjectCard({ project, index, isCompact, onClick, direction, enableMorph }) {
  return (
    <motion.div
      layout={enableMorph}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, x: direction > 0 ? -14 : 14 }}
      transition={{
        duration: enableMorph ? 0.22 : 0.2,
        delay: Math.min(index * (enableMorph ? 0.008 : 0.004), enableMorph ? 0.06 : 0.04),
        ease: [0.22, 1, 0.36, 1],
        layout: enableMorph ? {
          type: 'spring',
          stiffness: 520,
          damping: 44,
          mass: 0.6,
        } : undefined,
      }}
      onClick={onClick}
      className={`cursor-pointer group overflow-hidden relative clay-card-dark ${
        isCompact
          ? 'p-3 sm:p-4 flex flex-col justify-between min-h-[104px]'
          : 'p-5 sm:p-6 min-h-[196px]'
      } transform-gpu will-change-transform`}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="absolute top-0 left-6 right-6 h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(196, 180, 148, 0.2) 50%, transparent 100%)' }} />
      <div className={`absolute opacity-[0.05] font-black tracking-tighter text-[#d4cabb] select-none ${isCompact ? 'top-0 right-0 p-2 sm:p-3 text-2xl sm:text-4xl' : 'top-1 right-1 sm:top-0 sm:right-0 p-2 sm:p-3 text-4xl sm:text-4xl'}`}>{project.year}</div>

      <div className={isCompact ? '' : 'flex justify-between items-start mb-3'}>
        <h4 className={`font-black leading-tight text-[#ede8de] group-hover:text-[#f5f2ec] ${isCompact ? 'text-sm pr-8' : 'text-base sm:text-lg max-w-[80%]'}`}>
          {project.n}
        </h4>
        {!isCompact && <div className="w-8 h-8 flex items-center justify-center rounded-full text-sm clay-pill-dark text-[#b8ad98] group-hover:rotate-45 transition-transform">↗</div>}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!isCompact ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: '#9a9484' }}>{project.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 3).map(t => (
                <span key={t} className="px-2 py-1 text-[10px] font-black uppercase tracking-wider clay-pill-dark text-[#8a7f6a]">{t}</span>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="compact"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-auto pt-2 flex justify-between items-end"
          >
            <span className="text-xs text-[#7a7568] font-bold">{project.year}</span>
            <div className="w-6 h-6 flex items-center justify-center rounded-full text-xs clay-pill-dark text-[#b8ad98] group-hover:rotate-45 transition-transform">↗</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ===========================================================
   MODERN SITE — CLAYMORPHISM MODE (COMPLETE LANDING PAGE)
   NOTE: Only use REAL data from https://backsoftware.it
   NEVER invent information, stats, or claims not present on the official site.
=========================================================== */

export default function ModernSite({ onSwitchToTerminal }) {
  const { t, locale } = useI18n();
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [caseFamigliaExpanded, setCaseFamigliaExpanded] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('all');
  const [categoryDirection, setCategoryDirection] = useState(1);
  const [categoryTransitionType, setCategoryTransitionType] = useState('morph');
  const [showFooter, setShowFooter] = useState(false);
  const [isMockupMode, setIsMockupMode] = useState(false);
  const contactSectionRef = useRef(null);
  const footerCardRef = useRef(null);
  const modernSnapScrollRef = useRef(null);
  const heroSectionRef = useRef(null);
  const whySectionRef = useRef(null);
  const whyLensClipRef = useRef(null);
  const [lensDesktopEnabled, setLensDesktopEnabled] = useState(false);
  const [footerStrokeActive, setFooterStrokeActive] = useState(false);

  // Orbiting text around header — pixel-perfect (mobile & desktop refs)
  const headerRefMobile = useRef(null);
  const headerRefDesktop = useRef(null);
  const orbitSvgRefMobile = useRef(null);
  const orbitSvgRefDesktop = useRef(null);
  const orbitRef1Mobile = useRef(null);
  const orbitRef1Desktop = useRef(null);
  const orbitRef2Mobile = useRef(null);
  const orbitRef2Desktop = useRef(null);
  const [headerPathMobile, setHeaderPathMobile] = useState('');
  const [headerPathDesktop, setHeaderPathDesktop] = useState('');
  const [orbitTextMobile, setOrbitTextMobile] = useState('');
  const [orbitTextDesktop, setOrbitTextDesktop] = useState('');
  const [pathLenMobile, setPathLenMobile] = useState(0);
  const [pathLenDesktop, setPathLenDesktop] = useState(0);
  const [isDesktopView, setIsDesktopView] = useState(false);
  const ORBIT_TOKEN = 'BACK SOFTWARE \u2022 ';
  const DESKTOP_ORBIT_FONT_SIZE = 8;
  const DESKTOP_ORBIT_LETTER_SPACING = 1.2;
  const DESKTOP_ORBIT_SPEED = 16.8;

  useEffect(() => {
    const media = window.matchMedia('(min-width: 640px)');
    const syncViewport = () => setIsDesktopView(media.matches);
    syncViewport();

    if (media.addEventListener) {
      media.addEventListener('change', syncViewport);
      return () => media.removeEventListener('change', syncViewport);
    }

    media.addListener(syncViewport);
    return () => media.removeListener(syncViewport);
  }, []);

  useEffect(() => {
    const m = window.matchMedia('(min-width: 1024px)');
    const sync = () => setLensDesktopEnabled(m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  }, []);

  // Detect if viewed inside iframe mockup preview
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isMockup = urlParams.has('mockup') || urlParams.has('preview');
      setIsMockupMode(isMockup);
    }
  }, []);

  useEffect(() => {
    const recalcMobile = () => {
      const el = headerRefMobile.current;
      const svg = orbitSvgRefMobile.current;
      if (!el || !svg) return;

      const w = el.clientWidth;
      const h = el.clientHeight;
      const r = Math.min(h / 2, 16);
      const pad = 12;
      const left = -pad;
      const right = w + pad;
      const top = -pad;
      const bottom = h + pad;
      const rr = Math.min(r + pad, h / 2 + pad);

      const startX = (left + right) / 2;
      const path = [
        `M ${startX} ${top}`,
        `H ${right - rr}`,
        `A ${rr} ${rr} 0 0 1 ${right} ${top + rr}`,
        `V ${bottom - rr}`,
        `A ${rr} ${rr} 0 0 1 ${right - rr} ${bottom}`,
        `H ${left + rr}`,
        `A ${rr} ${rr} 0 0 1 ${left} ${bottom - rr}`,
        `V ${top + rr}`,
        `A ${rr} ${rr} 0 0 1 ${left + rr} ${top}`,
        `H ${startX}`,
        'Z',
      ].join(' ');

      setHeaderPathMobile(path);

      const pathWidth = right - left;
      const pathHeight = bottom - top;
      const straight = 2 * (pathWidth + pathHeight - rr * 4);
      const curved = 2 * Math.PI * rr;
      const perimeter = straight + curved;
      setPathLenMobile(perimeter);

      const measureContext = document.createElement('canvas').getContext('2d');
      let tokenWidth = 54;
      if (measureContext) {
        measureContext.font = `700 6px sans-serif`;
        tokenWidth = measureContext.measureText(ORBIT_TOKEN).width;
      }

      const reps = Math.max(2, Math.round(perimeter / tokenWidth));
      setOrbitTextMobile(Array(reps).fill(ORBIT_TOKEN).join(''));
    };

    const recalcDesktop = () => {
      const el = headerRefDesktop.current;
      if (!el) return;

      const w = el.clientWidth;
      const h = el.clientHeight;
      const computed = window.getComputedStyle(el);
      const baseRadius = parseFloat(computed.borderTopLeftRadius) || Math.min(h / 2, 28);
      const orbitInset = 6;
      const left = -orbitInset;
      const right = w + orbitInset;
      const top = -orbitInset;
      const bottom = h + orbitInset;
      const rr = Math.max(
        0,
        Math.min(
          baseRadius + orbitInset,
          (w + orbitInset * 2) / 2,
          (h + orbitInset * 2) / 2,
        ),
      );

      const startX = (left + right) / 2;
      const path = [
        `M ${startX} ${top}`,
        `H ${right - rr}`,
        `A ${rr} ${rr} 0 0 1 ${right} ${top + rr}`,
        `V ${bottom - rr}`,
        `A ${rr} ${rr} 0 0 1 ${right - rr} ${bottom}`,
        `H ${left + rr}`,
        `A ${rr} ${rr} 0 0 1 ${left} ${bottom - rr}`,
        `V ${top + rr}`,
        `A ${rr} ${rr} 0 0 1 ${left + rr} ${top}`,
        `H ${startX}`,
        'Z',
      ].join(' ');

      setHeaderPathDesktop(path);

      const pathWidth = w + orbitInset * 2;
      const pathHeight = h + orbitInset * 2;
      const straight = 2 * (pathWidth + pathHeight - rr * 4);
      const curved = 2 * Math.PI * rr;
      const perimeter = straight + curved;
      setPathLenDesktop(perimeter);

      const measureContext = document.createElement('canvas').getContext('2d');
      let tokenWidth = 80;
      if (measureContext) {
        measureContext.font = `800 ${DESKTOP_ORBIT_FONT_SIZE}px sans-serif`;
        const baseWidth = measureContext.measureText(ORBIT_TOKEN).width;
        const trackingWidth = DESKTOP_ORBIT_LETTER_SPACING * Math.max(0, ORBIT_TOKEN.length - 1);
        tokenWidth = baseWidth + trackingWidth;
      }

      const reps = Math.max(2, Math.round(perimeter / tokenWidth));
      setOrbitTextDesktop(Array(reps).fill(ORBIT_TOKEN).join(''));
    };

    recalcMobile();
    recalcDesktop();
    
    const ro = new ResizeObserver(() => {
      recalcMobile();
      recalcDesktop();
    });
    
    if (headerRefMobile.current) ro.observe(headerRefMobile.current);
    if (headerRefDesktop.current) ro.observe(headerRefDesktop.current);
    
    return () => ro.disconnect();
  }, []);

  // Detect dark/light background under header
  const [orbitOnDark, setOrbitOnDark] = useState(false);

  useEffect(() => {
    const check = () => {
      const headerDesktop = headerRefDesktop.current;
      const headerMobile = headerRefMobile.current;
      
      const header = headerDesktop || headerMobile;
      if (!header) return;
      
      const rect = header.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const darkSections = document.querySelectorAll('[data-dark-section]');
      let inDark = false;
      darkSections.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) inDark = true;
      });
      setOrbitOnDark(inDark);
    };
    check();
    const scroller = document.querySelector('.modern-snap-container');
    if (scroller) scroller.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      if (scroller) scroller.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  // Animate orbiting text - mobile only in mobile viewport
  useEffect(() => {
    if (isDesktopView || pathLenMobile <= 0) return;

    let mobileOffset = 0;
    let raf;
    let lastTs = performance.now();
    const MOBILE_SPEED = 14;

    const step = (ts) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      mobileOffset = (mobileOffset + MOBILE_SPEED * dt) % pathLenMobile;
      if (orbitRef1Mobile.current) orbitRef1Mobile.current.setAttribute('startOffset', mobileOffset);
      if (orbitRef2Mobile.current) orbitRef2Mobile.current.setAttribute('startOffset', mobileOffset - pathLenMobile);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame((ts) => {
      lastTs = ts;
      step(ts);
    });

    return () => cancelAnimationFrame(raf);
  }, [isDesktopView, pathLenMobile]);

  // Animate orbiting text - desktop only in desktop viewport
  useEffect(() => {
    if (!isDesktopView || pathLenDesktop <= 0) return;

    let desktopOffset = 0;
    let raf;
    let lastTs = performance.now();

    const step = (ts) => {
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      desktopOffset = (desktopOffset + DESKTOP_ORBIT_SPEED * dt) % pathLenDesktop;
      if (orbitRef1Desktop.current) orbitRef1Desktop.current.setAttribute('startOffset', desktopOffset);
      if (orbitRef2Desktop.current) orbitRef2Desktop.current.setAttribute('startOffset', desktopOffset - pathLenDesktop);

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame((ts) => {
      lastTs = ts;
      step(ts);
    });

    return () => cancelAnimationFrame(raf);
  }, [isDesktopView, pathLenDesktop]);

  // Orbit color: brownish on light, warm beige on dark
  const orbitColor = orbitOnDark ? '#d4cabb' : '#5a5244';
  const orbitColorMobile = orbitColor;

  // Footer reveal on wheel in contact section
  useEffect(() => {
    const section = contactSectionRef.current;
    if (!section) return;
    let cooldown = false;
    const onWheel = (e) => {
      // Only act if this section is actually in view (snapped)
      const rect = section.getBoundingClientRect();
      if (Math.abs(rect.top) > 50) return;
      // When footer is open, block ALL scroll events to prevent snap from firing
      if (showFooter) {
        e.preventDefault();
        e.stopPropagation();
        if (!cooldown && e.deltaY < -30) {
          setShowFooter(false);
          cooldown = true;
          setTimeout(() => { cooldown = false; }, 600);
        }
        return;
      }
      if (e.deltaY > 30 && !cooldown) {
        e.preventDefault();
        setShowFooter(true);
        cooldown = true;
        setTimeout(() => { cooldown = false; }, 600);
      }
    };
    section.addEventListener('wheel', onWheel, { passive: false });
    return () => section.removeEventListener('wheel', onWheel);
  }, [showFooter]);

  const handleFooterPointerMove = (e) => {
    const el = footerCardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    const hue = 34 + xPct * 0.14;
    const saturation = 60 + (100 - yPct) * 0.09;
    el.style.setProperty('--footer-stroke-y', `${yPct}%`);
    el.style.setProperty('--footer-stroke-x', `${xPct}%`);
    el.style.setProperty('--footer-stroke-h', `${hue.toFixed(2)}`);
    el.style.setProperty('--footer-stroke-s', `${saturation.toFixed(2)}%`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  };

  const sectionTitleClass = 'text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[0.96]';
  const sectionTitleReveal = {
    initial: { opacity: 0, y: 42, filter: 'blur(8px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { amount: 0.58, once: false },
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] }
  };
  const sectionSubtitleReveal = {
    initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { amount: 0.52, once: false },
    transition: { duration: 0.58, delay: 0.1, ease: [0.22, 1, 0.36, 1] }
  };

  // Clean SVG icon components — unique per service
  const IconCasaFamiglia = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M12 11.5c.8-.9 2.5-.9 2.5.7 0 1.8-2.5 3.3-2.5 3.3s-2.5-1.5-2.5-3.3c0-1.6 1.7-1.6 2.5-.7z" />
    </svg>
  );
  const IconSitiLanding = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <rect x="2" y="3" width="20" height="16" rx="2" />
      <path d="M2 8h20" />
      <circle cx="5" cy="5.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="5.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="10" cy="5.5" r="0.75" fill="currentColor" stroke="none" />
      <path d="M8 22l4-3 4 3" />
    </svg>
  );
  const IconMarketing = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
  const IconFotoVideo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <rect x="1" y="5" width="15" height="14" rx="2" />
      <path d="M16 9.5l5-3v11l-5-3z" />
    </svg>
  );
  const IconGraficaCopy = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
  const IconDigitali = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 8h20" />
      <path d="M7 12l3 3-3 3" />
      <path d="M13 17h4" />
    </svg>
  );

  const handleCloseService = () => {
    const source = selectedService?.source;
    setSelectedService(null);
    setTimeout(() => {
      const targetId = source === 'progetti' ? 'progetti' : 'servizi';
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const services = useMemo(() => [
    {
      key: 'caseFamiglia',
      icon: <IconCasaFamiglia />,
      title: t('services.caseFamiglia.title'),
      desc: t('services.caseFamiglia.desc'),
      details: t('services.caseFamiglia.details'),
      packages: [
        { key: '6mesi', name: t('services.caseFamiglia.packages.6mesi.name'), desc: t('services.caseFamiglia.packages.6mesi.desc') },
        { key: '3mesi', name: t('services.caseFamiglia.packages.3mesi.name'), desc: t('services.caseFamiglia.packages.3mesi.desc') },
        { key: 'spot', name: t('services.caseFamiglia.packages.spot.name'), desc: t('services.caseFamiglia.packages.spot.desc') }
      ],
      span: 'md:col-span-2',
      source: 'servizi'
    },
    {
      key: 'sitiLanding',
      icon: <IconSitiLanding />,
      title: t('services.sitiLanding.title'),
      source: 'servizi',
      desc: t('services.sitiLanding.desc'),
      details: t('services.sitiLanding.details'),
      packages: [
        { key: '5-10', name: t('services.sitiLanding.packages.5-10.name'), desc: t('services.sitiLanding.packages.5-10.desc') },
        { key: 'landing', name: t('services.sitiLanding.packages.landing.name'), desc: t('services.sitiLanding.packages.landing.desc') }
      ],
      span: '',
      source: 'servizi'
    },
    {
      key: 'marketing',
      icon: <IconMarketing />,
      title: t('services.marketing.title'),
      source: 'servizi',
      desc: t('services.marketing.desc'),
      details: t('services.marketing.details'),
      packages: [
        { key: 'analisi', name: t('services.marketing.packages.analisi.name'), desc: t('services.marketing.packages.analisi.desc') },
        { key: 'meta', name: t('services.marketing.packages.meta.name'), desc: t('services.marketing.packages.meta.desc') },
        { key: 'google', name: t('services.marketing.packages.google.name'), desc: t('services.marketing.packages.google.desc') }
      ],
      span: '',
      source: 'servizi'
    },
    {
      key: 'fotoVideo',
      icon: <IconFotoVideo />,
      title: t('services.fotoVideo.title'),
      source: 'servizi',
      desc: t('services.fotoVideo.desc'),
      details: t('services.fotoVideo.details'),
      packages: [
        { key: 'foto', name: t('services.fotoVideo.packages.foto.name'), desc: t('services.fotoVideo.packages.foto.desc') },
        { key: 'drone', name: t('services.fotoVideo.packages.drone.name'), desc: t('services.fotoVideo.packages.drone.desc') },
        { key: 'staff', name: t('services.fotoVideo.packages.staff.name'), desc: t('services.fotoVideo.packages.staff.desc') }
      ],
      span: '',
      source: 'servizi'
    },
    {
      key: 'graficaCopy',
      icon: <IconGraficaCopy />,
      title: t('services.graficaCopy.title'),
      source: 'servizi',
      desc: t('services.graficaCopy.desc'),
      details: t('services.graficaCopy.details'),
      packages: [
        { key: 'grafica', name: t('services.graficaCopy.packages.grafica.name'), desc: t('services.graficaCopy.packages.grafica.desc') },
        { key: 'copy', name: t('services.graficaCopy.packages.copy.name'), desc: t('services.graficaCopy.packages.copy.desc') }
      ],
      span: '',
      source: 'servizi'
    },
    {
      key: 'software',
      icon: <IconDigitali />,
      title: t('services.software.title'),
      source: 'servizi',
      desc: t('services.software.desc'),
      details: t('services.software.details'),
      packages: [
        { key: 'gestionali', name: t('services.software.packages.gestionali.name'), desc: t('services.software.packages.gestionali.desc') },
        { key: 'app', name: t('services.software.packages.app.name'), desc: t('services.software.packages.app.desc') },
        { key: 'api', name: t('services.software.packages.api.name'), desc: t('services.software.packages.api.desc') }
      ],
      span: 'md:col-span-2',
      source: 'servizi'
    },
  ], [t]);

  // Per-project static metadata (not translated). Localized name, desc, and tags come from the messages file.
  const projectMeta = useMemo(() => ([
    { key: 'cantina', categoryKey: 'management', year: '2025' },
    { key: 'crmMagazzino', categoryKey: 'management', year: '2024' },
    { key: 'bpres', categoryKey: 'management', year: '2024' },
    { key: 'autodemolizioni', categoryKey: 'crm', year: '2024' },
    { key: 'sevenLakes', categoryKey: 'website', year: '2024' },
    { key: 'saluteDomicilio', categoryKey: 'website', year: '2024' },
    { key: 'crmTask', categoryKey: 'management', year: '2024' },
    { key: 'myPlace', categoryKey: 'website', year: '2024' },
    { key: 'marazzato', categoryKey: 'website', year: '2024' },
    { key: 'villaKatia', categoryKey: 'marketing', year: '2024' },
    { key: 'quercia', categoryKey: 'marketing', year: '2024' },
    { key: 'gramsci', categoryKey: 'marketing', year: '2024' },
    { key: 'benissimo', categoryKey: 'marketing', year: '2024' },
    { key: 'anziani', categoryKey: 'marketing', year: '2024' },
  ]), []);

  const projects = useMemo(() => projectMeta.map(({ key, categoryKey, year }) => {
    const rawTags = t(`projects.items.${key}.tags`);
    return {
      key,
      n: t(`projects.items.${key}.name`),
      desc: t(`projects.items.${key}.desc`),
      tags: Array.isArray(rawTags) ? rawTags : [],
      categoryKey,
      year,
      images: [],
    };
  }), [projectMeta, t]);

  // Group projects by category for modern view. Use category KEYS as state to avoid breaking on locale change.
  const categoryKeys = ['management', 'website', 'marketing', 'crm'];
  const allCategoryKeys = ['all', ...categoryKeys];

  const getCategoryDisplayName = (key) => t(`projects.categories.${key}`);

  const handleCategoryChange = (catKey) => {
    if (catKey === selectedCategoryKey) return;
    const prevIndex = allCategoryKeys.indexOf(selectedCategoryKey);
    const nextIndex = allCategoryKeys.indexOf(catKey);
    const prevIsCompact = selectedCategoryKey === 'all';
    const nextIsCompact = catKey === 'all';

    setCategoryTransitionType(prevIsCompact !== nextIsCompact ? 'morph' : 'swap');
    setCategoryDirection(nextIndex >= prevIndex ? 1 : -1);
    setSelectedCategoryKey(catKey);
  };

  const isCompactCategory = selectedCategoryKey === 'all';
  const visibleProjects = useMemo(() => {
    if (isCompactCategory) return projects;
    return projects.filter(p => p.categoryKey === selectedCategoryKey);
  }, [projects, isCompactCategory, selectedCategoryKey]);

  const galleryGridVariants = {
    initial: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -30 : 30,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 1, 1],
      },
    }),
  };

  const footerServiceLinks = useMemo(() => ([
    { label: t('footer.links.web'), href: '#servizi' },
    { label: t('footer.links.marketing'), href: '#servizi' },
    { label: t('footer.links.grafica'), href: '#servizi' },
    { label: t('footer.links.video'), href: '#servizi' },
  ]), [t]);

  const footerCompanyLinks = useMemo(() => ([
    { label: t('footer.links.howWeWork'), href: '#come-lavoriamo' },
    { label: t('footer.links.contacts'), href: '#contatti' },
    { label: t('footer.links.pricing'), href: '#servizi' },
  ]), [t]);
  const workflowSteps = useMemo(() => ([
    {
      key: 'analysis',
      number: '01',
      title: t('services.workflow.analysis.title'),
      desc: t('services.workflow.analysis.desc'),
    },
    {
      key: 'design',
      number: '02',
      title: t('services.workflow.design.title'),
      desc: t('services.workflow.design.desc'),
    },
    {
      key: 'launch',
      number: '03',
      title: t('services.workflow.launch.title'),
      desc: t('services.workflow.launch.desc'),
    },
  ]), [t]);

  // Contact form state
  const initialFormData = {
    nome: '',
    azienda: '',
    email: '',
    prefissoTelefono: '+39',
    telefono: '',
    servizio: '',
    descrizione: ''
  };

  const [formData, setFormData] = useState({
    ...initialFormData
  });
  const [formStep, setFormStep] = useState(1);
  const [formDirection, setFormDirection] = useState(1);
  const stackLayers = [1, 2, 3];

  const serviziOptions = [
    t('contact.form.step2.services.siti'),
    t('contact.form.step2.services.marketing'),
    t('contact.form.step2.services.foto'),
    t('contact.form.step2.services.grafica'),
    t('contact.form.step2.services.software'),
    t('contact.form.step2.services.casa'),
    t('contact.form.step2.services.altro'),
  ];

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const goToNextStep = () => {
    setFormDirection(1);
    setFormStep(prev => Math.min(4, prev + 1));
  };

  const goToPrevStep = () => {
    setFormDirection(-1);
    setFormStep(prev => Math.max(1, prev - 1));
  };

  const normalizedEmail = formData.email.trim();
  const normalizedPrefix = formData.prefissoTelefono.trim();
  const normalizedPhone = formData.telefono.replace(/\s+/g, '');
  const fullPhoneNumber = `${normalizedPrefix} ${normalizedPhone}`.trim();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizedEmail);
  const isPhonePrefixValid = /^\+\d{1,4}$/.test(normalizedPrefix);
  const isPhoneValid = /^\d{6,14}$/.test(normalizedPhone);

  const isStep1Valid = Boolean(formData.nome.trim()) && isEmailValid && isPhonePrefixValid && isPhoneValid;
  const isStep2Valid = Boolean(formData.servizio);
  const isStep3Valid = Boolean(formData.descrizione.trim());

  const stepPanelVariants = {
    enter: (direction) => ({
      opacity: 0,
      y: 14,
      x: direction > 0 ? 32 : -32,
      scale: 0.985,
      filter: 'blur(3px)',
    }),
    center: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.36,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: (direction) => ({
      opacity: 0,
      y: -10,
      x: direction > 0 ? -24 : 24,
      scale: 0.99,
      filter: 'blur(3px)',
      transition: {
        duration: 0.22,
        ease: [0.4, 0, 1, 1],
      },
    }),
  };

  const buildContactMessage = () => {
    const lines = [
      t('contactMessage.header'),
      '',
      t('contactMessage.contactSection'),
      `${t('contactMessage.nameLabel')}: ${formData.nome.trim()}`,
      `${t('contactMessage.companyLabel')}: ${formData.azienda.trim() || t('contactMessage.companyNotSpecified')}`,
      `${t('contactMessage.emailLabel')}: ${normalizedEmail}`,
      `${t('contactMessage.phoneLabel')}: ${fullPhoneNumber}`,
      '',
      t('contactMessage.requestSection'),
      `${t('contactMessage.serviceLabel')}: ${formData.servizio}`,
      '',
      t('contactMessage.descriptionSection'),
      formData.descrizione.trim(),
    ];

    return lines.join('\n');
  };

  const generateWhatsAppMessage = () => {
    return encodeURIComponent(buildContactMessage());
  };

  const sendViaWhatsApp = () => {
    window.open(`https://wa.me/393513052627?text=${generateWhatsAppMessage()}`, '_blank', 'noopener,noreferrer');
  };

  const sendViaEmail = () => {
    const subject = encodeURIComponent(
      t('contactMessage.subject', { service: formData.servizio, name: formData.nome.trim() })
    );
    const body = encodeURIComponent(buildContactMessage());
    window.open(`mailto:info@backsoftware.it?subject=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
  };

  // Service/Project detail modal
  if (selectedService) {
    const isProject = selectedService.source === 'progetti';
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="w-full pt-4 sm:pt-6 lg:pt-10 pb-6 sm:pb-10 lg:pb-20 px-4 sm:px-10 lg:px-20 h-[100dvh] flex flex-col font-sans modern-mode relative overflow-y-auto overflow-x-hidden overscroll-y-contain"
        style={{ background: '#f5f2ec' }}>
        <div className="absolute inset-0 crt-glitch-overlay" />
        <div className="modern-crt-flicker max-w-6xl mx-auto w-full">
          <motion.button onClick={handleCloseService}
            className="clay-btn px-6 py-3 mb-6 text-sm font-bold !rounded-xl text-[#3d3828] flex items-center gap-2"
            whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            {isProject ? t('serviceModal.backToProjects') : t('serviceModal.backToServices')}
          </motion.button>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className={`${isProject ? 'grid lg:grid-cols-2 gap-8 lg:gap-12 items-center justify-items-center' : ''}`}>
            
            {/* Phone Mockup with Gallery - Only for projects */}
            {isProject && (
              <div className="order-2 lg:order-2 flex justify-center lg:justify-start lg:-ml-4">
                <div 
                  className="relative w-[280px] sm:w-[300px]"
                  style={{ height: '580px' }}
                >
                  {/* Phone Body Shadow */}
                  <div 
                    className="absolute -inset-4 blur-2xl opacity-20 rounded-[3rem]"
                    style={{ background: 'radial-gradient(circle at center, rgba(124, 111, 91, 0.5) 0%, transparent 70%)' }}
                  />
                  
                  {/* Phone Body */}
                  <div 
                    className="relative h-full bg-[#1a1a1a] rounded-[2.5rem] p-3 shadow-2xl"
                    style={{
                      boxShadow: `
                        0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                        0 2px 4px rgba(255, 255, 255, 0.1) inset
                      `
                    }}
                  >
                    {/* Side Buttons */}
                    <div className="absolute -left-1 top-[18%] w-1.5 h-8 bg-[#2a2a2a] rounded-l" />
                    <div className="absolute -left-1 top-[28%] w-1.5 h-16 bg-[#2a2a2a] rounded-l" />
                    <div className="absolute -right-1 top-[22%] w-1.5 h-12 bg-[#2a2a2a] rounded-r" />
                    
                    {/* Screen with Gallery */}
                    <div className="h-full rounded-[2rem] overflow-hidden bg-black relative">
                      {/* Notch */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[40%] h-6 bg-black rounded-full z-30" />
                      
                      <PhoneGallery 
                        images={selectedService.images || []}
                        className="w-full h-full"
                        autoPlay={true}
                        interval={4000}
                      />
                    </div>
                  </div>
                  
                  {/* Reflection/Gloss */}
                  <div 
                    className="absolute inset-0 rounded-[2.5rem] pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.05) 100%)',
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className={`${isProject ? 'order-1 lg:order-1' : ''}`}>
              <div className="clay-card p-10 sm:p-16 lg:p-20 mb-8">
                {!isProject && <div className="text-5xl mb-4">{selectedService.icon}</div>}
                <h2 className="text-3xl sm:text-4xl font-black text-[#2d2818] mb-4 tracking-tight">{selectedService.title}</h2>
                <p className="text-lg leading-relaxed text-[#6a6050] font-medium">{selectedService.details}</p>
                
                {/* Project-specific extra info */}
                {isProject && selectedService.category && (
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7c6f5b]/10 text-[#7c6f5b] text-sm font-medium">
                    <span>{selectedService.category}</span>
                  </div>
                )}
              </div>
              
              {/* Packages - Only for services */}
              {!isProject && selectedService.packages && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#2d2818] mb-4 px-2">{t('serviceModal.choosePackage')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedService.packages.map((pkg, idx) => (
                      <motion.div
                        key={idx}
                        className="clay-card p-6 cursor-pointer group hover:scale-[1.02] transition-transform"
                        onClick={() => { handleCloseService(); setFormData(prev => ({ ...prev, servizio: `${selectedService.title} - ${pkg.name}` })); setShowContactForm(true); }}
                        whileTap={{ scale: 0.98 }}>
                        <h4 className="text-lg font-black text-[#2d2818] mb-2 group-hover:text-[#7c6f5b] transition-colors">{pkg.name}</h4>
                        <p className="text-sm text-[#6a6050] leading-relaxed">{pkg.desc}</p>
                        <div className="mt-4 text-xs font-bold text-[#7c6f5b] opacity-0 group-hover:opacity-100 transition-opacity">
                          {t('serviceModal.requestQuote')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-1 sm:px-2 mt-4">
                <button onClick={() => { handleCloseService(); setShowContactForm(true); setFormData(prev => ({ ...prev, servizio: selectedService.title })); }}
                  className="clay-btn w-full sm:w-auto px-6 py-3.5 text-[15px] sm:text-base font-bold !rounded-2xl text-[#3d3828] bg-[#fdfcf9] hover:scale-105 transition-transform flex items-center justify-center gap-2">
                  {isProject ? t('serviceModal.similarProject') : t('serviceModal.requestInfo')} <span>→</span>
                </button>
                <button onClick={handleCloseService}
                  className="clay-btn w-full sm:w-auto px-6 py-3.5 text-[15px] sm:text-base font-bold !rounded-2xl text-[#6a6050] flex items-center justify-center">
                  {isProject ? t('serviceModal.otherProjects') : t('serviceModal.otherServices')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Contact form view
  if (showContactForm) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full p-4 sm:p-10 lg:p-20 h-[100dvh] flex flex-col font-sans modern-mode relative overflow-y-auto overflow-x-hidden overscroll-y-contain"
        style={{ background: '#f5f2ec' }}>
        <div className="absolute inset-0 crt-glitch-overlay" />
        <div className="modern-crt-flicker max-w-3xl mx-auto w-full">
          <motion.button onClick={() => { setShowContactForm(false); setFormStep(1); setFormDirection(1); setFormData({ ...initialFormData }); }}
            className="clay-btn px-6 py-3 mb-8 text-sm font-bold !rounded-xl text-[#3d3828] flex items-center gap-2"
            whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
            {t('serviceModal.backToHome')}
          </motion.button>

          <div className="relative pb-12 sm:pb-14 [perspective:1400px]">
            <motion.div
              aria-hidden="true"
              initial={false}
              animate={{
                opacity: 0.14 + (formStep * 0.05),
                scale: 1 + (formStep * 0.02),
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute -top-12 left-1/2 h-24 w-[68%] -translate-x-1/2 rounded-full"
              style={{ background: 'radial-gradient(ellipse at center, rgba(124,111,91,0.22) 0%, rgba(124,111,91,0) 72%)' }}
            />

            {stackLayers.map((layer) => {
              const revealStrength = Math.min(1, Math.max(0, formStep - layer));
              const directionTilt = formDirection > 0 ? 1 : -1;

              return (
                <motion.div
                  key={`form-stack-layer-${layer}`}
                  initial={false}
                  animate={{
                    opacity: 0.08 + revealStrength * (0.24 - (layer * 0.04)),
                    y: (layer * 8) + (revealStrength * (12 + layer)),
                    x: revealStrength * directionTilt * (layer + 1),
                    scale: 1 - (layer * 0.018) - (revealStrength * 0.006),
                    rotateX: revealStrength * 1.4,
                    rotateZ: revealStrength * directionTilt * (0.55 + (layer * 0.12)),
                    borderColor: revealStrength > 0 ? '#d8d0c2' : '#e7e0d5',
                  }}
                  transition={{ type: 'spring', stiffness: 250, damping: 26, mass: 0.75 }}
                  className="pointer-events-none absolute inset-0 rounded-[2.1rem] border-2"
                  style={{
                    zIndex: 12 - layer,
                    background: 'linear-gradient(148deg, rgba(253,252,249,0.97) 0%, rgba(247,242,234,0.92) 100%)',
                    boxShadow: '0 16px 28px rgba(61, 56, 40, 0.10)',
                  }}
                />
              );
            })}

            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                rotateZ: formDirection > 0 ? 0.12 : -0.12,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative z-20 clay-card p-6 sm:p-10 lg:p-14 overflow-hidden"
            >
              <motion.div
                aria-hidden="true"
                initial={false}
                animate={{
                  opacity: 0.44,
                  x: formDirection > 0 ? ['-14%', '102%'] : ['102%', '-14%'],
                }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none absolute top-0 h-full w-24 blur-xl"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 100%)' }}
              />
            <h2 className="text-3xl sm:text-4xl font-black text-[#2d2818] mb-1 tracking-tight">{t('contact.form.title')}</h2>
            <p className="text-[#6a6050] mb-8 text-sm">{t('contact.form.subtitle')}</p>

            {/* Progress */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full bg-[#e4dfd4] overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: i <= formStep ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full w-full origin-left rounded-full bg-[#7c6f5b]"
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait" custom={formDirection}>
            {/* Step 1: Dati */}
            {formStep === 1 && (
              <motion.div
                key="contact-step-1"
                custom={formDirection}
                variants={stepPanelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4">
                <h3 className="text-xl font-black text-[#2d2818]">{t('contact.form.step1.title')}</h3>
                <input type="text" placeholder={t('contact.form.step1.name')} value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-[#d4cfc5] bg-[#fdfcf9] focus:border-[#7c6f5b] focus:outline-none focus:bg-[#f8f6f2] transition-colors text-[#2d2818]" />
                <input type="text" placeholder={t('contact.form.step1.company')} value={formData.azienda} onChange={(e) => handleInputChange('azienda', e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-[#d4cfc5] bg-[#fdfcf9] focus:border-[#7c6f5b] focus:outline-none focus:bg-[#f8f6f2] transition-colors text-[#2d2818]" />
                <input type="email" placeholder={t('contact.form.step1.email')} value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-[#d4cfc5] bg-[#fdfcf9] focus:border-[#7c6f5b] focus:outline-none focus:bg-[#f8f6f2] transition-colors text-[#2d2818]" />

                {!isEmailValid && formData.email.length > 0 && (
                  <p className="text-xs font-semibold text-[#b94242]">{t('contact.form.step1.emailError')}</p>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder={t('contact.form.step1.prefix')}
                    value={formData.prefissoTelefono}
                    onChange={(e) => handleInputChange('prefissoTelefono', e.target.value)}
                    className="p-4 rounded-2xl border-2 border-[#d4cfc5] bg-[#fdfcf9] focus:border-[#7c6f5b] focus:outline-none focus:bg-[#f8f6f2] transition-colors text-[#2d2818]"
                  />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder={t('contact.form.step1.phone')}
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value.replace(/[^\d\s]/g, ''))}
                    className="col-span-2 p-4 rounded-2xl border-2 border-[#d4cfc5] bg-[#fdfcf9] focus:border-[#7c6f5b] focus:outline-none focus:bg-[#f8f6f2] transition-colors text-[#2d2818]"
                  />
                </div>

                {!isPhonePrefixValid && formData.prefissoTelefono.length > 0 && (
                  <p className="text-xs font-semibold text-[#b94242]">{t('contact.form.step1.prefixError')}</p>
                )}
                {!isPhoneValid && formData.telefono.length > 0 && (
                  <p className="text-xs font-semibold text-[#b94242]">{t('contact.form.step1.phoneError')}</p>
                )}
                <p className="text-xs text-[#8a856f]">{t('contact.form.step1.phoneRequired')}</p>
              </motion.div>
            )}

            {/* Step 2: Servizio */}
            {formStep === 2 && (
              <motion.div
                key="contact-step-2"
                custom={formDirection}
                variants={stepPanelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4">
                <h3 className="text-xl font-black text-[#2d2818]">{t('contact.form.step2.title')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {serviziOptions.map(s => (
                    <button key={s} onClick={() => handleInputChange('servizio', s)}
                      className={`p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all ${formData.servizio === s ? 'bg-[#7c6f5b] text-[#f5f2ec] border-[#7c6f5b]' : 'bg-[#fdfcf9] border-[#d4cfc5] hover:border-[#7c6f5b] text-[#2d2818]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Descrizione */}
            {formStep === 3 && (
              <motion.div
                key="contact-step-3"
                custom={formDirection}
                variants={stepPanelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4">
                <h3 className="text-xl font-black text-[#2d2818]">{t('contact.form.step3.title')}</h3>
                <div className="relative">
                  <textarea
                    value={formData.descrizione}
                    onChange={(e) => handleInputChange('descrizione', e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-[#d4cfc5] bg-[#fdfcf9] focus:border-[#7c6f5b] focus:outline-none focus:bg-[#f8f6f2] transition-colors min-h-[120px] resize-none text-[#2d2818]" />
                  {!formData.descrizione && (
                    <ModernTypewriter servizio={formData.servizio} t={t} />
                  )}
                </div>
              </motion.div>
            )}

            {/* Review */}
            {formStep === 4 && (
              <motion.div
                key="contact-step-4"
                custom={formDirection}
                variants={stepPanelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5">
                <h3 className="text-xl font-black text-[#2d2818]">{t('contact.form.step4.title')}</h3>
                <p className="text-sm text-[#6a6050]">{t('contact.form.step4.subtitle')}</p>

                <div className="p-5 sm:p-6 rounded-3xl bg-[linear-gradient(145deg,#fffdf9_0%,#f8f4ec_100%)] border-2 border-[#d4cfc5] space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[#2d2818]">{t('contact.form.step4.contactCard')}</p>
                    <span className="text-[11px] font-black tracking-wide px-3 py-1 rounded-full bg-[#e9e3d7] text-[#5a5041]">{t('contact.form.step4.ready')}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <p className="rounded-xl bg-[#fdfcf9] px-3 py-2 border border-[#e8e2d6]"><span className="font-bold text-[#8a856f]">{t('contact.form.step4.nameLabel')}</span> {formData.nome}</p>
                    <p className="rounded-xl bg-[#fdfcf9] px-3 py-2 border border-[#e8e2d6]"><span className="font-bold text-[#8a856f]">{t('contact.form.step4.companyLabel')}</span> {formData.azienda || t('contact.form.step4.notSpecified')}</p>
                    <p className="rounded-xl bg-[#fdfcf9] px-3 py-2 border border-[#e8e2d6]"><span className="font-bold text-[#8a856f]">{t('contact.form.step4.emailLabel')}</span> {normalizedEmail}</p>
                    <p className="rounded-xl bg-[#fdfcf9] px-3 py-2 border border-[#e8e2d6]"><span className="font-bold text-[#8a856f]">{t('contact.form.step4.phoneLabel')}</span> {fullPhoneNumber}</p>
                  </div>
                  <p className="rounded-xl bg-[#fdfcf9] px-3 py-2 border border-[#e8e2d6]"><span className="font-bold text-[#8a856f]">{t('contact.form.step4.serviceLabel')}</span> {formData.servizio}</p>
                  <div className="rounded-xl bg-[#fdfcf9] px-3 py-3 border border-[#e8e2d6]">
                    <p className="font-bold text-[#8a856f] mb-1">{t('contact.form.step4.descriptionLabel')}</p>
                    <p className="text-[#6a6050] whitespace-pre-wrap">{formData.descrizione}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <button onClick={sendViaWhatsApp}
                    className="w-full p-4 rounded-2xl text-white font-bold bg-[linear-gradient(135deg,#1fbf62_0%,#128c7e_100%)] shadow-[0_10px_24px_rgba(18,140,126,0.25)] hover:translate-y-[-1px] hover:shadow-[0_14px_28px_rgba(18,140,126,0.35)] transition-all">
                    {t('contact.form.step4.sendWhatsApp')}
                  </button>
                  <button onClick={sendViaEmail}
                    className="w-full p-4 rounded-2xl text-white font-bold bg-[linear-gradient(135deg,#4a4234_0%,#2f2a1d_100%)] shadow-[0_10px_24px_rgba(47,42,29,0.25)] hover:translate-y-[-1px] hover:shadow-[0_14px_28px_rgba(47,42,29,0.35)] transition-all">
                    {t('contact.form.step4.sendEmail')}
                  </button>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Navigation */}
            {formStep >= 1 && formStep <= 3 && (
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8 pt-6 border-t border-[#e4dfd4]">
                <button onClick={goToPrevStep}
                  className="clay-btn w-full sm:w-auto px-6 py-3 sm:py-4 font-bold text-[#6a6050]">
                  {t('contact.form.back')}
                </button>
                <button onClick={goToNextStep}
                  disabled={(formStep === 1 && !isStep1Valid) || (formStep === 2 && !isStep2Valid) || (formStep === 3 && !isStep3Valid)}
                  className="flex-1 w-full clay-btn px-6 py-3 sm:py-4 font-bold !rounded-2xl text-[#3d3828] bg-[#fdfcf9] disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform">
                  {formStep === 3 ? t('contact.form.confirm') : t('contact.form.next')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div ref={modernSnapScrollRef} initial="hidden" animate="visible" variants={containerVariants}
      className={`h-[100dvh] w-full overflow-x-hidden overflow-y-auto font-sans modern-mode modern-snap-container selection:bg-[#7c6f5b]/20 relative overscroll-y-contain ${isMockupMode ? 'mockup-mode' : ''}`}
      style={{ background: 'linear-gradient(180deg, #f5f2ec 0%, #f2eee7 100%)' }}>
      {/* CRT Glitch Effect */}
      <div className="absolute inset-0 crt-glitch-overlay pointer-events-none" />
      
      {/* ── HEADER ── */}
      <motion.nav
        data-no-custom-cursor
        variants={itemVariants}
        className="fixed top-0 left-0 right-0 z-50"
        style={{ pointerEvents: 'none' }}
      >
        {/* Mobile Header - Compact WITH animation */}
        <div className="sm:hidden mx-auto mt-8 w-[calc(100%-2.5rem)] max-w-md">
          <div 
            ref={headerRefMobile}
            className="flex items-center justify-between gap-2 py-1 px-2.5 rounded-[1.5rem] pointer-events-auto relative overflow-visible"
            style={{
              background: 'linear-gradient(145deg, rgba(248, 245, 239, 0.95) 0%, rgba(242, 237, 228, 0.92) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 2px 12px rgba(60, 48, 34, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
            }}
          >
            {/* Orbiting text border - Mobile (small) */}
            <svg
              ref={orbitSvgRefMobile}
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              style={{ zIndex: 0 }}
              aria-hidden="true"
            >
              {headerPathMobile && (
                <>
                  <defs>
                    <path id="header-orbit-path-mobile" d={headerPathMobile} fill="none" />
                  </defs>
                  {orbitTextMobile && (
                    <>
                      <text
                        fill={orbitColorMobile}
                        style={{ fontSize: '6px', fontWeight: 700, letterSpacing: '0', opacity: 0.58, transition: 'fill 0.4s ease', textRendering: 'geometricPrecision' }}
                      >
                        <textPath ref={orbitRef1Mobile} href="#header-orbit-path-mobile" startOffset="0" textLength={pathLenMobile} lengthAdjust="spacing">
                          {orbitTextMobile}
                        </textPath>
                        <textPath ref={orbitRef2Mobile} href="#header-orbit-path-mobile" startOffset="0" textLength={pathLenMobile} lengthAdjust="spacing">
                          {orbitTextMobile}
                        </textPath>
                      </text>
                    </>
                  )}
                </>
              )}
            </svg>

            {/* Logo Mobile */}
            <div className="flex items-center min-w-0 relative z-10">
              <span className="text-[13px] font-black tracking-tight text-[#2f2a1d] leading-none truncate">{t('nav.brandName')}</span>
            </div>

            {/* Actions Mobile */}
            <div className="flex items-center gap-1.5 shrink-0 relative z-10">
              <LanguageSwitcher />
              <button 
                onClick={onSwitchToTerminal}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[#746a57] bg-[#f8f4ec] border border-[#dbd3c6]/70 active:scale-95 transition-transform"
              >
                <span className="text-[10px]">🎮</span>
              </button>
              <ShinyButton
                href="#contatti"
                tone="espresso"
                size="sm"
                intensity="strong"
                className="font-bold !text-[10px] !px-2 !py-1"
              >
                {t('nav.writeUs')}
              </ShinyButton>
            </div>
          </div>
        </div>

        {/* Desktop Header - With animation */}
        <div 
          ref={headerRefDesktop}
          className="hidden sm:flex max-w-6xl mx-auto mt-5 items-center justify-between gap-3 py-2.5 px-4 lg:px-5 rounded-2xl lg:rounded-[1.75rem] pointer-events-auto relative"
          style={{
            background: 'linear-gradient(145deg, rgba(248, 245, 239, 0.58) 0%, rgba(242, 237, 228, 0.46) 100%)',
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            border: '1px solid rgba(255, 255, 255, 0.28)',
            boxShadow: `
              0 4px 16px rgba(60, 48, 34, 0.1),
              0 1px 4px rgba(60, 48, 34, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.58)
            `
          }}
        >
          {/* Orbiting text border - Desktop */}
          <svg
            ref={orbitSvgRefDesktop}
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            style={{ zIndex: 0 }}
            aria-hidden="true"
          >
            {headerPathDesktop && (
              <>
                <defs>
                  <path id="header-orbit-path-desktop" d={headerPathDesktop} fill="none" />
                </defs>
                {orbitTextDesktop && (
                  <>
                    <text
                      fill={orbitColor}
                      style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '1.2px', opacity: 0.62, transition: 'fill 0.4s ease', textRendering: 'geometricPrecision' }}
                    >
                      <textPath ref={orbitRef1Desktop} href="#header-orbit-path-desktop" startOffset="0" textLength={pathLenDesktop} lengthAdjust="spacing">
                        {orbitTextDesktop}
                      </textPath>
                    </text>
                    <text
                      fill={orbitColor}
                      style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '1.2px', opacity: 0.62, transition: 'fill 0.4s ease', textRendering: 'geometricPrecision' }}
                    >
                      <textPath ref={orbitRef2Desktop} href="#header-orbit-path-desktop" startOffset="0" textLength={pathLenDesktop} lengthAdjust="spacing">
                        {orbitTextDesktop}
                      </textPath>
                    </text>
                  </>
                )}
              </>
            )}
          </svg>

          {/* Logo Desktop */}
          <div className="flex items-center gap-3 min-w-0 relative z-10">
            <div className="min-w-0">
              <span className="text-[16px] lg:text-[20px] font-black tracking-tight text-[#2f2a1d] leading-none truncate">{t('nav.brandName')}</span>
              <p className="text-[9px] lg:text-[11px] font-bold text-[#807865] opacity-80 tracking-[0.14em] uppercase truncate">{t('nav.brandTagline')}</p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <div className="hidden md:flex items-center gap-1 rounded-full bg-[#f8f4ec] p-1 border border-[#d8d0c1]">
              {[
                { label: t('nav.services'), href: '#servizi' },
                { label: t('nav.projects'), href: '#progetti' },
                { label: t('nav.contact'), href: '#contatti' }
              ].map((item) => (
                <a 
                  key={item.label}
                  href={item.href}
                  className="px-2 lg:px-4 py-1.5 text-xs lg:text-sm font-bold text-[#665d4c] hover:text-[#2f2a1d] rounded-full hover:bg-[#ebe3d7] transition-all"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <LanguageSwitcher />

            <button 
              onClick={onSwitchToTerminal}
              className="px-2 py-1 text-[11px] lg:text-xs font-bold rounded-full text-[#746a57] hover:text-[#3d3528] bg-[#f8f4ec] border border-[#dbd3c6] hover:bg-[#f1e9dc] transition-all min-w-[40px] min-h-[32px] flex items-center justify-center active:scale-95"
            >
              <span>🎮 {t('nav.arcade')}</span>
            </button>
            
            <ShinyButton
              href="#contatti"
              tone="espresso"
              size="md"
              intensity="strong"
              className="font-bold !text-sm !px-5 !py-3"
            >
              {t('nav.writeUs')}
            </ShinyButton>
          </div>
        </div>
      </motion.nav>


      {/* ── HERO ── */}
      <motion.section
        ref={heroSectionRef}
        data-custom-cursor-hero
        variants={itemVariants}
        className="modern-snap-section flex items-center justify-center relative px-6 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Floating Accents - Hidden on mobile */}
        <div className="hidden sm:block absolute -top-10 left-10 w-24 h-24 clay-pill opacity-10 animate-float pointer-events-none" />
        <div className="hidden sm:block absolute top-40 right-10 w-32 h-32 clay-pill opacity-10 animate-float-delayed pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="order-1 lg:order-1">
              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-[3rem] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-black leading-[1.12] sm:leading-[1.05] mb-6 sm:mb-8 tracking-tight text-[#2d2818]">
                <span className="block mb-2">{t('hero.title1')}</span>
                <span className="block mb-2">{t('hero.title2')}</span>
                <span className="text-[#8a7f6a] drop-shadow-sm block">{t('hero.title3')}<span className="transition-all duration-500 ease-out hover:text-[#c4b494] hover:drop-shadow-[0_0_30px_rgba(196,180,148,0.8),0_0_60px_rgba(196,180,148,0.4)] cursor-default">{t('hero.title3Highlight')}</span>.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-base lg:text-xl xl:text-2xl leading-relaxed max-w-xl font-medium mb-6 sm:mb-10 text-[#6a6050]">
                {t('hero.subtitle')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap gap-3 sm:gap-6 items-center">
                <ShinyButton
                  href="#contatti"
                  tone="espresso"
                  size="lg"
                  intensity="strong"
                  className="!w-[92vw] max-w-[420px] sm:!w-auto !rounded-2xl lg:!rounded-2xl !text-lg sm:!text-base !px-8 sm:!px-6 !py-4 sm:!py-5"
                >
                  <span className="sm:hidden">{t('hero.ctaMobile')}</span>
                  <span className="hidden sm:inline">{t('hero.ctaDesktop')}</span>
                </ShinyButton>
              </motion.div>
            </div>

            <div className="order-2 hidden lg:flex w-full items-center justify-center xl:justify-end min-h-0 py-1 overflow-visible">
              <HeroCreativeVisual
                scrollContainerRef={modernSnapScrollRef}
                sectionRef={heroSectionRef}
                caption={t('hero.visualCaption')}
                pointerHint={t('hero.visualPointerHint')}
              />
            </div>

          </div>

          <motion.a
            href="#come-lavoriamo"
            className="absolute bottom-8 sm:bottom-16 left-1/2 -translate-x-1/2 group cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-14 h-14 sm:w-14 sm:h-14">
              {/* Background circle for contrast */}
              <div className="absolute inset-0 rounded-full bg-[#f5f2ec]/80 backdrop-blur-sm border border-[#d4cfc5]/50 shadow-[0_4px_20px_rgba(138,127,106,0.15)]" />
              
              {/* Rotating thin ring */}
              <motion.svg
                className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)]"
                viewBox="0 0 48 48"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              >
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-[#b8ad98]"
                  strokeDasharray="3 3"
                />
              </motion.svg>
              {/* Arrow */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: [0.4, 0, 0.6, 1] }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#6a6050] group-hover:text-[#4a4336] transition-colors">
                  <path d="M12 6v12m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </div>
          </motion.a>
        </div>
      </motion.section>

      {/* ── DARK SECTION: Why Us (desktop: light layer + lens mask) ── */}
      <motion.section
        ref={whySectionRef}
        id="come-lavoriamo"
        data-custom-cursor-why
        data-dark-section
        variants={itemVariants}
        className="modern-snap-section flex flex-col justify-center relative px-4 sm:px-6 lg:px-10 pt-20 sm:pt-24 pb-12 sm:py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1810 0%, #1c1917 50%, #1a1810 100%)',
        }}
      >
        {/* Subtle dark texture overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }} />
        {/* Ambient warm glow - hidden on mobile */}
        <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] rounded-full opacity-[0.04] pointer-events-none" style={{ background: 'radial-gradient(ellipse, #b8a88a 0%, transparent 70%)' }} />
        <div className="hidden sm:block absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.03] pointer-events-none" style={{ background: 'radial-gradient(circle, #c4a76c 0%, transparent 60%)' }} />

        {/* flex-1 = content box (inside padding); lens layer is full-viewport-wide (bleed); light/dark rows share max-w-6xl */}
        <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col justify-center">
          <div className="relative z-[1] mx-auto w-full min-h-0 max-w-6xl">
            <WhyUsDualContent
              variant="dark"
              t={t}
              sectionTitleClass={sectionTitleClass}
              sectionTitleReveal={sectionTitleReveal}
              sectionSubtitleReveal={sectionSubtitleReveal}
              itemVariants={itemVariants}
            />
          </div>
          {lensDesktopEnabled ? (
            <div
              ref={whyLensClipRef}
              className="pointer-events-none absolute top-0 bottom-0 z-20 flex max-w-none flex-col justify-center overflow-hidden"
              style={{
                left: 'calc(50% - 50vw)',
                width: '100vw',
                clipPath: 'circle(120px at var(--lens-x, -9999px) var(--lens-y, -9999px))',
                WebkitClipPath: 'circle(120px at var(--lens-x, -9999px) var(--lens-y, -9999px))',
              }}
              aria-hidden
            >
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, #f5f2ec 0%, #f2eee7 100%)' }}
              />
              <div className="relative z-[1] mx-auto w-full min-h-0 max-w-6xl">
                <WhyUsDualContent
                  variant="light"
                  t={t}
                  sectionTitleClass={sectionTitleClass}
                  sectionTitleReveal={sectionTitleReveal}
                  sectionSubtitleReveal={sectionSubtitleReveal}
                  itemVariants={itemVariants}
                />
              </div>
            </div>
          ) : null}
        </div>
      </motion.section>

      {/* ── SERVIZI Section ── */}
      <motion.section
        id="servizi"
        variants={itemVariants}
        className="modern-snap-section snap-scroll-inner flex min-h-0 flex-col justify-start px-4 sm:px-6 lg:px-10 pt-20 sm:pt-24 pb-10 sm:pb-14">
        <div className="mx-auto w-full max-w-6xl shrink-0">
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
            <motion.h2 {...sectionTitleReveal} className={`${sectionTitleClass} text-[#2d2818]`}>{t('services.title')}</motion.h2>
            <motion.p {...sectionSubtitleReveal} className="text-sm sm:text-lg text-[#6a6050] font-medium">
              {t('services.subtitle')}
            </motion.p>
          </motion.div>
          <div
            className={`grid grid-cols-1 gap-3 transition-[grid-template-columns] duration-300 ease-out sm:grid-cols-2 sm:gap-4 items-start ${
              caseFamigliaExpanded
                ? 'md:grid-cols-[minmax(0,1.6fr)_minmax(11.25rem,1fr)]'
                : 'md:grid-cols-3'
            }`}
          >
            {services.map((s, i) => (
              s.key === 'caseFamiglia' ? (
                <CaseFamigliaServiceCard
                  key={s.key}
                  service={s}
                  variants={itemVariants}
                  className={
                    caseFamigliaExpanded
                      ? `${serviziGridPlacementWhenCfExpanded('caseFamiglia')} motion-reduce:transition-none`
                      : s.span
                  }
                  expanded={caseFamigliaExpanded}
                  onExpandHover={() => setCaseFamigliaExpanded(true)}
                  onCollapseHover={() => setCaseFamigliaExpanded(false)}
                  onTouchToggle={() => setCaseFamigliaExpanded((prev) => !prev)}
                  onOpenDetail={() => {
                    setCaseFamigliaExpanded(false);
                    setSelectedService(s);
                  }}
                />
              ) : (
                <motion.div
                  key={s.key ?? i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => setCaseFamigliaExpanded(false)}
                  onClick={() => setSelectedService(s)}
                  className={`clay-card group flex min-h-[68px] cursor-pointer items-center gap-3 px-4 py-2.5 transition-all duration-300 ease-out sm:min-h-[92px] sm:gap-5 sm:px-6 sm:py-4 motion-reduce:transition-none ${s.span} ${
                    caseFamigliaExpanded ? serviziGridPlacementWhenCfExpanded(s.key) : ''
                  }`}
                >
                  <span className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-lg sm:text-xl clay-pill bg-[#f5f2ec] shadow-sm group-hover:scale-110 transition-transform shrink-0">{s.icon}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-black text-[#2d2818] group-hover:text-[#7c6f5b] transition-colors leading-tight">{s.title}</h4>
                    <p className="text-[11px] sm:text-xs text-[#6a6050] opacity-80 line-clamp-2">{s.desc}</p>
                  </div>
                  <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm transition-transform group-hover:rotate-45 bg-[#f5f2ec] border border-[#d4cfc5] text-[#3d3828] shrink-0" aria-hidden="true">
                    ↗
                  </span>
                </motion.div>
              )
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── METODO Section ── */}
      <motion.section
        id="metodo"
        variants={itemVariants}
        className="modern-snap-section flex min-h-0 flex-col justify-center px-4 sm:px-6 lg:px-10 py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="clay-card p-6 sm:p-10 lg:p-12">
            <motion.div variants={itemVariants} className="mb-7 sm:mb-9 space-y-2 sm:space-y-3">
              <motion.h2 {...sectionTitleReveal} className={`${sectionTitleClass} text-[#2d2818]`}>
                {t('services.workflow.title')}
              </motion.h2>
              <motion.p {...sectionSubtitleReveal} className="text-sm sm:text-lg text-[#6a6050] font-medium max-w-3xl">
                {t('services.workflow.subtitle')}
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {workflowSteps.map((step) => (
                <motion.article
                  key={step.key}
                  variants={itemVariants}
                  className="rounded-3xl border border-[#d8d1c4] bg-[linear-gradient(145deg,#fdfcf9_0%,#f5f0e7_100%)] p-5 sm:p-6"
                >
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-black tracking-[0.12em] bg-[#e8e1d3] text-[#5a5142] mb-4">
                    {step.number}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#2d2818] mb-2 leading-tight">{step.title}</h3>
                  <p className="text-sm sm:text-base text-[#6a6050] leading-relaxed">{step.desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── PROGETTI Section (DARK) ── */}
      <motion.section id="progetti" data-dark-section variants={itemVariants}
        className="modern-snap-section flex min-h-0 flex-col px-4 sm:px-6 lg:px-10 pt-24 pb-16 sm:pb-20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1810 0%, #1c1917 50%, #1a1810 100%)',
        }}
      >
        {/* Subtle dark texture overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }} />
        {/* Ambient warm glows */}
        <div className="absolute top-1/3 left-1/4 w-[60%] h-[50%] rounded-full opacity-[0.035] pointer-events-none" style={{ background: 'radial-gradient(ellipse, #b8a88a 0%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full opacity-[0.025] pointer-events-none" style={{ background: 'radial-gradient(circle, #c4a76c 0%, transparent 60%)' }} />
        
        {/* Fixed header — stays at same height as "Cosa facciamo" */}
        <div className="relative z-10 max-w-6xl mx-auto w-full shrink-0">
          <div className="mt-3 sm:mt-4 mb-8 sm:mb-10 lg:mb-12 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 sm:gap-6">
            <motion.div variants={itemVariants} className="space-y-4 lg:max-w-2xl">
              <motion.h2 className={`${sectionTitleClass} text-[#f5f2ec]`}>{t('projects.title')}</motion.h2>
              <motion.p className="text-base sm:text-lg font-medium" style={{ color: '#a09a88' }}>
                {t('projects.subtitle', { count: projects.length })}
              </motion.p>
            </motion.div>

            {/* Category Selector - Raycast Style */}
            <div className="self-start w-full lg:w-auto lg:mt-1 px-1">
              <div className="w-full lg:w-auto lg:overflow-x-auto pb-1 -mx-1 px-1">
                <div className="flex lg:inline-flex lg:min-w-max p-1.5 rounded-[2rem] justify-between lg:justify-start w-full lg:w-auto" style={{
                  background: 'linear-gradient(145deg, rgba(43, 39, 32, 0.9) 0%, rgba(31, 29, 24, 0.95) 100%)',
                  border: '1px solid rgba(255, 248, 230, 0.08)',
                  borderTopColor: 'rgba(255, 248, 230, 0.12)',
                }}>
                  {allCategoryKeys.map((catKey) => (
                    <button
                      key={catKey}
                      onClick={() => handleCategoryChange(catKey)}
                      className={`relative flex-1 lg:flex-none px-2 sm:px-6 py-2 sm:py-3 text-[11px] sm:text-base font-bold transition-all duration-200 rounded-[1.25rem] sm:rounded-[1.5rem] whitespace-nowrap ${
                        selectedCategoryKey === catKey
                          ? 'text-[#f5f2ec]'
                          : 'text-[#8a7f6a] hover:text-[#c4bba8]'
                      }`}
                    >
                      {selectedCategoryKey === catKey && (
                        <motion.div
                          layoutId="categoryPill"
                          className="absolute inset-0 rounded-[1.5rem]"
                          style={{
                            background: 'linear-gradient(145deg, rgba(58, 52, 40, 0.8) 0%, rgba(38, 35, 28, 0.9) 100%)',
                            border: '1px solid rgba(255, 248, 230, 0.12)',
                            borderTopColor: 'rgba(255, 248, 230, 0.18)',
                            boxShadow: '4px 6px 14px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 248, 230, 0.08)'
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{getCategoryDisplayName(catKey)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable cards area */}
        <div className="relative z-10 max-w-6xl mx-auto w-full flex-1 min-h-0 overflow-y-auto pt-1 sm:pt-2">
          {categoryTransitionType === 'morph' ? (
            <motion.div
              layout
              transition={{ layout: { type: 'spring', stiffness: 380, damping: 42, mass: 0.7 } }}
              className={`grid gap-3 sm:gap-4 ${isCompactCategory
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              }`}
            >
              <AnimatePresence initial={false} custom={categoryDirection}>
                {visibleProjects.map((p, i) => (
                  <ProjectCard
                    key={`slot-${p.key}`}
                    project={p}
                    index={i}
                    direction={categoryDirection}
                    enableMorph={true}
                    isCompact={isCompactCategory}
                    onClick={() => setSelectedService({ title: p.n, icon: '', details: p.desc, source: 'progetti', images: p.images || [], category: getCategoryDisplayName(p.categoryKey) })}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait" initial={false} custom={categoryDirection}>
              <motion.div
                key={selectedCategoryKey}
                variants={galleryGridVariants}
                custom={categoryDirection}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              >
                {visibleProjects.map((p, i) => (
                  <ProjectCard
                    key={`${selectedCategoryKey}-${p.key}`}
                    project={p}
                    index={i}
                    direction={categoryDirection}
                    enableMorph={false}
                    isCompact={false}
                    onClick={() => setSelectedService({ title: p.n, icon: '', details: p.desc, source: 'progetti', images: p.images || [], category: getCategoryDisplayName(p.categoryKey) })}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.section>

      {/* ── CONTATTI Section ── */}
      <motion.section ref={contactSectionRef} id="contatti" variants={itemVariants} className="modern-snap-section flex flex-col justify-center px-4 sm:px-6 lg:px-10 pt-24 pb-16 sm:py-20 relative" style={{ background: '#f5f2ec' }}>
        {/* Contact content — shifts up when footer appears */}
        <motion.div
          className="max-w-6xl mx-auto w-full relative z-10"
          animate={showFooter ? { y: '-18%', scale: 0.92, opacity: 0.4, filter: 'blur(6px)' } : { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div variants={itemVariants} className="mb-8 text-center space-y-4">
            <motion.h2 {...sectionTitleReveal} className={`${sectionTitleClass} text-[#2d2818]`}>{t('contact.title')}</motion.h2>
            <motion.p {...sectionSubtitleReveal} className="text-base sm:text-lg text-[#6a6050] font-medium max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </motion.p>
          </motion.div>
          <div className="clay-card p-6 sm:p-12 lg:p-20 text-center relative overflow-hidden bg-gradient-to-br from-[#f8f6f2] to-[#eeeae0] border-2 border-[#d4cfc5]/40">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 clay-pill opacity-10 blur-3xl" />
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <ShinyButton
              onClick={() => setShowContactForm(true)}
              tone="clay"
              size="lg"
              className="font-black"
            >
              {t('contact.formCta')}
            </ShinyButton>
            <a href="mailto:info@backsoftware.it" className="clay-btn px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold !rounded-2xl text-[#6a6050] hover:text-[#3d3828] transition-colors flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">✉</span> {t('contact.email')}
            </a>
            <a href="tel:+393513052627" className="group flex flex-col items-start gap-1">
              <span className="text-xs sm:text-sm font-black text-[#8a856f] uppercase tracking-widest opacity-60">{t('contact.callUs')}</span>
              <span className="text-base sm:text-2xl font-black text-[#3d3828] border-b-2 border-[#7c6f5b]/20 group-hover:border-[#7c6f5b] transition-colors">+39 351 305 2627</span>
            </a>
          </div>
          </div>
        </motion.div>

        {/* ── FOOTER (slides up from below, overlaying contact) ── */}
        <motion.div
          id="footer"
          className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-10 bottom-0 z-20 pb-6 sm:pb-10 h-[66vh] sm:h-auto max-h-[66vh] sm:max-h-none"
          initial={false}
          animate={showFooter ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ pointerEvents: showFooter ? 'auto' : 'none' }}
        >
          <div className="max-w-6xl mx-auto w-full">
          <footer
            ref={footerCardRef}
            onMouseEnter={() => setFooterStrokeActive(true)}
            onMouseLeave={() => setFooterStrokeActive(false)}
            onMouseMove={handleFooterPointerMove}
            className="clay-card relative overflow-hidden sm:overflow-hidden overflow-y-auto p-5 sm:p-10 lg:p-12 border border-[#d4cfc5]/50 bg-gradient-to-br from-[#f7f4ee] via-[#f3efe7] to-[#ece5d8] h-full sm:h-auto"
            style={{ '--footer-stroke-x': '50%', '--footer-stroke-y': '50%', '--footer-stroke-h': '40', '--footer-stroke-s': '66%' }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[1px] rounded-[30px] border border-[#cdbfa8]/55"
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-4 left-0 w-[2.5px] rounded-full transition-opacity duration-500 ${footerStrokeActive ? 'opacity-100' : 'opacity-62'}`}
              style={{
                background: 'linear-gradient(180deg, transparent 0%, hsl(var(--footer-stroke-h) var(--footer-stroke-s) 66% / 0.14) calc(var(--footer-stroke-y) - 28%), hsl(var(--footer-stroke-h) var(--footer-stroke-s) 74% / 0.98) var(--footer-stroke-y), hsl(var(--footer-stroke-h) var(--footer-stroke-s) 66% / 0.14) calc(var(--footer-stroke-y) + 28%), transparent 100%)',
                boxShadow: '0 0 28px hsl(var(--footer-stroke-h) var(--footer-stroke-s) 72% / 0.5)',
              }}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-4 right-0 w-[2.5px] rounded-full transition-opacity duration-500 ${footerStrokeActive ? 'opacity-100' : 'opacity-62'}`}
              style={{
                background: 'linear-gradient(180deg, transparent 0%, hsl(calc(var(--footer-stroke-h) + 5) var(--footer-stroke-s) 66% / 0.14) calc(var(--footer-stroke-y) - 28%), hsl(calc(var(--footer-stroke-h) + 5) var(--footer-stroke-s) 74% / 0.98) var(--footer-stroke-y), hsl(calc(var(--footer-stroke-h) + 5) var(--footer-stroke-s) 66% / 0.14) calc(var(--footer-stroke-y) + 28%), transparent 100%)',
                boxShadow: '0 0 28px hsl(calc(var(--footer-stroke-h) + 5) var(--footer-stroke-s) 72% / 0.5)',
              }}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-5 top-0 h-[2.5px] rounded-full transition-opacity duration-500 ${footerStrokeActive ? 'opacity-100' : 'opacity-58'}`}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, hsl(var(--footer-stroke-h) var(--footer-stroke-s) 74% / 0.14) calc(var(--footer-stroke-x) - 26%), hsl(var(--footer-stroke-h) var(--footer-stroke-s) 80% / 0.99) var(--footer-stroke-x), hsl(var(--footer-stroke-h) var(--footer-stroke-s) 74% / 0.14) calc(var(--footer-stroke-x) + 26%), transparent 100%)',
                boxShadow: '0 0 22px hsl(var(--footer-stroke-h) var(--footer-stroke-s) 74% / 0.42)',
              }}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-5 bottom-0 h-[2.5px] rounded-full transition-opacity duration-500 ${footerStrokeActive ? 'opacity-100' : 'opacity-58'}`}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, hsl(calc(var(--footer-stroke-h) + 4) var(--footer-stroke-s) 72% / 0.14) calc(var(--footer-stroke-x) - 26%), hsl(calc(var(--footer-stroke-h) + 4) var(--footer-stroke-s) 77% / 0.97) var(--footer-stroke-x), hsl(calc(var(--footer-stroke-h) + 4) var(--footer-stroke-s) 72% / 0.14) calc(var(--footer-stroke-x) + 26%), transparent 100%)',
                boxShadow: '0 0 22px hsl(calc(var(--footer-stroke-h) + 4) var(--footer-stroke-s) 72% / 0.4)',
              }}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-8 -left-3 w-5 blur-md transition-opacity duration-500 ${footerStrokeActive ? 'opacity-82' : 'opacity-22'}`}
              style={{
                background: 'linear-gradient(180deg, transparent 0%, hsl(var(--footer-stroke-h) var(--footer-stroke-s) 74% / 0.5) var(--footer-stroke-y), transparent 100%)',
              }}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-8 -right-3 w-5 blur-md transition-opacity duration-500 ${footerStrokeActive ? 'opacity-82' : 'opacity-22'}`}
              style={{
                background: 'linear-gradient(180deg, transparent 0%, hsl(calc(var(--footer-stroke-h) + 5) var(--footer-stroke-s) 74% / 0.5) var(--footer-stroke-y), transparent 100%)',
              }}
            />
            {/* Close button */}
            <button
              onClick={() => setShowFooter(false)}
              aria-label={t('footer.close')}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#6a6050] hover:text-[#3d3828] hover:bg-[#e8e2d8]/60 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[22px] sm:h-[22px]">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 sm:gap-8 lg:gap-14">
              <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-3 sm:gap-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 shrink-0">
                  <motion.svg
                    viewBox="0 0 200 200"
                    className="w-full h-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: 'linear', duration: 18 }}
                  >
                    <defs>
                      <path id="modern-footer-circle-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                    </defs>
                    <text fill="#4f4637" className="text-[12px] font-black tracking-[2px] uppercase">
                      <textPath href="#modern-footer-circle-path" startOffset="0%" textLength="490" lengthAdjust="spacing">
                        backsoftware • backsoftware • backsoftware •
                      </textPath>
                    </text>
                  </motion.svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[11px] sm:text-xs font-black tracking-[0.16em] uppercase text-[#2d2818] text-center leading-tight">
                      Back<br/>Software
                    </span>
                  </div>
                </div>
                <div className="sm:flex-1 lg:flex-none">
                  <p className="text-xs sm:text-sm text-[#6a6050] leading-relaxed">
                    {t('footer.description')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-5 sm:gap-6 lg:gap-8">
                <div>
                  <h5 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#8a7f6a] mb-2 sm:mb-3">{t('footer.services')}</h5>
                  <div className="space-y-1 sm:space-y-2">
                    {footerServiceLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="block text-xs sm:text-sm font-semibold text-[#4b4336] hover:text-[#2d2818] transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#8a7f6a] mb-2 sm:mb-3">{t('footer.company')}</h5>
                  <div className="space-y-1 sm:space-y-2">
                    {footerCompanyLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="block text-xs sm:text-sm font-semibold text-[#4b4336] hover:text-[#2d2818] transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h5 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#8a7f6a] mb-2 sm:mb-3">{t('footer.contacts')}</h5>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-[#4b4336]">
                    <a href="mailto:info@backsoftware.it" className="block font-semibold hover:text-[#2d2818] transition-colors">
                      info@backsoftware.it
                    </a>
                    <a href="mailto:julian.rovera@pec.it" className="block font-semibold hover:text-[#2d2818] transition-colors truncate">
                      {t('footer.pec')} julian.rovera@pec.it
                    </a>
                    <a href="tel:+393513052627" className="block font-semibold hover:text-[#2d2818] transition-colors">
                      +39 351 305 2627
                    </a>
                    <p className="font-medium text-[#7a705d]">{t('footer.address')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 lg:mt-8 pt-4 sm:pt-5 border-t border-[#b8ad98]/30 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center sm:justify-between text-[10px] sm:text-xs text-[#7a705d]">
              <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
              <div className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
                <span>{t('footer.vat')}</span>
                <span aria-hidden="true">|</span>
                <Link href={`/${locale}/privacy/`} className="font-medium hover:text-[#5e5444] transition-colors">
                  {t('footer.privacy')}
                </Link>
                <span aria-hidden="true" className="hidden sm:inline">|</span>
                <Link href={`/${locale}/cookies/`} className="font-medium hover:text-[#5e5444] transition-colors">
                  {t('footer.cookies')}
                </Link>
                <span aria-hidden="true" className="hidden sm:inline">|</span>
                <Link href={`/${locale}/terms/`} className="font-medium hover:text-[#5e5444] transition-colors">
                  {t('footer.terms')}
                </Link>
              </div>
            </div>
          </footer>
          </div>
        </motion.div>
      </motion.section>

      <SiteCursorOverlay
        whyClipRef={whyLensClipRef}
        lensDesktopEnabled={lensDesktopEnabled}
        scrollContainerRef={modernSnapScrollRef}
      />
    </motion.div>
  );
}
