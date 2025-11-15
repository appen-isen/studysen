import { PlanningEvent } from "@/webAurion/utils/types";
import { getCloserMonday } from "./date";

export type DayEvents = {
    [date: string]: PlanningEvent[];
};

// Fonction pour grouper les événements par jour
export function groupEventsByDay(events: PlanningEvent[]): DayEvents {
    // Définition de la fenêtre d'affichage quotidienne (07:00 -> 19:00)
    const DAY_START_HOUR = 7;
    const DAY_END_HOUR = 19;

    const atHour = (dateKey: string, hour: number): Date =>
        new Date(`${dateKey}T${hour.toString().padStart(2, "0")}:00:00+0100`);
    const startOfDay = (dateKey: string): Date => atHour(dateKey, 0);
    const endOfDayExclusive = (dateKey: string): Date => {
        const d = startOfDay(dateKey);
        d.setDate(d.getDate() + 1);
        return d;
    };

    return events.reduce<DayEvents>((grouped, event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);

        // Fonction utilitaire: ajoute une tranche quotidienne bornée aux heures visibles
        const addSlice = (
            dateKey: string,
            sliceStart: Date,
            sliceEnd: Date
        ) => {
            // Borne aux heures d'affichage (important pour la vue semaine)
            const visibleStart = new Date(
                Math.max(
                    sliceStart.getTime(),
                    atHour(dateKey, DAY_START_HOUR).getTime()
                )
            );
            const visibleEnd = new Date(
                Math.min(
                    sliceEnd.getTime(),
                    atHour(dateKey, DAY_END_HOUR).getTime()
                )
            );

            // Si la tranche est hors de la fenêtre d'affichage, on ignore
            if (visibleStart >= visibleEnd) return;

            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push({
                ...event,
                start: visibleStart.toISOString(),
                end: visibleEnd.toISOString()
            });
        };

        // Parcours des jours couverts par l'événement et découpe en tranches quotidiennes
        const startDateKey = start.toISOString().split("T")[0];
        const endDateKey = end.toISOString().split("T")[0];

        if (startDateKey === endDateKey) {
            // Événement sur une seule journée
            addSlice(startDateKey, start, end);
        } else {
            // Première journée: de start -> fin de journée (exclusif)
            addSlice(startDateKey, start, endOfDayExclusive(startDateKey));

            // Jours intermédiaires
            let cursor = new Date(startDateKey);
            cursor.setDate(cursor.getDate() + 1);
            while (cursor.toISOString().split("T")[0] < endDateKey) {
                const dateKey = cursor.toISOString().split("T")[0];
                addSlice(
                    dateKey,
                    startOfDay(dateKey),
                    endOfDayExclusive(dateKey)
                );
                cursor.setDate(cursor.getDate() + 1);
            }

            // Dernière journée: début de journée -> end
            addSlice(endDateKey, startOfDay(endDateKey), end);
        }

        return grouped;
    }, {});
}

// Fonction qui remplace les champs de l'emploi du temps pour le mode liste
export function updatePlanningForListMode(
    planning: PlanningEvent[]
): PlanningEvent[] {
    return sortPlanningByDate(
        planning.map((event) => {
            // Gestion des salles
            let room = event.room;
            if (event.room) {
                if (event.room.startsWith("Salle")) {
                    // On garde le numéro de salle
                    room = event.room.split(" ").slice(1).join(" ");
                } else {
                    // On garde le premier terme
                    room = event.room.split(" ")[0];
                }
            } else {
                // On remplace les salles vides par "?"
                room = "?";
            }
            return {
                ...event, // On garde tous les autres champs
                room: room,
                instructors: event.instructors.split("/")[0] // On remplace par le premier enseignant
            };
        })
    );
}

// Fonction pour retrouver un événement dans le planning
export function findEvent(planning: PlanningEvent[], event: PlanningEvent) {
    // Avec la découpe multi-jours, start/end des tranches diffèrent de l'original
    // On matche donc uniquement par id, supposé unique pour un événement.
    return planning.find((e) => e.id === event.id);
}

// Fonction pour obtenir l'événement en cours si disponible
export function getCurrentEvent(events: PlanningEvent[]): PlanningEvent | null {
    const now = new Date();

    for (const event of events) {
        const start = new Date(event.start);
        const end = new Date(event.end);
        // Vérifier si l'événement est en cours
        if (now >= start && now <= end) {
            return event;
        }
    }

    return null;
}

// Fonction pour obtenir le prochain événement de la journée
export function getNextEventToday(
    events: PlanningEvent[]
): PlanningEvent | null {
    const now = new Date();

    // Filtre les événements qui commencent après maintenant et qui sont aujourd'hui
    const upcomingEvents = events.filter((event) => {
        const start = new Date(event.start);
        return start > now && start.toDateString() === now.toDateString();
    });

    // Trie les événements par date de début (croissant)
    upcomingEvents.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    // Retourne le premier événement du tableau trié, ou null s'il n'y en a pas
    return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
}

export function mergePlanning(
    currentPlanning: PlanningEvent[],
    newPlanning: PlanningEvent[]
): PlanningEvent[] {
    if (newPlanning.length === 0) return currentPlanning;

    const sortedPlanning = sortPlanningByDate(newPlanning);
    const weekStart = getCloserMonday(new Date(sortedPlanning[0].start));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);
    weekEnd.setHours(23, 59, 59);

    // Filtrer les événements existants pour exclure ceux qui sont mis à jour
    const filteredCurrentPlanning = currentPlanning.filter((event) => {
        const eventDateStart = new Date(event.start);
        return eventDateStart < weekStart || eventDateStart > weekEnd;
    });

    // Fusionner les événements sans doublons (en remplaçant ceux mis à jour)
    const mergedPlanning = new Map();
    [...filteredCurrentPlanning, ...newPlanning].forEach((event) => {
        mergedPlanning.set(event.id, event);
    });

    return sortPlanningByDate(Array.from(mergedPlanning.values()));
}

// Fonction pour tronquer les des chaînes de caractères trop longues
export function truncateString(str: string, maxLength: number): string {
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}

// Fonction pour trier les événements par date de début
export function sortPlanningByDate(planning: PlanningEvent[]): PlanningEvent[] {
    return planning.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
}
