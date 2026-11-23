export interface Note {
    id: number;
    text: string;
    done: boolean;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    tags: string[]; 
}
export interface NotesFile {
    nextId: number;
    notes: Note[];
}


export type StoredNote = Omit<Note, 'tags'> & { tags?: string[] };

export interface StoredNoteFile {
    nextId: number;
    notes: StoredNote[];
}
