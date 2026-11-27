import type { IncomingMessage } from "http";
import { HttpError } from "../httpError.ts";

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const contentType = req.headers['content-type'];

  if (!contentType || !/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new HttpError(415, 'Ожидается application/json');
  }

  const MAX_SIZE = 1024 * 1024;
  const chunks: Buffer[] = [];
  let size = 0;
  let tooLarge = false;

  for await (const chunk of req) {
    size += chunk.length;

    if (size > MAX_SIZE) {
      tooLarge = true;
    } else if (!tooLarge) {
      chunks.push(Buffer.from(chunk));
    }
  }

  if (tooLarge) {
    throw new HttpError(413, 'Тело запроса слишком большое');
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Некорректный JSON');
  }
}
