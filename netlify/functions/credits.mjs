import { json, suno } from "./_suno.mjs";

export default async () => json(await suno("/api/v1/generate/credit"));
