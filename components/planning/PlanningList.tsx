import Colors from "@/constants/Colors";
import { PlanningEvent } from "@/webAurion/utils/types";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import { groupEventsByDay, updatePlanningForListMode } from "@/utils/planning";
import { formatDateToLocalTime, getWorkdayFromOffset } from "@/utils/date";
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
    const selectedDateISO = getWorkdayFromOffset(props.startDate, props.selectedDay);

    return <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
    >
        {!planning[selectedDateISO] ? (
            <Text style={styles.noData}>Aucun événement à afficher</Text>
        ) : <>
            <View style={styles.timeBar}>
            </View>
            <View style={styles.eventListBox}>
                {/* On affiche les événements du jour sélectionné */}
                {planning[selectedDateISO]?.map((event, index) => (
                    <ListEvent
                        key={index}
                        event={event}
                        onPress={props.setSelectedEvent}
                    />
                ))}
            </View>
        </>}
    </ScrollView>;
}

export function ListEvent(props: { event: PlanningEvent, onPress: (event: PlanningEvent) => void }) {

    return <Pressable style={styles.eventBox} onPress={() => props.onPress(props.event)}>
        <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>{props.event.title}</Text>
            <View style={styles.headerIcon}><MaterialIcons name="functions" size={12} /></View>
        </View>
        <View>
            <Text style={styles.fieldTitle}>Assuré par</Text>
            <Text style={styles.fieldValue}>{props.event.instructors}</Text>
        </View>
        <View style={styles.tagsBox}>
            <Text style={[styles.tag, styles.tagWhite]}>{formatDateToLocalTime(props.event.start)} — {formatDateToLocalTime(props.event.end)}</Text>
            <Text style={[styles.tag, styles.tagBlack]}>{props.event.room}</Text>
        </View>
    </Pressable>;
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
    noData: {
        fontSize: 14,
        fontWeight: 400,
        textAlign: "center",
        backgroundColor: Colors.light,
        padding: 20,
        borderRadius: 5,
        width: "100%",
    },
    eventListBox: {
        gap: 15,
        flex: 1,
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
        backgroundColor: "#FFA99D",
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
})