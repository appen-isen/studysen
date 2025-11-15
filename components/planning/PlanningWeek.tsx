import { PlanningEvent } from "@/webAurion/utils/types";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Text } from "../Texts";
import Colors from "@/constants/Colors";
import { groupEventsByDay, updatePlanningForListMode } from "@/utils/planning";
import { formatDateToLocalTime, getWorkdayFromOffset } from "@/utils/date";
import { AnimatedPressable } from "../Buttons";
import { getSubjectColor } from "@/utils/colors";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { useMemo, useState } from "react";

// Fenêtre horaire visible (8h -> 19h)
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
// Hauteur minimale pour conserver un événement cliquable
const MIN_EVENT_HEIGHT = 28;
// Espacement horizontal entre deux événements superposés
const COLUMN_GAP = 8;
const HOUR_IN_MS = 1000 * 60 * 60;

type EventLayout = {
    top: number;
    height: number;
    left: number;
    width: number;
    durationInHours: number;
};

type PositionedEvent = {
    event: PlanningEvent;
    layout: EventLayout;
};

type EventMeta = {
    event: PlanningEvent;
    start: number;
    end: number;
    column: number;
};

function getHourFractionFromTimestamp(timestamp: number) {
    const date = new Date(timestamp);
    return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

function positionDayEvents(
    events: PlanningEvent[] = [],
    pixelPerHour: number,
    columnWidth: number
): PositionedEvent[] {
    if (!pixelPerHour || !columnWidth) return [];

    const sortedEvents = [...events]
        .filter((event) => event.id !== "blank")
        .sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );

    if (!sortedEvents.length) return [];

    const positioned: PositionedEvent[] = [];
    let active: EventMeta[] = [];
    let currentGroup: EventMeta[] = [];

    // Lorsque tous les événements concurrents sont terminés, on distribue la largeur disponible
    const flushGroup = () => {
        if (!currentGroup.length) return;

        const maxColumn = currentGroup.reduce(
            (acc, meta) => Math.max(acc, meta.column),
            0
        );
        const columns = maxColumn + 1;
        const availableWidth = Math.max(columnWidth - 2, 0);
        const columnGap = columns > 1 ? COLUMN_GAP : 0;
        const widthPx =
            columns > 0
                ? (availableWidth - columnGap * (columns - 1)) / columns
                : availableWidth;
        const totalHeight = HOURS.length * pixelPerHour;

        currentGroup.forEach((meta) => {
            const durationInHours = Math.max(
                (meta.end - meta.start) / HOUR_IN_MS,
                0
            );
            const rawHeight = Math.max(
                durationInHours * pixelPerHour,
                MIN_EVENT_HEIGHT
            );
            const startHour = getHourFractionFromTimestamp(meta.start);
            const offsetInHours = Math.max(0, startHour - HOURS[0]);
            const top = offsetInHours * pixelPerHour;
            const height = Math.min(rawHeight, Math.max(totalHeight - top, 0));
            const leftValue = meta.column * (widthPx + columnGap);

            positioned.push({
                event: meta.event,
                layout: {
                    top,
                    height,
                    left: leftValue,
                    width: Math.max(widthPx, 0),
                    durationInHours
                }
            });
        });

        currentGroup = [];
    };

    sortedEvents.forEach((event) => {
        const start = new Date(event.start).getTime();
        const end = new Date(event.end).getTime();

        // On retire les événements dont la plage horaire est passée
        active = active.filter((meta) => meta.end > start);

        if (!active.length && currentGroup.length) {
            flushGroup();
        }

        const usedColumns = active.map((meta) => meta.column);
        let column = 0;
        while (usedColumns.includes(column)) {
            column += 1;
        }

        const meta: EventMeta = { event, start, end, column };
        currentGroup.push(meta);
        active.push(meta);
    });

    flushGroup();

    return positioned;
}

export default function PlanningWeek(props: {
    events: PlanningEvent[];
    startDate: Date;
    setSelectedEvent: (event: PlanningEvent) => void;
}) {
    // Regroupement par jour uniquement quand la liste change
    const planning = useMemo(
        () => groupEventsByDay(updatePlanningForListMode(props.events)),
        [props.events]
    );

    // Mesure du conteneur pour convertir les heures en pixels
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const PIXEL_PER_HOUR = containerSize.height / HOURS.length;
    const DAY_COLUMN_WIDTH = containerSize.width / 5;

    function handleLayout(e: LayoutChangeEvent) {
        const { height, width } = e.nativeEvent.layout;
        setContainerSize((prev) => {
            const nextHeight = height > 0 ? height : prev.height;
            const nextWidth = width > 0 ? width : prev.width;
            if (
                Math.abs(prev.height - nextHeight) < 1 &&
                Math.abs(prev.width - nextWidth) < 1
            ) {
                return prev;
            }
            return { height: nextHeight, width: nextWidth };
        });
    }

    return (
        <View style={calendarStyles.container} onLayout={handleLayout}>
            <View style={calendarStyles.hoursBox}>
                {HOURS.map((hour) => (
                    <Text
                        key={hour}
                        style={[
                            calendarStyles.hourLabel,
                            { height: PIXEL_PER_HOUR }
                        ]}
                    >
                        {hour < 10 ? `0${hour}` : hour}
                    </Text>
                ))}
            </View>
            {/* For each days of the week */}
            {[0, 1, 2, 3, 4].map((offset, dayIndex) => (
                <View style={calendarStyles.dayColumn} key={dayIndex}>
                    {PIXEL_PER_HOUR > 0 &&
                        DAY_COLUMN_WIDTH > 0 &&
                        positionDayEvents(
                            planning[
                                getWorkdayFromOffset(props.startDate, offset)
                            ],
                            PIXEL_PER_HOUR,
                            DAY_COLUMN_WIDTH
                        ).map(({ event, layout }) => (
                            // For each events of the day
                            <WeekEvent
                                key={`${event.id}-${event.start}`}
                                event={event}
                                layout={layout}
                                onPress={props.setSelectedEvent}
                            />
                        ))}
                </View>
            ))}
        </View>
    );
}

export function WeekEvent(props: {
    event: PlanningEvent;
    onPress: (event: PlanningEvent) => void;
    layout: EventLayout;
}) {
    const startHour = formatDateToLocalTime(props.event.start);
    const endHour = formatDateToLocalTime(props.event.end);

    const durationInHours = props.layout.durationInHours;
    const isVeryShort = durationInHours <= 0.5;

    // Si l'événement est vide alors on affiche une case vide
    if (props.event.id === "blank") {
        return (
            <View
                style={[
                    eventStyles.blankEvent,
                    { height: props.layout.height }
                ]}
            />
        );
    }

    return (
        <AnimatedPressable
            style={[
                eventStyles.container,
                {
                    height: props.layout.height,
                    top: props.layout.top,
                    left: props.layout.left,
                    width: props.layout.width,
                    // On utilise la position verticale comme z-index pour éviter les recouvrements visuels
                    zIndex: Math.round(props.layout.top)
                }
            ]}
            onPress={() => props.onPress && props.onPress(props.event)}
            scale={0.9}
        >
            <View
                style={[
                    eventStyles.content,
                    // Mode compact: seulement le texte pour les très courts événements
                    isVeryShort && {
                        paddingVertical: 0,
                        gap: 0,
                        justifyContent: "center"
                    }
                ]}
            >
                {!isVeryShort && (
                    // Bandeau de couleur de la matière
                    <View
                        style={[
                            eventStyles.colorBar,
                            {
                                backgroundColor: getSubjectColor(
                                    props.event.subject
                                )
                            }
                        ]}
                    />
                )}
                <Text
                    style={[
                        eventStyles.subject,
                        isVeryShort && { fontSize: 9, paddingHorizontal: 2 }
                    ]}
                    numberOfLines={1}
                >
                    {props.event.subject || props.event.title}
                </Text>

                {/* On affiche l'heure de début et de fin de l'événement si la durée est supérieure à 45 minutes */}
                {durationInHours > 0.75 && (
                    <View style={eventStyles.tags}>
                        <Text
                            style={[eventStyles.tag, eventStyles.tagWhite]}
                            numberOfLines={1}
                        >
                            {startHour}
                        </Text>
                        <Text
                            style={[eventStyles.tag, eventStyles.tagWhite]}
                            numberOfLines={1}
                        >
                            {endHour}
                        </Text>
                    </View>
                )}

                {/* On affiche la salle si l'événement dure plus d'une heure */}
                {durationInHours > 1 && (
                    <View style={eventStyles.tags}>
                        <Text
                            style={[eventStyles.tag, eventStyles.tagBlack]}
                            numberOfLines={1}
                        >
                            {props.event.room}
                        </Text>
                    </View>
                )}
            </View>
        </AnimatedPressable>
    );
}

const calendarStyles = StyleSheet.create({
    container: {
        flex: 6,
        width: "100%",
        maxWidth: getResponsiveMaxWidth(),
        alignSelf: "center",
        marginHorizontal: "auto",
        flexDirection: "row",
        gap: 2
    },
    dayColumn: {
        flex: 1,
        position: "relative",
        height: "100%",
        paddingHorizontal: 1
    },
    hoursBox: {
        position: "absolute",
        transform: [{ translateX: "-105%" }],
        alignItems: "center",
        justifyContent: "space-between"
    },
    hourLabel: {
        borderTopWidth: 2,
        borderColor: Colors.darkGray,
        color: Colors.darkGray,
        width: "100%",
        boxSizing: "border-box",
        paddingTop: 5,
        fontSize: 15,
        fontWeight: 400
    }
});

const eventStyles = StyleSheet.create({
    container: {
        position: "absolute",
        alignItems: "center",
        borderRadius: 10,
        width: "100%",
        backgroundColor: Colors.light,
        overflow: "hidden"
    },
    content: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 4,
        gap: 5
    },
    colorBar: {
        width: 32,
        height: 8,
        marginTop: -13,
        borderRadius: 999
    },
    subject: {
        fontSize: 10,
        fontWeight: "bold",
        textAlign: "center"
    },
    tags: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2
    },
    tag: {
        fontSize: 10,
        borderRadius: 2,
        flex: 1,
        textAlign: "center"
    },
    tagWhite: {
        backgroundColor: Colors.white
    },
    tagBlack: {
        backgroundColor: Colors.black,
        color: Colors.white
    },
    blankEvent: {
        width: "100%",
        backgroundColor: "transparent"
    }
});
