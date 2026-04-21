'use client';

import { motion } from 'framer-motion';

/** Shared layout — dark / light only swap surface + text colors (pixel-coincident). */
const HEADER_BLOCK = 'mb-6 sm:mb-12 space-y-3 sm:space-y-4';
const GRID_BLOCK = 'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8';
const CARD_BASE =
  'p-4 sm:p-8 relative group transition-all duration-300 sm:hover:scale-[1.02] overflow-hidden';
const NUM_BLOCK =
  'text-4xl sm:text-6xl font-black mb-2 sm:mb-4 tracking-tighter transition-opacity duration-500 select-none';
const TITLE_BLOCK = 'text-lg sm:text-2xl font-black mb-2 sm:mb-3 tracking-tight transition-colors duration-300';
const DESC_BLOCK = 'text-sm sm:text-base leading-relaxed';

/**
 * Why Us — identical DOM layout for dark vs light (light = Servizi-style clay + palette).
 */
export default function WhyUsDualContent({
  variant,
  t,
  sectionTitleClass,
  sectionTitleReveal,
  sectionSubtitleReveal,
  itemVariants,
}) {
  const light = variant === 'light';
  const cards = [
    { num: '01', title: t('whyUs.cards.01.title'), desc: t('whyUs.cards.01.desc') },
    { num: '02', title: t('whyUs.cards.02.title'), desc: t('whyUs.cards.02.desc') },
    { num: '03', title: t('whyUs.cards.03.title'), desc: t('whyUs.cards.03.desc') },
  ];

  return (
    <>
      <motion.div
        variants={itemVariants}
        initial={light ? false : undefined}
        className={`${HEADER_BLOCK} antialiased`}
      >
        {light ? (
          <>
            <h2 className={`${sectionTitleClass} text-[#2d2818]`}>{t('whyUs.title')}</h2>
            <p className="text-sm font-medium leading-relaxed text-[#6a6050] sm:text-lg max-w-2xl">
              {t('whyUs.subtitle')}
            </p>
          </>
        ) : (
          <>
            <motion.h2 {...sectionTitleReveal} className={`${sectionTitleClass} text-[#f5f2ec]`}>
              {t('whyUs.title')}
            </motion.h2>
            <motion.p
              {...sectionSubtitleReveal}
              className="text-sm sm:text-lg leading-relaxed max-w-2xl font-medium"
              style={{ color: '#a09a88' }}
            >
              {t('whyUs.subtitle')}
            </motion.p>
          </>
        )}
      </motion.div>

      <div className={GRID_BLOCK}>
        {cards.map((item, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            initial={light ? false : undefined}
            className={`${light ? 'clay-card' : 'clay-card-dark'} ${CARD_BASE}`}
          >
            <div
              className="absolute top-0 left-6 sm:left-8 right-6 sm:right-8 h-px transition-all duration-500 sm:group-hover:left-6 sm:group-hover:right-6"
              style={{
                background: light
                  ? 'linear-gradient(90deg, transparent 0%, rgba(196, 180, 148, 0.5) 50%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(196, 180, 148, 0.25) 50%, transparent 100%)',
              }}
            />
            <div
              className="hidden sm:block absolute top-0 left-12 right-12 h-px opacity-0 group-hover:opacity-100 blur-[2px] transition-all duration-500"
              style={{
                background: light
                  ? 'linear-gradient(90deg, transparent 0%, rgba(196, 180, 148, 0.35) 50%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(196, 180, 148, 0.4) 50%, transparent 100%)',
              }}
            />
            <div
              className={`${NUM_BLOCK} ${
                light
                  ? 'opacity-[0.14] text-[#b8ad98]'
                  : 'opacity-[0.08] group-hover:opacity-[0.15]'
              }`}
              style={
                !light
                  ? { color: '#d4cabb', WebkitTextStroke: '1px rgba(212, 202, 187, 0.15)' }
                  : undefined
              }
            >
              {item.num}
            </div>
            <h4
              className={`${TITLE_BLOCK} ${
                light ? 'text-[#2d2818]' : 'text-[#ede8de] group-hover:text-[#f5f2ec]'
              }`}
            >
              {item.title}
            </h4>
            <p
              className={DESC_BLOCK}
              style={light ? { color: '#6a6050' } : { color: '#9a9484' }}
            >
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </>
  );
}
