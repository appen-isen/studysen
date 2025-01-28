import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import axios from "axios";
import useSettingsStore from "@/store/settingsStore";

type IssueModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function IssueModal({ visible, onClose }: IssueModalProps) {
    const [title, setTitle] = useState("");
    const [problemDescription, setProblemDescription] = useState("");
    const { settings } = useSettingsStore();

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
            const body = `
**Vos suggestions ou messages :**
${problemDescription}

**Nom de l'utilisateur :**
${username}
        `;

            // Créer l'issue sur GitHub
            const response = await axios.post(
                "https://api.isen-orbit.fr/v1/github",
                {
                    title,
                    body,
                    labels: ["suggestion"],
                    assignees: ["dd060606", "BreizhHardware"],
                }
            );
            console.log("Issue created:", response.data);
            // Fermer la modal et supprimer les champs
            setTitle("");
            setProblemDescription("");
            onClose();
        } catch (error) {
            console.error("Failed to create issue:", error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalView}
            >
                <Input
                    textInputStyle={styles.input}
                    placeholder="Titre"
                    value={title}
                    onChangeText={setTitle}
                />
                <Input
                    containerStyle={styles.textArea}
                    textInputStyle={styles.input}
                    placeholder="Votre suggestion ou message ici"
                    value={problemDescription}
                    onChangeText={setProblemDescription}
                    multiline
                />
                <Button title="Envoyer la suggestion" onPress={createIssue} />
                <Button title="Fermer" onPress={onClose} />
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
    },
    input: {
        fontSize: 13,
    },
    textArea: {
        height: 100,
    },
});
