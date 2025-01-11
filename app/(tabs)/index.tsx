import { ActivityIndicator, StyleSheet, View, ScrollView } from "react-native";
import { Text } from "@/components/Texts";
import { Button } from "@/components/Buttons";
import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    useNotesStore,
    usePlanningStore,
    useSyncedPlanningStore,
} from "@/store/webaurionStore";
import useSessionStore from "@/store/sessionStore";
import { getScheduleDates } from "@/webAurion/utils/PlanningUtils";
import { PlanningEvent } from "@/webAurion/utils/types";
import {
    findEvent,
    getCurrentEvent,
    getNextEventToday,
    updatePlanningForListMode,
} from "@/utils/planning";
import { ListEvent } from "@/components/planning/PlanningList";
import EventModal from "@/components/modals/EventModal";
import { calculateAverage } from "@/utils/notes";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const router = useRouter();
    const { session } = useSessionStore();
    const { notes, setNotes } = useNotesStore();
    const [noteAverageValue, setNoteAverageValue] = useState<string>(
        calculateAverage(notes)
    );
    // Gestion du planning
    const { planning, setPlanning } = usePlanningStore();
    const [isPlanningLoaded, setPlanningLoaded] = useState(false);
    const { setSyncedPlanning, clearSyncedPlanning } = useSyncedPlanningStore();
    //Permet de stocker la date de la dernière mise à jour du planning
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

    // On formate le planning pour le mode liste
    const formattedPlanning = updatePlanningForListMode(planning);

    //Permet de stocker l'événement sélectionné pour l'afficher dans la modal
    const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>();
    const [eventModalInfoVisible, setEventModalInfoVisible] = useState(false);

    //Lorsque la page est chargée
    useEffect(() => {
        updateNotes();
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
                    new Date(event.end).getTime() <= endTimestamp,
            );
            // Pas besoin de retélécharger les événements si la semaine est déjà chargée
            if (isWeekInPlanning) {
                setPlanningLoaded(true);
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
                                    (newEvent) => newEvent.id === event.id,
                                ),
                        ),
                        ...currentWeekPlanning,
                    ]);
                    setPlanningLoaded(true);
                    // Mettre à jour le planning synchronisé
                    setSyncedPlanning([
                        ...useSyncedPlanningStore.getState().syncedPlanning,
                        ...currentWeekPlanning,
                    ]);
                    // On met à jour la date de la dernière mise à jour
                    setLastUpdateTime(new Date());
                })
                .catch((error) => {
                    console.error(error);
                    setPlanningLoaded(true);
                });
        }
    };

    // Fonction pour mettre à jour les notes
    const updateNotes = () => {
        if (session) {
            // Requête pour charger les notes
            session
                .getNotesApi()
                .fetchNotes()
                .then((fetchedNotes) => {
                    setNotes(fetchedNotes);
                    setNoteAverageValue(calculateAverage(fetchedNotes));
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    // Action lors de l'appui sur le bouton pour afficher les notes
    const handleViewNotes = () => {
        // Si l'utilisateur a des notes, on redirige vers l'onglet notes
        if (notes.length > 0) {
            router.push("/notes");
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Accueil</Text>
                {/* événement en cours */}
                <View style={sectionStyles.section}>
                    {/* Titre de la section */}
                    <View style={sectionStyles.titleBox}>
                        <MaterialCommunityIcons
                            name="calendar-check"
                            style={sectionStyles.icon}
                        />
                        <Text style={sectionStyles.titleText}>
                            ACTUELLEMENT
                        </Text>
                    </View>
                    {/* Contenu de la section */}
                    <View style={sectionStyles.content}>
                        {/* Si le planning est chargé, on affiche l'événement */}
                        {isPlanningLoaded ? (
                            getCurrentEvent(formattedPlanning) !== null ? (
                                <ListEvent
                                    event={getCurrentEvent(formattedPlanning)!}
                                    //Affiche les informations d'un cours dans une modal
                                    onPress={(planningEvent) => {
                                        //Si c'est un congé, on affiche directement les informations
                                        if (
                                            planningEvent.className === "CONGES"
                                        ) {
                                            setSelectedEvent(planningEvent);
                                        } else {
                                            //Sinon on affiche les informations complètes de l'événement
                                            setSelectedEvent(
                                                findEvent(
                                                    planning,
                                                    planningEvent,
                                                ),
                                            );
                                        }
                                        setEventModalInfoVisible(true);
                                    }}
                                />
                            ) : (
                                <Text style={styles.noEventText}>
                                    Aucun événement en cours
                                </Text>
                            )
                        ) : (
                            //Sinon on affiche un loader
                            <ActivityIndicator
                                animating={true}
                                color={Colors.primaryColor}
                                size={50}
                            />
                        )}
                    </View>
                </View>

                {/* événement à venir */}
                <View style={sectionStyles.section}>
                    {/* Titre de la section */}
                    <View style={sectionStyles.titleBox}>
                        <MaterialCommunityIcons
                            name="calendar-start"
                            style={sectionStyles.icon}
                        />
                        <Text style={sectionStyles.titleText}>À VENIR</Text>
                    </View>
                    {/* Contenu de la section */}
                    <View style={sectionStyles.content}>
                        {/* Si le planning est chargé, on affiche l'événement */}
                        {isPlanningLoaded ? (
                            getNextEventToday(formattedPlanning) !== null ? (
                                <ListEvent
                                    event={
                                        getNextEventToday(formattedPlanning)!
                                    }
                                    //Affiche les informations d'un cours dans une modal
                                    onPress={(planningEvent) => {
                                        //Si c'est un congé, on affiche directement les informations
                                        if (
                                            planningEvent.className === "CONGES"
                                        ) {
                                            setSelectedEvent(planningEvent);
                                        } else {
                                            //Sinon on affiche les informations complètes de l'événement
                                            setSelectedEvent(
                                                findEvent(
                                                    planning,
                                                    planningEvent,
                                                ),
                                            );
                                        }
                                        setEventModalInfoVisible(true);
                                    }}
                                />
                            ) : (
                                <Text style={styles.noEventText}>
                                    Aucun événement à venir aujourd'hui
                                </Text>
                            )
                        ) : (
                            //Sinon on affiche un loader
                            <ActivityIndicator
                                animating={true}
                                color={Colors.primaryColor}
                                size={50}
                            />
                        )}
                    </View>
                </View>

                {/* Notes */}
                <View style={sectionStyles.section}>
                    {/* Titre de la section */}
                    <View style={sectionStyles.titleBox}>
                        <MaterialCommunityIcons
                            name="school-outline"
                            style={sectionStyles.icon}
                        />
                        <Text style={sectionStyles.titleText}>MES NOTES</Text>
                    </View>
                    {/* Contenu de la section */}
                    <View style={sectionStyles.content}>
                        <Text style={styles.noteTitle}> Moyenne générale</Text>
                        <Text style={styles.noteValue}>{noteAverageValue}</Text>
                        <Button
                            title="Voir mes notes"
                            //On redirige vers l'onglet notes
                            onPress={handleViewNotes}
                        ></Button>
                    </View>
                </View>

                {/* Modal pour afficher les informations d'un cours */}
                {selectedEvent && (
                    <EventModal
                        event={selectedEvent}
                        visible={eventModalInfoVisible}
                        setVisible={setEventModalInfoVisible}
                    ></EventModal>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "white",
    },
    scrollContainer: {
        alignItems: "center",
        justifyContent: "flex-start",
        paddingBottom: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.primaryColor,
        marginTop: 20,
    },
    noEventText: {
        fontSize: 16,
        textAlign: "center",
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    noteValue: {
        color: Colors.primaryColor,
        fontWeight: "bold",
        fontSize: 30,
        marginTop: 10,
    },
});

// Styles pour les sections
const sectionStyles = StyleSheet.create({
    section: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "90%",
        maxWidth: 600,
        marginTop: 35,
    },
    titleBox: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
    },
    icon: {
        fontSize: 35,
        color: Colors.primaryColor,
        marginRight: 15,
    },
    titleText: {
        fontSize: 20,
        fontWeight: "bold",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 140,
        width: "100%",
        marginTop: 20,
    },
});
