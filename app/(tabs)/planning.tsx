import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useState } from "react";
import PlanningList from "@/components/planning/PlanningList";
import PlanningWeek from "@/components/planning/PlanningWeek";
import { PlanningEvent } from "@/webAurion/utils/types";
import {
    formatDate,
    getCloserMonday,
    getDayNumberInWeek,
    getEndDate,
    isSameWorkWeek,
    isToday,
    weekFromNow
} from "@/utils/date";
import { MaterialIcons } from "@expo/vector-icons";
import { AnimatedPressable, Toggle } from "@/components/Buttons";
import EventModal from "@/components/modals/EventModal";
import { findEvent } from "@/utils/planning";
import { usePlanningStore } from "@/stores/webaurionStore";
import { SyncBadge } from "@/components/Sync";
import { Page, PageHeader } from "@/components/Page";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { updatePlanning } from "@/services/syncService";

export default function PlanningScreen() {
    const { planning } = usePlanningStore();

    const [planningView, setPlanningView] = useState<"list" | "week">("list");

    const [selectedMonday, setSelectedMonday] = useState(
        getCloserMonday(new Date())
    );
    const [selectedDayIndex, setSelectedDayIndex] = useState(
        getDayNumberInWeek(new Date())
    );

    const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>();

    // Fonction pour changer la semaine affichée
    const handleWeekChange = (previous: boolean) => {
        setSelectedMonday((prevStart) => {
            const closestMonday = getCloserMonday(new Date());

            const newDate = new Date(prevStart);
            newDate.setDate(newDate.getDate() + (previous ? -7 : 7)); // On avance ou recule d'une semaine

            // Si on recule et que la date est antérieure au lundi le plus proche, on reste sur le lundi le plus proche
            if (previous && newDate < closestMonday) {
                return closestMonday;
            }

            // On met à jour l'emploi du temps
            updatePlanning(weekFromNow(getCloserMonday(new Date()), newDate));
            setSelectedDayIndex(
                isSameWorkWeek(newDate) ? getDayNumberInWeek(new Date()) : 0
            );
            return newDate;
        });
    };

    return (
        <Page style={styles.container}>
            <SyncBadge />

            {/* En tête de la page */}
            <PageHeader title="Mes cours">
                <Toggle
                    stateList={[
                        {
                            label: "Voir la semaine",
                            icon: "calendar-month"
                        },
                        { label: "Voir la journée", icon: "event-note" }
                    ]}
                    state={planningView === "list" ? 0 : 1}
                    setState={(currentState) => {
                        //On retourne à la semaine actuelle lors du clic sur le bouton
                        setSelectedMonday(getCloserMonday(new Date()));
                        //On met à jour la vue du planning
                        setPlanningView(currentState === 0 ? "week" : "list");
                    }}
                />
            </PageHeader>

            {/* Sélecteur de date */}
            <View style={[timeStyles.container, styles.responsiveContainer]}>
                {/* Sélecteur de semaine */}
                <View style={timeStyles.weekBox}>
                    {/* Flèche pour reculer d'une semaine */}
                    <AnimatedPressable
                        onPress={() => handleWeekChange(true)}
                        disabled={isSameWorkWeek(selectedMonday)}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            style={[
                                timeStyles.weekArrow,
                                isSameWorkWeek(selectedMonday) &&
                                    timeStyles.weekArrowDisabled
                            ]}
                        />
                    </AnimatedPressable>
                    {/* Texte de la semaine sélectionnée */}
                    <Text style={timeStyles.weekText}>
                        Du{" "}
                        <Text style={timeStyles.weekImportant}>
                            {formatDate(selectedMonday)}
                        </Text>{" "}
                        au{" "}
                        <Text style={timeStyles.weekImportant}>
                            {formatDate(getEndDate(selectedMonday))}
                        </Text>
                    </Text>
                    {/* Flèche pour avancer d'une semaine */}
                    <AnimatedPressable onPress={() => handleWeekChange(false)}>
                        <MaterialIcons
                            name="arrow-forward"
                            style={timeStyles.weekArrow}
                        />
                    </AnimatedPressable>
                </View>

                {/* Sélecteur de jour */}
                <View style={timeStyles.daysBox}>
                    {["Lun", "Mar", "Mer", "Jeu", "Ven"].map(
                        (dayName, index) => {
                            const day = new Date(
                                selectedMonday.getTime() +
                                    index * 24 * 60 * 60 * 1000
                            );
                            return (
                                <AnimatedPressable
                                    style={timeStyles.daysButton}
                                    key={index}
                                    onPress={() => setSelectedDayIndex(index)}
                                    disabled={planningView === "week"}
                                >
                                    <Text
                                        style={[
                                            timeStyles.daysLabel,
                                            index === selectedDayIndex &&
                                                planningView === "list" &&
                                                timeStyles.daysLabelSelected
                                        ]}
                                    >
                                        {isToday(day)
                                            ? "Aujour."
                                            : `${dayName}. ${day
                                                  .getDate()
                                                  .toString()
                                                  .padStart(2, "0")}`}
                                    </Text>
                                </AnimatedPressable>
                            );
                        }
                    )}
                </View>
            </View>

            {planningView === "list" ? (
                <PlanningList
                    events={planning}
                    selectedDay={selectedDayIndex}
                    startDate={selectedMonday}
                    //Affiche les informations d'un cours dans une modal
                    setSelectedEvent={(planningEvent) => {
                        //Si c'est un congé, on affiche directement les informations
                        if (planningEvent.className === "CONGES") {
                            setSelectedEvent(planningEvent);
                        } else {
                            //Sinon on affiche les informations complètes de l'événement
                            setSelectedEvent(
                                findEvent(planning, planningEvent)
                            );
                        }
                    }}
                />
            ) : (
                <PlanningWeek
                    events={planning}
                    startDate={selectedMonday}
                    setSelectedEvent={(planningEvent) => {
                        setSelectedEvent(findEvent(planning, planningEvent));
                    }}
                />
            )}
            {/* Modal d'informations sur un cours */}

            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    setVisible={() => setSelectedEvent(null)}
                    visible={selectedEvent != null}
                ></EventModal>
            )}
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 25
    },
    responsiveContainer: {
        width: "100%",
        alignSelf: "center",
        maxWidth: getResponsiveMaxWidth()
    }
});

const timeStyles = StyleSheet.create({
    container: {
        gap: 10
    },

    //
    // Week selector
    //
    weekBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
    },
    weekArrow: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        fontSize: 28,
        textAlign: "center",
        borderRadius: 999,
        backgroundColor: Colors.black,
        color: Colors.white
    },
    weekArrowDisabled: {
        backgroundColor: Colors.hexWithOpacity(Colors.black, 0.5)
    },
    weekText: {
        fontSize: 18,
        fontWeight: 600,
        color: Colors.gray
    },
    weekImportant: {
        fontSize: 18,
        fontWeight: 600,
        color: Colors.black
    },
    //
    // Day selector
    //
    daysBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 3,
        width: "100%"
    },
    daysButton: {
        flex: 1
    },
    daysLabel: {
        backgroundColor: Colors.light,
        paddingHorizontal: 5,
        paddingVertical: 8,
        borderRadius: 5,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 600
    },
    daysLabelSelected: {
        backgroundColor: Colors.black,
        color: Colors.white
    }
});
