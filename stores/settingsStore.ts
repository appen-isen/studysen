import { create } from "zustand";
import {
    clearStateFromStorage,
    loadStateFromStorage,
    saveStateToStorage
} from "./storage";

// Liste des campus
export const CAMPUS = ["Nantes", "Rennes", "Brest", "Caen"] as const;

export type NotificationDelay = "5min" | "15min" | "30min" | "1h";

type Settings = {
    campus: (typeof CAMPUS)[number];
    username: string;
    notificationsEnabled: boolean;
    notificationsDelay: NotificationDelay;
    localNotifications: boolean;
    deviceId: string;
};

type SettingsState = {
    settings: Settings;
    setSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
    clearSettings: () => void;
};

// Paramètres par défaut de l'application
function getDefaultSettings(): Settings {
    return {
        campus: "Nantes",
        username: "",
        notificationsEnabled: true,
        notificationsDelay: "15min",
        localNotifications: false,
        deviceId: ""
    };
}

// Gestion des réglages de l'application
const useSettingsStore = create<SettingsState>()((set) => ({
    settings: getDefaultSettings(), // Paramètres par défaut de l'application
    setSettings: (key, value) => {
        set((state) => {
            const updatedSettings = { ...state.settings, [key]: value };
            saveStateToStorage("settings", updatedSettings); // On sauvegarde les réglages dans le stockage
            return { settings: updatedSettings };
        });
    }, // Modifie les réglages
    clearSettings: () => {
        set({ settings: getDefaultSettings() });
        clearStateFromStorage("settings");
    } // Réinitialise les réglages
}));

// On charge les stores depuis le stockage
export async function initializeSettingsStore() {
    const initialSettingsState = await loadStateFromStorage("settings");

    if (initialSettingsState) {
        //On ajoute la valeur par défaut pour les paramètres non enregistrés
        const settings = { ...getDefaultSettings(), ...initialSettingsState };
        useSettingsStore.setState({ settings: settings });
    }
}

// On transforme un nom de campus en ID
export function campusToId(campus: (typeof CAMPUS)[number]): number {
    switch (campus) {
        case "Nantes":
            return 1;
        case "Rennes":
            return 2;
        case "Brest":
            return 3;
        case "Caen":
            return 4;
        default:
            return 1;
    }
}

export default useSettingsStore;
