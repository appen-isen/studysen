import { PostType } from "@/utils/types";
import { create } from "zustand";
import { loadStateFromStorage, saveStateToStorage } from "./storage";

type PostDetailsType = {
    currentPost: PostType | null;
    setCurrentPost: (post: PostType) => void;
    clearCurrentPost: () => void;
};

type PostsStoreType = {
    lastSeenPostId: number | null;
    hasNewPost: boolean;
    setLastSeenPostId: (id: number | null) => void;
    setHasNewPost: (hasNew: boolean) => void;
    markPostsAsViewed: () => void;
};

//Les données
export const usePostDetailsStore = create<PostDetailsType>((set) => ({
    currentPost: null,
    setCurrentPost: (currentPost) => set({ currentPost }),
    clearCurrentPost: () => set({ currentPost: null })
}));

// Store pour gérer l'état des posts
export const usePostsStore = create<PostsStoreType>((set, get) => ({
    lastSeenPostId: null,
    hasNewPost: false,

    setLastSeenPostId: (id) => {
        set({ lastSeenPostId: id });
        // Sauvegarder dans AsyncStorage
        saveStateToStorage("lastSeenPostId", id);
    },

    setHasNewPost: (hasNew) => set({ hasNewPost: hasNew }),

    // Marquer les posts comme vus (quand l'utilisateur ouvre l'onglet Clubs)
    markPostsAsViewed: () => {
        const { lastSeenPostId } = get();
        set({ hasNewPost: false });
        if (lastSeenPostId !== null) {
            saveStateToStorage("lastSeenPostId", lastSeenPostId);
        }
    }
}));

// Fonction d'initialisation pour charger le store des posts
export async function initializePostsStore() {
    const initialLastSeenPostId = await loadStateFromStorage("lastSeenPostId");

    if (initialLastSeenPostId) {
        usePostsStore.setState({
            lastSeenPostId: initialLastSeenPostId
        });
    }
}
