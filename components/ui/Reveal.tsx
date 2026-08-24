"use client";

import {
  fadeUpSmallVariants,
  fadeUpVariants,
  revealViewport,
  staggerContainerVariants,
  staggerFastContainerVariants,
} from "@/lib/motion";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  className?: string;
  /** Smaller travel distance for nested items */
  compact?: boolean;
};

/** One-shot scroll reveal — fades and rises into view. */
export function Reveal({
  children,
  className,
  compact = false,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={compact ? fadeUpSmallVariants : fadeUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Parent for staggered child reveals. */
export function RevealGroup({
  children,
  className,
  fast = false,
}: {
  children: ReactNode;
  className?: string;
  fast?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={fast ? staggerFastContainerVariants : staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      {children}
    </motion.div>
  );
}

/** Child of RevealGroup — inherits stagger timing. */
export function RevealItem({
  children,
  className,
  compact = false,
}: {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={compact ? fadeUpSmallVariants : fadeUpVariants}
    >
      {children}
    </motion.div>
  );
}

/** Horizontal divider that grows from center/left on scroll. */
export function RevealLine({
  className,
  origin = "left",
}: {
  className?: string;
  origin?: "left" | "center";
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className={cn("h-px w-16 bg-rose/70", className)}
        aria-hidden
      />
    );
  }

  return (
    <motion.div
      className={cn("h-px w-16 origin-left bg-rose/70", className)}
      style={{ transformOrigin: origin === "center" ? "center" : "left" }}
      initial={{ scaleX: 0, opacity: 0.35 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={revealViewport}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    />
  );
}
