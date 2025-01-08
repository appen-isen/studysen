import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import { FontAwesome6 } from "@expo/vector-icons";

export default function ClubsScreen() {
    return (
        <View style={styles.container}>
            <FontAwesome6 name="hammer" size={24} color="black" />
            <Text style={styles.title}>
                La page des clubs est encore en développement.
            </Text>
        </View>
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
