// Shared helpers: call SunoAPI.org from the server so the API key stays secret.
const BASE = process.env.SUNO_API_BASE || "https://api.sunoapi.org";
export const UPLOAD_BASE = process.env.SUNO_UPLOAD_BASE || "https://sunoapiorg.redpandaai.co";
export const MODELS = ["V6", "V6_WILD", "V6_MINI"];

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

// Suno requires a callback URL; we point it at our own no-op endpoint and poll for status instead.
export function callbackUrl(req) {
  const site = process.env.URL || new URL(req.url).origin;
  return `${site}/.netlify/functions/callback`;
}

// Returns a 0-1 number rounded to 2 decimals, or undefined if not set/invalid.
export function unit(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return n >= 0 && n <= 1 ? Math.round(n * 100) / 100 : undefined;
}

export async function suno(path, options = {}, base = BASE) {
  const key = process.env.SUNO_API_KEY;
  if (!key) {
    return { code: 500, msg: "SUNO_API_KEY is not set in Netlify environment variables." };
  }
  try {
    const res = await fetch(base + path, {
      ...options,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { code: res.status, msg: text.slice(0, 300) || res.statusText };
    }
  } catch (err) {
    return { code: 502, msg: `Could not reach SunoAPI: ${err.message}` };
  }
}
