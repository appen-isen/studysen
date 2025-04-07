import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";

const subjectMapping: Record<string, string> = {
    MATH: "Mathématiques",
    PROBA: "Mathématiques",
    PHYS: "Physique",
    ALGO: "Informatique",
    WEB: "Informatique",
    BDD: "Informatique",
    DEV: "Informatique",
    STM32: "Informatique",
    ENVT: "Environnement",
    SI: "Sciences de l'Ingénieur",
    ANGL: "Anglais",
    FHS: "FHS"
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
    return "event";
}
