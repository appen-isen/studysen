import React, { useEffect, useRef, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { AppState, AppStateStatus } from "react-native";

//Code correspondant à la bottom nav de l'application

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
    name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    color: string;
}) {
    return (
        <MaterialCommunityIcons
            size={28}
            style={{ marginBottom: -3 }}
            {...props}
        />
    );
}

export default function TabLayout() {
    //On utilise un hook pour gérer l'état de l'application (arrivée en arrière-plan, en premier plan, etc.)
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const [lastBackgroundTime, setLastBackgroundTime] = useState<number | null>(
        null,
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
            handleAppStateChange,
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
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primaryColor,
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Accueil",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="home-outline" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="planning"
                options={{
                    title: "Planning",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon
                            name="calendar-month-outline"
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="clubs"
                options={{
                    title: "Vie Associative",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="party-popper" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Mon compte",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon
                            name="account-circle-outline"
                            color={color}
                        />
                    ),
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
