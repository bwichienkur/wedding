"use client";

import { cn } from "@/lib/cn";
import { motion } from "motion/react";

interface WaxSealProps {
  open: boolean;
  glowing: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
  className?: string;
}

/**
 * Photorealistic wax seal CTA — stock crimson seal with B&L monogram.
 */
export function WaxSeal({
  open,
  glowing,
  reduceMotion,
  onOpen,
  className,
}: WaxSealProps) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      disabled={open}
      aria-label="Open invitation"
      className={cn(
        "absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2",
        "rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory",
        "disabled:cursor-default",
        className,
      )}
      initial={false}
      animate={
        reduceMotion
          ? { opacity: open ? 0 : 1, scale: 1 }
          : open
            ? { opacity: 0, scale: 1.35, y: -28 }
            : glowing
              ? { opacity: 1, scale: 1.06, y: 0 }
              : { opacity: 1, scale: 1, y: 0 }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : open
            ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.35, ease: "easeOut" }
      }
      whileHover={
        reduceMotion || open ? undefined : { scale: 1.05 }
      }
      whileTap={reduceMotion || open ? undefined : { scale: 0.97 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/wax-seal-bl.webp"
        alt=""
        width={160}
        height={160}
        draggable={false}
        className={cn(
          "h-[min(22vw,5.75rem)] w-[min(22vw,5.75rem)] sm:h-24 sm:w-24",
          "select-none drop-shadow-[0_10px_18px_rgba(40,16,18,0.45)]",
          glowing && !open && !reduceMotion && "brightness-110",
        )}
      />
      <span className="sr-only">Open invitation</span>
    </motion.button>
  );
}
