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
import { AnimatedPressable, DoubleSelector } from "@/components/Buttons";
import { getScheduleDates } from "@/webAurion/utils/PlanningUtils";
import EventModal from "@/components/modals/EventModal";
import { findEvent } from "@/utils/planning";
import {
    usePlanningStore,
    useSyncedPlanningStore,
} from "@/store/webaurionStore";
import { SyncMessage } from "@/components/Sync";

export default function PlanningScreen() {
    const { session } = useSessionStore();
    const { planning, setPlanning } = usePlanningStore();
    const { syncedPlanning, setSyncedPlanning, clearSyncedPlanning } =
        useSyncedPlanningStore();
    const [planningView, setPlanningView] = useState<"list" | "week">("list");
    const [isPlanningLoaded, setPlanningLoaded] = useState(false);
    //Permet de savoir si le planning est synchronisé avec Internet ou s'il est en local
    const [isSyncing, setSyncing] = useState(planning.length == 0);
    const [currentStartDate, setCurrentStartDate] = useState(
        getCloserMonday(new Date())
    );
    //Permet de stocker l'événement sélectionné pour l'afficher dans la modal
    const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>();
    const [eventModalInfoVisible, setEventModalInfoVisible] = useState(false);
    //Permet de reset le jour actuel dans le PlanningList lorsque l'on clique sur le bouton pour changer l'affichage
    const [resetDayFlag, setResetDayFlag] = useState(false);

    //Permet de stocker la date de la dernière mise à jour du planning
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

    useEffect(() => {
        autoUpdatePlanningIfNeeded();

        const interval = setInterval(() => {
            autoUpdatePlanningIfNeeded(); // On regarde si on doit mettre à jour le planning toute les 30 secondes
        }, 15 * 1000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [lastUpdateTime]);

    // Mettre à jour le planning toutes les 10 minutes
    const autoUpdatePlanningIfNeeded = () => {
        if (lastUpdateTime) {
            const now = new Date();
            const elapsedTime = now.getTime() - lastUpdateTime.getTime();

            if (elapsedTime > 10 * 60 * 1000) {
                clearSyncedPlanning();
                // Si plus de 10 minutes se sont écoulées depuis la dernière mise à jour, on met à jour
                updatePlanning();
            }
        } else {
            // Si c'est le premier chargement, on télécharge le planning
            updatePlanning();
        }
    };

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

            // Requête pour charger les événements de la semaine
            session
                .getPlanningApi()
                .fetchPlanning(weekOffset)
                .then((currentWeekPlanning: PlanningEvent[]) => {
                    // Concaténer le nouveau planning avec l'existant sans doublons
                    setPlanning([
                        ...planning.filter(
                            (event) =>
                                !currentWeekPlanning.some(
                                    (newEvent) => newEvent.id === event.id
                                )
                        ),
                        ...currentWeekPlanning,
                    ]);
                    setPlanningLoaded(true);
                    // Mettre à jour le planning synchronisé
                    setSyncedPlanning([
                        ...useSyncedPlanningStore.getState().syncedPlanning,
                        ...currentWeekPlanning,
                    ]);
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
            {/* Message de synchronisation */}
            <SyncMessage isVisible={isSyncing} />
            {/* Titre de la page */}
            <Text style={styles.title}>Empoi du temps</Text>

            {/* Sélecteur pour l'affichage de l'emploi du temps */}
            <DoubleSelector
                containerStyle={styles.planningViewSelector}
                //Sélection de l'affichage mode liste ou mode semaine
                selected={planningView === "list" ? 0 : 1}
                setSelected={(selected) =>
                    handlePlanningViewChange(selected === 0 ? "list" : "week")
                }
                //Icones pour le sélecteur
                firstSelector={
                    <MaterialCommunityIcons
                        name="calendar-text-outline"
                        style={[
                            styles.selectorIcon,
                            planningView === "list" && { color: "white" },
                        ]}
                    />
                }
                secondSelector={
                    <MaterialCommunityIcons
                        name="calendar-range-outline"
                        style={[
                            styles.selectorIcon,
                            planningView === "week" && { color: "white" },
                        ]}
                    />
                }
            />

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
                        setEventModalInfoVisible(true);
                    }}
                />
            )}
            {planningView === "week" && (
                <PlanningWeek
                    events={planning}
                    startDate={currentStartDate}
                    isPlanningLoaded={isPlanningLoaded}
                    //Affiche les informations d'un cours dans une modal
                    setSelectedEvent={(planningEvent) => {
                        setSelectedEvent(findEvent(planning, planningEvent));
                        setEventModalInfoVisible(true);
                    }}
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
        alignSelf: "flex-end",
        marginTop: 20,
        marginRight: 20,
        marginBottom: 20,
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
