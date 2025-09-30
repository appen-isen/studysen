import { useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    StyleSheet,
    View
} from "react-native";
import { Text } from "./Texts";
import Colors from "@/constants/Colors";
import { useSyncStore } from "@/stores/syncStore";
import { MaterialIcons } from "@expo/vector-icons";
// Badge de synchronisation
export function SyncBadge() {
    const { syncStatus, lastSyncDate } = useSyncStore();
    const isVisible = syncStatus === "syncing" || syncStatus === "error";
    // Animation pour la hauteur
    const heightValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        // Animation d'apparition ou de rétractation en fonction de `isVisible`
        Animated.timing(heightValue, {
            toValue: isVisible ? 30 : 0, // Hauteur cible (30 pour affiché, 0 pour caché)
            duration: 300, // Durée de l'animation
            easing: Easing.ease,
            useNativeDriver: false // `height` n'est pas pris en charge par useNativeDriver
        }).start();
    }, [isVisible, heightValue]);
    return (
        <Animated.View
            style={[
                styles.syncView,
                { height: heightValue, borderBottomWidth: isVisible ? 1 : 0 }
            ]}
        >
            {syncStatus === "syncing" && (
                // En cours de synchronisation
                <>
                    <ActivityIndicator size={15} color={Colors.black} />
                    <Text style={styles.syncText}>
                        Synchronisation depuis Internet
                    </Text>
                </>
            )}
            {syncStatus === "error" && (
                // Erreur de synchronisation
                <>
                    <MaterialIcons
                        name="warning-amber"
                        color={Colors.primary}
                        size={15}
                    />
                    <Text style={styles.syncText}>
                        Désynchronisé
                        {lastSyncDate
                            ? ` depuis ${lastSyncDate.toLocaleString()}`
                            : ""}
                    </Text>
                </>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    syncView: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.light,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0px 4px 40px rgba(0,0,0,0.25)",
        borderBottomColor: Colors.lightGray,
        overflow: "hidden", // Cache le contenu quand la hauteur diminue
        zIndex: 1000
    },
    syncText: {
        marginLeft: 8,
        color: Colors.black,
        fontSize: 12,
        fontWeight: 600
    }
});

// Composant de chargement avec des points animés
export function DotLoader() {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        //Animations pour chaque point
        const animateDot = (dot: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 500,
                        delay,
                        useNativeDriver: true
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true
                    })
                ])
            );
        };

        const animations = [
            animateDot(dot1, 0),
            animateDot(dot2, 200),
            animateDot(dot3, 400)
        ];

        animations.forEach((anim) => anim.start());

        return () => animations.forEach((anim) => anim.stop());
    }, [dot1, dot2, dot3]);

    // Style pour l'animation des points
    const getDotStyle = (
        dot: Animated.Value,
        baseColor: string,
        baseOpacity: number
    ) => ({
        opacity: dot.interpolate({
            inputRange: [0, 1],
            outputRange: [baseOpacity, 1]
        }),
        transform: [
            {
                scale: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.4]
                })
            }
        ],
        backgroundColor: baseColor
    });

    return (
        <View style={dotLoaderStyles.container}>
            {/* Les trois points */}
            <Animated.View
                style={[
                    dotLoaderStyles.dot,
                    getDotStyle(dot1, Colors.primary, 1)
                ]}
            />
            <Animated.View
                style={[
                    dotLoaderStyles.dot,
                    getDotStyle(dot2, Colors.primary, 0.4)
                ]}
            />
            <Animated.View
                style={[
                    dotLoaderStyles.dot,
                    getDotStyle(dot3, Colors.primary, 0.4)
                ]}
            />
        </View>
    );
}

const dotLoaderStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginHorizontal: 6
    }
});
