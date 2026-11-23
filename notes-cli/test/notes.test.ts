import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { addNote, deleteNote, markDone, editNote } from "../src/notes.ts";
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
    const before = structuredClone(data);
    addNote(data, "x");
    assert.deepEqual(data, before);
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

describe("deleteNote", () => {
  const date = new Date().toISOString();
  let data: NotesFile = {
    nextId: 2,
    notes: [
      {
        id: 1,
        text: "test note",
        done: false,
        tags: [],
        updatedAt: date,
        createdAt: date,
      },
    ],
  };

  beforeEach(() => {
    data = {
      nextId: 2,
      notes: [
        {
          id: 1,
          text: "test note",
            done: false,
          tags: [],
          updatedAt: date,
          createdAt: date,
        },
      ],
    };
  });

  it("бросает NotFoundError для несуществующего id", () => {
    const data: NotesFile = { nextId: 1, notes: [] };
    assert.throws(() => deleteNote(data, 42), { name: "NotFoundError" });
  });

  it("не мутирует исходный массив", () => {
    const before = structuredClone(data);
    deleteNote(data, 1);
    assert.deepEqual(data, before);
  });
});

describe("editNote", () => {
  const date = new Date().toISOString();
  let data: NotesFile = {
    nextId: 2,
    notes: [
      {
        id: 1,
        text: "test note",
        done: false,
        updatedAt: date,
        createdAt: date,
        tags: [],
      },
    ],
  };

  beforeEach(() => {
    data = {
      nextId: 2,
      notes: [
        {
          id: 1,
          text: "test note",
          done: false,
          updatedAt: date,
         createdAt: date,
          tags: [],
        },
      ],
    };
  });

  it("бросает NotFoundError для несуществующего id", () => {
    const data: NotesFile = { nextId: 1, notes: [] };
    assert.throws(() => editNote(data, 42, "new text"), {
      name: "NotFoundError",
    });
  });

  it("не мутирует исходный массив", () => {
    const before = structuredClone(data);
    const newNotes = editNote(data, 1, "new text");
    assert.deepEqual(data, before);
    assert.deepEqual(newNotes.notes[0]?.text, "new text");
  });

  it("меняет текст", () => {
    const newNotes = editNote(data, 1, "new text");
    assert.deepEqual(newNotes.notes[0]?.text, "new text");
  });
});
