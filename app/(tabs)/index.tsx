import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";

import EditScreenInfo from "@/components/EditScreenInfo";
import useSessionStore from "@/store/sessionStore";

export default function TabOneScreen() {
    // const { session } = useSessionStore();
    // session
    //     ?.getPlanningApi()
    //     .fetchPlanning()
    //     .then((res) => {
    //         console.log(res);
    //     });
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tab One</Text>
            <View style={styles.separator} />
            <EditScreenInfo path="app/(tabs)/index.tsx" />
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
