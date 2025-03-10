import { PlanningEvent } from "./types";
import { mergePlanning } from "@/utils/planning";

export function generateDemoPlanning(): PlanningEvent[] {
    let planning = [
        {
            id: "15446554",
            title: "Mathématiques S1",
            subject: "Mathématiques",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-06T08:00:00+0100",
            end: "2025-01-06T10:00:00+0100",
            className: "COURS"
        },
        {
            id: "15716705",
            title: "Physique S1",
            subject: "Physique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-06T10:15:00+0100",
            end: "2025-01-06T12:15:00+0100",
            className: "COURS"
        },
        {
            id: "15689457",
            title: "Culture numérique S1",
            subject: "Informatique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-06T13:30:00+0100",
            end: "2025-01-06T15:30:00+0100",
            className: "COURS"
        },
        {
            id: "14676049",
            title: "Sciences de l'ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-06T15:40:00+0100",
            end: "2025-01-06T17:40:00+0100",
            className: "COURS"
        },
        {
            id: "15836659",
            title: "Langage C Expert",
            subject: "Informatique",
            room: "A2_50 ISEN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-07T08:00:00+0100",
            end: "2025-01-07T10:00:00+0100",
            className: "TP"
        },
        {
            id: "15446586",
            title: "Mathématiques S1",
            subject: "Mathématiques",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-07T10:15:00+0100",
            end: "2025-01-07T12:15:00+0100",
            className: "COURS"
        },
        {
            id: "15447135",
            title: "Langage C Expert",
            subject: "Informatique",
            room: "A2_38 ISEN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-07T13:30:00+0100",
            end: "2025-01-07T15:30:00+0100",
            className: "TP"
        },
        {
            id: "15780828",
            title: "Langage C Expert",
            subject: "Informatique",
            room: "A3_34 ISEN_TD M1-02",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-08T08:00:00+0100",
            end: "2025-01-08T10:00:00+0100",
            className: "TP"
        },
        {
            id: "14997890",
            title: "Physique S1",
            subject: "Physique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-08T10:15:00+0100",
            end: "2025-01-08T12:15:00+0100",
            className: "COURS"
        },
        {
            id: "15062563",
            title: "Sciences de l'Ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-08T15:45:00+0100",
            end: "2025-01-08T17:45:00+0100",
            className: "TP"
        },
        {
            id: "15448889",
            title: "Anglais S1",
            subject: "Anglais",
            room: "A2_50 ISEN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-09T08:00:00+0100",
            end: "2025-01-09T10:00:00+0100",
            className: "COURS"
        },
        {
            id: "15448937",
            title: "Formation Humaine et Sociale S1",
            subject: "FHS",
            room: "A2_32 ISEN_CO-DESIGN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-09T10:15:00+0100",
            end: "2025-01-09T12:15:00+0100",
            className: "COURS"
        },
        {
            id: "15348524",
            title: "Education Physique et Sportive S1",
            subject: "Sport",
            room: "",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-09T16:00:00+0100",
            end: "2025-01-09T17:00:00+0100",
            className: "COURS"
        },
        {
            id: "15689502",
            title: "Réunion",
            subject: "Réunion",
            room: "A3_40 ISEN_PROJET/DS",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-10T08:30:00+0100",
            end: "2025-01-10T08:45:00+0100",
            className: "COURS"
        },
        {
            id: "15689502",
            title: "Réunion 2",
            subject: "Réunion 2",
            room: "A3_40 ISEN_PROJET/DS",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-10T09:00:00+0100",
            end: "2025-01-10T09:30:00+0100",
            className: "COURS"
        },
        {
            id: "15446630",
            title: "Mathématiques S1",
            subject: "Mathématiques",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-10T09:45:00+0100",
            end: "2025-01-10T11:45:00+0100",
            className: "COURS"
        },
        {
            id: "15062584",
            title: "Sciences de l'Ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A2_42 ISEN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-10T15:45:00+0100",
            end: "2025-01-10T17:45:00+0100",
            className: "TP"
        },
        {
            id: "15062584",
            title: "Sciences de l'Ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A2_TEST ISEN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-10T15:45:00+0100",
            end: "2025-01-10T17:45:00+0100",
            className: "TP"
        }
    ];
    let newPlanning = [
        {
            id: "15446554",
            title: "Mathématiques S1",
            subject: "Mathématiques N",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-06T08:00:00+0100",
            end: "2025-01-06T10:00:00+0100",
            className: "COURS"
        },
        {
            id: "15716705",
            title: "Physique S1",
            subject: "Physique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-06T10:15:00+0100",
            end: "2025-01-06T12:15:00+0100",
            className: "COURS"
        },
        {
            id: "15689457",
            title: "Culture numérique S1",
            subject: "Informatique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-06T13:30:00+0100",
            end: "2025-01-06T15:30:00+0100",
            className: "COURS"
        },
        {
            id: "14676049",
            title: "Sciences de l'ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-06T15:40:00+0100",
            end: "2025-01-06T17:40:00+0100",
            className: "COURS"
        },
        {
            id: "15836659",
            title: "Langage C Expert",
            subject: "Informatique N",
            room: "A2_50 ISEN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-07T08:00:00+0100",
            end: "2025-01-07T10:00:00+0100",
            className: "TP"
        },
        {
            id: "15446586",
            title: "Mathématiques S1",
            subject: "Mathématiques",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-07T10:15:00+0100",
            end: "2025-01-07T12:15:00+0100",
            className: "COURS"
        },
        {
            id: "15447135",
            title: "Langage C Expert",
            subject: "Informatique",
            room: "A2_38 ISEN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-07T13:30:00+0100",
            end: "2025-01-07T15:30:00+0100",
            className: "TP"
        },
        {
            id: "15780828",
            title: "Langage C Expert",
            subject: "Informatique",
            room: "A3_34 ISEN_TD M1-02",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-08T08:00:00+0100",
            end: "2025-01-08T10:00:00+0100",
            className: "TP"
        },
        {
            id: "14997890",
            title: "Physique S1",
            subject: "Physique",
            room: "A2_40 ISEN_ TD C3-01",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-08T10:15:00+0100",
            end: "2025-01-08T12:15:00+0100",
            className: "COURS"
        },
        {
            id: "15062563",
            title: "Sciences de l'Ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-08T15:45:00+0100",
            end: "2025-01-08T17:45:00+0100",
            className: "TP"
        },
        {
            id: "15448889",
            title: "Anglais S1",
            subject: "Anglais",
            room: "A2_50 ISEN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-09T08:00:00+0100",
            end: "2025-01-09T10:00:00+0100",
            className: "COURS"
        },
        {
            id: "15448937",
            title: "Formation Humaine et Sociale S1",
            subject: "FHS",
            room: "A2_32 ISEN_CO-DESIGN",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-09T10:15:00+0100",
            end: "2025-01-09T12:15:00+0100",
            className: "COURS"
        },
        {
            id: "15348524",
            title: "Education Physique et Sportive S1",
            subject: "Sport  N",
            room: "",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-09T16:00:00+0100",
            end: "2025-01-09T17:00:00+0100",
            className: "COURS"
        },
        {
            id: "15689502",
            title: "Réunion",
            subject: "Réunion",
            room: "A3_40 ISEN_PROJET/DS",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-10T08:30:00+0100",
            end: "2025-01-10T08:45:00+0100",
            className: "COURS"
        },
        {
            id: "15689502",
            title: "Réunion 2",
            subject: "Réunion 2",
            room: "A3_40 ISEN_PROJET/DS",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-10T09:00:00+0100",
            end: "2025-01-10T09:30:00+0100",
            className: "COURS"
        },
        {
            id: "15446630",
            title: "Mathématiques S1",
            subject: "Mathématiques",
            room: "A0_48 ISEN_EVENEMENTIELLE",
            instructors: "Mr TEST",
            description: "",
            start: "2025-01-10T09:45:00+0100",
            end: "2025-01-10T11:45:00+0100",
            className: "COURS"
        },
        {
            id: "15062584",
            title: "Sciences de l'Ingénieur S1",
            subject: "Sciences de l'Ingénieur",
            room: "A2_42 ISEN",
            instructors: "Mr TEST",
            start: "2025-01-10T15:45:00+0100",
            end: "2025-01-10T17:45:00+0100",
            className: "TP",
            description: ""
        }
    ];

    // Fonction pour ajuster la date
    const adjustDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();

        // Création d'une nouvelle date en conservant le jour de la semaine mais avec l'année, le mois et le jour actuels
        const adjustedDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + (date.getDay() - now.getDay())
        );

        // Copie des heures et minutes de la date originale
        adjustedDate.setHours(date.getHours() + 1, date.getMinutes());
        return adjustedDate.toISOString().replace("Z", "+0100");
    };

    const adjustedPlanning = planning.map((event) => ({
        ...event,
        start: adjustDate(event.start),
        end: adjustDate(event.end)
    }));
    const newAdjustedPlanning = newPlanning.map((event) => ({
        ...event,
        start: adjustDate(event.start),
        end: adjustDate(event.end)
    }));

    return mergePlanning(adjustedPlanning, newAdjustedPlanning);
}
