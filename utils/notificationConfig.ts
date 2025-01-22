import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from "expo-notifications";

// Demande de permission pour les notifications
export const requestPermissions = async () => {
    const status = await Notifications.getPermissionsAsync();
    if (status.status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
            alert('Permission for notifications was denied');
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
Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
});

// Envoi d'une notification locale
export const sendLocalNotification = async () => {
    try {
        await Notifications.scheduleNotificationAsync({
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

// Fonction pour planifier une notification
export const scheduleCourseNotification = async (courseName: string, courseTime: Date) => {
    const notificationTime: Date = new Date(courseTime.getTime() - 15 * 60 * 1000); // 15 minutes avant le cours

    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Rappel de cours",
                body: `Votre cours de ${courseName} commence dans 15 minutes.`,
            },
            trigger: {
                type: SchedulableTriggerInputTypes.DATE,
                date: notificationTime,
            },
        });
        console.log(`Notification planifiée pour ${courseName} à ${notificationTime}`);
    } catch (error) {
        console.error("Erreur lors de la planification de la notification:", error);
    }
};