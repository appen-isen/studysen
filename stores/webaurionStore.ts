import { NotesList, PlanningEvent } from "@/webAurion/utils/types";
import { create } from "zustand";
import {
    clearStateFromStorage,
    loadStateFromStorage,
    saveStateToStorage
} from "./storage";

type PlanningState = {
    planning: PlanningEvent[];
    setPlanning: (planning: PlanningEvent[]) => void;
    clearPlanning: () => void;
};

type NotesState = {
    notes: NotesList[];
    setNotes: (notes: NotesList[]) => void;
    clearNotes: () => void;
};

// Planning de l'utilisateur
export const usePlanningStore = create<PlanningState>()((set) => ({
    planning: [], // Etat initial
    setPlanning: (planning) => {
        set({ planning });
        saveStateToStorage("planning", planning);
    }, // Modifie le planning
    clearPlanning: () => {
        set({ planning: [] });
        clearStateFromStorage("planning");
    } // Supprime le planning
}));

// Notes de l'utilisateur
export const useNotesStore = create<NotesState>()((set) => ({
    notes: [], // Etat initial
    setNotes: (notes) => {
        set({ notes });
        saveStateToStorage("notes", notes);
    }, // Modifie les notes
    clearNotes: () => {
        set({ notes: [] });
        clearStateFromStorage("notes");
    } // Supprime les notes
}));

// On charge les stores depuis le stockage
export async function initializeWebaurionStores() {
    const initialPlanningState = await loadStateFromStorage("planning");
    const initialNotesState = await loadStateFromStorage("notes");

    if (initialPlanningState) {
        usePlanningStore.setState({ planning: initialPlanningState });
    }

    if (initialNotesState) {
        useNotesStore.setState({ notes: initialNotesState });
    }
}
