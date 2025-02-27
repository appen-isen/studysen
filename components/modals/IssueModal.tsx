import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import axios from "axios";
import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import useSettingsStore from "@/store/settingsStore";
import { Bold } from "../Texts";
import Colors from "@/constants/Colors";
import { Alert } from "react-native";

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
    const { settings, setSettings } = useSettingsStore();

    const createIssue = async () => {
        try {
            if (title === "" || problemDescription === "") {
                console.log("Title or problem description is empty");
                return;
            }
            //On récupère le nom de l'utilisateur
            let username = "Anonyme";
            if (settings.username) {
                username = settings.username;
            }
            // Récupérer le token depuis l'API
            const body = `
**Description du problème :**
${problemDescription}

**Étapes pour reproduire le comportement :**
${reproductionSteps}

**Comportement attendu :**
${expectedBehavior}

**Informations sur l'appareil :**
${deviceInfo}
                
**Nom de l'utilisateur :**
${username}
            `;

            // Créer l'issue sur GitHub
            const response = await axios.post(
                "https://api.isen-orbit.fr/v1/github",
                {
                    title,
                    body,
                    labels: ["bug"],
                    assignees: ["dd060606", "BreizhHardware"],
                },
            );
            console.log("Issue created:", response.data);
            // Fermer la modal et supprimer les champs
            setTitle("");
            setProblemDescription("");
            setReproductionSteps("");
            setExpectedBehavior("");
            setDeviceInfo("");
            Alert.alert("Issue créée", "Votre issue a bien été créée sur GitHub");
            onClose();
        } catch (error) {
            Alert.alert("Erreur", "Impossible de créer l'issue: " + error);
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

                    <Button title="Créer une Issue" onPress={createIssue} />
                    <Button title="Fermer" onPress={onClose} />
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
});
