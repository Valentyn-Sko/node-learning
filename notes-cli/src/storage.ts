import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Note, NotesFile } from './types.ts';



export async function load(file: string): Promise<NotesFile> {
    let text: string;

    try {
        text = await readFile(file, "utf8");
    } catch (error) {
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return { nextId: 1, notes: [] };
        } else {
            throw error;
        }
    }

    let data: unknown;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`Файл заметок повреждён (невалидный JSON): ${file}`);
    }

    if (!isNotesFile(data)) {
        throw new Error(`Файл заметок повреждён (неверная структура): ${file}`);
    }

    return data;
  
} 

export async function save(file: string, data: NotesFile): Promise<void> {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data ?? { nextId: 1, notes: [] }, null, 2), 'utf8');
}


function isNote(x: unknown): x is Note {
    return (
        typeof x === 'object' && x !== null &&
        'id' in x && typeof x.id === 'number' &&
        'text' in x && typeof x.text ==='string' &&
        'done' in x && typeof x.done === 'boolean' &&
        'createdAt' in x && typeof x.createdAt === 'string' &&
        'updatedAt' in x && typeof x.updatedAt ==='string'
    );
}

function isNotesFile(x: unknown): x is NotesFile {
  return typeof x === 'object' && x !== null &&
        'nextId' in x && typeof x.nextId === 'number' && Number.isInteger(x.nextId) && x.nextId > 0 &&
        'notes' in x && Array.isArray(x.notes) && x.notes.every(isNote);
}