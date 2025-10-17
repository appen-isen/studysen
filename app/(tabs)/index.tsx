import { useEffect, useState } from "react";
import { StyleSheet, View, RefreshControl } from "react-native";
import { Text } from "@/components/Texts";
import { AnimatedPressable } from "@/components/Buttons";
import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNotesStore, usePlanningStore } from "@/stores/webaurionStore";
import { useSyncStore } from "@/stores/syncStore";
import { syncData } from "@/services/syncService";
import { Note, PlanningEvent } from "@/webAurion/utils/types";
import {
    findEvent,
    getCurrentEvent,
    getNextEventToday,
    updatePlanningForListMode
} from "@/utils/planning";
import { ListEvent } from "@/components/planning/PlanningList";
import EventModal from "@/components/modals/EventModal";
import { getLatestNotes } from "@/utils/notes";
import { useRouter } from "expo-router";
import {
    registerDeviceForNotifications,
    requestPermissions
} from "@/utils/notificationConfig";
import useSettingsStore, { campusToId } from "@/stores/settingsStore";
import { Page, PageHeader } from "@/components/Page";
import { NoteElement } from "@/components/Note";
import NoteModal from "@/components/modals/NoteModal";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { getFirstNameFromName } from "@/utils/account";
import { SyncBadge } from "@/components/Sync";

export default function HomeScreen() {
    const router = useRouter();
    const { notes } = useNotesStore();
    const { settings } = useSettingsStore();
    const { syncStatus } = useSyncStore();
    // Gestion du planning
    const { planning } = usePlanningStore();
    // On formate le planning pour le mode liste
    const formattedPlanning = updatePlanningForListMode(planning);

    //Permet de stocker l'événement sélectionné pour l'afficher dans la modal
    const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>();
    const [eventModalInfoVisible, setEventModalInfoVisible] = useState(false);
    //Permet de stocker la note sélectionnée pour l'afficher dans la modal
    const [selectedNote, setSelectedNote] = useState<Note | null>();
    const [noteModalInfoVisible, setNoteModalInfoVisible] = useState(false);

    // État pour le pull-to-refresh
    const isRefreshing = syncStatus === "syncing";
    const onRefresh = () => {
        syncData();
    };

    // Lorsque la page est chargée, on demande les permissions pour les notifications
    useEffect(() => {
        requestPermissions().then((granted) => {
            // On enregistre l'appareil pour les notifications
            if (granted && settings.clubsNotifications) {
                registerDeviceForNotifications(campusToId(settings.campus));
            }
        });
    }, []);

    // Action lors de l'appui sur le bouton pour afficher les notes
    const handleViewNotes = () => {
        router.push("/notes");
    };

    return (
        <Page
            style={styles.container}
            scrollable={true}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={[Colors.primary]} // Android
                    tintColor={Colors.primary} // iOS
                />
            }
        >
            <SyncBadge />
            {/* En tête de la page */}
            <PageHeader title="Accueil" />
            {/* Affichage prénom */}
            <View style={[sectionStyles.section, styles.welcomeBox]}>
                <Text style={styles.heyText}>
                    Salut,{" "}
                    <Text style={styles.firstnameText}>
                        {getFirstNameFromName(settings.username)}
                    </Text>
                </Text>
            </View>
            {/* événement en cours */}
            <View style={sectionStyles.section}>
                {/* Titre de la section */}
                <Text style={sectionStyles.titleText}>EN CE MOMENT</Text>

                <View style={sectionStyles.content}>
                    {/* Événement en cours */}
                    {getCurrentEvent(formattedPlanning) !== null && (
                        <ListEvent
                            event={getCurrentEvent(formattedPlanning)!}
                            handleLayout={() => {}}
                            //Affiche les informations d'un cours dans une modal
                            onPress={(planningEvent) => {
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
                    {/* Événement à venir */}
                    {getNextEventToday(formattedPlanning) !== null && (
                        <ListEvent
                            event={getNextEventToday(formattedPlanning)!}
                            handleLayout={() => {}}
                            //Affiche les informations d'un cours dans une modal
                            onPress={(planningEvent) => {
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
                    {/* Si aucun événement n'est trouvé, on affiche un message */}
                    {getCurrentEvent(formattedPlanning) === null &&
                        getNextEventToday(formattedPlanning) === null && (
                            <Text style={styles.noEventText}>
                                Aucun événement à venir aujourd'hui
                            </Text>
                        )}
                </View>
            </View>
            {/* Notes */}
            <View style={sectionStyles.section}>
                {/* Titre de la section */}
                <Text style={sectionStyles.titleText}>NOTES RÉCENTES</Text>
                {/* Contenu de la section */}
                <View style={sectionStyles.content}>
                    {/* On récupère et affiche les trois dernières notes */}
                    <View style={{ width: "100%" }}>
                        {getLatestNotes(notes, 3).map((note, index) => (
                            <NoteElement
                                key={note.code + index}
                                note={note}
                                onPress={() => {
                                    setSelectedNote(note);
                                    setNoteModalInfoVisible(true);
                                }}
                            />
                        ))}
                        {/* S'il n'y a pas de notes */}
                        {notes.length === 0 && (
                            <Text style={styles.noEventText}>
                                Aucune note récente pour le moment
                            </Text>
                        )}
                    </View>
                    {notes.length > 0 && (
                        // Bouton pour voir toutes les notes
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
                    )}
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
            {/* Modal pour afficher les informations d'une note */}
            {selectedNote && (
                <NoteModal
                    note={selectedNote}
                    visible={noteModalInfoVisible}
                    setVisible={setNoteModalInfoVisible}
                ></NoteModal>
            )}
            {/* Modal pour afficher les informations d'une note */}
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 35
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
        color: Colors.primary
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
        alignSelf: "center",
        width: "100%",
        maxWidth: getResponsiveMaxWidth()
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
        gap: 15
    }
});
