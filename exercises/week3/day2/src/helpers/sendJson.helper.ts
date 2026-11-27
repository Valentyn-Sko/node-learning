import type { ServerResponse } from "node:http";

export function sendJson(
  res: ServerResponse,
  statusCode: number,
  data: unknown
): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });

  res.end(JSON.stringify(data));
}
