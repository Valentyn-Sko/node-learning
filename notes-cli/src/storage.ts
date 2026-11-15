import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export interface Note {
    id: number;
    text: string;
    done: boolean;
    createdAt: string; // ISO
    updatedAt: string; // ISO
}
export interface NotesFile {
    nextId: number;
    notes: Note[];
}


export async function load(file: string): Promise<NotesFile> {
    try {
        const text = await readFile(file, 'utf8');
        const data: unknown = JSON.parse(text);
        if (
            typeof data === 'object' && data !== null &&
            'nextId' in data && typeof data.nextId === 'number' && Number.isInteger(data.nextId) && data.nextId > 0 &&
            'notes' in data && Array.isArray(data.notes) && data.notes.every(isNote)
        ) {
            return data as NotesFile;
        }

        throw new Error('Invalid notes file structure');
        
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return { nextId: 1, notes: [] };
        } else {
            process.exitCode = 1;
            throw new Error(`Файл заметок повреждён: ${file}`);
        }
    }
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
        'done' in x && typeof x.done ==='boolean'
    );
}