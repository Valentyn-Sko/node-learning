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

import { load, save } from "./storage.ts";
import path from "node:path";
import os from "node:os";
import {
    addNote,
    deleteNote,
    editNote,
    list,
    markDone,
} from "./commands.ts";
import { parseId, chechIsText } from "./errors.ts";
import { parseText } from "./helper.ts";

const file = process.env.NOTES_FILE ?? path.join(os.homedir(), ".notes", "notes.json");
const [cmd, ...args] = process.argv.slice(2);
if (!cmd) throw new Error('Введите команду, например help');
type Command =
| { kind: 'add'; text: string; tags: string[] }
| { kind: 'done'; id: number }
| { kind: 'delete'; id: number }
| { kind: 'list'; filter: 'all' | 'done' | 'todo' };

try {
    const commandText = parseText(cmd);
    chechIsText(commandText, true);
    switch (commandText.toLocaleLowerCase()) {
        case "add": {
            chechIsText(parseText(args[0]));
            const notesFileText = await load(file);
            const updatedNotes = addNote(notesFileText, parseText(args[0]));
            await save(file, updatedNotes);
            break;
        }
        case "list": {
            const notesFileText = await load(file);
            list(notesFileText);
            break;
        }
        case "done": {
            const id = parseId(args[0]);
            const notesFileText = await load(file);
            const updatedNotes = markDone(notesFileText, id, true);
            await save(file, updatedNotes);
            break;
        }
        case "undone": {
            const id = parseId(args[0]);
            const notesFileText = await load(file);
            const updatedNotes = markDone(notesFileText, id, false);
            await save(file, updatedNotes);
            break;
        }
        case "delete": {
            const id = parseId(args[0]);
            const notesFileText = await load(file);
            const updatedNotes = deleteNote(notesFileText, id);
            await save(file, updatedNotes);
            break;
        }
        case "edit": {
            const id = parseId(args[0]);
            const newText = parseText(args[1]);
            chechIsText(newText);
            const notesFileText = await load(file);
            const updatedNotes = editNote(notesFileText, id, newText);
            await save(file, updatedNotes);
            break;
        }
        case "help": {
            console.log(
                "This is a notes app. Here is a list of available command: Add, List, Done, Undone, Delete, Edit, Help.",
            );
            process.exitCode = 0;
            break;
        }
        default: {
            console.error(
                "There is wrong command. Here is a list of available command: Add, List, Done, Undone, Delete, Edit, Help.",
            );
            process.exitCode = 1;
            break;
        }
    }
} catch (error) {
    if (error instanceof Error) {
        if ('code' in error && error.code === 'ENOENT') {
            console.error(`Cannot read file " ${error.message}`);
        } else {
            console.error(error.message);
        }
    }
    process.exitCode = 1;

}
