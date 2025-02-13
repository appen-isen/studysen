import {
    Modal,
    View,
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
    FlatList,
    TouchableOpacity,
    Animated,
} from "react-native";
import { Text } from "@/components/Texts";
import { AnimatedPressable, Button } from "@/components/Buttons";
import { ReactNode, useEffect, useRef } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";
import { FontAwesome6 } from "@expo/vector-icons";

type ModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    children?: ReactNode;
    modalBoxStyle?: object;
};

type BottomModalProps = ModalProps & {
    flexSize?: number;
};
type PopupModalProps = ModalProps & {
    message: string;
    onConfirm?: () => void;
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

// Modal qui s'ouvre depuis le bas de l'écran pour les informations supplémentaires
export function BottomModal(props: BottomModalProps) {
    const slideAnim = useRef(new Animated.Value(800)).current; // Valeur initiale (hors de l'écran)

    useEffect(() => {
        if (props.visible) {
            // Animation pour faire glisser la modal vers le haut
            Animated.timing(slideAnim, {
                toValue: 0, // Position finale (visible)
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [props.visible]);

    // Fermeture de la modal
    const handleDismiss = () => {
        // Animation pour faire glisser la modal vers le bas
        Animated.timing(slideAnim, {
            toValue: 800, // Position initiale (hors de l'écran)
            duration: 300,
            useNativeDriver: true,
        }).start();
        props.setVisible(false);
    };
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={handleDismiss}
        >
            <View style={[styles.modalOverlay, bottomModalStyles.modalOverlay]}>
                {/* Overlay pour fermer la modal en cliquant à l'extérieur */}
                <TouchableWithoutFeedback onPress={handleDismiss}>
                    <Animated.View style={styles.modalBackground} />
                </TouchableWithoutFeedback>

                {/* Contenu de la modal */}
                <Animated.View
                    style={[
                        styles.modalContent,
                        bottomModalStyles.modalContent,
                        {
                            // Animation de la modal
                            transform: [{ translateY: slideAnim }],
                            // Taille de la modal
                            flex:
                                props.flexSize !== undefined
                                    ? props.flexSize
                                    : 0.7,
                        },
                    ]}
                >
                    {/* Bouton pour fermer la modal */}
                    <AnimatedPressable
                        onPress={handleDismiss}
                        style={bottomModalStyles.closeIconPressable}
                    >
                        <FontAwesome6
                            name="xmark"
                            style={bottomModalStyles.closeIcon}
                        />
                    </AnimatedPressable>
                    {/* Contenu de la modal */}
                    {props.children}
                </Animated.View>
            </View>
        </Modal>
    );
}

// Modal d'erreur
export function ErrorModal(props: PopupModalProps) {
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

// Modal de confirmation
export function ConfirmModal(props: PopupModalProps) {
    return (
        <ModalBase setVisible={props.setVisible} visible={props.visible}>
            <Image
                style={styles.modalImg}
                source={require("@/assets/images/question.png")}
            />
            <Text style={styles.modalTitle}>Confirmation</Text>
            <Text style={styles.modalText}>{props.message}</Text>

            <View style={styles.buttonView}>
                <Button
                    onPress={() => {
                        props.setVisible(false);
                        // Appel de la fonction de confirmation
                        props.onConfirm && props.onConfirm();
                    }}
                    style={styles.modalButton}
                    textStyle={styles.modalButtonText}
                    title={"Confirmer"}
                />
                <Button
                    onPress={() => props.setVisible(false)}
                    style={styles.modalButton}
                    bgColor="grey"
                    textStyle={styles.modalButtonText}
                    title={"Annuler"}
                />
            </View>
        </ModalBase>
    );
}

// Sélecteur de choix
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
            {/* Liste des options */}
            <FlatList
                data={props.options}
                keyExtractor={(item, index) => index.toString()}
                style={styles.flatList}
                renderItem={({ item }) => (
                    // Option sélectionnable
                    <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleOptionPress(item)}
                    >
                        <View style={styles.dropdownItemView}>
                            <Text style={styles.dropdownText}>{item}</Text>
                            {props.selectedItem == item && (
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
        maxWidth: 600,
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
        marginTop: 20,
    },
    modalButtonText: { fontSize: 23 },
    modalImg: {
        width: 75,
        height: 75,
        marginBottom: 15,
    },
    buttonView: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        width: "100%",
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
        color: Colors.primary,
        fontSize: 20,
        alignSelf: "flex-end",
    },
    flatList: {
        width: "100%",
    },
});

const bottomModalStyles = StyleSheet.create({
    modalOverlay: {
        justifyContent: "flex-end",
    },
    modalContent: {
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "100%",
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    // Bouton pour fermer la modal
    closeIconPressable: {
        justifyContent: "flex-start",
        padding: 10,
    },
    closeIcon: {
        fontSize: 40,
        color: Colors.primary,
    },
});
