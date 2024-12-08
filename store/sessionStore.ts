import { create } from "zustand";
import { Session } from "webaurion-api";

type SessionState = {
    session: Session | null;
    setSession: (session: Session) => void;
    clearSession: () => void;
};
// Gestion de la session utilisateur
const useSessionStore = create<SessionState>((set) => ({
    session: null, // Etat de la session initialisé à null
    setSession: (session) => set({ session }), // Modifie l'état de la session
    clearSession: () => set({ session: null }), // Supprime la session
}));

export default useSessionStore;
