// Code permettant à l'application de fonctionner en tant qu'application de bureau (Windows, Mac, Linux) avec Tauri

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
