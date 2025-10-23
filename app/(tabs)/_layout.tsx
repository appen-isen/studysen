import React, { useEffect, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { AppState, AppStateStatus } from "react-native";
import { AnimatedPressable } from "@/components/Buttons";
import { useSyncStore } from "@/stores/syncStore";
import { startAutoSync, stopAutoSync } from "@/services/syncService";

//Code correspondant à la bottom nav de l'application

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
    name: keyof typeof MaterialIcons.glyphMap;
    color: string;
}) {
    return <MaterialIcons size={28} {...props} />;
}

export default function TabLayout() {
    //On utilise un hook pour gérer l'état de l'application (arrivée en arrière-plan, en premier plan, etc.)
    const appState = useRef<AppStateStatus>(AppState.currentState);

    const checkAndSync = () => {
        const lastSyncDate = useSyncStore.getState().lastSyncDate;
        if (
            lastSyncDate instanceof Date &&
            Date.now() - lastSyncDate.getTime() > 5 * 60 * 1000
        ) {
            // Plus de 5 minutes se sont écoulées depuis la dernière synchronisation
            stopAutoSync();
            useSyncStore.getState().clearAlreadySyncedPlanning();
            startAutoSync();
        }
    };

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === "active") {
                checkAndSync();
            }

            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener(
            "change",
            handleAppStateChange
        );

        // Vérifier au lancement de l'app si une synchronisation est nécessaire
        if (appState.current === "active") {
            checkAndSync();
        }

        return () => subscription.remove();
    }, []);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.darkGray,
                headerShown: false,
                tabBarButton: (props) => {
                    const { ref: _ref, style, ...rest } = props as any;
                    return <AnimatedPressable style={style} {...rest} />;
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Accueil",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="home" color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="planning"
                options={{
                    title: "Cours",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="calendar-month" color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="clubs"
                options={{
                    title: "Clubs",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="celebration" color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Profil",
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="account-circle" color={color} />
                    )
                }}
            />
            <Tabs.Screen name="notes" options={{ href: null }} />
        </Tabs>
    );
}
