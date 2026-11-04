import { ourSongMeta } from "@/lib/media/our-song";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Shown when someone opens /api/media/our-song in a browser tab and the file is missing. */
export function ourSongMissingHtml(status: number, detail: string): string {
  const title =
    status === 503 ? "Song storage not configured" : "Song file not found";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — ${escapeHtml(ourSongMeta.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #070e1a; color: #e8e4dc; margin: 0; padding: 2rem 1.25rem; line-height: 1.5; }
    main { max-width: 32rem; margin: 0 auto; }
    h1 { font-size: 1.25rem; font-weight: 600; margin: 0 0 1rem; color: #f5e6a8; }
    p { margin: 0 0 0.75rem; color: #b8c0cc; }
    code { font-size: 0.9em; background: rgba(255,255,255,0.08); padding: 0.1em 0.35em; border-radius: 3px; }
    ol { margin: 0.75rem 0 0; padding-left: 1.25rem; color: #b8c0cc; }
    li { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(detail)}</p>
    <p>This URL should return an MP3 for background music on the invite. Safari shows a blank player when the file is missing.</p>
    <ol>
      <li>Vercel → Project → <strong>Storage → Blob</strong> → connect store and confirm <code>BLOB_READ_WRITE_TOKEN</code>.</li>
      <li>Upload <strong>${escapeHtml(ourSongMeta.title)}</strong> to Blob; set <code>OUR_SONG_BLOB_PATH</code> to that pathname (e.g. <code>wedding/music/ordinary.mp3</code>).</li>
      <li>Redeploy, then open <strong>Admin → Media</strong> — storage status shows whether the song probe succeeded.</li>
      <li>On iPhone: turn the <strong>silent switch off</strong> (no bell slash) before testing on the live invite.</li>
    </ol>
  </main>
</body>
</html>`;
}
