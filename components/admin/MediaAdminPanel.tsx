"use client";

import { put } from "@vercel/blob/client";
import { Button } from "@/components/ui/Button";
import {
  sectionMediaPlacements,
  type SectionMediaPlacement,
} from "@/data/section-media";
import {
  extensionForMime,
  isHeicFile,
  resolveImageMime,
} from "@/lib/media/image-upload";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  MEDIA_CATEGORY_LABELS,
  type MediaAsset,
} from "@/lib/media/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const FORM_UPLOAD_SAFE_BYTES = 4 * 1024 * 1024;

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
  const [uploadPhase, setUploadPhase] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  const [blobConfigured, setBlobConfigured] = useState(false);
  const [storageHints, setStorageHints] = useState<string[]>([]);

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
      const [mediaResponse, statusResponse] = await Promise.all([
        fetch("/api/media"),
        fetch("/api/admin/storage-status"),
      ]);
      if (cancelled) return;
      if (mediaResponse.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!mediaResponse.ok) {
        setError("Unable to load media assets.");
        return;
      }
      const data = (await mediaResponse.json()) as { assets: MediaAsset[] };
      if (!cancelled) {
        setAssets(data.assets.filter((asset) => asset.status !== "archived"));
        setLoaded(true);
      }
      if (statusResponse.ok) {
        const status = (await statusResponse.json()) as {
          photoUploadReady?: boolean;
          blobConfigured?: boolean;
          hints?: string[];
        };
        if (!cancelled) {
          setStorageReady(status.photoUploadReady ?? null);
          setBlobConfigured(Boolean(status.blobConfigured));
          setStorageHints(status.hints ?? []);
        }
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
    setUploadPhase(null);
    setError(null);
    setSuccess(null);
    try {
      const resolvedMime = resolveImageMime(file);
      if (!resolvedMime) {
        setError(
          isHeicFile(file)
            ? "HEIC photos from iPhone are not supported. Export as JPEG first."
            : "Unsupported image type. Use JPEG, PNG, WebP, GIF, or AVIF.",
        );
        return;
      }
      // Capture as string so nested upload helpers keep a non-null type.
      const mimeType: string = resolvedMime;
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`Image must be ${MAX_IMAGE_MB} MB or smaller.`);
        return;
      }

      const meta = {
        title: title || file.name,
        description,
        alt: alt || title || file.name,
        placementKey: placement.key,
        publish: publishOnUpload,
        sortOrder:
          assetsForPlacement.length > 0 ? assetsForPlacement.length : 0,
      };

      let response: Response;

      // Small files go through the API in one shot (no Blob token / SDK retries).
      // Direct Blob is only for larger photos that exceed the platform body limit.
      const useDirectBlob =
        blobConfigured && file.size > FORM_UPLOAD_SAFE_BYTES;

      if (useDirectBlob) {
        try {
          const pathname = `wedding/images/${crypto.randomUUID()}.${extensionForMime(mimeType)}`;
          let uploadProgress = 0;

          async function fetchClientToken(path: string): Promise<string> {
            setUploadPhase("Authorizing upload…");
            const tokenResponse = await fetch("/api/media/photo/client-upload", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pathname: path }),
            });
            const tokenPayload = (await tokenResponse.json()) as {
              clientToken?: string;
              error?: string;
            };
            if (!tokenResponse.ok || !tokenPayload.clientToken) {
              throw new Error(
                tokenPayload.error ??
                  `Unable to start photo upload (${tokenResponse.status}).`,
              );
            }
            return tokenPayload.clientToken;
          }

          async function putWithToken(path: string, token: string) {
            setUploadPhase("Uploading to storage…");
            if (uploadProgress < 1) {
              setProgress(1);
            }
            return put(path, file, {
              access: "public",
              token,
              contentType: mimeType,
              multipart: false,
              onUploadProgress: ({ percentage }) => {
                // Blob SDK retries reset percentage — keep the bar monotonic.
                uploadProgress = Math.max(
                  uploadProgress,
                  Math.round(percentage),
                );
                setProgress(Math.max(1, Math.min(99, uploadProgress)));
              },
            });
          }

          setProgress(0);
          let clientToken = await fetchClientToken(pathname);
          let blob;
          try {
            blob = await putWithToken(pathname, clientToken);
          } catch (putError) {
            const msg =
              putError instanceof Error ? putError.message : String(putError);
            if (/expired/i.test(msg)) {
              setUploadPhase("Refreshing upload authorization…");
              clientToken = await fetchClientToken(pathname);
              blob = await putWithToken(pathname, clientToken);
            } else {
              throw putError;
            }
          }

          setUploadPhase("Saving to library…");
          setProgress(99);

          response = await fetch("/api/media/photo", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...meta,
              mimeType,
              publicUrl: blob.url,
              storagePath: blob.pathname,
            }),
          });
        } catch (directError) {
          throw directError;
        }
      } else {
        setUploadPhase("Uploading…");
        setProgress(0);
        const form = new FormData();
        form.set("file", file);
        form.set("title", meta.title);
        form.set("description", meta.description);
        form.set("alt", meta.alt);
        form.set("placementKey", meta.placementKey);
        form.set("publish", meta.publish ? "true" : "false");
        form.set("sortOrder", String(meta.sortOrder));

        response = await fetch("/api/media/photo", {
          method: "POST",
          credentials: "include",
          body: form,
        });
      }

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? `Photo upload failed (${response.status}).`);
        return;
      }

      const payload = (await response.json()) as { asset?: MediaAsset };
      setTitle("");
      setDescription("");
      setAlt("");
      setProgress(100);
      setUploadPhase(null);
      setSuccess(
        publishOnUpload
          ? `Uploaded and published “${payload.asset?.title ?? file.name}” to ${placement.label}.`
          : `Uploaded “${payload.asset?.title ?? file.name}”. Publish it below to show on the site.`,
      );
      await refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Photo upload failed",
      );
    } finally {
      setUploading(false);
      setProgress(null);
      setUploadPhase(null);
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

        {storageReady === false ? (
          <div
            className="mt-4 border border-gold/40 bg-gold/10 p-4 text-sm text-forest"
            role="alert"
          >
            <p className="font-medium">Photo storage is not ready on production.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
              {storageHints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {storageReady === true ? (
          <p className="mt-4 text-sm text-ink-muted" role="status">
            Photo storage is connected. Uploads appear on the site immediately
            when published.
          </p>
        ) : null}

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
              <span className="mt-1 text-xs text-ink-muted">
                Up to {MAX_IMAGE_MB} MB · JPEG/PNG/WebP
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.jpg,.jpeg,.png"
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

        {error ? (
          <p
            className="mt-4 border border-gold/50 bg-gold/15 px-3 py-3 text-sm text-forest"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="mt-4 text-sm text-forest/80" role="status">
            {success}
          </p>
        ) : null}

        {progress !== null ? (
          <p className="mt-3 text-sm text-ink-muted" role="status">
            {uploadPhase ? `${uploadPhase} ` : "Upload progress: "}
            {progress}%
          </p>
        ) : null}
        {uploading && progress === null ? (
          <p className="mt-3 text-sm text-ink-muted" role="status">
            {uploadPhase ?? "Uploading…"}
          </p>
        ) : null}
      </section>

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
