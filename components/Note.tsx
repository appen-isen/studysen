import { Note } from "@/webAurion/utils/types";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "./Texts";
import { truncateString } from "@/utils/planning";
import { getSubjectName } from "@/utils/notes";
import Colors from "@/constants/Colors";
import { getColorFromNoteCode, getSubjectColor } from "@/utils/colors";

// Composant qui réprésente une note
export function NoteElement(props: {
    note: Note;
    onPress: (note: Note) => void;
}) {
    const { note } = props;
    const subjectName = getSubjectName(note.subject);
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => props.onPress(note)}
        >
            {/* Contenu de gauche */}
            <View style={styles.titleBox}>
                {/* Barre de couleur de la matière */}
                <View
                    style={[
                        styles.noteBar,
                        {
                            backgroundColor: getColorFromNoteCode(note.code)
                        }
                    ]}
                ></View>
                {/* Nom de la matière */}
                <Text style={styles.subjectText}>
                    {truncateString(subjectName.toUpperCase(), 25)}
                </Text>
            </View>
            {/* Contenu de droite*/}
            <View style={styles.infoBox}>
                {/* Date de la note */}
                <Text style={styles.noteDate}>{note.date}</Text>
                {/* Valeur de la note */}
                <View style={styles.noteValueBox}>
                    <Text style={styles.noteValue}>
                        {note.note.replace(".", ",")}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: 40
    },
    titleBox: {
        width: "60%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    infoBox: {
        width: "40%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10
    },
    noteBar: {
        width: 4,
        height: "70%",
        borderRadius: 5
    },
    subjectText: {
        fontSize: 13
    },
    noteDate: {
        fontSize: 12,
        color: Colors.gray
    },
    noteValueBox: {
        borderRadius: 5,
        backgroundColor: Colors.light,
        justifyContent: "center",
        alignItems: "center",
        width: 50,
        height: 30
    },
    noteValue: {
        fontSize: 15,
        fontWeight: 600
    }
});
