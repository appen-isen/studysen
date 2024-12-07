import { TextProps, Text as NativeText } from "react-native";

// Fonction pour afficher du texte en gras
export function Bold(props: TextProps) {
    return (
        <NativeText {...props} style={[{ fontWeight: "bold" }, props.style]} />
    );
}

// Permet d'appliquer la police OpenSans à un texte
export function Text(props: TextProps) {
    return (
        <NativeText
            {...props}
            style={[{ fontFamily: "OpenSans" }, props.style]}
        />
    );
}
