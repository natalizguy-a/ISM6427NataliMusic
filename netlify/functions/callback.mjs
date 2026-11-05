// Suno posts progress here. The app polls the status endpoint instead, so we just acknowledge it.
export default async () =>
  new Response(JSON.stringify({ code: 200, msg: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
