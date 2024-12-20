import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Text } from "./Texts";
import { FontAwesome5 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
// Message de synchronisation
export function SyncMessage({ isVisible }: { isVisible: boolean }) {
    // Animation pour la rotation de l'icône
    const spinValue = useRef(new Animated.Value(0)).current;
    // Animation pour la hauteur
    const heightValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        // Démarrer l'animation de rotation en boucle
        const spinAnimation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        spinAnimation.start();
        return () => spinAnimation.stop(); // Nettoyage lors du démontage
    }, [spinValue]);
    useEffect(() => {
        // Animation d'apparition ou de rétractation en fonction de `isVisible`
        Animated.timing(heightValue, {
            toValue: isVisible ? 20 : 0, // Hauteur cible (50 pour affiché, 0 pour caché)
            duration: 300, // Durée de l'animation
            easing: Easing.ease,
            useNativeDriver: false, // `height` n'est pas pris en charge par useNativeDriver
        }).start();
    }, [isVisible, heightValue]);
    // Mapper l'animation à une rotation
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });
    return (
        <Animated.View style={[styles.syncView, { height: heightValue }]}>
            <Animated.View
                style={{
                    transform: [{ rotate: spin }],
                }}
            >
                <FontAwesome5 name="sync-alt" style={styles.syncIcon} />
            </Animated.View>
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
        backgroundColor: Colors.primaryColor,
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
