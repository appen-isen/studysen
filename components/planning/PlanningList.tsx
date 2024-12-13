import Colors from "@/constants/Colors";
import { PlanningEvent } from "@/webAurion/utils/types";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

type GroupedEvents = {
    [date: string]: PlanningEvent[];
};

const groupEventsByDay = (events: PlanningEvent[]): GroupedEvents => {
    return events.reduce<GroupedEvents>((grouped, event) => {
        // On récupère la date de début de l'événement
        const date = new Date(event.start).toISOString().split("T")[0];
        // On crée un tableau pour chaque date
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(event);

        return grouped;
    }, {});
};

export default function PlanningList(props: { events: PlanningEvent[] }) {
    const planning = groupEventsByDay(props.events);
    return <View style={styles.container}></View>;
}

export function ListEvent(props: { event: PlanningEvent }) {
    return (
        <View style={eventStyles.container}>
            {/* Heure de début et de fin */}
            <View style={eventStyles.timeView}>
                <Text style={eventStyles.timeText}>{props.event.start}</Text>
                <View style={eventStyles.timeSeparator}></View>
                <Text style={eventStyles.timeText}>{props.event.end}</Text>
            </View>
            {/* Contenu de l'événement */}
            <View style={eventStyles.contentView}>
                <View style={eventStyles.contentInfo}>
                    <Text style={eventStyles.subject}>
                        {props.event.subject}
                    </Text>
                    <Text style={eventStyles.instructors}>
                        {props.event.instructors}
                    </Text>
                    <View style={eventStyles.roomContainer}>
                        <View style={eventStyles.roomBox}>
                            <Text style={eventStyles.roomText}>
                                {props.event.room}
                            </Text>
                        </View>
                        <Text style={eventStyles.timeTextInfo}>
                            ● Dans 5 minutes
                        </Text>
                    </View>
                </View>
                {/* Plus d'infos sur l'événement */}
                <Pressable>
                    <FontAwesome6
                        name="chevron-right"
                        style={eventStyles.contentInfoIcon}
                    />
                </Pressable>
            </View>
        </View>
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
    dateSeparator: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: Colors.primaryColor,
        marginBottom: 15,
        paddingBottom: 10,
        width: "100%",
    },
    dateTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primaryColor,
        marginLeft: 10,
    },
    dateText: {
        fontSize: 16,
    },
});

const eventStyles = StyleSheet.create({
    // Style de la vue d'un événement
    container: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 5,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: Colors.hexWithOpacity(Colors.primaryColor, 0.1),
        width: "95%",
        height: 100,
    },
    // Style de la vue de l'heure de début et de fin
    timeView: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "20%",
        height: "95%",
        backgroundColor: "white",
        borderRadius: 10,
    },
    timeSeparator: {
        width: 5,
        borderRadius: 10,
        height: "40%",
        backgroundColor: Colors.hexWithOpacity(Colors.primaryColor, 0.1),
    },
    timeText: {
        fontSize: 15,
        textAlign: "center",
    },
    // Style de la vue du contenu de l'événement
    contentView: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        width: "78%",
        height: "95%",
        borderRadius: 10,
    },
    contentInfo: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginLeft: 15,
        width: "85%",
    },
    subject: {
        fontSize: 20,
        fontWeight: "bold",
    },
    instructors: {
        fontSize: 15,
        color: Colors.gray,
    },
    roomContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-start",
        marginTop: 5,
    },
    roomBox: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        height: 23,
        borderRadius: 20,
        backgroundColor: Colors.primaryColor,
    },
    roomText: {
        color: "white",
        fontSize: 15,
        fontWeight: "bold",
        textAlign: "center",
    },
    timeTextInfo: {
        marginLeft: 5,
        color: Colors.primaryColor,
        fontWeight: 700,
    },
    contentInfoIcon: {
        fontSize: 25,
        marginRight: 10,
        color: Colors.primaryColor,
    },
});
