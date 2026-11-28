import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { ServerResponse } from "node:http";
import { HttpError } from "./httpError.ts";
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};
export async function serveStatic(
  rootDir: string,
  urlPath: string,
  res: ServerResponse,
) {
  const root = path.resolve(rootDir);
  const decoded = decodeURIComponent(urlPath);
  const relative = decoded === "/" ? "index.html" : decoded.slice(1);
  const filePath = path.resolve(root, relative);
  // ЗАЩИТА: итоговый путь обязан остаться внутри root
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    throw new HttpError(403, "Доступ запрещён");
  }
  let info;
  try {
    info = await stat(filePath);
  } catch {
    throw new HttpError(404, "Файл не найден");
  }
  if (!info.isFile()) throw new HttpError(404, "Файл не найден");

  res.writeHead(200, {
    "Content-Type": MIME[path.extname(filePath)] ?? "application/octet-stream",
    "Content-Length": info.size,
  });

  await pipeline(createReadStream(filePath), res); // stream: картинка 30 МБ не ляжет впамять
}
