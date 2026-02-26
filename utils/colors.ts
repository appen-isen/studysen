import Colors from "@/constants/Colors";
import { useSentUnknownSubjectStore } from "@/stores/telemetryStore";
import { NotesList, PlanningEvent } from "@/webAurion/utils/types";
import { MaterialIcons } from "@expo/vector-icons";
import { API_BASE_URL } from "./config";
import { fetch } from "expo/fetch";

// Correspondance entre les différents noms et code de matière
const subjectMapping: Record<string, string> = {
    MATH: "Mathématiques",
    PROBA: "Mathématiques",
    PROBABILITES: "Mathématiques",
    Graphes: "Mathématiques",
    STATISTIQUES: "Mathématiques",
    PHYS: "Physique",
    ALGO: "Informatique",
    Algorithmique: "Informatique",
    WEB: "Informatique",
    LINUX: "Informatique",
    CULTURE_NUM: "Informatique",
    BDD: "Informatique",
    DEV: "Informatique",
    ANGULAR: "Informatique",
    GIT: "Informatique",
    "Base de données": "Informatique",
    "Linux embarqué": "Informatique",
    "Web Development Node JS": "Informatique",
    JAVA: "Informatique",
    STM32: "Informatique",
    ENVT: "Environnement",
    "Technologies pour l'environnement": "Environnement",
    "Changement climatique": "Environnement",
    SI: "Sciences de l'Ingénieur",
    ANGLAIS: "Anglais",
    LV2: "Anglais",
    FHS: "FHS",
    PROJET_INFO: "Informatique",
    RESEAUX: "Informatique",
    Réseaux: "Informatique",
    ENTREPRENEURIAT: "Entrepreneuriat",
    "Gestion de projet": "Entrepreneuriat",
    Management: "Entrepreneuriat",
    "Démarche commerciale et négociations": "Entrepreneuriat",
    "Management des SI": "Entrepreneuriat",
    Electronique: "Energie",
    FPGA: "Energie",
    "Elec Puissance": "Energie",
    "Traitement du signal": "Energie",
    "Intelligence économique et veille sectorielle": "Economie",
    "INTELLIGENCE ECONOMIQUE": "Economie",
    "VEILLE SECTORIELLE": "Economie",
    Automatique: "Sciences de l'Ingénieur",
    "Sciences de l'ingénieur": "Sciences de l'Ingénieur",
    "Sciences de l'Ingénieur": "Sciences de l'Ingénieur",
    "Communications Numériques": "Informatique",
    "Communication Numérique": "Informatique",
    "Temps Réel": "Informatique",
    TEMPS_REEL: "Informatique",
    "Theorie de la decision": "Mathématiques",
    "Théorie de la décision": "Mathématiques",
    DEVOIRS: "Mathématiques",
    Eco: "Economie",
    ECONOMIE: "Economie",
    "Customer Relationship management and satisfaction": "Entrepreneuriat",
    "Informatique décisionnelle et IA": "Informatique",
    "Electronique numérique": "Energie",
    "Intelligence Artificielle": "Informatique",
    "Artificial Intelligence": "Informatique",
    "Introduction à l'IA et la robotique": "Informatique",
    "IA et EMS": "Informatique",
    Transmission: "Energie",
    Cybersécurité: "Informatique",
    CYBER: "Informatique",
    "Hardware Security Cortex": "Informatique",
    SIG: "Informatique",
    Robotique: "Sciences de l'Ingénieur",
    "Programation Système": "Informatique",
    "Programmation Système": "Informatique",
    Marketing: "Entrepreneuriat",
    "Numerique Responsable": "Environnement",
    "Numérique Responsable": "Environnement",
    "Gestion de grands projets numériques": "Entrepreneuriat",
    "Gestion des risques": "Entrepreneuriat",
    "Conduite du changement": "Entrepreneuriat",
    "Projet STM32": "Energie",
    "Projet Informatique": "Informatique",
    "Projet Big Data": "Informatique",
    "Projet Intelligence Artificielle": "Informatique",
    "Projet Web": "Informatique",
    "Architecture Logicielle": "Informatique",
    "Fouille de données": "Informatique",
    "Framework Javascript": "Informatique",
    Python: "Informatique",
    Linux: "Informatique",
    Java: "Informatique",
    UML: "Informatique",
    Chimie: "Physique",
    Biologie: "Physique",
    Image: "Informatique",
    "Technologies Biomédicales": "Sciences de l'Ingénieur",
    "Réseaux de capteurs basse consommation": "Informatique",
    "Suivi de l'environnement en temps réel": "Environnement",
    "Low Tech et technologies frugales": "Environnement",
    "Lutte contre les pollutions": "Environnement",
    "Smart Grids": "Energie",
    "Efficacité énergétique des bâtiments (Smart Building)": "Energie",
    "Modélisation et simulation de systèmes": "Sciences de l'Ingénieur",
    Operations: "Mathématiques",
    Research: "Mathématiques",
    "Operations Research": "Mathématiques",
    AUTONUM: "Sciences de l'Ingénieur",
    AUTO_NUM: "Sciences de l'Ingénieur",
    CONTRO: "Sciences de l'Ingénieur",
    TS_NUMERIQUE: "Informatique",
    COMM_NUM: "Informatique",
    C_PLUS_PLUS: "Informatique",
    BASES_DE_DONNEES: "Informatique",
    ARCHI_LOG: "Informatique",
    INTELL_ART: "Informatique",
    CYBER_SECU: "Informatique",
    SECURITE_IOT: "Informatique",
    GESTION_PROJET_AGILE: "Entrepreneuriat",
    DROIT_SOCIAL: "FHS",
    DEC_JUR: "FHS",
    ASPECTS_JURIDIQUES: "FHS",
    LEADERSHIP: "FHS",
    MULTICULTURALITY: "FHS",
    CSR_IMPACT: "Economie",
    ECOLOGIE: "Environnement",
    CLIM: "Environnement",
    CHAGT_CLIM: "Environnement",
    SMART_MOBILITY: "Environnement",
    DEMARCHES_COM: "Entrepreneuriat",
    INTELL_ECO_VEILLE: "Economie",
    FINANCES: "Economie",
    MECA: "Sciences de l'Ingénieur"
};

const ignoredGarbageSubjects = new Set<string>([
    "",
    "Réunion",
    "Réunion 2",
    "Congés",
    "Rattrapage",
    "Conférence",
    "Soutenances",
    "Soutenance technique",
    "Visite",
    "Evénement extérieur",
    "Heure de promo",
    "FORUM",
    "Jury",
    "Projets"
]);

function isGarbageSubject(subject: string): boolean {
    return ignoredGarbageSubjects.has(subject.trim());
}
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
            return "#2dda60ff";
        case "Entrepreneuriat":
            return "#ff745cff";
        case "Economie":
            return "#e5ec18ff";
        case "Energie":
            return "#5c86e0ff";
        case "Sport":
            return "#af8149ff";
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
        (subject) =>
            !isGarbageSubject(subject) && getSubjectIcon(subject) === "event"
    );
}

// Fonction pour envoyer des données de télémétrie pour les matières ou les codes de notes inconnus
export async function sendUnknownSubjectsTelemetry(subjects: string[]) {
    try {
        console.log("Nouveaux noms de matière inconnus envoyés :", subjects);
        const res = await fetch(`${API_BASE_URL}/telemetry/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "unknownSubjects", data: subjects })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (error) {
        console.error(
            "Erreur lors de l'envoi des données de télémétrie :",
            error
        );
    }
}
