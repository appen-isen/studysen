import { useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Button, ISENSwitch, MultiToggle } from "@/components/Buttons";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import {
    cancelAllScheduledNotifications,
    requestPermissions,
    sendTestNotification
} from "@/utils/notificationConfig";
import useSettingsStore, { NotificationDelay } from "@/stores/settingsStore";
import { Page, PageHeader } from "@/components/Page";

// Paramètres des notifications
export default function NotifSettings() {
    const { settings, setSettings } = useSettingsStore();

    //Liste des délais de notification
    const delays = ["Off", "5min", "15min", "30min", "1h"];
    //Slider pour choisir le délai
    const [notifDelayIndex, setNotifDelayIndex] = useState<number>(
        //Délai par défaut depuis les paramètres
        settings.notificationsEnabled
            ? delays.indexOf(settings.notificationsDelay)
            : 0
    );
    const [localNotifEnabled, setLocalNotifEnabled] = useState<boolean>(
        settings.localNotifications
    );

    useEffect(() => {
        // Si les notifications sont actives
        if (settings.notificationsEnabled) {
            // On demande les permissions pour les notifications
            requestPermissions().then((granted) => {
                if (!granted) {
                    handleDelayChange(0); // On désactive les notifications si les permissions ne sont pas accordées
                }
            });
        }
    }, []);

    const toggleLocalNotifications = (index: number) => {
        setLocalNotifEnabled(index === 1);
        setSettings("localNotifications", index === 1);
    };

    // Changement de la valeur du délai de notification
    const handleDelayChange = (index: number) => {
        // On met à jour le délai de notification
        setNotifDelayIndex(index);
        if (delays[index] === "Off") {
            setSettings("notificationsEnabled", false);
        } else {
            setSettings("notificationsEnabled", true);
            setSettings(
                "notificationsDelay",
                delays[index] as NotificationDelay
            );
            requestPermissions(true).then((granted) => {
                if (!granted) {
                    handleDelayChange(0); // On désactive les notifications si les permissions ne sont pas accordées
                }
            });
        }

        //On supprime les notifications déjà plannifiées
        cancelAllScheduledNotifications();
    };

    return (
        <Page style={styles.container} scrollable={true}>
            <PageHeader title="Notifications" returnTo="Profil"></PageHeader>
            {/* Présentation des notifications */}
            <View style={styles.responsiveContainer}>
                <Bold style={styles.sectionTitle}>Avant un cours</Bold>
                <Text style={styles.paragraph}>
                    Vous avez oublié votre prochain cours ? Recevez une
                    notification de quelle
                    <Text style={styles.important}> matière</Text> il s'agit et
                    en quelle <Text style={styles.important}>salle</Text> juste{" "}
                    <Bold>avant votre cours.</Bold>
                </Text>
            </View>
            {/* Avertissement BETA */}
            <View style={[styles.inDevBox, styles.responsiveContainer]}>
                <View style={styles.inDevTitleContainer}>
                    <MaterialIcons
                        name="warning-amber"
                        size={24}
                        color={Colors.primary}
                    />
                    <Text style={styles.inDevTitle}>
                        EN COURS DE DÉVELOPPEMENT
                    </Text>
                </View>

                <Text style={styles.inDevText}>
                    Cette fonctionnalité est susceptible de ne pas fonctionner
                    correctement.
                </Text>
            </View>
            {/* Sélecteur pour le délai de notification */}
            <View style={styles.responsiveContainer}>
                <Text style={styles.subtitle}>DÉLAI AVANT LA NOTIFICATION</Text>
                <MultiToggle
                    options={delays}
                    selectedIndex={notifDelayIndex}
                    onSelect={handleDelayChange}
                ></MultiToggle>
                {/* Sélecteur pour activer/désactiver les notifications en mode local*/}
                <Text style={styles.subtitle}>NOTIFICATIONS LOCALES</Text>
                <MultiToggle
                    options={["Désactivé", "Activé"]}
                    selectedIndex={settings.localNotifications ? 1 : 0}
                    onSelect={toggleLocalNotifications}
                ></MultiToggle>

                {/* Bouton pour envoyer une notification de test */}
                <Button
                    title="Envoyer une notification de test"
                    textStyle={styles.buttonText}
                    onPress={sendTestNotification}
                />
            </View>
        </Page>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 25
    },
    responsiveContainer: {
        width: "100%",
        alignSelf: "center",
        gap: 10,
        maxWidth: 600
    },
    //Sections
    section: {
        marginTop: 15,
        maxWidth: 600
    },
    sectionTitle: {
        fontSize: 20,
        letterSpacing: 0.5
    },
    subtitle: {
        color: Colors.gray,
        fontSize: 14,
        marginTop: 15,
        fontWeight: "bold"
    },
    //Style de texte
    paragraph: {
        color: Colors.black,
        marginTop: 10
    },
    important: {
        color: Colors.primary,
        fontWeight: "bold"
    },

    //Style de la boîte d'avertissement
    inDevBox: {
        borderRadius: 5,
        backgroundColor: Colors.hexWithOpacity(Colors.primary, 0.1),
        padding: 10
    },
    inDevTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginLeft: 10,
        gap: 10
    },
    inDevTitle: {
        color: Colors.primary,
        fontWeight: "bold",
        fontSize: 16
    },
    inDevText: {
        marginLeft: 40,
        marginTop: 5
    },
    buttonText: {
        fontSize: 16
    }
});
