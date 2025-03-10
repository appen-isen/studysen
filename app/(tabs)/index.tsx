import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    View,
    ScrollView,
    Linking
} from "react-native";
import { Text } from "@/components/Texts";
import { Button } from "@/components/Buttons";
import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
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
    updatePlanningForListMode
} from "@/utils/planning";
import { ListEvent } from "@/components/planning/PlanningList";
import EventModal from "@/components/modals/EventModal";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    cancelAllScheduledNotifications,
    requestPermissions,
    scheduleCourseNotification
} from "@/utils/notificationConfig";
import useSettingsStore from "@/stores/settingsStore";

export default function HomeScreen() {
    const router = useRouter();
    const { session } = useSessionStore();
    const { settings } = useSettingsStore();
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

        // Calcul de la plage de dates pour la semaine actuelle
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
            // Requête pour charger les événements de la semaine actuelle
            session
                .getPlanningApi()
                .fetchPlanning(weekOffset)
                .catch((error) => {
                    console.error(error);
                    setPlanningLoaded(true);
                });

            // Si on est sur la semaine actuelle, on charge aussi la semaine prochaine pour les notifications
            if (weekOffset === 0) {
                session
                    .getPlanningApi()
                    .fetchPlanning(1)
                    .catch((error) => {
                        console.error(
                            "Erreur lors du chargement de la semaine prochaine:",
                            error
                        );
                    });
            }

            // Pour les notifications, on veut les événements de cette semaine ET de la semaine prochaine
            const currentWeekEvents = planning.filter((event) => {
                const eventDate = new Date(event.start);
                return eventDate.getTime() >= startTimestamp;
            });

            // Planifier les notifications pour les deux semaines
            scheduleNotificationsForEvents(currentWeekEvents, email, settings);
        }
    };

    // Fonction pour planifier les notifications
    const scheduleNotificationsForEvents = (
        events: PlanningEvent[],
        userEmail: string,
        settings: any
    ) => {
        cancelAllScheduledNotifications()
            .then(() => {
                if (settings.notificationsEnabled) {
                    console.log(
                        "Notifications enabled, scheduling new notifications..."
                    );
                    const date = new Date();
                    let scheduledCount = 0;

                    console.log(`Total events found: ${events.length}`);
                    let eligibleCount = 0;

                    // Use Promise.all to properly handle all notification scheduling
                    const notificationPromises = events
                        .filter((event) => {
                            const eventDate = new Date(event.start);
                            const isInFuture = eventDate > date;
                            const isNotHoliday = event.className !== "CONGES";

                            if (isNotHoliday && isInFuture) {
                                eligibleCount++;
                                return true;
                            }
                            return false;
                        })
                        .map((event) => {
                            // Add a try-catch block for each individual promise
                            return new Promise((resolve) => {
                                try {
                                    // Safely handle each notification scheduling
                                    scheduleCourseNotification(
                                        event.title || event.subject,
                                        event.room,
                                        new Date(event.start)
                                    )
                                        .then((result) => {
                                            if (result) {
                                                scheduledCount++;
                                            } else {
                                            }
                                            resolve(true);
                                        })
                                        .catch((error) => {
                                            console.error(
                                                `× Error scheduling individual notification: ${error.message || error}`
                                            );
                                            resolve(false);
                                        });
                                } catch (error) {
                                    console.error(
                                        `× Exception in notification scheduling: ${error}`
                                    );
                                    resolve(false);
                                }
                            });
                        });

                    // Wait for all notifications to be processed
                    Promise.all(notificationPromises).catch((error) => {
                        console.error(
                            `Error in notification batch processing: ${error}`
                        );
                    });

                    console.log(
                        `Attempted to schedule notifications for ${eligibleCount} events`
                    );
                } else {
                    console.log("Notifications are disabled in settings");
                }
            })
            .catch((error) => {
                console.error(`Error in notification process: ${error}`);
            });
    };

    // Action lors de l'appui sur le bouton pour afficher les notes
    const handleViewNotes = () => {
        Linking.openURL(
            "https://web.isen-ouest.fr/webAurion/faces/LearnerNotationListPage.xhtml"
        );
    };

    // Demande de permission pour les notifications
    requestPermissions();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                style={styles.scrollView}
            >
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
                            ) : (
                                <Text style={styles.noEventText}>
                                    Aucun événement en cours
                                </Text>
                            )
                        ) : (
                            //Sinon on affiche un loader
                            <ActivityIndicator
                                animating={true}
                                color={Colors.primary}
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
                            ) : (
                                <Text style={styles.noEventText}>
                                    Aucun événement à venir aujourd'hui
                                </Text>
                            )
                        ) : (
                            //Sinon on affiche un loader
                            <ActivityIndicator
                                animating={true}
                                color={Colors.primary}
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
        backgroundColor: "white"
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
    noEventText: {
        fontSize: 16,
        textAlign: "center"
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: "bold"
    },
    noteValue: {
        color: Colors.primary,
        fontWeight: "bold",
        fontSize: 30,
        marginTop: 10
    }
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
        marginTop: 35
    },
    titleBox: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%"
    },
    icon: {
        fontSize: 35,
        color: Colors.primary,
        marginRight: 15
    },
    titleText: {
        fontSize: 20,
        fontWeight: "bold"
    },
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 140,
        width: "100%",
        marginTop: 20
    }
});
