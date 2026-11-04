"use client";

import { ourSong } from "@/data/our-song";
import { OUR_SONG_PLAYBACK_PATH } from "@/lib/media/our-song-playback-path";

const DEFAULT_PATH = OUR_SONG_PLAYBACK_PATH;
/** Short window for extra pointer events; primary unlock uses `gestureUnlockActive`. */
const GESTURE_WINDOW_MS = 4000;
/** Keep retrying play after the envelope tap until audio starts or this elapses. */
const UNLOCK_HOLD_MS = 90_000;

let audio: HTMLAudioElement | null = null;
let playbackPath = DEFAULT_PATH;
let wantsPlay = false;
let userMuted = false;
let lastUserGestureAt = 0;
let gestureUnlockActive = false;
let gestureUnlockTimer: ReturnType<typeof setTimeout> | null = null;
const unlockListeners = new Set<() => void>();
const muteListeners = new Set<() => void>();
const playingListeners = new Set<() => void>();
let retryInterval: ReturnType<typeof setInterval> | null = null;

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

function beginGestureUnlock(): void {
  markUserGesture();
  gestureUnlockActive = true;
  if (gestureUnlockTimer) clearTimeout(gestureUnlockTimer);
  gestureUnlockTimer = setTimeout(() => {
    gestureUnlockActive = false;
    gestureUnlockTimer = null;
    stopRetryInterval();
  }, UNLOCK_HOLD_MS);
  startRetryInterval();
}

function endGestureUnlock(): void {
  gestureUnlockActive = false;
  if (gestureUnlockTimer) {
    clearTimeout(gestureUnlockTimer);
    gestureUnlockTimer = null;
  }
  stopRetryInterval();
}

function mayUnlock(): boolean {
  return gestureUnlockActive || withinGestureWindow();
}

/** Same-origin path from the server (`/api/media/our-song` or local fallback). */
export function configureOurSongPlayback(path: string): void {
  if (!path.startsWith("/")) return;
  playbackPath = path;
  if (!audio) return;
  const href = resolveSrc();
  if (audio.src !== href) {
    audio.src = href;
    audio.load();
  }
}

function isAudiblyPlaying(element: HTMLAudioElement): boolean {
  return (
    !element.paused &&
    !element.ended &&
    !element.muted &&
    !userMuted &&
    element.currentTime > 0.02
  );
}

function notifyPlaying(): void {
  playingListeners.forEach((listener) => listener());
}

function stopRetryInterval(): void {
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
  }
}

function startRetryInterval(): void {
  stopRetryInterval();
  retryInterval = setInterval(() => {
    if (!wantsPlay || !audio || !gestureUnlockActive) {
      stopRetryInterval();
      return;
    }
    if (isAudiblyPlaying(audio)) {
      stopRetryInterval();
      return;
    }
    attemptPlayFromGesture(audio);
  }, 2500);
}

function notifyUnlock(): void {
  unlockListeners.forEach((listener) => listener());
  notifyPlaying();
}

function applyMuteState(element: HTMLAudioElement) {
  element.volume = 0.55;
  element.muted = userMuted;
}

/**
 * Invoke play() synchronously from a user-gesture stack. Follow-up attempts use
 * promise callbacks (Safari allows chained play after an in-gesture play() call).
 */
function attemptPlayFromGesture(element: HTMLAudioElement): void {
  applyMuteState(element);

  const playPromise = element.play();
  if (playPromise === undefined) {
    applyMuteState(element);
    if (isAudiblyPlaying(element)) endGestureUnlock();
    notifyUnlock();
    return;
  }

  playPromise
    .then(() => {
      applyMuteState(element);
      if (isAudiblyPlaying(element)) endGestureUnlock();
      notifyUnlock();
    })
    .catch(() => {
      if (!mayUnlock() || userMuted) return;

      element.muted = true;
      const mutedPlay = element.play();
      if (mutedPlay === undefined) return;

      mutedPlay
        .then(() => {
          if (!userMuted) {
            element.muted = false;
          }
          element.volume = 0.55;
          applyMuteState(element);
          if (isAudiblyPlaying(element)) endGestureUnlock();
          notifyUnlock();
        })
        .catch(() => {
          element.muted = userMuted;
        });
    });
}

function scheduleRetryWhenReady(): void {
  if (!audio || !wantsPlay) return;
  const onProgress = () => {
    if (!wantsPlay || !audio) return;
    if (isAudiblyPlaying(audio)) {
      audio.removeEventListener("canplay", onProgress);
      audio.removeEventListener("canplaythrough", onProgress);
      audio.removeEventListener("loadeddata", onProgress);
      return;
    }
    if (mayUnlock()) {
      attemptPlayFromGesture(audio);
    }
  };
  audio.addEventListener("canplay", onProgress);
  audio.addEventListener("canplaythrough", onProgress);
  audio.addEventListener("loadeddata", onProgress);
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

  audio.addEventListener("playing", () => {
    notifyPlaying();
    if (isAudiblyPlaying(audio!)) endGestureUnlock();
  });
  audio.addEventListener("pause", () => notifyPlaying());

  audio.addEventListener("error", () => {
    if (wantsPlay && mayUnlock() && audio) {
      attemptPlayFromGesture(audio);
    }
  });

  scheduleRetryWhenReady();

  return audio;
}

/** Call synchronously from envelope tap / touch handlers. */
export function playOurSongFromUserGesture(): void {
  if (!ourSong.enabled) return;
  wantsPlay = true;
  beginGestureUnlock();
  const element = getOurSongAudio();
  if (!element) return;
  attemptPlayFromGesture(element);
}

export function retryOurSongAfterGesture(): void {
  if (!wantsPlay) return;
  beginGestureUnlock();
  const element = getOurSongAudio();
  if (!element || isAudiblyPlaying(element)) return;
  attemptPlayFromGesture(element);
}

export function getOurSongIsAudiblyPlaying(): boolean {
  if (!audio) return false;
  return isAudiblyPlaying(audio);
}

export function getOurSongUserMuted(): boolean {
  return userMuted;
}

export function setOurSongUserMuted(muted: boolean): void {
  userMuted = muted;
  if (audio) {
    audio.muted = muted;
    if (!muted && wantsPlay && !isAudiblyPlaying(audio)) {
      beginGestureUnlock();
      attemptPlayFromGesture(audio);
    }
  }
  muteListeners.forEach((listener) => listener());
  notifyPlaying();
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
