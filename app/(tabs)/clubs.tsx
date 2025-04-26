import { StyleSheet, } from "react-native";
import { Text } from "@/components/Texts";
import { Page } from "@/components/Page";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function ClubsScreen() {
    return (
        <Page style={styles.container} scrollable={true}>
            <MaterialIcons style={styles.icon} name="build" />
            <Text style={styles.title}>
                Cette page est en cours de développement.
            </Text>
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        gap: 25,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: Colors.light,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 28,
    },
    title: {
        fontSize: 16,
        textTransform: "uppercase",
        fontWeight: "bold",
        textAlign: "center",
        color: Colors.darkGray,
    },
});
