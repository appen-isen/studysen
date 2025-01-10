import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AnimatedPressable, Button } from "@/components/Buttons";
import { FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import useSettingsStore from "@/store/settingsStore";
import useSessionStore from "@/store/sessionStore";
import {
    useNotesStore,
    usePlanningStore,
    useSyncedPlanningStore,
} from "@/store/webaurionStore";
import { removeSecureStoreItem } from "@/store/secureStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

//Paramètres avancés
export default function AdvancedSettings() {
    const router = useRouter();
    //Les stores
    const { clearSettings } = useSettingsStore();
    const { clearSession } = useSessionStore();
    const { clearNotes } = useNotesStore();
    const { clearPlanning } = usePlanningStore();
    const { clearSyncedPlanning } = useSyncedPlanningStore();
    const handleClearStores = () => {
        //Supprime les données des stores
        clearSettings();
        clearSession();
        clearNotes();
        clearPlanning();
        clearSyncedPlanning();
        //On supprime le SecureStore
        removeSecureStoreItem("username");
        removeSecureStoreItem("password");
        //On supprime le stockage local
        AsyncStorage.clear();
        //On redirige vers l'écran de connexion
        setTimeout(() => {
            router.replace("/login");
        }, 500);
    };
    return (
        <SafeAreaView style={styles.container}>
            <AnimatedPressable onPress={() => router.back()}>
                <FontAwesome6 name="arrow-left" style={styles.backIcon} />
            </AnimatedPressable>

            <View style={styles.contentView}>
                <Bold style={styles.title}>Paramètres avancés</Bold>
                <Text style={styles.infoText}>
                    Utilisez ces réglages seulement si vous savez ce que vous
                    faites.
                </Text>
                <View style={styles.section}>
                    <Bold style={styles.sectionTitle}>Gestion des données</Bold>
                    <Button
                        title="Supprimer l'état (stores)"
                        style={styles.btn}
                        textStyle={styles.btnText}
                        onPress={handleClearStores}
                    ></Button>
                </View>
                <Text style={styles.infoText}>
                    Version: {nativeApplicationVersion}
                </Text>
                <Text style={styles.infoText}>
                    Version du build: {nativeBuildVersion}
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "white",
    },
    backIcon: {
        fontSize: 40,
        margin: 20,
        color: Colors.primaryColor,
    },
    //Contenu
    contentView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: Colors.primaryColor,
        fontSize: 25,
        textAlign: "center",
        marginBottom: 20,
    },
    infoText: {
        textAlign: "center",
        width: "90%",
        fontSize: 16,
    },
    //Sections de paramètres
    section: {
        width: "90%",
        maxWidth: 600,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        color: Colors.primaryColor,
        marginBottom: 10,
    },
    btn: {
        width: "70%",
        height: 40,
    },
    btnText: {
        fontSize: 16,
    },
});
