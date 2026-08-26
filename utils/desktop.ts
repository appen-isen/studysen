// Code permettant à l'application de fonctionner en tant qu'application de bureau (Windows, Mac, Linux) avec Tauri

// Permet de distinguer l'appli de bureau Tauri (qui tourne aussi avec Platform.OS === "web")
// d'un vrai navigateur web (Expo web), qui n'a pas accès au pont Tauri
export function isTauri(): boolean {
    return typeof window !== "undefined" && "__TAURI__" in window;
}

export const sendTauriCommand = async (command: string, args: any) => {
    //Si Tauri est disponible, on envoie la commande
    if (typeof window !== "undefined" && "__TAURI__" in window) {
        // @ts-ignore
        const { invoke } = window.__TAURI__.core;
        try {
            const result = await invoke(command, args);
            return result;
        } catch (error) {
            console.error("Error invoking Tauri command:", error);
        }
    } else {
        console.warn(
            "Not in Tauri environment. Skipping Rust command invocation."
        );
    }
};
