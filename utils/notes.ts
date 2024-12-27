import { Note, NotesList } from "@/webAurion/utils/types";

// Fonction pour calculer la moyenne des notes
export function calculateAverage(notes: NotesList[]): string {
    if (notes.length === 0) return "";
    let total = 0;
    let count = 0;
    notes.forEach((noteList) => {
        noteList.notes.forEach((note) => {
            total += parseFloat(note.note);
            count++;
        });
    });

    return (total / count).toFixed(2).replace(".", ",");
}
