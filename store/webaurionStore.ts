import { NotesList, PlanningEvent } from "@/webAurion/utils/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PlanningState = {
    planning: PlanningEvent[];
    setPlanning: (planning: PlanningEvent[]) => void;
    clearPlanning: () => void;
};
type SyncedPlanningState = {
    syncedPlanning: PlanningEvent[];
    setSyncedPlanning: (planning: PlanningEvent[]) => void;
    clearSyncedPlanning: () => void;
};
type NotesState = {
    notes: NotesList[];
    setNotes: (notes: NotesList[]) => void;
    clearNotes: () => void;
};

const customStorage = {
    getItem: async (key: string) => {
        try {
            const value = await AsyncStorage.getItem(key);
            console.log(
                `Getting item with key ${key}, val: ${JSON.stringify(value)}`
            );
            return value ? JSON.parse(value) : null; // Deserialize the data
        } catch (error) {
            console.error(`Error getting item with key ${key}:`, error);
            return null;
        }
    },
    setItem: async (key: string, value: any) => {
        try {
            console.log(
                `Setting item with key ${key}, val: ${JSON.stringify(value)}`
            );
            await AsyncStorage.setItem(key, JSON.stringify(value)); // Serialize the data
        } catch (error) {
            console.error(`Error setting item with key ${key}:`, error);
        }
    },
    removeItem: async (key: string) => {
        try {
            console.log(`Removing item with key ${key}`);
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item with key ${key}:`, error);
        }
    },
};

// Planning de l'utilisateur
export const usePlanningStore = create<PlanningState>()(
    persist(
        (set) => ({
            planning: [], // Etat initial
            setPlanning: (planning) => set({ planning }), // Modifie le planning
            clearPlanning: () => set({ planning: [] }), // Supprime le planning
        }),
        //Permet de sauvagarder le planning même lorsque l'appli est redémarrée
        {
            name: "planning", // Nom de la clé dans AsyncStorage
            storage: customStorage, // Utilisation d'AsyncStorage pour la persistance
        }
    )
);

// Planning synchronisé avec Internet (pas de persistance pour celui ci)
export const useSyncedPlanningStore = create<SyncedPlanningState>((set) => ({
    syncedPlanning: [],
    setSyncedPlanning: (syncedPlanning) => set({ syncedPlanning }),
    clearSyncedPlanning: () => set({ syncedPlanning: [] }),
}));

// Notes de l'utilisateur
export const useNotesStore = create<NotesState>()(
    persist(
        (set) => ({
            notes: [], // Etat initial
            setNotes: (notes) => set({ notes }), // Modifie les notes
            clearNotes: () => set({ notes: [] }), // Supprime les notes
        }),
        //Permet de sauvagarder les notes même lorsque l'appli est redémarrée
        {
            name: "notes", // Nom de la clé dans AsyncStorage
            storage: customStorage, // Utilisation d'AsyncStorage pour la persistance
        }
    )
);
