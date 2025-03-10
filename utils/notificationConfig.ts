import useSettingsStore from "@/stores/settingsStore";
import * as Notifications from "expo-notifications";
import axios from "axios";
import { setSecureStoreItem } from "@/stores/secureStore";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import usePlanningStore, { PlanningEvent } from "@/stores/planningStore";
import { mergePlanning } from "@/utils/planning";
import useSessionStore from "@/stores/sessionStore";

// Define the API base URL for development and production
const API_BASE_URL = "https://api.isen-orbit.fr/v1";

const BACKGROUND_SYNC_TASK = "background-planning-sync";

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
        console.warn("Background planning sync started");

        // Get current stores
        const { settings } = useSettingsStore.getState();
        const { session } = useSessionStore.getState();
        const { planning, setPlanning } = usePlanningStore.getState();

        if (!session || !settings.email) {
            console.log("No active session or email, skipping background sync");
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Fetch current week planning
        console.warn("Fetching latest planning");
        const latestPlanning = await session.getPlanningApi().fetchPlanning();

        if (!latestPlanning || latestPlanning.length === 0) {
            console.log("No planning data received");
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // Compare with existing planning to detect changes
        const changes = detectPlanningChanges(planning, latestPlanning);

        if (changes.length > 0) {
            console.log(`Detected ${changes.length} changes in planning`);

            // Update planning in store
            // @ts-ignore
            setPlanning(mergePlanning(planning, latestPlanning));

            // Send notification for each change
            for (const change of changes) {
                await sendPlanningChangeNotification(change.type, change.event);
            }

            return BackgroundFetch.BackgroundFetchResult.NewData;
        } else {
            console.log("No changes in planning");
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }
    } catch (error) {
        console.error("Error in background sync:", error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// Request permission for notifications
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
            const deviceId = await registerForPushNotificationsAsync();
            const userId = settings.userId;
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
        if (settings.email) {
            const email = settings.email;

            const response = await axios.get(`${API_BASE_URL}/users/${email}`);
            if (response.data.message !== undefined) {
                userId = response.data.message.user_id;
            }
            if (userId === undefined) {
                console.error("L'utilisateur n'a pas été trouvé");
                // User not found, cancel all local notifications and unlog the user by deleting the token
                await Notifications.cancelAllScheduledNotificationsAsync();
                console.log(
                    "Toutes les notifications planifiées en local ont été annulées"
                );
                setSecureStoreItem("token", "");
                console.log("L'utilisateur a été déconnecté");
                return;
            }

            if (userId) {
                await deleteNotifications(userId);
                console.log(
                    "Toutes les notifications planifiées du backend ont été annulées"
                );
            }
        }
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log(
            "Toutes les notifications planifiées en local ont été annulées"
        );
        console.log("Toutes les notifications ont été annulées");
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

export const scheduleCourseNotification = async (
    courseName: string,
    courseRoom: string,
    courseTime: Date
) => {
    console.log(
        "Début de la planification de la notification pour",
        courseName
    );
    const { settings } = useSettingsStore.getState();
    const notificationTime = new Date(
        courseTime.getTime() -
            getDelayInMilliseconds(settings.notificationsDelay)
    );

    try {
        const notifMessage = `Votre cours de ${courseName}${
            courseRoom ? " en " + courseRoom : ""
        } commence dans ${settings.notificationsDelay}.`;

        if (settings.localNotifications) {
            // Local notification logic (unchanged)
            const existingNotifications =
                await Notifications.getAllScheduledNotificationsAsync();

            const notificationExists = existingNotifications.some(
                (notification: Notifications.NotificationRequest) =>
                    notification.content.body === notifMessage
            );

            if (!notificationExists) {
                const notificationId =
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Rappel de cours",
                            body: notifMessage
                        },
                        trigger: {
                            date: notificationTime,
                            channelId: "default"
                        }
                    });
                return notificationId;
            } else {
                return null;
            }
        } else {
            // Backend notification with local fallback
            const deviceId = await registerForPushNotificationsAsync();
            const userId = settings.userId;

            try {
                // Get existing notifications from backend
                const requestPath = `${API_BASE_URL}/notifications/${userId}`;
                const response = await axios.get(requestPath);
                const existingNotifications = response.data.message || [];

                const notificationExists = existingNotifications.some(
                    (notification: any) => notification.message === notifMessage
                );

                if (!notificationExists) {
                    // Try to schedule the backend notification
                    const result = await axios.post(
                        `${API_BASE_URL}/notifications/add-notifications`,
                        {
                            user_id: userId,
                            device_id: deviceId,
                            title: "Rappel de cours",
                            message: notifMessage,
                            date: notificationTime
                        }
                    );

                    // Schedule a local fallback notification 5 minutes after the original time
                    const fallbackTime = new Date(
                        notificationTime.getTime() + 5 * 60 * 1000
                    );
                    const fallbackMessage = `[Fallback] ${notifMessage}`;

                    // Check if fallback already exists
                    const existingLocalNotifications =
                        await Notifications.getAllScheduledNotificationsAsync();
                    const fallbackExists = existingLocalNotifications.some(
                        (notification: Notifications.NotificationRequest) =>
                            notification.content.body === fallbackMessage
                    );

                    if (!fallbackExists) {
                        const fallbackId =
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: "Rappel de cours (Fallback)",
                                    body: fallbackMessage
                                },
                                trigger: {
                                    date: notificationTime,
                                    channelId: "default"
                                }
                            });
                    }

                    return result.data?.id || true;
                } else {
                    return null;
                }
            } catch (backendError) {
                // Backend notification failed, immediately schedule a local notification instead
                console.error(
                    "Backend notification failed, using local fallback:",
                    backendError
                );
                const existingLocalNotifications =
                    await Notifications.getAllScheduledNotificationsAsync();
                const localExists = existingLocalNotifications.some(
                    (notification: Notifications.NotificationRequest) =>
                        notification.content.body === notifMessage
                );

                if (!localExists) {
                    const notificationId =
                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Rappel de cours",
                                body: notifMessage
                            },
                            trigger: {
                                date: notificationTime,
                                channelId: "default"
                            }
                        });

                    return notificationId;
                }
            }
        }
    } catch (error) {
        console.error(
            "Erreur lors de la planification de la notification:",
            error
        );
        return null;
    }
};

export const deleteNotifications = async (userId: string) => {
    try {
        await axios.delete(
            `${API_BASE_URL}/notifications/delete-notifications/${userId}`
        );
    } catch (error) {
        console.error("Error deleting notifications:", error);
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

// Set up notification received listener
Notifications.addNotificationReceivedListener((notification) => {
    console.log("Notification reçue:", {
        title: notification.request.content.title,
        body: notification.request.content.body,
        date: new Date(notification.date).toLocaleString()
    });
});

// Set up notification response listener (when user taps the notification)
Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("Notification interagit:", {
        title: response.notification.request.content.title,
        body: response.notification.request.content.body,
        date: new Date(response.notification.date).toLocaleString()
    });
});

// Register background fetch
export const registerBackgroundSync = async () => {
    try {
        const isRegistered =
            await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
                minimumInterval: 30 * 60, // 30 minutes in seconds
                stopOnTerminate: false, // continue in background
                startOnBoot: true // start on device boot
            });
            console.warn("Background planning sync registered");
        } else {
            console.warn("Background planning sync already registered");
        }
    } catch (error) {
        console.error("Error registering background sync:", error);
    }
};

// Unregister background fetch
export const unregisterBackgroundSync = async () => {
    try {
        const isRegistered =
            await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

        if (isRegistered) {
            await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
            console.log("Background planning sync unregistered");
        }
    } catch (error) {
        console.error("Error unregistering background sync:", error);
    }
};

// Detect changes between old and new planning
interface PlanningChange {
    type: "added" | "removed" | "modified";
    event: PlanningEvent;
}

const detectPlanningChanges = (
    oldPlanning: PlanningEvent[],
    newPlanning: PlanningEvent[]
): PlanningChange[] => {
    const changes: PlanningChange[] = [];

    // Check for new or modified events
    newPlanning.forEach((newEvent) => {
        const oldEvent = oldPlanning.find(
            (old) =>
                old.id === newEvent.id ||
                (old.subject === newEvent.subject &&
                    new Date(old.start).getTime() ===
                        new Date(newEvent.start).getTime())
        );

        if (!oldEvent) {
            // New event
            changes.push({ type: "added", event: newEvent });
        } else if (
            oldEvent.room !== newEvent.room ||
            oldEvent.end !== newEvent.end ||
            oldEvent.title !== newEvent.title
        ) {
            // Modified event
            changes.push({ type: "modified", event: newEvent });
        }
    });

    // Check for removed events
    oldPlanning.forEach((oldEvent) => {
        const stillExists = newPlanning.some(
            (newEvent) =>
                newEvent.id === oldEvent.id ||
                (newEvent.subject === oldEvent.subject &&
                    new Date(newEvent.start).getTime() ===
                        new Date(oldEvent.start).getTime())
        );

        if (!stillExists) {
            changes.push({ type: "removed", event: oldEvent });
        }
    });

    return changes;
};

// Send notification for planning changes
const sendPlanningChangeNotification = async (
    changeType: "added" | "removed" | "modified",
    event: PlanningEvent
) => {
    const eventDate = new Date(event.start);
    const formattedDate = eventDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    let title = "";
    let body = "";

    switch (changeType) {
        case "added":
            title = "Nouveau cours ajouté";
            body = `${event.title || event.subject} a été ajouté le ${formattedDate}${event.room ? " en " + event.room : ""}.`;
            break;
        case "removed":
            title = "Cours annulé";
            body = `${event.title || event.subject} du ${formattedDate} a été annulé.`;
            break;
        case "modified":
            title = "Cours modifié";
            body = `${event.title || event.subject} du ${formattedDate} a été modifié.`;
            break;
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body
        },
        trigger: null // Send immediately
    });

    console.log(`Planning change notification sent: ${title} - ${body}`);
};
