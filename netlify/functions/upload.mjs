// Uploads a recording (as a base64 data URL) to SunoAPI's temporary file storage (kept 3 days).
import { json, suno, UPLOAD_BASE } from "./_suno.mjs";

const MAX_CHARS = 5_500_000; // stays under Netlify's ~6 MB request limit

export default async (req) => {
  if (req.method !== "POST") return json({ code: 405, msg: "Use POST" }, 405);
  let input;
  try {
    input = await req.json();
  } catch {
    return json({ code: 413, msg: "Recording is too large or invalid." }, 400);
  }
  const data = input?.base64Data;
  if (typeof data !== "string" || !/^data:audio\/[\w.+-]+;base64,/.test(data)) {
    return json({ code: 400, msg: "Expected an audio recording." }, 400);
  }
  if (data.length > MAX_CHARS) {
    return json({ code: 413, msg: "Recording is too long. Keep it under about 4 minutes." }, 413);
  }
  const fileName = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`;
  const res = await suno(
    "/api/file-base64-upload",
    { method: "POST", body: JSON.stringify({ base64Data: data, uploadPath: "recordings", fileName }) },
    UPLOAD_BASE
  );
  const url = res?.data?.downloadUrl || res?.data?.fileUrl;
  if (res?.code === 200 && url) return json({ code: 200, data: { url } });
  return json({ code: res?.code || 500, msg: res?.msg || "Upload failed." });
};
