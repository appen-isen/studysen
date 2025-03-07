import { PlanningEvent } from "@/webAurion/utils/types";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text } from "../Texts";
import Colors from "@/constants/Colors";
import { getSubjectColor, getSubjectIcon } from "@/utils/planning";

import { Sheet } from "../Sheet";
import { MaterialIcons } from "@expo/vector-icons";
import { formatFullDate } from "@/utils/date";

type EventModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    event: PlanningEvent;
};
export default function EventModal(props: EventModalProps) {
    const { event, visible, setVisible } = props;
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
                            backgroundColor: getSubjectColor(event.subject),
                        },
                    ]}
                >
                    <MaterialIcons
                        name={getSubjectIcon(event.subject)}
                        size={14}
                    />
                </View>
                <View>
                    <Text style={popupStyles.headerTitle}>
                        {event.title || event.subject}
                    </Text>
                    <Text style={popupStyles.headerSubtitle}>
                        {event.className}
                    </Text>
                </View>
            </View>
            <View style={popupStyles.fieldBox}>
                <Text style={popupStyles.fieldTitle}>Date de début</Text>
                <Text style={[popupStyles.fieldTag, popupStyles.fieldTagLight]}>
                    {formatFullDate(new Date(event.start))}
                </Text>
            </View>
            <View style={popupStyles.fieldBox}>
                <Text style={popupStyles.fieldTitle}>Date de fin</Text>
                <Text style={[popupStyles.fieldTag, popupStyles.fieldTagLight]}>
                    {formatFullDate(new Date(event.end))}
                </Text>
            </View>
            <View style={popupStyles.fieldBox}>
                <Text style={popupStyles.fieldTitle}>Salle</Text>
                <Text style={[popupStyles.fieldTag, popupStyles.fieldTagBlack]}>
                    {event.room || "?"}
                </Text>
            </View>
            <View>
                <Text style={popupStyles.fieldTitle}>Assuré par</Text>
                <Text style={popupStyles.fieldValue}>{event.instructors}</Text>
            </View>
            <View>
                <Text style={popupStyles.fieldTitle}>Pour les groupes</Text>
                <Text style={popupStyles.fieldValue}>{event.learners}</Text>
            </View>
        </Sheet>
    );
}

const popupStyles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20,
    },
    headerBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    headerIcon: {
        width: 22,
        height: 22,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 400,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: 400,
        color: Colors.gray,
    },
    fieldTitle: {
        fontSize: 10,
        fontWeight: 700,
        color: Colors.gray,
        textTransform: "uppercase",
    },
    fieldBox: {
        gap: 4,
        alignItems: "flex-start",
    },
    fieldValue: {
        fontSize: 14,
        fontWeight: 400,
    },
    fieldTag: {
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 600,
    },
    fieldTagLight: {
        backgroundColor: Colors.light,
    },
    fieldTagBlack: {
        backgroundColor: Colors.black,
        color: Colors.white,
    },
});
