import {
    TextProps,
    Text as NativeText,
    TextStyle,
    Platform
} from "react-native";

// Fonction pour afficher du texte en gras
export function Bold(props: TextProps) {
    return <Text {...props} style={[{ fontWeight: "bold" }, props.style]} />;
}

export function Text(props: TextProps) {
    const getFontFamily = () => {
        const styles = Array.isArray(props.style) ? props.style : [props.style];

        // Police par défaut
        let finalFontFamily = "OpenSans";
        let finalFontWeight = "300";

        if (props.style && typeof props.style === "object") {
            const fontWeight = styles
                .map((style) =>
                    style && typeof style === "object" && "fontWeight" in style
                        ? (style as TextStyle).fontWeight
                        : undefined
                )
                .find((weight) => weight !== undefined);

            if (fontWeight) {
                if (Platform.OS === "ios") {
                    // Pour iOS, on peut utiliser fontWeight directement
                    finalFontWeight = fontWeight.toString();
                } else {
                    // Pour Android, on doit mapper les valeurs de fontWeight
                    const fontWeightMap: Record<string, string> = {
                        "100": "OpenSans-300",
                        "200": "OpenSans-300",
                        "300": "OpenSans-300",
                        "400": "OpenSans-400",
                        normal: "OpenSans-400",
                        "500": "OpenSans-400",
                        "600": "OpenSans-600",
                        "700": "OpenSans-700",
                        "800": "OpenSans-700",
                        "900": "OpenSans-700",
                        bold: "OpenSans-700"
                    };
                    finalFontFamily =
                        fontWeightMap[fontWeight.toString()] || "OpenSans-300";
                }
            }
        }

        return Platform.select({
            ios: {
                fontFamily: finalFontFamily,
                fontWeight: finalFontWeight
            },
            android: {
                fontFamily: finalFontFamily
            }
        }) as TextStyle;
    };

    const getStyleWithoutFontWeight = () => {
        const styles = Array.isArray(props.style) ? props.style : [props.style];
        const newStyles = styles.map((style) => {
            if (style && typeof style === "object") {
                const { fontWeight, ...newStyle } = style as TextStyle;
                return newStyle;
            }
            return style;
        });
        return newStyles;
    };

    return (
        <NativeText
            {...props}
            style={[getFontFamily(), getStyleWithoutFontWeight()]}
        />
    );
}
