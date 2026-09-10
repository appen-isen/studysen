import * as React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { formatDateToLocalTime } from "@/utils/date";
import { WidgetPlanningSnapshot } from "@/utils/widgetSync";
import { getWidgetColors, WidgetTheme } from "./theme";

// Nom déclaré dans app.json (plugin react-native-android-widget), sert de
// référence entre le widget Android et le code JS (requestWidgetUpdate, task handler)
export const DAY_WIDGET_NAME = "PlanningDayWidget";

// Widget carré "cours du jour" : liste compacte des événements du jour
export function PlanningDayWidget({
    snapshot,
    theme
}: {
    snapshot: WidgetPlanningSnapshot;
    theme: WidgetTheme;
}) {
    const events = snapshot.todayEvents;
    const colors = getWidgetColors(theme);

    return (
        <FlexWidget
            clickAction="OPEN_APP"
            style={{
                height: "match_parent",
                width: "match_parent",
                backgroundColor: colors.background as `#${string}`,
                borderRadius: 16,
                padding: 12,
                flexDirection: "column",
                overflow: "hidden"
            }}
        >
            <TextWidget
                text="Aujourd'hui"
                style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: colors.textPrimary as `#${string}`,
                    marginBottom: 8
                }}
            />
            {events.length === 0 ? (
                <TextWidget
                    text="Aucun cours aujourd'hui"
                    style={{
                        fontSize: 13,
                        color: colors.textSecondary as `#${string}`
                    }}
                />
            ) : (
                <FlexWidget
                    style={{
                        flexDirection: "column",
                        width: "match_parent",
                        flexGap: 6
                    }}
                >
                    {events.map((event) => (
                        <FlexWidget
                            key={event.id}
                            style={{
                                flexDirection: "row",
                                width: "match_parent",
                                alignItems: "center"
                            }}
                        >
                            <FlexWidget
                                style={{
                                    width: 4,
                                    height: 28,
                                    backgroundColor:
                                        event.color as `#${string}`,
                                    borderRadius: 2,
                                    marginRight: 8
                                }}
                            />
                            <FlexWidget
                                style={{
                                    flexDirection: "column",
                                    width: "match_parent"
                                }}
                            >
                                <TextWidget
                                    text={event.title}
                                    truncate="END"
                                    maxLines={1}
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "600",
                                        color: colors.textPrimary as `#${string}`
                                    }}
                                />
                                <TextWidget
                                    text={`${formatDateToLocalTime(event.start)} - ${formatDateToLocalTime(event.end)}${event.room ? " · " + event.room : ""}`}
                                    truncate="END"
                                    maxLines={1}
                                    style={{
                                        fontSize: 11,
                                        color: colors.textSecondary as `#${string}`
                                    }}
                                />
                            </FlexWidget>
                        </FlexWidget>
                    ))}
                </FlexWidget>
            )}
        </FlexWidget>
    );
}
