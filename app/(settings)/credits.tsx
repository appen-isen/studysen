import { View, StyleSheet } from "react-native";
import { Page, PageHeader } from "@/components/Page";
import { Text, Bold } from "@/components/Texts";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { API_BASE_URL } from "@/utils/config";
import { getResponsiveMaxWidth } from "@/utils/responsive";
import { fetch } from "expo/fetch";
import { updateId } from "expo-updates";

//Les crédits
export default function Credits() {
    const [statusColor, setStatusColor] = useState("#5ebc0bff");
    useEffect(() => {
        //On regarde si le backend est disponible
        const checkBackend = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/ping/`, {
                    method: "HEAD"
                });
                if (response.ok) {
                    console.log("Backend disponible");
                } else {
                    console.log("Backend indisponible");
                    setStatusColor(Colors.primary);
                }
            } catch (err) {
                console.log("Backend indisponible", err);
                setStatusColor(Colors.primary);
            }
        };
        checkBackend();
    }, []);
    return (
        <Page style={styles.container} scrollable={true}>
            <PageHeader title="Application" returnTo="Profil"></PageHeader>
            {/* Information sur l'application */}
            <View style={styles.responsiveContainer}>
                <Bold style={styles.sectionTitle}>À propos</Bold>
                <Text style={styles.paragraph}>
                    <Text style={styles.important}>Studysen</Text> est une
                    application crée par le club <Bold>Appen</Bold> du campus de
                    Nantes de l'école d'ingénieur ISEN.
                </Text>
                <Text style={styles.paragraph}>
                    L’objectif de cette application est de{" "}
                    <Bold>rendre plus accessible</Bold> aux étudiants de l’ISEN
                    certaines informations importantes du campus ainsi que de{" "}
                    <Bold>créer du lien</Bold> entre étudiants.
                </Text>
                <Text style={styles.paragraph}>
                    Notre projet est <Bold>open-source</Bold>, vous pouvez le
                    retrouver sur{" "}
                    <Link
                        href={"https://github.com/appen-isen/studysen"}
                        style={styles.link}
                    >
                        GitHub
                    </Link>
                </Text>
            </View>
            {/* Crédits */}
            <View style={styles.responsiveContainer}>
                <Bold style={styles.sectionTitle}>Derrière l'application</Bold>
                <Text style={styles.subtitle}>DÉVELOPPEMENT</Text>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameBadge}>Dorian DESMARS</Text>
                    <Text style={styles.nameBadge}>Félix MARQUET</Text>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameBadge}>Titouan BRANGER</Text>
                </View>
                <Text style={styles.subtitle}>DESIGN & PROTOTYPE</Text>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameBadge}>Titouan BRANGER</Text>
                    <Text style={styles.nameBadge}>Dorian DESMARS</Text>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameBadge}>Léonard SAVARY</Text>
                </View>
            </View>
            {/* Informations complémentaires */}
            <View style={styles.responsiveContainer}>
                <Bold style={styles.sectionTitle}>
                    Informations complémentaires
                </Bold>
                <View style={styles.statusContainer}>
                    <Text style={styles.subtitle}>
                        CONNEXION EN LIGNE{" "}
                        <View
                            style={[
                                styles.statusCircle,
                                { backgroundColor: statusColor }
                            ]}
                        />
                    </Text>
                </View>
                <Text style={styles.subtitle}>
                    VERSION {nativeApplicationVersion}
                </Text>
                <Text style={styles.subtitle}>BUILD {nativeBuildVersion}</Text>
                {updateId && (
                    <Text style={styles.subtitle}>UPDATE {updateId}</Text>
                )}
            </View>
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 25
    },
    responsiveContainer: {
        width: "100%",
        alignSelf: "center",
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
        marginTop: 15,
        fontWeight: "bold"
    },
    //Style de texte
    paragraph: {
        color: Colors.black,
        marginTop: 10
    },
    important: {
        color: Colors.primary,
        fontWeight: "bold"
    },
    link: {
        color: Colors.primary,
        fontWeight: "bold",
        textDecorationLine: "underline"
    },
    nameContainer: {
        flexDirection: "row",
        gap: 10
    },
    nameBadge: {
        backgroundColor: Colors.light,
        borderRadius: 5,
        padding: 8,
        marginTop: 10
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    statusCircle: {
        width: 10,
        height: 10,
        borderRadius: 999
    }
});
