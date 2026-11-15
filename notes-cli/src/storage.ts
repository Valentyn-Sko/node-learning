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
        return JSON.parse(text);
        
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return { nextId: 1, notes: [] };
        } else {
            process.exitCode = 1;
            throw error;
        }
    }
}

export async function save(file: string, data: NotesFile): Promise<void> {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data ?? { nextId: 1, notes: [] }, null, 2), 'utf8');
}
