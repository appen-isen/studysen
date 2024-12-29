import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

//Layout par défaut de l'application

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    //On charge les polices de caractères
    const [loaded, error] = useFonts({
        OpenSans: require("../assets/fonts/OpenSans.ttf"),
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}

//Il s'agit de la navigation principale de l'application
function RootLayoutNav() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            {/* Les parenthèrese permettent de faire comme si les routes étaient directement à la racine de /app 
            Par exemple, <Link href="login-help" /> est possible au lieu de <Link href="(modals)/login-help" /> 
            */}
            <Stack.Screen name="(tabs)" />
            {/* //On définit ici les modales */}
            <Stack.Screen
                name="(modals)/login-help"
                options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerTitle: "Aide à la connexion",
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="(modals)/notes-help"
                options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerTitle: "Informations sur les notes",
                    headerShown: true,
                }}
            />
        </Stack>
    );
}
