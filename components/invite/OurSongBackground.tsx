"use client";

import { useOurSongAudio } from "@/components/invite/our-song-audio-context";
import { forwardRef, useImperativeHandle } from "react";

export type OurSongBackgroundHandle = {
  playFromUserGesture: () => void;
};

/** Bridges gesture playback to the shared audio provider. */
export const OurSongBackground = forwardRef<
  OurSongBackgroundHandle,
  object
>(function OurSongBackground(_props, ref) {
  const { playFromUserGesture } = useOurSongAudio();
  useImperativeHandle(ref, () => ({ playFromUserGesture }));
  return null;
});
