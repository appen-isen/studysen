import { AnimatedPressable, DoubleSelector } from "@/components/Buttons";
import NoteModal from "@/components/modals/NoteModal";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useNotesStore } from "@/store/webaurionStore";
import { getSemester } from "@/utils/date";
import {
    calculateAverage,
    filterNotesBySemester,
    getDSNumber,
    getSubjectNameFromGroup,
    groupNotesBySubject,
} from "@/utils/notes";
import { noteAverage } from "@/webAurion/utils/NoteUtils";
import { Note, NotesList } from "@/webAurion/utils/types";
import { Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotesScreen() {
    const router = useRouter();
    const [selectedSemester, setSelectedSemester] = useState<0 | 1>(
        getSemester()
    );
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
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Mes notes</Text>
            {/* Sélecteur de semestre */}
            <DoubleSelector
                selected={selectedSemester}
                setSelected={setSelectedSemester}
                firstSelector={
                    <Text
                        style={[
                            styles.selectorText,
                            selectedSemester === 0 && { color: "white" },
                        ]}
                    >
                        Semestre 1
                    </Text>
                }
                secondSelector={
                    <Text
                        style={[
                            styles.selectorText,
                            selectedSemester === 1 && { color: "white" },
                        ]}
                    >
                        Semestre 2
                    </Text>
                }
                containerStyle={styles.semesterSelector}
            ></DoubleSelector>

            {selectedNotes.length > 0 && (
                // Moyenne générale s'il y a des notes
                <View style={styles.noteAverageView}>
                    <Text style={styles.noteAverageTitle}>
                        Moyenne générale
                    </Text>
                    <View style={styles.noteAverageValContainer}>
                        {/* Valeur de la moyenne */}
                        <Text style={styles.noteAverageValue}>
                            {noteAverageValue}
                        </Text>
                        {/* Bouton d'information */}
                        <AnimatedPressable
                            onPress={() => router.push("/notes-help")}
                        >
                            <Octicons
                                name="info"
                                style={styles.noteAverageInfo}
                            />
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
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                style={styles.scrollView}
            >
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
            </ScrollView>
            {/* Modal pour afficher les informations d'une note */}
            {currentNote && (
                <NoteModal
                    note={currentNote}
                    noteCode={currentNote.code}
                    visible={noteModalInfoVisible}
                    setVisible={setNoteModalInfoVisible}
                ></NoteModal>
            )}
        </SafeAreaView>
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
                    <Text style={notesGroupStyles.headerSubjectText}>
                        {getSubjectNameFromGroup(notes)}
                    </Text>
                </View>
                {/* Moyenne */}
                <View style={notesGroupStyles.headerAverage}>
                    <Text style={notesGroupStyles.headerAverageText}>
                        {noteAverage(notes).toFixed(2)}
                    </Text>
                </View>
            </View>
            <View style={notesGroupStyles.content}>
                {/* Notes */}
                {notes.map((note, index) => (
                    <AnimatedPressable
                        style={notesGroupStyles.noteContainer}
                        // Affichage de la modal au clic
                        onPress={() => props.setCurrentNote(note)}
                        key={`note-${note.code}-${index}`}
                    >
                        <Text style={notesGroupStyles.noteNumber}>
                            {getDSNumber(note.code)}
                        </Text>
                        <Text style={notesGroupStyles.noteValue}>
                            {note.note}
                        </Text>
                    </AnimatedPressable>
                ))}
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "white",
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: Colors.primaryColor,
        marginTop: 20,
    },
    // Sélecteur de semestre
    semesterSelector: {
        marginTop: 20,
    },
    selectorText: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 5,
    },
    // Moyenne générale
    noteAverageView: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },
    noteAverageTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    // Valeur de la moyenne
    noteAverageValContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    noteAverageInfo: {
        color: Colors.primaryColor,
        fontSize: 25,
        textAlign: "center",
        marginLeft: 10,
    },
    noteAverageValue: {
        color: Colors.primaryColor,
        fontWeight: "bold",
        fontSize: 30,
        marginRight: 10,
    },
    // Conteneur de la liste de notes
    scrollView: {
        width: "100%",
    },
    scrollContainer: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 40,
        marginTop: 20,
    },
    // Message si aucune note n'est disponible
    noNoteContainer: {
        marginTop: 40,
    },
    noNoteText: {
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
});

// Styles pour le composant NotesGroup
const notesGroupStyles = StyleSheet.create({
    container: {
        width: "90%",
        maxWidth: 500,
        backgroundColor: "white",
        borderRadius: 10,
        boxShadow: "0px 0px 8px 2px rgba(0,0,0,0.1)",
        marginTop: 30,
    },
    // En-tête du groupe de notes
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        height: 60,
        padding: 3,
        backgroundColor: Colors.hexWithOpacity(Colors.primaryColor, 0.1),
    },
    headerSubject: {
        width: "79%",
        height: "80%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 5,
    },
    headerAverage: {
        width: "19%",
        height: "80%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 5,
    },
    // Textes de l'en-tête
    headerSubjectText: {
        fontSize: 16,
    },
    headerAverageText: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.primaryColor,
    },
    // Contenu du groupe de notes
    content: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: "wrap",
        alignItems: "center",
        padding: 10,
    },
    noteContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: Colors.primaryColor,
        borderRadius: 20,
        margin: "3.66%", // Adds spacing between items
    },
    noteNumber: {
        color: "white",
    },
    noteValue: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
