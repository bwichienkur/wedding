"use client";

import { cn } from "@/lib/cn";

interface WaxSealProps {
  open: boolean;
  glowing: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
  className?: string;
}

/**
 * Photorealistic wax seal CTA — stock crimson seal with B&L monogram.
 * Centering stays on a non-animated wrapper so Motion never knocks it off-center.
 */
export function WaxSeal({
  open,
  glowing,
  reduceMotion,
  onOpen,
  className,
}: WaxSealProps) {
  return (
    <div
      className={cn(
        "absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2",
        className,
      )}
    >
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!open) onOpen();
        }}
        disabled={open}
        aria-label="Open invitation"
        className={cn(
          "block rounded-full transition-transform duration-300 ease-out",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3ebe2]",
          "disabled:cursor-default",
          !reduceMotion && !open && "hover:scale-105 active:scale-95",
          open && !reduceMotion && "-translate-y-7 scale-125 opacity-0",
          open && reduceMotion && "opacity-0",
          glowing && !open && !reduceMotion && "scale-105",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/wax-seal-bl.webp"
          alt=""
          width={160}
          height={160}
          draggable={false}
          className={cn(
            "pointer-events-none h-[min(28vw,7rem)] w-[min(28vw,7rem)] sm:h-28 sm:w-28",
            "select-none drop-shadow-[0_12px_22px_rgba(40,16,18,0.5)]",
            glowing && !open && !reduceMotion && "brightness-110",
          )}
        />
        <span className="sr-only">Open invitation</span>
      </button>
    </div>
  );
}
