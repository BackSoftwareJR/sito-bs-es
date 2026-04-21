"use client";

import React from "react";

const toneMap = {
  espresso: {
    bg: "#3f3528",
    subtle: "#5a4a35",
    fg: "#fff8ec",
    highlight: "#e2bc7a",
    highlightSubtle: "#f2d7a3",
  },
  clay: {
    bg: "#fdfcf9",
    subtle: "#e8decd",
    fg: "#3d3828",
    highlight: "#7c5c2f",
    highlightSubtle: "#9d7a4a",
  },
};

const sizeMap = {
  sm: "px-3 sm:px-4 lg:px-5 py-1.5 text-[10px] sm:text-xs lg:text-sm min-h-[36px]",
  md: "px-6 py-3 text-sm sm:text-base min-h-[44px]",
  lg: "px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl min-h-[52px]",
};

export function ShinyButton({
  children,
  onClick,
  className = "",
  href,
  tone = "espresso",
  size = "md",
  intensity = "normal",
}) {
  const palette = toneMap[tone] || toneMap.espresso;
  const sizeClasses = sizeMap[size] || sizeMap.md;
  const Comp = href ? "a" : "button";

  return (
    <>
      <style jsx>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-angle-offset {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @property --gradient-percent {
          syntax: "<percentage>";
          initial-value: 5%;
          inherits: false;
        }

        @property --gradient-shine {
          syntax: "<color>";
          initial-value: white;
          inherits: false;
        }

        .shiny-cta {
          --animation: gradient-angle linear infinite;
          --duration: 3.8s;
          --shadow-size: 2px;
          --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);

          isolation: isolate;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          outline-offset: 4px;
          font-family: "Inter", sans-serif;
          line-height: 1.2;
          font-weight: 700;
          border: 1px solid transparent;
          border-radius: 999px;
          color: var(--shiny-cta-fg);
          background:
            linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
            conic-gradient(
              from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
              transparent,
              var(--shiny-cta-highlight) var(--gradient-percent),
              var(--gradient-shine) calc(var(--gradient-percent) * 2),
              var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
              transparent calc(var(--gradient-percent) * 4)
            ) border-box;
          box-shadow:
            inset 0 0 0 1px var(--shiny-cta-bg-subtle),
            0 8px 20px rgba(60, 48, 34, 0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: var(--transition);
          transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine, transform;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }

        .shiny-cta[data-intensity="strong"] {
          --duration: 2.7s;
          box-shadow:
            inset 0 0 0 1px color-mix(in hsl, var(--shiny-cta-bg-subtle), white 16%),
            0 12px 28px rgba(40, 28, 18, 0.3),
            0 0 0 1px color-mix(in hsl, var(--shiny-cta-highlight), transparent 60%);
        }

        .shiny-cta[data-intensity="strong"]::before {
          opacity: 0.5;
        }

        .shiny-cta[data-intensity="strong"]::after {
          opacity: 0.62;
        }

        .shiny-cta::before,
        .shiny-cta::after,
        .shiny-cta span::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset-inline-start: 50%;
          inset-block-start: 50%;
          translate: -50% -50%;
          z-index: -1;
        }

        .shiny-cta:active {
          translate: 0 1px;
        }

        .shiny-cta::before {
          --size: calc(100% - var(--shadow-size) * 3);
          --position: 2px;
          --space: calc(var(--position) * 2);
          width: var(--size);
          height: var(--size);
          background: radial-gradient(
            circle at var(--position) var(--position),
            white calc(var(--position) / 4),
            transparent 0
          ) padding-box;
          background-size: var(--space) var(--space);
          background-repeat: space;
          mask-image: conic-gradient(
            from calc(var(--gradient-angle) + 45deg),
            black,
            transparent 10% 90%,
            black
          );
          border-radius: inherit;
          opacity: 0.32;
          z-index: -1;
        }

        .shiny-cta::after {
          --animation: shimmer linear infinite;
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(-50deg, transparent, var(--shiny-cta-highlight), transparent);
          mask-image: radial-gradient(circle at bottom, transparent 40%, black);
          opacity: 0.45;
        }

        .shiny-cta span {
          z-index: 1;
          position: relative;
        }

        .shiny-cta span::before {
          width: 140%;
          height: 240%;
          border-radius: 999px;
          background: radial-gradient(
            ellipse at center,
            color-mix(in hsl, var(--shiny-cta-highlight), white 22%) 0%,
            color-mix(in hsl, var(--shiny-cta-highlight), transparent 60%) 35%,
            color-mix(in hsl, var(--shiny-cta-highlight), transparent 85%) 65%,
            transparent 92%
          );
          filter: blur(16px);
          opacity: 0;
          transition: opacity var(--transition);
          animation: calc(var(--duration) * 1.5) breathe linear infinite;
        }

        .shiny-cta,
        .shiny-cta::before,
        .shiny-cta::after {
          animation: var(--animation) var(--duration), var(--animation) calc(var(--duration) / 0.4) reverse paused;
          animation-composition: add;
        }

        .shiny-cta:is(:hover, :focus-visible) {
          --gradient-percent: 20%;
          --gradient-angle-offset: 95deg;
          --gradient-shine: var(--shiny-cta-highlight-subtle);
          transform: translateY(-1px) scale(1.01);
        }

        .shiny-cta[data-intensity="strong"]:is(:hover, :focus-visible) {
          --gradient-percent: 34%;
          --gradient-angle-offset: 144deg;
          --gradient-shine: color-mix(in hsl, var(--shiny-cta-highlight-subtle), white 28%);
          transform: translateY(-1px) scale(1.035);
          box-shadow:
            inset 0 0 0 1px color-mix(in hsl, var(--shiny-cta-bg-subtle), white 20%),
            0 16px 36px rgba(40, 28, 18, 0.32),
            inset 0 0 12px color-mix(in hsl, var(--shiny-cta-highlight), transparent 85%),
            0 0 30px color-mix(in hsl, var(--shiny-cta-highlight), transparent 50%);
        }

        .shiny-cta:is(:hover, :focus-visible),
        .shiny-cta:is(:hover, :focus-visible)::before,
        .shiny-cta:is(:hover, :focus-visible)::after {
          animation-play-state: running;
        }

        .shiny-cta:is(:hover, :focus-visible) span::before {
          opacity: 1;
        }

        @keyframes gradient-angle {
          to {
            --gradient-angle: 360deg;
          }
        }

        @keyframes shimmer {
          to {
            rotate: 360deg;
          }
        }

        @keyframes breathe {
          from,
          to {
            scale: 1;
          }
          50% {
            scale: 1.2;
          }
        }
      `}</style>

      <Comp
        className={`shiny-cta ${sizeClasses} ${className}`}
        onClick={onClick}
        href={href}
        data-intensity={intensity}
        {...(!href ? { type: "button" } : {})}
        style={{
          "--shiny-cta-bg": palette.bg,
          "--shiny-cta-bg-subtle": palette.subtle,
          "--shiny-cta-fg": palette.fg,
          "--shiny-cta-highlight": palette.highlight,
          "--shiny-cta-highlight-subtle": palette.highlightSubtle,
        }}
      >
        <span>{children}</span>
      </Comp>
    </>
  );
}
