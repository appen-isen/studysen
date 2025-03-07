import { TextProps, Text as NativeText, TextStyle } from "react-native";

// Fonction pour afficher du texte en gras
export function Bold(props: TextProps) {
    return (
        <NativeText {...props} style={[{ fontWeight: "bold" }, props.style]} />
    );
}

export function Text(props: TextProps) {
    const getFontFamily = () => {
        const styles = Array.isArray(props.style) ? props.style : [props.style];
        if (props.style && typeof props.style === "object") {
            const fontWeight = styles
                .map(style => (style && typeof style === "object" && "fontWeight" in style ? (style as TextStyle).fontWeight : undefined))
                .find(weight => weight !== undefined);

            if (fontWeight) {
                if (fontWeight === "bold" || Number(fontWeight) >= 700) return "OpenSans-700";
                if (fontWeight === "semibold" || Number(fontWeight) >= 600) return "OpenSans-600";
                if (Number(fontWeight) <= 300) return "OpenSans-300";
            }
        }
        return "OpenSans-400";
    };

    const getStyleWithoutFontWeight = () => {
        const styles = Array.isArray(props.style) ? props.style : [props.style];
        const newStyles = styles.map(style => {
            if (style && typeof style === "object") {
                const { fontWeight, ...newStyle } = style as TextStyle;
                return newStyle;
            }
            return style;
        });
        return newStyles;
    };

    return <NativeText {...props} style={[{ fontFamily: getFontFamily() }, getStyleWithoutFontWeight()]} />;
}
