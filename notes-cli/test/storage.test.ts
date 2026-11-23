import { after, afterEach, beforeEach, describe, it } from "node:test";
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { load, save } from "../src/storage.ts";
import assert from "node:assert/strict";
import type { NotesFile, StoredNoteFile } from "../src/types.ts";

describe("load/save", () => {
    let tempDir: string;
    beforeEach(async () => {
        tempDir = await mkdtemp(path.join(os.tmpdir(), 'notes-'));
    });
    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it("load несуществующего файла", async () => {
        const file = path.join(tempDir, 'notes.json');
        const result = await load(file);
        assert.deepEqual(result, { nextId: 1, notes: [] });
    });

    it("save, затем load → получили те же данные (round-trip);", async () => {
        const date = (new Date()).toISOString();
        const data: StoredNoteFile = { nextId: 2, notes: [{id: 20, text:'Test text 20', createdAt: date, updatedAt: date, done: false, tags: []}] }
        const file = path.join(tempDir, 'notes.json');
        await save(file, data);
        const result = await load(file);
        assert.deepEqual(result, data);
    });

    it("save в несуществующую вложенную папку (dir/a/b/notes.json)", async () => {
        await rm(tempDir, { recursive: true, force: true });
        const date = (new Date()).toISOString();
        const data: StoredNoteFile = { nextId: 2, notes: [{id: 20, text:'Test text 20', createdAt: date, updatedAt: date, done: false, tags: []}] }
        const file = path.join(tempDir, 'a', 'b', 'notes.json');
        await save(file, data);
        assert.deepEqual(await load(file), data);
    });

    it("файл с битым JSON (запишите его сами через writeFile) → load отклоняется с сообщением «невалидный JSON»", async () => {
        const file = path.join(tempDir, 'broken.json');
        await writeFile(file, 'Купить молоко', 'utf8');
        await assert.rejects(load(file), /невалидный JSON/);
    });

    it("файл с правильным JSON, но неверной структурой → «неверная структура».", async () => {
        const file = path.join(tempDir, 'broken.json');
        const data = { nextId: 2, notes: [{id: 20, text:'Test text 20'}] }
        await writeFile(file, JSON.stringify(data), 'utf8');
        await assert.rejects(load(file), /неверная структура/);
    });
});