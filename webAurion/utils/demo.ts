import { getSemesterFromCode } from "@/utils/notes";
import { NotesList, PlanningEvent } from "./types";

export function generateDemoNotes(): NotesList[] {
    let notes = [
        {
            code: "24_CIR1N_A1_S1_ALGO_C",
            notes: [
                {
                    date: "18/10/2024",
                    code: "24_CIR1N_A1_S1_ALGO_C",
                    subject: "Algorithmique C DS1 S1",
                    note: "16.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
                {
                    date: "29/11/2024",
                    code: "24_CIR1N_A1_S1_ALGO_C",
                    subject: "Algorithmique C DS2 S1",
                    note: "15.50",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
            ],
        },
        {
            code: "24_CIR1N_A1_S1_ANGLAIS_DS",
            notes: [
                {
                    date: "08/10/2024",
                    code: "24_CIR1N_A1_S1_ANGLAIS_DS",
                    subject: "Anglais DS S1",
                    note: "17.40",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
            ],
        },
        {
            code: "24_CIR1N_A1_S1_MATH_CC",
            notes: [
                {
                    date: "10/01/2025",
                    code: "24_CIR1N_A1_S1_MATH_CC",
                    subject: "Mathématiques Contrôle continu S1",
                    note: "15.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
            ],
        },
        {
            code: "24_CIR1N_A1_S1_MATH",
            notes: [
                {
                    date: "24/09/2024",
                    code: "24_CIR1N_A1_S1_MATH",
                    subject: "Mathématiques DS1 S1",
                    note: "15.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
                {
                    date: "05/11/2024",
                    code: "24_CIR1N_A1_S1_MATH",
                    subject: "Mathématiques DS2 S1",
                    note: "17.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
                {
                    date: "04/12/2024",
                    code: "24_CIR1N_A1_S1_MATH",
                    subject: "Mathématiques DS3 S1",
                    note: "14.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
            ],
        },
        {
            code: "24_CIR1N_A1_S1_PHYSIQUE",
            notes: [
                {
                    date: "02/10/2024",
                    code: "24_CIR1N_A1_S1_PHYSIQUE",
                    subject: "Physique DS1 S1",
                    note: "13.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
                {
                    date: "13/11/2024",
                    code: "24_CIR1N_A1_S1_PHYSIQUE",
                    subject: "Physique DS2 S1",
                    note: "15.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
            ],
        },
        {
            code: "24_CIR1N_A1_S2_MATH",
            notes: [
                {
                    date: "04/03/2025",
                    code: "24_CIR1N_A1_S2_MATH",
                    subject: "Mathématiques DS1 S2",
                    note: "15.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
                {
                    date: "04/03/2025",
                    code: "24_CIR1N_A1_S2_MATH",
                    subject: "Mathématiques DS2 S2",
                    note: "17.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
                {
                    date: "04/03/2025",
                    code: "24_CIR1N_A1_S2_MATH",
                    subject: "Mathématiques DS3 S2",
                    note: "14.00",
                    absence: "",
                    description: "",
                    instructor: "Mr TEST",
                },
            ],
        },
    ];
    return notes;
}

export function generateDemoPlanning(
    weeksFromNow: number = 0
): PlanningEvent[] {
    let planning = [
        {
            id: "15446554",
            title: "Mathématiques S1",
            subject: "Mathématiques",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            learners: "CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025",
            start: "2025-01-06T08:00:00+0100",
            end: "2025-01-06T10:00:00+0100",
            className: "COURS",
        },
        {
            id: "15716705",
            title: "Physique S1",
            subject: "Physique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            learners: "CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025",
            start: "2025-01-06T10:15:00+0100",
            end: "2025-01-06T12:15:00+0100",
            className: "COURS",
        },
        {
            id: "15689457",
            title: "Culture numérique S1",
            subject: "Informatique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            learners: "CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025",
            start: "2025-01-06T13:30:00+0100",
            end: "2025-01-06T15:30:00+0100",
            className: "COURS",
        },
        {
            id: "14676049",
            title: "Sciences de l'ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            learners: "CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025",
            start: "2025-01-06T15:40:00+0100",
            end: "2025-01-06T17:40:00+0100",
            className: "COURS",
        },
        {
            id: "15836659",
            title: "Langage C Expert",
            subject: "Informatique",
            room: "A2_50 ISEN",
            instructors: "Mr TEST",
            learners: "CIR1 Nantes 2024-2025",
            start: "2025-01-07T08:00:00+0100",
            end: "2025-01-07T10:00:00+0100",
            className: "TP",
        },
        {
            id: "15446586",
            title: "Mathématiques S1",
            subject: "Mathématiques",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            learners: "CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025",
            start: "2025-01-07T10:15:00+0100",
            end: "2025-01-07T12:15:00+0100",
            className: "COURS",
        },
        {
            id: "15447135",
            title: "Langage C Expert",
            subject: "Informatique",
            room: "A2_38 ISEN",
            instructors: "Mr TEST",
            learners: "CIR1 Nantes 2024-2025",
            start: "2025-01-07T13:30:00+0100",
            end: "2025-01-07T15:30:00+0100",
            className: "TP",
        },
        {
            id: "15780828",
            title: "Langage C Expert",
            subject: "Informatique",
            room: "A3_34 ISEN_TD M1-02",
            instructors: "Mr TEST",
            learners: "CIR1 Nantes 2024-2025",
            start: "2025-01-08T08:00:00+0100",
            end: "2025-01-08T10:00:00+0100",
            className: "TP",
        },
        {
            id: "14997890",
            title: "Physique S1",
            subject: "Physique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            learners: "CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025",
            start: "2025-01-08T10:15:00+0100",
            end: "2025-01-08T12:15:00+0100",
            className: "COURS",
        },
        {
            id: "15062563",
            title: "Sciences de l'Ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            learners: "CIR1 Nantes 2024-2025 TP Groupe 4",
            start: "2025-01-08T15:45:00+0100",
            end: "2025-01-08T17:45:00+0100",
            className: "TP",
        },
        {
            id: "15448889",
            title: "Anglais S1",
            subject: "Anglais",
            room: "A2_50 ISEN",
            instructors: "Mr TEST",
            learners:
                "CENT1/CEST1/CIR1/CSI1 Nantes 2024-2025 FHS Groupe C / CENT1 Nantes 2024-2025 / CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025 / CSI1 Nantes 2024-2025",
            start: "2025-01-09T08:00:00+0100",
            end: "2025-01-09T10:00:00+0100",
            className: "COURS",
        },
        {
            id: "15448937",
            title: "Formation Humaine et Sociale S1",
            subject: "FHS",
            room: "A2_32 ISEN_CO-DESIGN",
            instructors: "Mr TEST",
            learners:
                "CENT1/CEST1/CIR1/CSI1 Nantes 2024-2025 FHS Groupe C / CENT1 Nantes 2024-2025 / CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025 / CSI1 Nantes 2024-2025",
            start: "2025-01-09T10:15:00+0100",
            end: "2025-01-09T12:15:00+0100",
            className: "COURS",
        },
        {
            id: "15348524",
            title: "Education Physique et Sportive S1",
            subject: "Sport",
            room: "",
            instructors: "Mr TEST",
            learners:
                "CENT1 Nantes 2024-2025 Groupe Sport / CENT2 Nantes 2024-2025 Groupe Sport / CEST1 Nantes 2024-2025 Groupe Sport / CEST2 Nantes 2024-2025 Groupe Sport / CIR1 Nantes 2024-2025 Groupe Sport / CIR2 Nantes 2024-2025 Groupe Sport / CSI1 Nantes 2024-2025 Groupe Sport / CSI2 Nantes 2024-2025 Groupe Sport",
            start: "2025-01-09T16:00:00+0100",
            end: "2025-01-09T17:00:00+0100",
            className: "COURS",
        },
        {
            id: "15689502",
            title: "Culture Numérique S1",
            subject: "Informatique",
            room: "A3_40 ISEN_PROJET/DS",
            instructors: "Mr TEST",
            learners: "CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025",
            start: "2025-01-10T08:30:00+0100",
            end: "2025-01-10T09:30:00+0100",
            className: "COURS",
        },
        {
            id: "15446630",
            title: "Mathématiques S1",
            subject: "Mathématiques",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            learners: "CEST1 Nantes 2024-2025 / CIR1 Nantes 2024-2025",
            start: "2025-01-10T09:45:00+0100",
            end: "2025-01-10T11:45:00+0100",
            className: "COURS",
        },
        {
            id: "15062584",
            title: "Sciences de l'Ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A2_42 ISEN",
            instructors: "Mr TEST",
            learners: "CIR1 Nantes 2024-2025 TP Groupe 4",
            start: "2025-01-10T15:45:00+0100",
            end: "2025-01-10T17:45:00+0100",
            className: "TP",
        },
    ];

    // Fonction pour ajuster la date
    const adjustDate = (dateStr: string, weeks: number) => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + weeks * 7);
        date.setHours(date.getHours() + 1); // On ajoute une heure
        return date.toISOString().replace("Z", "+0100"); // Timezone
    };

    // On ajuste les dates de début et de fin
    const updatedPlanning = planning.map((event) => ({
        ...event,
        start: adjustDate(event.start, weeksFromNow),
        end: adjustDate(event.end, weeksFromNow),
    }));

    return updatedPlanning;
}
