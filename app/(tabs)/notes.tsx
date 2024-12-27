import { AnimatedPressable, DoubleSelector } from "@/components/Buttons";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useNotesStore } from "@/store/webaurionStore";
import { getSemester } from "@/utils/date";
import {
    calculateAverage,
    filterNotesBySemester,
    getDSNumber,
    getRealSubjectName,
} from "@/utils/notes";
import { noteAverage } from "@/webAurion/utils/NoteUtils";
import { NotesList } from "@/webAurion/utils/types";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function NotesScreen() {
    const [selectedSemester, setSelectedSemester] = useState<0 | 1>(
        getSemester()
    );

    // Récupération des notes
    const { notes } = useNotesStore();
    const selectedNotes = filterNotesBySemester(notes, selectedSemester);
    const noteAverageValue = calculateAverage(selectedNotes);
    return (
        <View style={styles.container}>
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
            {/* Moyenne générale */}
            <View style={styles.noteAverageView}>
                <Text style={styles.noteAverageTitle}>Moyenne générale</Text>
                <Text style={styles.noteAverageValue}>{noteAverageValue}</Text>
            </View>
            {/* Notes par matière */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {selectedNotes.map((notesList, index) => (
                    <NotesGroup
                        notesList={notesList}
                        key={`group-${notesList.code}-${index}`}
                    ></NotesGroup>
                ))}
            </ScrollView>
        </View>
    );
}
function NotesGroup(props: { notesList: NotesList }) {
    return (
        <View style={notesGroupStyles.container}>
            {/* En-tête du groupe de notes */}
            <View style={notesGroupStyles.header}>
                {/* Matière */}
                <View style={notesGroupStyles.headerSubject}>
                    <Text style={notesGroupStyles.headerSubjectText}>
                        {getRealSubjectName(props.notesList.notes[0].subject)}
                    </Text>
                </View>
                {/* Moyenne */}
                <View style={notesGroupStyles.headerAverage}>
                    <Text style={notesGroupStyles.headerAverageText}>
                        {noteAverage(props.notesList.notes)}
                    </Text>
                </View>
            </View>
            <View style={notesGroupStyles.content}>
                {/* Notes */}
                {props.notesList.notes.map((note, index) => (
                    <AnimatedPressable
                        style={notesGroupStyles.noteContainer}
                        key={`note-${note.code}-${index}`}
                    >
                        <Text style={notesGroupStyles.noteNumber}>
                            DS{getDSNumber(note.subject)}
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
    noNoteText: {
        alignSelf: "center",
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
    noteAverageValue: {
        color: Colors.primaryColor,
        fontWeight: "bold",
        fontSize: 30,
        marginTop: 10,
    },
    // Conteneur de la liste de notes
    scrollContainer: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 40,
        marginTop: 20,
    },
});

// Styles pour le composant NotesGroup
const notesGroupStyles = StyleSheet.create({
    container: {
        width: "90%",
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
        flexWrap: "wrap",
        columnGap: 45,
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
        marginVertical: 10,
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
