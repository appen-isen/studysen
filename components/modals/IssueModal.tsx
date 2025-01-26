import React, { useState } from "react";
import { Modal, View, StyleSheet } from "react-native";
import axios from "axios";
import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import useSettingsStore, { CAMPUS } from "@/store/settingsStore";

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
            // Récupérer le token depuis l'API
            const tokenResponse = await axios.get("https://api.isen-orbit.fr/v1/github");
            const githubToken = tokenResponse.data.token;

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
                ${usernameNormalized}
            `;

            // Créer l'issue sur GitHub
            const response = await axios.post(
                "https://api.github.com/repos/appen-isen/isen-orbit/issues",
                {
                    title,
                    body,
                    labels: ["bug"],
                },
                {
                    headers: {
                        "X-GitHub-Api-Version": "2022-11-28",
                        Authorization: `Bearer ${githubToken}`,
                    },
                }
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
                <Input
                    style={styles.input}
                    placeholder="Titre"
                    value={title}
                    onChangeText={setTitle}
                />
                <Input
                    style={styles.input}
                    placeholder="Description claire et concise du problème rencontré"
                    value={problemDescription}
                    onChangeText={setProblemDescription}
                    multiline
                />
                <Input
                    style={styles.input}
                    placeholder="Étapes pour reproduire le comportement"
                    value={reproductionSteps}
                    onChangeText={setReproductionSteps}
                    multiline
                />
                <Input
                    style={styles.input}
                    placeholder="Description claire et concise de ce qui était censé se produire"
                    value={expectedBehavior}
                    onChangeText={setExpectedBehavior}
                    multiline
                />
                <Input
                    style={styles.input}
                    placeholder="Type d'appareil utilisé"
                    value={deviceInfo}
                    onChangeText={setDeviceInfo}
                />
                <Button title="Créer une Issue" onPress={createIssue} />
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