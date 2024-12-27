import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/Texts";
import { useRouter } from "expo-router";
import useSessionStore from "@/store/sessionStore";
import { removeSecureStoreItem } from "@/store/secureStore";
import Colors from "@/constants/Colors";
import { FontAwesome6 } from "@expo/vector-icons";

export default function SettingsScreen() {
    const router = useRouter();
    const { clearSession } = useSessionStore();
    return (
        <View style={styles.container}>
            <FontAwesome6 name="hammer" size={24} color="black" />

            <Text style={styles.title}>
                La page de paramètres est encore en développement.
            </Text>
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
        textAlign: "center",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
