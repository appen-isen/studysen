import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the planning event type
export interface PlanningEvent {
    id?: string;
    title?: string;
    subject: string;
    start: string;
    end: string;
    room?: string;
    teacher?: string;
    className?: string;
    description?: string;
}

// Define the planning store state
interface PlanningState {
    planning: PlanningEvent[];
    isLoading: boolean;
    lastUpdated: string | null;
    setPlanning: (planning: PlanningEvent[]) => void;
    updateEvent: (updatedEvent: PlanningEvent) => void;
    addEvent: (newEvent: PlanningEvent) => void;
    removeEvent: (eventId: string) => void;
    clearPlanning: () => void;
    setIsLoading: (isLoading: boolean) => void;
}

// Create the planning store with persistence
const usePlanningStore = create<PlanningState>()(
    persist(
        (set, get) => ({
            planning: [],
            isLoading: false,
            lastUpdated: null,
            setPlanning: (planning) =>
                set({
                    planning,
                    lastUpdated: new Date().toISOString()
                }),
            updateEvent: (updatedEvent) =>
                set((state) => ({
                    planning: state.planning.map((event) =>
                        event.id === updatedEvent.id ||
                        (event.subject === updatedEvent.subject &&
                            event.start === updatedEvent.start)
                            ? updatedEvent
                            : event
                    ),
                    lastUpdated: new Date().toISOString()
                })),
            addEvent: (newEvent) =>
                set((state) => ({
                    planning: [...state.planning, newEvent],
                    lastUpdated: new Date().toISOString()
                })),
            removeEvent: (eventId) =>
                set((state) => ({
                    planning: state.planning.filter(
                        (event) => event.id !== eventId
                    ),
                    lastUpdated: new Date().toISOString()
                })),
            clearPlanning: () =>
                set({
                    planning: [],
                    lastUpdated: new Date().toISOString()
                }),
            setIsLoading: (isLoading) => set({ isLoading })
        }),
        {
            name: "planning-storage",
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
);

// Initialize the planning store
export const initializePlanningStore = async () => {
    console.log("Initializing planning store");
    // Any additional initialization logic can go here
};

export default usePlanningStore;
