import { TextProps, Text as NativeText } from "react-native";
import useColors from "@/hooks/useColors";

// Fonction pour afficher du texte en gras
export function Bold(props: TextProps) {
    const colors = useColors();
    return (
        <Text
            {...props}
            style={[{ fontWeight: "bold", color: colors.black }, props.style]}
        />
    );
}

export function Text(props: TextProps) {
    // Text qui a une couleur par défaut adaptée au thème, surchageable via props.style
    const colors = useColors();
    return (
        <NativeText
            {...props}
            style={[{ color: colors.black }, props.style]}
        />
    );
}
