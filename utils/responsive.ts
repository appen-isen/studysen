import { Dimensions } from "react-native";

// Récupération des dimensions de l'écran
const { width: screenWidth } = Dimensions.get("window");

// Fonction pour déterminer le type d'appareil
export const getDeviceType = () => {
    if (screenWidth >= 768) {
        return "tablet";
    } else if (screenWidth >= 480) {
        return "large-phone";
    } else {
        return "phone";
    }
};

// Fonction pour obtenir la largeur maximale responsive
export const getResponsiveMaxWidth = () => {
    const deviceType = getDeviceType();

    switch (deviceType) {
        case "tablet":
            // Pour les tablettes, on utilise une largeur plus large mais avec des marges
            return Math.min(screenWidth * 0.85, 800);
        case "large-phone":
            return Math.min(screenWidth * 0.9, 600);
        default:
            return Math.min(screenWidth * 0.95, 400);
    }
};

// Fonction pour obtenir le padding horizontal responsive
export const getResponsivePadding = () => {
    const deviceType = getDeviceType();

    switch (deviceType) {
        case "tablet":
            return 30;
        case "large-phone":
            return 25;
        default:
            return 20;
    }
};

// Fonction pour obtenir la taille de police responsive
export const getResponsiveFontSize = (baseSize: number) => {
    const deviceType = getDeviceType();

    switch (deviceType) {
        case "tablet":
            return baseSize * 1.1; // Légèrement plus grand pour les tablettes
        case "large-phone":
            return baseSize * 1.05;
        default:
            return baseSize;
    }
};
