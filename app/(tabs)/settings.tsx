import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Bold, Text } from "@/components/Texts";
import { Href, useRouter } from "expo-router";
import useSessionStore from "@/stores/sessionStore";
import { removeSecureStoreItem } from "@/stores/secureStore";
import Colors from "@/constants/Colors";
import { AnimatedPressable } from "@/components/Buttons";
import { ConfirmModal } from "@/components/Modals";
import { useEffect, useState } from "react";
import useSettingsStore from "@/stores/settingsStore";
import {
    useNotesStore,
    usePlanningStore,
    useSyncedPlanningStore
} from "@/stores/webaurionStore";
import { Page } from "@/components/Page";
import { MaterialIcons } from "@expo/vector-icons";
import {
    calculateAverage,
    filterNotesBySemester,
    groupNotesBySubject
} from "@/utils/notes";
import { getSemester } from "@/utils/date";
import { unregisterDeviceForNotifications } from "@/utils/notificationConfig";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getEmailFromName, getFirstLetters } from "@/utils/account";
import { getResponsiveMaxWidth } from "@/utils/responsive";

export default function SettingsScreen() {
    const router = useRouter();
    const { clearSession } = useSessionStore();
    const { clearPlanning } = usePlanningStore();
    const { clearSyncedPlanning } = useSyncedPlanningStore();
    const { clearNotes } = useNotesStore();
    const { settings, setSettings } = useSettingsStore();

    const [selectedSemester, setSelectedSemester] = useState<0 | 1>(
        getSemester()
    );
    const { notes } = useNotesStore();
    const selectedNotes = groupNotesBySubject(
        filterNotesBySemester(notes, selectedSemester)
    ).sort((a, b) => b.notes.length - a.notes.length);
    const noteAverageValue = calculateAverage(selectedNotes);

    // Message de confirmation pour la déconnexion
    const [confirmVisible, setConfirmVisible] = useState(false);
    const confirmMessage = "Êtes-vous sûr de vouloir vous déconnecter ?";

    //Nom de l'utilisateur et email
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [firstLetters, setFirstLetters] = useState("");
    useEffect(() => {
        if (settings.username) {
            const username = settings.username;
            setUsername(username);
            //Initiales du prénom et du nom
            setFirstLetters(getFirstLetters(username));
            //Email de l'utilisateur
            setEmail(getEmailFromName(username));
        }
    }, [settings]);
    return (
        <Page style={styles.container} scrollable={true}>
            <View style={[styles.profileView, styles.responsiveContainer]}>
                <View style={styles.profilePart}>
                    {/* Avatar de l'utilisateur avec les initiales */}
                    <Text style={styles.profileAvatar}>{firstLetters}</Text>
                    {/* Informations de l'utilisateur (Nom et email) */}
                    <View style={styles.profileContent}>
                        <Text style={styles.profileName}>{username}</Text>
                        <Text style={styles.profileMail}>{email}</Text>
                    </View>
                </View>
                {/* Bouton de déconnexion */}
                <AnimatedPressable
                    style={styles.profileLogout}
                    onPress={() => setConfirmVisible(true)}
                >
                    <MaterialIcons
                        name="logout"
                        style={styles.profileLogoutIcon}
                    />
                </AnimatedPressable>
            </View>
            <View style={[styles.section, styles.responsiveContainer]}>
                <Text style={styles.sectionTitle}>Mon profil étudiant</Text>
                <TouchableOpacity
                    style={[
                        settingStyles.container,
                        settingStyles.verticalContainer
                    ]}
                    onPress={() => router.push("/notes")}
                >
                    <View style={settingStyles.subContainer}>
                        <MaterialIcons
                            name="school"
                            style={[
                                settingStyles.icon,
                                { alignSelf: "flex-start", marginTop: 5 }
                            ]}
                        />
                        <View>
                            <Text style={settingStyles.title}>Mes Notes</Text>
                            <Text style={settingStyles.text}>
                                Accédez à vos <Bold>notes</Bold> et vos
                                <Bold> moyennes</Bold>
                            </Text>
                            <Text style={settingStyles.text}>
                                organisées par
                                <Bold> semestre</Bold>.
                            </Text>
                            <View style={settingStyles.field}>
                                <Text style={settingStyles.fieldTitle}>
                                    Moyenne Générale
                                </Text>
                                <Text style={settingStyles.fieldValue}>
                                    {noteAverageValue}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={settingStyles.action}>
                        <MaterialIcons
                            style={settingStyles.actionIcon}
                            name="arrow-forward"
                        />
                        <Text style={settingStyles.actionText}>
                            Voir le détail
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={[styles.section, styles.responsiveContainer]}>
                <Text style={styles.sectionTitle}>Paramètres</Text>
                {/* Les paramètres */}
                <SettingsNav
                    title="Notifications"
                    text={
                        <>
                            Soyez informés de la <Bold>salle</Bold>, de l'
                            <Bold>heure</Bold> et de la <Bold>matière</Bold>{" "}
                            avant votre cours.
                        </>
                    }
                    icon="notifications-active"
                    route={"/notifications"}
                />
                <SettingsNav
                    title="Signaler un problème"
                    text={
                        <>
                            Des <Bold>problèmes</Bold> lors de l'utilisation de
                            l'application ? <Bold>Contactez</Bold> nous !
                        </>
                    }
                    icon="bug-report"
                    route={"/contact"}
                />
                <SettingsNav
                    title="Application"
                    text={
                        <>
                            Plus d'informations sur l'<Bold>application</Bold>{" "}
                            et l'<Bold>équipe</Bold> derrière celle-ci.
                        </>
                    }
                    icon="apps"
                    route={"/credits"}
                />
            </View>

            {/* Modal de confirmation */}
            <ConfirmModal
                visible={confirmVisible}
                message={confirmMessage}
                setVisible={(visible) => setConfirmVisible(visible)}
                onConfirm={() => {
                    // Lors de la déconnexion, on supprime les données de l'utilisateur
                    clearSession();
                    clearPlanning();
                    clearSyncedPlanning();
                    clearNotes();
                    removeSecureStoreItem("username");
                    removeSecureStoreItem("password");
                    unregisterDeviceForNotifications();
                    router.replace("/login");
                }}
            />
        </Page>
    );
}

function SettingsNav(props: {
    title: string;
    text: React.JSX.Element;
    icon: keyof typeof MaterialIcons.glyphMap;
    route: Href;
}) {
    const { title, text, icon, route } = props;
    const router = useRouter();
    return (
        <TouchableOpacity
            style={[settingStyles.container, settingStyles.horizontalContainer]}
            onPress={() => router.push(route)}
        >
            <MaterialIcons name={icon} style={settingStyles.icon} />
            <View style={settingStyles.content}>
                <Text style={settingStyles.title}>{title}</Text>
                <Text style={settingStyles.text}>{text}</Text>
            </View>
            <View style={[settingStyles.action, settingStyles.actionCentered]}>
                <MaterialIcons
                    style={settingStyles.actionIcon}
                    name="arrow-forward"
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 25
    },
    responsiveContainer: {
        width: "100%",
        alignSelf: "center",
        maxWidth: getResponsiveMaxWidth()
    },
    //
    // Profile
    //
    profileView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Colors.light,
        borderRadius: 999,
        padding: 15
    },
    profilePart: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15
    },
    profileAvatar: {
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 18,
        fontWeight: "bold",
        padding: 12,
        borderRadius: 999,
        backgroundColor: Colors.primary,
        color: Colors.white
    },
    profileContent: {
        alignItems: "flex-start"
    },
    profileName: {
        fontSize: 16,
        fontWeight: 600,
        textAlign: "center"
    },
    profileMail: {
        fontSize: 10,
        textAlign: "center",
        maxWidth: "100%",
        wordWrap: "break-word"
    },
    profileLogout: {
        borderRadius: 999,
        backgroundColor: Colors.white,
        borderColor: Colors.primary,
        borderRightWidth: 4
    },
    profileLogoutIcon: {
        padding: 10,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 20,
        color: Colors.darkGray
    },
    //
    // Settings
    //
    section: {
        gap: 10
    },
    sectionTitle: {
        color: Colors.gray,
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase"
    }
});

const settingStyles = StyleSheet.create({
    //
    // Setting navigation style
    //
    container: {
        backgroundColor: Colors.light,
        borderRadius: 10,
        padding: 15,
        gap: 15
    },
    horizontalContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    verticalContainer: {
        alignItems: "flex-start"
    },
    subContainer: {
        flexDirection: "row",
        gap: 15
    },
    icon: {
        fontSize: 20,
        backgroundColor: Colors.lightGray,
        color: Colors.darkGray,
        alignSelf: "center",
        padding: 5,
        borderRadius: 10,
        textAlign: "center",
        textAlignVertical: "center"
    },
    content: {
        flex: 1,
        gap: 5
    },
    title: {
        fontSize: 18,
        fontWeight: 600
    },
    text: {
        color: Colors.darkGray,

        fontWeight: 500
    },
    action: {
        flexDirection: "row",
        borderRadius: 5,
        backgroundColor: Colors.primary,
        padding: 5,
        gap: 5,
        justifyContent: "center",
        alignItems: "center"
    },
    actionCentered: {
        alignSelf: "center"
    },
    actionIcon: {
        fontSize: 20,
        color: Colors.white,
        textAlign: "center",
        textAlignVertical: "center"
    },
    actionText: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: 600,
        marginRight: 10
    },
    field: {
        marginTop: 10
    },
    fieldTitle: {
        fontSize: 12,
        color: Colors.gray,
        fontWeight: "bold",
        textTransform: "uppercase"
    },
    fieldValue: {
        fontSize: 24
    }
});
