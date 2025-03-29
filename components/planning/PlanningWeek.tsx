import { PlanningEvent } from "@/webAurion/utils/types";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
    View
} from "react-native";
import { Text } from "../Texts";
import Colors from "@/constants/Colors";
import {
    fillDayWithBlankEvents,
    getSubjectColor,
    groupEventsByDay,
    updatePlanningForListMode
} from "@/utils/planning";
import { formatDateToLocalTime, getWorkdayFromOffset } from "@/utils/date";
import { AnimatedPressable } from "../Buttons";

export default function PlanningWeek(props: {
    events: PlanningEvent[];
    startDate: Date;
    setSelectedEvent: (event: PlanningEvent) => void;
}) {
    const planning = fillDayWithBlankEvents(
        groupEventsByDay(updatePlanningForListMode(props.events))
    );

    return (
        <View style={calendarStyles.container}>
            <View style={calendarStyles.hoursBox}>
                <Text style={calendarStyles.hourLabel}>08</Text>
                <Text style={calendarStyles.hourLabel}>09</Text>
                <Text style={calendarStyles.hourLabel}>10</Text>
                <Text style={calendarStyles.hourLabel}>11</Text>
                <Text style={calendarStyles.hourLabel}>12</Text>
                <Text style={calendarStyles.hourLabel}>13</Text>
                <Text style={calendarStyles.hourLabel}>14</Text>
                <Text style={calendarStyles.hourLabel}>15</Text>
                <Text style={calendarStyles.hourLabel}>16</Text>
                <Text style={calendarStyles.hourLabel}>17</Text>
                <Text style={calendarStyles.hourLabel}>18</Text>
                <Text style={calendarStyles.hourLabel}>19</Text>
            </View>
            {/* For each days of the week */}
            {[0, 1, 2, 3, 4].map((offset, dayIndex) => (
                <View style={calendarStyles.dayColumn} key={dayIndex}>
                    {/* For each events of the day */}
                    {planning[
                        getWorkdayFromOffset(props.startDate, offset)
                    ]?.map((event, eventIndex) => {
                        return (
                            <WeekEvent
                                key={eventIndex}
                                event={event}
                                onPress={props.setSelectedEvent}
                            />
                        );
                    })}
                </View>
            ))}
        </View>
    );
}
// On définit la hauteur d'une heure en pixels en fonction de la hauteur de l'écran
const PIXEL_PER_HOUR = Dimensions.get("window").height / 20;

export function WeekEvent(props: {
    event: PlanningEvent;
    onPress: (event: PlanningEvent) => void;
}) {
    const startHour = formatDateToLocalTime(props.event.start);
    const endHour = formatDateToLocalTime(props.event.end);
    // Calcul de la hauteur de l'événement en fonction de sa durée
    const durationInHours =
        (new Date(props.event.end).getTime() -
            new Date(props.event.start).getTime()) /
        (1000 * 60 * 60);
    const eventHeight = durationInHours * PIXEL_PER_HOUR;

    //Si l'événement est vide alors on affiche une case vide
    if (props.event.id === "blank") {
        return (
            <View style={[eventStyles.blankEvent, { height: eventHeight }]} />
        );
    }
    //On n'affiche pas les congés
    if (props.event.className === "CONGES") {
        return;
    }
    return (
        <AnimatedPressable
            style={[eventStyles.container, { height: eventHeight }]}
            onPress={() => props.onPress && props.onPress(props.event)}
            scale={0.9}
        >
            <View
                style={[
                    eventStyles.colorBar,
                    { backgroundColor: getSubjectColor(props.event.subject) }
                ]}
            />
            <Text style={eventStyles.subject} numberOfLines={1}>
                {props.event.subject}
            </Text>
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
            <View style={eventStyles.tags}>
                <Text
                    style={[eventStyles.tag, eventStyles.tagBlack]}
                    numberOfLines={1}
                >
                    {props.event.room}
                </Text>
            </View>
        </AnimatedPressable>
    );
}

const calendarStyles = StyleSheet.create({
    container: {
        flex: 6,
        marginHorizontal: "auto",
        flexDirection: "row",
        gap: 2,
        width: "100%"
    },
    dayColumn: {
        flex: 1
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
        height: PIXEL_PER_HOUR,
        paddingTop: 5,
        fontSize: 15,
        fontWeight: 400
    }
});

const eventStyles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: 10,
        width: "100%",
        backgroundColor: Colors.light,
        overflow: "hidden",
        paddingBlock: 10,
        paddingInline: 4,
        gap: 5
    },
    colorBar: {
        position: "absolute",
        width: 32,
        height: 8,
        transform: [{ translateY: "-50%" }],
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
    },
    hour: {
        fontSize: Dimensions.get("window").width < 500 ? 9 : 11
    },
    room: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "70%",
        maxWidth: 100,
        height: 13,
        marginBottom: 2,
        borderRadius: 10,
        backgroundColor: Colors.primary
    },
    roomText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 9
    }
});
