import type { Transition, Variants } from 'framer-motion';

/** Premium easing curve used throughout the app. */
export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const spring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 30,
  mass: 0.9,
};

export const gentle: Transition = {
  duration: 0.6,
  ease: premiumEase,
};

/** Fade + rise, used for content blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

/** Stagger container for section lists. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Section panel entrance. */
export const panelVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
};
