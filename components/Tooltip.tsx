import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "./Texts";

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    style?: object;
}

export function Tooltip({ text, children, style }: TooltipProps) {
    const [visible, setVisible] = React.useState(false);

    return (
        <View>
            <TouchableOpacity
                onPress={() => setVisible(!visible)}
                style={style}
            >
                {children}
            </TouchableOpacity>
            {visible && (
                <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>{text}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    tooltip: {
        position: "absolute",
        bottom: "100%",
        right: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 10,
        borderRadius: 5,
        width: 200,
    },
    tooltipText: {
        color: "white",
        fontSize: 12,
    },
});
