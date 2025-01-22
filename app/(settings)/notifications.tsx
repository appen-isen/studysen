import { useEffect, useState } from "react";
import { View, StyleSheet, Switch, Pressable } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useRouter } from "expo-router";
import { AnimatedPressable, Button } from "@/components/Buttons";
import { FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    cancelAllScheduledNotifications,
    requestPermissions,
    sendLocalNotification,
} from "@/utils/notificationConfig";
import useNotificationStore from "@/store/notificationStore";

// Paramètres des notifications
export default function NotifSettings() {
    const router = useRouter();
    const { settings, setSettings } = useNotificationStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(settings.enabled);
    const [notificationDelay, setNotificationDelay] = useState(settings.delay);

    useEffect(() => {
        requestPermissions();
    }, []);

    const toggleNotifications = () => {
        const nextNotifState = !notificationsEnabled;
        setNotificationsEnabled(nextNotifState);
        setSettings({ ...settings, enabled: nextNotifState });

        if (nextNotifState) {
            requestPermissions();
        } else {
            cancelAllScheduledNotifications();
        }
    };

    const handleDelayChange = (value: string) => {
        setNotificationDelay(value);
        setSettings({ ...settings, delay: value });
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

                {/* Sélecteur pour le délai de notification */}
                    <Text style={styles.infoText}>Délai de notification</Text>
                    <RNPickerSelect
                        onValueChange={handleDelayChange}
                        items={[
                            { label: "5 minutes avant", value: "5min" },
                            { label: "15 minutes avant", value: "15min" },
                            { label: "30 minutes avant", value: "30min" },
                            { label: "1 heure avant", value: "1h" },
                        ]}
                        value={notificationDelay}
                        style={pickerSelectStyles}
                    />

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
    pickerContainer: {
        marginVertical: 20,
        width: "80%",
    },
    pickerLabel: {
        fontSize: 18,
        marginBottom: 10,
    },
    infoText: {
        width: "90%",
        alignSelf: "center",
        textAlign: "center",
        fontSize: 15,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});