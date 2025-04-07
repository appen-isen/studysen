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
    Platform,
    PressableProps,
    View,
    LayoutChangeEvent
} from "react-native";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
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
    return (
        <AnimatedPressable
            style={toggleStyles.container}
            onPress={() => props.setState(props.state)}
            scale={0.95}
        >
            <Text style={toggleStyles.label}>
                {props.stateList[props.state].label}
            </Text>
            <MaterialIcons name={props.stateList[props.state].icon} size={24} />
        </AnimatedPressable>
    );
}

//Sélecteur dynamique à options multiples
type MultiToggleProps = {
    options: string[];
    defaultIndex?: number;
    onToggle?: (index: number) => void;
};

export const MultiToggle = ({
    options,
    defaultIndex = 0,
    onToggle
}: MultiToggleProps) => {
    const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
    const translateX = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = useState(0);

    const sliderMargin = 3; // Espace entre le slider et les bords du conteneur

    // Fonction pour gérer le changement de mise en page
    const handleLayout = (e: LayoutChangeEvent) => {
        const width = e.nativeEvent.layout.width;
        setContainerWidth(width);

        const itemWidth = width / options.length;
        const initialTranslate = itemWidth * selectedIndex + sliderMargin;
        translateX.setValue(initialTranslate);
    };

    // Fonction pour gérer le changement d'index et animer le slider
    const handlePress = (index: number) => {
        // Mise à jour de l'index sélectionné
        if (index === selectedIndex) return;
        setSelectedIndex(index);

        // Calculer la nouvelle position du slider
        const itemWidth = containerWidth / options.length;
        Animated.spring(translateX, {
            toValue: itemWidth * index + sliderMargin,
            useNativeDriver: false
        }).start();

        onToggle?.(index);
    };

    // Calculer la largeur de chaque élément et la largeur du slider
    const itemWidth = containerWidth / options.length;
    const sliderWidth = itemWidth - sliderMargin * 2;

    return (
        <View onLayout={handleLayout} style={mToggleStyles.container}>
            {/* Slider animé qui se déplace entre les options */}
            <Animated.View
                style={[
                    mToggleStyles.slider,
                    {
                        width: sliderWidth,
                        transform: [{ translateX }]
                    }
                ]}
            />
            {/* Options de sélection */}
            <View style={mToggleStyles.labels}>
                {options.map((label, index) => (
                    <Pressable key={index} onPress={() => handlePress(index)}>
                        <View style={mToggleStyles.option}>
                            <Text style={mToggleStyles.text}>{label}</Text>
                        </View>
                    </Pressable>
                ))}
            </View>
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
        justifyContent: "center",
        alignItems: "center",
        paddingInline: 20,
        paddingBlock: 10,
        borderRadius: 10,
        backgroundColor: Colors.primary
    },
    pressedButton: {
        backgroundColor: Colors.secondary
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 0.25,
        color: Colors.white,
        textAlign: "center"
    },
    buttonIssueText: {
        fontSize: 20,
        fontWeight: "bold",
        letterSpacing: 0.25,
        color: Colors.white,
        textAlign: "center"
    }
});

const toggleStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: Colors.light,
        borderRadius: 30
    },
    label: {
        fontSize: 14,
        fontWeight: 600
    }
});

// Styles pour le MultiToggle
const mToggleStyles = StyleSheet.create({
    container: {
        height: 40,
        backgroundColor: Colors.light,
        justifyContent: "center",
        borderRadius: 30,
        padding: 3,
        overflow: "hidden",
        paddingHorizontal: 3
    },
    slider: {
        position: "absolute",
        height: "100%",
        backgroundColor: Colors.white,
        borderRadius: 20,
        elevation: 2
    },
    labels: {
        flexDirection: "row",
        flex: 1
    },
    option: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30
    },
    text: {
        color: Colors.black,
        fontWeight: "bold"
    }
});
