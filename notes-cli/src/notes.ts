import { NotFoundError } from "./errors.ts";
import type { Note, NotesFile, StoredNoteFile } from "./types.ts";
import { parseText, type Filter } from "./validate.ts";

export function addNote(notesFile: NotesFile, text: string, tags: string[]): StoredNoteFile {
  const date = new Date().toISOString();
  parseText(text);
  const newNote = {
    id: notesFile.nextId,
    text,
    done: false,
    createdAt: date,
    updatedAt: date,
  };

  return {
    ...notesFile,
    notes: [...notesFile.notes, newNote],
    nextId: notesFile.nextId + 1,
  };
}

export function findNote(notesFile: NotesFile, id: number): Note {
  const note = notesFile.notes.find((item) => item.id === id);
  if (!note) {
    throw new NotFoundError(id);
  }
  return note;
}

export function markDone(
  notesFile: NotesFile,
  id: number,
  value: boolean,
): NotesFile {
  const date = new Date().toISOString();
  findNote(notesFile, id);

  return {
    ...notesFile,
    notes: notesFile.notes.map((note) =>
      note.id === id ? { ...note, done: value, updatedAt: date } : note,
    ),
  };
}

export function deleteNote(notesFile: NotesFile, id: number): NotesFile {
  findNote(notesFile, id);

  return {
    ...notesFile,
    notes: [...notesFile.notes.filter((item) => item.id !== id)],
  };
}

export function editNote(
  notesFile: NotesFile,
  id: number,
  text: string,
): NotesFile {
  const date = new Date().toISOString();
  findNote(notesFile, id);

  return {
    ...notesFile,
    notes: notesFile.notes.map((note) =>
      note.id === id ? { ...note, text: text, updatedAt: date } : note,
    ),
  };
}

export function list(notesFile: NotesFile, filter: Filter) {
    const notes = (filter === 'done' || filter === 'todo')
        ? notesFile.notes.filter(item => {
            if (filter === 'done' && item.done) {
                return true;
            } else if (filter === 'todo' && !item.done) {
                return true;
            }
        })
        : [ ...notesFile.notes ];

    const total = notes.length;
    if (!total && (filter === 'done' || filter === 'todo')) {
        console.log(`Нет заметок с фильтром ${filter}`);
    return;
    }
    if (!total) {
        console.log('Заметок пока нет. Добавьте: notes add "текст"');
        return;
    }

    notes.forEach((item) => {
    console.log(
      `#${item.id} [${item.done ? "x" : " "}] ${item.text} \t (${item.updatedAt})`,
    );
  });
  const done = notes.filter((item) => item.done).length;
  console.log(`Total: ${total}, done: ${done}`);
  return;
}
