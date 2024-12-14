import Colors from "@/constants/Colors";
import { PlanningEvent } from "@/webAurion/utils/types";

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
            color = Colors.primaryColor;
    }
    return Colors.hexWithOpacity(color, 0.5);
}
