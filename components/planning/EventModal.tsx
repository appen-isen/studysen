import { PlanningEvent } from "@/webAurion/utils/types";
import {
    Modal,
    View,
    TouchableWithoutFeedback,
    StyleSheet,
} from "react-native";
import { Bold, Text } from "../Texts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { AnimatedPressable } from "../Buttons";
import Colors from "@/constants/Colors";
import { getSubjectColor } from "@/utils/planning";
import { formatDate, formatDateToLocalTime } from "@/utils/date";

type EventModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    event: PlanningEvent;
};
export default function EventModal(props: EventModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => props.setVisible(false)}
        >
            <View style={styles.modalOverlay}>
                {/* Overlay pour fermer la modal en cliquant à l'extérieur */}
                <TouchableWithoutFeedback
                    onPress={() => props.setVisible(false)}
                >
                    <View style={styles.modalBackground} />
                </TouchableWithoutFeedback>

                {/* Contenu de la modal */}
                <View style={styles.modalContent}>
                    {/* Bouton pour fermer la modal */}
                    <AnimatedPressable
                        onPress={() => props.setVisible(false)}
                        style={styles.closeIconPressable}
                    >
                        <FontAwesome6
                            name="arrow-left"
                            style={styles.closeIcon}
                        />
                    </AnimatedPressable>

                    <Text style={styles.title}>{props.event.title}</Text>
                    <Text style={styles.subject}>{props.event.subject}</Text>
                    <View style={styles.timeBox}>
                        <View style={styles.dateBox}>
                            <Bold style={styles.dateTitle}>Début</Bold>
                            <Text style={styles.dateText}>
                                {formatDate(new Date(props.event.start))} à{" "}
                                {formatDateToLocalTime(props.event.start)}
                            </Text>
                        </View>
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
                        <View style={styles.dateBox}>
                            <Bold style={styles.dateTitle}>Fin</Bold>
                            <Text style={styles.dateText}>
                                {formatDate(new Date(props.event.end))} à{" "}
                                {formatDateToLocalTime(props.event.end)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
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
    // Bouton pour fermer la modal
    closeIconPressable: {
        justifyContent: "flex-start",
        padding: 10,
    },
    closeIcon: {
        fontSize: 40,
        color: Colors.primaryColor,
    },
    //Titre de la matière
    title: {
        fontSize: 25,
        color: Colors.primaryColor,
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
        marginTop: 20,
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
        color: Colors.primaryColor,
    },
    dateText: {
        fontSize: 18,
    },
});
