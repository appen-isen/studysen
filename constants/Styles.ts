import { ColorPalette, Light } from "./Colors";

export function getCardStyle(colors: ColorPalette) {
    return {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16
    } as const;
}

// Conservé pour compatibilité (contextes hors composants, thème clair par défaut)
export const Card = getCardStyle(Light);
