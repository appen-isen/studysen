import * as React from "react";
import { requestWidgetUpdate } from "react-native-android-widget";
import { WidgetPlanningSnapshot } from "@/utils/widgetSync";
import { DAY_WIDGET_NAME, PlanningDayWidget } from "./PlanningDayWidget";
import {
    NEXT_COURSE_WIDGET_NAME,
    PlanningNextCourseWidget
} from "./PlanningNextCourseWidget";

// Demande le re-rendu des deux widgets Android à partir d'un snapshot déjà
// calculé. `widgetNotFound` est un no-op volontaire : ne pas ajouter le
// widget sur l'écran d'accueil est un cas normal, pas une erreur.
//
// On fournit systématiquement les deux arbres light/dark : react-native-android-widget
// ne suit pas le thème système tout seul, contrairement à WidgetKit sur iOS.
export async function requestAndroidWidgetsUpdate(
    snapshot: WidgetPlanningSnapshot
): Promise<void> {
    await Promise.all([
        requestWidgetUpdate({
            widgetName: DAY_WIDGET_NAME,
            renderWidget: () => ({
                light: <PlanningDayWidget snapshot={snapshot} theme="light" />,
                dark: <PlanningDayWidget snapshot={snapshot} theme="dark" />
            })
        }),
        requestWidgetUpdate({
            widgetName: NEXT_COURSE_WIDGET_NAME,
            renderWidget: () => ({
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
            })
        })
    ]);
}
