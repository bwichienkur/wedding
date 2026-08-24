"use client";

import { Button } from "@/components/ui/Button";
import {
  sectionMediaPlacements,
  type SectionMediaPlacement,
} from "@/data/section-media";
import {
  MEDIA_CATEGORY_LABELS,
  type MediaAsset,
} from "@/lib/media/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function placementLabel(key: string | null): string {
  if (!key) return "Unassigned";
  return sectionMediaPlacements.find((item) => item.key === key)?.label ?? key;
}

export function MediaAdminPanel() {
  const router = useRouter();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [placementKey, setPlacementKey] = useState(
    sectionMediaPlacements[0]?.key ?? "home.hero",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alt, setAlt] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [publishOnUpload, setPublishOnUpload] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const placement = useMemo(
    () =>
      sectionMediaPlacements.find((item) => item.key === placementKey) ??
      sectionMediaPlacements[0]!,
    [placementKey],
  );

  const acceptsPhoto = placement.accepts.includes("image");
  const acceptsVideo = placement.accepts.includes("video");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/media");
    if (response.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!response.ok) {
      setError("Unable to load media assets.");
      return;
    }
    const data = (await response.json()) as { assets: MediaAsset[] };
    setAssets(data.assets.filter((asset) => asset.status !== "archived"));
    setLoaded(true);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/media");
      if (cancelled) return;
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) {
        setError("Unable to load media assets.");
        return;
      }
      const data = (await response.json()) as { assets: MediaAsset[] };
      if (!cancelled) {
        setAssets(data.assets.filter((asset) => asset.status !== "archived"));
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const assetsForPlacement = useMemo(
    () => assets.filter((asset) => asset.placementKey === placement.key),
    [assets, placement.key],
  );

  async function uploadPhoto(file: File) {
    setUploading(true);
    setProgress(null);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("title", title || file.name);
      form.set("description", description);
      form.set("alt", alt || title || file.name);
      form.set("placementKey", placement.key);
      form.set("publish", publishOnUpload ? "true" : "false");
      form.set(
        "sortOrder",
        String(assetsForPlacement.length > 0 ? assetsForPlacement.length : 0),
      );

      const response = await fetch("/api/media/photo", {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Photo upload failed.");
        return;
      }

      setTitle("");
      setDescription("");
      setAlt("");
      await refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Photo upload failed",
      );
    } finally {
      setUploading(false);
    }
  }

  async function uploadVideo(file: File) {
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const createResponse = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || file.name,
          description,
          category: placement.defaultCategory,
          placementKey: placement.key,
          storyMomentId: placement.storyMomentId,
          isPrivate,
          kind: "video",
        }),
      });
      if (!createResponse.ok) {
        const payload = (await createResponse.json()) as { error?: string };
        setError(payload.error ?? "Unable to start video upload.");
        return;
      }
      const { uploadUrl, assetId } = (await createResponse.json()) as {
        uploadUrl: string;
        assetId: string;
      };

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assetId,
          status: "processing",
        }),
      });

      setTitle("");
      setDescription("");
      setProgress(null);
      await refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Video upload failed",
      );
    } finally {
      setUploading(false);
    }
  }

  async function patchAsset(id: string, patch: Record<string, unknown>) {
    const response = await fetch("/api/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Update failed");
      return;
    }
    await refresh();
  }

  async function archiveAsset(id: string) {
    if (!window.confirm("Archive this media? Guests will no longer see it.")) {
      return;
    }
    const response = await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("Unable to archive media.");
      return;
    }
    await refresh();
  }

  return (
    <div className="space-y-12">
      <section className="border border-stone bg-parchment/40 p-5 sm:p-8">
        <h2 className="font-display text-2xl text-forest">
          Upload to a page section
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Choose a section, then upload a photo and/or Mux video. Published
          assets replace the placeholders on the public site for that section.
        </p>

        <label className="mt-6 block text-sm">
          <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
            Section
          </span>
          <select
            value={placement.key}
            onChange={(event) => setPlacementKey(event.target.value)}
            className="min-h-11 w-full border border-stone bg-ivory px-3"
          >
            {groupPlacements().map((group) => (
              <optgroup key={group.sectionId} label={group.label}>
                {group.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                    {item.allowMultiple ? " (multiple)" : ""}
                    {" · "}
                    {item.accepts.join(" / ")}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <p className="mt-3 text-sm text-ink-muted">{placement.description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
              Title
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="min-h-11 w-full border border-stone bg-ivory px-3"
            />
          </label>
          {acceptsPhoto ? (
            <label className="block text-sm">
              <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
                Alt text (photos)
              </span>
              <input
                value={alt}
                onChange={(event) => setAlt(event.target.value)}
                className="min-h-11 w-full border border-stone bg-ivory px-3"
              />
            </label>
          ) : null}
          <label className="block text-sm sm:col-span-2">
            <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
              Description / caption
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 w-full border border-stone bg-ivory px-3 py-2"
            />
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm text-forest">
            <input
              type="checkbox"
              checked={publishOnUpload}
              onChange={(event) => setPublishOnUpload(event.target.checked)}
            />
            Publish when ready
          </label>
          {acceptsVideo ? (
            <label className="flex min-h-11 items-center gap-3 text-sm text-forest">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
              />
              Private / signed video playback
            </label>
          ) : null}
          {acceptsVideo && publishOnUpload ? (
            <p className="text-sm text-ink-muted sm:col-span-2">
              Videos stay unpublished until Mux finishes processing — then use
              Publish in the library.
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          {acceptsPhoto ? (
            <label className="inline-flex min-h-11 cursor-pointer flex-col justify-center border border-stone bg-ivory px-4 py-3 text-sm text-forest">
              <span className="font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                Upload photo
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                disabled={uploading}
                className="mt-2 max-w-full"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadPhoto(file);
                }}
              />
            </label>
          ) : null}
          {acceptsVideo ? (
            <label className="inline-flex min-h-11 cursor-pointer flex-col justify-center border border-stone bg-ivory px-4 py-3 text-sm text-forest">
              <span className="font-sans text-xs uppercase tracking-[0.14em] text-ink-muted">
                Upload video (Mux)
              </span>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/*"
                disabled={uploading}
                className="mt-2 max-w-full"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadVideo(file);
                }}
              />
            </label>
          ) : null}
        </div>

        {progress !== null ? (
          <p className="mt-3 text-sm text-ink-muted" role="status">
            Upload progress: {progress}%
          </p>
        ) : null}
        {uploading && progress === null ? (
          <p className="mt-3 text-sm text-ink-muted" role="status">
            Uploading…
          </p>
        ) : null}
      </section>

      {error ? (
        <p className="text-sm text-forest" role="alert">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="font-display text-2xl text-forest">
          {placement.label}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Assets assigned to this section.{" "}
          {placement.allowMultiple
            ? "Order follows sort order, then upload time."
            : "Only the first published ready asset is shown publicly."}
        </p>
        {!loaded ? (
          <p className="mt-4 text-sm text-ink-muted" role="status">
            Loading media…
          </p>
        ) : null}
        <ul className="mt-6 space-y-4">
          {loaded && assetsForPlacement.length === 0 ? (
            <li className="text-sm text-ink-muted">
              No media assigned here yet. Upload above or reassign from the full
              library.
            </li>
          ) : (
            assetsForPlacement.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                onPatch={patchAsset}
                onArchive={archiveAsset}
              />
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-forest">Full library</h2>
        <ul className="mt-6 space-y-4">
          {loaded && assets.length === 0 ? (
            <li className="text-sm text-ink-muted">No media assets yet.</li>
          ) : (
            assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                onPatch={patchAsset}
                onArchive={archiveAsset}
                showPlacementSelect
              />
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function groupPlacements(): Array<{
  sectionId: string;
  label: string;
  items: SectionMediaPlacement[];
}> {
  const labels: Record<string, string> = {
    home: "Homepage",
    story: "Our story",
    gallery: "Memories gallery",
    proposal: "Proposal",
    venue: "Venue",
    party: "Wedding party",
    closing: "Closing",
  };
  const order = [
    "home",
    "story",
    "gallery",
    "proposal",
    "venue",
    "party",
    "closing",
  ];
  return order
    .map((sectionId) => ({
      sectionId,
      label: labels[sectionId] ?? sectionId,
      items: sectionMediaPlacements.filter(
        (item) => item.sectionId === sectionId,
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function AssetRow({
  asset,
  onPatch,
  onArchive,
  showPlacementSelect = false,
}: {
  asset: MediaAsset;
  onPatch: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  showPlacementSelect?: boolean;
}) {
  const thumb =
    asset.kind === "image"
      ? asset.publicUrl
      : asset.posterUrl;

  return (
    <li className="border border-stone bg-ivory p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl text-forest">{asset.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gold">
            {asset.kind} · {MEDIA_CATEGORY_LABELS[asset.category]} ·{" "}
            {asset.status}
            {asset.isPublished ? " · published" : " · unpublished"}
            {asset.isPrivate ? " · private" : ""}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Section: {placementLabel(asset.placementKey)}
          </p>
          {asset.errorMessage ? (
            <p className="mt-2 text-sm text-forest" role="status">
              {asset.errorMessage}
            </p>
          ) : null}
          {showPlacementSelect ? (
            <label className="mt-3 block max-w-md text-sm">
              <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-ink-muted">
                Move to section
              </span>
              <select
                value={asset.placementKey ?? ""}
                className="min-h-11 w-full border border-stone bg-parchment/40 px-3"
                onChange={(event) => {
                  const value = event.target.value || null;
                  void onPatch(asset.id, { placementKey: value });
                }}
              >
                <option value="">Unassigned</option>
                {sectionMediaPlacements.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-20 w-32 object-cover" />
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={asset.status !== "ready"}
          onClick={() =>
            void onPatch(asset.id, {
              isPublished: !asset.isPublished,
            })
          }
        >
          {asset.isPublished ? "Unpublish" : "Publish"}
        </Button>
        <label className="inline-flex items-center gap-2 border border-stone px-3 text-sm text-forest">
          Sort
          <input
            type="number"
            defaultValue={asset.sortOrder}
            className="min-h-11 w-20 border-0 bg-transparent px-2"
            onBlur={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next) && next !== asset.sortOrder) {
                void onPatch(asset.id, { sortOrder: next });
              }
            }}
          />
        </label>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void onArchive(asset.id)}
        >
          Archive
        </Button>
      </div>
    </li>
  );
}
