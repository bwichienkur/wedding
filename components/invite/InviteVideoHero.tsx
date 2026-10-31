"use client";

import { InviteDivider } from "@/components/invite/InviteDecor";
import { wedding } from "@/data/wedding";

/** Hero copy over the fixed scroll background (no separate hero video). */
export function InviteVideoHero() {
  const dateUpper = wedding.wedding.dateDisplay.toUpperCase();

  return (
    <section id="home" className="invite-hero" aria-labelledby="invite-hero-title">
      <div className="invite-hero-video-wrap invite-hero-scroll-bg">
        <div className="invite-hero-content">
          <div className="invite-hero-stack">
            <h1 id="invite-hero-title" className="invite-hero-stack-names">
              <span className="invite-hero-stack-name">
                {wedding.couple.partnerOne}
              </span>
              <span className="invite-hero-stack-amp">&amp;</span>
              <span className="invite-hero-stack-name">
                {wedding.couple.partnerTwo}
              </span>
            </h1>
            <p className="invite-hero-stack-occasion">Wedding Day</p>
            <InviteDivider className="invite-hero-stack-divider my-0 w-40" />
            <p className="invite-hero-stack-date">{dateUpper}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
