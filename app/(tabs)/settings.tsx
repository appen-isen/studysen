import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Bold, Text } from "@/components/Texts";
import { Href, useRouter } from "expo-router";
import useSessionStore from "@/store/sessionStore";
import { removeSecureStoreItem } from "@/store/secureStore";
import Colors from "@/constants/Colors";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { AnimatedPressable } from "@/components/Buttons";
import { ConfirmModal, Dropdown } from "@/components/Modals";
import { ReactNode, useEffect, useState } from "react";
import useSettingsStore, { CAMPUS } from "@/store/settingsStore";

export default function SettingsScreen() {
    const router = useRouter();
    const { clearSession, session } = useSessionStore();
    const { settings, setSettings } = useSettingsStore();

    // Message de confirmation pour la déconnexion
    const [confirmVisible, setConfirmVisible] = useState(false);
    const confirmMessage = "Êtes-vous sûr de vouloir vous déconnecter ?";
    //Menu déroulant pour choisir le campus
    const [campusMenuVisible, setCampusMenuVisible] = useState(false);

    //Nom de l'utilisateur et email
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstLetters, setFirstLetters] = useState("");
    useEffect(() => {
        if (session) {
            const username = session.getUsername();
            setUsername(username);
            //Initiales du prénom et du nom
            const firstLetters = username.split(" ");
            setFirstLetters(firstLetters[0][0] + firstLetters[1][0]);

            //On convertit le Prénom Nom en email valide
            const normalizedName = username
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
            setEmail(
                normalizedName.replace(" ", ".") + "@isen-ouest.yncrea.fr"
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
                </View>

                {/* Les paramètres */}
                <View style={styles.settingsNav}>
                    <SettingsNav
                        name="Notifications"
                        icon="bell"
                        route={"/notifications"}
                    />
                    <SettingsNav
                        name="Crédits"
                        icon="users"
                        route={"/credits"}
                    />
                    <SettingsNav
                        name="Contact"
                        icon="contact-book"
                        route={"/contact"}
                    />
                    <SettingsNav
                        name="Réglages avancés"
                        icon="code"
                        route={"/advanced"}
                    />
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

function SettingsNav(props: { name: string; icon: string; route: Href }) {
    const { name, icon, route } = props;
    const router = useRouter();
    return (
        <TouchableOpacity
            style={navStyles.container}
            onPress={() => router.push(route)}
        >
            {/* Nom de la section avec icon*/}
            <View style={navStyles.nameContainer}>
                <FontAwesome6 name={icon} style={navStyles.icon}></FontAwesome6>
                <Text style={navStyles.name}>{name}</Text>
            </View>
            {/* Flèche de navigation */}
            <AnimatedPressable onPress={() => router.push(route)}>
                <FontAwesome6 name="chevron-right" style={navStyles.icon} />
            </AnimatedPressable>
        </TouchableOpacity>
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
    //Les paramètres
    settingsNav: {
        width: "100%",
        marginTop: 40,
    },
});

//Styles pour les boutons de navigation dans les paramètres
const navStyles = StyleSheet.create({
    container: {
        width: "95%",
        paddingVertical: 20,
        alignSelf: "center",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
    },
    nameContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 10,
    },
    icon: {
        fontSize: 30,
        width: 40,
        textAlign: "center",
        color: Colors.primaryColor,
    },
});
