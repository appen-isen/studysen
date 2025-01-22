import { Note, NotesList } from "@/webAurion/utils/types";

// Fonction pour grouper les notes par matières
export function groupNotesBySubject(notes: NotesList[]): NotesList[] {
    const notesByCode: NotesList[] = [];
    notes.forEach((note: NotesList) => {
        // On regroupe par code de matière
        let code = note.code;

        // On retire les informations de DS pour regrouper les notes
        code = code.replace(/_DSS/, "");
        code = code.replace(/_DS\d/, "");
        code = code.replace(/_CC/, "");
        code = code.replace(/_TP/, "");

        const existingNote = notesByCode.find((n) => n.code === code);
        if (existingNote) {
            existingNote.notes = [...existingNote.notes, ...note.notes];
        } else {
            notesByCode.push({
                code,
                notes: [...note.notes],
            });
        }
    });
    // On trie les notes par date
    notesByCode.forEach((note) => {
        note.notes.sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split("/").map(Number);
            const [dayB, monthB, yearB] = b.date.split("/").map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA.getTime() - dateB.getTime();
        });
    });
    return notesByCode;
}

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

// Fonction pour obtenir le nom de la matière à partir d'un groupe de note
export function getSubjectNameFromGroup(notes: Note[]): string {
    // On recherche le titre le plus pertinent
    let subject = notes[0].subject;
    notes.forEach((note) => {
        if (/_DS\d?$/.test(note.subject)) {
            subject = note.subject;
        }
    });
    subject = getSubjectName(subject);
    subject = subject.replaceAll(/Contrôle continu/g, "");
    subject = subject.replaceAll(/Synthèse/g, "");
    return subject.trim();
}

export function getSubjectName(subject: string) {
    // On retire l'indication du semestre
    subject = subject.replaceAll(/S\d$/g, "");
    subject = subject.replaceAll(/- S\d$/g, "");
    subject = subject.replaceAll(/ - Semestre \d$/g, "");

    // On retire l'indication du DS
    subject = subject.replaceAll(/DS \d?/g, "");
    subject = subject.replaceAll(/DS\d?/g, "");
    return subject.trim();
}

// Fonction pour récupérer le numéro du DS à partir du code de la note
export function getDSNumber(code: string): string {
    if (code.endsWith("_CC")) return "CC";
    if (code.endsWith("_TP")) return "TP";
    if (code.endsWith("_DSS")) return "Syn";
    let match = code.match(/_DS(\d)/);
    if (match) {
        return "DS" + match[1];
    }

    return "DS";
}

// Fonction pour récupérer le semestre à partir du code de la note
export function getSemesterFromCode(code: string): number {
    const match = code.match(/_S(\d+)/);
    return match ? parseInt(match[1]) : 1;
}

// Fonction pour filtrer les notes par semestre
export function filterNotesBySemester(
    notes: NotesList[],
    semester: 0 | 1
): NotesList[] {
    return notes.filter((note) => {
        const match = note.code.match(/_S(\d+)/);
        if (match) {
            // On vérifie si le semestre de la matière correspond au semestre sélectionné
            return (parseInt(match[1]) - 1) % 2 === semester;
        }
        return false;
    });
}
