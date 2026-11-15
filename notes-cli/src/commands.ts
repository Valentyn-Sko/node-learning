import type { NotesFile } from "./storage.ts";


export function addNote(notesFile: NotesFile, text: string): NotesFile {
    const date = (new Date()).toISOString();
    notesFile.notes.push({ id: notesFile.nextId, text, done: false, createdAt: date, updatedAt: date });
    console.log(`Добавлена заметка #${notesFile.nextId}`);
    notesFile.nextId++;
    return notesFile;
}

export function findNote(notesFile: NotesFile, id: number): number {
    const noteIndex = notesFile.notes.findIndex(item => item.id === id);
    if (noteIndex === -1) {
        throw Error(`Note with ID = ${id} not found`);
    }
    return noteIndex;
}

export function markDone(notesFile: NotesFile, id: number, value: boolean): NotesFile {
    const date = (new Date()).toISOString();
    const noteIndex = findNote(notesFile, id);
    notesFile.notes[noteIndex].updatedAt = date;
    notesFile.notes[noteIndex].done = value;
    return notesFile;
}

export function deleteNote(notesFile: NotesFile, id: number): NotesFile {
    const noteIndex = findNote(notesFile, id);
    notesFile.notes.splice(noteIndex, 1);
    return notesFile;
}

export function editNote(notesFile: NotesFile, id: number, text: string): NotesFile {
    const noteIndex = findNote(notesFile, id);
    const date = (new Date()).toISOString();
    notesFile.notes[noteIndex].updatedAt = date;
    notesFile.notes[noteIndex].text = text;
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