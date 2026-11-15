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
import { chechIsCorrectId, chechIsText } from "./errors.ts";

const file =
    process.env.NOTES_FILE ?? path.join(os.homedir(), ".notes", "notes.json");

console.log("Arguments:", process.argv.slice(2));
const command = process.argv.slice(2);

try {
    switch (command[0].toLocaleLowerCase()) {
        case "add": {
            chechIsText(command[1]);
            const notesFileText = await load(file);
            const updatedNotes = addNote(notesFileText, command[1]);
            await save(file, updatedNotes);
            break;
        }
        case "list": {
            const notesFileText = await load(file);
            list(notesFileText);
            break;
        }
        case "done": {
            chechIsCorrectId(command[1]);
            const notesFileText = await load(file);
            const updatedNotes = markDone(notesFileText, +command[1], true);
            await save(file, updatedNotes);
            break;
        }
        case "undone": {
            chechIsCorrectId(command[1]);
            const notesFileText = await load(file);
            const updatedNotes = markDone(notesFileText, +command[1], false);
            await save(file, updatedNotes);
            break;
        }
        case "delete": {
            chechIsCorrectId(command[1]);
            const notesFileText = await load(file);
            const updatedNotes = deleteNote(notesFileText, +command[1]);
            await save(file, updatedNotes);
            break;
        }
        case "edit": {
            chechIsCorrectId(command[1]);
            chechIsText(command[2]);
            const notesFileText = await load(file);
            const updatedNotes = editNote(notesFileText, +command[1], command[2]);
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
            console.log(
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
