import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";

import EditScreenInfo from "@/components/EditScreenInfo";

export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tab Two</Text>
            <View style={styles.separator} />
            <EditScreenInfo path="app/(tabs)/two.tsx" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
