import { Note } from "@/webAurion/utils/types";
import { View, StyleSheet } from "react-native";
import { Text } from "../Texts";
import Colors from "@/constants/Colors";
import { Sheet } from "../Sheet";
import { MaterialIcons } from "@expo/vector-icons";
import { getColorFromNoteCode, getIconFromNoteCode } from "@/utils/colors";

type NoteModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    note: Note;
};
export default function NoteModal(props: NoteModalProps) {
    const { note, visible, setVisible } = props;
    return (
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
