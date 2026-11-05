# Natali Music

A web app that turns a song idea into music using [SunoAPI.org](https://docs.sunoapi.org/).

- **Simple mode** – describe the song; lyrics are written for you.
- **Custom mode** – set title, style, your own lyrics, voice, length, and more.
- **🎤 Record mode** – record singing (or upload a recording), make the voices fuller,
  and get background music and a beat built around it. You can layer the original
  recording on top and download the mix as an MP3.
- Each request makes two versions, with a player, cover art, lyrics, and MP3 download.
- Your song history is saved in your browser and shows your remaining credits.

## How it works

```
public/index.html          the whole front end (no build step)
netlify/functions/
  generate.mjs             POST  -> SunoAPI /api/v1/generate
  status.mjs               GET   -> SunoAPI /api/v1/generate/record-info  (polled every 5s)
  credits.mjs              GET   -> SunoAPI /api/v1/generate/credit
  upload.mjs               POST  -> SunoAPI file upload (recording, kept 3 days)
  add-instrumental.mjs     POST  -> SunoAPI /api/v1/generate/add-instrumental
  audio.mjs                GET   -> fetches a generated track so the browser can mix it
  callback.mjs             no-op endpoint Suno requires as callBackUrl
public/lame.min.js         MP3 encoder (lamejs 1.2.1, LGPL) used for recordings and mixes
```

The API key lives only in Netlify's environment variables and is used by the functions, never sent to the browser.

## Deploy on Netlify

1. In Netlify: **Add new site → Import an existing project →** pick this repo, branch `main`.
   Build settings come from `netlify.toml` (publish `public`, functions `netlify/functions`); leave the build command empty.
2. **Site configuration → Environment variables → Add a variable**
   - `SUNO_API_KEY` = your SunoAPI.org key
   - (optional) `SUNO_API_BASE` = `https://api.sunoapi.org` (the default)
3. Redeploy (Deploys → Trigger deploy) so the functions pick up the key.

> Anyone with the site link can spend your credits. Keep the URL private, or add Netlify password protection.
