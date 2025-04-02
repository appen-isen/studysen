import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View, ScrollView } from "react-native";
import { Text } from "@/components/Texts";
import { AnimatedPressable, Button } from "@/components/Buttons";
import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    useNotesStore,
    usePlanningStore,
    useSyncedPlanningStore
} from "@/stores/webaurionStore";
import useSessionStore from "@/stores/sessionStore";
import { getScheduleDates } from "@/webAurion/utils/PlanningUtils";
import { PlanningEvent } from "@/webAurion/utils/types";
import {
    findEvent,
    getCurrentEvent,
    getNextEventToday,
    mergePlanning,
    updatePlanningForListMode
} from "@/utils/planning";
import { ListEvent } from "@/components/planning/PlanningList";
import EventModal from "@/components/modals/EventModal";
import {
    calculateAverage,
    filterNotesBySemester,
    getLatestNotes
} from "@/utils/notes";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    cancelAllScheduledNotifications,
    requestPermissions,
    scheduleCourseNotification
} from "@/utils/notificationConfig";
import useSettingsStore from "@/stores/settingsStore";
import { getSemester } from "@/utils/date";
import { Page, PageHeader } from "@/components/Page";
import { NoteElement } from "@/components/Note";

export default function HomeScreen() {
    const router = useRouter();
    const { session } = useSessionStore();
    const { notes, setNotes } = useNotesStore();
    const { settings } = useSettingsStore();
    const [noteAverageValue, setNoteAverageValue] = useState<string>(
        //On calcule la moyenne des notes du semestre actuel
        calculateAverage(filterNotesBySemester(notes, getSemester()))
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
        requestPermissions();
        updateNotes();
        autoUpdatePlanningIfNeeded();

        const interval = setInterval(() => {
            autoUpdatePlanningIfNeeded(); // On regarde si on doit mettre à jour le planning toute les 30 secondes
        }, 30 * 1000);

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [lastUpdateTime]);

    //Nom de l'utilisateur et email
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstLetters, setFirstLetters] = useState("");
    useEffect(() => {
        if (settings.username) {
            const username = settings.username;
            setUsername(username);
            //Initiales du prénom et du nom
            const firstLetters = username.split(" ");
            setFirstLetters(firstLetters[0][0] + firstLetters[1][0]);

            //On convertit le Prénom Nom en email valide
            const normalizedName = username
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
            setEmail(
                normalizedName.replace(" ", ".") + "@isen-ouest.yncrea.fr"
            );
        }
    }, [settings]);

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
        setPlanningLoaded(false);
        // Calcul de la plage de dates pour la semaine
        const { startTimestamp, endTimestamp } = getScheduleDates(weekOffset);

        // Vérifier si des événements correspondant à cette plage de dates sont déjà présents
        const isWeekInPlanning = planning.some(
            (event) =>
                new Date(event.start).getTime() >= startTimestamp &&
                new Date(event.end).getTime() <= endTimestamp
        );
        // Pas besoin de retélécharger les événements si la semaine est déjà chargée
        if (isWeekInPlanning) {
            setPlanningLoaded(true);
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
                    // On met à jour la date de la dernière mise à jour
                    setLastUpdateTime(new Date());
                    //On planifie les notifications pour les cours
                    //On les supprime d'abord puis on les recrée avec le planning
                    cancelAllScheduledNotifications().then(() => {
                        if (settings.notificationsEnabled) {
                            const date = new Date();
                            currentWeekPlanning.forEach((event) => {
                                //Si l'événement n'est pas un congé et qu'il n'est pas déjà passé, on planifie une notification silencieuse
                                if (
                                    event.className !== "CONGES" &&
                                    new Date(event.start) > date
                                ) {
                                    scheduleCourseNotification(
                                        event.title || event.subject,
                                        event.room,
                                        new Date(event.start),
                                        email
                                    );
                                }
                            });
                        }
                    });
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
                    // On affiche la moyenne du semestre actuel
                    const filteredNotes = filterNotesBySemester(
                        fetchedNotes,
                        getSemester()
                    );
                    setNoteAverageValue(calculateAverage(filteredNotes));
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    };

    // Action lors de l'appui sur le bouton pour afficher les notes
    const handleViewNotes = () => {
        router.push("/notes");
    };

    // Demande de permission pour les notifications
    requestPermissions();

    return (
        <Page style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
            >
                {/* En tête de la page */}
                <PageHeader title="Accueil"></PageHeader>
                {/* Affichage prénom */}
                <View style={[sectionStyles.section, styles.welcomeBox]}>
                    <Text style={styles.heyText}>
                        Salut,{" "}
                        <Text style={styles.firstnameText}>
                            {settings.username.split(" ")[0]}
                        </Text>
                    </Text>
                </View>
                {/* événement en cours */}
                <View style={sectionStyles.section}>
                    {/* Titre de la section */}
                    <Text style={sectionStyles.titleText}>EN CE MOMENT</Text>
                    {/* Si le planning est chargé, on affiche l'événement */}
                    {isPlanningLoaded ? (
                        <View style={sectionStyles.content}>
                            {/* Événement en cours */}
                            {getCurrentEvent(formattedPlanning) !== null && (
                                <ListEvent
                                    event={getCurrentEvent(formattedPlanning)!}
                                    handleLayout={() => {}}
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
                                                    planningEvent
                                                )
                                            );
                                        }
                                        setEventModalInfoVisible(true);
                                    }}
                                />
                            )}
                            {/* Événement à venir */}
                            {getNextEventToday(formattedPlanning) !== null && (
                                <ListEvent
                                    event={
                                        getNextEventToday(formattedPlanning)!
                                    }
                                    handleLayout={() => {}}
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
                                                    planningEvent
                                                )
                                            );
                                        }
                                        setEventModalInfoVisible(true);
                                    }}
                                />
                            )}
                            {/* Si aucun événement n'est trouvé, on affiche un message */}
                            {getCurrentEvent(formattedPlanning) === null &&
                                getNextEventToday(formattedPlanning) ===
                                    null && (
                                    <Text style={styles.noEventText}>
                                        Aucun événement à venir aujourd'hui
                                    </Text>
                                )}
                        </View>
                    ) : (
                        //Sinon on affiche un loader
                        <ActivityIndicator
                            animating={true}
                            color={Colors.primary}
                            size={50}
                        />
                    )}
                </View>
                {/* Notes */}
                <View style={sectionStyles.section}>
                    {/* Titre de la section */}
                    <Text style={sectionStyles.titleText}>NOTES RÉCENTES</Text>
                    {/* Contenu de la section */}
                    <View style={sectionStyles.content}>
                        {/* On récupère et affiche les trois dernières notes */}
                        <View>
                            {getLatestNotes(notes, 3).map((note, index) => (
                                <NoteElement
                                    key={note.code + index}
                                    note={note}
                                />
                            ))}
                        </View>
                        {/* Bouton pour voir toutes les notes */}
                        <AnimatedPressable
                            style={styles.allNotesButton}
                            //On redirige vers l'onglet notes
                            onPress={handleViewNotes}
                            scale={0.9}
                        >
                            <View style={styles.allNotesButtonContent}>
                                <MaterialCommunityIcons
                                    name="dots-horizontal"
                                    size={20}
                                    color={Colors.black}
                                />
                                <Text style={styles.allNotesButtonText}>
                                    Voir plus
                                </Text>
                            </View>
                        </AnimatedPressable>
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
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 25
    },
    scrollView: {
        width: "100%"
    },
    scrollContainer: {
        alignItems: "center",
        justifyContent: "flex-start",
        paddingBottom: 20
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.primary,
        marginTop: 20
    },
    //Texte de bienvenue
    welcomeBox: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "100%"
    },
    heyText: {
        fontSize: 25
    },
    firstnameText: {
        color: Colors.primary
    },
    // Texte quand il n'y a pas d'événement
    noEventText: {
        fontSize: 16,
        textAlign: "center"
    },
    //Notes
    allNotesButton: {
        borderRadius: 5,
        backgroundColor: Colors.light,
        alignSelf: "flex-start",
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    allNotesButtonContent: {
        flexDirection: "row",
        gap: 10
    },
    allNotesButtonText: {
        fontSize: 14,
        fontWeight: "normal",
        color: Colors.black
    }
});

// Styles pour les sections
const sectionStyles = StyleSheet.create({
    section: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: 600,
        marginTop: 35
    },
    titleText: {
        fontSize: 16,
        color: Colors.gray,
        fontWeight: "bold",
        alignSelf: "flex-start"
    },
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 140,
        width: "100%",
        gap: 15,
        marginTop: 10
    }
});
