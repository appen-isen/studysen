import {
    TextProps,
    Text as NativeText,
    Animated,
    StyleProp,
    TextStyle
} from "react-native";
import useColors from "@/hooks/useColors";
import { useEffect, useRef } from "react";

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
        <NativeText {...props} style={[{ color: colors.black }, props.style]} />
    );
}

type LoadingTextProps = {
    text?: string;
    style?: StyleProp<TextStyle>;
};

// Texte de chargement dont l'opacité pulse tant que la donnée n'est pas disponible
export function LoadingText({
    text = "Chargement...",
    style
}: LoadingTextProps) {
    const colors = useColors();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 600,
                    useNativeDriver: true
                })
            ])
        );
        animation.start();
        // On arrête l'animation lorsque le texte n'est plus affiché
        return () => animation.stop();
    }, [opacity]);

    return (
        <Animated.Text style={[{ color: colors.gray }, style, { opacity }]}>
            {text}
        </Animated.Text>
    );
}
