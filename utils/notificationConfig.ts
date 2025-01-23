import useSettingsStore from "@/store/settingsStore";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

// Demande de permission pour les notifications
export const requestPermissions = async () => {
    const status = await Notifications.getPermissionsAsync();
    if (status.status !== "granted") {
        const { status: newStatus } =
            await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
            alert("Permission for notifications was denied");
        }
    }
};

// Configuration des notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Configuration du canal de notification pour Android
Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
});

// Envoi d'une notification locale
export const sendLocalNotification = async () => {
    try {
        const showIdentifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: "ISEN Orbit",
                body: "Notification de test",
            },
            trigger: null,
        });
    } catch (error) {
        console.error(error);
    }
};

export const cancelAllScheduledNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log("Toutes les notifications planifiées ont été annulées");
    } catch (error) {
        console.error(error);
    }
};

// Fonction pour planifier une notification
export const scheduleCourseNotification = async (
    courseName: string,
    courseTime: Date
) => {
    const { settings } = useSettingsStore.getState();

    const notificationTime: Date = new Date(
        courseTime.getTime() -
            getDelayInMilliseconds(settings.notificationsDelay)
    );

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Rappel de cours",
                body: `Votre cours de ${courseName} commence dans ${settings.notificationsDelay}.`,
            },
            trigger: {
                type: SchedulableTriggerInputTypes.DATE,
                date: notificationTime,
            },
        });
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

// Fonction pour convertir le délai en millisecondes
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
            return 15 * 60 * 1000; // Default to 15 minutes
    }
};
