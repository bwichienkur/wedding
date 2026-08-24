"use client";

import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { WeddingPlayer, type PlayerStatus } from "@/components/video/WeddingPlayer";
import { getPlacement } from "@/data/video";
import { trackEvent } from "@/lib/analytics";
import { useCallback, useEffect, useId, useRef, useState } from "react";

interface PlaybackPayload {
  asset: {
    id: string;
    title: string;
    description: string;
    status: string;
    posterUrl: string | null;
    captionsUrl: string | null;
    transcript: string;
    aspectRatio: string | null;
    playbackId: string | null;
    token: string | null;
  };
}

type FilmKind = "highlight" | "full";

export function ProposalFilmExperience() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<FilmKind>("highlight");
  const [loading, setLoading] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("unavailable");
  const [payload, setPayload] = useState<PlaybackPayload["asset"] | null>(null);
  const [showEndCard, setShowEndCard] = useState(false);
  const dialogTitleId = useId();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const placementKey =
    kind === "full" ? "proposal.full" : "proposal.highlight";
  const placement = getPlacement(placementKey);

  const loadPlayback = useCallback(async (nextKind: FilmKind) => {
    setLoading(true);
    setShowEndCard(false);
    setPlayerStatus("loading");
    const key = nextKind === "full" ? "proposal.full" : "proposal.highlight";
    try {
      const response = await fetch(`/api/media/playback?placement=${encodeURIComponent(key)}`);
      if (response.status === 404) {
        setPayload(null);
        setPlayerStatus("unavailable");
        return;
      }
      if (!response.ok) {
        setPlayerStatus("error");
        return;
      }
      const data = (await response.json()) as PlaybackPayload;
      setPayload(data.asset);
      if (data.asset.status === "processing" || data.asset.status === "uploading") {
        setPlayerStatus("processing");
      } else if (data.asset.playbackId) {
        setPlayerStatus("ready");
      } else {
        setPlayerStatus("unavailable");
      }
    } catch {
      setPlayerStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  function openFilm(nextKind: FilmKind = "highlight") {
    setKind(nextKind);
    setOpen(true);
    void loadPlayback(nextKind);
    trackEvent(
      nextKind === "full" ? "play_proposal_full" : "play_proposal_highlight",
    );
    window.dispatchEvent(new CustomEvent("bl:pause-decorative"));
  }

  function closeFilm() {
    setOpen(false);
    setShowEndCard(false);
    window.dispatchEvent(new CustomEvent("bl:resume-decorative"));
    openButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
  }, [open]);

  return (
    <div className="mx-auto mt-10 max-w-xl text-center">
      <div className="mx-auto aspect-video w-full max-w-sm overflow-hidden border border-gold/40 bg-parchment">
        {payload?.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={payload.posterUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="flex h-full items-center justify-center px-6 font-sans text-sm text-ink-muted">
            Proposal poster coming soon
          </p>
        )}
      </div>

      <p className="placeholder-copy mx-auto mt-6 max-w-prose text-left text-base text-ink-muted">
        Add a short introduction to the proposal chapter.
      </p>

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-center">
        <Button
          type="button"
          variant="gold"
          size="lg"
          onClick={() => openFilm("highlight")}
        >
          Watch our proposal
        </Button>
        <button
          ref={openButtonRef}
          type="button"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        >
          Restore focus target
        </button>
        <p className="text-xs text-ink-muted">
          Never autoplays with sound · full film available after the highlight
        </p>
        <ButtonLink href="#wedding-day" variant="secondary" size="md">
          Continue our story
        </ButtonLink>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-forest/55 p-3 sm:items-center sm:p-6"
          role="presentation"
          onClick={closeFilm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="max-h-[92svh] w-full max-w-3xl overflow-auto bg-ivory"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone px-4 py-3">
              <h3 id={dialogTitleId} className="font-display text-xl text-forest">
                {placement?.title ?? "Proposal film"}
              </h3>
              <button
                ref={closeButtonRef}
                type="button"
                className="min-h-11 min-w-11 font-sans text-xs uppercase tracking-[0.14em] text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                onClick={closeFilm}
              >
                Close
              </button>
            </div>

            <div className="p-3 sm:p-5">
              {loading ? (
                <p className="py-16 text-center text-sm text-ink-muted" role="status">
                  Preparing playback…
                </p>
              ) : (
                <WeddingPlayer
                  title={payload?.title ?? placement?.title ?? "Proposal film"}
                  playbackId={payload?.playbackId}
                  playbackToken={payload?.token}
                  posterUrl={payload?.posterUrl}
                  captionsUrl={payload?.captionsUrl}
                  transcript={payload?.transcript}
                  aspectRatio={payload?.aspectRatio ?? placement?.aspectRatio}
                  status={playerStatus}
                  onEnded={() => setShowEndCard(true)}
                  onClose={closeFilm}
                />
              )}

              {showEndCard ? (
                <div className="mt-6 space-y-3 border-t border-stone pt-6 text-left">
                  <p className="font-display text-2xl text-forest">
                    Thank you for watching
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <ButtonLink href="#wedding-day" variant="gold" onClick={closeFilm}>
                      Continue our story
                    </ButtonLink>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setKind("full");
                        void loadPlayback("full");
                      }}
                    >
                      Watch the full proposal
                    </Button>
                    <ButtonLink href="#gallery" variant="ghost" onClick={closeFilm}>
                      View proposal photographs
                    </ButtonLink>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
