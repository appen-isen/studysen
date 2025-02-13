import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { AnimatedPressable, Button } from "@/components/Buttons";
import { Input, Checkbox } from "@/components/Inputs";
import { Bold, Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
            >
                <Text style={styles.campusSelectText}>
                    Campus de <Bold>{settings.campus}</Bold>
                </Text>
                <MaterialIcons
                    style={styles.campusSelectText}
                    name="keyboard-arrow-down"
                    size={20}
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
            <View style={styles.headerBox}>
                <MaterialIcons name="login" style={styles.headerIcon} />
                <Text style={styles.headerTitle}>Connexion</Text>
                <Text style={styles.headerLabel}>Utilisez les identifiants de l'ENT</Text>
            </View>
            {/* Champs */}
            <View style={styles.fieldsBox}>
                <Input
                    placeholder="Nom d'utilisateur"
                    icon="account-circle"
                    onChangeText={(text) => setUsername(text)}
                    value={username}
                    autoComplete="username"
                ></Input>
                <Input
                    placeholder="Mot de passe"
                    icon="key"
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    autoComplete="password"
                    password
                ></Input>
                <Checkbox
                    status={rememberMe ? "checked" : "unchecked"}
                    onPress={() => setRememberMe(!rememberMe)}
                    color={Colors.primary}
                    text="Rester connecté"
                />
            </View>
            {/* Boutons du bas */}
            <View style={styles.actionBox}>
                <Button
                    title="Se connecter"
                    onPress={handleLogin}
                    style={styles.actionLogin}
                    isLoading={authenticating}
                ></Button>
                <Link href={"/login-help"} style={styles.actionHelp}>
                    <Text>J'ai besoin d'aide</Text>
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
    // 
    // Containers
    //
    container: {
        flex: 1,
        justifyContent: "space-around",
        backgroundColor: Colors.white,
    },
    containerView: {
        width: "100%",
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
    },
    //
    // Campus selection
    //
    campusSelect: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBlock: 10,
        paddingInline: 25,
        backgroundColor: Colors.primary,
        borderRadius: 999,
        gap: 5,
    },
    campusSelectText: {
        color: Colors.white,
    },
    dropdownBoxStyle: {
        width: 250,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    //
    // Header section
    //
    headerBox: {
        width: "100%",
    },
    headerTitle: {
        fontSize: 40,
    },
    headerIcon: {
        fontSize: 52,
        color: Colors.primary,
    },
    headerLabel: {
        color: Colors.darkGray,
        marginLeft: 3,
    },
    //
    // Fields section
    //
    fieldsBox: {
        alignItems: "flex-start",
        width: "100%",
        gap: 25,
    },
    //
    // Actions section
    //
    actionBox: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    actionLogin: {
        width: "100%",
    },
    actionHelp: {
        alignItems: "center",
        gap: 10,
        color: Colors.darkGray,
        fontWeight: 600,
        padding: 20,
    },
});
