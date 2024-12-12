import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";

import EditScreenInfo from "@/components/EditScreenInfo";
import useSessionStore from "@/store/sessionStore";
import Colors from "@/constants/Colors";
import { removeSecureStoreItem } from "@/store/secureStore";
import { useRouter } from "expo-router";

export default function TabOneScreen() {
    const router = useRouter();
    const { session, clearSession } = useSessionStore();
    // session
    //     ?.getPlanningApi()
    //     .fetchPlanning()
    //     .then((res) => {
    //         //Debug permet de voir si la session fonctionne correctement
    //         console.log(res);
    //     });
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tab One</Text>

            <View style={styles.separator} />
            <EditScreenInfo path="app/(tabs)/index.tsx" />
            {/* Bouton de debug pour tester l'authentification (déconnexion) */}
            <Pressable
                onPress={() => {
                    clearSession();
                    removeSecureStoreItem("username");
                    removeSecureStoreItem("password");
                    router.replace("/login");
                }}
            >
                <Text style={{ color: Colors.primaryColor }}>Déconnexion</Text>
            </Pressable>
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
