import { useEffect } from "react";
import { View, StyleSheet, Switch, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AnimatedPressable, Button } from "@/components/Buttons";
import { FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
    cancelAllScheduledNotifications,
    requestPermissions,
    sendLocalNotification,
} from "@/utils/notificationConfig";
import useSettingsStore from "@/store/settingsStore";

// Paramètres des notifications
export default function NotifSettings() {
    const router = useRouter();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { setSettings, settings } = useSettingsStore();

    useEffect(() => {
        requestPermissions();
    }, []);

    useEffect(() => {
        // On charge les paramètres de l'application
        if (settings.notificationsEnabled !== undefined) {
            setNotificationsEnabled(settings.notificationsEnabled);
        }
    }, [settings]);

    const toggleNotifications = () => {
        const nextNotifState = !notificationsEnabled;
        setNotificationsEnabled(nextNotifState);
        setSettings("notificationsEnabled", nextNotifState);

        if (nextNotifState) {
            requestPermissions();
        } else {
            cancelAllScheduledNotifications();
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
                <Bold style={styles.title}>Notifications</Bold>

                {/* Switch pour activer/désactiver les notifications */}
                <Pressable
                    style={styles.switchContainer}
                    onPress={toggleNotifications}
                >
                    <Bold style={styles.switchLabel}>
                        Activer les notifications
                    </Bold>
                    <Switch
                        trackColor={{
                            false: "#767577",
                            true: Colors.hexWithOpacity(
                                Colors.primaryColor,
                                0.8
                            ),
                        }}
                        thumbColor={
                            notificationsEnabled
                                ? Colors.primaryColor
                                : "#f4f3f4"
                        }
                        ios_backgroundColor="#3e3e3e"
                        style={{ transform: [{ scale: 1.2 }] }}
                        onValueChange={toggleNotifications}
                        value={notificationsEnabled}
                    />
                </Pressable>
                {/* Bouton pour envoyer une notification de test */}
                <Button
                    title="Envoyer une notification"
                    textStyle={styles.buttonText}
                    onPress={sendLocalNotification}
                />
                <Text style={styles.infoText}>
                    Les notifications sont encore en beta et peuvent ne pas
                    fonctionner correctement.
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

    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 18,
    },
    switchLabel: {
        fontSize: 18,
        marginRight: 10,
    },
    infoText: {
        width: "90%",
        alignSelf: "center",
        textAlign: "center",
        fontSize: 15,
    },
});
