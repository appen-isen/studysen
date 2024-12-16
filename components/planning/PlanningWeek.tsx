import { PlanningEvent } from "@/webAurion/utils/types";
import { StyleSheet, View } from "react-native";
import { Text } from "../Texts";
import Colors from "@/constants/Colors";
import { getSubjectColor } from "@/utils/planning";

export default function PlanningWeek(props: {
    events: PlanningEvent[];
    startDate: Date;
    isPlanningLoaded: boolean;
}) {
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
                {/* Tableau des événements */}
                <View style={styles.table}>
                    <View style={styles.dayCol}>
                        <WeekEvent event={props.events[0]} />
                        <WeekEvent event={props.events[0]} />
                        <WeekEvent event={props.events[0]} />
                        <WeekEvent event={props.events[0]} />
                    </View>
                    <View style={styles.dayCol}></View>
                    <View style={styles.dayCol}></View>
                    <View style={styles.dayCol}></View>
                    <View style={styles.dayCol}></View>
                </View>
            </View>
        </View>
    );
}

function Col(props: { numRows: number; children: React.ReactNode }) {
    return <View style={styles[`${props.numRows}col`]}>{props.children}</View>;
}

function Row(props: { children: React.ReactNode }) {
    return <View style={styles.row}>{props.children}</View>;
}

export function WeekEvent(props: { event: PlanningEvent }) {
    return (
        <View style={eventStyles.container}>
            <Text style={eventStyles.hour}>8h00</Text>
            <Text style={eventStyles.hour}>10h00</Text>
            <View
                style={[
                    eventStyles.separator,
                    { backgroundColor: getSubjectColor(props.event.subject) },
                ]}
            ></View>
            <Text style={eventStyles.subject}>{props.event.subject}</Text>
            <View style={eventStyles.room}>
                <Text style={eventStyles.roomText}>{props.event.room}</Text>
            </View>
        </View>
    );
}

const styles: { [key: string]: any } = StyleSheet.create({
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
        justifyContent: "flex-end",
        marginRight: 5,
        width: "100%",
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
    },
    //Partie des heures
    hoursView: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 3,
    },
    hourText: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 6,
    },
    //Tableau des événements
    table: {
        flex: 5, // Nombre de colonnes
        marginHorizontal: "auto",
        flexDirection: "row",
    },
    dayCol: {
        flex: 1,
        flexDirection: "column",
        margin: 1,
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
        justifyContent: "flex-start",
        alignItems: "center",
        height: 100,
        borderRadius: 10,
        backgroundColor: "white",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        marginVertical: 3,
    },
    subject: {
        fontSize: 12,
        fontWeight: "bold",
        textAlign: "center",
        padding: 5,
    },
    separator: {
        width: "90%",
        height: 3,
        backgroundColor: Colors.primaryColor,
        borderRadius: 10,
    },
    hour: {
        fontSize: 12,
    },
    room: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "80%",
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
    },
    roomText: {
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 10,
    },
});
