import AsyncStorage from "@react-native-async-storage/async-storage";

// On sauvegarde une clé dans le stockage
export async function saveStateToStorage(key: string, value: any) {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error("Failed to save the state to AsyncStorage", e);
    }
}
// On récupère une clé depuis le stockage
export async function loadStateFromStorage(key: string) {
    try {
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
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error("Failed to clear the state from AsyncStorage", e);
    }
}
