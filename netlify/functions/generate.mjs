import { json, suno } from "./_suno.mjs";

const MODELS = ["V6", "V6_WILD", "V6_MINI"];

const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export default async (req) => {
  if (req.method !== "POST") return json({ code: 405, msg: "Use POST" }, 405);

  let input;
  try {
    input = await req.json();
  } catch {
    return json({ code: 400, msg: "Invalid JSON body" }, 400);
  }

  const customMode = !!input.customMode;
  const instrumental = !!input.instrumental;
  const model = MODELS.includes(input.model) ? input.model : "V6";

  // Suno requires a callback URL; we point it at our own no-op endpoint and poll for status instead.
  const site = process.env.URL || new URL(req.url).origin;
  const body = { customMode, instrumental, model, callBackUrl: `${site}/.netlify/functions/callback` };

  if (customMode) {
    const title = clip(input.title, 80);
    const style = clip(input.style, 1000);
    const lyrics = instrumental ? "" : clip(input.lyrics, 5000);
    const negativeTags = clip(input.negativeTags, 1000);
    if (!style && !lyrics && !negativeTags) {
      return json({ code: 400, msg: "Custom mode needs a style, lyrics, or tags to avoid." }, 400);
    }
    if (title) body.title = title;
    if (style) body.style = style;
    if (lyrics) body.lyrics = lyrics;
    if (negativeTags) body.negativeTags = negativeTags;
    if (!instrumental && (input.vocalGender === "m" || input.vocalGender === "f")) {
      body.vocalGender = input.vocalGender;
    }
    const duration = Number(input.duration);
    if (duration >= 10 && duration <= 360) body.duration = Math.round(duration);
    for (const k of ["styleWeight", "weirdnessConstraint"]) {
      const v = Number(input[k]);
      if (input[k] !== undefined && input[k] !== "" && v >= 0 && v <= 1) body[k] = Math.round(v * 100) / 100;
    }
  } else {
    const prompt = clip(input.prompt, 3000);
    const style = clip(input.style, 1000);
    if (!prompt && !style) {
      return json({ code: 400, msg: "Describe the song you want." }, 400);
    }
    if (prompt) body.prompt = prompt;
    if (style) body.style = style;
  }

  const result = await suno("/api/v1/generate", { method: "POST", body: JSON.stringify(body) });
  return json(result);
};
