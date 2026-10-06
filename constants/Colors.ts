function hexWithOpacity(hex: string, opacity: number) {
    const alpha = Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0");
    return `${hex}${alpha}`;
}

// TEMPORAIRE : thème Octobre Rose (à supprimer fin octobre)
const isOctoberRose = new Date().getMonth() === 9;
const PRIMARY = isOctoberRose ? "#E91E8C" : "#FA4747";
const SECONDARY = isOctoberRose ? "#F78FC4" : "#f58b8b";

// Palette pour le thème clair
export const Light = {
    primary: PRIMARY,
    secondary: SECONDARY,

    black: "#141414",
    darkGray: "#505050",
    gray: "#868686",
    lightGray: "#CACACA",
    light: "#E7E7E7",
    white: "#FFFFFF",

    background: "#F2F2F7",
    card: "#FFFFFF",
    border: "#E4E4EA",

    contrast: "#141414",

    hexWithOpacity
};

// Palette pour le thème sombre
export const Dark = {
    primary: PRIMARY,
    secondary: SECONDARY,

    black: "#F2F2F2",
    darkGray: "#C7C7CC",
    gray: "#9A9A9E",
    lightGray: "#48484A",
    light: "#2C2C2E",
    white: "#FFFFFF",

    background: "#121212",
    card: "#1E1E1E",
    border: "#2C2C2E",

    contrast: "#3A3A3C",

    hexWithOpacity
};

export type ColorPalette = typeof Light;

// Export par défaut conservé pour la compatibilité avec le code hors composants (ex: utils/colors.ts)
export default Light;
