import { PlanningEvent } from "@/webAurion/utils/types";

export type DayEvents = {
    [date: string]: PlanningEvent[];
};

// Fonction pour grouper les événements par jour
export function groupEventsByDay(events: PlanningEvent[]): DayEvents {
    return events.reduce<DayEvents>((grouped, event) => {
        // On récupère la date de début de l'événement
        const date = new Date(event.start).toISOString().split("T")[0];
        // On crée un tableau pour chaque date
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(event);

        return grouped;
    }, {});
}

// Fonction qui remplace les champs de l'emploi du temps pour le mode liste
export function updatePlanningForListMode(
    planning: PlanningEvent[]
): PlanningEvent[] {
    return planning.map((event) => {
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
    });
}
