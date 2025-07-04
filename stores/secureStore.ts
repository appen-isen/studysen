import { sendTauriCommand } from "@/utils/desktop";
import { getItemAsync, setItemAsync, deleteItemAsync } from "expo-secure-store";
import { Platform } from "react-native";

//Permet de stocker des données sensibles de manière sécurisée (accessible après redémarrage de l'application = fichier de stockage)
//Toutes les données stockées par le secure store sont chiffrés par Expo et sont uniquement accessible par l'application
export async function getSecureStoreItem(key: string): Promise<string | null> {
    try {
        if (Platform.OS === "web") {
            //Si on est sur l'appli de bureau, on utilise le secure store de Tauri
            return await sendTauriCommand("get_secure_item", { key });
        }
        return await getItemAsync(key);
    } catch (e) {
        console.error("Failed to get item from SecureStore", e);
        return null;
    }
}
export async function setSecureStoreItem(
    key: string,
    value: string
): Promise<void> {
    try {
        if (Platform.OS === "web") {
            //Si on est sur l'appli de bureau, on utilise le secure store de Tauri
            return await sendTauriCommand("set_secure_item", { key, value });
        }
        await setItemAsync(key, value);
    } catch (e) {
        console.error("Failed to set item in SecureStore", e);
    }
}

export async function removeSecureStoreItem(key: string): Promise<void> {
    try {
        if (Platform.OS === "web") {
            //Si on est sur l'appli de bureau, on utilise le secure store de Tauri
            return await sendTauriCommand("delete_item", { key });
        }
        await deleteItemAsync(key);
    } catch (e) {
        console.error("Failed to remove item from SecureStore", e);
    }
}
