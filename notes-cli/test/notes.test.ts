import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { addNote, markDone } from "../src/notes.ts";
import type { Note } from "../src/types.ts";

describe("addNote", () => {
  let notes: Note[];

  beforeEach(() => {
    notes = [];
  });
  it("добавляет заметку с id = 1 в пустой список", () => {
    const result = addNote(notes, "Купить молоко");
    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, 1);
    assert.equal(result[0]?.done, false);
  });

  it("не мутирует исходный массив", () => {
    addNote(notes, "x");
    assert.deepEqual(notes, []);
    it("бросает ошибку на пустой текст", () => {
      assert.throws(() => addNote(notes, " "), /пуст/i);
    });
  });
});
describe("markDone", () => {
  it("бросает NotFoundError для несуществующего id", () => {
    assert.throws(() => markDone([], 42, true), { name: "NotFoundError" });
  });
});
