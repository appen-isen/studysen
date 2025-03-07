import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    View,
    TouchableOpacity,
} from "react-native";
import { Button } from "@/components/Buttons";
import { Input } from "@/components/Inputs";
import { Text } from "@/components/Texts";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { Link, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Dropdown, ErrorModal } from "@/components/Modals";
import { SafeAreaView } from "react-native-safe-area-context";
import Session from "@/webAurion/api/Session";
import useSessionStore from "@/stores/sessionStore";
import {
    CAMPUS,
    Campus,
    className,
    classNameValues,
    year,
    yearValues,
} from "@/stores/settingsStore";
import { Tooltip } from "@/components/Tooltip";

export default function RegisterScreen() {
    const router = useRouter();
    const { setSession } = useSessionStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isenId, setIsenId] = useState("");
    const [registering, setRegistering] = useState(false);

    // Promo selection
    const [classMenuVisible, setClassMenuVisible] = useState(false);
    const [selectedClass, setSelectedClass] =
        // @ts-ignore
        useState<(typeof className)[number]>("CIR");
    const [yearMenuVisible, setYearMenuVisible] = useState(false);
    const [selectedYear, setSelectedYear] =
        // @ts-ignore
        useState<(typeof year)[number]>("1");

    // Campus selection
    const [campusMenuVisible, setCampusMenuVisible] = useState(false);
    const [selectedCampus, setSelectedCampus] =
        // @ts-ignore
        useState<(typeof Campus)[number]>("Nantes");

    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async () => {
        if (!email || !password || !username || !isenId) {
            setErrorMessage("Veuillez remplir tous les champs");
            setErrorVisible(true);
            return;
        }

        if (!email.includes("@isen-ouest.yncrea.fr")) {
            setErrorMessage("Veuillez utiliser votre adresse email ISEN");
            setErrorVisible(true);
            return;
        }

        setRegistering(true);
        const session = new Session();

        try {
            const promo = `${selectedClass}${selectedYear}`;
            await session.register(
                email,
                password,
                username,
                promo,
                selectedCampus,
                isenId,
            );
            setSession(session);
            router.replace("/(tabs)");
        } catch (error) {
            console.log(error);
            setErrorMessage(
                "Une erreur est survenue lors de l'inscription: " +
                    (error instanceof Error
                        ? error.message
                        : "Erreur inconnue"),
            );
            setErrorVisible(true);
        } finally {
            setRegistering(false);
        }
    };

    // @ts-ignore
    // @ts-ignore
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.containerView}
            >
                <View style={styles.titleBox}>
                    <MaterialIcons
                        name="person-add"
                        style={styles.registerIcon}
                    />
                    <Text style={styles.title}>Inscription</Text>
                    <Text>Créez votre compte ISEN Orbit</Text>
                </View>

                <View style={styles.fieldsView}>
                    <Input
                        placeholder="Email ISEN"
                        icon="account-circle"
                        onChangeText={setEmail}
                        value={email}
                        autoComplete="email"
                        keyboardType="email-address"
                    />
                    <Input
                        placeholder="Mot de passe"
                        icon="key"
                        onChangeText={setPassword}
                        value={password}
                        autoComplete="password"
                        password
                    />
                    <Input
                        placeholder="Prénom Nom"
                        icon="account-circle"
                        onChangeText={setUsername}
                        value={username}
                        autoComplete="name"
                    />

                    <View style={styles.promoContainer}>
                        <TouchableOpacity
                            style={styles.promoSelect}
                            onPress={() => setClassMenuVisible(true)}
                        >
                            <Text>{selectedClass}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.promoSelect}
                            onPress={() => setYearMenuVisible(true)}
                        >
                            <Text>{selectedYear}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.promoSelect}
                        onPress={() => setCampusMenuVisible(true)}
                    >
                        <Text>{selectedCampus}</Text>
                    </TouchableOpacity>

                    <View style={styles.isenIdContainer}>
                        <Input
                            placeholder="ID ISEN"
                            icon="badge"
                            onChangeText={setIsenId}
                            value={isenId}
                            keyboardType="numeric"
                            style={{ flex: 1 }}
                        />
                        <Tooltip
                            text="Trouvable sur votre passeport informatique dans WebAurion"
                            style={styles.tooltip}
                        >
                            <MaterialIcons
                                name="info"
                                size={24}
                                color={Colors.primary}
                            />
                        </Tooltip>
                    </View>
                </View>

                <Dropdown
                    visible={classMenuVisible}
                    setVisible={setClassMenuVisible}
                    // @ts-ignore
                    options={classNameValues}
                    selectedItem={selectedClass}
                    setSelectedItem={(newClass) =>
                        setSelectedClass(newClass as className)
                    }
                />

                <Dropdown
                    visible={yearMenuVisible}
                    setVisible={setYearMenuVisible}
                    // @ts-ignore
                    options={yearValues}
                    selectedItem={selectedYear}
                    setSelectedItem={(newYear) =>
                        setSelectedYear(newYear as year)
                    }
                />

                <Dropdown
                    visible={campusMenuVisible}
                    setVisible={setCampusMenuVisible}
                    // @ts-ignore
                    options={CAMPUS}
                    selectedItem={selectedCampus}
                    setSelectedItem={(newCampus) =>
                        setSelectedCampus(newCampus as Campus)
                    }
                />

                <View style={styles.bottomContainer}>
                    <Button
                        title="S'inscrire"
                        onPress={handleRegister}
                        style={styles.registerBtn}
                        isLoading={registering}
                    />
                    <Link href="/login" style={styles.loginLink}>
                        Déjà un compte ? Se connecter
                    </Link>
                </View>

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
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    containerView: {
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        width: "100%",
        padding: 20,
    },
    titleBox: {
        alignSelf: "center",
        alignItems: "center",
        width: "100%",
    },
    title: {
        fontSize: 45,
    },
    registerIcon: {
        fontSize: 60,
        marginBottom: 10,
        color: Colors.primary,
    },
    fieldsView: {
        width: "100%",
        maxWidth: 600,
        gap: 15,
    },
    inputIcon: {
        marginLeft: 5,
        fontSize: 30,
    },
    promoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    promoSelect: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: Colors.lightGray,
        alignItems: "center",
    },
    isenIdContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    tooltip: {
        padding: 5,
    },
    bottomContainer: {
        width: "100%",
        alignItems: "center",
        gap: 15,
    },
    registerBtn: {
        width: "100%",
        maxWidth: 600,
    },
    loginLink: {
        color: Colors.primary,
        textDecorationLine: "underline",
    },
});
