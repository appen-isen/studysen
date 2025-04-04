import { View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";

export function Page(props: { children?: ReactNode; style?: any }) {
    return (
        <SafeAreaView style={pageStyles.container}>
            <View style={[pageStyles.content, props.style]}>
                {props.children}
            </View>
        </SafeAreaView>
    );
}

export function PageHeader(props: { title: string; children?: ReactNode }) {
    return (
        <View style={headerStyles.container}>
            <Text style={headerStyles.title}>{props.title}</Text>
            {props.children}
        </View>
    );
}

const pageStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white
    },
    content: {
        flex: 1,
        paddingBlock: 10,
        paddingInline: 20,
        backgroundColor: Colors.white
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
        borderRadius: 15,
        borderBottomRightRadius: 0
    }
});
