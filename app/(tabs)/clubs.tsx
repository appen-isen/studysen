import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import { Page } from "@/components/Page";

export default function ClubsScreen() {
    return (
        <Page style={styles.container} scrollable={true}>
            <FontAwesome6 name="hammer" size={24} color="black" />
            <Text style={styles.title}>
                La page de la vie associative est encore en développement.
            </Text>
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
});
