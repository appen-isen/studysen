import {
    StyleSheet,
    TextProps,
    Text as NativeText,
    TextStyle
} from "react-native";

// Fonction pour afficher du texte en gras
export function Bold(props: TextProps) {
    return <Text {...props} style={[{ fontWeight: "bold" }, props.style]} />;
}

export function Text(props: TextProps) {
    const flattenedStyle = StyleSheet.flatten(props.style) || {};

    const fontWeightValue = flattenedStyle.fontWeight;
    let resolvedFontFamily = flattenedStyle.fontFamily as string | undefined;

    if (!resolvedFontFamily) {
        let normalizedWeight = "400";

        if (fontWeightValue) {
            if (typeof fontWeightValue === "string") {
                if (fontWeightValue === "normal") {
                    normalizedWeight = "400";
                } else if (fontWeightValue === "bold") {
                    normalizedWeight = "700";
                } else if (!isNaN(Number(fontWeightValue))) {
                    normalizedWeight = fontWeightValue;
                }
            } else if (typeof fontWeightValue === "number") {
                normalizedWeight = fontWeightValue.toString();
            }
        }

        const fontWeightMap: Record<string, string> = {
            "100": "OpenSans-400",
            "200": "OpenSans-400",
            "300": "OpenSans-400",
            "400": "OpenSans-400",
            "500": "OpenSans-400",
            "600": "OpenSans-600",
            "700": "OpenSans-700",
            "800": "OpenSans-700",
            "900": "OpenSans-700"
        };

        resolvedFontFamily = fontWeightMap[normalizedWeight] || "OpenSans-400";
    }

    const { fontWeight, fontFamily, ...styleWithoutFontWeight } =
        flattenedStyle as TextStyle;

    return (
        <NativeText
            {...props}
            style={[
                { fontFamily: resolvedFontFamily || "OpenSans-400" },
                styleWithoutFontWeight
            ]}
        />
    );
}
