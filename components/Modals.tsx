import { Modal, View, StyleSheet, Image } from "react-native";
import { Text } from "@/components/Texts";
import { Button } from "@/components/Buttons";
type Props = {
    visible: boolean;
    message: string;
    onConfirm?: () => void;
    setVisible: (visible: boolean) => void;
};
export function ErrorModal(props: Props) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => props.setVisible(false)}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Image
                        style={styles.modalImg}
                        source={require("@/assets/images/error.png")}
                    />

                    <Text style={styles.modalTitle}>Erreur</Text>

                    <Text style={styles.modalText}>{props.message}</Text>
                    <Button
                        onPress={() => props.setVisible(false)}
                        style={styles.modalButton}
                        textStyle={styles.modalButtonText}
                        title={"OK"}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalTitle: { fontSize: 35, fontWeight: 600 },
    modalView: {
        margin: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        width: "90%",
        height: 350,
        //Ombrage
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 13,
        },
        shadowOpacity: 0.24,
        shadowRadius: 14.86,
        elevation: 18,
    },
    modalButton: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 6,
        paddingBottom: 6,
        marginTop: 20,
    },
    modalButtonText: { fontSize: 23 },
    modalImg: {
        width: 75,
        height: 75,
        marginBottom: 15,
    },
    modalText: {
        fontSize: 20,
        textAlign: "center",
        marginTop: 10,
        width: "90%",
    },
});
