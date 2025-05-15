import { sendTauriCommand } from "@/utils/desktop";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// On sauvegarde une clé dans le stockage
export async function saveStateToStorage(key: string, value: any) {
    try {
        const jsonValue = JSON.stringify(value);
        if (Platform.OS === "web") {
            //Si on est sur l'appli de bureau, on utilise le secure store de Tauri
            await sendTauriCommand("set_item", {
                key,
                value: jsonValue
            });
            return;
        }
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error("Failed to save the state to AsyncStorage", e);
    }
}
// On récupère une clé depuis le stockage
export async function loadStateFromStorage(key: string) {
    try {
        if (Platform.OS === "web") {
            //Si on est sur l'appli de bureau, on utilise le secure store de Tauri
            let jsonValue = await sendTauriCommand("get_item", { key });
            return jsonValue != undefined ? JSON.parse(jsonValue) : null;
        }
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error("Failed to load the initial state from AsyncStorage", e);
        return null;
    }
}

// On supprime une clé depuis le stockage
export async function clearStateFromStorage(key: string) {
    try {
        if (Platform.OS === "web") {
            //Si on est sur l'appli de bureau, on utilise le secure store de Tauri
            await sendTauriCommand("delete_item", { key });
            return;
        }
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error("Failed to clear the state from AsyncStorage", e);
    }
}
