import * as React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { formatDateToLocalTime } from "@/utils/date";
import { WidgetPlanningSnapshot } from "@/utils/widgetSync";
import { getWidgetColors, WidgetTheme } from "./theme";

// Nom déclaré dans app.json (plugin react-native-android-widget)
export const NEXT_COURSE_WIDGET_NAME = "PlanningNextCourseWidget";

const DEFAULT_ACCENT = "#FA4747";

// Widget bandeau étroit (2x1) : prochain cours (ou cours en cours) uniquement.
// Sert de pendant Android au widget écran verrouillé iOS.
export function PlanningNextCourseWidget({
    snapshot,
    theme
}: {
    snapshot: WidgetPlanningSnapshot;
    theme: WidgetTheme;
}) {
    const event = snapshot.nextEvent;
    const colors = getWidgetColors(theme);

    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: "match_parent",
                width: "match_parent",
                backgroundColor: colors.background as `#${string}`,
                borderRadius: 16,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                overflow: "hidden"
            }}
        >
            <FlexWidget
                style={{
                    width: 4,
                    height: "match_parent",
                    backgroundColor: (event?.color ??
                        DEFAULT_ACCENT) as `#${string}`,
                    borderRadius: 2,
                    marginRight: 10
                }}
            />
            {event ? (
                <FlexWidget
                    style={{ flexDirection: "column", width: "match_parent" }}
                >
                    <TextWidget
                        text={event.title}
                        truncate="END"
                        maxLines={1}
                        style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: colors.textPrimary as `#${string}`
                        }}
                    />
                    <TextWidget
                        text={`${event.dayLabel} · ${formatDateToLocalTime(event.start)} - ${formatDateToLocalTime(event.end)}${event.room ? " · " + event.room : ""}`}
                        truncate="END"
                        maxLines={1}
                        style={{
                            fontSize: 12,
                            color: colors.textSecondary as `#${string}`
                        }}
                    />
                </FlexWidget>
            ) : (
                <TextWidget
                    text="Aucun cours à venir"
                    style={{
                        fontSize: 13,
                        color: colors.textSecondary as `#${string}`
                    }}
                />
            )}
        </FlexWidget>
    );
}
