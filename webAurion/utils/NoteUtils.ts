import { load } from "cheerio";
import { Note, NotesList } from "./types";

export function getNotesFromResponse(htmlReponse: string): NotesList[] {
    // On parcourt le tableau des notes
    const parser = load(htmlReponse);
    const table = parser("table tbody");
    const notes: Note[] = [];
    //On récupère chaque notes avec les informations associées
    table.find("tr").each((index, element) => {
        const note: Note = {
            date: "",
            code: "",
            subject: "",
            note: "",
            absence: "",
            description: "",
            instructor: "",
        };
        const fields = [
            "date",
            "code",
            "subject",
            "note",
            "absence",
            "description",
            "instructor",
        ];
        // On construit l'objet note avec les informations de la ligne
        load(element)("td").each((index, element) => {
            let value = load(element).text().trim();
            // S'il s'agit du code de la note, on le formate
            if (index === 1) {
                // On supprime le dernier _DS+Numéro afin de créer un code commun avec les notes d'une même matière
                value = value.replace(/_DS\d$/, "");
            }
            note[fields[index]] = value;
        });
        notes.push(note);
    });
    // On regroupe les notes par matière
    const notesByCode: NotesList[] = [];
    notes.forEach((note) => {
        // On regroupe par code de matière
        const code = note.code;
        const existingNote = notesByCode.find((n) => n.code === code);
        if (existingNote) {
            existingNote.notes.push(note);
        } else {
            notesByCode.push({
                code,
                notes: [note],
            });
        }
    });

    return notesByCode;
}

// On calcule la moyenne d'une liste de notes
export function noteAverage(note: Note[]): number {
    let sum = 0;
    let count = 0;
    note.forEach((n) => {
        if (n.note !== "") {
            sum += parseFloat(n.note);
            count++;
        }
    });
    return sum / count;
}
