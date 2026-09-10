// Palette des widgets Android, alignée sur constants/Colors.ts (card/black/gray).
// react-native-android-widget ne suit pas le thème système automatiquement :
// il faut fournir des arbres "light" et "dark" séparés
export type WidgetTheme = "light" | "dark";

export type WidgetColors = {
    background: string;
    textPrimary: string;
    textSecondary: string;
};

const LIGHT_COLORS: WidgetColors = {
    background: "#FFFFFF",
    textPrimary: "#141414",
    textSecondary: "#868686"
};

const DARK_COLORS: WidgetColors = {
    background: "#1E1E1E",
    textPrimary: "#F2F2F2",
    textSecondary: "#9A9A9E"
};

export function getWidgetColors(theme: WidgetTheme): WidgetColors {
    return theme === "dark" ? DARK_COLORS : LIGHT_COLORS;
}
