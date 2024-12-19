import { PlanningEvent } from "@/webAurion/utils/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PlanningState = {
    planning: PlanningEvent[];
    setPlanning: (planning: PlanningEvent[]) => void;
    clearPlanning: () => void;
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
            name: "planning-storage", // Nom de la clé dans AsyncStorage
            storage: createJSONStorage(() => AsyncStorage), // Utilisation d'AsyncStorage pour la persistance
        }
    )
);
