// Fetches a generated audio file so the browser can mix it with the recording
// (the audio host may not allow cross-site downloads). Only passes through audio over https.
const MAX_BYTES = 25_000_000;

export default async (req) => {
  const raw = new URL(req.url).searchParams.get("url") || "";
  let target;
  try {
    target = new URL(raw);
  } catch {
    return new Response("Bad url", { status: 400 });
  }
  const host = target.hostname;
  if (target.protocol !== "https:" || host === "localhost" || /^[\d.]+$/.test(host) || host.includes(":")) {
    return new Response("Bad url", { status: 400 });
  }
  const res = await fetch(target);
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !/^(audio\/|application\/octet-stream)/.test(type)) {
    return new Response("Not audio", { status: 502 });
  }
  if (Number(res.headers.get("content-length") || 0) > MAX_BYTES) {
    return new Response("Too large", { status: 413 });
  }
  return new Response(res.body, { headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" } });
};
