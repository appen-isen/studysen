import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import PlanningList from "@/components/planning/PlanningList";
import PlanningWeek from "@/components/planning/PlanningWeek";
import useSessionStore from "@/store/sessionStore";
import { PlanningEvent } from "@/webAurion/utils/types";
import {
    formatDate,
    getCloserMonday,
    getEndDate,
    weekFromNow,
} from "@/utils/date";
import { FontAwesome6 } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/Buttons";
import { getScheduleDates } from "@/webAurion/utils/PlanningUtils";
import EventModal from "@/components/planning/EventModal";

export default function PlanningScreen() {
    const { session } = useSessionStore();
    const [planningView, setPlanningView] = useState<"list" | "week">("list");
    const [planning, setPlanning] = useState<PlanningEvent[]>([]);
    const [isPlanningLoaded, setPlanningLoaded] = useState(false);
    const [currentStartDate, setCurrentStartDate] = useState(
        getCloserMonday(new Date())
    );
    //Permet de stocker l'événement sélectionné pour l'afficher dans la modal
    const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>();
    const [eventModalInfoVisible, setEventModalInfoVisible] = useState(false);
    //Permet de reset le jour actuel dans le PlanningList lorsque l'on clique sur le bouton pour changer l'affichage
    const [resetDayFlag, setResetDayFlag] = useState(false);

    // Fonction pour mettre à jour l'emploi du temps
    const updatePlanning = (weekOffset: number = 0) => {
        if (session) {
            setPlanningLoaded(false);

            // Calcul de la plage de dates pour la semaine
            const { startTimestamp, endTimestamp } =
                getScheduleDates(weekOffset);

            // Vérifier si des événements correspondant à cette plage de dates sont déjà présents
            const isWeekInPlanning = planning.some(
                (event) =>
                    new Date(event.start).getTime() >= startTimestamp &&
                    new Date(event.end).getTime() <= endTimestamp
            );

            // Pas besoin de retélécharger les événements si la semaine est déjà chargée
            if (isWeekInPlanning) {
                setPlanningLoaded(true);
                return;
            }

            // Requête pour charger les événements de la semaine
            session
                .getPlanningApi()
                .fetchPlanning(weekOffset)
                .then((currentWeekPlanning: PlanningEvent[]) => {
                    // Concaténer le nouveau planning avec l'existant sans doublons
                    setPlanning((prevPlanning) => [
                        ...prevPlanning,
                        ...currentWeekPlanning.filter(
                            (newEvent) =>
                                !prevPlanning.some(
                                    (event) => event.id === newEvent.id
                                )
                        ),
                    ]);
                    setPlanningLoaded(true);
                })
                .catch((error) => {
                    console.error(error);
                    setPlanningLoaded(true);
                });
        }
    };

    useEffect(() => {
        updatePlanning();
    }, []);

    // Fonction pour changer la semaine affichée
    const handleWeekChange = (previous: boolean) => {
        //On change la date de début de la semaine
        setCurrentStartDate((prevStart) => {
            const closerMonday = getCloserMonday(new Date());
            closerMonday.setHours(0, 0, 0, 0); // Date de début de journée

            const newDate = new Date(prevStart);
            const offset = previous ? -7 : 7; // On avance ou recule d'une semaine
            newDate.setDate(newDate.getDate() + offset);

            // Si on recule et que la date est antérieure au lundi le plus proche, on reste sur le lundi le plus proche
            if (previous && newDate < closerMonday) {
                return closerMonday;
            }
            // On met à jour l'emploi du temps
            updatePlanning(weekFromNow(getCloserMonday(new Date()), newDate));
            return newDate;
        });
    };

    const handlePlanningViewChange = (view: "list" | "week") => {
        setPlanningView(view);
        const currentDate = getCloserMonday(new Date());
        // On reset la date de début de la semaine
        setCurrentStartDate(currentDate);
        // On met à jour l'emploi du temps
        updatePlanning(weekFromNow(getCloserMonday(new Date()), currentDate));
        // On reset le jour actuel dans le PlanningList
        setResetDayFlag((prevFlag) => !prevFlag);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Empoi du temps</Text>
            {/* Sélecteur pour l'affichage de l'emploi du temps */}
            <View style={styles.planningViewSelector}>
                {/* Boutons pour change l'affichage de l'emploi du temps (mode liste ou mode semaine) */}
                <AnimatedPressable
                    style={[
                        styles.viewSelectorList,
                        planningView === "list" && {
                            backgroundColor: Colors.primaryColor,
                        },
                    ]}
                    onPress={() => handlePlanningViewChange("list")}
                    scale={0.95}
                >
                    <MaterialCommunityIcons
                        name="calendar-text-outline"
                        style={[
                            styles.selectorIcon,
                            //On change la couleur si le mode liste est actif
                            {
                                color:
                                    planningView === "list" ? "white" : "black",
                            },
                        ]}
                    />
                </AnimatedPressable>
                <AnimatedPressable
                    style={[
                        styles.viewSelectorWeek,
                        planningView === "week" && {
                            backgroundColor: Colors.primaryColor,
                        },
                    ]}
                    onPress={() => handlePlanningViewChange("week")}
                    scale={0.95}
                >
                    <MaterialCommunityIcons
                        name="calendar-range-outline"
                        style={[
                            styles.selectorIcon,
                            //On change la couleur si le mode semaine est actif
                            {
                                color:
                                    planningView === "week" ? "white" : "black",
                            },
                        ]}
                    />
                </AnimatedPressable>
            </View>

            {/* Sélecteur de semaine */}
            <View style={styles.weekSelector}>
                <AnimatedPressable onPress={() => handleWeekChange(true)}>
                    <FontAwesome6
                        name="chevron-left"
                        style={styles.weekChevronIcon}
                    />
                </AnimatedPressable>
                <Text style={styles.weekText}>
                    Du {formatDate(currentStartDate)} au{" "}
                    {formatDate(getEndDate(currentStartDate))}
                </Text>
                <AnimatedPressable onPress={() => handleWeekChange(false)}>
                    <FontAwesome6
                        name="chevron-right"
                        style={styles.weekChevronIcon}
                    />
                </AnimatedPressable>
            </View>

            {/* Affichage de l'emploi du temps */}
            {planningView === "list" && (
                <PlanningList
                    events={planning}
                    startDate={currentStartDate}
                    isPlanningLoaded={isPlanningLoaded}
                    resetDayFlag={resetDayFlag}
                    setSelectedEvent={(planningEvent) => {
                        setSelectedEvent(planningEvent);
                        setEventModalInfoVisible(true);
                    }}
                />
            )}
            {planningView === "week" && (
                <PlanningWeek
                    events={planning}
                    startDate={currentStartDate}
                    isPlanningLoaded={isPlanningLoaded}
                    setSelectedEvent={() => {}}
                />
            )}
            {/* Modal pour afficher les informations d'un cours */}
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    visible={eventModalInfoVisible}
                    setVisible={setEventModalInfoVisible}
                ></EventModal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "white",
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.primaryColor,
        marginTop: 20,
    },
    // Style du sélecteur de l'affichage de l'emploi du temps
    planningViewSelector: {
        display: "flex",
        flexDirection: "row",
        alignSelf: "flex-end",
        marginTop: 20,
        marginRight: 20,
        marginBottom: 20,
        backgroundColor: "white",
        borderRadius: 10,
        boxShadow: "0px 2px 5px 0px rgba(0,0,0,0.25)",
    },
    viewSelectorList: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 2,
    },
    viewSelectorWeek: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 2,
    },
    selectorIcon: {
        fontSize: 30,
    },

    //Sélecteur de semaine
    weekSelector: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        width: "90%",
        marginBottom: 10,
    },
    weekChevronIcon: {
        fontSize: 30,
        color: Colors.primaryColor,
        paddingHorizontal: 10,
    },
    weekText: {
        fontSize: 18,
        marginHorizontal: 5,
    },
});
