import React from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsLayout() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Slot />
        </SafeAreaView>
    );
}
