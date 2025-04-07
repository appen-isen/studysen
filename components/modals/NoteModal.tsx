import { Note } from "@/webAurion/utils/types";
import { View, StyleSheet } from "react-native";
import { Text } from "../Texts";
import Colors from "@/constants/Colors";
import { getSubjectName } from "@/utils/notes";
import { Sheet } from "../Sheet";
import { MaterialIcons } from "@expo/vector-icons";
import {
    getColorFromNoteCode,
    getIconFromNoteCode,
    getSubjectColor,
    getSubjectIcon
} from "@/utils/colors";

type NoteModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    note: Note;
};
export default function NoteModal(props: NoteModalProps) {
    const { note, visible, setVisible } = props;
    return (
        // <BottomModal
        //     setVisible={props.setVisible}
        //     visible={props.visible}
        //     flexSize={0.5}
        // >
        //     {/* Info sur la matière */}
        //     <Text style={styles.title}>{getSubjectName(note.subject)}</Text>
        //     {/* Nom du DS */}
        //     <Text style={styles.noteName}>
        //         {getDSNumber(note.code)} S{getSemesterFromCode(note.code)}
        //     </Text>
        //     {/* Info sur la note */}
        //     <View style={styles.infoContainer}>
        //         {/* Date de début */}
        //         <View style={styles.infoBox}>
        //             <Bold style={styles.infoTitle}>Date</Bold>
        //             <Text style={styles.infoText}>{note.date}</Text>
        //         </View>
        //         {/* Séparateur */}
        //         <View style={[styles.separator]}></View>
        //         {/* Date de fin */}
        //         <View style={styles.infoBox}>
        //             <Bold style={styles.infoTitle}>Note</Bold>
        //             <Text style={styles.infoText}>
        //                 {/* S'il n'y a pas de note, on affiche l'appréciation à la place */}
        //                 {note.note === "-" && note.description
        //                     ? note.description
        //                     : note.note}
        //             </Text>
        //         </View>
        //     </View>

        //     {/* Intervenants */}
        //     <Text style={styles.peopleInfoTitle}>Intervenants</Text>
        //     <ScrollView style={styles.infoScrollView}>
        //         <Text style={styles.peopleInfo}>{note.instructor}</Text>
        //     </ScrollView>
        // </BottomModal>
        <Sheet
            sheetStyle={popupStyles.container}
            visible={visible}
            setVisible={setVisible}
        >
            <View style={popupStyles.headerBox}>
                <View
                    style={[
                        popupStyles.headerIcon,
                        {
                            backgroundColor: getColorFromNoteCode(note.code)
                        }
                    ]}
                >
                    <MaterialIcons
                        name={getIconFromNoteCode(note.code)}
                        size={14}
                    />
                </View>
                <View>
                    <Text style={popupStyles.headerTitle}>{note.subject}</Text>
                </View>
            </View>
            <View style={popupStyles.fieldBox}>
                <Text style={popupStyles.fieldTitle}>Note</Text>
                <Text style={[popupStyles.fieldTag, popupStyles.fieldTagBold]}>
                    {note.note === "-" && note.description
                        ? note.description
                        : note.note}
                </Text>
            </View>
            <View style={popupStyles.fieldBox}>
                <Text style={popupStyles.fieldTitle}>Date</Text>
                <Text style={[popupStyles.fieldTag, popupStyles.fieldTagLight]}>
                    {note.date}
                </Text>
            </View>

            <View>
                <Text style={popupStyles.fieldTitle}>Correcteur</Text>
                <Text style={popupStyles.fieldValue}>{note.instructor}</Text>
            </View>
        </Sheet>
    );
}

const popupStyles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20
    },
    headerBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    headerIcon: {
        width: 22,
        height: 22,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center"
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 400
    },
    fieldTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: Colors.gray,
        textTransform: "uppercase"
    },
    fieldBox: {
        gap: 4,
        alignItems: "flex-start"
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: 400
    },
    fieldTag: {
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 600
    },
    fieldTagLight: {
        backgroundColor: Colors.light
    },
    fieldTagBold: {
        backgroundColor: Colors.light,
        fontWeight: 700
    },
    fieldTagBlack: {
        backgroundColor: Colors.black,
        color: Colors.white
    }
});
