import { View, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/Buttons";
import { FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import { SafeAreaView } from "react-native-safe-area-context";

//Nous contacter
export default function Contact() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container}>
            <AnimatedPressable onPress={() => router.back()}>
                <FontAwesome6 name="arrow-left" style={styles.backIcon} />
            </AnimatedPressable>

            <View style={styles.contentView}>
                <Bold style={styles.title}>Nous contacter</Bold>
                <Text style={styles.text}>
                    Si vous avez une suggestion ou si vous souhaitez rapporter
                    un bug, n'hésitez pas à demander à un membre du club
                    Appen'ISEN de Nantes.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: "white",
    },
    backIcon: {
        fontSize: 40,
        margin: 20,
        color: Colors.primaryColor,
    },
    //Contenu
    contentView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        color: Colors.primaryColor,
        fontSize: 25,
        textAlign: "center",
        marginBottom: 20,
    },
    text: {
        width: "90%",
        alignSelf: "center",
        textAlign: "center",
        fontSize: 18,
    },
});
