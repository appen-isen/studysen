import { useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AnimatedPressable, Button, ISENSwitch } from "@/components/Buttons";
import { FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    cancelAllScheduledNotifications,
    deleteNotifications,
    getUserIdByEmail,
    requestPermissions,
    scheduleCourseNotification,
    sendTestNotification,
} from "@/utils/notificationConfig";
import { Dropdown } from "@/components/Modals";
import useSettingsStore, { NotificationDelay } from "@/store/settingsStore";

// Paramètres des notifications
export default function NotifSettings() {
    const router = useRouter();
    const { settings, setSettings } = useSettingsStore();
    //Menu déroulant pour choisir le délai des notifs
    const [delayMenuVisible, setDelayMenuVisible] = useState(false);

    useEffect(() => {
        requestPermissions();
    }, []);

    const toggleNotifications = () => {
        const nextNotifState = !settings.notificationsEnabled;
        setSettings("notificationsEnabled", nextNotifState);

        if (nextNotifState) {
            requestPermissions();
        } else {
            cancelAllScheduledNotifications();
        }
    };

    const handleDelayChange = async (value: NotificationDelay) => {
        try {
            const { settings } = useSettingsStore.getState();

            if (settings.username) {
                // Normalize email
                const normalizedName = settings.username
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase();
                const email =
                    normalizedName.replace(" ", ".") + "@isen-ouest.yncrea.fr";

                // Get user ID
                const userId = await getUserIdByEmail(email);

                // Delete all existing notifications
                await deleteNotifications(userId);

                // Update the settings with new delay
                setSettings("notificationsDelay", value);

                // Reschedule notifications with new delay
                await scheduleCourseNotification(
                    "Test Course",
                    "Room 101",
                    new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
                    email,
                );
            }
        } catch (error) {
            console.error("Error updating notification delay:", error);
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
                    <ISENSwitch
                        onValueChange={toggleNotifications}
                        value={settings.notificationsEnabled}
                    />
                </Pressable>

                {/* Sélecteur pour le délai de notification */}
                {/* Bouton pour choisir le campus */}
                <AnimatedPressable
                    style={styles.delaySelect}
                    scale={0.95}
                    onPress={() => setDelayMenuVisible(true)}
                >
                    <Text style={styles.delaySelectText}>
                        Délai de <Bold>{settings.notificationsDelay}</Bold>
                    </Text>
                    <FontAwesome6
                        style={styles.delaySelectText}
                        name="chevron-down"
                        size={24}
                    />
                </AnimatedPressable>
                <Dropdown
                    visible={delayMenuVisible}
                    setVisible={setDelayMenuVisible}
                    options={["5min", "15min", "30min", "1h"]}
                    selectedItem={settings.notificationsDelay}
                    setSelectedItem={handleDelayChange}
                    modalBoxStyle={styles.dropdownBoxStyle}
                />

                {/* Bouton pour envoyer une notification de test */}
                <Button
                    title="Envoyer une notification"
                    textStyle={styles.buttonText}
                    onPress={sendTestNotification}
                />
                <Text style={styles.infoText}>
                    Les notifications sont encore en beta et peuvent ne pas
                    fonctionner correctement.
                </Text>
                {/* Affiche le token de l'appareil */}
                <Text style={styles.infoText}>
                    Token de l'appareil: {settings.deviceId}
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
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
    },
    switchLabel: {
        fontSize: 18,
        marginRight: 10,
    },
    // Sélecteur de délai
    dropdownBoxStyle: {
        width: 250,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    delaySelect: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 5,
        width: 250,
        backgroundColor: Colors.primaryColor,
        borderRadius: 50,
        marginVertical: 20,
    },
    delaySelectText: {
        color: "white",
        marginLeft: 5,
        marginRight: 5,
    },
    infoText: {
        width: "90%",
        alignSelf: "center",
        textAlign: "center",
        fontSize: 15,
    },
});
