import type { OutgoingHttpHeaders, ServerResponse } from "node:http";

export function sendJson(
  res: ServerResponse,
  statusCode: number,
    data: unknown,
    headers: OutgoingHttpHeaders = {}
): void {
    try {

   
        const body = JSON.stringify(data);
    
        res.writeHead(statusCode, {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(body),
            ...headers,
        });
  

        res.end(body);
    } catch (error) {
        res.destroy();
        return;
    }
}
