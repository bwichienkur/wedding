#!/usr/bin/env node
/**
 * Import wedding party portraits and gallery photos from the public Zola site,
 * upload images to Vercel Blob, and write wedding/media-assets.json.
 *
 * Usage (requires BLOB_READ_WRITE_TOKEN for production persistence):
 *   node scripts/import-zola-media.mjs
 *
 * Without a token, files are stored under .data/uploads for local dev only.
 */

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { put, get } from "@vercel/blob";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const ZOLA_BASE = "https://www.zola.com/wedding/brightandlexi";
const USER_AGENT =
  "Mozilla/5.0 (compatible; BrightLexiWeddingImport/1.0; +https://github.com/bwichienkur/wedding)";

const BLOB_MANIFEST_PATH = "wedding/media-assets.json";
const BLOB_LOGISTICS_PATH = "wedding/logistics-content.json";
const LOCAL_MANIFEST = path.join(ROOT, ".data", "media-assets.json");
const LOCAL_UPLOADS = path.join(ROOT, ".data", "uploads");

function resolveBlobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  for (const [key, value] of Object.entries(process.env)) {
    if (value && key.endsWith("_READ_WRITE_TOKEN") && key.includes("BLOB")) {
      return value;
    }
  }
  return null;
}

async function fetchZolaPage(slug) {
  const response = await fetch(`${ZOLA_BASE}/${slug}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Zola page ${slug} returned ${response.status}`);
  }
  const html = await response.text();
  const start = html.indexOf('id="__NEXT_DATA__"');
  if (start < 0) throw new Error(`Missing __NEXT_DATA__ on ${slug}`);
  const jsonStart = html.indexOf(">", start) + 1;
  const jsonEnd = html.indexOf("</script>", jsonStart);
  const data = JSON.parse(html.slice(jsonStart, jsonEnd));
  return data.props.pageProps.pageData;
}

async function downloadImage(url) {
  const sized = url.includes("?") ? `${url}&w=1200` : `${url}?w=1200`;
  const response = await fetch(sized, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  return { bytes, contentType, ext };
}

function nowIso() {
  return new Date().toISOString();
}

function baseAsset(partial) {
  const now = nowIso();
  return {
    muxAssetId: null,
    muxPlaybackId: null,
    muxUploadId: null,
    posterUrl: null,
    customPosterPath: null,
    durationSeconds: null,
    aspectRatio: null,
    captionsUrl: null,
    transcript: "",
    chaptersJson: [],
    isPrivate: false,
    storyMomentId: null,
    errorMessage: null,
    createdBy: "import-zola-media",
    createdAt: now,
    updatedAt: now,
    width: 1200,
    height: 1600,
    focalX: 50,
    focalY: 40,
    mediaDate: null,
    description: "",
    ...partial,
  };
}

function blobAccess() {
  const explicit = process.env.BLOB_ACCESS?.toLowerCase();
  if (explicit === "public" || explicit === "private") return explicit;
  if (process.env.BLOB_STORE_ID?.trim()) return "private";
  return "public";
}

async function storeImage(assetId, bytes, contentType, ext, token) {
  const filename = `${assetId}.${ext}`;
  if (token) {
    const pathname = `wedding/images/${filename}`;
    const access = blobAccess();
    const blob = await put(pathname, bytes, {
      access,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      token,
    });
    const publicUrl =
      access === "private" ? `/api/media/file/${assetId}` : blob.url;
    return { storagePath: blob.pathname, publicUrl };
  }

  await fs.mkdir(LOCAL_UPLOADS, { recursive: true });
  await fs.writeFile(path.join(LOCAL_UPLOADS, filename), bytes);
  return {
    storagePath: filename,
    publicUrl: `/api/media/file/${assetId}`,
  };
}

async function readExistingManifest(token) {
  if (token) {
    const result = await get(BLOB_MANIFEST_PATH, {
      access: "private",
      token,
    });
    if (!result || result.statusCode !== 200) return [];
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  }
  try {
    const raw = await fs.readFile(LOCAL_MANIFEST, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeManifest(assets, token) {
  const json = JSON.stringify(assets, null, 2);
  if (token) {
    await put(BLOB_MANIFEST_PATH, json, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token,
    });
    console.log(`Wrote ${assets.length} assets to blob manifest ${BLOB_MANIFEST_PATH}`);
    return;
  }
  await fs.mkdir(path.dirname(LOCAL_MANIFEST), { recursive: true });
  await fs.writeFile(LOCAL_MANIFEST, json, "utf8");
  console.log(`Wrote ${assets.length} assets to ${LOCAL_MANIFEST} (local dev)`);
}

async function syncLogisticsFaq(token) {
  const faq = [
    {
      id: "arrival-time",
      category: "Day of",
      question: "What time should I arrive?",
      answer:
        "We recommend arriving 20–30 minutes before the start of the ceremony. This will give you time to sign the guest book and chat with guests.",
    },
    {
      id: "dress-code",
      category: "Attire",
      question: "What should I wear?",
      answer:
        "Formal attire is appreciated, but not required. See this link if you're needing more ideas!\nhttps://www.pinterest.com/agragno/guest-attire/\n\nBridesmaids will be in a warm terracotta.\nPlease no white!",
    },
    {
      id: "parking",
      category: "Venue",
      question: "Is there parking at the venue?",
      answer: "Yes, there is free and ample parking available.",
    },
    {
      id: "indoor-outdoor",
      category: "Venue",
      question: "Is it indoors or outdoors?",
      answer:
        "The ceremony will be held outdoors on a paved patio with artificial turf. The reception will take place indoors. In the event of rain, the ceremony will also be moved indoors.",
    },
    {
      id: "plus-ones",
      category: "Guests",
      question: "Can I bring a plus one?",
      answer:
        "Invitiations will usually specify, but contact us directly if you're unsure!",
    },
    {
      id: "photography-policy",
      category: "Day of",
      question: "Can I take and post pictures?",
      answer:
        "Please refrain from taking any photos during the ceremony. As for cocktail hour and reception, snap and post away!",
    },
    {
      id: "open-bar",
      category: "Reception",
      question: "Will there be an open bar?",
      answer: "Is the Pope Catholic?",
    },
  ];

  let existing = { version: 1, updatedAt: new Date(0).toISOString() };
  const result = await get(BLOB_LOGISTICS_PATH, {
    access: "private",
    token,
  });
  if (result && result.statusCode === 200) {
    const text = await new Response(result.stream).text();
    existing = JSON.parse(text);
  }

  const next = {
    ...existing,
    version: 1,
    updatedAt: nowIso(),
    faq,
  };
  await put(BLOB_LOGISTICS_PATH, JSON.stringify(next, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token,
  });
  console.log(`Synced ${faq.length} FAQ items to ${BLOB_LOGISTICS_PATH}`);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapZolaRole(member) {
  switch (member.role) {
    case "BEST_MAN":
      return { role: "Best Man", side: "bright" };
    case "MAID_OF_HONOR":
      return { role: "Maid of Honor", side: "lexi" };
    case "GROOMSMAN":
      return { role: "Groomsman", side: "bright" };
    case "BRIDESMAID":
      return { role: "Bridesmaid", side: "lexi" };
    case "CUSTOM":
      return { role: member.custom_role || "Wedding party", side: "lexi" };
    default:
      return { role: member.role || "Wedding party", side: "shared" };
  }
}

async function main() {
  const token = resolveBlobToken();
  if (!token) {
    console.warn(
      "BLOB_READ_WRITE_TOKEN not set — writing local .data only (not for production).",
    );
  }

  const [partyPage, photoPage] = await Promise.all([
    fetchZolaPage("wedding_party"),
    fetchZolaPage("photo"),
  ]);

  const members = partyPage.wedding_party.wedding_party_members;
  const photos = photoPage.photo.photos;

  const existing = await readExistingManifest(token);
  const keep = existing.filter(
    (asset) =>
      asset.placementKey !== "party" && asset.placementKey !== "gallery",
  );

  const imported = [];
  let sortParty = 0;
  for (const member of members) {
    const id = slugify(member.name);
    const { role, side } = mapZolaRole(member);
    void side;

    if (!member.image_url) {
      console.log(`Skipping upload (no photo): ${member.name}`);
      continue;
    }

    const assetId = randomUUID();
    const { bytes, contentType, ext } = await downloadImage(member.image_url);
    const stored = await storeImage(assetId, bytes, contentType, ext, token);

    imported.push(
      baseAsset({
        id: assetId,
        kind: "image",
        status: "ready",
        category: "section_photo",
        title: id,
        alt: id,
        placementKey: "party",
        isPublished: true,
        sortOrder: sortParty++,
        storagePath: stored.storagePath,
        publicUrl: stored.publicUrl,
        mimeType: contentType,
        description: `${member.name} — ${role}`,
      }),
    );
    console.log(`Party: ${member.name} → ${stored.publicUrl}`);
  }

  let sortGallery = 0;
  for (const photo of photos) {
    const assetId = randomUUID();
    const { bytes, contentType, ext } = await downloadImage(photo.image_url);
    const stored = await storeImage(assetId, bytes, contentType, ext, token);
    const label = photo.caption?.trim() || `Photo ${sortGallery + 1}`;

    imported.push(
      baseAsset({
        id: assetId,
        kind: "image",
        status: "ready",
        category: "section_photo",
        title: label,
        alt: label,
        placementKey: "gallery",
        isPublished: true,
        sortOrder: sortGallery,
        storagePath: stored.storagePath,
        publicUrl: stored.publicUrl,
        mimeType: contentType,
        mediaDate: "Gallery",
      }),
    );
    sortGallery += 1;
    console.log(`Gallery: ${label} → ${stored.publicUrl}`);
  }

  const next = [...keep, ...imported].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt),
  );
  await writeManifest(next, token);

  console.log(
    `\nDone. Imported ${imported.filter((a) => a.placementKey === "party").length} party + ${imported.filter((a) => a.placementKey === "gallery").length} gallery images.`,
  );

  if (token) {
    await syncLogisticsFaq(token);
  }

  if (!token) {
    console.log(
      "Re-run with BLOB_READ_WRITE_TOKEN set (or workflow import-zola-media) before production deploy.",
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
