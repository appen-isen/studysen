import ICAL from "ical.js";
import { PlanningEvent } from "../utils/types";
import Session from "./Session";
import { getScheduleDates } from "../utils/PlanningUtils";
import useSettingsStore from "../../stores/settingsStore";
import { generateDemoPlanning } from "@/webAurion/utils/demo";

class PlanningApi {
    private session: Session;
    private readonly BASE_URL = "https://web.isen-ouest.fr/ICS/";

    constructor(session: Session) {
        this.session = session;
    }

    private getIcsUrl(): string {
        const { settings } = useSettingsStore.getState();
        return `${this.BASE_URL}${settings.userISENId}.ics`;
    }

    private async fetchICS(): Promise<string> {
        const url = this.getIcsUrl();
        const response = await fetch(url);
        if (!response.ok) {
            console.log(response);
            throw new Error(`Failed to fetch ICS: ${response.statusText}`);
        }
        return response.text();
    }

    private convertICSEventToPlanningEvent(vevent: ICAL.Event): PlanningEvent {
        const { settings } = useSettingsStore.getState();
        const description = vevent.description || "";
        const descriptionLines = description.split("\n");

        const subject =
            descriptionLines
                .find((line) => line.includes("Matière"))
                ?.split(":")[1]
                ?.trim() || "";
        const instructorsLine =
            descriptionLines
                .find((line) => line.includes("Intervenant"))
                ?.split(":")[1]
                ?.trim() || "";

        const descriptionClass =
            descriptionLines
                .find((line) => line.includes("Description"))
                ?.split(":")[1]
                ?.trim() || "";

        const NomClasse = `${settings.className} ${settings.year}`;

        return {
            id: vevent.uid || "",
            start: vevent.startDate.toJSDate().toISOString(),
            end: vevent.endDate.toJSDate().toISOString(),
            title: vevent.summary || "",
            subject: subject,
            room: (vevent.location || "").split("\n")[0],
            instructors: instructorsLine,
            description: descriptionClass,
            className: NomClasse
        };
    }

    public async fetchPlanning(
        weeksFromNow?: number
    ): Promise<PlanningEvent[]> {
        if (this.session.isDemo()) {
            return generateDemoPlanning();
        }

        try {
            const icsData = await this.fetchICS();
            const jcalData = ICAL.parse(icsData);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents("vevent");

            const events = vevents.map((vevent) => {
                const icalEvent = new ICAL.Event(vevent);
                return this.convertICSEventToPlanningEvent(icalEvent);
            });

            if (weeksFromNow !== undefined) {
                const { startTimestamp, endTimestamp } =
                    getScheduleDates(weeksFromNow);
                return events.filter((event) => {
                    const eventDate = new Date(event.start).getTime();
                    return (
                        eventDate >= startTimestamp && eventDate <= endTimestamp
                    );
                });
            }

            return events;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to fetch planning: ${error}`);
        }
    }
}

export default PlanningApi;
