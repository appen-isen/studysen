import {
    Modal,
    View,
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Animated
} from "react-native";
import { Text } from "@/components/Texts";
import { AnimatedPressable, Button } from "@/components/Buttons";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ColorPalette } from "@/constants/Colors";
import useColors from "@/hooks/useColors";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import type { ThemePreference } from "@/stores/settingsStore";

type ModalProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    children?: ReactNode;
    modalBoxStyle?: object;
};

type PopupModalProps = ModalProps & {
    message: string;
    onConfirm?: () => void;
};

type DropdownProps = ModalProps & {
    options: string[];
    setSelectedItem: (item: string) => void;
    selectedItem: string;
    // Titre optionnel affiché en haut de la modale
    title?: string;
    // Icône optionnelle affichée à gauche de chaque option
    icon?: keyof typeof MaterialIcons.glyphMap;
};

function ModalBase(props: ModalProps) {
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => props.setVisible(false)}
            // iOS/iPad: autoriser toutes les orientations pour éviter un basculement forcé en portrait
            supportedOrientations={[
                "portrait",
                "portrait-upside-down",
                "landscape",
                "landscape-left",
                "landscape-right"
            ]}
            presentationStyle="overFullScreen"
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

// Modal d'erreur
export function ErrorModal(props: PopupModalProps) {
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
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

// Modal de succès
export function SuccessModal(props: PopupModalProps) {
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (
        <ModalBase setVisible={props.setVisible} visible={props.visible}>
            <Image
                style={styles.modalImg}
                source={require("@/assets/images/success.png")}
            />
            <Text style={styles.modalTitle}>Succès</Text>
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
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
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
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
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
            {props.title && (
                <Text style={styles.optionListTitle}>{props.title}</Text>
            )}
            {/* Liste des options */}
            <View style={styles.optionList}>
                {props.options.map((item) => {
                    const selected = props.selectedItem === item;
                    return (
                        <TouchableOpacity
                            key={item}
                            style={[
                                styles.optionRow,
                                selected && styles.optionRowSelected
                            ]}
                            onPress={() => handleOptionPress(item)}
                        >
                            <View style={styles.optionRowLeft}>
                                {props.icon && (
                                    <MaterialIcons
                                        name={props.icon}
                                        style={[
                                            styles.optionIcon,
                                            selected && styles.optionIconSelected
                                        ]}
                                    />
                                )}
                                <Text
                                    style={[
                                        styles.optionLabel,
                                        selected && styles.optionLabelSelected
                                    ]}
                                >
                                    {item}
                                </Text>
                            </View>
                            {selected && (
                                <Ionicons
                                    name="checkmark"
                                    style={styles.optionCheck}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ModalBase>
    );
}

// Options de la modale de thème
const THEME_MODAL_OPTIONS: {
    label: string;
    value: ThemePreference;
    icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
    { label: "Auto", value: "system", icon: "brightness-auto" },
    { label: "Clair", value: "light", icon: "light-mode" },
    { label: "Sombre", value: "dark", icon: "dark-mode" }
];

// Modal de sélection du thème (Auto / Clair / Sombre)
export function ThemeModal(props: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    value: ThemePreference;
    onSelect: (value: ThemePreference) => void;
}) {
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
    return (
        <ModalBase setVisible={props.setVisible} visible={props.visible}>
            <Text style={styles.optionListTitle}>Thème</Text>
            <View style={styles.optionList}>
                {THEME_MODAL_OPTIONS.map((option) => {
                    const selected = option.value === props.value;
                    return (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionRow,
                                selected && styles.optionRowSelected
                            ]}
                            onPress={() => {
                                props.onSelect(option.value);
                                props.setVisible(false);
                            }}
                        >
                            <View style={styles.optionRowLeft}>
                                <MaterialIcons
                                    name={option.icon}
                                    style={[
                                        styles.optionIcon,
                                        selected && styles.optionIconSelected
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.optionLabel,
                                        selected && styles.optionLabelSelected
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </View>
                            {selected && (
                                <Ionicons
                                    name="checkmark"
                                    style={styles.optionCheck}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ModalBase>
    );
}

const createStyles = (colors: ColorPalette) =>
    StyleSheet.create({
        //ModalBase
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center"
        },
        modalContent: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "90%",
            maxWidth: getResponsiveMaxWidth(),
            backgroundColor: colors.card,
            borderRadius: 10,
            elevation: 10,
            padding: 10
        },
        modalBackground: {
            position: "absolute",
            inset: 0
        },
        // Contenu des modales
        modalTitle: { fontSize: 35, fontWeight: 600, textAlign: "center" },
        modalText: {
            fontSize: 20,
            textAlign: "center",
            marginTop: 10,
            width: "90%"
        },
        modalButton: {
            marginTop: 20
        },
        modalButtonText: { fontSize: 23 },
        modalImg: {
            width: 75,
            height: 75,
            marginBottom: 15
        },
        buttonView: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            width: "100%"
        },
        // Liste d'options (modale de thème, sélecteur de campus, etc.)
        optionListTitle: {
            fontSize: 22,
            fontWeight: 600,
            textAlign: "center",
            marginTop: 5,
            marginBottom: 10
        },
        optionList: {
            width: "100%"
        },
        optionRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
            paddingHorizontal: 12,
            borderRadius: 12
        },
        optionRowSelected: {
            backgroundColor: colors.hexWithOpacity(colors.primary, 0.1)
        },
        optionRowLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: 14
        },
        optionIcon: {
            fontSize: 22,
            color: colors.darkGray
        },
        optionIconSelected: {
            color: colors.primary
        },
        optionLabel: {
            fontSize: 17,
            fontWeight: 500
        },
        optionLabelSelected: {
            color: colors.primary,
            fontWeight: 600
        },
        optionCheck: {
            color: colors.primary,
            fontSize: 22
        }
    });
