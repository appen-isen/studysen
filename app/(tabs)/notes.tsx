import { AnimatedPressable, MultiToggle } from "@/components/Buttons";
import NoteModal from "@/components/modals/NoteModal";
import { Bold, Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useNotesStore } from "@/stores/webaurionStore";
import { getSemester } from "@/utils/date";
import {
    calculateAverage,
    filterNotesBySemester,
    getDSNumber,
    getSubjectNameFromGroup,
    groupNotesBySubject
} from "@/utils/notes";
import { Note, NotesList } from "@/webAurion/utils/types";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Page, PageHeader } from "@/components/Page";
import { getColorFromNoteCode, getIconFromNoteCode } from "@/utils/colors";
import { Sheet } from "@/components/Sheet";
import { getResponsiveMaxWidth } from "@/utils/responsive";

export default function NotesScreen() {
    const router = useRouter();
    const [selectedSemester, setSelectedSemester] = useState<0 | 1>(
        getSemester()
    );
    // Affichage de la modal d'information sur la moyenne
    const [infoVisible, setInfoVisible] = useState(false);
    // Récupération des notes
    const { notes } = useNotesStore();

    // Tableau des notes du semestre sélectionné

    const selectedNotes = groupNotesBySubject(
        filterNotesBySemester(notes, selectedSemester)
    )
        // Tri des matières par nombre de notes
        .sort((a, b) => b.notes.length - a.notes.length);
    const noteAverageValue = calculateAverage(selectedNotes);

    // Note sélectionnée pour l'affichage de la modal
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [noteModalInfoVisible, setNoteModalInfoVisible] = useState(false);

    return (
        <Page style={styles.container} scrollable={true}>
            <PageHeader title="Mes Notes" returnTo="Accueil"></PageHeader>
            <View style={styles.contentView}>
                {/* Sélecteur de semestre */}
                <MultiToggle
                    options={["Semestre 1", "Semestre 2"]}
                    selectedIndex={selectedSemester}
                    onSelect={(index) => setSelectedSemester(index as 0 | 1)}
                />
                {/* Affichage de la moyenne générale si des notes sont disponibles */}
                {selectedNotes.length > 0 && (
                    <View style={styles.noteAverageView}>
                        <View>
                            <Text style={styles.noteAverageTitle}>
                                MOYENNE GÉNÉRALE
                            </Text>
                            <Text style={styles.noteAverageValue}>
                                {noteAverageValue}
                            </Text>
                        </View>
                        <View>
                            {/* Bouton d'information */}
                            <AnimatedPressable
                                onPress={() => setInfoVisible(true)}
                                style={styles.noteAverageInfo}
                            >
                                <MaterialIcons name="info-outline" size={20} />
                                <Text>En savoir plus</Text>
                            </AnimatedPressable>
                        </View>
                    </View>
                )}
                {/* Message si aucune note n'est disponible */}
                {selectedNotes.length === 0 && (
                    <View style={styles.noNoteContainer}>
                        <Text style={styles.noNoteText}>
                            Il n'y a pas encore de notes pour ce semestre
                        </Text>
                    </View>
                )}
                {/* Notes par matière */}
                {selectedNotes.map((notesList, index) => (
                    <NotesGroup
                        notesList={notesList}
                        setCurrentNote={(note) => {
                            //On sélectionne la note pour l'affichage de la modal
                            setCurrentNote(note);
                            setNoteModalInfoVisible(true);
                        }}
                        key={`group-${notesList.code}-${index}`}
                    ></NotesGroup>
                ))}
                {/* Modal d'informations sur le calcul de la moyenne */}
                <Sheet
                    visible={infoVisible}
                    setVisible={setInfoVisible}
                    sheetStyle={infoStyles.container}
                >
                    <Text style={infoStyles.subtitle}>
                        Attention aux moyennes
                    </Text>
                    <Text style={infoStyles.paragraph}>
                        Les moyennes affichées <Bold>ne sont pas</Bold> vos
                        vraies moyennes !
                    </Text>
                    <Text style={infoStyles.paragraph}>
                        L'application n'a <Bold>pas accès</Bold> aux{" "}
                        <Bold>coefficients</Bold> de chaque note. Les
                        <Text style={infoStyles.important}> moyennes</Text> des
                        matières sont donc{" "}
                        <Text style={infoStyles.important}> erronées</Text>. Il
                        en va de même pour la <Bold>moyenne générale</Bold>{" "}
                        affichée.
                    </Text>
                    <Text style={infoStyles.paragraph}>
                        Ces moyennes sont donc uniquement affichées{" "}
                        <Text style={infoStyles.important}>
                            à titre indicatif
                        </Text>
                        .
                    </Text>
                </Sheet>
                {/* Modal pour afficher les informations d'une note */}
                {currentNote && (
                    <NoteModal
                        note={currentNote}
                        visible={noteModalInfoVisible}
                        setVisible={setNoteModalInfoVisible}
                    ></NoteModal>
                )}
            </View>
        </Page>
    );
}

// Composant pour afficher un groupe de notes
function NotesGroup(props: {
    notesList: NotesList;
    setCurrentNote: (note: Note) => void;
}) {
    const notes = props.notesList.notes;
    return (
        <View style={notesGroupStyles.container}>
            {/* En-tête du groupe de notes */}
            <View style={notesGroupStyles.header}>
                {/* Matière */}
                <View style={notesGroupStyles.headerSubject}>
                    {/* Icône de la matière */}
                    <View
                        style={[
                            notesGroupStyles.headerIcon,
                            {
                                backgroundColor: getColorFromNoteCode(
                                    props.notesList.code
                                )
                            }
                        ]}
                    >
                        <MaterialIcons
                            name={getIconFromNoteCode(props.notesList.code)}
                            size={20}
                        />
                    </View>
                    <Text style={notesGroupStyles.headerSubjectText}>
                        {getSubjectNameFromGroup(notes)}
                    </Text>
                </View>
                {/* Moyenne */}
                <View style={notesGroupStyles.headerAverage}>
                    <Text style={notesGroupStyles.headerAverageText}>
                        {calculateAverage([props.notesList])}
                    </Text>
                </View>
            </View>

            {notes.length > 0 && (
                <View style={notesGroupStyles.content}>
                    {/* Couleur de la matière */}
                    <View
                        style={[
                            notesGroupStyles.groupSeparator,
                            {
                                backgroundColor: getColorFromNoteCode(
                                    props.notesList.code
                                )
                            }
                        ]}
                    ></View>
                    <View style={notesGroupStyles.notesTable}>
                        {/* En-tête du tableau des notes */}
                        <View style={notesGroupStyles.noteRow}>
                            <View style={notesGroupStyles.noteCol}>
                                <Text style={notesGroupStyles.tableTitles}>
                                    NOM
                                </Text>
                            </View>
                            <View style={notesGroupStyles.noteCol}>
                                <Text style={notesGroupStyles.tableTitles}>
                                    DATE
                                </Text>
                            </View>
                            <View style={notesGroupStyles.noteCol}>
                                <Text style={notesGroupStyles.tableTitles}>
                                    NOTE
                                </Text>
                            </View>
                        </View>

                        {/* Notes */}
                        {notes.map((note, index) => (
                            <View
                                style={notesGroupStyles.noteContainer}
                                key={`note-container-${note.code}-${index}`}
                            >
                                {/* Barre de séparation entre les notes */}
                                <View
                                    style={notesGroupStyles.noteSeparator}
                                    key={`note-separator-${note.code}-${index}`}
                                ></View>
                                {/* Ligne de la note */}
                                <TouchableOpacity
                                    style={notesGroupStyles.noteRow}
                                    // Affichage de la modal au clic
                                    onPress={() => props.setCurrentNote(note)}
                                    key={`note-${note.code}-${index}`}
                                >
                                    {/* Nom du DS */}
                                    <View
                                        style={notesGroupStyles.noteCol}
                                        key={`note-col-name-${note.code}-${index}`}
                                    >
                                        <Text
                                            style={notesGroupStyles.noteName}
                                            key={`note-name-${note.code}-${index}`}
                                        >
                                            {getDSNumber(note.code)}
                                        </Text>
                                    </View>
                                    {/* Date de la note */}
                                    <View
                                        style={notesGroupStyles.noteCol}
                                        key={`note-col-date-${note.code}-${index}`}
                                    >
                                        <Text
                                            style={notesGroupStyles.noteDate}
                                            key={`note-date-${note.code}-${index}`}
                                        >
                                            {note.date}
                                        </Text>
                                    </View>
                                    {/* Valeur de la note */}
                                    <View
                                        style={notesGroupStyles.noteCol}
                                        key={`note-col-value-${note.code}-${index}`}
                                    >
                                        <Text
                                            style={notesGroupStyles.noteValue}
                                            key={`note-value-${note.code}-${index}`}
                                        >
                                            {note.note}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        gap: 25
    },
    topbar: {
        flexDirection: "row",
        alignItems: "center"
    },
    backIcon: {
        fontSize: 40,
        margin: 20,
        color: Colors.primary
    },
    contentView: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center"
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.primary
    },
    // Sélecteur de semestre
    semesterSelector: {
        marginTop: 10
    },
    selectorText: {
        fontSize: 18,
        color: Colors.primary,
        fontWeight: "bold",
        marginVertical: 5
    },
    // Moyenne générale
    noteAverageView: {
        width: "100%",
        maxWidth: getResponsiveMaxWidth(),
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 40
    },
    noteAverageTitle: {
        fontSize: 14,
        color: Colors.gray,
        fontWeight: "bold"
    },
    // Valeur de la moyenne
    noteAverageValue: {
        color: Colors.black,
        fontWeight: "600",
        fontSize: 30,
        marginRight: 10
    },
    // Info sur la moyenne
    noteAverageInfo: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        borderRadius: 8,
        backgroundColor: Colors.light,
        padding: 6,
        marginTop: 15
    },
    // Conteneur de la liste de notes
    scrollView: {
        width: "100%"
    },
    scrollContainer: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 40,
        marginTop: 20
    },
    // Message si aucune note n'est disponible
    noNoteContainer: {
        marginTop: 40
    },
    noNoteText: {
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center"
    }
});

// Styles pour le composant NotesGroup
const notesGroupStyles = StyleSheet.create({
    container: {
        width: "100%",
        maxWidth: getResponsiveMaxWidth(),
        marginTop: 30
    },
    // En-tête du groupe de notes
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    headerSubject: {
        flex: 1,
        flexDirection: "row",
        gap: 10,
        alignItems: "center"
    },
    // Textes de l'en-tête
    headerSubjectText: {
        flex: 1,
        fontSize: 16,
        fontWeight: 600,
        color: Colors.black
    },
    headerIcon: {
        width: 30,
        height: 30,
        marginTop: 2,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center"
    },
    headerAverage: {
        backgroundColor: Colors.light,
        width: 75,
        height: 40,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center"
    },
    headerAverageText: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.black
    },
    // Contenu du groupe de notes
    groupSeparator: {
        width: 4,
        height: "100%",
        borderRadius: 20
    },
    content: {
        flex: 1,
        width: "100%",
        flexDirection: "row",
        marginTop: 5
    },
    //Tableau des notes
    notesTable: {
        flex: 1,
        marginLeft: 15
    },
    tableTitles: {
        color: Colors.gray,
        fontSize: 14,
        fontWeight: 600
    },
    noteRow: {
        flexDirection: "row",
        alignItems: "center"
    },
    noteCol: {
        flex: 1,
        paddingVertical: 5
    },
    noteSeparator: {
        height: 1,
        marginVertical: 3,
        backgroundColor: Colors.light
    },
    noteContainer: {},
    noteName: {
        fontSize: 16,
        fontWeight: 600,
        color: Colors.black
    },
    noteDate: {
        fontSize: 14,
        color: Colors.gray
    },
    noteValue: {
        borderRadius: 5,
        backgroundColor: Colors.light,
        width: 60,
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center"
    }
});

// Styles pour la modal d'information de la moyenne
const infoStyles = StyleSheet.create({
    container: {
        alignItems: "flex-start",
        padding: 20,
        gap: 20
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "bold",
        backgroundColor: Colors.primary,
        color: Colors.white,
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5
    },
    paragraph: {
        color: Colors.darkGray
    },
    important: {
        color: Colors.primary,
        fontWeight: "bold"
    },
    link: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        backgroundColor: Colors.light,
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5
    }
});
