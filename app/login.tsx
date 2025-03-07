import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { Button } from "@/components/Buttons";
import { Input, Checkbox } from "@/components/Inputs";
import { Bold, Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ErrorModal } from "@/components/Modals";

import useSessionStore from "@/stores/sessionStore";
import Session from "@/webAurion/api/Session";
import { getSecureStoreItem, setSecureStoreItem } from "@/stores/secureStore";
import useSettingsStore from "@/stores/settingsStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sheet } from "@/components/Sheet";

export default function LoginScreen() {
    const router = useRouter();
    const { setSession } = useSessionStore();
    const { settings, setSettings } = useSettingsStore();

    // Auto login state
    const [autoLogin, setAutoLogin] = useState(false);

    useEffect(() => {
        const attemptTokenLogin = async () => {
            const storedToken = await getSecureStoreItem("jwt_token");
            if (storedToken) {
                setAutoLogin(true);
                //On connecte l'utilisateur automatiquement
                const session = new Session();
                try {
                    await session.login("", "", storedToken);
                    setSession(session);
                    setSettings("username", session.getUsername());
                    router.replace("/(tabs)");
                } catch (err) {
                    console.log("Token login failed, removing stored token");
                    await getSecureStoreItem("jwt_token");
                    setAutoLogin(false);
                }
            }
        };
        attemptTokenLogin();
    }, []);

    //Checkbox pour se souvenir de l'utilisateur
    const [rememberMe, setRememberMe] = useState(true);
    const [authenticating, setAuthenticating] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //Message d'erreur
    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [helpVisible, setHelpVisible] = useState(false);

    //Gestion de la connexion
    const handleLogin = async () => {
        if (email === "" || password === "") {
            setErrorMessage("Veuillez remplir tous les champs");
            setErrorVisible(true);
            return;
        }
        setAuthenticating(true);

        // Requête de connexion
        const session = new Session();

        try {
            await session.login(email, password);
            setSession(session);

            if (rememberMe) {
                await setSecureStoreItem("jwt_token", session.getToken());
            }

            setSettings("username", session.getUsername());
            setSettings("userISENId", session.getIsenId());
            router.replace("/(tabs)");
        } catch (error) {
            setErrorMessage(
                "Une erreur est survenue lors de la connexion: " +
                    (error instanceof Error
                        ? error.message
                        : "Erreur inconnue"),
            );
            setErrorVisible(true);
        } finally {
            setAuthenticating(false);
        }
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
                {/* Haut de la page */}
                <View style={styles.headerBox}>
                    <MaterialIcons name="login" style={styles.headerIcon} />
                    <Text style={styles.headerTitle}>Connexion</Text>
                    <Text style={styles.headerLabel}>
                        Utilisez les identifiants ISEN Orbit
                    </Text>
                </View>
                {/* Champs */}
                <View style={styles.fieldsBox}>
                    <Input
                        placeholder="Email"
                        icon="account-circle"
                        onChangeText={setEmail}
                        value={email}
                        autoComplete="email"
                        keyboardType="email-address"
                    />
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
                    <Pressable
                        onPress={() => setHelpVisible(true)}
                        style={styles.actionHelp}
                    >
                        <Text>J'ai besoin d'aide</Text>
                    </Pressable>
                    <View style={styles.linksContainer}>
                        <Link href={"/register"} style={styles.registerLink}>
                            Pas encore de compte ? S'inscrire
                        </Link>
                    </View>
                </View>

                {/* Modal d'aide */}
                <Sheet
                    visible={helpVisible}
                    setVisible={setHelpVisible}
                    sheetStyle={helpStyles.container}
                >
                    <Text style={helpStyles.subtitle}>
                        Comment se connecter ?
                    </Text>
                    <Text style={helpStyles.paragraph}>
                        Utilisez votre{" "}
                        <Text style={helpStyles.important}>
                            identifiant d'ENT
                        </Text>{" "}
                        de l'<Bold>ISEN</Bold> qui vous permet l'accès à{" "}
                        <Bold>WebAurion</Bold> et <Bold>Moodle</Bold>.
                    </Text>
                    <Text style={helpStyles.paragraph}>
                        L'identifiant est de la forme{" "}
                        <Text style={helpStyles.important}>p_nom</Text>. La
                        première lettre de votre <Bold>prénom</Bold> suivie de
                        votre <Bold>nom de famille</Bold>.
                    </Text>
                    <Text style={helpStyles.subtitle}>
                        Encore des problèmes ?
                    </Text>
                    <Text style={helpStyles.paragraph}>
                        Vous n'arrivez toujours pas à vous connecter ? Essayer
                        de <Bold>changer votre mot de passe</Bold>.
                    </Text>
                    <Link
                        href={
                            "https://web.isen-ouest.fr/password/index.php?action=sendtoken"
                        }
                    >
                        <View style={helpStyles.link}>
                            <MaterialIcons name="open-in-new" size={20} />
                            <Text>Mot de passe oublié</Text>
                        </View>
                    </Link>
                </Sheet>

                {/* Modal d'erreur */}
                <ErrorModal
                    visible={errorVisible}
                    message={errorMessage}
                    setVisible={setErrorVisible}
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
        marginTop: 15,
        textDecorationLine: "underline",
    },
    linksContainer: {
        marginTop: 15,
        gap: 10,
        alignItems: "center",
    },
    helpLink: {
        fontWeight: "600",
        textDecorationLine: "underline",
    },
    registerLink: {
        color: Colors.primary,
        fontWeight: "600",
        textDecorationLine: "underline",
        padding: 20,
    },
});

const helpStyles = StyleSheet.create({
    //
    // Help styles
    //
    container: {
        alignItems: "flex-start",
        padding: 20,
        gap: 20,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: "bold",
        backgroundColor: Colors.primary,
        color: Colors.white,
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5,
    },
    paragraph: {
        color: Colors.darkGray,
    },
    important: {
        color: Colors.primary,
        fontWeight: "bold",
    },
    link: {
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        backgroundColor: Colors.light,
        paddingBlock: 5,
        paddingInline: 10,
        borderRadius: 5,
    },
});
