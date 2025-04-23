import { PostType } from "@/utils/types";
import { create } from "zustand";

type PostDetailsType = {
    currentPost: PostType | null;
    setCurrentPost: (post: PostType) => void;
    clearCurrentPost: () => void;
};

//Les données
export const usePostDetailsStore = create<PostDetailsType>((set) => ({
    currentPost: null,
    setCurrentPost: (currentPost) => set({ currentPost }),
    clearCurrentPost: () => set({ currentPost: null })
}));
