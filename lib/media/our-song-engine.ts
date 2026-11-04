"use client";

import { ourSong } from "@/data/our-song";

const DEFAULT_PATH = "/api/media/our-song";
/** iOS/Safari allow play() shortly after the tap that set wantsPlay. */
const GESTURE_WINDOW_MS = 4000;

let audio: HTMLAudioElement | null = null;
let playbackPath = DEFAULT_PATH;
let wantsPlay = false;
let userMuted = false;
let lastUserGestureAt = 0;
const unlockListeners = new Set<() => void>();
const muteListeners = new Set<() => void>();

function resolveSrc(): string {
  if (typeof window === "undefined") return DEFAULT_PATH;
  return new URL(playbackPath, window.location.origin).href;
}

function withinGestureWindow(): boolean {
  return Date.now() - lastUserGestureAt < GESTURE_WINDOW_MS;
}

function markUserGesture(): void {
  lastUserGestureAt = Date.now();
}

/** Same-origin path from the server (`/api/media/our-song` or local fallback). */
export function configureOurSongPlayback(path: string): void {
  if (!path.startsWith("/")) return;
  playbackPath = path;
  if (!audio) return;
  const href = resolveSrc();
  if (audio.src !== href) {
    audio.src = href;
  }
}

function isAudiblyPlaying(element: HTMLAudioElement): boolean {
  return (
    !element.paused &&
    !element.ended &&
    element.currentTime > 0.04 &&
    !element.muted
  );
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

  const onReady = () => {
    if (wantsPlay) void tryPlay(false);
  };
  audio.addEventListener("canplaythrough", onReady);
  audio.addEventListener("canplay", onReady);
  audio.addEventListener("loadeddata", onReady);
  audio.addEventListener("error", () => {
    if (wantsPlay) void tryPlay(withinGestureWindow());
  });

  return audio;
}

function applyMuteState(element: HTMLAudioElement) {
  element.volume = 0.55;
  element.muted = userMuted;
}

async function tryPlay(fromGesture: boolean): Promise<void> {
  const element = getOurSongAudio();
  if (!element || !ourSong.enabled || !wantsPlay) return;
  if (isAudiblyPlaying(element)) return;

  const mayUnlock = fromGesture || withinGestureWindow();
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
    if (!mayUnlock || userMuted) {
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
  markUserGesture();
  wantsPlay = true;
  getOurSongAudio();
  void tryPlay(true);
}

export function retryOurSongAfterGesture(): void {
  if (!wantsPlay) return;
  markUserGesture();
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
      void tryPlay(withinGestureWindow());
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
