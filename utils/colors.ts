import Colors from "@/constants/Colors";
import { useSentUnknownSubjectStore } from "@/stores/telemetryStore";
import { NotesList, PlanningEvent } from "@/webAurion/utils/types";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "./config";

// Correspondance entre les différents noms et code de matière
const subjectMapping: Record<string, string> = {
    MATH: "Mathématiques",
    PROBA: "Mathématiques",
    PROBABILITES: "Mathématiques",
    Graphes: "Mathématiques",
    PHYS: "Physique",
    ALGO: "Informatique",
    Algorithmique: "Informatique",
    WEB: "Informatique",
    LINUX: "Informatique",
    CULTURE_NUM: "Informatique",
    BDD: "Informatique",
    DEV: "Informatique",
    STM32: "Informatique",
    ENVT: "Environnement",
    SI: "Sciences de l'Ingénieur",
    ANGLAIS: "Anglais",
    LV2: "Anglais",
    FHS: "FHS",
    PROJET_INFO: "Informatique",
    RESEAUX: "Informatique",
    Réseaux: "Informatique",
    "Gestion de projet": "Entrepreneuriat",
    Electronique: "Energie",
    "Traitement du signal": "Energie"
};
// Fonction pour obtenir la couleur d'un événement en fonction de la matière
export function getSubjectColor(subject: string): string {
    const mappedSubject = subjectMapping[subject] || subject; // Si pas de correspondance, on garde le nom original
    switch (mappedSubject) {
        case "Mathématiques":
            return "#FFA99D";
        case "Physique":
            return "#FFD970";
        case "Sciences de l'Ingénieur":
            return "#D296FF";
        case "Informatique":
            return "#8BD8FF";
        case "Anglais":
            return "#FFA3E3";
        case "FHS":
            return "#B1E8BB";
        case "Environnement":
            return "#18bd4aff";
        case "Entrepreneuriat":
            return "#ff745cff";
        case "Economie":
            return "#e5ec18ff";
        case "Energie":
            return "#155bf4ff";
        case "Sport":
            return "#6a4e2cff";
        default:
            return Colors.lightGray;
    }
}
// Fonction pour obtenir l'icône d'un événement en fonction de la matière
export function getSubjectIcon(
    subject: string
): keyof typeof MaterialIcons.glyphMap {
    let icon: keyof typeof MaterialIcons.glyphMap;
    const mappedSubject = subjectMapping[subject] || subject; // Si pas de correspondance, on garde le nom original
    switch (mappedSubject) {
        case "Mathématiques":
            icon = "functions";
            break;
        case "Physique":
            icon = "science";
            break;
        case "Sciences de l'Ingénieur":
            icon = "route";
            break;
        case "Informatique":
            icon = "code";
            break;
        case "Anglais":
            icon = "translate";
            break;
        case "FHS":
            icon = "record-voice-over";
            break;
        case "Environnement":
            icon = "eco";
            break;
        case "Entrepreneuriat":
            icon = "groups";
            break;
        case "Economie":
            icon = "attach-money";
            break;
        case "Energie":
            icon = "electric-bolt";
            break;
        case "Sport":
            icon = "sports-baseball";
            break;
        default:
            icon = "event";
    }
    return icon;
}

// Fonction pour extraire la matière à partir du code de note
export function extractSubjectFromCode(code: string): string | null {
    for (const key in subjectMapping) {
        if (code.toUpperCase().includes(key)) {
            return key;
        }
    }
    return null;
}

// Fonction pour obtenir la couleur à partir du code de note
export function getColorFromNoteCode(code: string): string {
    const subjectKey = extractSubjectFromCode(code);
    if (subjectKey) {
        return getSubjectColor(subjectKey);
    }
    return Colors.lightGray;
}

// Fonction pour obtenir l' icône à partir du code de note
export function getIconFromNoteCode(
    code: string
): keyof typeof MaterialIcons.glyphMap {
    const subjectKey = extractSubjectFromCode(code);
    if (subjectKey) {
        return getSubjectIcon(subjectKey);
    }
    return "grade";
}

// Fonction générique pour envoyer des noms de matières inconnues
function sendUnknownSubjects<T>(
    items: T[],
    extractSubject: (item: T) => string | null,
    validateSubject: (subject: string) => boolean = () => true
): void {
    const knownSubjects = useSentUnknownSubjectStore.getState().unknownSubjects;
    const newSubjects = new Set<string>();

    items.forEach((item) => {
        const subject = extractSubject(item);
        if (
            subject !== null &&
            !knownSubjects.includes(subject) &&
            validateSubject(subject)
        ) {
            // Si la matière est inconnue, on l'ajoute à la liste
            newSubjects.add(subject);
        }
    });

    if (newSubjects.size > 0) {
        const subjectsArray = Array.from(newSubjects);
        // On met à jour le store avec les nouvelles matières inconnues
        useSentUnknownSubjectStore.setState((state) => ({
            unknownSubjects: [...state.unknownSubjects, ...subjectsArray]
        }));
        // On envoie les données de télémétrie
        sendUnknownSubjectsTelemetry(subjectsArray);
    }
}

// Fonction pour envoyer les noms de matière des notes inconnues
export function sendUnknownNotesTelemetry(notes: NotesList[]): void {
    sendUnknownSubjects(notes, (note) =>
        extractSubjectFromCode(note.code) === null ? note.code : null
    );
}

// Fonction pour envoyer les noms de matière inconnus pour les événements du planning
export function sendUnknownPlanningSubjectsTelemetry(
    planning: PlanningEvent[]
): void {
    sendUnknownSubjects(
        planning,
        (event) => event.subject,
        (subject) => getSubjectIcon(subject) === "event"
    );
}

// Fonction pour envoyer des données de télémétrie pour les matières ou les codes de notes inconnus
export async function sendUnknownSubjectsTelemetry(subjects: string[]) {
    try {
        console.log("Nouveaux noms de matière inconnus envoyés :", subjects);
        await axios.post(`${API_BASE_URL}/telemetry/submit`, {
            type: "unknownSubjects",
            data: subjects
        });
    } catch (error) {
        console.error(
            "Erreur lors de l'envoi des données de télémétrie :",
            error
        );
    }
}
