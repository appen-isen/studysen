import { useRef, useState } from "react";
import {
    ButtonProps,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Animated,
    GestureResponderEvent,
    StyleProp,
    ViewStyle,
} from "react-native";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";

export type StyledButtonType = {
    textStyle?: object;
    style?: object;
    JSX?: JSX.Element;
    isLoading?: boolean;
};

export function Button(props: ButtonProps & StyledButtonType): JSX.Element {
    const { onPress, style, textStyle, JSX, title } = props;
    const [pressed, setPressed] = useState(false);

    return (
        <Pressable
            style={
                pressed
                    ? { ...styles.button, ...styles.pressedButton, ...style }
                    : { ...styles.button, ...style }
            }
            onPress={onPress}
            onPressOut={() => setPressed(false)}
            onPressIn={() => setPressed(true)}
        >
            {/* Contenu JSX ou texte */}
            {JSX && JSX}
            {!JSX && props.isLoading && (
                <ActivityIndicator
                    animating={true}
                    color="white"
                    size={"large"}
                />
            )}
            {/* Si le bouton n'a pas de composant custom et ne charge pas alors on affiche le texte*/}
            {!JSX && !props.isLoading && (
                <Text style={{ ...styles.buttonText, ...textStyle }}>
                    {title}
                </Text>
            )}
        </Pressable>
    );
}

interface AnimatedPressableProps {
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
    scale?: number;
}
// Pressable animé (scale)
export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
    onPress,
    style,
    children,
    scale = 0.8,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: scale,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View
                style={[style, { transform: [{ scale: scaleAnim }] }]}
            >
                {children}
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        margin: 15,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 25,
        paddingRight: 25,
        height: 50,
        borderRadius: 15,
        backgroundColor: Colors.primaryColor,
    },
    pressedButton: {
        backgroundColor: Colors.secondaryColor,
    },
    buttonText: {
        fontSize: 22,
        fontWeight: "bold",
        letterSpacing: 0.25,
        color: "white",
    },
});
