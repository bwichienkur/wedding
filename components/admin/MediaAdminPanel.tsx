"use client";

import { Button } from "@/components/ui/Button";
import {
  MEDIA_CATEGORY_LABELS,
  type MediaAsset,
  type MediaCategory,
} from "@/lib/media/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const categories = Object.keys(MEDIA_CATEGORY_LABELS) as MediaCategory[];

export function MediaAdminPanel() {
  const router = useRouter();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MediaCategory>("proposal_highlight");
  const [placementKey, setPlacementKey] = useState("proposal.highlight");
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

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
    setAssets(data.assets);
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
        setAssets(data.assets);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function createUpload(file: File) {
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
          category,
          placementKey,
          isPrivate,
        }),
      });
      if (!createResponse.ok) {
        const payload = (await createResponse.json()) as { error?: string };
        setError(payload.error ?? "Unable to start upload.");
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
        uploadError instanceof Error ? uploadError.message : "Upload failed",
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
    if (!window.confirm("Archive this video? Guests will no longer see it.")) {
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
        <h2 className="font-display text-2xl text-forest">Upload video</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Direct upload to Mux. Secrets never leave the server. Max practical
          size depends on your Mux plan and network.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
              Title
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="min-h-11 w-full border border-stone bg-ivory px-3"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
              Category
            </span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as MediaCategory)
              }
              className="min-h-11 w-full border border-stone bg-ivory px-3"
            >
              {categories.map((value) => (
                <option key={value} value={value}>
                  {MEDIA_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
              Description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 w-full border border-stone bg-ivory px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
              Placement key
            </span>
            <input
              value={placementKey}
              onChange={(event) => setPlacementKey(event.target.value)}
              className="min-h-11 w-full border border-stone bg-ivory px-3"
              placeholder="proposal.highlight"
            />
          </label>
          <label className="flex min-h-11 items-center gap-3 text-sm text-forest">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => setIsPrivate(event.target.checked)}
            />
            Private / signed playback
          </label>
        </div>

        <div className="mt-6">
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void createUpload(file);
            }}
          />
          {progress !== null ? (
            <p className="mt-3 text-sm text-ink-muted" role="status">
              Upload progress: {progress}%
            </p>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="text-sm text-forest" role="alert">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="font-display text-2xl text-forest">Library</h2>
        {!loaded ? (
          <p className="mt-4 text-sm text-ink-muted" role="status">
            Loading media…
          </p>
        ) : null}
        <ul className="mt-6 space-y-4">
          {loaded && assets.length === 0 ? (
            <li className="text-sm text-ink-muted">No media assets yet.</li>
          ) : (
            assets.map((asset) => (
              <li
                key={asset.id}
                className="border border-stone bg-ivory p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl text-forest">
                      {asset.title}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gold">
                      {MEDIA_CATEGORY_LABELS[asset.category]} · {asset.status}
                      {asset.isPublished ? " · published" : " · unpublished"}
                      {asset.isPrivate ? " · private" : ""}
                    </p>
                    {asset.placementKey ? (
                      <p className="mt-2 text-sm text-ink-muted">
                        Placement: {asset.placementKey}
                      </p>
                    ) : null}
                    {asset.errorMessage ? (
                      <p className="mt-2 text-sm text-forest" role="status">
                        {asset.errorMessage}
                      </p>
                    ) : null}
                  </div>
                  {asset.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.posterUrl}
                      alt=""
                      className="h-20 w-32 object-cover"
                    />
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={asset.status !== "ready"}
                    onClick={() =>
                      void patchAsset(asset.id, {
                        isPublished: !asset.isPublished,
                      })
                    }
                  >
                    {asset.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void archiveAsset(asset.id)}
                  >
                    Archive
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
