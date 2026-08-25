import { Dark, Light } from "@/constants/Colors";
import useSettingsStore from "@/stores/settingsStore";
import { useMemo } from "react";
import { useColorScheme } from "react-native";

// Retourne le thème actif ("light" | "dark") en fonction des réglages utilisateur
// et, si le réglage est "system", du thème du système d'exploitation
export function useColorScheme_(): "light" | "dark" {
    const systemScheme = useColorScheme();
    const theme = useSettingsStore((state) => state.settings.theme);

    if (theme === "system") {
        return systemScheme === "dark" ? "dark" : "light";
    }
    return theme;
}

// Hook principal : retourne la palette de couleurs active (claire ou sombre)
export default function useColors() {
    const scheme = useColorScheme_();
    return useMemo(() => (scheme === "dark" ? Dark : Light), [scheme]);
}
