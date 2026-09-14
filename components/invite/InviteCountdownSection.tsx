"use client";

import { InviteDivider } from "@/components/invite/InviteDecor";
import { wedding } from "@/data/wedding";
import { useWeddingCountdown } from "@/lib/useWeddingCountdown";

export function InviteCountdownSection() {
  const countdown = useWeddingCountdown();

  if (!wedding.featureFlags.countdown || !countdown) return null;

  return (
    <section
      id="countdown"
      className="invite-section invite-countdown"
      aria-live="polite"
    >
      <h2 className="invite-section-heading text-center">Countdown</h2>
      <p className="invite-section-subline text-center">
        We can&apos;t wait for this moment
      </p>
      <InviteDivider className="my-6" />

      {countdown.isPast ? (
        <p className="text-center font-display text-lg italic text-invite-body/80">
          With love from our wedding day
        </p>
      ) : (
        <div className="invite-countdown-grid">
          <CountdownUnit value={countdown.days} label="Days" />
          <span className="invite-countdown-sep" aria-hidden>
            ·
          </span>
          <CountdownUnit value={countdown.hours} label="Hours" />
          <span className="invite-countdown-sep" aria-hidden>
            ·
          </span>
          <CountdownUnit value={countdown.minutes} label="Minutes" />
        </div>
      )}
    </section>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="invite-countdown-unit">
      <p className="invite-countdown-value">{value}</p>
      <p className="invite-countdown-label">{label}</p>
    </div>
  );
}
