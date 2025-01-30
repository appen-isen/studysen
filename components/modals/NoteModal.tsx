import { Note } from "@/webAurion/utils/types";
import { View, StyleSheet, ScrollView } from "react-native";
import { Bold, Text } from "../Texts";
import Colors from "@/constants/Colors";
import { BottomModal } from "../Modals";
import {
    getDSNumber,
    getSemesterFromCode,
    getSubjectName,
} from "@/utils/notes";

type NoteModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    note: Note;
    noteCode: string;
};
export default function NoteModal(props: NoteModalProps) {
    const { note, noteCode } = props;
    return (
        <BottomModal
            setVisible={props.setVisible}
            visible={props.visible}
            flexSize={0.5}
        >
            {/* Info sur la matière */}
            <Text style={styles.title}>{getSubjectName(note.subject)}</Text>
            {/* Nom du DS */}
            <Text style={styles.noteName}>
                {getDSNumber(note.code)} S{getSemesterFromCode(noteCode)}
            </Text>
            {/* Info sur la note */}
            <View style={styles.infoContainer}>
                {/* Date de début */}
                <View style={styles.infoBox}>
                    <Bold style={styles.infoTitle}>Date</Bold>
                    <Text style={styles.infoText}>{note.date}</Text>
                </View>
                {/* Séparateur */}
                <View style={[styles.separator]}></View>
                {/* Date de fin */}
                <View style={styles.infoBox}>
                    <Bold style={styles.infoTitle}>Note</Bold>
                    <Text style={styles.infoText}>
                        {/* S'il n'y a pas de note, on affiche l'appréciation à la place */}
                        {note.note === "-" && note.description
                            ? note.description
                            : note.note}
                    </Text>
                </View>
            </View>

            {/* Intervenants */}
            <Text style={styles.peopleInfoTitle}>Intervenants</Text>
            <ScrollView style={styles.infoScrollView}>
                <Text style={styles.peopleInfo}>{note.instructor}</Text>
            </ScrollView>
        </BottomModal>
    );
}

const styles = StyleSheet.create({
    //Contenu de la modal

    //Titre de la matière
    title: {
        fontSize: 25,
        color: Colors.primaryColor,
        fontWeight: "bold",
        alignSelf: "center",
        textAlign: "center",
    },
    noteName: {
        fontSize: 20,
        color: "black",
        fontWeight: "bold",
        alignSelf: "center",
        marginTop: 20,
        textAlign: "center",
    },
    //Affichage des informations sur la note (date et valeur)
    infoContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        alignSelf: "center",
        width: "100%",
        marginVertical: 40,
    },
    separator: {
        width: 4,
        height: 40,
        borderRadius: 10,
        backgroundColor: Colors.primaryColor,
    },
    infoBox: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "40%",
    },
    infoTitle: {
        fontSize: 20,
        color: Colors.primaryColor,
    },
    infoText: {
        fontSize: 18,
    },
    //Intervenants et Etudiants
    peopleInfoTitle: {
        color: Colors.primaryColor,
        textDecorationLine: "underline",
        fontWeight: "bold",
        fontSize: 20,
        marginTop: 20,
    },
    peopleInfo: {
        alignSelf: "center",
        textAlign: "center",
        width: "90%",
        fontSize: 18,
        color: "black",
        marginTop: 5,
    },
    infoScrollView: {
        width: "100%",
        height: 30,
    },
});
