import Colors from "@/constants/Colors";
import { PlanningEvent } from "@/webAurion/utils/types";
import {
    FlatList,
    LayoutChangeEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Text } from "@/components/Texts";
import {
    getSubjectColor,
    getSubjectIcon,
    groupEventsByDay,
    updatePlanningForListMode,
} from "@/utils/planning";
import { formatDateToLocalTime, getWorkdayFromOffset } from "@/utils/date";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { AnimatedPressable } from "../Buttons";

export default function PlanningList(props: {
    events: PlanningEvent[];
    startDate: Date;
    selectedDay: number;
    setSelectedEvent: (event: PlanningEvent) => void;
}) {
    // On groupe les événements par jour et on change le planning pour fonctionner avec le mode liste
    const planning = groupEventsByDay(updatePlanningForListMode(props.events));

    // Calcul de la date cible au format ISO (local)
    const selectedDateISO = getWorkdayFromOffset(
        props.startDate,
        props.selectedDay
    );

    // Liste contenant les hauteurs des éléments "ListEvent", handleLayout permet de les mettre à jour
    const [eventSizes, setEventSizes] = useState<{ [key: string]: number }>({});
    const handleLayout = (event: LayoutChangeEvent, id: any) => {
        const { height } = event.nativeEvent.layout;
        setEventSizes((prevSizes) => ({
            ...prevSizes,
            [id]: height,
        }));
    };

    // Calcul de la hauteur de la barre de progression
    const getProgressBarHeight = () => {
        const now = new Date();
        let height: number = 0;
        for (let i = 0; i < planning[selectedDateISO].length; i++) {
            const event = planning[selectedDateISO][i];
            // Si l'événement n'a pas encore commencé
            if (now < new Date(event.start)) {
                break;
                // Si l'événement est terminé
            } else if (now > new Date(event.end)) {
                height += eventSizes[event.id];
                const nextEvent = planning[selectedDateISO][i + 1];
                if (!nextEvent) break;
                // Si l'événement suivant a déjà commencé
                if (now >= new Date(nextEvent.start)) {
                    height += 15;
                    // Si l'événement suivant n'a pas encore commencé
                } else {
                    height +=
                        15 *
                        ((now.getTime() - new Date(event.end).getTime()) /
                            (new Date(nextEvent.start).getTime() -
                                new Date(event.end).getTime()));
                }
                // Si l'événement est en cours
            } else {
                height +=
                    eventSizes[event.id] *
                    ((now.getTime() - new Date(event.start).getTime()) /
                        (new Date(event.end).getTime() -
                            new Date(event.start).getTime()));
                break;
            }
        }
        return height;
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {!planning[selectedDateISO] ? (
                <Text style={styles.noData}>Aucun événement à afficher</Text>
            ) : (
                <>
                    <View style={styles.timeBar}>
                        <View
                            style={[
                                styles.timeBarProgress,
                                { height: getProgressBarHeight() },
                            ]}
                        />
                    </View>
                    <FlatList
                        data={planning[selectedDateISO]}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ListEvent
                                event={item}
                                onPress={props.setSelectedEvent}
                                handleLayout={(e: LayoutChangeEvent) =>
                                    handleLayout(e, item.id)
                                }
                            />
                        )}
                        ItemSeparatorComponent={() => (
                            <View style={{ height: 15 }} />
                        )}
                        scrollEnabled={false}
                    />
                </>
            )}
        </ScrollView>
    );
}

export function ListEvent(props: {
    event: PlanningEvent;
    onPress: (event: PlanningEvent) => void;
    handleLayout: (event: LayoutChangeEvent) => void;
}) {
    return (
        <AnimatedPressable
            style={styles.eventBox}
            onPress={() => props.onPress(props.event)}
            onLayout={props.handleLayout}
            scale={0.9}
        >
            <View style={styles.headerBox}>
                <Text style={styles.headerTitle}>
                    {props.event.title || props.event.subject}
                </Text>
                <View
                    style={[
                        styles.headerIcon,
                        {
                            backgroundColor: getSubjectColor(
                                props.event.subject,
                                props.event.subject
                            ),
                        },
                    ]}
                >
                    <MaterialIcons
                        name={getSubjectIcon(props.event.subject)}
                        size={12}
                    />
                </View>
            </View>
            <View>
                <Text style={styles.fieldTitle}>Assuré par</Text>
                <Text style={styles.fieldValue}>{props.event.instructors}</Text>
            </View>
            <View style={styles.tagsBox}>
                <Text style={[styles.tag, styles.tagWhite]}>
                    {formatDateToLocalTime(props.event.start)} —{" "}
                    {formatDateToLocalTime(props.event.end)}
                </Text>
                <Text style={[styles.tag, styles.tagBlack]}>
                    {props.event.room}
                </Text>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        gap: 15,
    },
    timeBar: {
        width: 4,
        backgroundColor: Colors.light,
        borderRadius: 999,
    },
    timeBarProgress: {
        width: "100%",
        backgroundColor: Colors.primary,
        borderRadius: 999,
    },
    noData: {
        fontSize: 14,
        fontWeight: 400,
        textAlign: "center",
        backgroundColor: Colors.light,
        padding: 20,
        borderRadius: 5,
        width: "100%",
    },
    eventBox: {
        backgroundColor: Colors.light,
        paddingBlock: 10,
        paddingInline: 20,
        borderRadius: 10,
        width: "100%",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
    },
    headerBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 600,
    },
    headerIcon: {
        width: 18,
        height: 18,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    fieldTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: Colors.gray,
        textTransform: "uppercase",
    },
    fieldValue: {
        fontSize: 14,
    },
    tagsBox: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15,
    },
    tag: {
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5,
        fontSize: 14,
        fontWeight: 600,
    },
    tagWhite: {
        backgroundColor: Colors.white,
        color: Colors.black,
    },
    tagBlack: {
        backgroundColor: Colors.black,
        color: Colors.white,
    },
    tagPrimary: {
        backgroundColor: Colors.primary,
        color: Colors.white,
    },
});
