import { ReactNode } from "react";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { AnimatedPressable } from "./Buttons";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { getResponsivePadding } from "@/utils/responsive";
import { RefreshControl, ScrollView, View, StyleSheet } from "react-native";

export function Page(props: {
    children?: ReactNode;
    style?: any;
    scrollable?: boolean;
    keyboardDismissMode?: "none" | "on-drag" | "interactive";
    refreshControl?: React.ReactElement<
        React.ComponentProps<typeof RefreshControl>
    >;
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
                keyboardDismissMode={props.keyboardDismissMode}
                refreshControl={props.refreshControl}
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
            <Text style={headerStyles.title}>{title}</Text>
            {/* On affiche le contenu */}
            {children}
        </View>
    );
}

const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    content: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingInline: getResponsivePadding(),
        backgroundColor: Colors.background,
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
        paddingBlock: 8,
        fontSize: 24,
        fontWeight: 700,
        color: Colors.black
    },
    returnButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
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
