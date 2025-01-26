import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { AnimatedPressable, Button } from "@/components/Buttons";
import { FontAwesome6 } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Bold, Text } from "@/components/Texts";
import { SafeAreaView } from "react-native-safe-area-context";
import IssueModal from "@/components/modals/IssueModal";
import ContactModal from "@/components/modals/ContactModal";

export default function Contact() {
    const router = useRouter();
    const [modalIssueVisible, setIssueModalVisible] = useState(false);
    const [modalContactVisible, setContactModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <AnimatedPressable onPress={() => router.back()}>
                <FontAwesome6 name="arrow-left" style={styles.backIcon} />
            </AnimatedPressable>

            <View style={styles.contentView}>
                <Bold style={styles.title}>Nous contacter</Bold>
                <Text style={styles.text}>
                    Si vous souhaitez rapporter un bug, n'hésitez pas à signaler le problème.
                </Text>
                <Button title={"Signaler un bug"} onPress={() => setIssueModalVisible(true)} />
                <Text style={styles.text}>
                    Si vous souhaitez faire une suggestion ou nous contacter pour une autre raison n'hesiter pas via le bouton ci-dessous.
                </Text>
                <Button title={"Nous contacter"} onPress={() => setContactModalVisible(true)} />
            </View>

            <IssueModal visible={modalIssueVisible} onClose={() => setIssueModalVisible(false)} />
            <ContactModal visible={modalContactVisible} onClose={() => setContactModalVisible(false)} />
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