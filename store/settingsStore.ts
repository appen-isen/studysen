import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Liste des campus
export const CAMPUS = ["Nantes", "Rennes", "Brest", "Caen"] as const;

type Settings = {
    campus: (typeof CAMPUS)[number];
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
    };
}

// Gestion des réglages de l'application
const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: getDefaultSettings(), // Paramètres par défaut de l'application
            setSettings: (key, value) =>
                set((state) => ({
                    settings: { ...state.settings, [key]: value },
                })), // Modifie les réglages
            clearSettings: () => set({ settings: getDefaultSettings() }), // Réinitialise les réglages
        }),
        {
            name: "settings", // Nom de la clé dans AsyncStorage
            storage: createJSONStorage(() => AsyncStorage), // Utilisation d'AsyncStorage pour la persistance
        }
    )
);

export default useSettingsStore;
