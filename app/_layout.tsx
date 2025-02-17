import { initializeSettingsStore } from "@/store/settingsStore";
import { initializeWebaurionStores } from "@/store/webaurionStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

//Layout par défaut de l'application
export { ErrorBoundary } from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        "OpenSans-300": require("../assets/fonts/OpenSans-300.ttf"),
        "OpenSans-400": require("../assets/fonts/OpenSans-400.ttf"),
        "OpenSans-600": require("../assets/fonts/OpenSans-600.ttf"),
        "OpenSans-700": require("../assets/fonts/OpenSans-700.ttf"),
        ...FontAwesome.font,
    });

    //Etat de chargement des stores
    const [storeLoaded, setStoreLoaded] = useState(false);

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    useEffect(() => {
        const initStores = async () => {
            await initializeWebaurionStores();
            await initializeSettingsStore();
        };
        //On initialise les stores
        initStores().then(() => setStoreLoaded(true));
    }, []);

    if (!loaded || !storeLoaded) {
        return null;
    }

    return <RootLayoutNav />;
}

//Il s'agit de la navigation principale de l'application
function RootLayoutNav() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                //Barre de status
                statusBarBackgroundColor: "#fff",
                statusBarStyle: "dark",
            }}
        >
            <Stack.Screen name="login" />
            {/* Les parenthèrese permettent de faire comme si les routes étaient directement à la racine de /app 
            Par exemple, <Link href="notes-help" /> est possible au lieu de <Link href="(modals)/notes-help" /> 
            */}
            <Stack.Screen name="(tabs)" />
            {/* //On définit ici les modales */}

            <Stack.Screen
                name="(modals)/notes-help"
                options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerTitle: "Informations sur les notes",
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="(settings)"
                options={{
                    presentation: "modal",
                    animation: "slide_from_right",
                }}
            />
        </Stack>
    );
}
