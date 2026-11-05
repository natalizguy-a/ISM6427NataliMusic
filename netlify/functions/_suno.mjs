// Shared helper: calls SunoAPI.org from the server so the API key stays secret.
const BASE = process.env.SUNO_API_BASE || "https://api.sunoapi.org";

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function suno(path, options = {}) {
  const key = process.env.SUNO_API_KEY;
  if (!key) {
    return { code: 500, msg: "SUNO_API_KEY is not set in Netlify environment variables." };
  }
  try {
    const res = await fetch(BASE + path, {
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
