import Colors from "@/constants/Colors";
import { Link, useRouter } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function LoginHelpModal() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Problèmes de connexion ?</Text>
            <Text style={styles.text}>
                Les identifiants demandés par l'application sont les mêmes que
                ceux de l'ENT ISEN pour accéder à{" "}
                <Link href={"https://web.isen-ouest.fr"} style={styles.link}>
                    WebAurion
                </Link>
                .
            </Text>
            <Text style={styles.text}>
                Le nom d'utilisateur est de la forme:{" "}
                <Text style={styles.bold}>a_nom</Text> où{" "}
                <Text style={styles.bold}>a</Text> correspond à la première
                lettre de votre prénom et <Text style={styles.bold}>nom</Text>{" "}
                correspond à votre nom de famille.
            </Text>
            <Text style={styles.text}>
                Si vous n'arrivez toujours pas à vous connecter, vous pouvez
                essayer de{" "}
                <Link
                    href={
                        "https://web.isen-ouest.fr/password/index.php?action=sendtoken"
                    }
                    style={styles.link}
                >
                    réinitialiser votre mot de passe
                </Link>
                .
            </Text>
            <Link
                href="/login"
                onPress={(e) => {
                    // Empêche le comportement par défaut de Link (push)
                    e.preventDefault();
                    // Permet de ne pas conserver l'historique des routes (faire 'retour' ne revient pas sur la modale)
                    router.dismissTo("/login");
                }}
                style={styles.link}
            >
                J'ai compris
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        backgroundColor: "white",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    text: {
        width: "90%",
        textAlign: "center",
        marginBottom: 10,
    },
    bold: {
        fontWeight: "bold",
    },
    link: {
        color: Colors.secondaryColor,
        fontWeight: 600,
        marginTop: 15,
    },
});
