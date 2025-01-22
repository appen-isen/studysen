import { create } from "zustand";
import {
    clearStateFromStorage,
    loadStateFromStorage,
    saveStateToStorage,
} from "./storage";

type NotificationDelay = "5min" | "15min" | "30min" | "1h";

type NotificationSettings = {
    delay: NotificationDelay;
    enabled: boolean;
};

type NotificationState = {
    settings: NotificationSettings;
    setSettings: (settings: NotificationSettings) => void;
    clearSettings: () => void;
};

// Paramètres par défaut des notifications
function getDefaultNotificationSettings(): NotificationSettings {
    return {
        delay: "15min",
        enabled: true,
    };
}

// Gestion des réglages de notification
const useNotificationStore = create<NotificationState>()((set) => ({
    settings: getDefaultNotificationSettings(),
    setSettings: (settings) => {
        set({ settings });
        saveStateToStorage("notificationSettings", settings);
    },
    clearSettings: () => {
        set({ settings: getDefaultNotificationSettings() });
        clearStateFromStorage("notificationSettings");
    },
}));

// On charge les stores depuis le stockage
export async function initializeNotificationStore() {
    const initialNotificationState = await loadStateFromStorage("notificationSettings");

    if (initialNotificationState) {
        useNotificationStore.setState({ settings: initialNotificationState });
    }
}

export default useNotificationStore;