import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "Erreur" }} />
            <View style={styles.container}>
                <Text style={styles.title}>Cette page n'existe pas !</Text>

                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>Retour</Text>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
        padding: 20
    },
    title: {
        fontSize: 20,
        fontWeight: "bold"
    },
    link: {
        marginTop: 15,
        paddingVertical: 15
    },
    linkText: {
        fontSize: 14,
        color: Colors.primary
    }
});
