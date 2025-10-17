import { create } from "zustand";
import {
    clearStateFromStorage,
    loadStateFromStorage,
    saveStateToStorage
} from "./storage";

// Permet de découvrir les noms de matières inconnues pour ajouter des couleurs et icônes
type SentUnknownSubjectState = {
    unknownSubjects: string[];
    setUnknownSubjects: (subjects: string[]) => void;
    clearUnknownSubjects: () => void;
};

export const useSentUnknownSubjectStore = create<SentUnknownSubjectState>(
    (set) => ({
        unknownSubjects: [], // Etat initial
        setUnknownSubjects: (subjects: string[]) => {
            set({ unknownSubjects: subjects });
            saveStateToStorage("unknownSubjects", subjects);
        }, // Modifie les matières inconnues
        clearUnknownSubjects: () => {
            set({ unknownSubjects: [] });
            clearStateFromStorage("unknownSubjects");
        } // Supprime les matières inconnues
    })
);

// On charge les stores depuis le stockage
export async function initializeTelemetryStores() {
    const initialUnknownSubjectsState =
        await loadStateFromStorage("unknownSubjects");

    if (initialUnknownSubjectsState) {
        useSentUnknownSubjectStore.setState({
            unknownSubjects: initialUnknownSubjectsState
        });
    }
}
