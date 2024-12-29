import { View, StyleSheet } from "react-native";
import { Text } from "@/components/Texts";
import { Link, useRouter } from "expo-router";

//Informations sur le calcul de la moyenne
export default function NotesHelpModal() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Comment est calculée votre moyenne ?
            </Text>
            <Text style={styles.text}>
                Cette moyenne est seulement indicative, il ne s'agit pas de la
                moyenne exacte de votre semestre.
            </Text>
            <Text style={styles.text}>
                La moyenne générale affichée dans l'onglet "Mes notes" est
                calculée en effectuant la moyenne de chacune de vos matières.
            </Text>
            <Text style={styles.text}>
                Ici les coefficients ne sont pas pris en compte pour le calcul
                car ils varient en fonction des matières, des cycles, et des
                semestres.
            </Text>
            <Link
                href="/notes"
                style={styles.link}
                onPress={(e) => {
                    // Fermeture de la modale
                    e.preventDefault();
                    router.back();
                }}
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
    link: {
        textDecorationLine: "underline",
        fontWeight: 600,
        marginTop: 15,
    },
});
