import React, { useEffect, useRef, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { AppState, AppStateStatus } from "react-native";

//Code correspondant à la bottom nav de l'application

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
    name: keyof typeof MaterialIcons.glyphMap;
    color: string;
}) {
    return (
        <MaterialIcons
            size={28}
            {...props}
        />
    );
}

export default function TabLayout() {
    //On utilise un hook pour gérer l'état de l'application (arrivée en arrière-plan, en premier plan, etc.)
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const [lastBackgroundTime, setLastBackgroundTime] = useState<number | null>(
        null
    );
    const [shouldRestart, setShouldRestart] = useState(false);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (
                appState.current === "active" &&
                nextAppState.match(/inactive|background/)
            ) {
                // L'application passe en arrière-plan
                setLastBackgroundTime(Date.now());
            } else if (
                appState.current.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                // L'application revient en premier plan
                if (
                    lastBackgroundTime &&
                    Date.now() - lastBackgroundTime > 5 * 60 * 1000
                ) {
                    // Plus de 5 minutes se sont écoulées depuis la dernière fois que l'application était en premier plan
                    setShouldRestart(true);
                }
            }

            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener(
            "change",
            handleAppStateChange
        );

        return () => {
            subscription.remove();
        };
    }, [lastBackgroundTime]);

    if (shouldRestart) {
        // On simule un redémarrage de l'application
        return <RestartApp />;
    }
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.darkGray,
            headerShown: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Accueil",
                    tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="planning"
                options={{
                    title: "Cours",
                    tabBarIcon: ({ color }) => <TabBarIcon name="calendar-month" color={color} />,
                }}
            />
            <Tabs.Screen
                name="clubs"
                options={{
                    title: "Clubs",
                    tabBarIcon: ({ color }) => <TabBarIcon name="celebration" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color }) => <TabBarIcon name="account-circle" color={color} />,
                }}
            />
            <Tabs.Screen name="notes" options={{ href: null }} />
        </Tabs>
    );
}

function RestartApp() {
    const router = useRouter();
    useEffect(() => {
        // On va réinitialiser l'application en rechargeant l'état
        setTimeout(() => {
            router.replace("/login");
        }, 10);
    }, []);

    return null;
}
