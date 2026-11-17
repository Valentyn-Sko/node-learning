import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { addNote, markDone } from "../src/notes.ts";
import type { Note, NotesFile } from "../src/types.ts";

describe("addNote", () => {
  const data: NotesFile = { nextId: 1, notes: [] };

  beforeEach(() => {
    data.notes = [];
    data.nextId = 1;
  });
  it("добавляет заметку с id = 1 в пустой список", () => {
    const result = addNote(data, "Купить молоко");
    assert.equal(result.notes.length, 1);
    assert.equal(result.notes[0]?.id, 1);
    assert.equal(result.notes[0]?.done, false);
  });

  it("не мутирует исходный массив", () => {
    const original = data.notes;
    addNote(data, "x");
    assert.deepEqual(original, []);
  });
  it("бросает ошибку на пустой текст", () => {
    assert.throws(() => addNote(data, " "), /Текст не может быть пустым/i);
  });
});
describe("markDone", () => {
  it("бросает NotFoundError для несуществующего id", () => {
    const data: NotesFile = { nextId: 1, notes: [] };
    assert.throws(() => markDone(data, 42, true), { name: "NotFoundError" });
  });
});
