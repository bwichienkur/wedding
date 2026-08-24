"use client";

import { WaxSeal } from "@/components/entry/WaxSeal";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { editorialEase } from "@/lib/motion";
import { motion } from "motion/react";

interface InvitationEnvelopeProps {
  open: boolean;
  glowing: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
}

const flapTransition = (delay: number, reduceMotion: boolean) =>
  reduceMotion
    ? { duration: 0 }
    : { duration: 0.95, delay, ease: editorialEase };

/**
 * Portrait invitation envelope with four meeting flaps and a central wax seal.
 * Inspired by sealed digital invites — paper + wax, not golden-thread illustration.
 */
export function InvitationEnvelope({
  open,
  glowing,
  reduceMotion,
  onOpen,
}: InvitationEnvelopeProps) {
  return (
    <div
      className="relative mx-auto w-[min(72vw,17.5rem)] sm:w-[18.5rem]"
      style={{ perspective: reduceMotion ? undefined : 1400 }}
    >
      <div
        className={cn(
          "envelope-shell relative aspect-[9/16] w-full overflow-visible rounded-sm",
          "shadow-[0_28px_60px_-18px_rgba(48,20,24,0.55),0_8px_20px_rgba(48,20,24,0.25)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Cardstock base under the flaps */}
        <div
          className="envelope-liner absolute inset-0 rounded-sm"
          aria-hidden
        />

        {/* Subtle invitation peek when opening */}
        <motion.div
          className="absolute inset-[12%] flex flex-col items-center justify-center bg-[#f4ebe0] text-center"
          aria-hidden
          initial={false}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.25 }}
        >
          <p className="font-display text-lg text-[#3a2426]">
            {wedding.couple.partnerOne}
          </p>
          <p className="font-display text-base text-[#8f655c]">&</p>
          <p className="font-display text-lg text-[#3a2426]">
            {wedding.couple.partnerTwo}
          </p>
          <p className="mt-3 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-[#6b605a]">
            {wedding.wedding.dateDisplay}
          </p>
        </motion.div>

        <EnvelopeFlap
          side="top"
          open={open}
          reduceMotion={reduceMotion}
          delay={0.08}
        />
        <EnvelopeFlap
          side="bottom"
          open={open}
          reduceMotion={reduceMotion}
          delay={0.14}
        />
        <EnvelopeFlap
          side="left"
          open={open}
          reduceMotion={reduceMotion}
          delay={0.05}
        />
        <EnvelopeFlap
          side="right"
          open={open}
          reduceMotion={reduceMotion}
          delay={0.11}
        />

        <WaxSeal
          open={open}
          glowing={glowing}
          reduceMotion={Boolean(reduceMotion)}
          onOpen={onOpen}
        />
      </div>

      <p
        className={cn(
          "pointer-events-none mt-6 text-center font-display text-xl text-[#3a2426] sm:text-2xl",
          open && "opacity-0",
        )}
      >
        {wedding.couple.displayName}
      </p>
      <p
        className={cn(
          "pointer-events-none mt-2 text-center font-sans text-xs uppercase tracking-[0.28em] text-[#6b605a]",
          open && "opacity-0",
        )}
      >
        {wedding.wedding.dateDisplay}
      </p>
      <p
        className={cn(
          "pointer-events-none mt-5 text-center font-sans text-sm tracking-wide text-[#8f655c]",
          open && "opacity-0",
        )}
      >
        Tap the seal to open
      </p>
    </div>
  );
}

function EnvelopeFlap({
  side,
  open,
  reduceMotion,
  delay,
}: {
  side: "top" | "bottom" | "left" | "right";
  open: boolean;
  reduceMotion: boolean | null;
  delay: number;
}) {
  const closed = { rotateX: 0, rotateY: 0 };
  const opened =
    side === "top"
      ? { rotateX: -155, rotateY: 0 }
      : side === "bottom"
        ? { rotateX: 155, rotateY: 0 }
        : side === "left"
          ? { rotateX: 0, rotateY: -155 }
          : { rotateX: 0, rotateY: 155 };

  return (
    <motion.div
      className={cn("envelope-flap absolute", `envelope-flap-${side}`)}
      aria-hidden
      initial={false}
      animate={
        open && !reduceMotion
          ? { ...opened, opacity: 0.85 }
          : { ...closed, opacity: 1 }
      }
      transition={flapTransition(delay, Boolean(reduceMotion))}
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        transformOrigin:
          side === "top"
            ? "50% 0%"
            : side === "bottom"
              ? "50% 100%"
              : side === "left"
                ? "0% 50%"
                : "100% 50%",
      }}
    >
      <div className="envelope-flap-face absolute inset-0">
        <EmbossMotif side={side} />
      </div>
    </motion.div>
  );
}

function EmbossMotif({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  // Quiet botanical relief — pressed into the paper, not a thread graphic.
  if (side === "left" || side === "right") {
    return (
      <svg
        viewBox="0 0 120 240"
        className="absolute inset-0 h-full w-full opacity-[0.22]"
        aria-hidden
      >
        <g
          fill="none"
          stroke="#e8d5c4"
          strokeWidth="1.1"
          strokeLinecap="round"
          transform={side === "right" ? "translate(120,0) scale(-1,1)" : undefined}
        >
          <path d="M34 40 C48 70, 42 110, 58 140 C70 162, 66 190, 78 214" />
          <path d="M58 140 C40 128, 28 148, 36 162" />
          <path d="M58 140 C78 132, 88 152, 76 166" />
          <path d="M48 88 C34 92, 30 108, 40 116" />
          <path d="M48 88 C62 80, 72 94, 64 106" />
          <circle cx="58" cy="140" r="2.2" fill="#e8d5c4" stroke="none" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 120"
      className="absolute inset-0 h-full w-full opacity-[0.2]"
      aria-hidden
    >
      <g
        fill="none"
        stroke="#e8d5c4"
        strokeWidth="1.1"
        strokeLinecap="round"
        transform={
          side === "bottom" ? "translate(0,120) scale(1,-1)" : undefined
        }
      >
        <path d="M70 34 C100 48, 120 28, 150 42 C170 52, 180 44, 196 52" />
        <path d="M120 36 C112 22, 128 14, 136 28" />
        <path d="M150 42 C158 28, 176 30, 172 46" />
      </g>
    </svg>
  );
}
