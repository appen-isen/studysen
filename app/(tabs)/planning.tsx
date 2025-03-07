import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import PlanningList from "@/components/planning/PlanningList";
import PlanningWeek from "@/components/planning/PlanningWeek";
import useSessionStore from "@/stores/sessionStore";
import { PlanningEvent } from "@/webAurion/utils/types";
import {
    formatDate,
    formatFullDate,
    getCloserMonday,
    getDayNumberInWeek,
    getEndDate,
    isSameWorkWeek,
    isToday,
    weekFromNow,
} from "@/utils/date";
import { MaterialIcons } from "@expo/vector-icons";
import { AnimatedPressable, Toggle } from "@/components/Buttons";
import { getScheduleDates } from "@/webAurion/utils/PlanningUtils";
import EventModal from "@/components/modals/EventModal";
import {
    findEvent,
    getSubjectColor,
    getSubjectIcon,
    mergePlanning,
} from "@/utils/planning";
import {
    usePlanningStore,
    useSyncedPlanningStore,
} from "@/stores/webaurionStore";
import { SyncMessage } from "@/components/Sync";
import { Page, PageHeader } from "@/components/Page";
import { Sheet } from "@/components/Sheet";

export default function PlanningScreen() {
    const { session } = useSessionStore();

    const { planning, setPlanning } = usePlanningStore();
    const { syncedPlanning, setSyncedPlanning, clearSyncedPlanning } =
        useSyncedPlanningStore();
    const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date(0));

    const [isPlanningLoaded, setPlanningLoaded] = useState(false);
    const [isSyncing, setSyncing] = useState(planning.length == 0);

    const [planningView, setPlanningView] = useState<"list" | "week">("list");

    const [selectedMonday, setSelectedMonday] = useState(
        getCloserMonday(new Date())
    );
    const [selectedDayIndex, setSelectedDayIndex] = useState(
        getDayNumberInWeek(new Date())
    );

    const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>();

    useEffect(() => {
        autoUpdatePlanningIfNeeded();

        const interval = setInterval(() => {
            autoUpdatePlanningIfNeeded();
        }, 15 * 1000);

        return () => clearInterval(interval);
    }, [lastUpdateTime]);

    // Mettre à jour le planning toutes les 10 minutes
    const autoUpdatePlanningIfNeeded = () => {
        const now = new Date();
        const elapsedTime = now.getTime() - lastUpdateTime.getTime();

        // Si plus de 10 minutes se sont écoulées depuis la dernière mise à jour, on met à jour
        if (elapsedTime > 10 * 60 * 1000) {
            clearSyncedPlanning();
            updatePlanning();
        }
    };

    // Fonction pour mettre à jour l'emploi du temps
    const updatePlanning = (weekOffset: number = 0) => {
        setPlanningLoaded(false);
        // Calcul de la plage de dates pour la semaine
        const { startTimestamp, endTimestamp } = getScheduleDates(weekOffset);

        // Vérifier si des événements correspondant à cette plage de dates sont déjà présents
        const isWeekInPlanning = planning.some(
            (event) =>
                new Date(event.start).getTime() >= startTimestamp &&
                new Date(event.end).getTime() <= endTimestamp
        );
        // On vérifie si les événements sont déjà synchronisés avec Internet
        // On récupère le store directement de cette manière pour éviter les problèmes d'attentes de rendu
        const isWeekInSyncedPlanning = useSyncedPlanningStore
            .getState()
            .syncedPlanning.some(
                (event) =>
                    new Date(event.start).getTime() >= startTimestamp &&
                    new Date(event.end).getTime() <= endTimestamp
            );

        // Pas besoin de retélécharger les événements si la semaine est déjà chargée
        if (isWeekInPlanning) {
            setPlanningLoaded(true);
        }
        // Si la semaine n'est pas à jour avec Internet, on lance la synchronisation
        if (!isWeekInSyncedPlanning) {
            setSyncing(true);
        }
        if (session) {
            // Requête pour charger les événements de la semaine
            session
                .getPlanningApi()
                .fetchPlanning(weekOffset)
                .then((currentWeekPlanning: PlanningEvent[]) => {
                    // Concaténer le nouveau planning avec l'existant sans doublons
                    setPlanning(
                        // On met à jour le planning en fusionnant les événements
                        mergePlanning(
                            usePlanningStore.getState().planning,
                            currentWeekPlanning
                        )
                    );
                    setPlanningLoaded(true);
                    // Mettre à jour le planning synchronisé
                    setSyncedPlanning(
                        // On met à jour le planning synchronisé en fusionnant les événements
                        mergePlanning(
                            useSyncedPlanningStore.getState().syncedPlanning,
                            currentWeekPlanning
                        )
                    );
                    setSyncing(false);
                    // On met à jour la date de la dernière mise à jour
                    setLastUpdateTime(new Date());
                })
                .catch((error) => {
                    console.error(error);
                    setPlanningLoaded(true);
                });
        }
    };

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
            <SyncMessage isVisible={isSyncing} />

            {/* En tête de la page */}
            <PageHeader title="Mes cours">
                <Toggle
                    stateList={[
                        { label: "Journée", icon: "event-note" },
                        { label: "Semaine", icon: "calendar-month" },
                    ]}
                    state={planningView === "list" ? 0 : 1}
                    setState={(currentState) =>
                        setPlanningView(currentState === 0 ? "week" : "list")
                    }
                />
            </PageHeader>

            {/* Sélecteur de date */}
            <View style={timeStyles.container}>
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
                                    timeStyles.weekArrowDisabled,
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
                                                timeStyles.daysLabelSelected,
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

            {!isPlanningLoaded ? (
                <ActivityIndicator
                    animating={true}
                    color={Colors.primary}
                    size={50}
                />
            ) : planningView === "list" ? (
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
        gap: 25,
    },
});

const timeStyles = StyleSheet.create({
    container: {
        gap: 10,
    },
    //
    // Week selector
    //
    weekBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    weekArrow: {
        width: 36,
        height: 36,
        fontSize: 28,
        textAlign: "center",
        verticalAlign: "middle",
        borderRadius: 999,
        backgroundColor: Colors.black,
        color: Colors.white,
    },
    weekArrowDisabled: {
        backgroundColor: Colors.hexWithOpacity(Colors.black, 0.5),
    },
    weekText: {
        fontSize: 18,
        fontWeight: 600,
        color: Colors.gray,
    },
    weekImportant: {
        fontSize: 18,
        fontWeight: 600,
        color: Colors.black,
    },
    //
    // Day selector
    //
    daysBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 2,
        width: "100%",
    },
    daysButton: {
        flex: 1,
    },
    daysLabel: {
        backgroundColor: Colors.light,
        paddingBlock: 5,
        borderRadius: 5,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 600,
    },
    daysLabelSelected: {
        backgroundColor: Colors.black,
        color: Colors.white,
    },
});
