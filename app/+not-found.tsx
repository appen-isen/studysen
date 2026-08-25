import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useMemo } from "react";
import { Text } from "@/components/Texts";
import { ColorPalette } from "@/constants/Colors";
import useColors from "@/hooks/useColors";

export default function NotFoundScreen() {
    const colors = useColors();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <>
            <Stack.Screen options={{ title: "Erreur" }} />
            <View style={styles.container}>
                <Text style={styles.title}>Cette page n'existe pas !</Text>

                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>Retour</Text>
                </Link>
            </View>
        </>
    );
}

const createStyles = (colors: ColorPalette) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
            padding: 20
        },
        title: {
            fontSize: 20,
            fontWeight: "bold"
        },
        link: {
            marginTop: 15,
            paddingVertical: 15
        },
        linkText: {
            fontSize: 14,
            color: colors.primary
        }
    });
