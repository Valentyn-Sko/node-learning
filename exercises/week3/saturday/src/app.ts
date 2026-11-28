import { createServer } from "node:http";
import { Router } from "./router.ts";
import { readJsonBody } from "./helpers/readJson.helper.ts";
import { sendJson } from "./helpers/sendJson.helper.ts";
import { HttpError } from "./httpError.ts";
import { serveStatic } from "./static.ts";

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function createApp(options: { publicDir: string }) {
  const router = new Router();

  const notes = new Map<number, { id: number; text: string }>([
    [1, { id: 1, text: "Первая заметка" }],
    [2, { id: 2, text: "Вторая" }],
  ]);
  let nextId = 3;

  router.get("/api/notes", ({ res }) => {
    sendJson(res, 200, [...notes.values()]);
  });

  router.get("/api/slow", async ({ res }) => {
    await delay(5000);

    sendJson(res, 200, { message: "Done" });
  });
  router.get("/api/notes/:id", ({ res, params }) => {
    const id = parseNoteId(params.id || "");
    const note = notes.get(id);

    if (!note) {
      throw new HttpError(404, "Заметка не найдена");
    }

    sendJson(res, 200, note);
  });
  router.post("/api/notes", async ({ req, res }) => {
    const body = await readJsonBody(req);

    if (
      typeof body !== "object" ||
      body === null ||
      !("text" in body) ||
      typeof body.text !== "string" ||
      !body.text.trim()
    ) {
      throw new HttpError(400, "Некорректное поле text");
    }

    const note = {
      id: nextId++,
      text: body.text.trim(),
    };

    notes.set(note.id, note);

    sendJson(res, 201, note, {
      Location: `/api/notes/${note.id}`,
    });
  });
  router.delete("/api/notes/:id", ({ res, params }) => {
    const id = parseNoteId(params.id || "");
    const note = notes.get(id);

    if (!note) {
      throw new HttpError(404, "Заметка не найдена");
    }
    notes.delete(id);
    res.writeHead(204);
    res.end();
  });

  return createServer(async (req, res) => {
    const started = performance.now();
    try {
      const url = new URL(req.url ?? "/", "http://localhost");

      const found = router.find(req.method ?? "GET", url.pathname);
      if (found && "handler" in found) {
        await found.handler({ req, res, params: found.params, url });
      } else if (found) {
        res.setHeader("Allow", found.allowed.join(", "));
        throw new HttpError(405, "Метод не поддерживается");
      } else if (req.method === "GET" && !url.pathname.startsWith("/api/")) {
        await serveStatic(options.publicDir, url.pathname, res); // не API → ищем файл
      } else {
        throw new HttpError(404, "Маршрут не найден");
      }
    } catch (error) {
      if (error instanceof HttpError) {
        sendJson(res, error.statusCode, { error: error.message });
      } else {
        console.error(error);
        sendJson(res, 500, { error: "Внутренняя ошибка сервера" });
      }
    } finally {
      console.log(
        `${req.method} ${req.url} → ${res.statusCode} (${(performance.now() - started).toFixed(1)} ms)`,
      );
    }
  });
}

function parseNoteId(raw: string | undefined): number {
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new HttpError(400, "Некорректный ID");
  }
  return id;
}

