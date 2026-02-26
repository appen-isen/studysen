import { load } from "cheerio";
import { PlanningEvent } from "./types";

// Conversion du calendrier au format JSON
export function getJSONSchedule(xml: string): any[] {
    const parser = load(xml, {
        xmlMode: true
    });

    const updates = parser("update");
    for (const update of updates.toArray()) {
        const content = parser(update).text().trim();

        if (!content) {
            continue;
        }

        const looksLikeJson =
            (content.startsWith("{") && content.endsWith("}")) ||
            (content.startsWith("[") && content.endsWith("]"));

        if (!looksLikeJson) {
            continue;
        }

        try {
            const parsed = JSON.parse(content);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (Array.isArray(parsed?.events)) {
                return parsed.events;
            }
        } catch {
            // Continue: une autre balise <update> peut contenir le vrai JSON
        }
    }

    // Certains retours du backend ne contiennent aucun événement (ex: "<br />")
    return [];
}

// On convertit la réponse du serveur XML en cours du planning
export function planningResponseToEvents(response: string): PlanningEvent[] {
    const json = getJSONSchedule(response);

    return json.map((event: any) => {
        // On récupère les informations des cours
        const eventInfo = event.title.split(" - ");

        let room = eventInfo[1].trim();
        // Pour les matières qui ne sont pas bien formatées par défaut...
        let subject = "";
        let title = "";
        if (eventInfo.length >= 9) {
            subject = eventInfo[eventInfo.length - 6].trim();
            title = eventInfo[eventInfo.length - 4].trim();
        } else {
            subject = eventInfo[eventInfo.length - 4].trim();
            title = eventInfo[eventInfo.length - 3].trim();
        }
        //On force la majuscule pour la première lettre du titre

        if (title) {
            title = title.charAt(0).toUpperCase() + title.slice(1);
        }

        let instructors = eventInfo[eventInfo.length - 2].trim();
        let learners = eventInfo[eventInfo.length - 1].trim();

        return {
            id: event.id,
            title,
            subject,
            room,
            instructors,
            learners,
            start: event.start,
            end: event.end,
            className: event.className
        };
    });
}

// On récupère les dates de début et de fin de l'emploi du temps (par défaut, la semaine actuelle: 0)
export function getScheduleDates(weeksFromNow: number = 0): {
    startTimestamp: number;
    endTimestamp: number;
} {
    const now = new Date();
    // Obtenir le jour actuel (0 = dimanche, 1 = lundi, ..., 6 = samedi)
    let day = now.getDay();
    // Ajustement si aujourd'hui est samedi
    if (day === 6) {
        // Passer au lundi suivant
        now.setDate(now.getDate() + 2);
        day = now.getDay(); // Recalculer le jour après avoir avancé
    }
    // Calculer la différence pour atteindre lundi
    const daysToMonday = day === 0 ? 1 : 1 - day;
    // Créer la date de début (lundi 6h00)
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + daysToMonday + weeksFromNow * 7); // Passer au lundi de la semaine correspondante
    startDate.setHours(6, 0, 0, 0); // Fixer à 6h00
    // Date de fin (dimanche de la même semaine, 6 jours après le début)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Ajouter 6 jours
    // Convertir les dates en timestamp
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    return { startTimestamp, endTimestamp };
}
