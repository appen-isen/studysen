import { PlanningEvent } from "@/webAurion/utils/types";
import { create } from "zustand";

type PlanningState = {
    planning: PlanningEvent[] | null;
    setPlanning: (planning: PlanningEvent[]) => void;
    clearPlanning: () => void;
};
// Planning de l'utilisateur
export const usePlanningStore = create<PlanningState>((set) => ({
    planning: null, // Etat du planning initialisé à null
    setPlanning: (planning) => set({ planning }), // Modifie l'état du planning
    clearPlanning: () => set({ planning: null }), // Supprime le planning
}));
