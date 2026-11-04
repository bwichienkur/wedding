"use client";

import { ourSong } from "@/data/our-song";

const DEFAULT_PATH = "/api/media/our-song";

let audio: HTMLAudioElement | null = null;
let wantsPlay = false;
let userMuted = false;
const unlockListeners = new Set<() => void>();
const muteListeners = new Set<() => void>();

function resolveSrc(): string {
  if (typeof window === "undefined") return DEFAULT_PATH;
  return new URL(DEFAULT_PATH, window.location.origin).href;
}

export function getOurSongAudio(): HTMLAudioElement | null {
  if (typeof document === "undefined" || !ourSong.enabled) return null;
  if (audio) return audio;

  audio = document.createElement("audio");
  audio.src = resolveSrc();
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.55;
  audio.setAttribute("playsinline", "true");
  audio.className =
    "pointer-events-none fixed left-0 top-0 h-px w-px opacity-[0.01]";
  audio.setAttribute("aria-hidden", "true");
  document.body.appendChild(audio);

  void fetch("/api/media/our-song/config")
    .then((response) => (response.ok ? response.json() : null))
    .then((data: { enabled?: boolean; src?: string | null } | null) => {
      if (!data?.enabled || !data.src || !audio) return;
      const next = new URL(data.src, window.location.origin).href;
      if (audio.src !== next) audio.src = next;
      if (wantsPlay) void tryPlay(true);
    })
    .catch(() => {});

  const onReady = () => {
    if (wantsPlay) void tryPlay(false);
  };
  audio.addEventListener("canplaythrough", onReady);
  audio.addEventListener("canplay", onReady);

  return audio;
}

function applyMuteState(element: HTMLAudioElement) {
  element.volume = 0.55;
  element.muted = userMuted;
}

async function tryPlay(fromGesture: boolean): Promise<void> {
  const element = getOurSongAudio();
  if (!element || !ourSong.enabled || !wantsPlay) return;
  if (!element.paused && element.currentTime > 0.02) return;

  applyMuteState(element);

  const playAudible = () => {
    applyMuteState(element);
    unlockListeners.forEach((listener) => listener());
  };

  try {
    await element.play();
    playAudible();
    return;
  } catch {
    if (!fromGesture || userMuted) {
      return;
    }
  }

  try {
    element.muted = true;
    await element.play();
    if (!userMuted) element.muted = false;
    element.volume = 0.55;
    playAudible();
  } catch {
    element.muted = userMuted;
  }
}

/** Call synchronously from envelope tap / touch handlers. */
export function playOurSongFromUserGesture(): void {
  if (!ourSong.enabled) return;
  wantsPlay = true;
  getOurSongAudio();
  void tryPlay(true);
}

export function retryOurSongAfterGesture(): void {
  if (!wantsPlay) return;
  void tryPlay(true);
}

export function getOurSongUserMuted(): boolean {
  return userMuted;
}

export function setOurSongUserMuted(muted: boolean): void {
  userMuted = muted;
  if (audio) {
    audio.muted = muted;
    if (!muted && wantsPlay && audio.paused) {
      void tryPlay(false);
    }
  }
  muteListeners.forEach((listener) => listener());
}

export function subscribeOurSongUnlock(listener: () => void): () => void {
  unlockListeners.add(listener);
  return () => unlockListeners.delete(listener);
}

export function subscribeOurSongMuted(listener: () => void): () => void {
  muteListeners.add(listener);
  return () => muteListeners.delete(listener);
}

export function ourSongFeatureEnabled(): boolean {
  return ourSong.enabled;
}

/** Warm up the element as soon as the client bundle runs on the home page. */
if (typeof window !== "undefined" && ourSong.enabled) {
  queueMicrotask(() => {
    getOurSongAudio();
  });

  window.addEventListener(
    "pointerdown",
    () => {
      retryOurSongAfterGesture();
    },
    { capture: true },
  );
}
