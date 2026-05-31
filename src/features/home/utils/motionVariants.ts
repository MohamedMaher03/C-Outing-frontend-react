import type { Variants, Transition } from "framer-motion";

export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const buildStateTransition = (reducedMotion: boolean): Transition => ({
  duration: reducedMotion ? 0.01 : 0.24,
  ease: EASE_OUT_QUART,
});

export const buildHeroContainerVariants = (reducedMotion: boolean): Variants => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reducedMotion ? 0.01 : 0.62,
      ease: EASE_OUT_EXPO,
      staggerChildren: reducedMotion ? 0 : 0.12,
      delayChildren: reducedMotion ? 0 : 0.08,
    },
  },
});

export const buildHeroItemVariants = (reducedMotion: boolean): Variants => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reducedMotion ? 0.01 : 0.48,
      ease: EASE_OUT_QUART,
    },
  },
});

export const buildStaggeredCardDelay = (
  index: number,
  reducedMotion: boolean,
  base = 0,
): number => (reducedMotion ? 0 : base + Math.min(index * 0.06, 0.28));
