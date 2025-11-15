import Colors from "@/constants/Colors";
import { PlanningEvent } from "@/webAurion/utils/types";
import {
    FlatList,
    LayoutChangeEvent,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import { Text } from "@/components/Texts";
import { groupEventsByDay, updatePlanningForListMode } from "@/utils/planning";
import { formatDateToLocalTime, getWorkdayFromOffset } from "@/utils/date";
import { getSubjectColor, getSubjectIcon } from "@/utils/colors";
import { AnimatedPressable } from "../Buttons";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

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
    const handleLayout = (event: LayoutChangeEvent, key: string) => {
        const { height } = event.nativeEvent.layout;
        setEventSizes((prevSizes) => ({
            ...prevSizes,
            [key]: height
        }));
    };

    // Calcul de la hauteur de la barre de progression
    const getProgressBarHeight = () => {
        const now = new Date();
        let height: number = 0;
        for (let i = 0; i < planning[selectedDateISO].length; i++) {
            const event = planning[selectedDateISO][i];
            const key = `${event.id}-${event.start}`;
            // Si l'événement n'a pas encore commencé
            if (now < new Date(event.start)) {
                break;
                // Si l'événement est terminé
            } else if (now > new Date(event.end)) {
                height += eventSizes[key] || 0;
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
                    (eventSizes[key] || 0) *
                    ((now.getTime() - new Date(event.start).getTime()) /
                        (new Date(event.end).getTime() -
                            new Date(event.start).getTime()));
                break;
            }
        }
        return height;
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!planning[selectedDateISO] ? (
                <Text style={styles.noData}>Aucun événement à afficher</Text>
            ) : (
                <>
                    <View style={styles.timeBar}>
                        <View
                            style={[
                                styles.timeBarProgress,
                                { height: getProgressBarHeight() }
                            ]}
                        />
                    </View>
                    <FlatList
                        data={planning[selectedDateISO]}
                        keyExtractor={(item) => `${item.id}-${item.start}`}
                        renderItem={({ item }) => (
                            <ListEvent
                                event={item}
                                onPress={props.setSelectedEvent}
                                handleLayout={(e: LayoutChangeEvent) =>
                                    handleLayout(e, `${item.id}-${item.start}`)
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
    const [timeText, setTimeText] = useState("");

    useEffect(() => {
        // On met à jour le texte de l'heure de l'événement
        const updateEventTime = () => {
            const now = new Date();
            const start = new Date(props.event.start);
            const end = new Date(props.event.end);
            if (now >= start && now <= end) {
                // L'événement est en cours
                setTimeText("EN COURS");
            } else if (start > now) {
                const diffMinutes =
                    Math.floor((start.getTime() - now.getTime()) / 60000) + 1;
                // L'événement n'a pas encore commencé mais débute dans moins d'une heure
                if (diffMinutes <= 60) {
                    setTimeText(`DANS ${diffMinutes} MINUTES`);
                } else {
                    setTimeText("");
                }
            } else {
                setTimeText("");
            }
        };

        // Mise à jour du temps
        updateEventTime();

        // Mise à jour réuglière du temps toutes les minutes
        const interval = setInterval(updateEventTime, 10000);

        // Nettoyage de l'intervalle
        return () => clearInterval(interval);
    }, [props.event]);

    // Style pour le badge de l'événement en cours ou à venir dans X minutes
    const currentEventTextStyle = {
        ...styles.currentTimeText,
        ...(timeText.startsWith("DANS") ? styles.inXMinutesText : {})
    };
    return (
        <AnimatedPressable
            //On applique une bordure à gauche de la carte si l'événement est en cours
            style={[
                styles.eventBox,
                timeText === "EN COURS" ? styles.currentEventBorder : {}
            ]}
            onPress={() => props.onPress(props.event)}
            onLayout={props.handleLayout}
            scale={0.9}
        >
            {/* Affichage du temps restant avant le début de l'événement */}
            {timeText !== "" && (
                <Text style={currentEventTextStyle}>{timeText}</Text>
            )}
            <View style={styles.headerBox}>
                <View
                    style={[
                        styles.headerIcon,
                        {
                            backgroundColor: getSubjectColor(
                                props.event.subject
                            )
                        }
                    ]}
                >
                    <MaterialIcons
                        name={getSubjectIcon(props.event.subject)}
                        size={13}
                    />
                </View>
                <Text style={styles.headerTitle}>
                    {props.event.title || props.event.subject}
                </Text>
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
        width: "100%",
        maxWidth: getResponsiveMaxWidth(),
        alignSelf: "center",
        gap: 15
    },
    timeBar: {
        width: 4,
        backgroundColor: Colors.light,
        borderRadius: 999
    },
    timeBarProgress: {
        width: "100%",
        backgroundColor: Colors.primary,
        borderRadius: 999
    },
    noData: {
        fontSize: 14,
        fontWeight: 400,
        textAlign: "center",
        backgroundColor: Colors.light,
        padding: 20,
        borderRadius: 5,
        width: "100%"
    },
    eventBox: {
        backgroundColor: Colors.light,
        paddingBlock: 10,
        paddingInline: 20,
        borderRadius: 10,
        width: "100%",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20
    },
    currentEventBorder: {
        borderColor: Colors.lightGray,
        borderWidth: 1
    },
    headerBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 600
    },
    headerIcon: {
        width: 20,
        height: 20,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center"
    },
    // Affichage du temps restant avant le début de l'événement
    currentTimeText: {
        backgroundColor: Colors.primary,
        borderRadius: 15,
        width: 120,
        color: Colors.white,
        textAlign: "center",
        fontSize: 12,
        padding: 2,
        fontWeight: 900
    },
    inXMinutesText: {
        color: Colors.black,
        backgroundColor: Colors.lightGray,
        fontSize: 10
    },
    // Affichage des informations de l'événement
    fieldTitle: {
        fontSize: 10,
        fontWeight: "bold",
        color: Colors.gray,
        textTransform: "uppercase"
    },
    fieldValue: {
        fontSize: 14
    },
    tagsBox: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 15
    },
    tag: {
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5,
        fontSize: 14,
        fontWeight: 600
    },
    tagWhite: {
        backgroundColor: Colors.white,
        color: Colors.black
    },
    tagBlack: {
        backgroundColor: Colors.black,
        color: Colors.white
    },
    tagPrimary: {
        backgroundColor: Colors.primary,
        color: Colors.white
    }
});
