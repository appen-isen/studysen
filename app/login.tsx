import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Buttons";
import { Input, Checkbox } from "@/components/Inputs";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { Link } from "expo-router";

export default function LoginScreen() {
    const [rememberMe, setRememberMe] = useState(true);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Se connecter</Text>
            <Text style={styles.loginInfoText}>
                Connectez vous avec vos identifiants de l'ENT
            </Text>
            <Input placeholder="Nom d'utilisateur" icon="user"></Input>
            <Input placeholder="Mot de passe" icon="lock" password></Input>
            <Checkbox
                status={rememberMe ? "checked" : "unchecked"}
                onPress={() => {
                    setRememberMe(!rememberMe);
                }}
                color={Colors.primaryColor}
                text="Se souvenir de moi"
            />
            <Button title="Connexion"></Button>
            <Link href={"/login-help"} style={styles.helpLink}>
                J'ai besoin d'aide
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
    },
    title: {
        fontSize: 40,
        fontWeight: "bold",
        marginBottom: 20,
    },
    loginInfoText: {
        marginBottom: 30,
    },
    helpLink: {
        color: Colors.secondaryColor,
        fontWeight: 600,
        marginTop: 15,
    },
});
