import { PlanningEvent } from "@/webAurion/utils/types";
import { View, StyleSheet, ScrollView } from "react-native";
import { Bold, Text } from "../Texts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Colors from "@/constants/Colors";
import { getSubjectColor } from "@/utils/planning";
import { formatDate, formatDateToLocalTime } from "@/utils/date";
import { BottomModal } from "../Modals";

type EventModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    event: PlanningEvent;
};
export default function EventModal(props: EventModalProps) {
    return (
        <BottomModal setVisible={props.setVisible} visible={props.visible}>
            {/* Info sur la matière */}
            <Text style={styles.title}>
                {props.event.title || props.event.subject}
            </Text>
            <Text style={styles.subject}>{props.event.subject}</Text>
            {/* Info sur les dates */}
            <View style={styles.timeBox}>
                {/* Date de début */}
                <View style={styles.dateBox}>
                    <Bold style={styles.dateTitle}>Début</Bold>
                    <Text style={styles.dateText}>
                        {formatDate(new Date(props.event.start))} à{" "}
                        {formatDateToLocalTime(props.event.start)}
                    </Text>
                </View>
                {/* Séparateur */}
                <View
                    style={[
                        styles.separator,
                        {
                            backgroundColor: getSubjectColor(
                                props.event.subject
                            ),
                        },
                    ]}
                ></View>
                {/* Date de fin */}
                <View style={styles.dateBox}>
                    <Bold style={styles.dateTitle}>Fin</Bold>
                    <Text style={styles.dateText}>
                        {formatDate(new Date(props.event.end))} à{" "}
                        {formatDateToLocalTime(props.event.end)}
                    </Text>
                </View>
            </View>
            {/* Salle de classe */}
            <View style={styles.roomBox}>
                <FontAwesome6 name="location-dot" style={styles.roomIcon} />
                <Text style={styles.roomText}>
                    {props.event.room || "Salle inconnue"}
                </Text>
            </View>
            {/* Intervenants */}
            <Text style={styles.peopleInfoTitle}>Intervenants</Text>
            <ScrollView style={styles.infoScrollView}>
                <Text style={styles.peopleInfo}>{props.event.instructors}</Text>
            </ScrollView>

            {/* Etudiants */}
            <Text style={styles.peopleInfoTitle}>Étudiants</Text>
            <ScrollView style={styles.infoScrollView}>
                <Text style={styles.peopleInfo}>{props.event.learners}</Text>
            </ScrollView>
        </BottomModal>
    );
}

const styles = StyleSheet.create({
    //ModalBase
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    modalContent: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "100%",
        backgroundColor: "white",
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        elevation: 10,
        padding: 10,
        flex: 0.7,
    },
    modalBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    //Contenu de la modal

    //Titre de la matière
    title: {
        fontSize: 25,
        color: Colors.primary,
        fontWeight: "bold",
        alignSelf: "center",
        textAlign: "center",
    },
    subject: {
        fontSize: 20,
        color: "black",
        fontWeight: "bold",
        alignSelf: "center",
        marginTop: 20,
        textAlign: "center",
    },
    //Affichage de l'heure de début et de fin
    timeBox: {
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
    },
    dateBox: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    dateTitle: {
        fontSize: 20,
        color: Colors.primary,
    },
    dateText: {
        fontSize: 18,
    },
    //Salle de classe
    roomBox: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignSelf: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 2,
        backgroundColor: Colors.primary,
        borderRadius: 20,
    },
    roomIcon: {
        color: "white",
        fontSize: 20,
        marginRight: 5,
    },
    roomText: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginLeft: 5,
    },
    //Intervenants et Etudiants
    peopleInfoTitle: {
        color: Colors.primary,
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
