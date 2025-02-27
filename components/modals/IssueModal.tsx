import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
    View,
} from "react-native";
import axios from "axios";
import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import useSettingsStore from "@/store/settingsStore";
import { Bold, Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";

type IssueModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function IssueModal({ visible, onClose }: IssueModalProps) {
    const [title, setTitle] = useState("");
    const [problemDescription, setProblemDescription] = useState("");
    const [reproductionSteps, setReproductionSteps] = useState("");
    const [expectedBehavior, setExpectedBehavior] = useState("");
    const [deviceInfo, setDeviceInfo] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { settings } = useSettingsStore();

    const pickImage = async () => {
        try {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission refusée",
                    "L'accès à la galerie est nécessaire pour sélectionner une image",
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images", "videos"],
                allowsEditing: true,
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0].base64) {
                const fileSize =
                    (result.assets[0].base64.length * 0.75) / 1024 / 1024;
                if (fileSize > 10) {
                    Alert.alert("Erreur", "L'image doit faire moins de 10 Mo");
                    return;
                }
                setSelectedImage(result.assets[0].base64);
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible de sélectionner l'image");
            console.error("Error picking image:", error);
        }
    };

    const resetForm = () => {
        setTitle("");
        setProblemDescription("");
        setReproductionSteps("");
        setExpectedBehavior("");
        setDeviceInfo("");
        setSelectedImage(null);
    };

    const createIssue = async () => {
        try {
            if (!title || !problemDescription) {
                Alert.alert(
                    "Erreur",
                    "Le titre et la description sont obligatoires",
                );
                return;
            }

            const username = settings.username || "Anonyme";
            const bodyContent = `
**Description du problème :**
${problemDescription}

**Étapes pour reproduire le comportement :**
${reproductionSteps}

**Comportement attendu :**
${expectedBehavior}

**Informations sur l'appareil :**
${deviceInfo}

**Nom de l'utilisateur :**
${username}`;
            let imageContent = "";

            if (selectedImage) {
                imageContent += selectedImage;
            }

            const response = await axios.post(
                "https://api.isen-orbit.fr/v1/github",
                {
                    title,
                    body: bodyContent,
                    image: imageContent,
                    labels: ["bug"],
                    assignees: ["dd060606", "BreizhHardware"],
                },
            );

            Alert.alert("Succès", "Votre signalement a bien été créé");
            resetForm();
            onClose();
        } catch (error) {
            Alert.alert("Erreur", "Impossible de créer le signalement");
            console.error("Failed to create issue:", error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Bold style={styles.title}>Rapport de bug</Bold>

                    <Input
                        textInputStyle={styles.input}
                        placeholder="Titre"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Input
                        textInputStyle={styles.input}
                        placeholder="Description claire et concise du problème rencontré"
                        value={problemDescription}
                        onChangeText={setProblemDescription}
                        multiline
                    />

                    <Input
                        textInputStyle={styles.input}
                        placeholder="Étapes pour reproduire le comportement"
                        value={reproductionSteps}
                        onChangeText={setReproductionSteps}
                        multiline
                    />

                    <Input
                        textInputStyle={styles.input}
                        placeholder="Type d'appareil utilisé"
                        value={deviceInfo}
                        onChangeText={setDeviceInfo}
                    />

                    <Input
                        containerStyle={styles.textArea}
                        textInputStyle={styles.input}
                        placeholder="Description claire et concise de ce qui était censé se produire"
                        value={expectedBehavior}
                        onChangeText={setExpectedBehavior}
                        multiline
                    />

                    <View style={styles.imageSection}>
                        {selectedImage && (
                            <Image
                                source={{
                                    uri: `data:image/jpeg;base64,${selectedImage}`,
                                }}
                                style={styles.previewImage}
                            />
                        )}
                        <Button
                            title={
                                selectedImage
                                    ? "Changer la capture d'écran"
                                    : "Ajouter une capture d'écran"
                            }
                            onPress={pickImage}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Créer le signalement"
                            onPress={createIssue}
                        />
                        <Button title="Fermer" onPress={onClose} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        marginTop: 20,
    },
    title: {
        alignSelf: "center",
        fontSize: 25,
        color: Colors.primaryColor,
        marginBottom: 20,
    },
    scrollContainer: {
        width: "100%",
    },
    input: {
        fontSize: 13,
    },
    textArea: {
        height: 200,
    },
    imageSection: {
        marginVertical: 15,
        alignItems: "center",
    },
    previewImage: {
        width: "100%",
        height: 200,
        resizeMode: "contain",
        marginBottom: 10,
        borderRadius: 8,
    },
    buttonContainer: {
        marginTop: 10,
        gap: 10,
    },
});
