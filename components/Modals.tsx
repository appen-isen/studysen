import {
    Modal,
    View,
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { Text } from "@/components/Texts";
import { Button } from "@/components/Buttons";
import { ReactNode } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";

type ModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    children?: ReactNode;
    modalBoxStyle?: object;
};
type ErrorModalProps = ModalProps & {
    message: string;
};

type DropdownProps = ModalProps & {
    options: string[];
    setSelectedItem: (item: string) => void;
    selectedItem: string;
};

function ModalBase(props: ModalProps) {
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
                <View style={[styles.modalContent, props.modalBoxStyle]}>
                    {props.children}
                </View>
            </View>
        </Modal>
    );
}

export function ErrorModal(props: ErrorModalProps) {
    return (
        <ModalBase setVisible={props.setVisible} visible={props.visible}>
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
        </ModalBase>
    );
}

export function Dropdown(props: DropdownProps) {
    const handleOptionPress = (item: string) => {
        props.setSelectedItem(item);
        props.setVisible(false);
    };

    return (
        <ModalBase
            setVisible={props.setVisible}
            visible={props.visible}
            modalBoxStyle={props.modalBoxStyle}
        >
            <FlatList
                data={props.options}
                keyExtractor={(item, index) => index.toString()}
                style={styles.flatList}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleOptionPress(item)}
                    >
                        <View style={styles.dropdownItemView}>
                            <Text style={styles.dropdownText}>{item}</Text>
                            {props.selectedItem === item && (
                                <Ionicons
                                    name="checkmark"
                                    style={styles.dropdownSelectedIcon}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                )}
            />
        </ModalBase>
    );
}

const styles = StyleSheet.create({
    //ModalBase
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        elevation: 10,
        padding: 10,
    },
    modalBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    // Contenu des modales
    modalTitle: { fontSize: 35, fontWeight: 600, textAlign: "center" },
    modalText: {
        fontSize: 20,
        textAlign: "center",
        marginTop: 10,
        width: "90%",
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
    // Dropdown
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    dropdownItemView: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dropdownText: {
        fontSize: 16,
    },
    dropdownSelectedIcon: {
        color: Colors.primaryColor,
        fontSize: 20,
        alignSelf: "flex-end",
    },
    flatList: {
        width: "100%",
    },
});
