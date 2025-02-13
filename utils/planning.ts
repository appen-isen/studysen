import Colors from "@/constants/Colors";
import { PlanningEvent } from "@/webAurion/utils/types";
import { getCloserMonday } from "./date";

export type DayEvents = {
    [date: string]: PlanningEvent[];
};

// Fonction pour grouper les événements par jour
export function groupEventsByDay(events: PlanningEvent[]): DayEvents {
    return events.reduce<DayEvents>((grouped, event) => {
        // S'il s'agit d'un événement de type "CONGES", on le décompose pour qu'il soit sur plusieurs jours
        if (event.className === "CONGES") {
            // Calculer les jours entre event.start et event.end
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            //On génère les dates entre startDate et endDate
            for (
                let currentDate = new Date(startDate);
                currentDate <= endDate;
                currentDate.setDate(currentDate.getDate() + 1)
            ) {
                const dateKey = currentDate.toISOString().split("T")[0];

                // Initialiser le tableau pour cette date si nécessaire
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }

                // Ajouter une copie de l'événement pour ce jour
                grouped[dateKey].push({
                    ...event,
                    start: new Date(currentDate).toISOString(),
                    end: new Date(endDate).toISOString(),
                });
            }
        } else {
            // Gestion des événements normaux
            const dateKey = new Date(event.start).toISOString().split("T")[0];

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }

            grouped[dateKey].push(event);
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
                instructors: event.instructors.split("/")[0], // On remplace par le premier enseignant
            };
        })
    );
}

// Fonction pour créer un événement "blank" pour combler les trous dans l'emploi du temps
export function fillDayWithBlankEvents(dayEvents: DayEvents): DayEvents {
    const result: DayEvents = {};

    Object.entries(dayEvents).forEach(([date, events]) => {
        // Début et fin de la journée avec le bon décalage
        const startOfDay = new Date(`${date}T08:00:00+0100`);
        const endOfDay = new Date(`${date}T19:00:00+0100`);

        // Trier les événements existants par heure de début
        const sortedEvents = events.sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );

        const filledEvents: PlanningEvent[] = [];
        let lastEnd = startOfDay;

        sortedEvents.forEach((event) => {
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);

            if (lastEnd < eventStart) {
                // Ajouter un événement "blank" pour combler le trou
                filledEvents.push(createBlankEvent(lastEnd, eventStart));
            }
            filledEvents.push(event); // Ajouter l'événement actuel
            lastEnd = eventEnd; // Mettre à jour la dernière heure de fin
        });

        // Ajouter un événement "blank" à la fin de la journée si nécessaire
        if (lastEnd < endOfDay) {
            filledEvents.push(createBlankEvent(lastEnd, endOfDay));
        }

        result[date] = filledEvents;
    });

    return result;
}
//Permet de créer un événement vide pour combler un trou dans l'emploi du temps
export function createBlankEvent(start: Date, end: Date): PlanningEvent {
    // Convertir les dates en ISO strings avec décalage horaire conservé
    const formatDate = (date: Date): string =>
        date.toISOString().replace(/Z$/, "+0100");

    return {
        id: "blank",
        title: "",
        subject: "",
        room: "",
        instructors: "",
        learners: "",
        start: formatDate(start),
        end: formatDate(end),
        className: "",
    };
}

// Fonction pour obtenir la couleur d'un événement en fonction de la matière
export function getSubjectColor(subject: string): string {
    let color = "";
    switch (subject) {
        case "Anglais":
            color = "#ffed13";
            break;
        case "Mathématiques":
            color = "#2099ff";
            break;
        case "Informatique":
            color = "#13ff28";
            break;
        case "Physique":
            color = "#ff8d13";
            break;
        case "FHS":
            color = "#ff13fb";
            break;
        case "Sport":
            color = "#795204";
            break;
        case "Sciences de l'Ingénieur":
            color = "#4654ff";
            break;
        default:
            color = Colors.primary;
    }
    return Colors.hexWithOpacity(color, 0.5);
}

// Fonction pour retrouver un événement dans le planning
export function findEvent(planning: PlanningEvent[], event: PlanningEvent) {
    return planning.find(
        (e) =>
            e.id === event.id && e.start === event.start && e.end === event.end
    );
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
    // Si newPlanning est vide, retourner le planning actuel
    if (newPlanning.length === 0) return currentPlanning;

    //On trie le tableau par dates de début
    const sortedPlanning = sortPlanningByDate(newPlanning);
    const weekStart = getCloserMonday(new Date(sortedPlanning[0].start));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4); // Vendredi de la même semaine
    weekEnd.setHours(23, 59, 59); // Fin de la journée

    // Filtrer le planning actuel pour garder uniquement les événements hors de la semaine concernée
    const filteredCurrentPlanning = currentPlanning.filter((event) => {
        const eventDateStart = new Date(event.start);
        return eventDateStart < weekStart || eventDateStart > weekEnd;
    });

    // Combiner les événements filtrés avec le nouveau planning
    return sortPlanningByDate([...newPlanning, ...filteredCurrentPlanning]);
}

// Fonction pour tronquer les des chaînes de caractères trop longues
export function truncateString(str: string, maxLength: number): string {
    return str.length > maxLength ? str.slice(0, maxLength) + "-" : str;
}

// Fonction pour trier les événements par date de début
export function sortPlanningByDate(planning: PlanningEvent[]): PlanningEvent[] {
    return planning.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
}
