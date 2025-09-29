import { TextProps, Text as NativeText } from "react-native";

// Fonction pour afficher du texte en gras
export function Bold(props: TextProps) {
    return <Text {...props} style={[{ fontWeight: "bold" }, props.style]} />;
}

export function Text(props: TextProps) {
    // Text qui pourras avoir des styles par défaut plus tard
    return <NativeText {...props} />;
}
