import { useState } from "react";
import { ButtonProps, Pressable, StyleSheet, Text } from "react-native";
import Colors from "@/constants/Colors";

export type StyledButtonType = {
    textStyle?: object;
    style?: object;
    JSX?: JSX.Element;
};

export function Button(props: ButtonProps & StyledButtonType): JSX.Element {
    const { onPress, title, style, textStyle, JSX } = props;
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
            {JSX && JSX}
            {!JSX && (
                <Text style={{ ...styles.buttonText, ...textStyle }}>
                    {title}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        margin: 15,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 9,
        paddingBottom: 9,
        borderRadius: 6,
        backgroundColor: Colors.primaryColor,
    },
    pressedButton: {
        backgroundColor: Colors.secondaryColor,
    },
    buttonText: {
        fontSize: 23,
        fontWeight: "bold",
        letterSpacing: 0.25,
        color: "white",
    },
});
