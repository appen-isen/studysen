import { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
    ButtonProps,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Animated,
    GestureResponderEvent,
    StyleProp,
    ViewStyle,
    Platform,
    PressableProps,
    View,
    LayoutChangeEvent
} from "react-native";
import { Text } from "@/components/Texts";
import { ColorPalette } from "@/constants/Colors";
import useColors from "@/hooks/useColors";
import { Switch, SwitchProps } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
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
    bgColor
}) => {
    const [pressed, setPressed] = useState(false);
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <Pressable
            style={[
                pressed
                    ? { ...styles.button, ...styles.pressedButton, ...style }
                    : { ...styles.button, ...style },
                bgColor && { backgroundColor: bgColor }
            ]}
            onPress={onPress}
            onPressOut={() => setPressed(false)}
            onPressIn={() => setPressed(true)}
        >
            {/* Contenu JSX ou texte */}
            {JSX && JSX}
            {!JSX && isLoading && (
                <ActivityIndicator animating={true} color="white" size={25} />
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

interface AnimatedPressableProps extends PressableProps {
    onPress?: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
    scale?: number;
}

const AnimatedPressableComp = Animated.createAnimatedComponent(Pressable);

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
    onPress,
    style,
    children,
    scale = 0.8,
    ...rest // Capture any additional Pressable props
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: scale,
            useNativeDriver: true
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true
        }).start();
    };

    return (
        <AnimatedPressableComp
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, { transform: [{ scale: scaleAnim }] }]}
            {...rest} // Spread additional Pressable props here
        >
            {children}
        </AnimatedPressableComp>
    );
};
interface ToggleProps {
    state: number;
    stateList: { label: string; icon: keyof typeof MaterialIcons.glyphMap }[];
    setState: (currentState: number) => void;
}

export function Toggle(props: ToggleProps) {
    const colors = useColors();
    const toggleStyles = useMemo(() => createToggleStyles(colors), [colors]);
    return (
        <AnimatedPressable
            style={toggleStyles.container}
            onPress={() => props.setState(props.state)}
            scale={0.95}
        >
            <Text style={toggleStyles.label}>
                {props.stateList[props.state].label}
            </Text>
            <MaterialIcons
                name={props.stateList[props.state].icon}
                size={24}
                color={colors.primary}
            />
        </AnimatedPressable>
    );
}

//Sélecteur dynamique à options multiples
type MultiToggleProps = {
    options: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
};

export const MultiToggle = ({
    options,
    selectedIndex,
    onSelect
}: MultiToggleProps) => {
    const colors = useColors();
    const mToggleStyles = useMemo(() => createMToggleStyles(colors), [colors]);
    const [dimensions, setDimensions] = useState<
        { width: number; left: number }[]
    >([]);
    const animatedLeft = useRef(new Animated.Value(0)).current;
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (dimensions.length === options.length) {
            const { width, left } = dimensions[selectedIndex];
            // Animation de la largeur et de la position du slider
            Animated.parallel([
                Animated.spring(animatedLeft, {
                    toValue: left,
                    useNativeDriver: false
                }),
                Animated.spring(animatedWidth, {
                    toValue: width,
                    useNativeDriver: false
                })
            ]).start();
        }
    }, [selectedIndex, dimensions]);

    // Dimension de chaque option
    const handleOptionLayout = (index: number, event: LayoutChangeEvent) => {
        const { width, x } = event.nativeEvent.layout;
        setDimensions((prev) => {
            const newDims = [...prev];
            newDims[index] = { width, left: x };
            return newDims;
        });
    };

    if (!options.length) return null;

    // Le slider n'est visible qu'une fois les options mesurées
    const sliderReady = dimensions.length === options.length;

    return (
        <View style={mToggleStyles.container}>
            {/* Slider qui se déplace entre les options */}
            <Animated.View
                style={[
                    mToggleStyles.slider,
                    {
                        width: animatedWidth,
                        left: animatedLeft
                    }
                ]}
            />
            {/* Options du toggle */}
            {options.map((option, index) => (
                <Pressable
                    key={index}
                    onPress={() => onSelect(index)}
                    onLayout={(e) => handleOptionLayout(index, e)}
                    style={{ paddingHorizontal: 16 }}
                >
                    <Text
                        style={[
                            mToggleStyles.optionText,
                            sliderReady &&
                                index === selectedIndex &&
                                mToggleStyles.optionTextSelected
                        ]}
                    >
                        {option}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
};

// Switch avec les couleurs de l'application
export const ISENSwitch: React.FC<SwitchProps> = (props) => {
    const colors = useColors();
    return (
        <Switch
            color={colors.primary}
            style={Platform.OS !== "ios" ? { transform: [{ scale: 1.2 }] } : {}}
            onValueChange={props.onValueChange}
            value={props.value}
        />
    );
};

const createStyles = (colors: ColorPalette) =>
    StyleSheet.create({
        button: {
            justifyContent: "center",
            alignItems: "center",
            paddingInline: 20,
            paddingBlock: 10,
            borderRadius: 10,
            backgroundColor: colors.primary
        },
        pressedButton: {
            backgroundColor: colors.secondary
        },
        buttonText: {
            fontSize: 18,
            fontWeight: "bold",
            letterSpacing: 0.25,
            color: colors.white,
            textAlign: "center"
        },
        buttonIssueText: {
            fontSize: 20,
            fontWeight: "bold",
            letterSpacing: 0.25,
            color: colors.white,
            textAlign: "center"
        }
    });

const createToggleStyles = (colors: ColorPalette) =>
    StyleSheet.create({
        container: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 15,
            paddingVertical: 8,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 30
        },
        label: {
            fontSize: 14,
            fontWeight: 600
        }
    });

// Styles pour le MultiToggle
const createMToggleStyles = (colors: ColorPalette) =>
    StyleSheet.create({
        container: {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 30,
            position: "relative",
            alignSelf: "center",
            paddingHorizontal: 5,
            flexDirection: "row"
        },
        slider: {
            position: "absolute",
            backgroundColor: colors.contrast,
            borderRadius: 30,
            height: "80%",
            top: "10%"
        },
        optionText: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.black,
            paddingVertical: 12
        },
        optionTextSelected: {
            color: colors.white
        }
    });
