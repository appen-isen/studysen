import { View, StyleSheet } from "react-native";
import { Link, useRouter } from "expo-router";
import { AnimatedPressable } from "@/components/Buttons";
import { FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import { SafeAreaView } from "react-native-safe-area-context";

//Les crédits
export default function Credits() {
    const router = useRouter();
    return (
        <SafeAreaView style={styles.container}>
            {/* Bouton de retour */}
            <AnimatedPressable onPress={() => router.back()}>
                <FontAwesome6 name="arrow-left" style={styles.backIcon} />
            </AnimatedPressable>

            {/* Contenu */}
            <View style={styles.contentView}>
                <Bold style={styles.title}>Les contributions au projet</Bold>
                <Text style={styles.text}>
                    Cette application a été conçue par le club d'informatique
                    Appen'ISEN de Nantes.
                </Text>
                {/* Sections */}
                <View style={styles.section}>
                    <Bold style={styles.sectionTitle}>Design</Bold>
                    <Text style={styles.contributors}>
                        Dorian DESMARS / Titouan BRANGER
                    </Text>
                </View>
                <View style={styles.section}>
                    <Bold style={styles.sectionTitle}>Développement</Bold>
                    {/* Vous pouvez ajouter votre nom ici */}
                    <Text style={styles.contributors}>Dorian DESMARS / Félix MARQUET</Text>
                </View>
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
        width: "95%",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 30,
    },
    //Sections
    section: {
        width: "90%",
        maxWidth: 600,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        color: Colors.primaryColor,
    },
    contributors: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 10,
    },
});
