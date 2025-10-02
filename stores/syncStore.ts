import { PlanningEvent } from "@/webAurion/utils/types";
import { create } from "zustand";
import {
    clearStateFromStorage,
    loadStateFromStorage,
    saveStateToStorage
} from "./storage";

type SyncStatus = "syncing" | "error" | "success";

type SyncState = {
    syncStatus: SyncStatus;
    lastSyncDate: Date | null;
    setSyncStatus: (status: SyncStatus) => void;
    setLastSyncDate: (date: Date | null) => void;
    // Planning déjà synchronisé - non persistant (pour éviter de re télécharger le planning quand on retourne une semaine déjà vue)
    alreadySyncedPlanning: PlanningEvent[];
    setAlreadySyncedPlanning: (planning: PlanningEvent[]) => void;
    clearAlreadySyncedPlanning: () => void;
};

// Status de la synchronisation
export const useSyncStore = create<SyncState>((set) => ({
    syncStatus: "syncing",
    lastSyncDate: null,
    setSyncStatus: (syncStatus: SyncStatus) => set({ syncStatus }),
    setLastSyncDate: (lastSyncDate: Date | null) => {
        // On sauvegarde la date de la dernière synchronisation (persistance)
        set({ lastSyncDate });
        if (lastSyncDate) {
            saveStateToStorage("syncDate", lastSyncDate.toISOString());
        } else {
            clearStateFromStorage("syncDate");
        }
    },
    alreadySyncedPlanning: [],
    setAlreadySyncedPlanning: (alreadySyncedPlanning: PlanningEvent[]) =>
        set({ alreadySyncedPlanning }),
    clearAlreadySyncedPlanning: () => set({ alreadySyncedPlanning: [] })
}));

// On charge les stores depuis le stockage
export async function initializeSyncStores() {
    const lastSyncDate = await loadStateFromStorage("syncDate");

    // Récupère la date de la dernière synchronisation
    if (lastSyncDate) {
        useSyncStore.setState({ lastSyncDate: new Date(lastSyncDate) });
    }
}
