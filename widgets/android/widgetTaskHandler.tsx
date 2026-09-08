import * as React from "react";
import { WidgetTaskHandlerProps } from "react-native-android-widget";
import { loadStateFromStorage } from "@/stores/storage";
import { buildWidgetSnapshot, EMPTY_WIDGET_SNAPSHOT } from "@/utils/widgetSync";
import { PlanningEvent } from "@/webAurion/utils/types";
import { DAY_WIDGET_NAME, PlanningDayWidget } from "./PlanningDayWidget";
import {
    NEXT_COURSE_WIDGET_NAME,
    PlanningNextCourseWidget
} from "./PlanningNextCourseWidget";

// Gère les widgets Android en tâche de fond JS headless (ajout, resize, refresh
// périodique). Le planning n'est pas relu depuis Zustand mais directement depuis
// AsyncStorage
export async function widgetTaskHandler(
    props: WidgetTaskHandlerProps
): Promise<void> {
    const { widgetInfo, widgetAction, renderWidget } = props;

    if (widgetAction === "WIDGET_DELETED") return;

    const planning: PlanningEvent[] =
        (await loadStateFromStorage("planning")) ?? [];
    const snapshot =
        planning.length > 0
            ? buildWidgetSnapshot(planning)
            : EMPTY_WIDGET_SNAPSHOT;

    switch (widgetInfo.widgetName) {
        case DAY_WIDGET_NAME:
            renderWidget({
                light: <PlanningDayWidget snapshot={snapshot} theme="light" />,
                dark: <PlanningDayWidget snapshot={snapshot} theme="dark" />
            });
            break;
        case NEXT_COURSE_WIDGET_NAME:
            renderWidget({
                light: (
                    <PlanningNextCourseWidget
                        snapshot={snapshot}
                        theme="light"
                    />
                ),
                dark: (
                    <PlanningNextCourseWidget
                        snapshot={snapshot}
                        theme="dark"
                    />
                )
            });
            break;
    }
}
