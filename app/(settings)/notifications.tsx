import { View, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/Buttons";
import { FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold } from "@/components/Texts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import PushNotification from "react-native-push-notification";

//Paramètres des notifications
export default function NotifSettings() {
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const toggleNotifications = () => {
        setNotificationsEnabled(previousState => !previousState);
        if (!notificationsEnabled) {
            PushNotification.requestPermissions();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Bouton de retour */}
            <AnimatedPressable onPress={() => router.back()}>
                <FontAwesome6 name="arrow-left" style={styles.backIcon} />
            </AnimatedPressable>
            {/* Texte d'information */}
            <View style={styles.contentView}>
                <Bold style={styles.infoText}>
                    Les notifications ne sont pas encore implémentées dans
                    l'application.
                </Bold>
                {/* Switch pour activer/désactiver les notifications */}
                <View style={styles.switchContainer}>
                    <Bold style={styles.switchLabel}>Activer les notifications</Bold>
                    <Switch
                        onValueChange={toggleNotifications}
                        value={notificationsEnabled}
                    />
                </View>
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
    contentView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    infoText: {
        width: "90%",
        alignSelf: "center",
        textAlign: "center",
        fontSize: 20,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    switchLabel: {
        fontSize: 18,
        marginRight: 10,
    },
});
