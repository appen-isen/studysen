import useSettingsStore from "@/stores/settingsStore";
import * as Notifications from "expo-notifications";
import axios from "axios";
import { Linking, Platform } from "react-native";
import { API_BASE_URL } from "@/utils/config";
import Constants from "expo-constants";

// Request permission for notifications
export const requestPermissions = async (openSettings = false) => {
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

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    })
});

export const sendTestNotification = async () => {
    const { settings } = useSettingsStore.getState();

    try {
        // Configure notification channel for Android
        await Notifications.setNotificationChannelAsync("default", {
            name: "ISEN Orbit",
            description: "Notifications pour ISEN Orbit",
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
                title: "ISEN Orbit",
                body: "Notification local de test",
                sound: "default",
                priority: "max"
            },
            trigger: null
        });

        // Get user information for backend notification
        if (settings.username) {
            const normalizedName = settings.username
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
            const email =
                normalizedName.replace(" ", ".") + "@isen-ouest.yncrea.fr";

            const deviceId = await registerForPushNotificationsAsync();
            const userId = await getUserIdByEmail(email);
            // Send notification through backend
            await axios.post(
                `${API_BASE_URL}/notifications/send-notifications`,
                {
                    user_id: userId,
                    device_id: deviceId,
                    title: "ISEN Orbit",
                    message: "Notification backend de test",
                    date: new Date()
                }
            );
        }
    } catch (error) {
        console.error("Error sending test notification:", error);
    }
};

export const cancelAllScheduledNotifications = async () => {
    console.log("Annulation de toutes les notifications planifiées");
    const { settings } = useSettingsStore.getState();
    let userId = undefined;

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log(
            "Toutes les notifications planifiées en local ont été annulées"
        );
        if (settings.username) {
            const normalizedName = settings.username
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
            const email =
                normalizedName.replace(" ", ".") + "@isen-ouest.yncrea.fr";

            const response = await axios.get(`${API_BASE_URL}/users/${email}`);
            if (response.data.message[0] !== undefined) {
                userId = response.data.message[0].user_id;
            }
            if (userId === undefined) {
                console.error("L'utilisateur n'a pas été trouvé");
                const response = await axios.post(
                    `${API_BASE_URL}/users/${email}`
                );
                userId = response.data.message.user_id;
            }

            if (userId) {
                await deleteNotifications(userId);
                console.log(
                    "Toutes les notifications planifiées du backend ont été annulées"
                );
            }
        }
    } catch (error) {
        console.error(
            "Erreur lors de l'annulation des notifications planifiées:",
            error
        );
    }
};

export const registerForPushNotificationsAsync = async () => {
    const { settings, setSettings } = useSettingsStore.getState();

    try {
        if (settings.deviceId) {
            return settings.deviceId;
        }

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

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: "15623357-9e22-4071-b51c-e03f519d5492"
        });

        const token = tokenData.data;

        setSettings("deviceId", token);
        return token;
    } catch (error) {
        throw error;
    }
};

export const getUserIdByEmail = async (email: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${email}`);
        return response.data.message[0].user_id;
    } catch (error) {
        console.error("Error fetching user ID:", error);
        throw error;
    }
};

export const scheduleCourseNotification = async (
    courseName: string,
    courseRoom: string,
    courseTime: Date,
    email: string
) => {
    const { settings } = useSettingsStore.getState();
    const notificationTime = new Date(
        courseTime.getTime() -
            getDelayInMilliseconds(settings.notificationsDelay)
    );
    const notifMessage = `Votre cours de ${courseName}${
        courseRoom ? " en " + courseRoom : ""
    } commence dans ${settings.notificationsDelay}.`;
    try {
        //Plannification en local
        if (settings.localNotifications) {
            await scheduleLocalNotification(
                "Rappel de cours",
                notifMessage,
                notificationTime
            );
        }
        //Plannification via le backend
        else {
            const deviceId = await registerForPushNotificationsAsync();
            const userId = await getUserIdByEmail(email);

            await axios.post(
                `${API_BASE_URL}/notifications/add-notifications`,
                {
                    user_id: userId,
                    device_id: deviceId,
                    title: "Rappel de cours",
                    message: notifMessage,
                    date: notificationTime
                }
            );
        }

        console.log(
            `Notification planifiée pour ${courseName} à ${notificationTime}`
        );
    } catch (error) {
        console.error(
            "Erreur lors de la planification de la notification:",
            error
        );
        // S'il y a une erreur, on essaye de re-plannifier la notification en local
        await scheduleLocalNotification(
            "Rappel de cours",
            notifMessage,
            notificationTime
        );
    }
};

// Plannification de la notification locale
export const scheduleLocalNotification = async (
    title: string,
    body: string,
    date: Date
) => {
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

export const deleteNotifications = async (userId: string) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/notifications/delete-notifications/${userId}`
        );
    } catch (error) {
        console.error(
            "Erreur lors de la suppression de la notification depuis le backend:",
            error
        );
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
