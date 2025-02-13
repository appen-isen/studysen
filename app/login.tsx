import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
} from "react-native";
import { AnimatedPressable, Button } from "@/components/Buttons";
import { Input, Checkbox } from "@/components/Inputs";
import { Bold, Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Dropdown, ErrorModal } from "@/components/Modals";

import useSessionStore from "@/store/sessionStore";
import Session from "@/webAurion/api/Session";
import { getSecureStoreItem, setSecureStoreItem } from "@/store/secureStore";
import useSettingsStore, { CAMPUS } from "@/store/settingsStore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
    const router = useRouter();
    const { setSession } = useSessionStore();

    const { settings, setSettings } = useSettingsStore();

    //Connexion automatique
    const [autoLogin, setAutoLogin] = useState(false);
    useEffect(() => {
        const fetchStoredCredentials = async () => {
            //On récupère les identifiants stockés dans le secure store
            const storedUsername = await getSecureStoreItem("username");
            const storedPassword = await getSecureStoreItem("password");
            if (storedUsername && storedPassword) {
                setAutoLogin(true);
                //On connecte l'utilisateur automatiquement
                const session = new Session();
                try {
                    await session.login(storedUsername, storedPassword, 6000);
                    //On sauvegarde la session dans le store
                    setSession(session);
                    //On sauvegarde le nom d'utilisateur dans les paramètres
                    setSettings("username", session.getUsername());

                    //On redirige l'utilisateur vers la page principale
                    router.replace("/(tabs)");
                } catch (err) {
                    //Probablement un timeout, donc on considère que l'utilisateur est hors ligne
                    console.log("Offline mode enabled!");
                    console.error(err);
                    router.replace({
                        pathname: "/(tabs)",
                        params: { offlineMode: 1 },
                    });
                }
            }
        };
        fetchStoredCredentials();
    }, []);

    //Menu déroulant pour choisir le campus
    const [campusMenuVisible, setCampusMenuVisible] = useState(false);

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
                    //On sauvegarde la session lorsque l'utilisateur relance l'app
                    if (rememberMe) {
                        await setSecureStoreItem("username", username);
                        await setSecureStoreItem("password", password);
                    }
                    //On sauvegarde le nom d'utilisateur dans les paramètres
                    setSettings("username", session.getUsername());

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
                //Erreur de connexion
                setAuthenticating(false);
                setErrorMessage(
                    "Une erreur est survenue lors de la connexion: " + e.message
                );
                setErrorVisible(true);
            });
    };

    // Chargement de la connexion automatique
    if (autoLogin) {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    animating={true}
                    color={Colors.primary}
                    size={50}
                />
            </View>
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.containerView}
            >
                {/* Bouton pour choisir le campus */}
                <AnimatedPressable
                    style={styles.campusSelect}
                    onPress={() => setCampusMenuVisible(true)}
                    scale={0.95}
                >
                    <Text style={styles.campusSelectText}>
                        Campus de <Bold>{settings.campus}</Bold>
                    </Text>
                    <FontAwesome6
                        style={styles.campusSelectText}
                        name="chevron-down"
                        size={24}
                    />
                </AnimatedPressable>
                <Dropdown
                    visible={campusMenuVisible}
                    setVisible={setCampusMenuVisible}
                    options={[...CAMPUS]}
                    selectedItem={settings.campus}
                    setSelectedItem={(newCampus) =>
                        setSettings(
                            "campus",
                            newCampus as (typeof CAMPUS)[number]
                        )
                    }
                    modalBoxStyle={styles.dropdownBoxStyle}
                ></Dropdown>

                {/* Haut de la page */}
                <View style={styles.titleBox}>
                    <MaterialIcons name="login" style={styles.loginIcon} />
                    <Text style={styles.title}>Connexion</Text>
                    <Text>Utilisez les identifiants de l'ENT</Text>
                </View>
                {/* Champs */}
                <View style={styles.fieldsView}>
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
                        autoComplete="username"
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
                        autoComplete="password"
                        password
                    ></Input>
                    <Checkbox
                        status={rememberMe ? "checked" : "unchecked"}
                        onPress={() => {
                            setRememberMe(!rememberMe);
                        }}
                        color={Colors.primary}
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
        backgroundColor: "white",
    },
    containerView: {
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
    },
    campusSelect: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        width: "60%",
        maxWidth: 300,
        backgroundColor: Colors.primary,
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
        alignSelf: "center",
        //Si l'écran est grand, on centre le texte
        alignItems:
            Dimensions.get("window").width > 600 ? "center" : "flex-start",
        width: "100%",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 45,
    },
    loginIcon: {
        fontSize: 60,
        marginBottom: 10,
        color: Colors.primary,
    },
    //Les champs
    fieldsView: {
        justifyContent: "center",
        alignItems: "center",
        width: "80%",
        maxWidth: 600,
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
        maxWidth: 600,
    },
    helpLink: {
        fontWeight: 600,
        marginTop: 15,
        textDecorationLine: "underline",
    },
});
