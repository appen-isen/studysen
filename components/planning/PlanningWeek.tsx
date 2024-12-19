import { PlanningEvent } from "@/webAurion/utils/types";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "../Texts";
import Colors from "@/constants/Colors";
import {
    fillDayWithBlankEvents,
    getSubjectColor,
    groupEventsByDay,
    updatePlanningForListMode,
} from "@/utils/planning";
import { formatDateToLocalTime, getWorkdayFromOffset } from "@/utils/date";
import { AnimatedPressable } from "../Buttons";

export default function PlanningWeek(props: {
    events: PlanningEvent[];
    startDate: Date;
    isPlanningLoaded: boolean;
    setSelectedEvent: (event: PlanningEvent) => void;
}) {
    const planning = fillDayWithBlankEvents(
        groupEventsByDay(updatePlanningForListMode(props.events))
    );

    // On affiche un chargement si l'emploi du temps n'est pas encore chargé
    if (!props.isPlanningLoaded) {
        return (
            <ActivityIndicator
                animating={true}
                color={Colors.primaryColor}
                size={50}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* Jours de la semaine */}
            <View style={styles.dayView}>
                <View style={styles.dayBox}>
                    <Text style={styles.dayText}>Lun</Text>
                    <Text style={styles.dateText}>01/01</Text>
                </View>
                <View style={styles.dayBox}>
                    <Text style={styles.dayText}>Mar</Text>
                    <Text style={styles.dateText}>01/01</Text>
                </View>
                <View style={styles.dayBox}>
                    <Text style={styles.dayText}>Mer</Text>
                    <Text style={styles.dateText}>01/01</Text>
                </View>
                <View style={styles.dayBox}>
                    <Text style={styles.dayText}>Jeu</Text>
                    <Text style={styles.dateText}>01/01</Text>
                </View>
                <View style={styles.dayBox}>
                    <Text style={styles.dayText}>Ven</Text>
                    <Text style={styles.dateText}>01/01</Text>
                </View>
            </View>
            <View style={styles.weekView}>
                {/* Les heures */}

                {/* Tableau des événements */}
                {/* On affiche les événements du jour sélectionné */}
                {props.isPlanningLoaded && (
                    <View style={styles.table}>
                        <View style={styles.hoursView}>
                            <Text style={styles.hourText}>8h</Text>
                            <Text style={styles.hourText}>9h</Text>
                            <Text style={styles.hourText}>10h</Text>
                            <Text style={styles.hourText}>11h</Text>
                            <Text style={styles.hourText}>12h</Text>
                            <Text style={styles.hourText}>13h</Text>
                            <Text style={styles.hourText}>14h</Text>
                            <Text style={styles.hourText}>15h</Text>
                            <Text style={styles.hourText}>16h</Text>
                            <Text style={styles.hourText}>17h</Text>
                            <Text style={styles.hourText}>18h</Text>
                            <Text style={styles.hourText}>19h</Text>
                        </View>
                        {/* On affiche les événements de chaque jour dynamiquement */}
                        <View style={styles.dayCol}>
                            {planning[
                                getWorkdayFromOffset(props.startDate, 0)
                            ]?.map((event, index) => {
                                return (
                                    <WeekEvent
                                        key={index}
                                        event={event}
                                        onPress={props.setSelectedEvent}
                                    />
                                );
                            })}
                        </View>
                        <View style={styles.dayCol}>
                            {planning[
                                getWorkdayFromOffset(props.startDate, 1)
                            ]?.map((event, index) => {
                                return (
                                    <WeekEvent
                                        key={index}
                                        event={event}
                                        onPress={props.setSelectedEvent}
                                    />
                                );
                            })}
                        </View>
                        <View style={styles.dayCol}>
                            {planning[
                                getWorkdayFromOffset(props.startDate, 2)
                            ]?.map((event, index) => {
                                return (
                                    <WeekEvent
                                        key={index}
                                        event={event}
                                        onPress={props.setSelectedEvent}
                                    />
                                );
                            })}
                        </View>
                        <View style={styles.dayCol}>
                            {planning[
                                getWorkdayFromOffset(props.startDate, 3)
                            ]?.map((event, index) => {
                                return (
                                    <WeekEvent
                                        key={index}
                                        event={event}
                                        onPress={props.setSelectedEvent}
                                    />
                                );
                            })}
                        </View>
                        <View style={styles.dayCol}>
                            {planning[
                                getWorkdayFromOffset(props.startDate, 4)
                            ]?.map((event, index) => {
                                return (
                                    <WeekEvent
                                        key={index}
                                        event={event}
                                        onPress={props.setSelectedEvent}
                                    />
                                );
                            })}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
const PIXEL_PER_HOUR = 38;
export function WeekEvent(props: {
    event: PlanningEvent;
    onPress?: (event: PlanningEvent) => void;
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
            <View
                style={[eventStyles.blankEvent, { height: eventHeight }]}
            ></View>
        );
    }
    //On n'affiche pas les congés
    if (props.event.className === "CONGES") {
        return;
    }
    return (
        <AnimatedPressable
            style={[eventStyles.container, { height: eventHeight }]}
            scale={0.95}
            onPress={() => props.onPress && props.onPress(props.event)}
        >
            <View style={eventStyles.timeView}>
                <Text style={eventStyles.hour}>
                    {startHour} - {endHour}
                </Text>
                <View
                    style={[
                        eventStyles.separator,
                        {
                            backgroundColor: getSubjectColor(
                                props.event.subject
                            ),
                        },
                    ]}
                ></View>
            </View>
            <View>
                <Text style={eventStyles.subject}>{props.event.subject}</Text>
            </View>
            {/* Si la hauteur de l'événement est suffisante alors on affiche la salle */}
            {eventHeight > PIXEL_PER_HOUR * 1.5 && (
                <View style={eventStyles.room}>
                    <Text style={eventStyles.roomText}>{props.event.room}</Text>
                </View>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    // Cases des jours de la semaine
    dayView: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignSelf: "flex-end",
        width: "90%",
    },
    dayBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 5,
        marginHorizontal: 3,
        backgroundColor: Colors.primaryColor,
    },
    dayText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 13,
    },
    dateText: {
        color: "white",
        fontSize: 10,
    },
    weekView: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        height: PIXEL_PER_HOUR * 2 * 6,
    },
    //Partie des heures
    hoursView: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 40,
    },
    hourText: {
        fontSize: 15,
        fontWeight: "bold",
    },
    //Tableau des événements
    table: {
        flex: 6, // Nombre de colonnes
        marginHorizontal: "auto",
        flexDirection: "row",
        marginTop: 20,
    },
    dayCol: {
        flex: 1,
        borderColor: "black",
    },
    dayRow: {
        backgroundColor: "white",
        height: 120,
        borderRadius: 10,
        margin: 1,
    },
});

const eventStyles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 10,
        width: "98%",
        backgroundColor: "white",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.15)",
    },
    timeView: {
        display: "flex",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 5,
    },
    blankEvent: {
        width: "100%",
        backgroundColor: "transparent",
    },
    subject: {
        fontSize: 7,
        fontWeight: "bold",
        textAlign: "center",
        padding: 1,
    },
    separator: {
        width: "90%",
        height: 3,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
    },
    hour: {
        fontSize: 8,
    },
    room: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "70%",
        height: 13,
        marginBottom: 2,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
    },
    roomText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 9,
    },
});
