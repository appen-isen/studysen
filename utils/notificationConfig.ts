import useSettingsStore from "@/stores/settingsStore";
import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";
import { API_BASE_URL } from "@/utils/config";
import Constants from "expo-constants";
import { fetch } from "expo/fetch";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true
    })
});

// On demande la permission pour les notifications
export const requestPermissions = async (openSettings = false) => {
    //Si on est sur l'application de bureau, les notifications ne sont pas gérées
    if (Platform.OS === "web") {
        return false;
    }

    const status = await Notifications.getPermissionsAsync();
    if (status.status !== "granted") {
        const { status: newStatus } =
            await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
            if (openSettings) {
                //On ouvre les paramètres de l'OS pour les notifications
                if (Platform.OS === "ios") {
                    const bundleId =
                        Constants?.expoConfig?.ios?.bundleIdentifier ?? "";
                    return Linking.openURL(
                        `App-Prefs:NOTIFICATIONS_ID&path=${bundleId}`
                    );
                }

                const packageName =
                    Constants?.expoConfig?.android?.package ?? "";
                return Linking.sendIntent(
                    "android.settings.APP_NOTIFICATION_SETTINGS",
                    [
                        {
                            key: "android.provider.extra.APP_PACKAGE",
                            value: packageName
                        }
                    ]
                );
            }
            return false;
        }
    }
    return true;
};

export const sendTestNotification = async () => {
    //Si on est sur l'application de bureau, les notifications ne sont pas gérées
    if (Platform.OS === "web") {
        return;
    }
    try {
        // Configure notification channel for Android
        await Notifications.setNotificationChannelAsync("default", {
            name: "Studysen",
            description: "Notifications pour Studysen",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            enableLights: true,
            enableVibrate: true,
            sound: "default"
        });

        // Send a local notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Studysen",
                body: "Notification local de test",
                sound: "default",
                priority: "max"
            },
            trigger: null
        });

        // Send a push notification through the backend
        const deviceId = await registerForPushNotificationsAsync();
        if (deviceId) {
            // Send notification through backend
            await fetch(`${API_BASE_URL}/notifications/send-notifications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    device_id: deviceId,
                    title: "Studysen",
                    message: "Notification backend de test",
                    date: new Date()
                })
            });
        }
    } catch (error) {
        console.error("Error sending test notification:", error);
    }
};

export const cancelAllScheduledNotifications = async () => {
    //Si on est sur l'application de bureau, les notifications ne sont pas gérées
    if (Platform.OS === "web") {
        return;
    }
    console.log("Annulation de toutes les notifications planifiées");
    try {
        // Suppression de toutes les notifications planifiées localement
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log(
            "Toutes les notifications planifiées en local ont été annulées"
        );
        // Suppression des notifications planifiées sur le backend
        const token = await registerForPushNotificationsAsync();
        if (token) {
            await deleteNotifications(token);
        }
    } catch (error) {
        console.error(
            "Erreur lors de l'annulation des notifications planifiées:",
            error
        );
    }
};

export const registerForPushNotificationsAsync = async () => {
    //Si on est sur l'application de bureau, les notifications ne sont pas gérées
    if (Platform.OS === "web") {
        return;
    }
    const { settings, setSettings } = useSettingsStore.getState();
    // Si le deviceId est déjà enregistré, on le retourne
    if (settings.deviceId) {
        return settings.deviceId;
    }

    try {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            return;
        }

        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;
        if (!projectId) {
            return;
        }
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId
        });

        const token = tokenData.data;

        setSettings("deviceId", token);
        return token;
    } catch (error) {
        console.error("Error registering for push notifications:", error);
    }
};

export const scheduleCourseNotification = async (
    courseName: string,
    courseRoom: string,
    courseTime: Date
) => {
    //Si on est sur l'application de bureau, les notifications ne sont pas gérées
    if (Platform.OS === "web") {
        return;
    }
    const { settings } = useSettingsStore.getState();
    // Date de notification
    const notificationTime = new Date(
        courseTime.getTime() -
            getDelayInMilliseconds(settings.notificationsDelay)
    );
    const notifMessage = `Votre cours de ${courseName}${
        courseRoom ? " en " + courseRoom : ""
    } commence dans ${settings.notificationsDelay}.`;
    try {
        // On plannifie la notification locale
        await scheduleLocalNotification(
            "Rappel de cours",
            notifMessage,
            notificationTime
        );
        console.log(
            `Notification planifiée pour ${courseName} à ${notificationTime}`
        );
    } catch (error) {
        console.error(
            "Erreur lors de la planification de la notification:",
            error
        );
    }
};

// Plannification de la notification locale
export const scheduleLocalNotification = async (
    title: string,
    body: string,
    date: Date
) => {
    //Si on est sur l'application de bureau, les notifications ne sont pas gérées
    if (Platform.OS === "web") {
        return;
    }
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: date
            }
        });
    } catch (error) {
        throw error;
    }
};

export const deleteNotifications = async (device_id: string) => {
    try {
        const res = await fetch(
            `${API_BASE_URL}/notifications/delete-notifications/${device_id}`,
            { method: "DELETE" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (error) {
        console.error(
            "Erreur lors de la suppression de la notification depuis le backend:",
            error
        );
    }
};

export const registerDeviceForNotifications = async (campus_id: number) => {
    //Si on est sur l'application de bureau, les notifications ne sont pas gérées
    if (Platform.OS === "web") {
        return;
    }
    const token = await registerForPushNotificationsAsync();
    if (token) {
        try {
            const res = await fetch(
                `${API_BASE_URL}/notifications/add-device`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ device_id: token, campus_id })
                }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            console.log("Appareil enregistré pour les notifications:", token);
        } catch (error) {
            console.error(
                "Erreur lors de l'enregistrement de l'appareil pour les notifications:",
                error
            );
        }
    }
};

export const unregisterDeviceForNotifications = async () => {
    //Si on est sur l'application de bureau, les notifications ne sont pas gérées
    if (Platform.OS === "web") {
        return;
    }
    const token = await registerForPushNotificationsAsync();
    if (token) {
        try {
            const res = await fetch(
                `${API_BASE_URL}/notifications/delete-device/${token}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            console.log(
                "Appareil désenregistré pour les notifications:",
                token
            );
        } catch (error) {
            console.error(
                "Erreur lors du désenregistrement de l'appareil pour les notifications:",
                error
            );
        }
    }
};

const getDelayInMilliseconds = (delay: string): number => {
    switch (delay) {
        case "5min":
            return 5 * 60 * 1000;
        case "15min":
            return 15 * 60 * 1000;
        case "30min":
            return 30 * 60 * 1000;
        case "1h":
            return 60 * 60 * 1000;
        default:
            return 15 * 60 * 1000;
    }
};
