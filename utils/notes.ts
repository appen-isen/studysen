import { NotesList } from "@/webAurion/utils/types";

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

// Fonction pour obtenir le nom de la matière à partir du titre de la note
export function getRealSubjectName(subject: string): string {
    // On retire l'indication du semestre et le numéro de DS
    subject = subject.replaceAll(/S\d$/g, "");
    subject = subject.replaceAll(/ DS\d? /g, "");
    return subject.trim();
}

// Fonction pour récupérer le numéro du DS à partir du titre de la note
export function getDSNumber(subject: string): number {
    const match = subject.match(/DS(\d)/);
    return match ? parseInt(match[1]) : 1;
}

// Fonction pour récupérer le semestre à partir du code de la note
export function getSemesterFromCode(code: string): number {
    const match = code.match(/_S(\d)_/);
    return match ? parseInt(match[1]) : 1;
}

// Fonction pour filtrer les notes par semestre
export function filterNotesBySemester(
    notes: NotesList[],
    semester: 0 | 1
): NotesList[] {
    return notes.filter((note) => {
        const match = note.code.match(/_S(\d)_/);
        if (match) {
            // On vérifie si le semestre de la matière correspond au semestre sélectionné
            return (parseInt(match[1]) - 1) % 2 === semester;
        }
        return false;
    });
}
