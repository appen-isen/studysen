import { View, StyleSheet, ScrollView } from "react-native";
import { ReactNode } from "react";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { AnimatedPressable } from "./Buttons";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResponsivePadding } from "@/utils/responsive";

export function Page(props: {
    children?: ReactNode;
    style?: any;
    scrollable?: boolean;
}) {
    const contentStyle = [
        pageStyles.content,
        props.scrollable ? { flexGrow: 1 } : { flex: 1 },
        props.style
    ];
    return (
        <SafeAreaView
            style={pageStyles.container}
            // On exclut le bottom pour éviter le double padding avec la Bottom Tab Bar (SDK 54)
            edges={["top", "left", "right"]}
        >
            <ScrollView
                style={pageStyles.container}
                contentContainerStyle={contentStyle}
                scrollEnabled={props.scrollable}
                keyboardShouldPersistTaps="handled"
            >
                {props.children}
            </ScrollView>
        </SafeAreaView>
    );
}

type PageHeaderProps = {
    title: string;
    returnTo?: string;
    children?: ReactNode;
};

export function PageHeader({ title, returnTo, children }: PageHeaderProps) {
    const router = useRouter();
    return (
        <View style={headerStyles.container}>
            {/* Si on a un bouton de retour, on l'affiche à gauche du titre */}
            {returnTo !== undefined && (
                <AnimatedPressable
                    style={headerStyles.returnButton}
                    onPress={() => {
                        setTimeout(() => router.back(), 200); // Délai de 200ms pour l'animation
                    }}
                    scale={0.9}
                >
                    <MaterialIcons name="arrow-back" size={24} />
                    <Text style={headerStyles.returnText}>{returnTo}</Text>
                </AnimatedPressable>
            )}
            <Text
                // On ajuste le style en fonction de la position du titre
                style={[
                    headerStyles.title,
                    returnTo === undefined
                        ? headerStyles.rightTitle
                        : headerStyles.leftTitle
                ]}
            >
                {title}
            </Text>
            {/* On affiche le contenu */}
            {children}
        </View>
    );
}

const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    content: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingInline: getResponsivePadding(),
        backgroundColor: Colors.white,
        flexGrow: 1
    }
});

const headerStyles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20
    },
    title: {
        paddingBlock: 10,
        paddingInline: 25,
        fontSize: 18,
        fontWeight: 600,
        color: Colors.white,
        backgroundColor: Colors.primary,
        borderRadius: 15
    },
    rightTitle: {
        borderBottomRightRadius: 0
    },
    leftTitle: {
        borderBottomLeftRadius: 0
    },
    returnButton: {
        flexDirection: "row",
        backgroundColor: Colors.light,
        gap: 10,
        paddingVertical: 7,
        paddingHorizontal: 20,
        borderRadius: 30
    },
    returnText: {
        fontSize: 16,
        fontWeight: 600
    }
});
