import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Bold, Text } from "@/components/Texts";
import { Page, PageHeader } from "@/components/Page";
import Colors from "@/constants/Colors";
import { AnimatedPressable, Button, MultiToggle } from "@/components/Buttons";
import { useState } from "react";
import { Checkbox, Input } from "@/components/Inputs";
import { MaterialIcons } from "@expo/vector-icons";
import { Sheet } from "@/components/Sheet";
import { ErrorModal, SuccessModal } from "@/components/Modals";
import useSettingsStore from "@/stores/settingsStore";
import * as ImagePicker from "expo-image-picker";
import * as Device from "expo-device";
import { API_BASE_URL } from "@/utils/config";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { fetch } from "expo/fetch";

export default function Contact() {
    const { settings } = useSettingsStore();
    // 0 = Problème, 1 = Suggestion
    const [contactType, setContactType] = useState<number>(0);
    const [description, setDescription] = useState<string>("");
    const [reproductionSteps, setReproductionSteps] = useState<string>("");
    const [additionnalData, setAdditionnalData] = useState<boolean>(true);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [isLoading, setLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");

    //Modals
    const [infoVisible, setInfoVisible] = useState<boolean>(false);
    const [errorVisible, setErrorVisible] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successVisible, setSuccessVisible] = useState<boolean>(false);

    //Ajout d'une image
    const pickImage = async () => {
        try {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            //Pas de permission, on affiche une alerte
            if (status !== "granted") {
                setErrorMessage(
                    "Permission refusée. L'accès à la galerie est nécessaire pour sélectionner une image."
                );
                setErrorVisible(true);
                return;
            }

            //On ouvre la galerie d'images
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images", "videos"],
                allowsEditing: true,
                quality: 0.7,
                base64: true
            });

            //Si l'utilisateur a sélectionné une image
            if (!result.canceled && result.assets[0].base64) {
                const fileSize =
                    (result.assets[0].base64.length * 0.75) / 1024 / 1024;
                //On vérifie la taille de l'image
                if (fileSize > 10) {
                    setErrorMessage("L'image doit faire moins de 10 Mo.");
                    setErrorVisible(true);
                    return;
                }
                //On récupère l'image
                setSelectedImage(result.assets[0].base64);
            }
        } catch (error) {
            setErrorMessage(
                "Erreur lors de la sélection de l'image. Veuillez réessayer."
            );
            setErrorVisible(true);
            console.error("Erreur lors de la récupération de l'image:", error);
        }
    };
    // Envoi du formulaire
    const handleSubmit = async () => {
        if (isLoading) return; // Si déjà en cours de chargement, on ne fait rien
        setLoading(true);
        try {
            //On vérifie si le champ de description est rempli
            if (!description) {
                setErrorMessage("Veuillez remplir le champ de description.");
                setErrorVisible(true);
                return;
            }
            //On récupère le nom de l'utilisateur
            if (!settings.username && !username) {
                setUsername("Anonyme");
            } else if (settings.username && !username) {
                setUsername(settings.username);
            } 

            // Infos de l'issue
            const title = `${
                contactType === 0 ? "Problème" : "Suggestion"
            } de ${username}`;

            // Cas d'un problème
            let bodyContent = `
**Description du problème :**
${description}

**Étapes pour reproduire le comportement :**
${reproductionSteps}

${
    additionnalData
        ? `**Informations sur l'appareil :**
${Device.manufacturer}: ${Device.modelName} (${Device.osName} ${Device.osVersion})

`
        : ""
}
**Nom de l'utilisateur :**
${username}`;
            // Cas d'une suggestion
            if (contactType === 1) {
                bodyContent = `
**Vos suggestions ou messages :**
${description}

**Nom de l'utilisateur :**
${username}
        `;
            }

            // Créer l'issue sur GitHub

            const response = await fetch(`${API_BASE_URL}/github`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title,
                    body: bodyContent,
                    image: selectedImage,
                    labels: [`${contactType === 0 ? "bug" : "suggestion"}`],
                    assignees: ["dd060606", "BreizhHardware"]
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();

            // Succès
            setSuccessVisible(true);
            console.log("Issue envoyée:", data);
            //On réinitialise les champs
            setDescription("");
            setReproductionSteps("");
            setSelectedImage("");
            setContactType(0);
            setAdditionnalData(true);
            setInfoVisible(false);
            setErrorVisible(false);
        } catch (error) {
            setErrorMessage("Impossible de créer l'issue: " + error);
            setErrorVisible(true);
            console.error("Impossible de créer l'issue:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Page
            style={styles.container}
            scrollable={true}
            keyboardDismissMode="on-drag"
        >
            <PageHeader title="Contact" returnTo="Profil"></PageHeader>
            <View style={styles.responsiveContainer}>
                <Bold style={styles.sectionTitle}>Formulaire de contact</Bold>
                <Text style={styles.paragraph}>
                    J'ai un problème, une suggestion ou une question concernant
                    l'application
                    <Bold> Studysen.</Bold>
                </Text>
            </View>

            <View>
                <Text style={styles.subtitle}>TYPE DE REQUÊTE</Text>
                <MultiToggle
                    options={["Bug", "Suggestion & Autre"]}
                    selectedIndex={contactType}
                    onSelect={setContactType}
                ></MultiToggle>
            </View>
            <View>
                <Text style={styles.subtitle}>
                    VOTRE {contactType === 0 ? "PROBLÈME" : "SUGGESTION"}
                </Text>
                <Input
                    textInputStyle={styles.input}
                    placeholder="Décrivez votre problème ou suggestion ici."
                    value={description}
                    onChangeText={setDescription}
                    numberOfLines={5}
                    multiline
                />
            </View>
            {/* Si problème, on affiche le champ pour les étapes de reproduction */}
            {contactType === 0 && (
                <View>
                    <Text style={styles.subtitle}>ÉTAPES DE REPRODUCTION</Text>
                    <Input
                        textInputStyle={styles.input}
                        placeholder="Décrivez étapes par étapes comment faire pour reproduire ce problème."
                        value={reproductionSteps}
                        onChangeText={setReproductionSteps}
                        numberOfLines={5}
                        multiline
                    />
                    <Text style={styles.subtitle}>CAPTURE D'ÉCRAN</Text>
                    <AnimatedPressable
                        onPress={pickImage}
                        style={styles.infoButton}
                    >
                        <MaterialIcons
                            name="insert-photo"
                            size={24}
                            color="black"
                        />
                        <Text>
                            {selectedImage
                                ? "Changer la capture d'écran"
                                : "Ajouter une capture d'écran"}
                        </Text>
                    </AnimatedPressable>
                </View>
            )}
            {/* Informations complémentaires */}
            <View>
                <Text style={styles.subtitle}>INFORMATIONS SUPLÉMENTAIRES</Text>

                {/* Si settings.username est vide, on rajoute un champs pour que l'utilisateur puisse entrer son nom avec un message expliquant que c’est pour nous faciliter la vie pour les contacter afin de reproduire le bug plus facilement*/}
                {!settings.username && (
                    <>
                        <Text style={styles.paragraph}>
                            <Bold>Important :</Bold> Votre nom et prénom n'as
                            pas pu être récupéré depuis les paramètres. Veuillez
                            le renseigner ci-dessous pour nous aider à vous
                            contacter si besoin.
                        </Text>
                        <Input
                            textInputStyle={styles.input}
                            placeholder="Votre nom et prénom"
                            value={username}
                            onChangeText={setUsername}
                            numberOfLines={1}
                            multiline={false}
                        />
                    </>
                )}

                <Text style={styles.paragraph}>
                    Pour <Bold>mieux identifier</Bold> le problème, lors de
                    l'envoi du formulaire, Studysen
                    <Bold> peut</Bold> collecter des
                    <Bold> données supplémentaires.</Bold>
                </Text>
                <AnimatedPressable
                    onPress={() => setInfoVisible(true)}
                    style={styles.infoButton}
                >
                    <MaterialIcons
                        name="candlestick-chart"
                        size={20}
                        color="black"
                    />
                    <Text>En savoir plus</Text>
                </AnimatedPressable>
                <Checkbox
                    status={additionnalData ? "checked" : "unchecked"}
                    onPress={() => setAdditionnalData(!additionnalData)}
                    containerStyle={styles.checkboxContainer}
                    textStyle={styles.checkboxLabel}
                    color={Colors.primary}
                    text="J’accepte que des données supplémentaires soient récoltées."
                />
            </View>
            <Button
                onPress={handleSubmit}
                title=""
                style={styles.sendButton}
                JSX={
                    <View style={styles.sendButtonView}>
                        {isLoading && (
                            <ActivityIndicator
                                size="small"
                                color={Colors.white}
                            />
                        )}
                        {!isLoading && (
                            <MaterialIcons
                                name="ios-share"
                                size={24}
                                color={Colors.white}
                            />
                        )}
                        <Text style={styles.sendButtonText}>
                            Envoyer le formulaire
                        </Text>
                    </View>
                }
            ></Button>

            {/* Modal d'informations sur les données supplémentaires */}
            <Sheet
                visible={infoVisible}
                setVisible={setInfoVisible}
                sheetStyle={styles.infoSheetContainer}
            >
                <Text style={styles.infoTitle}>
                    Quelles données sont collectées
                </Text>
                <Text style={styles.paragraph}>
                    Lors de l’envoi du formulaire sont collectées : des
                    informations liées à la <Bold>version</Bold> de
                    l’application, la <Bold>taille de l’écran</Bold>, la
                    <Bold> marque/type</Bold> d’appareil.
                </Text>
                <Text style={styles.paragraph}>
                    Envoyer ces données est <Bold>facultatif</Bold> et
                    <Bold> anonyme</Bold>.
                </Text>
                <Text style={styles.infoTitle}>
                    Pourquoi sont-elles collectées
                </Text>
                <Text style={styles.paragraph}>
                    Dans l’objectif de mieux comprendre
                    <Bold> l’origine du problème</Bold> et d’y apporter
                    <Bold> une solution appropriée</Bold>.
                </Text>
            </Sheet>
            {/* Modal d'erreur */}
            <ErrorModal
                visible={errorVisible}
                message={errorMessage}
                setVisible={(visible) => setErrorVisible(visible)}
            />
            {/* Modal de succès */}
            <SuccessModal
                visible={successVisible}
                message={"Votre message a bien été envoyé."}
                setVisible={(visible) => setSuccessVisible(visible)}
            />
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 25,
        paddingBottom: 50
    },
    responsiveContainer: {
        width: "100%",
        alignSelf: "center",
        gap: 10,
        maxWidth: getResponsiveMaxWidth()
    },
    //Sections
    sectionTitle: {
        fontSize: 20,
        letterSpacing: 0.5
    },
    subtitle: {
        color: Colors.gray,
        fontSize: 14,
        marginBottom: 5,
        marginTop: 15,
        fontWeight: "bold"
    },
    important: {
        color: Colors.primary,
        fontWeight: "bold"
    },
    contentView: {
        flex: 1
    },
    scrollContainer: {
        width: "100%"
    },
    //Style de texte
    paragraph: {
        color: Colors.black,
        marginTop: 10
    },
    input: {
        fontSize: 13,
        height: 100
    },
    //Boutons
    infoButton: {
        backgroundColor: Colors.light,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 10,
        alignSelf: "flex-start"
    },
    checkboxContainer: {
        marginLeft: 15,
        marginTop: 5
    },
    checkboxLabel: {
        fontSize: 14,
        color: Colors.black
    },
    sendButton: {
        alignSelf: "flex-start",
        marginTop: 10
    },
    sendButtonView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5
    },
    sendButtonText: {
        fontSize: 16,
        color: Colors.white
    },
    //Styles pour le modal d'informations
    infoSheetContainer: {
        alignItems: "flex-start",
        padding: 20,
        gap: 20
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: "bold",
        backgroundColor: Colors.primary,
        color: Colors.white,
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5
    }
});
