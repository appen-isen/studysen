import { useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    StyleSheet,
    View,
} from "react-native";
import { Text } from "./Texts";
import { FontAwesome5 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
// Message de synchronisation
export function SyncMessage({ isVisible }: { isVisible: boolean }) {
    // Animation pour la hauteur
    const heightValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        // Animation d'apparition ou de rétractation en fonction de `isVisible`
        Animated.timing(heightValue, {
            toValue: isVisible ? 20 : 0, // Hauteur cible (50 pour affiché, 0 pour caché)
            duration: 300, // Durée de l'animation
            easing: Easing.ease,
            useNativeDriver: false, // `height` n'est pas pris en charge par useNativeDriver
        }).start();
    }, [isVisible, heightValue]);
    return (
        <Animated.View style={[styles.syncView, { height: heightValue }]}>
            <ActivityIndicator color={"white"} size={15}></ActivityIndicator>
            <Text style={styles.syncText}>Synchronisation</Text>
        </Animated.View>
    );
}
const styles = StyleSheet.create({
    syncView: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden", // Cache le contenu quand la hauteur diminue
        zIndex: 1000,
    },
    syncText: {
        marginLeft: 8,
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
    },
    syncIcon: {
        fontSize: 12,
        color: "white",
    },
});
