import { json, suno } from "./_suno.mjs";

export default async (req) => {
  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId || !/^[\w-]{1,100}$/.test(taskId)) {
    return json({ code: 400, msg: "Missing or invalid taskId" }, 400);
  }
  const result = await suno(`/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`);
  return json(result);
};
