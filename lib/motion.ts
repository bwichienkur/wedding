import type { Transition, Variants } from "motion/react";

/** Editorial easing — refined, never bouncy. */
export const editorialEase = [0.22, 1, 0.36, 1] as const;

export const revealTransition: Transition = {
  duration: 0.8,
  ease: editorialEase,
};

export const softTransition: Transition = {
  duration: 0.55,
  ease: editorialEase,
};

export const heroItemTransition: Transition = {
  duration: 0.9,
  ease: editorialEase,
};

export const revealViewport = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -8% 0px",
} as const;

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: revealTransition,
  },
};

export const fadeUpSmallVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: softTransition,
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

export const staggerFastContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const heroStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.35,
    },
  },
};

export const lineGrowVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0.4 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.9, ease: editorialEase },
  },
};

export const buttonSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
  mass: 0.6,
};
