import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";

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
                    title: "Clubs",
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
        </Tabs>
    );
}
