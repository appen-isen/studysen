import React, { useState } from "react";
import { Modal, View, StyleSheet } from "react-native";
import { Button, ButtonIssue } from "@/components/Buttons";
import { IssueInput } from "@/components/Inputs";
import axios from "axios";
import useSettingsStore from "@/store/settingsStore";

type IssueModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function IssueModal({ visible, onClose }: IssueModalProps) {
    const [title, setTitle] = useState("");
    const [problemDescription, setProblemDescription] = useState("");
    const [usernameNormalized, setUsernameNormalized] = useState("");
    const { settings, setSettings } = useSettingsStore();

    const createIssue = async () => {
        try {
            if (settings.username) {
                const username = settings.username;

                //On convertit le Prénom Nom en email valide
                const normalizedName = username
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase();
                setUsernameNormalized(normalizedName.replace(" ", " "));
            } else {
                setUsernameNormalized("Anonyme");
            }

            const body = `
                **Vos suggestions ou messages :**
                ${problemDescription}
                **Nom de l'utilisateur :**
                ${usernameNormalized}
            `;

            // Créer l'issue sur GitHub
            const response = await axios.post(
                "https://api.isen-orbit.fr/v1/github",
                {
                    title,
                    body,
                    labels: ["bug"],
                    assignees: [
                        'dd060606',
                        'BreizhHardware'
                    ],
                },
            );
            console.log("Issue created:", response.data);
            onClose();
        } catch (error) {
            console.error("Failed to create issue:", error);
        }
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.modalView}>
                <IssueInput
                    style={styles.input}
                    placeholder="Titre"
                    value={title}
                    onChangeText={setTitle}
                />
                <IssueInput
                    style={styles.input}
                    placeholder="Votre suggestion ou message ici"
                    value={problemDescription}
                    onChangeText={setProblemDescription}
                    multiline
                />
                <ButtonIssue title="Envoyer la suggestion ou le message." onPress={createIssue} />
                <Button title="Fermer" onPress={onClose} />
            </View>
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
        flex: 1,
        textAlign: "center",
        fontSize: 12,
        backgroundColor: "transparent",
        width: "100%",
        height: "95%",
    },
});