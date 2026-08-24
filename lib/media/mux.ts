import "server-only";

import Mux from "@mux/mux-node";
import { muxPosterUrl } from "@/lib/media/mux-public";

export { muxPosterUrl };

let client: Mux | null = null;

export function isMuxConfigured(): boolean {
  return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
}

export function getMuxClient(): Mux {
  if (!isMuxConfigured()) {
    throw new Error("Mux is not configured. Set MUX_TOKEN_ID and MUX_TOKEN_SECRET.");
  }
  if (!client) {
    client = new Mux({
      tokenId: process.env.MUX_TOKEN_ID!,
      tokenSecret: process.env.MUX_TOKEN_SECRET!,
    });
  }
  return client;
}

export interface DirectUploadResult {
  uploadId: string;
  uploadUrl: string;
}

export async function createDirectUpload(options: {
  corsOrigin: string;
  passthrough: string;
  isPrivate?: boolean;
}): Promise<DirectUploadResult> {
  const mux = getMuxClient();
  const upload = await mux.video.uploads.create({
    cors_origin: options.corsOrigin,
    new_asset_settings: {
      playback_policies: [options.isPrivate ? "signed" : "public"],
      video_quality: "plus",
      passthrough: options.passthrough,
      meta: {
        external_id: options.passthrough,
      },
    },
    timeout: 3600,
  });

  if (!upload.id || !upload.url) {
    throw new Error("Mux did not return a direct upload URL.");
  }

  return { uploadId: upload.id, uploadUrl: upload.url };
}

export async function createSignedPlaybackToken(playbackId: string): Promise<string> {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID;
  const signingKeyPrivate = process.env.MUX_SIGNING_KEY_PRIVATE;
  if (!signingKeyId || !signingKeyPrivate) {
    throw new Error(
      "Private playback requires MUX_SIGNING_KEY_ID and MUX_SIGNING_KEY_PRIVATE.",
    );
  }

  const mux = getMuxClient();
  return mux.jwt.signPlaybackId(playbackId, {
    keyId: signingKeyId,
    keySecret: Buffer.from(signingKeyPrivate, "base64").toString("ascii"),
    expiration: "2h",
    type: "video",
  });
}

export async function verifyMuxWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!signatureHeader) return false;

  try {
    const mux = getMuxClient();
    await mux.webhooks.verifySignature(
      rawBody,
      { "mux-signature": signatureHeader },
      secret,
    );
    return true;
  } catch {
    return false;
  }
}
