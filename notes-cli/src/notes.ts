import { NotFoundError } from "./errors.ts";
import type { Note, NotesFile } from "./types.ts";
import { parseText } from "./validate.ts";


export function addNote(notesFile: NotesFile, text: string): NotesFile {
    const date = new Date().toISOString();
    parseText(text);
    const newNote = {
        id: notesFile.nextId,
        text,
        done: false,
        createdAt: date,
        updatedAt: date
    };

    return {
        ...notesFile,
        notes: [...notesFile.notes, newNote],
        nextId: notesFile.nextId + 1
    };
}

export function findNote(notesFile: NotesFile, id: number): Note {
  const note = notesFile.notes.find(item => item.id === id);   // тип: Note | undefined
  if (!note) {
      throw new NotFoundError(id);
  }
  return note;                                                 // здесь TS уже знает: Note
}

export function markDone(notesFile: NotesFile, id: number, value: boolean): NotesFile {
    const date = (new Date()).toISOString();
    const note = findNote(notesFile, id);
    note.updatedAt = date;
    note.done = value;
    return notesFile;
}

export function deleteNote(notesFile: NotesFile, id: number): NotesFile {
    findNote(notesFile, id); 
    notesFile.notes = notesFile.notes.filter(item => item.id !== id);
    return notesFile;
}

export function editNote(notesFile: NotesFile, id: number, text: string): NotesFile {
    const date = (new Date()).toISOString();
    const note = findNote(notesFile, id);
    note.updatedAt = date;
    note.text = text;
    return notesFile;
}


export function list(notesFile: NotesFile) {
    const total = notesFile.notes.length;
    if (!total) {
        console.log('Заметок пока нет. Добавьте: notes add "текст"');
        return;
    }
    notesFile.notes.forEach(item => {
        console.log(`#${item.id} [${item.done ? 'x' : ' '}] ${item.text} \t (${item.updatedAt})`);
    });
    const done = notesFile.notes.filter(item => item.done).length;
    console.log(`Total: ${total}, done: ${done}`);
    return;
}