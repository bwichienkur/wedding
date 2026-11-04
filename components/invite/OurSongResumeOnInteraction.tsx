"use client";

import { useOurSongAudio } from "@/components/invite/our-song-audio-context";
import { bindOurSongResumeUntilPlaying } from "@/lib/media/our-song-engine";
import { useEffect } from "react";

/** After the invite is visible, any tap retries music until it plays (iOS post–intro video). */
export function OurSongResumeOnInteraction({ active }: { active: boolean }) {
  const { playFromUserGesture } = useOurSongAudio();

  useEffect(() => {
    if (!active) return;
    playFromUserGesture();
    return bindOurSongResumeUntilPlaying();
  }, [active, playFromUserGesture]);

  return null;
}
