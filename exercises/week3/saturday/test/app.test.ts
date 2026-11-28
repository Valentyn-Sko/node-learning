import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";

import { createApp } from "../src/app.ts";
import { once } from "node:events";
import path from "node:path";

describe("HTTP API", () => {
  const server = createApp({
    publicDir: path.join(import.meta.dirname, "..", "public"),
  });
  let base: string;

  before(async () => {
    server.listen(0);
    await once(server, "listening");
    base = `http://localhost:${(server.address() as AddressInfo).port}`;
  });
  after(() => {
    server.close();
  });

  it("GET /api/notes — возвращает список заметок (200)", async () => {
    const response = await fetch(`${base}/api/notes`);

    assert.equal(response.status, 200);

    const body = await response.json();

    assert.deepEqual(body, [
      { id: 1, text: "Первая заметка" },
      { id: 2, text: "Вторая" },
    ]);
  });

  it("GET /api/notes/:id — возвращает одну заметку (200)", async () => {
    const response = await fetch(`${base}/api/notes/1`);

    assert.equal(response.status, 200);

    const body = await response.json();

    assert.deepEqual(body, {
      id: 1,
      text: "Первая заметка",
    });
  });

  it("GET /api/notes/:id — возвращает 404 для отсутствующей заметки", async () => {
    const response = await fetch(`${base}/api/notes/999`);

    assert.equal(response.status, 404);

    const body = await response.json();

    assert.deepEqual(body, {
      error: "Заметка не найдена",
    });
  });

  it("GET /api/notes/:id — возвращает 400 для некорректного ID", async () => {
    const response = await fetch(`${base}/api/notes/abc`);

    assert.equal(response.status, 400);
  });

  it("POST /api/notes — создаёт заметку (201)", async () => {
    const response = await fetch(`${base}/api/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "Тестовая заметка",
      }),
    });

    assert.equal(response.status, 201);

    const body = await response.json();

    assert.deepEqual(body, {
      id: 3,
      text: "Тестовая заметка",
    });

    assert.equal(response.headers.get("location"), "/api/notes/3");
  });
  it("POST /api/notes — возвращает 400 для пустого text", async () => {
    const response = await fetch(`${base}/api/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "   " }),
    });

    assert.equal(response.status, 400);
  });

  it("POST /api/notes — возвращает 400 для невалидного JSON", async () => {
    const response = await fetch(`${base}/api/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: '{"text": invalid}',
    });

    assert.equal(response.status, 400);
  });

  it("POST /api/notes — возвращает 415 для неправильного Content-Type", async () => {
    const response = await fetch(`${base}/api/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: "hello",
    });

    assert.equal(response.status, 415);
  });
  it("POST /api/notes — возвращает 413 для слишком большого тела", async () => {
    const response = await fetch(`${base}/api/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "a".repeat(1_100_000),
      }),
    });

    assert.equal(response.status, 413);
  });

  it("DELETE /api/notes/:id — удаляет заметку (204)", async () => {
    const response = await fetch(`${base}/api/notes/2`, {
      method: "DELETE",
    });

    assert.equal(response.status, 204);
    assert.equal(await response.text(), "");

    const check = await fetch(`${base}/api/notes/2`);

    assert.equal(check.status, 404);
  });

  it("path traversal через %2F → 403", async () => {
    const res = await fetch(`${base}/..%2F..%2F..%2F..%2Fpackage.json`);
    assert.equal(res.status, 403);
  });
});
