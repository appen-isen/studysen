import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { Button } from "@/components/Buttons";
import { Input, Checkbox } from "@/components/Inputs";
import { Bold, Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { Link } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ErrorModal } from "@/components/Modals";

export default function LoginScreen() {
    //Checkbox pour se souvenir de l'utilisateur
    const [rememberMe, setRememberMe] = useState(true);
    //Message d'erreur
    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    //Fonction pour se connecter
    const handleLogin = () => {
        setErrorMessage(
            "Une erreur s'est produite lors de la connexion, merci de réessayer plus tard."
        );
        setErrorVisible(true);
    };
    return (
        <View style={styles.container}>
            {/* Bouton pour choisir le campus */}
            <View style={styles.campusSelect}>
                <Text style={styles.campusSelectText}>
                    Campus de <Bold>Nantes</Bold>
                </Text>
                <FontAwesome6
                    style={styles.campusSelectText}
                    name="chevron-down"
                    size={24}
                />
            </View>
            {/* Haut de la page */}
            <View style={styles.titleBox}>
                <MaterialIcons name="login" style={styles.loginIcon} />
                <Text style={styles.title}>Connexion</Text>
                <Text>Utilisez les identifiants de l'ENT</Text>
            </View>
            {/* Champs */}
            <View>
                <Input
                    placeholder="Nom d'utilisateur"
                    icon={
                        <FontAwesome6
                            style={styles.inputIcon}
                            name="user-circle"
                        />
                    }
                ></Input>
                <Input
                    placeholder="Mot de passe"
                    icon={
                        <MaterialCommunityIcons
                            name="key-outline"
                            style={styles.inputIcon}
                        />
                    }
                    password
                ></Input>
                <Checkbox
                    status={rememberMe ? "checked" : "unchecked"}
                    onPress={() => {
                        setRememberMe(!rememberMe);
                    }}
                    color={Colors.primaryColor}
                    text="Se souvenir de moi"
                />
            </View>
            {/* Boutons du bas */}
            <View style={styles.bottomContainer}>
                <Button
                    title="Se connecter"
                    onPress={handleLogin}
                    style={styles.loginBtn}
                ></Button>
                <Link href={"/login-help"} style={styles.helpLink}>
                    J'ai besoin d'aide
                </Link>
            </View>

            {/* Modal d'erreur */}
            <ErrorModal
                visible={errorVisible}
                message={errorMessage}
                setVisible={(visible) => setErrorVisible(visible)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "white",
    },
    campusSelect: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
        backgroundColor: Colors.primaryColor,
        borderRadius: 50,
        marginTop: 10,
    },
    campusSelectText: {
        color: "white",
        marginLeft: 5,
        marginRight: 5,
    },
    titleBox: {
        alignSelf: "flex-start",
        marginLeft: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 45,
    },
    loginIcon: {
        fontSize: 60,
        marginBottom: 10,
        color: Colors.primaryColor,
    },
    inputIcon: {
        marginLeft: 5,
        fontSize: 30,
    },
    bottomContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    loginBtn: {
        width: "80%",
    },
    helpLink: {
        fontWeight: 600,
        marginTop: 15,
        textDecorationLine: "underline",
    },
});
