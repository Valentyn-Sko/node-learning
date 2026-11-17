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
} from "./notes.ts";
import { parseCommand } from "./commands.ts";

const file = process.env.NOTES_FILE ?? path.join(os.homedir(), ".notes", "notes.json");


try {
    const command = parseCommand(process.argv.slice(2))
    switch (command.kind) {
        case "add": {
            const notesFileText = await load(file);
            const updatedNotes = addNote(notesFileText, command.text);
            await save(file, updatedNotes);
            console.log(`Добавлена заметка #${updatedNotes.nextId - 1}`);
            break;
        }
        case "list": {
            const notesFileText = await load(file);
            list(notesFileText);
            break;
        }
        case "done": {
            const notesFileText = await load(file);
            const updatedNotes = markDone(notesFileText, command.id, true);
            await save(file, updatedNotes);
            break;
        }
        case "undone": {
            const notesFileText = await load(file);
            const updatedNotes = markDone(notesFileText, command.id, false);
            await save(file, updatedNotes);
            break;
        }
        case "delete": {
            const notesFileText = await load(file);
            const updatedNotes = deleteNote(notesFileText, command.id);
            await save(file, updatedNotes);
            break;
        }
        case "edit": {
            const notesFileText = await load(file);
            const updatedNotes = editNote(notesFileText, command.id, command.text);
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
            const unreachable: never = command;
            throw new Error(`Необработанная команда: ${JSON.stringify(unreachable)}`);
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


