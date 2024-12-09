import { Pressable, StyleSheet, View } from "react-native";
import { Button } from "@/components/Buttons";
import { Input, Checkbox } from "@/components/Inputs";
import { Bold, Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Dropdown, ErrorModal } from "@/components/Modals";

import useSessionStore from "@/store/sessionStore";
import Session from "@/webAurion/api/Session";

export default function LoginScreen() {
    const router = useRouter();
    //Menu déroulant pour choisir le campus
    const [campusMenuVisible, setCampusMenuVisible] = useState(false);
    const campusOptions = ["Nantes", "Rennes", "Brest", "Caen"];
    const [selectedCampus, setSelectedCampus] = useState(campusOptions[0]);

    const { setSession } = useSessionStore();

    //Checkbox pour se souvenir de l'utilisateur
    const [rememberMe, setRememberMe] = useState(true);
    const [authenticating, setAuthenticating] = useState(false);

    //Utilisateur et mot de passe
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    //Message d'erreur
    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    //Gestion de la connexion
    const handleLogin = async () => {
        if (username === "" || password === "") {
            setErrorMessage("Veuillez remplir tous les champs");
            setErrorVisible(true);
            return;
        }
        setAuthenticating(true);

        // Requête de connexion
        const session = new Session();

        session
            .login(username, password)
            .then(async (res) => {
                if (res) {
                    setSession(session);
                    router.replace("/(tabs)");
                } else {
                    setErrorMessage(
                        "Nom d'utilisateur ou mot de passe incorrect"
                    );
                    setErrorVisible(true);
                }
                setAuthenticating(false);
            })
            .catch((e) => {
                setAuthenticating(false);
                setErrorMessage(
                    "Une erreur est survenue lors de la connexion: " + e.message
                );
                setErrorVisible(true);
            });
    };
    return (
        <View style={styles.container}>
            {/* Bouton pour choisir le campus */}
            <Pressable
                style={styles.campusSelect}
                onPress={() => setCampusMenuVisible(true)}
            >
                <Text style={styles.campusSelectText}>
                    Campus de <Bold>{selectedCampus}</Bold>
                </Text>
                <FontAwesome6
                    style={styles.campusSelectText}
                    name="chevron-down"
                    size={24}
                />
            </Pressable>
            <Dropdown
                visible={campusMenuVisible}
                setVisible={setCampusMenuVisible}
                options={campusOptions}
                selectedItem={selectedCampus}
                setSelectedItem={setSelectedCampus}
                modalBoxStyle={styles.dropdownBoxStyle}
            ></Dropdown>

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
                    onChangeText={(text) => setUsername(text)}
                    value={username}
                ></Input>
                <Input
                    placeholder="Mot de passe"
                    icon={
                        <MaterialCommunityIcons
                            name="key-outline"
                            style={styles.inputIcon}
                        />
                    }
                    onChangeText={(text) => setPassword(text)}
                    value={password}
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
                    isLoading={authenticating}
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
        alignItems: "center",
        padding: 10,
        width: 220,
        backgroundColor: Colors.primaryColor,
        borderRadius: 50,
        marginTop: 10,
    },
    campusSelectText: {
        color: "white",
        marginLeft: 5,
        marginRight: 5,
    },
    dropdownBoxStyle: {
        width: 250,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
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
