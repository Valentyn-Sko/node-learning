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
