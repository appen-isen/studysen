import { Platform } from "react-native";
import { PlanningEvent } from "@/webAurion/utils/types";
import { getSubjectColor } from "./colors";
import { getRelativeDayLabel } from "./date";
import {
    getNextUpcomingEvent,
    getPlanningEventLabel,
    getTodayEvents,
    truncateString
} from "./planning";
import WidgetDataBridge from "@/modules/widget-data-bridge/src";

// Nombre maximum d'événements du jour transmis au widget (au-delà, l'écran est trop petit)
const MAX_TODAY_EVENTS = 4;
const MAX_TITLE_LENGTH = 40;

// Représentation compacte d'un événement, dénuée de tout ce qui n'est pas
// affiché par les widgets (pas de champs "instructors", "learners", etc.)
export type WidgetPlanningEvent = {
    id: string;
    title: string;
    room: string;
    start: string;
    end: string;
    color: string;
    // "Aujourd'hui" / "Demain" / nom du jour / date, lève l'ambiguïté sur le
    // widget "prochain cours", qui peut afficher un événement d'un autre jour.
    dayLabel: string;
};

// Snapshot envoyé aux widgets natifs (iOS: via App Group, Android: via requestWidgetUpdate)
export type WidgetPlanningSnapshot = {
    generatedAt: string;
    todayEvents: WidgetPlanningEvent[];
    nextEvent: WidgetPlanningEvent | null;
};

export const EMPTY_WIDGET_SNAPSHOT: WidgetPlanningSnapshot = {
    generatedAt: new Date(0).toISOString(),
    todayEvents: [],
    nextEvent: null
};

function toWidgetEvent(event: PlanningEvent): WidgetPlanningEvent {
    return {
        id: event.id,
        title: truncateString(getPlanningEventLabel(event), MAX_TITLE_LENGTH),
        room: event.room || "",
        start: event.start,
        end: event.end,
        color: getSubjectColor(event.subject),
        dayLabel: getRelativeDayLabel(new Date(event.start))
    };
}

// Construit le snapshot à partir du planning complet en cache
export function buildWidgetSnapshot(
    planning: PlanningEvent[]
): WidgetPlanningSnapshot {
    const nextEvent = getNextUpcomingEvent(planning);
    return {
        generatedAt: new Date().toISOString(),
        todayEvents: getTodayEvents(planning)
            .slice(0, MAX_TODAY_EVENTS)
            .map(toWidgetEvent),
        nextEvent: nextEvent ? toWidgetEvent(nextEvent) : null
    };
}

// À appeler après chaque synchronisation réussie du planning
export async function syncPlanningToWidgets(
    planning: PlanningEvent[]
): Promise<void> {
    const snapshot = buildWidgetSnapshot(planning);
    try {
        if (Platform.OS === "ios") {
            WidgetDataBridge.setPlanningSnapshot(JSON.stringify(snapshot));
        } else if (Platform.OS === "android") {
            const { requestAndroidWidgetsUpdate } = await import(
                "@/widgets/android/renderWidgets"
            );
            await requestAndroidWidgetsUpdate(snapshot);
        }
    } catch (error) {
        console.error("Failed to sync planning to widgets:", error);
    }
}

// À appeler à la déconnexion
export async function clearPlanningWidgets(): Promise<void> {
    try {
        if (Platform.OS === "ios") {
            WidgetDataBridge.clearPlanningSnapshot();
        } else if (Platform.OS === "android") {
            const { requestAndroidWidgetsUpdate } = await import(
                "@/widgets/android/renderWidgets"
            );
            await requestAndroidWidgetsUpdate(EMPTY_WIDGET_SNAPSHOT);
        }
    } catch (error) {
        console.error("Failed to clear planning widgets:", error);
    }
}
