import { TextProps, Text as NativeText, TextStyle } from "react-native";

// Fonction pour afficher du texte en gras
export function Bold(props: TextProps) {
    return (
        <NativeText {...props} style={[{ fontWeight: "bold" }, props.style]} />
    );
}

// Permet d'appliquer la police OpenSans à un texte
export function Text(props: TextProps) {
    const getFontFamily = () => {
        if (props.style && typeof props.style === "object") {
            const styles = Array.isArray(props.style) ? props.style : [props.style];
            const fontWeight = styles
                .map(style => (style && typeof style === "object" && 'fontWeight' in style ? (style as TextStyle).fontWeight : undefined))
                .find(weight => weight !== undefined);

            if (fontWeight) {
                if (fontWeight === "bold" || Number(fontWeight) >= 700) return "OpenSans-700";
                if (fontWeight === "semibold" || Number(fontWeight) >= 600) return "OpenSans-600";
                if (Number(fontWeight) <= 300) return "OpenSans-300";
            }
        }
        return "OpenSans-400";
    };

    return (
        <NativeText
            {...props}
            style={[{ fontFamily: getFontFamily() }, props.style]}
        />
    );
}
