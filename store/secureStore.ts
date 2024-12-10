import { getItemAsync, setItemAsync, deleteItemAsync } from "expo-secure-store";

//Permet de stocker des données sensibles de manière sécurisée (accessible après redémarrage de l'application = fichier de stockage)
//Toutes les données stockées par le secure store sont chiffrés par Expo et sont uniquement accessible par l'application
export async function getSecureStoreItem(key: string): Promise<string | null> {
    try {
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
        await setItemAsync(key, value);
    } catch (e) {
        console.error("Failed to set item in SecureStore", e);
    }
}

export async function removeSecureStoreItem(key: string): Promise<void> {
    try {
        await deleteItemAsync(key);
    } catch (e) {
        console.error("Failed to remove item from SecureStore", e);
    }
}
