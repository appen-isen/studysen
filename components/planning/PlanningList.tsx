import Colors from "@/constants/Colors";
import { PlanningEvent } from "@/webAurion/utils/types";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Text } from "@/components/Texts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useEffect, useState } from "react";
import { AnimatedPressable } from "../Buttons";
import {
    getSubjectColor,
    groupEventsByDay,
    updatePlanningForListMode,
} from "@/utils/planning";
import {
    formatDateToLocalTime,
    getDayNumberInWeek,
    getWorkdayFromOffset,
} from "@/utils/date";

export default function PlanningList(props: {
    events: PlanningEvent[];
    startDate: Date;
    isPlanningLoaded: boolean;
}) {
    // On groupe les événements par jour et on change le planning pour fonctionner avec le mode liste
    const planning = groupEventsByDay(updatePlanningForListMode(props.events));
    //On initialise le jour sélectionné à la date actuelle
    const [selectedDay, setSelectedDay] = useState(
        getDayNumberInWeek(new Date())
    );

    // Fonction pour changer le jour sélectionné
    const handleDayChange = (dayNumber: number) => {
        setSelectedDay(dayNumber);
    };
    // Calcul de la date cible au format ISO (local)
    const selectedDateISO = getWorkdayFromOffset(props.startDate, selectedDay);
    return (
        <View style={styles.container}>
            <View style={styles.daySelector}>
                {/* On affiche les 5 prochains jours */}
                <DayBox
                    dayNumber={0}
                    selectedDay={selectedDay}
                    onSelectDay={handleDayChange}
                    startDate={props.startDate}
                ></DayBox>
                <DayBox
                    dayNumber={1}
                    selectedDay={selectedDay}
                    onSelectDay={handleDayChange}
                    startDate={props.startDate}
                ></DayBox>
                <DayBox
                    dayNumber={2}
                    selectedDay={selectedDay}
                    onSelectDay={handleDayChange}
                    startDate={props.startDate}
                ></DayBox>
                <DayBox
                    dayNumber={3}
                    selectedDay={selectedDay}
                    onSelectDay={handleDayChange}
                    startDate={props.startDate}
                ></DayBox>
                <DayBox
                    dayNumber={4}
                    selectedDay={selectedDay}
                    onSelectDay={handleDayChange}
                    startDate={props.startDate}
                ></DayBox>
            </View>
            <View style={{ maxHeight: "90%" }}>
                <ScrollView
                    contentContainerStyle={styles.eventsScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {/* On affiche les événements du jour sélectionné */}
                    {props.isPlanningLoaded &&
                        planning[selectedDateISO]?.map((event, index) => (
                            <ListEvent key={index} event={event} />
                        ))}
                    {!props.isPlanningLoaded && (
                        <ActivityIndicator
                            animating={true}
                            color={Colors.primaryColor}
                            size={50}
                        />
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

function DayBox(props: {
    dayNumber: number;
    startDate: Date;
    selectedDay: number;
    onSelectDay: (dayNumber: number) => void;
}) {
    // Calcul de la date cible au format ISO (local)
    const targetDateISO = getWorkdayFromOffset(
        props.startDate,
        props.dayNumber
    );
    const targetDate = new Date(targetDateISO); // Conversion de la chaîne ISO en objet Date

    const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
    // Extraction du nom et de la date (jour/mois)
    const dayName = dayNames[props.dayNumber];
    const dayDate = `${targetDate.getDate().toString().padStart(2, "0")}/${(
        targetDate.getMonth() + 1
    )
        .toString()
        .padStart(2, "0")}`;

    const isSelected = props.dayNumber === props.selectedDay;

    return (
        <AnimatedPressable
            // On change le style du jour sélectionné
            style={[
                styles.dayBox,
                isSelected && { backgroundColor: Colors.primaryColor },
            ]}
            onPress={() => props.onSelectDay(props.dayNumber)}
        >
            <Text style={[styles.dayTitle, isSelected && { color: "white" }]}>
                {dayName}
            </Text>
            <Text style={[styles.dayDate, isSelected && { color: "white" }]}>
                {dayDate}
            </Text>
        </AnimatedPressable>
    );
}

export function ListEvent(props: { event: PlanningEvent }) {
    const [timeText, setTimeText] = useState("");
    useEffect(() => {
        // On affiche En cours si l'événement est en cours ou dans x minutes < 60 minutes si l'événement est à venir
        const now = new Date();
        const start = new Date(props.event.start);
        const end = new Date(props.event.end);

        // Si l'événement est en cours
        if (now >= start && now <= end) {
            setTimeText(" ● En cours");
        } else if (start > now) {
            const diffMinutes = Math.floor(
                (start.getTime() - now.getTime()) / 6000
            );
            // Si l'événement est dans moins d'une heure, on affiche "Dans x minutes"
            if (diffMinutes < 60) {
                setTimeText(` ● Dans ${diffMinutes} minutes`);
            }
        }
    }, [props.event]);

    return (
        <View style={eventStyles.container}>
            {/* Heure de début et de fin */}
            <View style={eventStyles.timeView}>
                <Text style={eventStyles.timeText}>
                    {formatDateToLocalTime(props.event.start)}
                </Text>
                <View
                    style={[
                        eventStyles.timeSeparator,
                        //Couleur de fond en fonction de la matière
                        {
                            backgroundColor: getSubjectColor(
                                props.event.subject
                            ),
                        },
                    ]}
                ></View>
                <Text style={eventStyles.timeText}>
                    {formatDateToLocalTime(props.event.end)}
                </Text>
            </View>
            {/* Contenu de l'événement */}
            <View style={eventStyles.contentView}>
                <View style={eventStyles.contentInfo}>
                    {/* Matière */}
                    <Text style={eventStyles.subject}>
                        {props.event.title || props.event.subject}
                        {props.event.className !== "COURS" &&
                            ` - ${props.event.className}`}
                    </Text>
                    {/* Enseignants */}
                    <Text style={eventStyles.instructors}>
                        {props.event.instructors}
                    </Text>
                    {/* Salle */}
                    <View style={eventStyles.roomContainer}>
                        <View style={eventStyles.roomBox}>
                            <Text style={eventStyles.roomText}>
                                {props.event.room}
                            </Text>
                        </View>
                        <Text style={eventStyles.timeTextInfo}>{timeText}</Text>
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

    //Sélecteur de jour
    daySelector: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-around",
        marginTop: 10,
    },
    dayBox: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        backgroundColor: Colors.hexWithOpacity(Colors.primaryColor, 0.2),
    },
    dayTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    dayDate: {
        fontSize: 13,
    },
    // Vue des événements
    eventsScroll: {
        width: "100%",
        display: "flex",
        flexGrow: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 200,
        marginTop: 30,
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
        width: "95%",
        height: 120,
        backgroundColor: Colors.hexWithOpacity(Colors.primaryColor, 0.2),
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
    },
    timeText: {
        fontSize: 15,
        textAlign: "center",
        fontWeight: 700,
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
        fontSize: 18,
        width: "100%",
        fontWeight: "bold",
    },
    instructors: {
        fontSize: 15,
        color: Colors.gray,
    },
    // Style de la box de la salle
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
        fontSize: 13,
    },
    contentInfoIcon: {
        fontSize: 25,
        marginRight: 10,
        color: Colors.primaryColor,
    },
});
