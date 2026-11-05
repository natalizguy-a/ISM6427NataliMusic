// Builds backing music and a beat around an uploaded vocal recording.
import { json, suno, clip, callbackUrl, unit, MODELS } from "./_suno.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ code: 405, msg: "Use POST" }, 405);
  let input;
  try {
    input = await req.json();
  } catch {
    return json({ code: 400, msg: "Invalid JSON body" }, 400);
  }

  let uploadUrl;
  try {
    uploadUrl = new URL(input.uploadUrl);
    if (uploadUrl.protocol !== "https:") throw new Error();
  } catch {
    return json({ code: 400, msg: "Missing recording link." }, 400);
  }

  const body = {
    uploadUrl: uploadUrl.toString(),
    title: clip(input.title, 80) || "Our Song",
    tags: clip(input.tags, 1000) || "happy kids song, acoustic guitar, light drums",
    negativeTags: clip(input.negativeTags, 1000) || "distorted, noisy, harsh",
    model: MODELS.includes(input.model) ? input.model : "V6",
    callBackUrl: callbackUrl(req),
  };
  const lyrics = clip(input.lyrics, 5000);
  if (lyrics) body.lyrics = lyrics;
  for (const k of ["audioWeight", "styleWeight"]) {
    const v = unit(input[k]);
    if (v !== undefined) body[k] = v;
  }

  return json(await suno("/api/v1/generate/add-instrumental", { method: "POST", body: JSON.stringify(body) }));
};
