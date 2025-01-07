import { StyleSheet, View } from "react-native";
import { Bold, Text } from "@/components/Texts";
import { useRouter } from "expo-router";
import useSessionStore from "@/store/sessionStore";
import { removeSecureStoreItem } from "@/store/secureStore";
import Colors from "@/constants/Colors";
import { FontAwesome6 } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/Buttons";
import { ConfirmModal, Dropdown } from "@/components/Modals";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
    const router = useRouter();
    const { clearSession, session } = useSessionStore();

    // Message de confirmation pour la déconnexion
    const [confirmVisible, setConfirmVisible] = useState(false);
    const confirmMessage = "Êtes-vous sûr de vouloir vous déconnecter ?";
    //Menu déroulant pour choisir le campus
    const [campusMenuVisible, setCampusMenuVisible] = useState(false);
    const campusOptions = ["Nantes", "Rennes", "Brest", "Caen"];
    const [selectedCampus, setSelectedCampus] = useState(campusOptions[0]);

    //Nom de l'utilisateur et email
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstLetters, setFirstLetters] = useState("");
    useEffect(() => {
        if (session) {
            const username = session.getUsername();
            const firstLetters = username.split(" ");
            setUsername(username);
            setFirstLetters(firstLetters[0][0] + firstLetters[1][0]);
            setEmail(
                session.getUsername().replace(" ", ".").toLowerCase() +
                    "@isen-ouest.yncrea.fr"
            );
        }
    }, [session]);
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mon compte</Text>
            <View style={styles.settingsView}>
                {/* Bouton de déconnexion */}
                <AnimatedPressable
                    onPress={() => setConfirmVisible(true)}
                    style={styles.logoutBtn}
                >
                    <FontAwesome6
                        name="arrow-right-from-bracket"
                        style={styles.logoutIcon}
                    />
                </AnimatedPressable>

                {/* Profil */}
                <View style={styles.profileView}>
                    <View style={styles.profileCircle}>
                        <Text style={styles.profileCircleText}>
                            {firstLetters}
                        </Text>
                    </View>
                    <Text style={styles.profileName}>{username}</Text>
                    <Text style={styles.profileEmail}>{email}</Text>
                    {/* Bouton pour choisir le campus */}
                    <AnimatedPressable
                        style={styles.campusSelect}
                        scale={0.95}
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
                    </AnimatedPressable>
                    <Dropdown
                        visible={campusMenuVisible}
                        setVisible={setCampusMenuVisible}
                        options={campusOptions}
                        selectedItem={selectedCampus}
                        setSelectedItem={setSelectedCampus}
                        modalBoxStyle={styles.dropdownBoxStyle}
                    ></Dropdown>
                </View>
            </View>

            {/* Modal de confirmation */}
            <ConfirmModal
                visible={confirmVisible}
                message={confirmMessage}
                setVisible={(visible) => setConfirmVisible(visible)}
                onConfirm={() => {
                    clearSession();
                    removeSecureStoreItem("username");
                    removeSecureStoreItem("password");
                    router.replace("/login");
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.primaryColor,
    },
    title: {
        fontSize: 25,
        fontWeight: "bold",
        color: "white",
        marginTop: 20,
    },
    settingsView: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "90%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: "white",
    },
    // Déconnexion
    logoutBtn: {
        alignSelf: "flex-end",
        marginTop: 20,
        marginRight: 20,
    },
    logoutIcon: {
        fontSize: 30,
        color: Colors.primaryColor,
    },
    // Profil
    profileView: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    profileCircle: {
        alignItems: "center",
        justifyContent: "center",
        width: 75,
        height: 75,
        borderRadius: 75,
        backgroundColor: Colors.primaryColor,
    },
    // Texte du profil
    profileCircleText: {
        color: "white",
        fontSize: 35,
        fontWeight: "bold",
        textAlign: "center",
    },
    profileName: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 20,
        textAlign: "center",
    },
    profileEmail: {
        fontSize: 15,
        marginTop: 15,
        textAlign: "center",
    },
    // Sélecteur de campus
    dropdownBoxStyle: {
        width: 250,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    campusSelect: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 5,
        width: 190,
        backgroundColor: Colors.primaryColor,
        borderRadius: 50,
        marginTop: 20,
    },
    campusSelectText: {
        color: "white",
        marginLeft: 5,
        marginRight: 5,
    },
});
