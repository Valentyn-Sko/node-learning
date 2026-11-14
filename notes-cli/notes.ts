/*
notes add "Купить молоко"
→ Добавлена заметка #1
notes list → список всех заметок
notes done 1 → отметить #1 выполненной
notes undone 1 → снять отметку
notes delete 1 → удалить #1
notes edit 2 "Новый текст" → изменить текст
notes help → справка

*/

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

interface Note {
    id: number;
    text: string;
    done: boolean;
    createdAt: string; // ISO
    updatedAt: string; // ISO
}
interface NotesFile {
    nextId: number;
    notes: Note[];
}


async function load(file: string): Promise<NotesFile> {
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

async function save(file: string, data: NotesFile): Promise<void> {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data ?? { nextId: 1, notes: [] }, null, 2), 'utf8');
}


const file = process.env.NOTES_FILE ?? path.join(os.homedir(), '.notes', 'notes.json');



console.log('Arguments:', process.argv.slice(2));
const command = process.argv.slice(2);

switch (command[0].toLocaleLowerCase()) {
    case 'add': {
        console.log('Add');
        const text = await load(file);
        text.notes.push({id: text.nextId, text: command[1], done: false, createdAt: (new Date()).toISOString(), updatedAt: (new Date()).toISOString()});
        text.nextId++;
        await save(file, text);
        break;
    }
    case 'list': {
        const text = await load(file);
        const total = text.notes.length;
        if (!total) { 
            console.log('Заметок пока нет. Добавьте: notes add "текст"');
            break;
        }
        text.notes.forEach(item => {
            console.log(`#${item.id} [${item.done ? 'x' : ' '}] ${item.text} \t (${item.updatedAt})`);
        });
        const done = text.notes.filter(item => item.done).length;
        console.log(`Total: ${total}, done: ${done}`);
        break;
    }
    case 'done': {
        console.log('Should be set done note with ID =', command[1]);
        const text = await load(file);
        const noteIndex = text.notes.findIndex(item => item.id === +command[1]);
        if (noteIndex === -1) {
            console.error('Note not found');
            break;
        }
        text.notes[noteIndex].done = true;
        await save(file, text);
        break;
    }
    case 'undone': {
        const text = await load(file);
        const noteIndex = text.notes.findIndex(item => item.id === +command[1]);
        if (noteIndex === -1) {
            console.error('Note not found');
            break;
        }
        text.notes[noteIndex].done = false;
        await save(file, text);
        break;
    }
    case 'delete': {
        console.log('Should be deleted note with ID =',  command[1]);
        break;
    }
    case 'edit': {
        const text = await load(file);
        const noteIndex = text.notes.findIndex(item => item.id === +command[1]);
        if (noteIndex === -1) {
            console.error('Note not found');
            break;
        }
        text.notes[noteIndex].text = command[2];
        await save(file, text);
        break;
    }
    case 'help': {
        console.log('This is a notes app. Here is a list of available command: Add, List, Done, Undone, Delete, Edit, Help.');
        process.exitCode = 0;
        break;
    }
    default: {
        console.log('There is wrong command. Here is a list of available command: Add, List, Done, Undone, Delete, Edit, Help.');
        process.exitCode = 1;
        break;
    }
} 
    
