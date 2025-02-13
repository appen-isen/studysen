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
    View,
    Platform,
} from "react-native";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { Switch, SwitchProps } from "react-native-paper";
interface StyledButtonProps {
    textStyle?: object;
    style?: object;
    JSX?: JSX.Element;
    isLoading?: boolean;
    bgColor?: string;
}

export const Button: React.FC<ButtonProps & StyledButtonProps> = ({
    onPress,
    style,
    textStyle,
    JSX,
    title,
    isLoading,
    bgColor,
}) => {
    const [pressed, setPressed] = useState(false);

    return (
        <Pressable
            style={[
                pressed
                    ? { ...styles.button, ...styles.pressedButton, ...style }
                    : { ...styles.button, ...style },
                bgColor && { backgroundColor: bgColor },
            ]}
            onPress={onPress}
            onPressOut={() => setPressed(false)}
            onPressIn={() => setPressed(true)}
        >
            {/* Contenu JSX ou texte */}
            {JSX && JSX}
            {!JSX && isLoading && (
                <ActivityIndicator
                    animating={true}
                    color="white"
                    size={"large"}
                />
            )}
            {/* Si le bouton n'a pas de composant custom et ne charge pas alors on affiche le texte*/}
            {!JSX && !isLoading && (
                <Text style={{ ...styles.buttonText, ...textStyle }}>
                    {title}
                </Text>
            )}
        </Pressable>
    );
};

interface AnimatedPressableProps {
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
    scale?: number;
}
const AnimatedPressableComp = Animated.createAnimatedComponent(Pressable);
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
        <AnimatedPressableComp
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, { transform: [{ scale: scaleAnim }] }]}
        >
            {children}
        </AnimatedPressableComp>
    );
};

interface DoubleSelectorProps {
    containerStyle?: StyleProp<ViewStyle>;
    selected: 0 | 1;
    setSelected: (selected: 0 | 1) => void;
    firstSelector: React.ReactNode;
    secondSelector: React.ReactNode;
}

export const DoubleSelector: React.FC<DoubleSelectorProps> = ({
    containerStyle,
    selected,
    setSelected,
    firstSelector,
    secondSelector,
}) => {
    return (
        <View style={[doubleSelectorStyles.container, containerStyle]}>
            {/* Boutons pour change l'affichage de l'emploi du temps (mode liste ou mode semaine) */}
            <AnimatedPressable
                style={[
                    doubleSelectorStyles.selectorItem1,
                    selected === 0 && {
                        backgroundColor: Colors.primary,
                    },
                ]}
                onPress={() => setSelected(0)}
                scale={0.95}
            >
                {firstSelector}
            </AnimatedPressable>
            <AnimatedPressable
                style={[
                    doubleSelectorStyles.selectorItem2,
                    selected === 1 && {
                        backgroundColor: Colors.primary,
                    },
                ]}
                onPress={() => setSelected(1)}
                scale={0.95}
            >
                {secondSelector}
            </AnimatedPressable>
        </View>
    );
};

// Switch avec les couleurs de l'application
export const ISENSwitch: React.FC<SwitchProps> = (props) => {
    return (
        <Switch
            color={Colors.primary}
            style={Platform.OS !== "ios" ? { transform: [{ scale: 1.2 }] } : {}}
            onValueChange={props.onValueChange}
            value={props.value}
        />
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
        backgroundColor: Colors.primary,
    },
    pressedButton: {
        backgroundColor: Colors.secondary,
    },
    buttonText: {
        fontSize: 22,
        fontWeight: "bold",
        letterSpacing: 0.25,
        color: "white",
        textAlign: "center",
    },
    buttonIssueText: {
        fontSize: 20,
        fontWeight: "bold",
        letterSpacing: 0.25,
        color: "white",
        textAlign: "center",
    },
});

const doubleSelectorStyles = StyleSheet.create({
    // Style du sélecteur double
    container: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 10,
        boxShadow: "0px 2px 5px 0px rgba(0,0,0,0.25)",
    },
    selectorItem1: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 2,
    },
    selectorItem2: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 2,
    },
});
